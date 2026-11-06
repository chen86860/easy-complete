import clsx from "clsx";

// WebKit's `switch` attribute renders the system switch, so it tracks the
// macOS version, the accent color (set on the app root), dark mode and
// Increase Contrast without any styling of our own. React has no typing for
// the attribute, hence the spread.
const NATIVE_SWITCH = { switch: "" } as Record<string, string>;

export function Toggle({
  checked,
  onChange,
  danger,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  /** Tints the "on" state red, for settings whose on state carries risk. */
  danger?: boolean;
}) {
  return (
    <input
      type="checkbox"
      {...NATIVE_SWITCH}
      checked={checked}
      onChange={(event) => onChange(event.currentTarget.checked)}
      className={clsx(
        "native-switch m-0 flex-shrink-0",
        danger && "[accent-color:var(--ds-red)]",
      )}
    />
  );
}

/**
 * The System Settings pop-up button: value plus a chevron in a gray circle at
 * rest; on hover the whole control gets the gray capsule and the circle fades.
 * The native <select> stays underneath for the menu and keyboard handling.
 */
export function Select({
  value,
  options,
  onChange,
  disabled,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  return (
    <span className="mac-popup" data-disabled={disabled || undefined}>
      <select
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span className="mac-popup-chevron" aria-hidden>
        <svg width="8" height="11" viewBox="0 0 8 11" fill="none">
          <path
            d="M1 4 4 1l3 3M1 7l3 3 3-3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
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
      className="dashboard-field dashboard-number-input w-[78px] text-right"
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
      className="dashboard-field w-[200px]"
    />
  );
}
