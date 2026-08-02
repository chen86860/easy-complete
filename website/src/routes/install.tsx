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
import { DOWNLOAD_URL } from "../download.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "Install Easy Complete on macOS — Terminal Autocomplete";
const DESCRIPTION =
  "Install Easy Complete with Homebrew on Apple Silicon macOS, grant Accessibility permission, reload your shell, and verify it with ec doctor.";

const ALTERNATES = [
  { locale: "en" as const, path: "/install" },
  { locale: "zh-CN" as const, path: "/zh/install" },
];

export const Route = createFileRoute("/install")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/install",
      locale: "en",
      alternates: ALTERNATES,
    }),
  component: InstallPage,
});

function InstallPage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/install",
          crumbLabel: "Install guide",
        })}
      />
      <GuidePage
        eyebrow="Install guide"
        title="Terminal autocomplete, installed in five minutes."
        intro="Easy Complete runs locally on Apple Silicon Macs. Install the app, approve one macOS permission, reload your shell, and start typing."
        hrefs={{ en: "/install", "zh-CN": "/zh/install" }}
      >
        <GuideCallout>
          <strong>Requirements:</strong> macOS 12 or later and an Apple Silicon
          Mac (M1 or newer). The published DMG is ARM64 only.
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>1. Install with Homebrew</h2>
        <p className={GUIDE_PARAGRAPH}>
          Install the signed and notarized app with one Homebrew command. The
          Easy Complete tap is added automatically:
        </p>
        <pre className={GUIDE_CODE}>
          brew install --cask chen86860/tap/easy-complete
        </pre>
        <p className={GUIDE_PARAGRAPH}>
          Prefer to install manually? Download the latest signed DMG, open it,
          and drag <strong className="text-[#d6dee8]">Easy Complete.app</strong>{" "}
          into your Applications folder.
        </p>
        <p className="mb-8">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex rounded-[10px] bg-(--accent) px-5 py-3 font-semibold text-[#06140a] transition hover:brightness-110"
          >
            Download the ARM64 DMG instead
          </a>
        </p>

        <h2 className={GUIDE_HEADING}>2. Launch Easy Complete</h2>
        <GuideList>
          <li>
            Open Easy Complete from{" "}
            <code className="font-mono text-[#cdd6e0]">/Applications</code>.
          </li>
          <li>
            The first launch installs the bundled CLI, shell integration, and
            terminal input method.
          </li>
          <li>
            Open Settings from the menu bar icon if you want Easy Complete to
            launch at login.
          </li>
        </GuideList>

        <h2 className={GUIDE_HEADING}>3. Grant Accessibility permission</h2>
        <p className={GUIDE_PARAGRAPH}>
          macOS Accessibility permission lets Easy Complete position the native
          suggestion window beside your terminal cursor. Approve Easy Complete
          at:
        </p>
        <pre className={GUIDE_CODE}>
          System Settings → Privacy &amp; Security → Accessibility
        </pre>
        <p className={GUIDE_PARAGRAPH}>
          If the prompt did not appear, trigger it again from Terminal:
        </p>
        <pre className={GUIDE_CODE}>ec debug prompt-accessibility</pre>

        <h2 className={GUIDE_HEADING}>4. Reload your shell</h2>
        <p className={GUIDE_PARAGRAPH}>
          Start a fresh shell session so zsh, bash, or fish can load the
          integration.
        </p>
        <pre className={GUIDE_CODE}>exec $SHELL</pre>

        <h2 className={GUIDE_HEADING}>5. Verify the installation</h2>
        <p className={GUIDE_PARAGRAPH}>
          Run the built-in doctor, then type a familiar command such as{" "}
          <code className="font-mono text-[#cdd6e0]">git</code> or{" "}
          <code className="font-mono text-[#cdd6e0]">npm</code>. Suggestions
          should appear beside the cursor.
        </p>
        <pre className={GUIDE_CODE}>ec doctor</pre>

        <h2 className={GUIDE_HEADING}>Build from source</h2>
        <p className={GUIDE_PARAGRAPH}>
          Developers can build the same app locally from the open-source
          repository:
        </p>
        <pre
          className={GUIDE_CODE}
        >{`git clone https://github.com/chen86860/easy-complete.git
cd easy-complete
./install.sh`}</pre>

        <RelatedGuides
          links={[
            {
              href: "/terminals/ghostty",
              label: "Ghostty setup",
              description: "How cursor tracking works in Ghostty.",
            },
            {
              href: "/troubleshooting",
              label: "Fix missing suggestions",
              description: "Check permissions, shell hooks, and integrations.",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
