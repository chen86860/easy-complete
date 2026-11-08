import type React from "react";
import { useId } from "react";
import { RowLabelContext } from "./row-label";
import clsx from "clsx";

export function Row({
  label,
  description,
  children,
  last,
  nested,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
  /**
   * Renders the row as a child of the one above it, following the macOS inset
   * grouped list: indented onto a recessed background, with its separator
   * inset to match the text. Deliberately no vertical rule — one would cross
   * the horizontal separators and read as table gridlines.
   */
  nested?: boolean;
}) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = description ? `${id}-description` : undefined;
  return (
    <div
      className={clsx(
        "relative flex min-h-[40px] items-center justify-between gap-4 py-2.5 pr-3.5",
        nested ? "bg-(--ds-card-inset) pl-[34px]" : "pl-3.5",
      )}
    >
      {last ? null : (
        <span
          aria-hidden
          className={clsx(
            "absolute bottom-0 right-3.5 h-px",
            nested
              ? "left-[34px] bg-(--ds-separator-weak)"
              : "left-3.5 bg-(--ds-separator)",
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <div
          id={labelId}
          className={clsx("text-[13px] leading-[1.35] text-(--ds-label)")}
        >
          {label}
        </div>
        {description ? (
          <div
            id={descriptionId}
            className="mt-0.5 max-w-xl text-[11px] leading-[1.4] text-(--ds-label-secondary)"
          >
            {description}
          </div>
        ) : null}
      </div>
      <div className="flex-shrink-0">
        <RowLabelContext.Provider value={{ labelId, descriptionId }}>
          {children}
        </RowLabelContext.Provider>
      </div>
    </div>
  );
}

export function Card({
  title,
  children,
}: {
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      {title ? (
        <div className="mb-1.5 pl-3.5 text-[13px] font-semibold text-(--ds-label)">
          {title}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-xl border border-(--ds-card-border) bg-(--ds-card-bg) shadow-[inset_0_0_0_0.5px_var(--ds-card-inset)]">
        {children}
      </div>
    </section>
  );
}
