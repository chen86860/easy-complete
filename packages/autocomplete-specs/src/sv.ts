import { folders } from "@fig/autocomplete-generators";

// Matches sv 1.7.1 (https://svelte.dev/docs/cli/overview) and is not
// versioned. sv has had one major release, 1.0.0, and every 1.x release since
// has only added options and add-on choices, while `sv migrate` on 0.x has not
// worked since svelte-migrate 2.0.0, which it runs. Most people run sv through
// npx or pnpm dlx with no sv on PATH, where version detection would pick the
// newest file anyway. runit also installs a binary named `sv`, which gets
// these completions too.
//
// The add-on catalog in `addons` is static data from sv 1.7.1
// (packages/sv/src/addons in sveltejs/cli). It changes in most minor releases
// and needs updating with each one. Reading `sv add --help` instead would need
// sv on PATH and lose the aliases, value descriptions and option conditions.
// Community add-ons are npm packages, and finding them needs the network, so
// they stay free text.

// The options given so far in an add-on token, by name
type Chosen = Record<string, string | undefined>;
type Condition = (chosen: Chosen) => boolean;

interface AddonValue {
  name: string;
  description?: string;
  when?: Condition;
}

interface AddonOption {
  name: string;
  description: string;
  // Empty for free text
  values: AddonValue[];
  // Comma-separated values
  multiple?: boolean;
  when?: Condition;
}

interface Addon {
  name: string;
  description: string;
  alias?: string;
  options: AddonOption[];
}

// A value whose name says it all, apart from being the default
const bareValue = (name: string, isDefault: boolean): AddonValue =>
  isDefault ? { name, description: "Default" } : { name };

const yesNo = (defaultName: "yes" | "no"): AddonValue[] => [
  bareValue("yes", defaultName === "yes"),
  bareValue("no", defaultName === "no"),
];

const none = (isDefault = false) => bareValue("none", isDefault);

const usesClient = (chosen: Chosen, clients: string[]) =>
  (chosen.ide ?? "").split(",").some((client) => clients.includes(client));

// Clients that take individual tool files; Claude Code only when its Svelte
// plugin is not chosen
const takesTools = (chosen: Chosen) =>
  usesClient(chosen, ["cursor", "gemini", "vscode"]) ||
  (usesClient(chosen, ["claude-code"]) && chosen.delivery !== "plugin");

const addons: Addon[] = [
  { name: "prettier", description: "Prettier code formatter", options: [] },
  { name: "eslint", description: "ESLint linter", options: [] },
  {
    name: "vitest",
    description: "Vitest unit testing",
    options: [
      {
        name: "usages",
        description: "What to test with Vitest",
        multiple: true,
        values: [
          { name: "unit", description: "Unit tests (default)" },
          { name: "component", description: "Component tests (default)" },
        ],
      },
    ],
  },
  {
    name: "playwright",
    description: "Playwright browser testing",
    options: [
      {
        name: "demo",
        description: "Add a demo page with its test (SvelteKit only)",
        values: yesNo("yes"),
      },
    ],
  },
  {
    name: "tailwindcss",
    alias: "tailwind",
    description: "Tailwind CSS",
    options: [
      {
        name: "plugins",
        description: "Official plugins to add",
        multiple: true,
        values: [
          { name: "typography", description: "@tailwindcss/typography" },
          { name: "forms", description: "@tailwindcss/forms" },
          none(true),
        ],
      },
    ],
  },
  {
    name: "enhanced-img",
    description: "Image optimization with @sveltejs/enhanced-img",
    options: [],
  },
  {
    name: "devtools",
    description: "Vite and Svelte development tools",
    options: [
      {
        name: "plugins",
        description: "Other DevTools plugins to add",
        multiple: true,
        values: [
          {
            name: "rolldown",
            description: "@vitejs/devtools-rolldown (default)",
          },
          { name: "vite", description: "@vitejs/devtools-vite (default)" },
          { name: "vitest", description: "@vitejs/devtools-vitest (default)" },
          { name: "oxc", description: "@vitejs/devtools-oxc" },
          none(),
        ],
      },
    ],
  },
  {
    name: "sveltekit-adapter",
    alias: "adapter",
    description: "SvelteKit deployment adapter",
    options: [
      {
        name: "adapter",
        description: "Adapter to deploy with",
        values: [
          { name: "auto", description: "@sveltejs/adapter-auto (default)" },
          { name: "node", description: "@sveltejs/adapter-node" },
          { name: "bun", description: "@sveltejs/adapter-bun" },
          { name: "static", description: "@sveltejs/adapter-static" },
          { name: "vercel", description: "@sveltejs/adapter-vercel" },
          { name: "cloudflare", description: "@sveltejs/adapter-cloudflare" },
          { name: "netlify", description: "@sveltejs/adapter-netlify" },
        ],
      },
      {
        name: "cfTarget",
        description: "Cloudflare product to deploy to",
        when: (chosen) => chosen.adapter === "cloudflare",
        values: [
          {
            name: "workers",
            description: "Workers with static assets, recommended (default)",
          },
          { name: "pages", description: "Pages" },
        ],
      },
    ],
  },
  {
    name: "drizzle",
    description: "Drizzle ORM for SvelteKit",
    options: [
      {
        name: "database",
        description: "Database to use",
        values: [
          { name: "postgresql", description: "PostgreSQL" },
          { name: "mysql", description: "MySQL" },
          { name: "sqlite", description: "SQLite (default)" },
          { name: "d1", description: "Cloudflare D1" },
        ],
      },
      {
        name: "client",
        description: "Database client",
        when: (chosen) =>
          ["postgresql", "mysql", "sqlite"].includes(chosen.database),
        values: [
          {
            name: "postgres.js",
            description: "Postgres.js, recommended (default)",
            when: (chosen) => chosen.database === "postgresql",
          },
          {
            name: "neon",
            description: "Neon, a hosted platform",
            when: (chosen) => chosen.database === "postgresql",
          },
          {
            name: "mysql2",
            description: "mysql2, recommended (default)",
            when: (chosen) => chosen.database === "mysql",
          },
          {
            name: "planetscale",
            description: "PlanetScale, a hosted platform",
            when: (chosen) => chosen.database === "mysql",
          },
          {
            name: "node-sqlite",
            description: "node:sqlite, built into Node.js and Deno",
            when: (chosen) => chosen.database === "sqlite",
          },
          {
            name: "better-sqlite3",
            description: "better-sqlite3, for servers",
            when: (chosen) => chosen.database === "sqlite",
          },
          {
            name: "libsql",
            description: "libSQL, for serverless (default)",
            when: (chosen) => chosen.database === "sqlite",
          },
          {
            name: "turso",
            description: "Turso, a hosted platform",
            when: (chosen) => chosen.database === "sqlite",
          },
        ],
      },
      {
        name: "docker",
        description: "Run the database locally with docker-compose",
        when: (chosen) =>
          (chosen.database === "postgresql" &&
            chosen.client === "postgres.js") ||
          (chosen.database === "mysql" && chosen.client === "mysql2"),
        values: yesNo("no"),
      },
    ],
  },
  {
    name: "better-auth",
    description: "Better Auth authentication for SvelteKit",
    options: [
      {
        name: "demo",
        description: "Demo sign-in methods to include",
        multiple: true,
        values: [
          { name: "password", description: "Email and password (default)" },
          { name: "github", description: "GitHub OAuth" },
          none(),
        ],
      },
    ],
  },
  {
    name: "mdsvex",
    description: "Markdown with Svelte components, via mdsvex",
    options: [
      {
        name: "plugins",
        description: "@mdsvex plugins to add",
        multiple: true,
        values: [
          { name: "anchors", description: "Links on headings (default)" },
          {
            name: "code-blocks",
            description: "Code blocks with a copy button (default)",
          },
          {
            name: "external-links",
            description: "External link policy (default)",
          },
          { name: "figures", description: "Figures and captions (default)" },
          {
            name: "page-data",
            description: "Reading time, excerpts and page facts (default)",
          },
          { name: "toc", description: "Table of contents (default)" },
          { name: "callouts", description: "Notes, tips and warnings" },
          { name: "citations", description: "Citations and bibliographies" },
          { name: "diagram", description: "Mermaid diagrams" },
          { name: "elements", description: "Details, keys, badges and more" },
          { name: "embeds", description: "YouTube and Vimeo players" },
          { name: "emoji", description: "Emoji shortcodes" },
          { name: "link-check", description: "Broken link warnings" },
          { name: "numbering", description: "Numbering and cross-references" },
          {
            name: "references",
            description: "Links for users, issues and commits",
          },
          { name: "steps", description: "Numbered steps" },
          { name: "tabs", description: "Tabs and code groups" },
          none(),
        ],
      },
    ],
  },
  {
    name: "paraglide",
    description: "Paraglide i18n for SvelteKit",
    options: [
      {
        name: "languageTags",
        description:
          "Comma-separated language tags, the first is the base locale",
        values: [],
      },
      {
        name: "demo",
        description: "Add a demo page",
        values: yesNo("yes"),
      },
    ],
  },
  {
    name: "storybook",
    description: "Storybook frontend workshop",
    options: [],
  },
  {
    name: "ai-tools",
    description: "Svelte MCP server, skills and agent instructions",
    options: [
      {
        name: "ide",
        description: "Coding agents to set up",
        multiple: true,
        values: [
          { name: "claude-code", description: "Claude Code" },
          { name: "cursor", description: "Cursor" },
          { name: "gemini", description: "Gemini" },
          { name: "opencode", description: "OpenCode" },
          { name: "pi", description: "Pi" },
          { name: "vscode", description: "VS Code" },
          { name: "other", description: "Other, writes AGENTS.md only" },
        ],
      },
      {
        name: "delivery",
        description: "How Claude Code gets the Svelte tools",
        when: (chosen) => usesClient(chosen, ["claude-code"]),
        values: [
          {
            name: "plugin",
            description: "Svelte plugin, installs and updates itself (default)",
          },
          { name: "tools", description: "Individual tools" },
        ],
      },
      {
        name: "tools",
        description: "Tools to add",
        multiple: true,
        when: takesTools,
        values: [
          { name: "mcp", description: "MCP server (default)" },
          {
            name: "svelte-code-writer",
            description: "Skill (default)",
          },
          {
            name: "svelte-core-bestpractices",
            description: "Skill (default)",
          },
          {
            name: "svelte-file-editor",
            description: "Sub-agent (default)",
          },
          none(),
        ],
      },
      {
        name: "mcpSetup",
        description: "How the MCP server runs",
        when: (chosen) =>
          takesTools(chosen) &&
          (chosen.tools === undefined ||
            chosen.tools.split(",").includes("mcp")),
        values: [
          { name: "local", description: "Local, over stdio" },
          { name: "remote", description: "Remote endpoint (default)" },
        ],
      },
      {
        name: "agentsMd",
        description: "Add AGENTS.md or similar with instructions for agents",
        when: (chosen) => takesTools(chosen) || usesClient(chosen, ["other"]),
        values: yesNo("yes"),
      },
      {
        name: "optInSkills",
        description: "Opt-in skills to add",
        multiple: true,
        when: (chosen) =>
          usesClient(chosen, [
            "claude-code",
            "cursor",
            "gemini",
            "opencode",
            "pi",
            "vscode",
          ]),
        values: [
          {
            name: "svelte-mcp-feedback",
            description:
              "Reports Svelte mistakes you correct to sveltejs/ai-tools",
          },
          none(true),
        ],
      },
    ],
  },
  {
    name: "experimental",
    description: "Svelte and SvelteKit experimental features",
    options: [
      {
        name: "features",
        description: "Experimental features to enable",
        multiple: true,
        values: [
          { name: "async", description: "await in components (default)" },
          {
            name: "remoteFunctions",
            description: "Remote functions (default)",
          },
          { name: "forkPreloads", description: "Forked preloading" },
          none(),
        ],
      },
    ],
  },
];

const findAddon = (name: string) =>
  addons.find((addon) => addon.name === name || addon.alias === name);

const fileAddonPrefix = "file:";

const isFileAddon = (token: string) =>
  token.startsWith(fileAddonPrefix) && !token.includes("=");

// An add-on token is `id=option:value+option:value`, with comma-separated
// values for multiselect options, or `file:<path>` for a local add-on. The
// query term is the part after the last separator, or after the last "/" of
// the path
const queryStart = (token: string): number =>
  isFileAddon(token)
    ? Math.max(token.lastIndexOf("/") + 1, fileAddonPrefix.length)
    : Math.max(...["=", "+", ":", ","].map((s) => token.lastIndexOf(s))) + 1;

// The project's directory usually does not exist yet in `sv create`, so
// "my-app/../addon" is resolved here rather than by the folder listing
const joinPath = (base: string, path: string): string => {
  if (!base || /^[/~$]/.test(path)) {
    return path;
  }
  const segments = `${base}/${path}`.split("/");
  const name = segments.pop();
  const directories: string[] = [];
  for (const segment of segments) {
    const last = directories[directories.length - 1];
    if (segment === ".." && last && last !== "..") {
      directories.pop();
    } else if (segment !== "." && (segment !== "" || !directories.length)) {
      directories.push(segment);
    }
  }
  return [...directories, name].join("/");
};

const addonNameSuggestions = (tokens: string[]): Fig.Suggestion[] => {
  const given = new Set(
    tokens.slice(0, -1).map((token) => findAddon(token.split("=")[0])?.name),
  );
  return [
    ...addons
      .filter(({ name }) => !given.has(name))
      .flatMap(({ name, description, alias }) => [
        { name, description },
        ...(alias
          ? [{ name: alias, description: `Alias of ${name}`, hidden: true }]
          : []),
      ]),
    {
      name: fileAddonPrefix,
      description: "Local add-on in a folder",
      priority: 40,
    },
  ];
};

// Whether an option given in the token passes its condition and those of its
// values against `chosen`
const isCompatible = (option: AddonOption, chosen: Chosen): boolean =>
  (option.when?.(chosen) ?? true) &&
  (chosen[option.name] ?? "")
    .split(",")
    .every(
      (name) =>
        option.values.find((value) => value.name === name)?.when?.(chosen) ??
        true,
    );

// sv checks option conditions against the options given in the same token,
// without defaults, so these do too
const addonOptionSuggestions = (
  addon: Addon,
  optionsText: string,
): Fig.Suggestion[] => {
  const pairs = optionsText.split("+");
  const current = pairs.pop() ?? "";
  const chosen: Chosen = Object.fromEntries(
    pairs.map((pair) => {
      const [name, ...value] = pair.split(":");
      return [name, value.join(":")];
    }),
  );
  const colon = current.indexOf(":");
  if (colon === -1) {
    return addon.options
      .filter(
        ({ name, when }) =>
          chosen[name] === undefined && (when?.(chosen) ?? true),
      )
      .map(({ name, description }) => ({
        name,
        description,
        insertValue: `${name}:`,
      }));
  }
  const option = addon.options.find(
    ({ name }) => name === current.slice(0, colon),
  );
  if (!option || (!option.multiple && current.includes(",", colon))) {
    return [];
  }
  const listed = option.multiple
    ? current
        .slice(colon + 1)
        .split(",")
        .slice(0, -1)
    : [];
  if (listed.includes("none")) {
    return [];
  }
  // sv rejects the whole token when a value makes another option in it
  // incompatible, so such a value is left out, unless none of this option's
  // values would keep that option compatible. A multiselect list can still
  // grow, so its values are not judged this way
  const fits = (value: string, other: AddonOption) =>
    isCompatible(other, { ...chosen, [option.name]: value });
  const constraining = option.multiple
    ? []
    : addon.options.filter(
        (other) =>
          chosen[other.name] !== undefined &&
          option.values.some(({ name }) => fits(name, other)),
      );
  return option.values
    .filter(
      ({ name, when }) =>
        !listed.includes(name) &&
        !(listed.length && name === "none") &&
        (when?.(chosen) ?? true) &&
        constraining.every((other) => fits(name, other)),
    )
    .map(({ name, description }) => ({ name, description }));
};

// No add-on specifier starts with "-", so such a token is left to the options.
// `baseDirectory` gives the directory sv resolves `file:` paths against
const addonGenerator = (
  baseDirectory: (tokens: string[]) => string,
): Fig.Generator => ({
  trigger: (newToken, oldToken) =>
    newToken.startsWith("-") !== oldToken.startsWith("-") ||
    newToken.slice(0, queryStart(newToken)) !==
      oldToken.slice(0, queryStart(oldToken)),
  getQueryTerm: (token) => token.slice(queryStart(token)),
  custom: async (tokens, executeCommand, context) => {
    const token = tokens[tokens.length - 1] ?? "";
    if (token.startsWith("-")) {
      return [];
    }
    if (isFileAddon(token)) {
      const path = token.slice(fileAddonPrefix.length);
      return folders.custom(tokens, executeCommand, {
        ...context,
        searchTerm: joinPath(baseDirectory(tokens), path),
      });
    }
    const separator = token.indexOf("=");
    if (separator === -1) {
      return addonNameSuggestions(tokens);
    }
    const addon = findAddon(token.slice(0, separator));
    return addon
      ? addonOptionSuggestions(addon, token.slice(separator + 1))
      : [];
  },
});

// `sv add` resolves `file:` paths against --cwd
const cwdDirectory = (tokens: string[]): string => {
  const index = Math.max(tokens.lastIndexOf("-C"), tokens.lastIndexOf("--cwd"));
  return index > 0 && index < tokens.length - 2 ? tokens[index + 1] : "";
};

// The positional arguments typed after `subcommand`, read the way commander
// reads them: an option's argument takes the next word, a variadic one every
// word up to the next option, and an inline `--option=value` nothing more
const positionals = (tokens: string[], subcommand: string): string[] => {
  const options =
    commands.find(({ name }) => name === subcommand)?.options ?? [];
  const found: string[] = [];
  let pending: Fig.Arg | undefined;
  for (const token of tokens.slice(tokens.indexOf(subcommand) + 1, -1)) {
    if (token.startsWith("-")) {
      const args = options.find(({ name }) =>
        [name].flat().includes(token),
      )?.args;
      pending = Array.isArray(args) ? args[0] : args;
    } else if (pending) {
      pending = pending.isVariadic ? pending : undefined;
    } else {
      found.push(token);
    }
  }
  return found;
};

// `sv create` resolves `file:` paths against the new project's directory
const projectDirectory = (tokens: string[]): string =>
  positionals(tokens, "create")[0] ?? "";

const packageManagerArg: Fig.Arg = {
  name: "package-manager",
  suggestions: [
    { name: "npm" },
    { name: "pnpm" },
    { name: "yarn" },
    { name: "bun" },
    { name: "deno" },
    {
      name: "pnpm-rush",
      description: "pnpm through Rush (rush-pnpm)",
      priority: 40,
    },
    { name: "nub", priority: 40 },
    { name: "aube", priority: 40 },
    { name: "upm", priority: 40 },
  ],
};

const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Show help",
};

const cwdOption: Fig.Option = {
  name: ["-C", "--cwd"],
  description: "Path to the project root",
  args: { name: "path", template: "folders" },
};

// sv exits with an error when both are given
const installOptions: Fig.Option[] = [
  {
    name: "--install",
    description: "Install dependencies with this package manager",
    exclusiveOn: ["--no-install"],
    args: packageManagerArg,
  },
  {
    name: "--no-install",
    description: "Skip installing dependencies",
    exclusiveOn: ["--install"],
  },
];

// `tasks` lists the tasks that can be named on the command line. Prerequisite
// tasks such as package-json and tsconfig always run and are rejected by name.
// The legacy migrations run svelte-migrate@1 and take no --tasks
const migrations: {
  name: string;
  description: string;
  tasks?: { name: string; description: string }[];
}[] = [
  {
    name: "sveltekit-3",
    description: "SvelteKit 2 to SvelteKit 3",
    tasks: [
      {
        name: "svelte-config",
        description: "Migrate svelte.config.* to vite.config.*",
      },
      {
        name: "environment",
        description: "Migrate to explicit environment variables ($app/env)",
      },
      {
        name: "paths",
        description: "Migrate deprecated $app/paths APIs and path types",
      },
      {
        name: "external-redirects",
        description: "Opt external redirects into the new redirect behavior",
      },
      {
        name: "shallow-routing",
        description: "Migrate shallow routing to goto()",
      },
      {
        name: "params",
        description:
          "Consolidate parameter matchers into src/params.js or src/params.ts",
      },
      {
        name: "imports",
        description: "Move SvelteKit APIs to their new modules",
      },
      {
        name: "lib-alias",
        description: "Replace the $lib alias with #lib subpath imports",
      },
      {
        name: "app-state",
        description: 'Migrate from "$app/stores" to "$app/state"',
      },
      {
        name: "collect-migration-instructions",
        description: "Write instructions for the steps that are not automated",
      },
    ],
  },
  {
    name: "app-state",
    description: '"$app/stores" to "$app/state"',
    tasks: [],
  },
  {
    name: "svelte-5",
    description: "Svelte 4 to Svelte 5 (svelte-migrate@1)",
  },
  {
    name: "self-closing-tags",
    description: "Self-closing tag syntax (svelte-migrate@1)",
  },
  {
    name: "svelte-4",
    description: "Svelte 3 to Svelte 4 (svelte-migrate@1)",
  },
  {
    name: "sveltekit-2",
    description: "SvelteKit 1 to SvelteKit 2 (svelte-migrate@1)",
  },
  {
    name: "package",
    description: "@sveltejs/package 1 to 2 (svelte-migrate@1)",
  },
  {
    name: "routes",
    description: "SvelteKit pre-1.0 routing to 1.0 (svelte-migrate@1)",
  },
];

// --tasks takes every word up to the next option, so the migration comes
// first. An inline --tasks=task ends the list there. "all" and "prerequisite"
// cannot be combined with other tasks, and no task starts with "-"
const tasksGenerator: Fig.Generator = {
  trigger: (newToken, oldToken) =>
    newToken.startsWith("-") !== oldToken.startsWith("-"),
  custom: async (tokens) => {
    const token = tokens[tokens.length - 1] ?? "";
    const inline = token.startsWith("--tasks=");
    const start = tokens.lastIndexOf("--tasks");
    if (!inline && (token.startsWith("-") || start === -1)) {
      return [];
    }
    const [migrationName] = positionals(tokens, "migrate");
    const migration =
      migrations.find(({ name }) => name === migrationName) ?? migrations[0];
    if (!migration.tasks) {
      return [];
    }
    const listed = inline ? [] : tokens.slice(start + 1, -1);
    if (listed.includes("all") || listed.includes("prerequisite")) {
      return [];
    }
    return [
      ...(listed.length
        ? []
        : [
            { name: "all", description: "Run every task" },
            {
              name: "prerequisite",
              description: "Run only the prerequisite tasks",
            },
          ]),
      ...migration.tasks.filter(({ name }) => !listed.includes(name)),
    ];
  },
};

// `sv check` passes everything but -C to the project's own svelte-check, so
// these are svelte-check 4.7.8's options; the newer ones say which release
// they need. `sv check --help` would start svelte-check, so they are static
const svelteCheckOptions: Fig.Option[] = [
  {
    name: "--workspace",
    description: "Directory to check, by default the working directory",
    args: { name: "path", template: "folders" },
  },
  {
    name: "--output",
    description: "Output format",
    args: {
      name: "format",
      suggestions: [
        { name: "human", description: "Readable, without code excerpts" },
        {
          name: "human-verbose",
          description: "Readable, with code excerpts (default)",
        },
        { name: "machine", description: "One line per diagnostic" },
        {
          name: "machine-verbose",
          description: "One JSON object per diagnostic",
        },
      ],
    },
  },
  {
    name: "--watch",
    description: "Keep watching files and rerun the checks on changes",
  },
  {
    name: "--preserveWatchOutput",
    description: "Don't clear the screen in watch mode",
  },
  // These three need a tsconfig or jsconfig, while --no-tsconfig drops it and
  // --ignore works only without one; --tsgo-experimental-api also rejects
  // the other two
  {
    name: "--incremental",
    description:
      "Cache transpiled Svelte files on disk between runs (svelte-check 4.4+)",
    exclusiveOn: ["--tsgo-experimental-api", "--no-tsconfig", "--ignore"],
  },
  {
    name: "--tsgo",
    description: "Use tsgo for TypeScript diagnostics (svelte-check 4.4+)",
    exclusiveOn: ["--tsgo-experimental-api", "--no-tsconfig", "--ignore"],
  },
  {
    name: "--tsgo-experimental-api",
    description: "Use tsgo's experimental API (svelte-check 4.7+)",
    exclusiveOn: ["--incremental", "--tsgo", "--no-tsconfig", "--ignore"],
  },
  {
    name: "--tsconfig",
    description: "tsconfig or jsconfig file whose files to check",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--config",
    description: "svelte.config or vite.config file (svelte-check 4.7+)",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "--no-tsconfig",
    description: "Check only Svelte files, not JavaScript or TypeScript",
    exclusiveOn: ["--incremental", "--tsgo", "--tsgo-experimental-api"],
  },
  {
    name: "--ignore",
    description: "Files and folders to skip, comma-separated",
    dependsOn: ["--no-tsconfig"],
    exclusiveOn: ["--incremental", "--tsgo", "--tsgo-experimental-api"],
    args: { name: "paths" },
  },
  {
    name: "--fail-on-warnings",
    description: "Exit with an error code on warnings too",
  },
  {
    name: "--compiler-warnings",
    description: "Compiler warnings to ignore or fail on",
    args: {
      name: "warnings",
      description: "Comma-separated code:ignore or code:error pairs",
    },
  },
  {
    name: "--diagnostic-sources",
    description: "Diagnostic sources to run, comma-separated (default all)",
    args: {
      name: "sources",
      generators: {
        trigger: ",",
        getQueryTerm: ",",
        custom: async (tokens) => {
          const listed = (tokens[tokens.length - 1] ?? "")
            .replace(/^--diagnostic-sources=/, "")
            .split(",");
          return [
            { name: "js", description: "JavaScript and TypeScript" },
            { name: "svelte", description: "Svelte" },
            { name: "css", description: "CSS" },
          ].filter(({ name }) => !listed.slice(0, -1).includes(name));
        },
      },
    },
  },
  {
    name: "--threshold",
    description: "Lowest severity to report",
    args: {
      name: "level",
      suggestions: [
        { name: "warning", description: "Warnings and errors (default)" },
        { name: "error", description: "Errors only" },
      ],
    },
  },
  { name: "--color", description: "Force colored output" },
  { name: "--no-color", description: "Force plain output" },
  // sv adds its own help only for the long form
  { name: "--help", description: "Show svelte-check's help, then sv check's" },
  { name: "-h", description: "Show svelte-check's help" },
];

const commands: Fig.Subcommand[] = [
  {
    name: "create",
    description: "Scaffold a new Svelte or SvelteKit project",
    args: {
      name: "path",
      description: "Directory to create the project in",
      isOptional: true,
      template: "folders",
    },
    options: [
      {
        name: "--template",
        description: "Template to scaffold",
        args: {
          name: "template",
          suggestions: [
            {
              name: "minimal",
              description: "Barebones SvelteKit app",
            },
            {
              name: "demo",
              description:
                "SvelteKit showcase app with a word game that works without JavaScript",
            },
            {
              name: "library",
              description: "Svelte library packaged with svelte-package",
            },
            {
              name: "addon",
              description: "Empty community add-on, ready to test and publish",
            },
          ],
        },
      },
      {
        name: "--types",
        description: "Add type checking",
        args: {
          name: "lang",
          suggestions: [
            { name: "ts", description: "TypeScript" },
            { name: "jsdoc", description: "JavaScript with JSDoc types" },
          ],
        },
      },
      { name: "--no-types", description: "Don't add type checking" },
      {
        name: "--add",
        description: "Add-ons to include",
        isRepeatable: true,
        exclusiveOn: ["--no-add-ons"],
        args: {
          name: "add-on",
          description: "Add-on, optionally with id=option:value+option:value",
          isVariadic: true,
          generators: addonGenerator(projectDirectory),
        },
      },
      {
        name: "--no-add-ons",
        description: "Don't prompt for add-ons",
        exclusiveOn: ["--add"],
      },
      {
        name: "--addon-name",
        description: "Package name for the addon template",
        args: { name: "name", description: "@org/pkg or pkg" },
      },
      {
        name: "--from-playground",
        description: "Create the project from a Svelte playground",
        args: {
          name: "url",
          description: "https://svelte.dev/playground/<id>",
        },
      },
      {
        name: "--no-dir-check",
        description: "Don't prompt when the directory is not empty",
        isDangerous: true,
      },
      {
        name: "--no-download-check",
        description: "Don't prompt before downloading community add-ons",
      },
      ...installOptions,
      {
        name: "--package-manager",
        description:
          "Package manager to use without prompting, also with --no-install",
        args: packageManagerArg,
      },
      helpOption,
    ],
  },
  {
    name: "add",
    description: "Add add-ons to an existing project",
    args: {
      name: "add-on",
      description: "Add-on, optionally with id=option:value+option:value",
      isOptional: true,
      isVariadic: true,
      generators: addonGenerator(cwdDirectory),
    },
    options: [
      cwdOption,
      {
        name: "--no-git-check",
        description: "Don't prompt when files have uncommitted changes",
      },
      {
        name: "--no-download-check",
        description: "Don't prompt before downloading community add-ons",
      },
      ...installOptions,
      {
        name: "--package-manager",
        description:
          "Package manager to use without prompting, also with --no-install",
        args: packageManagerArg,
      },
      helpOption,
    ],
  },
  {
    name: "migrate",
    description: "Migrate a Svelte or SvelteKit codebase",
    args: {
      name: "migration",
      isOptional: true,
      suggestions: migrations.map(({ name, description }) => ({
        name,
        description,
      })),
    },
    options: [
      cwdOption,
      {
        name: "--files",
        description: "Migrate only the files matching this glob",
        args: { name: "glob", template: "filepaths" },
      },
      {
        name: "--no-git-check",
        description: "Don't prompt when files have uncommitted changes",
      },
      {
        name: "--tasks",
        description: "Tasks to run; without one, list the migration's tasks",
        args: {
          name: "task",
          isOptional: true,
          isVariadic: true,
          generators: tasksGenerator,
        },
      },
      {
        name: "--confirm",
        description: "Skip the final confirmation prompt",
        isDangerous: true,
      },
      ...installOptions,
      helpOption,
    ],
  },
  {
    name: "check",
    description: "Check the project with svelte-check",
    // sv passes on whatever it does not know, such as newer svelte-check flags
    args: { name: "svelte-check argument", isOptional: true, isVariadic: true },
    options: [cwdOption, ...svelteCheckOptions],
  },
];

const completionSpec: Fig.Spec = {
  name: "sv",
  description: "Create and maintain Svelte apps",
  icon: "https://avatars.githubusercontent.com/u/23617963?s=64&v=4",
  subcommands: [
    ...commands,
    {
      name: "help",
      description: "Show help for a command",
      args: {
        name: "command",
        isOptional: true,
        suggestions: commands.map(({ name, description }) => ({
          name,
          description,
        })),
      },
    },
  ],
  options: [
    { name: ["-v", "--version"], description: "Show the version" },
    helpOption,
  ],
};

export default completionSpec;
