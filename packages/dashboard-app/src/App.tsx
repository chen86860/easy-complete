import { useEffect, useRef, useState } from "react";
import {
  Event as EventNotifications,
  Settings,
  WindowPosition,
} from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";
import appLogo from "../../../crates/fig_desktop/icons/icon.png";

// ── Types ────────────────────────────────────────────────────────────────────

type S = Record<string, unknown>;
type Section = "appearance" | "behavior" | "history" | "advanced" | "about";
type DashboardNavigatePayload = { path?: string };

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function IconAppearance({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12.5 L9.5 5 L11 3.5 L12.5 5 L11 6.5 L3.5 14" />
      <path d="M9.5 5 L11 6.5" />
      <circle cx="2.8" cy="13.2" r="1.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconBehavior({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    >
      <line x1="3" y1="4.5" x2="13" y2="4.5" />
      <circle cx="6.5" cy="4.5" r="1.8" fill="currentColor" stroke="none" />
      <line x1="3" y1="8" x2="13" y2="8" />
      <circle cx="10" cy="8" r="1.8" fill="currentColor" stroke="none" />
      <line x1="3" y1="11.5" x2="13" y2="11.5" />
      <circle cx="6" cy="11.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconHistory({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 5.5V8L9.8 9.8" />
    </svg>
  );
}

function IconAdvanced({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="2.2" />
      <path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" />
    </svg>
  );
}

function IconAbout({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 7.5V11" />
      <circle cx="8" cy="5.2" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function AppLogo({ size = 64 }: { size?: number }) {
  return (
    <img
      src={appLogo}
      alt=""
      width={size}
      height={size}
      style={{
        display: "block",
        borderRadius: Math.round(size * 0.22),
      }}
    />
  );
}

// ── Theme catalog ─────────────────────────────────────────────────────────────

type ThemeEntry = {
  id: string;
  label: string;
  bg: string;
  text: string;
  selection: string;
  accent: string;
};

const THEMES: ThemeEntry[] = [
  {
    id: "dark",
    label: "Dark",
    bg: "#303030",
    text: "#b4b4b4",
    selection: "#1e5ac7",
    accent: "#5f5938",
  },
  {
    id: "light",
    label: "Light",
    bg: "#fefefe",
    text: "#070707",
    selection: "#2969da",
    accent: "#fff899",
  },
  {
    id: "system",
    label: "System",
    bg: "#1c1c1c",
    text: "#d0d0d0",
    selection: "#1e5ac7",
    accent: "#5f5938",
  },
  {
    id: "github-dark",
    label: "GitHub Dark",
    bg: "#0d1117",
    text: "#c9d1d9",
    selection: "#1f6feb",
    accent: "#388bfd",
  },
  {
    id: "github-light",
    label: "GitHub Light",
    bg: "#ffffff",
    text: "#24292f",
    selection: "#0969da",
    accent: "#fff8c5",
  },
  {
    id: "dracula",
    label: "Dracula",
    bg: "#282a36",
    text: "#f8f8f2",
    selection: "#6272a4",
    accent: "#bd93f9",
  },
  {
    id: "nord",
    label: "Nord",
    bg: "#2e3440",
    text: "#d8dee9",
    selection: "#5e81ac",
    accent: "#88c0d0",
  },
  {
    id: "solarized-dark",
    label: "Solarized Dark",
    bg: "#002b36",
    text: "#839496",
    selection: "#268bd2",
    accent: "#2aa198",
  },
  {
    id: "solarized-light",
    label: "Solarized Light",
    bg: "#fdf6e3",
    text: "#657b83",
    selection: "#268bd2",
    accent: "#2aa198",
  },
  {
    id: "gruvbox-dark",
    label: "Gruvbox Dark",
    bg: "#282828",
    text: "#ebdbb2",
    selection: "#458588",
    accent: "#d79921",
  },
  {
    id: "gruvbox-light",
    label: "Gruvbox Light",
    bg: "#fbf1c7",
    text: "#3c3836",
    selection: "#458588",
    accent: "#d79921",
  },
  {
    id: "one-dark",
    label: "One Dark",
    bg: "#282c34",
    text: "#abb2bf",
    selection: "#528bff",
    accent: "#98c379",
  },
  {
    id: "catppuccin-mocha",
    label: "Catppuccin Mocha",
    bg: "#1e1e2e",
    text: "#cdd6f4",
    selection: "#89b4fa",
    accent: "#cba6f7",
  },
  {
    id: "catppuccin-latte",
    label: "Catppuccin Latte",
    bg: "#eff1f5",
    text: "#4c4f69",
    selection: "#1e66f5",
    accent: "#8839ef",
  },
  {
    id: "tokyo-night",
    label: "Tokyo Night",
    bg: "#1a1b26",
    text: "#a9b1d6",
    selection: "#364a82",
    accent: "#bb9af7",
  },
  {
    id: "monokai",
    label: "Monokai",
    bg: "#272822",
    text: "#f8f8f2",
    selection: "#75715e",
    accent: "#ae81ff",
  },
  {
    id: "material-dark",
    label: "Material Dark",
    bg: "#263238",
    text: "#eeffff",
    selection: "#546e7a",
    accent: "#c792ea",
  },
];

// ── Low-level controls ────────────────────────────────────────────────────────

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      className="native-toggle"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 44,
        height: 20,
        borderRadius: 999,
        backgroundColor: checked
          ? "var(--dashboard-accent-color, AccentColor)"
          : "rgba(120,120,128,0.16)",
        border: "none",
        position: "relative",
        transition: "background-color 0.16s ease, box-shadow 0.16s ease",
        flexShrink: 0,
        padding: 0,
        boxShadow: "inset 0 0 0 0.5px rgba(60,60,67,0.12)",
      }}
    >
      <span
        style={{
          display: "block",
          width: 24,
          height: 14,
          borderRadius: 999,
          backgroundColor: "#ffffff",
          boxShadow:
            "0 0 0 0.5px rgba(0,0,0,0.04), 0 0.5px 1px rgba(0,0,0,0.08)",
          position: "absolute",
          top: 3,
          left: 3,
          transform: `translateX(${checked ? 14 : 0}px) scale(var(--native-toggle-press-scale, 1))`,
          transition: "transform 0.16s cubic-bezier(0.28, 0.11, 0.32, 1)",
        }}
      />
    </button>
  );
}

function Select({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        backgroundColor: "rgba(120,120,128,0.16)",
        border: "none",
        color: "#000000",
        fontSize: 13,
        borderRadius: 10,
        padding: "6px 30px 6px 12px",
        outline: "none",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%238e8e93'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        minWidth: 136,
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function NumberInput({
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
  onChange: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  return (
    <input
      type="number"
      value={draft}
      min={min}
      max={max}
      step={step ?? 1}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const n = parseFloat(draft);
        if (!isNaN(n)) onChange(n);
        else setDraft(String(value));
      }}
      style={{
        width: 78,
        backgroundColor: "rgba(120,120,128,0.16)",
        border: "none",
        color: "#000000",
        fontSize: 13,
        borderRadius: 10,
        padding: "6px 10px",
        outline: "none",
        textAlign: "right",
      }}
    />
  );
}

function TextInput({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);

  return (
    <input
      type="text"
      value={draft}
      placeholder={placeholder}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => onChange(draft)}
      style={{
        width: 156,
        backgroundColor: "rgba(120,120,128,0.16)",
        border: "none",
        color: "#000000",
        fontSize: 13,
        borderRadius: 10,
        padding: "6px 10px",
        outline: "none",
      }}
    />
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────

function Row({
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
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 58,
        padding: "13px 18px",
        borderBottom: last ? "none" : "1px solid rgba(60,60,67,0.10)",
        gap: 18,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 14,
            color: "#050505",
            fontWeight: 500,
            lineHeight: "20px",
            letterSpacing: "-0.01em",
          }}
        >
          {label}
        </div>
        {description && (
          <div
            style={{
              fontSize: 12,
              color: "rgba(60,60,67,0.68)",
              marginTop: 2,
              lineHeight: "17px",
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 26 }}>
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#050505",
          letterSpacing: "-0.01em",
          marginBottom: 10,
          paddingLeft: 24,
        }}
      >
        {title}
      </div>
      <div
        style={{
          backgroundColor: "rgba(246,246,247,0.92)",
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.70)",
          overflow: "hidden",
          boxShadow: "inset 0 0 0 0.5px rgba(60,60,67,0.04)",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Theme picker ─────────────────────────────────────────────────────────────

function ThemePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div
      style={{
        padding: "14px 18px 18px",
        display: "grid",
        gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
        gap: 12,
      }}
    >
      {THEMES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={t.label}
            style={{
              borderRadius: 12,
              overflow: "hidden",
              border: active
                ? "2px solid var(--dashboard-accent-color, AccentColor)"
                : "2px solid rgba(255,255,255,0.78)",
              outline: "none",
              outlineOffset: active ? 0 : -1,
              padding: 0,
              textAlign: "left",
              background: t.bg,
              transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              boxShadow: active
                ? "0 0 0 3px color-mix(in srgb, var(--dashboard-accent-color, AccentColor) 16%, transparent)"
                : "0 0.5px 1px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                height: 48,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                padding: "0 12px",
                gap: 4,
                backgroundColor: t.bg,
              }}
            >
              <div
                style={{
                  height: 7,
                  borderRadius: 3,
                  width: "72%",
                  backgroundColor: t.selection,
                }}
              />
              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  width: "100%",
                  backgroundColor: t.text,
                  opacity: 0.7,
                }}
              />
              <div
                style={{
                  height: 5,
                  borderRadius: 3,
                  width: "50%",
                  backgroundColor: t.text,
                  opacity: 0.35,
                }}
              />
            </div>
            <div
              style={{
                padding: "7px 12px 6px",
                fontSize: 12,
                fontWeight: 600,
                backgroundColor: t.bg,
                color: t.text,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {t.label}
            </div>
            <div style={{ height: 3, backgroundColor: t.accent }} />
          </button>
        );
      })}
    </div>
  );
}

// ── Sections ─────────────────────────────────────────────────────────────────

function AppearanceSection({
  s,
  set,
}: {
  s: S;
  set: (k: SETTINGS, v: unknown) => void;
}) {
  return (
    <>
      <Card title="Theme">
        <ThemePicker
          value={String(s[SETTINGS.THEME] ?? "dark")}
          onChange={(v) => set(SETTINGS.THEME, v)}
        />
      </Card>

      <Card title="Typography">
        <Row
          label="Font Family"
          description="Font used in the autocomplete popup"
        >
          <TextInput
            value={String(s[SETTINGS.FONT_FAMILY] ?? "")}
            placeholder="System default"
            onChange={(v) => set(SETTINGS.FONT_FAMILY, v || null)}
          />
        </Row>
        <Row label="Font Size" description="Popup font size in pixels" last>
          <NumberInput
            value={Number(s[SETTINGS.FONT_SIZE] ?? 13)}
            min={10}
            max={24}
            onChange={(v) => set(SETTINGS.FONT_SIZE, v)}
          />
        </Row>
      </Card>

      <Card title="Dimensions">
        <Row label="Max Width" description="Maximum popup width in pixels">
          <NumberInput
            value={Number(s[SETTINGS.WIDTH] ?? 300)}
            min={150}
            max={800}
            step={10}
            onChange={(v) => set(SETTINGS.WIDTH, v)}
          />
        </Row>
        <Row
          label="Max Height"
          description="Maximum popup height in pixels"
          last
        >
          <NumberInput
            value={Number(s[SETTINGS.HEIGHT] ?? 140)}
            min={80}
            max={600}
            step={10}
            onChange={(v) => set(SETTINGS.HEIGHT, v)}
          />
        </Row>
      </Card>
    </>
  );
}

function BehaviorSection({
  s,
  set,
}: {
  s: S;
  set: (k: SETTINGS, v: unknown) => void;
}) {
  return (
    <>
      <Card title="Application">
        <Row
          label="Launch at Login"
          description="Start Easy Complete automatically when you sign in"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.LAUNCH_ON_STARTUP] ?? true)}
            onChange={(v) => set(SETTINGS.LAUNCH_ON_STARTUP, v)}
          />
        </Row>
      </Card>

      <Card title="Filtering">
        <Row
          label="Fuzzy Search"
          description="Match suggestions by fuzzy character matching"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.FUZZY_SEARCH])}
            onChange={(v) => set(SETTINGS.FUZZY_SEARCH, v)}
          />
        </Row>
        <Row label="Sort Method" description="How to order suggestions">
          <Select
            value={String(s[SETTINGS.SORT_METHOD] ?? "default")}
            options={[
              { value: "default", label: "By Relevance" },
              { value: "alphabetical", label: "Alphabetical" },
            ]}
            onChange={(v) => set(SETTINGS.SORT_METHOD, v)}
          />
        </Row>
        <Row
          label="Prefer Verbose Suggestions"
          description="Show the longer form of suggestion names when available"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.PREFER_VERBOSE_SUGGESTIONS])}
            onChange={(v) => set(SETTINGS.PREFER_VERBOSE_SUGGESTIONS, v)}
          />
        </Row>
        <Row
          label="Always Suggest Current Token"
          description="Keep the current typed text as a suggestion"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN])}
            onChange={(v) => set(SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN, v)}
          />
        </Row>
      </Card>

      <Card title="Trigger">
        <Row
          label="Only Show on Tab"
          description="Suppress popup until Tab is pressed"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.ONLY_SHOW_ON_TAB])}
            onChange={(v) => set(SETTINGS.ONLY_SHOW_ON_TAB, v)}
          />
        </Row>
        <Row
          label="Navigate to History with ↑"
          description="Up-arrow enters shell history navigation mode"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.NAVIGATE_TO_HISTORY])}
            onChange={(v) => set(SETTINGS.NAVIGATE_TO_HISTORY, v)}
          />
        </Row>
      </Card>

      <Card title="Insertion">
        <Row
          label="Insert Space Automatically"
          description="Append a space after inserting a suggestion"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.INSERT_SPACE_AUTOMATICALLY])}
            onChange={(v) => set(SETTINGS.INSERT_SPACE_AUTOMATICALLY, v)}
          />
        </Row>
        <Row
          label="Immediately Execute After Space"
          description="Run command immediately when a space is inserted after a suggestion"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE])}
            onChange={(v) => set(SETTINGS.IMMEDIATELY_EXEC_AFTER_SPACE, v)}
          />
        </Row>
        <Row
          label="Scroll Wrap Around"
          description="Wrap selection from bottom to top of the list"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.SCROLL_WRAP_AROUND])}
            onChange={(v) => set(SETTINGS.SCROLL_WRAP_AROUND, v)}
          />
        </Row>
      </Card>

      <Card title="Description Panel">
        <Row
          label="Always Show Description"
          description="Display the description panel in a detached popout window"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.ALWAYS_SHOW_DESCRIPTION])}
            onChange={(v) => set(SETTINGS.ALWAYS_SHOW_DESCRIPTION, v)}
          />
        </Row>
        <Row
          label="Hide Auto-Execute Suggestion"
          description="Hide suggestions that would auto-execute a command"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION])}
            onChange={(v) => set(SETTINGS.HIDE_AUTO_EXECUTE_SUGGESTION, v)}
          />
        </Row>
      </Card>
    </>
  );
}

function HistorySection({
  s,
  set,
}: {
  s: S;
  set: (k: SETTINGS, v: unknown) => void;
}) {
  return (
    <>
      <Card title="History Suggestions">
        <Row
          label="History Mode"
          description="How shell history is blended with completions"
        >
          <Select
            value={String(s[SETTINGS.HISTORY_MODE] ?? "show")}
            options={[
              { value: "show", label: "Show with completions" },
              { value: "history_only", label: "History only" },
              { value: "off", label: "Off" },
            ]}
            onChange={(v) => set(SETTINGS.HISTORY_MODE, v)}
          />
        </Row>
        <Row
          label="Merge All Shells"
          description="Include history from all shells (bash, zsh, fish)"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.HISTORY_MERGE_SHELLS])}
            onChange={(v) => set(SETTINGS.HISTORY_MERGE_SHELLS, v)}
          />
        </Row>
        <Row
          label="Ctrl-R Toggle"
          description="Use Ctrl-R to toggle history-only mode"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.HISTORY_CTRL_R_TOGGLE])}
            onChange={(v) => set(SETTINGS.HISTORY_CTRL_R_TOGGLE, v)}
          />
        </Row>
        <Row
          label="Disable History Loading"
          description="Skip loading shell history on startup (faster launch)"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.DISABLE_HISTORY_LOADING])}
            onChange={(v) => set(SETTINGS.DISABLE_HISTORY_LOADING, v)}
          />
        </Row>
      </Card>

      <Card title="Custom History Command">
        <Row
          label="History Command"
          description="Shell command to use as the history source (leave empty for default)"
          last
        >
          <TextInput
            value={String(s[SETTINGS.HISTORY_COMMAND] ?? "")}
            placeholder="e.g. atuin search"
            onChange={(v) => set(SETTINGS.HISTORY_COMMAND, v || null)}
          />
        </Row>
      </Card>
    </>
  );
}

function AdvancedSection({
  s,
  set,
}: {
  s: S;
  set: (k: SETTINGS, v: unknown) => void;
}) {
  return (
    <>
      <Card title="Performance">
        <Row
          label="Script Timeout"
          description="Max milliseconds to wait for a completion generator to run"
          last
        >
          <NumberInput
            value={Number(s[SETTINGS.SCRIPT_TIMEOUT] ?? 5000)}
            min={500}
            max={30000}
            step={500}
            onChange={(v) => set(SETTINGS.SCRIPT_TIMEOUT, v)}
          />
        </Row>
      </Card>

      <Card title="Dangerous Commands">
        <Row
          label="Immediately Run Dangerous Commands"
          description="Auto-execute suggestions marked as dangerous without confirmation"
        >
          <Toggle
            checked={Boolean(s[SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS])}
            onChange={(v) =>
              set(SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS, v)
            }
          />
        </Row>
        <Row
          label="Immediately Run Git Aliases"
          description="Auto-execute git alias suggestions"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.IMMEDIATELY_RUN_GIT_ALIAS])}
            onChange={(v) => set(SETTINGS.IMMEDIATELY_RUN_GIT_ALIAS, v)}
          />
        </Row>
      </Card>

      <Card title="Developer">
        <Row
          label="Developer Mode"
          description="Enable additional debug logging and dev tools"
          last
        >
          <Toggle
            checked={Boolean(s[SETTINGS.DEV_MODE])}
            onChange={(v) => set(SETTINGS.DEV_MODE, v)}
          />
        </Row>
      </Card>
    </>
  );
}

// ── About section ─────────────────────────────────────────────────────────────

function AboutSection() {
  const REPO_URL =
    "https://github.com/chen86860/amazon-q-developer-cli-autocomplete";
  const VERSION = "1.0.1";

  return (
    <>
      <Card title="Application">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "32px 16px 28px",
            gap: 12,
          }}
        >
          <AppLogo size={72} />
          <div style={{ textAlign: "center", marginTop: 4 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#000000",
                letterSpacing: "-0.02em",
              }}
            >
              Easy Complete
            </div>
            <div style={{ fontSize: 13, color: "#8e8e93", marginTop: 4 }}>
              macOS Terminal Autocomplete
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: 10,
                padding: "3px 10px",
                backgroundColor:
                  "color-mix(in srgb, var(--dashboard-accent-color, AccentColor) 12%, transparent)",
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--dashboard-accent-color, AccentColor)",
                letterSpacing: "0.02em",
              }}
            >
              v{VERSION}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Project">
        <Row
          label="GitHub Repository"
          description="Source code and issue tracker"
        >
          <a
            href={REPO_URL}
            onClick={(e) => {
              e.preventDefault();
              window.open(REPO_URL, "_blank");
            }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              fontSize: 13,
              color: "var(--dashboard-accent-color, AccentColor)",
              textDecoration: "none",
              padding: "4px 10px",
              backgroundColor:
                "color-mix(in srgb, var(--dashboard-accent-color, AccentColor) 9%, transparent)",
              borderRadius: 7,
              fontWeight: 500,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            View on GitHub
          </a>
        </Row>
        <Row label="Version" description="Current application version" last>
          <span
            style={{
              fontSize: 13,
              color: "#8e8e93",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {VERSION}
          </span>
        </Row>
      </Card>

      <Card title="License">
        <Row
          label="Open Source"
          description="Licensed under MIT and Apache 2.0"
          last
        >
          <div style={{ display: "flex", gap: 6 }}>
            {["MIT", "Apache 2.0"].map((lic) => (
              <span
                key={lic}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#34c759",
                  backgroundColor: "rgba(52,199,89,0.1)",
                  padding: "2px 8px",
                  borderRadius: 5,
                  letterSpacing: "0.02em",
                }}
              >
                {lic}
              </span>
            ))}
          </div>
        </Row>
      </Card>

      <Card title="Based On">
        <Row
          label="Amazon Q Developer CLI"
          description="Fork of the open-source Amazon Q Developer CLI autocomplete"
          last
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="#8e8e93"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1V9" />
            <path d="M10 2h4v4" />
            <path d="M14 2L8 8" />
          </svg>
        </Row>
      </Card>
    </>
  );
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────

type NavItem = { id: Section; label: string; icon: React.ReactNode };

const NAV: NavItem[] = [
  { id: "appearance", label: "Appearance", icon: <IconAppearance /> },
  { id: "behavior", label: "Behavior", icon: <IconBehavior /> },
  { id: "history", label: "History", icon: <IconHistory /> },
  { id: "advanced", label: "Advanced", icon: <IconAdvanced /> },
  { id: "about", label: "About", icon: <IconAbout /> },
];

function preventScrollBounce(event: React.WheelEvent<HTMLElement>) {
  const target = event.currentTarget;
  const canScroll = target.scrollHeight > target.clientHeight;

  if (!canScroll) {
    event.preventDefault();
    return;
  }

  const atTop = target.scrollTop <= 0;
  const atBottom =
    Math.ceil(target.scrollTop + target.clientHeight) >= target.scrollHeight;

  if ((event.deltaY < 0 && atTop) || (event.deltaY > 0 && atBottom)) {
    event.preventDefault();
  }
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [settings, setSettings] = useState<S>({});
  const [section, setSection] = useState<Section>("appearance");
  const [saving, setSaving] = useState<string | null>(null);
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Settings.current()
      .then((s: Record<string, unknown>) => setSettings(s as S))
      .catch(() => {});

    let unsubscribe: (() => void) | undefined;
    Settings.didChange
      .subscribe(() => {
        Settings.current()
          .then((s: Record<string, unknown>) => setSettings(s as S))
          .catch(() => {});
        return { unsubscribe: false };
      })
      ?.then((sub) => {
        unsubscribe = sub.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    EventNotifications.subscribe<DashboardNavigatePayload>(
      "dashboard.navigate",
      (payload) => {
        if (payload?.path === "/about") {
          setSection("about");
        }

        return { unsubscribe: false };
      },
    )
      ?.then((sub) => {
        unsubscribe = sub.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, []);

  const set = async (key: SETTINGS, value: unknown) => {
    if (savingTimer.current) clearTimeout(savingTimer.current);
    setSettings((prev) => ({ ...prev, [key]: value }));
    try {
      if (value === null || value === undefined) {
        await Settings.remove(key);
      } else {
        await Settings.set(key, value);
      }
      setSaving("Saved");
    } catch {
      setSaving("Error saving");
    }
    savingTimer.current = setTimeout(() => setSaving(null), 1500);
  };

  const SECTION_TITLES: Record<Section, string> = {
    appearance: "Appearance",
    behavior: "Behavior",
    history: "History",
    advanced: "Advanced",
    about: "About",
  };

  return (
    <div
      style={
        {
          accentColor: "var(--dashboard-accent-color, AccentColor)",
          display: "flex",
          position: "relative",
          height: "100vh",
          backgroundColor: "#fbfbfd",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Helvetica Neue', sans-serif",
          color: "#000000",
          overflow: "hidden",
          overscrollBehavior: "none",
          WebkitFontSmoothing: "antialiased",
          WebkitTouchCallout: "none",
          WebkitUserSelect: "none",
          userSelect: "none",
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        onMouseDown={(event) => {
          if (event.button !== 0) return;
          event.preventDefault();
          void WindowPosition.dragWindow();
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 52,
          zIndex: 10,
        }}
      />

      {/* Sidebar */}
      <aside
        style={{
          width: 236,
          flexShrink: 0,
          background:
            "linear-gradient(180deg, rgba(231,249,255,0.82) 0%, rgba(247,250,253,0.94) 44%, rgba(246,246,248,0.98) 100%)",
          borderRight: "1px solid rgba(60,60,67,0.14)",
          display: "flex",
          flexDirection: "column",
          paddingTop: 54,
        }}
      >
        {/* Nav items */}
        <nav
          onWheel={preventScrollBounce}
          style={{
            flex: 1,
            padding: "0 14px",
            overflowY: "auto",
            overscrollBehavior: "none",
          }}
        >
          {NAV.map((item) => {
            const active = section === item.id;
            return (
              <button
                className="sidebar-button"
                key={item.id}
                onClick={() => setSection(item.id)}
                aria-current={active ? "page" : undefined}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px",
                  margin: 0,
                  width: "100%",
                  minHeight: 30,
                  borderRadius: 8,
                  border: "none",
                  textAlign: "left",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "rgba(0,0,0,0.86)",
                  backgroundColor: active
                    ? "rgba(60,60,67,0.12)"
                    : "transparent",
                  fontFamily: "inherit",
                }}
              >
                <span
                  style={{
                    lineHeight: 1,
                    opacity: 1,
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: "#202124",
                    background: "rgba(255,255,255,0.62)",
                    boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.04)",
                  }}
                >
                  {item.icon}
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Save indicator */}
        <div
          style={{
            padding: "12px 18px",
            height: 44,
            display: "flex",
            alignItems: "center",
          }}
        >
          {saving && (
            <span
              style={{
                fontSize: 12,
                color: saving === "Saved" ? "#34c759" : "#ff3b30",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 5,
                backgroundColor:
                  saving === "Saved"
                    ? "rgba(52,199,89,0.12)"
                    : "rgba(255,59,48,0.12)",
                borderRadius: 999,
                padding: "4px 9px",
              }}
            >
              {saving === "Saved" ? (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="8" cy="8" r="6.5" />
                  <path d="M5 8l2.2 2.2L11 5.5" />
                </svg>
              ) : (
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M8 1.5L14.5 13H1.5L8 1.5Z" />
                  <path d="M8 6.5V9.5" />
                  <circle
                    cx="8"
                    cy="11.5"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              )}
              {saving === "Saved" ? "Saved" : "Error saving"}
            </span>
          )}
        </div>
      </aside>

      {/* Content */}
      <main
        onWheel={preventScrollBounce}
        style={{
          flex: 1,
          overflowY: "auto",
          overscrollBehavior: "none",
          backgroundColor: "#fbfbfd",
        }}
      >
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "58px 28px 42px",
          }}
        >
          <h2
            style={{
              fontSize: 18,
              fontWeight: 650,
              color: "#050505",
              margin: "0 0 22px",
              letterSpacing: "-0.02em",
            }}
          >
            {SECTION_TITLES[section]}
          </h2>

          {section === "appearance" && (
            <AppearanceSection s={settings} set={set} />
          )}
          {section === "behavior" && <BehaviorSection s={settings} set={set} />}
          {section === "history" && <HistorySection s={settings} set={set} />}
          {section === "advanced" && <AdvancedSection s={settings} set={set} />}
          {section === "about" && <AboutSection />}
        </div>
      </main>
    </div>
  );
}
