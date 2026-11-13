import {
  executeLoginShell,
  SETTINGS,
  updateSettings,
} from "@easy-complete/api-bindings-wrappers";
import { getCommand } from "@easy-complete/shell-parser";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  countEqualOptions,
  flattenAnnotations,
  optionsAreEqual,
  parseArguments,
  TokenType,
} from "../src/parseArguments";
import * as Internal from "@easy-complete/shared/internal";

vi.mock(
  import("@easy-complete/api-bindings-wrappers"),
  async (importOriginal) => ({
    ...(await importOriginal()),
    executeLoginShell: vi.fn(),
  }),
);

const contextFor = (currentProcess: string): Fig.ShellContext => ({
  currentWorkingDirectory: "",
  currentProcess,
  sshPrefix: "",
  environmentVariables: {},
});

const names = (suggestions: unknown) =>
  (suggestions as Fig.Suggestion[]).map((suggestion) => suggestion.name);

// Runs the generator behind first-token completion (typing the command name itself).
const listCommands = async (processName: string, exec = vi.fn()) => {
  const context = contextFor(processName);
  const result = await parseArguments(getCommand("gi", {}), context);
  const generator = result.currentArg?.generators?.[0];
  if (!generator?.custom) throw new Error("no first-token generator");
  const suggestions = await generator.custom(["gi"], exec, {
    ...context,
    searchTerm: "gi",
  } as Fig.GeneratorContext);
  return { suggestions, exec };
};

describe("first-token completion", () => {
  beforeEach(() => {
    updateSettings({ [SETTINGS.FIRST_COMMAND_COMPLETION]: true });
    (executeLoginShell as Mock).mockReset();
  });

  it("offers no generator when the setting is off", async () => {
    updateSettings({ [SETTINGS.FIRST_COMMAND_COMPLETION]: false });
    const result = await parseArguments(
      getCommand("gi", {}),
      contextFor("zsh"),
    );
    expect(result.completionObj.name).toContain("firstTokenSpec");
    expect(result.currentArg).toBeNull();
  });

  it("lists commands and aliases from a zsh login shell, without duplicates or blanks", async () => {
    (executeLoginShell as Mock).mockResolvedValue("git\n  gh  \n\ngit\nll\n");
    const { suggestions, exec } = await listCommands("/bin/zsh");

    expect(suggestions).toEqual([
      { name: "git", type: "subcommand" },
      { name: "gh", type: "subcommand" },
      { name: "ll", type: "subcommand" },
    ]);
    expect(executeLoginShell).toHaveBeenCalledWith(
      expect.objectContaining({ executable: "/bin/zsh", timeout: 1500 }),
    );
    expect(exec).not.toHaveBeenCalled();
  });

  it("asks bash for compgen output", async () => {
    (executeLoginShell as Mock).mockResolvedValue("ls\ncd\n");
    const { suggestions } = await listCommands("/bin/bash");

    expect(names(suggestions)).toEqual(["ls", "cd"]);
    expect(executeLoginShell).toHaveBeenCalledWith(
      expect.objectContaining({ command: "compgen -ac" }),
    );
  });

  it("drops the descriptions fish prints after a tab", async () => {
    (executeLoginShell as Mock).mockResolvedValue(
      "git\tthe stupid content tracker\nfish_config\n",
    );
    const { suggestions } = await listCommands("/opt/homebrew/bin/fish");

    expect(names(suggestions)).toEqual(["git", "fish_config"]);
  });

  it.each([
    // biome-ignore lint/suspicious/noTemplateCurlyInString: zsh parameter expansion, not a JS template
    ["/bin/zsh", "/bin/zsh", "print -rl -- ${(k)commands}"],
    ["/bin/bash", "/bin/bash", "compgen -ac"],
    ["/usr/local/bin/fish", "/usr/local/bin/fish", 'complete -C ""'],
  ])(
    "falls back to a non-login %s when the login shell lists nothing",
    async (processName, command, script) => {
      (executeLoginShell as Mock).mockResolvedValue("");
      const exec = vi.fn().mockResolvedValue({ stdout: "git\tdesc\nnpm\n" });
      const { suggestions } = await listCommands(processName, exec);

      expect(exec).toHaveBeenCalledWith({ command, args: ["-c", script] });
      expect(names(suggestions)).toEqual(
        processName.includes("fish") ? ["git", "npm"] : ["git\tdesc", "npm"],
      );
    },
  );

  it("falls back when the login shell fails", async () => {
    (executeLoginShell as Mock).mockRejectedValue(new Error("timed out"));
    const exec = vi.fn().mockResolvedValue({ stdout: "git\n" });
    const { suggestions } = await listCommands("/bin/zsh", exec);

    expect(names(suggestions)).toEqual(["git"]);
  });

  it("uses bash for a shell it does not know, and skips the login shell with no process name", async () => {
    const exec = vi.fn().mockResolvedValue({ stdout: "ls\n" });

    (executeLoginShell as Mock).mockResolvedValue("");
    await listCommands("/bin/nu", exec);
    expect(executeLoginShell).not.toHaveBeenCalled();
    expect(exec).toHaveBeenLastCalledWith({
      command: "/bin/bash",
      args: ["-c", "compgen -ac"],
    });

    await listCommands("", exec);
    expect(executeLoginShell).not.toHaveBeenCalled();
    expect(exec).toHaveBeenCalledTimes(2);
  });

  it("returns nothing when both listings fail", async () => {
    (executeLoginShell as Mock).mockRejectedValue(new Error("no login"));
    const exec = vi.fn().mockRejectedValue(new Error("no exec"));
    const { suggestions } = await listCommands("/bin/zsh", exec);

    expect(suggestions).toEqual([]);
  });
});

describe("annotation and option helpers", () => {
  it("flattenAnnotations expands composite tokens in place", () => {
    const option = { type: TokenType.Option, text: "-a" } as const;
    const arg = { type: TokenType.OptionArg, text: "b" } as const;
    const none = { type: TokenType.None, text: "x" } as const;

    expect(
      flattenAnnotations([
        none,
        { type: TokenType.Composite, text: "-ab", subtokens: [option, arg] },
      ] as Parameters<typeof flattenAnnotations>[0]),
    ).toEqual([none, option, arg]);
  });

  it("optionsAreEqual matches on any shared name", () => {
    const option = (...name: string[]) => ({ name }) as Internal.Option;

    expect(optionsAreEqual(option("-h", "--help"), option("--help"))).toBe(
      true,
    );
    expect(optionsAreEqual(option("-h"), option("-v"))).toBe(false);
    expect(
      countEqualOptions(option("-v"), [
        option("-v", "--verbose"),
        option("-h"),
        option("-v"),
      ]),
    ).toBe(2);
  });
});
