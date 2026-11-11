const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Show help",
  priority: 1,
};

const sessionsGenerator: Fig.Generator = {
  script: ["herdr", "session", "list"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim().split(/\s+/)[0])
      .filter((name) => name && !name.startsWith("-"))
      .map((name) => ({
        name,
        description: "Session",
        icon: "fig://icon?type=box",
      })),
};

const sub = (
  name: string | string[],
  description: string,
  args?: Fig.Arg | Fig.Arg[],
): Fig.Subcommand => ({
  name,
  description,
  ...(args ? { args } : {}),
  options: [helpOption],
});

const completionSpec: Fig.Spec = {
  name: "herdr",
  description: "Terminal workspace manager for AI coding agents",
  subcommands: [
    {
      name: "status",
      description: "Show local client and running server status",
      args: {
        name: "target",
        suggestions: ["server", "client"],
        isOptional: true,
      },
      options: [helpOption],
    },
    {
      name: "update",
      description: "Download and install the latest version",
      options: [
        {
          name: "--handoff",
          description: "Opt into live handoff for update",
        },
        helpOption,
      ],
    },
    {
      name: "completion",
      description: "Generate shell completions",
      args: {
        name: "shell",
        suggestions: ["zsh", "bash", "fish"],
      },
      options: [helpOption],
    },
    {
      name: "channel",
      description: "Manage stable and preview update channels",
      subcommands: [
        sub("show", "Print the configured update channel"),
        sub("set", "Choose the update channel", {
          name: "channel",
          suggestions: ["stable", "preview"],
        }),
      ],
      options: [helpOption],
    },
    {
      name: "config",
      description: "Manage local configuration",
      subcommands: [
        sub("check", "Validate config.toml and print diagnostics"),
        sub("reset-keys", "Reset custom keybindings"),
      ],
      options: [helpOption],
    },
    {
      name: "server",
      description: "Run or control the headless server",
      subcommands: [
        sub("stop", "Stop the running server"),
        sub("reload-config", "Reload config in the running server"),
        sub("agent-manifests", "Show active agent detection manifests"),
        sub("update-agent-manifests", "Fetch and reload agent manifests"),
        sub("reload-agent-manifests", "Reload local agent manifest overrides"),
      ],
      options: [helpOption],
    },
    {
      name: "api",
      description: "Inspect socket API metadata and live runtime state",
      subcommands: [
        sub("snapshot", "Print the live session snapshot"),
        sub("schema", "Print or write the bundled API schema"),
      ],
      options: [helpOption],
    },
    {
      name: "session",
      description: "Manage named persistent sessions",
      subcommands: [
        sub("list", "List sessions"),
        sub("attach", "Attach to a session", {
          name: "name",
          generators: sessionsGenerator,
        }),
        sub("stop", "Stop a session", {
          name: "name",
          generators: sessionsGenerator,
        }),
        sub("delete", "Delete a stopped session", {
          name: "name",
          generators: sessionsGenerator,
        }),
      ],
      options: [helpOption],
    },
    {
      name: "workspace",
      description: "Workspace helpers over the socket API",
      subcommands: [
        sub("list", "List workspaces"),
        sub("create", "Create a workspace"),
        sub("get", "Show a workspace", { name: "id" }),
        sub("focus", "Focus a workspace", { name: "id" }),
        sub("rename", "Rename a workspace", [{ name: "id" }, { name: "name" }]),
        sub("report-metadata", "Report display-only workspace metadata"),
        sub("close", "Close a workspace", { name: "id" }),
      ],
      options: [helpOption],
    },
    {
      name: "worktree",
      description: "Manage Git worktree-backed workspaces",
      subcommands: [
        sub("list", "List worktree workspaces"),
        sub("create", "Create and open a Git worktree", {
          name: "name",
          isOptional: true,
        }),
        sub("open", "Open an existing Git worktree", {
          name: "name",
          isOptional: true,
        }),
        sub("remove", "Remove a worktree checkout", {
          name: "name",
          isOptional: true,
        }),
      ],
      options: [helpOption],
    },
    {
      name: "tab",
      description: "Tab helpers over the socket API",
      subcommands: [
        sub("list", "List tabs"),
        sub("create", "Create a tab"),
        sub("get", "Show a tab", { name: "id" }),
        sub("focus", "Focus a tab", { name: "id" }),
        sub("rename", "Rename a tab", [{ name: "id" }, { name: "name" }]),
        sub("close", "Close a tab", { name: "id" }),
      ],
      options: [helpOption],
    },
    {
      name: "pane",
      description: "Pane control helpers over the socket API",
      subcommands: [
        sub("list", "List panes"),
        sub("current", "Show the current pane"),
        sub("get", "Show a pane", { name: "id" }),
        sub("layout", "Show pane layout information"),
        sub("process-info", "Show pane process information"),
        sub("neighbor", "Find a pane neighbor"),
        sub("edges", "Show pane edge information"),
        sub("focus", "Focus a neighboring pane"),
        sub("resize", "Resize a pane split"),
        sub("zoom", "Toggle or set pane zoom"),
        sub("read", "Read pane terminal output"),
        sub("rename", "Rename a pane", [{ name: "id" }, { name: "name" }]),
        sub("input", "Set pane input routing"),
        sub("split", "Split a pane"),
        sub("swap", "Swap panes"),
        sub("move", "Move a pane"),
        sub("close", "Close a pane"),
      ],
      options: [helpOption],
    },
    {
      name: "agent",
      description: "Agent/terminal helpers over the socket API",
      subcommands: [
        sub("list", "List agents"),
        sub("get", "Show an agent", { name: "id" }),
        sub("read", "Read agent terminal output", { name: "id" }),
        sub("send-keys", "Send key presses to an agent", [
          { name: "id" },
          { name: "keys" },
        ]),
        sub("prompt", "Submit a prompt to an agent", [
          { name: "id" },
          { name: "prompt" },
        ]),
        sub("rename", "Rename an agent", [{ name: "id" }, { name: "name" }]),
        sub("focus", "Focus an agent", { name: "id" }),
        sub("wait", "Wait until an agent reaches a requested state", {
          name: "id",
        }),
        sub("attach", "Attach directly to an agent terminal", { name: "id" }),
        sub("start", "Start a supported interactive agent in a pane"),
        sub("explain", "Explain agent detection state"),
      ],
      options: [helpOption],
    },
    {
      name: "notification",
      description: "Notification helpers over the socket API",
      subcommands: [sub("show", "Show a notification")],
      options: [helpOption],
    },
    {
      name: "integration",
      description: "Manage built-in agent integrations",
      subcommands: [
        sub("install", "Install an integration", { name: "name" }),
        sub("uninstall", "Uninstall an integration", { name: "name" }),
        sub("status", "Show integration status"),
      ],
      options: [helpOption],
    },
  ],
  options: [
    {
      name: "--no-session",
      description: "Run monolithically (no server/client, escape hatch)",
    },
    {
      name: "--session",
      description: "Use or create a named persistent session",
      args: { name: "name", generators: sessionsGenerator },
    },
    {
      name: "--remote",
      description: "Attach through SSH to a remote Herdr server",
      args: { name: "target" },
    },
    {
      name: "--remote-keybindings",
      description: "Keybindings for --remote app attach",
      args: {
        name: "mode",
        suggestions: ["local", "server"],
        default: "local",
      },
    },
    {
      name: "--handoff",
      description: "Opt into live handoff for update or remote attach",
    },
    {
      name: "--default-config",
      description: "Print default configuration and exit",
    },
    {
      name: "--skill",
      description: "Print the agent skill file and exit",
    },
    {
      name: ["-V", "--version"],
      description: "Print version and exit",
    },
    helpOption,
  ],
};

export default completionSpec;
