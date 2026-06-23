import type React from "react";
import clsx from "clsx";

export function Row({
  label,
  description,
  children,
  last,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex min-h-[54px] items-center justify-between gap-4 px-[18px] py-3",
        last ? "border-b-0" : "border-b border-[rgba(60,60,67,0.10)]",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium leading-[1.35] text-[#050505]">
          {label}
        </div>
        {description ? (
          <div className="mt-0.5 max-w-[36rem] text-[12px] leading-[1.4] text-[rgba(60,60,67,0.68)]">
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
        <div className="mb-2 pl-5 text-[13px] font-semibold tracking-[-0.01em] text-[rgba(0,0,0,0.78)]">
          {title}
        </div>
      ) : null}
      <div className="overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.72)] bg-[rgba(246,246,247,0.74)] shadow-[inset_0_0_0_0.5px_rgba(60,60,67,0.05)]">
        {children}
      </div>
    </section>
  );
}
