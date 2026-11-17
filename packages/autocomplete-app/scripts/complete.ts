/**
 * `pnpm complete "<line>"`: the suggestions Easy Complete would show for a
 * command line, computed by the real parser and suggestion code against the
 * bundled specs, without the app. For writing specs and reproducing reports.
 *
 *   pnpm complete "git che"
 *   pnpm complete "cargo build --" --cwd ~/code/app
 *   pnpm complete "gh pr " --json
 *
 * The webview's native host is replaced by a small one in this process:
 * commands run here (with this shell's environment), files are read from
 * disk, `spec://localhost/` maps to `bundle/specs/`. Your settings file is
 * read, so `autocomplete.*` settings apply. `ec` is the one built in this
 * repository (`EC_BINARY`, else `target/{release,debug}/ec`), so the --help
 * fallback runs the code you are working on.
 */
import { execFile, spawnSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import { readFile, readdir } from "node:fs/promises";
import { registerHooks } from "node:module";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import {
  type MessageInitShape,
  create,
  fromBinary,
  toBinary,
} from "@bufbuild/protobuf";
import type {
  ClientOriginatedMessage,
  ServerOriginatedMessageSchema as ServerSchema,
} from "@easy-complete/proto/fig";

const REPO = resolve(fileURLToPath(import.meta.url), "../../../..");
const SPECS = join(REPO, "bundle/specs");
const SPEC_URL = "spec://localhost/";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    cwd: { type: "string" },
    json: { type: "boolean", default: false },
    help: { type: "boolean", short: "h", default: false },
  },
});

if (values.help || positionals.length !== 1) {
  console.log(`Usage: pnpm complete "<command line>" [--cwd <dir>] [--json]

Prints the suggestions for the line, as if the cursor were at its end.
A trailing space matters: "git" completes the command, "git " its subcommands.`);
  process.exit(values.help ? 0 : 1);
}

const [line] = positionals;
// pnpm runs package scripts in the package folder; INIT_CWD is where it was called.
const cwd = resolve(values.cwd ?? process.env.INIT_CWD ?? process.cwd());

// The workspace packages are imported from their dist/: build what changed.
const build = spawnSync(
  "pnpm",
  [
    "exec",
    "turbo",
    "run",
    "build",
    "--filter=@easy-complete/autocomplete-app^...",
    "--output-logs=errors-only",
  ],
  { cwd: REPO, encoding: "utf8" },
);
if (build.status !== 0) {
  process.stderr.write(build.stdout + build.stderr);
  process.exit(1);
}

const { ClientOriginatedMessageSchema, ServerOriginatedMessageSchema } =
  await import("@easy-complete/proto/fig");

if (!existsSync(join(SPECS, "index.json"))) {
  console.error(
    "bundle/specs is missing: build it with `node scripts/sync-bundled-specs.mjs`",
  );
  process.exit(1);
}

const ecBinary = (() => {
  if (process.env.EC_BINARY) return process.env.EC_BINARY;
  const built = ["release", "debug"]
    .map((profile) => join(REPO, "target", profile, "ec"))
    .filter((path) => existsSync(path))
    .sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs);
  return built[0] ?? "ec";
})();

// --- `spec://localhost/` -> bundle/specs ----------------------------------

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith(SPEC_URL)) {
      const path = join(SPECS, specifier.slice(SPEC_URL.length));
      return { url: pathToFileURL(path).href, shortCircuit: true };
    }
    // loglevel is CommonJS: Vite gives it named exports, Node doesn't.
    if (specifier === "loglevel" && !context.parentURL?.startsWith("data:")) {
      const { url } = nextResolve(specifier, context);
      const shim = `import log from ${JSON.stringify(url)};
export default log;
export const getLogger = (name) => log.getLogger(name);`;
      return {
        url: `data:text/javascript,${encodeURIComponent(shim)}`,
        shortCircuit: true,
      };
    }
    return nextResolve(specifier, context);
  },
});

const nativeFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = input instanceof Request ? input.url : String(input);
  if (url.startsWith(SPEC_URL)) {
    const body = await readFile(join(SPECS, url.slice(SPEC_URL.length)));
    return new Response(body);
  }
  return nativeFetch(input, init);
};

// --- The webview's native host ------------------------------------------

type Reply = MessageInitShape<typeof ServerSchema>["submessage"];

const expandHome = (path: string) =>
  path === "~" || path.startsWith("~/") ? homedir() + path.slice(1) : path;

const runProcess = (
  request: Extract<
    ClientOriginatedMessage["submessage"],
    { case: "runProcessRequest" }
  >["value"],
) =>
  new Promise<Reply>((done) => {
    const env = { ...process.env };
    for (const { key, value } of request.env) {
      if (value === undefined) delete env[key];
      else env[key] = value;
    }
    const executable =
      request.executable === "ec" ? ecBinary : request.executable;
    const timeout = request.timeout
      ? Number(request.timeout.secs) * 1000 + request.timeout.nanos / 1e6
      : 60_000;
    execFile(
      executable,
      request.arguments,
      {
        cwd: request.workingDirectory || cwd,
        env,
        timeout,
        maxBuffer: 64 * 1024 * 1024,
      },
      (error, stdout, stderr) => {
        if (error && typeof error.code === "string") {
          done({ case: "error", value: `${executable}: ${error.message}` });
          return;
        }
        const exitCode = typeof error?.code === "number" ? error.code : 0;
        done({
          case: "runProcessResponse",
          value: { stdout, stderr, exitCode },
        });
      },
    );
  });

const handle = async (
  submessage: ClientOriginatedMessage["submessage"],
): Promise<Reply> => {
  switch (submessage.case) {
    case "runProcessRequest":
      return runProcess(submessage.value);
    case "readFileRequest": {
      const path = expandHome(submessage.value.path?.path ?? "");
      const text = await readFile(path, "utf8");
      return {
        case: "readFileResponse",
        value: { type: { case: "text", value: text } },
      };
    }
    case "contentsOfDirectoryRequest": {
      const path = expandHome(submessage.value.directory?.path ?? "");
      return {
        case: "contentsOfDirectoryResponse",
        value: { fileNames: await readdir(path) },
      };
    }
    default:
      return { case: "error", value: `${submessage.case}: not available` };
  }
};

const ipc = {
  postMessage(b64: string) {
    const request = fromBinary(
      ClientOriginatedMessageSchema,
      Buffer.from(b64, "base64"),
    );
    handle(request.submessage)
      .catch((err: unknown): Reply => ({ case: "error", value: String(err) }))
      .then((submessage) => {
        const response = create(ServerOriginatedMessageSchema, {
          id: request.id,
          submessage,
        });
        const detail = Buffer.from(
          toBinary(ServerOriginatedMessageSchema, response),
        ).toString("base64");
        document.dispatchEvent(
          new CustomEvent("FigProtoMessageReceived", { detail }),
        );
      });
  },
};

Object.assign(globalThis, {
  window: globalThis,
  document: new EventTarget(),
  ipc,
  fig: { quiet: true, constants: { os: "macos", home: homedir() } },
});

// --- Completion --------------------------------------------------------

const readSettings = () => {
  const path = join(
    homedir(),
    "Library/Application Support/easy-complete/settings.json",
  );
  try {
    return JSON.parse(readFileSync(path, "utf8")) as Record<string, unknown>;
  } catch {
    return {};
  }
};

const logger = (await import("loglevel")).default;
logger.setLevel("silent");

const { updateSettings, getSetting, SETTINGS } = await import(
  "@easy-complete/api-bindings-wrappers"
);
const { getCommand } = await import("@easy-complete/shell-parser");
const { parseArguments, MissingSpecError } = await import(
  "@easy-complete/autocomplete-parser"
);
const { getAllSuggestions, filterSuggestions, isTemplateSuggestion } =
  await import("../src/suggestions/index.ts");
const { getTemplateSuggestions } = await import(
  "../src/generators/templateSuggestionsGenerator.ts"
);
const { getScriptSuggestions } = await import(
  "../src/generators/scriptSuggestionsGenerator.ts"
);
const { getCustomSuggestions } = await import(
  "../src/generators/customSuggestionsGenerator.ts"
);

updateSettings(readSettings());

const command = getCommand(line, {});
if (!command) {
  console.error("Nothing to complete");
  process.exit(1);
}

const context: Fig.ShellContext = {
  currentWorkingDirectory: cwd,
  currentProcess: process.env.SHELL ?? "zsh",
  environmentVariables: process.env as Record<string, string>,
  sshPrefix: "",
};

const start = performance.now();
const result = await parseArguments(command, context).catch((err) => {
  if (err instanceof MissingSpecError) {
    console.log(`No spec for ${command.tokens[0]?.text}, and no --help to read`);
    process.exit(0);
  }
  throw err;
});

type Generator = NonNullable<
  NonNullable<typeof result.currentArg>["generators"]
>[number];

const runGenerator = async (
  generator: Generator,
): Promise<Fig.Suggestion[]> => {
  const generatorContext = {
    ...context,
    annotations: result.annotations.slice(result.commandIndex),
    tokenArray: command.tokens
      .slice(result.commandIndex)
      .map((token) => token.text),
    isDangerous: Boolean(result.currentArg?.isDangerous),
    searchTerm: result.searchTerm,
  };
  if (generator.template) {
    return getTemplateSuggestions(generator, generatorContext);
  }
  if (generator.script) {
    return getScriptSuggestions(
      generator,
      generatorContext,
      getSetting<number>(SETTINGS.SCRIPT_TIMEOUT),
    );
  }
  const suggestions = await getCustomSuggestions(generator, generatorContext);
  if (
    generator.filterTemplateSuggestions &&
    suggestions[0] &&
    isTemplateSuggestion(suggestions[0])
  ) {
    return generator.filterTemplateSuggestions(
      suggestions as Fig.TemplateSuggestion[],
    );
  }
  return suggestions;
};

const generators = result.currentArg?.generators ?? [];
const generatorStates = await Promise.all(
  generators.map(async (generator) => ({
    generator,
    context: {} as never,
    loading: false,
    result: (await runGenerator(generator).catch(() => [])).map((s) => ({
      ...s,
      generator,
    })),
  })),
);

const suggestions = filterSuggestions(
  getAllSuggestions(
    result.currentArg,
    result.completionObj,
    result.passedOptions,
    result.suggestionFlags,
    generatorStates,
    result.annotations,
  ).sort((a, b) => (b.priority ?? 50) - (a.priority ?? 50)),
  result.searchTerm,
  Boolean(getSetting(SETTINGS.FUZZY_SEARCH)),
  result.currentArg?.suggestCurrentToken ??
    Boolean(getSetting(SETTINGS.ALWAYS_SUGGEST_CURRENT_TOKEN)),
  readSettings(),
);
const elapsed = Math.round(performance.now() - start);

const names = (name: string | string[] | undefined) =>
  ([] as string[]).concat(name ?? []).join(", ");

if (values.json) {
  console.log(
    JSON.stringify(
      {
        searchTerm: result.searchTerm,
        currentArg: result.currentArg?.name ?? null,
        suggestions: suggestions.map((s) => ({
          name: s.name,
          type: s.type,
          description: s.description,
          insertValue: s.insertValue,
        })),
      },
      null,
      2,
    ),
  );
} else {
  const spec = names(result.completionObj?.name);
  const arg = result.currentArg?.name
    ? `, argument <${result.currentArg.name}>`
    : "";
  console.log(
    `${spec || "(no spec)"}${arg}, search "${result.searchTerm}": ${suggestions.length} suggestions in ${elapsed} ms`,
  );
  const width = Math.min(
    32,
    Math.max(0, ...suggestions.map((s) => names(s.name).length)),
  );
  for (const s of suggestions) {
    const type = (s.type ?? "").padEnd(10);
    const desc = s.description ? `  ${s.description.split("\n")[0]}` : "";
    console.log(`  ${type} ${names(s.name).padEnd(width)}${desc}`);
  }
}

// Generators may leave timers behind.
process.exit(0);
