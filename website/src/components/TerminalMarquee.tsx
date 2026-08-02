import { terminalMarks, type TerminalMark } from "../terminalMarks.ts";

function MarkItem({ mark }: { mark: TerminalMark }) {
  return (
    <li className="flex shrink-0 items-center gap-2.5 px-7 text-[#7b8694] transition-colors duration-200 hover:text-[#cdd6e0] sm:px-9">
      {mark.path && (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-6 w-6 shrink-0 sm:h-7 sm:w-7"
        >
          <path d={mark.path} fillRule={mark.fillRule} />
        </svg>
      )}
      <span className="text-[17px] font-semibold tracking-tight whitespace-nowrap sm:text-[19px]">
        {mark.name}
      </span>
    </li>
  );
}

/**
 * Two identical tracks scroll left as one unit; when the first has moved
 * exactly its own width the animation resets, so the seam is never visible.
 * The second copy is `aria-hidden` to keep the list read once.
 */
export function TerminalMarquee({ label }: { label: string }) {
  return (
    <section
      aria-label={label}
      className="border-y border-[#161d25] bg-[#090c11] py-9"
    >
      <p className="m-0 mb-7 text-center font-mono text-[11px] uppercase tracking-[.22em] text-[#5d6773]">
        {label}
      </p>

      <div className="ec-marquee relative overflow-hidden">
        <div className="ec-marquee-track flex w-max">
          <ul className="m-0 flex list-none items-center p-0">
            {terminalMarks.map((mark) => (
              <MarkItem key={mark.name} mark={mark} />
            ))}
          </ul>
          <ul aria-hidden="true" className="m-0 flex list-none items-center p-0">
            {terminalMarks.map((mark) => (
              <MarkItem key={`${mark.name}-copy`} mark={mark} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
