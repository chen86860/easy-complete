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
import { type LocalePreference, useI18n } from "../i18n";

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
  const { localePreference, setLocalePreference, t } = useI18n();

  return (
    <>
      <Card title={t("appearance.language")}>
        <Row
          label={t("appearance.displayLanguage")}
          description={t("appearance.displayLanguageDescription")}
          last
        >
          <Select
            value={localePreference}
            options={[
              { value: "system", label: t("appearance.followSystem") },
              { value: "en", label: t("appearance.english") },
              { value: "zh-CN", label: t("appearance.simplifiedChinese") },
            ]}
            onChange={(value) => setLocalePreference(value as LocalePreference)}
          />
        </Row>
      </Card>

      <Card title={t("theme.title")}>
        <ThemePicker
          value={String(settings[SETTINGS.THEME] ?? "github-dark")}
          onChange={(value) => set(SETTINGS.THEME, value)}
        />
      </Card>

      <Card title={t("appearance.typography")}>
        <Row
          label={t("appearance.fontFamily")}
          description={t("appearance.fontFamilyDescription")}
        >
          <TextInput
            value={String(settings[SETTINGS.FONT_FAMILY] ?? "")}
            placeholder={t("appearance.systemDefault")}
            onChange={(value) => set(SETTINGS.FONT_FAMILY, value || null)}
          />
        </Row>
        <Row
          label={t("appearance.fontSize")}
          description={t("appearance.fontSizeDescription")}
          last
        >
          <NumberInput
            value={Number(settings[SETTINGS.FONT_SIZE] ?? 13)}
            min={10}
            max={24}
            onChange={(value) => set(SETTINGS.FONT_SIZE, value)}
          />
        </Row>
      </Card>

      <Card title={t("appearance.dimensions")}>
        <Row
          label={t("appearance.maxWidth")}
          description={t("appearance.maxWidthDescription")}
        >
          <NumberInput
            value={Number(settings[SETTINGS.WIDTH] ?? 300)}
            min={150}
            max={800}
            step={10}
            onChange={(value) => set(SETTINGS.WIDTH, value)}
          />
        </Row>
        <Row
          label={t("appearance.maxHeight")}
          description={t("appearance.maxHeightDescription")}
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
  const { t } = useI18n();

  return (
    <>
      <Card title={t("behavior.startupAndTrigger")}>
        <Row
          label={t("behavior.launchAtLogin")}
          description={t("behavior.launchAtLoginDescription")}
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.LAUNCH_ON_STARTUP] ?? false)}
            onChange={(value) => set(SETTINGS.LAUNCH_ON_STARTUP, value)}
          />
        </Row>
        <Row
          label={t("behavior.showAfterTab")}
          description={t("behavior.showAfterTabDescription")}
          last
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.ONLY_SHOW_ON_TAB])}
            onChange={(value) => set(SETTINGS.ONLY_SHOW_ON_TAB, value)}
          />
        </Row>
      </Card>

      <Card title={t("behavior.suggestions")}>
        <Row
          label={t("behavior.fuzzyMatching")}
          description={t("behavior.fuzzyMatchingDescription")}
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
          label={t("behavior.sortOrder")}
          description={t("behavior.sortOrderDescription")}
          last
        >
          <Select
            value={String(settings[SETTINGS.SORT_METHOD] ?? "default")}
            options={[
              { value: "default", label: t("behavior.byRelevance") },
              { value: "alphabetical", label: t("behavior.alphabetical") },
            ]}
            onChange={(value) => set(SETTINGS.SORT_METHOD, value)}
          />
        </Row>
      </Card>

      <Card title={t("behavior.keyboardAndInsertion")}>
        <Row
          label={t("behavior.useUpArrowForHistory")}
          description={t("behavior.useUpArrowForHistoryDescription")}
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.NAVIGATE_TO_HISTORY])}
            onChange={(value) => set(SETTINGS.NAVIGATE_TO_HISTORY, value)}
          />
        </Row>
        <Row
          label={t("behavior.insertTrailingSpace")}
          description={t("behavior.insertTrailingSpaceDescription")}
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.INSERT_SPACE_AUTOMATICALLY])}
            onChange={(value) =>
              set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, value)
            }
          />
        </Row>
        <Row
          label={t("behavior.executeAfterTrailingSpace")}
          description={t("behavior.executeAfterTrailingSpaceDescription")}
          last
        >
          <Toggle
            checked={Boolean(
              settings[SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE] ?? false,
            )}
            onChange={(value) =>
              set(SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE, value)
            }
          />
        </Row>
      </Card>

      <Card title={t("behavior.history")}>
        <Row
          label={t("behavior.historyMode")}
          description={t("behavior.historyModeDescription")}
        >
          <Select
            value={String(settings[SETTINGS.HISTORY_MODE] ?? "show")}
            options={[
              { value: "show", label: t("behavior.showWithCompletions") },
              { value: "history_only", label: t("behavior.historyOnly") },
              { value: "off", label: t("behavior.off") },
            ]}
            onChange={(value) => set(SETTINGS.HISTORY_MODE, value)}
          />
        </Row>
        <Row
          label={t("behavior.mergeAllShells")}
          description={t("behavior.mergeAllShellsDescription")}
        >
          <Toggle
            checked={Boolean(settings[SETTINGS.HISTORY_MERGE_SHELLS])}
            onChange={(value) => set(SETTINGS.HISTORY_MERGE_SHELLS, value)}
          />
        </Row>
        <Row
          label={t("behavior.historyCommand")}
          description={t("behavior.historyCommandDescription")}
          last
        >
          <TextInput
            value={String(settings[SETTINGS.HISTORY_COMMAND] ?? "")}
            placeholder={t("behavior.historyCommandPlaceholder")}
            onChange={(value) => set(SETTINGS.HISTORY_COMMAND, value || null)}
          />
        </Row>
      </Card>
    </>
  );
}

const DOCTOR_COMMAND = "ec doctor";

function DiagnosticsCard() {
  const { t } = useI18n();
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
    <Card title={t("about.troubleshooting")}>
      <div className="px-[18px] py-3.5">
        <div className="text-[14px] font-medium leading-[1.35] text-[#050505]">
          {t("about.somethingNotWorking")}
        </div>
        <div className="mt-1 max-w-[36rem] text-[12px] leading-[1.5] text-[rgba(60,60,67,0.68)]">
          {t("about.diagnosticDescription")}
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
                ? t("about.copied")
                : copyState === "error"
                  ? t("about.failed")
                  : t("about.copy")
            }
            onClick={() => void copyCommand()}
          />
        </div>
        <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-[rgba(60,60,67,0.08)] pt-3.5">
          <div className="min-w-0 flex-1 text-[12px] leading-[1.5] text-[rgba(60,60,67,0.68)]">
            {t("about.stillStuck")}
          </div>
          <AboutLinkButton
            href={ISSUES_URL}
            label={t("about.reportIssue")}
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
  const { t } = useI18n();
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
                {t("about.tagline")}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-[rgba(60,60,67,0.68)]">
                <button
                  onClick={() => void copyVersionInfo()}
                  title={t("about.copyVersionInfo")}
                  className="cursor-pointer rounded-full border-0 bg-[rgba(60,60,67,0.08)] px-2 py-0.5 font-sans text-[12px] font-medium text-[rgba(0,0,0,0.72)] transition-colors hover:bg-[rgba(60,60,67,0.14)]"
                >
                  {copyState === "done"
                    ? t("about.copiedShort")
                    : copyState === "error"
                      ? t("about.copyFailed")
                      : `${t("about.version")} ${APP_VERSION}`}
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
              label={t("about.checkForUpdates")}
              onClick={() => void checkForUpdates()}
              disabled={isChecking}
            />
          </div>
        </div>
      </Card>

      <Card title={t("about.updates")}>
        <Row
          label={t("about.checkAutomatically")}
          description={t("about.checkAutomaticallyDescription")}
          last
        >
          <Toggle
            checked={!(settings[SETTINGS.DISABLE_AUTO_UPDATES] ?? false)}
            onChange={(value) => set(SETTINGS.DISABLE_AUTO_UPDATES, !value)}
          />
        </Row>
      </Card>

      <DiagnosticsCard />

      <Card title={t("about.privacy")}>
        <Row
          label={t("about.shareUsageData")}
          description={t("about.shareUsageDataDescription")}
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
          label={t("about.privacyPolicy")}
          description={t("about.privacyPolicyDescription")}
          last
        >
          <AboutLinkButton
            href={PRIVACY_URL}
            label={t("about.viewPolicy")}
            icon={<IconExternalLink />}
          />
        </Row>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <AboutLinkButton href={REPO_URL} label="GitHub" icon={<IconGitHub />} />
        <AboutLinkButton
          href={RELEASES_URL}
          label={t("about.releaseNotes")}
          icon={<IconExternalLink />}
        />
      </div>
      <p className="mt-3 text-center text-[11px] leading-[1.5] text-[rgba(60,60,67,0.55)]">
        {t("about.licensePrefix")}{" "}
        <a
          href={UPSTREAM_REPO_URL}
          onClick={(event) => {
            event.preventDefault();
            void openExternalUrl(UPSTREAM_REPO_URL);
          }}
          className="text-[rgba(60,60,67,0.55)] underline"
        >
          {t("about.upstreamName")}
        </a>
      </p>
    </>
  );
}
