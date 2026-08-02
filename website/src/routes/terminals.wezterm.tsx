import { createFileRoute } from "@tanstack/react-router";
import { TerminalGuidePage } from "../components/TerminalGuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";
import { terminalGuideBySlug } from "../terminalGuides.ts";

const guide = terminalGuideBySlug.get("wezterm")!;
const PATH = "/terminals/wezterm";

export const Route = createFileRoute("/terminals/wezterm")({
  head: () =>
    pageHead({
      title: guide.seoTitle,
      description: guide.seoDescription,
      path: PATH,
    }),
  component: WeztermPage,
});

function WeztermPage() {
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
