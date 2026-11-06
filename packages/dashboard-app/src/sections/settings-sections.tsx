import { type ReactNode, useState } from "react";
import { Native } from "@easy-complete/api-bindings";
import {
  getDefaultWidth,
  settingOrDefault,
  SETTINGS,
} from "@easy-complete/api-bindings-wrappers";
import clsx from "clsx";
import type { SettingSetter, SettingsMap } from "../types";
import { AppLogo } from "../components/app-logo";
import { NumberInput, Select, TextInput, Toggle } from "../components/controls";
import { IconExternalLink, IconGitHub } from "../components/icons";
import { Card, Row } from "../components/settings-layout";
import { ThemePicker } from "../components/theme-picker";
import { useCheckForUpdates } from "../hooks/use-check-for-updates";
import { type LocalePreference, useI18n } from "../i18n";

const APP_VERSION = __APP_VERSION__;
const REPO_URL = "https://github.com/chen86860/easy-complete";
const RELEASES_URL = `${REPO_URL}/releases`;
const ISSUES_URL = `${REPO_URL}/issues`;
const PRIVACY_URL = "https://easy-complete.emmmm.dev/privacy-policy";
const UPSTREAM_REPO_URL = "https://github.com/aws/amazon-q-developer-cli";
const OPEN_SOURCE_LICENSES_URL = "ec-internal://open-source-licenses";

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
  icon?: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx("mac-button", className)}
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
      className="mac-button shrink-0"
    >
      {icon}
      {label}
    </a>
  );
}

export function GeneralSection({
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

      <Card title={t("behavior.startupAndTrigger")}>
        <Row label={t("behavior.launchAtLogin")}>
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.LAUNCH_ON_STARTUP),
            )}
            onChange={(value) => set(SETTINGS.LAUNCH_ON_STARTUP, value)}
          />
        </Row>
        <Row
          label={t("behavior.silentLaunch")}
          description={t("behavior.silentLaunchDescription")}
        >
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.SILENT_LAUNCH),
            )}
            onChange={(value) => set(SETTINGS.SILENT_LAUNCH, value)}
          />
        </Row>
        <Row
          label={t("behavior.showMenubarIcon")}
          description={t("behavior.showMenubarIconDescription")}
        >
          <Toggle
            checked={!settingOrDefault(settings, SETTINGS.HIDE_MENUBAR_ICON)}
            onChange={(value) => set(SETTINGS.HIDE_MENUBAR_ICON, !value)}
          />
        </Row>
        <Row
          label={t("behavior.keepAutocompleteReady")}
          description={t("behavior.keepAutocompleteReadyDescription")}
          last
        >
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.KEEP_AUTOCOMPLETE_READY),
            )}
            onChange={(value) => set(SETTINGS.KEEP_AUTOCOMPLETE_READY, value)}
          />
        </Row>
      </Card>
    </>
  );
}

function parseCommandList(value: string): string[] | null {
  const commands = value
    .split(/[\s,]+/)
    .map((command) => command.trim())
    .filter(Boolean);
  return commands.length > 0 ? [...new Set(commands)] : null;
}

export function AutocompleteSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  const { t } = useI18n();
  // The stored setting is negative (`hideAutoExecuteSuggestion`) and is read
  // that way by the autocomplete app and the CLI, so it stays as-is. Only the
  // UI is flipped, so the toggle reads positively and enabling it reveals the
  // sub-settings rather than hiding them.
  const showAutoExecute = !settingOrDefault(
    settings,
    SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION,
  );
  const disabledCommands = settings[SETTINGS.DISABLE_FOR_COMMANDS];

  return (
    <>
      <Card title={t("autocomplete.popup")}>
        <Row
          label={t("behavior.showAfterTab")}
          description={t("behavior.showAfterTabDescription")}
        >
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.ONLY_SHOW_ON_TAB),
            )}
            onChange={(value) => set(SETTINGS.ONLY_SHOW_ON_TAB, value)}
          />
        </Row>
        <Row
          label={t("behavior.firstTokenCompletion")}
          description={t("behavior.firstTokenCompletionDescription")}
        >
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.FIRST_COMMAND_COMPLETION),
            )}
            onChange={(value) => set(SETTINGS.FIRST_COMMAND_COMPLETION, value)}
          />
        </Row>
        <Row
          label={t("autocomplete.disableForCommands")}
          description={t("autocomplete.disableForCommandsDescription")}
          last
        >
          <TextInput
            value={
              Array.isArray(disabledCommands) ? disabledCommands.join(", ") : ""
            }
            placeholder={t("autocomplete.disableForCommandsPlaceholder")}
            onChange={(value) =>
              set(SETTINGS.DISABLE_FOR_COMMANDS, parseCommandList(value))
            }
          />
        </Row>
      </Card>

      <Card title={t("behavior.suggestions")}>
        <Row
          label={t("behavior.fuzzyMatching")}
          description={t("behavior.fuzzyMatchingDescription")}
        >
          <Toggle
            checked={Boolean(settingOrDefault(settings, SETTINGS.FUZZY_SEARCH))}
            onChange={(value) => set(SETTINGS.FUZZY_SEARCH, value)}
          />
        </Row>
        <Row label={t("behavior.sortOrder")} last>
          <Select
            value={String(settingOrDefault(settings, SETTINGS.SORT_METHOD))}
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
          label={t("behavior.tabBehavior")}
          description={t("behavior.tabBehaviorDescription")}
        >
          <Select
            value={String(settingOrDefault(settings, SETTINGS.TAB_KEYBINDING))}
            options={[
              {
                value: "insertCommonPrefixOrNavigateDown",
                label: t("behavior.tabPrefixThenNavigate"),
              },
              {
                value: "insertCommonPrefix",
                label: t("behavior.tabPrefixOnly"),
              },
              {
                value: "insertCommonPrefixOrInsertSelected",
                label: t("behavior.tabPrefixThenInsert"),
              },
              {
                value: "navigateDown",
                label: t("behavior.tabNavigateOnly"),
              },
            ]}
            onChange={(value) => set(SETTINGS.TAB_KEYBINDING, value)}
          />
        </Row>
        <Row
          label={t("behavior.insertTrailingSpace")}
          description={t("behavior.insertTrailingSpaceDescription")}
          last
        >
          <Toggle
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.INSERT_SPACE_AUTOMATICALLY),
            )}
            onChange={(value) =>
              set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, value)
            }
          />
        </Row>
      </Card>

      <Card title={t("autocomplete.runDirectly")}>
        <Row
          label={t("behavior.showAutoExecuteSuggestion")}
          description={t("behavior.showAutoExecuteSuggestionDescription")}
          last={!showAutoExecute}
        >
          <Toggle
            checked={showAutoExecute}
            onChange={(value) =>
              set(SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION, !value)
            }
          />
        </Row>
        {showAutoExecute ? (
          <>
            <Row
              label={t("behavior.executeAfterTrailingSpace")}
              description={t("behavior.executeAfterTrailingSpaceDescription")}
              nested
            >
              <Toggle
                checked={Boolean(
                  settingOrDefault(
                    settings,
                    SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE,
                  ),
                )}
                onChange={(value) =>
                  set(SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE, value)
                }
              />
            </Row>
            <Row
              label={t("behavior.runDangerousCommands")}
              description={t("behavior.runDangerousCommandsDescription")}
              last
              nested
            >
              <Toggle
                checked={Boolean(
                  settingOrDefault(
                    settings,
                    SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS,
                  ),
                )}
                onChange={(value) =>
                  set(SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS, value)
                }
                danger
              />
            </Row>
          </>
        ) : null}
      </Card>

      <Card title={t("behavior.history")}>
        <Row
          label={t("behavior.historyMode")}
          description={t("behavior.historyModeDescription")}
        >
          <Select
            value={String(settingOrDefault(settings, SETTINGS.HISTORY_MODE))}
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
            checked={Boolean(
              settingOrDefault(settings, SETTINGS.HISTORY_MERGE_SHELLS),
            )}
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

export function AppearanceSection({
  settings,
  set,
}: {
  settings: SettingsMap;
  set: SettingSetter;
}) {
  const { t } = useI18n();

  return (
    <>
      <Card title={t("theme.title")}>
        <ThemePicker
          value={String(settingOrDefault(settings, SETTINGS.THEME))}
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
            value={Number(settingOrDefault(settings, SETTINGS.FONT_SIZE))}
            min={10}
            max={24}
            unit="px"
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
            value={Number(
              settings[SETTINGS.WIDTH] ?? getDefaultWidth(settings),
            )}
            min={150}
            max={800}
            step={10}
            unit="px"
            onChange={(value) => set(SETTINGS.WIDTH, value)}
          />
        </Row>
        <Row
          label={t("appearance.maxHeight")}
          description={t("appearance.maxHeightDescription")}
          last
        >
          <NumberInput
            value={Number(settingOrDefault(settings, SETTINGS.HEIGHT))}
            min={80}
            max={600}
            step={10}
            unit="px"
            onChange={(value) => set(SETTINGS.HEIGHT, value)}
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
      <Row
        label={t("about.runDiagnostics")}
        description={t("about.diagnosticDescription")}
      >
        <AboutActionButton
          label={
            copyState === "done"
              ? t("about.copied")
              : copyState === "error"
                ? t("about.failed")
                : t("about.copyCommand")
          }
          onClick={() => void copyCommand()}
        />
      </Row>
      <Row
        label={t("about.reportIssue")}
        description={t("about.stillStuck")}
        last
      >
        <AboutLinkButton
          href={ISSUES_URL}
          label={t("about.openGitHub")}
          icon={<IconExternalLink />}
        />
      </Row>
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
      {/* Like About This Mac: icon, name and a gray version line, no card or pill. */}
      <div className="mb-6 flex items-center gap-3.5 px-1">
        <AppLogo size={52} />
        <div className="min-w-0">
          <div className="text-[17px] font-semibold text-[var(--ds-label)]">
            Easy Complete
          </div>
          <div className="mt-0.5 text-[12px] text-[var(--ds-label-secondary)]">
            {t("about.tagline")}
          </div>
          <button
            onClick={() => void copyVersionInfo()}
            title={t("about.copyVersionInfo")}
            className="mt-0.5 border-0 bg-transparent p-0 font-sans text-[12px] text-[var(--ds-label-secondary)]"
          >
            {copyState === "done"
              ? t("about.copiedShort")
              : copyState === "error"
                ? t("about.copyFailed")
                : `${t("about.version")} ${APP_VERSION}`}
          </button>
        </div>
      </div>

      <Card title={t("about.updates")}>
        <Row label={t("about.checkForUpdates")}>
          <AboutActionButton
            label={
              isChecking ? t("about.checkingForUpdates") : t("about.checkNow")
            }
            onClick={() => void checkForUpdates()}
            disabled={isChecking}
          />
        </Row>
        <Row
          label={t("about.checkAutomatically")}
          description={t("about.checkAutomaticallyDescription")}
        >
          <Toggle
            checked={!settingOrDefault(settings, SETTINGS.DISABLE_AUTO_UPDATES)}
            onChange={(value) => set(SETTINGS.DISABLE_AUTO_UPDATES, !value)}
          />
        </Row>
        <Row
          label={t("about.betaUpdates")}
          description={t("about.betaUpdatesDescription")}
          last
        >
          <Toggle
            checked={Boolean(settingOrDefault(settings, SETTINGS.BETA_UPDATES))}
            onChange={(value) => set(SETTINGS.BETA_UPDATES, value)}
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
            checked={settingOrDefault(settings, SETTINGS.TELEMETRY_ENABLED)}
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
        <AboutActionButton
          label={t("about.openSourceLicenses")}
          onClick={() => void Native.open(OPEN_SOURCE_LICENSES_URL)}
        />
      </div>
      <p className="mt-3 text-center text-[11px] leading-[1.5] text-[var(--ds-label-tertiary)]">
        {t("about.licensePrefix")}{" "}
        <a
          href={UPSTREAM_REPO_URL}
          onClick={(event) => {
            event.preventDefault();
            void openExternalUrl(UPSTREAM_REPO_URL);
          }}
          className="text-[var(--ds-label-tertiary)] underline"
        >
          {t("about.upstreamName")}
        </a>
      </p>
    </>
  );
}
