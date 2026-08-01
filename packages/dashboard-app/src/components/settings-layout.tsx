import type React from "react";
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
  return (
    <div
      className={clsx(
        "relative flex min-h-[54px] items-center justify-between gap-4 py-3 pr-[18px]",
        nested ? "bg-[var(--ds-card-inset)] pl-[34px]" : "pl-[18px]",
      )}
    >
      {last ? null : (
        <span
          aria-hidden
          className={clsx(
            "absolute bottom-0 right-0 h-px",
            nested
              ? "left-[34px] bg-[var(--ds-separator-weak)]"
              : "left-0 bg-[var(--ds-separator)]",
          )}
        />
      )}
      <div className="min-w-0 flex-1">
        <div
          className={clsx(
            "font-medium leading-[1.35] text-[var(--ds-label)]",
            nested ? "text-[13px]" : "text-[14px]",
          )}
        >
          {label}
        </div>
        {description ? (
          <div className="mt-0.5 max-w-[36rem] text-[12px] leading-[1.4] text-[var(--ds-label-secondary)]">
            {description}
          </div>
        ) : null}
      </div>
      <div className="flex-shrink-0">{children}</div>
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
        <div className="mb-2 pl-5 text-[13px] font-semibold tracking-[-0.01em] text-[var(--ds-label-muted)]">
          {title}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[14px] border border-[var(--ds-card-border)] bg-[var(--ds-card-bg)] shadow-[inset_0_0_0_0.5px_var(--ds-card-inset)]">
        {children}
      </div>
    </section>
  );
}
