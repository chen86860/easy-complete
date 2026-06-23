import { Native } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import clsx from "clsx";
import type { SettingSetter, SettingsMap } from "../types";
import { AppLogo } from "../components/app-logo";
import { NumberInput, Select, TextInput, Toggle } from "../components/controls";
import { IconExternalLink, IconGitHub, IconUpdate } from "../components/icons";
import { Card, Row } from "../components/settings-layout";
import { ThemePicker } from "../components/theme-picker";
import { useCheckForUpdates } from "../hooks/use-check-for-updates";

const APP_VERSION = __APP_VERSION__;
const REPO_URL =
  "https://github.com/chen86860/amazon-q-developer-cli-autocomplete";
const UPSTREAM_REPO_URL = "https://github.com/aws/amazon-q-developer-cli";

async function openExternalUrl(url: string) {
  try {
    await Native.open(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
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
      <Card title="Application">
        <Row
          label="Launch at Login"
          description="Start Easy Complete automatically when you sign in"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.LAUNCH_ON_STARTUP] ?? true)}
            onChange={(value) => set(SETTINGS.LAUNCH_ON_STARTUP, value)}
          />
        </Row>
      </Card>

      <Card title="Filtering">
        <Row
          label="Fuzzy Search"
          description="Match suggestions by fuzzy character matching"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.FUZZY_SEARCH])}
            onChange={(value) => set(SETTINGS.FUZZY_SEARCH, value)}
          />
        </Row>
        <Row label="Sort Method" description="How to order suggestions">
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
          label="Prefer Verbose Suggestions"
          description="Show the longer form of suggestion names when available"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.PREFER_VERBOSE_SUGGESTIONS])}
            onChange={(value) =>
              set(SETTINGS.PREFER_VERBOSE_SUGGESTIONS, value)
            }
          />
        </Row>
        <Row
          label="Always Suggest Current Token"
          description="Keep the current typed text as a suggestion"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN])}
            onChange={(value) =>
              set(SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN, value)
            }
          />
        </Row>
      </Card>

      <Card title="Trigger">
        <Row
          label="Only Show on Tab"
          description="Suppress popup until Tab is pressed"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ONLY_SHOW_ON_TAB])}
            onChange={(value) => set(SETTINGS.ONLY_SHOW_ON_TAB, value)}
          />
        </Row>
        <Row
          label="Navigate to History with ↑"
          description="Up-arrow enters shell history navigation mode"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.NAVIGATE_TO_HISTORY])}
            onChange={(value) => set(SETTINGS.NAVIGATE_TO_HISTORY, value)}
          />
        </Row>
      </Card>

      <Card title="Insertion">
        <Row
          label="Insert Space Automatically"
          description="Append a space after inserting a suggestion"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.INSERT_SPACE_AUTOMATICALLY])}
            onChange={(value) =>
              set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, value)
            }
          />
        </Row>
        <Row
          label="Immediately Execute After Space"
          description="Run command immediately when a space is inserted after a suggestion"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE])}
            onChange={(value) =>
              set(SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE, value)
            }
          />
        </Row>
        <Row
          label="Scroll Wrap Around"
          description="Wrap selection from bottom to top of the list"
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.SCROLL_WRAP_AROUND])}
            onChange={(value) => set(SETTINGS.SCROLL_WRAP_AROUND, value)}
          />
        </Row>
      </Card>

      <Card title="Description Panel">
        <Row
          label="Always Show Description"
          description="Display the description panel in a detached popout window"
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ALWAYS_SHOW_DESCRIPTION])}
            onChange={(value) => set(SETTINGS.ALWAYS_SHOW_DESCRIPTION, value)}
          />
        </Row>
        <Row
          label="Hide Auto-Execute Suggestion"
          description="Hide suggestions that would auto-execute a command"
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

const UPDATE_STATUS_LABEL: Record<string, string> = {
  idle: "Check for Updates",
  checking: "Checking…",
  "up-to-date": "Up to Date",
  available: "Update Available",
};

export function AboutSection() {
  const { status: updateStatus, check: checkForUpdates } = useCheckForUpdates();

  return (
    <>
      <Card title="Application">
        <div className="flex flex-col items-center gap-3 px-4 pb-7 pt-8">
          <AppLogo size={72} />
          <div className="mt-1 text-center">
            <div className="text-xl font-bold text-black">Easy Complete</div>
            <div className="mt-1 text-[13px] text-[#8e8e93]">
              macOS Terminal Autocomplete
            </div>
            <div className="mt-2.5 inline-block rounded-md bg-[color-mix(in_srgb,var(--dashboard-accent-color,AccentColor)_12%,transparent)] px-2.5 py-[3px] text-[12px] font-semibold tracking-[0.02em] text-[var(--dashboard-accent-color,AccentColor)]">
              v{APP_VERSION}
            </div>
          </div>
          <button
            onClick={() => void checkForUpdates()}
            disabled={updateStatus === "checking"}
            className={clsx(
              "mt-1 inline-flex cursor-pointer items-center gap-[6px] rounded-[8px] border-0 px-3 py-1.5",
              "text-[13px] font-medium transition-colors",
              "disabled:cursor-default disabled:opacity-60",
              updateStatus === "available"
                ? "bg-[color-mix(in_srgb,var(--dashboard-accent-color,AccentColor)_12%,transparent)] text-[var(--dashboard-accent-color,AccentColor)]"
                : updateStatus === "up-to-date"
                  ? "bg-[rgba(52,199,89,0.1)] text-[#34c759]"
                  : "bg-[rgba(60,60,67,0.08)] text-[rgba(0,0,0,0.65)] hover:bg-[rgba(60,60,67,0.12)]",
            )}
          >
            <span
              className={clsx(updateStatus === "checking" && "animate-spin")}
            >
              <IconUpdate size={13} />
            </span>
            {UPDATE_STATUS_LABEL[updateStatus] ?? "Check for Updates"}
          </button>
        </div>
      </Card>

      <Card title="Project">
        <Row
          label="GitHub Repository"
          description="Source code and issue tracker"
        >
          <a
            href={REPO_URL}
            onClick={(event) => {
              event.preventDefault();
              void openExternalUrl(REPO_URL);
            }}
            className="inline-flex items-center gap-[5px] rounded-[7px] bg-[color-mix(in_srgb,var(--dashboard-accent-color,AccentColor)_9%,transparent)] px-2.5 py-1 text-[13px] font-medium text-[var(--dashboard-accent-color,AccentColor)] no-underline"
          >
            <IconGitHub />
            View on GitHub
          </a>
        </Row>
        <Row label="Version" description="Current application version" last>
          <span className="text-[13px] tabular-nums text-[#8e8e93]">
            {APP_VERSION}
          </span>
        </Row>
      </Card>

      <Card title="License">
        <Row
          label="Open Source"
          description="Licensed under MIT and Apache 2.0"
          last
        >
          <div className="flex gap-1.5">
            {["MIT", "Apache 2.0"].map((license) => (
              <span
                key={license}
                className="rounded-[5px] bg-[rgba(52,199,89,0.1)] px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-[#34c759]"
              >
                {license}
              </span>
            ))}
          </div>
        </Row>
      </Card>

      <Card title="Based On">
        <Row
          label="Amazon Q Developer CLI"
          description="Fork of the open-source Amazon Q Developer CLI autocomplete"
          last
        >
          <a
            href={UPSTREAM_REPO_URL}
            onClick={(event) => {
              event.preventDefault();
              void openExternalUrl(UPSTREAM_REPO_URL);
            }}
          >
            <IconExternalLink />
          </a>
        </Row>
      </Card>
    </>
  );
}
