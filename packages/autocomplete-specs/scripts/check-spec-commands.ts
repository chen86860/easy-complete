// Flags spec code that breaks the command rules in CONTRIBUTING.md:
// commands only read, text the user typed never ends up inside a shell string,
// and nothing reaches the network.
//
// A reviewed exception is allowed with a comment above the offending code:
//   // spec-check-allow <rule>: <reason>
//
// Usage: node scripts/check-spec-commands.ts [file ...]   (defaults to every file in src/)

import { readdirSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

type Rule = "shell-interpolation" | "network" | "denied-command";

interface Finding {
  file: string;
  line: number;
  rule: Rule;
  message: string;
}

/** Command-line words; `undefined` is a word whose value is not constant. */
interface Argv {
  words: (string | undefined)[];
  /** False when a spread or a non-literal array hides some of the words. */
  complete: boolean;
}

const packageDir = resolve(import.meta.dirname, "..");
const srcDir = join(packageDir, "src");

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "fish"]);
// Commands that run the command named in their arguments, with the options that take a
// separate operand.
const WRAPPERS: Record<string, Set<string>> = {
  env: new Set(["-u", "--unset", "-C", "--chdir", "-S", "--split-string"]),
  xargs: new Set(["-I", "-n", "-P", "-d", "-L", "-s", "-E", "-a"]),
  nohup: new Set(),
  time: new Set(["-f", "-o"]),
  nice: new Set(["-n"]),
  timeout: new Set(["-s", "--signal", "-k", "--kill-after"]),
};
const NETWORK_COMMANDS = new Set([
  "curl",
  "wget",
  "nc",
  "ncat",
  "telnet",
  "ssh",
  "scp",
  "sftp",
  "rsync",
  "ftp",
  "http",
  "https",
  "xh",
]);
const DENIED_COMMANDS = new Set([
  "rm",
  "rmdir",
  "mv",
  "cp",
  "dd",
  "ln",
  "touch",
  "mkdir",
  "tee",
  "truncate",
  "shred",
  "chmod",
  "chown",
  "chgrp",
  "sudo",
  "su",
  "doas",
  "kill",
  "killall",
  "pkill",
  "shutdown",
  "reboot",
  "halt",
  "launchctl",
  "osascript",
  "open",
  "eval",
]);
// git subcommands that write to the repository or reach a remote.
const GIT_WRITE_SUBCOMMANDS = new Set([
  "add",
  "am",
  "apply",
  "checkout",
  "clean",
  "clone",
  "commit",
  "fetch",
  "init",
  "merge",
  "mv",
  "pull",
  "push",
  "rebase",
  "reset",
  "restore",
  "rm",
  "switch",
]);
// git options before the subcommand that take a separate operand.
const GIT_OPERAND_OPTIONS = new Set(["-C", "-c", "--git-dir", "--work-tree", "--namespace", "--config-env"]);
// Denied commands that only read with these first arguments: listing jobs or signal names.
const READ_ONLY_EXCEPTIONS: Record<string, Set<string>> = {
  launchctl: new Set(["list", "print"]),
  kill: new Set(["-l", "-L"]),
};
// Shell words that start a command without being the program.
const SHELL_PREFIXES = new Set([
  "if",
  "then",
  "else",
  "elif",
  "fi",
  "while",
  "until",
  "do",
  "done",
  "esac",
  "!",
  "{",
  "}",
  "command",
  "exec",
  "builtin",
]);
// Shell headers whose words are not commands: `for x in a b`, `case $x in`.
const SHELL_HEADERS = new Set(["for", "select", "case"]);
const ASSIGNMENT = /^[A-Za-z_][A-Za-z0-9_]*=/;

const ALLOW_PATTERN = /spec-check-allow\s+([a-z-]+)\s*:\s*\S/g;

function basename(program: string): string {
  return program.split("/").pop() ?? program;
}

/**
 * Splits a shell script into the words of each command it runs, including commands inside
 * `$(...)` and backticks. Quotes and escapes are removed; a substitution inside a word
 * leaves a `$()` placeholder; redirection targets and comments are dropped.
 */
function shellCommands(script: string): string[][] {
  const commands: string[][] = [];
  let i = 0;

  const parse = (until?: ")" | "`"): void => {
    let words: string[] = [];
    let word = "";
    let inWord = false;
    let redirectTarget = false;
    let depth = 0;

    const endWord = () => {
      if (inWord) {
        if (!redirectTarget) words.push(word);
        redirectTarget = false;
      }
      word = "";
      inWord = false;
    };
    const endCommand = () => {
      endWord();
      redirectTarget = false;
      if (words.length > 0) commands.push(words);
      words = [];
    };
    const substitution = (close: ")" | "`") => {
      parse(close);
      word += "$()";
      inWord = true;
    };

    while (i < script.length) {
      const c = script[i];
      if (until === "`" && c === "`") {
        i += 1;
        endCommand();
        return;
      }
      if (c === "'") {
        const end = script.indexOf("'", i + 1);
        const stop = end === -1 ? script.length : end;
        word += script.slice(i + 1, stop);
        inWord = true;
        i = stop + 1;
      } else if (c === '"') {
        i += 1;
        inWord = true;
        while (i < script.length && script[i] !== '"') {
          if (script[i] === "\\" && i + 1 < script.length) {
            word += script[i + 1];
            i += 2;
          } else if (script.startsWith("$(", i)) {
            i += 2;
            substitution(")");
          } else if (script[i] === "`") {
            i += 1;
            substitution("`");
          } else {
            word += script[i];
            i += 1;
          }
        }
        i += 1;
      } else if (c === "\\") {
        if (i + 1 < script.length && script[i + 1] !== "\n") {
          word += script[i + 1];
          inWord = true;
        }
        i += 2;
      } else if (script.startsWith("$(", i)) {
        i += 2;
        substitution(")");
      } else if (c === "`") {
        i += 1;
        substitution("`");
      } else if (c === "#" && !inWord) {
        while (i < script.length && script[i] !== "\n") i += 1;
      } else if (c === " " || c === "\t") {
        endWord();
        i += 1;
      } else if (c === ">" || c === "<" || (c === "&" && script[i + 1] === ">")) {
        // `2>/dev/null`, `>&2`, `&>log`: the file descriptor and the target are not commands.
        if (inWord && /^\d+$/.test(word)) {
          word = "";
          inWord = false;
        } else {
          endWord();
        }
        i += 1;
        while (i < script.length && /[<>&|]/.test(script[i])) i += 1;
        redirectTarget = true;
      } else if (c === "(") {
        depth += 1;
        endCommand();
        i += 1;
      } else if (c === ")") {
        i += 1;
        endCommand();
        if (depth === 0 && until === ")") return;
        depth = Math.max(0, depth - 1);
      } else if (c === ";" || c === "&" || c === "|" || c === "\n") {
        endCommand();
        i += 1;
      } else {
        word += c;
        inWord = true;
        i += 1;
      }
    }
    endCommand();
  };
  parse();

  return commands
    .map((words) => {
      let start = 0;
      while (start < words.length && (ASSIGNMENT.test(words[start]) || SHELL_PREFIXES.has(words[start]))) start += 1;
      const rest = words.slice(start);
      return rest.length > 0 && SHELL_HEADERS.has(rest[0]) ? [] : rest;
    })
    .filter((words) => words.length > 0);
}

function checkFile(source: ts.SourceFile, checker: ts.TypeChecker): Finding[] {
  const text = source.text;
  const findings: Finding[] = [];
  const rel = relative(packageDir, source.fileName);

  /** The initializer of the `const` an identifier refers to, by its lexical binding. */
  const constInitializer = (id: ts.Identifier): ts.Expression | undefined => {
    const symbol =
      ts.isShorthandPropertyAssignment(id.parent) && id.parent.name === id
        ? checker.getShorthandAssignmentValueSymbol(id.parent)
        : checker.getSymbolAtLocation(id);
    const decl = symbol?.valueDeclaration;
    if (
      decl &&
      ts.isVariableDeclaration(decl) &&
      ts.isVariableDeclarationList(decl.parent) &&
      decl.parent.flags & ts.NodeFlags.Const
    ) {
      return decl.initializer;
    }
    return undefined;
  };

  /**
   * Strips parentheses and type assertions and follows `const` bindings. `path` holds the
   * initializers already followed on the way here, so only a real cycle stops the walk.
   */
  const unwrap = (node: ts.Expression, path: ReadonlySet<ts.Node>): [ts.Expression, ReadonlySet<ts.Node>] => {
    for (;;) {
      if (
        ts.isParenthesizedExpression(node) ||
        ts.isAsExpression(node) ||
        ts.isSatisfiesExpression(node) ||
        ts.isNonNullExpression(node) ||
        ts.isTypeAssertionExpression(node)
      ) {
        node = node.expression;
        continue;
      }
      if (ts.isIdentifier(node)) {
        const init = constInitializer(node);
        if (init && !path.has(init)) {
          path = new Set(path).add(init);
          node = init;
          continue;
        }
      }
      return [node, path];
    }
  };

  const constantValue = (expr: ts.Expression, path: ReadonlySet<ts.Node> = new Set()): string | undefined => {
    const [node, nodePath] = unwrap(expr, path);
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
    if (ts.isTemplateExpression(node)) {
      let value = node.head.text;
      for (const span of node.templateSpans) {
        const part = constantValue(span.expression, nodePath);
        if (part === undefined) return undefined;
        value += part + span.literal.text;
      }
      return value;
    }
    if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
      const left = constantValue(node.left, nodePath);
      const right = constantValue(node.right, nodePath);
      return left === undefined || right === undefined ? undefined : left + right;
    }
    return undefined;
  };

  /** The words of an array expression, or `undefined` if it is not an array. */
  const argvOf = (expr: ts.Expression, path: ReadonlySet<ts.Node>): Argv | undefined => {
    const [node, nodePath] = unwrap(expr, path);
    if (!ts.isArrayLiteralExpression(node)) return undefined;
    const words: (string | undefined)[] = [];
    for (const element of node.elements) {
      if (ts.isSpreadElement(element)) {
        const inner = argvOf(element.expression, nodePath);
        if (!inner) return { words, complete: false };
        words.push(...inner.words);
        if (!inner.complete) return { words, complete: false };
      } else {
        words.push(constantValue(element, nodePath));
      }
    }
    return { words, complete: true };
  };

  const allowedAt = (node: ts.Node, rule: Rule): boolean => {
    for (let current: ts.Node | undefined = node; current && current !== source; current = current.parent) {
      const ranges = ts.getLeadingCommentRanges(text, current.getFullStart()) ?? [];
      for (const range of ranges) {
        for (const match of text.slice(range.pos, range.end).matchAll(ALLOW_PATTERN)) {
          if (match[1] === rule) return true;
        }
      }
    }
    return false;
  };

  const report = (node: ts.Node, rule: Rule, message: string) => {
    if (allowedAt(node, rule)) return;
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    findings.push({ file: rel, line: line + 1, rule, message });
  };

  const checkShellScript = (node: ts.Node, script: string | undefined) => {
    if (script === undefined) {
      report(node, "shell-interpolation", "builds a shell string from values that are not constant; pass them as separate arguments");
      return;
    }
    for (const words of shellCommands(script)) checkCommand(node, { words, complete: true });
  };

  const checkCommand = (node: ts.Node, { words, complete }: Argv): void => {
    const [program, ...args] = words;
    if (program === undefined) return;
    const name = basename(program);

    // `-c script`, possibly combined with other flags (`-lc`).
    if (SHELLS.has(name)) {
      const flag = args.findIndex((arg) => arg !== undefined && /^-[A-Za-z]*c[A-Za-z]*$/.test(arg));
      if (flag !== -1 && flag + 1 < args.length) {
        checkShellScript(node, args[flag + 1]);
      } else if (!complete || args.includes(undefined)) {
        report(node, "shell-interpolation", `runs \`${name}\` with arguments that are not constant`);
      }
      return;
    }

    // `env X=1 kill`, `xargs -I {} rm {}`, `timeout 5 curl`: check the command they run.
    const operandOptions = WRAPPERS[name];
    if (operandOptions) {
      let i = 0;
      let durations = name === "timeout" ? 1 : 0;
      while (i < args.length) {
        const arg = args[i];
        if (arg === undefined) break;
        if (operandOptions.has(arg)) i += 2;
        else if (arg.startsWith("-") || (name === "env" && ASSIGNMENT.test(arg))) i += 1;
        else if (durations > 0) {
          durations -= 1;
          i += 1;
        } else break;
      }
      if (i < args.length && args[i] !== undefined) {
        checkCommand(node, { words: args.slice(i), complete });
      } else if (i < args.length || !complete) {
        report(node, "denied-command", `runs \`${name}\` with a command that is not constant`);
      }
      return;
    }

    if (name === "git") {
      let i = 0;
      while (i < args.length && args[i]?.startsWith("-")) i += GIT_OPERAND_OPTIONS.has(args[i] ?? "") ? 2 : 1;
      const subcommand = args[i];
      if (i < args.length ? subcommand === undefined : !complete) {
        report(node, "denied-command", "runs `git` with a subcommand that is not constant");
      } else if (subcommand && GIT_WRITE_SUBCOMMANDS.has(subcommand)) {
        report(node, "denied-command", `runs \`git ${subcommand}\`, which is not read-only`);
      }
      return;
    }

    if (NETWORK_COMMANDS.has(name)) {
      report(node, "network", `runs \`${name}\`, which reaches the network`);
    } else if (DENIED_COMMANDS.has(name) && !(args[0] && READ_ONLY_EXCEPTIONS[name]?.has(args[0]))) {
      report(node, "denied-command", `runs \`${name}\`, which is not read-only`);
    }
  };

  // { command, args }, as passed to executeCommand or returned as a generator script.
  const checkCommandInput = (node: ts.Node, input: ts.ObjectLiteralExpression, path: ReadonlySet<ts.Node>) => {
    const property = (key: string): ts.Expression | undefined => {
      for (const p of input.properties) {
        if (!p.name || !ts.isIdentifier(p.name) || p.name.text !== key) continue;
        if (ts.isPropertyAssignment(p)) return p.initializer;
        if (ts.isShorthandPropertyAssignment(p)) return p.name;
      }
      return undefined;
    };
    const command = property("command");
    if (!command) return;
    const args = property("args");
    const argv = args ? (argvOf(args, path) ?? { words: [], complete: false }) : { words: [], complete: true };
    checkCommand(node, { words: [constantValue(command, path), ...argv.words], complete: argv.complete });
  };

  const checkReturns = (body: ts.Block, path: ReadonlySet<ts.Node>) => {
    const visitReturns = (node: ts.Node): void => {
      if (ts.isReturnStatement(node) && node.expression) checkScript(node.expression, path);
      if (!ts.isFunctionLike(node)) ts.forEachChild(node, visitReturns);
    };
    ts.forEachChild(body, visitReturns);
  };

  // script: [...] | "..." | { command, args } | (tokens) => any of those
  const checkScript = (expr: ts.Expression, path: ReadonlySet<ts.Node> = new Set()): void => {
    const [value, valuePath] = unwrap(expr, path);
    if (ts.isArrayLiteralExpression(value)) {
      checkCommand(expr, argvOf(value, valuePath) ?? { words: [], complete: false });
    } else if (ts.isObjectLiteralExpression(value)) {
      checkCommandInput(expr, value, valuePath);
    } else if (ts.isConditionalExpression(value)) {
      checkScript(value.whenTrue, valuePath);
      checkScript(value.whenFalse, valuePath);
    } else if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) {
      if (ts.isBlock(value.body)) checkReturns(value.body, valuePath);
      else checkScript(value.body, valuePath);
    } else if (
      ts.isStringLiteral(value) ||
      ts.isNoSubstitutionTemplateLiteral(value) ||
      ts.isTemplateExpression(value) ||
      (ts.isBinaryExpression(value) && value.operatorToken.kind === ts.SyntaxKind.PlusToken)
    ) {
      // A string script runs through a shell.
      checkShellScript(expr, constantValue(value, valuePath));
    }
  };

  const isScriptName = (name: ts.PropertyName) => ts.isIdentifier(name) && name.text === "script";

  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node) && isScriptName(node.name)) checkScript(node.initializer);
    if (ts.isShorthandPropertyAssignment(node) && isScriptName(node.name)) checkScript(node.name);
    // script(tokens) { ... }
    if (ts.isMethodDeclaration(node) && isScriptName(node.name) && node.body) checkReturns(node.body, new Set());

    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const calleeName = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : "";
      if (calleeName === "fetch" || calleeName === "XMLHttpRequest") {
        report(node, "network", `calls \`${calleeName}\``);
      }
      // executeCommand({ command, args }) and the same function under another name.
      const [input] = node.arguments;
      if (/exec/i.test(calleeName) && input) {
        const [value, path] = unwrap(input, new Set());
        if (ts.isObjectLiteralExpression(value)) checkCommandInput(node, value, path);
      }
    }

    if (ts.isNewExpression(node) && ts.isIdentifier(node.expression) && node.expression.text === "XMLHttpRequest") {
      report(node, "network", "creates an `XMLHttpRequest`");
    }

    ts.forEachChild(node, visit);
  };
  visit(source);
  return findings;
}

function listSpecFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listSpecFiles(path);
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [path] : [];
  });
}

const files = process.argv.length > 2 ? process.argv.slice(2).map((f) => resolve(f)) : listSpecFiles(srcDir);
// One program for every file, so identifiers resolve to their lexical bindings. Imports
// are not followed: a value imported from another file counts as not constant.
const program = ts.createProgram(files, { noResolve: true, noLib: true, types: [] });
const checker = program.getTypeChecker();
const findings = files.flatMap((file) => {
  const source = program.getSourceFile(file);
  return source ? checkFile(source, checker) : [];
});

for (const finding of findings) {
  console.error(`${finding.file}:${finding.line}  ${finding.rule}  ${finding.message}`);
}
if (findings.length > 0) {
  console.error(
    `\n${findings.length} problem(s). Fix them, or after review add \`// spec-check-allow <rule>: <reason>\` above the code.`,
  );
  process.exitCode = 1;
} else {
  console.log(`Checked commands in ${files.length} spec file(s).`);
}
