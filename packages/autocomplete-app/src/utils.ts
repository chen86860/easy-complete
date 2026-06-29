import { fs } from "@easy-complete/api-bindings";
import { isInDevMode } from "@easy-complete/api-bindings-wrappers";

// Logging functions
const DEFAULT_CONSOLE = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

export const LOG_DIR = window.fig?.constants?.logsDir;

// Lightweight stand-in for Node's util.format for the dev-only spec log.
// Avoids pulling the `util` browser polyfill (and its transitive deps) into the
// bundle; printf-style `%s`/`%d` substitution is not needed for these logs.
const formatLog = (...content: unknown[]): string =>
  content
    .map((c) => {
      if (typeof c === "string") return c;
      if (c instanceof Error) return c.stack ?? c.message;
      try {
        return JSON.stringify(c);
      } catch {
        return String(c);
      }
    })
    .join(" ");

const NEW_LOG_FN = (...content: unknown[]) => {
  fs.append(`${LOG_DIR}/logs/specs.log`, `\n${formatLog(...content)}`).finally(
    () => DEFAULT_CONSOLE.warn("SPEC LOG:", formatLog(...content)),
  );
};

export function runPipingConsoleMethods<T>(fn: () => T) {
  try {
    pipeConsoleMethods();
    return fn();
  } finally {
    restoreConsoleMethods();
  }
}

export function pipeConsoleMethods() {
  if (isInDevMode()) {
    console.log = NEW_LOG_FN;
    console.warn = NEW_LOG_FN;
    console.error = NEW_LOG_FN;
  }
}

export function restoreConsoleMethods() {
  if (isInDevMode()) {
    console.log = DEFAULT_CONSOLE.log;
    console.warn = DEFAULT_CONSOLE.warn;
    console.error = DEFAULT_CONSOLE.error;
  }
}
