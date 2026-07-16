import clsx from "clsx";

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      className={clsx(
        "native-toggle group relative h-5 w-11 flex-shrink-0 rounded-full border-0 p-0",
        "shadow-[inset_0_0_0_0.5px_rgba(60,60,67,0.12)] transition-colors duration-150",
        checked
          ? "bg-[var(--dashboard-accent-color)]"
          : "bg-[rgba(120,120,128,0.16)]",
      )}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={clsx(
          "absolute left-[3px] top-[3px] block h-3.5 w-6 rounded-full bg-white",
          "shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_0.5px_1px_rgba(0,0,0,0.08)]",
          "transition-transform duration-150 ease-[cubic-bezier(0.28,0.11,0.32,1)] group-active:scale-95",
          checked ? "translate-x-3.5" : "translate-x-0",
        )}
      />
    </button>
  );
}

export function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={clsx(
        "dashboard-select min-w-[136px] appearance-none rounded-[10px] border-0",
        "bg-[rgba(120,120,128,0.16)] py-1.5 pl-3 pr-[30px] text-[13px] text-black outline-none",
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

export function NumberInput({
  value,
  min,
  max,
  step,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <input
      key={value}
      type="number"
      defaultValue={value}
      min={min}
      max={max}
      step={step ?? 1}
      onBlur={(event) => {
        const nextValue = parseFloat(event.currentTarget.value);
        if (!Number.isNaN(nextValue)) onChange(nextValue);
        else event.currentTarget.value = String(value);
      }}
      className="dashboard-number-input w-[78px] rounded-[10px] border-0 bg-[rgba(120,120,128,0.16)] py-1.5 pl-2.5 text-right text-[13px] text-black outline-none"
    />
  );
}

export function TextInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      key={value}
      type="text"
      defaultValue={value}
      placeholder={placeholder}
      onBlur={(event) => onChange(event.currentTarget.value)}
      className="w-[156px] rounded-[10px] border-0 bg-[rgba(120,120,128,0.16)] px-2.5 py-1.5 text-[13px] text-black outline-none"
    />
  );
}
