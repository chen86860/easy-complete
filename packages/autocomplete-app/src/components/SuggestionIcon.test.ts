import { describe, expect, it } from "vitest";
import { transformIconUri } from "./SuggestionIcon.helpers";

describe("transformIconUri", () => {
  it("keeps supported named Fig icons on the Fig protocol", () => {
    expect(
      transformIconUri(new URL("fig://icon?type=command")).toString(),
    ).toBe("fig://icon?type=command");
  });

  it("falls back unsupported named Fig icons to the package icon", () => {
    expect(transformIconUri(new URL("fig://icon?type=npm")).toString()).toBe(
      "fig://icon?type=package",
    );
    expect(transformIconUri(new URL("fig://icon?type=pnpm")).toString()).toBe(
      "fig://icon?type=package",
    );
  });

  it("keeps non-Fig icon URLs unchanged", () => {
    const icon = new URL("https://example.com/icon.png");
    expect(transformIconUri(icon)).toBe(icon);
  });
});
