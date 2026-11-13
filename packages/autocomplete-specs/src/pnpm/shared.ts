import { npmScriptsGenerator, npmSearchGenerator } from "../npm";
import { dependenciesGenerator, nodeClis } from "../yarn";

export { npmScriptsGenerator, npmSearchGenerator, dependenciesGenerator };

export const filterMessages = (out: string): string => {
  return out.startsWith("warning:") || out.startsWith("error:")
    ? out.split("\n").slice(1).join("\n")
    : out;
};

export const searchBranches: Fig.Generator = {
  script: ["git", "branch", "--no-color"],
  postProcess: function (out) {
    const output = filterMessages(out);

    if (output.startsWith("fatal:")) {
      return [];
    }

    return output.split("\n").map((elm) => {
      let name = elm.trim();
      const parts = elm.match(/\S+/g);
      if (parts && parts.length > 1) {
        if (parts[0] == "*") {
          // Current branch.
          return {
            name: elm.replace("*", "").trim(),
            description: "Current branch",
            icon: "⭐️",
          };
        } else if (parts[0] == "+") {
          // Branch checked out in another worktree.
          name = elm.replace("+", "").trim();
        }
      }

      return {
        name,
        description: "Branch",
        icon: "fig://icon?type=git",
      };
    });
  },
};

export const generatorInstalledPackages: Fig.Generator = {
  script: ["pnpm", "ls"],
  postProcess: function (out) {
    /**
     * out
     * @example
     * ```
     * Legend: production dependency, optional only, dev only
     *
     * /xxxx/xxxx/<package-name> (PRIVATE)
     *
     * dependencies:
     * lodash 4.17.21
     * foo link:packages/foo
     *
     * devDependencies:
     * typescript 4.7.4
     * ```
     */
    if (out.includes("ERR_PNPM")) {
      return [];
    }

    const output = out
      .split("\n")
      .slice(3)
      // remove empty lines, "*dependencies:" lines, local workspace packages (eg: "foo":"workspace:*")
      .filter(
        (item) =>
          !!item &&
          !item.toLowerCase().includes("dependencies") &&
          !item.includes("link:"),
      )
      .map((item) => item.replace(/\s/, "@")); // typescript 4.7.4 -> typescript@4.7.4

    return output.map((pkg) => {
      return {
        name: pkg,
        icon: "fig://icon?type=package",
      };
    });
  },
};

export const generatePnpmSpec: Fig.Subcommand["generateSpec"] = async (
  tokens,
  executeShellCommand,
) => {
  const { script, postProcess } = dependenciesGenerator as Fig.Generator & {
    script: string[];
  };

  if (postProcess === undefined) {
    return undefined;
  }

  const packages = postProcess(
    (
      await executeShellCommand({
        command: script[0],
        args: script.slice(1),
      })
    ).stdout,
    tokens,
  )
    ?.filter((e) => e !== null)
    .map(({ name }) => name as string);

  const subcommands = packages
    ?.filter((name) => nodeClis.has(name))
    .map((name) => ({
      name,
      loadSpec: name,
      icon: "fig://icon?type=package",
    }));

  return {
    name: "pnpm",
    subcommands,
  } as Fig.Spec;
};

export const registryOption: Fig.Option = {
  name: "--registry",
  description: "Registry URL to use",
  args: {
    name: "url",
  },
  isPersistent: true,
};

export const jsonOption: Fig.Option = {
  name: "--json",
  description: "Print results as JSON",
  isPersistent: true,
};

export const otpOption: Fig.Option = {
  name: "--otp",
  description: "One-time password for two-factor authentication",
  args: {
    name: "code",
  },
  isPersistent: true,
};

export const filterOption: Fig.Option = {
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
};

export const filterOption11: Fig.Option = {
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
};

export const commonOptions: Fig.Option[] = [
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
  { ...filterOption11, isPersistent: true },
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
  {
    name: "--env-file",
    description: "Load environment variables from a file",
    args: {
      name: "file",
      template: "filepaths",
    },
    isRepeatable: true,
    isPersistent: true,
  },
];

export function hasPackageArguments(
  tokens: string[],
  options: Fig.Option[],
): boolean {
  let pastCommand = false;
  for (let index = 1; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.startsWith("-")) {
      const option = options.find((option) =>
        (Array.isArray(option.name) ? option.name : [option.name]).includes(
          token,
        ),
      );
      if (option?.args) index += 1;
    } else if (!pastCommand && (token === "install" || token === "i")) {
      pastCommand = true;
    } else if (pastCommand && token.trim()) {
      return true;
    }
  }
  return false;
}

export const commonInstallOptions: Fig.Option[] = [
  {
    name: "--offline",
    description:
      "If true, pnpm will use only packages already available in the store. If a package won't be found locally, the installation will fail",
  },
  {
    name: "--prefer-offline",
    description:
      "If true, staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full offline mode, use --offline",
  },
  {
    name: "--ignore-scripts",
    description:
      "Do not execute any scripts defined in the project package.json and its dependencies",
  },
  {
    name: "--reporter",
    description:
      "Allows you to choose the reporter that will log debug info to the terminal about the installation progress",
    args: {
      name: "Reporter Type",
      suggestions: ["silent", "default", "append-only", "ndjson"],
    },
  },
];

export const installOptions10_0_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: ["-P", "--prod", "--production"],
    description:
      "Pnpm will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production.\nUse this flag to instruct pnpm to ignore NODE_ENV and take its production status from this flag instead",
  },
  {
    name: ["-D", "--dev"],
    description:
      "Only devDependencies are installed regardless of the NODE_ENV",
  },
  {
    name: "--no-optional",
    description: "OptionalDependencies are not installed",
  },
  {
    name: "--lockfile-only",
    description:
      "When used, only updates pnpm-lock.yaml and package.json instead of checking node_modules and downloading dependencies",
  },
  {
    name: "--frozen-lockfile",
    description:
      "If true, pnpm doesn't generate a lockfile and fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present",
  },
  {
    name: "--use-store-server",
    description:
      "Starts a store server in the background. The store server will keep running after installation is done. To stop the store server, run pnpm server stop",
  },
  {
    name: "--shamefully-hoist",
    description:
      "Creates a flat node_modules structure, similar to that of npm or yarn. WARNING: This is highly discouraged",
  },
];

export const addOptions10_0_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: ["-P", "--save-prod"],
    description: "Install the specified packages as regular dependencies",
  },
  {
    name: ["-D", "--save-dev"],
    description: "Install the specified packages as devDependencies",
  },
  {
    name: ["-O", "--save-optional"],
    description: "Install the specified packages as optionalDependencies",
  },
  {
    name: "--no-save",
    description: "Prevents saving to `dependencies`",
  },
  {
    name: ["-E", "--save-exact"],
    description:
      "Saved dependencies will be configured with an exact version rather than using pnpm's default semver range operator",
  },
  {
    name: "--save-peer",
    description:
      "Using --save-peer will add one or more packages to peerDependencies and install them as dev dependencies",
  },
  {
    name: ["--ignore-workspace-root-check", "-W"],
    description:
      "Adding a new dependency to the root workspace package fails, unless the --ignore-workspace-root-check or -W flag is used.\nFor instance, pnpm add debug -W",
  },
  {
    name: ["--global", "-g"],
    description: "Install a package globally",
  },
  {
    name: "--workspace",
    description: "Only adds the new dependency if it is found in the workspace",
  },
  filterOption,
];

export const generateInstallSpec10_0_0: Fig.Subcommand["generateSpec"] = async (
  tokens,
) => ({
  name: "install",
  options: hasPackageArguments(tokens, [
    ...installOptions10_0_0,
    ...addOptions10_0_0,
    ...commonOptions,
  ])
    ? addOptions10_0_0
    : installOptions10_0_0,
});

export const addOptions10_4_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: "--allow-build",
    description: "Allow dependency build scripts during installation",
    args: {
      name: "package",
    },
    isRepeatable: true,
  },
  {
    name: ["-P", "--save-prod"],
    description: "Install the specified packages as regular dependencies",
  },
  {
    name: ["-D", "--save-dev"],
    description: "Install the specified packages as devDependencies",
  },
  {
    name: ["-O", "--save-optional"],
    description: "Install the specified packages as optionalDependencies",
  },
  {
    name: "--no-save",
    description: "Prevents saving to `dependencies`",
  },
  {
    name: ["-E", "--save-exact"],
    description:
      "Saved dependencies will be configured with an exact version rather than using pnpm's default semver range operator",
  },
  {
    name: "--save-peer",
    description:
      "Using --save-peer will add one or more packages to peerDependencies and install them as dev dependencies",
  },
  {
    name: ["--ignore-workspace-root-check", "-W"],
    description:
      "Adding a new dependency to the root workspace package fails, unless the --ignore-workspace-root-check or -W flag is used.\nFor instance, pnpm add debug -W",
  },
  {
    name: ["--global", "-g"],
    description: "Install a package globally",
  },
  {
    name: "--workspace",
    description: "Only adds the new dependency if it is found in the workspace",
  },
  filterOption,
];

export const generateInstallSpec10_4_0: Fig.Subcommand["generateSpec"] = async (
  tokens,
) => ({
  name: "install",
  options: hasPackageArguments(tokens, [
    ...installOptions10_0_0,
    ...addOptions10_4_0,
    ...commonOptions,
  ])
    ? addOptions10_4_0
    : installOptions10_0_0,
});

export const installOptions11_0_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: ["-P", "--prod", "--production"],
    description:
      "Pnpm will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production.\nUse this flag to instruct pnpm to ignore NODE_ENV and take its production status from this flag instead",
  },
  {
    name: ["-D", "--dev"],
    description:
      "Only devDependencies are installed regardless of the NODE_ENV",
  },
  {
    name: "--no-optional",
    description: "OptionalDependencies are not installed",
  },
  {
    name: "--lockfile-only",
    description:
      "When used, only updates pnpm-lock.yaml and package.json instead of checking node_modules and downloading dependencies",
  },
  {
    name: "--frozen-lockfile",
    description:
      "If true, pnpm doesn't generate a lockfile and fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present",
  },
  {
    name: "--shamefully-hoist",
    description:
      "Creates a flat node_modules structure, similar to that of npm or yarn. WARNING: This is highly discouraged",
  },
];

export const addOptions11_0_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: "--allow-build",
    description: "Allow dependency build scripts during installation",
    args: {
      name: "package",
    },
    isRepeatable: true,
  },
  {
    name: ["-P", "--save-prod", "-p"],
    description: "Install the specified packages as regular dependencies",
  },
  {
    name: ["-D", "--save-dev", "-d"],
    description: "Install the specified packages as devDependencies",
  },
  {
    name: ["-O", "--save-optional", "-o"],
    description: "Install the specified packages as optionalDependencies",
  },
  {
    name: "--no-save",
    description: "Prevents saving to `dependencies`",
  },
  {
    name: ["-E", "--save-exact", "-e"],
    description:
      "Saved dependencies will be configured with an exact version rather than using pnpm's default semver range operator",
  },
  {
    name: "--save-peer",
    description:
      "Using --save-peer will add one or more packages to peerDependencies and install them as dev dependencies",
  },
  {
    name: ["--ignore-workspace-root-check", "-W"],
    description:
      "Adding a new dependency to the root workspace package fails, unless the --ignore-workspace-root-check or -W flag is used.\nFor instance, pnpm add debug -W",
  },
  {
    name: ["--global", "-g"],
    description: "Install a package globally",
  },
  {
    name: "--workspace",
    description: "Only adds the new dependency if it is found in the workspace",
  },
  filterOption11,
];

export const generateInstallSpec11_0_0: Fig.Subcommand["generateSpec"] = async (
  tokens,
) => ({
  name: "install",
  options: hasPackageArguments(tokens, [
    ...installOptions11_0_0,
    ...addOptions11_0_0,
    ...commonOptions,
  ])
    ? addOptions11_0_0
    : installOptions11_0_0,
});

export const installOptions12_7_0: Fig.Option[] = [
  ...commonInstallOptions,
  {
    name: "--allow-build",
    description:
      "Allow or deny dependency builds; prefix a package with ! to deny",
    args: {
      name: "package",
    },
    isRepeatable: true,
  },
  {
    name: ["-P", "--prod", "--production"],
    description:
      "Pnpm will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production.\nUse this flag to instruct pnpm to ignore NODE_ENV and take its production status from this flag instead",
  },
  {
    name: ["-D", "--dev"],
    description:
      "Only devDependencies are installed regardless of the NODE_ENV",
  },
  {
    name: "--no-optional",
    description: "OptionalDependencies are not installed",
  },
  {
    name: "--lockfile-only",
    description:
      "When used, only updates pnpm-lock.yaml and package.json instead of checking node_modules and downloading dependencies",
  },
  {
    name: "--frozen-lockfile",
    description:
      "If true, pnpm doesn't generate a lockfile and fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present",
  },
  {
    name: "--shamefully-hoist",
    description:
      "Creates a flat node_modules structure, similar to that of npm or yarn. WARNING: This is highly discouraged",
  },
];

export const generateInstallSpec12_7_0: Fig.Subcommand["generateSpec"] = async (
  tokens,
) => ({
  name: "install",
  options: hasPackageArguments(tokens, [
    ...installOptions12_7_0,
    ...addOptions11_0_0,
    ...commonOptions,
  ])
    ? addOptions11_0_0
    : installOptions12_7_0,
});

export const importCommand: Fig.Subcommand = {
  name: "import",
  description:
    "Pnpm import generates a pnpm-lock.yaml from an npm package-lock.json (or npm-shrinkwrap.json) file",
};

export const pruneCommand: Fig.Subcommand = {
  name: "prune",
  description: "Removes unnecessary packages",
  options: [
    {
      name: "--prod",
      description: "Remove the packages specified in devDependencies",
    },
    {
      name: "--no-optional",
      description: "Remove the packages specified in optionalDependencies",
    },
  ],
};

export const dedupeCommand: Fig.Subcommand = {
  name: "dedupe",
  description:
    "Perform an install removing older dependencies in the lockfile if a newer version can be used",
  options: [
    {
      name: "--check",
      description:
        "Check if running dedupe would result in changes without installing packages or editing the lockfile",
    },
    {
      name: "--ignore-scripts",
      description: "Don't run lifecycle scripts",
    },
    {
      name: "--offline",
      description:
        "Trigger an error if any required dependencies are not available in local store",
    },
    {
      name: "--prefer-offline",
      description:
        "Skip staleness checks for cached data, but request missing data from the server",
    },
  ],
};

export const fetchCommand: Fig.Subcommand = {
  name: "fetch",
  description:
    "EXPERIMENTAL FEATURE: Fetch packages from a lockfile into virtual store, package manifest is ignored: https://pnpm.io/cli/fetch",
  options: [
    {
      name: ["--prod", "-P"],
      description: "Development packages will not be fetched",
    },
    {
      name: ["--dev", "-D"],
      description: "Only development packages will be fetched",
    },
  ],
};

export const patchCommand: Fig.Subcommand = {
  name: "patch",
  description:
    "This command will cause a package to be extracted in a temporary directory intended to be editable at will",
  args: {
    name: "package",
    generators: generatorInstalledPackages,
  },
  options: [
    {
      name: "--edit-dir",
      description:
        "The package that needs to be patched will be extracted to this directory",
      args: {
        name: "dir",
        template: "folders",
      },
    },
    {
      name: "--ignore-existing",
      description: "Ignore existing patch files when patching",
    },
  ],
};

export const patchCommitCommand: Fig.Subcommand = {
  name: "patch-commit",
  args: {
    name: "dir",
    template: "folders",
  },
  description: "Generate a patch out of a directory",
  options: [
    {
      name: "--patches-dir",
      description: "The generated patch file will be saved to this directory",
      args: {
        name: "dir",
        template: "folders",
      },
    },
  ],
};

export const patchRemoveCommand: Fig.Subcommand = {
  name: "patch-remove",
  description: "Remove existing patch files",
  args: {
    name: "package",
    isVariadic: true,
  },
};

export const auditCommand: Fig.Subcommand = {
  name: "audit",
  description:
    "Checks for known security issues with the installed packages.\nIf security issues are found, try to update your dependencies via pnpm update.\nIf a simple update does not fix all the issues, use overrides to force versions that are not vulnerable.\nFor instance, if lodash@<2.1.0 is vulnerable, use overrides to force lodash@^2.1.0.\nDetails at: https://pnpm.io/cli/audit",
  options: [
    {
      name: "--audit-level",
      description:
        "Only print advisories with severity greater than or equal to <severity>",
      args: {
        name: "Audit Level",
        default: "low",
        suggestions: ["low", "moderate", "high", "critical"],
      },
    },
    {
      name: "--fix",
      description:
        "Add overrides to the package.json file in order to force non-vulnerable versions of the dependencies",
    },
    {
      name: "--json",
      description: "Output audit report in JSON format",
    },
    {
      name: ["--dev", "-D"],
      description: "Only audit dev dependencies",
    },
    {
      name: ["--prod", "-P"],
      description: "Only audit production dependencies",
    },
    {
      name: "--no-optional",
      description: "Don't audit optionalDependencies",
    },
    {
      name: "--ignore-registry-errors",
      description:
        "If the registry responds with a non-200 status code, the process should exit with 0. So the process will fail only if the registry actually successfully responds with found vulnerabilities",
    },
  ],
};

export const outdatedCommand: Fig.Subcommand = {
  name: "outdated",
  description:
    "Checks for outdated packages. The check can be limited to a subset of the installed packages by providing arguments (patterns are supported)",
  options: [
    {
      name: ["--recursive", "-r"],
      description:
        "Check for outdated dependencies in every package found in subdirectories, or in every workspace package when executed inside a workspace",
    },
    {
      name: "--long",
      description: "Print details",
    },
    {
      name: ["--global", "-g"],
      description: "List outdated global packages",
    },
    {
      name: "--no-table",
      description:
        "Prints the outdated dependencies in a list format instead of the default table. Good for small consoles",
    },
    {
      name: "--compatible",
      description:
        "Prints only versions that satisfy specifications in package.json",
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
      description: "Doesn't check optionalDependencies",
    },
  ],
};

export const testCommand: Fig.Subcommand = {
  name: ["test", "t", "tst"],
  description:
    "Runs an arbitrary command specified in the package's test property of its scripts object.\nThe intended usage of the property is to specify a command that runs unit or integration testing for your program",
};

export const startCommand: Fig.Subcommand = {
  name: "start",
  description:
    "Runs an arbitrary command specified in the package's start property of its scripts object. If no start property is specified on the scripts object, it will attempt to run node server.js as a default, failing if neither are present.\nThe intended usage of the property is to specify a command that starts your program",
};

export const completionCommand: Fig.Subcommand = {
  name: "completion",
  description: "Print shell completion code to stdout",
  args: {
    name: "shell",
    suggestions: ["bash", "fish", "pwsh", "zsh"],
  },
};

export const setupCommand: Fig.Subcommand = {
  name: "setup",
  description: "Sets up pnpm",
  options: [
    {
      name: ["-f", "--force"],
      description:
        "Override the PNPM_HOME env variable in case it already exists",
    },
  ],
};

export const selfUpdateCommand: Fig.Subcommand = {
  name: "self-update",
  description:
    "Updates pnpm to the latest version, or to the specified version",
  args: {
    name: "version",
    isOptional: true,
    suggestions: ["latest", "latest-12", "next", "11", "12"],
  },
};

export const binCommand: Fig.Subcommand = {
  name: "bin",
  description: "Print the directory where pnpm will install executables",
  options: [
    {
      name: ["-g", "--global"],
      description: "Print the global executables directory",
    },
  ],
};

export const catFileCommand: Fig.Subcommand = {
  name: "cat-file",
  description:
    "Prints the contents of a file based on the hash value stored in the index file",
  args: {
    name: "hash",
  },
};

export const catIndexCommand: Fig.Subcommand = {
  name: "cat-index",
  description: "Prints the index file of a specific package from the store",
  args: {
    name: "package",
    description: "Package name and version, e.g. react@18.2.0",
    generators: dependenciesGenerator,
  },
};

export const findHashCommand: Fig.Subcommand = {
  name: "find-hash",
  description:
    "Experimental: lists the packages that include the file with the specified hash",
  args: {
    name: "hash",
  },
};

export const storeCommand: Fig.Subcommand = {
  name: "store",
  description: "Managing the package store",
  subcommands: [
    {
      name: "status",
      description:
        "Checks for modified packages in the store.\nReturns exit code 0 if the content of the package is the same as it was at the time of unpacking",
    },
    {
      name: "add",
      description:
        "Functionally equivalent to pnpm add,\nexcept this adds new packages to the store directly without modifying any projects or files outside of the store",
      args: {
        name: "package",
        generators: npmSearchGenerator,
        isVariadic: true,
      },
    },
    {
      name: "prune",
      description:
        "Removes orphan packages from the store.\nPruning the store will save disk space, however may slow down future installations involving pruned packages.\nUltimately, it is a safe operation, however not recommended if you have orphaned packages from a package you intend to reinstall.\nPlease read the FAQ for more information on unreferenced packages and best practices.\nPlease note that this is prohibited when a store server is running",
      options: [
        {
          name: "--force",
          description: "Remove alien directories in the store",
        },
      ],
    },
    {
      name: "path",
      description: "Returns the path to the active store directory",
    },
  ],
};

export const cacheCommand: Fig.Subcommand = {
  name: "cache",
  description: "Inspect and manage the metadata cache",
  subcommands: [
    {
      name: "delete",
      description:
        "Deletes metadata cache for the specified package(s). Supports patterns",
      args: {
        name: "package",
        isVariadic: true,
      },
    },
    {
      name: "list",
      description:
        "Lists the available packages metadata cache. Supports filtering by glob",
      args: {
        name: "pattern",
        isOptional: true,
      },
    },
    {
      name: "list-registries",
      description:
        "Lists all registries that have their metadata cache locally",
    },
    {
      name: "view",
      description: "Views information from the specified package's cache",
      args: {
        name: "package",
      },
    },
  ],
};

export const initCommand: Fig.Subcommand = {
  name: "init",
  description:
    "Creates a basic package.json file in the current directory, if it doesn't exist already",
};

export const doctorCommand: Fig.Subcommand = {
  name: "doctor",
  description: "Checks for known common issues with pnpm configuration",
};

export const dlxCommand: Fig.Subcommand = {
  name: "dlx",
  description: "Run a package in a temporary environment",
  args: {
    name: "command",
    isCommand: true,
  },
  options: [
    {
      name: "--package",
      description: "The package to install before running the command",
      isRepeatable: true,
      args: {
        name: "package",
      },
    },
    {
      name: ["-c", "--shell-mode"],
      description: "Runs the script inside of a shell",
    },
    {
      name: "--allow-build",
      description:
        "A list of package names that are allowed to run postinstall scripts during installation",
      args: {
        name: "package",
      },
    },
  ],
};

export const createCommand: Fig.Subcommand = {
  name: "create",
  description: "Create a project from a `create-*` starter kit",
  args: {
    name: "name",
  },
};

export const deployCommand: Fig.Subcommand = {
  name: "deploy",
  description: "Experimental! Deploy a package from a workspace",
  args: {
    name: "target directory",
    template: "folders",
  },
  options: [
    {
      name: ["-D", "--dev"],
      description:
        "Only `devDependencies` are installed regardless of the `NODE_ENV`",
    },
    {
      name: "--no-optional",
      description: "`optionalDependencies` are not installed",
    },
    {
      name: ["-P", "--prod"],
      description: "Packages in `devDependencies` won't be installed",
    },
  ],
};

export const packCommand: Fig.Subcommand = {
  name: "pack",
  description: "Create a tarball from a package",
  options: [
    {
      name: "--pack-destination",
      description: "Directory in which `pnpm pack` will save tarballs",
      args: {
        name: "dir",
        template: "folders",
      },
    },
  ],
};

export const rootCommand: Fig.Subcommand = {
  name: "root",
  description: "Print the effective `node_modules` directory",
  options: [
    {
      name: ["-g", "--global"],
      description: "Print the global `node_modules` directory",
    },
  ],
};

export const envCommand: Fig.Subcommand = {
  name: "env",
  description: "Manage Node.js versions (deprecated, use runtime)",
  subcommands: [
    {
      name: "use",
      description: "Install and use the specified version of Node.js",
      args: {
        name: "version",
      },
      options: [
        {
          name: ["--global", "-g"],
          description: "Manages Node.js versions globally",
        },
      ],
    },
    {
      name: ["list", "ls"],
      description: "List Node.js versions available locally or remotely",
      args: {
        name: "version",
        isOptional: true,
      },
      options: [
        {
          name: "--remote",
          description: "List the remote versions of Node.js",
        },
      ],
    },
    {
      name: ["remove", "rm", "uninstall"],
      description: "Removes the specified version(s) of Node.js",
      args: {
        name: "version",
      },
      options: [
        {
          name: ["--global", "-g"],
          description: "Manages Node.js versions globally",
        },
      ],
    },
  ],
};

export const configCommand: Fig.Subcommand = {
  name: ["config", "c"],
  description: "Manage the pnpm configuration files",
  options: [
    {
      name: ["--global", "-g"],
      description: "Apply to the global config",
      isPersistent: true,
    },
    {
      name: "--location",
      description: "Specify the config location",
      args: {
        name: "location",
        suggestions: ["global", "project"],
      },
      isPersistent: true,
    },
  ],
  subcommands: [
    {
      name: "set",
      description: "Set the config key to the value provided",
      args: [
        {
          name: "key",
        },
        {
          name: "value",
        },
      ],
    },
    {
      name: "get",
      description: "Print the config value for the provided key",
      args: {
        name: "key",
      },
    },
    {
      name: "delete",
      description: "Remove the config key from the config file",
      args: {
        name: "key",
      },
    },
    {
      name: ["list", "ls"],
      description: "Show all the config settings",
      options: [
        {
          name: "--json",
          description: "Show config in JSON format",
        },
      ],
    },
  ],
};

export const viewCommand: Fig.Subcommand = {
  name: ["view", "info", "show", "v"],
  description: "View registry information about a package",
  args: [
    {
      name: "package",
      generators: npmSearchGenerator,
      debounce: true,
      isOptional: true,
    },
    {
      name: "field",
      isOptional: true,
      isVariadic: true,
    },
  ],
  options: [registryOption, jsonOption],
};

export const searchCommand: Fig.Subcommand = {
  name: ["search", "s", "se", "find"],
  description: "Search for packages in the registry",
  args: {
    name: "query",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    registryOption,
    jsonOption,
    {
      name: "--search-limit",
      description: "Maximum number of results",
      args: {
        name: "number",
      },
    },
  ],
};

export const loginCommand: Fig.Subcommand = {
  name: ["login", "adduser"],
  description: "Log in to a registry",
  options: [
    registryOption,
    {
      name: "--scope",
      args: {
        name: "scope",
      },
    },
  ],
};

export const logoutCommand: Fig.Subcommand = {
  name: "logout",
  description: "Log out of a registry",
  options: [registryOption],
};

export const whoamiCommand: Fig.Subcommand = {
  name: "whoami",
  description: "Print your registry username",
  options: [registryOption],
};

export const pingCommand: Fig.Subcommand = {
  name: "ping",
  description: "Test registry connectivity",
  options: [registryOption],
};

export const deprecateCommand: Fig.Subcommand = {
  name: "deprecate",
  description: "Deprecate a package version",
  args: [
    {
      name: "package",
      generators: npmSearchGenerator,
      debounce: true,
    },
    {
      name: "message",
    },
  ],
  options: [registryOption, otpOption],
};

export const unpublishCommand: Fig.Subcommand = {
  name: "unpublish",
  description: "Remove a package or version from the registry",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
  },
  options: [
    registryOption,
    otpOption,
    {
      name: "--force",
      description: "Allow removing the entire package",
    },
  ],
};

export const distTagCommand: Fig.Subcommand = {
  name: ["dist-tag", "dist-tags"],
  description: "Manage package distribution tags",
  options: [registryOption, otpOption],
  subcommands: [
    {
      name: "add",
      description: "Tag a package version",
      args: [
        {
          name: "package",
          generators: npmSearchGenerator,
          debounce: true,
        },
        {
          name: "tag",
        },
      ],
    },
    {
      name: ["rm", "remove"],
      description: "Remove a distribution tag",
      args: [
        {
          name: "package",
          generators: npmSearchGenerator,
          debounce: true,
        },
        {
          name: "tag",
        },
      ],
    },
    {
      name: ["ls", "list"],
      description: "List distribution tags",
      args: {
        name: "package",
        generators: npmSearchGenerator,
        debounce: true,
        isOptional: true,
      },
    },
  ],
};

export const bugsCommand: Fig.Subcommand = {
  name: ["bugs", "issues"],
  description: "Open the package's issue tracker",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
    isOptional: true,
    isVariadic: true,
  },
  options: [registryOption],
};

export const docsCommand: Fig.Subcommand = {
  name: ["docs", "home"],
  description: "Open the package's documentation",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
    isOptional: false,
    isVariadic: true,
  },
  options: [registryOption],
};

export const repoCommand: Fig.Subcommand = {
  name: "repo",
  description: "Open the package's repository",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
    isOptional: true,
    isVariadic: true,
  },
  options: [registryOption],
};

export const starCommand: Fig.Subcommand = {
  name: "star",
  description: "Mark a package as a favorite",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
  },
  options: [registryOption],
};

export const unstarCommand: Fig.Subcommand = {
  name: "unstar",
  description: "Remove a package from your favorites",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
  },
  options: [registryOption],
};

export const starsCommand: Fig.Subcommand = {
  name: "stars",
  description: "List a user's favorite packages",
  args: {
    name: "username",
    isOptional: true,
  },
  options: [registryOption],
};

export const ownerCommand: Fig.Subcommand = {
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
};

export const accessCommand: Fig.Subcommand = {
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
};

export const teamCommand: Fig.Subcommand = {
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
};

export const profileCommand: Fig.Subcommand = {
  name: "profile",
  description: "Manage your registry profile",
  options: [registryOption, jsonOption, otpOption],
  subcommands: [
    {
      name: "get",
      args: {
        name: "key",
        isOptional: true,
        isVariadic: true,
      },
    },
    {
      name: "set",
      args: [
        {
          name: "key",
        },
        {
          name: "value",
          isOptional: true,
        },
      ],
    },
    {
      name: "enable-2fa",
      args: {
        name: "mode",
        isOptional: true,
        suggestions: ["auth-only", "auth-and-writes"],
      },
    },
    {
      name: "disable-2fa",
    },
  ],
};

export const tokenCommand: Fig.Subcommand = {
  name: "token",
  description: "Manage registry authentication tokens",
  options: [registryOption, jsonOption, otpOption],
  subcommands: [
    {
      name: ["list", "ls"],
    },
    {
      name: "revoke",
      args: {
        name: "token or id",
        isVariadic: true,
      },
    },
    {
      name: "create",
      options: [
        {
          name: "--read-only",
          description: "Create a read-only token",
        },
        {
          name: "--cidr",
          args: {
            name: "CIDR ranges",
          },
        },
      ],
    },
  ],
};

export const setScriptCommand: Fig.Subcommand = {
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
};

export const stopCommand: Fig.Subcommand = {
  name: "stop",
  description: "Run the package's stop script",
  args: {
    name: "argument",
    isOptional: true,
    isVariadic: true,
  },
};

export const restartCommand: Fig.Subcommand = {
  name: "restart",
  description: "Run the package's restart script",
  args: {
    name: "argument",
    isOptional: true,
    isVariadic: true,
  },
};

export const prefixCommand: Fig.Subcommand = {
  name: "prefix",
  description: "Print the current package prefix",
  options: [
    {
      name: ["--global", "-g"],
      description: "Print the global prefix",
    },
  ],
};

export const getCommand: Fig.Subcommand = {
  name: "get",
  description: "Read a pnpm configuration setting",
  args: {
    name: "key",
    isOptional: true,
  },
  options: [
    {
      name: ["--global", "-g"],
      description: "Use the global config",
    },
    {
      name: "--location",
      args: {
        name: "location",
        suggestions: ["global", "project"],
      },
    },
    jsonOption,
  ],
};

export const setCommand: Fig.Subcommand = {
  name: "set",
  description: "Write a pnpm configuration setting",
  args: [
    {
      name: "key",
    },
    {
      name: "value",
    },
  ],
  options: [
    {
      name: ["--global", "-g"],
      description: "Use the global config",
    },
    {
      name: "--location",
      args: {
        name: "location",
        suggestions: ["global", "project"],
      },
    },
    jsonOption,
  ],
};

export const helpCommand: Fig.Subcommand = {
  name: "help",
  description: "Show command help",
  args: {
    name: "command",
    template: "help",
    isOptional: true,
    isVariadic: true,
  },
  options: [],
};

export const installTestCommand: Fig.Subcommand = {
  name: ["install-test", "it"],
  description:
    "Runs pnpm install followed immediately by pnpm test. It takes exactly the same arguments as pnpm install",
  options: [
    {
      name: "--offline",
      description:
        "If true, pnpm will use only packages already available in the store. If a package won't be found locally, the installation will fail",
    },
    {
      name: "--prefer-offline",
      description:
        "If true, staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full offline mode, use --offline",
    },
    {
      name: "--ignore-scripts",
      description:
        "Do not execute any scripts defined in the project package.json and its dependencies",
    },
    {
      name: "--reporter",
      description:
        "Allows you to choose the reporter that will log debug info to the terminal about the installation progress",
      args: {
        name: "Reporter Type",
        suggestions: ["silent", "default", "append-only", "ndjson"],
      },
    },
    {
      name: ["-P", "--prod", "--production"],
      description:
        "Pnpm will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production.\nUse this flag to instruct pnpm to ignore NODE_ENV and take its production status from this flag instead",
    },
    {
      name: ["-D", "--dev"],
      description:
        "Only devDependencies are installed regardless of the NODE_ENV",
    },
    {
      name: "--no-optional",
      description: "OptionalDependencies are not installed",
    },
    {
      name: "--lockfile-only",
      description:
        "When used, only updates pnpm-lock.yaml and package.json instead of checking node_modules and downloading dependencies",
    },
    {
      name: "--frozen-lockfile",
      description:
        "If true, pnpm doesn't generate a lockfile and fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present",
    },
    {
      name: "--shamefully-hoist",
      description:
        "Creates a flat node_modules structure, similar to that of npm or yarn. WARNING: This is highly discouraged",
    },
  ],
};

export const linkCommand: Fig.Subcommand = {
  name: ["link", "ln"],
  description: "Link local package directories into the current project",
  args: [
    {
      name: "dir",
      filterStrategy: undefined,
      generators: undefined,
      isVariadic: true,
      template: "folders",
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
  ],
};

export const cleanCommand: Fig.Subcommand = {
  name: ["clean", "purge"],
  description:
    "Safely remove node_modules directories from all workspace projects",
  options: [
    {
      name: ["-l", "--lockfile"],
      description: "Also remove pnpm-lock.yaml files",
    },
  ],
};

export const runtimeCommand: Fig.Subcommand = {
  name: ["runtime", "rt"],
  description: "Manage runtimes",
  options: [
    {
      name: ["-g", "--global"],
      description: "Install the runtime globally",
      isPersistent: true,
    },
    {
      name: ["-D", "--save-dev"],
      description: "Save the runtime to devEngines.runtime",
      isPersistent: true,
    },
    {
      name: ["-P", "--save-prod"],
      description: "Save the runtime to engines.runtime",
      isPersistent: true,
    },
  ],
  subcommands: [
    {
      name: "set",
      description:
        "Install the specified version of a runtime, such as node, deno, or bun",
      args: [
        {
          name: "runtime",
          suggestions: ["node", "deno", "bun"],
        },
        {
          name: "version",
          suggestions: ["latest", "lts", "rc/22", "22", "24", "2"],
        },
      ],
    },
  ],
};

export const undeprecateCommand: Fig.Subcommand = {
  name: "undeprecate",
  description: "Remove a package version's deprecation",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
  },
  options: [registryOption, otpOption],
};

export const peersCommand: Fig.Subcommand = {
  name: "peers",
  description: "Check for peer dependency issues",
  options: [
    jsonOption,
    {
      name: "--lockfile-only",
      description: "Read pnpm-lock.yaml",
      isPersistent: true,
    },
  ],
  subcommands: [
    {
      name: "check",
      description: "Check for peer dependency issues",
    },
  ],
};

export const packAppCommand: Fig.Subcommand = {
  name: "pack-app",
  description: "Pack a CommonJS entry file into a standalone executable",
  args: {
    name: "entry",
    isOptional: true,
    template: "filepaths",
  },
  options: [
    {
      name: "--entry",
      args: {
        name: "file",
        template: "filepaths",
      },
    },
    {
      name: ["--target", "-t"],
      isRepeatable: true,
      args: {
        name: "target",
        suggestions: [
          "linux-x64",
          "linux-x64-musl",
          "linux-arm64",
          "linux-arm64-musl",
          "darwin-x64",
          "darwin-arm64",
          "win32-x64",
          "win32-arm64",
        ],
      },
    },
    {
      name: "--runtime",
      args: {
        name: "node@version",
      },
    },
    {
      name: ["--output-dir", "-o"],
      args: {
        name: "dir",
        template: "folders",
      },
    },
    {
      name: "--output-name",
      args: {
        name: "name",
      },
    },
  ],
};

export const withCommand: Fig.Subcommand = {
  name: "with",
  description: "Run a pnpm version for one invocation",
  args: [
    {
      name: "version",
      suggestions: ["current", "latest", "latest-12", "next"],
    },
    {
      name: "pnpm arguments",
      isOptional: true,
      isVariadic: true,
    },
  ],
};

export const ciCommand: Fig.Subcommand = {
  name: ["ci", "clean-install", "ic", "install-clean"],
  description: "Clean dependencies and install with a frozen lockfile",
  options: [
    {
      name: "--offline",
      description:
        "If true, pnpm will use only packages already available in the store. If a package won't be found locally, the installation will fail",
    },
    {
      name: "--prefer-offline",
      description:
        "If true, staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full offline mode, use --offline",
    },
    {
      name: "--ignore-scripts",
      description:
        "Do not execute any scripts defined in the project package.json and its dependencies",
    },
    {
      name: "--reporter",
      description:
        "Allows you to choose the reporter that will log debug info to the terminal about the installation progress",
      args: {
        name: "Reporter Type",
        suggestions: ["silent", "default", "append-only", "ndjson"],
      },
    },
    {
      name: ["-P", "--prod", "--production"],
      description:
        "Pnpm will not install any package listed in devDependencies if the NODE_ENV environment variable is set to production.\nUse this flag to instruct pnpm to ignore NODE_ENV and take its production status from this flag instead",
    },
    {
      name: ["-D", "--dev"],
      description:
        "Only devDependencies are installed regardless of the NODE_ENV",
    },
    {
      name: "--no-optional",
      description: "OptionalDependencies are not installed",
    },
    {
      name: "--lockfile-only",
      description:
        "When used, only updates pnpm-lock.yaml and package.json instead of checking node_modules and downloading dependencies",
    },
    {
      name: "--frozen-lockfile",
      description:
        "If true, pnpm doesn't generate a lockfile and fails to install if the lockfile is out of sync with the manifest / an update is needed or no lockfile is present",
    },
    {
      name: "--shamefully-hoist",
      description:
        "Creates a flat node_modules structure, similar to that of npm or yarn. WARNING: This is highly discouraged",
    },
  ],
};

export const addCommand: Fig.Subcommand = {
  name: "add",
  description:
    "Installs a package and any packages that it depends on. By default, any new package is installed as a production dependency",
  args: {
    name: "package",
    generators: npmSearchGenerator,
    debounce: true,
    isVariadic: true,
  },
  options: [
    {
      name: ["-P", "--save-prod", "-p"],
      description: "Install the specified packages as regular dependencies",
    },
    {
      name: ["-D", "--save-dev", "-d"],
      description: "Install the specified packages as devDependencies",
    },
    {
      name: ["-O", "--save-optional", "-o"],
      description: "Install the specified packages as optionalDependencies",
    },
    {
      name: ["-E", "--save-exact", "-e"],
      description:
        "Saved dependencies will be configured with an exact version rather than using pnpm's default semver range operator",
    },
    filterOption11,
    {
      name: "--allow-build",
      description: "Allow dependency build scripts during installation",
      args: {
        name: "package",
      },
      isRepeatable: true,
    },
    {
      name: "--offline",
      description:
        "If true, pnpm will use only packages already available in the store. If a package won't be found locally, the installation will fail",
    },
    {
      name: "--prefer-offline",
      description:
        "If true, staleness checks for cached data will be bypassed, but missing data will be requested from the server. To force full offline mode, use --offline",
    },
    {
      name: "--ignore-scripts",
      description:
        "Do not execute any scripts defined in the project package.json and its dependencies",
    },
    {
      name: "--reporter",
      description:
        "Allows you to choose the reporter that will log debug info to the terminal about the installation progress",
      args: {
        name: "Reporter Type",
        suggestions: ["silent", "default", "append-only", "ndjson"],
      },
    },
    {
      name: "--no-save",
      description: "Prevents saving to `dependencies`",
    },
    {
      name: "--save-peer",
      description:
        "Using --save-peer will add one or more packages to peerDependencies and install them as dev dependencies",
    },
    {
      name: ["--ignore-workspace-root-check", "-W"],
      description:
        "Adding a new dependency to the root workspace package fails, unless the --ignore-workspace-root-check or -W flag is used.\nFor instance, pnpm add debug -W",
    },
    {
      name: ["--global", "-g"],
      description: "Install a package globally",
    },
    {
      name: "--workspace",
      description:
        "Only adds the new dependency if it is found in the workspace",
    },
  ],
};

export const installCommand: Fig.Subcommand = {
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
  generateSpec: generateInstallSpec11_0_0,
};

export const updateCommand: Fig.Subcommand = {
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
    filterOption11,
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
      description: "Show outdated dependencies and select which ones to update",
    },
    {
      name: "--workspace",
      description:
        "Tries to link all packages from the workspace. Versions are updated to match the versions of packages inside the workspace.\nIf specific packages are updated, the command will fail if any of the updated dependencies are not found inside the workspace. For instance, the following command fails if express is not a workspace package: pnpm up -r --workspace express",
    },
  ],
};

export const removeCommand: Fig.Subcommand = {
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
    filterOption11,
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
  ],
};

export const unlinkCommand: Fig.Subcommand = {
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
    filterOption11,
    {
      name: ["--recursive", "-r"],
      description:
        "Unlink in every package found in subdirectories or in every workspace package, when executed inside a workspace",
    },
  ],
};

export const rebuildCommand: Fig.Subcommand = {
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
    filterOption11,
    {
      name: ["--recursive", "-r"],
      description:
        "This command runs the pnpm rebuild command in every package of the monorepo",
    },
  ],
};

export const listCommand: Fig.Subcommand = {
  name: ["list", "ls"],
  description:
    'This command will output all the versions of packages that are installed, as well as their dependencies, in a tree-structure.\nPositional arguments are name-pattern@version-range identifiers, which will limit the results to only the packages named. For example, pnpm list "babel-*" "eslint-*" semver@5',
  args: {
    name: "pattern",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    filterOption11,
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
  ],
};

export const runCommand: Fig.Subcommand = {
  name: ["run", "run-script"],
  description: "Runs a script defined in the package's manifest file",
  args: {
    name: "Scripts",
    filterStrategy: "fuzzy",
    generators: npmScriptsGenerator,
    isVariadic: true,
  },
  options: [
    filterOption11,
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
  ],
};

export const execCommand: Fig.Subcommand = {
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
    filterOption11,
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
  ],
};

export const publishCommand: Fig.Subcommand = {
  name: "publish",
  description:
    "Publishes a package to the registry.\nWhen publishing a package inside a workspace, the LICENSE file from the root of the workspace is packed with the package (unless the package has a license of its own).\nYou may override some fields before publish, using the publishConfig field in package.json. You also can use the publishConfig.directory to customize the published subdirectory (usually using third party build tools).\nWhen running this command recursively (pnpm -r publish), pnpm will publish all the packages that have versions not yet published to the registry",
  args: {
    name: "Branch",
    generators: searchBranches,
  },
  options: [
    filterOption11,
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
  ],
};

export const llCommand: Fig.Subcommand = {
  name: ["ll", "la"],
  description: "List installed packages in long format",
  args: {
    name: "package",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    filterOption11,
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
  ],
};

export const ignoredBuildsCommand: Fig.Subcommand = {
  name: "ignored-builds",
  description: "Print the list of packages with blocked build scripts",
};
