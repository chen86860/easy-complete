import type React from "react";
import clsx from "clsx";
import type { Section } from "../types";
import {
  IconAbout,
  IconAdvanced,
  IconAppearance,
  IconBehavior,
  IconCheck,
  IconHistory,
  IconUpdate,
  IconWarning,
} from "./icons";
import { useCheckForUpdates } from "../hooks/use-check-for-updates";
import { preventScrollBounce } from "../utils/prevent-scroll-bounce";

type NavItem = { id: Section; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { id: "appearance", label: "Appearance", icon: <IconAppearance /> },
  { id: "behavior", label: "Behavior", icon: <IconBehavior /> },
  { id: "history", label: "History", icon: <IconHistory /> },
  { id: "advanced", label: "Advanced", icon: <IconAdvanced /> },
  { id: "about", label: "About", icon: <IconAbout /> },
];

const UPDATE_STATUS_LABEL: Record<string, string> = {
  idle: "Check for Updates",
  checking: "Checking…",
  "up-to-date": "Up to Date",
  available: "Update Available",
};

export function Sidebar({
  section,
  saving,
  onSectionChange,
}: {
  section: Section;
  saving: string | null;
  onSectionChange: (section: Section) => void;
}) {
  const { status: updateStatus, check: checkForUpdates } =
    useCheckForUpdates();

  return (
    <aside className="flex w-[236px] flex-shrink-0 flex-col border-r border-[rgba(60,60,67,0.14)] bg-white pt-[32px]">
      <div className="px-3.5 py-4 text-xl font-semibold text-[rgba(0,0,0,0.86)]">
        Settings
      </div>
      <nav
        onWheel={preventScrollBounce}
        className="flex-1 overflow-y-auto px-3.5 [overscroll-behavior:none]"
      >
        {NAV.map((item) => {
          const active = section === item.id;
          return (
            <button
              className={clsx(
                "flex min-h-[30px] w-full items-center gap-2 rounded-lg border-0 p-1 text-left",
                "font-sans text-[14px] font-medium text-[rgba(0,0,0,0.86)]",
                active ? "bg-[rgba(60,60,67,0.12)]" : "bg-transparent",
              )}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <span className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md bg-[rgba(255,255,255,0.62)] leading-none text-[#202124] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.04)]">
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3.5 pb-2">
        <button
          onClick={() => void checkForUpdates()}
          disabled={updateStatus === "checking"}
          className={clsx(
            "flex min-h-[30px] w-full items-center gap-2 rounded-lg border-0 p-1 text-left",
            "font-sans text-[14px] font-medium",
            "bg-transparent disabled:cursor-not-allowed",
            updateStatus === "available"
              ? "text-[var(--dashboard-accent-color,AccentColor)]"
              : "text-[rgba(0,0,0,0.86)]",
          )}
        >
          <span
            className={clsx(
              "flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-md leading-none shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.04)]",
              updateStatus === "available"
                ? "bg-[color-mix(in_srgb,var(--dashboard-accent-color,AccentColor)_12%,transparent)] text-[var(--dashboard-accent-color,AccentColor)]"
                : "bg-[rgba(255,255,255,0.62)] text-[#202124]",
            )}
          >
            <IconUpdate />
          </span>
          {UPDATE_STATUS_LABEL[updateStatus] ?? "Check for Updates"}
        </button>
      </div>

      <div className="flex h-11 items-center px-[18px] py-3">
        {saving ? (
          <span
            className={clsx(
              "flex items-center gap-[5px] rounded-full px-[9px] py-1 text-[12px] font-semibold",
              saving === "Saved"
                ? "bg-[rgba(52,199,89,0.12)] text-[#34c759]"
                : "bg-[rgba(255,59,48,0.12)] text-[#ff3b30]",
            )}
          >
            {saving === "Saved" ? <IconCheck /> : <IconWarning />}
            {saving === "Saved" ? "Saved" : "Error saving"}
          </span>
        ) : null}
      </div>
    </aside>
  );
}
