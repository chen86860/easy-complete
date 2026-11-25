/**
 * `node scripts/spec-drift.ts [command…]`: compares bundled specs with the
 * installed CLIs. Each command's --help is read by `ec internal help-spec`
 * (the parser behind the --help fallback), two levels deep, and set against
 * the built spec in packages/autocomplete-specs/build. Prints a Markdown
 * report of what the spec is missing and what it lists that --help doesn't.
 *
 * A report, not a check: --help parsing is best effort, and some CLIs list
 * only their common commands, so every line is a lead to verify by hand.
 *
 *   EC_BINARY=target/debug/ec node scripts/spec-drift.ts gh atuin
 *   node scripts/spec-drift.ts --formulae      # Homebrew formulae to install
 *   node scripts/spec-drift.ts --out <dir>     # report.md, and issue.md that fits an issue
 *
 * Run weekly by .github/workflows/spec-drift.yml.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

const REPO = resolve(fileURLToPath(import.meta.url), "../..");
const SPECS = join(REPO, "packages/autocomplete-specs/build");

/** Command, and the Homebrew formula that installs it (the workflow reads this list). */
const CLIS: Array<[command: string, formula: string]> = [
  ["gh", "gh"],
  ["glab", "glab"],
  ["act", "act"],
  ["kubectl", "kubernetes-cli"],
  ["helm", "helm"],
  ["kind", "kind"],
  ["k3d", "k3d"],
  ["minikube", "minikube"],
  ["k9s", "k9s"],
  ["docker", "docker"],
  ["doctl", "doctl"],
  ["flyctl", "flyctl"],
  ["pulumi", "pulumi"],
  ["cloudflared", "cloudflared"],
  ["rclone", "rclone"],
  ["atuin", "atuin"],
  ["mise", "mise"],
  ["direnv", "direnv"],
  ["just", "just"],
  ["tmux", "tmux"],
  ["nvim", "neovim"],
  ["fzf", "fzf"],
  ["zoxide", "zoxide"],
  ["rg", "ripgrep"],
  ["fd", "fd"],
  ["bat", "bat"],
  ["eza", "eza"],
  ["dust", "dust"],
  ["tokei", "tokei"],
  ["hyperfine", "hyperfine"],
  ["jq", "jq"],
  ["yq", "yq"],
  ["gum", "gum"],
  ["http", "httpie"],
  ["wget", "wget"],
  ["uv", "uv"],
  ["ruff", "ruff"],
  ["poetry", "poetry"],
  ["pipx", "pipx"],
  ["black", "black"],
  ["mypy", "mypy"],
  ["llm", "llm"],
  ["yt-dlp", "yt-dlp"],
  ["deno", "deno"],
  ["go", "go"],
  ["cmake", "cmake"],
  ["hugo", "hugo"],
  ["pandoc", "pandoc"],
  ["magick", "imagemagick"],
  ["exiftool", "exiftool"],
];

/** Subcommands read below each command, so one CLI can't run --help hundreds of times. */
const MAX_SUBCOMMANDS = 60;
const IGNORED = new Set(["help", "-h", "--help", "-V", "--version"]);

type Named = {
  name: string | string[];
  hidden?: boolean;
  deprecated?: unknown;
  isPersistent?: boolean;
};
type Node = Named & {
  subcommands?: Node[];
  options?: Named[];
  loadSpec?: unknown;
};

type Diff = {
  path: string;
  missingSubcommands: string[];
  staleSubcommands: string[];
  missingOptions: string[];
  staleOptions: string[];
};

type Result = {
  command: string;
  version?: string;
  skipped?: string;
  diffs: Diff[];
};

const names = (item: Named) =>
  Array.isArray(item.name) ? item.name : [item.name];

const run = (file: string, args: string[], timeout = 10_000) =>
  spawnSync(file, args, {
    encoding: "utf8",
    timeout,
    stdio: ["ignore", "pipe", "pipe"],
    env: { ...process.env, NO_COLOR: "1", PAGER: "cat" },
  });

const ecBinary = () => {
  const candidates = [
    process.env.EC_BINARY,
    join(REPO, "target/release/ec"),
    join(REPO, "target/debug/ec"),
  ];
  const found = candidates.find((path) => path && existsSync(path));
  if (!found) {
    throw new Error("No ec binary: build it (cargo build -p ec_cli --bin ec) or set EC_BINARY");
  }
  return found;
};

const helpSpec = (ec: string, words: string[]): Node | null => {
  const { stdout, status } = run(ec, ["internal", "help-spec", ...words], 30_000);
  if (status !== 0) return null;
  try {
    return JSON.parse(stdout) as Node | null;
  } catch {
    return null;
  }
};

const installed = (command: string) =>
  run("/bin/sh", ["-c", `command -v ${command}`]).status === 0;

const version = (command: string) => {
  const { stdout, stderr, status } = run(command, ["--version"], 5_000);
  if (status !== 0) return undefined;
  return (stdout || stderr).split("\n").find((line) => line.trim())?.trim();
};

const loadSpec = async (command: string): Promise<Node | undefined> => {
  const file = join(SPECS, `${command}.js`);
  if (!existsSync(file)) return undefined;
  const module = await import(pathToFileURL(file).href);
  const spec = module.default;
  return spec && typeof spec === "object" && "name" in spec ? spec : undefined;
};

/** Names in `a` with no name in common with any entry of `b`. */
const unmatched = (a: Named[], b: Named[], skipHidden: boolean) => {
  const known = new Set(b.flatMap(names));
  return a
    .filter((item) => !(skipHidden && (item.hidden || item.deprecated)))
    .filter((item) => !names(item).some((name) => IGNORED.has(name)))
    .filter((item) => !names(item).some((name) => known.has(name)))
    .map((item) => names(item).join(", "));
};

/** `inherited`: the persistent options of the spec's parents, which apply here too. */
const compare = (path: string, real: Node, spec: Node, inherited: Named[] = []): Diff => {
  const realSubs = real.subcommands ?? [];
  const specSubs = spec.subcommands ?? [];
  const realOpts = real.options ?? [];
  const specOpts = spec.options ?? [];
  const knownOpts = [...specOpts, ...inherited];
  return {
    path,
    missingSubcommands: unmatched(realSubs, specSubs, false),
    // An empty list from --help means it wasn't read, not that everything is gone.
    staleSubcommands: realSubs.length ? unmatched(specSubs, realSubs, true) : [],
    missingOptions: unmatched(realOpts, knownOpts, false),
    staleOptions: realOpts.length ? unmatched(specOpts, realOpts, true) : [],
  };
};

const isEmpty = (diff: Diff) =>
  !diff.missingSubcommands.length &&
  !diff.staleSubcommands.length &&
  !diff.missingOptions.length &&
  !diff.staleOptions.length;

const check = async (ec: string, command: string): Promise<Result> => {
  if (!installed(command)) return { command, skipped: "not installed", diffs: [] };
  const spec = await loadSpec(command);
  if (!spec) return { command, skipped: "no single-file built spec", diffs: [] };
  const real = helpSpec(ec, [command]);
  if (!real) return { command, version: version(command), skipped: "--help not read", diffs: [] };

  const diffs = [compare(command, real, spec)];
  const specSubs = spec.subcommands ?? [];
  for (const sub of (real.subcommands ?? []).slice(0, MAX_SUBCOMMANDS)) {
    const [name] = names(sub);
    if (IGNORED.has(name)) continue;
    const specSub = specSubs.find((s) => names(s).includes(name));
    // A subcommand that loads its own spec isn't in this file.
    if (!specSub || specSub.loadSpec) continue;
    const realSub = helpSpec(ec, [command, name]);
    const inherited = (spec.options ?? []).filter((o) => o.isPersistent);
    if (realSub) diffs.push(compare(`${command} ${name}`, realSub, specSub, inherited));
  }
  return { command, version: version(command), diffs: diffs.filter((d) => !isEmpty(d)) };
};

const count = (result: Result, key: keyof Omit<Diff, "path">) =>
  result.diffs.reduce((sum, diff) => sum + diff[key].length, 0);

/** GitHub rejects issue bodies over 65,536 characters. */
const ISSUE_LIMIT = 60_000;

const report = (results: Result[], details = true) => {
  const lines = [
    "Bundled specs compared with each CLI's `--help`, read by the `--help` fallback parser.",
    "Parsing is best effort and some CLIs list only common commands in `--help`, so verify each line before editing a spec.",
    "",
    "| CLI | Version | Missing commands | Stale commands | Missing options | Stale options |",
    "| --- | --- | ---: | ---: | ---: | ---: |",
  ];
  for (const r of results) {
    if (r.skipped) {
      lines.push(`| \`${r.command}\` | ${r.version ?? ""} | ${r.skipped} | | | |`);
      continue;
    }
    lines.push(
      `| \`${r.command}\` | ${r.version ?? ""} | ${count(r, "missingSubcommands")} | ${count(r, "staleSubcommands")} | ${count(r, "missingOptions")} | ${count(r, "staleOptions")} |`,
    );
  }
  if (!details) return lines.join("\n");
  for (const r of results.filter((r) => r.diffs.length)) {
    lines.push("", `<details><summary><code>${r.command}</code></summary>`, "");
    for (const d of r.diffs) {
      lines.push(`**\`${d.path}\`**`, "");
      const list = (label: string, items: string[]) => {
        if (items.length) lines.push(`- ${label}: ${items.map((i) => `\`${i}\``).join(" ")}`);
      };
      list("missing commands", d.missingSubcommands);
      list("stale commands", d.staleSubcommands);
      list("missing options", d.missingOptions);
      list("stale options", d.staleOptions);
      lines.push("");
    }
    lines.push("</details>");
  }
  return lines.join("\n");
};

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    formulae: { type: "boolean", default: false },
    out: { type: "string" },
  },
});

if (values.formulae) {
  console.log(CLIS.map(([, formula]) => formula).join("\n"));
  process.exit(0);
}

const ec = ecBinary();
const commands = positionals.length ? positionals : CLIS.map(([command]) => command);
const results: Result[] = [];
for (const command of commands) {
  results.push(await check(ec, command));
}

const full = report(results);
if (values.out) {
  mkdirSync(values.out, { recursive: true });
  writeFileSync(join(values.out, "report.md"), `${full}\n`);
  const issue =
    full.length <= ISSUE_LIMIT
      ? full
      : `${report(results, false)}\n\nThe details are too long for an issue: see the workflow run's summary.`;
  writeFileSync(join(values.out, "issue.md"), `${issue}\n`);
} else {
  console.log(full);
}
