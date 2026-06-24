import type React from "react";
import clsx from "clsx";
import type {
  PermissionId,
  PermissionState,
  PermissionStatus,
} from "../hooks/use-permission-check";
import { IconCheck, IconWarning } from "./icons";

const STATUS_COPY: Record<PermissionState, string> = {
  checking: "Checking",
  ready: "Ready",
  missing: "Needs setup",
  error: "Needs attention",
};

function StatusBadge({ state }: { state: PermissionState }) {
  return (
    <span
      className={clsx(
        "inline-flex min-w-[92px] items-center justify-center rounded-full px-2.5 py-1 text-[12px] font-semibold",
        state === "ready"
          ? "bg-[rgba(52,199,89,0.12)] text-[#248a3d]"
          : "bg-[rgba(255,149,0,0.14)] text-[#a05a00]",
      )}
    >
      {state === "ready" ? <IconCheck /> : <IconWarning />}
      <span className="ml-1.5">{STATUS_COPY[state]}</span>
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
  const busy = repairing === permission.id || repairing === "all";
  const canRepair =
    permission.state === "missing" || permission.state === "error";
  const blockedBy = permission.requires?.find(
    (reqId) => allPermissions.find((p) => p.id === reqId)?.state !== "ready",
  );
  const blocked = blockedBy !== undefined;

  return (
    <div className="flex min-h-[78px] items-center justify-between gap-5 border-b border-[rgba(60,60,67,0.10)] px-[18px] py-4 last:border-b-0">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2.5">
          <div className="text-[14px] font-semibold leading-5 text-[#050505]">
            {permission.title}
          </div>
          <StatusBadge state={permission.state} />
        </div>
        <div className="mt-1 text-[12px] leading-[17px] text-[rgba(60,60,67,0.68)]">
          {permission.description}
        </div>
        {blocked ? (
          <div className="mt-1.5 text-[12px] leading-[17px] text-[rgba(60,60,67,0.45)]">
            Grant Accessibility first to enable this step.
          </div>
        ) : permission.detail ? (
          <div className="mt-1.5 text-[12px] leading-[17px] text-[#c02b20]">
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
            : "bg-[rgba(120,120,128,0.14)] text-[rgba(60,60,67,0.50)]",
        )}
      >
        {busy ? "Working..." : permission.repairLabel}
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
}) {
  if (ready || import.meta.env.DEV) return <>{children}</>;

  if (checking) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#fbfbfd]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[rgba(60,60,67,0.15)] border-t-[var(--dashboard-accent-color,AccentColor)]" />
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center bg-[#fbfbfd] px-10">
      <div className="w-full max-w-[640px]">
        <div className="mb-4 pl-1">
          <h1 className="m-0 text-[22px] font-[700] text-[#050505]">
            Finish Setup
          </h1>
          <p className="mb-0 mt-1.5 text-[13px] leading-5 text-[rgba(60,60,67,0.70)]">
            Easy Complete needs these permissions before settings can be used.
          </p>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.70)] bg-[rgba(246,246,247,0.96)] shadow-[inset_0_0_0_0.5px_rgba(60,60,67,0.04)]">
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
            className="rounded-[9px] border-0 bg-[rgba(120,120,128,0.16)] px-3 py-1.5 text-[13px] font-semibold text-[#050505] outline-none disabled:text-[rgba(60,60,67,0.42)]"
          >
            {refreshing ? "Checking..." : "Check Again"}
          </button>
          <button
            type="button"
            onClick={onRepairAll}
            disabled={repairing !== null}
            className="rounded-[9px] border-0 bg-[var(--dashboard-accent-color)] px-3 py-1.5 text-[13px] font-semibold text-white outline-none disabled:bg-[rgba(120,120,128,0.20)] disabled:text-[rgba(60,60,67,0.42)]"
          >
            {repairing ? "Working..." : "Fix All"}
          </button>
        </div>
      </div>
    </main>
  );
}
