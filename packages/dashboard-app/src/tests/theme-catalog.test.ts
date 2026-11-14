import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { THEMES } from "../theme-catalog";

const themesDir = join(import.meta.dirname, "../../../../themes");
const themeFiles = readdirSync(themesDir)
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.slice(0, -".json".length))
  .sort();
const builtIn = ["dark", "light", "system"];

describe("theme catalog", () => {
  it("has no duplicate ids or labels", () => {
    const ids = THEMES.map((theme) => theme.id);
    const labels = THEMES.map((theme) => theme.label);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(labels).size).toBe(labels.length);
  });

  // The popup loads a theme by file name. A theme file with no entry cannot be picked in
  // Settings, and an entry with no file selects a theme the popup cannot load.
  it("lists exactly the themes shipped in themes/", () => {
    const listed = THEMES.map((theme) => theme.id)
      .filter((id) => !builtIn.includes(id))
      .sort();
    expect(listed).toEqual(themeFiles);
  });

  it("previews each theme with the colors from its file", () => {
    for (const id of themeFiles) {
      const { theme } = JSON.parse(
        readFileSync(join(themesDir, `${id}.json`), "utf8"),
      );
      const entry = THEMES.find((candidate) => candidate.id === id);
      expect(entry?.colors, id).toEqual({
        background: theme.backgroundColor,
        text: theme.textColor,
        match: theme.matchBackgroundColor,
        selectionBackground: theme.selection.backgroundColor,
        selectionText: theme.selection.textColor,
        selectionMatch: theme.selection.matchBackgroundColor,
        descriptionText: theme.description.textColor,
        border: theme.description.borderColor,
      });
    }
  });

  it("gives the system theme a light and a dark half", () => {
    const system = THEMES.find((theme) => theme.id === "system");
    const light = THEMES.find((theme) => theme.id === "light");
    const dark = THEMES.find((theme) => theme.id === "dark");
    expect(system?.colors).toEqual(light?.colors);
    expect(system?.darkColors).toEqual(dark?.colors);
  });

  it("marks every theme as light, dark or system", () => {
    for (const theme of THEMES) {
      expect(["light", "dark", "system"], theme.id).toContain(theme.appearance);
    }
    expect(
      THEMES.filter((theme) => theme.appearance === "system"),
    ).toHaveLength(1);
  });
});
