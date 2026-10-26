export enum SETTINGS {
  // Dev settings.
  DEV_MODE = "autocomplete.developerMode",
  DEV_MODE_NPM = "autocomplete.developerModeNPM",
  DEV_MODE_NPM_INVALIDATE_CACHE = "autocomplete.developerModeNPMInvalidateCache",
  DEV_COMPLETIONS_FOLDER = "autocomplete.devCompletionsFolder",
  DEV_COMPLETIONS_SERVER_PORT = "autocomplete.devCompletionsServerPort",

  // App settings
  LAUNCH_ON_STARTUP = "app.launchOnStartup",
  SILENT_LAUNCH = "app.silentLaunch",
  HIDE_MENUBAR_ICON = "app.hideMenubarIcon",
  DISABLE_AUTO_UPDATES = "app.disableAutoupdates",
  BETA_UPDATES = "app.betaUpdates",
  KEEP_AUTOCOMPLETE_READY = "autocomplete.keepReady",
  DASHBOARD_LANGUAGE = "dashboard.language",

  // Style settings
  WIDTH = "autocomplete.width",
  HEIGHT = "autocomplete.height",
  THEME = "autocomplete.theme",
  USER_STYLES = "autocomplete.userStyles",
  FONT_FAMILY = "autocomplete.fontFamily",
  FONT_SIZE = "autocomplete.fontSize",

  CACHE_ALL_GENERATORS = "beta.autocomplete.auto-cache",
  // Behavior settings
  DISABLE_FOR_COMMANDS = "autocomplete.disableForCommands",
  IMMEDIATELY_EXEC_AFTER_SPACE = "autocomplete.immediatelyExecuteAfterSpace",
  IMMEDIATELY_RUN_DANGEROUS_COMMANDS = "autocomplete.immediatelyRunDangerousCommands",
  INSERT_SPACE_AUTOMATICALLY = "autocomplete.insertSpaceAutomatically",
  SCROLL_WRAP_AROUND = "autocomplete.scrollWrapAround",
  SORT_METHOD = "autocomplete.sortMethod",
  ALWAYS_SUGGEST_CURRENT_TOKEN = "autocomplete.alwaysSuggestCurrentToken",

  NAVIGATE_TO_HISTORY = "autocomplete.navigateToHistory",
  TAB_KEYBINDING = "autocomplete.keybindings.tab",
  ONLY_SHOW_ON_TAB = "autocomplete.onlyShowOnTab",
  ALWAYS_SHOW_DESCRIPTION = "autocomplete.alwaysShowDescription",
  HIDE_PREVIEW = "autocomplete.hidePreviewWindow",
  SCRIPT_TIMEOUT = "autocomplete.scriptTimeout",
  PREFER_VERBOSE_SUGGESTIONS = "autocomplete.preferVerboseSuggestions",
  HIDE_AUTO_EXECUTE_SUGGESTION = "autocomplete.hideAutoExecuteSuggestion",

  FUZZY_SEARCH = "autocomplete.fuzzySearch",

  PERSONAL_SHORTCUTS_TOKEN = "autocomplete.personalShortcutsToken",

  DISABLE_HISTORY_LOADING = "autocomplete.history.disableLoading",
  // History settings
  // one of "off", "history_only", "show"
  HISTORY_MODE = "beta.history.mode",
  HISTORY_COMMAND = "beta.history.customCommand",
  HISTORY_MERGE_SHELLS = "beta.history.allShells",
  FIRST_COMMAND_COMPLETION = "autocomplete.firstTokenCompletion",

  TELEMETRY_ENABLED = "telemetry.enabled",
}

export type SettingsMap = { [key in SETTINGS]?: unknown };

// The value each setting takes while unset, shared by the autocomplete overlay
// and the dashboard so both agree. `autocomplete.width` is missing on purpose:
// its default depends on the history mode, see `getDefaultWidth`.
export const DEFAULT_SETTINGS: SettingsMap = {
  // App
  [SETTINGS.LAUNCH_ON_STARTUP]: false,
  [SETTINGS.SILENT_LAUNCH]: false,
  [SETTINGS.HIDE_MENUBAR_ICON]: false,
  [SETTINGS.DISABLE_AUTO_UPDATES]: false,
  [SETTINGS.BETA_UPDATES]: false,
  [SETTINGS.KEEP_AUTOCOMPLETE_READY]: false,
  [SETTINGS.TELEMETRY_ENABLED]: true,

  // Style
  [SETTINGS.THEME]: "github-dark",
  [SETTINGS.FONT_SIZE]: 12.8,
  [SETTINGS.HEIGHT]: 140,

  // Behavior
  [SETTINGS.ONLY_SHOW_ON_TAB]: false,
  [SETTINGS.FUZZY_SEARCH]: true,
  [SETTINGS.FIRST_COMMAND_COMPLETION]: false,
  [SETTINGS.SORT_METHOD]: "default",
  [SETTINGS.TAB_KEYBINDING]: "insertCommonPrefixOrNavigateDown",
  [SETTINGS.NAVIGATE_TO_HISTORY]: false,
  [SETTINGS.INSERT_SPACE_AUTOMATICALLY]: true,
  [SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION]: false,
  [SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE]: false,
  [SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS]: false,
  [SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN]: false,
  [SETTINGS.SCRIPT_TIMEOUT]: 5000,
  [SETTINGS.CACHE_ALL_GENERATORS]: false,

  // History
  [SETTINGS.HISTORY_MODE]: "show",
  [SETTINGS.HISTORY_MERGE_SHELLS]: false,
};

const DEFAULT_WIDTH = 320;
const HISTORY_WIDTH_INCREASE = 50;

let settings: SettingsMap = {};

export const updateSettings = (newSettings: SettingsMap) => {
  settings = newSettings;
};

export const getDefaultSetting = <T = unknown>(key: SETTINGS): T | undefined =>
  DEFAULT_SETTINGS[key] as T | undefined;

export const getSetting = <T = unknown>(
  key: SETTINGS,
  defaultValue: unknown = getDefaultSetting(key),
): T => (settings[key] ?? defaultValue) as T;

// Widens the popup to make room for history, but only when the history mode is
// stored explicitly: an unset mode keeps the narrow width even though history
// then shows by default.
export const getDefaultWidth = (
  settingsMap: Partial<Record<string, unknown>> = settings,
): number =>
  ["history_only", "show"].includes(
    settingsMap[SETTINGS.HISTORY_MODE] as string,
  )
    ? DEFAULT_WIDTH + HISTORY_WIDTH_INCREASE
    : DEFAULT_WIDTH;

export const getSettings = () => settings;

// `getSetting` for callers that hold their own copy of the settings map.
export const settingOrDefault = <T = unknown>(
  settingsMap: Partial<Record<string, unknown>>,
  key: SETTINGS,
): T => (settingsMap[key] ?? getDefaultSetting(key)) as T;

export function isInDevMode(): boolean {
  return (
    Boolean(getSetting(SETTINGS.DEV_MODE)) ||
    Boolean(getSetting(SETTINGS.DEV_MODE_NPM))
  );
}
