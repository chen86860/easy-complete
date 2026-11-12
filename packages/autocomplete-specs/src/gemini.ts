const icon =
  "data:image/png;base64,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";

const agentOptions: Fig.Option[] = [
  {
    name: ["-d", "--debug"],
    description: "Run in debug mode",
  },
  {
    name: ["-m", "--model"],
    description: "Model",
    args: { name: "model" },
  },
  {
    name: ["-p", "--prompt"],
    description: "Run in non-interactive mode with the given prompt",
    args: { name: "prompt" },
  },
  {
    name: ["-i", "--prompt-interactive"],
    description: "Execute the prompt and continue in interactive mode",
    args: { name: "prompt" },
  },
  {
    name: "--skip-trust",
    description: "Trust the current workspace for this session",
  },
  {
    name: ["-w", "--worktree"],
    description: "Start Gemini in a new git worktree",
    args: { name: "name", isOptional: true },
  },
  {
    name: ["-s", "--sandbox"],
    description: "Run in sandbox",
  },
  {
    name: ["-y", "--yolo"],
    description: "Automatically accept all actions",
  },
  {
    name: "--approval-mode",
    description: "Set the approval mode",
    args: {
      name: "mode",
      suggestions: ["default", "auto_edit", "yolo", "plan"],
    },
  },
  {
    name: "--policy",
    description: "Additional policy files or directories to load",
    args: { name: "path", template: "filepaths", isVariadic: true },
  },
  {
    name: "--admin-policy",
    description: "Additional admin policy files or directories to load",
    args: { name: "path", template: "filepaths", isVariadic: true },
  },
  {
    name: "--acp",
    description: "Starts the agent in ACP mode",
  },
  {
    name: "--experimental-acp",
    description: "Starts the agent in ACP mode",
  },
  {
    name: "--allowed-mcp-server-names",
    description: "Allowed MCP server names",
    args: { name: "server", isVariadic: true },
  },
  {
    name: "--allowed-tools",
    description: "Tools that are allowed to run without confirmation",
    args: { name: "tool", isVariadic: true },
  },
  {
    name: ["-e", "--extensions"],
    description: "Extensions to use",
    args: { name: "extension", isVariadic: true },
  },
  {
    name: ["-l", "--list-extensions"],
    description: "List all available extensions and exit",
  },
  {
    name: ["-r", "--resume"],
    description: "Resume a previous session",
    args: { name: "session" },
  },
  {
    name: "--session-file",
    description: "Load a session from a JSON file",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "--session-id",
    description: "Start a session with a manually provided UUID",
    args: { name: "uuid" },
  },
  {
    name: "--list-sessions",
    description: "List sessions for the current project and exit",
  },
  {
    name: "--delete-session",
    description: "Delete a session by index number",
    args: { name: "index" },
  },
  {
    name: "--include-directories",
    description: "Additional directories to include in the workspace",
    args: { name: "directory", template: "folders", isVariadic: true },
  },
  {
    name: "--screen-reader",
    description: "Enable screen reader mode",
  },
  {
    name: ["-o", "--output-format"],
    description: "CLI output format",
    args: { name: "format", suggestions: ["text", "json", "stream-json"] },
  },
  {
    name: "--raw-output",
    description: "Disable sanitization of model output",
  },
  {
    name: "--accept-raw-output-risk",
    description: "Suppress the security warning when using --raw-output",
  },
  {
    name: ["-v", "--version"],
    description: "Show version number",
  },
  {
    name: ["-h", "--help"],
    description: "Show help",
  },
];

const debugOption: Fig.Option = {
  name: ["-d", "--debug"],
  description: "Run in debug mode",
};

const scopeOption: Fig.Option = {
  name: "--scope",
  description: "Configuration scope",
  args: { name: "scope" },
};

const mcpSubcommands: Fig.Subcommand[] = [
  {
    name: "add",
    description: "Add a server",
    args: [
      { name: "name" },
      { name: "commandOrUrl" },
      { name: "args", isOptional: true, isVariadic: true },
    ],
  },
  {
    name: "remove",
    description: "Remove a server",
    args: { name: "name" },
  },
  { name: "list", description: "List all configured MCP servers" },
  {
    name: "enable",
    description: "Enable an MCP server",
    args: { name: "name" },
  },
  {
    name: "disable",
    description: "Disable an MCP server",
    args: { name: "name" },
  },
];

const extensionSubcommands: Fig.Subcommand[] = [
  {
    name: "install",
    description: "Install an extension from a git repository URL or local path",
    args: { name: "source", template: "filepaths" },
    options: [
      { name: "--auto-update", description: "Automatically update extension" },
      { name: "--pre-release", description: "Install a pre-release version" },
    ],
  },
  {
    name: "uninstall",
    description: "Uninstall one or more extensions",
    args: { name: "name", isOptional: true, isVariadic: true },
  },
  { name: "list", description: "List installed extensions" },
  {
    name: "update",
    description: "Update all extensions or a named extension",
    args: { name: "name", isOptional: true },
    options: [{ name: "--all", description: "Update all extensions" }],
  },
  {
    name: "disable",
    description: "Disable an extension",
    args: { name: "name" },
    options: [scopeOption],
  },
  {
    name: "enable",
    description: "Enable an extension",
    args: { name: "name" },
    options: [scopeOption],
  },
  {
    name: "link",
    description: "Link an extension from a local path",
    args: { name: "path", template: "folders" },
  },
  {
    name: "new",
    description: "Create a new extension from a boilerplate example",
    args: [
      { name: "path", template: "folders" },
      { name: "template", isOptional: true },
    ],
  },
  {
    name: "validate",
    description: "Validate an extension from a local path",
    args: { name: "path", template: "filepaths" },
  },
  {
    name: "config",
    description: "Configure extension settings",
    args: [
      { name: "name", isOptional: true },
      { name: "setting", isOptional: true },
    ],
  },
];

const skillSubcommands: Fig.Subcommand[] = [
  {
    name: "list",
    description: "List discovered agent skills",
    options: [{ name: "--all", description: "Show all skills" }],
  },
  {
    name: "enable",
    description: "Enable an agent skill",
    args: { name: "name" },
  },
  {
    name: "disable",
    description: "Disable an agent skill",
    args: { name: "name" },
    options: [scopeOption],
  },
  {
    name: "install",
    description:
      "Install an agent skill from a git repository URL or local path",
    args: { name: "source", template: "filepaths" },
    options: [
      scopeOption,
      {
        name: "--path",
        description: "Install path",
        args: { name: "path", template: "folders" },
      },
    ],
  },
  {
    name: "link",
    description: "Link an agent skill from a local path",
    args: { name: "path", template: "folders" },
  },
  {
    name: "uninstall",
    description: "Uninstall an agent skill",
    args: { name: "name" },
    options: [scopeOption],
  },
];

const hookSubcommands: Fig.Subcommand[] = [
  {
    name: "migrate",
    description: "Migrate hooks from Claude Code to Gemini CLI",
  },
];

const gemmaSubcommands: Fig.Subcommand[] = [
  { name: "setup", description: "Download and configure Gemma local routing" },
  { name: "start", description: "Start the LiteRT-LM server" },
  { name: "stop", description: "Stop the LiteRT-LM server" },
  { name: "status", description: "Check Gemma local routing status" },
  { name: "logs", description: "View LiteRT-LM server logs" },
];

const spec: Fig.Spec = {
  name: "gemini",
  description: "Gemini CLI",
  icon,
  args: {
    name: "query",
    isOptional: true,
    isVariadic: true,
  },
  options: agentOptions,
  subcommands: [
    {
      name: "mcp",
      description: "Manage MCP servers",
      icon,
      options: [debugOption],
      subcommands: mcpSubcommands,
    },
    {
      name: ["extensions", "extension"],
      description: "Manage Gemini CLI extensions",
      icon,
      options: [debugOption],
      subcommands: extensionSubcommands,
    },
    {
      name: ["skills", "skill"],
      description: "Manage agent skills",
      icon,
      options: [debugOption],
      subcommands: skillSubcommands,
    },
    {
      name: ["hooks", "hook"],
      description: "Manage Gemini CLI hooks",
      icon,
      options: [debugOption],
      subcommands: hookSubcommands,
    },
    {
      name: "gemma",
      description: "Manage local Gemma model routing",
      icon,
      options: [debugOption],
      subcommands: gemmaSubcommands,
    },
  ],
};

export default spec;
