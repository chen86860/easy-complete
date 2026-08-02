import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteHeader } from "../components/SiteChrome.tsx";
import { GITHUB_URL } from "../data.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const PRIVACY_DESCRIPTION =
  "What anonymous usage data Easy Complete collects, what it never collects, and how to turn telemetry off.";

export const Route = createFileRoute("/privacy-policy")({
  head: () =>
    pageHead({
      title: "Privacy Policy — Easy Complete",
      description: PRIVACY_DESCRIPTION,
      path: "/privacy-policy",
    }),
  component: PrivacyPage,
});

const SECTION_HEADING =
  "m-0 mb-4 mt-12 text-[22px] font-bold tracking-[-.02em] text-[#e6edf3]";
const PARAGRAPH = "m-0 mb-4 text-[15px] leading-[1.7] text-[#9aa4b0]";
const CODE_INLINE =
  "rounded-md border border-[#232c36] bg-[#0d1219] px-[6px] py-[2px] font-mono text-[13px] text-[#cdd6e0]";

const EXAMPLE_EVENT = `{
  "event": "daily_heartbeat",
  "distinct_id": "fa7ebf5b-....-....",   // random UUID, no identity
  "timestamp": "2026-07-08T06:53:08Z",
  "properties": {
    "app_name": "Easy Complete",
    "app_version": "2.0.41",
    "os_version": "macOS 26.5.1",
    "shell": "zsh",
    "terminal": "ghostty",
    "count_autocomplete_shown": 142,     // daily totals only
    "count_autocomplete_accepted": 37
  }
}`;

const COLLECTED: Array<{ event: string; when: string; extra: string }> = [
  {
    event: "app_installed / app_updated",
    when: "First launch after a fresh install or an upgrade",
    extra: "Previous version (on update)",
  },
  {
    event: "app_opened",
    when: "Each time the desktop app starts",
    extra: "Whether it was a login-item launch or a manual open",
  },
  {
    event: "daily_heartbeat",
    when: "At most once every 24 hours while the app is running",
    extra:
      "Daily totals of how many times completions were shown and accepted — numbers only",
  },
  {
    event: "integration_installed",
    when: "When a shell/terminal integration is installed via the CLI",
    extra: "Which integration (dotfiles, ssh, input-method)",
  },
  {
    event: "app_uninstalled",
    when: "When the uninstall script runs",
    extra: "—",
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0d12] text-[#e6edf3]">
      <SeoJsonLd
        data={guideSchema({
          title: "Privacy Policy — Easy Complete",
          description: PRIVACY_DESCRIPTION,
          path: "/privacy-policy",
          crumbLabel: "Privacy Policy",
        })}
      />
      <SiteHeader active="docs" />

      <main className="mx-auto max-w-190 px-7 pb-24 pt-14">
        <nav
          aria-label="Breadcrumb"
          className="mb-10 font-mono text-xs text-[#65707d]"
        >
          <a href="/" className="transition-colors hover:text-(--accent)">
            Easy Complete
          </a>
          <span className="px-2">/</span>
          <a href="/docs" className="transition-colors hover:text-(--accent)">
            Docs
          </a>
          <span className="px-2">/</span>
          <span>Privacy Policy</span>
        </nav>
        <p className="mb-3 font-mono text-xs uppercase tracking-[.22em] text-(--accent)">
          Privacy Policy
        </p>
        <h1 className="m-0 mb-4 text-[36px] font-bold leading-[1.1] tracking-[-.03em]">
          Your commands never leave your Mac.
        </h1>
        <p className={PARAGRAPH}>
          Easy Complete's autocomplete engine runs entirely on-device: parsing
          your command line, generating suggestions, and rendering the overlay
          all happen locally, with no account and no cloud calls. Separately
          from that, the app collects a small set of{" "}
          <strong className="text-[#cdd6e0]">anonymous usage statistics</strong>{" "}
          so we know how many people use it and whether completions are useful.
          This page lists exactly what is sent, what is never sent, and how to
          turn it off.
        </p>

        <h2 className={SECTION_HEADING}>What we collect</h2>
        <p className={PARAGRAPH}>
          Every event carries the app version, macOS version, your login shell
          name (e.g. <code className={CODE_INLINE}>zsh</code>), the terminal app
          name when detectable, and a{" "}
          <strong className="text-[#cdd6e0]">random device ID</strong> — a UUID
          generated on first launch that is not derived from your hardware,
          username, or anything identifying, and resets if you reinstall.
        </p>
        <div className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d]">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#1c232d] bg-[#0d1219] font-mono text-[12.5px] uppercase tracking-wider text-[#6e7884]">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Extra data</th>
              </tr>
            </thead>
            <tbody>
              {COLLECTED.map((row) => (
                <tr
                  key={row.event}
                  className="border-b border-[#141a21] last:border-b-0"
                >
                  <td className="px-4 py-3 font-mono text-[13px] text-(--accent)">
                    {row.event}
                  </td>
                  <td className="px-4 py-3 leading-[1.55] text-[#9aa4b0]">
                    {row.when}
                  </td>
                  <td className="px-4 py-3 leading-[1.55] text-[#9aa4b0]">
                    {row.extra}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={PARAGRAPH}>
          Completion usage is aggregated locally into plain counters and
          reported once per day as totals. A heartbeat event looks like this —
          this is the complete payload, not an excerpt:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d] bg-[#0d1219] p-5 font-mono text-[13px] leading-[1.6] text-[#cdd6e0]">
          {EXAMPLE_EVENT}
        </pre>

        <h2 className={SECTION_HEADING}>What we never collect</h2>
        <ul className="m-0 mb-4 list-disc pl-5 text-[15px] leading-[1.8] text-[#9aa4b0]">
          <li>
            The commands you type, their arguments, or their output — command
            content has no code path into telemetry
          </li>
          <li>Completion suggestions shown to you, or which one you picked</li>
          <li>File paths, directory names, or environment variables</li>
          <li>Your username, hostname, email, or any account identifier</li>
        </ul>

        <h2 className={SECTION_HEADING}>Where the data goes</h2>
        <p className={PARAGRAPH}>
          Events are sent over HTTPS to our own analytics proxy and stored in{" "}
          <a
            href="https://posthog.com"
            className="text-(--accent) underline decoration-(--accent-line) underline-offset-4"
          >
            PostHog
          </a>
          . PostHog derives a coarse location (country/city) from the request IP
          at ingestion; the IP address itself is not stored on events. Data is
          used solely to understand aggregate usage of Easy Complete and is
          never sold or shared.
        </p>

        <h2 className={SECTION_HEADING}>Turning it off</h2>
        <p className={PARAGRAPH}>
          Telemetry is on by default and can be disabled at any time with a
          single command — the setting is respected by every event, including
          install and uninstall reporting:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d] bg-[#0d1219] p-5 font-mono text-[13px] leading-[1.6] text-[#cdd6e0]">
          {
            "ec telemetry disable   # turn off\nec telemetry status    # check current state"
          }
        </pre>

        <h2 className={SECTION_HEADING}>Questions</h2>
        <p className={PARAGRAPH}>
          The telemetry implementation is open source — you can audit exactly
          what is sent in the{" "}
          <a
            href={`${GITHUB_URL}/tree/main/crates/fig_telemetry`}
            className="text-(--accent) underline decoration-(--accent-line) underline-offset-4"
          >
            fig_telemetry crate
          </a>
          . For anything else, open an issue on{" "}
          <a
            href={GITHUB_URL}
            className="text-(--accent) underline decoration-(--accent-line) underline-offset-4"
          >
            GitHub
          </a>
          .
        </p>
        <p className="mt-10 font-mono text-[12.5px] text-[#5d6773]">
          Last updated: July 2026 · Applies to Easy Complete v2.0.41 and later
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
