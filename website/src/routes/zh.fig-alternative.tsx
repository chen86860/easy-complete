import { createFileRoute } from "@tanstack/react-router";
import {
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "../components/GuidePage.tsx";
import { DOWNLOAD_URL } from "../download.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "开源、本地运行的 macOS Fig 替代方案 — Easy Complete";
const DESCRIPTION =
  "Easy Complete 是免费、开源、完全本地运行的 Fig 风格终端自动补全工具，支持 Apple Silicon Mac 上的 zsh、bash 和 fish。";
const ALTERNATES = [
  { locale: "en" as const, path: "/fig-alternative" },
  { locale: "zh-CN" as const, path: "/zh/fig-alternative" },
];

export const Route = createFileRoute("/zh/fig-alternative")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh/fig-alternative",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhFigAlternativePage,
});

function ZhFigAlternativePage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/zh/fig-alternative",
          crumbLabel: "Fig 替代方案",
          locale: "zh-CN",
        })}
      />
      <GuidePage
        eyebrow="Fig 替代方案"
        title="保留自动补全体验，去掉外围助手功能。"
        intro="Easy Complete 是一款专注、开源的终端补全工具，适合喜欢 Fig 风格建议，又希望使用完全本地 macOS 自动补全的人。"
        locale="zh-CN"
        hrefs={{ en: "/fig-alternative", "zh-CN": "/zh/fig-alternative" }}
      >
        <GuideCallout>
          Easy Complete 是独立的开源项目。Fig 和 Amazon Q
          是各自权利人的商标，本项目与其不存在关联或从属关系。
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>Easy Complete 保留了什么</h2>
        <GuideList>
          <li>针对选项、子命令、参数和路径的 IDE 风格建议。</li>
          <li>显示在当前终端光标旁的原生建议窗口。</li>
          <li>覆盖数百种常用命令行工具的补全规范。</li>
          <li>支持 zsh、bash、fish、独立终端和 IDE 内置终端。</li>
        </GuideList>

        <h2 className={GUIDE_HEADING}>刻意不包含什么</h2>
        <p className={GUIDE_PARAGRAPH}>
          Easy Complete 不是聊天产品，也不是云端编程助手。补全完全在 Mac
          本地生成，无需账号，也不会发起 AI 请求。匿名产品统计可以随时关闭。
        </p>

        <div className="my-9 overflow-x-auto rounded-[14px] border border-[#1c232d]">
          <table className="w-full min-w-155 border-collapse text-left text-sm">
            <thead className="border-b border-[#1c232d] bg-[#0d1219] font-mono text-xs uppercase tracking-wider text-[#65707d]">
              <tr>
                <th className="px-5 py-4">能力</th>
                <th className="px-5 py-4">Easy Complete</th>
              </tr>
            </thead>
            <tbody className="text-[#9aa4b0]">
              {[
                ["自动补全引擎", "本地运行的原生 macOS 应用"],
                ["云端账号", "不需要"],
                ["AI 或云端补全", "无"],
                ["源代码", "开源"],
                ["发布版本", "Apple Silicon / ARM64"],
                ["许可证", "MIT"],
              ].map(([label, value]) => (
                <tr
                  key={label}
                  className="border-b border-[#141a21] last:border-b-0"
                >
                  <th className="px-5 py-4 font-medium text-[#cdd6e0]">
                    {label}
                  </th>
                  <td className="px-5 py-4">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={GUIDE_HEADING}>适合哪些人</h2>
        <p className={GUIDE_PARAGRAPH}>
          如果你需要结构化命令建议，偏好本地软件，使用 Apple Silicon
          Mac，且不想把终端聊天助手与自动补全捆绑在一起，Easy Complete
          会很合适。
        </p>
        <p>
          <a
            href={DOWNLOAD_URL}
            className="inline-flex rounded-[10px] bg-(--accent) px-5 py-3 font-semibold text-[#06140a] transition hover:brightness-110"
          >
            免费试用 Easy Complete
          </a>
        </p>

        <RelatedGuides
          locale="zh-CN"
          links={[
            {
              href: "/zh/install",
              label: "安装 Easy Complete",
              description: "在 macOS 上安装并运行 ARM64 版本。",
            },
            {
              href: "/zh/terminals/ghostty",
              label: "在 Ghostty 中使用",
              description: "设置准确的光标跟踪。",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
