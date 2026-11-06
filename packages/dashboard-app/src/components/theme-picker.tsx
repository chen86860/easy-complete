import clsx from "clsx";
import commandIcon from "../../../../crates/fig_desktop/icons/autocomplete/command.png";
import { useI18n } from "../i18n";
import { THEMES, type PopupColors, type ThemeEntry } from "../theme-catalog";

const THEME_GROUPS: Array<{
  appearance: ThemeEntry["appearance"];
}> = [
  { appearance: "system" },
  { appearance: "light" },
  { appearance: "dark" },
];

// What the popup shows after typing `git c`: the real rows, args, matches and
// description, so each thumbnail reads exactly like the popup in the terminal.
const PREVIEW_TYPED = "c";
const PREVIEW_ROWS: Array<{ name: string; args?: string }> = [
  { name: "checkout", args: "[branch, file, tag or commit]" },
  { name: "commit", args: "[pathspec...]" },
  { name: "clone", args: "<repository> [directory]" },
];
const PREVIEW_DESCRIPTION = "Switch branches or restore working tree files";

/**
 * The popup inset on a backdrop shaded from the theme's own background. "Follow
 * system" keeps a neutral grey backdrop and splits only the popup with a steep
 * slash: light on the left, dark on the right.
 */
function ThemePreview({ theme }: { theme: ThemeEntry }) {
  const c = theme.colors;
  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        backgroundColor: theme.darkColors
          ? "var(--ds-chip-bg)"
          : `color-mix(in srgb, ${c.background} 90%, ${c.text})`,
      }}
    >
      <div className="relative">
        <PopupPreview c={c} />
        {theme.darkColors ? (
          <div
            className="absolute -inset-2 p-2"
            style={{ clipPath: "polygon(62% 0, 100% 0, 100% 100%, 42% 100%)" }}
          >
            <PopupPreview c={theme.darkColors} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** The suggestion popup in the theme's real colours. */
function PopupPreview({ c }: { c: PopupColors }) {
  return (
    <div
      className="overflow-hidden rounded-[5px] border font-mono text-[10.5px] leading-4 shadow-[0_2px_6px_rgba(0,0,0,0.18)]"
      style={{ backgroundColor: c.background, borderColor: c.border }}
    >
      {PREVIEW_ROWS.map(({ name, args }, index) => {
        const selected = index === 0;
        return (
          <div
            key={name}
            className="flex items-center gap-1 py-0.5 pl-1"
            style={
              selected
                ? {
                    backgroundColor: c.selectionBackground,
                    color: c.selectionText,
                  }
                : { color: c.text }
            }
          >
            <img src={commandIcon} alt="" className="size-3 shrink-0" />
            <span className="min-w-0 truncate whitespace-pre">
              <mark
                className="text-inherit"
                style={{
                  backgroundColor: `color-mix(in srgb, ${selected ? c.selectionMatch : c.match} 80%, transparent)`,
                }}
              >
                {name.slice(0, PREVIEW_TYPED.length)}
              </mark>
              {name.slice(PREVIEW_TYPED.length)}
              {args ? <span className="opacity-50"> {args}</span> : null}
            </span>
          </div>
        );
      })}
      <div
        className="flex items-center gap-1 border-t py-0.5 pl-1.5 pr-1 italic"
        style={{ borderColor: c.border, color: c.descriptionText }}
      >
        <span className="min-w-0 flex-1 truncate">{PREVIEW_DESCRIPTION}</span>
        <span className="shrink-0 not-italic">^k</span>
      </div>
    </div>
  );
}

function ThemeOption({
  theme,
  label,
  active,
  onSelect,
}: {
  theme: ThemeEntry;
  label: string;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      title={label}
      className={clsx(
        "group min-w-0 rounded-[13px] text-left outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,AccentColor_22%,transparent)]",
      )}
    >
      <div
        className={clsx(
          "rounded-[13px] border-2 p-1 ",
          active ? "border-[AccentColor]" : "border-transparent",
        )}
      >
        <ThemePreview theme={theme} />
      </div>
      <div className="mt-1.5 flex min-w-0 items-center gap-1.5 px-0.5">
        <span
          className={clsx(
            "flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full border",
            active
              ? "border-[AccentColor] bg-[AccentColor]"
              : "border-[var(--ds-radio-border)] bg-[var(--ds-radio-bg)]",
          )}
        >
          {active ? <span className="h-1 w-1 rounded-full bg-white" /> : null}
        </span>
        <span className="min-w-0 truncate text-[12px] font-medium leading-[17px] text-[var(--ds-label)]">
          {label}
        </span>
      </div>
    </button>
  );
}

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { t } = useI18n();
  // The three basic choices share the first row, so "follow system" no longer
  // sits alone in a group of its own.
  const BASIC_IDS = ["system", "light", "dark"];
  const groups: Array<{ key: string; label: string; themes: ThemeEntry[] }> = [
    {
      key: "basic",
      label: t("theme.basic"),
      themes: BASIC_IDS.flatMap((id) =>
        THEMES.filter((theme) => theme.id === id),
      ),
    },
    ...THEME_GROUPS.filter((group) => group.appearance !== "system").map(
      (group) => ({
        key: group.appearance,
        label:
          group.appearance === "light"
            ? t("theme.lightThemes")
            : t("theme.darkThemes"),
        themes: THEMES.filter(
          (theme) =>
            theme.appearance === group.appearance &&
            !BASIC_IDS.includes(theme.id),
        ),
      }),
    ),
  ];
  const themeLabels: Partial<Record<string, string>> = {
    dark: t("theme.dark"),
    light: t("theme.light"),
    system: t("theme.system"),
  };

  return (
    <div className="space-y-5 px-4 pb-4 pt-3.5">
      {groups.map(({ key, label, themes }) => {
        if (themes.length === 0) {
          return null;
        }

        return (
          <section key={key}>
            <h3 className="mb-2.5 text-[12px] font-medium text-[var(--ds-label-secondary)]">
              {label}
            </h3>
            <div className="grid grid-cols-3 gap-x-5 gap-y-4">
              {themes.map((theme) => (
                <ThemeOption
                  key={theme.id}
                  theme={theme}
                  label={themeLabels[theme.id] ?? theme.label}
                  active={value === theme.id}
                  onSelect={onChange}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
