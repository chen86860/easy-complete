import { createContext, useContext } from "react";

const en = {
  "app.settings": "Settings",
  "nav.appearance": "Appearance",
  "nav.general": "General",
  "nav.behavior": "Autocomplete",
  "nav.about": "About",
  "nav.saveError": "Error saving",
  "section.aboutDescription": "App info, updates, and project links",

  "theme.title": "Theme",
  "theme.automatic": "Automatic",
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
  "general.performance": "Performance",
  "autocomplete.popup": "Popup",
  "behavior.showAfterTabDescription":
    "Keep the popup hidden until you press Tab. With a single match, Tab completes it directly",
  "behavior.insertTrailingSpaceDescription":
    "Add a space after an accepted subcommand or option so you can keep typing",
  "behavior.historyModeDescription":
    "Suggest past commands from your shell's own history (zsh, bash or fish). Easy Complete keeps no separate record",
  "autocomplete.runDirectly": "Run as Typed",
  "autocomplete.exceptions": "Exceptions",
  "autocomplete.disableForCommands": "Turn Off for Commands",
  "autocomplete.disableForCommandsDescription":
    "Comma-separated, such as npm, pnpm. These commands get no suggestions and no online lookups",
  "autocomplete.disableForCommandsPlaceholder": "e.g. npm, pnpm",
  "appearance.fontSizeDescription": "Text size in the popup",
  "appearance.maxWidthDescription":
    "The popup shrinks to fit shorter content. The default is 50px wider when history suggestions are on",
  "appearance.maxHeightDescription": "Longer lists scroll",

  "behavior.startupAndTrigger": "Startup",
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
    "What Tab does while the suggestion list is open. Shift+Tab always moves up",
  "behavior.tabPrefixThenNavigate": "Insert prefix, else move down",
  "behavior.tabPrefixOnly": "Insert shared prefix only",
  "behavior.tabPrefixThenInsert": "Insert prefix, else accept",
  "behavior.tabNavigateOnly": "Move down only",
  "behavior.insertTrailingSpace": "Insert Trailing Space",
  "behavior.showAutoExecuteSuggestion": "Show Run-as-Typed Entry (↪)",
  "behavior.showAutoExecuteSuggestionDescription":
    "Press Enter on it to run the command exactly as typed. Not shown when Show Only After Tab is on",
  "behavior.executeAfterTrailingSpace": "Pin After a Trailing Space",
  "behavior.executeAfterTrailingSpaceDescription":
    "Put the ↪ entry first when the command ends with a space",
  "behavior.runDangerousCommands": "Include Dangerous Commands",
  "behavior.runDangerousCommandsDescription":
    "Also offer ↪ for commands marked dangerous, such as rm -rf, so a single Enter runs them. Turn on with care",
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
    "Run the built-in diagnostic in your terminal — it checks your shell integration, permissions, and background processes, and tells you how to fix any issues.",
  "about.copied": "Copied!",
  "about.failed": "Failed",
  "about.copy": "Copy",
  "about.stillStuck":
    "Still stuck? Include the diagnostic output in your report.",
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
    "Check once a day, download new versions in the background, and notify you when they are ready",
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
  "permission.accessibility.title": "Accessibility Permission",
  "permission.accessibility.description":
    "Required to read the focused terminal window and position completions.",
  "permission.accessibility.repair": "Grant Accessibility",
  "permission.shellIntegration.title": "Shell Integration",
  "permission.shellIntegration.description":
    "Adds hooks to your zsh, bash and fish config so Easy Complete can track your shell state.",
  "permission.shellIntegration.repair": "Install Shell Hooks",
  "permission.inputMethod.title": "Input Method Integration",
  "permission.inputMethod.description":
    "Only needed for cursor tracking in terminals like Ghostty, Kitty, WezTerm, Alacritty, Zed, and JetBrains IDEs. Terminal.app and iTerm2 work without it. macOS will ask you to allow it: it only reads the cursor position, never what you type.",
  "permission.inputMethod.repair": "Install Input Method",
  "permission.optional": "Optional",
  "permission.checkError": "Unable to check this requirement.",
  "permission.accessibilityFirst":
    "Grant Accessibility first to enable this step.",
  "permission.working": "Working...",
  "permission.finishSetup": "Finish Setup",
  "permission.finishSetupDescription":
    "Easy Complete needs these permissions before settings can be used.",
  "permission.checking": "Checking...",
  "permission.checkAgain": "Check Again",
  "permission.fixAll": "Fix All",
  "permission.shareUsageData": "Share anonymous usage data",
  "permission.shareUsageDataDescription":
    "Helps us understand how Easy Complete is used: app and macOS version, shell and terminal name, and daily counts of completions shown and accepted. Never commands, paths, or personal data. Change this anytime in About → Privacy.",
} as const;

export type TranslationKey = keyof typeof en;
export type Locale = "en" | "zh-CN";
export type LocalePreference = "system" | Locale;

const zhCN: Record<TranslationKey, string> = {
  "app.settings": "设置",
  "nav.appearance": "外观",
  "nav.general": "通用",
  "nav.behavior": "补全",
  "nav.about": "关于",
  "nav.saveError": "保存失败",
  "section.aboutDescription": "应用信息、更新与项目链接",

  "theme.title": "主题",
  "theme.automatic": "自动",
  "theme.lightThemes": "浅色主题",
  "theme.darkThemes": "深色主题",
  "theme.dark": "深色",
  "theme.light": "浅色",
  "theme.system": "跟随系统",
  "appearance.language": "语言",
  "appearance.displayLanguage": "显示语言",
  "appearance.displayLanguageDescription": "选择设置面板使用的语言",
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
  "general.performance": "性能",
  "autocomplete.popup": "弹出方式",
  "behavior.showAfterTabDescription":
    "补全弹窗默认隐藏，按 Tab 才显示；只有一个候选时直接补全",
  "behavior.insertTrailingSpaceDescription":
    "采用子命令或选项后自动加一个空格，方便继续输入",
  "behavior.historyModeDescription":
    "从 shell 自己的历史（zsh、bash 或 fish）中建议用过的命令，Easy Complete 不额外记录",
  "autocomplete.runDirectly": "直接运行",
  "autocomplete.exceptions": "例外",
  "autocomplete.disableForCommands": "为这些命令关闭补全",
  "autocomplete.disableForCommandsDescription":
    "用逗号分隔，例如 npm, pnpm。这些命令不再显示补全，也不会联网查询",
  "autocomplete.disableForCommandsPlaceholder": "例如 npm, pnpm",
  "appearance.fontSizeDescription": "补全弹窗中的文字大小",
  "appearance.maxWidthDescription":
    "内容较少时弹窗会自动缩小。开启历史建议后默认值加宽 50px",
  "appearance.maxHeightDescription": "超出高度的列表可以滚动",

  "behavior.startupAndTrigger": "启动",
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
    "补全列表打开时 Tab 键的作用，Shift+Tab 始终向上移动",
  "behavior.tabPrefixThenNavigate": "补全公共前缀，否则下移一项",
  "behavior.tabPrefixOnly": "仅补全公共前缀",
  "behavior.tabPrefixThenInsert": "补全公共前缀，否则插入选中项",
  "behavior.tabNavigateOnly": "仅下移一项",
  "behavior.insertTrailingSpace": "自动插入尾随空格",
  "behavior.showAutoExecuteSuggestion": "显示「直接运行」项（↪）",
  "behavior.showAutoExecuteSuggestionDescription":
    "选中后按 Enter，按当前输入原样运行命令。开启「按 Tab 才显示」时不显示",
  "behavior.executeAfterTrailingSpace": "空格结尾时置顶",
  "behavior.executeAfterTrailingSpaceDescription":
    "命令以空格结尾时，把 ↪ 排到第一项",
  "behavior.runDangerousCommands": "包含危险命令",
  "behavior.runDangerousCommandsDescription":
    "对 rm -rf 等标记为危险的命令也显示 ↪，一按 Enter 就会执行，请谨慎开启",
  "behavior.history": "历史记录",
  "behavior.historyMode": "历史建议",
  "behavior.showWithCompletions": "与补全一起显示",
  "behavior.historyOnly": "只显示历史",
  "behavior.off": "关闭",
  "behavior.mergeAllShells": "合并 zsh 和 bash 历史",
  "behavior.mergeAllShellsDescription": "在 zsh 或 bash 中同时读取两者的历史",
  "behavior.historyCommand": "历史来源命令",
  "behavior.historyCommandDescription":
    "每行输出一条历史命令的命令，例如 atuin search --cmd-only，用来代替 shell 自带的历史",
  "behavior.historyCommandPlaceholder": "默认",

  "about.troubleshooting": "故障排查",
  "about.somethingNotWorking": "遇到问题？",
  "about.diagnosticDescription":
    "在终端中运行内置诊断。它会检查 Shell 集成、权限和后台进程，并提供问题修复建议。",
  "about.copied": "已复制",
  "about.failed": "复制失败",
  "about.copy": "复制",
  "about.stillStuck": "仍未解决？请在问题报告中附上诊断输出。",
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
    "每天检查一次，在后台下载新版本，准备好后通知你",
  "about.betaUpdates": "接收 Beta 版更新",
  "about.betaUpdatesDescription": "在正式版发布前获取预览版本，稳定性可能较低",
  "about.privacy": "隐私",
  "about.shareUsageData": "共享匿名使用数据",
  "about.shareUsageDataDescription":
    "应用和 macOS 版本、shell 和终端名称，以及每天补全的显示和采用次数，绝不包含命令或路径",
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
  "permission.accessibility.title": "辅助功能权限",
  "permission.accessibility.description":
    "用于读取当前聚焦的终端窗口并定位补全弹窗。",
  "permission.accessibility.repair": "授予辅助功能权限",
  "permission.shellIntegration.title": "Shell 集成",
  "permission.shellIntegration.description":
    "向 zsh、bash、fish 的配置文件添加钩子，使 Easy Complete 能够跟踪 Shell 状态。",
  "permission.shellIntegration.repair": "安装 Shell 钩子",
  "permission.inputMethod.title": "输入法集成",
  "permission.inputMethod.description":
    "仅在 Ghostty、Kitty、WezTerm、Alacritty、Zed、JetBrains IDE 等终端中用于跟踪光标位置，Terminal.app 和 iTerm2 无需安装。安装时 macOS 会请求你允许：它只读取光标位置，不会读取你输入的内容。",
  "permission.inputMethod.repair": "安装输入法",
  "permission.optional": "可选",
  "permission.checkError": "无法检查此要求。",
  "permission.accessibilityFirst": "请先授予辅助功能权限，再执行此步骤。",
  "permission.working": "处理中…",
  "permission.finishSetup": "完成设置",
  "permission.finishSetupDescription":
    "使用设置前，Easy Complete 需要以下权限。",
  "permission.checking": "检查中…",
  "permission.checkAgain": "重新检查",
  "permission.fixAll": "全部修复",
  "permission.shareUsageData": "共享匿名使用数据",
  "permission.shareUsageDataDescription":
    "帮助我们了解 Easy Complete 的使用情况：应用和 macOS 版本、shell 和终端名称，以及每天补全的显示和采用次数。不会收集命令、路径或个人数据，你可以随时在“关于 → 隐私”中更改。",
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
