import type React from "react";
import clsx from "clsx";
import type {
  PermissionId,
  PermissionState,
  PermissionStatus,
} from "../hooks/use-permission-check";
import { useI18n } from "../i18n";
import { Toggle } from "./controls";
import { IconCheck, IconWarning } from "./icons";

function StatusBadge({ state }: { state: PermissionState }) {
  const { t } = useI18n();

  return (
    <span
      className={clsx(
        "inline-flex min-w-[92px] items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
        state === "ready"
          ? "bg-[var(--ds-green-bg)] text-[var(--ds-green-text)]"
          : "bg-[var(--ds-orange-bg)] text-[var(--ds-orange-text)]",
      )}
    >
      {state === "ready" ? <IconCheck /> : <IconWarning />}
      <span className="ml-1.5">{t(`permission.status.${state}`)}</span>
    </span>
  );
}

function PermissionRow({
  permission,
  allPermissions,
  repairing,
  onRepair,
}: {
  permission: PermissionStatus;
  allPermissions: PermissionStatus[];
  repairing: PermissionId | "all" | null;
  onRepair: (id: PermissionId) => void;
}) {
  const { t } = useI18n();
  const busy = repairing === permission.id || repairing === "all";
  const canRepair =
    permission.state === "missing" || permission.state === "error";
  const blockedBy = permission.requires?.find(
    (reqId) => allPermissions.find((p) => p.id === reqId)?.state !== "ready",
  );
  const blocked = blockedBy !== undefined;

  return (
    <div className="flex min-h-[78px] items-center justify-between gap-5 border-b border-[var(--ds-separator)] px-[18px] py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="text-[14px] font-semibold leading-5 text-[var(--ds-label)]">
            {permission.title}
          </div>
          <StatusBadge state={permission.state} />
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

      <button
        type="button"
        disabled={!canRepair || busy || blocked}
        onClick={() => onRepair(permission.id)}
        className={clsx(
          "min-w-[130px] rounded-[9px] border-0 px-3 py-1.5 text-[13px] font-semibold outline-none",
          canRepair && !busy && !blocked
            ? "bg-[var(--dashboard-accent-color)] text-white"
            : "bg-[var(--ds-control-disabled-bg)] text-[var(--ds-control-disabled-fg)]",
        )}
      >
        {busy ? t("permission.working") : permission.repairLabel}
      </button>
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
  telemetryEnabled: boolean;
  onTelemetryChange: (value: boolean) => void;
}) {
  const { t } = useI18n();

  if (ready || import.meta.env.DEV) return <>{children}</>;

  if (checking) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[var(--ds-content-bg)]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--ds-separator)] border-t-[var(--dashboard-accent-color,AccentColor)]" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[var(--ds-content-bg)] px-10">
      <div className="w-full max-w-[640px]">
        <div className="mb-4 pl-1">
          <h1 className="m-0 text-[22px] font-[700] text-[var(--ds-label)]">
            {t("permission.finishSetup")}
          </h1>
          <p className="mb-0 mt-1.5 text-[13px] leading-5 text-[var(--ds-label-secondary)]">
            {t("permission.finishSetupDescription")}
          </p>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[var(--ds-card-border)] bg-[var(--ds-card-bg-solid)] shadow-[inset_0_0_0_0.5px_var(--ds-card-inset)]">
          {permissions.map((permission) => (
            <PermissionRow
              key={permission.id}
              permission={permission}
              allPermissions={permissions}
              repairing={repairing}
              onRepair={onRepair}
            />
          ))}
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing || repairing !== null}
            className="rounded-[9px] border-0 bg-[var(--ds-control-bg)] px-3 py-1.5 text-[13px] font-semibold text-[var(--ds-label)] outline-none disabled:text-[var(--ds-control-disabled-fg)]"
          >
            {refreshing ? t("permission.checking") : t("permission.checkAgain")}
          </button>
          <button
            type="button"
            onClick={onRepairAll}
            disabled={repairing !== null}
            className="rounded-[9px] border-0 bg-[var(--dashboard-accent-color)] px-3 py-1.5 text-[13px] font-semibold text-white outline-none disabled:bg-[var(--ds-control-disabled-bg)] disabled:text-[var(--ds-control-disabled-fg)]"
          >
            {repairing ? t("permission.working") : t("permission.fixAll")}
          </button>
        </div>

        <div className="mt-5 flex items-start justify-between gap-4 rounded-[12px] bg-[var(--ds-chip-bg)] px-4 py-3">
          <div>
            <div className="text-[13px] font-medium text-[var(--ds-label)]">
              {t("permission.shareUsageData")}
            </div>
            <div className="mt-0.5 text-[12px] leading-[1.5] text-[var(--ds-label-secondary)]">
              {t("permission.shareUsageDataDescription")}
            </div>
          </div>
          <div className="mt-0.5">
            <Toggle checked={telemetryEnabled} onChange={onTelemetryChange} />
          </div>
        </div>
      </div>
    </main>
  );
}
