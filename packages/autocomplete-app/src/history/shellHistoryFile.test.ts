import { describe, expect, it, vi } from "vitest";
import {
  MAX_HISTORY_BYTES,
  parseBashHistory,
  parseFishHistory,
  parseZshHistory,
  readShellHistoryFile,
  unmetafyZsh,
} from "./shellHistoryFile";

const bytes = (text: string) => new TextEncoder().encode(text);

/** Metafies like zsh: bytes 0x83..0x9f (and NUL) become Meta, byte ^ 32. */
const metafy = (text: string) => {
  const out: number[] = [];
  for (const b of new TextEncoder().encode(text)) {
    if (b === 0 || (b >= 0x83 && b <= 0x9f)) out.push(0x83, b ^ 32);
    else out.push(b);
  }
  return new Uint8Array(out);
};

describe("parseZshHistory", () => {
  it("reads plain and extended entries, oldest first", () => {
    expect(
      parseZshHistory(
        bytes(": 1700000000:0;git status\nls -la\n: 1700000001:3;pnpm test\n"),
      ),
    ).toEqual(["git status", "ls -la", "pnpm test"]);
  });

  it("joins multi-line commands with a literal \\n, like fc -l", () => {
    expect(
      parseZshHistory(bytes(": 1:0;for f in *; do\\\necho $f\\\ndone\nls\n")),
    ).toEqual(["for f in *; do\\necho $f\\ndone", "ls"]);
  });

  it("does not strip an extended prefix from a continuation line", () => {
    expect(parseZshHistory(bytes(": 1:0;echo a\\\n: 2:0;b\n"))).toEqual([
      "echo a\\n: 2:0;b",
    ]);
  });

  it("decodes metafied UTF-8", () => {
    const text = ": 1:0;echo 你好 café\n";
    expect(metafy(text)).not.toEqual(bytes(text));
    expect(parseZshHistory(metafy(text))).toEqual(["echo 你好 café"]);
  });

  it("drops the partial first line of a truncated file", () => {
    expect(parseZshHistory(bytes("tus\n: 1:0;ls\n"), true)).toEqual(["ls"]);
  });
});

describe("unmetafyZsh", () => {
  it("returns the input untouched when there is no Meta byte", () => {
    const input = bytes("plain");
    expect(unmetafyZsh(input)).toBe(input);
  });
});

describe("parseBashHistory", () => {
  it("skips HISTTIMEFORMAT timestamps and blank lines", () => {
    expect(
      parseBashHistory(bytes("#1700000000\ngit log\n\n#1700000001\nmake\n")),
    ).toEqual(["git log", "make"]);
  });
});

describe("parseFishHistory", () => {
  it("lists each command once, at its newest use, oldest first", () => {
    const file = [
      "- cmd: git status",
      "  when: 1",
      "- cmd: ls",
      "  when: 2",
      "  paths:",
      "    - foo",
      "- cmd: git status",
      "  when: 3",
      "",
    ].join("\n");
    expect(parseFishHistory(bytes(file))).toEqual(["ls", "git status"]);
  });

  it("unescapes backslashes and newlines", () => {
    expect(
      parseFishHistory(bytes("- cmd: echo a\\nb \\\\x\n  when: 1\n")),
    ).toEqual(["echo a\\nb \\x"]);
  });
});

describe("readShellHistoryFile", () => {
  it("returns null when the file cannot be read", async () => {
    expect(await readShellHistoryFile("zsh", async () => null)).toBeNull();
    expect(
      await readShellHistoryFile("zsh", async () => {
        throw new Error("ENOENT");
      }),
    ).toBeNull();
  });

  it("reads the default path for the shell", async () => {
    const read = vi.fn(async () => bytes("make\n"));
    expect(await readShellHistoryFile("bash", read)).toEqual(["make"]);
    expect(read).toHaveBeenCalledWith("~/.bash_history");
  });

  it("keeps only the newest MAX_HISTORY_BYTES", async () => {
    const old = "x".repeat(MAX_HISTORY_BYTES);
    const lines = await readShellHistoryFile("bash", async () =>
      bytes(`${old}\nnewest\n`),
    );
    expect(lines).toEqual(["newest"]);
  });
});
