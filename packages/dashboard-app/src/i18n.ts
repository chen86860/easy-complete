import { createContext, useContext } from "react";

const en = {
  "app.settings": "Settings",
  "nav.appearance": "Appearance",
  "nav.behavior": "Behavior",
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
  "appearance.fontFamilyDescription": "Font used in the autocomplete popup",
  "appearance.systemDefault": "System default",
  "appearance.fontSize": "Font Size",
  "appearance.fontSizeDescription": "Popup font size in pixels",
  "appearance.dimensions": "Dimensions",
  "appearance.maxWidth": "Max Width",
  "appearance.maxWidthDescription": "Maximum popup width in pixels",
  "appearance.maxHeight": "Max Height",
  "appearance.maxHeightDescription": "Maximum popup height in pixels",

  "behavior.startupAndTrigger": "Startup & Trigger",
  "behavior.launchAtLogin": "Launch at Login",
  "behavior.launchAtLoginDescription":
    "Start Easy Complete automatically when you sign in",
  "behavior.showAfterTab": "Show Suggestions After Tab",
  "behavior.showAfterTabDescription":
    "Wait until you press Tab before opening the suggestion popup",
  "behavior.suggestions": "Suggestions",
  "behavior.fuzzyMatching": "Fuzzy Matching",
  "behavior.fuzzyMatchingDescription":
    "Match close character sequences instead of exact prefixes",
  "behavior.sortOrder": "Sort Order",
  "behavior.sortOrderDescription": "Choose how suggestions are ranked",
  "behavior.byRelevance": "By Relevance",
  "behavior.alphabetical": "Alphabetical",
  "behavior.keyboardAndInsertion": "Keyboard & Insertion",
  "behavior.useUpArrowForHistory": "Use Up Arrow for History",
  "behavior.useUpArrowForHistoryDescription":
    "Let Up Arrow switch from suggestions into shell history navigation",
  "behavior.insertTrailingSpace": "Insert Trailing Space",
  "behavior.insertTrailingSpaceDescription":
    "Add a space after accepting a suggestion",
  "behavior.executeAfterTrailingSpace":
    "Press Enter to Execute After a Trailing Space",
  "behavior.executeAfterTrailingSpaceDescription":
    "When a command ends with a space, put Immediately Execute first so Enter runs the command instead of inserting the first suggestion",
  "behavior.history": "History",
  "behavior.historyMode": "History Mode",
  "behavior.historyModeDescription":
    "How shell history is blended with completions",
  "behavior.showWithCompletions": "Show with completions",
  "behavior.historyOnly": "History only",
  "behavior.off": "Off",
  "behavior.mergeAllShells": "Merge All Shells",
  "behavior.mergeAllShellsDescription":
    "Include history from all shells (bash, zsh, fish)",
  "behavior.historyCommand": "History Command",
  "behavior.historyCommandDescription":
    "Shell command to use as the history source (leave empty for default)",
  "behavior.historyCommandPlaceholder": "e.g. atuin search",

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
  "about.checkAutomatically": "Check for Updates Automatically",
  "about.checkAutomaticallyDescription":
    "Notify when a new version is available",
  "about.privacy": "Privacy",
  "about.shareUsageData": "Share Anonymous Usage Data",
  "about.shareUsageDataDescription":
    "Anonymous statistics only, never commands or personal data",
  "about.privacyPolicy": "Privacy Policy",
  "about.privacyPolicyDescription": "See what's collected and how to opt out",
  "about.viewPolicy": "View Policy",
  "about.releaseNotes": "Release Notes",
  "about.licensePrefix":
    "Open source under the MIT and Apache 2.0 licenses · Based on the",
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
    "Injects hooks into .zshrc / .bashrc so Easy Complete can track your shell state.",
  "permission.shellIntegration.repair": "Install Shell Hooks",
  "permission.inputMethod.title": "Input Method Integration",
  "permission.inputMethod.description":
    "Required for cursor tracking in Kitty, Alacritty, Zed, Ghostty, and WezTerm.",
  "permission.inputMethod.repair": "Install Input Method",
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
    "Helps us understand install counts and which macOS versions are in use. No commands, paths, or personal data are collected. You can change this anytime in About → Privacy.",
} as const;

export type TranslationKey = keyof typeof en;
export type Locale = "en" | "zh-CN";
export type LocalePreference = "system" | Locale;

const zhCN: Record<TranslationKey, string> = {
  "app.settings": "设置",
  "nav.appearance": "外观",
  "nav.behavior": "行为",
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
  "appearance.fontFamilyDescription": "补全弹窗使用的字体",
  "appearance.systemDefault": "系统默认",
  "appearance.fontSize": "字体大小",
  "appearance.fontSizeDescription": "补全弹窗的字体大小（像素）",
  "appearance.dimensions": "尺寸",
  "appearance.maxWidth": "最大宽度",
  "appearance.maxWidthDescription": "补全弹窗的最大宽度（像素）",
  "appearance.maxHeight": "最大高度",
  "appearance.maxHeightDescription": "补全弹窗的最大高度（像素）",

  "behavior.startupAndTrigger": "启动与触发",
  "behavior.launchAtLogin": "登录时启动",
  "behavior.launchAtLoginDescription": "登录系统时自动启动 Easy Complete",
  "behavior.showAfterTab": "按 Tab 后显示建议",
  "behavior.showAfterTabDescription": "按下 Tab 后再打开补全建议弹窗",
  "behavior.suggestions": "补全建议",
  "behavior.fuzzyMatching": "模糊匹配",
  "behavior.fuzzyMatchingDescription": "匹配相近字符序列，而非仅匹配前缀",
  "behavior.sortOrder": "排序方式",
  "behavior.sortOrderDescription": "选择补全建议的排序方式",
  "behavior.byRelevance": "按相关性",
  "behavior.alphabetical": "按字母顺序",
  "behavior.keyboardAndInsertion": "键盘与插入",
  "behavior.useUpArrowForHistory": "使用上方向键浏览历史",
  "behavior.useUpArrowForHistoryDescription":
    "允许用上方向键从补全建议切换到 Shell 历史记录",
  "behavior.insertTrailingSpace": "自动插入尾随空格",
  "behavior.insertTrailingSpaceDescription": "接受补全建议后自动添加一个空格",
  "behavior.executeAfterTrailingSpace": "尾随空格后按 Enter 执行",
  "behavior.executeAfterTrailingSpaceDescription":
    "命令末尾为空格时，将“立即执行”置于建议列表顶部；按 Enter 执行当前命令，而不是插入第一条补全建议",
  "behavior.history": "历史记录",
  "behavior.historyMode": "历史记录模式",
  "behavior.historyModeDescription": "选择 Shell 历史记录与补全建议的组合方式",
  "behavior.showWithCompletions": "与补全建议一起显示",
  "behavior.historyOnly": "仅显示历史记录",
  "behavior.off": "关闭",
  "behavior.mergeAllShells": "合并所有 Shell",
  "behavior.mergeAllShellsDescription":
    "包含所有 Shell（bash、zsh、fish）的历史记录",
  "behavior.historyCommand": "历史记录命令",
  "behavior.historyCommandDescription":
    "用作历史记录来源的 Shell 命令（留空则使用默认值）",
  "behavior.historyCommandPlaceholder": "例如 atuin search",

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
  "about.checkAutomatically": "自动检查更新",
  "about.checkAutomaticallyDescription": "有新版本时通知我",
  "about.privacy": "隐私",
  "about.shareUsageData": "共享匿名使用数据",
  "about.shareUsageDataDescription": "仅包含匿名统计数据，不包含命令或个人数据",
  "about.privacyPolicy": "隐私政策",
  "about.privacyPolicyDescription": "查看收集的数据以及如何选择退出",
  "about.viewPolicy": "查看政策",
  "about.releaseNotes": "发行说明",
  "about.licensePrefix": "基于 MIT 和 Apache 2.0 许可证开源 · 项目基于",
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
    "向 .zshrc / .bashrc 注入钩子，使 Easy Complete 能够跟踪 Shell 状态。",
  "permission.shellIntegration.repair": "安装 Shell 钩子",
  "permission.inputMethod.title": "输入法集成",
  "permission.inputMethod.description":
    "用于在 Kitty、Alacritty、Zed、Ghostty 和 WezTerm 中跟踪光标位置。",
  "permission.inputMethod.repair": "安装输入法",
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
    "帮助我们了解安装数量和使用中的 macOS 版本。不会收集命令、路径或个人数据，你可以随时在“关于 → 隐私”中更改。",
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
