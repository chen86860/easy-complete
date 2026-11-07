import { createContext, useContext } from "react";

const en = {
  "nav.appearance": "Appearance",
  "nav.general": "General",
  "nav.behavior": "Autocomplete",
  "nav.about": "About",
  "nav.saveError": "Error saving",

  "theme.title": "Suggestion Popup Theme",
  "theme.basic": "Basic",
  "theme.lightThemes": "Light Themes",
  "theme.darkThemes": "Dark Themes",
  "theme.dark": "Dark",
  "theme.light": "Light",
  "theme.system": "System",
  "appearance.language": "Language",
  "appearance.displayLanguage": "Display Language",
  "appearance.displayLanguageDescription":
    "Choose the language used in the settings panel",
  "appearance.followSystem": "Follow System",
  "appearance.english": "English",
  "appearance.simplifiedChinese": "简体中文",
  "appearance.typography": "Typography",
  "appearance.fontFamily": "Font Family",
  "appearance.fontFamilyDescription":
    "Name of a font installed on your Mac, such as JetBrains Mono. Leave empty for the system font",
  "appearance.systemDefault": "System default",
  "appearance.fontSize": "Font Size",
  "appearance.dimensions": "Popup Size",
  "appearance.maxWidth": "Max Width",
  "appearance.maxHeight": "Max Height",
  "autocomplete.popup": "Popup",
  "behavior.showAfterTabDescription":
    "Keep the popup hidden until you press Tab. With a single match, Tab completes it directly",
  "behavior.insertTrailingSpaceDescription":
    "Add a space after an accepted subcommand or option so you can keep typing",
  "behavior.historyModeDescription":
    "Suggest past commands from your shell's own history (zsh, bash or fish). Easy Complete keeps no separate record",
  "autocomplete.runDirectly": "Run as Typed",
  "autocomplete.disableForCommands": "Turn Off for Commands",
  "autocomplete.disableForCommandsDescription":
    "Comma-separated, such as npm, pnpm. These commands get no suggestions and no online lookups",
  "autocomplete.disableForCommandsPlaceholder": "e.g. npm, pnpm",
  "appearance.fontSizeDescription": "Text size in the popup",
  "appearance.maxWidthDescription":
    "The popup shrinks to fit shorter content. The default is 50px wider when history suggestions are on",
  "appearance.maxHeightDescription": "Longer lists scroll",

  "behavior.startupAndTrigger": "Startup & Background",
  "behavior.launchAtLogin": "Launch at Login",
  "behavior.silentLaunch": "Silent Launch",
  "behavior.silentLaunchDescription":
    "Start in the background without opening this settings window. Reopen settings from the menu bar icon",
  "behavior.showMenubarIcon": "Show Menu Bar Icon",
  "behavior.showMenubarIconDescription":
    "When hidden, open Easy Complete again from Applications or Spotlight to reach settings",
  "behavior.keepAutocompleteReady": "Always Keep Autocomplete Ready",
  "behavior.keepAutocompleteReadyDescription":
    "Stay loaded even with no terminal connected: the first suggestion appears faster, but it uses more memory",
  "behavior.showAfterTab": "Show Only After Tab",
  "behavior.suggestions": "Matching & Sorting",
  "behavior.fuzzyMatching": "Fuzzy Matching",
  "behavior.fuzzyMatchingDescription":
    "Match when the typed characters appear in order, not only at the start of the name",
  "behavior.firstTokenCompletion": "Suggest Commands While Typing",
  "behavior.firstTokenCompletionDescription":
    "Suggest matching commands from your PATH while typing the first word, such as git for gi. Subcommands still need a space after the command",
  "behavior.sortOrder": "Sort Order",
  "behavior.byRelevance": "Recently used first",
  "behavior.alphabetical": "Alphabetical",
  "behavior.keyboardAndInsertion": "Keys & Insertion",
  "behavior.tabBehavior": "Tab Key",
  "behavior.tabBehaviorDescription":
    "What Tab does while the list is open. The prefix is the start every suggestion shares. Shift+Tab always moves up",
  "behavior.tabPrefixThenNavigate": "Prefix, else move down",
  "behavior.tabPrefixOnly": "Prefix only",
  "behavior.tabPrefixThenInsert": "Prefix, else accept",
  "behavior.tabNavigateOnly": "Move down only",
  "behavior.insertTrailingSpace": "Insert Trailing Space",
  "behavior.showAutoExecuteSuggestion": "Show Run-as-Typed Entry (↪)",
  "behavior.showAutoExecuteSuggestionDescription":
    "Press Enter on it to run the command exactly as typed. Not shown when Show Only After Tab is on",
  "behavior.executeAfterTrailingSpace": "Pin After a Trailing Space",
  "behavior.executeAfterTrailingSpaceDescription":
    "Put the ↪ entry first when the command ends with a space",
  "behavior.runDangerousCommands": "Allow for Dangerous Commands",
  "behavior.runDangerousCommandsDescription":
    "Commands marked dangerous, such as rm -rf, also get ↪, so a single Enter runs them",
  "behavior.history": "History",
  "behavior.historyMode": "History Suggestions",
  "behavior.showWithCompletions": "With completions",
  "behavior.historyOnly": "History only",
  "behavior.off": "Off",
  "behavior.mergeAllShells": "Merge zsh and bash History",
  "behavior.mergeAllShellsDescription":
    "In zsh or bash, read the history of both shells",
  "behavior.historyCommand": "History Source Command",
  "behavior.historyCommandDescription":
    "A command that prints one past command per line, such as atuin search --cmd-only. Used instead of your shell's history",
  "behavior.historyCommandPlaceholder": "Default",

  "about.troubleshooting": "Troubleshooting",
  "about.somethingNotWorking": "Something not working?",
  "about.diagnosticDescription":
    "Run ec doctor in a terminal to check the shell integration, permissions and background processes",
  "about.copied": "Copied!",
  "about.failed": "Failed",
  "about.copy": "Copy",
  "about.copyCommand": "Copy Command",
  "about.openGitHub": "Open GitHub",
  "about.runDiagnostics": "Run Diagnostics",
  "about.checkNow": "Check Now",
  "about.checkingForUpdates": "Checking…",
  "about.stillStuck": "Include the diagnostic output in your report",
  "about.reportIssue": "Report an Issue",
  "about.tagline": "Terminal autocomplete for macOS",
  "about.copyVersionInfo": "Copy version info",
  "about.copiedShort": "Copied",
  "about.copyFailed": "Copy failed",
  "about.version": "Version",
  "about.checkForUpdates": "Check for Updates",
  "about.updates": "Updates",
  "about.checkAutomatically": "Update Automatically",
  "about.checkAutomaticallyDescription":
    "Checks once a day, downloads in the background and installs when you quit Easy Complete",
  "about.betaUpdates": "Receive Beta Updates",
  "about.betaUpdatesDescription":
    "Get prerelease builds before the stable release. They may be less stable",
  "about.privacy": "Privacy",
  "about.shareUsageData": "Share Anonymous Usage Data",
  "about.shareUsageDataDescription":
    "App and macOS version, shell and terminal name, and daily counts of completions shown and accepted. Never commands or paths",
  "about.privacyPolicy": "Privacy Policy",
  "about.privacyPolicyDescription": "See what's collected and how to opt out",
  "about.viewPolicy": "View Policy",
  "about.releaseNotes": "Release Notes",
  "about.openSourceLicenses": "Open Source Licenses",
  "about.licensePrefix": "Open source under the MIT License · Based on the",
  "about.upstreamName": "Amazon Q Developer CLI",

  "permission.status.checking": "Checking",
  "permission.status.ready": "Ready",
  "permission.status.missing": "Needs setup",
  "permission.status.error": "Needs attention",
  "permission.accessibility.title": "Accessibility",
  "permission.accessibility.description":
    "Finds the focused terminal and places the popup.",
  "permission.accessibility.repair": "Grant Accessibility",
  "permission.shellIntegration.title": "Shell Integration",
  "permission.shellIntegration.description":
    "Adds a hook to your zsh, bash and fish config.",
  "permission.shellIntegration.repair": "Install",
  "permission.inputMethod.title": "Input Method",
  "permission.inputMethod.description":
    "Tracks the cursor in Ghostty, Kitty, WezTerm and similar terminals. Reads only the cursor position.",
  "permission.inputMethod.repair": "Install",
  "permission.inputMethod.neededBy":
    "Needed to track the cursor in {terminals}. Reads only the cursor position.",
  "permission.skip": "Skip",
  "permission.terminalListSeparator": ", ",
  "permission.terminalListMore": "{list} and others",
  "permission.optional": "Optional",
  "permission.checkError": "Unable to check this requirement.",
  "permission.accessibilityFirst": "Needs Accessibility first.",
  "permission.working": "Working...",
  "permission.finishSetup": "Finish Setup",
  "permission.finishSetupDescription":
    "Grant these to start using Easy Complete.",
  "permission.checking": "Checking...",
  "permission.checkAgain": "Check Again",
  "permission.fixAll": "Fix All",
  "permission.shareUsageData": "Share anonymous usage data",
  "permission.shareUsageDataDescription":
    "App and macOS version, shell, terminal and daily completion counts. Never commands or paths. Change it in About → Privacy.",
} as const;

export type TranslationKey = keyof typeof en;
export type Locale = "en" | "zh-CN";
export type LocalePreference = "system" | Locale;

const zhCN: Record<TranslationKey, string> = {
  "nav.appearance": "外观",
  "nav.general": "通用",
  "nav.behavior": "补全",
  "nav.about": "关于",
  "nav.saveError": "保存失败",

  "theme.title": "补全弹窗主题",
  "theme.basic": "基础",
  "theme.lightThemes": "浅色主题",
  "theme.darkThemes": "深色主题",
  "theme.dark": "深色",
  "theme.light": "浅色",
  "theme.system": "跟随系统",
  "appearance.language": "语言",
  "appearance.displayLanguage": "显示语言",
  "appearance.displayLanguageDescription": "选择设置窗口使用的语言",
  "appearance.followSystem": "跟随系统",
  "appearance.english": "English",
  "appearance.simplifiedChinese": "简体中文",
  "appearance.typography": "字体",
  "appearance.fontFamily": "字体名称",
  "appearance.fontFamilyDescription":
    "填写本机已安装的字体名，例如 JetBrains Mono；留空使用系统字体",
  "appearance.systemDefault": "系统默认",
  "appearance.fontSize": "字体大小",
  "appearance.dimensions": "弹窗尺寸",
  "appearance.maxWidth": "最大宽度",
  "appearance.maxHeight": "最大高度",
  "autocomplete.popup": "弹出方式",
  "behavior.showAfterTabDescription":
    "补全弹窗默认隐藏，按 Tab 才显示；只有一个候选时直接补全",
  "behavior.insertTrailingSpaceDescription":
    "采用子命令或选项后自动加一个空格，方便继续输入",
  "behavior.historyModeDescription":
    "从 Shell 自己的历史（zsh、bash 或 fish）中建议用过的命令，Easy Complete 不额外记录",
  "autocomplete.runDirectly": "直接运行",
  "autocomplete.disableForCommands": "为这些命令关闭补全",
  "autocomplete.disableForCommandsDescription":
    "用逗号分隔，例如 npm, pnpm。这些命令不再显示补全，也不会联网查询",
  "autocomplete.disableForCommandsPlaceholder": "例如 npm, pnpm",
  "appearance.fontSizeDescription": "补全弹窗中的文字大小",
  "appearance.maxWidthDescription":
    "内容较少时弹窗会自动缩小。开启历史建议后默认值加宽 50px",
  "appearance.maxHeightDescription": "超出高度的列表可以滚动",

  "behavior.startupAndTrigger": "启动与后台",
  "behavior.launchAtLogin": "登录时启动",
  "behavior.silentLaunch": "静默启动",
  "behavior.silentLaunchDescription":
    "启动时不打开本设置窗口，直接在后台运行。需要设置时点击菜单栏图标",
  "behavior.showMenubarIcon": "显示菜单栏图标",
  "behavior.showMenubarIconDescription":
    "隐藏后，从「应用程序」或 Spotlight 再次打开 Easy Complete 即可进入设置",
  "behavior.keepAutocompleteReady": "始终保持补全就绪",
  "behavior.keepAutocompleteReadyDescription":
    "没有终端连接时也保持加载：第一次补全更快，但占用更多内存",
  "behavior.showAfterTab": "按 Tab 才显示",
  "behavior.suggestions": "匹配与排序",
  "behavior.fuzzyMatching": "模糊匹配",
  "behavior.fuzzyMatchingDescription":
    "输入的字符只要按顺序出现在名称中即可匹配，不必从开头输入",
  "behavior.firstTokenCompletion": "输入时提示命令名",
  "behavior.firstTokenCompletionDescription":
    "输入第一个词时从 PATH 中提示匹配的命令，例如输入 gi 提示 git。子命令仍需先输入空格",
  "behavior.sortOrder": "排序方式",
  "behavior.byRelevance": "最近使用优先",
  "behavior.alphabetical": "按字母顺序",
  "behavior.keyboardAndInsertion": "按键与插入",
  "behavior.tabBehavior": "Tab 键行为",
  "behavior.tabBehaviorDescription":
    "列表打开时 Tab 的作用。前缀指所有候选共同的开头部分；Shift+Tab 始终上移",
  "behavior.tabPrefixThenNavigate": "补全前缀，否则下移",
  "behavior.tabPrefixOnly": "只补全前缀",
  "behavior.tabPrefixThenInsert": "补全前缀，否则采用",
  "behavior.tabNavigateOnly": "只下移",
  "behavior.insertTrailingSpace": "自动插入尾随空格",
  "behavior.showAutoExecuteSuggestion": "显示「直接运行」项（↪）",
  "behavior.showAutoExecuteSuggestionDescription":
    "选中后按 Enter，按当前输入原样运行命令。开启「按 Tab 才显示」时不显示",
  "behavior.executeAfterTrailingSpace": "空格结尾时置顶",
  "behavior.executeAfterTrailingSpaceDescription":
    "命令以空格结尾时，把 ↪ 排到第一项",
  "behavior.runDangerousCommands": "危险命令也可直接运行",
  "behavior.runDangerousCommandsDescription":
    "rm -rf 等被标记为危险的命令也会显示 ↪，按一下 Enter 就会执行",
  "behavior.history": "历史记录",
  "behavior.historyMode": "历史建议",
  "behavior.showWithCompletions": "与补全一起显示",
  "behavior.historyOnly": "只显示历史",
  "behavior.off": "关闭",
  "behavior.mergeAllShells": "合并 zsh 和 bash 历史",
  "behavior.mergeAllShellsDescription": "在 zsh 或 bash 中同时读取两者的历史",
  "behavior.historyCommand": "历史来源命令",
  "behavior.historyCommandDescription":
    "每行输出一条历史命令的命令，例如 atuin search --cmd-only，用来代替 Shell 自带的历史",
  "behavior.historyCommandPlaceholder": "默认",

  "about.troubleshooting": "故障排查",
  "about.somethingNotWorking": "遇到问题？",
  "about.diagnosticDescription":
    "在终端运行 ec doctor，检查 Shell 集成、权限和后台进程",
  "about.copied": "已复制",
  "about.failed": "复制失败",
  "about.copy": "复制",
  "about.copyCommand": "复制命令",
  "about.openGitHub": "打开 GitHub",
  "about.runDiagnostics": "运行诊断",
  "about.checkNow": "立即检查",
  "about.checkingForUpdates": "检查中…",
  "about.stillStuck": "请在报告中附上诊断结果",
  "about.reportIssue": "报告问题",
  "about.tagline": "适用于 macOS 的终端自动补全",
  "about.copyVersionInfo": "复制版本信息",
  "about.copiedShort": "已复制",
  "about.copyFailed": "复制失败",
  "about.version": "版本",
  "about.checkForUpdates": "检查更新",
  "about.updates": "更新",
  "about.checkAutomatically": "自动更新",
  "about.checkAutomaticallyDescription":
    "每天检查一次，在后台下载，退出 Easy Complete 时安装",
  "about.betaUpdates": "接收 Beta 版更新",
  "about.betaUpdatesDescription": "在正式版发布前获取预览版本，稳定性可能较低",
  "about.privacy": "隐私",
  "about.shareUsageData": "共享匿名使用数据",
  "about.shareUsageDataDescription":
    "应用和系统版本、Shell、终端及每日补全次数，不含命令和路径",
  "about.privacyPolicy": "隐私政策",
  "about.privacyPolicyDescription": "查看收集的数据以及如何选择退出",
  "about.viewPolicy": "查看政策",
  "about.releaseNotes": "发行说明",
  "about.openSourceLicenses": "开源许可证",
  "about.licensePrefix": "基于 MIT 许可证开源 · 项目基于",
  "about.upstreamName": "Amazon Q Developer CLI",

  "permission.status.checking": "检查中",
  "permission.status.ready": "已就绪",
  "permission.status.missing": "需要设置",
  "permission.status.error": "需要处理",
  "permission.accessibility.title": "辅助功能",
  "permission.accessibility.description": "用于找到当前终端并放置补全弹窗。",
  "permission.accessibility.repair": "授予权限",
  "permission.shellIntegration.title": "Shell 集成",
  "permission.shellIntegration.description":
    "在 zsh、bash、fish 的配置文件中添加钩子。",
  "permission.shellIntegration.repair": "安装",
  "permission.inputMethod.title": "输入法",
  "permission.inputMethod.description":
    "在 Ghostty、Kitty、WezTerm 等终端中跟踪光标，只读取光标位置。",
  "permission.inputMethod.repair": "安装",
  "permission.inputMethod.neededBy":
    "{terminals} 需要它跟踪光标，只读取光标位置。",
  "permission.skip": "跳过",
  "permission.terminalListSeparator": "、",
  "permission.terminalListMore": "{list} 等终端",
  "permission.optional": "可选",
  "permission.checkError": "无法检查此要求。",
  "permission.accessibilityFirst": "需要先授予辅助功能权限。",
  "permission.working": "处理中…",
  "permission.finishSetup": "完成设置",
  "permission.finishSetupDescription":
    "授予以下权限后即可开始使用 Easy Complete。",
  "permission.checking": "检查中…",
  "permission.checkAgain": "重新检查",
  "permission.fixAll": "全部修复",
  "permission.shareUsageData": "共享匿名使用数据",
  "permission.shareUsageDataDescription":
    "应用和系统版本、Shell、终端及每日补全次数，不含命令和路径。可在「关于 → 隐私」中关闭。",
};

const dictionaries: Record<Locale, Record<TranslationKey, string>> = {
  en,
  "zh-CN": zhCN,
};

export type I18nContextValue = {
  locale: Locale;
  localePreference: LocalePreference;
  setLocalePreference: (preference: LocalePreference) => void;
  t: (key: TranslationKey) => string;
};

const defaultValue: I18nContextValue = {
  locale: "en",
  localePreference: "system",
  setLocalePreference: () => {},
  t: (key) => en[key],
};

export const I18nContext = createContext<I18nContextValue>(defaultValue);

export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return "en";

  const language = navigator.languages[0] ?? navigator.language;
  return language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}

export function isLocalePreference(value: unknown): value is LocalePreference {
  return value === "system" || value === "en" || value === "zh-CN";
}

export function getTranslation(locale: Locale, key: TranslationKey) {
  return dictionaries[locale][key];
}

export function useI18n() {
  return useContext(I18nContext);
}
