import { useEffect, useRef, useState } from "react";
import { Settings } from "@easy-complete/api-bindings";
import { SETTINGS } from "@easy-complete/api-bindings-wrappers";

// ── Types ────────────────────────────────────────────────────────────────────

type S = Record<string, unknown>;
type Section = "appearance" | "behavior" | "history" | "advanced";

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
  // Built-ins
  { id: "dark",    label: "Dark",    bg: "#303030", text: "#b4b4b4", selection: "#1e5ac7", accent: "#5f5938" },
  { id: "light",   label: "Light",   bg: "#fefefe", text: "#070707", selection: "#2969da", accent: "#fff899" },
  { id: "system",  label: "System",  bg: "#1c1c1c", text: "#d0d0d0", selection: "#1e5ac7", accent: "#5f5938" },
  // Bundled themes (filenames without .json)
  { id: "github-dark",       label: "GitHub Dark",        bg: "#0d1117", text: "#c9d1d9", selection: "#1f6feb", accent: "#388bfd" },
  { id: "github-light",      label: "GitHub Light",       bg: "#ffffff", text: "#24292f", selection: "#0969da", accent: "#fff8c5" },
  { id: "dracula",           label: "Dracula",            bg: "#282a36", text: "#f8f8f2", selection: "#6272a4", accent: "#bd93f9" },
  { id: "nord",              label: "Nord",               bg: "#2e3440", text: "#d8dee9", selection: "#5e81ac", accent: "#88c0d0" },
  { id: "solarized-dark",    label: "Solarized Dark",     bg: "#002b36", text: "#839496", selection: "#268bd2", accent: "#2aa198" },
  { id: "solarized-light",   label: "Solarized Light",    bg: "#fdf6e3", text: "#657b83", selection: "#268bd2", accent: "#2aa198" },
  { id: "gruvbox-dark",      label: "Gruvbox Dark",       bg: "#282828", text: "#ebdbb2", selection: "#458588", accent: "#d79921" },
  { id: "gruvbox-light",     label: "Gruvbox Light",      bg: "#fbf1c7", text: "#3c3836", selection: "#458588", accent: "#d79921" },
  { id: "one-dark",          label: "One Dark",           bg: "#282c34", text: "#abb2bf", selection: "#528bff", accent: "#98c379" },
  { id: "catppuccin-mocha",  label: "Catppuccin Mocha",   bg: "#1e1e2e", text: "#cdd6f4", selection: "#89b4fa", accent: "#cba6f7" },
  { id: "catppuccin-latte",  label: "Catppuccin Latte",   bg: "#eff1f5", text: "#4c4f69", selection: "#1e66f5", accent: "#8839ef" },
  { id: "tokyo-night",       label: "Tokyo Night",        bg: "#1a1b26", text: "#a9b1d6", selection: "#364a82", accent: "#bb9af7" },
  { id: "monokai",           label: "Monokai",            bg: "#272822", text: "#f8f8f2", selection: "#75715e", accent: "#ae81ff" },
  { id: "material-dark",     label: "Material Dark",      bg: "#263238", text: "#eeffff", selection: "#546e7a", accent: "#c792ea" },
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
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? "bg-blue" : "bg-surface2"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-text shadow transition-transform duration-200 mt-0.5 ${
          checked ? "translate-x-4.5" : "translate-x-0.5"
        }`}
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
      className="bg-surface0 border border-surface1 text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue cursor-pointer"
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
      className="w-24 bg-surface0 border border-surface1 text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue text-right"
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
      className="w-48 bg-surface0 border border-surface1 text-text text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue placeholder-overlay0"
    />
  );
}

// ── Setting row ───────────────────────────────────────────────────────────────

function Row({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-surface1 last:border-b-0">
      <div className="flex-1 mr-6">
        <div className="text-text text-sm font-medium">{label}</div>
        {description && (
          <div className="text-subtext0 text-xs mt-0.5">{description}</div>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
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
    <div className="bg-surface0 rounded-xl px-5 mb-4">
      <h3 className="text-blue text-xs font-semibold uppercase tracking-wider pt-4 pb-1">
        {title}
      </h3>
      {children}
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
    <div className="grid grid-cols-3 gap-2 pb-3 pt-1">
      {THEMES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            title={t.label}
            className={`rounded-lg overflow-hidden border-2 transition-all text-left focus:outline-none ${
              active
                ? "border-blue shadow-md shadow-blue/20 scale-[1.02]"
                : "border-surface1 hover:border-surface2"
            }`}
          >
            {/* Mini preview */}
            <div
              className="h-10 flex flex-col justify-center px-2 gap-1"
              style={{ backgroundColor: t.bg }}
            >
              {/* Selection bar */}
              <div
                className="h-2 rounded-sm w-3/4"
                style={{ backgroundColor: t.selection }}
              />
              {/* Text bars */}
              <div
                className="h-1.5 rounded-sm w-full opacity-70"
                style={{ backgroundColor: t.text }}
              />
              <div
                className="h-1.5 rounded-sm w-1/2 opacity-40"
                style={{ backgroundColor: t.text }}
              />
            </div>
            {/* Label */}
            <div
              className="px-2 py-1 text-xs font-medium truncate"
              style={{ backgroundColor: t.bg, color: t.text }}
            >
              {t.label}
            </div>
            {/* Accent strip */}
            <div className="h-1 w-full" style={{ backgroundColor: t.accent }} />
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
        <Row label="Font Family" description="Font used in the autocomplete popup">
          <TextInput
            value={String(s[SETTINGS.FONT_FAMILY] ?? "")}
            placeholder="system default"
            onChange={(v) => set(SETTINGS.FONT_FAMILY, v || null)}
          />
        </Row>
        <Row label="Font Size" description="Popup font size in pixels">
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
        <Row label="Max Height" description="Maximum popup height in pixels">
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
      <Card title="Filtering">
        <Row label="Fuzzy Search" description="Match suggestions by fuzzy character matching">
          <Toggle
            checked={Boolean(s[SETTINGS.FUZZY_SEARCH])}
            onChange={(v) => set(SETTINGS.FUZZY_SEARCH, v)}
          />
        </Row>
        <Row label="Sort Method" description="How to order suggestions">
          <Select
            value={String(s[SETTINGS.SORT_METHOD] ?? "default")}
            options={[
              { value: "default", label: "By relevance" },
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
        >
          <Toggle
            checked={Boolean(s[SETTINGS.DISABLE_HISTORY_LOADING])}
            onChange={(v) => set(SETTINGS.DISABLE_HISTORY_LOADING, v)}
          />
        </Row>
      </Card>

      <Card title="Custom History Command">
        <Row
          label="Custom History Command"
          description="Shell command to use as the history source (leave empty for default)"
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
            onChange={(v) => set(SETTINGS.IMMEDIATELY_RUN_DANGEROUS_COMMANDS, v)}
          />
        </Row>
        <Row
          label="Immediately Run Git Aliases"
          description="Auto-execute git alias suggestions"
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

// ── Sidebar ───────────────────────────────────────────────────────────────────

const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "appearance", label: "Appearance", icon: "✦" },
  { id: "behavior", label: "Behavior", icon: "⚡" },
  { id: "history", label: "History", icon: "⏳" },
  { id: "advanced", label: "Advanced", icon: "⚙" },
];

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const [settings, setSettings] = useState<S>({});
  const [section, setSection] = useState<Section>("appearance");
  const [saving, setSaving] = useState<string | null>(null);
  const savingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    Settings.current()
      .then((s: Record<string, unknown>) => setSettings(s as S))
      .catch(() => {
        // not inside desktop WebView — show empty defaults
      });

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

  return (
    <div className="flex h-screen bg-base text-text overflow-hidden">
      {/* Sidebar */}
      <aside className="w-44 flex-shrink-0 bg-mantle flex flex-col py-4 border-r border-surface1">
        <div className="px-4 mb-6">
          <h1 className="text-text text-sm font-semibold">Easy Complete</h1>
          <p className="text-subtext0 text-xs mt-0.5">Settings</p>
        </div>
        <nav className="flex-1">
          {NAV.map((item) => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors ${
                section === item.id
                  ? "bg-surface0 text-blue font-medium"
                  : "text-subtext1 hover:text-text hover:bg-surface0/50"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        {saving && (
          <div className="px-4 py-2">
            <span
              className={`text-xs ${saving === "Saved" ? "text-green" : "text-red"}`}
            >
              {saving}
            </span>
          </div>
        )}
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-6 py-6">
          <h2 className="text-lg font-semibold text-text mb-4 capitalize">
            {section}
          </h2>

          {section === "appearance" && (
            <AppearanceSection s={settings} set={set} />
          )}
          {section === "behavior" && (
            <BehaviorSection s={settings} set={set} />
          )}
          {section === "history" && (
            <HistorySection s={settings} set={set} />
          )}
          {section === "advanced" && (
            <AdvancedSection s={settings} set={set} />
          )}
        </div>
      </main>
    </div>
  );
}
