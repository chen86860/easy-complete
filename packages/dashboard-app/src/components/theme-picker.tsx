import clsx from "clsx";
import { THEMES, type ThemeEntry } from "../theme-catalog";

const THEME_GROUPS: Array<{
  title: string;
  appearance: ThemeEntry["appearance"];
}> = [
  { title: "Automatic", appearance: "system" },
  { title: "Light Themes", appearance: "light" },
  { title: "Dark Themes", appearance: "dark" },
];

function ThemePreview({ theme }: { theme: ThemeEntry }) {
  const lightChrome =
    theme.appearance === "light" || theme.appearance === "system";

  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[9px] border transition-[border-color,box-shadow,transform] duration-150",
        theme.bgClassName,
        lightChrome
          ? "border-[rgba(60,60,67,0.16)] shadow-[0_0.5px_1px_rgba(0,0,0,0.08)]"
          : "border-[rgba(255,255,255,0.15)] shadow-[0_0.5px_1px_rgba(0,0,0,0.28)]",
      )}
    >
      <div
        className={clsx(
          "flex h-5 items-center gap-1.5 border-b px-2",
          lightChrome
            ? "border-[rgba(60,60,67,0.11)]"
            : "border-[rgba(255,255,255,0.10)]",
        )}
      >
        <div
          className={clsx(
            "h-1.5 w-1.5 rounded-full opacity-55",
            theme.accentClassName,
          )}
        />
        <div
          className={clsx(
            "h-1.5 w-1.5 rounded-full opacity-38",
            theme.textClassName,
          )}
        />
        <div
          className={clsx(
            "h-1.5 w-1.5 rounded-full opacity-32",
            theme.textClassName,
          )}
        />
        <div
          className={clsx(
            "mx-auto flex h-3.5 w-[46%] items-center gap-1 rounded-[5px] border px-1.5 opacity-75",
            lightChrome
              ? "border-[rgba(60,60,67,0.14)]"
              : "border-[rgba(255,255,255,0.12)]",
          )}
        >
          <div
            className={clsx(
              "h-1.5 flex-1 rounded-full opacity-45",
              theme.textClassName,
            )}
          />
          <div
            className={clsx(
              "h-1.5 w-1.5 rotate-45 border-b border-r",
              lightChrome
                ? "border-[rgba(60,60,67,0.48)]"
                : "border-[rgba(255,255,255,0.52)]",
            )}
          />
        </div>
      </div>

      <div className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div
            className={clsx("h-2 w-2 rounded-[3px]", theme.accentClassName)}
          />
          <div
            className={clsx(
              "h-2.5 w-[42%] rounded-[4px] opacity-55",
              theme.textClassName,
            )}
          />
          <div
            className={clsx(
              "h-4 flex-1 rounded-[5px] border px-1.5",
              lightChrome
                ? "border-[rgba(60,60,67,0.15)] bg-[rgba(255,255,255,0.35)]"
                : "border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.03)]",
            )}
          >
            <div className="flex h-full items-center gap-1.5">
              <div
                className={clsx(
                  "h-1.5 flex-1 rounded-full opacity-38",
                  theme.textClassName,
                )}
              />
              <div
                className={clsx(
                  "h-1.5 w-1.5 rotate-45 border-b border-r",
                  lightChrome
                    ? "border-[rgba(60,60,67,0.42)]"
                    : "border-[rgba(255,255,255,0.44)]",
                )}
              />
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <div
            className={clsx(
              "h-1.5 w-[30%] rounded-full opacity-38",
              theme.textClassName,
            )}
          />
          <div
            className={clsx(
              "h-1.5 w-[22%] rounded-full opacity-32",
              theme.textClassName,
            )}
          />
          <div
            className={clsx(
              "h-1.5 w-[18%] rounded-full opacity-26",
              theme.textClassName,
            )}
          />
        </div>
        <div
          className={clsx(
            "mt-1.5 h-[3px] w-8 rounded-full",
            theme.accentClassName,
          )}
        />
      </div>
    </div>
  );
}

function ThemeOption({
  theme,
  active,
  onSelect,
}: {
  theme: ThemeEntry;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.id)}
      title={theme.label}
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
              : "border-[rgba(60,60,67,0.28)] bg-white",
          )}
        >
          {active ? <span className="h-1 w-1 rounded-full bg-white" /> : null}
        </span>
        <span className="min-w-0 truncate text-[12px] font-medium leading-[17px] text-[#1d1d1f]">
          {theme.label}
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
  return (
    <div className="space-y-5 px-4 pb-4 pt-3.5">
      {THEME_GROUPS.map((group) => {
        const themes = THEMES.filter(
          (theme) => theme.appearance === group.appearance,
        );

        if (themes.length === 0) {
          return null;
        }

        return (
          <section key={group.appearance}>
            <h3 className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[rgba(60,60,67,0.62)]">
              {group.title}
            </h3>
            <div className="grid grid-cols-3 gap-x-5 gap-y-4">
              {themes.map((theme) => (
                <ThemeOption
                  key={theme.id}
                  theme={theme}
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
