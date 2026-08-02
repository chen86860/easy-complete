import { Fragment, type ReactNode } from "react";
import {
  GUIDE_CODE,
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "./GuidePage.tsx";
import { INTEGRATION_LABEL } from "../data.ts";
import type { TerminalGuide } from "../terminalGuides.ts";
import { terminalGuides } from "../terminalGuides.ts";

/** Renders `backticked` spans as inline code so guide copy can stay plain data. */
function inlineCode(text: string): ReactNode {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="font-mono text-[#cdd6e0]">
        {part}
      </code>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    )
  );
}

const TRACKING_EXPLAINER: Record<TerminalGuide["integration"], string> = {
  "input-method": "Bundled macOS input method, registered during installation",
  xterm: "xterm.js caret detection inside the Electron host",
  accessibility: "macOS Accessibility API",
};

function FactRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 px-5 py-3.5 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:gap-5">
      <span className="font-mono text-[11px] uppercase tracking-wider text-[#65707d]">
        {label}
      </span>
      <span className="min-w-0 text-sm leading-[1.6] text-[#cdd6e0]">
        {children}
      </span>
    </div>
  );
}

export function TerminalGuidePage({ guide }: { guide: TerminalGuide }) {
  const related = terminalGuides
    .filter((other) => other.slug !== guide.slug)
    .filter((other) => other.integration === guide.integration)
    .slice(0, 1);

  return (
    <GuidePage eyebrow={guide.eyebrow} title={guide.heading} intro={guide.intro}>
      <GuideCallout>{inlineCode(guide.callout)}</GuideCallout>

      <div className="mb-10 divide-y divide-[#1c232d] overflow-hidden rounded-[14px] border border-[#1c232d] bg-[#0d1219]">
        <FactRow label="Cursor tracking">
          {INTEGRATION_LABEL[guide.integration]} —{" "}
          {TRACKING_EXPLAINER[guide.integration]}
        </FactRow>
        <FactRow label="Bundle ID">
          <code className="font-mono">{guide.bundleId}</code>
        </FactRow>
        <FactRow label="Process names">
          <code className="font-mono">{guide.processNames.join(" · ")}</code>
        </FactRow>
        <FactRow label="Requirements">
          macOS 12 or later, Apple Silicon (ARM64)
        </FactRow>
      </div>

      {guide.sections.map((section) => (
        <section key={section.heading}>
          <h2 className={GUIDE_HEADING}>{section.heading}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className={GUIDE_PARAGRAPH}>
              {inlineCode(paragraph)}
            </p>
          ))}
          {section.code && <pre className={GUIDE_CODE}>{section.code}</pre>}
        </section>
      ))}

      <h2 className={GUIDE_HEADING}>Keyboard controls</h2>
      <GuideList>
        <li>
          <code className="font-mono text-[#cdd6e0]">↑ / ↓</code> moves through
          suggestions.
        </li>
        <li>
          <code className="font-mono text-[#cdd6e0]">Tab / →</code> accepts the
          highlighted suggestion.
        </li>
        <li>
          <code className="font-mono text-[#cdd6e0]">Esc</code> dismisses the
          popup.
        </li>
      </GuideList>

      <RelatedGuides
        links={[
          {
            href: "/docs#terminals",
            label: "All supported terminals",
            description:
              "The full matrix of cursor-tracking paths, terminal by terminal.",
          },
          ...related.map((other) => ({
            href: `/terminals/${other.slug}`,
            label: `${other.name} autocomplete`,
            description: other.callout.replace(/`/g, "").slice(0, 96) + "…",
          })),
          {
            href: "/troubleshooting",
            label: "Troubleshooting",
            description: "Diagnose permissions, shell hooks, and integrations.",
          },
        ].slice(0, 4)}
      />
    </GuidePage>
  );
}
