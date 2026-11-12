const unitGenerator: Fig.Generator = {
  script: [
    "bash",
    "-c",
    "systemctl list-unit-files --no-legend --no-pager | awk '{print $1}'",
  ],
  postProcess: (out) =>
    out
      .split("\n")
      .filter(Boolean)
      .map((name) => ({ name, icon: "⚙️", description: "Systemd unit" })),
};

const completionSpec: Fig.Spec = {
  name: "journalctl",
  description: "Query the contents of the systemd journal",
  args: {
    name: "matches",
    description:
      "Field matches (e.g. _SYSTEMD_UNIT=sshd.service) or a kernel/unit name",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    {
      name: ["-u", "--unit"],
      description: "Show logs from the specified systemd unit",
      isRepeatable: true,
      args: { name: "unit", generators: unitGenerator },
    },
    {
      name: "--user-unit",
      description: "Show logs from the specified user session unit",
      isRepeatable: true,
      args: { name: "unit" },
    },
    {
      name: ["-f", "--follow"],
      description:
        "Show only the most recent entries and continuously print new ones",
    },
    {
      name: ["-e", "--pager-end"],
      description:
        "Immediately jump to the end of the journal inside the pager",
    },
    {
      name: ["-n", "--lines"],
      description: "Show the most recent N journal events (default 10)",
      args: { name: "lines", isOptional: true },
    },
    {
      name: ["-r", "--reverse"],
      description: "Reverse output so the newest entries are displayed first",
    },
    {
      name: ["-k", "--dmesg"],
      description: "Show only kernel messages (like dmesg)",
    },
    {
      name: ["-b", "--boot"],
      description:
        "Show messages from a specific boot (e.g. 0 for current, -1 for previous)",
      args: { name: "ID|offset", isOptional: true },
    },
    {
      name: "--list-boots",
      description:
        "Show a tabular list of boot numbers, their IDs and timestamps",
    },
    {
      name: ["-S", "--since"],
      description:
        'Show entries on or newer than the date (e.g. "2024-01-01 12:00:00", "yesterday", "-1h")',
      args: { name: "date" },
    },
    {
      name: ["-U", "--until"],
      description: "Show entries on or older than the specified date",
      args: { name: "date" },
    },
    {
      name: ["-p", "--priority"],
      description: "Filter output by message priority or priority range",
      args: {
        name: "priority",
        suggestions: [
          "emerg",
          "alert",
          "crit",
          "err",
          "warning",
          "notice",
          "info",
          "debug",
        ],
      },
    },
    {
      name: ["-g", "--grep"],
      description:
        "Filter output to entries whose MESSAGE matches the given regex (PERL-compatible)",
      args: { name: "pattern" },
    },
    {
      name: "--case-sensitive",
      description: "Make --grep matching case sensitive or case insensitive",
      args: { name: "bool", isOptional: true, suggestions: ["yes", "no"] },
    },
    {
      name: ["-o", "--output"],
      description:
        "Control the formatting of the journal entries that are shown",
      args: {
        name: "format",
        suggestions: [
          "short",
          "short-full",
          "short-iso",
          "short-iso-precise",
          "short-precise",
          "short-monotonic",
          "short-unix",
          "verbose",
          "export",
          "json",
          "json-pretty",
          "json-sse",
          "json-seq",
          "cat",
          "with-unit",
        ],
      },
    },
    {
      name: "--output-fields",
      description: "Limit fields printed to the given comma-separated list",
      args: { name: "fields" },
    },
    {
      name: ["-x", "--catalog"],
      description:
        "Augment log lines with explanation texts from the message catalog",
    },
    {
      name: "--no-pager",
      description: "Do not pipe output into a pager",
    },
    {
      name: "--no-hostname",
      description: "Don't show the hostname field of log entries",
    },
    {
      name: ["-q", "--quiet"],
      description:
        "Suppress informational messages and warnings about inaccessible journals",
    },
    {
      name: "--system",
      description: "Show messages from system services and the kernel",
    },
    {
      name: "--user",
      description: "Show messages from services of the current user",
    },
    {
      name: ["-m", "--merge"],
      description:
        "Show entries interleaved from all available journals, including remote ones",
    },
    {
      name: ["-D", "--directory"],
      description: "Operate on the journal directory at the given path",
      args: { name: "path", template: "folders" },
    },
    {
      name: "--file",
      description: "Operate on the specified journal file(s)",
      isRepeatable: true,
      args: { name: "glob", template: "filepaths" },
    },
    {
      name: ["-t", "--identifier"],
      description: "Show messages for the specified syslog identifier",
      isRepeatable: true,
      args: { name: "identifier" },
    },
    {
      name: ["-F", "--field"],
      description:
        "Print all possible data values the specified field can take",
      args: { name: "field" },
    },
    {
      name: ["-N", "--fields"],
      description:
        "Print all field names currently used in all entries of the journal",
    },
    {
      name: "--disk-usage",
      description: "Show the current disk usage of all journal files",
    },
    {
      name: "--vacuum-size",
      description:
        "Remove the oldest archived journal files until the disk space falls below the given size",
      args: { name: "bytes" },
    },
    {
      name: "--vacuum-time",
      description: "Remove archived journal files older than the given time",
      args: { name: "time" },
    },
    {
      name: "--vacuum-files",
      description: "Leave only the given number of separate journal files",
      args: { name: "int" },
    },
    {
      name: "--rotate",
      description: "Request the journal daemon to rotate journal files",
    },
    {
      name: "--flush",
      description:
        "Flush all journal data from /run/log/journal into /var/log/journal",
    },
    {
      name: "--verify",
      description: "Check the journal file for internal consistency",
    },
    {
      name: ["-h", "--help"],
      description: "Show the help text and exit",
    },
    {
      name: "--version",
      description: "Print a short version string and exit",
    },
  ],
};

export default completionSpec;
