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
    isPersistent: true,
  },
  {
    name: "--raw",
    description:
      "Read/write directly to stdin/stdout/stderr instead of by line",
    isPersistent: true,
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

        {
          name: "switch",
          description:
            "Switch tools to the backend the registry now installs them from",
          options: [
            {
              name: ["-n", "--dry-run"],
              description:
                "Show what would switch without changing the lockfile or installs",
            },
            {
              name: ["-g", "--global"],
              description:
                "Switch tools in the global config's lockfile instead of the project's",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
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
      options: [
        helpOption,
        {
          name: "--from",
          description:
            "Clone a bootstrap project (a Git repository with a mise.toml) and apply it",
          args: {
            name: "git_url",
          },
        },
        {
          name: "--adopt",
          description:
            "Clone a repository of global mise config or dotfile history, then apply it",
          args: {
            name: "git_url|owner/repo",
          },
        },
        {
          name: "--replace-history",
          description:
            "Discard this machine's dotfile history and adopt the repository's",
        },
        {
          name: "--take-remote-all",
          description:
            "Take the setup repository's version of every existing file that differs while adopting",
        },
        {
          name: "--from-dir",
          description: "Directory for the `--from` checkout",
          args: {
            name: "dir",
          },
        },
        {
          name: "--config-dir",
          description:
            "Link the global config directory to this directory of the `--from` checkout",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-n", "--dry-run"],
          description: "Show what would change without changing anything",
        },
        {
          name: "--skip-dirty",
          description:
            "Skip configured repositories with local changes instead of failing",
        },
        {
          name: "--force-dotfiles",
          description:
            "Overwrite existing files that conflict with whole-file dotfile entries",
        },
        {
          name: "--prune-dotfiles",
          description:
            "Remove files that dotfile groups deployed but no active entry deploys now",
        },
        {
          name: "--only",
          description: "Run only these parts",
          args: {
            name: "part",
          },
        },
        {
          name: "--prompt-secrets",
          description: "Prompt securely for missing bootstrap secret inputs",
        },
        {
          name: "--prompt-vars",
          description:
            "Ask for `[vars]` entries that declare a `prompt` and have no saved answer",
        },
        {
          name: "--save-env",
          description:
            "Save the environments of `-E` or `MISE_ENV` to `miserc.local.toml`",
        },
        {
          name: "--skip",
          description: "Skip these parts",
          args: {
            name: "part",
          },
        },
        {
          name: "--update",
          description:
            "Refresh package metadata and update repositories before applying",
        },
        {
          name: "--upgrade",
          description:
            "Upgrade installed packages and tools as well as installing missing ones",
        },
        {
          name: "--self-update",
          description:
            "Update mise itself first, then run the bootstrap with the new version",
        },
      ],

      subcommands: [
        {
          name: "accounts",
          description: "Manage Linux users and groups",
          subcommands: [
            {
              name: "apply",
              description:
                "Create, update, or remove the configured Linux users and groups",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of the configured Linux users and groups",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any account differs from the config (all are still listed)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "compose",
          description:
            "Manage Docker Compose projects from `[bootstrap.compose]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Apply Docker Compose projects from `[bootstrap.compose]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of Docker Compose projects from `[bootstrap.compose]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any Compose project differs from the config (all are still listed)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "files",
          description:
            "Manage system files and directories declared in `[bootstrap]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Create, update, or remove the configured system files and directories",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
                {
                  name: "--prompt-secrets",
                  description:
                    "Prompt securely for missing bootstrap secret inputs",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of the configured system files and directories",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any file or directory differs from the config (all are still listed)",
                },
                {
                  name: "--prompt-secrets",
                  description:
                    "Prompt securely for missing bootstrap secret inputs",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "firewall",
          description:
            "Manage the Linux host firewall from `[bootstrap.linux.firewall]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Apply the firewall from `[bootstrap.linux.firewall]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of the firewall from `[bootstrap.linux.firewall]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if the firewall differs from the config",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "linux",
          description:
            "Manage systemd user units from `[bootstrap.linux.systemd.units]`",
          subcommands: [
            {
              name: ["systemd-units", "systemd"],
              description:
                "Manage systemd user units from `[bootstrap.linux.systemd.units]`",

              subcommands: [
                {
                  name: "apply",
                  description:
                    "Install and start the configured systemd user units",
                },
                {
                  name: "status",
                  description:
                    "Show the state of the configured systemd user units",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "macos",
          description:
            "Manage macOS preferences and LaunchAgents from `[bootstrap.settings.macos]` and `[bootstrap.macos.launchd]`",
          subcommands: [
            {
              name: "defaults",
              description:
                "Manage macOS preferences such as Dock, Finder, and keyboard settings",

              subcommands: [
                {
                  name: "apply",
                  description: "Write the configured macOS preferences",
                },
                {
                  name: "status",
                  description:
                    "Show the state of the configured macOS preferences",
                },
              ],
            },
            {
              name: ["launchd-agents", "launchd"],
              description:
                "Manage macOS LaunchAgents from `[bootstrap.macos.launchd.agents]`",

              subcommands: [
                {
                  name: "apply",
                  description:
                    "Install and load LaunchAgents from `[bootstrap.macos.launchd.agents]`",
                },
                {
                  name: "status",
                  description: "Show the state of the configured LaunchAgents",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["mise-shell-activate", "shell"],
          description:
            "Manage mise shell activation from `[bootstrap.mise_shell_activate]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Write mise activation into the configured shell startup files",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "status",
              description: "Show the state of the configured shell activation",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any shell activation differs from the config (all are still listed)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "packages",
          description: "Manage packages from `[bootstrap.packages]`",
          subcommands: [
            {
              name: ["apply", "i", "install"],
              description:
                "Install or remove packages to match `[bootstrap.packages]`",

              options: [
                {
                  name: ["-m", "--manager"],
                  description:
                    "Only apply packages for this built-in or plugin manager",
                  args: {
                    name: "manager",
                  },
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
                {
                  name: "--update",
                  description:
                    "Refresh package manager metadata first, where the manager supports it",
                },
              ],
            },
            {
              name: "brew",
              description:
                "Manage Homebrew tap URLs in `[bootstrap.brew.taps]`",

              subcommands: [
                {
                  name: "tap",
                  description:
                    "Add a Homebrew tap URL to the global `[bootstrap.brew.taps]`",
                },
                {
                  name: ["untap", "remove", "rm"],
                  description:
                    "Remove Homebrew tap URLs from `[bootstrap.brew.taps]`",
                },
              ],
            },
            {
              name: "export",
              description:
                "Print the configured `nix:` packages as a NixOS module",

              options: [
                {
                  name: "--format",
                  description: "Output format",
                  args: {
                    name: "format",
                    suggestions: ["nix"],
                  },
                },
              ],
            },
            {
              name: "import",
              description:
                "Record installed Homebrew formulae in `[bootstrap.packages]`",

              options: [
                {
                  name: ["-g", "--global"],
                  description:
                    "Write to the global config (~/.config/mise/config.toml)",
                },
                {
                  name: ["-m", "--manager"],
                  description: "Package manager to import from",
                  args: {
                    name: "manager",
                    suggestions: ["brew"],
                  },
                },
                {
                  name: "--all",
                  description:
                    "Import every linked formula, including dependencies",
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show the entries that would be written without writing them",
                },
                {
                  name: ["-p", "--path"],
                  description: "Write to this config file or directory",
                  args: {
                    name: "path",
                  },
                },
              ],
            },
            {
              name: "prune",
              description: "Uninstall packages that no config declares",

              options: [
                {
                  name: ["-m", "--manager"],
                  description:
                    "Package manager to prune: `brew`, `brew-cask`, or a package plugin",
                  args: {
                    name: "manager",
                  },
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would be removed without removing anything",
                },
                {
                  name: "--force",
                  description:
                    "Remove `brew-cask` casks that mise installed even when it cannot prove they are unchanged, such as self-updating apps or casks with install scripts",
                },
              ],
            },
            {
              name: ["status", "ls", "list"],
              description:
                "Show the state of packages from `[bootstrap.packages]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any package differs from the config (all are still listed)",
                },
              ],
            },
            {
              name: ["upgrade", "up"],
              description:
                "Upgrade installed packages from `[bootstrap.packages]`",

              options: [
                {
                  name: ["-m", "--manager"],
                  description:
                    "Only upgrade packages for this built-in or plugin manager",
                  args: {
                    name: "manager",
                  },
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: ["use", "u"],
              description:
                "Add packages to `[bootstrap.packages]` and install them",

              options: [
                {
                  name: ["-g", "--global"],
                  description:
                    "Write to the global config (~/.config/mise/config.toml) instead of the local one",
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without writing config or installing",
                },
                {
                  name: ["-p", "--path"],
                  description: "Write to this config file or directory",
                  args: {
                    name: "path",
                  },
                },
                {
                  name: "--no-install",
                  description:
                    "Write the package declarations without checking or installing packages",
                },
              ],
            },
            {
              name: "where",
              description:
                "Print the `opt` path of an installed Homebrew formula",
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "plan",
          description: "Show what applying bootstrap resources would change",
          options: [
            {
              name: ["-J", "--json"],
              description:
                "Output a stable machine-readable plan in JSON format",
            },
            {
              name: "--detailed-exitcode",
              description:
                "Exit 0 if nothing would change, 2 if something would, 1 on errors or unknown state",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt securely for missing bootstrap secret inputs",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "plugins",
          description:
            "Manage package manager plugins declared in `[bootstrap.plugins]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Install package manager plugins declared in `[bootstrap.plugins]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show which plugins would be installed without installing them",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show whether declared package manager plugins are installed",

              options: [
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if a declared plugin is not installed",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "remote",
          description: "Bootstrap one or more machines over SSH",
          options: [
            {
              name: "--adopt",
              description:
                "Adopt global configuration or shared dotfile history on each target",
              args: {
                name: "git_url|owner/repo",
              },
            },
            {
              name: "--all",
              description: "Select every inventory host",
            },
            {
              name: "--bootstrap-command",
              description:
                "Shell command, run on each target, that installs mise and puts it on PATH",
              args: {
                name: "command",
              },
            },
            {
              name: "--connect-timeout",
              description: "SSH connection timeout in seconds",
              args: {
                name: "seconds",
              },
            },
            {
              name: "--copy-link",
              description:
                "Copy the target of this source-relative symbolic link instead of the link; repeat for more",
              args: {
                name: "path",
              },
            },
            {
              name: "--copy-links",
              description:
                "Copy the targets of every symbolic link in the source instead of the links",
            },
            {
              name: "--exclude",
              description:
                "Another pattern to leave out of the archive; repeat for more",
              args: {
                name: "pattern",
              },
            },
            {
              name: "--fail-fast",
              description: "Stop after the first failed target",
            },
            {
              name: "--force-dotfiles",
              description:
                "Overwrite files on each target that conflict with whole-file dotfile entries",
            },
            {
              name: "--host",
              description:
                "SSH destination that is not in the inventory (`[user@]host`); repeat for more",
              args: {
                name: "user@host",
              },
            },
            {
              name: ["-i", "--identity-file"],
              description:
                "SSH identity file, overriding the inventory and SSH config",
              args: {
                name: "path",
              },
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Show what would change on each target without changing it",
            },
            {
              name: "--install-mise",
              description:
                "Install the provisioned mise on each host instead of only staging it",
              args: {
                name: "path",
                isOptional: true,
              },
            },
            {
              name: "--keep-staging",
              description: "Keep the remote staging directory for debugging",
            },
            {
              name: "--mise-bin",
              description:
                "Upload this local mise executable, for platforms without an official release binary",
              args: {
                name: "path",
              },
            },
            {
              name: "--no-install-mise",
              description:
                "Do not install mise on the host, even when the selected hosts configure it",
            },
            {
              name: "--only",
              description: "Run only these parts on each target",
              args: {
                name: "part",
              },
            },
            {
              name: "--port",
              description: "SSH port, overriding the inventory and SSH config",
              args: {
                name: "port",
              },
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt securely for missing secret inputs on the remote host",
            },
            {
              name: "--remote-env",
              description:
                "Config environments to load on each target; repeat or separate with commas (for example, ci,dotfiles)",
              args: {
                name: "env",
              },
            },
            {
              name: "--remote-mise",
              description:
                "Existing mise executable name or path; relative paths use the staged project",
              args: {
                name: "command",
              },
            },
            {
              name: "--skip",
              description: "Skip these parts on each target",
              args: {
                name: "part",
              },
            },
            {
              name: "--source",
              description: "Local directory to archive and send to each target",
              args: {
                name: "dir",
              },
            },
            {
              name: "--ssh-option",
              description: "OpenSSH `-o` option; repeat for multiple options",
              args: {
                name: "option",
              },
            },
            {
              name: "--tag",
              description:
                "Select configured hosts with this tag; repeat to match any tag",
              args: {
                name: "tag",
              },
            },
            {
              name: "--update",
              description:
                "Refresh package metadata and update repositories on each target",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip confirmation prompts on each target",
            },
            {
              name: "--github-relay-read-only",
              description:
                "Borrow read-only GitHub access for this run (Linux and macOS only)",
            },
            {
              name: "--github-relay-repo",
              description:
                "Repository the targets may read through the relay; repeat for more (needs `--github-relay-read-only`)",
              args: {
                name: "owner/repo",
              },
            },
            {
              name: "--github-relay-all-repos",
              description:
                "Let targets read every repository your local credentials can read (needs `--github-relay-read-only`)",
            },
            {
              name: "--github-relay-log-requests",
              description:
                "Log sanitized relay requests on local stderr (needs `--github-relay-read-only`)",
            },
            {
              name: "--github-relay-no-log-requests",
              description:
                "Turn off request logging, overriding the `github_relay` settings (needs `--github-relay-read-only`)",
            },
            {
              name: "--github-relay-log-format",
              description:
                "Relay log and summary format, `text` or `jsonl` (needs `--github-relay-read-only`)",
              args: {
                name: "format",
              },
            },
            {
              name: "--github-relay-max-duration",
              description:
                "End borrowed access after a duration such as `1h`; `0s` lasts the whole run (needs `--github-relay-read-only`)",
              args: {
                name: "duration",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "repos",
          description: "Manage Git repositories from `[bootstrap.repos]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Clone missing Git repositories and check out configured refs",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
                {
                  name: "--skip-dirty",
                  description:
                    "Skip repositories with local changes instead of failing",
                },
              ],
            },
            {
              name: "exec",
              description: "Run a command in each configured Git repository",

              options: [
                {
                  name: ["-c", "--continue-on-error"],
                  description:
                    "Continue running in other repositories after a command fails",
                },
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Print the commands that would run without running them",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of Git repositories from `[bootstrap.repos]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any repository differs from the config (all are still listed)",
                },
              ],
            },
            {
              name: "update",
              description:
                "Clone missing Git repositories and fast-forward the rest",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
                {
                  name: "--skip-dirty",
                  description:
                    "Skip repositories with local changes instead of failing",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "secrets",
          description:
            "Inspect bootstrap secret inputs without revealing their values",
          subcommands: [
            {
              name: "status",
              description:
                "Show whether declared bootstrap secret inputs are available",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if a declared secret input is unset, empty, or not valid Unicode",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "services",
          description: "Manage services from `[bootstrap.services]`",
          subcommands: [
            {
              name: "apply",
              description:
                "Apply the service state declared in `[bootstrap.services]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "remove",
              description: "Uninstall a user-scope service",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description: "Show what would be removed without removing it",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show the state of services from `[bootstrap.services]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if any service differs from the config (all are still listed)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "settings",
          description:
            "[experimental] Apply `[bootstrap.settings]` through bootstrap settings plugins",
          subcommands: [
            {
              name: "apply",
              description:
                "Write the settings that differ from `[bootstrap.settings]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show which settings would change without changing them",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show each setting in `[bootstrap.settings]` and its current value",

              options: [
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if a setting differs from the config or its plugin cannot run",
                },
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["status", "ls"],
          description: "Show the state of every configured bootstrap part",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--missing",
              description:
                "Exit with status 1 if anything differs from the config (all entries are still listed)",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt securely for missing bootstrap secret inputs",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "unapply",
          description:
            "Remove what a config environment's bootstrap sections created",
          options: [
            {
              name: ["-f", "--force"],
              description:
                "Remove targets that changed since they were applied",
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Show what would be removed without removing anything",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt securely for missing bootstrap secret inputs",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "user",
          description: "Manage your login shell from `[bootstrap.user]`",
          subcommands: [
            {
              name: "apply",
              description: "Set your login shell from `[bootstrap.user]`",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
              ],
            },
            {
              name: "status",
              description:
                "Show whether your login shell matches `[bootstrap.user]`",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--missing",
                  description:
                    "Exit with status 1 if your login shell differs from the config",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
    },
    {
      name: "cache",
      description: "Manage the mise cache",
      subcommands: [
        {
          name: ["clear", "c", "clean"],
          description: "Deletes all cache files in mise",
          options: [
            helpOption,
            {
              name: "--task",
              description:
                "[experimental] Clear task artifact cache entries for a task name or pattern",
              args: {
                name: "task",
              },
            },
          ],
        },
        {
          name: ["path", "dir"],
          description: "Show the cache directory path",
          options: [helpOption],
        },
        {
          name: ["prune", "p"],
          description: "Removes stale mise cache files",
          options: [
            helpOption,
            {
              name: "--dry-run",
              description:
                "Show what would be pruned without deleting anything",
            },
          ],
        },
        {
          name: "task",
          description: "Inspect output cache entries for a task",
          args: {
            name: "task",
            generators: tasksGenerator,
            isOptional: true,
          },
          options: [
            helpOption,
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
          ],
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

        {
          name: "--tool",
          description:
            "Generate completions for a tool installed with the `packslip:` backend",
          args: {
            name: "tool",
          },
        },
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

            {
              name: ["-g", "--global"],
              description: "Read the global config file",
            },
            {
              name: "--system",
              description: "Read the system config file",
            },
            {
              name: "--override",
              description:
                "Read the global override file, `config.override.toml`",
            },
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

            {
              name: ["--truncate", "--no-truncate"],
              description:
                "Truncate long terminal output to fit the available width",
            },
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

            {
              name: ["-g", "--global"],
              description: "Edit the global config file",
            },
            {
              name: "--override",
              description:
                "Edit the global override file, `config.override.toml`",
            },
            {
              name: "--system",
              description: "Edit the system config file",
            },
            {
              name: "--append",
              description:
                "Append the value to a list without duplicating an existing entry",
            },
            {
              name: "--remove",
              description: "Remove the value from an existing list",
            },
          ],
        },

        {
          name: "explain",
          description: "Describe each key in a mise TOML file",
          options: [
            {
              name: ["-f", "--file"],
              description:
                "Config file to read, or a directory whose config file to read",
              args: {
                name: "file",
              },
            },
            {
              name: ["-g", "--global"],
              description: "Read the global config file",
            },
            {
              name: "--system",
              description: "Read the system config file",
            },
            {
              name: "--override",
              description:
                "Read the global override file, `config.override.toml`",
            },
            {
              name: ["-J", "--json"],
              description: "Print the keys as JSON",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
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

        {
          name: ["--truncate", "--no-truncate"],
          description:
            "Truncate long terminal output to fit the available width",
        },
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
      options: [
        helpOption,
        {
          name: "--explain",
          description:
            "Show why a provider is fresh or stale, and exit non-zero unless it is fresh (requires a PROVIDER argument)",
        },
        {
          name: ["-f", "--force"],
          description: "Run providers even when their outputs are up to date",
        },
        {
          name: ["-n", "--dry-run"],
          description: "Show which providers would run, without running them",
        },
        {
          name: "--list",
          description:
            "List configured providers with their status, sources, and outputs",
        },
        {
          name: "--monorepo",
          description:
            "Also run providers from every config root in `[monorepo].config_roots`",
        },
        {
          name: "--only",
          description: "Run only these providers",
          args: {
            name: "provider",
          },
        },
        {
          name: "--skip",
          description: "Skip these providers",
          args: {
            name: "provider",
          },
        },
      ],

      subcommands: [
        {
          name: "add",
          description: "Add packages to the project's dependencies",
          options: [
            {
              name: ["-D", "--dev"],
              description: "Add as a development dependency",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "install",
          description: "Install project dependencies",
          options: [
            {
              name: "--explain",
              description:
                "Show why a provider is fresh or stale, and exit non-zero unless it is fresh (requires a PROVIDER argument)",
            },
            {
              name: ["-f", "--force"],
              description:
                "Run providers even when their outputs are up to date",
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Show which providers would run, without running them",
            },
            {
              name: "--list",
              description:
                "List configured providers with their status, sources, and outputs",
            },
            {
              name: "--monorepo",
              description:
                "Also run providers from every config root in `[monorepo].config_roots`",
            },
            {
              name: "--only",
              description: "Run only these providers",
              args: {
                name: "provider",
              },
            },
            {
              name: "--skip",
              description: "Skip these providers",
              args: {
                name: "provider",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "remove",
          description: "Remove packages from the project's dependencies",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
    },
    {
      name: ["doctor", "dr"],
      description: "Check mise installation for possible problems",
      subcommands: [
        {
          name: ["path", "paths"],
          description: "Print the current PATH entries mise is providing",
          options: [
            helpOption,
            {
              name: ["-f", "--full"],
              description:
                "Print every PATH entry, including those mise does not provide",
            },
          ],
        },

        {
          name: "project",
          description: "Run the project's diagnostic checks",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output the complete report as JSON",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [jsonOption, helpOption],
    },
    {
      name: "edit",
      description: "Edit mise.toml interactively",
      options: [
        helpOption,
        {
          name: ["-g", "--global"],
          description:
            "Edit the global config file (~/.config/mise/config.toml)",
        },
        {
          name: ["-n", "--dry-run"],
          description: "Print the result instead of writing it to the file",
        },
        {
          name: ["-f", "--force"],
          description:
            "Replace an existing file with the starter template when not opening the editor",
        },
        {
          name: ["-t", "--tool-versions"],
          description:
            "Copy the tools from this .tool-versions file into the config, without opening the editor",
          args: {
            name: "file",
          },
        },
      ],
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

        {
          name: "--paths",
          description:
            "Print the PATH entries mise manages, in PATH order, one per line",
        },
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

        {
          name: "--allow-unix",
          description:
            "Allow connections to the Unix socket at PATH, or to every socket under it if PATH is a directory (implies --deny-unix for every other socket)",
          args: {
            name: "path",
          },
        },
        {
          name: "--deny-unix",
          description:
            "Block connections to Unix sockets outside the sandbox (Linux 7.1 or later)",
        },
        {
          name: "--secrets",
          description:
            "[experimental] Give the command these secrets (comma-separated); by default it gets none",
          args: {
            name: "secret",
          },
        },
        {
          name: "--secrets-all",
          description:
            "[experimental] Give the command every secret the project can inject, except file secrets",
        },
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
          options: [
            helpOption,
            {
              name: ["-g", "--global"],
              description:
                "Generate the global config file (~/.config/mise/config.toml)",
            },
            {
              name: ["-n", "--dry-run"],
              description: "Print the result instead of writing it to the file",
            },
            {
              name: ["-f", "--force"],
              description:
                "Replace an existing file with the starter template when not opening the editor",
            },
            {
              name: ["-t", "--tool-versions"],
              description:
                "Copy the tools from this .tool-versions file into the config, without opening the editor",
              args: {
                name: "file",
              },
            },
          ],
        },
        {
          name: "devcontainer",
          description: "Generate a devcontainer to execute mise",
          options: [
            helpOption,
            {
              name: ["-i", "--image"],
              description:
                "Base image; defaults to mcr.microsoft.com/devcontainers/base:ubuntu",
              args: {
                name: "image",
              },
            },
            {
              name: ["-m", "--mount-mise-data"],
              description:
                "Keep installed tools in a `mise-data-volume` Docker volume so they survive rebuilds",
            },
            {
              name: ["-n", "--name"],
              description: "Container name; defaults to mise",
              args: {
                name: "name",
              },
            },
            {
              name: ["-w", "--write"],
              description:
                "Write to .devcontainer/devcontainer.json instead of printing",
            },
          ],
        },
        {
          name: ["git-pre-commit", "pre-commit"],
          description: "Generate a git pre-commit hook",
          options: [
            helpOption,
            {
              name: ["-t", "--task"],
              description: "The task to run when the hook is triggered",
              args: {
                name: "task",
              },
            },
            {
              name: ["-w", "--write"],
              description:
                "Write the hook to the hooks directory and make it executable",
            },
            {
              name: "--hook",
              description: "Which git hook to write, such as pre-push",
              args: {
                name: "hook",
              },
            },
          ],
        },
        {
          name: "github-action",
          description: "Generate a GitHub Action workflow file",
          options: [
            helpOption,
            {
              name: "--write",
              description:
                "replaces an existing file. Define the task and review the triggers before committing the workflow.",
              args: {
                name: "which",
              },
            },
            {
              name: ["-t", "--task"],
              description: "The task to run when the workflow is triggered",
              args: {
                name: "task",
              },
            },
            {
              name: "--name",
              description: "Name of the workflow and its file",
              args: {
                name: "name",
              },
            },
          ],
        },
        {
          name: "install-script",
          description: "Generate a script to download+execute mise",
          options: [
            helpOption,
            {
              name: "--localize",
              args: {
                name: "then",
              },
            },
            {
              name: ["-w", "--write"],
              description:
                "Write the script to PATH (./bin/mise when no path is given) and make it executable, instead of printing it",
              args: {
                name: "path",
                isOptional: true,
              },
            },
            {
              name: "--localized-dir",
              description:
                "Directory for mise data when using --localize, relative to the project",
              args: {
                name: "dir",
              },
            },
            {
              name: "--windows",
              description: "Also write a Windows launcher, `<PATH>.cmd`",
            },
          ],
        },
        {
          name: "task-docs",
          description: "Generate documentation for tasks in a project",
          options: [
            helpOption,
            {
              name: ["-i", "--inject"],
              description: "Replace the marked section of the --output file",
            },
            {
              name: ["-I", "--index"],
              description:
                "Write only an index of tasks, intended for use with `--multi`",
            },
            {
              name: ["-m", "--multi"],
              description:
                "Render each task as a separate document; requires `--output` to be a directory",
            },
            {
              name: ["-o", "--output"],
              description: "Write the generated docs to a file or directory",
              args: {
                name: "path",
              },
            },
          ],
        },
        {
          name: "task-stubs",
          description: "Generates shims to run mise tasks",
          options: [
            helpOption,
            {
              name: ["-d", "--dir"],
              description: "Directory to create task stubs inside of",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-m", "--mise-bin"],
              description:
                "mise executable the stubs run; defaults to mise from PATH",
              args: {
                name: "path",
              },
            },
            {
              name: "--windows-launcher",
              description:
                "What to write beside each stub for Windows to launch",
              args: {
                name: "kind",
              },
            },
          ],
        },
        {
          name: "tool-stub",
          description: "Generate a tool stub for HTTP-based tools",
          options: [
            helpOption,
            {
              name: ["-b", "--bin"],
              description: "Binary path within the extracted archive",
              args: {
                name: "bin",
              },
            },
            {
              name: "--bootstrap",
              description: "Make the stub install mise when it is missing",
            },
            {
              name: "--bootstrap-version",
              description:
                "mise version the --bootstrap script installs; defaults to the latest release",
              args: {
                name: "bootstrap_version",
              },
            },
            {
              name: "--checksum-algorithm",
              description: "Checksum algorithm for downloaded artifacts",
              args: {
                name: "algorithm",
              },
            },
            {
              name: "--fetch",
              description:
                "Fetch checksums and sizes for an existing tool stub file",
            },
            {
              name: "--lock",
              description:
                "Resolve and record lock data (exact version, platform URLs and checksums) for an existing stub",
            },
            {
              name: "--platform-bin",
              description:
                "Binary path inside the archive for one platform, such as `linux-x64:bin/tool`; repeatable",
              args: {
                name: "platform_bin",
              },
            },
            {
              name: "--platform-url",
              description:
                "Download URL for one platform, as `PLATFORM:URL` or a bare URL; repeatable",
              args: {
                name: "platform_url",
              },
            },
            {
              name: "--skip-download",
              description:
                "Do not download artifacts, so checksums, sizes, and the detected binary path are left out",
            },
            {
              name: ["-u", "--url"],
              description: "URL to download the tool from",
              args: {
                name: "url",
              },
            },
          ],
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

        {
          name: "--shared",
          description: "Install into DIR instead of the mise data directory",
          args: {
            name: "dir",
          },
        },
        {
          name: "--system",
          description: "Install into the system-wide shared directory",
        },
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

        {
          name: "--json",
          description: "Output version changes as JSON",
        },
        {
          name: "--local",
          description:
            "Update mise.local.lock, for tools in mise.local.toml, instead of mise.lock",
        },
        {
          name: "--minimum-release-age",
          description:
            "Only lock versions released before a date or at least a duration ago",
          args: {
            name: "age",
          },
        },
        {
          name: "--upgrade",
          description: "Upgrade lockfiles to the latest format",
        },
        {
          name: "--sidecars",
          description:
            "List native dependency sidecars instead of updating lockfiles",
        },
        {
          name: "--check",
          description:
            "Check that the lockfile is up to date, without changing it",
        },
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

        {
          name: ["--truncate", "--no-truncate"],
          description:
            "Truncate long terminal output to fit the available width",
        },
        {
          name: ["-b", "--backend"],
          description:
            "Only show tools from this backend, such as aqua, cargo, core, or go",
          args: {
            name: "backend",
          },
        },
        {
          name: "--grouped",
          description: "List tools in a separate section for each backend",
        },
        {
          name: "--no-global",
          description:
            "Only show versions that non-global config files request",
        },
        {
          name: "--project",
          description: "Only show versions the nearest project config requests",
        },
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
          options: [
            helpOption,
            {
              name: "--copy",
              description:
                "Copy a host file, directory, or symlink into the image (repeatable, HOST:IMAGE)",
              args: {
                name: "host_path:image_path",
              },
            },
            {
              name: ["-o", "--output"],
              description: "Output directory for the OCI image layout",
              args: {
                name: "output",
              },
            },
            {
              name: "--from",
              description:
                "Base image reference (overrides [oci].from and the oci.default_from setting)",
              args: {
                name: "from",
              },
            },
            {
              name: "--include-global",
              description:
                "Also package tools from the global and system configs",
            },
            {
              name: ["-t", "--tag"],
              description:
                "Tag to record in the image index (the org.opencontainers.image.ref.name annotation)",
              args: {
                name: "tag",
              },
            },
            {
              name: "--mount-point",
              description: "Where tools install inside the image",
              args: {
                name: "mount_point",
              },
            },
            {
              name: "--no-mise",
              description:
                "Do not embed the currently-running mise binary at /usr/local/bin/mise",
            },
            {
              name: "--no-cache",
              description:
                "Rebuild tool layers without reading or writing the local layer cache",
            },
            {
              name: "--owner",
              description:
                "UID[:GID] to assign to every tar entry in generated layers",
              args: {
                name: "uid:gid",
              },
            },
          ],
        },
        {
          name: "push",
          description: "Build an OCI image and push it to a registry",
          options: [
            helpOption,
            {
              name: "--cache-from",
              description:
                "Reuse unchanged tool layers from this image instead of the destination's current tag",
              args: {
                name: "ref",
              },
            },
            {
              name: "--from",
              description: "Base image for the build",
              args: {
                name: "from",
              },
            },
            {
              name: "--image-dir",
              description:
                "Push an existing OCI image layout instead of building one",
              args: {
                name: "image_dir",
              },
            },
            {
              name: ["--include-global", "--mount-point", "--no-mise"],
              args: {
                name: "or",
              },
            },
            {
              name: "--no-cache",
              description:
                "Rebuild tool layers without using the remote or local layer cache",
            },
            {
              name: "--owner",
              description:
                "UID[:GID] to assign to every tar entry when building",
              args: {
                name: "uid:gid",
              },
            },
            {
              name: "--update-index",
              description: "Maintain the tag as a multi-arch image index",
            },
          ],
        },
        {
          name: "run",
          description: "Build an OCI image and run a command in it",
          options: [
            helpOption,
            {
              name: "--engine",
              description:
                "Container engine to use; `auto` prefers podman and falls back to docker",
              args: {
                name: "engine",
                suggestions: ["auto", "podman", "docker"],
              },
            },
            {
              name: "--from",
              description: "Base image for the build",
              args: {
                name: "from",
              },
            },
            {
              name: "--image-dir",
              description:
                "Use an existing OCI image layout instead of building one",
              args: {
                name: "image_dir",
              },
            },
            {
              name: ["--include-global", "--mount-point", "--no-mise"],
              args: {
                name: "or",
              },
            },
            {
              name: "--keep",
              description:
                "Keep the loaded image in the engine's storage after the run",
            },
            {
              name: "--owner",
              description:
                "UID[:GID] to assign to every tar entry when building",
              args: {
                name: "uid:gid",
              },
            },
            {
              name: "--volume",
              description:
                "Bind-mount a host path (repeatable, `HOST:CONTAINER[:MODE]`)",
              args: {
                name: "host:container",
              },
            },
            {
              name: ["-i", "--interactive"],
              description: "Run interactively (pass `-i` to the engine)",
            },
            {
              name: ["-t", "--tty"],
              description: "Allocate a TTY (pass `-t` to the engine)",
            },
            {
              name: ["-w", "--workdir"],
              description: "Working directory inside the container",
              args: {
                name: "workdir",
              },
            },
          ],
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

        {
          name: "--global",
          description: "Only check tools defined in the global config",
        },
        {
          name: "--no-global",
          description: "Only check tools defined in project config files",
        },
      ],
    },
    {
      name: "patrons",
      description: "Show the individuals supporting mise as Patron members",
      options: [
        helpOption,
        {
          name: ["-J", "--json"],
          description: "Output in JSON format",
        },
        {
          name: "--refresh",
          description: "Fetch the list now instead of using the cached copy",
        },
      ],
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

            {
              name: ["-o", "--outdated"],
              description:
                "Only show plugins whose Git remote has newer commits",
            },
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

        {
          name: "--system",
          description:
            "Delete unused versions from the system installs directory instead of your own",
        },
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

        {
          name: "--affected-committed",
          description:
            "Count committed changes between the base and head revisions",
        },
        {
          name: "--affected-uncommitted",
          description: "Count staged and unstaged changes to tracked files",
        },
        {
          name: "--affected-untracked",
          description: "Count untracked files that Git does not ignore",
        },
        {
          name: "--at",
          description:
            "Run the tasks at another git revision, in a temporary worktree",
          args: {
            name: "rev",
          },
        },
        {
          name: "--at-setup",
          description:
            "Run this shell command in the `--at` worktree before the tasks",
          args: {
            name: "cmd",
          },
        },
        {
          name: "--global",
          description: "Open the task picker with only the global tasks",
        },
        {
          name: "--no-global",
          description: "Open the task picker without the global tasks",
        },
        {
          name: "--multi",
          description:
            "Open the task picker as a checklist and run every task you check",
        },
        {
          name: "--report-file",
          description:
            "Write a JSON report of every task the run scheduled to this file when the run ends",
          args: {
            name: "path",
          },
        },
        {
          name: "--secrets",
          description:
            "[experimental] Give the named tasks these secrets (comma-separated); their dependencies and subtasks do not get them",
          args: {
            name: "secret",
          },
        },
        {
          name: "--secrets-all",
          description:
            "[experimental] Give the named tasks every secret the project can inject; their dependencies and subtasks do not get them",
        },
        {
          name: "--allow-env",
          description:
            "Allow a specific env var through (implies `--deny-env` for everything else)",
          args: {
            name: "var",
          },
        },
        {
          name: "--allow-net",
          description:
            "Allow network access only to HOST (not supported on any platform)",
          args: {
            name: "host",
          },
        },
        {
          name: "--allow-read",
          description:
            "Allow reads from a specific path (implies `--deny-read` for everything else)",
          args: {
            name: "path",
          },
        },
        {
          name: "--allow-write",
          description:
            "Allow writes to a specific path (implies `--deny-write` for everything else)",
          args: {
            name: "path",
          },
        },
        {
          name: "--allow-unix",
          description:
            "Allow connections to the Unix socket at a specific path, or to every socket under it if PATH is a directory (implies `--deny-unix` for every other socket). Abstract sockets created inside the sandbox stay reachable. Linux 7.1 or later only.",
          args: {
            name: "path",
          },
        },
        {
          name: "--deny-all",
          description: "Block reads, writes, network, and env vars",
        },
        {
          name: "--deny-env",
          description:
            "Block env var inheritance except PATH, HOME, USER, SHELL, TERM, COLORTERM, and LANG",
        },
        {
          name: "--deny-net",
          description: "Block all network access",
        },
        {
          name: "--deny-read",
          description:
            "Block filesystem reads (system libraries and tool directories stay readable)",
        },
        {
          name: "--deny-write",
          description:
            "Block filesystem writes except temporary and device paths (/tmp, /dev)",
        },
        {
          name: "--deny-unix",
          description:
            "Block connections to Unix sockets outside the sandbox (Linux 7.1 or later only)",
        },
        {
          name: "--fresh-env",
          description:
            "Bypass the environment cache and recompute the environment",
        },
        {
          name: "--no-cache",
          description: "Do not use the cache for remote tasks",
        },
        {
          name: "--no-deps",
          description:
            "Do not run `[deps]` providers that have `auto = true` before the tasks",
        },
        {
          name: "--skip-deps",
          description: "Run only the named tasks, not the tasks they depend on",
        },
        {
          name: "--skip-tools",
          description: "Do not install missing tools before running the tasks",
        },
        {
          name: "--task-cache",
          description: "[experimental] Set artifact cache access for this run",
          args: {
            name: "task_cache",
          },
        },
        {
          name: "--task-cache-explain",
          description:
            "[experimental] Explain the inputs that produced each task's artifact cache key",
        },
        {
          name: "--task-cache-explain-json",
          description:
            "[experimental] Print cache-key input details as JSON Lines without running tasks (requires `--dry-run`)",
        },
        {
          name: "--task-cache-stats",
          description:
            "[experimental] Report artifact cache hits, restored bytes, and time saved",
        },
        {
          name: "--tag",
          description:
            "Run only the matching tasks that have this tag; repeat to accept any of several",
          args: {
            name: "tag",
          },
        },
        {
          name: "--timeout",
          description:
            "Stop the run if it takes longer than this, e.g. 30s or 5m",
          args: {
            name: "timeout",
          },
        },
        {
          name: "--lock-timeout",
          description:
            "Fail a task that waits longer than this for a lock, e.g. 30s or 5m",
          args: {
            name: "lock_timeout",
          },
        },
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

        {
          name: ["-a", "--all"],
          description:
            "Search every source: the registry, aqua, installed backend plugins, and the npm, cargo, gem, and dotnet package registries",
        },
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

        {
          name: "--minimum-release-age",
          description: "Minimum release age for this update, such as 7d",
          args: {
            name: "minimum_release_age",
          },
        },
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

        {
          name: "--override",
          description:
            "Set the environment variable in the global override file, `config.override.toml`",
        },
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

            {
              name: "--override",
              description:
                "Write to the global override file, `config.override.toml`",
            },
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

            {
              name: "--override",
              description:
                "Write to the global override file, `config.override.toml`",
            },
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

            {
              name: "--override",
              description:
                "Write to the global override file, `config.override.toml`",
            },
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

        {
          name: "--all",
          description:
            "With `--unset`, remove every `MISE_<TOOL>_VERSION` in this shell",
        },
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
          options: [
            helpOption,
            {
              name: ["-f", "--file"],
              description: "Create a file task instead of a TOML task",
            },
            {
              name: ["-F", "--force"],
              description:
                "Replace a task that already has this name in the file",
            },
            {
              name: ["-n", "--dry-run"],
              description: "Show what would be written without writing it",
            },
            {
              name: ["-J", "--json"],
              description: "Print what was written as JSON",
            },
            {
              name: ["-g", "--global"],
              description: "Use the global config file",
            },
            {
              name: ["-p", "--path"],
              description:
                "Use this config file, or the config file in this directory",
              args: {
                name: "path",
              },
            },
            {
              name: ["-a", "--alias"],
              description: "Other names for the task",
              args: {
                name: "alias",
              },
            },
            {
              name: ["-d", "--depends"],
              description: "Tasks to run before this one",
              args: {
                name: "task",
              },
            },
            {
              name: ["-D", "--dir"],
              description: "Run the task in a specific directory",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-H", "--hide"],
              description: "Hide the task from `mise tasks` and completions",
            },
            {
              name: ["-s", "--sources"],
              description: "Glob patterns of files this task uses as input",
              args: {
                name: "glob",
              },
            },
            {
              name: ["-w", "--wait-for"],
              description:
                "Wait for these tasks to finish if they are also being run",
              args: {
                name: "task",
              },
            },
            {
              name: "--confirm",
              description:
                "Ask this question before the task runs, and run it only if the answer is yes",
              args: {
                name: "message",
              },
            },
            {
              name: "--depends-post",
              description: "Tasks to run after this one",
              args: {
                name: "task",
              },
            },
            {
              name: "--description",
              description: "Description of the task",
              args: {
                name: "description",
              },
            },
            {
              name: "--env-var",
              description:
                "Set an environment variable for the task; repeat for several",
              args: {
                name: "key=value",
              },
            },
            {
              name: "--outputs",
              description:
                "Glob patterns of files this task creates, used to skip it when they are up to date",
              args: {
                name: "glob",
              },
            },
            {
              name: "--run-windows",
              description:
                "Command to run on Windows (TOML tasks only; ignored with `--file`)",
              args: {
                name: "command",
              },
            },
            {
              name: "--shell",
              description: "Run the task in a specific shell",
              args: {
                name: "shell",
              },
            },
            {
              name: "--tools",
              description:
                "Tool the task needs, such as node@24 or npm:prettier@3; repeat for several",
              args: {
                name: "tool@version",
              },
            },
            {
              name: "--usage",
              description:
                "Usage spec for the task's arguments and flags: https://usage.jdx.dev/spec/",
              args: {
                name: "spec",
              },
            },
          ],
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

            {
              name: "--compact",
              description:
                "Collapse repeated dependencies after their first occurrence",
            },
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
          options: [
            helpOption,
            {
              name: ["-J", "--json"],
              description: "Output the project graph as JSON",
            },
            {
              name: "--explain",
              description:
                "Show which provider and workspace file each project, dependency, and task field came from",
            },
            {
              name: "--no-header",
              description: "Do not print table headers",
            },
          ],
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

            {
              name: "--no-global",
              description: "Only show non-global tasks",
            },
            {
              name: "--tag",
              description:
                "Only show tasks that have this tag; repeat to accept any of several",
              args: {
                name: "tag",
              },
            },
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
          options: [
            helpOption,
            {
              name: "--errors-only",
              description: "Only show errors (skip warnings)",
            },
            {
              name: "--json",
              description: "Output validation results in JSON format",
            },
          ],
        },

        {
          name: "history",
          description: "Show recent task runs and how long they took",
          options: [
            {
              name: ["-s", "--summary"],
              description:
                "Show one line per task: runs, failures, median and last duration, last status",
            },
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "log",
          description: "Print the output of a task's last run",
          options: [
            {
              name: "--path",
              description:
                "Print the path of the log file instead of its contents",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["rm", "remove"],
          description: "Remove tasks",
          options: [
            {
              name: ["-n", "--dry-run"],
              description: "Show what would be removed without removing it",
            },
            {
              name: ["-J", "--json"],
              description: "Print what was removed as JSON",
            },
            {
              name: ["-e", "--env"],
              description:
                "Use mise.<ENV>.toml in the current directory, or .mise.<ENV>.toml if that exists",
              args: {
                name: "env",
              },
            },
            {
              name: ["-g", "--global"],
              description: "Use the global config file",
            },
            {
              name: ["-p", "--path"],
              description:
                "Use this config file, or the config file in this directory",
              args: {
                name: "path",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "set",
          description: "Change fields of an existing TOML task",
          options: [
            {
              name: ["-n", "--dry-run"],
              description: "Show what would be written without writing it",
            },
            {
              name: ["-J", "--json"],
              description: "Print what was written as JSON",
            },
            {
              name: ["-u", "--unset"],
              description:
                "Remove this field from the task; repeat for several",
              args: {
                name: "field",
              },
            },
            {
              name: ["-e", "--env"],
              description:
                "Use mise.<ENV>.toml in the current directory, or .mise.<ENV>.toml if that exists",
              args: {
                name: "env",
              },
            },
            {
              name: ["-g", "--global"],
              description: "Use the global config file",
            },
            {
              name: ["-p", "--path"],
              description:
                "Use this config file, or the config file in this directory",
              args: {
                name: "path",
              },
            },
            {
              name: ["-a", "--alias"],
              description: "Other names for the task",
              args: {
                name: "alias",
              },
            },
            {
              name: ["-d", "--depends"],
              description: "Tasks to run before this one",
              args: {
                name: "task",
              },
            },
            {
              name: ["-D", "--dir"],
              description: "Run the task in a specific directory",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-H", "--hide"],
              description: "Hide the task from `mise tasks` and completions",
            },
            {
              name: ["-q", "--quiet"],
              description: "Do not print the command before running",
            },
            {
              name: ["-r", "--raw"],
              description:
                "Connect the task directly to the terminal's stdin, stdout, and stderr",
            },
            {
              name: ["-s", "--sources"],
              description: "Glob patterns of files this task uses as input",
              args: {
                name: "glob",
              },
            },
            {
              name: ["-w", "--wait-for"],
              description:
                "Wait for these tasks to finish if they are also being run",
              args: {
                name: "task",
              },
            },
            {
              name: "--confirm",
              description:
                "Ask this question before the task runs, and run it only if the answer is yes",
              args: {
                name: "message",
              },
            },
            {
              name: "--depends-post",
              description: "Tasks to run after this one",
              args: {
                name: "task",
              },
            },
            {
              name: "--description",
              description: "Description of the task",
              args: {
                name: "description",
              },
            },
            {
              name: "--env-var",
              description:
                "Set an environment variable for the task; repeat for several",
              args: {
                name: "key=value",
              },
            },
            {
              name: "--outputs",
              description:
                "Glob patterns of files this task creates, used to skip it when they are up to date",
              args: {
                name: "glob",
              },
            },
            {
              name: "--run-windows",
              description:
                "Command to run on Windows (TOML tasks only; ignored with `--file`)",
              args: {
                name: "command",
              },
            },
            {
              name: "--shell",
              description: "Run the task in a specific shell",
              args: {
                name: "shell",
              },
            },
            {
              name: "--silent",
              description: "Do not print the command or its output",
            },
            {
              name: "--tools",
              description:
                "Tool the task needs, such as node@24 or npm:prettier@3; repeat for several",
              args: {
                name: "tool@version",
              },
            },
            {
              name: "--usage",
              description:
                "Usage spec for the task's arguments and flags: https://usage.jdx.dev/spec/",
              args: {
                name: "spec",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR as MISE_ENV)",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
          ],
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

        {
          name: "--no-global",
          description: "Only show non-global tasks",
        },
        {
          name: "--tag",
          description:
            "Only show tasks that have this tag; repeat to accept any of several",
          args: {
            name: "tag",
          },
        },
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
          options: [
            helpOption,
            {
              name: "--unmask",
              description: "Show the full unmasked token",
            },
          ],
        },
        {
          name: "github",
          description: "GitHub token",
          options: [
            helpOption,
            {
              name: "--oauth",
              description:
                "Use only native GitHub OAuth (a cached token, a refresh, or the device-code flow), ignoring other token sources",
            },
            {
              name: "--refresh",
              description:
                "With --oauth, get a new OAuth token even if the cached one has not expired, through the refresh-token grant or a new device-code flow. Use it after changing the GitHub App's installations or permissions: cached tokens keep their original access until they expire.",
            },
            {
              name: "--unmask",
              description: "Show the full unmasked token",
            },
          ],
        },
        {
          name: "gitlab",
          description: "GitLab token",
          options: [
            helpOption,
            {
              name: "--unmask",
              description: "Show the full unmasked token",
            },
          ],
        },
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

        {
          name: "--url",
          description: "Only show the project URL from the registry",
        },
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

        {
          name: "--project",
          description:
            "Remove the installed versions the nearest project config requests",
        },
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

        {
          name: "--override",
          description: "Use the global override file, `config.override.toml`",
        },
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

        {
          name: "--override",
          description:
            "Write to the global override file, `config.override.toml`",
        },
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

        {
          name: "--pin",
          description:
            "With --bump, write the resolved version instead of keeping the request's precision",
        },
        {
          name: "--vulnerable",
          description: "Only upgrade tools with a known vulnerability",
        },
        {
          name: "--global",
          description: "Only upgrade tools defined in the global config",
        },
        {
          name: "--no-global",
          description: "Only upgrade tools defined in project config files",
        },
        {
          name: "--no-prune",
          description:
            "Do not uninstall the versions that were upgraded away from",
        },
        {
          name: "--prune",
          description:
            "Immediately uninstall the versions that were upgraded away from",
        },
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

        {
          name: "--tool-option",
          description:
            "Set an option for the tool that follows; repeat for several options",
          args: {
            name: "key=value",
          },
        },
        {
          name: "--override",
          description:
            "Write to the global override file, `config.override.toml`",
        },
        {
          name: "--fuzzy",
          description:
            "Write the version as requested, such as `20` for node@20",
        },
        {
          name: "--pin",
          description:
            "Write the resolved version, such as `20.19.5` for node@20",
        },
        {
          name: "--remove",
          description: "Remove these tools from the config file",
          args: {
            name: "tool",
          },
        },
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

        {
          name: ["-g", "--glob"],
          description: "Globs to watch instead of the tasks' sources",
          args: {
            name: "glob",
          },
        },
        {
          name: "--once",
          description:
            "Wait for a change, run the tasks once, and exit with their status",
        },
        {
          name: ["-s", "--signal"],
          description: "Signal to send to the running tasks when files change",
          args: {
            name: "signal",
          },
        },
        {
          name: "--stop-signal",
          description:
            "Signal that stops the tasks before a restart (default on Unix: SIGTERM)",
          args: {
            name: "signal",
          },
        },
        {
          name: "--stop-timeout",
          description:
            "How long to wait for the tasks to stop before killing them",
          args: {
            name: "timeout",
          },
        },
        {
          name: "--map-signal",
          description:
            "Translate a signal that watchexec receives into one it sends to the tasks",
          args: {
            name: "signal:signal",
          },
        },
        {
          name: ["-d", "--debounce"],
          description: "How long to wait for more changes before running",
          args: {
            name: "timeout",
          },
        },
        {
          name: "--stdin-quit",
          description: "Exit when stdin closes",
        },
        {
          name: "--exit-on-error",
          description:
            "Stop watching when a run fails, and exit with its status",
        },
        {
          name: ["-p", "--postpone"],
          description: "Wait for the first change before running the tasks",
        },
        {
          name: "--delay-run",
          description:
            "Wait this long after a change before running the tasks, e.g. 5s",
          args: {
            name: "duration",
          },
        },
        {
          name: "--poll",
          description: "Poll for changes instead of using native file watching",
          args: {
            name: "interval",
            isOptional: true,
          },
        },
        {
          name: "--project-origin",
          description: "Set the project origin",
          args: {
            name: "directory",
          },
        },
        {
          name: "--shell",
          description: "Use a different shell",
          args: {
            name: "shell",
          },
        },
        {
          name: "-n",
          description: "Shorthand for '--shell=none'",
        },
        {
          name: "--emit-events-to",
          description: "Configure event emission",
          args: {
            name: "mode",
          },
        },
        {
          name: "--watchexec-env",
          description: "Add env vars to the command",
          args: {
            name: "key=value",
          },
        },
        {
          name: "--wrap-process",
          description: "How to wrap the task process: group, session, or none",
          args: {
            name: "mode",
          },
        },
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

    {
      name: "audit",
      description: "Check tool versions for known vulnerabilities",
      options: [
        {
          name: ["-J", "--json"],
          description: "Output in JSON format",
        },
        {
          name: "--no-header",
          description: "Do not print the table header",
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: ["daemons", "daemon"],
      description: "[experimental] Manage project daemons with pitchfork",
      subcommands: [
        {
          name: "logs",
          description: "[experimental] Show the output of project daemons",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["ls", "list"],
          description: "[experimental] List project daemons",
          options: [
            {
              name: "--json",
              description:
                "Output in JSON format, including ports, URLs, and data directories",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "providers",
          description:
            "[experimental] Manage shared servers from global `[daemon_providers]`",
          subcommands: [
            {
              name: "ls",
              description: "[experimental] List shared servers",

              options: [
                {
                  name: "--json",
                  description: "Output in JSON format",
                },
              ],
            },
            {
              name: "restart",
              description:
                "[experimental] Restart shared servers with their current configuration",
            },
            {
              name: "start",
              description: "[experimental] Start shared servers",
            },
            {
              name: "stop",
              description: "[experimental] Stop shared servers (data is kept)",
            },
          ],
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "prune",
          description:
            "[experimental] Remove daemon state left by deleted projects",
          options: [
            {
              name: ["-n", "--dry-run"],
              description:
                "Show what would be removed without deleting anything",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "register",
          description:
            "[experimental] Register project daemons for on-demand startup",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "restart",
          description: "[experimental] Restart project daemons",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "start",
          description:
            "[experimental] Start project daemons and the daemons they depend on",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "status",
          description: "[experimental] Show the status of project daemons",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "stop",
          description: "[experimental] Stop project daemons",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "tui",
          description: "[experimental] Open the pitchfork dashboard",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "urls",
          description: "[experimental] Show each daemon's URL and port",
          options: [
            {
              name: "--json",
              description:
                "Output in JSON format, including ports, URLs, and data directories",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: "--json",
          description:
            "Output in JSON format, including ports, URLs, and data directories",
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: ["dotfiles", "dot"],
      description: "Deploy, track, and sync dotfiles",
      subcommands: [
        {
          name: "add",
          description:
            "Start deploying a file, or copy its edits back to the source",
          options: [
            {
              name: "--changed",
              description:
                "Update the sources of every changed file managed in copy mode",
            },
            {
              name: ["-f", "--force"],
              description: "Overwrite existing sources without prompting",
            },
            {
              name: ["-g", "--global"],
              description: "Write to the global config (the default)",
            },
            {
              name: ["-l", "--local"],
              description:
                "Write to the project config instead of the global config",
            },
            {
              name: ["-m", "--mode"],
              description:
                "Mode for a target that is not managed yet: symlink, symlink-each, copy, or template",
              args: {
                name: "mode",
              },
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Print the config and source changes without writing anything",
            },
            {
              name: "--no-apply",
              description: "Add the entry without applying it",
            },
            {
              name: ["-p", "--path"],
              description: "Write to this config file or directory",
              args: {
                name: "path",
              },
            },
            {
              name: ["-s", "--source"],
              description: "Source path to use for a single target",
              args: {
                name: "path",
              },
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: "--group",
              description: "Capture into the tree of this dotfile group",
              args: {
                name: "name",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "apply",
          description: "Link, copy, and render `[dotfiles]` entries into place",
          options: [
            {
              name: ["-f", "--force"],
              description:
                "Overwrite existing files that conflict with whole-file dotfile entries",
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Print the actions that would run without writing anything",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: "--prune",
              description:
                "Also remove files that dotfile groups deployed but no active entry deploys now",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "capture",
          description:
            "Run a command and save tracked files before and after it",
          options: [
            {
              name: "--label",
              description: "Describe this operation in history",
              args: {
                name: "label",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "conflicts",
          description: "Compare both sides of a sync conflict",
          options: [
            {
              name: "--difftool",
              description:
                "Open the comparison in Git's configured diff or merge tool",
            },
            {
              name: "--tool",
              description:
                "Use this Git diff tool instead of the configured default",
              args: {
                name: "tool",
              },
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "diff",
          description: "Show what `mise dot apply` would change",
          options: [
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "edit",
          description: "Open a dotfile's source in your editor",
          options: [
            {
              name: "--apply",
              description: "Apply this target after the editor exits",
            },
            {
              name: ["-m", "--mode"],
              description:
                "Mode to use if the target is not managed yet: symlink, symlink-each, copy, or template",
              args: {
                name: "mode",
              },
            },
            {
              name: ["-s", "--source"],
              description:
                "Source path to use if the target is not yet managed",
              args: {
                name: "path",
              },
            },
            {
              name: ["-y", "--yes"],
              description:
                "Skip the confirmation prompt when adding an unmanaged target",
            },
            {
              name: "--group",
              description:
                "Dotfile group whose tree holds the target, when several groups deploy into its directory",
              args: {
                name: "name",
              },
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "exclude",
          description: "Never save paths matching a glob",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "files",
          description:
            "List a directory's files and whether each one is tracked",
          options: [
            {
              name: ["-r", "--recursive"],
              description:
                "List files in subdirectories too, instead of one row per subdirectory",
            },
            {
              name: "--tracked",
              description: "Only show what is tracked",
            },
            {
              name: "--untracked",
              description: "Only show what holds nothing tracked",
            },
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "history",
          description: "Browse saved versions of your tracked files",
          subcommands: [
            {
              name: "describe",
              description: "Set the description of a checkpoint",
            },
            {
              name: "diff",
              description: "Compare checkpoints, or your files against one",

              options: [
                {
                  name: "--operation",
                  description:
                    "Compare an operation with the checkpoint it saved before it ran",
                },
                {
                  name: ["-p", "--patch"],
                  description:
                    "Print the full patch instead of a per-file summary",
                },
                {
                  name: "--path",
                  description: "Restrict to one path (a file or a directory)",
                  args: {
                    name: "path",
                  },
                },
                {
                  name: "--exit-code",
                  description: "Exit 1 when the two sides differ",
                },
              ],
            },
            {
              name: ["ls", "list"],
              description: "List checkpoints, newest first",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: ["-n", "--limit"],
                  description: "Show at most this many checkpoints (0 for all)",
                  args: {
                    name: "limit",
                  },
                },
                {
                  name: "--path",
                  description:
                    "Only checkpoints where this path (or something under it) changed",
                  args: {
                    name: "path",
                  },
                },
                {
                  name: "--trigger",
                  description:
                    "Only checkpoints with this trigger, such as edit, save, agent, bootstrap, apply, rollback, or undo",
                  args: {
                    name: "trigger",
                  },
                },
                {
                  name: "--label",
                  description: "Only checkpoints with this label",
                  args: {
                    name: "label",
                  },
                },
                {
                  name: "--pending",
                  description:
                    "Only checkpoints recorded by operations that did not finish",
                },
              ],
            },
            {
              name: "purge",
              description: "Erase a path's saved versions from history",

              options: [
                {
                  name: ["-n", "--dry-run"],
                  description:
                    "Show what would change without changing anything",
                },
                {
                  name: "--backup",
                  description:
                    "Keep the replaced history in the repository under `refs/mise/purge-backup/`",
                },
                {
                  name: "--keep-objects",
                  description:
                    "Leave the replaced objects on disk instead of deleting them",
                },
              ],
            },
            {
              name: "show",
              description:
                "Show a checkpoint: its trigger, changes, and operation journal",

              options: [
                {
                  name: ["-J", "--json"],
                  description: "Output in JSON format",
                },
                {
                  name: "--files",
                  description: "List every file in the snapshot",
                },
                {
                  name: "--path",
                  description:
                    "Resolve `latest~N` among the checkpoints where this path changed",
                  args: {
                    name: "path",
                  },
                },
              ],
            },
          ],
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: ["-n", "--limit"],
              description: "Show at most this many checkpoints (0 for all)",
              args: {
                name: "limit",
              },
            },
            {
              name: "--path",
              description:
                "Only checkpoints where this path (or something under it) changed",
              args: {
                name: "path",
              },
            },
            {
              name: "--trigger",
              description:
                "Only checkpoints with this trigger, such as edit, save, agent, bootstrap, apply, rollback, or undo",
              args: {
                name: "trigger",
              },
            },
            {
              name: "--label",
              description: "Only checkpoints with this label",
              args: {
                name: "label",
              },
            },
            {
              name: "--pending",
              description:
                "Only checkpoints recorded by operations that did not finish",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "include",
          description: "Stop excluding paths matching a glob",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "notify",
          description: "Send a test desktop notification",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "origin",
          description: "Show, connect, or disconnect the origin repository",
          subcommands: [
            {
              name: "set",
              description: "Connect an origin repository",

              options: [
                {
                  name: "--branch",
                  description: "The branch to sync",
                  args: {
                    name: "branch",
                  },
                },
                {
                  name: "--sync",
                  description:
                    "How to sync with the repository: sync, fetch-only, or manual",
                  args: {
                    name: "mode",
                  },
                },
              ],
            },
          ],
          options: [
            {
              name: "--remove",
              description:
                "Disconnect the origin by removing `[history.origin]`; local checkpoints and fetched history stay",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "paths",
          description: "List tracked paths and how they are saved",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--preview",
              description:
                "List the files that tracking this path would save, without tracking it",
              args: {
                name: "path",
              },
            },
            {
              name: "--noisy",
              description:
                "List the paths the watcher found changing constantly and saves less often",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "pull",
          description:
            "Write fetched changes from other machines to tracked files",
          options: [
            {
              name: ["-n", "--dry-run"],
              description: "Show the plan without changing anything",
            },
            {
              name: ["-y", "--yes"],
              description:
                "Accepted for compatibility; pull skips the apply confirmation",
            },
            {
              name: "--take-remote",
              description: "Resolve a conflict with the origin's version",
              args: {
                name: "path",
              },
            },
            {
              name: "--keep-local",
              description:
                "Resolve a conflict by keeping this machine's version; the next sync pushes it",
              args: {
                name: "path",
              },
            },
            {
              name: "--take-remote-all",
              description:
                "Resolve every remaining conflict with the origin's version",
            },
            {
              name: "--keep-local-all",
              description:
                "Resolve every remaining conflict by keeping this machine's version",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "recover",
          description: "Recover an interrupted dotfile operation",
          options: [
            {
              name: "--keep-current",
              description:
                "Keep the files on disk instead of restoring the recovery copies",
            },
            {
              name: ["-y", "--yes"],
              description:
                "Discard the operation's recovery copies without prompting",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "rollback",
          description: "Return files to the version a checkpoint holds",
          options: [
            {
              name: "--to",
              description:
                "The checkpoint to roll back to: numeric ID, `latest`, `latest~N`, or `commit:<sha>`",
              args: {
                name: "ref",
              },
            },
            {
              name: "--all",
              description:
                "With `--to`, restore everything the checkpoint covers",
            },
            {
              name: ["-n", "--dry-run"],
              description: "Show the plan without changing anything",
            },
            {
              name: ["-y", "--yes"],
              description: "Apply without prompting",
            },
            {
              name: "--force",
              description:
                "Replace a path whose type changed (file, symlink, directory)",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "save",
          description: "Save a checkpoint of the tracked files now",
          options: [
            {
              name: ["-d", "--description"],
              description: "A description for the checkpoint",
              args: {
                name: "text",
              },
            },
            {
              name: "--trigger",
              description:
                "Record the checkpoint as a save, agent, or update checkpoint",
              args: {
                name: "trigger",
              },
            },
            {
              name: "--task",
              description:
                "The ID of the task an agent is working on, recorded with the checkpoint",
              args: {
                name: "id",
              },
            },
            {
              name: "--label",
              description: "A label to find the checkpoint by later",
              args: {
                name: "label",
              },
            },
            {
              name: "--best-effort",
              description:
                "Warn instead of failing when the checkpoint cannot be written",
            },
            {
              name: "--re-encrypt",
              description:
                "Re-encrypt every saved encrypted file to the current recipients",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["status", "ls"],
          description: "Show the state of your dotfiles and their history",
          options: [
            {
              name: ["--truncate", "--no-truncate"],
              description:
                "Truncate long terminal output to fit the available width",
            },
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--missing",
              description:
                "Exit with code 1 if any dotfile is not in its desired state (missing, source missing, or differs)",
            },
            {
              name: ["-v", "--verbose"],
              description:
                "List every entry, including those already applied or tracked",
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "sync",
          description: "Push saved checkpoints and fetch incoming changes",
          options: [
            {
              name: "--fetch-only",
              description: "Fetch without pushing",
            },
            {
              name: "--allow-plaintext-history",
              description:
                "Allow pushing older unencrypted versions of files that are now encrypted, and versions that look like they contain secrets",
            },
            {
              name: "--best-effort",
              description:
                "Warn instead of failing when the origin is unreachable",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "track",
          description: "Track a file or directory in place",
          options: [
            {
              name: "--os",
              description:
                "Declare a variant for this platform (macos, linux, linux/arm64, …)",
              args: {
                name: "os",
              },
            },
            {
              name: "--profile",
              description:
                "Declare a variant for this config environment (`MISE_ENV` or `-E`)",
              args: {
                name: "profile",
              },
            },
            {
              name: "--local",
              description:
                "Keep this file's history on this machine only; it is never shared",
            },
            {
              name: "--machine",
              description:
                "Keep a separate stream on every machine, never applied on another",
            },
            {
              name: "--no-autosave",
              description:
                "Save only on `mise dot save <path>`, never automatically",
            },
            {
              name: "--encrypt",
              description:
                "Encrypt contents before saving them to history (requires `[history.encryption] recipients`)",
            },
            {
              name: "--allow-plaintext",
              description:
                "Save an explicitly tracked credential-named file in plaintext",
            },
            {
              name: ["-y", "--yes"],
              description:
                "Accepted for compatibility; track no longer asks to confirm the paths",
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Show what each path expands to (files, size, what is left out) without tracking it",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "unapply",
          description: "Remove files that `mise dot apply` deployed",
          options: [
            {
              name: ["-f", "--force"],
              description:
                "Remove modified or otherwise ambiguous managed files and lines",
            },
            {
              name: ["-n", "--dry-run"],
              description:
                "Print the actions that would run without writing anything",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: "--group",
              description:
                "Only unapply the files of this dotfile group, even one that is no longer selected or declared",
              args: {
                name: "name",
              },
            },
            {
              name: "--prompt-secrets",
              description:
                "Prompt for `[bootstrap.secrets]` values that templates need and the environment does not set",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "undo",
          description: "Reverse the tracked-file changes from an operation",
          options: [
            {
              name: ["-n", "--dry-run"],
              description: "Show the plan without changing anything",
            },
            {
              name: ["-y", "--yes"],
              description: "Apply without prompting",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "untrack",
          description: "Stop tracking a file or directory",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "watch",
          description: "Save tracked files as they change",
          options: [
            {
              name: "--once",
              description:
                "Rescan and sync once, then exit (for timers and cron)",
            },
            {
              name: ["-J", "--json"],
              description:
                "Print one JSON object per line instead of log lines",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: "--local",
          description:
            'Work on this machine\'s local-only history (`mode = "track-local"`), which is never shared',
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "installs",
      description:
        "[experimental] Inspect and choose identity-layout installations",
      subcommands: [
        {
          name: ["ls", "list"],
          description: "List the installations of the identity install layout",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--no-header",
              description: "Do not print the table header",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "migrate",
          description:
            "Reinstall legacy installations into the identity install layout",
          options: [
            {
              name: ["-n", "--dry-run"],
              description: "Show what would move without changing anything",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "select",
          description:
            "Choose which installation mise uses when no lockfile pins one",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "lsp",
      description:
        "Run the language server for mise config files over stdin/stdout",
      options: [
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "packslip",
      description:
        "Inspect and reset the signers mise has pinned for packslip tools",
      subcommands: [
        {
          name: "forget",
          description:
            "Forget a project's pinned signer so the next accepted release sets it",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["pins", "list"],
          description:
            "List the signer mise has pinned for each packslip project",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "secrets",
      description: "[experimental] Inspect the project's secrets source",
      subcommands: [
        {
          name: ["ls", "list"],
          description:
            "[experimental] List secret names from the project's secrets source",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--no-header",
              description: "Do not print the table header",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-J", "--json"],
          description: "Output in JSON format",
        },
        {
          name: "--no-header",
          description: "Do not print the table header",
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: ["skills", "skill"],
      description: "List and link the agent skills that active tools ship",
      subcommands: [
        {
          name: ["ls", "list"],
          description: "List the skills the active tools declare",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "sync",
          description:
            "Link the active tools' skills where an agent looks for them",
          options: [
            {
              name: "--dir",
              description: "The directory to link skills into",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-g", "--global"],
              description:
                "Link into the skills.dir directory under your home directory instead of the project's",
            },
            {
              name: "--prune",
              description:
                "Remove links mise made for skills that are no longer active",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "ssh",
      description:
        "Open an SSH session, optionally borrowing read-only GitHub access",
      options: [
        {
          name: ["-i", "--identity-file"],
          description: "SSH identity file",
          args: {
            name: "identity_file",
          },
        },
        {
          name: ["-p", "--port"],
          description: "SSH port",
          args: {
            name: "port",
          },
        },
        {
          name: ["-o", "--ssh-option"],
          description: "OpenSSH option; repeat for multiple options",
          args: {
            name: "ssh_option",
          },
        },
        {
          name: "--github-relay-read-only",
          description: "Borrow read-only GitHub access for this session only",
        },
        {
          name: "--github-relay-repo",
          description:
            "GitHub repository the host may read; repeat for more repositories",
          args: {
            name: "owner/repo",
          },
        },
        {
          name: "--github-relay-all-repos",
          description:
            "Allow reads of every repository your local GitHub credentials can access",
        },
        {
          name: "--github-relay-log-requests",
          description: "Log sanitized relay requests on local stderr",
        },
        {
          name: "--github-relay-no-log-requests",
          description:
            "Turn off request logging even if the github_relay.log_requests setting is on",
        },
        {
          name: "--github-relay-log-format",
          description: "Relay log and summary format: text or jsonl",
          args: {
            name: "format",
          },
        },
        {
          name: "--github-relay-max-duration",
          description:
            "End borrowed access after a duration such as 1h; 0s lasts the whole session",
          args: {
            name: "duration",
          },
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
    {
      name: "vars",
      description: "List, set, and ask for config vars",
      subcommands: [
        {
          name: ["ls", "list"],
          description: "List every var, with the file it comes from",
          options: [
            {
              name: ["-J", "--json"],
              description: "Output in JSON format",
            },
            {
              name: "--json-extended",
              description: "Output in JSON format with sources",
            },
            {
              name: "--no-header",
              description: "Do not print the table header",
            },
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: "prompt",
          description:
            "Ask for the prompt vars that have no saved answer, or set answers directly",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
        {
          name: ["unset", "rm", "remove"],
          description: "Forget saved answers so they are asked for again",
          options: [
            {
              name: ["-C", "--cd"],
              description: "Run as if mise were started in DIR",
              args: {
                name: "dir",
              },
            },
            {
              name: ["-E", "--env"],
              description:
                "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
              args: {
                name: "env",
              },
            },
            {
              name: ["-j", "--jobs"],
              description:
                "How many jobs to run in parallel; defaults to the `jobs` setting",
              args: {
                name: "jobs",
              },
            },
            {
              name: ["-q", "--quiet"],
              description: "Suppress non-error messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show extra output (use -vv for even more)",
            },
            {
              name: ["-y", "--yes"],
              description: "Answer yes to all confirmation prompts",
            },
            {
              name: "--raw",
              description:
                "Connect tasks and install commands directly to the terminal",
            },
            {
              name: "--locked",
              description:
                "Require download URLs from the lockfile when installing",
            },
            {
              name: "--silent",
              description:
                "Suppress all task output and mise non-error messages",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-J", "--json"],
          description: "Output in JSON format",
        },
        {
          name: "--json-extended",
          description: "Output in JSON format with sources",
        },
        {
          name: "--no-header",
          description: "Do not print the table header",
        },
        {
          name: ["-C", "--cd"],
          description: "Run as if mise were started in DIR",
          args: {
            name: "dir",
          },
        },
        {
          name: ["-E", "--env"],
          description:
            "Load the `mise.<ENV>.toml` config files (same as MISE_ENV)",
          args: {
            name: "env",
          },
        },
        {
          name: ["-j", "--jobs"],
          description:
            "How many jobs to run in parallel; defaults to the `jobs` setting",
          args: {
            name: "jobs",
          },
        },
        {
          name: ["-q", "--quiet"],
          description: "Suppress non-error messages",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show extra output (use -vv for even more)",
        },
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all confirmation prompts",
        },
        {
          name: "--raw",
          description:
            "Connect tasks and install commands directly to the terminal",
        },
        {
          name: "--locked",
          description:
            "Require download URLs from the lockfile when installing",
        },
        {
          name: "--silent",
          description: "Suppress all task output and mise non-error messages",
        },
      ],
    },
  ],
  options: [
    ...globalOptions,
    {
      name: ["-V", "--version"],
      description: "Show mise version",
      isPersistent: false,
    },

    {
      name: "--no-config",
      description: "Do not load any config files",
      isPersistent: true,
    },
    {
      name: "--no-env",
      description: "Do not load environment variables from config files",
      isPersistent: true,
    },
    {
      name: "--no-hooks",
      description: "Do not run hooks from config files",
      isPersistent: true,
    },
  ],
};

export default completionSpec;
