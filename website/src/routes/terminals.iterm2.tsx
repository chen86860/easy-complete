import { createFileRoute } from "@tanstack/react-router";
import { TerminalGuidePage } from "../components/TerminalGuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";
import { terminalGuideBySlug } from "../terminalGuides.ts";

const guide = terminalGuideBySlug.get("iterm2")!;
const PATH = "/terminals/iterm2";

export const Route = createFileRoute("/terminals/iterm2")({
  head: () =>
    pageHead({
      title: guide.seoTitle,
      description: guide.seoDescription,
      path: PATH,
    }),
  component: Iterm2Page,
});

function Iterm2Page() {
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
