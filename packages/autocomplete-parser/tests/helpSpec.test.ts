import {
  SETTINGS,
  executeCommand,
  updateSettings,
} from "@easy-complete/api-bindings-wrappers";
import { SpecLocationSource } from "@easy-complete/shared/utils";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { loadHelpSpec } from "../src/helpSpec";
import { loadSubcommandCached } from "../src/loadSpec";
import { resetCaches } from "../src/caches";
import { MissingSpecError } from "../src/errors";

vi.mock("../src/loadHelpers", () => ({
  bundledSpecExists: vi.fn().mockResolvedValue(false),
  importSpecFromFile: vi.fn().mockRejectedValue(new Error("no file")),
  isDiffVersionedSpec: vi.fn().mockResolvedValue(false),
}));

vi.mock("@easy-complete/api-bindings-wrappers", async () => ({
  ...(await vi.importActual("@easy-complete/api-bindings-wrappers")),
  executeCommand: vi.fn(),
}));

const exec = executeCommand as Mock;

const helpSpecs: Record<string, unknown> = {
  tool: {
    name: "tool",
    subcommands: [{ name: ["serve", "s"], description: "Serve" }],
    options: [{ name: ["-v", "--verbose"] }],
  },
  "tool serve": {
    name: "serve",
    options: [{ name: "--port", args: { name: "port" } }],
  },
};

const respond = ({ args }: { args: string[] }) => {
  const key = args.slice(2).join(" ");
  return Promise.resolve({
    status: 0,
    stdout: JSON.stringify(helpSpecs[key] ?? null),
    stderr: "",
  });
};

const location = { name: "tool", type: SpecLocationSource.GLOBAL };

/** The `loadSpec` of the first subcommand of `tool`'s help spec. */
const firstSubcommandLoader = async () => {
  const spec = await loadHelpSpec(["tool"]);
  const [first] = (spec?.subcommands ?? []) as Fig.Subcommand[];
  return first?.loadSpec as () => Promise<Fig.Subcommand>;
};

beforeEach(() => {
  resetCaches();
  updateSettings({});
  exec.mockReset();
  exec.mockImplementation(respond);
});

describe("loadHelpSpec", () => {
  it("asks ec for the spec", async () => {
    const spec = await loadHelpSpec(["tool"]);
    expect(spec?.name).toBe("tool");
    expect(exec).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "ec",
        args: ["internal", "help-spec", "tool"],
      }),
    );
  });

  it("loads a subcommand's --help once it is entered", async () => {
    const loaded = await (await firstSubcommandLoader())();
    expect(loaded.options).toEqual([
      { name: "--port", args: { name: "port" } },
    ]);
    expect(exec).toHaveBeenLastCalledWith(
      expect.objectContaining({
        args: ["internal", "help-spec", "tool", "serve"],
      }),
    );
  });

  it("keeps the subcommand when its --help gives nothing", async () => {
    exec.mockImplementation(({ args }: { args: string[] }) =>
      args.length > 3
        ? Promise.resolve({ status: 0, stdout: "null", stderr: "" })
        : respond({ args }),
    );
    const loaded = await (await firstSubcommandLoader())();
    expect(loaded).toMatchObject({
      name: ["serve", "s"],
      description: "Serve",
    });
  });

  it("remembers a command without one", async () => {
    expect(await loadHelpSpec(["other"])).toBeUndefined();
    expect(await loadHelpSpec(["other"])).toBeUndefined();
    expect(exec).toHaveBeenCalledTimes(1);
  });

  it("survives ec failing", async () => {
    exec.mockRejectedValue(new Error("not found"));
    expect(await loadHelpSpec(["tool"])).toBeUndefined();
    exec.mockResolvedValue({ status: 0, stdout: "not json", stderr: "" });
    expect(await loadHelpSpec(["tool2"])).toBeUndefined();
  });

  it("never passes anything but plain words", async () => {
    for (const words of [
      ["-rf"],
      ["$(x)"],
      ["a b"],
      ["php/bin-console"],
      ["a", "b", "c", "d", "e"],
    ]) {
      expect(await loadHelpSpec(words)).toBeUndefined();
    }
    expect(exec).not.toHaveBeenCalled();
  });
});

describe("loadSubcommandCached", () => {
  it("falls back to --help when asked", async () => {
    const spec = await loadSubcommandCached(
      location,
      undefined,
      undefined,
      true,
    );
    expect(spec.subcommands.serve?.name).toEqual(["serve", "s"]);
    expect(spec.subcommands.s).toBe(spec.subcommands.serve);
    expect(spec.options["--verbose"]).toBeDefined();
  });

  it("doesn't by default (history)", async () => {
    await expect(loadSubcommandCached(location)).rejects.toBeInstanceOf(
      MissingSpecError,
    );
    expect(exec).not.toHaveBeenCalled();
  });

  it("doesn't when the setting is off", async () => {
    updateSettings({ [SETTINGS.HELP_FALLBACK]: false });
    await expect(
      loadSubcommandCached(location, undefined, undefined, true),
    ).rejects.toBeInstanceOf(MissingSpecError);
    expect(exec).not.toHaveBeenCalled();
  });

  it("stops once the setting is turned off", async () => {
    await loadSubcommandCached(location, undefined, undefined, true);
    const loadServe = await firstSubcommandLoader();
    updateSettings({ [SETTINGS.HELP_FALLBACK]: false });
    exec.mockClear();
    await expect(
      loadSubcommandCached(location, undefined, undefined, true),
    ).rejects.toBeInstanceOf(MissingSpecError);
    expect((await loadServe()).options).toBeUndefined();
    expect(exec).not.toHaveBeenCalled();
  });

  it("doesn't hand a cached --help spec to history", async () => {
    await loadSubcommandCached(location, undefined, undefined, true);
    await expect(loadSubcommandCached(location)).rejects.toBeInstanceOf(
      MissingSpecError,
    );
  });

  it("doesn't for a disabled command", async () => {
    updateSettings({ [SETTINGS.DISABLE_FOR_COMMANDS]: ["tool"] });
    await expect(
      loadSubcommandCached(location, undefined, undefined, true),
    ).rejects.toThrow();
    expect(exec).not.toHaveBeenCalled();
  });
});
