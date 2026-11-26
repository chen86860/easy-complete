// ////////////////////////////////////////////////////////////////// Generators //////////////////////////////////////////////////////////////////

const dependenciesGenerator: Fig.Generator = {
  script: {
    command: "bash",
    args: [
      "-c",
      'awk \'/dependencies = \\[/ {f=1; next} /\\]/ {f=0} f && /"/ {line = $0; gsub(/^[ \\t]*"/, "", line); sub(/>=.*$/, "", line); gsub(/",?$/, "", line); print line}\' pyproject.toml',
    ],
  },
  postProcess: (out) => {
    return out.split("\n").map((line) => {
      return {
        name: line,
        description: "Dependency",
        icon: "📦",
        priority: 80,
      };
    });
  },
};

const commandGenerator: Fig.Generator = {
  script: {
    command: "bash",
    args: ["-c", `uv run | grep -E '^- ' | sed 's/^- //'`],
  },
  postProcess: (out) => {
    return out.split("\n").map((line) => {
      return {
        name: line,
        description: "Command",
        icon: "fig://icon?type=command",
        priority: 80,
      };
    });
  },
};

// ////////////////////////////////////////////////////////////////// Options //////////////////////////////////////////////////////////////////
const indexOptions: Fig.Option[] = [
  {
    name: "--index",
    description:
      "The URLs to use when resolving dependencies, in addition to the default index",
    args: { name: "INDEX" },
  },
  {
    name: "--default-index",
    description:
      "The URL of the default package index (by default: <https://pypi.org/simple>)",
    args: { name: "DEFAULT_INDEX" },
  },
  {
    name: "--index-url",
    description:
      "The URL of the Python package index (by default: <https://pypi.org/simple>)",
    args: { name: "INDEX_URL" },
  },
  {
    name: "--extra-index-url",
    description:
      "Extra URLs of package indexes to use, in addition to `--index-url`",
    args: { name: "EXTRA_INDEX_URL" },
  },
  {
    name: "--find-links",
    description:
      "Locations to search for candidate distributions, in addition to those found in the registry indexes",
    args: { name: "FIND_LINKS" },
  },
  {
    name: "--no-index",
    description:
      "Ignore the registry index (e.g., PyPI), instead relying on direct URL dependencies and those provided via `--find-links`",
  },
  {
    name: "--index-strategy",
    description:
      "The strategy to use when resolving against multiple index URLs",
    args: {
      name: "INDEX_STRATEGY",
      suggestions: ["first-index", "unsafe-first-match", "unsafe-best-match"],
    },
  },
  {
    name: "--keyring-provider",
    description: "Attempt to use `keyring` for authentication for index URLs",
    args: {
      name: "KEYRING_PROVIDER",
      suggestions: ["disabled", "subprocess"],
    },
  },
];

const cacheOptions: Fig.Option[] = [
  {
    name: "--no-cache",
    description:
      "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
  },
  {
    name: "--cache-dir",
    description: "Path to the cache directory",
    args: { name: "CACHE_DIR" },
  },
  {
    name: "--refresh",
    description: "Refresh all cached data",
  },
  {
    name: "--refresh-package",
    description: "Refresh cached data for a specific package",
    args: { name: "REFRESH_PACKAGE" },
  },
];

const resolverOptions: Fig.Option[] = [
  {
    name: "-U",
    description:
      "Allow package upgrades, ignoring pinned versions in any existing output file. Implies `--refresh`",
  },
  {
    name: "--upgrade-package",
    description:
      "Allow upgrades for a specific package, ignoring pinned versions in any existing output file. Implies `--refresh-package`",
    args: { name: "UPGRADE_PACKAGE" },
  },
  {
    name: "--resolution",
    description:
      "The strategy to use when selecting between the different compatible versions for a given package requirement",
    args: {
      name: "RESOLUTION",
      suggestions: ["highest", "lowest", "lowest-direct"],
    },
  },
  {
    name: "--prerelease",
    description: "The strategy to use when considering pre-release versions",
    args: {
      name: "PRERELEASE",
      suggestions: [
        "disallow",
        "allow",
        "if-necessary",
        "explicit",
        "if-necessary-or-explicit",
      ],
    },
  },
  {
    name: "--exclude-newer",
    description:
      "Limit candidate packages to those that were uploaded prior to the given date",
    args: { name: "EXCLUDE_NEWER" },
  },
  {
    name: "--no-sources",
    description:
      "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any local or Git sources",
  },
];

const installerOptions: Fig.Option[] = [
  {
    name: "--reinstall",
    description:
      "Reinstall all packages, regardless of whether they're already installed. Implies `--refresh`",
  },
  {
    name: "--reinstall-package",
    description:
      "Reinstall a specific package, regardless of whether it's already installed. Implies `--refresh-package`",
    args: { name: "REINSTALL_PACKAGE" },
  },
  {
    name: "--link-mode",
    description:
      "The method to use when installing packages from the global cache",
    args: {
      name: "LINK_MODE",
      suggestions: ["clone", "copy", "hardlink", "symlink"],
    },
  },
  {
    name: "--compile-bytecode",
    description: "Compile Python files to bytecode after installation",
  },
];

const buildOptions: Fig.Option[] = [
  {
    name: "-C",
    description:
      "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
    args: { name: "CONFIG_SETTING" },
  },
  {
    name: "--no-build-isolation",
    description: "Disable isolation when building source distributions",
    args: { name: "UV_NO_BUILD_ISOLATION" },
  },
  {
    name: "--no-build-isolation-package",
    description:
      "Disable isolation when building source distributions for a specific package",
    args: { name: "NO_BUILD_ISOLATION_PACKAGE" },
  },
  {
    name: "--no-build",
    description: "Don't build source distributions",
  },
  {
    name: "--no-build-package",
    description: "Don't build source distributions for a specific package",
    args: { name: "NO_BUILD_PACKAGE" },
  },
  {
    name: "--no-binary",
    description: "Don't install pre-built wheels",
  },
  {
    name: "--no-binary-package",
    description: "Don't install pre-built wheels for a specific package",
    args: { name: "NO_BINARY_PACKAGE" },
  },
];

const pythonOptions: Fig.Option[] = [
  {
    name: ["-p", "--python"],
    description:
      "The Python interpreter to use to determine the minimum supported Python version",
    args: {
      name: "PYTHON",
    },
  },
  {
    name: "--python-preference",
    description: "Whether to prefer uv-managed or system Python installations",
    args: {
      name: "PYTHON_PREFERENCE",
      suggestions: ["only-managed", "managed", "system", "only-system"],
    },
  },
  {
    name: "--no-python-downloads",
    description: "Disable automatic downloads of Python",
  },
];

// ////////////////////////////////////////////////////////////////// Subcommands //////////////////////////////////////////////////////////////////

//    run
const runOptions: Fig.Option[] = [
  {
    name: "--extra",
    description: "Include optional dependencies from the specified extra name",
    args: { name: "EXTRA" },
  },
  {
    name: "--all-extras",
    description: "Include all optional dependencies",
  },
  {
    name: "--no-extra",
    description:
      "Exclude the specified optional dependencies, if `--all-extras` is supplied",
    args: { name: "NO_EXTRA" },
  },
  {
    name: "--no-dev",
    description: "Omit the development dependency group",
  },
  {
    name: "--group",
    description: "Include dependencies from the specified dependency group",
    args: { name: "GROUP" },
  },
  {
    name: "--no-group",
    description: "Exclude dependencies from the specified dependency group",
    args: { name: "NO_GROUP" },
  },
  {
    name: "--only-group",
    description:
      "Only include dependencies from the specified dependency group",
    args: { name: "ONLY_GROUP" },
  },
  {
    name: "--all-groups",
    description: "Include dependencies from all dependency groups",
  },
  {
    name: ["-m", "--module"],
    description: "Run a Python module",
  },
  {
    name: "--only-dev",
    description: "Only include the development dependency group",
  },
  {
    name: "--no-editable",
    description:
      "Install any editable dependencies, including the project and any workspace members, as non-editable",
  },
  {
    name: "--env-file",
    description: "Load environment variables from a `.env` file",
    args: { name: "ENV_FILE" },
  },
  {
    name: "--no-env-file",
    description: "Avoid reading environment variables from a `.env` file",
  },
  {
    name: "--with",
    description: "Run with the given packages installed",
    args: { name: "WITH" },
  },
  {
    name: "--with-editable",
    description: "Run with the given packages installed as editables",
    args: { name: "WITH_EDITABLE" },
  },
  {
    name: "--with-requirements",
    description:
      "Run with all packages listed in the given `requirements.txt` files",
    args: { name: "WITH_REQUIREMENTS" },
  },
  {
    name: "--isolated",
    description: "Run the command in an isolated virtual environment",
  },
  {
    name: "--no-sync",
    description: "Avoid syncing the virtual environment",
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
  },
  {
    name: "--frozen",
    description: "Run without updating the `uv.lock` file",
  },
  {
    name: ["-s", "--script"],
    description: "Run the given path as a Python script",
  },
  {
    name: "--all-packages",
    description: "Run the command with all workspace members installed",
  },
  {
    name: "--package",
    description: "Run the command in a specific package in the workspace",
    args: { name: "PACKAGE" },
  },
  {
    name: "--no-project",
    description: "Avoid discovering the project or workspace",
  },
];

//    init
const initOptions: Fig.Option[] = [
  {
    name: "--name",
    description: "The name of the project",
    args: { name: "NAME" },
  },
  {
    name: "--package",
    description: "Set up the project to be built as a Python package",
  },
  {
    name: "--no-package",
    description: "Do not set up the project to be built as a Python package",
  },
  {
    name: "--app",
    description: "Create a project for an application",
  },
  {
    name: "--lib",
    description: "Create a project for a library",
  },
  {
    name: "--script",
    description: "Create a script",
  },
  {
    name: "--vcs",
    description: "Initialize a version control system for the project",
    args: {
      name: "VCS",
      suggestions: ["git", "none"],
    },
  },
  {
    name: "--build-backend",
    description: "Initialize a build-backend of choice for the project",
    args: {
      name: "BUILD_BACKEND",
      suggestions: ["hatch", "flit", "pdm", "setuptools", "maturin", "scikit"],
    },
  },
  {
    name: "--no-readme",
    description: "Do not create a `README.md` file",
  },
  {
    name: "--author-from",
    description: "Fill in the `authors` field in the `pyproject.toml`",
    args: {
      name: "AUTHOR_FROM",
      suggestions: ["auto", "git", "none"],
    },
  },
  {
    name: "--no-pin-python",
    description: "Do not create a `.python-version` file for the project",
  },
  {
    name: "--no-workspace",
    description:
      "Avoid discovering a workspace and create a standalone project",
  },
];

const initCacheOptions: Fig.Option[] = [
  {
    name: "-n",
    description:
      "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
  },
  {
    name: "--cache-dir",
    description: "Path to the cache directory",
    args: { name: "CACHE_DIR" },
  },
];

//    add
const addOptions: Fig.Option[] = [
  {
    name: ["-r", "--requirements"],
    description:
      "Add all packages listed in the given `requirements.txt` files",
    args: { name: "REQUIREMENTS" },
  },
  {
    name: "--dev",
    description: "Add the requirements to the development dependency group",
  },
  {
    name: "--optional",
    description:
      "Add the requirements to the package's optional dependencies for the specified extra",
    args: { name: "OPTIONAL" },
  },
  {
    name: "--group",
    description: "Add the requirements to the specified dependency group",
    args: { name: "GROUP" },
  },
  {
    name: "--editable",
    description: "Add the requirements as editable",
  },
  {
    name: "--raw-sources",
    description:
      "Add source requirements to `project.dependencies`, rather than `tool.uv.sources`",
  },
  {
    name: "--rev",
    description: "Commit to use when adding a dependency from Git",
    args: { name: "REV" },
  },
  {
    name: "--tag",
    description: "Tag to use when adding a dependency from Git",
    args: { name: "TAG" },
  },
  {
    name: "--branch",
    description: "Branch to use when adding a dependency from Git",
    args: { name: "BRANCH" },
  },
  {
    name: "--extra",
    description: "Extras to enable for the dependency",
    args: { name: "EXTRA" },
  },
  {
    name: "--no-sync",
    description: "Avoid syncing the virtual environment",
    args: { name: "UV_NO_SYNC" },
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
    args: { name: "UV_LOCKED" },
  },
  {
    name: "--frozen",
    description: "Add dependencies without re-locking the project",
    args: { name: "UV_FROZEN" },
  },
  {
    name: "--package",
    description: "Add the dependency to a specific package in the workspace",
    args: { name: "PACKAGE" },
  },
  {
    name: "--script",
    description:
      "Add the dependency to the specified Python script, rather than to a project",
    args: { name: "SCRIPT" },
  },
];

//    remove
const removeOptions: Fig.Option[] = [
  {
    name: "--dev",
    description: "Remove the packages from the development dependency group",
  },
  {
    name: "--optional",
    description:
      "Remove the packages from the project's optional dependencies for the specified extra",
    args: {
      name: "OPTIONAL",
    },
  },
  {
    name: "--group",
    description: "Remove the packages from the specified dependency group",
    args: {
      name: "GROUP",
    },
  },
  {
    name: "--no-sync",
    description:
      "Avoid syncing the virtual environment after re-locking the project",
    args: {
      name: "UV_NO_SYNC",
    },
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
    args: {
      name: "UV_LOCKED",
    },
  },
  {
    name: "--frozen",
    description: "Remove dependencies without re-locking the project",
    args: {
      name: "UV_FROZEN",
    },
  },
  {
    name: "--package",
    description:
      "Remove the dependencies from a specific package in the workspace",
    args: {
      name: "PACKAGE",
    },
  },
  {
    name: "--script",
    description:
      "Remove the dependency from the specified Python script, rather than from a project",
    args: {
      name: "SCRIPT",
    },
  },
];

//    sync
const syncOptions: Fig.Option[] = [
  {
    name: "--extra",
    description: "Include optional dependencies from the specified extra name",
    args: {
      name: "EXTRA",
    },
  },
  {
    name: "--all-extras",
    description: "Include all optional dependencies",
  },
  {
    name: "--no-extra",
    description:
      "Exclude the specified optional dependencies, if `--all-extras` is supplied",
    args: {
      name: "NO_EXTRA",
    },
  },
  {
    name: "--no-dev",
    description: "Omit the development dependency group",
  },
  {
    name: "--only-dev",
    description: "Only include the development dependency group",
  },
  {
    name: "--group",
    description: "Include dependencies from the specified dependency group",
    args: {
      name: "GROUP",
    },
  },
  {
    name: "--no-group",
    description: "Exclude dependencies from the specified dependency group",
    args: {
      name: "NO_GROUP",
    },
  },
  {
    name: "--only-group",
    description:
      "Only include dependencies from the specified dependency group",
    args: {
      name: "ONLY_GROUP",
    },
  },
  {
    name: "--all-groups",
    description: "Include dependencies from all dependency groups",
  },
  {
    name: "--no-editable",
    description:
      "Install any editable dependencies, including the project and any workspace members, as non-editable",
  },
  {
    name: "--inexact",
    description: "Do not remove extraneous packages present in the environment",
  },
  {
    name: "--no-install-project",
    description: "Do not install the current project",
  },
  {
    name: "--no-install-workspace",
    description:
      "Do not install any workspace members, including the root project",
  },
  {
    name: "--no-install-package",
    description: "Do not install the given package(s)",
    args: {
      name: "NO_INSTALL_PACKAGE",
    },
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
    args: {
      name: "UV_LOCKED",
    },
  },
  {
    name: "--frozen",
    description: "Sync without updating the `uv.lock` file",
    args: {
      name: "UV_FROZEN",
    },
  },
  {
    name: "--all-packages",
    description: "Sync all packages in the workspace",
  },
  {
    name: "--package",
    description: "Sync for a specific package in the workspace",
    args: {
      name: "PACKAGE",
    },
  },
];

//   lock
const lockOptions: Fig.Option[] = [
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
  },
  {
    name: "--frozen",
    description: "Assert that a `uv.lock` exists, without updating it",
  },
  {
    name: "--dry-run",
    description: "Perform a dry run, without writing the lockfile",
  },
];

const lockInstallerOptions: Fig.Option[] = [
  {
    name: "--link-mode",
    description:
      "The method to use when installing packages from the global cache",
    args: {
      name: "LINK_MODE",
      suggestions: ["clone", "copy", "hardlink", "symlink"],
    },
  },
];

//  export
const exportOptions: Fig.Option[] = [
  {
    name: "--format",
    description: "The format to which `uv.lock` should be exported",
    args: {
      name: "FORMAT",
    },
  },
  {
    name: "--all-packages",
    description: "Export the entire workspace",
  },
  {
    name: "--package",
    description:
      "Export the dependencies for a specific package in the workspace",
    args: {
      name: "PACKAGE",
    },
  },
  {
    name: "--prune",
    description: "Prune the given package from the dependency tree",
    args: {
      name: "PRUNE",
    },
  },
  {
    name: "--extra",
    description: "Include optional dependencies from the specified extra name",
    args: {
      name: "EXTRA",
    },
  },
  {
    name: "--all-extras",
    description: "Include all optional dependencies",
  },
  {
    name: "--no-extra",
    description:
      "Exclude the specified optional dependencies, if `--all-extras` is supplied",
    args: {
      name: "NO_EXTRA",
    },
  },
  {
    name: "--no-dev",
    description: "Omit the development dependency group",
  },
  {
    name: "--only-dev",
    description: "Only include the development dependency group",
  },
  {
    name: "--group",
    description: "Include dependencies from the specified dependency group",
    args: {
      name: "GROUP",
    },
  },
  {
    name: "--no-group",
    description: "Exclude dependencies from the specified dependency group",
    args: {
      name: "NO_GROUP",
    },
  },
  {
    name: "--only-group",
    description:
      "Only include dependencies from the specified dependency group",
    args: {
      name: "ONLY_GROUP",
    },
  },
  {
    name: "--all-groups",
    description: "Include dependencies from all dependency groups",
  },
  {
    name: "--no-header",
    description:
      "Exclude the comment header at the top of the generated output file",
  },
  {
    name: "--no-editable",
    description:
      "Install any editable dependencies, including the project and any workspace members, as non-editable",
  },
  {
    name: "--no-hashes",
    description: "Omit hashes in the generated output",
  },
  {
    name: "-o",
    description: "Write the exported requirements to the given file",
    args: {
      name: "OUTPUT_FILE",
    },
  },
  {
    name: "--no-emit-project",
    description: "Do not emit the current project",
  },
  {
    name: "--no-emit-workspace",
    description:
      "Do not emit any workspace members, including the root project",
  },
  {
    name: "--no-emit-package",
    description: "Do not emit the given package(s)",
    args: {
      name: "NO_EMIT_PACKAGE",
    },
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
    args: {
      name: "UV_LOCKED",
    },
  },
  {
    name: "--frozen",
    description: "Do not update the `uv.lock` before exporting",
    args: {
      name: "UV_FROZEN",
    },
  },
];

// tree
const treeOptions: Fig.Option[] = [
  {
    name: "--universal",
    description: "Show a platform-independent dependency tree",
  },
  {
    name: "-d",
    description: "Maximum display depth of the dependency tree",
    args: {
      name: "DEPTH",
      default: "255",
    },
  },
  {
    name: "--prune",
    description:
      "Prune the given package from the display of the dependency tree",
    args: {
      name: "PRUNE",
    },
  },
  {
    name: "--package",
    description: "Display only the specified packages",
    args: {
      name: "PACKAGE",
    },
  },
  {
    name: "--no-dedupe",
    description:
      "Do not de-duplicate repeated dependencies. Usually, when a package has already displayed its dependencies, further occurrences will not re-display its dependencies, and will include a (*) to indicate it has already been shown. This flag will cause those duplicates to be repeated",
  },
  {
    name: "--invert",
    description:
      "Show the reverse dependencies for the given package. This flag will invert the tree and display the packages that depend on the given package",
  },
  {
    name: "--outdated",
    description:
      "Show the latest available version of each package in the tree",
  },
  {
    name: "--only-dev",
    description: "Only include the development dependency group",
  },
  {
    name: "--no-dev",
    description: "Omit the development dependency group",
  },
  {
    name: "--group",
    description: "Include dependencies from the specified dependency group",
    args: {
      name: "GROUP",
    },
  },
  {
    name: "--no-group",
    description: "Exclude dependencies from the specified dependency group",
    args: {
      name: "NO_GROUP",
    },
  },
  {
    name: "--only-group",
    description:
      "Only include dependencies from the specified dependency group",
    args: {
      name: "ONLY_GROUP",
    },
  },
  {
    name: "--all-groups",
    description: "Include dependencies from all dependency groups",
  },
  {
    name: "--locked",
    description: "Assert that the `uv.lock` will remain unchanged",
    args: {
      name: "UV_LOCKED",
    },
  },
  {
    name: "--frozen",
    description: "Display the requirements without locking the project",
    args: {
      name: "UV_FROZEN",
    },
  },
  {
    name: "--python-version",
    description: "The Python version to use when filtering the tree",
    args: {
      name: "PYTHON_VERSION",
    },
  },
  {
    name: "--python-platform",
    description: "The platform to use when filtering the tree",
    args: {
      name: "PYTHON_PLATFORM",
      suggestions: [
        "windows",
        "linux",
        "macos",
        "x86_64-pc-windows-msvc",
        "i686-pc-windows-msvc",
        "x86_64-unknown-linux-gnu",
        "aarch64-apple-darwin",
        "x86_64-apple-darwin",
        "aarch64-unknown-linux-gnu",
        "aarch64-unknown-linux-musl",
        "x86_64-unknown-linux-musl",
        "x86_64-manylinux_2_17",
        "x86_64-manylinux_2_28",
        "x86_64-manylinux_2_31",
        "x86_64-manylinux_2_32",
        "x86_64-manylinux_2_33",
        "x86_64-manylinux_2_34",
        "x86_64-manylinux_2_35",
        "x86_64-manylinux_2_36",
        "x86_64-manylinux_2_37",
        "x86_64-manylinux_2_38",
        "x86_64-manylinux_2_39",
        "x86_64-manylinux_2_40",
        "aarch64-manylinux_2_17",
        "aarch64-manylinux_2_28",
        "aarch64-manylinux_2_31",
        "aarch64-manylinux_2_32",
        "aarch64-manylinux_2_33",
        "aarch64-manylinux_2_34",
        "aarch64-manylinux_2_35",
        "aarch64-manylinux_2_36",
        "aarch64-manylinux_2_37",
        "aarch64-manylinux_2_38",
        "aarch64-manylinux_2_39",
        "aarch64-manylinux_2_40",
      ],
    },
  },
];

const toolSubcommands: Fig.Subcommand[] = [
  {
    name: "run",
    description: "Run a command provided by a Python package",
    options: [
      {
        name: "--from",
        description: "Use the given package to provide the command",
        args: { name: "FROM" },
      },
      {
        name: "--with",
        description: "Run with the given packages installed",
        args: { name: "WITH" },
      },
      {
        name: "--with-editable",
        description: "Run with the given packages installed as editables",
        args: { name: "WITH_EDITABLE" },
      },
      {
        name: "--with-requirements",
        description:
          "Run with all packages listed in the given `requirements.txt` files",
        args: { name: "WITH_REQUIREMENTS" },
      },
      {
        name: "--isolated",
        description: "Run the tool in an isolated virtual environment",
      },

      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: ["-b", "--build-constraints"],
        description:
          "Constrain build dependencies using the given requirements files when building source distributions",
        args: {
          name: "build_constraints",
        },
      },
      {
        name: "--overrides",
        description: "Override versions using the given requirements files",
        args: {
          name: "overrides",
        },
      },
      {
        name: "--env-file",
        description: "Load environment variables from a `.env` file",
        args: {
          name: "env_file",
        },
      },
      {
        name: "--no-env-file",
        description: "Avoid reading environment variables from a `.env` file",
      },
      {
        name: "--lfs",
        description: "Whether to use Git LFS when adding a dependency from Git",
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--torch-backend",
        description:
          "The backend to use when fetching packages in the PyTorch ecosystem (e.g., `cpu`, `cu126`, or `auto`)",
        args: {
          name: "torch_backend",
          suggestions: [
            "auto",
            "cpu",
            "cu132",
            "cu130",
            "cu129",
            "cu128",
            "cu126",
            "cu125",
            "cu124",
            "cu123",
            "cu122",
            "cu121",
            "cu120",
            "cu118",
            "cu117",
            "cu116",
            "cu115",
            "cu114",
            "cu113",
            "cu112",
            "cu111",
            "cu110",
            "cu102",
            "cu101",
            "cu100",
            "cu92",
            "cu91",
            "cu90",
            "cu80",
            "rocm7.2",
            "rocm7.1",
            "rocm7.0",
            "rocm6.4",
            "rocm6.3",
            "rocm6.2.4",
            "rocm6.2",
            "rocm6.1",
            "rocm6.0",
            "rocm5.7",
            "rocm5.6",
            "rocm5.5",
            "rocm5.4.2",
            "rocm5.4",
            "rocm5.3",
            "rocm5.2",
            "rocm5.1.1",
            "rocm4.2",
            "rocm4.1",
            "rocm4.0.1",
            "xpu",
          ],
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter to use to build the run environment.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "install",
    description: "Install commands provided by a Python package",
    options: [
      {
        name: "--editable",
        description: "Install the package in editable mode",
      },
      {
        name: "--with",
        description: "Include the following extra requirements",
        args: { name: "WITH" },
      },
      {
        name: "--with-editable",
        description: "Include the given packages as editables",
        args: { name: "WITH_EDITABLE" },
      },
      {
        name: "--with-requirements",
        description:
          "Run all requirements listed in the given `requirements.txt` files",
        args: { name: "WITH_REQUIREMENTS" },
      },
      {
        name: "--isolated",
        description: "Install the tool in an isolated virtual environment",
      },

      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      {
        name: "--with-executables-from",
        description: "Install executables from the following packages",
        args: {
          name: "with_executables_from",
        },
      },
      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: "--overrides",
        description: "Override versions using the given requirements files",
        args: {
          name: "overrides",
        },
      },
      {
        name: "--excludes",
        description:
          "Exclude packages from resolution using the given requirements files",
        args: {
          name: "excludes",
        },
      },
      {
        name: ["-b", "--build-constraints"],
        description:
          "Constrain build dependencies using the given requirements files when building source distributions",
        args: {
          name: "build_constraints",
        },
      },
      {
        name: "--force",
        description: "Force installation of the tool",
      },
      {
        name: "--lfs",
        description: "Whether to use Git LFS when adding a dependency from Git",
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--torch-backend",
        description:
          "The backend to use when fetching packages in the PyTorch ecosystem (e.g., `cpu`, `cu126`, or `auto`)",
        args: {
          name: "torch_backend",
          suggestions: [
            "auto",
            "cpu",
            "cu132",
            "cu130",
            "cu129",
            "cu128",
            "cu126",
            "cu125",
            "cu124",
            "cu123",
            "cu122",
            "cu121",
            "cu120",
            "cu118",
            "cu117",
            "cu116",
            "cu115",
            "cu114",
            "cu113",
            "cu112",
            "cu111",
            "cu110",
            "cu102",
            "cu101",
            "cu100",
            "cu92",
            "cu91",
            "cu90",
            "cu80",
            "rocm7.2",
            "rocm7.1",
            "rocm7.0",
            "rocm6.4",
            "rocm6.3",
            "rocm6.2.4",
            "rocm6.2",
            "rocm6.1",
            "rocm6.0",
            "rocm5.7",
            "rocm5.6",
            "rocm5.5",
            "rocm5.4.2",
            "rocm5.4",
            "rocm5.3",
            "rocm5.2",
            "rocm5.1.1",
            "rocm4.2",
            "rocm4.1",
            "rocm4.0.1",
            "xpu",
          ],
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter to use to build the tool environment.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "upgrade",
    description: "Upgrade installed tools",
    options: [
      {
        name: "--all",
        description: "Upgrade all tools",
      },

      ...indexOptions,
      ...installerOptions,
      ...buildOptions,
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "Upgrade a tool, and specify it to use the given Python interpreter to build its environment. Use with `--all` to apply to all tools.",
        args: {
          name: "python",
        },
      },
      {
        name: "--resolution",
        description:
          "The strategy to use when selecting between the different compatible versions for a given package requirement",
        args: {
          name: "resolution",
          suggestions: ["highest", "lowest", "lowest-direct"],
        },
      },
      {
        name: "--prerelease",
        description:
          "The strategy to use when considering pre-release versions",
        args: {
          name: "prerelease",
          suggestions: [
            "disallow",
            "allow",
            "if-necessary",
            "explicit",
            "if-necessary-or-explicit",
          ],
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer",
        description:
          "Limit candidate packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer",
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources",
        description:
          "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any workspace, Git, URL, or local path sources",
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-setting-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_setting_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
    ],
  },
  {
    name: "list",
    description: "List installed tools",
    options: [
      {
        name: "--show-paths",
        description:
          "Whether to display the path to each tool environment and installed executable",
      },
      {
        name: "--show-version-specifiers",
        description:
          "Whether to display the version specifier(s) used to install each tool",
      },

      {
        name: "--show-with",
        description:
          "Whether to display the additional requirements installed with each tool",
      },
      {
        name: "--show-extras",
        description:
          "Whether to display the extra requirements installed with each tool",
      },
      {
        name: "--show-python",
        description:
          "Whether to display the Python version associated with each tool",
      },
      {
        name: "--outdated",
        description: "List outdated tools",
      },
      {
        name: "--exclude-newer",
        description:
          "Limit candidate packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer",
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
    ],
  },
  {
    name: "uninstall",
    description: "Uninstall a tool",
    options: [
      {
        name: "--all",
        description: "Uninstall all tools",
      },
    ],
  },
  {
    name: "update-shell",
    description: "Ensure that the tool executable directory is on the `PATH`",
  },
  {
    name: "dir",
    description: "Show the path to the uv tools directory",
    options: [
      {
        name: "--bin",
        description:
          "Show the directory into which `uv tool` will install executables",
      },
    ],
  },
];

// python

const pythonSubcommands: Fig.Subcommand[] = [
  {
    name: "list",
    description: "List the available Python installations",
    options: [
      {
        name: "--all-versions",
        description: "List all Python versions, including old patch versions",
      },
      {
        name: "--all-platforms",
        description: "List Python downloads for all platforms",
      },
      {
        name: "--only-installed",
        description:
          "Only show installed Python versions, exclude available downloads",
      },

      {
        name: "--all-arches",
        description: "List Python downloads for all architectures",
      },
      {
        name: "--only-downloads",
        description: "Only show available Python downloads",
      },
      {
        name: "--show-urls",
        description: "Show the URLs of available Python downloads",
      },
      {
        name: "--output-format",
        description: "Select the output format",
        args: {
          name: "output_format",
          suggestions: ["text", "json"],
        },
      },
      {
        name: "--python-downloads-json-url",
        description: "URL pointing to JSON of custom Python installations",
        args: {
          name: "python_downloads_json_url",
        },
      },
    ],
  },
  {
    name: "install",
    description: "Download and install Python versions",
    args: {
      name: "VERSION",
      description: "The Python version to install",
    },
    options: [
      {
        name: "--mirror",
        description:
          "Set the URL to use as the source for downloading Python installations",
        args: { name: "MIRROR" },
      },
      {
        name: "--pypy-mirror",
        description:
          "Set the URL to use as the source for downloading PyPy installations",
        args: { name: "PYPY_MIRROR" },
      },
      {
        name: "--reinstall",
        description:
          "Reinstall the requested Python version, if it's already installed",
      },
      {
        name: "--force",
        description: "Replace existing Python executables during installation",
      },
      {
        name: "--default",
        description: "Use as the default Python version",
      },

      {
        name: ["-i", "--install-dir"],
        description: "The directory to store the Python installation in",
        args: {
          name: "install_dir",
        },
      },
      {
        name: "--no-bin",
        description:
          "Do not install a Python executable into the `bin` directory",
      },
      {
        name: "--no-registry",
        description:
          "Do not register the Python installation in the Windows registry",
      },
      {
        name: "--graalpy-mirror",
        description:
          "Set the URL to use as the source for downloading GraalPy installations",
        args: {
          name: "graalpy_mirror",
        },
      },
      {
        name: "--pyodide-mirror",
        description:
          "Set the URL to use as the source for downloading Pyodide installations",
        args: {
          name: "pyodide_mirror",
        },
      },
      {
        name: "--python-downloads-json-url",
        description: "URL pointing to JSON of custom Python installations",
        args: {
          name: "python_downloads_json_url",
        },
      },
      {
        name: ["-U", "--upgrade"],
        description:
          "Upgrade existing Python installations to the latest patch version",
      },
      {
        name: "--compile-bytecode",
        description:
          "Compile Python's standard library to bytecode after installation",
      },
    ],
  },
  {
    name: "find",
    description: "Search for a Python installation",
    args: {
      name: "REQUEST",
      description: "The Python request",
    },
    options: [
      {
        name: "--no-project",
        description: "Avoid discovering the project or workspace",
      },
      {
        name: "--system",
        description:
          "Only find system Python interpreters [env: UV_SYSTEM_PYTHON=]",
      },

      {
        name: "--script",
        description:
          "Find the environment for a Python script, rather than the current project",
        args: {
          name: "script",
        },
      },
      {
        name: "--show-version",
        description:
          "Show the Python version that would be used instead of the path to the interpreter",
      },
      {
        name: "--resolve-links",
        description: "Resolve symlinks in the output path",
      },
      {
        name: "--python-downloads-json-url",
        description: "URL pointing to JSON of custom Python installations",
        args: {
          name: "python_downloads_json_url",
        },
      },
    ],
  },
  {
    name: "pin",
    description: "Pin to a specific Python version",
    args: {
      name: "REQUEST",
      description: "The Python request",
    },
    options: [
      {
        name: "--resolved",
        description:
          "Write the resolved Python interpreter path instead of the request",
      },
      {
        name: "--no-project",
        description: "Avoid discovering the project or workspace",
      },

      {
        name: "--global",
        description: "Update the global Python version pin",
      },
      {
        name: "--rm",
        description: "Remove the Python version pin",
      },
      {
        name: "--python-downloads-json-url",
        description: "URL pointing to JSON of custom Python installations",
        args: {
          name: "python_downloads_json_url",
        },
      },
    ],
  },
  {
    name: "dir",
    description: "Show the uv Python installation directory",
    options: [
      {
        name: "--bin",
        description:
          "Show the directory into which `uv python` will install Python executables",
      },
    ],
  },
  {
    name: "uninstall",
    description: "Uninstall Python versions",
    args: {
      name: "VERSION",
      description: "The Python version to uninstall",
    },
    options: [
      {
        name: "--all",
        description: "Uninstall all Python versions",
      },

      {
        name: ["-i", "--install-dir"],
        description: "The directory where the Python was installed",
        args: {
          name: "install_dir",
        },
      },
    ],
  },
];

// pip
const pipSubcommands: Fig.Subcommand[] = [
  {
    name: "compile",
    description:
      "Compile a `requirements.in` file to a `requirements.txt` file",

    options: [
      ...indexOptions,
      ...resolverOptions,
      ...lockInstallerOptions,
      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: "--overrides",
        description: "Override versions using the given requirements files",
        args: {
          name: "overrides",
        },
      },
      {
        name: "--excludes",
        description:
          "Exclude packages from resolution using the given requirements files",
        args: {
          name: "excludes",
        },
      },
      {
        name: ["-b", "--build-constraints"],
        description:
          "Constrain build dependencies using the given requirements files when building source distributions",
        args: {
          name: "build_constraints",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--extra",
        description:
          "Include optional dependencies from the specified extra name; may be provided more than once",
        args: {
          name: "extra",
        },
      },
      {
        name: "--all-extras",
        description: "Include all optional dependencies",
      },
      {
        name: "--group",
        description:
          "Install the specified dependency group from a `pyproject.toml`",
        args: {
          name: "group",
        },
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: "--no-deps",
        description:
          "Ignore package dependencies, instead only add those packages explicitly listed on the command line to the resulting requirements file",
      },
      {
        name: ["-o", "--output-file"],
        description:
          "Write the compiled requirements to the given `requirements.txt` or `pylock.toml` file",
        args: {
          name: "output_file",
        },
      },
      {
        name: "--format",
        description: "The format in which the resolution should be output",
        args: {
          name: "format",
          suggestions: ["requirements.txt", "pylock.toml"],
        },
      },
      {
        name: "--no-strip-extras",
        description: "Include extras in the output file",
      },
      {
        name: "--no-strip-markers",
        description: "Include environment markers in the output file",
      },
      {
        name: "--no-annotate",
        description:
          "Exclude comment annotations indicating the source of each package",
      },
      {
        name: "--no-header",
        description:
          "Exclude the comment header at the top of the generated output file",
      },
      {
        name: "--annotation-style",
        description:
          "The style of the annotation comments included in the output file, used to indicate the source of each package",
        args: {
          name: "annotation_style",
          suggestions: ["line", "split"],
        },
      },
      {
        name: "--custom-compile-command",
        description:
          "The header comment to include at the top of the output file generated by `uv pip compile`",
        args: {
          name: "custom_compile_command",
        },
      },
      {
        name: "--system",
        description: "Install packages into the system Python environment",
      },
      {
        name: "--generate-hashes",
        description: "Include distribution hashes in the output file",
      },
      {
        name: "--no-build",
        description: "Don't build source distributions",
      },
      {
        name: "--no-binary",
        description: "Don't install pre-built wheels",
        args: {
          name: "no_binary",
        },
      },
      {
        name: "--only-binary",
        description:
          "Only use pre-built wheels; don't build source distributions",
        args: {
          name: "only_binary",
        },
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be resolved",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--universal",
        description:
          "Perform a universal resolution, attempting to generate a single `requirements.txt` output file that is compatible with all operating systems, architectures, and Python implementations",
      },
      {
        name: "--no-emit-package",
        description:
          "Specify a package to omit from the output resolution. Its dependencies will still be included in the resolution. Equivalent to pip-compile's `--unsafe-package` option",
        args: {
          name: "no_emit_package",
        },
      },
      {
        name: "--emit-index-url",
        description:
          "Include `--index-url` and `--extra-index-url` entries in the generated output file",
      },
      {
        name: "--emit-find-links",
        description:
          "Include `--find-links` entries in the generated output file",
      },
      {
        name: "--emit-build-options",
        description:
          "Include `--no-binary` and `--only-binary` entries in the generated output file",
      },
      {
        name: "--emit-index-annotation",
        description:
          "Include comment annotations indicating the index used to resolve each package (e.g., `# from https://pypi.org/simple`)",
      },
      {
        name: "--torch-backend",
        description:
          "The backend to use when fetching packages in the PyTorch ecosystem (e.g., `cpu`, `cu126`, or `auto`)",
        args: {
          name: "torch_backend",
          suggestions: [
            "auto",
            "cpu",
            "cu132",
            "cu130",
            "cu129",
            "cu128",
            "cu126",
            "cu125",
            "cu124",
            "cu123",
            "cu122",
            "cu121",
            "cu120",
            "cu118",
            "cu117",
            "cu116",
            "cu115",
            "cu114",
            "cu113",
            "cu112",
            "cu111",
            "cu110",
            "cu102",
            "cu101",
            "cu100",
            "cu92",
            "cu91",
            "cu90",
            "cu80",
            "rocm7.2",
            "rocm7.1",
            "rocm7.0",
            "rocm6.4",
            "rocm6.3",
            "rocm6.2.4",
            "rocm6.2",
            "rocm6.1",
            "rocm6.0",
            "rocm5.7",
            "rocm5.6",
            "rocm5.5",
            "rocm5.4.2",
            "rocm5.4",
            "rocm5.3",
            "rocm5.2",
            "rocm5.1.1",
            "rocm4.2",
            "rocm4.1",
            "rocm4.0.1",
            "xpu",
          ],
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: ["-C", "--config-setting"],
        description:
          "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
        args: {
          name: "config_setting",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--no-build-isolation",
        description: "Disable isolation when building source distributions",
      },
      {
        name: "--no-build-isolation-package",
        description:
          "Disable isolation when building source distributions for a specific package",
        args: {
          name: "no_build_isolation_package",
        },
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use during resolution.",
        args: {
          name: "python",
        },
      },
      {
        name: "--python-version",
        description: "The Python version to use for resolution",
        args: {
          name: "python_version",
        },
      },
    ],
  },
  {
    name: "sync",
    description: "Sync an environment with a `requirements.txt` file",
    args: {
      name: "REQUIREMENTS",
      description: "The path to the requirements file",
    },

    options: [
      ...indexOptions,
      ...installerOptions,
      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: ["-b", "--build-constraints"],
        description:
          "Constrain build dependencies using the given requirements files when building source distributions",
        args: {
          name: "build_constraints",
        },
      },
      {
        name: "--extra",
        description:
          "Include optional dependencies from the specified extra name; may be provided more than once",
        args: {
          name: "extra",
        },
      },
      {
        name: "--all-extras",
        description: "Include all optional dependencies",
      },
      {
        name: "--group",
        description:
          "Install the specified dependency group from a `pylock.toml` or `pyproject.toml`",
        args: {
          name: "group",
        },
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: "--require-hashes",
        description: "Require a matching hash for each requirement",
      },
      {
        name: "--no-verify-hashes",
        description: "Disable validation of hashes in the requirements file",
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--system",
        description: "Install packages into the system Python environment",
      },
      {
        name: "--break-system-packages",
        description:
          "Allow uv to modify an `EXTERNALLY-MANAGED` Python installation",
      },
      {
        name: "--no-break-system-packages",
      },
      {
        name: ["-t", "--target"],
        description:
          "Install packages into the specified directory, rather than into the virtual or system Python environment. The packages will be installed at the top-level of the directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description:
          "Install packages into `lib`, `bin`, and other top-level folders under the specified directory, as if a virtual environment were present at that location",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--no-build",
        description: "Don't build source distributions",
      },
      {
        name: "--no-binary",
        description: "Don't install pre-built wheels",
        args: {
          name: "no_binary",
        },
      },
      {
        name: "--only-binary",
        description:
          "Only use pre-built wheels; don't build source distributions",
        args: {
          name: "only_binary",
        },
      },
      {
        name: "--allow-empty-requirements",
        description:
          "Allow sync of empty requirements, which will clear the environment of all packages",
      },
      {
        name: "--no-allow-empty-requirements",
      },
      {
        name: "--python-version",
        description:
          "The minimum Python version that should be supported by the requirements (e.g., `3.7` or `3.7.9`)",
        args: {
          name: "python_version",
        },
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--strict",
        description:
          "Validate the Python environment after completing the installation, to detect packages with missing dependencies or other issues",
      },
      {
        name: "--dry-run",
        description:
          "Perform a dry run, i.e., don't actually install anything but resolve the dependencies and print the resulting plan",
      },
      {
        name: "--check",
        description:
          "Check whether the environment matches the requirements without modifying it",
      },
      {
        name: "--output-format",
        description: "Select the output format",
        args: {
          name: "output_format",
          suggestions: ["text", "json"],
        },
      },
      {
        name: "--torch-backend",
        description:
          "The backend to use when fetching packages in the PyTorch ecosystem (e.g., `cpu`, `cu126`, or `auto`)",
        args: {
          name: "torch_backend",
          suggestions: [
            "auto",
            "cpu",
            "cu132",
            "cu130",
            "cu129",
            "cu128",
            "cu126",
            "cu125",
            "cu124",
            "cu123",
            "cu122",
            "cu121",
            "cu120",
            "cu118",
            "cu117",
            "cu116",
            "cu115",
            "cu114",
            "cu113",
            "cu112",
            "cu111",
            "cu110",
            "cu102",
            "cu101",
            "cu100",
            "cu92",
            "cu91",
            "cu90",
            "cu80",
            "rocm7.2",
            "rocm7.1",
            "rocm7.0",
            "rocm6.4",
            "rocm6.3",
            "rocm6.2.4",
            "rocm6.2",
            "rocm6.1",
            "rocm6.0",
            "rocm5.7",
            "rocm5.6",
            "rocm5.5",
            "rocm5.4.2",
            "rocm5.4",
            "rocm5.3",
            "rocm5.2",
            "rocm5.1.1",
            "rocm4.2",
            "rocm4.1",
            "rocm4.0.1",
            "xpu",
          ],
        },
      },
      {
        name: ["-C", "--config-setting"],
        description:
          "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
        args: {
          name: "config_setting",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--no-build-isolation",
        description: "Disable isolation when building source distributions",
      },
      {
        name: "--exclude-newer",
        description:
          "Limit candidate packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer",
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources",
        description:
          "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any workspace, Git, URL, or local path sources",
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter into which packages should be installed.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "install",
    description: "Install packages into an environment",
    args: {
      name: "PACKAGES",
      description: "Packages to install",
      isVariadic: true,
    },

    options: [
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      {
        name: ["-r", "--requirements"],
        description: "Install the packages listed in the given files",
        args: {
          name: "requirements",
        },
      },
      {
        name: ["-e", "--editable"],
        description:
          "Install the editable package based on the provided local file path",
        args: {
          name: "editable",
        },
      },
      {
        name: "--no-editable",
        description: "Install any editable dependencies as non-editable",
      },
      {
        name: "--no-editable-package",
        description: "Install the specified editable packages as non-editable",
        args: {
          name: "no_editable_package",
        },
      },
      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: "--overrides",
        description: "Override versions using the given requirements files",
        args: {
          name: "overrides",
        },
      },
      {
        name: "--excludes",
        description:
          "Exclude packages from resolution using the given requirements files",
        args: {
          name: "excludes",
        },
      },
      {
        name: ["-b", "--build-constraints"],
        description:
          "Constrain build dependencies using the given requirements files when building source distributions",
        args: {
          name: "build_constraints",
        },
      },
      {
        name: "--extra",
        description:
          "Include optional dependencies from the specified extra name; may be provided more than once",
        args: {
          name: "extra",
        },
      },
      {
        name: "--all-extras",
        description: "Include all optional dependencies",
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: "--group",
        description:
          "Install the specified dependency group from a `pylock.toml` or `pyproject.toml`",
        args: {
          name: "group",
        },
      },
      {
        name: "--no-deps",
        description:
          "Ignore package dependencies, instead only installing those packages explicitly listed on the command line or in the requirements files",
      },
      {
        name: "--require-hashes",
        description: "Require a matching hash for each requirement",
      },
      {
        name: "--no-verify-hashes",
        description: "Disable validation of hashes in the requirements file",
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--system",
        description: "Install packages into the system Python environment",
      },
      {
        name: "--break-system-packages",
        description:
          "Allow uv to modify an `EXTERNALLY-MANAGED` Python installation",
      },
      {
        name: "--no-break-system-packages",
      },
      {
        name: ["-t", "--target"],
        description:
          "Install packages into the specified directory, rather than into the virtual or system Python environment. The packages will be installed at the top-level of the directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description:
          "Install packages into `lib`, `bin`, and other top-level folders under the specified directory, as if a virtual environment were present at that location",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--no-build",
        description: "Don't build source distributions",
      },
      {
        name: "--no-binary",
        description: "Don't install pre-built wheels",
        args: {
          name: "no_binary",
        },
      },
      {
        name: "--only-binary",
        description:
          "Only use pre-built wheels; don't build source distributions",
        args: {
          name: "only_binary",
        },
      },
      {
        name: "--python-version",
        description:
          "The minimum Python version that should be supported by the requirements (e.g., `3.7` or `3.7.9`)",
        args: {
          name: "python_version",
        },
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--exact",
        description: "Perform an exact sync, removing extraneous packages",
      },
      {
        name: "--strict",
        description:
          "Validate the Python environment after completing the installation, to detect packages with missing dependencies or other issues",
      },
      {
        name: "--dry-run",
        description:
          "Perform a dry run, i.e., don't actually install anything but resolve the dependencies and print the resulting plan",
      },
      {
        name: "--check",
        description:
          "Check whether the environment satisfies the requirements without modifying it",
      },
      {
        name: "--output-format",
        description: "Select the output format",
        args: {
          name: "output_format",
          suggestions: ["text", "json"],
        },
      },
      {
        name: "--torch-backend",
        description:
          "The backend to use when fetching packages in the PyTorch ecosystem (e.g., `cpu`, `cu126`, or `auto`)",
        args: {
          name: "torch_backend",
          suggestions: [
            "auto",
            "cpu",
            "cu132",
            "cu130",
            "cu129",
            "cu128",
            "cu126",
            "cu125",
            "cu124",
            "cu123",
            "cu122",
            "cu121",
            "cu120",
            "cu118",
            "cu117",
            "cu116",
            "cu115",
            "cu114",
            "cu113",
            "cu112",
            "cu111",
            "cu110",
            "cu102",
            "cu101",
            "cu100",
            "cu92",
            "cu91",
            "cu90",
            "cu80",
            "rocm7.2",
            "rocm7.1",
            "rocm7.0",
            "rocm6.4",
            "rocm6.3",
            "rocm6.2.4",
            "rocm6.2",
            "rocm6.1",
            "rocm6.0",
            "rocm5.7",
            "rocm5.6",
            "rocm5.5",
            "rocm5.4.2",
            "rocm5.4",
            "rocm5.3",
            "rocm5.2",
            "rocm5.1.1",
            "rocm4.2",
            "rocm4.1",
            "rocm4.0.1",
            "xpu",
          ],
        },
      },
      {
        name: "--user",
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: ["-C", "--config-setting"],
        description:
          "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
        args: {
          name: "config_setting",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--no-build-isolation",
        description: "Disable isolation when building source distributions",
      },
      {
        name: "--no-build-isolation-package",
        description:
          "Disable isolation when building source distributions for a specific package",
        args: {
          name: "no_build_isolation_package",
        },
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter into which packages should be installed.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "uninstall",
    description: "Uninstall packages from an environment",
    args: {
      name: "PACKAGES",
      description: "Packages to uninstall",
      isVariadic: true,
    },

    options: [
      {
        name: ["-r", "--requirements"],
        description: "Uninstall the packages listed in the given files",
        args: {
          name: "requirements",
        },
      },
      {
        name: "--keyring-provider",
        description:
          "Attempt to use `keyring` for authentication for remote requirements files",
        args: {
          name: "keyring_provider",
          suggestions: ["disabled", "subprocess"],
        },
      },
      {
        name: "--system",
        description: "Use the system Python to uninstall packages",
      },
      {
        name: "--break-system-packages",
        description:
          "Allow uv to modify an `EXTERNALLY-MANAGED` Python installation",
      },
      {
        name: "--no-break-system-packages",
      },
      {
        name: ["-t", "--target"],
        description:
          "Uninstall packages from the specified `--target` directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description:
          "Uninstall packages from the specified `--prefix` directory",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--dry-run",
        description:
          "Perform a dry run, i.e., don't actually uninstall anything but print the resulting plan",
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter from which packages should be uninstalled.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "freeze",
    description:
      "List, in requirements format, packages installed in an environment",

    options: [
      {
        name: "--exclude-editable",
        description: "Exclude any editable packages from output",
      },
      {
        name: "--exclude",
        description: "Exclude the specified package(s) from the output",
        args: {
          name: "exclude",
        },
      },
      {
        name: "--strict",
        description:
          "Validate the Python environment, to detect packages with missing dependencies and other issues",
      },
      {
        name: "--path",
        description:
          "Restrict to the specified installation path for listing packages (can be used multiple times)",
        args: {
          name: "paths",
        },
      },
      {
        name: "--system",
        description: "List packages in the system Python environment",
      },
      {
        name: ["-t", "--target"],
        description: "List packages from the specified `--target` directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description: "List packages from the specified `--prefix` directory",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter for which packages should be listed.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "list",
    description:
      "List, in tabular format, packages installed in an environment",

    options: [
      ...indexOptions,
      {
        name: ["-e", "--editable"],
        description: "Only include editable projects",
      },
      {
        name: "--exclude-editable",
        description: "Exclude any editable packages from output",
      },
      {
        name: "--exclude",
        description: "Exclude the specified package(s) from the output",
        args: {
          name: "exclude",
        },
      },
      {
        name: "--format",
        description: "Select the output format",
        args: {
          name: "format",
          suggestions: ["columns", "freeze", "json"],
        },
      },
      {
        name: "--outdated",
        description: "List outdated packages",
      },
      {
        name: "--strict",
        description:
          "Validate the Python environment, to detect packages with missing dependencies and other issues",
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: "--system",
        description: "List packages in the system Python environment",
      },
      {
        name: ["-t", "--target"],
        description: "List packages from the specified `--target` directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description: "List packages from the specified `--prefix` directory",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--exclude-newer",
        description:
          "Limit candidate packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer",
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter for which packages should be listed.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "show",
    description: "Show information about one or more installed packages",
    args: {
      name: "PACKAGES",
      description: "Packages to show",
      isVariadic: true,
    },

    options: [
      {
        name: "--strict",
        description:
          "Validate the Python environment, to detect packages with missing dependencies and other issues",
      },
      {
        name: ["-f", "--files"],
        description: "Show the full list of installed files for each package",
      },
      {
        name: "--system",
        description: "Show a package in the system Python environment",
      },
      {
        name: ["-t", "--target"],
        description: "Show a package from the specified `--target` directory",
        args: {
          name: "target",
        },
      },
      {
        name: "--prefix",
        description: "Show a package from the specified `--prefix` directory",
        args: {
          name: "prefix",
        },
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to find the package in.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "tree",
    description: "Display the dependency tree for an environment",

    options: [
      ...indexOptions,
      {
        name: "--show-version-specifiers",
        description: "Show the version constraint(s) imposed on each package",
      },
      {
        name: ["-d", "--depth"],
        description: "Maximum display depth of the dependency tree",
        args: {
          name: "depth",
        },
      },
      {
        name: "--prune",
        description:
          "Prune the given package from the display of the dependency tree",
        args: {
          name: "prune",
        },
      },
      {
        name: "--package",
        description: "Display only the specified packages",
        args: {
          name: "package",
        },
      },
      {
        name: "--no-dedupe",
        description:
          "Do not de-duplicate repeated dependencies. Usually, when a package has already displayed its dependencies, further occurrences will not re-display its dependencies, and will include a (*) to indicate it has already been shown. This flag will cause those duplicates to be repeated",
      },
      {
        name: "--invert",
        description:
          "Show the reverse dependencies for the given package. This flag will invert the tree and display the packages that depend on the given package",
      },
      {
        name: "--outdated",
        description:
          "Show the latest available version of each package in the tree",
      },
      {
        name: "--show-sizes",
        description: "Show compressed wheel sizes for packages in the tree",
      },
      {
        name: "--strict",
        description:
          "Validate the Python environment, to detect packages with missing dependencies and other issues",
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: "--system",
        description: "List packages in the system Python environment",
      },
      {
        name: "--exclude-newer",
        description:
          "Limit candidate packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer",
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter for which packages should be listed.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "check",
    description: "Verify installed packages have compatible dependencies",

    options: [
      {
        name: "--system",
        description: "Check packages in the system Python environment",
      },
      {
        name: "--python-version",
        description:
          "The Python version against which packages should be checked",
        args: {
          name: "python_version",
        },
      },
      {
        name: "--python-platform",
        description: "The platform for which packages should be checked",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter for which packages should be checked.",
        args: {
          name: "python",
        },
      },
    ],
  },
];

// venv
const venvOptions: Fig.Option[] = [
  {
    name: "--no-project",
    description: "Avoid discovering a project or workspace",
  },
  {
    name: "--seed",
    description:
      "Install seed packages (one or more of: `pip`, `setuptools`, and `wheel`) into the virtual environment",
  },
  {
    name: "--allow-existing",
    description:
      "Preserve any existing files or directories at the target path",
  },
  {
    name: "--prompt",
    description:
      "Provide an alternative prompt prefix for the virtual environment",
    args: {
      name: "PROMPT",
    },
  },
  {
    name: "--system-site-packages",
    description:
      "Give the virtual environment access to the system site packages directory",
  },
  {
    name: "--relocatable",
    description: "Make the virtual environment relocatable",
  },
  {
    name: "--index-strategy",
    description:
      "The strategy to use when resolving against multiple index URLs",
    args: {
      name: "INDEX_STRATEGY",
      suggestions: ["first-index", "unsafe-first-match", "unsafe-best-match"],
    },
  },
  {
    name: "--keyring-provider",
    description: "Attempt to use `keyring` for authentication for index URLs",
    args: {
      name: "KEYRING_PROVIDER",
      suggestions: ["disabled", "subprocess"],
    },
  },
  {
    name: "--exclude-newer",
    description:
      "Limit candidate packages to those that were uploaded prior to the given date",
    args: {
      name: "EXCLUDE_NEWER",
    },
  },
  {
    name: "--link-mode",
    description:
      "The method to use when installing packages from the global cache",
    args: {
      name: "LINK_MODE",
      suggestions: ["clone", "copy", "hardlink", "symlink"],
    },
  },
];

// build
const buildCommandOptions: Fig.Option[] = [
  {
    name: "--package",
    description: "Build a specific package in the workspace",
    args: {
      name: "PACKAGE",
    },
  },
  {
    name: "--all-packages",
    description: "Build all packages in the workspace",
  },
  {
    name: "-o",
    description:
      "The output directory to which distributions should be written",
    args: {
      name: "OUT_DIR",
    },
  },
  {
    name: "--sdist",
    description:
      "Build a source distribution ('sdist') from the given directory",
  },
  {
    name: "--wheel",
    description:
      "Build a binary distribution ('wheel') from the given directory",
  },
  {
    name: "--no-build-logs",
    description: "Hide logs from the build backend",
  },
  {
    name: "--force-pep517",
    description:
      "Always build through PEP 517, don't use the fast path for the uv build backend",
  },
  {
    name: "-b",
    description:
      "Constrain build dependencies using the given requirements files when building distributions",
    args: {
      name: "BUILD_CONSTRAINTS",
    },
  },
  {
    name: "--require-hashes",
    description: "Require a matching hash for each requirement",
  },
  {
    name: "--no-verify-hashes",
    description: "Disable validation of hashes in the requirements file",
  },
];

// publish
const publishOptions: Fig.Option[] = [
  {
    name: "--publish-url",
    description: "The URL of the upload endpoint (not the index URL)",
    args: {
      name: "PUBLISH_URL",
    },
  },
  {
    name: "-u",
    description: "The username for the upload",
    args: {
      name: "USERNAME",
    },
  },
  {
    name: "-p",
    description: "The password for the upload",
    args: {
      name: "PASSWORD",
    },
  },
  {
    name: "-t",
    description: "The token for the upload",
    args: {
      name: "TOKEN",
    },
  },
  {
    name: "--trusted-publishing",
    description: "Configure using trusted publishing through GitHub Actions",
    args: {
      name: "TRUSTED_PUBLISHING",
      suggestions: ["automatic", "always", "never"],
    },
  },
  {
    name: "--keyring-provider",
    description:
      "Attempt to use `keyring` for authentication for remote requirements files",
    args: {
      name: "KEYRING_PROVIDER",
      suggestions: ["disabled", "subprocess"],
    },
  },
  {
    name: "--check-url",
    description:
      "Check an index URL for existing files to skip duplicate uploads",
    args: {
      name: "CHECK_URL",
    },
  },
];

// cache
const cacheSubcommands: Fig.Subcommand[] = [
  {
    name: "clean",
    description: "Clear the cache",
    args: {
      name: "PACKAGE",
      description: "The package to remove from the cache",
      isVariadic: true,
    },

    options: [
      {
        name: "--force",
        description: "Force removal of the cache, ignoring in-use checks",
      },
    ],
  },
  {
    name: "prune",
    description: "Prune all unreachable objects from the cache",

    options: [
      {
        name: "--ci",
        description:
          "Optimize the cache for persistence in a continuous integration environment, like GitHub Actions",
      },
      {
        name: "--force",
        description: "Force removal of the cache, ignoring in-use checks",
      },
    ],
  },
  {
    name: "dir",
    description: "Show the cache directory",
  },
];

// self
const selfSubcommands: Fig.Subcommand[] = [
  {
    name: "update",
    description: "Update uv",
    args: {
      name: "TARGET_VERSION",
      description:
        "Update to the specified version. If not provided, uv will update to the latest version",
    },
    options: [
      {
        name: "--token",
        description:
          "A GitHub token for authentication. A token is not required but can be used to reduce the chance of encountering rate limits [env:UV_GITHUB_TOKEN=]",
      },

      {
        name: "--dry-run",
        description: "Run without performing the update",
      },
    ],
  },
];

const subcommands: Fig.Subcommand[] = [
  {
    name: "run",
    description: "Run a command or script",
    options: [
      ...runOptions,
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      {
        name: "--no-default-groups",
        description: "Ignore the default dependency groups",
      },
      {
        name: "--no-editable-package",
        description: "Install the specified editable packages as non-editable",
        args: {
          name: "no_editable_package",
        },
      },
      {
        name: "--exact",
        description: "Perform an exact sync, removing extraneous packages",
      },
      {
        name: "--active",
        description:
          "Prefer the active virtual environment over the project's virtual environment",
      },
      {
        name: "--gui-script",
        description: "Run the given path as a Python GUI script",
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use for the run environment.",
        args: {
          name: "python",
        },
      },
    ],
    args: {
      name: "command",
      generators: commandGenerator,
    },
  },
  {
    name: "init",
    description: "Create a new project",
    options: [
      ...initOptions,
      ...initCacheOptions,
      {
        name: "--bare",
        description: "Only create a `pyproject.toml`",
      },
      {
        name: "--description",
        description: "Set the project description",
        args: {
          name: "description",
        },
      },
      {
        name: "--no-description",
        description: "Disable the description for the project",
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter to use to determine the minimum supported Python version.",
        args: {
          name: "python",
        },
      },
    ],
    args: {
      name: "Path",
      template: "filepaths",
      description: "The path to use for the project/script",
      default: ".",
    },
  },
  {
    name: "add",
    description: "Add dependencies to the project",
    args: {
      name: "packages",
      description: "Packages to add",
      isVariadic: true,
    },
    options: [
      ...addOptions,
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      ...cacheOptions,

      {
        name: ["-c", "--constraints"],
        description: "Constrain versions using the given requirements files",
        args: {
          name: "constraints",
        },
      },
      {
        name: ["-m", "--marker"],
        description: "Apply this marker to all added packages",
        args: {
          name: "marker",
        },
      },
      {
        name: "--raw",
        description: "Add a dependency as provided",
      },
      {
        name: "--bounds",
        description:
          "The kind of version specifier to use when adding dependencies",
        args: {
          name: "bounds",
          suggestions: ["lower", "major", "minor", "exact"],
        },
      },
      {
        name: "--lfs",
        description: "Whether to use Git LFS when adding a dependency from Git",
      },
      {
        name: "--active",
        description:
          "Prefer the active virtual environment over the project's virtual environment",
      },
      {
        name: "--workspace",
        description: "Add the dependency as a workspace member",
      },
      {
        name: "--no-workspace",
        description: "Don't add the dependency as a workspace member",
      },
      {
        name: "--no-install-project",
        description: "Do not install the current project",
      },
      {
        name: "--no-install-workspace",
        description:
          "Do not install any workspace members, including the current project",
      },
      {
        name: "--no-install-local",
        description: "Do not install local path dependencies",
      },
      {
        name: "--no-install-package",
        description: "Do not install the given package(s)",
        args: {
          name: "no_install_package",
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use for resolving and syncing.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "remove",
    description: "Remove dependencies from the project",
    args: {
      name: "dependencies",
      description: "Dependencies to remove",
      generators: dependenciesGenerator,
      isVariadic: true,
    },
    options: [
      ...removeOptions,
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      ...cacheOptions,

      {
        name: "--active",
        description:
          "Prefer the active virtual environment over the project's virtual environment",
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use for resolving and syncing.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "sync",
    description: "Update the project's environment",
    options: [
      ...syncOptions,
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      ...cacheOptions,

      {
        name: "--output-format",
        description: "Select the output format",
        args: {
          name: "output_format",
          suggestions: ["text", "json"],
        },
      },
      {
        name: "--no-default-groups",
        description: "Ignore the default dependency groups",
      },
      {
        name: "--no-editable-package",
        description: "Install the specified editable packages as non-editable",
        args: {
          name: "no_editable_package",
        },
      },
      {
        name: "--active",
        description: "Sync dependencies to the active virtual environment",
      },
      {
        name: "--no-install-local",
        description: "Do not install local path dependencies",
      },
      {
        name: "--dry-run",
        description:
          "Perform a dry run, without writing the lockfile or modifying the project environment",
      },
      {
        name: "--script",
        description:
          "Sync the environment for a Python script, rather than the current project",
        args: {
          name: "script",
        },
      },
      {
        name: "--python-platform",
        description: "The platform for which requirements should be installed",
        args: {
          name: "python_platform",
          suggestions: [
            "windows",
            "linux",
            "macos",
            "x86_64-pc-windows-msvc",
            "aarch64-pc-windows-msvc",
            "i686-pc-windows-msvc",
            "x86_64-unknown-linux-gnu",
            "aarch64-apple-darwin",
            "x86_64-apple-darwin",
            "aarch64-unknown-linux-gnu",
            "aarch64-unknown-linux-musl",
            "x86_64-unknown-linux-musl",
            "riscv64-unknown-linux",
            "x86_64-manylinux2014",
            "x86_64-manylinux_2_17",
            "x86_64-manylinux_2_28",
            "x86_64-manylinux_2_31",
            "x86_64-manylinux_2_32",
            "x86_64-manylinux_2_33",
            "x86_64-manylinux_2_34",
            "x86_64-manylinux_2_35",
            "x86_64-manylinux_2_36",
            "x86_64-manylinux_2_37",
            "x86_64-manylinux_2_38",
            "x86_64-manylinux_2_39",
            "x86_64-manylinux_2_40",
            "aarch64-manylinux2014",
            "aarch64-manylinux_2_17",
            "aarch64-manylinux_2_28",
            "aarch64-manylinux_2_31",
            "aarch64-manylinux_2_32",
            "aarch64-manylinux_2_33",
            "aarch64-manylinux_2_34",
            "aarch64-manylinux_2_35",
            "aarch64-manylinux_2_36",
            "aarch64-manylinux_2_37",
            "aarch64-manylinux_2_38",
            "aarch64-manylinux_2_39",
            "aarch64-manylinux_2_40",
            "aarch64-linux-android",
            "x86_64-linux-android",
            "wasm32-pyodide2024",
            "wasm32-pyodide2025",
            "arm64-apple-ios",
            "arm64-apple-ios-simulator",
            "x86_64-apple-ios-simulator",
          ],
        },
      },
      {
        name: "--check",
        description:
          "Check if the Python environment is synchronized with the project",
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: ["-p", "--python"],
        description:
          "The Python interpreter to use for the project environment.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "lock",
    description: "Update the project's lockfile",
    options: [
      ...lockOptions,
      ...indexOptions,
      ...resolverOptions,
      ...buildOptions,
      ...lockInstallerOptions,
      ...cacheOptions,

      {
        name: "--check",
        description: "Check if the lockfile is up-to-date",
      },
      {
        name: "--check-exists",
        description:
          "Assert that a `uv.lock` exists without checking if it is up-to-date",
      },
      {
        name: "--script",
        description:
          "Lock the specified Python script, rather than the current project",
        args: {
          name: "script",
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use during resolution.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "export",
    description: "Export the project's lockfile to an alternate format",
    options: [
      ...exportOptions,
      ...indexOptions,
      ...resolverOptions,
      ...buildOptions,

      ...lockInstallerOptions,
      {
        name: "--no-default-groups",
        description: "Ignore the default dependency groups",
      },
      {
        name: "--no-annotate",
        description:
          "Exclude comment annotations indicating the source of each package",
      },
      {
        name: "--emit-index-url",
        description:
          "Include `--index-url` and `--extra-index-url` entries in the generated output file",
      },
      {
        name: "--emit-find-links",
        description:
          "Include `--find-links` entries in the generated output file",
      },
      {
        name: "--no-editable-package",
        description: "Export the specified editable packages as non-editable",
        args: {
          name: "no_editable_package",
        },
      },
      {
        name: "--no-emit-local",
        description:
          "Do not include local path dependencies in the exported requirements",
      },
      {
        name: "--script",
        description:
          "Export the dependencies for the specified PEP 723 Python script, rather than the current project",
        args: {
          name: "script",
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use during resolution.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "tree",
    description: "Display the project's dependency tree",
    options: [
      ...treeOptions,
      ...indexOptions,
      ...resolverOptions,
      ...installerOptions.filter((option) => option.name === "--link-mode"),
      ...pythonOptions,
      ...cacheOptions,
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),

      ...buildOptions,
      {
        name: "--format",
        description: "The format in which to display the dependency graph",
        args: {
          name: "format",
          suggestions: ["text", "json"],
        },
      },
      {
        name: "--show-sizes",
        description: "Show compressed wheel sizes for packages in the tree",
      },
      {
        name: "--no-default-groups",
        description: "Ignore the default dependency groups",
      },
      {
        name: "--script",
        description:
          "Show the dependency tree the specified PEP 723 Python script, rather than the current project",
        args: {
          name: "script",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
    ],
  },
  {
    name: "tool",
    description: "Run and install commands provided by Python packages",
    subcommands: [
      ...toolSubcommands,
      {
        name: "audit",
        description: "Audit installed tools and their dependencies",
        options: [
          {
            name: "--all",
            description: "Audit all installed tools",
          },
          {
            name: "--output-format",
            description: "Select the output format",
            args: {
              name: "output_format",
              suggestions: ["text", "json", "sarif"],
            },
          },
          {
            name: "--ignore",
            description: "Ignore a vulnerability by ID",
            args: {
              name: "ignore",
            },
          },
          {
            name: "--ignore-until-fixed",
            description:
              "Ignore a vulnerability by ID, but only while no fix is available",
            args: {
              name: "ignore_until_fixed",
            },
          },
          {
            name: "--service-format",
            description: "The service format to use for vulnerability lookups",
            args: {
              name: "service_format",
              suggestions: ["osv"],
            },
          },
          {
            name: "--service-url",
            description: "The URL to vulnerability service API endpoint",
            args: {
              name: "service_url",
            },
          },
          {
            name: ["-n", "--no-cache"],
            description:
              "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
          },
          {
            name: "--cache-dir",
            description: "Path to the cache directory",
            args: {
              name: "cache_dir",
            },
          },
          {
            name: "--managed-python",
            description: "Require use of uv-managed Python versions",
          },
          {
            name: "--no-managed-python",
            description: "Disable use of uv-managed Python versions",
          },
          {
            name: "--no-python-downloads",
            description: "Disable automatic downloads of Python.",
          },
          {
            name: ["-q", "--quiet"],
            description: "Use quiet output",
          },
          {
            name: ["-v", "--verbose"],
            description: "Use verbose output",
          },
          {
            name: "--color",
            description: "Control the use of color in output",
            args: {
              name: "color_choice",
              suggestions: ["auto", "always", "never"],
            },
          },
          {
            name: "--system-certs",
            description:
              "Whether to load TLS certificates from the platform's native certificate store",
          },
          {
            name: "--allow-insecure-host",
            description: "Allow insecure connections to a host",
            args: {
              name: "allow_insecure_host",
            },
          },
          {
            name: "--no-progress",
            description: "Hide all progress outputs",
          },
          {
            name: "--directory",
            description:
              "Change to the given directory prior to running the command",
            args: {
              name: "directory",
            },
          },
          {
            name: "--project",
            description: "Discover a project in the given directory",
            args: {
              name: "project",
            },
          },
          {
            name: "--config-file",
            description:
              "The path to a `uv.toml` file to use for configuration",
            args: {
              name: "config_file",
            },
          },
          {
            name: "--no-config",
            description:
              "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
          },
        ],
      },
    ],
    options: [
      ...pythonOptions.filter(
        (option) =>
          option.name === "--no-python-downloads" ||
          option.name === "--python-preference",
      ),
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
    ],
  },
  {
    name: "python",
    description: "Manage Python versions and installations",
    subcommands: [
      ...pythonSubcommands,
      {
        name: "upgrade",
        description: "Upgrade installed Python versions",
        options: [
          {
            name: ["-i", "--install-dir"],
            description: "The directory Python installations are stored in",
            args: {
              name: "install_dir",
            },
          },
          {
            name: "--mirror",
            description:
              "Set the URL to use as the source for downloading Python installations",
            args: {
              name: "mirror",
            },
          },
          {
            name: "--pypy-mirror",
            description:
              "Set the URL to use as the source for downloading PyPy installations",
            args: {
              name: "pypy_mirror",
            },
          },
          {
            name: "--graalpy-mirror",
            description:
              "Set the URL to use as the source for downloading GraalPy installations",
            args: {
              name: "graalpy_mirror",
            },
          },
          {
            name: "--pyodide-mirror",
            description:
              "Set the URL to use as the source for downloading Pyodide installations",
            args: {
              name: "pyodide_mirror",
            },
          },
          {
            name: ["-r", "--reinstall"],
            description:
              "Reinstall the latest Python patch, if it's already installed",
          },
          {
            name: "--python-downloads-json-url",
            description: "URL pointing to JSON of custom Python installations",
            args: {
              name: "python_downloads_json_url",
            },
          },
          {
            name: "--compile-bytecode",
            description:
              "Compile Python's standard library to bytecode after installation",
          },
          {
            name: ["-n", "--no-cache"],
            description:
              "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
          },
          {
            name: "--cache-dir",
            description: "Path to the cache directory",
            args: {
              name: "cache_dir",
            },
          },
          {
            name: "--managed-python",
            description: "Require use of uv-managed Python versions",
          },
          {
            name: "--no-managed-python",
            description: "Disable use of uv-managed Python versions",
          },
          {
            name: "--no-python-downloads",
            description: "Disable automatic downloads of Python.",
          },
          {
            name: ["-q", "--quiet"],
            description: "Use quiet output",
          },
          {
            name: ["-v", "--verbose"],
            description: "Use verbose output",
          },
          {
            name: "--color",
            description: "Control the use of color in output",
            args: {
              name: "color_choice",
              suggestions: ["auto", "always", "never"],
            },
          },
          {
            name: "--system-certs",
            description:
              "Whether to load TLS certificates from the platform's native certificate store",
          },
          {
            name: "--offline",
            description: "Disable network access",
          },
          {
            name: "--allow-insecure-host",
            description: "Allow insecure connections to a host",
            args: {
              name: "allow_insecure_host",
            },
          },
          {
            name: "--no-progress",
            description: "Hide all progress outputs",
          },
          {
            name: "--directory",
            description:
              "Change to the given directory prior to running the command",
            args: {
              name: "directory",
            },
          },
          {
            name: "--project",
            description: "Discover a project in the given directory",
            args: {
              name: "project",
            },
          },
          {
            name: "--config-file",
            description:
              "The path to a `uv.toml` file to use for configuration",
            args: {
              name: "config_file",
            },
          },
          {
            name: "--no-config",
            description:
              "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
          },
        ],
      },
      {
        name: "update-shell",
        description:
          "Ensure that the Python executable directory is on the `PATH`",
        options: [
          {
            name: ["-n", "--no-cache"],
            description:
              "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
          },
          {
            name: "--cache-dir",
            description: "Path to the cache directory",
            args: {
              name: "cache_dir",
            },
          },
          {
            name: "--managed-python",
            description: "Require use of uv-managed Python versions",
          },
          {
            name: "--no-managed-python",
            description: "Disable use of uv-managed Python versions",
          },
          {
            name: "--no-python-downloads",
            description: "Disable automatic downloads of Python.",
          },
          {
            name: ["-q", "--quiet"],
            description: "Use quiet output",
          },
          {
            name: ["-v", "--verbose"],
            description: "Use verbose output",
          },
          {
            name: "--color",
            description: "Control the use of color in output",
            args: {
              name: "color_choice",
              suggestions: ["auto", "always", "never"],
            },
          },
          {
            name: "--system-certs",
            description:
              "Whether to load TLS certificates from the platform's native certificate store",
          },
          {
            name: "--offline",
            description: "Disable network access",
          },
          {
            name: "--allow-insecure-host",
            description: "Allow insecure connections to a host",
            args: {
              name: "allow_insecure_host",
            },
          },
          {
            name: "--no-progress",
            description: "Hide all progress outputs",
          },
          {
            name: "--directory",
            description:
              "Change to the given directory prior to running the command",
            args: {
              name: "directory",
            },
          },
          {
            name: "--project",
            description: "Discover a project in the given directory",
            args: {
              name: "project",
            },
          },
          {
            name: "--config-file",
            description:
              "The path to a `uv.toml` file to use for configuration",
            args: {
              name: "config_file",
            },
          },
          {
            name: "--no-config",
            description:
              "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
          },
        ],
      },
    ],
    options: [
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),
    ],
  },
  {
    name: "pip",
    description: "Manage Python packages with a pip-compatible interface",
    subcommands: pipSubcommands,
    options: [
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),

      {
        name: "--cert",
        description: "Path to a PEM-encoded CA certificate bundle",
        args: {
          name: "file",
        },
      },
    ],
  },
  {
    name: "venv",
    description: "Create a virtual environment",
    options: [
      ...pythonOptions,
      ...venvOptions,
      ...indexOptions.filter(
        (option) =>
          option.name !== "--index-strategy" &&
          option.name !== "--keyring-provider",
      ),
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),

      {
        name: ["-c", "--clear"],
        description:
          "Remove any existing files or directories at the target path",
      },
      {
        name: "--force",
        description:
          "Allow `--clear` to remove a non-virtual environment directory",
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
    ],
  },
  {
    name: "build",
    description: "Build Python packages into source distributions and wheels",
    args: {
      name: "SOURCE",
      description:
        "The directory from which distributions should be built, or a source distribution archive to build into a wheel",
    },
    options: [
      ...buildCommandOptions,
      ...pythonOptions,
      ...indexOptions,
      ...resolverOptions,
      ...buildOptions,
      ...installerOptions.filter((option) => option.name === "--link-mode"),
      ...cacheOptions,

      {
        name: "--clear",
        description:
          "Clear the output directory before the build, removing stale artifacts",
      },
      {
        name: "--no-create-gitignore",
        description:
          "Do not create a `.gitignore` file in the output directory",
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
    ],
  },
  {
    name: "publish",
    description: "Upload distributions to an index",
    args: {
      name: "FILES",
      description: "Paths to the files to upload, [default: dist/*]",
      isVariadic: true,
    },
    options: [
      ...publishOptions,
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),

      {
        name: "--index",
        description:
          "The name of an index in the configuration to use for publishing.",
        args: {
          name: "index",
        },
      },
      {
        name: "--dry-run",
        description: "Perform a dry run without uploading files",
      },
      {
        name: "--no-attestations",
        description: "Do not upload attestations for the published files",
      },
    ],
  },
  {
    name: "cache",
    description: "Manage uv's cache",
    subcommands: [
      ...cacheSubcommands,
      {
        name: "size",
        description: "Show the cache size",
        options: [
          {
            name: "--output-format",
            description: "Select the output format",
            args: {
              name: "output_format",
              suggestions: ["auto", "human", "machine"],
            },
          },
          {
            name: ["-H", "--human"],
            description:
              "Display the cache size in human-readable format (e.g., `1.2GiB` instead of raw bytes)",
          },
          {
            name: ["-n", "--no-cache"],
            description:
              "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
          },
          {
            name: "--cache-dir",
            description: "Path to the cache directory",
            args: {
              name: "cache_dir",
            },
          },
          {
            name: "--managed-python",
            description: "Require use of uv-managed Python versions",
          },
          {
            name: "--no-managed-python",
            description: "Disable use of uv-managed Python versions",
          },
          {
            name: "--no-python-downloads",
            description: "Disable automatic downloads of Python.",
          },
          {
            name: ["-q", "--quiet"],
            description: "Use quiet output",
          },
          {
            name: ["-v", "--verbose"],
            description: "Use verbose output",
          },
          {
            name: "--color",
            description: "Control the use of color in output",
            args: {
              name: "color_choice",
              suggestions: ["auto", "always", "never"],
            },
          },
          {
            name: "--system-certs",
            description:
              "Whether to load TLS certificates from the platform's native certificate store",
          },
          {
            name: "--offline",
            description: "Disable network access",
          },
          {
            name: "--allow-insecure-host",
            description: "Allow insecure connections to a host",
            args: {
              name: "allow_insecure_host",
            },
          },
          {
            name: "--no-progress",
            description: "Hide all progress outputs",
          },
          {
            name: "--directory",
            description:
              "Change to the given directory prior to running the command",
            args: {
              name: "directory",
            },
          },
          {
            name: "--project",
            description: "Discover a project in the given directory",
            args: {
              name: "project",
            },
          },
          {
            name: "--config-file",
            description:
              "The path to a `uv.toml` file to use for configuration",
            args: {
              name: "config_file",
            },
          },
          {
            name: "--no-config",
            description:
              "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
          },
        ],
      },
    ],
    options: [
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),
    ],
  },
  {
    name: "self",
    description: "Manage the uv executable",
    subcommands: [
      ...selfSubcommands,
      {
        name: "version",
        description: "Display uv's version",
        options: [
          {
            name: "--short",
            description: "Only print the version",
          },
          {
            name: "--output-format",
            args: {
              name: "output_format",
              suggestions: ["text", "json"],
            },
          },
          {
            name: ["-n", "--no-cache"],
            description:
              "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
          },
          {
            name: "--cache-dir",
            description: "Path to the cache directory",
            args: {
              name: "cache_dir",
            },
          },
          {
            name: "--managed-python",
            description: "Require use of uv-managed Python versions",
          },
          {
            name: "--no-managed-python",
            description: "Disable use of uv-managed Python versions",
          },
          {
            name: "--no-python-downloads",
            description: "Disable automatic downloads of Python.",
          },
          {
            name: ["-q", "--quiet"],
            description: "Use quiet output",
          },
          {
            name: ["-v", "--verbose"],
            description: "Use verbose output",
          },
          {
            name: "--color",
            description: "Control the use of color in output",
            args: {
              name: "color_choice",
              suggestions: ["auto", "always", "never"],
            },
          },
          {
            name: "--system-certs",
            description:
              "Whether to load TLS certificates from the platform's native certificate store",
          },
          {
            name: "--offline",
            description: "Disable network access",
          },
          {
            name: "--allow-insecure-host",
            description: "Allow insecure connections to a host",
            args: {
              name: "allow_insecure_host",
            },
          },
          {
            name: "--no-progress",
            description: "Hide all progress outputs",
          },
          {
            name: "--directory",
            description:
              "Change to the given directory prior to running the command",
            args: {
              name: "directory",
            },
          },
          {
            name: "--project",
            description: "Discover a project in the given directory",
            args: {
              name: "project",
            },
          },
          {
            name: "--config-file",
            description:
              "The path to a `uv.toml` file to use for configuration",
            args: {
              name: "config_file",
            },
          },
          {
            name: "--no-config",
            description:
              "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
          },
        ],
      },
    ],
    options: [
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),
    ],
  },
  {
    name: "version",
    description: "Display uv's version",
    options: [
      {
        name: "--output-format",
        description: "The output format to use",
        args: {
          name: "OUTPUT_FORMAT",
          suggestions: ["text", "json"],
        },
      },
      ...cacheOptions.filter(
        (option) =>
          option.name === "--cache-dir" || option.name === "--no-cache",
      ),
      ...pythonOptions.filter(
        (option) =>
          option.name === "--python-preference" ||
          option.name === "--no-python-downloads",
      ),

      ...indexOptions,
      ...resolverOptions,
      ...installerOptions,
      ...buildOptions,
      ...lockOptions,
      {
        name: "--bump",
        description: "Update the project version using the given semantics",
        args: {
          name: "bump=value",
          suggestions: [
            "major",
            "minor",
            "patch",
            "stable",
            "alpha",
            "beta",
            "rc",
            "post",
            "dev",
          ],
        },
      },
      {
        name: "--short",
        description: "Only show the version",
      },
      {
        name: "--no-sync",
        description:
          "Avoid syncing the virtual environment after re-locking the project",
      },
      {
        name: "--active",
        description:
          "Prefer the active virtual environment over the project's virtual environment",
      },
      {
        name: "--package",
        description:
          "Update the version of a specific package in the workspace",
        args: {
          name: "package",
        },
      },
      {
        name: "--upgrade-group",
        description:
          "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
        args: {
          name: "upgrade_group",
        },
      },
      {
        name: "--prerelease-package",
        description:
          "The strategy to use when considering pre-release versions for a specific package",
        args: {
          name: "prerelease_package",
        },
      },
      {
        name: "--fork-strategy",
        description:
          "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
        args: {
          name: "fork_strategy",
          suggestions: ["fewest", "requires-python"],
        },
      },
      {
        name: "--exclude-newer-package",
        description:
          "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
        args: {
          name: "exclude_newer_package",
        },
      },
      {
        name: "--no-sources-package",
        description:
          "Don't use sources from the `tool.uv.sources` table for the specified packages",
        args: {
          name: "no_sources_package",
        },
      },
      {
        name: "--config-settings-package",
        description:
          "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
        args: {
          name: "config_settings_package",
        },
      },
      {
        name: "--require-build-hashes",
        description: "Require hashes for all build dependencies",
      },
      {
        name: "--no-require-build-hashes",
        description: "Do not require hashes for every build dependency",
      },
      {
        name: "--refresh",
        description: "Refresh all cached data",
      },
      {
        name: "--refresh-package",
        description: "Refresh cached data for a specific package",
        args: {
          name: "refresh_package",
        },
      },
      {
        name: ["-p", "--python"],
        description: "The Python interpreter to use for resolving and syncing.",
        args: {
          name: "python",
        },
      },
    ],
  },
  {
    name: "help",
    description: "Display documentation for a command",
    options: [
      {
        name: "--no-pager",
        description: "Disable pager when printing help",
      },
    ],
  },
];

const globalOptions: Fig.Option[] = [
  {
    name: ["-q", "--quiet"],
    description: "Do not print any output",
    isPersistent: true,
  },
  {
    name: ["-v", "--verbose"],
    description: "Use verbose output",
    isPersistent: true,
  },
  {
    name: "--color",
    description: "Control colors in output",
    args: {
      name: "COLOR_CHOICE",
      suggestions: ["auto", "always", "never"],
    },
    isPersistent: true,
  },
  {
    name: "--native-tls",
    description:
      "Whether to load TLS certificates from the platform's native certificate store",
    args: {
      name: "BOOL",
    },
    isPersistent: true,
  },
  {
    name: "--offline",
    description: "Disable network access",
    isPersistent: true,
  },
  {
    name: "--allow-insecure-host",
    description: "Allow insecure connections to a host",
    args: {
      name: "ALLOW_INSECURE_HOST",
    },
    isPersistent: true,
  },
  {
    name: "--no-progress",
    description: "Hide all progress outputs",
    isPersistent: true,
  },
  {
    name: "--directory",
    description: "Change to the given directory prior to running the command",
    args: {
      name: "DIRECTORY",
    },
    isPersistent: true,
  },
  {
    name: "--project",
    description: "Run the command within the given project directory",
    args: {
      name: "PROJECT",
    },
    isPersistent: true,
  },
  {
    name: "--config-file",
    description: "The path to a `uv.toml` file to use for configuration",
    args: {
      name: "CONFIG_FILE",
    },
    isPersistent: true,
  },
  {
    name: "--no-config",
    description:
      "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
    isPersistent: true,
  },
  {
    name: ["-h", "--help"],
    description: "Display the concise help for this command",
    isPersistent: true,
  },
  {
    name: ["-V", "--version"],
    description: "Display the uv version",
    isPersistent: true,
  },
];

const completionSpec: Fig.Spec = {
  name: "uv",
  description: "An extremely fast Python package manager",
  subcommands: [
    ...subcommands,
    {
      name: "auth",
      description: "Manage authentication",
      subcommands: [
        {
          name: "login",
          description: "Login to a service",
          options: [
            {
              name: ["-u", "--username"],
              description: "The username to use for the service",
              args: {
                name: "username",
              },
            },
            {
              name: "--password",
              description: "The password to use for the service",
              args: {
                name: "password",
              },
            },
            {
              name: ["-t", "--token"],
              description: "The token to use for the service",
              args: {
                name: "token",
              },
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
        {
          name: "logout",
          description: "Logout of a service",
          options: [
            {
              name: ["-u", "--username"],
              description: "The username to logout",
              args: {
                name: "username",
              },
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
        {
          name: "token",
          description: "Show the authentication token for a service",
          options: [
            {
              name: ["-u", "--username"],
              description: "The username to lookup",
              args: {
                name: "username",
              },
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
        {
          name: "dir",
          description: "Show the path to the uv credentials directory",
          options: [
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-n", "--no-cache"],
          description:
            "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
        },
        {
          name: "--cache-dir",
          description: "Path to the cache directory",
          args: {
            name: "cache_dir",
          },
        },
        {
          name: "--managed-python",
          description: "Require use of uv-managed Python versions",
        },
        {
          name: "--no-managed-python",
          description: "Disable use of uv-managed Python versions",
        },
        {
          name: "--no-python-downloads",
          description: "Disable automatic downloads of Python.",
        },
        {
          name: ["-q", "--quiet"],
          description: "Use quiet output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Use verbose output",
        },
        {
          name: "--color",
          description: "Control the use of color in output",
          args: {
            name: "color_choice",
            suggestions: ["auto", "always", "never"],
          },
        },
        {
          name: "--system-certs",
          description:
            "Whether to load TLS certificates from the platform's native certificate store",
        },
        {
          name: "--offline",
          description: "Disable network access",
        },
        {
          name: "--allow-insecure-host",
          description: "Allow insecure connections to a host",
          args: {
            name: "allow_insecure_host",
          },
        },
        {
          name: "--no-progress",
          description: "Hide all progress outputs",
        },
        {
          name: "--directory",
          description:
            "Change to the given directory prior to running the command",
          args: {
            name: "directory",
          },
        },
        {
          name: "--project",
          description: "Discover a project in the given directory",
          args: {
            name: "project",
          },
        },
        {
          name: "--config-file",
          description: "The path to a `uv.toml` file to use for configuration",
          args: {
            name: "config_file",
          },
        },
        {
          name: "--no-config",
          description:
            "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
        },
      ],
    },
    {
      name: "format",
      description: "Format Python code in the project",
      options: [
        {
          name: "--check",
          description: "Check if files are formatted without applying changes",
        },
        {
          name: "--diff",
          description:
            "Show a diff of formatting changes without applying them",
        },
        {
          name: "--exclude-newer",
          description:
            "Limit candidate Ruff versions to those released prior to the given date",
          args: {
            name: "exclude_newer",
          },
        },
        {
          name: "--no-project",
          description: "Avoid discovering a project or workspace",
        },
        {
          name: ["-n", "--no-cache"],
          description:
            "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
        },
        {
          name: "--cache-dir",
          description: "Path to the cache directory",
          args: {
            name: "cache_dir",
          },
        },
        {
          name: "--managed-python",
          description: "Require use of uv-managed Python versions",
        },
        {
          name: "--no-managed-python",
          description: "Disable use of uv-managed Python versions",
        },
        {
          name: "--no-python-downloads",
          description: "Disable automatic downloads of Python.",
        },
        {
          name: ["-q", "--quiet"],
          description: "Use quiet output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Use verbose output",
        },
        {
          name: "--color",
          description: "Control the use of color in output",
          args: {
            name: "color_choice",
            suggestions: ["auto", "always", "never"],
          },
        },
        {
          name: "--system-certs",
          description:
            "Whether to load TLS certificates from the platform's native certificate store",
        },
        {
          name: "--offline",
          description: "Disable network access",
        },
        {
          name: "--allow-insecure-host",
          description: "Allow insecure connections to a host",
          args: {
            name: "allow_insecure_host",
          },
        },
        {
          name: "--no-progress",
          description: "Hide all progress outputs",
        },
        {
          name: "--directory",
          description:
            "Change to the given directory prior to running the command",
          args: {
            name: "directory",
          },
        },
        {
          name: "--project",
          description: "Discover a project in the given directory",
          args: {
            name: "project",
          },
        },
        {
          name: "--config-file",
          description: "The path to a `uv.toml` file to use for configuration",
          args: {
            name: "config_file",
          },
        },
        {
          name: "--no-config",
          description:
            "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
        },
      ],
    },
    {
      name: "check",
      description: "Run checks on the project",
      options: [
        {
          name: "--fix",
          description: "Apply safe fixes to resolve type-checking errors",
        },
        {
          name: "--all-packages",
          description: "Check all packages in the workspace",
        },
        {
          name: "--package",
          description: "Check specific packages in the workspace",
          args: {
            name: "package",
          },
        },
        {
          name: "--script",
          description:
            "Run checks for the specified PEP 723 Python script, rather than the current project",
          args: {
            name: "script",
          },
        },
        {
          name: "--extra",
          description:
            "Include optional dependencies from the specified extra name",
          args: {
            name: "extra",
          },
        },
        {
          name: "--all-extras",
          description: "Include all optional dependencies",
        },
        {
          name: "--no-extra",
          description:
            "Exclude the specified optional dependencies, if `--all-extras` is supplied",
          args: {
            name: "no_extra",
          },
        },
        {
          name: "--no-dev",
          description: "Disable the development dependency group",
        },
        {
          name: "--only-dev",
          description: "Only include the development dependency group",
        },
        {
          name: "--group",
          description:
            "Include dependencies from the specified dependency group",
          args: {
            name: "group",
          },
        },
        {
          name: "--no-group",
          description: "Disable the specified dependency group",
          args: {
            name: "no_group",
          },
        },
        {
          name: "--no-default-groups",
          description: "Ignore the default dependency groups",
        },
        {
          name: "--only-group",
          description:
            "Only include dependencies from the specified dependency group",
          args: {
            name: "only_group",
          },
        },
        {
          name: "--all-groups",
          description: "Include dependencies from all dependency groups",
        },
        {
          name: "--locked",
          description: "Assert that the `uv.lock` will remain unchanged",
        },
        {
          name: "--frozen",
          description: "Sync without updating the `uv.lock` file",
        },
        {
          name: "--no-sync",
          description: "Avoid syncing the virtual environment",
        },
        {
          name: "--no-install-project",
          description: "Do not install the current project",
        },
        {
          name: "--isolated",
          description: "Run checks without mutating project state",
        },
        {
          name: ["-p", "--python"],
          description:
            "The Python interpreter to use for the project environment",
          args: {
            name: "python",
          },
        },
        {
          name: "--ty-version",
          description: "The version of ty to use for type checking",
          args: {
            name: "ty_version",
          },
        },
        {
          name: "--no-project",
          description: "Avoid discovering a project or workspace",
        },
        {
          name: "--index",
          description:
            "The indexes to use when resolving dependencies, in addition to the default index",
          args: {
            name: "index",
          },
        },
        {
          name: "--default-index",
          description:
            "The default package index (by default: <https://pypi.org/simple>)",
          args: {
            name: "default_index",
          },
        },
        {
          name: ["-i", "--index-url"],
          description:
            "(Deprecated: use `--default-index` instead) The URL of the Python package index (by default: <https://pypi.org/simple>)",
          args: {
            name: "index_url",
          },
        },
        {
          name: "--extra-index-url",
          description:
            "(Deprecated: use `--index` instead) Extra URLs of package indexes to use, in addition to `--index-url`",
          args: {
            name: "extra_index_url",
          },
        },
        {
          name: ["-f", "--find-links"],
          description:
            "Locations to search for candidate distributions, in addition to those found in the registry indexes",
          args: {
            name: "find_links",
          },
        },
        {
          name: "--no-index",
          description:
            "Ignore the registry index (e.g., PyPI), instead relying on direct URL dependencies and those provided via `--find-links`",
        },
        {
          name: "--index-strategy",
          description:
            "The strategy to use when resolving against multiple index URLs",
          args: {
            name: "index_strategy",
            suggestions: [
              "first-index",
              "unsafe-first-match",
              "unsafe-best-match",
            ],
          },
        },
        {
          name: "--keyring-provider",
          description:
            "Attempt to use `keyring` for authentication for index URLs",
          args: {
            name: "keyring_provider",
            suggestions: ["disabled", "subprocess"],
          },
        },
        {
          name: ["-U", "--upgrade"],
          description:
            "Allow package upgrades, ignoring pinned versions in any existing output file. Implies `--refresh`",
        },
        {
          name: ["-P", "--upgrade-package"],
          description:
            "Allow upgrades for a specific package, ignoring pinned versions in any existing output file. Implies `--refresh-package`",
          args: {
            name: "upgrade_package",
          },
        },
        {
          name: "--upgrade-group",
          description:
            "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
          args: {
            name: "upgrade_group",
          },
        },
        {
          name: "--resolution",
          description:
            "The strategy to use when selecting between the different compatible versions for a given package requirement",
          args: {
            name: "resolution",
            suggestions: ["highest", "lowest", "lowest-direct"],
          },
        },
        {
          name: "--prerelease",
          description:
            "The strategy to use when considering pre-release versions",
          args: {
            name: "prerelease",
            suggestions: [
              "disallow",
              "allow",
              "if-necessary",
              "explicit",
              "if-necessary-or-explicit",
            ],
          },
        },
        {
          name: "--prerelease-package",
          description:
            "The strategy to use when considering pre-release versions for a specific package",
          args: {
            name: "prerelease_package",
          },
        },
        {
          name: "--fork-strategy",
          description:
            "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
          args: {
            name: "fork_strategy",
            suggestions: ["fewest", "requires-python"],
          },
        },
        {
          name: "--exclude-newer",
          description:
            "Limit candidate packages to those that were uploaded prior to the given date",
          args: {
            name: "exclude_newer",
          },
        },
        {
          name: "--exclude-newer-package",
          description:
            "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
          args: {
            name: "exclude_newer_package",
          },
        },
        {
          name: "--no-sources",
          description:
            "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any workspace, Git, URL, or local path sources",
        },
        {
          name: "--no-sources-package",
          description:
            "Don't use sources from the `tool.uv.sources` table for the specified packages",
          args: {
            name: "no_sources_package",
          },
        },
        {
          name: "--reinstall",
          description:
            "Reinstall all packages, regardless of whether they're already installed. Implies `--refresh`",
        },
        {
          name: "--reinstall-package",
          description:
            "Reinstall a specific package, regardless of whether it's already installed. Implies `--refresh-package`",
          args: {
            name: "reinstall_package",
          },
        },
        {
          name: "--link-mode",
          description:
            "The method to use when installing packages from the global cache",
          args: {
            name: "link_mode",
            suggestions: ["clone", "copy", "hardlink", "symlink"],
          },
        },
        {
          name: "--compile-bytecode",
          description: "Compile Python files to bytecode after installation",
        },
        {
          name: ["-C", "--config-setting"],
          description:
            "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
          args: {
            name: "config_setting",
          },
        },
        {
          name: "--config-settings-package",
          description:
            "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
          args: {
            name: "config_settings_package",
          },
        },
        {
          name: "--no-build-isolation",
          description: "Disable isolation when building source distributions",
        },
        {
          name: "--no-build-isolation-package",
          description:
            "Disable isolation when building source distributions for a specific package",
          args: {
            name: "no_build_isolation_package",
          },
        },
        {
          name: "--no-build",
          description: "Don't build source distributions",
        },
        {
          name: "--no-build-package",
          description:
            "Don't build source distributions for a specific package",
          args: {
            name: "no_build_package",
          },
        },
        {
          name: "--no-binary",
          description: "Don't install pre-built wheels",
        },
        {
          name: "--no-binary-package",
          description: "Don't install pre-built wheels for a specific package",
          args: {
            name: "no_binary_package",
          },
        },
        {
          name: "--require-build-hashes",
          description: "Require hashes for all build dependencies",
        },
        {
          name: "--no-require-build-hashes",
          description: "Do not require hashes for every build dependency",
        },
        {
          name: ["-n", "--no-cache"],
          description:
            "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
        },
        {
          name: "--cache-dir",
          description: "Path to the cache directory",
          args: {
            name: "cache_dir",
          },
        },
        {
          name: "--refresh",
          description: "Refresh all cached data",
        },
        {
          name: "--refresh-package",
          description: "Refresh cached data for a specific package",
          args: {
            name: "refresh_package",
          },
        },
        {
          name: "--managed-python",
          description: "Require use of uv-managed Python versions",
        },
        {
          name: "--no-managed-python",
          description: "Disable use of uv-managed Python versions",
        },
        {
          name: "--no-python-downloads",
          description: "Disable automatic downloads of Python.",
        },
        {
          name: ["-q", "--quiet"],
          description: "Use quiet output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Use verbose output",
        },
        {
          name: "--color",
          description: "Control the use of color in output",
          args: {
            name: "color_choice",
            suggestions: ["auto", "always", "never"],
          },
        },
        {
          name: "--system-certs",
          description:
            "Whether to load TLS certificates from the platform's native certificate store",
        },
        {
          name: "--offline",
          description: "Disable network access",
        },
        {
          name: "--allow-insecure-host",
          description: "Allow insecure connections to a host",
          args: {
            name: "allow_insecure_host",
          },
        },
        {
          name: "--no-progress",
          description: "Hide all progress outputs",
        },
        {
          name: "--directory",
          description:
            "Change to the given directory prior to running the command",
          args: {
            name: "directory",
          },
        },
        {
          name: "--project",
          description: "Discover a project in the given directory",
          args: {
            name: "project",
          },
        },
        {
          name: "--config-file",
          description: "The path to a `uv.toml` file to use for configuration",
          args: {
            name: "config_file",
          },
        },
        {
          name: "--no-config",
          description:
            "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
        },
      ],
    },
    {
      name: "audit",
      description: "Audit the project's dependencies",
      options: [
        {
          name: "--no-extra",
          description: "Don't audit the specified optional dependencies",
          args: {
            name: "no_extra",
          },
        },
        {
          name: "--no-dev",
          description: "Don't audit the development dependency group",
        },
        {
          name: "--no-group",
          description: "Don't audit the specified dependency group",
          args: {
            name: "no_group",
          },
        },
        {
          name: "--no-default-groups",
          description:
            "Don't audit dependency groups unless explicitly requested",
        },
        {
          name: "--only-group",
          description:
            "Only audit dependencies from the specified dependency group",
          args: {
            name: "only_group",
          },
        },
        {
          name: "--only-dev",
          description: "Only audit the development dependency group",
        },
        {
          name: "--locked",
          description: "Assert that the `uv.lock` will remain unchanged",
        },
        {
          name: "--frozen",
          description: "Audit the requirements without locking the project",
        },
        {
          name: "--output-format",
          description: "Select the output format",
          args: {
            name: "output_format",
            suggestions: ["text", "json", "sarif"],
          },
        },
        {
          name: "--ignore",
          description: "Ignore a vulnerability by ID",
          args: {
            name: "ignore",
          },
        },
        {
          name: "--ignore-until-fixed",
          description:
            "Ignore a vulnerability by ID, but only while no fix is available",
          args: {
            name: "ignore_until_fixed",
          },
        },
        {
          name: "--service-format",
          description: "The service format to use for vulnerability lookups",
          args: {
            name: "service_format",
            suggestions: ["osv"],
          },
        },
        {
          name: "--service-url",
          description: "The URL to vulnerability service API endpoint",
          args: {
            name: "service_url",
          },
        },
        {
          name: "--script",
          description:
            "Audit the specified PEP 723 Python script, rather than the current project",
          args: {
            name: "script",
          },
        },
        {
          name: "--python-version",
          description: "The Python version to use when auditing",
          args: {
            name: "python_version",
          },
        },
        {
          name: "--python-platform",
          description: "The platform to use when auditing",
          args: {
            name: "python_platform",
            suggestions: [
              "windows",
              "linux",
              "macos",
              "x86_64-pc-windows-msvc",
              "aarch64-pc-windows-msvc",
              "i686-pc-windows-msvc",
              "x86_64-unknown-linux-gnu",
              "aarch64-apple-darwin",
              "x86_64-apple-darwin",
              "aarch64-unknown-linux-gnu",
              "aarch64-unknown-linux-musl",
              "x86_64-unknown-linux-musl",
              "riscv64-unknown-linux",
              "x86_64-manylinux2014",
              "x86_64-manylinux_2_17",
              "x86_64-manylinux_2_28",
              "x86_64-manylinux_2_31",
              "x86_64-manylinux_2_32",
              "x86_64-manylinux_2_33",
              "x86_64-manylinux_2_34",
              "x86_64-manylinux_2_35",
              "x86_64-manylinux_2_36",
              "x86_64-manylinux_2_37",
              "x86_64-manylinux_2_38",
              "x86_64-manylinux_2_39",
              "x86_64-manylinux_2_40",
              "aarch64-manylinux2014",
              "aarch64-manylinux_2_17",
              "aarch64-manylinux_2_28",
              "aarch64-manylinux_2_31",
              "aarch64-manylinux_2_32",
              "aarch64-manylinux_2_33",
              "aarch64-manylinux_2_34",
              "aarch64-manylinux_2_35",
              "aarch64-manylinux_2_36",
              "aarch64-manylinux_2_37",
              "aarch64-manylinux_2_38",
              "aarch64-manylinux_2_39",
              "aarch64-manylinux_2_40",
              "aarch64-linux-android",
              "x86_64-linux-android",
              "wasm32-pyodide2024",
              "wasm32-pyodide2025",
              "arm64-apple-ios",
              "arm64-apple-ios-simulator",
              "x86_64-apple-ios-simulator",
            ],
          },
        },
        {
          name: "--no-build",
          description: "Don't build source distributions",
        },
        {
          name: "--no-build-package",
          description:
            "Don't build source distributions for a specific package",
          args: {
            name: "no_build_package",
          },
        },
        {
          name: "--no-binary",
          description: "Don't install pre-built wheels",
        },
        {
          name: "--no-binary-package",
          description: "Don't install pre-built wheels for a specific package",
          args: {
            name: "no_binary_package",
          },
        },
        {
          name: "--require-build-hashes",
          description: "Require hashes for all build dependencies",
        },
        {
          name: "--no-require-build-hashes",
          description: "Do not require hashes for every build dependency",
        },
        {
          name: ["-C", "--config-setting"],
          description:
            "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
          args: {
            name: "config_setting",
          },
        },
        {
          name: "--config-settings-package",
          description:
            "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
          args: {
            name: "config_settings_package",
          },
        },
        {
          name: "--no-build-isolation",
          description: "Disable isolation when building source distributions",
        },
        {
          name: "--no-build-isolation-package",
          description:
            "Disable isolation when building source distributions for a specific package",
          args: {
            name: "no_build_isolation_package",
          },
        },
        {
          name: "--index",
          description:
            "The indexes to use when resolving dependencies, in addition to the default index",
          args: {
            name: "index",
          },
        },
        {
          name: "--default-index",
          description:
            "The default package index (by default: <https://pypi.org/simple>)",
          args: {
            name: "default_index",
          },
        },
        {
          name: ["-i", "--index-url"],
          description:
            "(Deprecated: use `--default-index` instead) The URL of the Python package index (by default: <https://pypi.org/simple>)",
          args: {
            name: "index_url",
          },
        },
        {
          name: "--extra-index-url",
          description:
            "(Deprecated: use `--index` instead) Extra URLs of package indexes to use, in addition to `--index-url`",
          args: {
            name: "extra_index_url",
          },
        },
        {
          name: ["-f", "--find-links"],
          description:
            "Locations to search for candidate distributions, in addition to those found in the registry indexes",
          args: {
            name: "find_links",
          },
        },
        {
          name: "--no-index",
          description:
            "Ignore the registry index (e.g., PyPI), instead relying on direct URL dependencies and those provided via `--find-links`",
        },
        {
          name: "--index-strategy",
          description:
            "The strategy to use when resolving against multiple index URLs",
          args: {
            name: "index_strategy",
            suggestions: [
              "first-index",
              "unsafe-first-match",
              "unsafe-best-match",
            ],
          },
        },
        {
          name: "--keyring-provider",
          description:
            "Attempt to use `keyring` for authentication for index URLs",
          args: {
            name: "keyring_provider",
            suggestions: ["disabled", "subprocess"],
          },
        },
        {
          name: ["-U", "--upgrade"],
          description:
            "Allow package upgrades, ignoring pinned versions in any existing output file. Implies `--refresh`",
        },
        {
          name: ["-P", "--upgrade-package"],
          description:
            "Allow upgrades for a specific package, ignoring pinned versions in any existing output file. Implies `--refresh-package`",
          args: {
            name: "upgrade_package",
          },
        },
        {
          name: "--upgrade-group",
          description:
            "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
          args: {
            name: "upgrade_group",
          },
        },
        {
          name: "--resolution",
          description:
            "The strategy to use when selecting between the different compatible versions for a given package requirement",
          args: {
            name: "resolution",
            suggestions: ["highest", "lowest", "lowest-direct"],
          },
        },
        {
          name: "--prerelease",
          description:
            "The strategy to use when considering pre-release versions",
          args: {
            name: "prerelease",
            suggestions: [
              "disallow",
              "allow",
              "if-necessary",
              "explicit",
              "if-necessary-or-explicit",
            ],
          },
        },
        {
          name: "--prerelease-package",
          description:
            "The strategy to use when considering pre-release versions for a specific package",
          args: {
            name: "prerelease_package",
          },
        },
        {
          name: "--fork-strategy",
          description:
            "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
          args: {
            name: "fork_strategy",
            suggestions: ["fewest", "requires-python"],
          },
        },
        {
          name: "--exclude-newer",
          description:
            "Limit candidate packages to those that were uploaded prior to the given date",
          args: {
            name: "exclude_newer",
          },
        },
        {
          name: "--exclude-newer-package",
          description:
            "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
          args: {
            name: "exclude_newer_package",
          },
        },
        {
          name: "--no-sources",
          description:
            "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any workspace, Git, URL, or local path sources",
        },
        {
          name: "--no-sources-package",
          description:
            "Don't use sources from the `tool.uv.sources` table for the specified packages",
          args: {
            name: "no_sources_package",
          },
        },
        {
          name: "--link-mode",
          description:
            "The method to use when installing packages from the global cache",
          args: {
            name: "link_mode",
            suggestions: ["clone", "copy", "hardlink", "symlink"],
          },
        },
        {
          name: ["-n", "--no-cache"],
          description:
            "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
        },
        {
          name: "--cache-dir",
          description: "Path to the cache directory",
          args: {
            name: "cache_dir",
          },
        },
        {
          name: "--managed-python",
          description: "Require use of uv-managed Python versions",
        },
        {
          name: "--no-managed-python",
          description: "Disable use of uv-managed Python versions",
        },
        {
          name: "--no-python-downloads",
          description: "Disable automatic downloads of Python.",
        },
        {
          name: ["-q", "--quiet"],
          description: "Use quiet output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Use verbose output",
        },
        {
          name: "--color",
          description: "Control the use of color in output",
          args: {
            name: "color_choice",
            suggestions: ["auto", "always", "never"],
          },
        },
        {
          name: "--system-certs",
          description:
            "Whether to load TLS certificates from the platform's native certificate store",
        },
        {
          name: "--allow-insecure-host",
          description: "Allow insecure connections to a host",
          args: {
            name: "allow_insecure_host",
          },
        },
        {
          name: "--no-progress",
          description: "Hide all progress outputs",
        },
        {
          name: "--directory",
          description:
            "Change to the given directory prior to running the command",
          args: {
            name: "directory",
          },
        },
        {
          name: "--project",
          description: "Discover a project in the given directory",
          args: {
            name: "project",
          },
        },
        {
          name: "--config-file",
          description: "The path to a `uv.toml` file to use for configuration",
          args: {
            name: "config_file",
          },
        },
        {
          name: "--no-config",
          description:
            "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
        },
      ],
    },
    {
      name: "workspace",
      description: "Inspect uv workspaces",
      subcommands: [
        {
          name: "metadata",
          description: "View metadata about the current workspace",
          options: [
            {
              name: "--output-version",
              description: "Request a specific version of the metadata schema",
              args: {
                name: "version",
              },
            },
            {
              name: "--script",
              description:
                "View metadata for the specified PEP 723 Python script, rather than the current workspace",
              args: {
                name: "script",
              },
            },
            {
              name: "--locked",
              description: "Check if the lockfile is up-to-date",
            },
            {
              name: "--frozen",
              description:
                "Assert that a `uv.lock` exists without checking if it is up-to-date",
            },
            {
              name: "--sync",
              description:
                "Sync the environment to include module ownership metadata in the output",
            },
            {
              name: "--exact",
              description:
                "Perform an exact sync, removing extraneous packages",
            },
            {
              name: "--active",
              description:
                "Sync dependencies to the active virtual environment",
            },
            {
              name: "--index",
              description:
                "The indexes to use when resolving dependencies, in addition to the default index",
              args: {
                name: "index",
              },
            },
            {
              name: "--default-index",
              description:
                "The default package index (by default: <https://pypi.org/simple>)",
              args: {
                name: "default_index",
              },
            },
            {
              name: ["-i", "--index-url"],
              description:
                "(Deprecated: use `--default-index` instead) The URL of the Python package index (by default: <https://pypi.org/simple>)",
              args: {
                name: "index_url",
              },
            },
            {
              name: "--extra-index-url",
              description:
                "(Deprecated: use `--index` instead) Extra URLs of package indexes to use, in addition to `--index-url`",
              args: {
                name: "extra_index_url",
              },
            },
            {
              name: ["-f", "--find-links"],
              description:
                "Locations to search for candidate distributions, in addition to those found in the registry indexes",
              args: {
                name: "find_links",
              },
            },
            {
              name: "--no-index",
              description:
                "Ignore the registry index (e.g., PyPI), instead relying on direct URL dependencies and those provided via `--find-links`",
            },
            {
              name: "--index-strategy",
              description:
                "The strategy to use when resolving against multiple index URLs",
              args: {
                name: "index_strategy",
                suggestions: [
                  "first-index",
                  "unsafe-first-match",
                  "unsafe-best-match",
                ],
              },
            },
            {
              name: "--keyring-provider",
              description:
                "Attempt to use `keyring` for authentication for index URLs",
              args: {
                name: "keyring_provider",
                suggestions: ["disabled", "subprocess"],
              },
            },
            {
              name: ["-U", "--upgrade"],
              description:
                "Allow package upgrades, ignoring pinned versions in any existing output file. Implies `--refresh`",
            },
            {
              name: ["-P", "--upgrade-package"],
              description:
                "Allow upgrades for a specific package, ignoring pinned versions in any existing output file. Implies `--refresh-package`",
              args: {
                name: "upgrade_package",
              },
            },
            {
              name: "--upgrade-group",
              description:
                "Allow upgrades for all packages in a dependency group, ignoring pinned versions in any existing output file",
              args: {
                name: "upgrade_group",
              },
            },
            {
              name: "--resolution",
              description:
                "The strategy to use when selecting between the different compatible versions for a given package requirement",
              args: {
                name: "resolution",
                suggestions: ["highest", "lowest", "lowest-direct"],
              },
            },
            {
              name: "--prerelease",
              description:
                "The strategy to use when considering pre-release versions",
              args: {
                name: "prerelease",
                suggestions: [
                  "disallow",
                  "allow",
                  "if-necessary",
                  "explicit",
                  "if-necessary-or-explicit",
                ],
              },
            },
            {
              name: "--prerelease-package",
              description:
                "The strategy to use when considering pre-release versions for a specific package",
              args: {
                name: "prerelease_package",
              },
            },
            {
              name: "--fork-strategy",
              description:
                "The strategy to use when selecting multiple versions of a given package across Python versions and platforms",
              args: {
                name: "fork_strategy",
                suggestions: ["fewest", "requires-python"],
              },
            },
            {
              name: "--exclude-newer",
              description:
                "Limit candidate packages to those that were uploaded prior to the given date",
              args: {
                name: "exclude_newer",
              },
            },
            {
              name: "--exclude-newer-package",
              description:
                "Limit candidate packages for specific packages to those that were uploaded prior to the given date",
              args: {
                name: "exclude_newer_package",
              },
            },
            {
              name: "--no-sources",
              description:
                "Ignore the `tool.uv.sources` table when resolving dependencies. Used to lock against the standards-compliant, publishable package metadata, as opposed to using any workspace, Git, URL, or local path sources",
            },
            {
              name: "--no-sources-package",
              description:
                "Don't use sources from the `tool.uv.sources` table for the specified packages",
              args: {
                name: "no_sources_package",
              },
            },
            {
              name: ["-C", "--config-setting"],
              description:
                "Settings to pass to the PEP 517 build backend, specified as `KEY=VALUE` pairs",
              args: {
                name: "config_setting",
              },
            },
            {
              name: "--config-settings-package",
              description:
                "Settings to pass to the PEP 517 build backend for a specific package, specified as `PACKAGE:KEY=VALUE` pairs",
              args: {
                name: "config_settings_package",
              },
            },
            {
              name: "--no-build-isolation",
              description:
                "Disable isolation when building source distributions",
            },
            {
              name: "--no-build-isolation-package",
              description:
                "Disable isolation when building source distributions for a specific package",
              args: {
                name: "no_build_isolation_package",
              },
            },
            {
              name: "--no-build",
              description: "Don't build source distributions",
            },
            {
              name: "--no-build-package",
              description:
                "Don't build source distributions for a specific package",
              args: {
                name: "no_build_package",
              },
            },
            {
              name: "--no-binary",
              description: "Don't install pre-built wheels",
            },
            {
              name: "--no-binary-package",
              description:
                "Don't install pre-built wheels for a specific package",
              args: {
                name: "no_binary_package",
              },
            },
            {
              name: "--require-build-hashes",
              description: "Require hashes for all build dependencies",
            },
            {
              name: "--no-require-build-hashes",
              description: "Do not require hashes for every build dependency",
            },
            {
              name: "--link-mode",
              description:
                "The method to use when installing packages from the global cache",
              args: {
                name: "link_mode",
                suggestions: ["clone", "copy", "hardlink", "symlink"],
              },
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--refresh",
              description: "Refresh all cached data",
            },
            {
              name: "--refresh-package",
              description: "Refresh cached data for a specific package",
              args: {
                name: "refresh_package",
              },
            },
            {
              name: ["-p", "--python"],
              description: "The Python interpreter to use during resolution.",
              args: {
                name: "python",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
        {
          name: "dir",
          description: "Display the path of a workspace member",
          options: [
            {
              name: "--package",
              description:
                "Display the path to a specific package in the workspace",
              args: {
                name: "package",
              },
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
        {
          name: "list",
          description: "List the members of a workspace",
          options: [
            {
              name: "--paths",
              description: "Show paths instead of names",
            },
            {
              name: "--scripts",
              description:
                "List all standalone scripts with inline metadata in the workspace",
            },
            {
              name: ["-n", "--no-cache"],
              description:
                "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
            },
            {
              name: "--cache-dir",
              description: "Path to the cache directory",
              args: {
                name: "cache_dir",
              },
            },
            {
              name: "--managed-python",
              description: "Require use of uv-managed Python versions",
            },
            {
              name: "--no-managed-python",
              description: "Disable use of uv-managed Python versions",
            },
            {
              name: "--no-python-downloads",
              description: "Disable automatic downloads of Python.",
            },
            {
              name: ["-q", "--quiet"],
              description: "Use quiet output",
            },
            {
              name: ["-v", "--verbose"],
              description: "Use verbose output",
            },
            {
              name: "--color",
              description: "Control the use of color in output",
              args: {
                name: "color_choice",
                suggestions: ["auto", "always", "never"],
              },
            },
            {
              name: "--system-certs",
              description:
                "Whether to load TLS certificates from the platform's native certificate store",
            },
            {
              name: "--offline",
              description: "Disable network access",
            },
            {
              name: "--allow-insecure-host",
              description: "Allow insecure connections to a host",
              args: {
                name: "allow_insecure_host",
              },
            },
            {
              name: "--no-progress",
              description: "Hide all progress outputs",
            },
            {
              name: "--directory",
              description:
                "Change to the given directory prior to running the command",
              args: {
                name: "directory",
              },
            },
            {
              name: "--project",
              description: "Discover a project in the given directory",
              args: {
                name: "project",
              },
            },
            {
              name: "--config-file",
              description:
                "The path to a `uv.toml` file to use for configuration",
              args: {
                name: "config_file",
              },
            },
            {
              name: "--no-config",
              description:
                "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-n", "--no-cache"],
          description:
            "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
        },
        {
          name: "--cache-dir",
          description: "Path to the cache directory",
          args: {
            name: "cache_dir",
          },
        },
        {
          name: "--managed-python",
          description: "Require use of uv-managed Python versions",
        },
        {
          name: "--no-managed-python",
          description: "Disable use of uv-managed Python versions",
        },
        {
          name: "--no-python-downloads",
          description: "Disable automatic downloads of Python.",
        },
        {
          name: ["-q", "--quiet"],
          description: "Use quiet output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Use verbose output",
        },
        {
          name: "--color",
          description: "Control the use of color in output",
          args: {
            name: "color_choice",
            suggestions: ["auto", "always", "never"],
          },
        },
        {
          name: "--system-certs",
          description:
            "Whether to load TLS certificates from the platform's native certificate store",
        },
        {
          name: "--offline",
          description: "Disable network access",
        },
        {
          name: "--allow-insecure-host",
          description: "Allow insecure connections to a host",
          args: {
            name: "allow_insecure_host",
          },
        },
        {
          name: "--no-progress",
          description: "Hide all progress outputs",
        },
        {
          name: "--directory",
          description:
            "Change to the given directory prior to running the command",
          args: {
            name: "directory",
          },
        },
        {
          name: "--project",
          description: "Discover a project in the given directory",
          args: {
            name: "project",
          },
        },
        {
          name: "--config-file",
          description: "The path to a `uv.toml` file to use for configuration",
          args: {
            name: "config_file",
          },
        },
        {
          name: "--no-config",
          description:
            "Avoid discovering configuration files (`pyproject.toml`, `uv.toml`)",
        },
      ],
    },
  ],
  options: [
    ...globalOptions,
    {
      name: ["-n", "--no-cache"],
      description:
        "Avoid reading from or writing to the cache, instead using a temporary directory for the duration of the operation",
      isPersistent: true,
    },
    {
      name: "--cache-dir",
      description: "Path to the cache directory",
      args: {
        name: "cache_dir",
      },
      isPersistent: true,
    },
    {
      name: "--managed-python",
      description: "Require use of uv-managed Python versions",
      isPersistent: true,
    },
    {
      name: "--no-managed-python",
      description: "Disable use of uv-managed Python versions",
      isPersistent: true,
    },
    {
      name: "--no-python-downloads",
      description: "Disable automatic downloads of Python.",
      isPersistent: true,
    },
    {
      name: "--system-certs",
      description:
        "Whether to load TLS certificates from the platform's native certificate store",
      isPersistent: true,
    },
  ],
};
export default completionSpec;
