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

const TITLE = "修复 macOS 终端自动补全问题 — Easy Complete";
const DESCRIPTION =
  "通过检查辅助功能权限、Shell 钩子和终端集成，排查 Easy Complete 在 macOS 上不显示建议或建议窗口错位的问题。";
const ALTERNATES = [
  { locale: "en" as const, path: "/troubleshooting" },
  { locale: "zh-CN" as const, path: "/zh/troubleshooting" },
];

export const Route = createFileRoute("/zh/troubleshooting")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh/troubleshooting",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhTroubleshootingPage,
});

function ZhTroubleshootingPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/zh/troubleshooting",
          crumbLabel: "故障排查",
          locale: "zh-CN",
        })}
      />
      <GuidePage
        eyebrow="故障排查"
        title="建议消失时，先检查集成状态。"
        intro="大多数自动补全问题来自 macOS 权限状态、尚未重载的 Shell，或需要重新注册的终端输入法。"
        locale="zh-CN"
        hrefs={{ en: "/troubleshooting", "zh-CN": "/zh/troubleshooting" }}
      >
        <GuideCallout>
          先运行 <code className="font-mono">ec doctor</code>
          。它会在你手动修改任何设置之前，检查常见的安装和集成问题。
        </GuideCallout>
        <pre className={GUIDE_CODE}>ec doctor</pre>

        <h2 className={GUIDE_HEADING}>完全没有建议</h2>
        <GuideList>
          <li>确认 Easy Complete 正在菜单栏中运行。</li>
          <li>在「系统设置 → 隐私与安全性 → 辅助功能」中启用它。</li>
          <li>
            运行 <code className="font-mono text-[#cdd6e0]">exec $SHELL</code>
            重载 Shell。
          </li>
          <li>
            打开新的终端窗口，输入{" "}
            <code className="font-mono text-[#cdd6e0]">git</code> 或{" "}
            <code className="font-mono text-[#cdd6e0]">npm</code> 进行测试。
          </li>
        </GuideList>
        <pre className={GUIDE_CODE}>
          {"ec debug prompt-accessibility\nexec $SHELL"}
        </pre>

        <h2 className={GUIDE_HEADING}>
          Ghostty 或 Otty 中建议窗口不显示或位置错位
        </h2>
        <p className={GUIDE_PARAGRAPH}>
          Ghostty、Otty、Kitty、WezTerm、Zed 和 Alacritty
          使用随附输入法进行像素级精确的光标跟踪。请重新注册输入法，然后完全退出并重启终端。
        </p>
        <pre className={GUIDE_CODE}>ec integrations install input-method</pre>

        <h2 className={GUIDE_HEADING}>找不到 ec 命令</h2>
        <p className={GUIDE_PARAGRAPH}>
          安装程序会把 Easy Complete 命令行工具放在{" "}
          <code className="font-mono text-[#cdd6e0]">~/.local/bin</code>
          。确认该目录已加入 PATH，然后启动新的 Shell 会话。
        </p>
        <pre className={GUIDE_CODE}>{"echo $PATH\ncommand -v ec"}</pre>

        <h2 className={GUIDE_HEADING}>收集诊断信息</h2>
        <p className={GUIDE_PARAGRAPH}>
          如果内置检查仍未解决问题，请在提交 GitHub Issue
          前输出集成和环境状态。分享之前先检查输出，并删除不希望公开的信息。
        </p>
        <pre className={GUIDE_CODE}>ec diagnostic</pre>

        <RelatedGuides
          locale="zh-CN"
          links={[
            {
              href: "/zh/install",
              label: "重新检查安装",
              description: "逐项确认首次运行步骤。",
            },
            {
              href: "/zh/terminals/ghostty",
              label: "Ghostty 指南",
              description: "了解输入法集成的工作方式。",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
