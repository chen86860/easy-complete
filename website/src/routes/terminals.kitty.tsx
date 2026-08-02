import { createFileRoute } from "@tanstack/react-router";
import { TerminalGuidePage } from "../components/TerminalGuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";
import { terminalGuideBySlug } from "../terminalGuides.ts";

const guide = terminalGuideBySlug.get("kitty")!;
const PATH = "/terminals/kitty";

export const Route = createFileRoute("/terminals/kitty")({
  head: () =>
    pageHead({
      title: guide.seoTitle,
      description: guide.seoDescription,
      path: PATH,
    }),
  component: KittyPage,
});

function KittyPage() {
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
