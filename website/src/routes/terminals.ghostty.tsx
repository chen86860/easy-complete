import { createFileRoute } from "@tanstack/react-router";
import {
  GUIDE_CODE,
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "../components/GuidePage.tsx";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "Ghostty Autocomplete on macOS — Easy Complete";
const DESCRIPTION =
  "Add IDE-style autocomplete to Ghostty on macOS with Easy Complete. Learn how the shell integration and bundled input method keep suggestions aligned.";
const ALTERNATES = [
  { locale: "en" as const, path: "/terminals/ghostty" },
  { locale: "zh-CN" as const, path: "/zh/terminals/ghostty" },
];

export const Route = createFileRoute("/terminals/ghostty")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/terminals/ghostty",
      alternates: ALTERNATES,
    }),
  component: GhosttyPage,
});

function GhosttyPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/terminals/ghostty",
          crumbLabel: "Ghostty autocomplete",
        })}
      />
      <GuidePage
        eyebrow="Ghostty autocomplete"
        title="IDE-style completions that follow your Ghostty cursor."
        intro="Easy Complete combines shell state with a bundled macOS input method so its native suggestion window stays aligned inside Ghostty."
      >
        <h2 className={GUIDE_HEADING}>What gets installed</h2>
        <GuideList>
          <li>
            Shell hooks report the current directory, command text, and cursor
            position.
          </li>
          <li>
            The bundled input method provides pixel-accurate caret location for
            Ghostty.
          </li>
          <li>
            The native overlay renders flags, subcommands, arguments, and file
            paths beside the cursor.
          </li>
        </GuideList>

        <GuideCallout>
          Ghostty requires the input-method integration because it bypasses part
          of the standard PTY path used for cursor tracking. Easy Complete
          registers it automatically during installation.
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>Set up Ghostty autocomplete</h2>
        <GuideList>
          <li>
            <a
              href="/install"
              className="text-(--accent) underline underline-offset-4"
            >
              Install Easy Complete
            </a>{" "}
            and grant Accessibility permission.
          </li>
          <li>Quit and reopen Ghostty, or reload the current shell.</li>
          <li>
            Run <code className="font-mono text-[#cdd6e0]">ec doctor</code> to
            confirm the shell and input-method integrations.
          </li>
        </GuideList>
        <pre className={GUIDE_CODE}>{`exec $SHELL
ec doctor`}</pre>

        <h2 className={GUIDE_HEADING}>
          If suggestions are misaligned or missing
        </h2>
        <p className={GUIDE_PARAGRAPH}>
          Re-register the bundled input method, then restart Ghostty so macOS
          loads the updated integration.
        </p>
        <pre className={GUIDE_CODE}>ec integrations install input-method</pre>
        <p className={GUIDE_PARAGRAPH}>
          Also confirm that Easy Complete remains enabled under System Settings
          → Privacy &amp; Security → Accessibility.
        </p>

        <h2 className={GUIDE_HEADING}>Keyboard controls</h2>
        <GuideList>
          <li>
            <code className="font-mono text-[#cdd6e0]">↑ / ↓</code> moves
            through suggestions.
          </li>
          <li>
            <code className="font-mono text-[#cdd6e0]">Tab / →</code> accepts
            the highlighted suggestion.
          </li>
          <li>
            <code className="font-mono text-[#cdd6e0]">Esc</code> dismisses the
            popup.
          </li>
        </GuideList>

        <RelatedGuides
          links={[
            {
              href: "/install",
              label: "Install on macOS",
              description: "DMG, permissions, shell reload, and verification.",
            },
            {
              href: "/troubleshooting",
              label: "Troubleshooting",
              description: "Diagnose permissions and integrations.",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
