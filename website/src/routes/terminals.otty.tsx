import { createFileRoute } from "@tanstack/react-router";
import { TerminalGuidePage } from "../components/TerminalGuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";
import { terminalGuideBySlug } from "../terminalGuides.ts";

const guide = terminalGuideBySlug.get("otty")!;
const PATH = "/terminals/otty";

export const Route = createFileRoute("/terminals/otty")({
  head: () =>
    pageHead({
      title: guide.seoTitle,
      description: guide.seoDescription,
      path: PATH,
    }),
  component: OttyPage,
});

function OttyPage() {
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
