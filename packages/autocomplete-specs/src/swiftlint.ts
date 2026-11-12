const reporters = [
  "xcode",
  "json",
  "csv",
  "checkstyle",
  "codeclimate",
  "junit",
  "html",
  "emoji",
  "sonarqube",
  "markdown",
  "github-actions-logging",
  "summary",
  "gitlab",
  "relative-path",
];

const rulesGenerator: Fig.Generator = {
  script: ["swiftlint", "rules"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.split("|")[1]?.trim())
      .filter((id) => id && id !== "identifier")
      .map((id) => ({
        name: id,
        description: "Rule identifier",
        icon: "fig://icon?type=option",
      })),
};

const configOption: Fig.Option = {
  name: "--config",
  description: "The path to one or more SwiftLint configuration files",
  args: { name: "config", template: "filepaths" },
};

const versionOption: Fig.Option = {
  name: "--version",
  description: "Show the version",
};

const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Show help information",
};

const ruleFilterOptions: Fig.Option[] = [
  {
    name: ["-e", "--enabled"],
    description: "Only show enabled rules",
  },
  {
    name: ["-d", "--disabled"],
    description: "Only show disabled rules",
  },
  {
    name: ["-c", "--correctable"],
    description: "Only display correctable rules",
  },
];

const commonLintOptions: Fig.Option[] = [
  configOption,
  {
    name: ["--fix", "--autocorrect"],
    description: "Correct violations whenever possible",
  },
  {
    name: "--format",
    description: "Reformat the Swift files via SourceKit (with --fix)",
  },
  {
    name: "--use-alternative-excluding",
    description: "Use an alternative algorithm to exclude paths",
  },
  {
    name: "--use-script-input-files",
    description: "Read SCRIPT_INPUT_FILE* environment variables as files",
  },
  {
    name: "--use-script-input-file-lists",
    description: "Read SCRIPT_INPUT_FILE_LIST* environment variables as lists",
  },
  {
    name: "--strict",
    description: "Upgrades warnings to serious violations (errors)",
  },
  {
    name: "--lenient",
    description: "Downgrades serious violations to warnings",
  },
  {
    name: "--force-exclude",
    description: "Exclude files in config `excluded` even if explicit",
  },
  {
    name: "--benchmark",
    description:
      "Save benchmarks to `benchmark_files.txt`/`benchmark_rules.txt`",
  },
  {
    name: "--reporter",
    description: "The reporter used to log errors and warnings",
    args: { name: "reporter", suggestions: reporters },
  },
  {
    name: "--baseline",
    description: "The path to a baseline file used to filter out violations",
    args: { name: "baseline", template: "filepaths" },
  },
  {
    name: "--write-baseline",
    description: "The path to save detected violations to as a new baseline",
    args: { name: "write-baseline", template: "filepaths" },
  },
  {
    name: "--working-directory",
    description: "The working directory to use when running SwiftLint",
    args: { name: "working-directory", template: "folders" },
  },
  {
    name: "--output",
    description: "The file where violations should be saved",
    args: { name: "output", template: "filepaths" },
  },
  {
    name: "--progress",
    description: "Show a live-updating progress bar",
  },
  {
    name: "--check-for-updates",
    description: "Check whether a later version of SwiftLint is available",
  },
  {
    name: "--only-rule",
    description: "Run only the specified rule",
    args: { name: "only-rule", generators: rulesGenerator },
    isRepeatable: true,
  },
  {
    name: "--quiet",
    description: "Don't print status logs",
  },
  versionOption,
  helpOption,
];

const pathsArg: Fig.Arg = {
  name: "paths",
  description: "List of paths to the files or directories",
  template: ["filepaths", "folders"],
  isVariadic: true,
  isOptional: true,
};

const completionSpec: Fig.Spec = {
  name: "swiftlint",
  description: "A tool to enforce Swift style and conventions",
  args: pathsArg,
  subcommands: [
    {
      name: "lint",
      description: "Print lint warnings and errors (default)",
      args: pathsArg,
      options: [
        ...commonLintOptions,
        {
          name: "--use-stdin",
          description: "Lint standard input",
        },
        {
          name: "--silence-deprecation-warnings",
          description: "Don't print deprecation warnings",
        },
        {
          name: "--cache-path",
          description: "The directory of the cache used when linting",
          args: { name: "cache-path", template: "folders" },
        },
        {
          name: "--no-cache",
          description: "Ignore cache when linting",
        },
        {
          name: "--enable-all-rules",
          description: "Run all rules, even opt-in and disabled ones",
        },
        {
          name: "--disable-sourcekit",
          description: "Do not dynamically load SourceKit at runtime",
        },
      ],
    },
    {
      name: "analyze",
      description: "Run analysis rules",
      args: pathsArg,
      options: [
        ...commonLintOptions,
        {
          name: "--compiler-log-path",
          description: "The path of the full xcodebuild log for AnalyzerRules",
          args: { name: "compiler-log-path", template: "filepaths" },
        },
        {
          name: "--compile-commands",
          description: "The path of a compilation database for AnalyzerRules",
          args: { name: "compile-commands", template: "filepaths" },
        },
      ],
    },
    {
      name: "docs",
      description: "Open SwiftLint documentation website in the browser",
      options: [versionOption, helpOption],
    },
    {
      name: "generate-docs",
      description: "Generate markdown documentation for a group of rules",
      options: [
        {
          name: "--path",
          description: "The directory where the documentation should be saved",
          args: { name: "path", template: "folders", default: "rule_docs" },
        },
        configOption,
        ...ruleFilterOptions,
        versionOption,
        helpOption,
      ],
    },
    {
      name: "baseline",
      description: "Operations on existing baselines",
      subcommands: [
        {
          name: "report",
          description: "Reports the violations in a baseline (default)",
          options: [versionOption, helpOption],
        },
        {
          name: "compare",
          description: "Report violations present in another baseline only",
          options: [versionOption, helpOption],
        },
      ],
      options: [versionOption, helpOption],
    },
    {
      name: "reporters",
      description: "Display the list of reporters and their identifiers",
      options: [versionOption, helpOption],
    },
    {
      name: "rules",
      description: "Display the list of rules and their identifiers",
      args: {
        name: "rule-id",
        description: "The rule identifier to display description for",
        generators: rulesGenerator,
        isOptional: true,
      },
      options: [
        configOption,
        ...ruleFilterOptions,
        {
          name: ["-v", "--verbose"],
          description: "Display full configuration details",
        },
        {
          name: "--config-only",
          description: "Print only the YAML configuration(s)",
        },
        {
          name: "--default-config",
          description: "Print default configuration(s)",
        },
        versionOption,
        helpOption,
      ],
    },
    {
      name: "version",
      description: "Display the current version of SwiftLint",
      options: [versionOption, helpOption],
    },
    {
      name: "help",
      description: "Show help information for a subcommand",
      args: { name: "subcommand", isOptional: true },
    },
  ],
  options: [versionOption, helpOption],
};

export default completionSpec;
