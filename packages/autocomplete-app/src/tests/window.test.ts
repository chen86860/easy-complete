import { SETTINGS, updateSettings } from "@easy-complete/api-bindings-wrappers";
import { beforeEach, describe, expect, it } from "vitest";
import { getMaxWidth, getMaxHeight } from "../window";

describe("getMaxWidth", () => {
  beforeEach(() => {
    updateSettings({});
  });

  it("should return the default width", () => {
    expect(getMaxWidth()).toEqual(320);
  });

  it("should widen the default when the history mode is stored", () => {
    updateSettings({ [SETTINGS.HISTORY_MODE]: "show" });
    expect(getMaxWidth()).toEqual(370);
  });

  it("should return the width from settings", () => {
    const width = Math.floor(Math.random() * 10 + 1);
    updateSettings({ [SETTINGS.WIDTH]: width });
    expect(getMaxWidth()).toEqual(width);
  });
});

describe("getMaxHeight", () => {
  beforeEach(() => {
    updateSettings({});
  });

  it("should return the default height", () => {
    expect(getMaxHeight()).toEqual(140);
  });

  it("should return the height from settings", () => {
    const height = Math.floor(Math.random() * 10 + 1);
    updateSettings({ [SETTINGS.HEIGHT]: height });
    expect(getMaxHeight()).toEqual(height);
  });
});
