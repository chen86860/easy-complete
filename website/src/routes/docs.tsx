import { createFileRoute } from "@tanstack/react-router";
import { DocsPageView } from "../components/DocsPageView.tsx";
import { docsCopyEn } from "../i18n/en.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "Easy Complete Docs — Install, Terminals & Troubleshooting";
const DESCRIPTION =
  "Documentation for Easy Complete: install on macOS, the full terminal support list, Ghostty cursor tracking, troubleshooting, and privacy.";

const ALTERNATES = [
  { locale: "en" as const, path: "/docs" },
  { locale: "zh-CN" as const, path: "/zh/docs" },
];

export const Route = createFileRoute("/docs")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/docs",
      locale: "en",
      alternates: ALTERNATES,
    }),
  component: DocsPage,
});

function DocsPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/docs",
        })}
      />
      <DocsPageView
        copy={docsCopyEn}
        locale="en"
        hrefs={{ en: "/docs", "zh-CN": "/zh/docs" }}
      />
    </>
  );
}
