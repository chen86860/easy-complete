import { createFileRoute } from "@tanstack/react-router";
import { MAIN_ID, SiteFooter, SiteHeader } from "../components/SiteChrome.tsx";
import { GITHUB_URL } from "../data.ts";
import { SeoJsonLd, guideSchema, pageHead } from "../seo.tsx";

const PRIVACY_DESCRIPTION =
  "What anonymous usage data Easy Complete collects, every network request the app can make, what stays on your Mac, and how to turn each one off.";

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
  "m-0 mb-4 mt-12 text-[22px] font-semibold tracking-[-.02em] text-[#e6edf3]";
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
    "locale": "en-US",
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
    event: "first_terminal_session / first_autocomplete_shown / first_autocomplete_accepted",
    when: "Once per install: the first time a terminal connects, a suggestion appears, and a suggestion is accepted",
    extra: "—",
  },
  {
    event:
      "onboarding_shell_integration_ready / onboarding_accessibility_granted / onboarding_install_failed",
    when: "Once per install when a setup step succeeds; the failure event each time a shell integration install fails",
    extra: "Which component failed (on failure)",
  },
  {
    event:
      "autocomplete_webview_created / autocomplete_webview_mounted / autocomplete_preloaded_specs_ready",
    when: "When the completion overlay is built, finishes loading, and finishes preloading specs",
    extra: "How long that took, in milliseconds",
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

const NETWORK_REQUESTS: Array<{ source: string; target: string; off: string }> =
  [
    {
      source: "Usage statistics",
      target:
        "ana.emmmm.dev (our PostHog proxy) — the events listed above, nothing else",
      off: "ec telemetry disable",
    },
    {
      source: "Update checks",
      target:
        "github.com — the appcast.xml release feed, and the new build when one is installed",
      off: "ec settings app.disableAutoupdates true",
    },
    {
      source: "Dynamic completions",
      target:
        "A few completion specs look up live data while you type. The npm, pnpm, yarn, bun, ni and similar specs send the package name you are typing to api.npms.io and registry.npmjs.org; cargo sends it to crates.io. This happens before you press Enter, and a private registry setting does not redirect it",
      off: `ec settings autocomplete.disableForCommands '["pnpm","npm"]'`,
    },
    {
      source: "CLIs you already use",
      target:
        "Some suggestions come from running the tool itself (for example gh or kubectl), which talks to its own server with your existing credentials",
      off: "autocomplete.disableForCommands, as above",
    },
    {
      source: "ec issue",
      target:
        "Opens a GitHub issue form in your browser, pre-filled with diagnostics: app and macOS versions, hardware, shell, terminal and which ec doctor checks pass, with your username masked. Nothing is posted until you submit it",
      off: "Only runs when you invoke it",
    },
  ];

function PrivacyPage() {
  return (
    <div className="min-h-dvh bg-[#0a0d12] text-[#e6edf3]">
      <SeoJsonLd
        data={guideSchema({
          title: "Privacy Policy — Easy Complete",
          description: PRIVACY_DESCRIPTION,
          path: "/privacy-policy",
          crumbLabel: "Privacy Policy",
        })}
      />
      <SiteHeader active="docs" />

      <main id={MAIN_ID} className="mx-auto max-w-190 px-7 pb-24 pt-14">
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
        <p className="mb-3 font-mono text-xs text-(--accent)">Privacy Policy</p>
        <h1 className="m-0 mb-4 text-[36px] font-semibold leading-[1.1] tracking-[-.03em]">
          What leaves your Mac, and what doesn't.
        </h1>
        <p className={PARAGRAPH}>
          Easy Complete's autocomplete engine runs on-device: parsing your
          command line, generating suggestions, and rendering the overlay all
          happen locally, with no account and no AI requests. The app collects a
          small set of{" "}
          <strong className="text-[#cdd6e0]">anonymous usage statistics</strong>
          , checks for updates, and a few completion specs look up live data
          over the network. This page lists every one of those requests, what
          stays on your Mac, and how to turn each one off.
        </p>

        <h2 className={SECTION_HEADING}>What we collect</h2>
        <p className={PARAGRAPH}>
          Every event carries the app version, macOS version, your login shell
          name (e.g. <code className={CODE_INLINE}>zsh</code>), the terminal app
          name when detectable, your macOS language setting (e.g.{" "}
          <code className={CODE_INLINE}>en-US</code>), and a{" "}
          <strong className="text-[#cdd6e0]">random device ID</strong> — a UUID
          generated on first launch that is not derived from your hardware,
          username, or anything identifying, and resets if you reinstall.
        </p>
        <div className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d]">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#1c232d] bg-[#0d1219] font-mono text-[12.5px] text-[#6e7884]">
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
          Telemetry and automatic update checks are on by default. Turn them off
          from the About page in the dashboard, or from the CLI. Both settings
          apply to the running app straight away, with no restart, and telemetry
          is respected by every event, including install and uninstall
          reporting:
        </p>
        <pre className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d] bg-[#0d1219] p-5 font-mono text-[13px] leading-[1.6] text-[#cdd6e0]">
          {
            "ec telemetry disable                       # stop usage statistics\nec settings app.disableAutoupdates true    # stop update checks\nec telemetry status                        # check current state"
          }
        </pre>

        <h2 className={SECTION_HEADING}>Every network request</h2>
        <p className={PARAGRAPH}>
          Usage statistics are only one of the ways the app can reach the
          network. There is currently no single switch that turns all of them
          off. If package names or internal hostnames must never leave your
          machine, disable completions for the affected commands or block
          outbound traffic for the app and the processes it starts.
        </p>
        <div className="mb-4 overflow-x-auto rounded-[14px] border border-[#1c232d]">
          <table className="w-full border-collapse text-left text-[14px]">
            <thead>
              <tr className="border-b border-[#1c232d] bg-[#0d1219] font-mono text-[12.5px] uppercase tracking-wider text-[#6e7884]">
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">What is contacted</th>
                <th className="px-4 py-3 font-medium">How to turn off</th>
              </tr>
            </thead>
            <tbody>
              {NETWORK_REQUESTS.map((row) => (
                <tr
                  key={row.source}
                  className="border-b border-[#141a21] last:border-b-0"
                >
                  <td className="px-4 py-3 font-mono text-[13px] text-(--accent)">
                    {row.source}
                  </td>
                  <td className="px-4 py-3 leading-[1.55] text-[#9aa4b0]">
                    {row.target}
                  </td>
                  <td className="px-4 py-3 font-mono text-[12.5px] leading-[1.55] text-[#9aa4b0]">
                    {row.off}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={SECTION_HEADING}>What stays on your Mac</h2>
        <p className={PARAGRAPH}>
          Easy Complete keeps no record of the commands you run. History
          suggestions read your shell's own history (zsh, bash or fish, or the
          command you set as the history source) when they are needed, so your
          shell's settings decide what is in it, including skipping commands
          that start with a space. Versions before v2.6.0 also stored every
          command; the app deletes those records when it starts.
        </p>
        <p className={PARAGRAPH}>What the app does keep, all of it local:</p>
        <ul className="m-0 mb-4 list-disc pl-5 text-[15px] leading-[1.8] text-[#9aa4b0]">
          <li>
            <code className={CODE_INLINE}>
              ~/Library/Application Support/easy-complete/data.sqlite3
            </code>
            : the random device ID used for usage statistics, today&apos;s
            completion counts until they are sent, and setup state such as the
            last version that ran and whether Accessibility is granted. It holds
            no commands, and only your user account can read it.
          </li>
          <li>
            <code className={CODE_INLINE}>settings.json</code> in the same
            folder: your settings.
          </li>
          <li>
            Diagnostic logs in your user&apos;s temporary folder. They hold
            errors only unless you raise the level with{" "}
            <code className={CODE_INLINE}>Q_LOG_LEVEL</code>, and only your user
            account can read them.
          </li>
        </ul>
        <p className={PARAGRAPH}>
          None of it is uploaded, and{" "}
          <code className={CODE_INLINE}>ec uninstall</code> removes all of it.
        </p>

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
          Last updated: November 2026 · Applies to Easy Complete v2.6.0 and
          later
        </p>
      </main>

      <SiteFooter />
    </div>
  );
}
