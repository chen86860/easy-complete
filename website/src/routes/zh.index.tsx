import { createFileRoute } from "@tanstack/react-router";
import { App } from "../App.tsx";
import { homeCopyZh } from "../i18n/zh.ts";
import { SeoJsonLd, faqSchema, homeSchema, pageHead } from "../seo.tsx";

const TITLE = "Easy Complete — macOS 终端自动补全";
const DESCRIPTION =
  "Easy Complete 为 macOS 终端带来 IDE 风格的行内自动补全:快速、本地、开源,支持 git、npm、docker、cargo 等数百种命令行工具。";

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
