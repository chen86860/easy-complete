import type {
  DocSection,
  Faq,
  Feature,
  Process,
  Reason,
  TerminalSupport,
} from "../data.ts";
import { GITHUB_URL, terminalSupport } from "../data.ts";
import type { DocsCopy, HomeCopy } from "./types.ts";

const glyphs = ["›_", "⌘", "◳", "⚡", "◆", "◐", "⊞", "$", "⇥"];

const featureDataZh: Array<Omit<Feature, "glyph">> = [
  {
    title: "行内补全",
    desc: "输入的同时给出 IDE 风格的建议——子命令、参数、选项和文件路径,按你真正想输入的内容排序",
  },
  {
    title: "数百种 CLI",
    desc: "开箱即用地支持 git、npm、docker、cargo、aws、kubectl 等大量常用工具的补全规格",
  },
  {
    title: "原生浮层",
    desc: "紧贴光标的轻量原生窗口,不是靠转义序列在提示符里硬画出来的",
  },
  {
    title: "快且轻",
    desc: "用 Rust 编写,毫秒级给出建议,你的击键和补全之间没有延迟",
  },
  {
    title: "100% 本地",
    desc: "无云端、无账号、无 AI 调用。你的命令永远不会离开这台机器",
  },
  {
    title: "可换主题",
    desc: "与终端配色保持一致,内置 GitHub Dark 等多套主题",
  },
  {
    title: "到处都能用",
    desc: "多数终端开箱即用;Ghostty、Otty、Kitty、WezTerm、Zed 和 Alacritty 还能获得像素级光标跟踪",
  },
  {
    title: "IDE 内置终端",
    desc: "补全会跟着你进入 VS Code、Cursor、ChatGPT(Codex)以及 JetBrains 系 IDE 的终端",
  },
  {
    title: "一条命令装好",
    desc: "./install.sh 完成构建、安装并接好 Shell 集成——之后直接开始输入即可",
  },
];

const featuresZh: Feature[] = featureDataZh.map((d, i) => ({
  glyph: glyphs[i] ?? "›_",
  ...d,
}));

const reasonsZh: Reason[] = [
  {
    num: "01",
    title: "只做补全,别的都不做",
    desc: "没有聊天、没有 AI 助手、没有云端补全。一件事,做好",
  },
  {
    num: "02",
    title: "原生应用,不是插件",
    desc: "一个真正的 macOS 应用和真正的浮层窗口,而不是往提示符里塞一串转义字符",
  },
  {
    num: "03",
    title: "默认保护隐私",
    desc: "补全完全在本机完成——命令内容不会离开你的 Mac。仅收集匿名使用计数,一条命令即可关闭",
  },
  {
    num: "04",
    title: "开源",
    desc: "一个专注的本地补全引擎,为快速的终端自动补全而生",
  },
];

const faqsZh: Faq[] = [
  {
    question: "Easy Complete 是什么?",
    answer:
      "Easy Complete 是一款 macOS 终端自动补全应用,为命令行工具提供 IDE 风格的行内建议",
  },
  {
    question: "Easy Complete 在本地运行吗?",
    answer:
      "是的。补全完全在本机完成——无账号、无云端请求、无 AI 调用,命令内容不会离开你的 Mac",
  },
  {
    question: "Easy Complete 会收集哪些数据?",
    answer:
      "只有匿名使用统计:应用启动、安装/更新事件,以及每日补全计数,关联到一个随机设备 ID。命令内容、补全文本和文件路径从不收集。随时用 `ec telemetry disable` 关闭——完整清单见隐私政策页面",
  },
  {
    question: "Easy Complete 支持哪些终端?",
    answer:
      "Easy Complete 支持 Ghostty、Otty、Kitty、WezTerm、Alacritty、Zed、iTerm2、Apple Terminal、VS Code、ChatGPT(Codex)以及 JetBrains 系 IDE 终端。其中 Otty 与 ChatGPT(Codex)在 v2.1.0 加入",
  },
  {
    question: "如何安装 Easy Complete?",
    answer:
      "用 Easy Complete 的 Homebrew Cask 安装,或从 GitHub Releases 下载最新的 macOS DMG 并按安装指南操作",
  },
];

const processesZh: Process[] = [
  {
    bin: "easy-complete",
    crate: "fig_desktop",
    role: "原生应用宿主——承载补全浮层与设置面板(运行在 wry WebView 里的 React 应用)、系统托盘和窗口管理",
  },
  {
    bin: "ecterm",
    crate: "figterm",
    role: "位于 Shell 与终端模拟器之间的伪终端;拦截 Shell 编辑缓冲区来驱动补全",
  },
  {
    bin: "ec",
    crate: "q_cli",
    role: "命令行入口——setup、integrations、diagnostic、settings 等子命令",
  },
];

const NOTE_ZH: Record<string, string> = {
  Ghostty: "安装时自动注册随附输入法",
  Otty: "输入法光标跟踪;并且 Easy Complete 会保留 Otty 自己写在 rc 文件末尾的集成块",
  Kitty: "安装时自动注册随附输入法",
  WezTerm: "安装时自动注册随附输入法",
  Alacritty: "安装时自动注册随附输入法",
  Zed: "终端面板,通过随附输入法跟踪光标",
  "JetBrains IDEs": "覆盖 JetBrains 全系 IDE 的内置终端",
  "ChatGPT (Codex)": "ChatGPT.app 里的 Codex 终端会话,通过 xterm.js 光标定位",
  "VS Code": "内置终端,含 Cursor、Windsurf 与 Trae",
  iTerm2: "重载 Shell 后开箱即用",
  "Apple Terminal": "重载 Shell 后开箱即用",
};

const terminalSupportZh: TerminalSupport[] = terminalSupport.map((t) => ({
  ...t,
  note: NOTE_ZH[t.name] ?? t.note,
}));

const docSectionsZh: DocSection[] = [
  {
    id: "getting-started",
    title: "快速上手",
    summary: "从下载到第一次补全——装好应用,授予一项权限,重载 Shell",
    links: [
      {
        href: "/zh/install",
        label: "在 macOS 上安装",
        description:
          "Homebrew 或 DMG、辅助功能权限、重载 Shell,以及用 ec doctor 验证",
      },
      {
        href: "/zh/troubleshooting",
        label: "故障排查",
        description: "排查建议不出现、Shell 钩子失效和终端集成损坏的问题",
      },
    ],
  },
  {
    id: "terminals",
    title: "终端支持",
    summary:
      "所有终端都通过同一套 Shell 集成读取你输入的命令——区别在于 Easy Complete 用什么方式定位光标来摆放浮层",
    links: [
      {
        href: "/zh/terminals/ghostty",
        label: "Ghostty 自动补全",
        description: "Ghostty 为什么需要输入法,以及建议偏移时如何重新注册",
      },
      {
        href: "/terminals/otty",
        label: "Otty 自动补全(英文)",
        description:
          "输入法光标跟踪,以及 Easy Complete 如何与 Otty 自己的 Shell 集成共存",
      },
      {
        href: "/terminals/iterm2",
        label: "iTerm2 自动补全(英文)",
        description: "走辅助功能路径——没有输入法需要注册",
      },
    ],
  },
  {
    id: "reference",
    title: "参考",
    summary: "应用收集什么、它与同类有何不同,以及源码在哪里",
    links: [
      {
        href: "/privacy-policy",
        label: "隐私政策与遥测(英文)",
        description: "匿名事件的完整清单,以及关闭它们的那一条命令",
      },
      {
        href: "/zh/fig-alternative",
        label: "在找 Fig 替代方案？",
        description: "了解专注、本地的补全引擎包含什么，以及它刻意省略了什么",
      },
      {
        href: GITHUB_URL,
        label: "GitHub 源码",
        description: "应用背后的 Rust crate、TypeScript 包与构建脚本",
        external: true,
      },
    ],
  },
];

const NEW_TERMINAL_NAMES_ZH = "Otty 与 ChatGPT(Codex)";

export const homeCopyZh: HomeCopy = {
  badge: "macOS · 100% 本地 · 开源",
  heroHeading: "为 macOS 终端而生的自动补全",
  heroSubheading:
    "为数百种命令行工具提供 fish 风格的补全建议——git、npm、docker、cargo。原生、快速，而且完全在本机运行",
  downloadCta: "下载 DMG",
  githubCta: "在 GitHub 查看",
  brewDivider: "或用 Homebrew 安装",
  copyLabel: "复制",
  copiedLabel: "已复制",
  copyErrorLabel: "重试",
  copyAriaLabel: (command) => `复制 Homebrew 安装命令:${command}`,

  marqueeLabel: "在你惯用的终端里运行",
  featuresLabel: "功能",
  featuresHeading: "补全一条命令所需的一切，多余的一概没有",
  featuresSubheading: "只做一件事并做好——没有聊天、没有 AI 调用、没有云端补全",

  whyLabel: "为什么选 Easy Complete",
  whyHeading: "刻意为之的取舍",

  terminalsLabel: "支持的终端",
  terminalsHeading: "你在哪儿敲命令,它就在哪儿",
  terminalsNewPrefix: "v2.1.0 新增:",
  terminalsBody:
    "Otty 加入使用输入法的终端行列,获得像素级光标跟踪;ChatGPT(Codex)会话则通过 xterm.js 光标定位。其余终端继续依靠首次启动时自动安装的 Shell 集成工作",
  terminalsLinkLabel: "查看完整支持列表",
  terminalGuideTitle: (name) => `${name} 自动补全配置指南`,
  newBadge: "新增",

  howLabel: "工作原理",
  howHeading: "三个进程,通过套接字通信",
  howSubheading:
    "用 Rust 编写,原生而轻量。每个进程只负责一件事,彼此通过 Unix 域套接字上的 Protobuf 消息协作",
  crateLabel: "crate",
  flowShellHooks: "Shell 钩子 → 当前目录 · 命令文本 · 光标",
  flowInputMethod: "输入法助手 → 光标位置(macOS)",
  flowProtobuf: "Unix 套接字上的 Protobuf",

  faqLabel: "常见问题",
  faqHeading: "安装前先看这些",

  docsLabel: "文档",
  docsHeading: "从下载到第一次补全",
  docsSubheading:
    "安装 Easy Complete、确认你的终端是否受支持、为 Ghostty 配置光标跟踪,或修复 Shell 集成——都不用翻源码仓库",
  docsCta: "浏览文档",

  ctaHeading: "别再背参数了",
  ctaSubheading: "让终端替你记住",
  ctaFootnote: "需要 macOS 12+ · Apple Silicon(ARM64) · MIT",
  ctaTagline: "一个专注的本地补全引擎,为快速的终端自动补全而生",
  features: featuresZh,
  reasons: reasonsZh,
  faqs: faqsZh,
  terminalSupport: terminalSupportZh,
  docSections: docSectionsZh,
  processes: processesZh,
};

export const docsCopyZh: DocsCopy = {
  eyebrow: "文档",
  heading: "装好它,接上终端,让它一直好用",
  intro:
    "Easy Complete 需要你做的事都在这一页:一条安装命令、一项 macOS 权限,以及一份支持列表,让你知道自己的终端走的是哪条路径",
  quickStart: "快速开始",
  installGuideCta: "完整安装指南",
  downloadCta: "下载 DMG",
  requirements: "macOS 12+ · Apple Silicon(ARM64)",
  terminalColumn: "终端",
  trackingColumn: "光标跟踪",
  notesColumn: "说明",
  newBadge: "新增",
  terminalsCalloutLead: `v2.1.0 新增 —— ${NEW_TERMINAL_NAMES_ZH}。`,
  terminalsCalloutBody:
    "Otty 获得输入法光标跟踪,并且 Easy Complete 现在能与 Otty 管理的 Shell rc 文件共存,而不再把自己的集成误报为损坏。ChatGPT(Codex)会话则通过 xterm.js 光标定位跟踪,与 VS Code 走同一条路径",
  docSections: docSectionsZh,
  terminalSupport: terminalSupportZh,
};

export const faqsZhExport = faqsZh;
