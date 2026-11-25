const completionSpec: Fig.Spec = {
  name: "atuin",
  description: "Magical shell history",
  subcommands: [
    {
      name: "search",
      description: "Interactive history search",
      options: [
        {
          name: ["--cwd", "-c"],
          description: "Filter search result by directory",
          args: {
            name: "cwd",
          },
        },
        {
          name: "--exclude-cwd",
          description: "Exclude directory from results",
          args: {
            name: "exclude-cwd",
          },
        },
        {
          name: ["--exit", "-e"],
          description:
            "Filter by exit code; repeat to include any of the given codes",
          args: {
            name: "exit",
          },
        },
        {
          name: "--exclude-exit",
          description:
            "Exclude results with this exit code; repeat to exclude multiple codes",
          args: {
            name: "exclude-exit",
          },
        },
        {
          name: ["--before", "-b"],
          description: "Only include results added before this date",
          args: {
            name: "before",
          },
        },
        {
          name: "--after",
          description:
            "Only include results after this date; see `--before` for how it is interpreted",
          args: {
            name: "after",
          },
        },
        {
          name: "--limit",
          description: "How many entries to return at most",
          args: {
            name: "limit",
          },
        },
        {
          name: "--offset",
          description: "Offset from the start of the results",
          args: {
            name: "offset",
          },
        },
        {
          name: "--filter-mode",
          description: "Allow overriding filter mode over config",
          args: {
            name: "filter-mode",
            suggestions: [
              "global",
              "host",
              "session",
              "directory",
              "workspace",
              "session-preload",
            ],
          },
        },
        {
          name: "--search-mode",
          description: "Allow overriding search mode over config",
          args: {
            name: "search-mode",
            suggestions: ["prefix", "fulltext", "fuzzy", "daemon-fuzzy"],
          },
        },
        {
          name: "--keymap-mode",
          description: "Notify the keymap at the shell's side",
          args: {
            name: "keymap-mode",
            suggestions: ["emacs", "vim-normal", "vim-insert", "auto"],
          },
        },
        {
          name: ["--tz", "--timezone"],
          description:
            "Timezone to display command times in and to interpret `--before`/`--after` in, instead of the configured default.",
          args: {
            name: "tz",
          },
        },
        {
          name: ["--format", "-f"],
          description:
            "Available variables: {command}, {directory}, {duration}, {user}, {host}, {time}, {exit} and {relativetime}",
          args: {
            name: "format",
            description:
              'Available variables: {command}, {directory}, {duration}, {user}, {host} and {time}. Example: --format "{time} - [{duration}] - {directory}$\\t{command}"',
          },
        },
        {
          name: "--inline-height",
          description:
            "Set the maximum number of lines Atuin's interface should take up",
          args: {
            name: "inline-height",
          },
        },
        {
          name: "--author",
          description:
            "Filter by author. Supports $all-user (non-agents), $all-agent, or literal names",
          args: {
            name: "author",
          },
        },
        {
          name: "--result-file",
          description:
            "File name to write the result to (hidden from help as this is meant to be used from a script)",
          args: {
            name: "result-file",
          },
        },
        {
          name: "--shell",
          description: "Filter by the shell that was used to run the command",
          args: {
            name: "shell",
          },
        },
        {
          name: ["--interactive", "-i"],
          description: "Open interactive search UI",
        },
        {
          name: "--shell-up-key-binding",
          description:
            "Marker argument used to inform atuin that it was invoked from a shell up-key binding (hidden from help to avoid confusion)",
        },
        {
          name: "--human",
          description: "Use human-readable formatting for time",
        },
        {
          name: "--cmd-only",
          description: "Show only the text of the command",
        },
        {
          name: "--print0",
          description:
            "Terminate the output with a null, for better multiline support",
        },
        {
          name: "--delete",
          description:
            "Delete anything matching this query. Will not print out the match",
        },
        {
          name: "--delete-it-all",
          description: "Delete EVERYTHING!",
        },
        {
          name: ["--reverse", "-r"],
          description: "Reverse the order of results, oldest first",
        },
        {
          name: "--include-duplicates",
          description:
            "Include duplicate commands in the output (non-interactive only)",
        },
      ],
      args: {
        name: "query",
        isOptional: true,
        isVariadic: true,
      },
    },
    {
      name: "output",
      description: "Work with captured command output",
      subcommands: [
        {
          name: "search",
          description: "Full-text search over captured command output",
          options: [
            {
              name: "--limit",
              description: "Maximum number of matches to return",
              args: {
                name: "limit",
              },
            },
            {
              name: ["--context", "-C"],
              description:
                "Show only the matching lines, with this many lines of context on either side; without it, each match's whole output",
              args: {
                name: "context",
              },
            },
            {
              name: "--style",
              description: "How matches are rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
          args: {
            name: "query",
            isVariadic: true,
            description:
              "Words to search for; all must appear. Quote words to find them together, in that order. Use -- before a query that starts with -",
          },
        },
      ],
    },
    {
      name: "stats",
      description: "Calculate statistics for your history",
      options: [
        {
          name: ["--count", "-c"],
          description: "How many top commands to list",
          args: {
            name: "count",
          },
        },
        {
          name: ["--ngram-size", "-n"],
          description: "The number of consecutive commands to consider",
          args: {
            name: "ngram-size",
          },
        },
        {
          name: "--filter-mode",
          description:
            "Filter commands by scope [global, host, session, directory, workspace]",
          args: {
            name: "filter-mode",
            suggestions: [
              "global",
              "host",
              "session",
              "directory",
              "workspace",
              "session-preload",
            ],
          },
        },
      ],
      args: {
        name: "period",
        isOptional: true,
        isVariadic: true,
        description:
          "Compute statistics for the specified period, leave blank for statistics since the beginning. See this (https://docs.atuin.sh/18.25/reference/stats/) for more details.",
      },
    },
    {
      name: "sync",
      description: "Sync with the configured server",
      options: [
        {
          name: ["--force", "-f"],
          description: "Force re-download everything",
        },
      ],
    },
    {
      name: "login",
      description: "Login to the configured server",
      options: [
        {
          name: ["--username", "-u"],
          args: {
            name: "username",
          },
        },
        {
          name: ["--password", "-p"],
          description:
            "Your password, or `-` to read it from stdin. Falls back to `ATUIN_PASSWORD`, then a prompt",
          args: {
            name: "password",
          },
        },
        {
          name: ["--key", "-k"],
          description:
            "The encryption key for your account. Falls back to `ATUIN_ENCRYPTION_KEY`, then a prompt",
          args: {
            name: "key",
          },
        },
        {
          name: ["--totp-code", "-t"],
          description:
            "The two-factor authentication code for your account, if any",
          args: {
            name: "totp-code",
          },
        },
        {
          name: "--from-registration",
        },
      ],
    },
    {
      name: "logout",
      description: "Log out",
    },
    {
      name: "register",
      description: "Register with the configured server",
      options: [
        {
          name: ["--username", "-u"],
          args: {
            name: "username",
          },
        },
        {
          name: ["--password", "-p"],
          description:
            "Your password, or `-` to read it from stdin. Falls back to `ATUIN_PASSWORD`, then a prompt",
          args: {
            name: "password",
          },
        },
        {
          name: ["--email", "-e"],
          args: {
            name: "email",
          },
        },
      ],
    },
    {
      name: "key",
      description: "Print the encryption key for transfer to another machine",
      options: [
        {
          name: "--base64",
          description: "Switch to base64 output of the key",
        },
      ],
    },
    {
      name: "status",
      description: "Display the sync status",
    },
    {
      name: "account",
      description: "Manage your sync account",
      subcommands: [
        {
          name: "login",
          description: "Login to the configured server",
          options: [
            {
              name: ["--username", "-u"],
              args: {
                name: "username",
              },
            },
            {
              name: ["--password", "-p"],
              description:
                "Your password, or `-` to read it from stdin. Falls back to `ATUIN_PASSWORD`, then a prompt",
              args: {
                name: "password",
              },
            },
            {
              name: ["--key", "-k"],
              description:
                "The encryption key for your account. Falls back to `ATUIN_ENCRYPTION_KEY`, then a prompt",
              args: {
                name: "key",
              },
            },
            {
              name: ["--totp-code", "-t"],
              description:
                "The two-factor authentication code for your account, if any",
              args: {
                name: "totp-code",
              },
            },
            {
              name: "--from-registration",
            },
          ],
        },
        {
          name: "register",
          description: "Register a new account",
          options: [
            {
              name: ["--username", "-u"],
              args: {
                name: "username",
              },
            },
            {
              name: ["--password", "-p"],
              description:
                "Your password, or `-` to read it from stdin. Falls back to `ATUIN_PASSWORD`, then a prompt",
              args: {
                name: "password",
              },
            },
            {
              name: ["--email", "-e"],
              args: {
                name: "email",
              },
            },
          ],
        },
        {
          name: "logout",
          description: "Log out",
        },
        {
          name: "delete",
          description: "Delete your account, and all synced data",
          options: [
            {
              name: ["--password", "-p"],
              args: {
                name: "password",
              },
            },
            {
              name: ["--totp-code", "-t"],
              description:
                "The two-factor authentication code for your account, if any",
              args: {
                name: "totp-code",
              },
            },
          ],
        },
        {
          name: "change-password",
          description: "Change your password",
          options: [
            {
              name: ["--current-password", "-c"],
              args: {
                name: "current-password",
              },
            },
            {
              name: ["--new-password", "-n"],
              args: {
                name: "new-password",
              },
            },
            {
              name: ["--totp-code", "-t"],
              description:
                "The two-factor authentication code for your account, if any",
              args: {
                name: "totp-code",
              },
            },
          ],
        },
        {
          name: "link",
          description: "Link your CLI sync account to your Hub account",
        },
      ],
    },
    {
      name: "history",
      description: "Manipulate shell history",
      subcommands: [
        {
          name: "start",
          description: "Begins a new command in the history",
          options: [
            {
              name: "--author",
              description:
                "Author of this command, eg `ellie`, `claude`, or `copilot`",
              args: {
                name: "author",
              },
            },
            {
              name: "--author-kind",
              description: "Whether a human or an AI agent ran this command",
              args: {
                name: "author-kind",
                suggestions: ["user", "agent"],
              },
            },
            {
              name: "--intent",
              description: "Optional intent/rationale for running this command",
              args: {
                name: "intent",
              },
            },
            {
              name: "--command-from-env",
              description:
                "Collects the command from the `ATUIN_COMMAND_LINE` environment variable, which does not need escaping and is more compatible between OS and shells",
            },
            {
              name: "--hook",
              description:
                "Passed by shell hooks; this flag disables logging to avoid corrupting the terminal and to minimize the amount of time the command takes to run",
            },
          ],
        },
        {
          name: "end",
          description:
            "Finishes a new command in the history (adds time, exit code)",
          options: [
            {
              name: ["--exit", "-e"],
              args: {
                name: "exit",
              },
            },
            {
              name: ["--duration", "-d"],
              args: {
                name: "duration",
              },
            },
            {
              name: "--hook",
              description:
                "Passed by shell hooks; this flag disables logging to avoid corrupting the terminal and to minimize the amount of time the command takes to run",
            },
          ],
          args: [
            {
              name: "exit",
            },
            {
              name: "id",
            },
          ],
        },
        {
          name: "tail",
          description:
            "Stream history events from the daemon as they are received",
        },
        {
          name: "list",
          description: "List all items in history",
          options: [
            {
              name: ["--reverse", "-r"],
              args: {
                name: "reverse",
                suggestions: ["true", "false"],
              },
            },
            {
              name: ["--tz", "--timezone"],
              description:
                "Display the command time in another timezone other than the configured default.",
              args: {
                name: "tz",
              },
            },
            {
              name: ["--format", "-f"],
              description:
                "Available variables: {command}, {directory}, {duration}, {user}, {host}, {author}, {intent}, {exit}, {time}, {session}, and {uuid}",
              args: {
                name: "format",
                description:
                  'Available variables: {command}, {directory}, {duration}, {user}, {host} and {time}. Example: --format "{time} - [{duration}] - {directory}$\\t{command}"',
              },
            },
            {
              name: ["--cwd", "-c"],
            },
            {
              name: ["--session", "-s"],
            },
            {
              name: "--human",
            },
            {
              name: "--cmd-only",
              description: "Show only the text of the command",
            },
            {
              name: "--print0",
              description:
                "Terminate the output with a null, for better multiline support",
            },
          ],
        },
        {
          name: "last",
          description: "Get the last command that was run",
          options: [
            {
              name: ["--tz", "--timezone"],
              description:
                "Display the command time in another timezone other than the configured default.",
              args: {
                name: "tz",
              },
            },
            {
              name: ["--format", "-f"],
              description:
                "Available variables: {command}, {directory}, {duration}, {user}, {host}, {author}, {intent}, {time}, {session}, {uuid} and {relativetime}",
              args: {
                name: "format",
                description:
                  'Available variables: {command}, {directory}, {duration}, {user}, {host} and {time}. Example: --format "{time} - [{duration}] - {directory}$\\t{command}"',
              },
            },
            {
              name: "--human",
            },
            {
              name: "--cmd-only",
              description: "Show only the text of the command",
            },
          ],
        },
        {
          name: "init-store",
        },
        {
          name: "prune",
          description:
            "Delete history entries matching the configured exclusion filters",
          options: [
            {
              name: ["--dry-run", "-n"],
              description:
                "List matching history lines without performing the actual deletion",
            },
          ],
        },
        {
          name: "dedup",
          description:
            "Delete duplicate history entries (that have the same command, cwd and hostname)",
          options: [
            {
              name: ["--before", "-b"],
              description:
                "Only delete results added before this date, read in the configured timezone unless it carries an explicit offset",
              args: {
                name: "before",
              },
            },
            {
              name: "--dupkeep",
              description: "How many recent duplicates to keep",
              args: {
                name: "dupkeep",
              },
            },
            {
              name: ["--dry-run", "-n"],
              description:
                "List matching history lines without performing the actual deletion",
            },
          ],
          args: [
            {
              name: "before",
            },
            {
              name: "dupkeep",
            },
          ],
        },
      ],
    },
    {
      name: "setup",
      description: "Setup Atuin features",
      options: [
        {
          name: "--shells",
          description:
            "The shells to hook into: zsh, bash, fish and powershell",
          args: {
            name: "shell",
          },
        },
        {
          name: "--agents",
          description:
            "The agents to hook into and connect, of amp, claude-code, codex, copilot, grok, hermes, kiro, opencode, pi, omp, vibe",
          args: {
            name: "agent",
          },
        },
        {
          name: "--sync",
          description:
            "Where to sync: `cloud`, `off`, or your own server's address",
          args: {
            name: "sync",
          },
        },
        {
          name: "--upload-threads",
          description:
            "Which agent threads Atuin for Teams uploads: all, those started in a workspace, or none",
          args: {
            name: "upload-threads",
          },
        },
        {
          name: "--yes",
          description:
            "Set up without asking, as the flags say: sync is off unless `--sync` says otherwise",
        },
        {
          name: "--only",
          description:
            "Change only what the flags say, without asking, and leave the rest as it is",
        },
        {
          name: "--no-import",
          description:
            "Don't import the shell history and threads already on this machine",
        },
        {
          name: "--shell-history",
          description: "Capture your shell history [or --no-shell-history]",
        },
        {
          name: "--no-shell-history",
          description: "Don't capture your shell history",
        },
        {
          name: "--output-capture",
          description:
            "Capture what your commands print [or --no-output-capture]",
        },
        {
          name: "--no-output-capture",
          description: "Don't capture what your commands print",
        },
        {
          name: "--threads",
          description:
            "Capture your conversations with your agents [or --no-threads]",
        },
        {
          name: "--no-threads",
          description: "Don't capture your conversations with your agents",
        },
        {
          name: "--agent-history",
          description:
            "Capture the commands your agents run [or --no-agent-history]",
        },
        {
          name: "--no-agent-history",
          description: "Don't capture the commands your agents run",
        },
        {
          name: "--ctrl-r",
          description: "Search with ctrl-r [or --no-ctrl-r]",
        },
        {
          name: "--no-ctrl-r",
          description: "Leave ctrl-r to your shell",
        },
        {
          name: "--up-arrow",
          description: "Search with the up arrow [or --no-up-arrow]",
        },
        {
          name: "--no-up-arrow",
          description: "Leave the up arrow to your shell",
        },
        {
          name: "--mcp",
          description: "Let your agents search Atuin over MCP [or --no-mcp]",
        },
        {
          name: "--no-mcp",
          description: "Don't let your agents search Atuin over MCP",
        },
        {
          name: "--daemon",
          description:
            "Run the daemon, which thread and output capture need [or --no-daemon]",
        },
        {
          name: "--no-daemon",
          description: "Stop the daemon, and keep it off",
        },
        {
          name: "--hub",
          description: "Turn on Atuin for Teams [or --no-hub]",
        },
        {
          name: "--no-hub",
          description: "Turn off Atuin for Teams",
        },
        {
          name: "--backfill",
          description:
            "Upload what Atuin has already to Atuin for Teams [or --no-backfill]",
        },
        {
          name: "--no-backfill",
          description: "Upload only what Atuin records from now on",
        },
      ],
    },
    {
      name: "init",
      description: "Print Atuin's shell init script",
      options: [
        {
          name: "--disable-ctrl-r",
          description: "Disable the binding of CTRL-R to atuin",
        },
        {
          name: "--disable-up-arrow",
          description: "Disable the binding of the Up Arrow key to atuin",
        },
        {
          name: "--disable-ai",
          description:
            "No longer does anything: `?` isn't bound any more. Kept so old init lines still work",
        },
        {
          name: "--bind-ai-resume",
          description:
            "Bind CTRL-T to atuin threads resume (zsh, bash and fish; off by default: it replaces the shell's own binding)",
        },
      ],
      args: {
        name: "shell",
        description: "Possible values:",
        suggestions: ["zsh", "bash", "fish", "nu"],
      },
    },
    {
      name: "import",
      description: "Import shell history from file",
      subcommands: [
        {
          name: "auto",
          description: "Import history for the current shell",
        },
        {
          name: "zsh",
          description: "Import history from the zsh history file",
        },
        {
          name: "zsh-hist-db",
          description: "Import history from the zsh-histdb database",
        },
        {
          name: "bash",
          description: "Import history from the bash history file",
        },
        {
          name: "replxx",
          description: "Import history from the replxx history file",
        },
        {
          name: "resh",
          description: "Import history from the resh history file",
        },
        {
          name: "fish",
          description: "Import history from the fish history file",
        },
        {
          name: "nu",
          description: "Import history from the nu history file",
        },
        {
          name: "nu-hist-db",
          description: "Import history from the nu history database",
        },
        {
          name: "xonsh",
          description: "Import history from xonsh json files",
        },
        {
          name: "xonsh-sqlite",
          description: "Import history from xonsh sqlite db",
        },
        {
          name: "powershell",
          description: "Import history from the powershell history file",
        },
      ],
    },
    {
      name: "doctor",
      description: "Run the doctor to check for common issues",
    },
    {
      name: "kv",
      description: "Get or set small key-value pairs",
      subcommands: [
        {
          name: "set",
          description: "Set a key-value pair",
          options: [
            {
              name: ["--key", "-k"],
              description: "Key to set",
              args: {
                name: "key",
              },
            },
            {
              name: ["--namespace", "-n"],
              description: "Namespace for the key-value pair",
              args: {
                name: "namespace",
              },
            },
          ],
          args: [
            {
              name: "key",
            },
            {
              name: "value",
              isOptional: true,
              description: "Value to store (reads from stdin if not provided)",
            },
          ],
        },
        {
          name: "delete",
          description: "Delete one or more key-value pairs",
          options: [
            {
              name: ["--namespace", "-n"],
              description: "Namespace for the key-value pair",
              args: {
                name: "namespace",
              },
            },
          ],
          args: {
            name: "keys",
            isVariadic: true,
            description: "Keys to delete",
          },
        },
        {
          name: "get",
          description: "Retrieve a saved value",
          options: [
            {
              name: ["--namespace", "-n"],
              description: "Namespace for the key-value pair",
              args: {
                name: "namespace",
              },
            },
          ],
          args: {
            name: "key",
            description: "Key to retrieve",
          },
        },
        {
          name: "list",
          description: "List all keys in a namespace, or in all namespaces",
          options: [
            {
              name: ["--namespace", "-n"],
              description: "Namespace to list keys from",
              args: {
                name: "namespace",
              },
            },
            {
              name: ["--all-namespaces", "-a"],
              description: "List all keys in all namespaces",
            },
          ],
        },
        {
          name: "rebuild",
          description: "Rebuild the KV store",
        },
      ],
    },
    {
      name: "store",
      description: "Manage the atuin data store",
      subcommands: [
        {
          name: "status",
          description: "Print the current status of the record store",
        },
        {
          name: "rebuild",
          description: "Rebuild a store (eg atuin store rebuild history)",
          args: {
            name: "tag",
          },
        },
        {
          name: "rekey",
          description:
            "Re-encrypt the store with a new key (potential for data loss!)",
          args: {
            name: "key",
            isOptional: true,
            description:
              "The new key to use for encryption. Omit for a randomly-generated key",
          },
        },
        {
          name: "compact",
          description:
            "Rewrite every record in the compact on-disk encoding and reclaim space",
        },
        {
          name: "purge",
          description:
            "Delete all records in the store that cannot be decrypted with the current key",
        },
        {
          name: "verify",
          description:
            "Verify that all records in the store can be decrypted with the current key",
        },
        {
          name: "push",
          description:
            "Push all records to the remote sync server (one way sync)",
          options: [
            {
              name: ["--tag", "-t"],
              description:
                "The tag to push (eg, 'history'). Defaults to all tags",
              args: {
                name: "tag",
              },
            },
            {
              name: "--host",
              description:
                "The host to push, in the form of a UUID host ID. Defaults to the current host",
              args: {
                name: "host",
              },
            },
            {
              name: "--page",
              description: "Page Size",
              args: {
                name: "page",
              },
            },
            {
              name: "--force",
              description: "Force push records",
            },
          ],
        },
        {
          name: "pull",
          description:
            "Pull records from the remote sync server (one way sync)",
          options: [
            {
              name: ["--tag", "-t"],
              description:
                "The tag to push (eg, 'history'). Defaults to all tags",
              args: {
                name: "tag",
              },
            },
            {
              name: "--page",
              description: "Page Size",
              args: {
                name: "page",
              },
            },
            {
              name: "--force",
              description: "Force pull records",
            },
          ],
        },
      ],
    },
    {
      name: "dotfiles",
      description: "List legacy synced dotfiles data",
      subcommands: [
        {
          name: "alias",
          description: "List legacy shell aliases synced with Atuin",
          subcommands: [
            {
              name: "list",
              description: "List all aliases",
            },
          ],
        },
        {
          name: "var",
          description:
            "List legacy shell and environment variables synced with Atuin",
          subcommands: [
            {
              name: "list",
              description: "List all variables",
            },
          ],
        },
      ],
    },
    {
      name: "scripts",
      description: "Manage your scripts with Atuin",
      subcommands: [
        {
          name: "new",
          options: [
            {
              name: ["--description", "-d"],
              args: {
                name: "description",
              },
            },
            {
              name: ["--tags", "-t"],
              args: {
                name: "tags",
              },
            },
            {
              name: ["--shebang", "-s"],
              args: {
                name: "shebang",
              },
            },
            {
              name: "--script",
              args: {
                name: "script",
              },
            },
            {
              name: "--last",
              description: "Use the last command as the script content",
              args: {
                name: "last",
              },
            },
            {
              name: "--no-edit",
              description: "Skip opening editor when using --last",
            },
          ],
          args: {
            name: "name",
          },
        },
        {
          name: "run",
          options: [
            {
              name: ["--var", "-v"],
              description: "Specify template variables in the format KEY=VALUE",
              args: {
                name: "var",
              },
            },
          ],
          args: {
            name: "name",
          },
        },
        {
          name: "list",
        },
        {
          name: "get",
          options: [
            {
              name: ["--script", "-s"],
              description: "Display only the executable script with shebang",
            },
          ],
          args: {
            name: "name",
          },
        },
        {
          name: "edit",
          options: [
            {
              name: ["--description", "-d"],
              args: {
                name: "description",
              },
            },
            {
              name: ["--tags", "-t"],
              description: "Replace all existing tags with these new tags",
              args: {
                name: "tags",
              },
            },
            {
              name: "--rename",
              description: "Rename the script",
              args: {
                name: "rename",
              },
            },
            {
              name: ["--shebang", "-s"],
              args: {
                name: "shebang",
              },
            },
            {
              name: "--script",
              args: {
                name: "script",
              },
            },
            {
              name: "--no-tags",
              description: "Remove all tags from the script",
            },
            {
              name: "--no-edit",
              description: "Skip opening editor",
            },
          ],
          args: {
            name: "name",
          },
        },
        {
          name: "delete",
          options: [
            {
              name: ["--force", "-f"],
            },
          ],
          args: {
            name: "name",
          },
        },
      ],
    },
    {
      name: "hook",
      description: "Record the commands an AI agent runs, from its hooks",
      args: {
        name: "agent",
        description:
          'Which agent\'s hook format to parse (e.g., "claude-code")',
      },
    },
    {
      name: "threads",
      description:
        "Search, read and resume your coding agents' captured threads",
      subcommands: [
        {
          name: "list",
          description: "List captured threads, newest first",
          options: [
            {
              name: "--style",
              description: "How output is rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
        },
        {
          name: "show",
          description:
            "Show a thread and its messages. Accepts an id, a harness id or `latest`",
          options: [
            {
              name: "--style",
              description: "How output is rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
        },
        {
          name: "search",
          description:
            "Full-text search across captured threads, most relevant first.",
          options: [
            {
              name: "--harness",
              description: "Only search threads from this harness",
              args: {
                name: "harness",
                suggestions: [
                  "claude-code",
                  "codex",
                  "copilot",
                  "grok",
                  "hermes",
                  "kiro",
                  "opencode",
                  "pi",
                  "omp",
                  "amp",
                  "vibe",
                ],
              },
            },
            {
              name: "--limit",
              description: "Maximum threads to return; 0 for unbounded",
              args: {
                name: "n",
              },
            },
            {
              name: "--style",
              description: "How output is rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
          args: {
            name: "query",
            isVariadic: true,
            description:
              "Words to look for in thread titles, message text, reasoning, and tool calls; all must appear. Quote words to find them together, in that order. Use -- before a query that starts with -",
          },
        },
        {
          name: "tail",
          description:
            "Follow threads and messages as they are recorded (until interrupted)",
          options: [
            {
              name: "--style",
              description: "How output is rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
        },
        {
          name: "import",
          description:
            "Import every thread the agents have on this machine, including those capture leaves alone: the ones nobody has gone on with since it was turned on",
          options: [
            {
              name: "--harness",
              description: "Only import threads from this harness",
              args: {
                name: "harness",
                suggestions: [
                  "claude-code",
                  "codex",
                  "copilot",
                  "grok",
                  "hermes",
                  "kiro",
                  "opencode",
                  "pi",
                  "omp",
                  "amp",
                  "vibe",
                ],
              },
            },
            {
              name: "--style",
              description: "How output is rendered",
              args: {
                name: "style",
                suggestions: ["auto", "plain", "pretty", "json", "ndjson"],
              },
            },
          ],
        },
        {
          name: "push",
          description:
            "Capture messages an agent hands over, one JSON object per line on stdin, as capture does its transcript's. Messages already captured are skipped",
          options: [
            {
              name: "--harness",
              description: "The harness the thread is from",
              args: {
                name: "harness",
                suggestions: [
                  "claude-code",
                  "codex",
                  "copilot",
                  "grok",
                  "hermes",
                  "kiro",
                  "opencode",
                  "pi",
                  "omp",
                  "amp",
                  "vibe",
                ],
              },
            },
            {
              name: "--session",
              description: "The thread's id, as its harness names it",
              args: {
                name: "session",
              },
            },
          ],
          args: [
            {
              name: "harness",
            },
            {
              name: "session",
            },
          ],
        },
        {
          name: "resume",
          description: "Pick a captured thread and resume it",
          options: [
            {
              name: "--in",
              description:
                "Continue the thread QUERY names (by id, or a unique id prefix) in another agent: it is written out as a new session there, tool calls carried over as its own where it has a like tool (notes where they weren't captured whole), and resumed. One that went on separately on several machines needs `--branch`",
              args: {
                name: "harness",
                suggestions: [
                  "claude-code",
                  "codex",
                  "copilot",
                  "grok",
                  "hermes",
                  "kiro",
                  "opencode",
                  "pi",
                  "omp",
                  "vibe",
                ],
              },
            },
            {
              name: "--branch",
              description:
                "The branch of the thread QUERY names to catch up to, to switch to with `--switch`, to fork from with `--fork`, or to continue with `--in`: `this`, `@<host id>`, or the start of its head's id. The newest by default; `--in`, and `--switch` with several branches to switch to, need it named",
              args: {
                name: "branch",
              },
            },
            {
              name: "--filter-mode",
              description: "The filter the picker opens in (default: global)",
              args: {
                name: "filter-mode",
                suggestions: [
                  "global",
                  "host",
                  "workspace",
                  "directory",
                  "branch",
                ],
              },
            },
            {
              name: "--inline-height",
              description: "Height of the inline picker; 0 for fullscreen",
              args: {
                name: "inline-height",
              },
            },
            {
              name: "--keymap-mode",
              description: "Keymap mode, as passed by the shell widget",
              args: {
                name: "keymap-mode",
                suggestions: ["emacs", "vim-normal", "vim-insert", "auto"],
              },
            },
            {
              name: "--print",
              description: "Print the resume command instead of running it",
            },
            {
              name: "--fork",
              description:
                "Fork the thread QUERY names (by id, or a unique id prefix): it is written out as a new session of the same agent, with the same history, and resumed. The original is left as it is",
            },
            {
              name: "--as-is",
              description:
                "Resume this machine's copy of the thread QUERY names as it is, without catching it up with sync",
            },
            {
              name: "--switch",
              description:
                "Switch this machine's copy of the thread QUERY names to another branch (the one `--branch` names, else the only one it can be switched to), in place, and resume it: the history it shares with that branch is kept as it is, and the branch's messages since are appended from sync. The branch it was on stays in atuin, for `--fork` to bring back, and the copy as it was is kept as a backup. Only when sync holds all of it and no agent here has it open",
            },
            {
              name: "--shell-widget",
              description: "Report the result on stderr for the shell widget",
            },
          ],
          args: {
            name: "query",
            isOptional: true,
            isVariadic: true,
            description:
              "Search text, or a thread id (or unique id prefix) to resume without the picker",
          },
        },
      ],
    },
    {
      name: "resume",
      description:
        "Pick a captured coding-agent thread and resume it (short for `atuin threads resume`)",
      options: [
        {
          name: "--in",
          description:
            "Continue the thread QUERY names (by id, or a unique id prefix) in another agent: it is written out as a new session there, tool calls carried over as its own where it has a like tool (notes where they weren't captured whole), and resumed. One that went on separately on several machines needs `--branch`",
          args: {
            name: "harness",
            suggestions: [
              "claude-code",
              "codex",
              "copilot",
              "grok",
              "hermes",
              "kiro",
              "opencode",
              "pi",
              "omp",
              "vibe",
            ],
          },
        },
        {
          name: "--branch",
          description:
            "The branch of the thread QUERY names to catch up to, to switch to with `--switch`, to fork from with `--fork`, or to continue with `--in`: `this`, `@<host id>`, or the start of its head's id. The newest by default; `--in`, and `--switch` with several branches to switch to, need it named",
          args: {
            name: "branch",
          },
        },
        {
          name: "--filter-mode",
          description: "The filter the picker opens in (default: global)",
          args: {
            name: "filter-mode",
            suggestions: ["global", "host", "workspace", "directory", "branch"],
          },
        },
        {
          name: "--inline-height",
          description: "Height of the inline picker; 0 for fullscreen",
          args: {
            name: "inline-height",
          },
        },
        {
          name: "--keymap-mode",
          description: "Keymap mode, as passed by the shell widget",
          args: {
            name: "keymap-mode",
            suggestions: ["emacs", "vim-normal", "vim-insert", "auto"],
          },
        },
        {
          name: "--print",
          description: "Print the resume command instead of running it",
        },
        {
          name: "--fork",
          description:
            "Fork the thread QUERY names (by id, or a unique id prefix): it is written out as a new session of the same agent, with the same history, and resumed. The original is left as it is",
        },
        {
          name: "--as-is",
          description:
            "Resume this machine's copy of the thread QUERY names as it is, without catching it up with sync",
        },
        {
          name: "--switch",
          description:
            "Switch this machine's copy of the thread QUERY names to another branch (the one `--branch` names, else the only one it can be switched to), in place, and resume it: the history it shares with that branch is kept as it is, and the branch's messages since are appended from sync. The branch it was on stays in atuin, for `--fork` to bring back, and the copy as it was is kept as a backup. Only when sync holds all of it and no agent here has it open",
        },
        {
          name: "--shell-widget",
          description: "Report the result on stderr for the shell widget",
        },
      ],
      args: {
        name: "query",
        isOptional: true,
        isVariadic: true,
        description:
          "Search text, or a thread id (or unique id prefix) to resume without the picker",
      },
    },
    {
      name: "mcp",
      description:
        "Start an MCP server exposing history search to AI tools (stdio)",
    },
    {
      name: "wrapped",
      description: "Show a fun, year-in-review recap of your shell history",
      args: {
        name: "year",
        isOptional: true,
        description:
          "Year to recap (defaults to last year, or this year in December)",
      },
    },
    {
      name: "default-config",
      description: "Print the default atuin configuration (config.toml)",
    },
    {
      name: "config",
      description: "Get, set, or print values in your atuin config file",
      subcommands: [
        {
          name: "get",
          description:
            "Get a configuration value from your config.toml file or after defaults and overrides are applied",
          options: [
            {
              name: ["--resolved", "-r"],
              description:
                "Print the value after defaults and overrides are applied",
            },
            {
              name: ["--verbose", "-v"],
              description:
                "Print both the config file value and the resolved value",
            },
          ],
          args: {
            name: "key",
            description: "The configuration key to get",
          },
        },
        {
          name: "set",
          description: "Set a configuration value in your config.toml file",
          options: [
            {
              name: ["--type", "-t"],
              description: "Store value as an explicit type",
              args: {
                name: "type",
                suggestions: ["auto", "string", "boolean", "integer", "float"],
              },
            },
            {
              name: "--force",
              description: "Set the key even if Atuin does not recognize it",
            },
          ],
          args: [
            {
              name: "key",
              description: "The configuration key to set",
            },
            {
              name: "value",
              description: "The value to set",
            },
          ],
        },
        {
          name: "print",
          description:
            "Print all configuration values from your config.toml file in TOML format",
          args: {
            name: "key",
            isOptional: true,
            description:
              "Print the value of a specific key and all its children",
          },
        },
        {
          name: "check",
          description:
            "Check your configuration for settings that Atuin does not recognize",
        },
        {
          name: "types",
          description:
            "Print the Luau types of atuin.lua and .atuin.lua config files, for your editor",
        },
      ],
    },
    {
      name: "workspace",
      description: "Set up the .atuin.lua config file of a project",
      subcommands: [
        {
          name: "init",
          description:
            "Create a .atuin.lua workspace config file in the current directory",
          options: [
            {
              name: "--org",
              description:
                "An organization to share the threads with, by slug. Repeat it to name more than one. Without it, you're asked.",
              args: {
                name: "slug",
              },
            },
          ],
        },
      ],
    },
    {
      name: "info",
      description: "Information about Atuin data locations and ENV vars",
    },
    {
      name: "daemon",
      description: "Manage the background daemon",
      subcommands: [
        {
          name: "start",
          description: "Start the daemon server",
          options: [
            {
              name: "--daemonize",
            },
            {
              name: "--show-logs",
              description:
                "Also write daemon logs to the console (useful for debugging)",
            },
            {
              name: "--force",
              description:
                "Force start: kill existing daemon process and reset the socket",
            },
          ],
        },
        {
          name: "status",
          description: "Show the daemon's current status",
        },
        {
          name: "stop",
          description: "Stop the daemon gracefully",
        },
        {
          name: "restart",
          description: "Restart the daemon (stop, then start in background)",
        },
      ],
      options: [
        {
          name: "--daemonize",
          description: "Internal flag for daemonization",
        },
        {
          name: "--show-logs",
          description:
            "Also write daemon logs to the console (useful for debugging)",
        },
      ],
    },
    {
      name: "pty-proxy",
      description: "PTY proxy for atuin",
      subcommands: [
        {
          name: "init",
          description:
            "Print shell code to initialize atuin pty-proxy on shell startup",
          args: {
            name: "shell",
            isOptional: true,
            description:
              "Shell to generate init for. If omitted, attempt auto-detection",
          },
        },
      ],
      options: [
        {
          name: "--shell",
          description:
            "Path to the shell binary that atuin pty-proxy should spawn",
          args: {
            name: "path",
          },
        },
        {
          name: "--debug-markers",
          description:
            "Highlight `OSC 18188735` escape sequences used to mark the start and end of command output",
        },
      ],
    },
    {
      name: "contributors",
      description: "List the people who have contributed to Atuin",
    },
    {
      name: "gen-completions",
      description: "Generate shell completions",
      options: [
        {
          name: ["--shell", "-s"],
          description: "Set the shell for generating completions",
          args: {
            name: "shell",
            suggestions: [
              "bash",
              "elvish",
              "fish",
              "nushell",
              "powershell",
              "zsh",
            ],
          },
        },
        {
          name: ["--out-dir", "-o"],
          description: "Set the output directory",
          args: {
            name: "out-dir",
          },
        },
      ],
      args: {
        name: "shell",
      },
    },
  ],
};
export default completionSpec;
