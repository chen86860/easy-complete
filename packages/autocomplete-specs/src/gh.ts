import { filepaths, keyValue } from "@fig/autocomplete-generators";

const filterMessages = (out: string): string => {
  return out.startsWith("warning:") || out.startsWith("error:")
    ? out.split("\n").slice(1).join("\n")
    : out;
};

const postProcessRemoteBranches: Fig.Generator["postProcess"] = (out) => {
  const output = filterMessages(out);

  if (output.startsWith("fatal:")) {
    return [];
  }

  return output.split("\n").map((elm) => {
    // Trim and remove the remote part of the branch name (origin/, fork/...)
    let name = elm.trim().replace(/\w+\//, "");

    const parts = elm.match(/\S+/g);
    if (parts.length > 1) {
      if (parts[0] === "*") {
        // We are in a detached HEAD state
        if (elm.includes("HEAD detached")) {
          return {};
        }
        // Current branch
        return {
          name: elm.replace(/^\*\s*/, "").trim(),
          description: "Current branch",
          priority: 100,
          icon: "⭐️",
        };
      } else if (parts[0] === "+") {
        // Branch checked out in another worktree.
        name = elm.replace(/^\+\s*/, "").trim();
      }
    }

    return {
      name,
      description: "Branch",
      icon: "fig://icon?type=git",
      priority: 75,
    };
  });
};

interface RepoDataType {
  isPrivate: boolean;
  nameWithOwner: string;
  description: string | null;
}

const listRepoMapFunction = (repo: RepoDataType) => ({
  name: repo.nameWithOwner,
  description: repo.description,
  //be able to see if the repo is private at a glance
  icon: repo.isPrivate ? "🔒" : "👀",
});

const ghGenerators: Record<string, Fig.Generator> = {
  listCustomRepositories: {
    trigger: "/",
    //execute is script then postProcess
    custom: async (tokens, execute) => {
      //get the last command token
      const last = tokens.pop();

      //gatekeeper
      if (!last) return [];

      /**
       * this turns this input:
       * `withfig/autocomplete`
       *
       * into:
       * ["withfig", "autocomplete"]
       */
      const userRepoSplit = last.split("/");

      // make sure it has some length.
      if (userRepoSplit.length === 0) return [];

      //get first element of arr
      const userOrOrg = userRepoSplit.shift();

      // make sure it has some existence.
      if (!userOrOrg) return [];

      //run `gh repo list` cmd
      const { stdout, status } = await execute({
        command: "gh",
        args: [
          "repo",
          "list",
          userOrOrg,
          "--limit",
          "9999",
          "--json",
          "nameWithOwner,description,isPrivate",
        ],
      });

      // make sure it has some existence.
      if (status !== 0) return [];

      //parse the JSON string output of the command
      const repoArr: RepoDataType[] = JSON.parse(stdout);

      return repoArr.map(listRepoMapFunction);
    },
  },
  listRepositories: {
    /*
     * based on the gh api (use this instead as it also returns repos in the orgs that the user is part of)
     * https://cli.github.com/manual/gh_api
     *
     * --jq https://cli.github.com/manual/gh_help_formatting https://www.baeldung.com/linux/jq-command-json
     */
    script: [
      "gh",
      "api",
      "graphql",
      "--paginate",
      "-f",
      "query='query($endCursor: String) { viewer { repositories(first: 100, after: $endCursor) { nodes { isPrivate, nameWithOwner, description } pageInfo { hasNextPage endCursor }}}}'",
      "--jq",
      ".data.viewer.repositories.nodes[]",
    ],
    postProcess: (out) => {
      if (out) {
        /**
         * the string thats returned bt the command will contain lines like this:
         *
         * {...data}
         * {...data}
         * etc
         *
         * so the string needs to be transformed into a json array by adding commas on all newline chars then wrapping in square braces
         *
         * compared to none paginating request this is a touch slower 300ms or so, but it fixes the over 100 repos issue!
         *
         */
        const jsonifiedOutString = `[${out.replace(/(?:\r\n|\r|\n)/g, ",")}]`;
        try {
          const data: RepoDataType[] = JSON.parse(jsonifiedOutString);

          return data.map(listRepoMapFunction);
        } catch {
          return [];
        }
      }
      return [];
    },
  },
  listPR: {
    cache: { strategy: "stale-while-revalidate" },
    script: ["gh", "pr", "list", "--json=number,title,headRefName,state"],
    postProcess: (out) => {
      interface PR {
        headRefName: string;
        number: number;
        state: string;
        title: string;
      }
      const items = JSON.parse(out) as PR[];
      return items.map((line) => {
        const { number, title, headRefName, state } = line;
        return {
          name: number.toString(),
          displayName: title,
          description: `#${number} | ${headRefName}`,
          icon: state === "OPEN" ? "✅" : "☑️",
        };
      });
    },
  },
  listAlias: {
    script: ["gh", "alias", "list"],
    postProcess: (out) => {
      const aliases = out.split("\n").map((line) => {
        const [name, content] = line.split(":");

        return { name: name.trim(), content: content.trim() };
      });

      return aliases.map(({ name, content }) => ({
        name,
        description: `Alias for '${content}'`,
        icon: "fig://icon?type=commandkey",
      }));
    },
  },
  remoteBranches: {
    script: [
      "git",
      "--no-optional-locks",
      "branch",
      "-r",
      "--no-color",
      "--sort=-committerdate",
    ],
    postProcess: postProcessRemoteBranches,
  },
};

const codespaceOption: Fig.Option = {
  name: ["-c", "--codespace"],
  description: "Name of the codespace",
  args: {
    name: "string",
  },
};

const ghOptions: Record<string, Fig.Option> = {
  clone: { name: "--clone", description: "Clone the fork {true|false}" },
  cloneGitFlags: {
    name: "--",
    description: "Flags to pass to git when cloning",
    priority: 25,
    args: {
      name: "flags",
      description: "Flags to pass to git when cloning",
      isVariadic: true,
    },
  },
  confirm: {
    name: ["-y", "--confirm"],
    description: "Skip the confirmation prompt",
  },
  all: {
    name: ["--repo", "-R"],
    description: "Select another repository",
    args: {
      name: "[HOST/]OWNER/REPO",
    },
  },
  env: {
    name: ["-e", "--env"],
    description: "List secrets for an environment",
    args: {
      name: "string",
    },
  },
  org: {
    name: ["-o", "--org"],
    description: "List secrets for an environment",
    args: {
      name: "string",
    },
  },
};

const completionSpec: Fig.Spec = {
  name: "gh",
  description: "GitHub's CLI tool",
  args: {
    name: "alias",
    description: "Custom user defined gh alias",
    isOptional: true,
    generators: ghGenerators.listAlias,
    parserDirectives: {
      alias: async (token, executeShellCommand) => {
        const { stdout } = await executeShellCommand({
          command: "gh",
          args: ["alias", "list"],
        });
        const alias = stdout
          .split("\n")
          .find((line) => line.startsWith(`${token}:\t`));

        if (!alias) {
          throw new Error("Failed to parse alias");
        }

        return alias.slice(token.length + 1).trim();
      },
    },
  },
  subcommands: [
    {
      name: "alias",
      description: "Create command shortcuts",

      subcommands: [
        {
          name: "delete",
          description: "Delete an alias",
          args: {
            name: "alias",
            generators: ghGenerators.listAlias,
          },

          options: [
            {
              name: "--all",
              description: "Delete all aliases",
            },
          ],
        },
        {
          name: "list",
          description: "List available aliases",
        },
        {
          name: "set",
          description: "Set an alias for a gh command",
          args: [
            {
              name: "alias",
              description: "A word that will expand to the gh command",
            },
            {
              name: "expansion",
              description:
                "The gh command to be invoked, more info with --help",
            },
          ],
          options: [
            {
              name: ["-s", "--shell"],
              description:
                "Declare an alias to be passed through a shell interpreter",
            },

            {
              name: "--clobber",
              description: "Overwrite existing aliases of the same name",
            },
          ],
        },

        {
          name: "import",
          description: "Import aliases from a YAML file",
          options: [
            {
              name: "--label",
              args: {
                name: "enhancement",
              },
            },
            {
              name: "--clobber",
              description: "Overwrite existing aliases of the same name",
            },
          ],
        },
      ],
    },
    {
      name: "api",
      description: "Make an authenticated GitHub API request",
      options: [
        {
          name: "--allow-escape-sequences",
          description: "Allow printing terminal escape sequences",
        },
        {
          name: "--cache",
          description: 'Cache the response, e.g. "3600s", "60m", "1h"',
          args: {
            name: "duration",
          },
        },
        {
          name: ["-F", "--field"],
          description:
            'Add a typed parameter in key=value format (use "@<path>" or "@-" to read value from file or stdin)',
          args: {
            name: "key=value",
          },
        },
        {
          name: ["-H", "--header"],
          description: "Add a HTTP request header in key:value format",
          args: {
            name: "key:value",
          },
        },
        {
          name: "--hostname",
          description:
            'The GitHub hostname for the request (default "github.com")',
          args: {
            name: "string",
          },
        },
        {
          name: ["-i", "--include"],
          description:
            "Include HTTP response status line and headers in the output",
        },
        {
          name: "--input",
          description:
            'The file to use as body for the HTTP request (use "-" to read from standard input)',
          args: {
            name: "file",
          },
        },
        {
          name: ["-q", "--jq"],
          description:
            "Query to select values from the response using jq syntax",
          args: {
            name: "string",
          },
        },
        {
          name: ["-X", "--method"],
          description: 'The HTTP method for the request (default "GET")',
          args: {
            name: "string",
          },
        },
        {
          name: "--paginate",
          description:
            "Make additional HTTP requests to fetch all pages of results",
        },
        {
          name: ["-p", "--preview"],
          description:
            "Opt into GitHub API previews (names should omit '-preview')",
          args: {
            name: "strings",
          },
        },
        {
          name: ["-f", "--raw-field"],
          description: "Add a string parameter in key=value format",
          args: {
            name: "key=value",
          },
        },
        {
          name: "--silent",
          description: "Do not print the response body",
        },
        {
          name: "--slurp",
          description:
            'Use with "--paginate" to return an array of all pages of either JSON arrays or objects',
        },
        {
          name: ["-t", "--template"],
          description:
            'Format JSON output using a Go template; see "gh help formatting"',
          args: {
            name: "string",
          },
        },
        {
          name: "--verbose",
          description: "Include full HTTP request and response in the output",
        },
      ],
    },
    {
      name: "auth",
      description: "Login, logout, and refresh your authentication",

      subcommands: [
        {
          name: "login",
          description: "Authenticate with a GitHub host",
          options: [
            {
              name: ["-h", "--hostname"],
              description:
                "The hostname of the GitHub instance to authenticate with",
              args: { name: "hostname" },
            },
            {
              name: ["-s", "--scopes"],
              description: "Additional authentication scopes for gh to have",
              args: { name: "scopes" },
            },
            {
              name: ["-w", "--web"],
              description: "Open a browser to authenticate",
            },
            {
              name: "--with-token",
              description: "Read token from standard input",
              args: { name: "token" },
            },

            {
              name: ["-c", "--clipboard"],
              description: "Copy one-time OAuth device code to clipboard",
            },
            {
              name: "--expiring",
              description:
                "Prefer expiring credentials that gh refreshes automatically, if the host supports them",
            },
            {
              name: ["-p", "--git-protocol"],
              description:
                "The protocol to use for git operations on this host: {ssh|https}",
              args: {
                name: "string",
              },
            },
            {
              name: "--insecure-storage",
              description:
                "Save authentication credentials in plain text instead of credential store",
            },
            {
              name: "--skip-ssh-key",
              description: "Skip generate/upload SSH key prompt",
            },
          ],
        },
        {
          name: "logout",
          description: "Log out of a GitHub host",
          options: [
            {
              name: ["-h", "--hostname"],
              description:
                "The hostname of the GitHub instance to authenticate with",
              args: { name: "hostname" },
            },

            {
              name: ["-u", "--user"],
              description: "The account to log out of",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "refresh",
          description: "Refresh stored authentication credentials",
          options: [
            {
              name: ["-h", "--hostname"],
              description:
                "The hostname of the GitHub instance to authenticate with",
              args: { name: "hostname" },
            },
            {
              name: ["-s", "--scopes"],
              description: "Additional authentication scopes for gh to have",
              args: { name: "scopes" },
            },

            {
              name: ["-c", "--clipboard"],
              description: "Copy one-time OAuth device code to clipboard",
            },
            {
              name: "--expiring",
              description:
                "Prefer expiring credentials that gh refreshes automatically, if the host supports them",
            },
            {
              name: "--insecure-storage",
              description:
                "Save authentication credentials in plain text instead of credential store",
            },
            {
              name: ["-r", "--remove-scopes"],
              description: "Authentication scopes to remove from gh",
              args: {
                name: "strings",
              },
            },
            {
              name: "--reset-scopes",
              description:
                "Reset authentication scopes to the default minimum set of scopes",
            },
          ],
        },
        {
          name: "setup-git",
          description: "Configure git to use GitHub CLI as a credential helper",
          options: [
            {
              name: ["-h", "--hostname"],
              description:
                "The hostname of the GitHub instance to authenticate with",
              args: { name: "hostname" },
            },

            {
              name: ["-f", "--force"],
              description:
                "Force setup even if the host is not known. Must be used in conjunction with --hostname",
            },
          ],
        },
        {
          name: "status",
          description: "View authentication status",
          options: [
            {
              name: ["-h", "--hostname"],
              description:
                "The hostname of the GitHub instance to authenticate with",
              args: { name: "hostname" },
            },
            {
              name: "--with-token",
              description: "Read token from standard input",
              args: { name: "token" },
            },

            {
              name: ["-a", "--active"],
              description: "Display the active account only",
            },
            {
              name: "--jq",
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--no-refresh",
              description: "Do not automatically refresh expired tokens",
            },
            {
              name: ["-t", "--show-token"],
              description: "Display the auth token",
            },
            {
              name: "--template",
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },

        {
          name: "switch",
          description: "Switch active GitHub account",
          options: [
            {
              name: ["-u", "--user"],
              description: "The account to switch to",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "token",
          description:
            "Print the authentication token gh uses for a hostname and account",
          options: [
            {
              name: "--no-refresh",
              description: "Do not automatically refresh an expired token",
            },
            {
              name: ["-u", "--user"],
              description: "The account to output the token for",
              args: {
                name: "string",
              },
            },
          ],
        },
      ],
    },
    {
      name: "gpg-key",
      description: "Manage GPG keys registered with your GitHub account",

      subcommands: [
        {
          name: "add",
          description: "Add a GPG key to your GitHub account",

          options: [
            {
              name: ["-t", "--title"],
              description: "Title for the new key",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "Lists GPG keys in your GitHub account",
        },

        {
          name: "delete",
          description: "Delete a GPG key from your GitHub account",
          options: [
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
          ],
        },
      ],
    },
    {
      name: "browse",
      description: "Open the repository in the browser",
      args: {
        name: "[pr | issue | path[:line]",
        generators: ghGenerators.listPR,
        suggestCurrentToken: true,
      },
      options: [
        {
          name: ["-b", "--branch"],
          description: "Select another branch by passing in the branch name",
          args: {
            name: "branch",
            generators: ghGenerators.remoteBranches,
          },
        },
        {
          name: ["-c", "--commit"],
          description: "Open the last commit",
        },
        {
          name: ["-n", "--no-browser"],
          description: "Print destination URL instead of opening the browser",
        },
        {
          name: ["-p", "--projects"],
          description: "Open repository projects",
        },
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "[HOST/]OWNER/REPO",
          },
        },
        {
          name: ["-s", "--settings"],
          description: "Open repository settings",
        },
        {
          name: ["-w", "--wiki"],
          description: "Open repository wiki",
        },

        {
          name: ["-a", "--actions"],
          description: "Open repository actions",
        },
        {
          name: "--blame",
          description: "Open blame view for a file",
        },
        {
          name: ["-r", "--releases"],
          description: "Open repository releases",
        },
      ],
    },
    {
      name: "completion",
      description: "Generate shell completion scripts",
      options: [
        {
          name: ["-s", "--shell"],
          args: {
            name: "shell",
            suggestions: ["bash", "zsh", "fish", "powershell"],
          },
        },
      ],
    },
    {
      name: "config",
      description: "Manage configuration for gh",

      subcommands: [
        {
          name: "get",
          description: "Print the value of a given configuration key",
          args: {
            name: "key",
            suggestions: [
              "git_protocol",
              "editor",
              "prompt",
              "pager",
              "http_unix_socket",
            ],
          },
          options: [
            {
              name: ["-h", "--host"],
              args: { name: "host" },
              description: "Get per-host setting",
            },
          ],
        },
        {
          name: "set",
          description: "Update configuration with a value for the given key",
          subcommands: [
            {
              name: "git_protocol",
              description:
                "The protocol to use for git clone and push operations",
              args: {
                name: "option",
                suggestions: ["https", "ssh"],
              },
            },
            {
              name: "editor",
              description: "The text editor program to use for authoring text",
              args: { name: "editor", suggestions: ["vim", "nano"] },
            },
            {
              name: "prompt",
              description: "Toggle interactive prompting in the terminal",
              args: {
                name: "value",
                suggestions: ["enable", "disable"],
              },
            },
            {
              name: "pager",
              insertValue: "pager {cursor}",
              description:
                "The terminal pager program to send standard output to",
              args: { name: "value" },
            },
            {
              name: "http_unix_socket",
              description:
                "The path to a unix socket through which to make HTTP connection",
              args: { name: "path" },
            },
          ],
          options: [
            {
              name: ["-h", "--host"],
              args: { name: "host" },
              description: "Get per-host setting",
            },
          ],
        },

        {
          name: "clear-cache",
          description: "Clear the cli cache",
        },
        {
          name: "list",
          description: "Print a list of configuration keys and values",
        },
      ],
    },
    {
      name: "extensions",
      description: "Manage gh extensions",

      subcommands: [
        {
          name: "create",
          description: "Create a new extension",

          args: {
            name: "name",
          },
        },
        {
          name: "install",
          description: "Install a gh extension from a repository",

          args: {
            name: "repo",
          },
        },
        {
          name: "list",
          description: "List installed extension commands",
        },
        {
          name: "remove",
          description: "Remove an installed extension",

          args: {
            name: "name",
          },
        },
        {
          name: "upgrade",
          description: "Upgrade installed extensions",
          options: [
            { name: "--all", description: "Upgrade all extensions" },
            { name: "--force", description: "Force upgrade extensions" },
          ],
          args: {
            name: "name",
          },
        },
      ],
    },
    {
      name: "gist",
      description: "Manage gists",

      subcommands: [
        {
          name: "clone",
          description: "Clone a gist locally",

          args: [
            { name: "gist", description: "Gist ID or URL" },
            { name: "directory", isOptional: true, template: "folders" },
          ],
        },
        {
          name: "create",
          description: "Create a new gist",
          args: {
            name: "filename",
            template: "filepaths",
          },
          options: [
            {
              name: ["-d", "--desc"],
              description: "A description for this gist",
              insertValue: "-d '{cursor}'",
              args: { name: "description" },
            },
            {
              name: ["-f", "--filename"],
              description:
                "Provide a filename to be used when reading from STDIN",
              args: { name: "filename", template: "filepaths" },
            },
            {
              name: ["-p", "--public"],
              description: "List the gist publicly (default: secret)",
            },
            {
              name: ["-w", "--web"],
              description: "Open the web browser with created gist",
            },
          ],
        },
        {
          name: "delete",
          description: "Delete a gist",

          args: { name: "gist", description: "Gist ID or URL" },

          options: [
            {
              name: "--yes",
              description: "Confirm deletion without prompting",
            },
          ],
        },
        {
          name: "edit",
          description: "Edit one of your gists",
          args: { name: "gist", description: "Gist ID or URL" },
          options: [
            {
              name: ["-a", "--add"],
              description: "Add a new file to the gist",
              args: { name: "filename", template: "filepaths" },
            },
            {
              name: ["-f", "--filename"],
              description: "Select a file to edit",
            },

            {
              name: ["-d", "--desc"],
              description: "New description for the gist",
              args: {
                name: "string",
              },
            },
            {
              name: ["-r", "--remove"],
              description: "Remove a file from the gist",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List your gists",
          options: [
            {
              name: ["-L", "--limit"],
              displayName: "-L, --limit",
              description: "Maximum number of gists to fetch (default 10)",
              args: { name: "int" },
            },
            {
              name: "--public",
              description: "Show only public gists",
            },
            {
              name: "--secret",
              description: "Show only secret gists",
            },

            {
              name: "--filter",
              description: "Filter gists using a regular expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--include-content",
              description: "Include gists' file content when filtering",
            },
          ],
        },
        {
          name: "view",
          description: "View a gist",
          args: { name: "gist", description: "Gist ID or URL" },
          options: [
            {
              name: ["-f", "--filename"],
              description: "Display a single file from the gist",
            },
            {
              name: "--files",
              description: "List file names from the gist",
            },
            {
              name: ["-r", "--raw"],
              description: "Print raw instead of rendered gist contents",
            },
            {
              name: ["-w", "--web"],
              description: "Open gist in the browser",
            },

            {
              name: "--allow-escape-sequences",
              description: "Allow printing terminal escape sequences",
            },
          ],
        },

        {
          name: "rename",
          description: "Rename a file in a gist",
        },
      ],
    },
    {
      name: "issue",
      description: "Manage issues",

      subcommands: [
        {
          name: "close",
          description: "Close issue",
          args: { name: "issue", description: "Number or URL" },
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },

            {
              name: ["-c", "--comment"],
              description: "Leave a closing comment",
              args: {
                name: "string",
              },
            },
            {
              name: "--duplicate-of",
              description:
                "Mark as duplicate of another issue by number or URL",
              args: {
                name: "string",
              },
            },
            {
              name: ["-r", "--reason"],
              description:
                "Reason for closing: {completed|not planned|duplicate}",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "comment",
          description: "Create a new issue comment",
          args: { name: "issue", description: "Number or URL" },
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: ["-b", "--body"],
              insertValue: "-b '{cursor}'",
              description: "Supply a body. Will prompt for one otherwise",
              args: { name: "string" },
            },
            {
              name: ["-F", "--body-file"],
              description: "Read body text from file",
              args: { name: "file", template: "filepaths" },
            },
            {
              name: ["-e", "--editor"],
              description: "Add body using editor",
              args: { name: "editor" },
            },
            {
              name: ["-w", "--web"],
              description: "Add body in browser",
            },

            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: "--create-if-none",
              description:
                "Create a new comment if no comments are found. Can be used only with --edit-last",
            },
            {
              name: "--delete-last",
              description: "Delete the last comment of the current user",
            },
            {
              name: "--edit-last",
              description: "Edit the last comment of the current user",
            },
            {
              name: "--yes",
              description:
                "Skip the delete confirmation prompt when --delete-last is provided",
            },
          ],
        },
        {
          name: "create",
          description: "Create a new issue",
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: ["-a", "--assignee"],
              description:
                'Assign people by their login. Use "@me" to self-assign',
              args: { name: "login" },
            },
            {
              name: ["-b", "--body"],
              insertValue: "-b '{cursor}'",
              description: "Supply a body. Will prompt for one otherwise",
              args: { name: "string" },
            },
            {
              name: ["-F", "--body-file"],
              description: "Read body text from file",
              args: { name: "file", template: "filepaths" },
            },
            {
              name: ["-l", "--label"],
              insertValue: "-l '{cursor}'",
              description: "Add labels by name",
              args: { name: "name" },
            },
            {
              name: ["-m", "--milestone"],
              description: "Add the issue to a milestone by name",
              args: { name: "name" },
            },
            {
              name: ["-p", "--project"],
              insertValue: "-p '{cursor}'",
              description: "Add the issue to projects by name",
              args: { name: "name" },
            },
            {
              name: "--recover",
              insertValue: "--recover '{cursor}'",
              description: "Recover input from a failed run of create",
              args: { name: "string" },
            },
            {
              name: ["-t", "--title"],
              description: "Supply a title. Will prompt for one otherwise",
              insertValue: "-t '{cursor}'",
              args: { name: "string" },
            },
            {
              name: ["-w", "--web"],
              description: "Open the browser to create an issue",
            },

            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: "--blocked-by",
              description:
                "Mark the new issue as blocked by these issue numbers or URLs",
              args: {
                name: "numbers",
              },
            },
            {
              name: "--blocking",
              description:
                "Mark the new issue as blocking these issue numbers or URLs",
              args: {
                name: "numbers",
              },
            },
            {
              name: ["-e", "--editor"],
              description:
                "Skip prompts and open the text editor to write the title and body in. The first line is the title and the remaining text is the body.",
            },
            {
              name: "--parent",
              description:
                "Add the new issue as a sub-issue of the specified parent number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: ["-T", "--template"],
              description: "Template name to use as starting body text",
              args: {
                name: "name",
              },
            },
            {
              name: "--type",
              description: "Set the issue type by name",
              args: {
                name: "name",
              },
            },
          ],
        },
        {
          name: "delete",
          description: "Delete issue",
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },

            {
              name: "--yes",
              description: "Confirm deletion without prompting",
            },
          ],
        },
        {
          name: "edit",
          description: "Edit an issue",
          args: { name: "issue", description: "Number or URL" },
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: "--add-assignee",
              description:
                'Add assigned users by their login. Use "@me" to assign yourself',
              args: { name: "login" },
            },
            {
              name: "--add-label",
              description: "Add labels by name",
              args: { name: "name" },
            },
            {
              name: ["-b", "--body"],
              insertValue: "-b '{cursor}'",
              description: "Set the new body",
              args: { name: "string" },
            },
            {
              name: ["-F", "--body-file"],
              description: "Read body text from file",
              args: { name: "file", template: "filepaths" },
            },
            {
              name: ["-m", "--milestone"],
              description: "Edit the milestone the issue belongs to by name",
              args: { name: "name" },
            },
            {
              name: "--remove-assignee",
              description:
                'Remove assigned users by their login. Use "@me" to unassign yourself',
              args: { name: "login" },
            },
            {
              name: "--remove-label",
              description: "Remove labels by name",
              args: { name: "name" },
            },
            {
              name: "--remove-project",
              description: "Remove the issue from projects by name",
              args: { name: "name" },
            },
            {
              name: ["-t", "--title"],
              description: "Set the new title",
              insertValue: "-t '{cursor}'",
              args: { name: "string" },
            },

            {
              name: "--add-blocked-by",
              description:
                "Add 'blocked by' relationships by issue number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--add-blocking",
              description:
                "Add 'blocking' relationships by issue number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--add-project",
              description: "Add the issue to projects by title",
              args: {
                name: "title",
              },
            },
            {
              name: "--add-sub-issue",
              description: "Add sub-issues by number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: "--parent",
              description: "Set the parent issue by number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--remove-blocked-by",
              description:
                "Remove 'blocked by' relationships by issue number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--remove-blocking",
              description:
                "Remove 'blocking' relationships by issue number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--remove-milestone",
              description: "Remove the milestone association from the issue",
            },
            {
              name: "--remove-parent",
              description: "Remove the parent issue",
            },
            {
              name: "--remove-sub-issue",
              description: "Remove sub-issues by number or URL",
              args: {
                name: "number",
              },
            },
            {
              name: "--remove-type",
              description: "Remove the issue type from the issue",
            },
            {
              name: "--type",
              description: "Set the issue type by name",
              args: {
                name: "name",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List and filter issues in this repository",
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: ["-a", "--assignee"],
              description: "Filter by assignee",
              args: { name: "string" },
            },
            {
              name: ["-A", "--author"],
              description: "Filter by author",
              args: { name: "string" },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: { name: "expression" },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: { name: "fields" },
            },
            {
              name: ["-l", "--label"],
              insertValue: "-l '{cursor}'",
              description: "Filter by labels",
              args: { name: "string" },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of issues to fetch (default 30)",
              args: { name: "int" },
            },
            {
              name: "--mention",
              description: "Filter by mention",
              args: { name: "string" },
            },
            {
              name: ["-m", "--milestone"],
              insertValue: "-m '{cursor}'",
              description: "Filter by milestone number or `title`",
              args: { name: "number", description: "Number or Title" },
            },
            {
              name: ["-S", "--search"],
              insertValue: "--search '{cursor}'",
              description: "Search issues with query",
              args: { name: "query" },
            },
            {
              name: ["-s", "--state"],
              description: 'Filter by state (default "open")',
              args: {
                name: "state",
                suggestions: ["open", "closed", "all"],
                default: "open",
                description: '(default "open")',
              },
            },
            {
              name: ["-t", "--template"],
              description: "Format JSON output using a Go template",
              args: { name: "string" },
            },
            {
              name: ["-w", "--web"],
              description: "Open the browser to list the issue(s)",
            },

            {
              name: "--app",
              description: "Filter by GitHub App author",
              args: {
                name: "string",
              },
            },
            {
              name: "--type",
              description: "Filter by issue type name",
              args: {
                name: "name",
              },
            },
          ],
        },
        {
          name: "reopen",
          description: "Reopen issue",
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },

            {
              name: ["-c", "--comment"],
              description: "Add a reopening comment",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "status",
          description: "Show status of relevant issues",
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: { name: "expression" },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: { name: "fields" },
            },
            {
              name: ["-t", "--template"],
              description: "Format JSON output using a Go template",
              args: { name: "string" },
            },
          ],
        },
        {
          name: "transfer",
          description: "Transfer issue to another repository",
          args: [
            { name: "issue", description: "Number or URL" },
            { name: "destination-repo" },
          ],
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
          ],
        },
        {
          name: "view",
          description: "View an issue",
          args: { name: "issue", description: "Number or URL" },
          options: [
            {
              name: ["-R", "--repo"],
              insertValue: "-R '{cursor}'",
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: { name: "repo" },
            },
            {
              name: ["-c", "--comments"],
              description: "View issue comments",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: { name: "expression" },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: { name: "fields" },
            },
            {
              name: ["-t", "--template"],
              description: "Format JSON output using a Go template",
              args: { name: "string" },
            },
            {
              name: ["-w", "--web"],
              description: "Open an issue in the browser",
            },
          ],
        },

        {
          name: "artifact",
          description: "Work with issue artifacts (preview)",
          subcommands: [
            {
              name: "create",
              description: "Create issue artifacts (preview)",

              options: [
                {
                  name: "--attach",
                  description:
                    "Attach an image or video file, in '<file>#<image alt text>' format",
                  args: {
                    name: "file",
                  },
                },
                {
                  name: ["-b", "--body"],
                  description: "Content for a single document",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-F", "--body-file"],
                  description:
                    'Read content for a single artifact from file (use "-" to read from standard input)',
                  args: {
                    name: "file",
                  },
                },
                {
                  name: "--name",
                  description: "Name for a single artifact",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: "--type",
                  description:
                    "Type for documents: {generic|plan|embedded_html}",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "delete",
              description: "Delete issue artifacts (preview)",

              options: [
                {
                  name: "--yes",
                  description: "Confirm deletion without prompting",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "download",
              description: "Download issue artifacts (preview)",

              options: [
                {
                  name: "--clobber",
                  description: "Overwrite existing files of the same name",
                },
                {
                  name: ["-D", "--dir"],
                  description:
                    'The directory to download files into (default ".")',
                  args: {
                    name: "directory",
                  },
                },
                {
                  name: ["-O", "--output"],
                  description:
                    'The file to write a single artifact to (use "-" to write to standard output)',
                  args: {
                    name: "file",
                  },
                },
                {
                  name: "--skip-existing",
                  description:
                    "Skip downloading when files of the same name exist",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "edit",
              description: "Edit an issue artifact (preview)",

              options: [
                {
                  name: "--attach",
                  description:
                    "Attach an image or video file, in '<file>#<image alt text>' format",
                  args: {
                    name: "file",
                  },
                },
                {
                  name: ["-b", "--body"],
                  description: "New content; for a link, a URL",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-F", "--body-file"],
                  description:
                    'Read new content from file (use "-" to read from standard input)',
                  args: {
                    name: "file",
                  },
                },
                {
                  name: "--name",
                  description: "New name",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: "--restore-version",
                  description:
                    "Restore the version with this number from the edit history",
                  args: {
                    name: "number",
                  },
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "list",
              description: "List artifacts on an issue (preview)",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-L", "--limit"],
                  description: "Maximum number of artifacts to fetch",
                  args: {
                    name: "int",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
                {
                  name: "--type",
                  description:
                    "Filter by type: {generic|plan|link|embedded_html}",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "view",
              description: "View an issue artifact (preview)",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-w", "--web"],
                  description:
                    "Open a document's page on GitHub, or a link's URL",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
          ],
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "develop",
          description: "Manage linked branches for an issue",
          options: [
            {
              name: ["-b", "--base"],
              description:
                "Name of the remote branch you want to make your new branch from",
              args: {
                name: "string",
              },
            },
            {
              name: "--branch-repo",
              description:
                "Name or URL of the repository where you want to create your new branch",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--checkout"],
              description: "Checkout the branch after creating it",
            },
            {
              name: ["-l", "--list"],
              description: "List linked branches for the issue",
            },
            {
              name: ["-n", "--name"],
              description: "Name of the branch to create",
              args: {
                name: "string",
              },
            },
            {
              name: "--worktree",
              description:
                "Check out the branch into a worktree at the given path",
              args: {
                name: "path",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "lock",
          description: "Lock issue conversation",
          options: [
            {
              name: ["-r", "--reason"],
              description:
                "Optional reason for locking conversation (off_topic, resolved, spam, too_heated).",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "pin",
          description: "Pin an issue",
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "unlock",
          description: "Unlock issue conversation",
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "unpin",
          description: "Unpin an issue",
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "pr",
      description: "Manage pull requests",
      subcommands: [
        {
          name: "checkout",
          description: "Check out a pull request in git",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: "--recurse-submodules",
              description: "Update all active submodules (recursively)",
            },

            {
              name: ["-b", "--branch"],
              description:
                "Local branch name to use (default [the name of the head branch])",
              args: {
                name: "string",
              },
            },
            {
              name: "--detach",
              description: "Checkout PR with a detached HEAD",
            },
            {
              name: ["-f", "--force"],
              description:
                "Reset the existing local branch to the latest state of the pull request",
            },
            {
              name: "--worktree",
              description:
                "Check out the pull request into a worktree at the given path",
              args: {
                name: "path",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "checks",
          description: "Show CI status for a single pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: ["-w", "--web"],
              description: "Open the web browser to show details about checks",
            },

            {
              name: "--fail-fast",
              description: "Exit watch mode on first check failure",
            },
            {
              name: ["-i", "--interval"],
              description:
                "Refresh interval in seconds in watch mode (default 10)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--required",
              description: "Only show checks that are required",
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--watch",
              description: "Watch checks until they finish",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "close",
          description: "Close a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: ["-d", "--delete-branch"],
              description: "Delete the local and remote branch after close",
            },

            {
              name: ["-c", "--comment"],
              description: "Leave a closing comment",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "edit",
          description:
            "Edit a pull request. Without an argument, the pull request that belongs to the current branch is selected",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: "--add-assignee",
              description:
                'Add assigned users by their login. Use "@me" to assign yourself',
              args: {
                name: "login",
              },
            },
            {
              name: "--add-label",
              description: "Add labels by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--add-project",
              description: "Add the pull request to projects by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--add-reviewer",
              description: "Add reviewers by their login",
              args: {
                name: "login",
              },
            },
            {
              name: ["-B", "--base"],
              description: "Change the base branch for this pull request",
              args: {
                name: "branch",
              },
            },
            {
              name: ["-b", "--body"],
              description: "Set the new body",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: ["-m", "--milestone"],
              description:
                "Edit the milestone the pull request belongs to by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--remove-assignee",
              description:
                'Remove assigned users by their login. Use "@me" to unassign yourself',
              args: {
                name: "login",
              },
            },
            {
              name: "--remove-label",
              description: "Remove labels by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--remove-project",
              description: "Remove the pull request from projects by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--remove-reviewer",
              description: "Remove reviewers by their login",
              args: {
                name: "login",
              },
            },
            {
              name: ["-t", "--title"],
              description: "Set the new title",
              args: {
                name: "string",
              },
            },

            ghOptions.all,

            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: "--remove-milestone",
              description:
                "Remove the milestone association from the pull request",
            },
          ],
        },
        {
          name: "comment",
          description: "Create a new pr comment",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: ["-b", "--body"],
              insertValue: "-b '{cursor}'",
              description: "Supply a body. Will prompt for one otherwise",
              args: {
                name: "message",
              },
            },
            { name: ["-e", "--editor"], description: "Add body using editor" },
            { name: ["-w", "--web"], description: "Add body in browser" },

            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: "--create-if-none",
              description:
                "Create a new comment if no comments are found. Can be used only with --edit-last",
            },
            {
              name: "--delete-last",
              description: "Delete the last comment of the current user",
            },
            {
              name: "--edit-last",
              description: "Edit the last comment of the current user",
            },
            {
              name: "--yes",
              description:
                "Skip the delete confirmation prompt when --delete-last is provided",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "create",
          description: "Create a pull request",
          options: [
            {
              name: ["-a", "--assignee"],
              description: "Assign people by their login",
              args: {
                name: "login",
              },
            },
            {
              name: ["-B", "--base"],
              description: "The branch into which you want your code merged",
              args: {
                name: "branch",
                generators: ghGenerators.remoteBranches,
              },
            },
            {
              name: ["-b", "--body"],
              insertValue: "-b '{cursor}'",
              description: "Body for the pull request",
              args: {
                name: "body",
              },
            },
            {
              name: ["-d", "--draft"],
              description: "Mark pull request as a draft",
            },
            {
              name: ["-f", "--fill"],
              description:
                "Do not prompt for title/body and just use commit info",
            },
            {
              name: ["-H", "--head"],
              description:
                "The branch that contains commits for your pull request (default: current branch)",
              args: {
                name: "branch",
              },
            },
            {
              name: ["-l", "--label"],
              description:
                "The branch that contains commits for your pull request (default: current branch)",
              args: {
                name: "branch",
              },
            },
            {
              name: ["-m", "--milestone"],
              description: "Add the pull request to a milestone by name",
              args: {
                name: "name",
              },
            },
            {
              name: "--no-maintainer-edit",
              description:
                "Disable maintainer's ability to modify pull request",
            },
            {
              name: ["-p", "--project"],
              description: "Add the pull request to projects by name",
              args: {
                name: "name",
              },
            },
            {
              name: "-recover",
              description: "Recover input from a failed run of create",
              args: {
                name: "string",
              },
            },
            {
              name: ["-r", "--reviewer"],
              description:
                "Request reviews from people or teams by their handle",
              args: {
                name: "handle",
              },
            },
            {
              name: ["-t", "--title"],
              description: "Title for the pull request",
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the web browser to create a pull request",
            },

            {
              name: "--attach",
              description:
                "Attach an image or video file, in '<file>#<image alt text>' format",
              args: {
                name: "file",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: "--dry-run",
              description:
                "Print details instead of creating the PR. May still push git changes.",
            },
            {
              name: ["-e", "--editor"],
              description:
                "Skip prompts and open the text editor to write the title and body in. The first line is the title and the remaining text is the body.",
            },
            {
              name: "--fill-first",
              description: "Use first commit info for title and body",
            },
            {
              name: "--fill-verbose",
              description: "Use commits msg+body for description",
            },
            {
              name: "--recover",
              description: "Recover input from a failed run of create",
              args: {
                name: "string",
              },
            },
            {
              name: ["-T", "--template"],
              description: "Template file to use as starting body text",
              args: {
                name: "file",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "diff",
          description: "View changes in a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: "--color",
              description: "Use color in diff output: {always|never|auto}",
              args: {
                name: "choice",
              },
            },

            {
              name: "--allow-escape-sequences",
              description: "Allow printing terminal escape sequences",
            },
            {
              name: ["-e", "--exclude"],
              description: "Exclude files matching glob patterns from the diff",
              args: {
                name: "patterns",
              },
            },
            {
              name: "--name-only",
              description: "Display only names of changed files",
            },
            {
              name: "--patch",
              description: "Display diff in patch format",
            },
            {
              name: ["-w", "--web"],
              description: "Open the pull request diff in the browser",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List and filter pull requests in this repository",
          options: [
            {
              name: ["-a", "--assignee"],
              description: "Filter by assignee",
              args: {
                name: "string",
              },
            },
            {
              name: ["-B", "--base"],
              description: "Filter by base branch",
              args: {
                name: "string",
              },
            },
            {
              name: ["-l", "--label"],
              description: "Filter by labels",
              args: {
                name: "string",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of items to fetch",
              args: {
                name: "int",
              },
            },
            {
              name: ["-s", "--state"],
              description: "Filter by state: {open|closed|merged|all}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the browser to list the pull requests",
              args: {
                name: "string",
              },
            },

            {
              name: "--app",
              description: "Filter by GitHub App author",
              args: {
                name: "string",
              },
            },
            {
              name: ["-A", "--author"],
              description:
                "Filter by author (use --app to filter by a GitHub App)",
              args: {
                name: "string",
              },
            },
            {
              name: ["-d", "--draft"],
              description: "Filter by draft state",
            },
            {
              name: ["-H", "--head"],
              description:
                'Filter by head branch ("<owner>:<branch>" syntax not supported)',
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-S", "--search"],
              description: "Search pull requests with query",
              args: {
                name: "query",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "merge",
          description: "Merge a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: ["-d", "--delete-branch"],
              description: "Delete the local and remote branch after merge",
            },
            {
              name: ["-m", "--merge"],
              description: "Merge the commits with the base branch",
            },
            {
              name: ["-r", "--rebase"],
              description: "Rebase the commits onto the base branch",
            },
            {
              name: ["-s", "--squash"],
              description:
                "Squash the commits into one commit and merge it into the base branch",
            },

            {
              name: "--admin",
              description:
                "Use administrator privileges to merge a pull request that does not meet requirements",
            },
            {
              name: ["-A", "--author-email"],
              description: "Email text for merge commit author",
              args: {
                name: "text",
              },
            },
            {
              name: "--auto",
              description:
                "Automatically merge only after necessary requirements are met",
            },
            {
              name: ["-b", "--body"],
              description: "Body text for the merge commit",
              args: {
                name: "text",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: "--disable-auto",
              description: "Disable auto-merge for this pull request",
            },
            {
              name: "--match-head-commit",
              description:
                "Commit SHA that the pull request head must match to allow merge",
              args: {
                name: "sha",
              },
            },
            {
              name: ["-t", "--subject"],
              description: "Subject text for the merge commit",
              args: {
                name: "text",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "ready",
          description: "Mark a pull request as ready for review",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },

          options: [
            {
              name: "--undo",
              description: 'Convert a pull request to "draft"',
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "reopen",
          description: "Reopen a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },

          options: [
            {
              name: ["-c", "--comment"],
              description: "Add a reopening comment",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "review",
          description: "Add a review to a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            { name: ["-a", "--approve"], description: "Approve pull request" },
            {
              name: ["-b", "--body"],
              description: "Specify the body of a review",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--comment"],
              description: "Comment on a pull request",
            },
            {
              name: ["-r", "--request-changes"],
              description: "Request changes on a pull request",
            },

            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "status",
          description: "Show status of relevant pull requests",

          options: [
            {
              name: ["-c", "--conflict-status"],
              description:
                "Display the merge conflict status of each pull request",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "view",
          description: "View a pull request",
          args: {
            name: "number | url | branch",
            generators: ghGenerators.listPR,
          },
          options: [
            {
              name: ["-c", "--comments"],
              description: "View pull request comments",
            },
            {
              name: ["-w", "--web"],
              description: "Open a pull request in the browser",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },

        {
          name: "lock",
          description: "Lock pull request conversation",
          options: [
            {
              name: ["-r", "--reason"],
              description:
                "Optional reason for locking conversation (off_topic, resolved, spam, too_heated).",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "revert",
          description: "Revert a pull request",
          options: [
            {
              name: ["-b", "--body"],
              description: "Body for the revert pull request",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: ["-d", "--draft"],
              description: "Mark revert pull request as a draft",
            },
            {
              name: ["-t", "--title"],
              description: "Title for the revert pull request",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "unlock",
          description: "Unlock pull request conversation",
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "update-branch",
          description: "Update a pull request branch",
          options: [
            {
              name: "--rebase",
              description:
                "Update PR branch by rebasing on top of latest base branch",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "release",
      description: "Manage GitHub releases",
      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],

      subcommands: [
        {
          name: "create",
          description: "Create a new release",
          options: [
            {
              name: "--discussion-category",
              description: "Start a discussion in the specified category",
              args: {
                name: "string",
              },
            },
            {
              name: ["-d", "--draft"],
              description:
                "Save the release as a draft instead of publishing it",
            },
            {
              name: "--fail-on-no-commits",
              description:
                "Fail if there are no commits since the last release (no impact on the first release)",
            },
            {
              name: "--generate-notes",
              description:
                "Automatically generate title and notes for the release via GitHub Release Notes API",
            },
            {
              name: "--latest",
              description:
                'Mark this release as "Latest" (default [automatic based on date and version]). --latest=false to explicitly NOT set as latest',
            },
            {
              name: ["-n", "--notes"],
              description: "Release notes",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--notes-file"],
              description:
                'Read release notes from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: "--notes-from-tag",
              description:
                "Fetch notes from the tag annotation or message of commit associated with tag",
            },
            {
              name: "--notes-start-tag",
              description:
                "Tag to use as the starting point for generating release notes",
              args: {
                name: "string",
              },
            },
            {
              name: ["-p", "--prerelease"],
              description: "Mark the release as a prerelease",
            },
            {
              name: "--target",
              description:
                "Target branch or full commit SHA (default [main branch])",
              args: {
                name: "branch",
              },
            },
            {
              name: ["-t", "--title"],
              description: "Release title",
              args: {
                name: "string",
              },
            },
            {
              name: "--verify-tag",
              description:
                "Abort in case the git tag doesn't already exist in the remote repository",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List releases in a repository",
          options: [
            {
              name: "--exclude-drafts",
              description: "Exclude draft releases",
            },
            {
              name: "--exclude-pre-releases",
              description: "Exclude pre-releases",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of items to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-O", "--order"],
              description:
                'Order of releases returned: {asc|desc} (default "desc")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "delete",
          description: "Delete a release",
          options: [
            {
              name: "--cleanup-tag",
              description:
                "Delete the specified tag in addition to its release",
            },
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "delete-asset",
          description: "Delete an asset from a release",
          options: [
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "download",
          description: "Download release assets",
          options: [
            {
              name: "--allow-escape-sequences",
              description:
                "Allow printing terminal escape sequences when writing an asset to standard output",
            },
            {
              name: ["-A", "--archive"],
              description:
                "Download the source code archive in the specified format (zip or tar.gz)",
              args: {
                name: "format",
              },
            },
            {
              name: "--clobber",
              description: "Overwrite existing files of the same name",
            },
            {
              name: ["-D", "--dir"],
              description: 'The directory to download files into (default ".")',
              args: {
                name: "directory",
              },
            },
            {
              name: ["-O", "--output"],
              description:
                'The file to write a single asset to (use "-" to write to standard output)',
              args: {
                name: "file",
              },
            },
            {
              name: ["-p", "--pattern"],
              description: "Download only assets that match a glob pattern",
              args: {
                name: "stringarray",
              },
            },
            {
              name: "--skip-existing",
              description: "Skip downloading when files of the same name exist",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "edit",
          description: "Edit a release",
          options: [
            {
              name: "--discussion-category",
              description:
                "Start a discussion in the specified category when publishing a draft",
              args: {
                name: "string",
              },
            },
            {
              name: "--draft",
              description:
                "Save the release as a draft instead of publishing it",
            },
            {
              name: "--latest",
              description: 'Explicitly mark the release as "Latest"',
            },
            {
              name: ["-n", "--notes"],
              description: "Release notes",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--notes-file"],
              description:
                'Read release notes from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: "--prerelease",
              description: "Mark the release as a prerelease",
            },
            {
              name: "--tag",
              description: "The name of the tag",
              args: {
                name: "string",
              },
            },
            {
              name: "--target",
              description:
                "Target branch or full commit SHA (default [main branch])",
              args: {
                name: "branch",
              },
            },
            {
              name: ["-t", "--title"],
              description: "Release title",
              args: {
                name: "string",
              },
            },
            {
              name: "--verify-tag",
              description:
                "Abort in case the git tag doesn't already exist in the remote repository",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "upload",
          description: "Upload assets to a release",
          options: [
            {
              name: "--clobber",
              description:
                "Delete and re-upload existing assets of the same name",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "verify",
          description: "Verify the attestation for a release",
          options: [
            {
              name: "--format",
              description: "Output format: {json}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "verify-asset",
          description: "Verify that a given asset originated from a release",
          options: [
            {
              name: "--format",
              description: "Output format: {json}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "view",
          description: "View information about a release",
          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the release in the browser",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
      ],
    },
    {
      name: "repo",
      description: "Work with GitHub repositories",
      subcommands: [
        {
          name: "archive",
          description:
            "Archive a GitHub repository. With no argument, archives the current repository",
          isDangerous: true,
          args: {
            name: "repository",
            generators: ghGenerators.listRepositories,
            isOptional: true,
          },
          options: [ghOptions.confirm],
        },
        {
          name: "clone",
          description: `Clone a GitHub repository locally.
If the "OWNER/" portion of the "OWNER/REPO" repository argument is omitted, it
defaults to the name of the authenticating user.
Pass additional 'git clone' flags by listing them after '--'`,
          args: [
            {
              name: "repository",
              generators: [
                ghGenerators.listRepositories,
                ghGenerators.listCustomRepositories,
              ],
            },
            {
              name: "directory",
              isOptional: true,
            },
          ],
          options: [
            ghOptions.cloneGitFlags,
            {
              name: ["-u", "--upstream-remote-name"],
              description:
                'Upstream remote name when cloning a fork (default "upstream")',
              args: {
                name: "string",
              },
            },

            {
              name: "--no-upstream",
              description: "Do not add an upstream remote when cloning a fork",
            },
          ],
        },
        {
          name: "create",
          description: `Create a new GitHub repository.
To create a repository interactively, use 'gh repo create' with no arguments.
To create a remote repository non-interactively, supply the repository name and one of '--public', '--private', or '--internal'.
Pass '--clone' to clone the new repository locally.
To create a remote repository from an existing local repository, specify the source directory with '--source'. 
By default, the remote repository name will be the name of the source directory. 
Pass '--push' to push any local commits to the new repository`,
          args: {
            name: "name",
          },
          options: [
            ghOptions.confirm,
            {
              name: ["-d", "--description"],
              description: "Description of the repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-h", "--homepage"],
              description: "Repository home page URL",
              args: {
                name: "string",
              },
            },
            { name: "--public", description: "Make the repository public" },
            { name: "--private", description: "Make the repository private" },
            {
              name: "--internal",
              description: "Make the repository internal",
            },
            {
              name: ["-p", "--template"],
              description:
                "Make the new repository based on a template repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--clone"],
              description: "Clone the new repository to the current directory",
            },
            {
              name: "--disable-issues",
              description: "Disable issues in the new repository",
            },
            {
              name: "--disable-wiki",
              description: "Disable wiki in the new repository",
            },
            {
              name: ["-g", "--gitignore"],
              description: "Specify a gitignore template for the repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-l", "--license"],
              description: "Specify an Open Source License for the repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-r", "--remote"],
              description: "Specify remote name for the new repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-s", "--source"],
              description: "Specify path to local repository to use as source",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--team"],
              description:
                "The name of the organization team to be granted access",
              args: {
                name: "string",
              },
            },
            {
              name: "--include-all-branches",
              description: "Include all branches from template repository",
            },
            {
              name: "--push",
              description: "Push local commits to the new repository",
            },
            {
              name: "--add-readme",
              description: "Add a README file to the new repository",
            },
          ],
        },
        {
          name: "deploy-key",
          description: "Manage deploy keys in a repository",
          subcommands: [
            {
              name: "add",
              description: "Add a deploy key to a GitHub repository",
              args: {
                name: "key-file",
                description: "Path to the public key file",
                template: "filepaths",
              },
              options: [
                {
                  name: ["-w", "--allow-write"],
                  description: "Allow write access for the key",
                },
                {
                  name: ["-t", "--title"],
                  description: "Title of the new key",
                  args: {
                    name: "string",
                  },
                },

                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "delete",
              description: "Delete a deploy key from a GitHub repository",
              args: {
                name: "key-id",
                description: "ID of the key to delete",
              },

              options: [
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "list",
              description: "List deploy keys in a GitHub repository",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
          ],
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the `[HOST/]OWNER/REPO` format",
              args: {
                name: "[HOST/]OWNER/REPO",
              },
            },
          ],
        },
        {
          name: "delete",
          description: `Delete a GitHub repository.
With no argument, deletes the current repository. Otherwise, deletes the specified repository.
Deletion requires authorization with the "delete_repo" scope. 
To authorize, run "gh auth refresh -s delete_repo"`,
          isDangerous: true,
          args: {
            name: "repository",
            generators: ghGenerators.listRepositories,
            isOptional: true,
          },
          options: [
            ghOptions.confirm,
            {
              name: "--accept-cascading-deletion-of-private-forks",
              description:
                "Accept that deleting a private repository also deletes its forks",
            },
            {
              name: "--yes",
              description:
                "Confirm deletion without prompting for confirmation",
            },
          ],
        },
        {
          name: "edit",
          description: "Edit repository settings",
          args: {
            name: "repository",
            generators: ghGenerators.listRepositories,
            isOptional: true,
          },
          options: [
            ghOptions.clone,
            {
              name: "--add-topic",
              description: "Add repository topic",
              args: {
                name: "topic names",
              },
            },
            {
              name: "--allow-forking",
              description: "Allow forking of an organization repository",
            },
            {
              name: "--default-branch",
              description: "Set the default branch name for the repository",
              args: {
                name: "branch name",
              },
            },
            {
              name: "--delete-branch-on-merge",
              description: "Delete head branch when pull requests are merged",
            },
            {
              name: ["-d", "--description"],
              description: "Description of the repository",
              args: {
                name: "description",
              },
            },
            {
              name: "--enable-auto-merge",
              description: "Enable auto-merge functionality",
            },
            {
              name: "--enable-issues",
              description: "Enable issues in the repository",
            },
            {
              name: "--enable-merge-commit",
              description: "Enable merging pull requests via merge commit",
            },
            {
              name: "--enable-projects",
              description: "Enable projects in the repository",
            },
            {
              name: "--enable-rebase-merge",
              description: "Enable merging pull requests via rebase",
            },
            {
              name: "--enable-squash-merge",
              description: "Enable merging pull requests via squashed commit",
            },
            {
              name: "--enable-wiki",
              description: "Enable wiki in the repository",
            },
            {
              name: ["-h", "--homepage"],
              description: "Repository home page URL",
              args: {
                name: "URL",
              },
            },
            {
              name: "--remove-topic",
              description: "Remove repository topic",
              args: {
                name: "topic names",
              },
            },
            {
              name: "--template",
              description:
                "Make the repository available as a template repository",
            },
            {
              name: "--visibility",
              description:
                "Change the visibility of the repository to {public,private,internal}",
              args: {
                name: "string",
                suggestions: ["public", "private", "internal"],
              },
            },

            {
              name: "--accept-visibility-change-consequences",
              description:
                "Accept the consequences of changing the repository visibility",
            },
            {
              name: "--allow-update-branch",
              description:
                "Allow a pull request head branch that is behind its base branch to be updated",
            },
            {
              name: "--enable-advanced-security",
              description: "Enable advanced security in the repository",
            },
            {
              name: "--enable-discussions",
              description: "Enable discussions in the repository",
            },
            {
              name: "--enable-secret-scanning",
              description: "Enable secret scanning in the repository",
            },
            {
              name: "--enable-secret-scanning-push-protection",
              description:
                "Enable secret scanning push protection in the repository. Secret scanning must be enabled first",
            },
            {
              name: "--squash-merge-commit-message",
              description:
                "The default value for a squash merge commit message: {default|pr-title|pr-title-commits|pr-title-description}",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "fork",
          description: `Create a fork of a repository.
With no argument, creates a fork of the current repository. Otherwise, forks
the specified repository.
By default, the new fork is set to be your 'origin' remote and any existing
origin remote is renamed to 'upstream'. To alter this behavior, you can set
a name for the new fork's remote with --remote-name.
Additional 'git clone' flags can be passed in by listing them after '--'`,
          args: {
            name: "repository",
            generators: [
              ghGenerators.listRepositories,
              ghGenerators.listCustomRepositories,
            ],
          },
          options: [
            ghOptions.cloneGitFlags,
            {
              name: "--clone",
              description: "Clone the fork",
            },
            {
              name: "--remote",
              description: "Add remote for fork {true|false}",
            },
            {
              name: "--remote-name",
              description:
                'Specify a name for a fork\'s new remote. (default "origin")',
              args: {
                name: "string",
              },
            },
            {
              name: "--org",
              description: "Create the fork in an organization",
              args: {
                name: "string",
              },
            },
            {
              name: "--fork-name",
              description: "Rename the forked repository",
              args: {
                name: "string",
              },
            },

            {
              name: "--default-branch-only",
              description: "Only include the default branch in the fork",
            },
          ],
        },
        {
          name: "list",
          description: `List repositories owned by user or organization.
For more information about output formatting flags, see 'gh help formatting'`,
          args: {
            name: "owner",
            isOptional: true,
          },
          options: [
            {
              name: "--visibility",
              description: "Filter repositories by visibility",
              args: {
                name: "visibility",
                suggestions: ["public", "private", "internal"],
              },
            },
            {
              name: "--archived",
              description: "Show only archived repositories",
            },
            { name: "--fork", description: "Show only forked repositories" },
            {
              name: ["-l", "--language"],
              description: "Filter by primary coding language",
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of repositories to list (default 30)",
              args: {
                name: "string",
              },
            },
            {
              name: "--no-archived",
              description: "Omit archived repositories",
            },
            { name: "--source", description: "Show only non-forks" },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
            },
            {
              name: ["-t", "--template"],
              description: "Format JSON output using a Go template",
            },
            {
              name: "--topic",
              description: "Filter by topic",
              args: {
                name: "topic",
              },
            },
            {
              name: "--private",
              description: "Show only private repositories",
              deprecated: true,
            },
            {
              name: "--public",
              description: "Show only public repositories",
              deprecated: true,
            },
          ],
        },
        {
          name: "rename",
          description: `Rename a GitHub repository.
By default, this renames the current repository; otherwise renames the specified repository`,
          args: {
            name: "new-name",
            isOptional: true,
          },
          options: [
            ghOptions.confirm,
            ghOptions.all,
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the `[HOST/]OWNER/REPO` format",
              args: {
                name: "[HOST/]OWNER/REPO",
              },
            },
          ],
        },
        {
          name: "set-default",
          description:
            "Sets the default remote repository to use when querying the GitHub API for the locally cloned repository",
          args: {
            name: "repository",
            isOptional: true,
            generators: [
              ghGenerators.listRepositories,
              ghGenerators.listCustomRepositories,
            ],
          },
          options: [
            {
              name: ["-u", "--unset"],
              description: "Unset the current default repository",
            },
            {
              name: ["-v", "--view"],
              description: "View the current default repository",
            },
          ],
        },
        {
          name: "sync",
          description: `Sync destination repository from source repository. Syncing uses the main branch
of the source repository to update the matching branch on the destination
repository so they are equal. A fast forward update will be used execept when the
'--force' flag is specified, then the two branches will
by synced using a hard reset.    
Without an argument, the local repository is selected as the destination repository.
The source repository is the parent of the destination repository by default.
This can be overridden with the '--source' flag`,
          args: {
            name: "destination-repository",
            isOptional: true,
          },
          options: [
            {
              name: ["-b", "--branch"],
              description: "Branch to sync",
              args: {
                name: "branch name",
                default: "main",
              },
            },
            {
              name: "--force",
              description:
                "Hard reset the branch of the destination repository to match the source repository",
            },
            {
              name: ["-s", "--source"],
              description: "Source repository",
              args: {
                name: "source repository",
              },
            },
          ],
        },
        {
          name: "view",
          description: `Display the description and the README of a GitHub repository.
With no argument, the repository for the current directory is displayed.
With '--web', open the repository in a web browser instead.
With '--branch', view a specific branch of the repository.
For more information about output formatting flags, see 'gh help formatting'`,
          args: {
            name: "repository",
            isOptional: true,
            generators: [
              ghGenerators.listRepositories,
              ghGenerators.listCustomRepositories,
            ],
          },
          options: [
            {
              name: ["-b", "--branch"],
              description: "View a specific branch of the repository",
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open a repository in the browser",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description: "Format JSON output using a Go template",
              args: {
                name: "string",
              },
            },
          ],
        },

        {
          name: "autolink",
          description: "Manage autolink references",
          subcommands: [
            {
              name: "create",
              description: "Create a new autolink reference",

              options: [
                {
                  name: ["-n", "--numeric"],
                  description: "Mark autolink as numeric",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "delete",
              description: "Delete an autolink reference",

              options: [
                {
                  name: "--yes",
                  description: "Confirm deletion without prompting",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "list",
              description: "List autolink references for a GitHub repository",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-w", "--web"],
                  description: "List autolink references in the web browser",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
            {
              name: "view",
              description: "View an autolink reference",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Select another repository using the [HOST/]OWNER/REPO format",
                  args: {
                    name: "host/owner/repo",
                  },
                },
              ],
            },
          ],
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "gitignore",
          description: "List and view available repository gitignore templates",
          subcommands: [
            {
              name: "list",
              description: "List available repository gitignore templates",
            },
            {
              name: "view",
              description: "View an available repository gitignore template",
            },
          ],
        },
        {
          name: "license",
          description: "Explore repository licenses",
          subcommands: [
            {
              name: "list",
              description: "List common repository licenses",
            },
            {
              name: "view",
              description: "View a specific repository license",

              options: [
                {
                  name: ["-w", "--web"],
                  description:
                    "Open https://choosealicense.com/ in the browser",
                },
              ],
            },
          ],
        },
        {
          name: "read-dir",
          description: "List a directory in a repository (preview)",
          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--ref",
              description: "The branch, tag, or commit to list from",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "read-file",
          description: "Read a file from a repository (preview)",
          options: [
            {
              name: "--allow-escape-sequences",
              description: "Allow printing terminal escape sequences",
            },
            {
              name: "--clobber",
              description: "Overwrite the output path if it already exists",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-o", "--output"],
              description: "Write the file to a path instead of stdout",
              args: {
                name: "path",
              },
            },
            {
              name: "--ref",
              description: "The branch, tag, or commit to read from",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "unarchive",
          description: "Unarchive a repository",
          options: [
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
          ],
        },
      ],
    },
    {
      name: "run",
      description: "View details about workflow runs",
      options: [ghOptions.all],
      subcommands: [
        {
          name: "download",
          description: "Download artifacts generated by a workflow run",
          args: {
            name: "run-id",
          },

          options: [
            {
              name: ["-D", "--dir"],
              description:
                'The directory to download artifacts into (default ".")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-n", "--name"],
              description:
                "Download artifacts that match any of the given names",
              args: {
                name: "stringarray",
              },
            },
            {
              name: ["-p", "--pattern"],
              description: "Download artifacts that match a glob pattern",
              args: {
                name: "stringarray",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List recent workflow runs",
          options: [
            ghOptions.all,
            {
              name: ["-L", "--limit"],
              description: "Maximum number of runs to fetch (default 20)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-w", "--workflow"],
              description: "Filter runs by workflow",
              args: {
                name: "string",
              },
            },

            {
              name: ["-a", "--all"],
              description: "Include disabled workflows",
            },
            {
              name: ["-b", "--branch"],
              description: "Filter runs by branch",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--commit"],
              description: "Filter runs by the SHA of the commit",
              args: {
                name: "sha",
              },
            },
            {
              name: "--created",
              description: "Filter runs by the date it was created",
              args: {
                name: "date",
              },
            },
            {
              name: ["-e", "--event"],
              description: "Filter runs by which event triggered the run",
              args: {
                name: "event",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-s", "--status"],
              description:
                "Filter runs by status: {queued|completed|in_progress|requested|waiting|pending|action_required|cancelled|failure|neutral|skipped|stale|startup_failure|success|timed_out}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-u", "--user"],
              description: "Filter runs by user who triggered the run",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "rerun",
          description: "Rerun a failed run",
          options: [
            ghOptions.all,
            {
              name: ["-d", "--debug"],
              description: "Rerun with debug logging",
            },
            {
              name: "--failed",
              description: "Rerun only failed jobs, including dependencies",
            },
            {
              name: ["-j", "--job"],
              description:
                "Rerun a specific job ID from a run, including dependencies",
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "run-id",
          },
        },
        {
          name: "view",
          description: "View a summary of a workflow run",
          options: [
            ghOptions.all,
            {
              name: "--exit-status",
              description: "Exit with non-zero status if run failed",
            },
            {
              name: ["-j", "--job"],
              description: "View a specific job ID from a run",
              args: {
                name: "string",
              },
            },
            {
              name: "--log",
              description: "View full log for either a run or specific job",
            },
            {
              name: "--log-failed",
              description:
                "View the log for any failed steps in a run or specific job",
            },
            {
              name: ["-v", "--verbose"],
              description: "Show job steps",
            },
            {
              name: ["-w", "--web"],
              description: "Open run in the browser",
            },

            {
              name: ["-a", "--attempt"],
              description: "The attempt number of the workflow run",
              args: {
                name: "uint",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "run-id",
          },
        },
        {
          name: "watch",
          description: "Watch a run until it completes, showing its progress",
          options: [
            ghOptions.all,
            {
              name: "--exit-status",
              description: "Exit with non-zero status if run fails",
            },
            {
              name: ["-i", "--interval"],
              description: "Refresh interval in seconds (default 3)",
              args: {
                name: "int",
              },
            },

            {
              name: "--compact",
              description: "Show only relevant/failed steps",
            },
          ],
        },

        {
          name: "cancel",
          description: "Cancel a workflow run",
          options: [
            {
              name: "--force",
              description: "Force cancel a workflow run",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "delete",
          description: "Delete a workflow run",
          options: [
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
      ],
    },
    {
      name: "secret",
      description: "Manage GitHub secrets",
      options: [ghOptions.all],
      subcommands: [
        {
          name: "list",
          description:
            "List secrets for a repository, environment, or organization",
          options: [
            ghOptions.all,
            {
              name: ["-e", "--env"],
              description: "List secrets for an environment",
              args: {
                name: "string",
              },
            },
            {
              name: ["-o", "--org"],
              description: "List secrets for an environment",
              args: {
                name: "string",
              },
            },

            {
              name: ["-a", "--app"],
              description:
                "List secrets for a specific application: {actions|agents|codespaces|dependabot}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-u", "--user"],
              description: "List a secret for your user",
            },
          ],
        },
        {
          name: ["delete", "remove"],
          description: "Remove secrets",
          options: [
            ghOptions.all,
            ghOptions.env,
            ghOptions.org,
            {
              name: ["-a", "--app"],
              description:
                "Delete a secret for a specific application: {actions|agents|codespaces|dependabot}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-u", "--user"],
              description: "Delete a secret for your user",
            },
          ],
        },
        {
          name: "set",
          description: "Create or update secrets",
          options: [
            ghOptions.all,
            ghOptions.env,
            ghOptions.org,
            {
              name: ["-b", "--body"],
              description:
                "A value for the secret. Reads from STDIN if not specified",
              args: {
                name: "string",
              },
            },
            {
              name: ["-v", "--visibility"],
              description:
                "Set visibility for an organization secret: all, `private`, or `selected` (default 'private')",
              args: {
                name: "string",
                suggestions: [
                  { name: "private" },
                  {
                    name: "selected",
                  },
                  {
                    name: "all",
                  },
                ],
              },
            },

            {
              name: ["-a", "--app"],
              description:
                "Set the application for a secret: {actions|agents|codespaces|dependabot}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-f", "--env-file"],
              description:
                "Load secret names and values from a dotenv-formatted file",
              args: {
                name: "file",
              },
            },
            {
              name: "--no-repos-selected",
              description: "No repositories can access the organization secret",
            },
            {
              name: "--no-store",
              description:
                "Print the encrypted, base64-encoded value instead of storing it on GitHub",
            },
            {
              name: ["-r", "--repos"],
              description:
                "List of repositories that can access an organization or user secret",
              args: {
                name: "repositories",
              },
            },
            {
              name: ["-u", "--user"],
              description: "Set a secret for your user",
            },
          ],
        },
      ],
    },
    {
      name: "ssh-key",
      description: "Manage SSH keys",

      subcommands: [
        {
          name: "add",
          description: "Add an SSH key to your GitHub account",
          options: [
            ghOptions.all,
            {
              name: ["-t", "--title"],
              description: "Title for the new key",
            },

            {
              name: "--type",
              description:
                'Type of the ssh key: {authentication|signing} (default "authentication")',
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "<key-file>",
            template: "filepaths",
          },
        },
        {
          name: "list",
          description: "Lists SSH keys in your GitHub account",
          options: [ghOptions.all],
        },

        {
          name: "delete",
          description: "Delete an SSH key from your GitHub account",
          options: [
            {
              name: ["-y", "--yes"],
              description: "Skip the confirmation prompt",
            },
          ],
        },
      ],
    },
    {
      name: "workflow",
      description: "View details about GitHub Actions workflows",
      options: [ghOptions.all],
      subcommands: [
        {
          name: "disable",
          description: "Disable a workflow",
          options: [ghOptions.all],
          args: {
            name: "[<workflow-id> | <workflow-name>]",
          },
        },
        {
          name: "enable",
          description: "Enable a workflow",
          options: [ghOptions.all],
          args: {
            name: "[<workflow-id> | <workflow-name>]",
          },
        },
        {
          name: "list",
          description: "List workflows",
          options: [
            ghOptions.all,
            {
              name: ["-a", "--all"],
              description: "Show all workflows, including disabled workflows",
            },
            {
              name: ["-L", "--limit"],
              description: "Show all workflows, including disabled workflows",
              args: {
                name: "int",
                description:
                  "Maximum number of workflows to fetch (default 50)",
              },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "[<workflow-id> | <workflow-name>]",
          },
        },
        {
          name: "run",
          description: "Run a workflow by creating a workflow_dispatch event",
          options: [
            ghOptions.all,
            {
              name: ["-F", "--field"],
              description:
                "Add a string parameter in key=value format, respecting @ syntax",
              args: {
                name: "key=value",
              },
            },
            {
              name: "--json",
              description: "Read workflow inputs as JSON via STDIN",
            },
            {
              name: ["-f", "--raw-field"],
              description: "Add a string parameter in key=value format",
              args: {
                name: "key=value",
              },
            },
            {
              name: ["-r", "--ref"],
              description:
                "The branch or tag name which contains the version of the workflow file you'd like to run",
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "[<workflow-id> | <workflow-name>]",
          },
        },
        {
          name: "view",
          description: "View the summary of a workflow",
          options: [
            ghOptions.all,
            {
              name: ["-r", "--ref"],
              description:
                "The branch or tag name which contains the version of the workflow file you'd like to view",
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open workflow in the browser",
            },
            {
              name: ["-y", "--yaml"],
              description: "View the workflow yaml file",
            },
          ],
          args: [
            {
              name: "workflow-id",
            },
            {
              name: "workflow-name",
            },
            {
              name: "filename",
              template: "filepaths",
            },
          ],
        },
      ],
    },
    {
      name: ["codespace", "cs"],
      description: "Connect to and manage codespaces",
      subcommands: [
        {
          name: "code",
          description: "Open a codespace in Visual Studio Code",
          options: [
            codespaceOption,
            {
              name: "--insiders",
              description: "Use the insiders version of Visual Studio Code",
            },
            {
              name: ["-w", "--web"],
              description: "Use the web version of Visual Studio Code",
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "cp",
          description:
            "The cp command copies files between the local and remote file systems",
          options: [
            codespaceOption,
            {
              name: ["-e", "--expand"],
              description: "Expand remote file names on remote shell",
            },
            {
              name: ["-p", "--profile"],
              description: "Name of the SSH profile to use",
              args: {
                name: "string",
              },
            },
            {
              name: ["-r", "--recursive"],
              description: "Recursively copy directories",
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
          args: [
            {
              name: "sources",
              isVariadic: true,
            },
            {
              name: "dest",
            },
          ],
        },
        {
          name: "create",
          description: "Create a codespace",
          options: [
            {
              name: ["-b", "--branch"],
              description: "Repository branch",
            },
            {
              name: "--default-permissions",
              description:
                "Do not prompt to accept additional permissions requested by the codespace",
            },
            {
              name: "--devcontainer-path",
              description:
                "Path to the devcontainer.json file to use when creating codespace",
              args: {
                generators: filepaths({ extensions: ["json"] }),
              },
            },
            {
              name: ["-d", "--display-name"],
              description: "Display name for the codespace",
              args: {
                name: "string",
              },
            },
            {
              name: "--idle-timeout",
              description: "Allowed inactivity before codespace is stopped",
              args: {
                name: "duration",
                description: "Example: '10m', '1h'",
              },
            },
            {
              name: ["-l", "--location"],
              description: "Determined automatically if not provided",
              args: {
                name: "location",
                suggestions: [
                  "EastUs",
                  "SouthEastAsia",
                  "WestEurope",
                  "WestUs2",
                ],
              },
            },
            {
              name: ["-m", "--machine"],
              description: "Hardware specifications for the VM",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Repository name with owner: user/repo",
              args: {
                name: "string",
              },
            },
            {
              name: "--retention-period",
              description:
                "Allowed time after shutting down before the codespace is automatically deleted (maximum 30 days)",
              args: {
                name: "duration",
                description: "Example: '10m', '1h'",
              },
            },
            {
              name: ["-s", "--status"],
              description: "Show status of post-create command and dotfiles",
            },

            {
              name: ["-w", "--web"],
              description:
                "Create codespace from browser, cannot be used with --display-name, --idle-timeout, or --retention-period",
            },
          ],
        },
        {
          name: "delete",
          description:
            "Delete codespaces based on selection criteria. All codespaces for the authenticated user can be deleted, as well as codespaces for a specific repository. Alternatively, only codespaces older than N days can be deleted. Organization administrators may delete any codespace billed to the organization",
          options: [
            codespaceOption,
            {
              name: "--all",
              description: "Delete all codespaces",
            },
            {
              name: "--days",
              description: "Delete codespaces older than N days",
              args: {
                name: "N days",
              },
            },
            {
              name: ["-f", "--force"],
              description:
                "Skip confirmation for codespaces that contain unsaved changes",
              isDangerous: true,
            },
            {
              name: ["-o", "--org"],
              description: "The login handle of the organization (admin-only)",
              args: {
                name: "login",
              },
            },
            {
              name: ["-r", "--repo"],
              description: "Delete codespaces for a repository",
              args: {
                name: "repository",
              },
            },
            {
              name: ["-u", "--user"],
              description: "The username to delete codespaces for",
              args: {
                name: "username",
              },
            },

            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "edit",
          description: "Edit a codespace",
          options: [
            codespaceOption,
            {
              name: ["-d", "--display-name"],
              description: "Set the display name",
              args: {
                name: "string",
              },
            },
            {
              name: ["-m", "--machine"],
              description: "Set hardware specifications for the VM",
              args: {
                name: "string",
              },
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "jupyter",
          description: "Open a codespace in JupyterLab",
          options: [
            codespaceOption,
            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description:
            "List codespaces of the authenticated user. Alternatively, organization administrators may list all codespaces billed to the organization",
          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of codespaces to list",
              args: {
                name: "int",
                default: "30",
              },
            },
            {
              name: ["-o", "--org"],
              description:
                "The login handle of the organization to list codespaces for (admin-only)",
              args: {
                name: "login",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Repository name with owner: user/repo",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                "Format JSON output using a Go template; see 'gh help formatting'",
              args: {
                name: "string",
              },
            },
            {
              name: ["-u", "--user"],
              description: "The username to list codespaces for",
              args: {
                name: "string",
              },
            },

            {
              name: ["-w", "--web"],
              description:
                "List codespaces in the web browser, cannot be used with --user or --org",
            },
          ],
        },
        {
          name: "logs",
          description: "Access codespace logs",
          options: [
            codespaceOption,
            {
              name: ["-f", "--follow"],
              description: "Tail and follow the logs",
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "ports",
          description: "List ports in a codespace",
          subcommands: [
            {
              name: "forward",
              description: "Forward ports",
              options: [
                codespaceOption,
                {
                  name: "--all-interfaces",
                  description: "Listen on all network interfaces",
                },
                {
                  name: ["-R", "--repo"],
                  description:
                    "Filter codespace selection by repository name (user/repo)",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: "--repo-owner",
                  description:
                    "Filter codespace selection by repository owner (username or org)",
                  args: {
                    name: "string",
                  },
                },
              ],
              args: {
                generators: keyValue({ separator: ":", cache: true }),
                isVariadic: true,
              },
            },
            {
              name: "visibility",
              description: "Change the visibility of the forwarded port",
              options: [
                codespaceOption,
                {
                  name: ["-R", "--repo"],
                  description:
                    "Filter codespace selection by repository name (user/repo)",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: "--repo-owner",
                  description:
                    "Filter codespace selection by repository owner (username or org)",
                  args: {
                    name: "string",
                  },
                },
              ],
              args: {
                generators: keyValue({
                  separator: ":",
                  values: ["public", "private", "org"],
                  cache: true,
                }),
                isVariadic: true,
              },
            },
          ],
          options: [
            codespaceOption,
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                "Format JSON output using a Go template; see 'gh help formatting'",
              args: {
                name: "string",
              },
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "rebuild",
          description: "Rebuild a codespace",
          options: [
            codespaceOption,
            {
              name: "--full",
              description: "Perform a full rebuild",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "ssh",
          description: "SSH into a codespace",
          options: [
            codespaceOption,
            {
              name: "--config",
              description: "Write OpenSSH configuration to stdout",
            },
            {
              name: ["-d", "--debug"],
              description: "Log debug data to a file",
            },
            {
              name: "--debug-file",
              description: "Path of the file log to",
              args: {
                name: "file",
                template: "filepaths",
                suggestCurrentToken: true,
              },
            },
            {
              name: "--profile",
              description: "Name of the SSH profile to use",
              args: {
                name: "string",
              },
            },
            {
              name: "--server-port",
              description: "SSH server port number (0 => pick unused)",
              args: {
                name: "int",
              },
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
          args: {
            name: "command",
            isCommand: true,
            isOptional: true,
          },
        },
        {
          name: "stop",
          description: "Stop running a codespace",
          options: [
            codespaceOption,
            {
              name: ["-o", "--org"],
              description: "The login handle of the organization (admin-only)",
              args: {
                name: "login",
              },
            },
            {
              name: ["-u", "--user"],
              description: "The username to delete codespaces for",
              args: {
                name: "username",
              },
            },

            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
          ],
        },

        {
          name: "view",
          description: "View details about a codespace",
          options: [
            {
              name: ["-c", "--codespace"],
              description: "Name of the codespace",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Filter codespace selection by repository name (user/repo)",
              args: {
                name: "string",
              },
            },
            {
              name: "--repo-owner",
              description:
                "Filter codespace selection by repository owner (username or org)",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
      ],
    },
    {
      name: "project",
      description: "Manage projects",
      subcommands: [
        {
          name: "create",
          description: "Create a project",
          options: [
            {
              name: "--title",
              description: "Title for the project",
              args: { name: "title" },
            },
            {
              name: "--owner",
              description: 'Login of the owner. Use "@me" for the current user',
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "body" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "edit",
          description: "Edit a project",
          options: [
            {
              name: "--title",
              description: "New title of the project",
              args: { name: "title" },
            },
            {
              name: ["-d", "--description"],
              description: "New description of the project",
              args: { name: "description" },
            },
            {
              name: "--owner",
              description: 'Login of the owner. Use "@me" for the current user',
              args: { name: "owner" },
            },
            {
              name: "--readme",
              description: "New readme for the project",
              args: { name: "readme" },
            },
            {
              name: "--visibility",
              description: "Change project visibility",
              args: { name: "visibility", suggestions: ["PUBLIC", "PRIVATE"] },
            },

            {
              name: "--format",
              description: "Output format: {json}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List projects",
          options: [
            {
              name: "--closed",
              description: "Include closed projects",
              args: { name: "closed" },
            },
            {
              name: "--owner",
              description: "Login of the owner",
              args: { name: "owner" },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of projects to fetch",
              args: { name: "int", default: "30" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--web",
              description: "Open projects list in the browser",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "delete",
          description: "Delete a project",
          options: [
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "close",
          description: "Close a project",
          options: [
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--undo",
              description: "Reopen a closed project",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "view",
          description: "View a project",
          options: [
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: ["-w", "--web"],
              description: "Open project in the browser",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "copy",
          description: "Copy a project",
          options: [
            {
              name: "--title",
              description: "Title for the new project",
              args: { name: "title" },
            },
            {
              name: "--target-owner",
              description:
                "Login of the target owner. Use @me for the current user",
              args: { name: "target-owner" },
            },
            {
              name: "--source-owner",
              description:
                "Login of the source owner. Use @me for the current user",
              args: { name: "source-owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--drafts",
              description: "Include draft issues when copying",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "field-create",
          description: "Create a project field",
          options: [
            {
              name: "--name",
              description: "Name of the field",
              args: { name: "name" },
            },
            {
              name: "--data-type",
              description: "DataType of the new field",
              args: {
                name: "data-type",
                suggestions: ["TEXT", "SINGLE_SELECT", "DATE", "NUMBER"],
              },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--single-select-options",
              description: "Options for SINGLE_SELECT data type",
              args: { name: "single-select-options" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "field-delete",
          description: "Delete a project field",
          options: [
            {
              name: "--id",
              description: "ID of the field to delete",
              args: { name: "id" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "field-list",
          description: "List project fields",
          options: [
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of fields to fetch",
              args: { name: "int", default: "30" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-create",
          description: "Create a draft issue item in a project",
          options: [
            {
              name: "--title",
              description: "Title for the draft issue",
              args: { name: "title" },
            },
            {
              name: "--body",
              description: "Body for the draft issue",
              args: { name: "body" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-edit",
          description: "Edit a project item",
          options: [
            {
              name: "--id",
              description: "ID of the item to edit",
              args: { name: "id" },
            },
            {
              name: "--project-id",
              description: "ID of the project to which the field belongs to",
              args: { name: "project-id" },
            },
            {
              name: "--title",
              description: "Title of the draft issue item",
              args: { name: "title" },
            },
            {
              name: "--body",
              description: "Body of the draft issue item",
              args: { name: "body" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--field-id",
              description: "ID of the field to update",
              args: { name: "field-id" },
            },
            {
              name: "--iteration-id",
              description: "ID of the iteration value to set on the field",
              args: { name: "iteration-id" },
            },
            {
              name: "--text",
              description: "Text value for the field",
              args: { name: "text" },
            },
            {
              name: "--number",
              description: "Number value for the field",
              args: { name: "number" },
            },
            {
              name: "--single-select-option-id",
              description:
                "ID of the single select option value to set on the field",
              args: { name: "single-select-option-id" },
            },
            {
              name: "--date",
              description: "Date value for the field (YYYY-MM-DD)",
              args: { name: "date" },
            },

            {
              name: "--clear",
              description: "Remove field value",
            },
            {
              name: "--field",
              description: "Name of the field to update",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--owner",
              description:
                'Login of the owner. Use "@me" for the current user.',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--url",
              description:
                "URL of the issue or pull request whose project item to edit",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-delete",
          description: "Delete a project item",
          options: [
            {
              name: "--id",
              description: "ID of the item to delete",
              args: { name: "id" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-list",
          description: "List project items",
          options: [
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of items to fetch",
              args: { name: "int", default: "30" },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },

            {
              name: "--field",
              description: "Name of a field to show as an extra column",
              args: {
                name: "stringarray",
              },
            },
            {
              name: "--field-id",
              description: "ID of a field to show as an extra column",
              args: {
                name: "stringarray",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--query",
              description:
                'Filter items using the Projects filter syntax, e.g. "assignee:octocat -status:Done"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-add",
          description: "Add a pull request or an issue to a project",
          options: [
            {
              name: "--url",
              description:
                "URL of the issue or pull request to add to the project",
              args: { name: "url" },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "item-archive",
          description: "Archive a project item",
          options: [
            {
              name: "--id",
              description: "ID of the item to archive",
              args: { name: "id" },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: { name: "format" },
            },
            {
              name: "--owner",
              description: "Login of the owner. Use @me for the current user",
              args: { name: "owner" },
            },
            {
              name: "--undo",
              description: "Unarchive a project item",
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },

        {
          name: "link",
          description: "Link a project to a repository or a team",
          options: [
            {
              name: "--owner",
              description:
                'Login of the owner. Use "@me" for the current user.',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "The repository to be linked to this project",
              args: {
                name: "string",
              },
            },
            {
              name: ["-T", "--team"],
              description: "The team to be linked to this project",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "mark-template",
          description: "Mark a project as a template",
          options: [
            {
              name: "--format",
              description: "Output format: {json}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--owner",
              description: "Login of the org owner.",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--undo",
              description: "Unmark the project as a template.",
            },
          ],
        },
        {
          name: "unlink",
          description: "Unlink a project from a repository or a team",
          options: [
            {
              name: "--owner",
              description:
                'Login of the owner. Use "@me" for the current user.',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "The repository to be unlinked from this project",
              args: {
                name: "string",
              },
            },
            {
              name: ["-T", "--team"],
              description: "The team to be unlinked from this project",
              args: {
                name: "string",
              },
            },
          ],
        },
      ],
    },
    {
      name: "label",
      description: "Manage labels",
      subcommands: [
        {
          name: "clone",
          description: "Clone labels from one repository to another",
          args: { name: "source-repository" },
          options: [
            ghOptions.all,
            {
              name: ["-f", "--force"],
              description: "Overwrite labels in the destination repository",
            },
          ],
        },
        {
          name: "create",
          description: "Create a new label",
          args: { name: "name" },
          options: [
            ghOptions.all,
            {
              name: ["-c", "--color"],
              description: "Color of the label, e.g. E99695",
              args: { name: "color" },
            },
            {
              name: ["-d", "--description"],
              description: "Description of the label",
              args: { name: "description" },
            },
            {
              name: ["-f", "--force"],
              description:
                "Update the label color and description if it already exists",
            },
          ],
        },
        {
          name: "delete",
          description: "Delete a label from a repository",
          args: { name: "name" },
          options: [
            ghOptions.all,
            ghOptions.confirm,
            {
              name: "--yes",
              description: "Confirm deletion without prompting",
            },
          ],
        },
        {
          name: "edit",
          description: "Edit a label",
          args: { name: "name" },
          options: [
            ghOptions.all,
            {
              name: ["-c", "--color"],
              description: "Color of the label, e.g. E99695",
              args: { name: "color" },
            },
            {
              name: ["-d", "--description"],
              description: "Description of the label",
              args: { name: "description" },
            },
            {
              name: ["-n", "--name"],
              description: "New name of the label",
              args: { name: "name" },
            },
          ],
        },
        {
          name: "list",
          description: "List labels in a repository",
          options: [
            ghOptions.all,
            {
              name: ["-L", "--limit"],
              description: "Maximum number of labels to fetch (default 30)",
              args: { name: "int" },
            },
            {
              name: ["-S", "--search"],
              description: "Search label names and descriptions",
              args: { name: "query" },
            },
            {
              name: "--sort",
              description: "Sort fetched labels: {created|name}",
              args: { name: "field", suggestions: ["created", "name"] },
            },
            {
              name: "--order",
              description: "Order of labels returned: {asc|desc}",
              args: { name: "order", suggestions: ["asc", "desc"] },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "List labels in the web browser",
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "variable",
      description: "Manage GitHub Actions variables",
      subcommands: [
        {
          name: "delete",
          description: "Delete variables",
          args: { name: "variable-name" },
          options: [ghOptions.all, ghOptions.env, ghOptions.org],
        },
        {
          name: "get",
          description: "Get variables",
          args: { name: "variable-name" },
          options: [
            ghOptions.all,
            ghOptions.env,
            ghOptions.org,
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List variables",
          options: [
            ghOptions.all,
            ghOptions.env,
            ghOptions.org,
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "set",
          description: "Create or update variables",
          args: { name: "variable-name" },
          options: [
            ghOptions.all,
            ghOptions.env,
            ghOptions.org,
            {
              name: ["-b", "--body"],
              description: "The value for the variable",
              args: { name: "string" },
            },
            {
              name: ["-f", "--env-file"],
              description:
                "Load variable names and values from a dotenv-formatted file",
              args: { name: "file", template: "filepaths" },
            },
            {
              name: ["-v", "--visibility"],
              description:
                "Set visibility for an organization variable: {all|private|selected}",
              args: {
                name: "string",
                suggestions: ["all", "private", "selected"],
              },
            },

            {
              name: ["-r", "--repos"],
              description:
                "List of repositories that can access an organization variable",
              args: {
                name: "repositories",
              },
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "cache",
      description: "Manage GitHub Actions caches",
      subcommands: [
        {
          name: "delete",
          description: "Delete GitHub Actions caches",
          args: { name: "cache-id | cache-key", isOptional: true },
          options: [
            ghOptions.all,
            { name: ["-a", "--all"], description: "Delete all caches" },
            {
              name: "--succeed-on-no-caches",
              description:
                "Return exit code 0 if no caches found. Must be used in conjunction with --all",
            },

            {
              name: ["-r", "--ref"],
              description:
                "Delete by cache key and ref, formatted as refs/heads/<branch name> or refs/pull/<number>/merge",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List GitHub Actions caches",
          options: [
            ghOptions.all,
            {
              name: ["-L", "--limit"],
              description: "Maximum number of caches to fetch (default 30)",
              args: { name: "int" },
            },
            {
              name: ["-k", "--key"],
              description: "Filter by cache key prefix",
              args: { name: "string" },
            },
            {
              name: ["-r", "--ref"],
              description:
                "Filter by ref, formatted as refs/heads/<branch name> or refs/pull/<number>/merge",
              args: { name: "string" },
            },
            {
              name: ["-s", "--sort"],
              description:
                "Sort fetched caches: {created_at|last_accessed_at|size_in_bytes}",
              args: {
                name: "string",
                suggestions: [
                  "created_at",
                  "last_accessed_at",
                  "size_in_bytes",
                ],
              },
            },
            {
              name: ["-O", "--order"],
              description: "Order of caches returned: {asc|desc}",
              args: { name: "string", suggestions: ["asc", "desc"] },
            },

            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "extension",
      description: "Manage gh extensions",
      subcommands: [
        {
          name: "browse",
          description:
            "Enter a UI for browsing, adding, and removing extensions",

          options: [
            {
              name: "--debug",
              description: "Log to /tmp/extBrowse-*",
            },
            {
              name: ["-s", "--single-column"],
              description: "Render TUI with only one column of text",
            },
          ],
        },
        {
          name: "create",
          description: "Create a new extension",
          args: { name: "name", isOptional: true },

          options: [
            {
              name: "--precompiled",
              description:
                "Create a precompiled extension. Possible values: go, other",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "exec",
          description: "Execute an installed extension",
          args: { name: "extension-name" },
        },
        {
          name: "install",
          description: "Install a gh extension from a repository",
          args: { name: "repository" },

          options: [
            {
              name: "--force",
              description:
                "Force upgrade extension, or ignore if latest already installed",
            },
            {
              name: "--pin",
              description: "Pin extension to a release tag or commit ref",
              args: {
                name: "string",
              },
            },
          ],
        },
        { name: "list", description: "List installed extension commands" },
        {
          name: "remove",
          description: "Remove an installed extension",
          args: { name: "extension-name" },
        },
        {
          name: "search",
          description: "Search extensions to the GitHub CLI",
          args: { name: "query", isOptional: true },

          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--license",
              description: "Filter based on license type",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of extensions to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--order",
              description:
                "Order of repositories returned, ignored unless '--sort' flag is specified: {asc|desc} (default \"desc\")",
              args: {
                name: "string",
              },
            },
            {
              name: "--owner",
              description: "Filter on owner",
              args: {
                name: "strings",
              },
            },
            {
              name: "--sort",
              description:
                'Sort fetched repositories: {forks|help-wanted-issues|stars|updated} (default "best-match")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
        {
          name: "upgrade",
          description: "Upgrade installed extensions",
          args: { name: "extension-name", isOptional: true },
          options: [
            { name: "--all", description: "Upgrade all extensions" },
            { name: "--force", description: "Force upgrade extension" },

            {
              name: "--dry-run",
              description: "Only display upgrades",
            },
          ],
        },
      ],
    },
    {
      name: "ruleset",
      description: "View info about repo rulesets",
      subcommands: [
        {
          name: "check",
          description: "View rules that would apply to a given branch",
          args: { name: "branch", isOptional: true },
          options: [
            ghOptions.all,
            {
              name: "--default",
              description: "Check rules on default branch",
            },
            {
              name: ["-w", "--web"],
              description: "Open the branch rules page in a web browser",
            },
          ],
        },
        {
          name: "list",
          description: "List rulesets for a repository or organization",
          options: [
            ghOptions.all,
            ghOptions.org,
            {
              name: ["-L", "--limit"],
              description: "Maximum number of rulesets to list (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-p", "--parents"],
              description:
                "Whether to include rulesets configured at higher levels that also apply (default true)",
            },
            {
              name: ["-w", "--web"],
              description: "Open the list of rulesets in the web browser",
            },
          ],
        },
        {
          name: "view",
          description: "View information about a ruleset",
          args: { name: "ruleset-id", isOptional: true },
          options: [
            ghOptions.all,
            ghOptions.org,
            {
              name: ["-p", "--parents"],
              description:
                "Whether to include rulesets configured at higher levels that also apply (default true)",
            },
            {
              name: ["-w", "--web"],
              description: "Open the ruleset in the browser",
            },
          ],
        },
      ],

      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "agent-task",
      description: "Work with agent tasks",
      subcommands: [
        {
          name: "create",
          description: "Create an agent task",
          options: [
            {
              name: ["-b", "--base"],
              description:
                "Base branch for the pull request (use default branch if not provided)",
              args: {
                name: "string",
              },
            },
            {
              name: ["-a", "--custom-agent"],
              description:
                "Use a custom agent for the task. e.g., use 'my-agent' for the 'my-agent.md' agent",
              args: {
                name: "string",
              },
            },
            {
              name: "--follow",
              description: "Follow agent session logs",
            },
            {
              name: ["-F", "--from-file"],
              description:
                'Read task description from file (use "-" to read from standard input)',
              args: {
                name: "file",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List agent tasks",
          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of agent tasks to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open agent tasks in the browser",
            },
          ],
        },
        {
          name: "view",
          description: "View an agent task",
          args: { name: "task" },

          options: [
            {
              name: "--follow",
              description: "Follow agent session logs",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--log",
              description: "Show agent session logs",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open agent task in the browser",
            },
          ],
        },
      ],
    },
    {
      name: "attestation",
      description: "Work with artifact attestations",
      subcommands: [
        {
          name: "download",
          description: "Download artifact attestations",
          args: { name: "artifact" },
          options: [
            ghOptions.all,
            {
              name: ["-d", "--digest-alg"],
              description:
                'The algorithm used to compute a digest of the artifact: {sha256|sha512} (default "sha256")',
              args: {
                name: "string",
              },
            },
            {
              name: "--hostname",
              description: "Configure host to use",
              args: {
                name: "string",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of attestations to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-o", "--owner"],
              description: "GitHub organization to scope attestation lookup by",
              args: {
                name: "string",
              },
            },
            {
              name: "--predicate-type",
              description: "Filter attestations by provided predicate type",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "trusted-root",
          description: "Output trusted_root.jsonl contents",

          options: [
            {
              name: "--hostname",
              description: "Configure host to use",
              args: {
                name: "string",
              },
            },
            {
              name: "--tuf-root",
              description: "Path to the TUF root.json file on disk",
              args: {
                name: "string",
              },
            },
            {
              name: "--tuf-url",
              description: "URL to the TUF repository mirror",
              args: {
                name: "string",
              },
            },
            {
              name: "--verify-only",
              description: "Don't output trusted_root.jsonl contents",
            },
          ],
        },
        {
          name: "verify",
          description: "Verify an artifact's attestations",
          args: { name: "artifact", template: "filepaths" },
          options: [
            ghOptions.all,
            {
              name: ["-b", "--bundle"],
              description:
                "Path to bundle on disk, either a single bundle in a JSON file or a JSON lines file with multiple bundles",
              args: {
                name: "string",
              },
            },
            {
              name: "--bundle-from-oci",
              description:
                "When verifying an OCI image, fetch the attestation bundle from the OCI registry instead of from GitHub",
            },
            {
              name: "--cert-identity",
              description:
                "Enforce that the certificate's SubjectAlternativeName matches the provided value exactly",
              args: {
                name: "string",
              },
            },
            {
              name: ["-i", "--cert-identity-regex"],
              description:
                "Enforce that the certificate's SubjectAlternativeName matches the provided regex",
              args: {
                name: "string",
              },
            },
            {
              name: "--cert-oidc-issuer",
              description:
                'Enforce that the issuer of the OIDC token matches the provided value (default "https://token.actions.githubusercontent.com")',
              args: {
                name: "string",
              },
            },
            {
              name: "--custom-trusted-root",
              description:
                "Path to a trusted_root.jsonl file; likely for offline verification",
              args: {
                name: "string",
              },
            },
            {
              name: "--deny-self-hosted-runners",
              description:
                "Fail verification for attestations generated on self-hosted runners",
            },
            {
              name: ["-d", "--digest-alg"],
              description:
                'The algorithm used to compute a digest of the artifact: {sha256|sha512} (default "sha256")',
              args: {
                name: "string",
              },
            },
            {
              name: "--format",
              description: "Output format: {json}",
              args: {
                name: "string",
              },
            },
            {
              name: "--hostname",
              description: "Configure host to use",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of attestations to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--no-public-good",
              description:
                "Do not verify attestations signed with Sigstore public good instance",
            },
            {
              name: ["-o", "--owner"],
              description: "GitHub organization to scope attestation lookup by",
              args: {
                name: "string",
              },
            },
            {
              name: "--predicate-type",
              description:
                'Enforce that verified attestations\' predicate type matches the provided value (default "https://slsa.dev/provenance/v1")',
              args: {
                name: "string",
              },
            },
            {
              name: "--signer-digest",
              description:
                "Enforce that the digest associated with the signer workflow matches the provided value",
              args: {
                name: "string",
              },
            },
            {
              name: "--signer-repo",
              description:
                "Enforce that the workflow that signed the attestation's repository matches the provided value (<owner>/<repo>)",
              args: {
                name: "string",
              },
            },
            {
              name: "--signer-workflow",
              description:
                "Enforce that the workflow that signed the attestation matches the provided value ([host/]<owner>/<repo>/<path>/<to>/<workflow>)",
              args: {
                name: "string",
              },
            },
            {
              name: "--source-digest",
              description:
                "Enforce that the digest associated with the source repository matches the provided value",
              args: {
                name: "string",
              },
            },
            {
              name: "--source-ref",
              description:
                "Enforce that the git ref associated with the source repository matches the provided value",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
      ],
    },
    {
      name: "copilot",
      description: "Run the GitHub Copilot CLI",

      options: [
        {
          name: "--remove",
          description: "Remove the downloaded Copilot CLI",
        },
      ],
    },
    {
      name: "preview",
      description: "Execute previews for gh features",

      subcommands: [
        {
          name: "prompter",
          description: "Execute a test program to preview the prompter",
        },
      ],
    },
    {
      name: "skill",
      description: "Install and manage agent skills",
      subcommands: [
        {
          name: "install",
          description: "Install an agent skill",
          args: { name: "source" },

          options: [
            {
              name: "--agent",
              description: "Target agent (see supported values above)",
              args: {
                name: "string",
              },
            },
            {
              name: "--all",
              description:
                "Install all skills without prompting for skill selection",
            },
            {
              name: "--allow-hidden-dirs",
              description:
                "Include skills in hidden directories (e.g. .claude/skills/, .agents/skills/)",
            },
            {
              name: "--dir",
              description:
                "Install to a custom directory (overrides --agent and --scope)",
              args: {
                name: "string",
              },
            },
            {
              name: ["-f", "--force"],
              description: "Overwrite existing skills without prompting",
            },
            {
              name: "--from-local",
              description:
                "Treat the argument as a local directory path instead of a repository",
            },
            {
              name: "--pin",
              description: "Pin to a specific git tag or commit SHA",
              args: {
                name: "string",
              },
            },
            {
              name: "--scope",
              description:
                'Installation scope: {project|user} (default "project")',
              args: {
                name: "string",
              },
            },
            {
              name: "--upstream",
              description:
                "Install from the upstream source when a re-published skill is detected",
            },
          ],
        },
        {
          name: "list",
          description: "List installed agent skills",
          options: [
            {
              name: "--agent",
              description:
                "Filter by target agent: {github-copilot|claude-code|cursor|codex|gemini-cli|antigravity|antigravity-cli|antigravity2.0|adal|amp|augment|bob|cline|codebuddy|command-code|continue|cortex|crush|deepagents|devin|droid|firebender|goose|grok|iflow-cli|junie|kilo|kimi-cli|kiro-cli|kode|mcpjam|mistral-vibe|mux|neovate|openclaw|opencode|openhands|pi|pochi|qoder|qwen-code|replit|roo|trae|trae-cn|universal|warp|zencoder}",
              args: {
                name: "string",
              },
            },
            {
              name: "--dir",
              description: "Scan a custom directory for installed skills",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--scope",
              description: "Filter by installation scope: {project|user}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "remove",
          description: "Remove an installed agent skill",
          args: { name: "name" },
        },
        {
          name: "update",
          description: "Update installed agent skills",
          args: { name: "name", isOptional: true },

          options: [
            {
              name: "--all",
              description: "Update all skills without prompting",
            },
            {
              name: "--dir",
              description: "Scan a custom directory for installed skills",
              args: {
                name: "string",
              },
            },
            {
              name: "--dry-run",
              description: "Report available updates without modifying files",
            },
            {
              name: "--force",
              description: "Re-download even if already up to date",
            },
            {
              name: "--unpin",
              description:
                "Clear pinned version and include pinned skills in update",
            },
          ],
        },

        {
          name: "preview",
          description: "Preview a skill from a GitHub repository (preview)",
          options: [
            {
              name: "--allow-hidden-dirs",
              description:
                "Include skills in hidden directories (e.g. .claude/skills/, .agents/skills/)",
            },
          ],
        },
        {
          name: "publish",
          description:
            "Validate and publish skills to a GitHub repository (preview)",
          options: [
            {
              name: "--dry-run",
              description: "Validate without publishing",
            },
            {
              name: "--fix",
              description:
                "Auto-fix issues where possible without publishing (e.g. strip install metadata)",
            },
            {
              name: "--tag",
              description: "Version tag for the release (e.g. v1.0.0)",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "search",
          description: "Search for skills across GitHub (preview)",
          options: [
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of results per page (default 15)",
              args: {
                name: "int",
              },
            },
            {
              name: "--owner",
              description:
                "Filter results to a specific GitHub user or organization",
              args: {
                name: "string",
              },
            },
            {
              name: "--page",
              description: "Page number of results to fetch (default 1)",
              args: {
                name: "int",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
          ],
        },
      ],
    },
    {
      name: "org",
      description: "Manage organizations",
      subcommands: [
        {
          name: "list",
          description: "List organizations for the authenticated user",
          options: [
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of organizations to list (default 30)",
              args: { name: "int" },
            },
          ],
        },
      ],
    },
    {
      name: "search",
      description: "Search for repositories, issues, and pull requests",
      subcommands: [
        {
          name: "code",
          description: "Search within code",
          args: { name: "query" },

          options: [
            {
              name: "--extension",
              description: "Filter on file extension",
              args: {
                name: "string",
              },
            },
            {
              name: "--filename",
              description: "Filter on filename",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--language",
              description: "Filter results by language",
              args: {
                name: "string",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of code results to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--match",
              description:
                "Restrict search to file contents or file path: {file|path}",
              args: {
                name: "strings",
              },
            },
            {
              name: "--owner",
              description: "Filter on owner",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Filter on repository, in OWNER/REPO format",
              args: {
                name: "owner/repo",
              },
            },
            {
              name: "--size",
              description: "Filter on size range, in kilobytes",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
        {
          name: "commits",
          description: "Search for commits",
          args: { name: "query" },

          options: [
            {
              name: "--author",
              description: "Filter by author",
              args: {
                name: "string",
              },
            },
            {
              name: "--author-date",
              description: "Filter based on authored date",
              args: {
                name: "date",
              },
            },
            {
              name: "--author-email",
              description: "Filter on author email",
              args: {
                name: "string",
              },
            },
            {
              name: "--author-name",
              description: "Filter on author name",
              args: {
                name: "string",
              },
            },
            {
              name: "--committer",
              description: "Filter by committer",
              args: {
                name: "string",
              },
            },
            {
              name: "--committer-date",
              description: "Filter based on committed date",
              args: {
                name: "date",
              },
            },
            {
              name: "--committer-email",
              description: "Filter on committer email",
              args: {
                name: "string",
              },
            },
            {
              name: "--committer-name",
              description: "Filter on committer name",
              args: {
                name: "string",
              },
            },
            {
              name: "--hash",
              description: "Filter by commit hash",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of commits to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--merge",
              description: "Filter on merge commits",
            },
            {
              name: "--order",
              description:
                "Order of commits returned, ignored unless '--sort' flag is specified: {asc|desc} (default \"desc\")",
              args: {
                name: "string",
              },
            },
            {
              name: "--owner",
              description: "Filter on repository owner",
              args: {
                name: "strings",
              },
            },
            {
              name: "--parent",
              description: "Filter by parent hash",
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Filter on repository, in OWNER/REPO format",
              args: {
                name: "owner/repo",
              },
            },
            {
              name: "--sort",
              description:
                'Sort fetched commits: {author-date|committer-date} (default "best-match")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--tree",
              description: "Filter by tree hash",
              args: {
                name: "string",
              },
            },
            {
              name: "--visibility",
              description:
                "Filter based on repository visibility: {public|private|internal}",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
        {
          name: "issues",
          description: "Search for issues",
          args: { name: "query", isOptional: true },

          options: [
            {
              name: "--app",
              description: "Filter by GitHub App author",
              args: {
                name: "string",
              },
            },
            {
              name: "--archived",
              description:
                "Filter based on the repository archived state {true|false}",
            },
            {
              name: "--assignee",
              description: "Filter by assignee",
              args: {
                name: "string",
              },
            },
            {
              name: "--author",
              description:
                "Filter by author (use --app to filter by a GitHub App)",
              args: {
                name: "string",
              },
            },
            {
              name: "--closed",
              description: "Filter on closed at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--commenter",
              description: "Filter based on comments by user",
              args: {
                name: "user",
              },
            },
            {
              name: "--comments",
              description: "Filter on number of comments",
              args: {
                name: "number",
              },
            },
            {
              name: "--created",
              description: "Filter based on created at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--include-prs",
              description: "Include pull requests in results",
            },
            {
              name: "--interactions",
              description: "Filter on number of reactions and comments",
              args: {
                name: "number",
              },
            },
            {
              name: "--involves",
              description: "Filter based on involvement of user",
              args: {
                name: "user",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--label",
              description: "Filter on label",
              args: {
                name: "strings",
              },
            },
            {
              name: "--language",
              description: "Filter based on the coding language",
              args: {
                name: "string",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of results to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--locked",
              description: "Filter on locked conversation status",
            },
            {
              name: "--match",
              description:
                "Restrict search to specific field of issue: {title|body|comments}",
              args: {
                name: "strings",
              },
            },
            {
              name: "--mentions",
              description: "Filter based on user mentions",
              args: {
                name: "user",
              },
            },
            {
              name: "--milestone",
              description: "Filter by milestone title",
              args: {
                name: "title",
              },
            },
            {
              name: "--no-assignee",
              description: "Filter on missing assignee",
            },
            {
              name: "--no-label",
              description: "Filter on missing label",
            },
            {
              name: "--no-milestone",
              description: "Filter on missing milestone",
            },
            {
              name: "--no-project",
              description: "Filter on missing project",
            },
            {
              name: "--order",
              description:
                "Order of results returned, ignored unless '--sort' flag is specified: {asc|desc} (default \"desc\")",
              args: {
                name: "string",
              },
            },
            {
              name: "--owner",
              description: "Filter on repository owner",
              args: {
                name: "strings",
              },
            },
            {
              name: "--project",
              description: "Filter on project board owner/number",
              args: {
                name: "owner/number",
              },
            },
            {
              name: "--reactions",
              description: "Filter on number of reactions",
              args: {
                name: "number",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Filter on repository, in OWNER/REPO format",
              args: {
                name: "owner/repo",
              },
            },
            {
              name: "--search-type",
              description:
                'Type of issue search to perform: {lexical|semantic|hybrid} (default "lexical")',
              args: {
                name: "string",
              },
            },
            {
              name: "--sort",
              description:
                'Sort fetched results: {comments|created|interactions|reactions|reactions-+1|reactions--1|reactions-heart|reactions-smile|reactions-tada|reactions-thinking_face|updated} (default "best-match")',
              args: {
                name: "string",
              },
            },
            {
              name: "--state",
              description: "Filter based on state: {open|closed}",
              args: {
                name: "string",
              },
            },
            {
              name: "--team-mentions",
              description: "Filter based on team mentions",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--updated",
              description: "Filter on last updated at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--visibility",
              description:
                "Filter based on repository visibility: {public|private|internal}",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
        {
          name: "prs",
          description: "Search for pull requests",
          args: { name: "query", isOptional: true },

          options: [
            {
              name: "--app",
              description: "Filter by GitHub App author",
              args: {
                name: "string",
              },
            },
            {
              name: "--archived",
              description:
                "Filter based on the repository archived state {true|false}",
            },
            {
              name: "--assignee",
              description: "Filter by assignee",
              args: {
                name: "string",
              },
            },
            {
              name: "--author",
              description:
                "Filter by author (use --app to filter by a GitHub App)",
              args: {
                name: "string",
              },
            },
            {
              name: ["-B", "--base"],
              description: "Filter on base branch name",
              args: {
                name: "string",
              },
            },
            {
              name: "--checks",
              description:
                "Filter based on status of the checks: {pending|success|failure}",
              args: {
                name: "string",
              },
            },
            {
              name: "--closed",
              description: "Filter on closed at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--commenter",
              description: "Filter based on comments by user",
              args: {
                name: "user",
              },
            },
            {
              name: "--comments",
              description: "Filter on number of comments",
              args: {
                name: "number",
              },
            },
            {
              name: "--created",
              description: "Filter based on created at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--draft",
              description: "Filter based on draft state",
            },
            {
              name: ["-H", "--head"],
              description: "Filter on head branch name",
              args: {
                name: "string",
              },
            },
            {
              name: "--interactions",
              description: "Filter on number of reactions and comments",
              args: {
                name: "number",
              },
            },
            {
              name: "--involves",
              description: "Filter based on involvement of user",
              args: {
                name: "user",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--label",
              description: "Filter on label",
              args: {
                name: "strings",
              },
            },
            {
              name: "--language",
              description: "Filter based on the coding language",
              args: {
                name: "string",
              },
            },
            {
              name: ["-L", "--limit"],
              description: "Maximum number of results to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--locked",
              description: "Filter on locked conversation status",
            },
            {
              name: "--match",
              description:
                "Restrict search to specific field of issue: {title|body|comments}",
              args: {
                name: "strings",
              },
            },
            {
              name: "--mentions",
              description: "Filter based on user mentions",
              args: {
                name: "user",
              },
            },
            {
              name: "--merged",
              description: "Filter based on merged state",
            },
            {
              name: "--merged-at",
              description: "Filter on merged at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--milestone",
              description: "Filter by milestone title",
              args: {
                name: "title",
              },
            },
            {
              name: "--no-assignee",
              description: "Filter on missing assignee",
            },
            {
              name: "--no-label",
              description: "Filter on missing label",
            },
            {
              name: "--no-milestone",
              description: "Filter on missing milestone",
            },
            {
              name: "--no-project",
              description: "Filter on missing project",
            },
            {
              name: "--order",
              description:
                "Order of results returned, ignored unless '--sort' flag is specified: {asc|desc} (default \"desc\")",
              args: {
                name: "string",
              },
            },
            {
              name: "--owner",
              description: "Filter on repository owner",
              args: {
                name: "strings",
              },
            },
            {
              name: "--project",
              description: "Filter on project board owner/number",
              args: {
                name: "owner/number",
              },
            },
            {
              name: "--reactions",
              description: "Filter on number of reactions",
              args: {
                name: "number",
              },
            },
            {
              name: ["-R", "--repo"],
              description: "Filter on repository, in OWNER/REPO format",
              args: {
                name: "owner/repo",
              },
            },
            {
              name: "--review",
              description:
                "Filter based on review status: {none|required|approved|changes_requested}",
              args: {
                name: "string",
              },
            },
            {
              name: "--review-requested",
              description: "Filter on user or team requested to review",
              args: {
                name: "user",
              },
            },
            {
              name: "--reviewed-by",
              description: "Filter on user who reviewed",
              args: {
                name: "user",
              },
            },
            {
              name: "--sort",
              description:
                'Sort fetched results: {comments|reactions|reactions-+1|reactions--1|reactions-smile|reactions-thinking_face|reactions-heart|reactions-tada|interactions|created|updated} (default "best-match")',
              args: {
                name: "string",
              },
            },
            {
              name: "--state",
              description: "Filter based on state: {open|closed}",
              args: {
                name: "string",
              },
            },
            {
              name: "--team-mentions",
              description: "Filter based on team mentions",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--updated",
              description: "Filter on last updated at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--visibility",
              description:
                "Filter based on repository visibility: {public|private|internal}",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
        {
          name: "repos",
          description: "Search for repositories",
          args: { name: "query", isOptional: true },

          options: [
            {
              name: "--archived",
              description:
                "Filter based on the repository archived state {true|false}",
            },
            {
              name: "--created",
              description: "Filter based on created at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--followers",
              description: "Filter based on number of followers",
              args: {
                name: "number",
              },
            },
            {
              name: "--forks",
              description: "Filter on number of forks",
              args: {
                name: "number",
              },
            },
            {
              name: "--good-first-issues",
              description:
                "Filter on number of issues with the 'good first issue' label",
              args: {
                name: "number",
              },
            },
            {
              name: "--help-wanted-issues",
              description:
                "Filter on number of issues with the 'help wanted' label",
              args: {
                name: "number",
              },
            },
            {
              name: "--include-forks",
              description:
                "Include forks in fetched repositories: {false|true|only}",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: "--language",
              description: "Filter based on the coding language",
              args: {
                name: "string",
              },
            },
            {
              name: "--license",
              description: "Filter based on license type",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of repositories to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--match",
              description:
                "Restrict search to specific field of repository: {name|description|readme}",
              args: {
                name: "strings",
              },
            },
            {
              name: "--number-topics",
              description: "Filter on number of topics",
              args: {
                name: "number",
              },
            },
            {
              name: "--order",
              description:
                "Order of repositories returned, ignored unless '--sort' flag is specified: {asc|desc} (default \"desc\")",
              args: {
                name: "string",
              },
            },
            {
              name: "--owner",
              description: "Filter on owner",
              args: {
                name: "strings",
              },
            },
            {
              name: "--size",
              description: "Filter on a size range, in kilobytes",
              args: {
                name: "string",
              },
            },
            {
              name: "--sort",
              description:
                'Sort fetched repositories: {forks|help-wanted-issues|stars|updated} (default "best-match")',
              args: {
                name: "string",
              },
            },
            {
              name: "--stars",
              description: "Filter on number of stars",
              args: {
                name: "number",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--topic",
              description: "Filter on topic",
              args: {
                name: "strings",
              },
            },
            {
              name: "--updated",
              description: "Filter on last updated at date",
              args: {
                name: "date",
              },
            },
            {
              name: "--visibility",
              description:
                "Filter based on visibility: {public|private|internal}",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open the search query in the web browser",
            },
          ],
        },
      ],
    },

    {
      name: "discussion",
      description: "Work with GitHub Discussions (preview)",
      subcommands: [
        {
          name: "create",
          description: "Create a new discussion (preview)",
          options: [
            {
              name: ["-b", "--body"],
              description: "Body for the discussion",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from stdin)',
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--category"],
              description: "Category name or slug for the discussion",
              args: {
                name: "string",
              },
            },
            {
              name: ["-l", "--label"],
              description: "Labels to apply to the discussion",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--title"],
              description: "Title for the discussion",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "list",
          description: "List discussions in a repository (preview)",
          options: [
            {
              name: "--after",
              description: "Cursor for the next page of results",
              args: {
                name: "string",
              },
            },
            {
              name: "--answered",
              description: "Filter by answered state",
            },
            {
              name: ["-A", "--author"],
              description: "Filter by author",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--category"],
              description: "Filter by category name or slug",
              args: {
                name: "string",
              },
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-l", "--label"],
              description: "Filter by label",
              args: {
                name: "strings",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of discussions to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--order",
              description: 'Order of results: {asc|desc} (default "desc")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-S", "--search"],
              description: "Search discussions with query",
              args: {
                name: "query",
              },
            },
            {
              name: "--sort",
              description:
                'Sort by field: {created|updated} (default "updated")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-s", "--state"],
              description:
                'Filter by state: {open|closed|all} (default "open")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "List discussions in the web browser",
            },
          ],
        },
        {
          name: "comment",
          description:
            "Add, edit, or delete a comment or a reply on a discussion (preview)",
          options: [
            {
              name: ["-b", "--body"],
              description: "Comment body text",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "string",
              },
            },
            {
              name: "--delete",
              description: "Delete the specified comment",
            },
            {
              name: "--edit",
              description: "Edit the specified comment",
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: "--yes",
              description: "Skip the delete confirmation prompt",
            },
          ],
        },
        {
          name: "edit",
          description: "Edit a discussion (preview)",
          options: [
            {
              name: "--add-label",
              description: "Add labels by name",
              args: {
                name: "name",
              },
            },
            {
              name: ["-b", "--body"],
              description: "New body for the discussion",
              args: {
                name: "string",
              },
            },
            {
              name: ["-F", "--body-file"],
              description:
                'Read body text from file (use "-" to read from standard input)',
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--category"],
              description: "New category name or slug for the discussion",
              args: {
                name: "string",
              },
            },
            {
              name: "--remove-label",
              description: "Remove labels by name",
              args: {
                name: "name",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--title"],
              description: "New title for the discussion",
              args: {
                name: "string",
              },
            },
          ],
        },
        {
          name: "view",
          description: "View a discussion (preview)",
          options: [
            {
              name: "--after",
              description: "Cursor for the next page",
              args: {
                name: "string",
              },
            },
            {
              name: ["-c", "--comments"],
              description: "View discussion comments",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter JSON output using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--json",
              description: "Output JSON with the specified fields",
              args: {
                name: "fields",
              },
            },
            {
              name: ["-L", "--limit"],
              description:
                "Maximum number of comments or replies to fetch (default 30)",
              args: {
                name: "int",
              },
            },
            {
              name: "--order",
              description:
                'Order of comments or replies: {oldest|newest} (default "newest")',
              args: {
                name: "string",
              },
            },
            {
              name: ["-R", "--repo"],
              description:
                "Select another repository using the [HOST/]OWNER/REPO format",
              args: {
                name: "host/owner/repo",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format JSON output using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: ["-w", "--web"],
              description: "Open a discussion in the browser",
            },
          ],
        },
      ],
      options: [
        {
          name: ["-R", "--repo"],
          description:
            "Select another repository using the [HOST/]OWNER/REPO format",
          args: {
            name: "host/owner/repo",
          },
        },
      ],
    },
    {
      name: "event",
      description: "Listen to GitHub events (preview)",
      subcommands: [
        {
          name: "listen",
          description: "Wait for events on a specific resource",
          options: [
            {
              name: "--count",
              description: "Exit after this many events (default 1)",
              args: {
                name: "int",
              },
            },
            {
              name: "--event",
              description:
                "Event type to listen to; repeat or separate with commas for more than one",
              args: {
                name: "type",
              },
            },
            {
              name: "--follow",
              description: "Keep listening for events until stopped",
            },
            {
              name: ["-q", "--jq"],
              description: "Filter each event using a jq expression",
              args: {
                name: "expression",
              },
            },
            {
              name: "--resource",
              description: "URL of the pull request to listen to",
              args: {
                name: "string",
              },
            },
            {
              name: "--subscription",
              description: "ID of an existing subscription to listen to",
              args: {
                name: "string",
              },
            },
            {
              name: ["-t", "--template"],
              description:
                'Format each event using a Go template; see "gh help formatting"',
              args: {
                name: "string",
              },
            },
            {
              name: "--timeout",
              description:
                "Exit with status 8 after this long, in seconds or as a duration such as 30s or 10m",
              args: {
                name: "duration",
              },
            },
          ],
        },
        {
          name: "subscription",
          description: "Manage event subscriptions (preview)",
          subcommands: [
            {
              name: "create",
              description: "Create an event subscription (preview)",

              options: [
                {
                  name: "--event",
                  description:
                    "Event type to subscribe to; repeat or separate with commas for more than one",
                  args: {
                    name: "type",
                  },
                },
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: "--resource",
                  description: "URL of the resource to subscribe to",
                  args: {
                    name: "string",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
              ],
            },
            {
              name: "delete",
              description: "Delete an event subscription (preview)",
            },
            {
              name: "list",
              description: "List event subscriptions (preview)",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-L", "--limit"],
                  description:
                    "Maximum number of subscriptions to list (default 30)",
                  args: {
                    name: "int",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
              ],
            },
            {
              name: "view",
              description: "View an event subscription (preview)",

              options: [
                {
                  name: ["-q", "--jq"],
                  description: "Filter JSON output using a jq expression",
                  args: {
                    name: "expression",
                  },
                },
                {
                  name: "--json",
                  description: "Output JSON with the specified fields",
                  args: {
                    name: "fields",
                  },
                },
                {
                  name: ["-t", "--template"],
                  description:
                    'Format JSON output using a Go template; see "gh help formatting"',
                  args: {
                    name: "string",
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "licenses",
      description: "View third-party license information",
    },
    {
      name: "status",
      description:
        "Print information about relevant issues, pull requests, and notifications across repositories",
      options: [
        {
          name: ["-e", "--exclude"],
          description:
            "Comma separated list of repos to exclude in owner/name format",
          args: {
            name: "strings",
          },
        },
        {
          name: ["-o", "--org"],
          description: "Report status within an organization",
          args: {
            name: "string",
          },
        },
      ],
    },
  ],
  options: [
    {
      name: "--help",
      description: "Show help for command",
      isPersistent: true,
    },
  ],
};

export default completionSpec;
