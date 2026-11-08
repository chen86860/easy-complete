import type React from "react";
import clsx from "clsx";
import type {
  PermissionId,
  PermissionState,
  PermissionStatus,
} from "../hooks/use-permission-check";
import { useI18n } from "../i18n";
import { Toggle } from "./controls";
import { RowLabelContext } from "./row-label";
import { PRIVACY_URL, openExternalUrl } from "../utils/external-links";
import { IconCheck, IconWarning } from "./icons";

function StatusBadge({ state }: { state: PermissionState }) {
  const { t } = useI18n();

  return (
    // Symbol plus colored text, as System Settings marks status; no pill.
    <span
      className={clsx(
        "inline-flex items-center text-[12px] font-medium",
        state === "ready"
          ? "text-[var(--ds-green-text)]"
          : "text-[var(--ds-orange-text)]",
      )}
    >
      {state === "ready" ? <IconCheck /> : <IconWarning />}
      <span className="ml-1">{t(`permission.status.${state}`)}</span>
    </span>
  );
}

function PermissionRow({
  permission,
  allPermissions,
  repairing,
  primary,
  onRepair,
  onSkip,
}: {
  permission: PermissionStatus;
  allPermissions: PermissionStatus[];
  repairing: PermissionId | "all" | null;
  /** The window's one default button: set on the only step left to do. */
  primary: boolean;
  onRepair: (id: PermissionId) => void;
  onSkip: (id: PermissionId) => void;
}) {
  const { t } = useI18n();
  const busy = repairing === permission.id || repairing === "all";
  const canRepair =
    permission.state === "missing" || permission.state === "error";
  const blockedBy = permission.requires?.find(
    (reqId) => allPermissions.find((p) => p.id === reqId)?.state !== "ready",
  );
  // A finished step is never blocked, whatever it depended on.
  const blocked = canRepair && blockedBy !== undefined;

  return (
    <div className="relative flex min-h-[64px] items-center justify-between gap-5 px-3.5 py-3 after:absolute after:inset-x-3.5 after:bottom-0 after:h-px after:bg-[var(--ds-separator)] last:after:hidden">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="text-[14px] font-semibold leading-5 text-[var(--ds-label)]">
            {permission.title}
          </div>
          {/* A step still to do is marked by its button; only finished ones get a badge. */}
          {permission.state === "ready" ? (
            <StatusBadge state={permission.state} />
          ) : null}
          {permission.optional ? (
            <span className="text-[12px] text-[var(--ds-label-tertiary)]">
              {t("permission.optional")}
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-[12px] leading-[17px] text-[var(--ds-label-secondary)]">
          {permission.description}
        </div>
        {blocked ? (
          <div className="mt-1.5 text-[12px] leading-[17px] text-[var(--ds-label-quaternary)]">
            {t("permission.accessibilityFirst")}
          </div>
        ) : permission.detail ? (
          <div className="mt-1.5 text-[12px] leading-[17px] text-[var(--ds-red-text)]">
            {permission.detail}
          </div>
        ) : null}
      </div>

      {/* A finished step has nothing left to press. */}
      {canRepair ? (
        <div className="flex flex-shrink-0 items-center gap-2">
          {permission.skippable ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => onSkip(permission.id)}
              className="mac-button"
            >
              {t("permission.skip")}
            </button>
          ) : null}
          <button
            type="button"
            disabled={busy || blocked}
            onClick={() => onRepair(permission.id)}
            className={clsx(
              "mac-button min-w-[130px]",
              primary && "mac-button-primary",
            )}
          >
            {busy ? t("permission.working") : permission.repairLabel}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function PermissionGate({
  children,
  permissions,
  ready,
  checking,
  refreshing,
  repairing,
  onRefresh,
  onRepair,
  onRepairAll,
  onSkip,
  telemetryEnabled,
  onTelemetryChange,
}: {
  children: React.ReactNode;
  permissions: PermissionStatus[];
  ready: boolean;
  checking: boolean;
  refreshing: boolean;
  repairing: PermissionId | "all" | null;
  onRefresh: () => void;
  onRepair: (id: PermissionId) => void;
  onRepairAll: () => void;
  onSkip: (id: PermissionId) => void;
  telemetryEnabled: boolean;
  onTelemetryChange: (value: boolean) => void;
}) {
  const { t } = useI18n();
  // Optional steps never block the dashboard and "Fix All" skips them.
  const pending = permissions.filter(
    (p) => !p.optional && (p.state === "missing" || p.state === "error"),
  );
  // One default button per window: "Fix All" when several steps are left,
  // otherwise the remaining step's own button.
  const showFixAll = pending.length > 1;

  if (ready || import.meta.env.DEV) return <>{children}</>;

  if (checking) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[var(--ds-content-bg)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ds-separator)] border-t-[var(--dashboard-accent-color,AccentColor)]" />
      </main>
    );
  }

  return (
    // Top-aligned at a fixed inset, like the settings pages: centering made the
    // whole page shift whenever a row, note or button appeared or went away.
    <main className="flex flex-1 items-start justify-center overflow-y-auto bg-[var(--ds-content-bg)] px-10 pb-10 pt-14">
      <div className="w-full max-w-[640px]">
        <div className="mb-4 pl-1">
          <h1 className="m-0 text-[22px] font-[700] text-[var(--ds-label)]">
            {t("permission.finishSetup")}
          </h1>
          <p className="mb-0 mt-1.5 text-[13px] leading-5 text-[var(--ds-label-secondary)]">
            {t("permission.finishSetupDescription")}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--ds-card-border)] bg-[var(--ds-card-bg)] shadow-[inset_0_0_0_0.5px_var(--ds-card-inset)]">
          {permissions.map((permission) => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              allPermissions={permissions}
              repairing={repairing}
              primary={!showFixAll && pending[0]?.id === permission.id}
              onRepair={onRepair}
              onSkip={onSkip}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || repairing !== null}
            className="mac-button"
          >
            {refreshing ? t("permission.checking") : t("permission.checkAgain")}
          </button>
          {showFixAll ? (
            <button
              type="button"
              onClick={onRepairAll}
              disabled={repairing !== null}
              className="mac-button mac-button-primary"
            >
              {repairing ? t("permission.working") : t("permission.fixAll")}
            </button>
          ) : null}
        </div>

        {/* Same card, padding and type as the permission rows above. */}
        <div className="mt-8 overflow-hidden rounded-xl border border-[var(--ds-card-border)] bg-[var(--ds-card-bg)] shadow-[inset_0_0_0_0.5px_var(--ds-card-inset)]">
          <div className="flex items-center justify-between gap-5 px-3.5 py-3">
            <div className="min-w-0 flex-1">
              <div
                id="share-usage-label"
                className="text-[14px] font-semibold leading-5 text-[var(--ds-label)]"
              >
                {t("permission.shareUsageData")}
              </div>
              <div
                id="share-usage-description"
                className="mt-1 text-[12px] leading-[17px] text-[var(--ds-label-secondary)]"
              >
                {t("permission.shareUsageDataDescription")}{" "}
                <a
                  href={PRIVACY_URL}
                  onClick={(event) => {
                    event.preventDefault();
                    void openExternalUrl(PRIVACY_URL);
                  }}
                  className="text-[var(--dashboard-accent-color,AccentColor)] no-underline hover:underline"
                >
                  {t("permission.privacyPolicy")}
                </a>
              </div>
            </div>
            <RowLabelContext.Provider
              value={{
                labelId: "share-usage-label",
                descriptionId: "share-usage-description",
              }}
            >
              <Toggle checked={telemetryEnabled} onChange={onTelemetryChange} />
            </RowLabelContext.Provider>
          </div>
        </div>
      </div>
    </main>
  );
}
