import { terminalMarks, type TerminalMark } from "../terminalMarks.ts";

function MarkItem({ mark }: { mark: TerminalMark }) {
  return (
    <li className="flex shrink-0 items-center gap-2 text-[#7b8694]">
      {mark.path && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 shrink-0"
        >
          <path d={mark.path} fillRule={mark.fillRule} />
        </svg>
      )}
      <span className="text-[17px] font-medium whitespace-nowrap">
        {mark.name}
      </span>
    </li>
  );
}

/** A static row of the terminals Easy Complete runs in. */
export function TerminalMarquee({ label }: { label: string }) {
  return (
    <section
      aria-label={label}
      className="border-y border-[#161d25] bg-[#090c11] px-7 py-12"
    >
      <p className="m-0 mb-8 text-center text-sm text-[#65707d]">{label}</p>
      <ul className="m-0 mx-auto flex max-w-295 list-none flex-wrap items-center justify-center gap-x-10 gap-y-6 p-0">
        {terminalMarks.map((mark) => (
          <MarkItem key={mark.name} mark={mark} />
        ))}
      </ul>
    </section>
  );
}
