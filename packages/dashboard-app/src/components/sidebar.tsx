import type React from "react";
import clsx from "clsx";
import type { Section } from "../types";
import { useI18n } from "../i18n";
import {
  IconAbout,
  IconCompletion,
  IconContrast,
  IconGear,
  IconWarning,
} from "./icons";
import { preventScrollBounce } from "../utils/prevent-scroll-bounce";

export function Sidebar({
  section,
  saving,
  onSectionChange,
}: {
  section: Section;
  saving: string | null;
  onSectionChange: (section: Section) => void;
}) {
  const { t } = useI18n();
  // System Settings style: a white glyph on a colored rounded square.
  const nav: Array<{
    id: Section;
    label: string;
    icon: React.ReactNode;
    tile: string;
  }> = [
    {
      id: "general",
      label: t("nav.general"),
      icon: <IconGear size={14} />,
      tile: "#8e8e93",
    },
    {
      id: "autocomplete",
      label: t("nav.behavior"),
      icon: <IconCompletion size={14} />,
      tile: "#007aff",
    },
    {
      id: "appearance",
      label: t("nav.appearance"),
      icon: <IconContrast size={14} />,
      tile: "#1d1d1f",
    },
    {
      id: "about",
      label: t("nav.about"),
      icon: <IconAbout size={14} />,
      tile: "#8e8e93",
    },
  ];

  return (
    // Align the nav icons with the native close button without overriding
    // AppKit's traffic-light placement.
    <aside className="dashboard-sidebar flex w-[232px] flex-shrink-0 flex-col border-r border-(--ds-sidebar-border) pt-[52px]">
      <nav
        onWheel={preventScrollBounce}
        className="flex-1 overflow-y-auto px-2.5 pt-1 overscroll-none"
      >
        {nav.map((item) => {
          const active = section === item.id;
          return (
            <button
              className={clsx(
                "dashboard-sidebar-item mb-0.5 flex h-8 w-full items-center gap-2 rounded-lg border-0 px-1.5 text-left",
                "font-sans text-[13px] font-normal",
                active
                  ? "dashboard-sidebar-item-active"
                  : "bg-transparent text-(--ds-sidebar-item)",
              )}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <span
                className="sidebar-tile"
                style={{ "--tile": item.tile } as React.CSSProperties}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex h-11 items-center px-4 py-3">
        {saving === "Error saving" ? (
          <span className="flex items-center gap-[5px] rounded-full bg-(--ds-red-bg) px-[9px] py-1 text-[12px] font-semibold text-(--ds-red)">
            <IconWarning />
            {t("nav.saveError")}
          </span>
        ) : null}
      </div>
    </aside>
  );
}
