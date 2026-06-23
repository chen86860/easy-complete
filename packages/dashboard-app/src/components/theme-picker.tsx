import clsx from "clsx";
import { THEMES } from "../theme-catalog";

export function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 px-[18px] pb-[18px] pt-3.5">
      {THEMES.map((theme) => {
        const active = value === theme.id;
        return (
          <button
            key={theme.id}
            onClick={() => onChange(theme.id)}
            title={theme.label}
            className={clsx(
              "overflow-hidden rounded-xl p-0 text-left outline-none transition-[border-color,box-shadow] duration-150",
              theme.bgClassName,
              active
                ? "border-2 border-[var(--dashboard-accent-color)] shadow-[0_0_0_3px_color-mix(in_srgb,var(--dashboard-accent-color)_16%,transparent)]"
                : "border-2 border-[rgba(255,255,255,0.78)] shadow-[0_0.5px_1px_rgba(0,0,0,0.06)]",
            )}
          >
            <div
              className={clsx(
                "flex h-12 flex-col justify-center gap-1 px-3",
                theme.bgClassName,
              )}
            >
              <div
                className={clsx(
                  "h-[7px] w-[72%] rounded-[3px]",
                  theme.selectionClassName,
                )}
              />
              <div
                className={clsx(
                  "h-[5px] w-full rounded-[3px] opacity-70",
                  theme.textClassName,
                )}
              />
              <div
                className={clsx(
                  "h-[5px] w-1/2 rounded-[3px] opacity-35",
                  theme.textClassName,
                )}
              />
            </div>
            <div
              className={clsx(
                "overflow-hidden text-ellipsis whitespace-nowrap px-3 pb-1.5 pt-[7px] text-[12px] font-semibold",
                theme.bgClassName,
                theme.textClassName,
              )}
            >
              {theme.label}
            </div>
            <div className={clsx("h-[3px]", theme.accentClassName)} />
          </button>
        );
      })}
    </div>
  );
}
