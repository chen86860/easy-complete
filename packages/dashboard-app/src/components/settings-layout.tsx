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
        "flex min-h-[58px] items-center justify-between gap-[18px] px-[18px] py-[13px]",
        last ? "border-b-0" : "border-b border-[rgba(60,60,67,0.10)]",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="text-[14px] font-medium leading-5 text-[#050505]">
          {label}
        </div>
        {description ? (
          <div className="mt-0.5 text-[12px] leading-[17px] text-[rgba(60,60,67,0.68)]">
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
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-[26px]">
      <div className="mb-2.5 pl-6 text-[14px] font-semibold text-[#050505]">
        {title}
      </div>
      <div className="overflow-hidden rounded-[14px] border border-[rgba(255,255,255,0.70)] bg-[rgba(246,246,247,0.92)] shadow-[inset_0_0_0_0.5px_rgba(60,60,67,0.04)]">
        {children}
      </div>
    </section>
  );
}
