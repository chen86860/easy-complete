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

const TITLE = "Fix macOS Terminal Autocomplete — Easy Complete";
const DESCRIPTION =
  "Troubleshoot missing or misaligned Easy Complete suggestions on macOS by checking Accessibility permission, shell hooks, and terminal integrations.";
const ALTERNATES = [
  { locale: "en" as const, path: "/troubleshooting" },
  { locale: "zh-CN" as const, path: "/zh/troubleshooting" },
];

export const Route = createFileRoute("/troubleshooting")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/troubleshooting",
      alternates: ALTERNATES,
    }),
  component: TroubleshootingPage,
});

function TroubleshootingPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/troubleshooting",
          crumbLabel: "Troubleshooting",
        })}
      />
      <GuidePage
        eyebrow="Troubleshooting"
        title="When suggestions disappear, start with the integration."
        intro="Most autocomplete problems come from macOS permission state, a shell that has not reloaded, or a terminal input method that needs to be registered again."
      >
        <GuideCallout>
          Start with <code className="font-mono">ec doctor</code>. It checks the
          common installation and integration problems before you change
          anything manually.
        </GuideCallout>
        <pre className={GUIDE_CODE}>ec doctor</pre>

        <h2 className={GUIDE_HEADING}>No suggestions appear</h2>
        <GuideList>
          <li>Confirm Easy Complete is running from the menu bar.</li>
          <li>
            Enable it under System Settings → Privacy &amp; Security →
            Accessibility.
          </li>
          <li>
            Reload your shell with{" "}
            <code className="font-mono text-[#cdd6e0]">exec $SHELL</code>.
          </li>
          <li>
            Open a new terminal window and test with{" "}
            <code className="font-mono text-[#cdd6e0]">git</code> or{" "}
            <code className="font-mono text-[#cdd6e0]">npm</code>.
          </li>
        </GuideList>
        <pre className={GUIDE_CODE}>{`ec debug prompt-accessibility
exec $SHELL`}</pre>

        <h2 className={GUIDE_HEADING}>
          The popup is missing or misaligned in Ghostty or Otty
        </h2>
        <p className={GUIDE_PARAGRAPH}>
          Ghostty, Otty, Kitty, WezTerm, Zed, and Alacritty use the bundled
          input method for pixel-accurate cursor tracking. Re-register it, then
          fully restart the terminal.
        </p>
        <pre className={GUIDE_CODE}>ec integrations install input-method</pre>

        <h2 className={GUIDE_HEADING}>The CLI command is not found</h2>
        <p className={GUIDE_PARAGRAPH}>
          The installer places the Easy Complete CLI in{" "}
          <code className="font-mono text-[#cdd6e0]">~/.local/bin</code>.
          Confirm that directory is in your PATH, then start a new shell
          session.
        </p>
        <pre className={GUIDE_CODE}>{`echo $PATH
command -v ec`}</pre>

        <h2 className={GUIDE_HEADING}>Collect diagnostic information</h2>
        <p className={GUIDE_PARAGRAPH}>
          If the built-in checks do not resolve the problem, print the
          integration and environment state before opening a GitHub issue.
          Review the output and remove anything you do not want to share.
        </p>
        <pre className={GUIDE_CODE}>ec diagnostic</pre>

        <RelatedGuides
          links={[
            {
              href: "/install",
              label: "Recheck installation",
              description: "Verify every first-run step.",
            },
            {
              href: "/terminals/ghostty",
              label: "Ghostty guide",
              description: "Understand the input-method integration.",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
