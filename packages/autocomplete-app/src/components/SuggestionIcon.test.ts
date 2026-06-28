import { describe, expect, it } from "vitest";
import { transformIconUri } from "./SuggestionIcon";

describe("transformIconUri", () => {
  it("keeps named Fig icons on the Fig protocol", () => {
    expect(transformIconUri(new URL("fig://icon?type=npm")).toString()).toBe(
      "fig://icon?type=npm",
    );
    expect(
      transformIconUri(new URL("fig://icon?type=command")).toString(),
    ).toBe("fig://icon?type=command");
  });

  it("keeps non-Fig icon URLs unchanged", () => {
    const icon = new URL("https://example.com/icon.png");
    expect(transformIconUri(icon)).toBe(icon);
  });
});
