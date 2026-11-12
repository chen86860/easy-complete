import { execFileSync } from "node:child_process";

export function commandStatus(command: string, args: string[]): boolean {
  try {
    execFileSync(command, args);
    return true;
  } catch {
    return false;
  }
}

let IS_EC_INSTALLED: boolean | undefined;
export function isEcInstalled(): boolean {
  if (IS_EC_INSTALLED === undefined) {
    IS_EC_INSTALLED = commandStatus("ec", ["--version"]);
  }
  return IS_EC_INSTALLED;
}

/** Writes an Easy Complete setting through the `ec` CLI, which parses the value as JSON. */
export function setSetting(key: string, value: unknown) {
  if (isEcInstalled()) {
    commandStatus("ec", ["settings", key, JSON.stringify(value)]);
  }
}
