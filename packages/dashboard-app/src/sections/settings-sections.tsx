import { type ReactNode, useState } from "react";
import { Native } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
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
const REPO_URL =
  "https://github.com/chen86860/amazon-q-developer-cli-autocomplete";
const RELEASES_URL = `${REPO_URL}/releases`;
const ISSUES_URL = `${REPO_URL}/issues/new/choose`;
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
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        "inline-flex cursor-pointer items-center gap-[6px] rounded-[9px] border border-[rgba(60,60,67,0.10)]",
        "bg-[rgba(255,255,255,0.6)] px-3 py-1.5 text-[12px] font-medium text-[rgba(0,0,0,0.72)]",
        "transition-colors hover:bg-[rgba(255,255,255,0.85)] disabled:cursor-default disabled:opacity-60",
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
        "inline-flex items-center gap-[6px] rounded-[9px] border border-[rgba(60,60,67,0.10)]",
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
          value={String(settings[SETTINGS.THEME] ?? "dark")}
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
            checked={Boolean(settings[SETTINGS.LAUNCH_ON_STARTUP] ?? true)}
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
            checked={Boolean(settings[SETTINGS.FUZZY_SEARCH])}
            onChange={(value) => set(SETTINGS.FUZZY_SEARCH, value)}
          />
        </Row>
        <Row label="Sort Order" description="Choose how suggestions are ranked">
          <Select
            value={String(settings[SETTINGS.SORT_METHOD] ?? "default")}
            options={[
              { value: "default", label: "By Relevance" },
              { value: "alphabetical", label: "Alphabetical" },
            ]}
            onChange={(value) => set(SETTINGS.SORT_METHOD, value)}
          />
        </Row>
        <Row
          label="Show Descriptive Suggestions"
          description="Use longer suggestion names when extra context is available"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.PREFER_VERBOSE_SUGGESTIONS])}
            onChange={(value) =>
              set(SETTINGS.PREFER_VERBOSE_SUGGESTIONS, value)
            }
          />
        </Row>
        <Row
          label="Keep Typed Text in the List"
          description="Keep your current input in the list even if nothing else matches"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN])}
            onChange={(value) =>
              set(SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN, value)
            }
          />
        </Row>
        <Row
          label="Use a Separate Description Window"
          description="Keep the description panel visible in its own detached window"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ALWAYS_SHOW_DESCRIPTION])}
            onChange={(value) => set(SETTINGS.ALWAYS_SHOW_DESCRIPTION, value)}
          />
        </Row>
        <Row
          label="Hide Auto-Run Suggestions"
          description="Remove suggestions that would immediately execute a command"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION])}
            onChange={(value) =>
              set(SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION, value)
            }
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
          label="Wrap Around List"
          description="Jump from the end of the suggestion list back to the beginning"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.SCROLL_WRAP_AROUND])}
            onChange={(value) => set(SETTINGS.SCROLL_WRAP_AROUND, value)}
          />
        </Row>
        <Row
          label="Insert Trailing Space"
          description="Add a space after accepting a suggestion"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.INSERT_SPACE_AUTOMATICALLY])}
            onChange={(value) =>
              set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, value)
            }
          />
        </Row>
        <Row
          label="Run After Trailing Space"
          description="Execute the command as soon as the accepted suggestion adds a space"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE])}
            onChange={(value) =>
              set(SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE, value)
            }
          />
        </Row>
      </Card>
    </>
  );
}

export function HistorySection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  return (
    <>
      <Card title="History Suggestions">
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
          label="Ctrl-R Toggle"
          description="Use Ctrl-R to toggle history-only mode"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.HISTORY_CTRL_R_TOGGLE])}
            onChange={(value) => set(SETTINGS.HISTORY_CTRL_R_TOGGLE, value)}
          />
        </Row>
        <Row
          label="Disable History Loading"
          description="Skip loading shell history on startup (faster launch)"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.DISABLE_HISTORY_LOADING])}
            onChange={(value) => set(SETTINGS.DISABLE_HISTORY_LOADING, value)}
          />
        </Row>
      </Card>

      <Card title="Custom History Command">
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

export function AdvancedSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  return (
    <>
      <Card title="Performance">
        <Row
          label="Script Timeout"
          description="Max milliseconds to wait for a completion generator to run"
          last
        >
          <NumberInput
            value={Number(settings[SETTINGS.SCRIPT_TIMEOUT] ?? 5000)}
            min={500}
            max={30000}
            step={500}
            onChange={(value) => set(SETTINGS.SCRIPT_TIMEOUT, value)}
          />
        </Row>
      </Card>

      <Card title="Dangerous Commands">
        <Row
          label="Immediately Run Dangerous Commands"
          description="Auto-execute suggestions marked as dangerous without confirmation"
        >
          <Toggle
            checked={Boolean(
              settings[SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS],
            )}
            onChange={(value) =>
              set(SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS, value)
            }
          />
        </Row>
        <Row
          label="Immediately Run Git Aliases"
          description="Auto-execute git alias suggestions"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.IMMEDIATELY_RUN_GIT_ALIAS])}
            onChange={(value) => set(SETTINGS.IMMEDIATELY_RUN_GIT_ALIAS, value)}
          />
        </Row>
      </Card>

      <Card title="Developer">
        <Row
          label="Developer Mode"
          description="Enable additional debug logging and dev tools"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.DEV_MODE])}
            onChange={(value) => set(SETTINGS.DEV_MODE, value)}
          />
        </Row>
      </Card>
    </>
  );
}

export function AboutSection() {
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
                <span className="rounded-full bg-[rgba(60,60,67,0.08)] px-2 py-0.5 font-medium text-[rgba(0,0,0,0.72)]">
                  Version {APP_VERSION}
                </span>
                {copyState === "done" ? <span>Copied</span> : null}
                {copyState === "error" ? <span>Copy failed</span> : null}
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
            <AboutActionButton
              icon={<IconCopy size={13} />}
              label="Copy Version Info"
              onClick={() => void copyVersionInfo()}
            />
          </div>
        </div>
      </Card>

      <Card title="Project">
        <Row
          label="GitHub Repository"
          description="Browse the source code, releases, and issue tracker"
        >
          <AboutLinkButton
            href={REPO_URL}
            label="Open GitHub"
            icon={<IconGitHub />}
          />
        </Row>
        <Row
          label="Release Notes"
          description="See what changed in recent versions"
        >
          <AboutLinkButton
            href={RELEASES_URL}
            label="View Releases"
            icon={<IconExternalLink />}
          />
        </Row>
        <Row
          label="Report an Issue"
          description="Open a bug report or feature request"
          last
        >
          <AboutLinkButton
            href={ISSUES_URL}
            label="Open Issue"
            icon={<IconExternalLink />}
          />
        </Row>
      </Card>

      <Card title="Credits">
        <Row
          label="Open-Source License"
          description="Easy Complete is available under the MIT and Apache 2.0 licenses"
        >
          <div className="flex flex-wrap gap-1.5 text-[11px] font-semibold tracking-[0.02em] text-[rgba(0,0,0,0.56)]">
            {["MIT", "Apache 2.0"].map((license) => (
              <span
                key={license}
                className="rounded-full bg-[rgba(60,60,67,0.08)] px-2.5 py-1"
              >
                {license}
              </span>
            ))}
          </div>
        </Row>
        <Row
          label="Amazon Q Developer CLI"
          description="Built on top of the open-source Amazon Q Developer CLI autocomplete project"
          last
        >
          <AboutLinkButton
            href={UPSTREAM_REPO_URL}
            label="View Upstream"
            icon={<IconExternalLink />}
          />
        </Row>
      </Card>
    </>
  );
}
