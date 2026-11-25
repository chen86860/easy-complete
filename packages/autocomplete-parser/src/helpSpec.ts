import logger from "loglevel";
import {
  SETTINGS,
  getSetting,
  executeCommand,
} from "@easy-complete/api-bindings-wrappers";
import { createCache } from "./caches.js";

/** Subcommands read below the command (`cmd a b c`), as `ec internal help-spec` allows. */
const MAX_DEPTH = 3;

const WORD = /^[A-Za-z0-9_][A-Za-z0-9_.:+@-]*$/;

/**
 * Command lines that have no help spec, so `ec` isn't asked again on every
 * keystroke. Cleared with the other caches.
 */
const misses = createCache<true>();

export const helpFallbackEnabled = () =>
  getSetting(SETTINGS.HELP_FALLBACK) !== false;

/**
 * A spec for a command that has none, read from its `--help` by
 * `ec internal help-spec`, which decides whether running it is safe and caches
 * the result. Subcommands load their own `--help` once entered.
 */
export const loadHelpSpec = async (
  words: string[],
): Promise<Fig.Subcommand | undefined> => {
  if (words.length > MAX_DEPTH + 1 || !words.every((w) => WORD.test(w))) {
    return undefined;
  }
  const key = words.join(" ");
  if (misses.has(key)) {
    return undefined;
  }

  let spec: Fig.Subcommand | null = null;
  try {
    const { stdout } = await executeCommand({
      command: "ec",
      args: ["internal", "help-spec", ...words],
      timeout: 4000,
    });
    spec = JSON.parse(stdout) as Fig.Subcommand | null;
  } catch (err) {
    logger.warn(`Could not read the --help of '${key}'`, err);
  }
  if (!spec || typeof spec !== "object") {
    misses.set(key, true);
    return undefined;
  }

  if (words.length <= MAX_DEPTH) {
    const subcommands = Array.isArray(spec.subcommands) ? spec.subcommands : [];
    for (const sub of subcommands) {
      const [name] = Array.isArray(sub.name) ? sub.name : [sub.name];
      const plain = { ...sub };
      sub.loadSpec = async () =>
        (helpFallbackEnabled() && (await loadHelpSpec([...words, name]))) ||
        plain;
    }
  }
  return spec;
};
