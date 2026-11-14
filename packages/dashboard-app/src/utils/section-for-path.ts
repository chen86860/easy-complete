import type { Section } from "../types";

/** The settings page a window path or an `ec://` deep link opens. */
export function sectionForPath(path: string): Section {
  if (path === "/about") {
    return "about";
  }

  // `/behavior` is the old name of the autocomplete page; the tray menu and old
  // deep links may still use it.
  if (path === "/autocomplete" || path === "/behavior") {
    return "autocomplete";
  }

  if (path === "/appearance") {
    return "appearance";
  }

  return "general";
}
