import { useCallback, useEffect, useMemo, useState } from "react";
import { Install, State } from "@easy-complete/api-bindings";
import { useI18n } from "../i18n";

export type PermissionId = "accessibility" | "shellIntegration" | "inputMethod";
export type PermissionState = "checking" | "ready" | "missing" | "error";

export type PermissionRequirement = {
  id: PermissionId;
  title: string;
  description: string;
  repairLabel: string;
  /** When set, this permission can only be actioned after the listed ids are ready. */
  requires?: PermissionId[];
  /** Optional permissions are offered but never block the dashboard or "Fix All". */
  optional?: boolean;
  /** Set when the step can be skipped for good instead of done. */
  skippable?: boolean;
};

export type PermissionStatus = PermissionRequirement & {
  state: PermissionState;
  detail?: string;
};

const REQUIREMENTS: Array<
  Pick<PermissionRequirement, "id" | "requires" | "optional" | "skippable">
> = [
  { id: "accessibility" },
  { id: "shellIntegration", requires: ["accessibility"] },
  // Only terminals that bypass the accessibility path (Ghostty, Kitty, ...) need it.
  { id: "inputMethod", optional: true },
];

/** Written by the desktop app on launch: installed terminals that need the input method. */
const INPUT_METHOD_TERMINALS_KEY = "input-method.needed-by";
/** Set once the user skips the input method in the gate, so it never blocks again (#206). */
const INPUT_METHOD_SKIPPED_KEY = "input-method.gate-skipped";

const asMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

function toInstallComponent(id: PermissionId): Install.Component {
  if (id === "shellIntegration") return "dotfiles";
  return id;
}

export function usePermissionCheck() {
  const { t } = useI18n();
  const [states, setStates] = useState<Record<PermissionId, PermissionState>>({
    accessibility: "checking",
    shellIntegration: "checking",
    inputMethod: "checking",
  });
  const [details, setDetails] = useState<Partial<Record<PermissionId, string>>>(
    {},
  );
  const [repairing, setRepairing] = useState<PermissionId | "all" | null>(null);
  // Terminals on this Mac that need the input method, unless the user skipped it.
  const [inputMethodTerminals, setInputMethodTerminals] = useState<string[]>(
    [],
  );

  useEffect(() => {
    Promise.all([
      State.get(INPUT_METHOD_TERMINALS_KEY),
      State.get(INPUT_METHOD_SKIPPED_KEY),
    ])
      .then(([terminals, skipped]) => {
        if (!skipped && Array.isArray(terminals)) {
          setInputMethodTerminals(
            terminals.filter((t) => typeof t === "string"),
          );
        }
      })
      .catch(() => {});
  }, []);

  const skip = useCallback((id: PermissionId) => {
    if (id !== "inputMethod") return;
    State.set(INPUT_METHOD_SKIPPED_KEY, true).catch(() => {});
    setInputMethodTerminals([]);
  }, []);

  // With such a terminal installed the input method is a real step: it blocks
  // the gate and "Fix All" installs it, but it can be skipped for good.
  const requirements = useMemo(
    () =>
      REQUIREMENTS.map((requirement) =>
        requirement.id === "inputMethod" && inputMethodTerminals.length > 0
          ? { ...requirement, optional: false, skippable: true }
          : requirement,
      ),
    [inputMethodTerminals],
  );

  const checkOne = useCallback(
    async (id: PermissionId) => {
      setStates((previous) => ({ ...previous, [id]: "checking" }));
      setDetails((previous) => ({ ...previous, [id]: undefined }));

      try {
        const installed = await Install.isInstalled(toInstallComponent(id));
        setStates((previous) => ({
          ...previous,
          [id]: installed ? "ready" : "missing",
        }));
      } catch (error) {
        setStates((previous) => ({ ...previous, [id]: "error" }));
        setDetails((previous) => ({
          ...previous,
          [id]: asMessage(error, t("permission.checkError")),
        }));
      }
    },
    [t],
  );

  const refresh = useCallback(async () => {
    await Promise.all(
      REQUIREMENTS.map((requirement) => checkOne(requirement.id)),
    );
  }, [checkOne]);

  const repair = useCallback(
    async (id: PermissionId) => {
      setRepairing(id);
      setDetails((previous) => ({ ...previous, [id]: undefined }));

      try {
        await Install.install(toInstallComponent(id));
      } catch (error) {
        setDetails((previous) => ({
          ...previous,
          [id]: asMessage(error, t("permission.checkError")),
        }));
      } finally {
        await checkOne(id);
        setRepairing(null);
      }
    },
    [checkOne, t],
  );

  const repairAll = useCallback(async () => {
    setRepairing("all");

    try {
      for (const requirement of requirements) {
        if (requirement.optional) continue;
        await repair(requirement.id);
      }
    } finally {
      setRepairing(null);
    }
  }, [repair, requirements]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    Install.installStatus
      .subscribe("accessibility", (installed) => {
        setStates((previous) => ({
          ...previous,
          accessibility: installed ? "ready" : "missing",
        }));
        return { unsubscribe: false };
      })
      ?.then((subscription) => {
        unsubscribe = subscription.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  const permissions = useMemo<PermissionStatus[]>(
    () =>
      requirements.map((requirement) => ({
        ...requirement,
        title: t(`permission.${requirement.id}.title`),
        description:
          requirement.id === "inputMethod" && requirement.skippable
            ? t("permission.inputMethod.neededBy").replace(
                "{terminals}",
                inputMethodTerminals.join(", "),
              )
            : t(`permission.${requirement.id}.description`),
        repairLabel: t(`permission.${requirement.id}.repair`),
        state: states[requirement.id],
        detail: details[requirement.id],
      })),
    [details, inputMethodTerminals, requirements, states, t],
  );

  const ready = permissions.every(
    (permission) => permission.optional || permission.state === "ready",
  );
  const checking = permissions.some(
    (permission) => permission.state === "checking",
  );

  return {
    checking,
    permissions,
    ready,
    refreshing: checking,
    repairing,
    refresh,
    repair,
    repairAll,
    skip,
  } as const;
}
