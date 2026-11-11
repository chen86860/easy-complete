const globalOptions: Fig.Option[] = [
  { name: ["-?", "--help"], description: "Show help" },
  { name: ["-q", "--quiet"], description: "Reduce output" },
  { name: ["-v", "--verbose"], description: "Increase output verbosity" },
];

const archiveArg: Fig.Arg = {
  name: "archive",
  isOptional: true,
  template: "filepaths",
};

const predicateOption: Fig.Option = {
  name: "--predicate",
  description: "Filter events using an NSPredicate expression",
  args: { name: "predicate" },
};

const spec: Fig.Spec = {
  name: "log",
  description: "View and manage macOS unified logging",
  options: globalOptions,
  subcommands: [
    {
      name: "collect",
      description: "Gather system logs into a log archive",
      options: [
        {
          name: "--output",
          description: "Write the log archive to this path",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: "--last",
          description: "Collect entries from the recent interval",
          args: { name: "time" },
        },
      ],
    },
    {
      name: "config",
      description: "View or change logging system settings",
    },
    {
      name: "diagnose",
      description: "Diagnose an archive for a variety of issues",
      args: archiveArg,
    },
    {
      name: "erase",
      description: "Delete system logging data",
    },
    {
      name: "repack",
      description: "Repack a log archive using a predicate",
      args: archiveArg,
      options: [predicateOption],
    },
    {
      name: "show",
      description: "View or search system logs",
      args: archiveArg,
      options: [
        predicateOption,
        {
          name: "--last",
          description: "Show entries from the recent interval",
          args: { name: "time" },
        },
        {
          name: "--style",
          description: "Output style",
          args: {
            name: "style",
            suggestions: ["default", "compact", "json", "ndjson", "syslog"],
          },
        },
        { name: "--info", description: "Include info-level messages" },
        { name: "--debug", description: "Include debug-level messages" },
      ],
    },
    {
      name: "stream",
      description: "Watch live system logs",
      options: [
        predicateOption,
        {
          name: "--style",
          description: "Output style",
          args: {
            name: "style",
            suggestions: ["default", "compact", "json", "ndjson", "syslog"],
          },
        },
        { name: "--info", description: "Include info-level messages" },
        { name: "--debug", description: "Include debug-level messages" },
      ],
    },
    {
      name: "stats",
      description: "Show system logging statistics",
      args: archiveArg,
    },
    {
      name: "emit",
      description: "Emit a log message into the log store",
      args: { name: "message", isOptional: true },
      options: [
        {
          name: "--type",
          description: "Message type",
          args: {
            name: "type",
            suggestions: ["default", "info", "debug", "error", "fault"],
          },
        },
      ],
    },
    {
      name: "help",
      description: "Show help for a command or topic",
      args: {
        name: "topic",
        isOptional: true,
        suggestions: [
          "collect",
          "config",
          "diagnose",
          "erase",
          "repack",
          "show",
          "stream",
          "stats",
          "emit",
          "predicates",
          "shorthand",
        ],
      },
    },
  ],
};

export default spec;
