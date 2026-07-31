import carrotIcon from "../assets/carrot.png";

/**
 * Mini preview of the autocomplete "Immediately execute" row.
 * Uses the same carrot.png asset as the overlay (`fig://icon?type=carrot`):
 * a red rounded square with a white `>`.
 */
export function AutoExecuteExample({
  command = "git add",
}: {
  command?: string;
}) {
  return (
    <span
      className="mt-1.5 inline-flex max-w-full items-center gap-1.5 rounded-md border border-[rgba(60,60,67,0.12)] bg-white px-1.5 py-1 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      aria-hidden
    >
      <img
        src={carrotIcon}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 shrink-0 rounded-[4px]"
        draggable={false}
      />
      <span className="font-mono text-[12px] leading-none text-[#1d1d1f]">
        {command}
      </span>
    </span>
  );
}
