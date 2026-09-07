const completion = {
  name: "ec",
  description: "The easy-complete CLI",
  subcommands: [
    {
      name: "hook",
      description: "Hook commands",
      hidden: true,
      subcommands: [
        {
          name: "editbuffer",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "session_id",
            },
            {
              name: "integration",
            },
            {
              name: "tty",
            },
            {
              name: "pid",
            },
            {
              name: "histno",
            },
            {
              name: "cursor",
            },
            {
              name: "text",
            },
          ]
        },
        {
          name: "hide",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "init",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "pid",
            },
            {
              name: "tty",
            },
          ]
        },
        {
          name: "integration-ready",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "integration",
          },
        },
        {
          name: "keyboard-focus-changed",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "app_identifier",
            },
            {
              name: "focused_session_id",
            },
          ]
        },
        {
          name: "pre-exec",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "pid",
            },
            {
              name: "tty",
            },
          ]
        },
        {
          name: "prompt",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "pid",
            },
            {
              name: "tty",
            },
          ]
        },
        {
          name: "clear-autocomplete-cache",
          options: [
            {
              name: "--cli",
              isRepeatable: true,
              args: {
                name: "cli",
                isOptional: true,
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "editbuffer",
            },
            {
              name: "hide",
            },
            {
              name: "init",
            },
            {
              name: "integration-ready",
            },
            {
              name: "keyboard-focus-changed",
            },
            {
              name: "pre-exec",
            },
            {
              name: "prompt",
            },
            {
              name: "clear-autocomplete-cache",
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "debug",
      description: "Debug the app",
      hidden: true,
      subcommands: [
        {
          name: "app",
          description: "Run the desktop app directly for debugging",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "autocomplete-window",
          description: "Toggle/set autocomplete window debug mode",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "mode",
            isOptional: true,
            suggestions: [
              "on",
              "off",
            ],
          },
        },
        {
          name: "logs",
          description: "Show debug logs",
          options: [
            {
              name: "--level",
              isRepeatable: true,
              args: {
                name: "level",
                isOptional: true,
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "files",
            isVariadic: true,
            isOptional: true,
          },
        },
        {
          name: "input-method",
          description: "Input method debugger",
          subcommands: [
            {
              name: "install",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
              args: {
                name: "bundle_path",
                isOptional: true,
                template: "filepaths",
              },
            },
            {
              name: "uninstall",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
              args: {
                name: "bundle_path",
                isOptional: true,
                template: "filepaths",
              },
            },
            {
              name: "list",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "status",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
              args: {
                name: "bundle_path",
                isOptional: true,
                template: "filepaths",
              },
            },
            {
              name: "source",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
              args: [
                {
                  name: "bundle_identifier",
                },
                {
                  name: "action",
                  suggestions: [
                    "enable",
                    "disable",
                    "select",
                    "deselect",
                  ],
                },
              ]
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "install",
                },
                {
                  name: "uninstall",
                },
                {
                  name: "list",
                },
                {
                  name: "status",
                },
                {
                  name: "source",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "prompt-accessibility",
          description: "Prompt accessibility",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "sample",
          description: "Sample desktop process",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "verify-codesign",
          description: "Debug application codesigning",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "accessibility",
          description: "Accessibility",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "action",
            isOptional: true,
            suggestions: [
              "refresh",
              "reset",
              "prompt",
              "open",
              "status",
            ],
          },
        },
        {
          name: "key-tester",
          description: "Key Tester",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "diagnostics",
          description: "Watches diagnostics",
          options: [
            {
              name: "--rate",
              isRepeatable: true,
              args: {
                name: "rate",
                isOptional: true,
              },
            },
            {
              name: "--watch",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "devtools",
          description: "Open up the devtools of a specific webview",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "app",
            suggestions: [
              "dashboard",
              "autocomplete",
            ],
          },
        },
        {
          name: "shell",
          description: "Disables sourcing of user shell config and instead uses a minimal shell config",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "fix-permissions",
          description: "Update the shell config permissions to have the correct owner and access rights",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "app",
              description: "Run the desktop app directly for debugging",
            },
            {
              name: "autocomplete-window",
              description: "Toggle/set autocomplete window debug mode",
            },
            {
              name: "logs",
              description: "Show debug logs",
            },
            {
              name: "input-method",
              description: "Input method debugger",
              subcommands: [
                {
                  name: "install",
                },
                {
                  name: "uninstall",
                },
                {
                  name: "list",
                },
                {
                  name: "status",
                },
                {
                  name: "source",
                },
              ],
            },
            {
              name: "prompt-accessibility",
              description: "Prompt accessibility",
            },
            {
              name: "sample",
              description: "Sample desktop process",
            },
            {
              name: "verify-codesign",
              description: "Debug application codesigning",
            },
            {
              name: "accessibility",
              description: "Accessibility",
            },
            {
              name: "key-tester",
              description: "Key Tester",
            },
            {
              name: "diagnostics",
              description: "Watches diagnostics",
            },
            {
              name: "devtools",
              description: "Open up the devtools of a specific webview",
            },
            {
              name: "shell",
              description: "Disables sourcing of user shell config and instead uses a minimal shell config",
            },
            {
              name: "fix-permissions",
              description: "Update the shell config permissions to have the correct owner and access rights",
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: ["settings", "setting"],
      description: "Customize appearance & behavior",
      subcommands: [
        {
          name: "open",
          description: "Open the settings file",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: ["list", "all"],
          description: "List configured settings (does not include implicit defaults)",
          options: [
            {
              name: ["-f", "--format"],
              description: "Format of the output",
              isRepeatable: true,
              args: {
                name: "format",
                isOptional: true,
                suggestions: [
                  {
                    name: "plain",
                    description: "Outputs human-readable text",
                  },
                  {
                    name: "json",
                    description: "Outputs the results as JSON",
                  },
                  {
                    name: "json-pretty",
                    description: "Outputs the results as pretty print JSON",
                  },
                ],
              },
            },
            {
              name: "--all",
              description: "Accepted for compatibility; all configured settings are always listed",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help (see more with '--help')",
            },
          ],
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "open",
              description: "Open the settings file",
            },
            {
              name: "list",
              description: "List configured settings (does not include implicit defaults)",
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-f", "--format"],
          description: "Format of the output",
          isRepeatable: true,
          args: {
            name: "format",
            isOptional: true,
            suggestions: [
              {
                name: "plain",
                description: "Outputs human-readable text",
              },
              {
                name: "json",
                description: "Outputs the results as JSON",
              },
              {
                name: "json-pretty",
                description: "Outputs the results as pretty print JSON",
              },
            ],
          },
        },
        {
          name: ["-d", "--delete"],
          description: "Delete a key (No value needed)",
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help (see more with '--help')",
        },
      ],
      args: [
        {
          name: "key",
          isOptional: true,
        },
        {
          name: "value",
          isOptional: true,
        },
      ]
    },
    {
      name: "uninstall",
      description: "Uninstall",
      hidden: true,
      options: [
        {
          name: ["-y", "--no-confirm"],
          description: "Force uninstall",
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: ["update", "upgrade"],
      description: "Update the application",
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: ["diagnostic", "diagnostics"],
      description: "Print system and environment diagnostics",
      options: [
        {
          name: ["-f", "--format"],
          description: "The format of the output",
          isRepeatable: true,
          args: {
            name: "format",
            isOptional: true,
            suggestions: [
              {
                name: "plain",
                description: "Outputs human-readable text",
              },
              {
                name: "json",
                description: "Outputs the results as JSON",
              },
              {
                name: "json-pretty",
                description: "Outputs the results as pretty print JSON",
              },
            ],
          },
        },
        {
          name: "--force",
          description: "Force limited diagnostic output",
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help (see more with '--help')",
        },
      ],
    },
    {
      name: "init",
      description: "Generate the dotfiles for the given shell",
      hidden: true,
      options: [
        {
          name: "--rcfile",
          isRepeatable: true,
          args: {
            name: "rcfile",
            isOptional: true,
          },
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help (see more with '--help')",
        },
      ],
      args: [
        {
          name: "shell",
          suggestions: [
            {
              name: "bash",
              description: "Bash shell",
            },
            {
              name: "zsh",
              description: "Zsh shell",
            },
            {
              name: "fish",
              description: "Fish shell",
            },
            {
              name: "nu",
              description: "Nu shell",
            },
          ],
        },
        {
          name: "when",
          suggestions: [
            "pre",
            "post",
          ],
        },
      ]
    },
    {
      name: "issue",
      description: "Open a prefilled GitHub bug report",
      options: [
        {
          name: ["-f", "--force"],
          description: "Force issue creation",
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
      args: {
        name: "description",
        isVariadic: true,
        isOptional: true,
      },
    },
    {
      name: "doctor",
      description: "Fix and diagnose common issues",
      options: [
        {
          name: ["-a", "--all"],
          description: "Run all doctor tests, with no fixes",
        },
        {
          name: ["-s", "--strict"],
          description: "Error on warnings",
        },
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "completion",
      description: "Generate CLI completion spec",
      hidden: true,
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help (see more with '--help')",
        },
      ],
      args: {
        name: "shell",
        isOptional: true,
        suggestions: [
          {
            name: "bash",
            description: "Bash shell completions",
          },
          {
            name: "fish",
            description: "Fish shell completions",
          },
          {
            name: "zsh",
            description: "Zsh shell completions",
          },
          {
            name: "fig",
            description: "Fig completion spec",
          },
        ],
      },
    },
    {
      name: ["internal", "_"],
      description: "Internal subcommands",
      hidden: true,
      subcommands: [
        {
          name: "pre-cmd",
          description: "Command that is run during the PreCmd section of the shell integrations",
          options: [
            {
              name: "--alias",
              isRepeatable: true,
              args: {
                name: "alias",
                isOptional: true,
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "local-state",
          description: "Change the local-state file",
          subcommands: [
            {
              name: "init",
              description: "Reload the state listener",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "all",
              description: "List all the settings",
              options: [
                {
                  name: ["-f", "--format"],
                  isRepeatable: true,
                  args: {
                    name: "format",
                    isOptional: true,
                    suggestions: [
                      {
                        name: "plain",
                        description: "Outputs human-readable text",
                      },
                      {
                        name: "json",
                        description: "Outputs the results as JSON",
                      },
                      {
                        name: "json-pretty",
                        description: "Outputs the results as pretty print JSON",
                      },
                    ],
                  },
                },
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help (see more with '--help')",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "init",
                  description: "Reload the state listener",
                },
                {
                  name: "all",
                  description: "List all the settings",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-f", "--format"],
              description: "Format of the output",
              isRepeatable: true,
              args: {
                name: "format",
                isOptional: true,
                suggestions: [
                  {
                    name: "plain",
                    description: "Outputs human-readable text",
                  },
                  {
                    name: "json",
                    description: "Outputs the results as JSON",
                  },
                  {
                    name: "json-pretty",
                    description: "Outputs the results as pretty print JSON",
                  },
                ],
              },
            },
            {
              name: ["-d", "--delete"],
              description: "Delete the state",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help (see more with '--help')",
            },
          ],
          args: [
            {
              name: "key",
              isOptional: true,
            },
            {
              name: "value",
              isOptional: true,
            },
          ]
        },
        {
          name: "callback",
          description: "Callback used for the internal pseudoterminal",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: [
            {
              name: "handler_id",
            },
            {
              name: "filename",
              isOptional: true,
            },
            {
              name: "exit_code",
              isOptional: true,
            },
          ]
        },
        {
          name: "install",
          description: "Install the Easy Complete cli",
          options: [
            {
              name: "--dotfiles",
              description: "Install only the shell integrations",
            },
            {
              name: "--input-method",
              description: "Prompt input method installation",
            },
            {
              name: "--no-confirm",
              description: "Don't confirm automatic installation",
            },
            {
              name: "--force",
              description: "Force installation of q",
            },
            {
              name: "--global",
              description: "Install q globally",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "uninstall",
          description: "Uninstall the Easy Complete cli",
          options: [
            {
              name: "--dotfiles",
              description: "Uninstall only the shell integrations",
            },
            {
              name: "--input-method",
              description: "Uninstall only the input method",
            },
            {
              name: "--binary",
              description: "Uninstall only the binary",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "get-shell",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "should-figterm-launch",
          description: "Detects if Figterm should be launched",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help (see more with '--help')",
            },
          ],
        },
        {
          name: "sockets-dir",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "stream-from-socket",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "figterm-socket-path",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "session_id",
          },
        },
        {
          name: "uuidgen",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "attempt-to-finish-input-method-installation",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "bundle_path",
            isOptional: true,
            template: "filepaths",
          },
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "pre-cmd",
              description: "Command that is run during the PreCmd section of the shell integrations",
            },
            {
              name: "local-state",
              description: "Change the local-state file",
              subcommands: [
                {
                  name: "init",
                  description: "Reload the state listener",
                },
                {
                  name: "all",
                  description: "List all the settings",
                },
              ],
            },
            {
              name: "callback",
              description: "Callback used for the internal pseudoterminal",
            },
            {
              name: "install",
              description: "Install the Easy Complete cli",
            },
            {
              name: "uninstall",
              description: "Uninstall the Easy Complete cli",
            },
            {
              name: "get-shell",
            },
            {
              name: "should-figterm-launch",
              description: "Detects if Figterm should be launched",
            },
            {
              name: "sockets-dir",
            },
            {
              name: "stream-from-socket",
            },
            {
              name: "figterm-socket-path",
            },
            {
              name: "uuidgen",
            },
            {
              name: "attempt-to-finish-input-method-installation",
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "launch",
      description: "Launch the desktop app",
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "quit",
      description: "Quit the desktop app",
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "restart",
      description: "Restart the desktop app",
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
      args: {
        name: "process",
        isOptional: true,
        suggestions: [
          {
            name: "app",
            description: "Desktop Process",
          },
        ],
      },
    },
    {
      name: ["integrations", "integration"],
      description: "Manage system integrations",
      subcommands: [
        {
          name: "install",
          subcommands: [
            {
              name: "dotfiles",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help (see more with '--help')",
                },
              ],
              args: {
                name: "shell",
                isOptional: true,
                suggestions: [
                  {
                    name: "bash",
                    description: "Bash shell",
                  },
                  {
                    name: "zsh",
                    description: "Zsh shell",
                  },
                  {
                    name: "fish",
                    description: "Fish shell",
                  },
                  {
                    name: "nu",
                    description: "Nu shell",
                  },
                ],
              },
            },
            {
              name: "input-method",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "all",
              description: "All supported integrations",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-s", "--silent"],
              description: "Suppress status messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "uninstall",
          subcommands: [
            {
              name: "dotfiles",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help (see more with '--help')",
                },
              ],
              args: {
                name: "shell",
                isOptional: true,
                suggestions: [
                  {
                    name: "bash",
                    description: "Bash shell",
                  },
                  {
                    name: "zsh",
                    description: "Zsh shell",
                  },
                  {
                    name: "fish",
                    description: "Fish shell",
                  },
                  {
                    name: "nu",
                    description: "Nu shell",
                  },
                ],
              },
            },
            {
              name: "input-method",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "all",
              description: "All supported integrations",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-s", "--silent"],
              description: "Suppress status messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "reinstall",
          subcommands: [
            {
              name: "dotfiles",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help (see more with '--help')",
                },
              ],
              args: {
                name: "shell",
                isOptional: true,
                suggestions: [
                  {
                    name: "bash",
                    description: "Bash shell",
                  },
                  {
                    name: "zsh",
                    description: "Zsh shell",
                  },
                  {
                    name: "fish",
                    description: "Fish shell",
                  },
                  {
                    name: "nu",
                    description: "Nu shell",
                  },
                ],
              },
            },
            {
              name: "input-method",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "all",
              description: "All supported integrations",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-s", "--silent"],
              description: "Suppress status messages",
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "status",
          subcommands: [
            {
              name: "dotfiles",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help (see more with '--help')",
                },
              ],
              args: {
                name: "shell",
                isOptional: true,
                suggestions: [
                  {
                    name: "bash",
                    description: "Bash shell",
                  },
                  {
                    name: "zsh",
                    description: "Zsh shell",
                  },
                  {
                    name: "fish",
                    description: "Fish shell",
                  },
                  {
                    name: "nu",
                    description: "Nu shell",
                  },
                ],
              },
            },
            {
              name: "input-method",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "all",
              description: "All supported integrations",
              options: [
                {
                  name: ["-v", "--verbose"],
                  description: "Increase logging verbosity",
                  isRepeatable: true,
                },
                {
                  name: ["-h", "--help"],
                  description: "Print help",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
                {
                  name: "help",
                  description: "Print this message or the help of the given subcommand(s)",
                },
              ],
            },
          ],
          options: [
            {
              name: ["-f", "--format"],
              isRepeatable: true,
              args: {
                name: "format",
                isOptional: true,
                suggestions: [
                  {
                    name: "plain",
                    description: "Outputs human-readable text",
                  },
                  {
                    name: "json",
                    description: "Outputs the results as JSON",
                  },
                  {
                    name: "json-pretty",
                    description: "Outputs the results as pretty print JSON",
                  },
                ],
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help (see more with '--help')",
            },
          ],
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "install",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "uninstall",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "reinstall",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "status",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "telemetry",
      description: "Enable/disable anonymous usage statistics",
      subcommands: [
        {
          name: "enable",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "disable",
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
        },
        {
          name: "status",
          options: [
            {
              name: ["-f", "--format"],
              description: "Format of the output",
              isRepeatable: true,
              args: {
                name: "format",
                isOptional: true,
                suggestions: [
                  {
                    name: "plain",
                    description: "Outputs human-readable text",
                  },
                  {
                    name: "json",
                    description: "Outputs the results as JSON",
                  },
                  {
                    name: "json-pretty",
                    description: "Outputs the results as pretty print JSON",
                  },
                ],
              },
            },
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help (see more with '--help')",
            },
          ],
        },
        {
          name: "track",
          description: "Send a single telemetry event (used by install/uninstall scripts)",
          hidden: true,
          options: [
            {
              name: ["-v", "--verbose"],
              description: "Increase logging verbosity",
              isRepeatable: true,
            },
            {
              name: ["-h", "--help"],
              description: "Print help",
            },
          ],
          args: {
            name: "event",
          },
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
          subcommands: [
            {
              name: "enable",
            },
            {
              name: "disable",
            },
            {
              name: "status",
            },
            {
              name: "track",
              description: "Send a single telemetry event (used by install/uninstall scripts)",
              hidden: true,
            },
            {
              name: "help",
              description: "Print this message or the help of the given subcommand(s)",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "version",
      description: "Show version information",
      options: [
        {
          name: ["-v", "--verbose"],
          description: "Increase logging verbosity",
          isRepeatable: true,
        },
        {
          name: ["-h", "--help"],
          description: "Print help",
        },
      ],
    },
    {
      name: "help",
      description: "Print this message or the help of the given subcommand(s)",
      subcommands: [
        {
          name: "hook",
          description: "Hook commands",
          hidden: true,
          subcommands: [
            {
              name: "editbuffer",
            },
            {
              name: "hide",
            },
            {
              name: "init",
            },
            {
              name: "integration-ready",
            },
            {
              name: "keyboard-focus-changed",
            },
            {
              name: "pre-exec",
            },
            {
              name: "prompt",
            },
            {
              name: "clear-autocomplete-cache",
            },
          ],
        },
        {
          name: "debug",
          description: "Debug the app",
          hidden: true,
          subcommands: [
            {
              name: "app",
              description: "Run the desktop app directly for debugging",
            },
            {
              name: "autocomplete-window",
              description: "Toggle/set autocomplete window debug mode",
            },
            {
              name: "logs",
              description: "Show debug logs",
            },
            {
              name: "input-method",
              description: "Input method debugger",
              subcommands: [
                {
                  name: "install",
                },
                {
                  name: "uninstall",
                },
                {
                  name: "list",
                },
                {
                  name: "status",
                },
                {
                  name: "source",
                },
              ],
            },
            {
              name: "prompt-accessibility",
              description: "Prompt accessibility",
            },
            {
              name: "sample",
              description: "Sample desktop process",
            },
            {
              name: "verify-codesign",
              description: "Debug application codesigning",
            },
            {
              name: "accessibility",
              description: "Accessibility",
            },
            {
              name: "key-tester",
              description: "Key Tester",
            },
            {
              name: "diagnostics",
              description: "Watches diagnostics",
            },
            {
              name: "devtools",
              description: "Open up the devtools of a specific webview",
            },
            {
              name: "shell",
              description: "Disables sourcing of user shell config and instead uses a minimal shell config",
            },
            {
              name: "fix-permissions",
              description: "Update the shell config permissions to have the correct owner and access rights",
            },
          ],
        },
        {
          name: "settings",
          description: "Customize appearance & behavior",
          subcommands: [
            {
              name: "open",
              description: "Open the settings file",
            },
            {
              name: "list",
              description: "List configured settings (does not include implicit defaults)",
            },
          ],
        },
        {
          name: "uninstall",
          description: "Uninstall",
          hidden: true,
        },
        {
          name: "update",
          description: "Update the application",
        },
        {
          name: "diagnostic",
          description: "Print system and environment diagnostics",
        },
        {
          name: "init",
          description: "Generate the dotfiles for the given shell",
          hidden: true,
        },
        {
          name: "issue",
          description: "Open a prefilled GitHub bug report",
        },
        {
          name: "doctor",
          description: "Fix and diagnose common issues",
        },
        {
          name: "completion",
          description: "Generate CLI completion spec",
          hidden: true,
        },
        {
          name: "internal",
          description: "Internal subcommands",
          hidden: true,
          subcommands: [
            {
              name: "pre-cmd",
              description: "Command that is run during the PreCmd section of the shell integrations",
            },
            {
              name: "local-state",
              description: "Change the local-state file",
              subcommands: [
                {
                  name: "init",
                  description: "Reload the state listener",
                },
                {
                  name: "all",
                  description: "List all the settings",
                },
              ],
            },
            {
              name: "callback",
              description: "Callback used for the internal pseudoterminal",
            },
            {
              name: "install",
              description: "Install the Easy Complete cli",
            },
            {
              name: "uninstall",
              description: "Uninstall the Easy Complete cli",
            },
            {
              name: "get-shell",
            },
            {
              name: "should-figterm-launch",
              description: "Detects if Figterm should be launched",
            },
            {
              name: "sockets-dir",
            },
            {
              name: "stream-from-socket",
            },
            {
              name: "figterm-socket-path",
            },
            {
              name: "uuidgen",
            },
            {
              name: "attempt-to-finish-input-method-installation",
            },
          ],
        },
        {
          name: "launch",
          description: "Launch the desktop app",
        },
        {
          name: "quit",
          description: "Quit the desktop app",
        },
        {
          name: "restart",
          description: "Restart the desktop app",
        },
        {
          name: "integrations",
          description: "Manage system integrations",
          subcommands: [
            {
              name: "install",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "uninstall",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "reinstall",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
            {
              name: "status",
              subcommands: [
                {
                  name: "dotfiles",
                },
                {
                  name: "input-method",
                },
                {
                  name: "all",
                  description: "All supported integrations",
                },
              ],
            },
          ],
        },
        {
          name: "telemetry",
          description: "Enable/disable anonymous usage statistics",
          subcommands: [
            {
              name: "enable",
            },
            {
              name: "disable",
            },
            {
              name: "status",
            },
            {
              name: "track",
              description: "Send a single telemetry event (used by install/uninstall scripts)",
              hidden: true,
            },
          ],
        },
        {
          name: "version",
          description: "Show version information",
        },
        {
          name: "help",
          description: "Print this message or the help of the given subcommand(s)",
        },
      ],
    },
  ],
  options: [
    {
      name: ["-v", "--verbose"],
      description: "Increase logging verbosity",
      isRepeatable: true,
    },
    {
      name: "--help-all",
      description: "Print help for all subcommands, including internal commands",
    },
    {
      name: ["-h", "--help"],
      description: "Print help",
    },
    {
      name: ["-V", "--version"],
      description: "Print version",
    },
  ],
};

export default completion;
