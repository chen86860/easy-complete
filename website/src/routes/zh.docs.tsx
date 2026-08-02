import { createFileRoute } from "@tanstack/react-router";
import { DocsPageView } from "../components/DocsPageView.tsx";
import { docsCopyZh } from "../i18n/zh.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "Easy Complete 文档 — 安装、终端支持与故障排查";
const DESCRIPTION =
  "Easy Complete 使用文档:在 macOS 上安装、完整的终端支持列表、Ghostty 光标跟踪、故障排查与隐私说明。";

const ALTERNATES = [
  { locale: "en" as const, path: "/docs" },
  { locale: "zh-CN" as const, path: "/zh/docs" },
];

export const Route = createFileRoute("/zh/docs")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/zh/docs",
      locale: "zh-CN",
      alternates: ALTERNATES,
    }),
  component: ZhDocsPage,
});

function ZhDocsPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/zh/docs",
          crumbLabel: "文档",
          locale: "zh-CN",
        })}
      />
      <DocsPageView
        copy={docsCopyZh}
        locale="zh-CN"
        hrefs={{ en: "/docs", "zh-CN": "/zh/docs" }}
      />
    </>
  );
}
