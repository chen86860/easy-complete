import { type ReactNode, useState } from "react";
import { Native } from "@easy-complete/api-bindings";
import {
  getDefaultSetting,
  SETTINGS,
} from "@easy-complete/api-bindings-wrappers";
import clsx from "clsx";
import type { SettingSetter, SettingsMap } from "../types";
import { AppLogo } from "../components/app-logo";
import { NumberInput, Select, TextInput, Toggle } from "../components/controls";
import {
  IconCopy,
  IconExternalLink,
  IconGitHub,
  IconUpdate,
} from "../components/icons";
import { Card, Row } from "../components/settings-layout";
import { ThemePicker } from "../components/theme-picker";
import { useCheckForUpdates } from "../hooks/use-check-for-updates";

const APP_VERSION = __APP_VERSION__;
const REPO_URL = "https://github.com/chen86860/easy-complete";
const RELEASES_URL = `${REPO_URL}/releases`;
const ISSUES_URL = `${REPO_URL}/issues`;
const PRIVACY_URL = "https://easy-complete.emmmm.dev/privacy";
const UPSTREAM_REPO_URL = "https://github.com/aws/amazon-q-developer-cli";

async function openExternalUrl(url: string) {
  try {
    await Native.open(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function AboutActionButton({
  icon,
  label,
  onClick,
  disabled,
  className,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex cursor-pointer items-center gap-[6px] whitespace-nowrap rounded-[9px] border border-[rgba(60,60,67,0.10)]",
        "bg-[rgba(255,255,255,0.6)] px-3 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.72)]",
        "transition-colors hover:bg-[rgba(255,255,255,0.85)] disabled:cursor-default disabled:opacity-60",
        className,
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function AboutLinkButton({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        void openExternalUrl(href);
      }}
      className={clsx(
        "inline-flex shrink-0 items-center gap-[6px] whitespace-nowrap rounded-[9px] border border-[rgba(60,60,67,0.10)]",
        "bg-[rgba(255,255,255,0.6)] px-3 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.72)] no-underline",
        "transition-colors hover:bg-[rgba(255,255,255,0.85)]",
      )}
    >
      {icon}
      {label}
    </a>
  );
}

export function AppearanceSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  return (
    <>
      <Card title="Theme">
        <ThemePicker
          value={String(settings[SETTINGS.THEME] ?? "github-dark")}
          onChange={(value) => set(SETTINGS.THEME, value)}
        />
      </Card>

      <Card title="Typography">
        <Row
          label="Font Family"
          description="Font used in the autocomplete popup"
        >
          <TextInput
            value={String(settings[SETTINGS.FONT_FAMILY] ?? "")}
            placeholder="System default"
            onChange={(value) => set(SETTINGS.FONT_FAMILY, value || null)}
          />
        </Row>
        <Row label="Font Size" description="Popup font size in pixels" last>
          <NumberInput
            value={Number(settings[SETTINGS.FONT_SIZE] ?? 13)}
            min={10}
            max={24}
            onChange={(value) => set(SETTINGS.FONT_SIZE, value)}
          />
        </Row>
      </Card>

      <Card title="Dimensions">
        <Row label="Max Width" description="Maximum popup width in pixels">
          <NumberInput
            value={Number(settings[SETTINGS.WIDTH] ?? 300)}
            min={150}
            max={800}
            step={10}
            onChange={(value) => set(SETTINGS.WIDTH, value)}
          />
        </Row>
        <Row
          label="Max Height"
          description="Maximum popup height in pixels"
          last
        >
          <NumberInput
            value={Number(settings[SETTINGS.HEIGHT] ?? 140)}
            min={80}
            max={600}
            step={10}
            onChange={(value) => set(SETTINGS.HEIGHT, value)}
          />
        </Row>
      </Card>
    </>
  );
}

export function BehaviorSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  return (
    <>
      <Card title="Startup & Trigger">
        <Row
          label="Launch at Login"
          description="Start Easy Complete automatically when you sign in"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.LAUNCH_ON_STARTUP] ?? false)}
            onChange={(value) => set(SETTINGS.LAUNCH_ON_STARTUP, value)}
          />
        </Row>
        <Row
          label="Show Suggestions After Tab"
          description="Wait until you press Tab before opening the suggestion popup"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ONLY_SHOW_ON_TAB])}
            onChange={(value) => set(SETTINGS.ONLY_SHOW_ON_TAB, value)}
          />
        </Row>
      </Card>

      <Card title="Suggestions">
        <Row
          label="Fuzzy Matching"
          description="Match close character sequences instead of exact prefixes"
        >
          <Toggle
            checked={Boolean(
              settings[SETTINGS.FUZZY_SEARCH] ??
                getDefaultSetting(SETTINGS.FUZZY_SEARCH),
            )}
            onChange={(value) => set(SETTINGS.FUZZY_SEARCH, value)}
          />
        </Row>
        <Row
          label="Sort Order"
          description="Choose how suggestions are ranked"
          last
        >
          <Select
            value={String(settings[SETTINGS.SORT_METHOD] ?? "default")}
            options={[
              { value: "default", label: "By Relevance" },
              { value: "alphabetical", label: "Alphabetical" },
            ]}
            onChange={(value) => set(SETTINGS.SORT_METHOD, value)}
          />
        </Row>
      </Card>

      <Card title="Keyboard & Insertion">
        <Row
          label="Use Up Arrow for History"
          description="Let Up Arrow switch from suggestions into shell history navigation"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.NAVIGATE_TO_HISTORY])}
            onChange={(value) => set(SETTINGS.NAVIGATE_TO_HISTORY, value)}
          />
        </Row>
        <Row
          label="Insert Trailing Space"
          description="Add a space after accepting a suggestion"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.INSERT_SPACE_AUTOMATICALLY])}
            onChange={(value) =>
              set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, value)
            }
          />
        </Row>
      </Card>

      <Card title="History">
        <Row
          label="History Mode"
          description="How shell history is blended with completions"
        >
          <Select
            value={String(settings[SETTINGS.HISTORY_MODE] ?? "show")}
            options={[
              { value: "show", label: "Show with completions" },
              { value: "history_only", label: "History only" },
              { value: "off", label: "Off" },
            ]}
            onChange={(value) => set(SETTINGS.HISTORY_MODE, value)}
          />
        </Row>
        <Row
          label="Merge All Shells"
          description="Include history from all shells (bash, zsh, fish)"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.HISTORY_MERGE_SHELLS])}
            onChange={(value) => set(SETTINGS.HISTORY_MERGE_SHELLS, value)}
          />
        </Row>
        <Row
          label="History Command"
          description="Shell command to use as the history source (leave empty for default)"
          last
        >
          <TextInput
            value={String(settings[SETTINGS.HISTORY_COMMAND] ?? "")}
            placeholder="e.g. atuin search"
            onChange={(value) => set(SETTINGS.HISTORY_COMMAND, value || null)}
          />
        </Row>
      </Card>
    </>
  );
}

const DOCTOR_COMMAND = "ec doctor";

function DiagnosticsCard() {
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(DOCTOR_COMMAND);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  return (
    <Card title="Troubleshooting">
      <div className="px-[18px] py-3.5">
        <div className="text-[14px] font-medium leading-[1.35] text-[#050505]">
          Something not working?
        </div>
        <div className="mt-1 max-w-[36rem] text-[12px] leading-[1.5] text-[rgba(60,60,67,0.68)]">
          Run the built-in diagnostic in your terminal — it checks your shell
          integration, permissions, and background processes, and tells you how
          to fix any issues.
        </div>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 select-text rounded-[9px] border border-[rgba(60,60,67,0.10)] bg-[rgba(0,0,0,0.04)] px-3 py-2 font-mono text-[12.5px] text-[rgba(0,0,0,0.82)]">
            <span className="mr-1.5 text-[rgba(60,60,67,0.5)]">$</span>
            {DOCTOR_COMMAND}
          </code>
          <AboutActionButton
            className="w-[92px] justify-center"
            icon={copyState === "done" ? null : <IconCopy size={13} />}
            label={
              copyState === "done"
                ? "Copied!"
                : copyState === "error"
                  ? "Failed"
                  : "Copy"
            }
            onClick={() => void copyCommand()}
          />
        </div>
        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[rgba(60,60,67,0.08)] pt-3.5">
          <div className="min-w-0 flex-1 text-[12px] leading-[1.5] text-[rgba(60,60,67,0.68)]">
            Still stuck? Include the diagnostic output in your report.
          </div>
          <AboutLinkButton
            href={ISSUES_URL}
            label="Report an Issue"
            icon={<IconExternalLink />}
          />
        </div>
      </div>
    </Card>
  );
}

export function AboutSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  const { isChecking, check: checkForUpdates } = useCheckForUpdates();
  const [copyState, setCopyState] = useState<"idle" | "done" | "error">("idle");

  const versionLabel = `Easy Complete ${APP_VERSION}`;

  async function copyVersionInfo() {
    try {
      await navigator.clipboard.writeText(versionLabel);
      setCopyState("done");
      window.setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1500);
    }
  }

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <AppLogo size={52} />
            <div className="min-w-0">
              <div className="text-[21px] font-bold tracking-[-0.03em] text-black">
                Easy Complete
              </div>
              <div className="mt-0.5 text-[13px] text-[rgba(60,60,67,0.68)]">
                Terminal autocomplete for macOS
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[rgba(60,60,67,0.68)]">
                <button
                  onClick={() => void copyVersionInfo()}
                  title="Copy version info"
                  className="cursor-pointer rounded-full border-0 bg-[rgba(60,60,67,0.08)] px-2 py-0.5 font-sans text-[12px] font-medium text-[rgba(0,0,0,0.72)] transition-colors hover:bg-[rgba(60,60,67,0.14)]"
                >
                  {copyState === "done"
                    ? "Copied"
                    : copyState === "error"
                      ? "Copy failed"
                      : `Version ${APP_VERSION}`}
                </button>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <AboutActionButton
              icon={
                <span className={clsx(isChecking && "animate-spin")}>
                  <IconUpdate size={13} />
                </span>
              }
              label="Check for Updates"
              onClick={() => void checkForUpdates()}
              disabled={isChecking}
            />
          </div>
        </div>
      </Card>

      <Card title="Updates">
        <Row
          label="Check for Updates Automatically"
          description="Notify when a new version is available"
          last
        >
          <Toggle
            checked={!(settings[SETTINGS.DISABLE_AUTO_UPDATES] ?? false)}
            onChange={(value) => set(SETTINGS.DISABLE_AUTO_UPDATES, !value)}
          />
        </Row>
      </Card>

      <DiagnosticsCard />

      <Card title="Privacy">
        <Row
          label="Share Anonymous Usage Data"
          description="Anonymous statistics only, never commands or personal data"
        >
          <Toggle
            checked={
              (settings[SETTINGS.TELEMETRY_ENABLED] as boolean | undefined) ??
              true
            }
            onChange={(value) => set(SETTINGS.TELEMETRY_ENABLED, value)}
          />
        </Row>
        <Row
          label="Privacy Policy"
          description="See what's collected and how to opt out"
          last
        >
          <AboutLinkButton
            href={PRIVACY_URL}
            label="View Policy"
            icon={<IconExternalLink />}
          />
        </Row>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <AboutLinkButton href={REPO_URL} label="GitHub" icon={<IconGitHub />} />
        <AboutLinkButton
          href={RELEASES_URL}
          label="Release Notes"
          icon={<IconExternalLink />}
        />
      </div>
      <p className="mt-3 text-center text-[11px] leading-[1.5] text-[rgba(60,60,67,0.55)]">
        Open source under the MIT and Apache 2.0 licenses · Based on the{" "}
        <a
          href={UPSTREAM_REPO_URL}
          onClick={(event) => {
            event.preventDefault();
            void openExternalUrl(UPSTREAM_REPO_URL);
          }}
          className="text-[rgba(60,60,67,0.55)] underline"
        >
          Amazon Q Developer CLI
        </a>
      </p>
    </>
  );
}
