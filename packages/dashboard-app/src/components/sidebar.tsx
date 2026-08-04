import type React from "react";
import clsx from "clsx";
import type { Section } from "../types";
import { useI18n } from "../i18n";
import { IconAbout, IconAppearance, IconBehavior, IconWarning } from "./icons";
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
  const nav: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
    {
      id: "appearance",
      label: t("nav.appearance"),
      icon: <IconAppearance />,
    },
    { id: "behavior", label: t("nav.behavior"), icon: <IconBehavior /> },
    { id: "about", label: t("nav.about"), icon: <IconAbout /> },
  ];

  return (
    // Align the nav icons with the native close button without overriding
    // AppKit's traffic-light placement.
    <aside className="dashboard-sidebar flex w-[226px] flex-shrink-0 flex-col border-r border-[var(--ds-sidebar-border)] pt-[44px]">
      <div className="px-4 pb-[7px] text-[11.5px] font-semibold tracking-[0.02em] text-[var(--ds-label-tertiary)]">
        {t("app.settings")}
      </div>
      <nav
        onWheel={preventScrollBounce}
        className="flex-1 overflow-y-auto px-2.5 [overscroll-behavior:none]"
      >
        {nav.map((item) => {
          const active = section === item.id;
          return (
            <button
              className={clsx(
                "dashboard-sidebar-item mb-px flex min-h-[28px] w-full items-center gap-[9px] rounded-[6px] border-0 px-1.5 py-[5px] text-left",
                "font-sans text-[13px] font-medium tracking-[-0.005em]",
                active
                  ? "dashboard-sidebar-item-active"
                  : "bg-transparent text-[var(--ds-sidebar-item)]",
              )}
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              aria-current={active ? "page" : undefined}
            >
              <span className="dashboard-sidebar-icon flex h-[20px] w-[20px] flex-shrink-0 items-center justify-center leading-none text-[var(--ds-sidebar-icon)]">
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="flex h-11 items-center px-4 py-3">
        {saving === "Error saving" ? (
          <span className="flex items-center gap-[5px] rounded-full bg-[var(--ds-red-bg)] px-[9px] py-1 text-[12px] font-semibold text-[var(--ds-red)]">
            <IconWarning />
            {t("nav.saveError")}
          </span>
        ) : null}
      </div>
    </aside>
  );
}
