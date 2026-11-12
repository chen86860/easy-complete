const icon = "https://cdn.simpleicons.org/uv/DE5FE9";

const indexOptions: Fig.Option[] = [
  {
    name: "--index",
    description: "Additional package index URL",
    args: { name: "url" },
  },
  {
    name: "--default-index",
    description: "Default package index URL",
    args: { name: "url" },
  },
  {
    name: ["-i", "--index-url"],
    description: "Python package index URL",
    args: { name: "url" },
  },
  {
    name: "--extra-index-url",
    description: "Extra package index URL",
    args: { name: "url" },
  },
  {
    name: ["-f", "--find-links"],
    description: "Locations to search for candidate distributions",
    args: { name: "path-or-url" },
  },
  {
    name: "--no-index",
    description: "Ignore registry indexes",
  },
  {
    name: "--index-strategy",
    description: "Strategy for resolving against multiple indexes",
    args: {
      name: "strategy",
      suggestions: ["first-index", "unsafe-first-match", "unsafe-best-match"],
    },
  },
  {
    name: "--keyring-provider",
    description: "Use keyring for index authentication",
    args: { name: "provider", suggestions: ["disabled", "subprocess"] },
  },
];

const resolverOptions: Fig.Option[] = [
  {
    name: ["-U", "--upgrade"],
    description: "Allow package upgrades",
  },
  {
    name: ["-P", "--upgrade-package"],
    description: "Allow upgrades for a specific package",
    args: { name: "package" },
  },
  {
    name: "--upgrade-group",
    description: "Allow upgrades for all packages in a dependency group",
    args: { name: "group" },
  },
  {
    name: "--resolution",
    description: "Version selection strategy",
    args: {
      name: "strategy",
      suggestions: ["highest", "lowest", "lowest-direct"],
    },
  },
  {
    name: "--prerelease",
    description: "Pre-release handling strategy",
    args: {
      name: "strategy",
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
    name: "--fork-strategy",
    description:
      "Strategy for selecting versions across Python versions and platforms",
    args: { name: "strategy", suggestions: ["fewest", "requires-python"] },
  },
  {
    name: "--exclude-newer",
    description: "Limit candidate packages to uploads before a date",
    args: { name: "date" },
  },
  {
    name: "--exclude-newer-package",
    description: "Limit candidates for specific packages",
    args: { name: "package=date" },
  },
  {
    name: "--no-sources",
    description: "Ignore tool.uv.sources when resolving dependencies",
  },
  {
    name: "--no-sources-package",
    description: "Ignore tool.uv.sources for a package",
    args: { name: "package" },
  },
];

const installOptions: Fig.Option[] = [
  {
    name: "--reinstall",
    description: "Reinstall all packages",
  },
  {
    name: "--reinstall-package",
    description: "Reinstall a specific package",
    args: { name: "package" },
  },
  {
    name: "--link-mode",
    description: "Method for installing packages from the global cache",
    args: {
      name: "mode",
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
    name: ["-C", "--config-setting"],
    description: "PEP 517 build backend setting",
    args: { name: "key=value" },
  },
  {
    name: "--config-settings-package",
    description: "PEP 517 setting for a specific package",
    args: { name: "package:key=value" },
  },
  {
    name: "--no-build-isolation",
    description: "Disable build isolation",
  },
  {
    name: "--no-build-isolation-package",
    description: "Disable build isolation for a package",
    args: { name: "package" },
  },
  {
    name: "--no-build",
    description: "Do not build source distributions",
  },
  {
    name: "--no-build-package",
    description: "Do not build source distributions for a package",
    args: { name: "package" },
  },
  {
    name: "--no-binary",
    description: "Do not install pre-built wheels",
  },
  {
    name: "--no-binary-package",
    description: "Do not install pre-built wheels for a package",
    args: { name: "package" },
  },
];

const globalOptions: Fig.Option[] = [
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
    description: "Control color output",
    args: { name: "choice", suggestions: ["auto", "always", "never"] },
  },
  {
    name: "--system-certs",
    description: "Load TLS certificates from the platform native store",
  },
  {
    name: "--offline",
    description: "Disable network access",
  },
  {
    name: "--allow-insecure-host",
    description: "Allow insecure connections to a host",
    args: { name: "host" },
  },
  {
    name: "--no-progress",
    description: "Hide progress output",
  },
  {
    name: "--directory",
    description: "Change to the given directory before running",
    args: { name: "directory", template: "folders" },
  },
  {
    name: "--project",
    description: "Discover a project in the given directory",
    args: { name: "directory", template: "folders" },
  },
  {
    name: "--config-file",
    description: "Path to a uv.toml configuration file",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "--no-config",
    description: "Avoid discovering configuration files",
  },
  {
    name: ["-h", "--help"],
    description: "Display help",
  },
  {
    name: ["-V", "--version"],
    description: "Display the uvx version",
  },
];

const spec: Fig.Spec = {
  name: "uvx",
  description: "Run a command provided by a Python package",
  icon,
  args: {
    name: "command",
    isCommand: true,
    isOptional: true,
  },
  options: [
    {
      name: "--from",
      description: "Use the given package to provide the command",
      args: { name: "package" },
    },
    {
      name: ["-w", "--with"],
      description: "Run with the given packages installed",
      args: { name: "package" },
    },
    {
      name: "--with-editable",
      description: "Run with an editable package installed",
      args: { name: "path", template: "folders" },
    },
    {
      name: "--with-requirements",
      description: "Run with packages listed in requirements files",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: ["-c", "--constraints"],
      description: "Constrain versions using requirements files",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: ["-b", "--build-constraints"],
      description: "Constrain build dependencies using requirements files",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--overrides",
      description: "Override versions using requirements files",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--isolated",
      description: "Run in an isolated virtual environment",
    },
    {
      name: "--env-file",
      description: "Load environment variables from a .env file",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--no-env-file",
      description: "Avoid reading environment variables from a .env file",
    },
    {
      name: "--lfs",
      description: "Use Git LFS when adding a dependency from Git",
    },
    {
      name: ["-p", "--python"],
      description: "Python interpreter for the run environment",
      args: { name: "python" },
    },
    {
      name: "--python-platform",
      description: "Platform for which requirements should be installed",
      args: {
        name: "platform",
        suggestions: [
          "windows",
          "linux",
          "macos",
          "aarch64-apple-darwin",
          "x86_64-apple-darwin",
        ],
      },
    },
    {
      name: "--torch-backend",
      description: "Backend for PyTorch packages",
      args: {
        name: "backend",
        suggestions: ["auto", "cpu", "cu126", "cu128", "rocm6.4", "xpu"],
      },
    },
    {
      name: "--managed-python",
      description: "Require uv-managed Python versions",
    },
    {
      name: "--no-managed-python",
      description: "Disable uv-managed Python versions",
    },
    {
      name: "--no-python-downloads",
      description: "Disable automatic Python downloads",
    },
    ...indexOptions,
    ...resolverOptions,
    ...installOptions,
    ...buildOptions,
    {
      name: ["-n", "--no-cache"],
      description: "Avoid reading from or writing to the cache",
    },
    {
      name: "--cache-dir",
      description: "Path to the cache directory",
      args: { name: "directory", template: "folders" },
    },
    {
      name: "--refresh",
      description: "Refresh all cached data",
    },
    {
      name: "--refresh-package",
      description: "Refresh cached data for a specific package",
      args: { name: "package" },
    },
    ...globalOptions,
  ],
};

export default spec;
