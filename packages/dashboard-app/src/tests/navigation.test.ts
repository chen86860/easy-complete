import { describe, expect, it } from "vitest";
import { sectionForPath } from "../utils/section-for-path";

describe("sectionForPath", () => {
  it.each([
    ["/", "general"],
    ["/general", "general"],
    ["/appearance", "appearance"],
    ["/autocomplete", "autocomplete"],
    ["/about", "about"],
  ])("opens %s as %s", (path, section) => {
    expect(sectionForPath(path)).toBe(section);
  });

  // The tray menu and old ec:// deep links still use the page's former name.
  it("keeps the old /behavior path working", () => {
    expect(sectionForPath("/behavior")).toBe("autocomplete");
  });

  it("opens the general page for a path it does not know", () => {
    expect(sectionForPath("/nope")).toBe("general");
    expect(sectionForPath("")).toBe("general");
    expect(sectionForPath("/about/")).toBe("general");
  });
});
