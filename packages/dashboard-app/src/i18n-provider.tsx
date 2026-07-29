import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Settings } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import {
  detectLocale,
  getTranslation,
  I18nContext,
  isLocalePreference,
  type Locale,
  type LocalePreference,
  type TranslationKey,
} from "./i18n";

const LOCALE_CACHE_KEY = "easy-complete.dashboard.locale";

/**
 * Reads the last known preference synchronously.
 *
 * `fig_settings` is the source of truth, but reading it is async and the dashboard webview is
 * rebuilt every time the window opens. Without this cache the first paint of every open would be
 * in English before snapping to the real language.
 */
function readCachedPreference(): LocalePreference {
  try {
    const cached = window.localStorage.getItem(LOCALE_CACHE_KEY);
    return isLocalePreference(cached) ? cached : "system";
  } catch {
    return "system";
  }
}

function writeCachedPreference(preference: LocalePreference) {
  try {
    window.localStorage.setItem(LOCALE_CACHE_KEY, preference);
  } catch {
    // The preference still lives in settings, the next open just repaints once.
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [localePreference, setPreference] =
    useState<LocalePreference>(readCachedPreference);
  const [systemLocale, setSystemLocale] = useState<Locale>(detectLocale);
  const locale =
    localePreference === "system" ? systemLocale : localePreference;

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const sync = () => {
      Settings.current()
        .then((settings: Record<string, unknown>) => {
          const stored = settings[SETTINGS.DASHBOARD_LANGUAGE];
          const preference = isLocalePreference(stored) ? stored : "system";
          setPreference(preference);
          writeCachedPreference(preference);
        })
        .catch(() => {});
    };

    sync();
    Settings.didChange
      .subscribe(() => {
        sync();
        return { unsubscribe: false };
      })
      ?.then((subscription) => {
        unsubscribe = subscription.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const syncSystemLocale = () => setSystemLocale(detectLocale());
    window.addEventListener("languagechange", syncSystemLocale);
    return () => window.removeEventListener("languagechange", syncSystemLocale);
  }, []);

  const setLocalePreference = useCallback((preference: LocalePreference) => {
    setPreference(preference);
    writeCachedPreference(preference);
    Settings.set(SETTINGS.DASHBOARD_LANGUAGE, preference).catch(() => {});
  }, []);

  const t = useCallback(
    (key: TranslationKey) => getTranslation(locale, key),
    [locale],
  );
  const value = useMemo(
    () => ({ locale, localePreference, setLocalePreference, t }),
    [locale, localePreference, setLocalePreference, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
