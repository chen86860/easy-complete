import { describe, it, expect } from "vitest";
import { createVersionedSpec } from "../src/versions";

type VersionedSpec = (version?: string) => unknown;
describe("test createVersionedSpec", () => {
  it("test it returns the correct version when versions are correctly sorted", async () => {
    const versionedSpec = createVersionedSpec("fig", ["1.0.0", "2.0.0", "3.0.0"]) as VersionedSpec;
    expect(await versionedSpec()).toStrictEqual({
      versionedSpecPath: "fig/3.0.0",
      version: undefined,
    });
    expect(await versionedSpec("1.3.1")).toStrictEqual({
      versionedSpecPath: "fig/1.0.0",
      version: "1.3.1",
    });
    expect(await versionedSpec("2.0.0")).toStrictEqual({
      versionedSpecPath: "fig/2.0.0",
      version: "2.0.0",
    });
  });

  it("test it returns the correct version when versions are NOT correctly sorted", async () => {
    const versionedSpec = createVersionedSpec("fig", ["2.0.0", "1.0.0", "3.0.0"]) as VersionedSpec;
    expect(await versionedSpec()).toStrictEqual({
      versionedSpecPath: "fig/3.0.0",
      version: undefined,
    });
    expect(await versionedSpec("1.3.1")).toStrictEqual({
      versionedSpecPath: "fig/1.0.0",
      version: "1.3.1",
    });
    expect(await versionedSpec("2.0.0")).toStrictEqual({
      versionedSpecPath: "fig/2.0.0",
      version: "2.0.0",
    });

  it("test it returns the oldest version when the target is older than every version", async () => {
    const versionedSpec = createVersionedSpec("pnpm", [
      "10.0.0",
      "11.0.0",
      "12.0.0",
    ]) as VersionedSpec;
    expect(await versionedSpec("9.15.0")).toStrictEqual({
      versionedSpecPath: "pnpm/10.0.0",
      version: "9.15.0",
    });
    expect(await versionedSpec()).toStrictEqual({
      versionedSpecPath: "pnpm/12.0.0",
      version: undefined,
    });
  });
  });
});
