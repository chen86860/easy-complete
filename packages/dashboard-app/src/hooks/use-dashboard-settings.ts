import { useEffect, useRef, useState } from "react";
import { Settings } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import type { SettingsMap } from "../types";

export function useDashboardSettings() {
  const [settings, setSettings] = useState<SettingsMap>({});
  const [saving, setSaving] = useState<string | null>(null);
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const writeVersion = useRef(0);
  // Writes still waiting on the native side. A change notification that lands
  // mid-write can carry the old value, so it must not overwrite the optimistic
  // one; the write re-reads settings itself when it finishes.
  const pendingWrites = useRef(0);

  useEffect(() => {
    Settings.current()
      .then((nextSettings: Record<string, unknown>) =>
        setSettings(nextSettings as SettingsMap),
      )
      .catch(() => {});

    let unsubscribe: (() => void) | undefined;
    Settings.didChange
      .subscribe(() => {
        if (pendingWrites.current > 0) return { unsubscribe: false };
        const version = writeVersion.current;
        Settings.current()
          .then((nextSettings: Record<string, unknown>) => {
            if (
              pendingWrites.current === 0 &&
              version === writeVersion.current
            ) {
              setSettings(nextSettings as SettingsMap);
            }
          })
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
    const currentWrite = writeVersion.current + 1;
    writeVersion.current = currentWrite;

    if (savingTimer.current) clearTimeout(savingTimer.current);
    setSettings((previous) => ({ ...previous, [key]: value }));
    pendingWrites.current += 1;

    try {
      try {
        if (value === null || value === undefined) {
          await Settings.remove(key);
        } else {
          await Settings.set(key, value);
        }
      } finally {
        pendingWrites.current -= 1;
      }
      const nextSettings = (await Settings.current()) as SettingsMap;
      if (currentWrite === writeVersion.current) {
        setSettings(nextSettings);
      }

      if (
        value !== null &&
        value !== undefined &&
        nextSettings[key] !== value
      ) {
        throw new Error(`Setting ${key} did not persist`);
      }

      setSaving("Saved");
    } catch {
      setSaving("Error saving");
      Settings.current()
        .then((nextSettings: Record<string, unknown>) => {
          if (currentWrite === writeVersion.current) {
            setSettings(nextSettings as SettingsMap);
          }
        })
        .catch(() => {});
    }

    savingTimer.current = setTimeout(() => setSaving(null), 1500);
  };

  return { settings, saving, set } as const;
}
