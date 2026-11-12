import {
  addOptions10_0_0,
  dependenciesGenerator,
  filterOption,
  generateInstallSpec10_0_0,
  generateInstallSpec10_4_0,
  generatePnpmSpec,
  installOptions10_0_0,
  jsonOption,
  npmScriptsGenerator,
  npmSearchGenerator,
  registryOption,
  searchBranches,
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
  ownerCommand,
  accessCommand,
  teamCommand,
  profileCommand,
  tokenCommand,
  setScriptCommand,
  stopCommand,
  restartCommand,
  prefixCommand,
  getCommand,
  setCommand,
  helpCommand,
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
    {
      name: "--filter",
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
    {
      name: "add",
      description:
        "Installs a package and any packages that it depends on. By default, any new package is installed as a production dependency",
      args: {
        name: "package",
        generators: npmSearchGenerator,
        debounce: true,
        isVariadic: true,
      },
      options: addOptions10_0_0,
    },
    {
      name: ["install", "i"],
      description:
        "Pnpm install is used to install all dependencies for a project.\nIn a CI environment, installation fails if a lockfile is present but needs an update.\nInside a workspace, pnpm install installs all dependencies in all the projects.\nIf you want to disable this behavior, set the recursive-install setting to false",
      args: {
        name: "package",
        isOptional: true,
        generators: npmSearchGenerator,
        debounce: true,
        isVariadic: true,
      },
      generateSpec: generateInstallSpec10_0_0,
    },
    {
      name: ["install-test", "it"],
      description:
        "Runs pnpm install followed immediately by pnpm test. It takes exactly the same arguments as pnpm install",
      options: installOptions10_0_0,
    },
    {
      name: ["update", "upgrade", "up"],
      description:
        "Pnpm update updates packages to their latest version based on the specified range.\nWhen used without arguments, updates all dependencies. You can use patterns to update specific dependencies",
      args: {
        name: "Package",
        isOptional: true,
        filterStrategy: "fuzzy",
        generators: dependenciesGenerator,
        isVariadic: true,
      },
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "Concurrently runs update in all subdirectories with a package.json (excluding node_modules)",
        },
        {
          name: ["--latest", "-L"],
          description:
            "Ignores the version range specified in package.json. Instead, the version specified by the latest tag will be used (potentially upgrading the packages across major versions)",
        },
        {
          name: ["--global", "-g"],
          description: "Update global packages",
        },
        {
          name: ["-P", "--prod", "--production"],
          description:
            "Only update packages in dependencies and optionalDependencies",
        },
        {
          name: ["-D", "--dev"],
          description: "Only update packages in devDependencies",
        },
        {
          name: "--no-optional",
          description: "Don't update packages in optionalDependencies",
        },
        {
          name: ["--interactive", "-i"],
          description:
            "Show outdated dependencies and select which ones to update",
        },
        {
          name: "--workspace",
          description:
            "Tries to link all packages from the workspace. Versions are updated to match the versions of packages inside the workspace.\nIf specific packages are updated, the command will fail if any of the updated dependencies are not found inside the workspace. For instance, the following command fails if express is not a workspace package: pnpm up -r --workspace express",
        },
        filterOption,
      ],
    },
    {
      name: ["remove", "rm", "uninstall", "un", "uni"],
      description:
        "Removes packages from node_modules and from the project's package.json",
      args: {
        name: "Package",
        filterStrategy: "fuzzy",
        generators: dependenciesGenerator,
        isVariadic: true,
      },
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "When used inside a workspace, removes a dependency (or dependencies) from every workspace package.\nWhen used not inside a workspace, removes a dependency (or dependencies) from every package found in subdirectories",
        },
        {
          name: ["--global", "-g"],
          description: "Remove a global package",
        },
        {
          name: ["-P", "--save-prod"],
          description: "Only remove the dependency from dependencies",
        },
        {
          name: ["-D", "--save-dev"],
          description: "Only remove the dependency from devDependencies",
        },
        {
          name: ["--save-optional", "-O"],
          description: "Only remove the dependency from optionalDependencies",
        },
        filterOption,
      ],
    },
    {
      name: ["link", "ln"],
      description:
        "Makes the current local package accessible system-wide, or in another location",
      args: [
        {
          name: "Package",
          filterStrategy: "fuzzy",
          generators: dependenciesGenerator,
          isVariadic: true,
        },
        {
          template: "filepaths",
        },
      ],
      options: [
        {
          name: ["--dir", "-C"],
          description: "Changes the link location to <dir>",
          args: {
            name: "dir",
            template: "folders",
          },
        },
        {
          name: ["--global", "-g"],
          description:
            "Links the specified package (<pkg>) from global node_modules to the node_nodules of package from where this command was executed or specified via --dir option",
        },
      ],
    },
    {
      name: ["unlink", "dislink"],
      description:
        "Unlinks a system-wide package (inverse of pnpm link).\nIf called without arguments, all linked dependencies will be unlinked.\nThis is similar to yarn unlink, except pnpm re-installs the dependency after removing the external link",
      args: [
        {
          name: "Package",
          filterStrategy: "fuzzy",
          generators: dependenciesGenerator,
          isVariadic: true,
        },
        {
          template: "filepaths",
        },
      ],
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "Unlink in every package found in subdirectories or in every workspace package, when executed inside a workspace",
        },
        filterOption,
      ],
    },
    importCommand,
    {
      name: ["rebuild", "rb"],
      description: "Rebuild a package",
      args: [
        {
          name: "Package",
          filterStrategy: "fuzzy",
          generators: dependenciesGenerator,
          isVariadic: true,
        },
        {
          template: "filepaths",
        },
      ],
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "This command runs the pnpm rebuild command in every package of the monorepo",
        },
        filterOption,
      ],
    },
    pruneCommand,
    dedupeCommand,
    fetchCommand,
    patchCommand,
    patchCommitCommand,
    patchRemoveCommand,
    auditCommand,
    {
      name: ["list", "ls"],
      description:
        'This command will output all the versions of packages that are installed, as well as their dependencies, in a tree-structure.\nPositional arguments are name-pattern@version-range identifiers, which will limit the results to only the packages named. For example, pnpm list "babel-*" "eslint-*" semver@5',
      args: {
        name: "pattern",
        isOptional: true,
        isVariadic: true,
      },
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "Perform command on every package in subdirectories or on every workspace package, when executed inside a workspace",
        },
        {
          name: "--json",
          description: "Log output in JSON format",
        },
        {
          name: "--long",
          description: "Show extended information",
        },
        {
          name: "--parseable",
          description:
            "Outputs package directories in a parseable format instead of their tree view",
        },
        {
          name: ["--global", "-g"],
          description:
            "List packages in the global install directory instead of in the current project",
        },
        {
          name: "--depth",
          description:
            "Max display depth of the dependency tree.\npnpm ls --depth 0 will list direct dependencies only. pnpm ls --depth -1 will list projects only. Useful inside a workspace when used with the -r option",
          args: {
            name: "number",
          },
        },
        {
          name: ["--dev", "-D"],
          description: "Only list dev dependencies",
        },
        {
          name: ["--prod", "-P"],
          description: "Only list production dependencies",
        },
        {
          name: "--no-optional",
          description: "Don't list optionalDependencies",
        },
        filterOption,
      ],
    },
    outdatedCommand,
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
        filterOption,
      ],
    },
    {
      name: ["run", "run-script"],
      description: "Runs a script defined in the package's manifest file",
      args: {
        name: "Scripts",
        filterStrategy: "fuzzy",
        generators: npmScriptsGenerator,
        isVariadic: true,
      },
      options: [
        {
          name: ["-r", "--recursive"],
          description:
            "This runs an arbitrary command from each package's \"scripts\" object. If a package doesn't have the command, it is skipped. If none of the packages have the command, the command fails",
        },
        {
          name: "--if-present",
          description:
            "You can use the --if-present flag to avoid exiting with a non-zero exit code when the script is undefined. This lets you run potentially undefined scripts without breaking the execution chain",
        },
        {
          name: "--parallel",
          description:
            "Completely disregard concurrency and topological sorting, running a given script immediately in all matching packages with prefixed streaming output. This is the preferred flag for long-running processes over many packages, for instance, a lengthy build process",
        },
        {
          name: "--stream",
          description:
            "Stream output from child processes immediately, prefixed with the originating package directory. This allows output from different packages to be interleaved",
        },
        filterOption,
      ],
    },
    {
      name: "exec",
      description:
        "Execute a shell command in scope of a project.\nnode_modules/.bin is added to the PATH, so pnpm exec allows executing commands of dependencies",
      args: {
        name: "Scripts",
        filterStrategy: "fuzzy",
        generators: dependenciesGenerator,
        isVariadic: true,
      },
      options: [
        {
          name: ["-r", "--recursive"],
          description:
            "Execute the shell command in every project of the workspace.\nThe name of the current package is available through the environment variable PNPM_PACKAGE_NAME (supported from pnpm v2.22.0 onwards)",
        },
        {
          name: "--parallel",
          description:
            "Completely disregard concurrency and topological sorting, running a given script immediately in all matching packages with prefixed streaming output. This is the preferred flag for long-running processes over many packages, for instance, a lengthy build process",
        },
        filterOption,
      ],
    },
    testCommand,
    startCommand,
    {
      name: "publish",
      description:
        "Publishes a package to the registry.\nWhen publishing a package inside a workspace, the LICENSE file from the root of the workspace is packed with the package (unless the package has a license of its own).\nYou may override some fields before publish, using the publishConfig field in package.json. You also can use the publishConfig.directory to customize the published subdirectory (usually using third party build tools).\nWhen running this command recursively (pnpm -r publish), pnpm will publish all the packages that have versions not yet published to the registry",
      args: {
        name: "Branch",
        generators: searchBranches,
      },
      options: [
        {
          name: "--tag",
          description:
            "Publishes the package with the given tag. By default, pnpm publish updates the latest tag",
          args: {
            name: "<tag>",
          },
        },
        {
          name: "--dry-run",
          description:
            "Does everything a publish would do except actually publishing to the registry",
        },
        {
          name: "--ignore-scripts",
          description:
            "Ignores any publish related lifecycle scripts (prepublishOnly, postpublish, and the like)",
        },
        {
          name: "--no-git-checks",
          description:
            "Don't check if current branch is your publish branch, clean, and up-to-date",
        },
        {
          name: "--access",
          description:
            "Tells the registry whether the published package should be public or restricted",
          args: {
            name: "Type",
            suggestions: ["public", "private"],
          },
        },
        {
          name: "--force",
          description:
            "Try to publish packages even if their current version is already found in the registry",
        },
        {
          name: "--report-summary",
          description:
            "Save the list of published packages to pnpm-publish-summary.json. Useful when some other tooling is used to report the list of published packages",
        },
        filterOption,
      ],
    },
    completionCommand,
    setupCommand,
    selfUpdateCommand,
    {
      name: "pkg",
      description: "Manage package.json fields",
      options: [
        {
          name: ["-f", "--force"],
          description: "Remove protections against common side effects",
          isPersistent: true,
        },
        {
          name: "--json",
          description: "Output JSON data",
          isPersistent: true,
        },
        {
          name: ["-w", "--workspace"],
          description:
            "Run a command in the context of the configured workspace",
          args: {
            name: "workspace",
          },
          isRepeatable: true,
          isPersistent: true,
        },
        {
          name: "--workspaces",
          description:
            "Run a command in the context of all configured workspaces",
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
    binCommand,
    catFileCommand,
    catIndexCommand,
    findHashCommand,
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      description:
        "Runs a pnpm command recursively on all subdirectories in the package or every available workspace",
      options: [
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
        filterOption,
      ],
      subcommands: undefined,
    },
    {
      name: "server",
      description: "Manage a store server",
      subcommands: [
        {
          name: "start",
          description:
            "Starts a server that performs all interactions with the store. Other commands will delegate any store-related tasks to this server",
          options: [
            {
              name: "--background",
              description:
                "Runs the server in the background, similar to daemonizing on UNIX systems",
            },
            {
              name: "--network-concurrency",
              description:
                "The maximum number of network requests to process simultaneously",
              args: {
                name: "number",
              },
            },
            {
              name: "--protocol",
              description:
                "The communication protocol used by the server. When this is set to auto, IPC is used on all systems except for Windows, which uses TCP",
              args: {
                name: "Type",
                suggestions: ["auto", "tcp", "ipc"],
              },
            },
            {
              name: "--port",
              description:
                "The port number to use when TCP is used for communication. If a port is specified and the protocol is set to auto, regardless of system type, the protocol is automatically set to use TCP",
              args: {
                name: "port number",
              },
            },
            {
              name: "--store-dir",
              description:
                "The directory to use for the content addressable store",
              args: {
                name: "Path",
                template: "filepaths",
              },
            },
            {
              name: "--lock",
              description:
                "Set to make the package store immutable to external processes while the server is running or not",
            },
            {
              name: "--no-lock",
              description:
                "Set to make the package store mutable to external processes while the server is running or not",
            },
            {
              name: "--ignore-stop-requests",
              description:
                "Prevents you from stopping the server using pnpm server stop",
            },
            {
              name: "--ignore-upload-requests",
              description:
                "Prevents creating a new side effect cache during install",
            },
          ],
        },
        {
          name: "stop",
          description: "Stops the store server",
        },
        {
          name: "status",
          description: "Prints information about the running server",
        },
      ],
    },
    storeCommand,
    cacheCommand,
    initCommand,
    doctorCommand,
    dlxCommand,
    createCommand,
    deployCommand,
    {
      name: "licenses",
      description: "Check the licenses of the installed packages",
      subcommands: [
        {
          name: ["list", "ls"],
          description:
            "Show information about the licenses of the dependencies",
          options: [
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
            filterOption,
          ],
        },
      ],
    },
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
    ownerCommand,
    accessCommand,
    teamCommand,
    profileCommand,
    tokenCommand,
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
      name: ["ci", "clean-install", "ic", "install-clean"],
      description: "Clean dependencies and install with a frozen lockfile",
      options: installOptions10_0_0,
    },
    {
      name: ["ll", "la"],
      description: "List installed packages in long format",
      args: {
        name: "package",
        isOptional: true,
        isVariadic: true,
      },
      options: [
        {
          name: ["--recursive", "-r"],
          description:
            "Perform command on every package in subdirectories or on every workspace package, when executed inside a workspace",
        },
        {
          name: "--json",
          description: "Log output in JSON format",
        },
        {
          name: "--long",
          description: "Show extended information",
        },
        {
          name: "--parseable",
          description:
            "Outputs package directories in a parseable format instead of their tree view",
        },
        {
          name: ["--global", "-g"],
          description:
            "List packages in the global install directory instead of in the current project",
        },
        {
          name: "--depth",
          description:
            "Max display depth of the dependency tree.\npnpm ls --depth 0 will list direct dependencies only. pnpm ls --depth -1 will list projects only. Useful inside a workspace when used with the -r option",
          args: {
            name: "number",
          },
        },
        {
          name: ["--dev", "-D"],
          description: "Only list dev dependencies",
        },
        {
          name: ["--prod", "-P"],
          description: "Only list production dependencies",
        },
        {
          name: "--no-optional",
          description: "Don't list optionalDependencies",
        },
        filterOption,
      ],
    },
    setScriptCommand,
    stopCommand,
    restartCommand,
    prefixCommand,
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
      "outdated",
      "why",
      "run",
      "run-script",
      "exec",
      "test",
      "t",
      "tst",
      "publish",
      "pkg",
      "pack",
      "version",
    ].includes(name),
  ),
);

const versions: Fig.VersionDiffMap = {};

versions["10.0.0"] = {};

versions["10.1.0"] = {
  subcommands: [
    {
      name: "approve-builds",
      description:
        "Approve dependencies for running scripts during installation",
      args: undefined,
      options: [],
    },
    {
      name: "ignored-builds",
      description: "Print the list of packages with blocked build scripts",
    },
  ],
};

versions["10.4.0"] = {
  subcommands: [
    {
      name: "add",
      options: [
        {
          name: "--allow-build",
          description: "Allow dependency build scripts during installation",
          args: {
            name: "package",
          },
          isRepeatable: true,
        },
      ],
    },
    {
      name: "approve-builds",
      options: [
        {
          name: ["--global", "-g"],
          description: "Approve builds for globally installed packages",
        },
      ],
    },
    {
      name: ["recursive", "m", "multi", "-r", "--recursive"],
      subcommands: [
        {
          name: "add",
          options: [
            {
              name: "--allow-build",
              description: "Allow dependency build scripts during installation",
              args: {
                name: "package",
              },
              isRepeatable: true,
            },
          ],
        },
        {
          name: ["install", "i"],
          generateSpec: generateInstallSpec10_4_0,
        },
      ],
    },
    {
      name: ["install", "i"],
      generateSpec: generateInstallSpec10_4_0,
    },
  ],
};

versions["10.32.0"] = {
  subcommands: [
    {
      name: "approve-builds",
      options: [
        {
          name: "--all",
          description:
            "Approve all pending dependencies without interactive prompts",
        },
      ],
    },
  ],
};

export { versions };
export default completion;
