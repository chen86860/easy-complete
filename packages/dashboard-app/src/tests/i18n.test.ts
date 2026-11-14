import { afterEach, describe, expect, it, vi } from "vitest";
import {
  detectLocale,
  getTranslation,
  isLocalePreference,
  TRANSLATION_KEYS,
} from "../i18n";

const placeholders = (text: string) =>
  [...text.matchAll(/\{[a-zA-Z]+\}/g)].map((match) => match[0]).sort();

describe("translations", () => {
  it("has text for every key in both languages", () => {
    for (const key of TRANSLATION_KEYS) {
      expect(getTranslation("en", key).trim(), `en ${key}`).not.toBe("");
      expect(getTranslation("zh-CN", key).trim(), `zh-CN ${key}`).not.toBe("");
    }
  });

  // A placeholder dropped or renamed in one language shows up to the user as a literal
  // "{terminals}", or silently loses the value.
  it("keeps the same placeholders in both languages", () => {
    for (const key of TRANSLATION_KEYS) {
      expect(placeholders(getTranslation("zh-CN", key)), key).toEqual(
        placeholders(getTranslation("en", key)),
      );
    }
  });
});

describe("detectLocale", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  const withLanguages = (languages: string[], language = languages[0]) =>
    vi.stubGlobal("navigator", { languages, language });

  it.each([
    ["zh-CN", "zh-CN"],
    ["zh-Hans-CN", "zh-CN"],
    ["zh-TW", "zh-CN"],
    ["ZH", "zh-CN"],
    ["en-US", "en"],
    ["fr-FR", "en"],
    ["ja", "en"],
  ])("maps %s to %s", (language, expected) => {
    withLanguages([language]);
    expect(detectLocale()).toBe(expected);
  });

  it("goes by the first preferred language", () => {
    withLanguages(["en-US", "zh-CN"]);
    expect(detectLocale()).toBe("en");
  });

  it("falls back to navigator.language when the list is empty", () => {
    vi.stubGlobal("navigator", { languages: [], language: "zh-CN" });
    expect(detectLocale()).toBe("zh-CN");
  });

  it("is English when there is no navigator", () => {
    vi.stubGlobal("navigator", undefined);
    expect(detectLocale()).toBe("en");
  });
});

describe("isLocalePreference", () => {
  it("accepts the three stored values and nothing else", () => {
    expect(["system", "en", "zh-CN"].every(isLocalePreference)).toBe(true);
    for (const value of ["zh", "EN", "", null, undefined, 1, {}]) {
      expect(isLocalePreference(value), String(value)).toBe(false);
    }
  });
});
