const HOUR_IN_MILLISECONDS = 3600000;

/*
 *  Generators
 */

/** Tools that are installed (or at least known) locally, e.g. `node`, `python` */
const installedToolsGenerator: Fig.Generator = {
  script: ["mise", "ls", "--installed", "--no-header"],
  postProcess: (output) => {
    const names = new Set<string>();
    for (const line of output.split("\n")) {
      const name = line.trim().split(/\s+/)[0];
      if (name) {
        names.add(name);
      }
    }
    return [...names].map((name) => ({
      name,
      description: "Installed tool",
      icon: "fig://icon?type=package",
    }));
  },
};

/** Installed tool versions, e.g. `node@20.0.0` */
const installedToolVersionsGenerator: Fig.Generator = {
  script: ["mise", "ls", "--installed", "--no-header"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/\s+/))
      .filter(([name, version]) => name && version)
      .map(([name, version]) => ({
        name: `${name}@${version}`,
        description: "Installed tool version",
        icon: "fig://icon?type=package",
      })),
};

/** Every tool shorthand known to the registry, e.g. `ripgrep` */
const registryToolsGenerator: Fig.Generator = {
  script: ["mise", "registry"],
  cache: {
    ttl: HOUR_IN_MILLISECONDS,
  },
  postProcess: (output) =>
    output
      .split("\n")
      .slice(1)
      .map((line) => line.trim().split(/\s+/))
      .filter(([name]) => name)
      .map(([name, backend]) => ({
        name,
        description: backend ?? "Tool",
        icon: "fig://icon?type=package",
      })),
};

/** Remote versions of the tool typed just before the cursor */
const remoteToolVersionsGenerator: Fig.Generator = {
  script: (context) => {
    const token = context[context.length - 1] ?? "";
    const tool = token.split("@")[0];
    if (!tool) {
      return undefined;
    }
    return ["mise", "ls-remote", tool];
  },
  cache: {
    ttl: HOUR_IN_MILLISECONDS,
  },
  trigger: "@",
  getQueryTerm: "@",
  postProcess: (output, context) => {
    const tool = (context[context.length - 1] ?? "").split("@")[0];
    return output
      .split("\n")
      .reverse()
      .map((version) => version.trim())
      .filter(Boolean)
      .map((version) => ({
        name: `${tool}@${version}`,
        description: "Version",
        icon: "fig://icon?type=commit",
      }));
  },
};

const toolAtVersionGenerators: Fig.Generator[] = [
  registryToolsGenerator,
  remoteToolVersionsGenerator,
];

const installedToolAtVersionGenerators: Fig.Generator[] = [
  installedToolsGenerator,
  installedToolVersionsGenerator,
];

/** Tasks defined in mise.toml or as standalone scripts */
const tasksGenerator: Fig.Generator = {
  script: ["mise", "tasks", "ls", "--name-only"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((task) => task.trim())
      .filter(Boolean)
      .map((task) => ({
        name: task,
        description: "Task",
        icon: "fig://icon?type=command",
      })),
};

const settingsGenerator: Fig.Generator = {
  script: ["mise", "settings", "ls", "--all", "--no-header"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean)
      .map((name) => ({
        name,
        description: "Setting",
        icon: "fig://icon?type=option",
      })),
};

const installedPluginsGenerator: Fig.Generator = {
  script: ["mise", "plugins", "ls"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter(Boolean)
      .map((name) => ({
        name,
        description: "Plugin",
        icon: "fig://icon?type=package",
      })),
};

/*
 *  Shared args/options
 */
const shellTypes = [
  "bash",
  "elvish",
  "fish",
  "nu",
  "xonsh",
  "zsh",
  "pwsh",
  "powershell",
];

const toolArg: Fig.Arg = {
  name: "tool@version",
  description: "Tool(s) e.g.: node@20",
  generators: toolAtVersionGenerators,
  isVariadic: true,
  isOptional: true,
};

const installedToolArg: Fig.Arg = {
  name: "installed_tool@version",
  description: "Installed tool(s)",
  generators: installedToolAtVersionGenerators,
  isVariadic: true,
  isOptional: true,
};

const jobsOption: Fig.Option = {
  name: ["-j", "--jobs"],
  description: "Number of jobs to run in parallel",
  args: { name: "jobs", default: "4" },
};

const dryRunOption: Fig.Option = {
  name: ["-n", "--dry-run"],
  description: "Show what would be done without doing it",
};

const globalConfigOption: Fig.Option = {
  name: ["-g", "--global"],
  description: "Use the global config file instead of the local one",
};

const jsonOption: Fig.Option = {
  name: ["-J", "--json"],
  description: "Output in JSON format",
};

const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Print help",
  priority: 1,
};

const globalOptions: Fig.Option[] = [
  {
    name: ["-C", "--cd"],
    description: "Change directory before running command",
    args: { name: "dir", template: "folders" },
    isPersistent: true,
  },
  {
    name: ["-E", "--env"],
    description: "Set the environment for loading `mise.<ENV>.toml`",
    args: { name: "env" },
    isPersistent: true,
  },
  {
    name: ["-q", "--quiet"],
    description: "Suppress non-error messages",
    isPersistent: true,
  },
  {
    name: ["-v", "--verbose"],
    description: "Show extra output (use -vv for even more)",
    isRepeatable: 2,
    isPersistent: true,
  },
  {
    name: ["-y", "--yes"],
    description: "Answer yes to all confirmation prompts",
    isPersistent: true,
  },
  {
    name: "--locked",
    description: "Require lockfile URLs to be present during installation",
    isPersistent: true,
  },
  {
    name: "--silent",
    description: "Suppress all task output and mise non-error messages",
    isPersistent: true,
  },
  {
    name: ["-j", "--jobs"],
    description: "How many jobs to run in parallel",
    args: { name: "jobs", default: "8" },
  },
  {
    name: "--raw",
    description:
      "Read/write directly to stdin/stdout/stderr instead of by line",
  },
  helpOption,
];

const minimumReleaseAgeOption: Fig.Option = {
  name: "--minimum-release-age",
  description: "Only consider versions released before this date/duration",
  args: { name: "minimum_release_age" },
};

/*
 *  Subcommands
 */
const completionSpec: Fig.Spec = {
  name: "mise",
  description:
    "mise prepares your development environment before each command runs",
  args: {
    name: "task",
    description: "Task to run. Shorthand for `mise tasks run <TASK>`",
    generators: tasksGenerator,
    isOptional: true,
  },
  subcommands: [
    {
      name: "activate",
      description: "Initializes mise in the current shell session",
      args: {
        name: "shell_type",
        description: "Shell type to generate the script for",
        suggestions: shellTypes,
        isOptional: true,
      },
      options: [
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: "--no-hook-env",
          description: "Do not automatically call hook-env",
        },
        {
          name: "--shims",
          description: "Use shims instead of modifying PATH",
        },
        helpOption,
      ],
    },
    {
      name: ["backends", "b", "backend", "backend-list"],
      description: "Manage backends",
      subcommands: [
        {
          name: ["ls", "list"],
          description: "List built-in backends",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: "bin-paths",
      description: "List all the active runtime bin paths",
      args: installedToolArg,
      options: [
        {
          name: "--bin-names",
          description: "Output executable names instead of bin directories",
        },
        jsonOption,
        helpOption,
      ],
    },
    {
      name: ["bootstrap", "bs"],
      description: "Set up a machine for the current config in one command",
      options: [helpOption],
    },
    {
      name: "cache",
      description: "Manage the mise cache",
      subcommands: [
        {
          name: ["clear", "c", "clean"],
          description: "Deletes all cache files in mise",
          options: [helpOption],
        },
        {
          name: ["path", "dir"],
          description: "Show the cache directory path",
          options: [helpOption],
        },
        {
          name: ["prune", "p"],
          description: "Removes stale mise cache files",
          options: [helpOption],
        },
        {
          name: "task",
          description: "Inspect output cache entries for a task",
          args: {
            name: "task",
            generators: tasksGenerator,
            isOptional: true,
          },
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: ["completion", "complete", "completions"],
      description: "Generate shell completions",
      args: {
        name: "shell",
        suggestions: ["bash", "fish", "powershell", "pwsh", "zsh"],
        isOptional: true,
      },
      options: [
        {
          name: "--install",
          description: "Install the script where this shell looks for it",
        },
        {
          name: "--force",
          description: "Replace a file at the target path mise did not write",
        },
        {
          name: "--include-bash-completion-lib",
          description: "Retained for compatibility (no-op)",
        },
        helpOption,
      ],
    },
    {
      name: ["config", "cfg", "toml"],
      description: "Manage config files",
      subcommands: [
        {
          name: "get",
          description: "Display the value of a setting in a mise.toml file",
          args: { name: "key", isOptional: true },
          options: [
            {
              name: ["-f", "--file"],
              description: "The path to the mise.toml file to edit",
              args: { name: "file", template: "filepaths" },
            },
            helpOption,
          ],
        },
        {
          name: ["ls", "list"],
          description: "List config files currently in use",
          options: [
            jsonOption,
            {
              name: "--no-header",
              description: "Do not print table header",
            },
            {
              name: "--tracked-configs",
              description: "List all tracked config files",
            },
            helpOption,
          ],
        },
        {
          name: "set",
          description: "Set the value of a setting in a mise.toml file",
          args: [{ name: "key" }, { name: "value" }],
          options: [
            {
              name: ["-f", "--file"],
              description: "The path to the mise.toml file to edit",
              args: { name: "file", template: "filepaths" },
            },
            {
              name: ["-t", "--type"],
              description: "Type of the value",
              args: {
                name: "type",
                suggestions: [
                  "infer",
                  "string",
                  "integer",
                  "float",
                  "bool",
                  "list",
                ],
              },
            },
            helpOption,
          ],
        },
      ],
      options: [
        jsonOption,
        {
          name: "--no-header",
          description: "Do not print table header",
        },
        {
          name: "--tracked-configs",
          description: "List all tracked config files",
        },
        helpOption,
      ],
    },
    {
      name: "deactivate",
      description: "Disable mise for current shell session",
      options: [helpOption],
    },
    {
      name: ["deps", "dep", "prepare"],
      description: "[experimental] Manage project dependencies",
      options: [helpOption],
    },
    {
      name: ["doctor", "dr"],
      description: "Check mise installation for possible problems",
      subcommands: [
        {
          name: ["path", "paths"],
          description: "Print the current PATH entries mise is providing",
          options: [helpOption],
        },
      ],
      options: [jsonOption, helpOption],
    },
    {
      name: "edit",
      description: "Edit mise.toml interactively",
      options: [helpOption],
    },
    {
      name: "en",
      description: "Starts a new shell with the mise environment",
      args: {
        name: "dir",
        description: "Directory to start the shell in",
        template: "folders",
        isOptional: true,
      },
      options: [
        {
          name: ["-s", "--shell"],
          description: "Shell to start (defaults to $SHELL)",
          args: { name: "shell" },
        },
        helpOption,
      ],
    },
    {
      name: ["env", "e"],
      description: "Exports env vars to activate mise a single time",
      args: toolArg,
      options: [
        {
          name: ["-D", "--dotenv"],
          description: "Output in dotenv format",
        },
        jsonOption,
        {
          name: ["-s", "--shell"],
          description: "Shell type to generate environment variables for",
          args: { name: "shell", suggestions: shellTypes },
        },
        {
          name: "--json-extended",
          description: "Output in JSON format with additional information",
        },
        {
          name: "--redacted",
          description: "Only show redacted environment variables",
        },
        {
          name: "--values",
          description: "Only show values of environment variables",
        },
        helpOption,
      ],
    },
    {
      name: ["exec", "x"],
      description: "Execute a command with tool(s) set",
      args: [
        toolArg,
        {
          name: "command",
          description: "Command to execute after `--`",
          isCommand: true,
          isOptional: true,
        },
      ],
      options: [
        {
          name: ["-c", "--command"],
          description: "Command string to execute",
          args: { name: "command", isCommand: true },
        },
        jobsOption,
        {
          name: "--allow-env",
          description: "Allow specific env var through",
          args: { name: "var" },
        },
        {
          name: "--allow-net",
          description: "Allow network to specific host",
          args: { name: "host" },
        },
        {
          name: "--allow-read",
          description: "Allow reads from specific path",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--allow-write",
          description: "Allow writes to specific path",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--deny-all",
          description: "Block reads, writes, network, and env vars",
        },
        {
          name: "--deny-env",
          description: "Block env var inheritance",
        },
        { name: "--deny-net", description: "Block all network access" },
        { name: "--deny-read", description: "Block filesystem reads" },
        { name: "--deny-write", description: "Block all filesystem writes" },
        {
          name: "--fresh-env",
          description: "Bypass the environment cache and recompute it",
        },
        {
          name: "--no-deps",
          description: "Skip automatic dependency preparation",
        },
        {
          name: "--raw",
          description: "Connect stdin/stdout/stderr directly to the terminal",
        },
        helpOption,
      ],
    },
    {
      name: "fmt",
      description: "Formats mise.toml",
      options: [
        {
          name: ["-a", "--all"],
          description: "Format all files from the current directory",
        },
        {
          name: ["-c", "--check"],
          description: "Check if the configs are formatted",
        },
        {
          name: ["-s", "--stdin"],
          description: "Read config from stdin and write formatted to stdout",
        },
        helpOption,
      ],
    },
    {
      name: ["generate", "gen", "g"],
      description: "Generate files for various tools/services",
      subcommands: [
        {
          name: "config",
          description: "Generate a mise.toml file",
          options: [helpOption],
        },
        {
          name: "devcontainer",
          description: "Generate a devcontainer to execute mise",
          options: [helpOption],
        },
        {
          name: ["git-pre-commit", "pre-commit"],
          description: "Generate a git pre-commit hook",
          options: [helpOption],
        },
        {
          name: "github-action",
          description: "Generate a GitHub Action workflow file",
          options: [helpOption],
        },
        {
          name: "install-script",
          description: "Generate a script to download+execute mise",
          options: [helpOption],
        },
        {
          name: "task-docs",
          description: "Generate documentation for tasks in a project",
          options: [helpOption],
        },
        {
          name: "task-stubs",
          description: "Generates shims to run mise tasks",
          options: [helpOption],
        },
        {
          name: "tool-stub",
          description: "Generate a tool stub for HTTP-based tools",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: "implode",
      description: "Removes mise CLI and all related data",
      options: [
        dryRunOption,
        {
          name: "--config",
          description: "Also remove config directory",
        },
        helpOption,
      ],
    },
    {
      name: ["install", "i"],
      description: "Install a tool version",
      args: toolArg,
      options: [
        {
          name: ["-f", "--force"],
          description: "Force reinstall even if already installed",
        },
        jobsOption,
        dryRunOption,
        {
          name: ["-v", "--verbose"],
          description: "Show installation output",
        },
        {
          name: "--dry-run-code",
          description:
            "Like --dry-run but exits 1 if there are tools to install",
        },
        {
          name: "--include-task-tools",
          description: "Also install tools required by tasks in current scope",
        },
        {
          name: "--include-lazy",
          description: "Also install tools configured with `lazy = true`",
        },
        minimumReleaseAgeOption,
        {
          name: "--monorepo",
          description: "Install tools from every config root",
        },
        helpOption,
      ],
    },
    {
      name: "install-into",
      description: "Install a tool version to a specific path",
      args: [
        {
          name: "tool@version",
          generators: toolAtVersionGenerators,
        },
        {
          name: "path",
          description: "Path to install the tool into",
          template: "folders",
        },
      ],
      options: [helpOption],
    },
    {
      name: "latest",
      description: "Gets the latest available version for a plugin",
      args: {
        name: "tool@version",
        generators: toolAtVersionGenerators,
      },
      options: [
        {
          name: ["-i", "--installed"],
          description: "Show latest installed instead of available version",
        },
        minimumReleaseAgeOption,
        helpOption,
      ],
    },
    {
      name: ["link", "ln"],
      description: "Symlinks a tool version into mise",
      args: [
        {
          name: "tool@version",
          generators: toolAtVersionGenerators,
        },
        {
          name: "path",
          description: "The local path to the tool version",
          template: "folders",
        },
      ],
      options: [
        {
          name: ["-f", "--force"],
          description: "Overwrite an existing tool version if it exists",
        },
        helpOption,
      ],
    },
    {
      name: "lock",
      description: "Update lockfile checksums and URLs for all platforms",
      args: {
        name: "tool",
        generators: installedToolsGenerator,
        isVariadic: true,
        isOptional: true,
      },
      options: [
        {
          name: ["-g", "--global"],
          description: "Target only global config lockfiles",
        },
        jobsOption,
        dryRunOption,
        {
          name: ["-p", "--platform"],
          description: "Comma-separated list of platforms to target",
          args: { name: "platform" },
        },
        {
          name: "--bump",
          description: "Re-resolve fuzzy version selectors against latest",
        },
        helpOption,
      ],
    },
    {
      name: ["ls", "list"],
      description: "List installed and active tool versions",
      args: {
        name: "installed_tool",
        generators: installedToolsGenerator,
        isVariadic: true,
        isOptional: true,
      },
      options: [
        {
          name: ["-c", "--current"],
          description: "Only show tool versions currently specified",
        },
        {
          name: ["-g", "--global"],
          description: "Only show tool versions in the global mise.toml",
        },
        {
          name: ["-i", "--installed"],
          description: "Only show tool versions that are installed",
        },
        jsonOption,
        {
          name: ["-l", "--local"],
          description: "Only show tool versions in the local mise.toml",
        },
        {
          name: ["-m", "--missing"],
          description: "Display missing tool versions",
        },
        {
          name: "--all-sources",
          description: "Display all tracked config sources for tools",
        },
        {
          name: "--monorepo",
          description: "List tools from every config root",
        },
        { name: "--no-header", description: "Don't display headers" },
        {
          name: "--outdated",
          description: "Display whether a version is outdated",
        },
        {
          name: "--prefix",
          description: "Display versions matching this prefix",
          args: { name: "prefix" },
        },
        {
          name: "--prunable",
          description: "List only tools that can be pruned with `mise prune`",
        },
        helpOption,
      ],
    },
    {
      name: ["ls-remote", "list-all", "list-remote"],
      description: "List runtime versions available for install",
      args: [
        {
          name: "tool@version",
          generators: toolAtVersionGenerators,
          isOptional: true,
        },
        {
          name: "prefix",
          description: "The version prefix to use when querying",
          isOptional: true,
        },
      ],
      options: [
        {
          name: "--all",
          description: "Show all installed plugins and versions",
        },
        minimumReleaseAgeOption,
        jsonOption,
        {
          name: "--no-versions-host",
          description: "Disable checking the mise-versions host",
        },
        {
          name: "--prerelease",
          description: "Include pre-release versions in the output",
        },
        {
          name: "--strict-metadata",
          description: "Fail if release metadata fetches fail",
        },
        helpOption,
      ],
    },
    {
      name: "mcp",
      description: "Run Model Context Protocol (MCP) server",
      options: [helpOption],
    },
    {
      name: "oci",
      description: "[experimental] Build OCI container images from a mise.toml",
      subcommands: [
        {
          name: "build",
          description: "Build an OCI image from the current mise.toml",
          options: [helpOption],
        },
        {
          name: "push",
          description: "Build an OCI image and push it to a registry",
          options: [helpOption],
        },
        {
          name: "run",
          description: "Build an OCI image and run a command in it",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: "outdated",
      description: "Shows outdated tool versions",
      args: installedToolArg,
      options: [
        {
          name: ["-b", "--bump"],
          description: "Compare against the latest versions available",
        },
        jsonOption,
        {
          name: "--inactive",
          description: "Show installed-but-inactive tools as well",
        },
        {
          name: "--local",
          description: "Only show outdated tools defined in local configs",
        },
        { name: "--monorepo", description: "Placeholder for monorepo checks" },
        { name: "--no-header", description: "Don't show table header" },
        helpOption,
      ],
    },
    {
      name: "patrons",
      description: "Show the individuals supporting mise as Patron members",
      options: [helpOption],
    },
    {
      name: ["plugins", "p", "plugin", "plugin-list"],
      description: "Manage plugins",
      subcommands: [
        {
          name: ["install", "i", "a", "add"],
          description: "Install a plugin",
          args: [
            { name: "new_plugin", isOptional: true },
            { name: "git_url", isOptional: true },
          ],
          options: [
            {
              name: ["-f", "--force"],
              description: "Reinstall even if plugin exists",
            },
            {
              name: ["-a", "--all"],
              description: "Install all missing plugins",
            },
            helpOption,
          ],
        },
        {
          name: ["link", "ln"],
          description: "Symlinks a plugin into mise",
          args: [
            { name: "name" },
            { name: "path", template: "folders", isOptional: true },
          ],
          options: [
            {
              name: ["-f", "--force"],
              description: "Overwrite existing plugin",
            },
            helpOption,
          ],
        },
        {
          name: ["ls", "list"],
          description: "List installed plugins",
          options: [
            {
              name: ["-c", "--core"],
              description: "The built-in plugins only",
            },
            {
              name: ["-u", "--urls"],
              description: "Show the git url for each plugin",
            },
            { name: "--user", description: "List installed plugins" },
            helpOption,
          ],
        },
        {
          name: ["ls-remote", "list-remote", "list-all"],
          description: "List all available remote plugins",
          options: [
            {
              name: ["-u", "--urls"],
              description: "Show the git url for each plugin",
            },
            { name: "--only-names", description: "Only show the name of each" },
            helpOption,
          ],
        },
        {
          name: ["uninstall", "remove", "rm"],
          description: "Removes a plugin",
          args: {
            name: "plugin",
            generators: installedPluginsGenerator,
            isVariadic: true,
            isOptional: true,
          },
          options: [
            { name: ["-p", "--purge"], description: "Also remove installs" },
            { name: ["-a", "--all"], description: "Remove all plugins" },
            helpOption,
          ],
        },
        {
          name: ["update", "up", "upgrade"],
          description: "Updates a plugin to the latest version",
          args: {
            name: "plugin",
            generators: installedPluginsGenerator,
            isVariadic: true,
            isOptional: true,
          },
          options: [jobsOption, helpOption],
        },
      ],
      options: [
        { name: ["-c", "--core"], description: "The built-in plugins only" },
        {
          name: ["-u", "--urls"],
          description: "Show the git url for each plugin",
        },
        { name: "--user", description: "List installed plugins" },
        helpOption,
      ],
    },
    {
      name: "prune",
      description: "Delete unused versions of tools",
      args: {
        name: "installed_tool",
        generators: installedToolsGenerator,
        isVariadic: true,
        isOptional: true,
      },
      options: [
        dryRunOption,
        {
          name: "--configs",
          description: "Prune only tracked/trusted configuration links",
        },
        {
          name: "--dry-run-code",
          description: "Like --dry-run but exits 1 if there is anything to do",
        },
        { name: "--monorepo", description: "Placeholder for monorepo pruning" },
        { name: "--tools", description: "Prune only unused versions of tools" },
        helpOption,
      ],
    },
    {
      name: "registry",
      description: "List available tools to install",
      args: {
        name: "name",
        generators: registryToolsGenerator,
        isOptional: true,
      },
      options: [
        {
          name: ["-b", "--backend"],
          description: "Show only tools for this backend",
          args: { name: "backend" },
        },
        { name: "--hide-aliased", description: "Hide aliased tools" },
        jsonOption,
        {
          name: "--security",
          description: "Include security features in JSON output",
        },
        helpOption,
      ],
    },
    {
      name: "reshim",
      description: "Creates new shims based on bin paths of installed tools",
      options: [
        {
          name: ["-f", "--force"],
          description: "Removes all shims before reshimming",
        },
        { name: "--system", description: "Rebuild the system shim farm" },
        helpOption,
      ],
    },
    {
      name: ["run", "r"],
      description: "Run task(s)",
      args: [
        {
          name: "task",
          generators: tasksGenerator,
          isOptional: true,
        },
        {
          name: "args",
          description: "Arguments to pass to the tasks",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [
        {
          name: "--affected",
          description: "Run tasks only for projects affected by Git changes",
        },
        {
          name: "--affected-base",
          description: "Git base revision for --affected",
          args: { name: "rev" },
        },
        {
          name: "--affected-explain",
          description: "Explain why projects and tasks were selected",
        },
        {
          name: "--affected-head",
          description: "Git head revision for --affected",
          args: { name: "rev" },
        },
        {
          name: "--affected-json",
          description: "Output affected projects and tasks as JSON",
        },
        {
          name: "--all",
          description: "Open the interactive selector with all tasks",
        },
        {
          name: ["-c", "--continue-on-error"],
          description: "Continue running tasks even if one fails",
        },
        {
          name: ["-C", "--cd"],
          description: "Change to this directory before executing",
          args: { name: "cd", template: "folders" },
        },
        {
          name: ["-f", "--force"],
          description: "Force the tasks to run even if outputs are up to date",
        },
        jobsOption,
        {
          name: ["-n", "--dry-run"],
          description: "Don't actually run the tasks",
        },
        {
          name: ["-i", "--interleave"],
          description: "Print directly to stdout/stderr instead of by line",
        },
        {
          name: ["-o", "--output"],
          description: "Change how tasks information is output",
          args: { name: "output" },
        },
        {
          name: ["-q", "--quiet"],
          description: "Don't show extra output",
        },
        {
          name: ["-s", "--shell"],
          description: "Shell to use to run toml tasks",
          args: { name: "shell" },
        },
        {
          name: ["-t", "--tool"],
          description: "Tool(s) to run in addition to what is in config files",
          args: {
            name: "tool@version",
            generators: toolAtVersionGenerators,
          },
        },
        {
          name: "--no-timings",
          description: "Hide elapsed time after each task",
        },
        {
          name: "--timings",
          description: "Show elapsed time after each task",
        },
        helpOption,
      ],
    },
    {
      name: "search",
      description: "Search for tools in the registry",
      args: {
        name: "name",
        generators: registryToolsGenerator,
        isOptional: true,
      },
      options: [
        {
          name: ["-i", "--interactive"],
          description: "Show interactive search",
        },
        {
          name: ["-m", "--match-type"],
          description: "Match type: equal, contains, or fuzzy",
          args: {
            name: "match_type",
            suggestions: ["equal", "contains", "fuzzy"],
            default: "fuzzy",
          },
        },
        { name: "--no-header", description: "Don't display headers" },
        helpOption,
      ],
    },
    {
      name: "self-update",
      description: "Updates mise itself",
      args: {
        name: "version",
        description: "Update to a specific version",
        isOptional: true,
      },
      options: [
        {
          name: ["-f", "--force"],
          description: "Update even if already up to date",
        },
        {
          name: ["-y", "--yes"],
          description: "Skip confirmation prompt",
        },
        {
          name: "--no-plugins",
          description: "Disable auto-updating plugins",
        },
        helpOption,
      ],
    },
    {
      name: ["set", "ev", "env-vars"],
      description: "Set environment variables in mise.toml",
      args: {
        name: "env_var",
        description: "e.g.: NODE_ENV=production",
        isVariadic: true,
        isOptional: true,
      },
      options: [
        {
          name: ["-E", "--env"],
          description: "Create/modify an environment-specific config file",
          args: { name: "env" },
        },
        globalConfigOption,
        {
          name: "--age-encrypt",
          description: "[experimental] Encrypt the value with age",
        },
        {
          name: "--age-key-file",
          description: "[experimental] Age identity file for encryption",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--age-recipient",
          description: "[experimental] Age recipient for encryption",
          args: { name: "recipient" },
        },
        {
          name: "--age-ssh-recipient",
          description: "[experimental] SSH recipient for age encryption",
          args: { name: "path_or_pubkey" },
        },
        {
          name: "--file",
          description: "The TOML file to update",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--no-redact",
          description: "Show raw values instead of redacting secrets",
        },
        {
          name: "--prompt",
          description: "Prompt for environment variable values",
        },
        {
          name: "--stdin",
          description: "Read the value from stdin (for multiline input)",
        },
        helpOption,
      ],
    },
    {
      name: "settings",
      description: "Manage settings",
      subcommands: [
        {
          name: "add",
          description: "Adds a setting to the configuration file",
          args: [
            { name: "setting", generators: settingsGenerator },
            { name: "value" },
          ],
          options: [
            {
              name: ["-l", "--local"],
              description: "Use the local config file",
            },
            helpOption,
          ],
        },
        {
          name: "get",
          description: "Show a current setting",
          args: { name: "setting", generators: settingsGenerator },
          options: [
            {
              name: ["-l", "--local"],
              description: "Use the local config file",
            },
            helpOption,
          ],
        },
        {
          name: ["ls", "list"],
          description: "Show current settings",
          args: {
            name: "setting",
            generators: settingsGenerator,
            isOptional: true,
          },
          options: [
            { name: ["-a", "--all"], description: "List all settings" },
            jsonOption,
            {
              name: ["-l", "--local"],
              description: "Use the local config file",
            },
            { name: ["-T", "--toml"], description: "Output in TOML format" },
            {
              name: "--json-extended",
              description: "Output in JSON format with sources",
            },
            helpOption,
          ],
        },
        {
          name: ["set", "create"],
          description: "Add/update a setting",
          args: [
            { name: "setting", generators: settingsGenerator },
            { name: "value" },
          ],
          options: [
            {
              name: ["-l", "--local"],
              description: "Use the local config file",
            },
            helpOption,
          ],
        },
        {
          name: ["unset", "rm", "remove", "delete", "del"],
          description: "Clears a setting",
          args: { name: "setting", generators: settingsGenerator },
          options: [
            {
              name: ["-l", "--local"],
              description: "Use the local config file",
            },
            helpOption,
          ],
        },
      ],
      args: [
        {
          name: "setting",
          generators: settingsGenerator,
          isOptional: true,
        },
        { name: "value", isOptional: true },
      ],
      options: [
        { name: ["-a", "--all"], description: "List all settings" },
        jsonOption,
        { name: ["-l", "--local"], description: "Use the local config file" },
        { name: ["-T", "--toml"], description: "Output in TOML format" },
        {
          name: "--json-extended",
          description: "Output in JSON format with sources",
        },
        helpOption,
      ],
    },
    {
      name: ["shell", "sh"],
      description: "Sets a tool version for the current session",
      args: {
        name: "tool@version",
        generators: toolAtVersionGenerators,
        isVariadic: true,
      },
      options: [
        jobsOption,
        {
          name: ["-u", "--unset"],
          description: "Removes a previously set version",
        },
        {
          name: "--raw",
          description: "Connect stdin/stdout/stderr directly to the terminal",
        },
        helpOption,
      ],
    },
    {
      name: "shell-alias",
      description: "Manage shell aliases",
      subcommands: [
        {
          name: "get",
          description: "Show the command for a shell alias",
          args: { name: "alias" },
          options: [helpOption],
        },
        {
          name: ["ls", "list"],
          description: "List shell aliases",
          options: [
            { name: "--no-header", description: "Don't show table header" },
            helpOption,
          ],
        },
        {
          name: ["set", "add", "create"],
          description: "Add/update a shell alias",
          args: [{ name: "alias" }, { name: "command", isCommand: true }],
          options: [helpOption],
        },
        {
          name: ["unset", "rm", "remove", "delete", "del"],
          description: "Removes a shell alias",
          args: { name: "alias" },
          options: [helpOption],
        },
      ],
      options: [
        { name: "--no-header", description: "Don't show table header" },
        helpOption,
      ],
    },
    {
      name: "sponsors",
      description: "Show the companies sponsoring mise",
      options: [helpOption],
    },
    {
      name: "sync",
      description: "Synchronize tools from other version managers with mise",
      subcommands: [
        {
          name: "node",
          description: "Symlinks node versions from an external tool into mise",
          options: [
            { name: "--brew", description: "Get tool versions from homebrew" },
            { name: "--nvm", description: "Get tool versions from nvm" },
            { name: "--nodenv", description: "Get tool versions from nodenv" },
            helpOption,
          ],
        },
        {
          name: "python",
          description: "Symlinks python versions from an external tool",
          options: [
            {
              name: "--pyenv",
              description: "Get tool versions from pyenv",
            },
            { name: "--uv", description: "Sync tool versions with uv" },
            helpOption,
          ],
        },
        {
          name: "ruby",
          description: "Symlinks ruby versions from an external tool into mise",
          options: [
            { name: "--brew", description: "Get tool versions from homebrew" },
            helpOption,
          ],
        },
      ],
      options: [helpOption],
    },
    {
      name: ["tasks", "t", "task"],
      description: "Manage tasks",
      subcommands: [
        {
          name: "add",
          description: "Create a new task",
          args: { name: "task" },
          options: [helpOption],
        },
        {
          name: "deps",
          description: "Display a tree visualization of a dependency graph",
          args: {
            name: "tasks",
            generators: tasksGenerator,
            isVariadic: true,
            isOptional: true,
          },
          options: [
            {
              name: "--dot",
              description: "Display dependencies in DOT format",
            },
            { name: "--hidden", description: "Show hidden tasks" },
            helpOption,
          ],
        },
        {
          name: "edit",
          description: "Edit a task with $EDITOR",
          args: { name: "task", generators: tasksGenerator },
          options: [
            { name: ["-p", "--path"], description: "Display the path to edit" },
            helpOption,
          ],
        },
        {
          name: "graph",
          description: "[experimental] Inspect the workspace project graph",
          options: [helpOption],
        },
        {
          name: "info",
          description: "Get information about a task",
          args: { name: "task", generators: tasksGenerator },
          options: [jsonOption, helpOption],
        },
        {
          name: "ls",
          description: "List available tasks to execute",
          options: [
            { name: ["-g", "--global"], description: "Only show global tasks" },
            jsonOption,
            {
              name: ["-l", "--local"],
              description: "Only show non-global tasks",
            },
            { name: ["-x", "--extended"], description: "Show all columns" },
            {
              name: "--all",
              description: "Load all tasks from the entire monorepo",
            },
            { name: "--hidden", description: "Show hidden tasks" },
            {
              name: "--name-only",
              description: "Only show task names, one per line",
            },
            { name: "--no-header", description: "Do not print table header" },
            {
              name: "--sort",
              description: "Sort by column",
              args: {
                name: "column",
                suggestions: ["name", "alias", "description", "source"],
              },
            },
            {
              name: "--sort-order",
              description: "Sort order",
              args: { name: "sort_order", suggestions: ["asc", "desc"] },
            },
            helpOption,
          ],
        },
        {
          name: ["run", "r"],
          description: "Run task(s)",
          args: {
            name: "task",
            generators: tasksGenerator,
            isVariadic: true,
            isOptional: true,
          },
          options: [helpOption],
        },
        {
          name: "validate",
          description: "Validate tasks for common errors and issues",
          options: [helpOption],
        },
      ],
      args: {
        name: "task",
        generators: tasksGenerator,
        isOptional: true,
      },
      options: [
        { name: ["-g", "--global"], description: "Only show global tasks" },
        jsonOption,
        { name: ["-l", "--local"], description: "Only show non-global tasks" },
        { name: ["-x", "--extended"], description: "Show all columns" },
        {
          name: "--all",
          description: "Load all tasks from the entire monorepo",
        },
        { name: "--hidden", description: "Show hidden tasks" },
        {
          name: "--name-only",
          description: "Only show task names, one per line",
        },
        { name: "--no-header", description: "Do not print table header" },
        {
          name: "--sort",
          description: "Sort by column",
          args: {
            name: "column",
            suggestions: ["name", "alias", "description", "source"],
          },
        },
        {
          name: "--sort-order",
          description: "Sort order",
          args: { name: "sort_order", suggestions: ["asc", "desc"] },
        },
        helpOption,
      ],
    },
    {
      name: "test-tool",
      description: "Test a tool installs and executes",
      args: {
        name: "tools",
        generators: registryToolsGenerator,
        isVariadic: true,
        isOptional: true,
      },
      options: [
        {
          name: ["-a", "--all"],
          description: "Test every tool specified in registry/",
        },
        jobsOption,
        {
          name: "--all-config",
          description: "Test all tools specified in config files",
        },
        {
          name: "--include-non-defined",
          description: "Also test tools not defined in registry/",
        },
        {
          name: "--raw",
          description: "Connect stdin/stdout/stderr directly to the terminal",
        },
        helpOption,
      ],
    },
    {
      name: "token",
      description: "Display git provider tokens mise will use",
      subcommands: [
        {
          name: "forgejo",
          description: "Forgejo token",
          options: [helpOption],
        },
        { name: "github", description: "GitHub token", options: [helpOption] },
        { name: "gitlab", description: "GitLab token", options: [helpOption] },
      ],
      options: [helpOption],
    },
    {
      name: "tool",
      description: "Gets information about a tool",
      args: {
        name: "tool",
        generators: registryToolsGenerator,
      },
      options: [
        jsonOption,
        { name: "--active", description: "Only show active versions" },
        { name: "--backend", description: "Only show backend field" },
        { name: "--config-source", description: "Only show config source" },
        { name: "--description", description: "Only show description field" },
        { name: "--installed", description: "Only show installed versions" },
        { name: "--requested", description: "Only show requested versions" },
        { name: "--tool-options", description: "Only show tool options" },
        helpOption,
      ],
    },
    {
      name: ["tool-alias", "alias", "aliases"],
      description: "Manage tool version aliases",
      subcommands: [
        {
          name: "get",
          description: "Show an alias for a tool",
          args: [
            { name: "tool", generators: installedToolsGenerator },
            { name: "alias" },
          ],
          options: [helpOption],
        },
        {
          name: ["ls", "list"],
          description: "List tool version aliases",
          args: {
            name: "tool",
            generators: installedToolsGenerator,
            isOptional: true,
          },
          options: [
            { name: "--no-header", description: "Don't show table header" },
            helpOption,
          ],
        },
        {
          name: ["set", "add", "create"],
          description: "Add/update an alias for a tool/backend",
          args: [
            { name: "tool", generators: installedToolsGenerator },
            { name: "alias" },
            { name: "value" },
          ],
          options: [helpOption],
        },
        {
          name: ["unset", "rm", "remove", "delete", "del"],
          description: "Clears an alias for a tool/backend",
          args: [
            { name: "tool", generators: installedToolsGenerator },
            { name: "alias" },
          ],
          options: [helpOption],
        },
      ],
      options: [
        {
          name: ["-p", "--tool"],
          description: "Filter aliases by tool",
          args: { name: "tool", generators: installedToolsGenerator },
        },
        { name: "--no-header", description: "Don't show table header" },
        helpOption,
      ],
    },
    {
      name: "tool-stub",
      description: "Execute a tool stub",
      args: [
        { name: "file", template: "filepaths" },
        { name: "args", isVariadic: true, isOptional: true },
      ],
      options: [helpOption],
    },
    {
      name: "trust",
      description: "Marks a config file as trusted",
      args: {
        name: "config_file",
        template: "filepaths",
        isOptional: true,
      },
      options: [
        {
          name: ["-a", "--all"],
          description: "Trust all config files in the current directory tree",
        },
        {
          name: "--ignore",
          description: "Do not trust this config and ignore it in the future",
        },
        {
          name: "--show",
          description: "Show the trusted status of config files",
        },
        {
          name: "--untrust",
          description: "Remove explicit trust for this config",
        },
        helpOption,
      ],
    },
    {
      name: "uninstall",
      description: "Removes installed tool versions",
      args: installedToolArg,
      options: [
        { name: ["-a", "--all"], description: "Delete all installed versions" },
        dryRunOption,
        {
          name: "--dry-run-code",
          description: "Like --dry-run but exits 1 if there is anything to do",
        },
        helpOption,
      ],
    },
    {
      name: "unset",
      description: "Remove environment variable(s) from the config file",
      args: {
        name: "env_key",
        description: "e.g.: NODE_ENV",
        isVariadic: true,
        isOptional: true,
      },
      options: [
        {
          name: ["-f", "--file"],
          description: "Specify a file to use instead of `mise.toml`",
          args: { name: "file", template: "filepaths" },
        },
        globalConfigOption,
        helpOption,
      ],
    },
    {
      name: "untrust",
      description: "Remove explicit trust for a config",
      args: {
        name: "config_file",
        template: "filepaths",
        isOptional: true,
      },
      options: [helpOption],
    },
    {
      name: ["unuse", "rm", "remove"],
      description: "Removes installed tool versions from mise.toml",
      args: {
        name: "installed_tool@version",
        generators: installedToolAtVersionGenerators,
        isVariadic: true,
      },
      options: [
        {
          name: ["-e", "--env"],
          description: "Create/modify an environment-specific config file",
          args: { name: "env" },
        },
        globalConfigOption,
        {
          name: ["-p", "--path"],
          description: "Specify a path to a config file or directory",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--no-prune",
          description: "Do not also prune the installed version",
        },
        helpOption,
      ],
    },
    {
      name: ["upgrade", "up"],
      description: "Upgrades outdated tools",
      args: installedToolArg,
      options: [
        {
          name: ["-b", "--bump"],
          description: "Upgrade to latest, bumping the version in mise.toml",
        },
        {
          name: ["-i", "--interactive"],
          description: "Display multiselect menu to choose which tools",
        },
        jobsOption,
        dryRunOption,
        {
          name: ["-x", "--exclude"],
          description: "Tool(s) to exclude from upgrading",
          args: {
            name: "installed_tool",
            generators: installedToolsGenerator,
          },
        },
        {
          name: "--dry-run-code",
          description: "Like --dry-run but exits 1 if there are outdated tools",
        },
        {
          name: "--inactive",
          description: "Upgrade installed-but-inactive tools as well",
        },
        {
          name: "--local",
          description: "Only upgrade tools defined in local config files",
        },
        minimumReleaseAgeOption,
        helpOption,
      ],
    },
    {
      name: ["use", "u"],
      description: "Installs a tool and adds the version to mise.toml",
      args: toolArg,
      options: [
        {
          name: "--postinstall",
          description: "Command to run after installing this tool",
          args: { name: "command", isCommand: true },
        },
        {
          name: ["-e", "--env"],
          description: "Create/modify an environment-specific config file",
          args: { name: "env" },
        },
        {
          name: ["-f", "--force"],
          description: "Force reinstall even if already installed",
        },
        globalConfigOption,
        jobsOption,
        dryRunOption,
        {
          name: ["-p", "--path"],
          description: "Specify a path to a config file or directory",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--dry-run-code",
          description: "Like --dry-run but exits 1 if there are changes",
        },
        minimumReleaseAgeOption,
        helpOption,
      ],
    },
    {
      name: ["version", "v"],
      description: "Display the version of mise",
      options: [jsonOption, helpOption],
    },
    {
      name: ["watch", "w"],
      description: "Run task(s) and watch for changes to rerun it",
      args: [
        {
          name: "task",
          generators: tasksGenerator,
          isOptional: true,
        },
        {
          name: "args",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [
        {
          name: "--skip-deps",
          description: "Run only the specified tasks skipping dependencies",
        },
        {
          name: ["-o", "--on-busy-update"],
          description: "What to do when receiving events while running",
          args: {
            name: "mode",
            suggestions: ["queue", "do-nothing", "restart", "signal"],
          },
        },
        {
          name: ["-r", "--restart"],
          description: "Restart the process if it's still running",
        },
        helpOption,
      ],
    },
    {
      name: "where",
      description: "Display the installation path for a tool",
      args: {
        name: "tool@version",
        generators: installedToolAtVersionGenerators,
      },
      options: [helpOption],
    },
    {
      name: "which",
      description: "Shows the path that a tool's bin points to",
      args: {
        name: "bin_name",
        description: "The bin to look up",
        isOptional: true,
      },
      options: [
        {
          name: ["-t", "--tool"],
          description: "Use a specific tool@version",
          args: {
            name: "tool@version",
            generators: installedToolAtVersionGenerators,
          },
        },
        {
          name: "--plugin",
          description: "Show the plugin name instead of the path",
        },
        {
          name: "--version",
          description: "Show the version instead of the path",
        },
        helpOption,
      ],
    },
    {
      name: "help",
      description: "Print this message or the help of the given subcommand(s)",
      args: {
        name: "subcommand",
        isOptional: true,
      },
    },
  ],
  options: [
    ...globalOptions,
    {
      name: ["-V", "--version"],
      description: "Show mise version",
      isPersistent: false,
    },
  ],
};

export default completionSpec;
