import { createFileRoute } from "@tanstack/react-router";
import { App } from "../App.tsx";
import { homeCopyZh } from "../i18n/zh.ts";
import { SeoJsonLd, faqSchema, homeSchema, pageHead } from "../seo.tsx";

const TITLE = "Easy Complete — macOS 终端自动补全";
const DESCRIPTION =
  "Easy Complete 是开源、完全本地运行的 macOS 终端自动补全工具，提供 IDE 风格行内建议，支持 Ghostty、iTerm2、Kitty 等终端及 git、npm、docker、cargo 等数百种 CLI，可通过 Homebrew 或 DMG 安装。";

const ALTERNATES = [
  { locale: "en" as const, path: "/" },
  { locale: "zh-CN" as const, path: "/zh" },
];

export const Route = createFileRoute("/zh/")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhHomePage,
});

function ZhHomePage() {
  return (
    <>
      <SeoJsonLd data={homeSchema("zh-CN")} />
      <SeoJsonLd data={faqSchema(homeCopyZh.faqs)} />
      <App
        copy={homeCopyZh}
        locale="zh-CN"
        hrefs={{ en: "/", "zh-CN": "/zh" }}
      />
    </>
  );
}
