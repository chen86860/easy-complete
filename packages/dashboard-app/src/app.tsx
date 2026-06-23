import { useState } from "react";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import clsx from "clsx";
import { DashboardContent } from "./components/dashboard-content";
import { DashboardWindowChrome } from "./components/dashboard-window-chrome";
import { Sidebar } from "./components/sidebar";
import { useDashboardNavigation } from "./hooks/use-dashboard-navigation";
import { useDashboardSettings } from "./hooks/use-dashboard-settings";
import { useDashboardShortcuts } from "./hooks/use-dashboard-shortcuts";
import { getTheme } from "./theme-catalog";
import type { Section } from "./types";

export default function App() {
  const { settings, saving, set } = useDashboardSettings();
  const [section, setSection] = useState<Section>("appearance");
  const dashboardTheme = getTheme(settings[SETTINGS.THEME] ?? "dark");

  useDashboardShortcuts();
  useDashboardNavigation(setSection);

  return (
    <div
      className={clsx(
        "relative flex h-screen overflow-hidden bg-[#fbfbfd] font-sans text-black antialiased",
        "select-none [accent-color:var(--dashboard-accent-color,AccentColor)] [overscroll-behavior:none]",
        "[-webkit-touch-callout:none] [--dashboard-top-rgb:251_251_253]",
        dashboardTheme.rootClassName,
      )}
    >
      <DashboardWindowChrome />
      <Sidebar section={section} saving={saving} onSectionChange={setSection} />
      <DashboardContent section={section} settings={settings} set={set} />
    </div>
  );
}
