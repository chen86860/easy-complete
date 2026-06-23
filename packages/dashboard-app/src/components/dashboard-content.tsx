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

const SECTION_TITLES: Record<Section, string> = {
  appearance: "Appearance",
  behavior: "Behavior",
  history: "History",
  advanced: "Advanced",
  about: "About",
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
      <div className="box-border w-full px-7 pb-[42px] pt-[58px]">
        <h2 className="mb-[22px] mt-0 text-[18px] font-[650] text-[#050505]">
          {SECTION_TITLES[section]}
        </h2>

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
