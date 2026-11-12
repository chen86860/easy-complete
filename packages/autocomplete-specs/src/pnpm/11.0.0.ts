import {
  dependenciesGenerator,
  filterOption11,
  generatePnpmSpec,
  jsonOption,
  npmScriptsGenerator,
  npmSearchGenerator,
  otpOption,
  registryOption,
  importCommand,
  pruneCommand,
  dedupeCommand,
  fetchCommand,
  patchCommand,
  patchCommitCommand,
  patchRemoveCommand,
  auditCommand,
  outdatedCommand,
  testCommand,
  startCommand,
  completionCommand,
  setupCommand,
  selfUpdateCommand,
  binCommand,
  catFileCommand,
  catIndexCommand,
  findHashCommand,
  storeCommand,
  cacheCommand,
  initCommand,
  doctorCommand,
  dlxCommand,
  createCommand,
  deployCommand,
  packCommand,
  rootCommand,
  envCommand,
  configCommand,
  viewCommand,
  searchCommand,
  loginCommand,
  logoutCommand,
  whoamiCommand,
  pingCommand,
  deprecateCommand,
  unpublishCommand,
  distTagCommand,
  bugsCommand,
  docsCommand,
  repoCommand,
  starCommand,
  unstarCommand,
  starsCommand,
  stopCommand,
  restartCommand,
  getCommand,
  setCommand,
  helpCommand,
  installTestCommand,
  linkCommand,
  cleanCommand,
  runtimeCommand,
  undeprecateCommand,
  peersCommand,
  packAppCommand,
  withCommand,
  ciCommand,
  addCommand,
  installCommand,
  updateCommand,
  removeCommand,
  unlinkCommand,
  rebuildCommand,
  listCommand,
  runCommand,
  execCommand,
  publishCommand,
  llCommand,
  ignoredBuildsCommand,
} from "./shared";

const completion: Fig.Subcommand = {
  name: "pnpm",
  description: "Fast, disk space efficient package manager",
  args: {
    name: "Scripts",
    filterStrategy: "fuzzy",
    generators: npmScriptsGenerator,
    isVariadic: true,
  },
  filterStrategy: "fuzzy",
  options: [
    {
      name: ["--filter", "-F"],
      args: {
        template: "filepaths",
        name: "Filepath / Package",
        description:
          "To only select packages under the specified directory, you may specify any absolute path, typically in POSIX format",
      },
      description:
        "Filtering allows you to restrict commands to specific subsets of packages.\npnpm supports a rich selector syntax for picking packages by name or by relation.\nMore details: https://pnpm.io/filtering",
      isRepeatable: true,
      isPersistent: true,
    },
    {
      name: ["-C", "--dir"],
      args: {
        name: "path",
        template: "folders",
      },
      isPersistent: true,
      description:
        "Run as if pnpm was started in <path> instead of the current working directory",
    },
    {
      name: ["-w", "--workspace-root"],
      isPersistent: true,
      description: "Run the command in the root workspace project",
    },
    {
      name: ["-h", "--help"],
      isPersistent: true,
      description: "Output usage information",
    },
    {
      name: ["-v", "--version"],
      description: "Show pnpm's version",
      isPersistent: true,
    },
    registryOption,
    {
      name: "--store-dir",
      description: "Directory containing the package store",
      args: {
        name: "dir",
        template: "folders",
      },
      isPersistent: true,
    },
    {
      name: "--ignore-workspace",
      description: "Treat the project as standalone",
      isPersistent: true,
    },
    {
      name: ["--yes", "-y"],
      description: "Automatically answer yes to prompts",
      isPersistent: true,
    },
  ],
  subcommands: [
    installTestCommand,
    linkCommand,
    cleanCommand,
    {
      name: "approve-builds",
      description:
        "Approve dependencies for running scripts during installation",
      args: [
        {
          name: "package",
          description:
            "Approve a package, or prefix its name with ! to deny it",
          isOptional: true,
          isVariadic: true,
        },
      ],
      options: [
        {
          name: "--all",
          description:
            "Approve all pending dependencies without interactive prompts",
        },
      ],
    },
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      description:
        "Runs a pnpm command recursively on all subdirectories in the package or every available workspace",
      options: [
        filterOption11,
        {
          name: "--link-workspace-packages",
          description:
            "Link locally available packages in workspaces of a monorepo into node_modules instead of re-downloading them from the registry. This emulates functionality similar to yarn workspaces.\nWhen this is set to deep, local packages can also be linked to subdependencies.\nBe advised that it is encouraged instead to use npmrc for this setting, to enforce the same behaviour in all environments. This option exists solely so you may override that if necessary",
          args: {
            name: "bool or `deep`",
            suggestions: ["true", "false", "deep"],
            isOptional: true,
          },
          requiresSeparator: true,
        },
        {
          name: "--include-workspace-root",
          description:
            "When executing commands recursively in a workspace, execute them on the root workspace project as well",
        },
        {
          name: "--shared-workspace-lockfile",
          description:
            "Create a single pnpm-lock.yaml file in the root of the workspace",
        },
        {
          name: "--workspace-concurrency",
          description:
            "Set the maximum number of tasks to run simultaneously. For unlimited concurrency use Infinity",
          args: {
            name: "<number>",
          },
        },
        {
          name: "--bail",
          description: "Stops when a task throws an error",
        },
        {
          name: "--no-bail",
          description: "Don't stop when a task throws an error",
        },
        {
          name: "--sort",
          description:
            "Packages are sorted topologically (dependencies before dependents)",
        },
        {
          name: "--no-sort",
          description: "Disable packages sorting",
        },
        {
          name: "--reverse",
          description: "The order of packages is reversed",
        },
        {
          name: "--filter-prod",
          description:
            "Restrict the scope to package names matching the given pattern, ignoring devDependencies when searching for dependencies and dependents",
          args: {
            name: "pattern",
          },
        },
        {
          name: "--test-pattern",
          description:
            "Define files related to tests for changed-since filters",
          args: {
            name: "pattern",
          },
        },
      ],
      subcommands: undefined,
    },
    runtimeCommand,
    undeprecateCommand,
    {
      name: "version",
      description:
        "Bump package versions or apply pending workspace changesets",
      args: {
        name: "version",
        isOptional: true,
        suggestions: [
          "major",
          "minor",
          "patch",
          "premajor",
          "preminor",
          "prepatch",
          "prerelease",
          "from-git",
        ],
      },
      options: [
        {
          name: "--no-git-checks",
          description: "Skip checking for a clean working tree",
        },
        {
          name: "--preid",
          args: {
            name: "prerelease id",
          },
        },
        {
          name: ["--message", "-m"],
          args: {
            name: "commit message",
          },
        },
        {
          name: "--tag-version-prefix",
          args: {
            name: "prefix",
          },
        },
        {
          name: "--allow-same-version",
          description: "Allow bumping to the current version",
        },
        {
          name: "--no-git-tag-version",
          description: "Skip the commit and tag",
        },
        {
          name: "--no-commit-hooks",
          description: "Skip git commit hooks",
        },
        {
          name: "--sign-git-tag",
          description: "Sign the tag with GPG",
        },
        jsonOption,
      ],
    },
    {
      name: "sbom",
      description: "Generate a Software Bill of Materials",
      options: [
        {
          name: "--sbom-format",
          isRequired: true,
          args: {
            name: "format",
            suggestions: ["cyclonedx", "spdx"],
          },
        },
        {
          name: "--sbom-type",
          args: {
            name: "type",
            suggestions: ["library", "application"],
          },
        },
        {
          name: "--sbom-spec-version",
          args: {
            name: "version",
            suggestions: ["1.5", "1.6", "1.7"],
          },
        },
        {
          name: "--sbom-authors",
          args: {
            name: "names",
          },
        },
        {
          name: "--sbom-supplier",
          args: {
            name: "name",
          },
        },
        {
          name: "--out",
          args: {
            name: "file",
            template: "filepaths",
          },
        },
        {
          name: "--lockfile-only",
          description: "Read only the lockfile",
        },
        {
          name: "--split",
          description: "Generate an SBOM per workspace package",
        },
        {
          name: ["--prod", "-P", "--production"],
          description: "Include production dependencies",
        },
        {
          name: ["--dev", "-D"],
          description: "Include development dependencies",
        },
        {
          name: "--no-optional",
          description: "Exclude optional dependencies",
        },
      ],
    },
    peersCommand,
    packAppCommand,
    withCommand,
    ciCommand,
    addCommand,
    installCommand,
    updateCommand,
    removeCommand,
    unlinkCommand,
    rebuildCommand,
    listCommand,
    {
      name: "why",
      description: "Shows all packages that depend on the specified package",
      args: {
        name: "Scripts",
        filterStrategy: "fuzzy",
        generators: dependenciesGenerator,
        isVariadic: true,
      },
      options: [
        filterOption11,
        {
          name: ["--recursive", "-r"],
          description:
            "Show the dependency tree for the specified package on every package in subdirectories or on every workspace package when executed inside a workspace",
        },
        {
          name: "--depth",
          description: "Max display depth of the dependency graph",
          args: {
            name: "number",
          },
        },
        {
          name: "--json",
          description: "Log output in JSON format",
        },
        {
          name: "--long",
          description: "Show verbose output",
        },
        {
          name: "--parseable",
          description: "Show parseable output instead of tree view",
        },
        {
          name: ["--global", "-g"],
          description:
            "List packages in the global install directory instead of in the current project",
        },
        {
          name: ["--dev", "-D"],
          description:
            "Only display the dependency tree for packages in devDependencies",
        },
        {
          name: "--no-optional",
          description: "Don't display packages from optionalDependencies",
        },
        {
          name: ["--prod", "-P"],
          description:
            "Only display the dependency tree for packages in dependencies",
        },
      ],
    },
    runCommand,
    execCommand,
    publishCommand,
    {
      name: "licenses",
      description: "Check the licenses of the installed packages",
      subcommands: [
        {
          name: ["list", "ls"],
          description:
            "Show information about the licenses of the dependencies",
          options: [
            filterOption11,
            {
              name: ["-D", "--dev"],
              description: 'Check only "devDependencies"',
            },
            {
              name: "--json",
              description: "Show information in JSON format",
            },
            {
              name: "--long",
              description: "Show more details (such as a link to the repo)",
            },
            {
              name: ["-P", "--prod"],
              description:
                'Check only "dependencies" and "optionalDependencies"',
            },
            {
              name: "--no-optional",
              description: 'Don\'t check "optionalDependencies"',
            },
          ],
        },
      ],
    },
    llCommand,
    ignoredBuildsCommand,
    importCommand,
    pruneCommand,
    dedupeCommand,
    fetchCommand,
    patchCommand,
    patchCommitCommand,
    patchRemoveCommand,
    auditCommand,
    outdatedCommand,
    testCommand,
    startCommand,
    completionCommand,
    setupCommand,
    selfUpdateCommand,
    binCommand,
    catFileCommand,
    catIndexCommand,
    findHashCommand,
    storeCommand,
    cacheCommand,
    initCommand,
    doctorCommand,
    dlxCommand,
    createCommand,
    deployCommand,
    packCommand,
    rootCommand,
    envCommand,
    configCommand,
    viewCommand,
    searchCommand,
    loginCommand,
    logoutCommand,
    whoamiCommand,
    pingCommand,
    deprecateCommand,
    unpublishCommand,
    distTagCommand,
    bugsCommand,
    docsCommand,
    repoCommand,
    starCommand,
    unstarCommand,
    starsCommand,
    stopCommand,
    restartCommand,
    getCommand,
    setCommand,
    helpCommand,
  ],
  generateSpec: generatePnpmSpec,
};

completion.subcommands!.find((command) =>
  (Array.isArray(command.name) ? command.name : [command.name]).includes(
    "recursive",
  ),
)!.subcommands = completion.subcommands!.filter((command) =>
  (Array.isArray(command.name) ? command.name : [command.name]).some((name) =>
    [
      "version",
      "sbom",
      "peers",
      "add",
      "install",
      "i",
      "update",
      "upgrade",
      "up",
      "remove",
      "rm",
      "uninstall",
      "un",
      "uni",
      "unlink",
      "dislink",
      "rebuild",
      "rb",
      "list",
      "ls",
      "why",
      "run",
      "run-script",
      "exec",
      "publish",
      "outdated",
      "test",
      "t",
      "tst",
      "pack",
    ].includes(name),
  ),
);

const versions: Fig.VersionDiffMap = {};

versions["11.0.0"] = {};

versions["11.1.0"] = {
  subcommands: [
    {
      name: ["owner", "owners"],
      description: "Manage package owners",
      options: [registryOption, otpOption],
      subcommands: [
        {
          name: ["ls", "list"],
          args: {
            name: "package",
            generators: npmSearchGenerator,
            debounce: true,
            isOptional: true,
          },
        },
        {
          name: "add",
          args: [
            {
              name: "username",
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
        {
          name: "rm",
          args: [
            {
              name: "username",
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
      ],
    },
  ],
};

versions["11.3.0"] = {
  subcommands: [
    {
      name: "pkg",
      description: "Manage package.json fields",
      options: [
        {
          name: "--json",
          description: "Output JSON data",
          isPersistent: true,
        },
      ],
      subcommands: [
        {
          name: "set",
          description: "Set package.json fields",
          args: {
            name: "key=value",
            isVariadic: true,
          },
        },
        {
          name: "get",
          description: "Get package.json fields",
          args: {
            name: "key",
            isOptional: true,
            isVariadic: true,
          },
        },
        {
          name: ["delete", "del"],
          description: "Delete package.json fields",
          args: {
            name: "key",
            isVariadic: true,
          },
        },
        {
          name: "fix",
          description: "Auto-correct common package.json errors",
        },
      ],
    },
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      subcommands: [
        {
          name: "pkg",
          description: "Manage package.json fields",
          options: [
            {
              name: "--json",
              description: "Output JSON data",
              isPersistent: true,
            },
          ],
          subcommands: [
            {
              name: "set",
              description: "Set package.json fields",
              args: {
                name: "key=value",
                isVariadic: true,
              },
            },
            {
              name: "get",
              description: "Get package.json fields",
              args: {
                name: "key",
                isOptional: true,
                isVariadic: true,
              },
            },
            {
              name: ["delete", "del"],
              description: "Delete package.json fields",
              args: {
                name: "key",
                isVariadic: true,
              },
            },
            {
              name: "fix",
              description: "Auto-correct common package.json errors",
            },
          ],
        },
      ],
    },
    {
      name: "stage",
      description: "Stage packages for publishing",
      options: [
        {
          name: "--access",
          description:
            "Tell the registry whether the staged package should be public or restricted",
          args: {
            name: "access",
            suggestions: ["public", "restricted"],
          },
          isPersistent: true,
        },
        {
          name: "--dry-run",
          description:
            "Does everything stage publish would do except uploading to the registry",
          isPersistent: true,
        },
        {
          name: "--json",
          description:
            "Show information in JSON format for list, view, publish, and download",
          isPersistent: true,
        },
        {
          name: "--otp",
          description: "One-time password for approve and reject",
          args: {
            name: "code",
          },
          isPersistent: true,
        },
        {
          name: ["-r", "--recursive"],
          description: "Stage all publishable packages from the workspace",
          isPersistent: true,
        },
        {
          name: "--registry",
          description: "The base URL of the npm registry",
          args: {
            name: "url",
          },
          isPersistent: true,
        },
        {
          name: "--tag",
          description:
            'Register the staged package with the given tag. By default, the "latest" tag is used',
          args: {
            name: "tag",
          },
          isPersistent: true,
        },
        { ...filterOption11, isPersistent: true },
      ],
      subcommands: [
        {
          name: "publish",
          description: "Stage a package for publishing",
          args: {
            name: "tarball or directory",
            isOptional: true,
            template: "filepaths",
          },
        },
        {
          name: "list",
          description: "List all staged package versions",
          args: {
            name: "package",
            isOptional: true,
          },
        },
        {
          name: "view",
          description: "View details of a specific staged package",
          args: {
            name: "stage-id",
          },
        },
        {
          name: "approve",
          description:
            "Approve a staged package, publishing it to the npm registry",
          args: {
            name: "stage-id",
          },
        },
        {
          name: "reject",
          description: "Reject a staged package, removing it from the registry",
          args: {
            name: "stage-id",
          },
        },
        {
          name: "download",
          description:
            "Download the tarball of a staged package for inspection",
          args: {
            name: "stage-id",
          },
        },
      ],
    },
    {
      name: ["set-script", "ss"],
      description: "Add or update a package script",
      args: [
        {
          name: "script",
        },
        {
          name: "command",
          isVariadic: true,
        },
      ],
    },
  ],
};

versions["11.9.0"] = {
  subcommands: [
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      subcommands: [
        {
          name: "sbom",
          options: [
            {
              name: "--exclude-peers",
              description: "Exclude peer dependencies",
            },
          ],
        },
      ],
    },
    {
      name: "sbom",
      options: [
        {
          name: "--exclude-peers",
          description: "Exclude peer dependencies",
        },
      ],
    },
  ],
};

versions["11.10.0"] = {
  subcommands: [
    {
      name: "prefix",
      description: "Print the current package prefix",
      options: [
        {
          name: ["--global", "-g"],
          description: "Print the global prefix",
        },
      ],
    },
  ],
};

versions["11.11.0"] = {
  subcommands: [
    {
      name: "access",
      description: "Manage registry package access and visibility",
      options: [registryOption, jsonOption, otpOption],
      subcommands: [
        {
          name: "list",
          subcommands: [
            {
              name: "packages",
              args: {
                name: "user or scope",
                isOptional: true,
              },
            },
            {
              name: "collaborators",
              args: {
                name: "package",
                generators: npmSearchGenerator,
                debounce: true,
              },
            },
          ],
        },
        {
          name: "get",
          args: [
            {
              name: "setting",
              suggestions: ["status", "mfa"],
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
        {
          name: "set",
          args: [
            {
              name: "setting=value",
              suggestions: [
                "status=public",
                "status=restricted",
                "mfa=none",
                "mfa=publish",
                "mfa=automation",
              ],
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
        {
          name: "grant",
          args: [
            {
              name: "permission",
              suggestions: ["read-only", "read-write"],
            },
            {
              name: "scope:team",
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
        {
          name: "revoke",
          args: [
            {
              name: "scope:team",
            },
            {
              name: "package",
              generators: npmSearchGenerator,
              debounce: true,
            },
          ],
        },
      ],
    },
  ],
};

versions["11.13.0"] = {
  subcommands: [
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      subcommands: [
        {
          name: "version",
          options: [
            {
              name: "--dry-run",
              description: "Preview version changes",
            },
          ],
        },
      ],
    },
    {
      name: "team",
      description: "Manage organization teams and memberships",
      options: [
        registryOption,
        jsonOption,
        otpOption,
        {
          name: "--parseable",
          description: "Print tab-separated results",
          isPersistent: true,
        },
      ],
      subcommands: [
        {
          name: "create",
          args: {
            name: "scope:team",
          },
        },
        {
          name: "destroy",
          args: {
            name: "scope:team",
          },
        },
        {
          name: "add",
          args: [
            {
              name: "scope:team",
            },
            {
              name: "username",
            },
          ],
        },
        {
          name: "rm",
          args: [
            {
              name: "scope:team",
            },
            {
              name: "username",
            },
          ],
        },
        {
          name: ["ls", "list"],
          args: {
            name: "scope or scope:team",
          },
        },
      ],
    },
    {
      name: "change",
      description: "Record a changeset for the next release",
      args: {
        name: "package",
        isOptional: true,
        isVariadic: true,
      },
      options: [
        {
          name: "--bump",
          description: "Version bump for the named packages",
          args: {
            name: "type",
            suggestions: ["none", "patch", "minor", "major"],
          },
          isPersistent: true,
        },
        {
          name: "--summary",
          args: {
            name: "summary",
          },
          isPersistent: true,
        },
      ],
      subcommands: [
        {
          name: "status",
          description: "Show pending changes and the release plan",
        },
      ],
    },
    {
      name: "lane",
      description: "Show or assign per-package release lanes",
      args: {
        name: "lane",
        isOptional: true,
        suggestions: ["main", "alpha", "beta", "rc"],
      },
      options: [filterOption11],
    },
    {
      name: "version",
      options: [
        {
          name: "--dry-run",
          description: "Preview version changes",
        },
      ],
    },
  ],
};

versions["11.24.0"] = {
  subcommands: [
    {
      name: "approve-builds",
      options: [
        {
          name: ["--global", "-g"],
          description: "Approve builds for globally installed packages",
        },
      ],
    },
  ],
};

versions["11.26.0"] = {
  subcommands: [
    {
      name: "change",
      subcommands: [
        {
          name: "check",
          description: "Validate pending changes and committed versions",
        },
      ],
    },
  ],
};

export { versions };
export default completion;
