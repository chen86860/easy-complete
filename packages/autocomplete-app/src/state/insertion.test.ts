import { describe, expect, it } from "vitest";
import { escapeInsertion, needsQuoting } from "./insertion";

describe("escapeInsertion", () => {
  it("quotes names that hold a command separator or substitution", () => {
    expect(escapeInsertion("a;touch /tmp/x", false, true)).toBe(
      "'a;touch /tmp/x'",
    );
    expect(escapeInsertion("x`id`", false, true)).toBe("'x`id`'");
    expect(escapeInsertion("feature;sh", false)).toBe("'feature;sh'");
  });

  it("quotes a $ only in a file or folder name", () => {
    expect(escapeInsertion("price$5.txt", false, true)).toBe("'price$5.txt'");
    expect(escapeInsertion("cash$/", true)).toBe("'cash$'/");
    expect(escapeInsertion("$PATH", false, false)).toBe("$PATH");
  });

  it("leaves ordinary names and braces as they were", () => {
    expect(escapeInsertion("stash@{0}", false)).toBe("stash@{0}");
    expect(escapeInsertion("my file.txt", false, true)).toBe("my\\ file.txt");
    expect(escapeInsertion("it's", false, true)).toBe("'it'\"'\"'s'");
  });
});

describe("needsQuoting", () => {
  it("flags only what the shell would act on", () => {
    expect(needsQuoting("main", false)).toBe(false);
    expect(needsQuoting("a;b", false)).toBe(true);
    expect(needsQuoting("a$b", false)).toBe(false);
    expect(needsQuoting("a$b", true)).toBe(true);
  });
});
