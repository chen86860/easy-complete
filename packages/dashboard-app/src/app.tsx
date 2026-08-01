import { useState } from "react";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import { DashboardContent } from "./components/dashboard-content";
import { DashboardWindowChrome } from "./components/dashboard-window-chrome";
import { PermissionGate } from "./components/permission-gate";
import { Sidebar } from "./components/sidebar";
import { useDashboardNavigation } from "./hooks/use-dashboard-navigation";
import { useDashboardSettings } from "./hooks/use-dashboard-settings";
import { useDashboardShortcuts } from "./hooks/use-dashboard-shortcuts";
import { usePermissionCheck } from "./hooks/use-permission-check";
import { useWindowFocus } from "./hooks/use-window-focus";
import type { Section } from "./types";

export default function App() {
  const { settings, saving, set } = useDashboardSettings();
  const permissionCheck = usePermissionCheck();
  const [section, setSection] = useState<Section>("appearance");

  useDashboardShortcuts();
  useDashboardNavigation(setSection);
  useWindowFocus();

  return (
    <div className="relative flex h-screen select-none overflow-hidden bg-transparent font-sans text-[var(--ds-label)] antialiased [accent-color:var(--dashboard-accent-color)] [overscroll-behavior:none] [-webkit-touch-callout:none] [--dashboard-accent-color:AccentColor]">
      <DashboardWindowChrome />
      <PermissionGate
        permissions={permissionCheck.permissions}
        ready={permissionCheck.ready}
        checking={permissionCheck.checking}
        refreshing={permissionCheck.refreshing}
        repairing={permissionCheck.repairing}
        onRefresh={permissionCheck.refresh}
        onRepair={permissionCheck.repair}
        onRepairAll={permissionCheck.repairAll}
        telemetryEnabled={
          (settings[SETTINGS.TELEMETRY_ENABLED] as boolean | undefined) ?? true
        }
        onTelemetryChange={(value) => set(SETTINGS.TELEMETRY_ENABLED, value)}
      >
        <Sidebar
          section={section}
          saving={saving}
          onSectionChange={setSection}
        />
        <DashboardContent section={section} settings={settings} set={set} />
      </PermissionGate>
    </div>
  );
}
