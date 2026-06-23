import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import {
  AboutSection,
  AdvancedSection,
  AppearanceSection,
  BehaviorSection,
  HistorySection,
} from "../sections/settings-sections";
import type { Section, SettingsMap } from "../types";
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
  set: (key: SETTINGS, value: unknown) => void;
}) {
  return (
    <main
      onWheel={preventScrollBounce}
      className="flex-1 overflow-y-auto bg-[#fbfbfd] [overscroll-behavior:none]"
    >
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
