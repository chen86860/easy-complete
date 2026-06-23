import { useEffect, useRef, useState } from "react";
import { Settings } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import type { SettingsMap } from "../types";

export function useDashboardSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Settings.current()
      .then((nextSettings: Record<string, unknown>) =>
        setSettings(nextSettings as SettingsMap),
      )
      .catch(() => {});

    let unsubscribe: (() => void) | undefined;
    Settings.didChange
      .subscribe(() => {
        Settings.current()
          .then((nextSettings: Record<string, unknown>) =>
            setSettings(nextSettings as SettingsMap),
          )
          .catch(() => {});
        return { unsubscribe: false };
      })
      ?.then((subscription) => {
        unsubscribe = subscription.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  const set = async (key: SETTINGS, value: unknown) => {
    if (savingTimer.current) clearTimeout(savingTimer.current);
    setSettings((previous) => ({ ...previous, [key]: value }));

    try {
      if (value === null || value === undefined) {
        await Settings.remove(key);
      } else {
        await Settings.set(key, value);
      }
      setSaving("Saved");
    } catch {
      setSaving("Error saving");
    }

    savingTimer.current = setTimeout(() => setSaving(null), 1500);
  };

  return { settings, saving, set } as const;
}
