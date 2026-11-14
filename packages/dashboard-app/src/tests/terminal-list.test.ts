import { describe, expect, it } from "vitest";
import { terminalList } from "../utils/terminal-list";
import { getTranslation, type Locale } from "../i18n";

const list = (locale: Locale, names: string[]) =>
  terminalList(names, (key) => getTranslation(locale, key));

describe("terminalList", () => {
  it("joins up to three names", () => {
    expect(list("en", ["Ghostty"])).toBe("Ghostty");
    expect(list("en", ["Ghostty", "Kitty", "Zed"])).toBe("Ghostty, Kitty, Zed");
    expect(list("zh-CN", ["Ghostty", "Kitty"])).toBe("Ghostty、Kitty");
  });

  it("names the first three and says there are more", () => {
    const names = ["Ghostty", "Kitty", "Zed", "WezTerm", "Alacritty"];
    expect(list("en", names)).toBe("Ghostty, Kitty, Zed and others");
    expect(list("zh-CN", names)).toBe("Ghostty、Kitty、Zed 等终端");
  });

  it("is empty for no terminals", () => {
    expect(list("en", [])).toBe("");
  });
});
