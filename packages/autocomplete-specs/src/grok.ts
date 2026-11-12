/*
 *  Shared options
 */
const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Print help",
  priority: 1,
};

const debugOptions: Fig.Option[] = [
  {
    name: "--debug",
    description: "Enable debug logging",
  },
  {
    name: "--debug-file",
    description: "Write debug logs to FILE",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "--leader-socket",
    description: "Use a custom leader socket path",
    args: { name: "path", template: "filepaths" },
  },
];

const commonOptions: Fig.Option[] = [...debugOptions, helpOption];

const jsonOption: Fig.Option = {
  name: "--json",
  description: "Emit machine-readable JSON output",
};

/*
 *  Generators
 */
const modelsGenerator: Fig.Generator = {
  script: ["grok", "models"],
  cache: { ttl: 3600000 },
  postProcess: (output) =>
    output
      .split("\n")
      .filter((line) => line.trim().startsWith("*"))
      .map(
        (line) =>
          line
            .trim()
            .replace(/^\*\s*/, "")
            .split(/\s+/)[0],
      )
      .filter(Boolean)
      .map((model) => ({
        name: model,
        description: "Model",
        icon: "fig://icon?type=asterisk",
      })),
};

const sessionsGenerator: Fig.Generator = {
  script: ["grok", "sessions", "list", "-n", "50"],
  postProcess: (output) =>
    output
      .split("\n")
      .map(
        (line) =>
          line
            .trim()
            .match(
              /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
            )?.[0],
      )
      .filter((id): id is string => Boolean(id))
      .map((id) => ({
        name: id,
        description: "Session",
        icon: "fig://icon?type=commit",
      })),
};

const mcpServersGenerator: Fig.Generator = {
  script: ["grok", "mcp", "list"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/[\s:]/)[0])
      .filter((name) => name && !name.startsWith("-"))
      .map((name) => ({
        name,
        description: "MCP server",
        icon: "fig://icon?type=gear",
      })),
};

const pluginsGenerator: Fig.Generator = {
  script: ["grok", "plugin", "list"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/[\s:]/)[0])
      .filter((name) => name && !name.startsWith("-"))
      .map((name) => ({
        name,
        description: "Plugin",
        icon: "fig://icon?type=package",
      })),
};

const sessionIdArg: Fig.Arg = {
  name: "session_id",
  description: "Session ID",
  generators: sessionsGenerator,
};

const scopeOption: Fig.Option = {
  name: ["-s", "--scope"],
  description: "Config to write to",
  args: {
    name: "scope",
    suggestions: [
      { name: "user", description: "`~/.grok/config.toml`, all projects" },
      { name: "project", description: "`./.grok/config.toml`, this directory" },
    ],
    default: "user",
  },
};

/*
 *  Subcommands
 */
const agentCommand: Fig.Subcommand = {
  name: "agent",
  description: "Run Grok without the interactive UI",
  subcommands: [
    {
      name: "stdio",
      description: "Run the agent over stdio",
      options: commonOptions,
    },
    {
      name: "headless",
      description: "Run the agent headlessly over the Grok WebSocket relay",
      options: [
        {
          name: "--grok-ws-origin",
          description: "Grok WebSocket origin",
          args: { name: "origin" },
        },
        {
          name: "--grok-ws-url",
          description: "Grok WebSocket URL",
          args: { name: "url" },
        },
        ...commonOptions,
      ],
    },
    {
      name: "serve",
      description: "Run the agent as a WebSocket server",
      options: [
        {
          name: "--bind",
          description: "Address for the server to listen on",
          args: { name: "bind", default: "127.0.0.1:2419" },
        },
        {
          name: "--secret",
          description: "Secret token for client authentication",
          args: { name: "secret" },
        },
        {
          name: "--remote",
          description: "Remote agent URL for proxy mode",
          args: { name: "remote" },
        },
        {
          name: "--grok-ws-origin",
          description: "Grok WebSocket origin",
          args: { name: "origin" },
        },
        {
          name: "--grok-ws-url",
          description: "Grok WebSocket URL",
          args: { name: "url" },
        },
        ...commonOptions,
      ],
    },
    {
      name: "leader",
      description: "Run as the shared leader process for other clients",
      options: commonOptions,
    },
  ],
  options: [
    {
      name: ["--reauth", "----reauthenticate"],
      description: "Run authentication before starting the agent",
    },
    {
      name: ["-m", "--model"],
      description: "Model ID to use",
      args: { name: "model", generators: modelsGenerator },
    },
    {
      name: ["--reasoning-effort", "--effort"],
      description: "Reasoning effort for reasoning models",
      args: { name: "effort" },
    },
    {
      name: "--always-approve",
      description: "Auto-approve all tool executions",
    },
    {
      name: "--agent-profile",
      description: "Path to an agent profile file",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--plugin-dir",
      description: "Load a plugin from this directory for this process only",
      args: { name: "dir", template: "folders" },
      isRepeatable: true,
    },
    {
      name: "--leader",
      description: "Connect to a shared leader process instead of a new agent",
    },
    {
      name: "--no-leader",
      description: "Start a new agent even when config enables leader mode",
    },
    {
      name: "--cli-chat-proxy-base-url",
      description: "Override the CLI chat proxy base URL",
      args: { name: "url" },
    },
    {
      name: "--xai-api-base-url",
      description: "Override the public xAI API base URL",
      args: { name: "url" },
    },
    {
      name: "--grok-ws-origin",
      description: "Grok WebSocket origin",
      args: { name: "origin" },
    },
    {
      name: "--grok-ws-url",
      description: "Grok WebSocket URL",
      args: { name: "url" },
    },
    ...commonOptions,
  ],
};

const mcpCommand: Fig.Subcommand = {
  name: "mcp",
  description: "Manage MCP server configurations",
  subcommands: [
    {
      name: "list",
      description: "List configured MCP servers",
      options: [jsonOption, ...commonOptions],
    },
    {
      name: "add",
      description: "Add or update an MCP server",
      args: [
        { name: "name", description: "Server name" },
        {
          name: "command_or_url",
          description: "Command to launch (stdio) or URL to connect to",
          isOptional: true,
        },
        {
          name: "args",
          description: "Arguments passed to the server command",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [
        {
          name: ["-t", "--transport"],
          description: "Transport type (defaults to stdio)",
          args: {
            name: "transport",
            suggestions: [
              { name: "stdio", description: "Launch a local process" },
              { name: "http", description: "Streamable HTTP" },
              { name: "sse", description: "Server-Sent Events" },
            ],
          },
        },
        scopeOption,
        {
          name: ["-e", "--env"],
          description: "Environment variable for the server process",
          args: { name: "KEY=value" },
          isRepeatable: true,
        },
        {
          name: ["-H", "--header"],
          description: "HTTP header for remote servers",
          args: { name: "NAME: VALUE" },
          isRepeatable: true,
        },
        ...commonOptions,
      ],
    },
    {
      name: "remove",
      description: "Remove an MCP server",
      args: { name: "name", generators: mcpServersGenerator },
      options: [
        {
          name: ["-s", "--scope"],
          description: "Config to remove from (all scopes when omitted)",
          args: { name: "scope", suggestions: ["user", "project"] },
        },
        ...commonOptions,
      ],
    },
    {
      name: "enable",
      description: "Enable an MCP server",
      args: { name: "name", generators: mcpServersGenerator },
      options: commonOptions,
    },
    {
      name: "disable",
      description: "Disable an MCP server",
      args: { name: "name", generators: mcpServersGenerator },
      options: commonOptions,
    },
    {
      name: "doctor",
      description: "Diagnose MCP server configuration and connectivity",
      args: {
        name: "name",
        generators: mcpServersGenerator,
        isOptional: true,
      },
      options: [jsonOption, ...commonOptions],
    },
  ],
  options: commonOptions,
};

const pluginCommand: Fig.Subcommand = {
  name: "plugin",
  description: "Manage plugins and marketplace sources",
  subcommands: [
    {
      name: "list",
      description: "List installed plugins",
      options: commonOptions,
    },
    {
      name: "install",
      description: "Install a plugin from a git URL or local path",
      args: {
        name: "source",
        description: "Git URL, GitHub shorthand (user/repo), or local path",
      },
      options: [
        {
          name: "--trust",
          description: "Trust the plugin immediately",
        },
        ...commonOptions,
      ],
    },
    {
      name: ["uninstall", "rm", "remove"],
      description: "Uninstall an installed plugin by name",
      args: { name: "name", generators: pluginsGenerator },
      options: [
        {
          name: "--confirm",
          description: "Skip confirmation for multi-plugin repos",
        },
        {
          name: "--keep-data",
          description: "Preserve the plugin's persistent data directory",
        },
        ...commonOptions,
      ],
    },
    {
      name: "update",
      description: "Update installed plugin(s)",
      args: {
        name: "name",
        generators: pluginsGenerator,
        isOptional: true,
      },
      options: commonOptions,
    },
    {
      name: "enable",
      description: "Enable a disabled plugin",
      args: { name: "name", generators: pluginsGenerator },
      options: commonOptions,
    },
    {
      name: "disable",
      description: "Disable a plugin without uninstalling it",
      args: { name: "name", generators: pluginsGenerator },
      options: commonOptions,
    },
    {
      name: "details",
      description: "Show a plugin's component inventory",
      args: { name: "name", generators: pluginsGenerator },
      options: commonOptions,
    },
    {
      name: "validate",
      description: "Validate a plugin manifest",
      args: { name: "path", template: "filepaths", isOptional: true },
      options: commonOptions,
    },
    {
      name: "tag",
      description: "Create a release git tag from the manifest version",
      options: commonOptions,
    },
    {
      name: "marketplace",
      description: "Manage marketplace sources",
      subcommands: [
        {
          name: "list",
          description: "List configured marketplace sources and their plugins",
          options: commonOptions,
        },
        {
          name: "add",
          description: "Add a marketplace source",
          args: { name: "source" },
          options: commonOptions,
        },
        {
          name: "remove",
          description: "Remove a marketplace source and uninstall its plugins",
          args: { name: "source" },
          options: commonOptions,
        },
        {
          name: "update",
          description: "Refresh marketplace source(s) and sync git caches",
          args: { name: "source", isOptional: true },
          options: commonOptions,
        },
      ],
      options: commonOptions,
    },
  ],
  options: commonOptions,
};

const worktreeCommand: Fig.Subcommand = {
  name: "worktree",
  description: "Manage git worktrees",
  subcommands: [
    {
      name: ["list", "ls"],
      description: "List tracked worktrees",
      options: [
        {
          name: "--repo",
          description: "Filter by repository",
          args: { name: "repo" },
        },
        {
          name: "--type",
          description: "Filter by worktree type",
          args: { name: "type" },
        },
        { name: "--json", description: "Emit JSON output" },
        { name: "--all", description: "Include all worktrees" },
        ...commonOptions,
      ],
    },
    {
      name: "show",
      description: "Show details for a specific worktree",
      args: { name: "id" },
      options: commonOptions,
    },
    {
      name: "rm",
      description: "Remove worktrees",
      args: { name: "ids", isVariadic: true },
      options: [
        { name: ["-f", "--force"], description: "Force removal" },
        { name: "--dry-run", description: "Show what would be removed" },
        ...commonOptions,
      ],
    },
    {
      name: "gc",
      description: "Garbage-collect orphaned/stale worktrees",
      options: [
        { name: "--dry-run", description: "Show what would be collected" },
        {
          name: "--max-age",
          description: "Maximum age before a worktree is considered stale",
          args: { name: "max_age" },
        },
        { name: ["-f", "--force"], description: "Force collection" },
        ...commonOptions,
      ],
    },
    {
      name: "db",
      description: "Database maintenance",
      options: commonOptions,
    },
  ],
  options: commonOptions,
};

const completionSpec: Fig.Spec = {
  name: "grok",
  description: "Grok Build TUI — xAI's agentic coding CLI",
  args: {
    name: "prompt",
    description: 'Initial prompt, e.g. grok "fix the bug"',
    isOptional: true,
  },
  subcommands: [
    agentCommand,
    {
      name: "completions",
      description: "Generate shell completion scripts",
      args: {
        name: "shell",
        description: "Target shell",
        suggestions: ["bash", "elvish", "fish", "powershell", "zsh"],
      },
      options: commonOptions,
    },
    {
      name: "dashboard",
      description: "Open the Agent Dashboard view at startup",
      options: commonOptions,
    },
    {
      name: "doctor",
      description: "Check terminal, clipboard, color, and input support",
      subcommands: [
        {
          name: "fix",
          description: "Apply an automatic fix",
          args: {
            name: "id",
            description: "Named fix to apply (omit to list fixes)",
            isOptional: true,
          },
          options: [
            {
              name: "--yes",
              description: "Apply the displayed changes without confirmation",
            },
            ...commonOptions,
          ],
        },
      ],
      options: [
        {
          name: "--json",
          description: "Print the diagnostic report as JSON",
        },
        ...commonOptions,
      ],
    },
    {
      name: "export",
      description: "Export a session transcript as Markdown",
      args: [
        sessionIdArg,
        {
          name: "output",
          description: "Output file path (default: stdout)",
          template: "filepaths",
          isOptional: true,
        },
      ],
      options: [
        {
          name: ["-c", "--clipboard"],
          description: "Copy to clipboard instead of writing to stdout",
        },
        ...commonOptions,
      ],
    },
    {
      name: "inspect",
      description: "Show the configuration Grok discovers for this directory",
      options: [jsonOption, ...commonOptions],
    },
    {
      name: "leader",
      description: "Manage running leader processes",
      subcommands: [
        {
          name: "list",
          description: "List running leader processes",
          options: commonOptions,
        },
        {
          name: "info",
          description: "Show details for a leader process",
          options: [
            {
              name: "--pid",
              description: "Leader process ID from `grok leader list`",
              args: { name: "pid" },
            },
            jsonOption,
            ...commonOptions,
          ],
        },
        {
          name: "kill",
          description: "Stop all running leader processes",
          options: commonOptions,
        },
      ],
      options: commonOptions,
    },
    {
      name: "login",
      description: "Sign in to Grok",
      options: [
        {
          name: "--oauth",
          description: "Use Grok OAuth via auth.x.ai",
        },
        {
          name: ["--device-auth", "--device-code"],
          description:
            "Use device-code authentication for headless environments",
        },
        ...commonOptions,
      ],
    },
    {
      name: "logout",
      description: "Sign out and clear cached credentials",
      options: commonOptions,
    },
    mcpCommand,
    {
      name: "memory",
      description: "Manage cross-session memory",
      subcommands: [
        {
          name: "clear",
          description: "Clear memory files (workspace by default)",
          options: [
            {
              name: "--workspace",
              description: "Clear workspace-scoped memory",
            },
            { name: "--global", description: "Clear global MEMORY.md" },
            {
              name: "--all",
              description: "Clear both workspace and global memory",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip confirmation prompt",
            },
            ...commonOptions,
          ],
        },
      ],
      options: commonOptions,
    },
    {
      name: "models",
      description: "List available models and exit",
      options: commonOptions,
    },
    pluginCommand,
    {
      name: "sessions",
      description: "List, search, or restore sessions",
      subcommands: [
        {
          name: "list",
          description: "List recent sessions",
          options: [
            {
              name: ["-n", "--limit"],
              description: "Maximum number of sessions to show",
              args: { name: "limit", default: "20" },
            },
            ...commonOptions,
          ],
        },
        {
          name: "search",
          description: "Search sessions by keyword",
          args: { name: "query" },
          options: [
            {
              name: ["-n", "--limit"],
              description: "Maximum number of sessions to show",
              args: { name: "limit", default: "20" },
            },
            ...commonOptions,
          ],
        },
        {
          name: "delete",
          description: "Permanently delete a session from history",
          args: { name: "id", generators: sessionsGenerator },
          options: commonOptions,
        },
      ],
      options: commonOptions,
    },
    {
      name: "setup",
      description: "Fetch and install managed configuration",
      options: [
        {
          name: "--json",
          description: "Print the fetched configuration as JSON",
        },
        ...commonOptions,
      ],
    },
    {
      name: "trace",
      description: "Export or upload session trace data",
      args: sessionIdArg,
      options: [
        {
          name: "--local",
          description: "Save locally only, skip remote upload",
        },
        {
          name: ["-o", "--output"],
          description: "Output path",
          args: { name: "output", template: "filepaths" },
        },
        jsonOption,
        ...commonOptions,
      ],
    },
    {
      name: "update",
      description: "Check for updates or install a specific version",
      options: [
        {
          name: "--check",
          description: "Check for updates without installing",
        },
        jsonOption,
        {
          name: "--force-reinstall",
          description: "Force re-download and install",
        },
        {
          name: "--version",
          description: "Install a specific version",
          args: { name: "version" },
        },
        {
          name: "--alpha",
          description: "Switch to the alpha release channel",
        },
        {
          name: "--stable",
          description: "Switch to the stable release channel",
        },
        ...commonOptions,
      ],
    },
    {
      name: ["version", "v"],
      description: "Print version information",
      options: commonOptions,
    },
    worktreeCommand,
    {
      name: "wrap",
      description: "Run any command with local clipboard support (OSC 52)",
      args: {
        name: "cmd",
        description: "Command to run, followed by its arguments",
        isCommand: true,
      },
      options: commonOptions,
    },
    {
      name: "help",
      description: "Print this message or the help of the given subcommand(s)",
      args: { name: "subcommand", isOptional: true },
    },
  ],
  options: [
    {
      name: "--agent",
      description: "Agent name or definition file path",
      args: { name: "name" },
    },
    {
      name: "--agents",
      description: "Inline subagent definitions as JSON",
      args: { name: "json" },
    },
    {
      name: ["--allow", "--allowedTools"],
      description: "Permission allow rule",
      args: { name: "rule" },
      isRepeatable: true,
    },
    {
      name: "--always-approve",
      description: "Auto-approve all tool executions",
    },
    {
      name: ["-c", "--continue"],
      description: "Continue the most recent session for this directory",
    },
    {
      name: "--cwd",
      description: "Working directory",
      args: { name: "cwd", template: "folders" },
    },
    {
      name: ["--deny", "--disallowedTools"],
      description: "Permission deny rule",
      args: { name: "rule" },
      isRepeatable: true,
    },
    {
      name: "--disable-web-search",
      description: "Disable web search and web fetch tools",
    },
    {
      name: "--disallowed-tools",
      description: "Built-in tools to remove (comma-separated)",
      args: { name: "tools" },
    },
    {
      name: "--experimental-memory",
      description: "Enable cross-session memory",
    },
    {
      name: "--fork-session",
      description: "When resuming, create a new session ID",
    },
    {
      name: "--fullscreen",
      description: "Open in the standard fullscreen TUI for this session",
    },
    {
      name: "--include-partial-messages",
      description: "Emit incremental `stream_event` lines",
    },
    {
      name: "--json-schema",
      description:
        "JSON Schema for structured output (implies --output-format json)",
      args: { name: "schema" },
    },
    {
      name: ["-m", "--model"],
      description: "Model ID to use",
      args: { name: "model", generators: modelsGenerator },
    },
    {
      name: "--max-turns",
      description: "Maximum number of agent turns",
      args: { name: "n" },
    },
    {
      name: "--minimal",
      description: "Experimental: scrollback-native rendering",
    },
    {
      name: "--no-alt-screen",
      description: "Run inline instead of using the terminal alternate screen",
    },
    {
      name: "--no-memory",
      description: "Disable cross-session memory for this session",
    },
    { name: "--no-plan", description: "Disable plan mode" },
    { name: "--no-subagents", description: "Disable subagent spawning" },
    {
      name: "--oauth",
      description: "Use OAuth when the welcome screen starts authentication",
    },
    {
      name: "--output-format",
      description: "Output format for headless mode",
      args: {
        name: "output_format",
        suggestions: [
          { name: "plain", description: "Plain text (default)" },
          { name: "json", description: "JSON" },
          {
            name: "streaming-json",
            description: "NDJSON of the agent native ACP session updates",
          },
          {
            name: "streaming-messages-json",
            description: "NDJSON in the Anthropic Messages API wire format",
          },
        ],
        default: "plain",
      },
    },
    {
      name: ["-p", "--single"],
      description:
        "Single-turn prompt; prints the response to stdout and exits",
      args: { name: "prompt" },
    },
    {
      name: "--permission-mode",
      description: "Permission mode",
      args: {
        name: "mode",
        suggestions: [
          "default",
          "acceptEdits",
          "auto",
          "dontAsk",
          "bypassPermissions",
          "plan",
        ],
      },
    },
    {
      name: "--prompt-file",
      description: "Single-turn prompt from a file",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--prompt-json",
      description: "Single-turn prompt as JSON content blocks",
      args: { name: "json" },
    },
    {
      name: ["-r", "--resume"],
      description: "Resume a session by ID or title, or the most recent",
      args: {
        name: "session_id_or_title",
        generators: sessionsGenerator,
        isOptional: true,
      },
    },
    {
      name: ["--reasoning-effort", "--effort"],
      description: "Reasoning effort for reasoning models",
      args: { name: "effort" },
    },
    {
      name: "--restore-code",
      description: "Check out the original session's commit when resuming",
    },
    {
      name: "--rules",
      description: "Extra rules to append to the system prompt",
      args: { name: "rules" },
    },
    {
      name: ["-s", "--session-id"],
      description: "Use a specific session UUID for a new conversation",
      args: { name: "session_id" },
    },
    {
      name: "--sandbox",
      description: "Sandbox profile for filesystem and network access",
      args: { name: "profile" },
    },
    {
      name: ["--system-prompt-override", "--system-prompt"],
      description: "Override the agent's system prompt",
      args: { name: "prompt" },
    },
    {
      name: "--tools",
      description: "Built-in tools to allow (comma-separated)",
      args: { name: "tools" },
    },
    {
      name: ["-v", "--version"],
      description: "Print version",
    },
    {
      name: "--verbatim",
      description: "Send the prompt exactly as given",
    },
    {
      name: ["-w", "--worktree"],
      description: "Start the session in a new git worktree, optionally named",
      args: { name: "worktree", isOptional: true },
    },
    {
      name: ["--worktree-ref", "--ref"],
      description: "Branch, tag, or commit to base the worktree on",
      args: { name: "worktree_ref" },
    },
    ...debugOptions,
    helpOption,
  ],
};

export default completionSpec;
