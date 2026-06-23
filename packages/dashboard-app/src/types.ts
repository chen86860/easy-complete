import type { SETTINGS } from "@easy-complete/api-bindings-wrappers";

export type SettingsMap = Record<string, unknown>;
export type Section =
  | "appearance"
  | "behavior"
  | "history"
  | "advanced"
  | "about";
export type DashboardNavigatePayload = { path?: string };
export type SettingSetter = (key: SETTINGS, value: unknown) => void;
