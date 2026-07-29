import { useCallback, useEffect, useMemo, useState } from "react";
import { Install } from "@easy-complete/api-bindings";
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
};

export type PermissionStatus = PermissionRequirement & {
  state: PermissionState;
  detail?: string;
};

const REQUIREMENTS: Array<Pick<PermissionRequirement, "id" | "requires">> = [
  { id: "accessibility" },
  { id: "shellIntegration", requires: ["accessibility"] },
  { id: "inputMethod" },
];

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
      for (const requirement of REQUIREMENTS) {
        await repair(requirement.id);
      }
    } finally {
      setRepairing(null);
    }
  }, [repair]);

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
      REQUIREMENTS.map((requirement) => ({
        ...requirement,
        title: t(`permission.${requirement.id}.title`),
        description: t(`permission.${requirement.id}.description`),
        repairLabel: t(`permission.${requirement.id}.repair`),
        state: states[requirement.id],
        detail: details[requirement.id],
      })),
    [details, states, t],
  );

  const ready = permissions.every((permission) => permission.state === "ready");
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
  } as const;
}
