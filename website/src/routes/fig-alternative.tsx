import { createFileRoute } from "@tanstack/react-router";
import {
  GUIDE_HEADING,
  GUIDE_PARAGRAPH,
  GuideCallout,
  GuideList,
  GuidePage,
  RelatedGuides,
} from "../components/GuidePage.tsx";
import { DOWNLOAD_URL } from "../download.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const TITLE = "Open-Source Fig Alternative for macOS — Easy Complete";
const DESCRIPTION =
  "Easy Complete is a free, open-source, fully local Fig-style terminal autocomplete app for zsh, bash, and fish on Apple Silicon Macs.";
const ALTERNATES = [
  { locale: "en" as const, path: "/fig-alternative" },
  { locale: "zh-CN" as const, path: "/zh/fig-alternative" },
];

export const Route = createFileRoute("/fig-alternative")({
  head: () =>
    pageHead({
      title: TITLE,
      description: DESCRIPTION,
      path: "/fig-alternative",
      alternates: ALTERNATES,
    }),
  component: FigAlternativePage,
});

function FigAlternativePage() {
  return (
    <>
      <SeoJsonLd
        data={guideSchema({
          title: TITLE,
          description: DESCRIPTION,
          path: "/fig-alternative",
          crumbLabel: "Fig alternative",
        })}
      />
      <GuidePage
        eyebrow="Fig alternative"
        title="The autocomplete workflow, without the assistant around it."
        intro="Easy Complete is a focused, open-source terminal completion engine for people who liked Fig-style suggestions and want a local macOS tool dedicated to autocomplete."
      >
        <GuideCallout>
          Easy Complete is an independent open-source project. Fig and Amazon Q
          are trademarks of their respective owners; no affiliation is implied.
        </GuideCallout>

        <h2 className={GUIDE_HEADING}>What Easy Complete keeps</h2>
        <GuideList>
          <li>
            IDE-style suggestions for flags, subcommands, arguments, and paths.
          </li>
          <li>A native popup positioned beside the active terminal cursor.</li>
          <li>Completion specifications for hundreds of popular CLIs.</li>
          <li>
            Support for zsh, bash, fish, standalone terminals, and IDE
            terminals.
          </li>
        </GuideList>

        <h2 className={GUIDE_HEADING}>What it deliberately leaves out</h2>
        <p className={GUIDE_PARAGRAPH}>
          Easy Complete is not a chat product or a cloud coding assistant.
          Completion generation stays on your Mac, requires no account, and
          makes no AI requests. Anonymous product counters can be disabled at
          any time.
        </p>

        <div className="my-9 overflow-x-auto rounded-[14px] border border-[#1c232d]">
          <table className="w-full min-w-155 border-collapse text-left text-sm">
            <thead className="border-b border-[#1c232d] bg-[#0d1219] font-mono text-xs uppercase tracking-wider text-[#65707d]">
              <tr>
                <th className="px-5 py-4">Capability</th>
                <th className="px-5 py-4">Easy Complete</th>
              </tr>
            </thead>
            <tbody className="text-[#9aa4b0]">
              {[
                ["Autocomplete engine", "Local, native macOS app"],
                ["Cloud account", "Not required"],
                ["AI or cloud completions", "None"],
                ["Source code", "Open source"],
                ["Published build", "Apple Silicon / ARM64"],
                ["License", "MIT"],
              ].map(([label, value]) => (
                <tr
                  key={label}
                  className="border-b border-[#141a21] last:border-b-0"
                >
                  <th className="px-5 py-4 font-medium text-[#cdd6e0]">
                    {label}
                  </th>
                  <td className="px-5 py-4">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={GUIDE_HEADING}>Who it is for</h2>
        <p className={GUIDE_PARAGRAPH}>
          Easy Complete is a good fit if you want structured command
          suggestions, prefer local software, use an Apple Silicon Mac, and do
          not need a terminal chat assistant bundled with autocomplete.
        </p>
        <p>
          <a
            href={DOWNLOAD_URL}
            className="inline-flex rounded-[10px] bg-(--accent) px-5 py-3 font-semibold text-[#06140a] transition hover:brightness-110"
          >
            Try Easy Complete for free
          </a>
        </p>

        <RelatedGuides
          links={[
            {
              href: "/install",
              label: "Install Easy Complete",
              description: "Get the ARM64 app running on macOS.",
            },
            {
              href: "/terminals/ghostty",
              label: "Use it with Ghostty",
              description: "Set up accurate cursor tracking.",
            },
          ]}
        />
      </GuidePage>
    </>
  );
}
