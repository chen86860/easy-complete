import { createFileRoute } from "@tanstack/react-router";
import { TerminalGuidePage } from "../components/TerminalGuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";
import { terminalGuideBySlug } from "../terminalGuides.ts";

const guide = terminalGuideBySlug.get("zed")!;
const PATH = "/terminals/zed";

export const Route = createFileRoute("/terminals/zed")({
  head: () =>
    pageHead({
      title: guide.seoTitle,
      description: guide.seoDescription,
      path: PATH,
    }),
  component: ZedPage,
});

function ZedPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: guide.seoTitle,
          description: guide.seoDescription,
          path: PATH,
          crumbLabel: guide.eyebrow,
        })}
      />
      <TerminalGuidePage guide={guide} />
    </>
  );
}
