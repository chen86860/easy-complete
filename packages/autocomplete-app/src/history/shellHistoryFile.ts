/**
 * Reads shell history straight from each shell's history file.
 *
 * Asking the shell (`zsh -lic 'fc -R; fc -ln 1'`) starts an interactive login
 * shell, which sources the user's whole profile and rc files, plugins
 * included: hundreds of milliseconds at best, and any side effect those files
 * have. A non-interactive shell is no cheaper substitute: zsh never sources
 * /etc/zshrc, where macOS sets HISTFILE, so `fc` finds no history.
 *
 * Each parser returns entries oldest first, the order `fc -ln 1` printed.
 */

/** Only the newest part of a history file is read. */
export const MAX_HISTORY_BYTES = 4 * 1024 * 1024;

const ZSH_META = 0x83;

/** Reverses zsh's metafication: Meta followed by a byte XOR 32 encodes that byte. */
export const unmetafyZsh = (bytes: Uint8Array): Uint8Array => {
  if (!bytes.includes(ZSH_META)) return bytes;
  const out = new Uint8Array(bytes.length);
  let length = 0;
  for (let i = 0; i < bytes.length; i += 1) {
    if (bytes[i] === ZSH_META && i + 1 < bytes.length) {
      i += 1;
      out[length] = bytes[i] ^ 32;
    } else {
      out[length] = bytes[i];
    }
    length += 1;
  }
  return out.subarray(0, length);
};

const decode = (bytes: Uint8Array) =>
  new TextDecoder("utf-8", { fatal: false }).decode(bytes);

/** Drops the first, likely partial, line of a file that was cut to its tail. */
const dropPartialFirstLine = (text: string, truncated: boolean) =>
  truncated ? text.slice(text.indexOf("\n") + 1) : text;

const EXTENDED_ZSH = /^: \d+:\d+;/;

/**
 * Parses `~/.zsh_history`, plain or EXTENDED_HISTORY (`: <start>:<elapsed>;<command>`).
 * A command spanning lines ends each inner line with a backslash; like `fc -l`,
 * the newlines come back as a literal `\n`.
 */
export const parseZshHistory = (
  bytes: Uint8Array,
  truncated = false,
): string[] => {
  const text = dropPartialFirstLine(decode(unmetafyZsh(bytes)), truncated);
  const entries: string[] = [];
  let pending: string | undefined;
  for (const rawLine of text.split("\n")) {
    const line =
      pending === undefined ? rawLine.replace(EXTENDED_ZSH, "") : rawLine;
    const continues = line.endsWith("\\");
    const part = continues ? line.slice(0, -1) : line;
    pending = pending === undefined ? part : `${pending}\\n${part}`;
    if (!continues) {
      if (pending.trim()) entries.push(pending);
      pending = undefined;
    }
  }
  if (pending?.trim()) entries.push(pending);
  return entries;
};

/** Parses `~/.bash_history`, skipping the `#<epoch>` lines HISTTIMEFORMAT adds. */
export const parseBashHistory = (
  bytes: Uint8Array,
  truncated = false,
): string[] =>
  dropPartialFirstLine(decode(bytes), truncated)
    .split("\n")
    .filter((line) => line.trim() && !/^#\d+$/.test(line));

const unescapeFish = (value: string) =>
  value.replace(/\\(\\|n)/g, (_, c: string) => (c === "n" ? "\\n" : "\\"));

/**
 * Parses fish's YAML-like history (`- cmd: …` followed by indented fields).
 * fish lists each command once, at its newest use; so does this.
 */
export const parseFishHistory = (
  bytes: Uint8Array,
  truncated = false,
): string[] => {
  const commands: string[] = [];
  for (const line of dropPartialFirstLine(decode(bytes), truncated).split(
    "\n",
  )) {
    if (line.startsWith("- cmd: ")) {
      commands.push(unescapeFish(line.slice("- cmd: ".length)));
    }
  }
  const seen = new Set<string>();
  const newestFirst: string[] = [];
  for (let i = commands.length - 1; i >= 0; i -= 1) {
    if (commands[i].trim() && !seen.has(commands[i])) {
      seen.add(commands[i]);
      newestFirst.push(commands[i]);
    }
  }
  return newestFirst.reverse();
};

export type HistoryShell = "zsh" | "bash" | "fish";

export const HISTORY_FILES: Record<HistoryShell, string> = {
  zsh: "~/.zsh_history",
  bash: "~/.bash_history",
  fish: "~/.local/share/fish/fish_history",
};

const PARSERS: Record<
  HistoryShell,
  (bytes: Uint8Array, truncated: boolean) => string[]
> = {
  zsh: parseZshHistory,
  bash: parseBashHistory,
  fish: parseFishHistory,
};

/**
 * Reads and parses one shell's default history file. Returns null when the
 * file cannot be read, so the caller can fall back to asking the shell, which
 * honours a custom HISTFILE or ZDOTDIR.
 */
export const readShellHistoryFile = async (
  shell: HistoryShell,
  readBinary: (path: string) => Promise<Uint8Array | null>,
): Promise<string[] | null> => {
  let bytes: Uint8Array | null;
  try {
    bytes = await readBinary(HISTORY_FILES[shell]);
  } catch {
    return null;
  }
  if (!bytes) return null;
  const truncated = bytes.length > MAX_HISTORY_BYTES;
  const tail = truncated
    ? bytes.subarray(bytes.length - MAX_HISTORY_BYTES)
    : bytes;
  return PARSERS[shell](tail, truncated);
};
