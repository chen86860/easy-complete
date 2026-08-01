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
        "native-toggle group relative h-5 w-[38px] flex-shrink-0 rounded-full border-0 p-0",
        "shadow-[inset_0_0_0_0.5px_var(--ds-control-inset)] transition-colors duration-150",
        checked
          ? "bg-[var(--dashboard-accent-color)]"
          : "bg-[var(--ds-control-bg)]",
      )}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
    >
      <span
        className={clsx(
          "absolute left-[3px] top-[3px] block h-3.5 w-5 rounded-full bg-white",
          "shadow-[0_0_0_0.5px_rgba(0,0,0,0.04),0_0.5px_1px_rgba(0,0,0,0.08)]",
          "transition-transform duration-150 ease-[cubic-bezier(0.28,0.11,0.32,1)] group-active:scale-95",
          checked ? "translate-x-3" : "translate-x-0",
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
        "bg-[var(--ds-control-bg)] py-1.5 pl-3 pr-[30px] text-[13px] text-[var(--ds-control-fg)] outline-none",
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
  unit,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  /** Shown beside the field so the row needs no description to state it. */
  unit?: string;
  onChange: (value: number) => void;
}) {
  const input = (
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
      className="dashboard-number-input w-[78px] rounded-[10px] border-0 bg-[var(--ds-control-bg)] py-1.5 pl-2.5 text-right text-[13px] text-[var(--ds-control-fg)] outline-none"
    />
  );

  if (!unit) return input;

  return (
    <div className="flex items-center gap-1.5">
      {input}
      <span className="text-[13px] text-[var(--ds-label-tertiary)]">
        {unit}
      </span>
    </div>
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
      className="w-[156px] rounded-[10px] border-0 bg-[var(--ds-control-bg)] px-2.5 py-1.5 text-[13px] text-[var(--ds-control-fg)] outline-none"
    />
  );
}
