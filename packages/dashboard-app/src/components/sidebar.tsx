import type React from "react";
import clsx from "clsx";
import type { Section } from "../types";
import {
  IconAbout,
  IconAdvanced,
  IconAppearance,
  IconBehavior,
  IconHistory,
  IconWarning,
} from "./icons";
import { preventScrollBounce } from "../utils/prevent-scroll-bounce";

type NavItem = { id: Section; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { id: "appearance", label: "Appearance", icon: <IconAppearance /> },
  { id: "behavior", label: "Behavior", icon: <IconBehavior /> },
  { id: "history", label: "History", icon: <IconHistory /> },
  { id: "advanced", label: "Advanced", icon: <IconAdvanced /> },
  { id: "about", label: "About", icon: <IconAbout /> },
];

export function Sidebar({
  section,
  saving,
  onSectionChange,
}: {
  section: Section;
  saving: string | null;
  onSectionChange: (section: Section) => void;
}) {
  return (
    <aside className="flex w-[228px] flex-shrink-0 flex-col border-r border-[rgba(60,60,67,0.14)] bg-white pt-5">
      <div className="px-3.5 py-1.5 text-[17px] font-semibold tracking-[-0.02em] text-[rgba(0,0,0,0.76)]">
        Settings
      </div>
      <nav
        onWheel={preventScrollBounce}
        className="flex-1 overflow-y-auto px-3.5 pt-0.5 [overscroll-behavior:none]"
      >
        {NAV.map((item) => {
          const active = section === item.id;
          return (
            <button
              className={clsx(
                "mb-1 flex min-h-[30px] w-full items-center gap-2 rounded-[10px] border-0 px-2 py-[5px] text-left",
                "font-sans text-[14px] font-medium tracking-[-0.01em]",
                active
                  ? "bg-[rgba(60,60,67,0.085)] text-[rgba(0,0,0,0.9)]"
                  : "bg-transparent text-[rgba(0,0,0,0.8)]",
              )}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={clsx(
                  "flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center rounded-[7px] leading-none",
                  active
                    ? "bg-[rgba(255,255,255,0.82)] text-[#161617] shadow-[inset_0_0_0_0.5px_rgba(0,0,0,0.06)]"
                    : "bg-transparent text-[rgba(32,33,36,0.92)]",
                )}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex h-11 items-center px-[18px] py-3">
        {saving === "Error saving" ? (
          <span className="flex items-center gap-[5px] rounded-full bg-[rgba(255,59,48,0.12)] px-[9px] py-1 text-[12px] font-semibold text-[#ff3b30]">
            <IconWarning />
            Error saving
          </span>
        ) : null}
      </div>
    </aside>
  );
}
