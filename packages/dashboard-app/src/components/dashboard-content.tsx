import { useEffect, useRef } from "react";
import {
  AboutSection,
  AdvancedSection,
  AppearanceSection,
  BehaviorSection,
  HistorySection,
} from "../sections/settings-sections";
import type { Section, SettingSetter, SettingsMap } from "../types";
import { preventScrollBounce } from "../utils/prevent-scroll-bounce";

const SECTION_META: Record<Section, { title: string; description?: string }> = {
  appearance: { title: "Appearance" },
  behavior: { title: "Behavior" },
  history: { title: "History" },
  advanced: { title: "Advanced" },
  about: {
    title: "About",
    description: "App info, updates, and project links",
  },
};

export function DashboardContent({
  section,
  settings,
  set,
}: {
  section: Section;
  settings: SettingsMap;
  set: SettingSetter;
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const meta = SECTION_META[section];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [section]);

  return (
    <main
      ref={scrollRef}
      onWheel={preventScrollBounce}
      className="relative flex-1 overflow-y-auto bg-[#fbfbfd] [overscroll-behavior:none]"
    >
      <div aria-hidden="true" className="dashboard-top-blur" />
      <div className="box-border w-full px-7 pb-9 pt-[46px]">
        <header className="mb-4">
          <h2 className="m-0 text-[17px] font-[650] tracking-[-0.02em] text-[#050505]">
            {meta.title}
          </h2>
          {meta.description ? (
            <p className="mt-1 text-[12px] leading-[1.4] text-[rgba(60,60,67,0.68)]">
              {meta.description}
            </p>
          ) : null}
        </header>

        {section === "appearance" ? (
          <AppearanceSection settings={settings} set={set} />
        ) : null}
        {section === "behavior" ? (
          <BehaviorSection settings={settings} set={set} />
        ) : null}
        {section === "history" ? (
          <HistorySection settings={settings} set={set} />
        ) : null}
        {section === "advanced" ? (
          <AdvancedSection settings={settings} set={set} />
        ) : null}
        {section === "about" ? <AboutSection /> : null}
      </div>
    </main>
  );
}
