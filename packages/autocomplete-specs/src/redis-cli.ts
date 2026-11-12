const completionSpec: Fig.Spec = {
  name: "redis-cli",
  description: "Command line client for Redis",
  args: {
    name: "command",
    description:
      "Redis command to run (e.g. GET key). Omit to start interactive mode",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    {
      name: "-h",
      description: "Server hostname (default 127.0.0.1)",
      args: { name: "hostname" },
    },
    {
      name: "-p",
      description: "Server port (default 6379)",
      args: { name: "port" },
    },
    {
      name: "-s",
      description: "Server socket (overrides hostname and port)",
      args: { name: "socket", template: "filepaths" },
    },
    {
      name: "-a",
      description: "Password to use when connecting to the server",
      args: { name: "password" },
    },
    {
      name: "--user",
      description: "Used to send ACL style 'AUTH username pass'. Needs -a",
      args: { name: "username" },
    },
    {
      name: "--pass",
      description: "Alias of -a, for consistency with --user",
      args: { name: "password" },
    },
    {
      name: "--askpass",
      description: "Force user to input password with mask from STDIN",
    },
    {
      name: "-u",
      description: "Server URI (e.g. redis://user:pass@host:port/db)",
      args: { name: "uri" },
    },
    {
      name: "-n",
      description: "Database number",
      args: { name: "db" },
    },
    {
      name: "-3",
      description: "Start session in RESP3 protocol mode",
    },
    {
      name: "-x",
      description: "Read last argument from STDIN",
    },
    {
      name: "-X",
      description: "Read <tag> argument from STDIN",
      args: { name: "tag" },
    },
    {
      name: "-r",
      description: "Execute specified command N times",
      args: { name: "count" },
    },
    {
      name: "-i",
      description:
        "Wait <interval> seconds per command when using -r (with -r 0 repeats forever)",
      args: { name: "interval" },
    },
    {
      name: "-d",
      description:
        "Delimiter between response bulks for raw formatting (default \\n)",
      args: { name: "delimiter" },
    },
    {
      name: "-D",
      description:
        "Delimiter between responses for raw formatting (default \\n)",
      args: { name: "delimiter" },
    },
    {
      name: "-c",
      description: "Enable cluster mode (follow -ASK and -MOVED redirections)",
    },
    {
      name: "-e",
      description: "Return exit error code when command execution fails",
    },
    {
      name: "--tls",
      description: "Establish a secure TLS connection",
    },
    {
      name: "--sni",
      description: "Server name indication for TLS",
      args: { name: "host" },
    },
    {
      name: "--cacert",
      description: "CA certificate file to verify with",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--cacertdir",
      description: "Directory where trusted CA certificates are stored",
      args: { name: "dir", template: "folders" },
    },
    {
      name: "--cert",
      description: "Client certificate to authenticate with",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--key",
      description: "Private key file to authenticate with",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--raw",
      description:
        "Use raw formatting for replies (default when STDOUT is not a tty)",
    },
    {
      name: "--no-raw",
      description: "Force formatted output even when STDOUT is not a tty",
    },
    {
      name: "--quoted-input",
      description: "Force input to be handled as quoted strings",
    },
    {
      name: "--csv",
      description: "Output in CSV format",
    },
    {
      name: "--json",
      description:
        "Output in JSON format (default RESP3, use --resp2 to switch)",
    },
    {
      name: "--show-pushes",
      description: "Whether to print RESP3 PUSH messages (yes/no, default yes)",
      args: { name: "yn", suggestions: ["yes", "no"] },
    },
    {
      name: "--stat",
      description: "Print rolling stats about server (mem, clients, etc)",
    },
    {
      name: "--latency",
      description: "Enter a special mode continuously sampling latency",
    },
    {
      name: "--latency-history",
      description: "Like --latency but tracks latency changes over time",
    },
    {
      name: "--latency-dist",
      description: "Shows latency as a spectrum, requires xterm 256 colors",
    },
    {
      name: "--lru-test",
      description: "Simulate a cache workload with an 80-20 distribution",
      args: { name: "keys" },
    },
    {
      name: "--replica",
      description:
        "Simulate a replica showing commands received from the master",
    },
    {
      name: "--rdb",
      description: "Transfer an RDB dump from remote server to local file",
      args: { name: "filename", template: "filepaths" },
    },
    {
      name: "--functions-rdb",
      description:
        "Like --rdb but only get the functions (not the keys) when getting the RDB dump file",
      args: { name: "filename", template: "filepaths" },
    },
    {
      name: "--pipe",
      description: "Transfer raw Redis protocol from stdin to server",
    },
    {
      name: "--pipe-mode",
      description: "Send all commands read from stdin in pipe mode",
    },
    {
      name: "--bigkeys",
      description:
        "Sample Redis keys looking for keys with many elements (summary)",
    },
    {
      name: "--memkeys",
      description:
        "Sample Redis keys looking for keys consuming a lot of memory",
    },
    {
      name: "--hotkeys",
      description:
        "Sample Redis keys looking for hot keys (only with maxmemory-policy *lfu)",
    },
    {
      name: "--scan",
      description: "List all keys using the SCAN command",
    },
    {
      name: "--pattern",
      description: "Keys pattern when using --scan, --bigkeys or --hotkeys",
      args: { name: "pat" },
    },
    {
      name: "--count",
      description: "Count option when using --scan, --bigkeys or --hotkeys",
      args: { name: "count" },
    },
    {
      name: "--intrinsic-latency",
      description:
        "Run a test to measure intrinsic system latency for the given seconds",
      args: { name: "sec" },
    },
    {
      name: "--eval",
      description:
        "Send an EVAL command using the Lua script at the given path",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: "--cluster",
      description: "Run a redis-cluster management command",
      args: {
        name: "subcommand",
        suggestions: [
          "create",
          "check",
          "info",
          "fix",
          "reshard",
          "rebalance",
          "add-node",
          "del-node",
          "call",
          "set-timeout",
          "import",
          "backup",
          "help",
        ],
      },
    },
    {
      name: "-t",
      description: "Server connection timeout in seconds (decimals allowed)",
      args: { name: "timeout" },
    },
    {
      name: "--no-auth-warning",
      description:
        "Don't show warning message when using password on command line",
    },
    {
      name: "--memkeys-samples",
      description: "Sample size used for --memkeys",
      args: { name: "n" },
    },
    {
      name: "--version",
      description: "Output version and exit",
    },
    {
      name: "--help",
      description: "Output this help and exit",
    },
  ],
};

export default completionSpec;
