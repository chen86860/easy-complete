import { createFileRoute } from "@tanstack/react-router";
import {
  GUIDE_CODE,
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "../components/GuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "在 macOS 上为 Ghostty 启用自动补全 — Easy Complete";
const DESCRIPTION =
  "使用 Easy Complete 为 macOS 上的 Ghostty 添加 IDE 风格终端自动补全，了解 Shell 集成与随附输入法如何让建议窗口准确跟随光标。";
const ALTERNATES = [
  { locale: "en" as const, path: "/terminals/ghostty" },
  { locale: "zh-CN" as const, path: "/zh/terminals/ghostty" },
];

export const Route = createFileRoute("/zh/terminals/ghostty")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh/terminals/ghostty",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhGhosttyPage,
});

function ZhGhosttyPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/zh/terminals/ghostty",
          crumbLabel: "Ghostty 自动补全",
          locale: "zh-CN",
        })}
      />
      <GuidePage
        eyebrow="Ghostty 自动补全"
        title="让 IDE 风格补全准确跟随 Ghostty 光标。"
        intro="Easy Complete 将 Shell 状态与随附的 macOS 输入法结合，让原生建议窗口在 Ghostty 中始终对准当前光标。"
        locale="zh-CN"
        hrefs={{
          en: "/terminals/ghostty",
          "zh-CN": "/zh/terminals/ghostty",
        }}
      >
        <h2 className={GUIDE_HEADING}>会安装哪些组件</h2>
        <GuideList>
          <li>Shell 钩子会报告当前目录、命令文本和光标位置。</li>
          <li>随附输入法为 Ghostty 提供像素级精确的插入点位置。</li>
          <li>原生浮层会在光标旁显示选项、子命令、参数和文件路径。</li>
        </GuideList>

        <GuideCallout>
          Ghostty 绕过了标准 PTY 光标跟踪路径的一部分，因此需要输入法集成。Easy
          Complete 会在安装过程中自动注册它。
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>设置 Ghostty 自动补全</h2>
        <GuideList>
          <li>
            <a
              href="/zh/install"
              className="text-(--accent) underline underline-offset-4"
            >
              安装 Easy Complete
            </a>
            ，并授予辅助功能权限。
          </li>
          <li>退出并重新打开 Ghostty，或重载当前 Shell。</li>
          <li>
            运行 <code className="font-mono text-[#cdd6e0]">ec doctor</code>
            ，确认 Shell 和输入法集成都正常工作。
          </li>
        </GuideList>
        <pre className={GUIDE_CODE}>{"exec $SHELL\nec doctor"}</pre>

        <h2 className={GUIDE_HEADING}>建议错位或不显示时</h2>
        <p className={GUIDE_PARAGRAPH}>
          重新注册随附输入法，然后重启 Ghostty，让 macOS 加载更新后的集成。
        </p>
        <pre className={GUIDE_CODE}>ec integrations install input-method</pre>
        <p className={GUIDE_PARAGRAPH}>
          还要确认「系统设置 → 隐私与安全性 → 辅助功能」中仍然启用了 Easy
          Complete。
        </p>

        <h2 className={GUIDE_HEADING}>键盘操作</h2>
        <GuideList>
          <li>
            <code className="font-mono text-[#cdd6e0]">↑ / ↓</code>
            用于切换建议。
          </li>
          <li>
            <code className="font-mono text-[#cdd6e0]">Tab / →</code>
            用于接受高亮的建议。
          </li>
          <li>
            <code className="font-mono text-[#cdd6e0]">Esc</code>
            用于关闭建议窗口。
          </li>
        </GuideList>

        <RelatedGuides
          locale="zh-CN"
          links={[
            {
              href: "/zh/install",
              label: "在 macOS 上安装",
              description: "通过 DMG 或 Homebrew 安装、授权、重载并验证。",
            },
            {
              href: "/zh/troubleshooting",
              label: "故障排查",
              description: "诊断权限与终端集成问题。",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
