// Flags spec code that breaks the command rules in CONTRIBUTING.md:
// commands only read, text the user typed never ends up inside a shell string,
// and nothing reaches the network.
//
// A reviewed exception is allowed with a comment above the offending code:
//   // spec-check-allow <rule>: <reason>
//
// Usage: node scripts/check-spec-commands.ts [file ...]   (defaults to every file in src/)

import { readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import ts from "typescript";

type Rule = "shell-interpolation" | "network" | "denied-command";

interface Finding {
  file: string;
  line: number;
  rule: Rule;
  message: string;
}

const packageDir = resolve(import.meta.dirname, "..");
const srcDir = join(packageDir, "src");

const SHELLS = new Set(["sh", "bash", "zsh", "dash", "fish"]);
// Commands that run the command named in their arguments.
const WRAPPERS = new Set([...SHELLS, "xargs", "env", "nohup", "time", "nice", "timeout"]);
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
// launchctl is denied as a whole except for the read-only listing specs use.
const READ_ONLY_EXCEPTIONS: Record<string, Set<string>> = {
  launchctl: new Set(["list", "print"]),
};

const ALLOW_PATTERN = /spec-check-allow\s+([a-z-]+)\s*:\s*\S/g;

function basename(program: string): string {
  return program.split("/").pop() ?? program;
}

/** Resolves an expression to a constant string, following top-level `const` bindings. */
function constantValue(
  node: ts.Expression,
  constants: Map<string, ts.Expression>,
  seen = new Set<string>(),
): string | undefined {
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return node.text;
  if (ts.isParenthesizedExpression(node)) return constantValue(node.expression, constants, seen);
  if (ts.isTemplateExpression(node)) {
    let text = node.head.text;
    for (const span of node.templateSpans) {
      const value = constantValue(span.expression, constants, seen);
      if (value === undefined) return undefined;
      text += value + span.literal.text;
    }
    return text;
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
    const left = constantValue(node.left, constants, seen);
    const right = constantValue(node.right, constants, seen);
    return left === undefined || right === undefined ? undefined : left + right;
  }
  if (ts.isIdentifier(node) && !seen.has(node.text)) {
    const init = constants.get(node.text);
    if (!init) return undefined;
    seen.add(node.text);
    return constantValue(init, constants, seen);
  }
  return undefined;
}

/** First word of every command in a shell string: after |, ;, &&, ||, $( and backticks. */
function shellCommands(script: string): string[][] {
  return script
    .split(/\|\||&&|[|;\n`]|\$\(|\(/)
    .map((segment) =>
      segment
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0),
    )
    .map((words) => {
      // Skip leading VAR=value assignments and the `command`/`exec` builtins.
      let i = 0;
      while (i < words.length && (/^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) || words[i] === "command" || words[i] === "exec")) {
        i += 1;
      }
      return words.slice(i).map((word) => word.replace(/^\\/, "").replace(/^["']|["']$/g, ""));
    })
    .filter((words) => words.length > 0);
}

function checkFile(file: string): Finding[] {
  const text = readFileSync(file, "utf8");
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const findings: Finding[] = [];
  const rel = relative(packageDir, file);

  // `const` bindings in any scope. A shadowed name could resolve to the wrong one, which
  // is acceptable for a review aid: specs rarely shadow, and a miss only means a false flag.
  const constants = new Map<string, ts.Expression>();
  const collectConstants = (node: ts.Node): void => {
    if (ts.isVariableDeclarationList(node) && node.flags & ts.NodeFlags.Const) {
      for (const decl of node.declarations) {
        if (ts.isIdentifier(decl.name) && decl.initializer) constants.set(decl.name.text, decl.initializer);
      }
    }
    ts.forEachChild(node, collectConstants);
  };
  collectConstants(source);

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

  const checkProgram = (node: ts.Node, program: string, args: (string | undefined)[]) => {
    const name = basename(program);
    if (NETWORK_COMMANDS.has(name)) {
      report(node, "network", `runs \`${name}\`, which reaches the network`);
    } else if (DENIED_COMMANDS.has(name) && !(args[0] && READ_ONLY_EXCEPTIONS[name]?.has(args[0]))) {
      report(node, "denied-command", `runs \`${name}\`, which is not read-only`);
    } else if (name === "git" && args[0] && GIT_WRITE_SUBCOMMANDS.has(args[0])) {
      report(node, "denied-command", `runs \`git ${args[0]}\`, which is not read-only`);
    }
  };

  const checkShellString = (node: ts.Expression) => {
    const script = constantValue(node, constants);
    if (script === undefined) {
      report(node, "shell-interpolation", "builds a shell string from values that are not constant; pass them as separate arguments");
      return;
    }
    for (const words of shellCommands(script)) {
      // Look through commands that run another command: `xargs rm`, `env X=1 kill`, `sh -c 'mv'`.
      let i = 0;
      while (i < words.length - 1 && WRAPPERS.has(basename(words[i]))) {
        i += 1;
        while (i < words.length - 1 && (words[i].startsWith("-") || /^[A-Za-z_][A-Za-z0-9_]*=/.test(words[i]) || /^\d+[smhd]?$/.test(words[i]))) {
          i += 1;
        }
      }
      const [program, ...args] = words.slice(i);
      checkProgram(node, program, args);
    }
  };

  const checkInvocation = (node: ts.Node, program: ts.Expression | undefined, args: readonly ts.Expression[]) => {
    if (!program) return;
    const name = constantValue(program, constants);
    if (name === undefined) return;
    const argValues = args.map((arg) => constantValue(arg, constants));
    if (SHELLS.has(basename(name))) {
      const flag = argValues.findIndex((value) => value !== undefined && /^-[a-z]*c$/.test(value));
      if (flag !== -1 && args[flag + 1]) checkShellString(args[flag + 1]);
      return;
    }
    checkProgram(node, name, argValues);
  };

  // script: [...] | "..." | (tokens) => [...] | "..."
  const checkScriptValue = (value: ts.Expression) => {
    if (ts.isArrayLiteralExpression(value)) {
      const [program, ...args] = value.elements.filter((e): e is ts.Expression => !ts.isSpreadElement(e));
      checkInvocation(value, program, args);
    } else if (ts.isConditionalExpression(value)) {
      checkScriptValue(value.whenTrue);
      checkScriptValue(value.whenFalse);
    } else if (ts.isParenthesizedExpression(value)) {
      checkScriptValue(value.expression);
    } else if (ts.isArrowFunction(value) || ts.isFunctionExpression(value)) {
      if (!ts.isBlock(value.body)) {
        checkScriptValue(value.body);
      } else {
        const visitReturns = (node: ts.Node): void => {
          if (ts.isReturnStatement(node) && node.expression) checkScriptValue(node.expression);
          if (!ts.isFunctionLike(node)) ts.forEachChild(node, visitReturns);
        };
        ts.forEachChild(value.body, visitReturns);
      }
    } else if (
      ts.isStringLiteral(value) ||
      ts.isNoSubstitutionTemplateLiteral(value) ||
      ts.isTemplateExpression(value) ||
      ts.isBinaryExpression(value)
    ) {
      // A string script runs through a shell.
      checkShellString(value);
    }
  };

  const visit = (node: ts.Node): void => {
    if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && node.name.text === "script") {
      checkScriptValue(node.initializer);
    }
    // script(tokens) { ... }
    if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === "script" && node.body) {
      const visitReturns = (child: ts.Node): void => {
        if (ts.isReturnStatement(child) && child.expression) checkScriptValue(child.expression);
        if (!ts.isFunctionLike(child)) ts.forEachChild(child, visitReturns);
      };
      ts.forEachChild(node.body, visitReturns);
    }

    if (ts.isCallExpression(node)) {
      const callee = node.expression;
      const calleeName = ts.isIdentifier(callee) ? callee.text : ts.isPropertyAccessExpression(callee) ? callee.name.text : "";
      if (calleeName === "fetch" || calleeName === "XMLHttpRequest") {
        report(node, "network", `calls \`${calleeName}\``);
      }
      // executeCommand({ command, args }) and the same function under another name.
      const [input] = node.arguments;
      if (/exec/i.test(calleeName) && input && ts.isObjectLiteralExpression(input)) {
        const property = (key: string) =>
          input.properties.find(
            (p): p is ts.PropertyAssignment => ts.isPropertyAssignment(p) && ts.isIdentifier(p.name) && p.name.text === key,
          )?.initializer;
        const command = property("command");
        const args = property("args");
        if (command) {
          const argList =
            args && ts.isArrayLiteralExpression(args)
              ? args.elements.filter((e): e is ts.Expression => !ts.isSpreadElement(e))
              : [];
          checkInvocation(node, command, argList);
        }
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
const findings = files.flatMap(checkFile);

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
