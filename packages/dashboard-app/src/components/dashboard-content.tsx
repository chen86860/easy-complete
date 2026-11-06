import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import {
  AboutSection,
  AppearanceSection,
  AutocompleteSection,
  GeneralSection,
} from "../sections/settings-sections";
import { useI18n } from "../i18n";
import type { Section, SettingSetter, SettingsMap } from "../types";
import { preventScrollBounce } from "../utils/prevent-scroll-bounce";

export function DashboardContent({
  section,
  settings,
  set,
}: {
  section: Section;
  settings: SettingsMap;
  set: SettingSetter;
}) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const titles: Record<Section, string> = {
    general: t("nav.general"),
    autocomplete: t("nav.behavior"),
    appearance: t("nav.appearance"),
    about: t("nav.about"),
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [section]);

  return (
    <div className="flex min-w-0 flex-1 flex-col bg-[var(--ds-content-bg)]">
      {/* The page title sits in the title-bar row, like System Settings; a
          hairline appears under it once content scrolls beneath. */}
      <header
        className={clsx(
          "flex h-[52px] flex-shrink-0 items-center border-b px-5",
          scrolled ? "border-[var(--ds-separator)]" : "border-transparent",
        )}
      >
        <h2 className="m-0 text-[15px] font-semibold tracking-[-0.01em] text-[var(--ds-label)]">
          {titles[section]}
        </h2>
      </header>
      {/* The scroller stops short of the bottom edge so its overlay scrollbar
          never runs into the window's rounded corner. */}
      <main
        ref={scrollRef}
        onWheel={preventScrollBounce}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        className="relative mb-2.5 min-h-0 flex-1 overflow-y-auto [overscroll-behavior:none]"
      >
        <div className="box-border w-full px-5 pb-6 pt-4">
          {section === "general" ? (
            <GeneralSection settings={settings} set={set} />
          ) : null}
          {section === "autocomplete" ? (
            <AutocompleteSection settings={settings} set={set} />
          ) : null}
          {section === "appearance" ? (
            <AppearanceSection settings={settings} set={set} />
          ) : null}
          {section === "about" ? (
            <AboutSection settings={settings} set={set} />
          ) : null}
        </div>
      </main>
    </div>
  );
}
