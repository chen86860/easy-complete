const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Show help for this command",
  priority: 1,
};

const repoOption: Fig.Option = {
  name: ["-R", "--repo"],
  description: "Select another repository (OWNER/REPO or GROUP/NAMESPACE/REPO)",
  args: { name: "repo" },
  isPersistent: true,
};

const paginationOptions: Fig.Option[] = [
  {
    name: ["-p", "--page"],
    description: "Page number",
    args: { name: "page", default: "1" },
  },
  {
    name: ["-P", "--per-page"],
    description: "Number of items to list per page",
    args: { name: "per-page", default: "30" },
  },
];

const outputOptions: Fig.Option[] = [
  {
    name: "--jq",
    description: "Filter JSON output with a jq expression",
    args: { name: "expression" },
  },
  {
    name: ["-F", "--output"],
    description: "Format output as: text, json",
    args: { name: "output", suggestions: ["text", "json"], default: "text" },
  },
];

/*
 *  Generators
 */
const branchesGenerator: Fig.Generator = {
  script: [
    "git",
    "branch",
    "--format=%(refname:short)",
    "--sort=-committerdate",
  ],
  postProcess: (output) =>
    output
      .split("\n")
      .map((branch) => branch.trim())
      .filter(Boolean)
      .map((branch) => ({
        name: branch,
        description: "Branch",
        icon: "fig://icon?type=git",
      })),
};

const aliasesGenerator: Fig.Generator = {
  script: ["glab", "alias", "list"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.split(/[:\s]/)[0].trim())
      .filter(Boolean)
      .map((alias) => ({
        name: alias,
        description: "Alias",
        icon: "fig://icon?type=commandkey",
      })),
};

const mrIdArg: Fig.Arg = {
  name: "id | branch",
  description: "Merge request ID or source branch",
  generators: branchesGenerator,
  isOptional: true,
};

const issueIdArg: Fig.Arg = {
  name: "id | url",
  description: "Issue ID or URL",
  isOptional: true,
};

/*
 *  Subcommands
 */
const aliasCommand: Fig.Subcommand = {
  name: "alias",
  description: "Create, list, and delete aliases",
  subcommands: [
    {
      name: ["delete", "rm"],
      description: "Delete an alias",
      args: { name: "alias name", generators: aliasesGenerator },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List aliases",
      options: [helpOption],
    },
    {
      name: "set",
      description: "Set an alias for a longer command",
      args: [{ name: "alias name" }, { name: "command", isCommand: true }],
      options: [
        {
          name: ["-s", "--shell"],
          description:
            "Declare an alias to be passed through a shell interpreter",
        },
        helpOption,
      ],
    },
  ],
  options: [helpOption],
};

const authCommand: Fig.Subcommand = {
  name: "auth",
  description: "Manage authentication for glab",
  subcommands: [
    {
      name: "login",
      description: "Authenticate with a GitLab instance",
      options: [
        {
          name: ["-a", "--api-host"],
          description: "Hostname for the API endpoint",
          args: { name: "api-host" },
        },
        {
          name: ["-p", "--api-protocol"],
          description: "Api protocol",
          args: { name: "protocol", suggestions: ["https", "http"] },
        },
        {
          name: "--container-registry-domains",
          description: "Container registry domains, comma-separated",
          args: { name: "domains" },
        },
        {
          name: "--device",
          description: "Use the OAuth 2.0 device authorization flow",
        },
        {
          name: ["-g", "--git-protocol"],
          description: "Git protocol",
          args: { name: "protocol", suggestions: ["ssh", "https", "http"] },
        },
        {
          name: "--hostname",
          description: "The hostname of the GitLab instance",
          args: { name: "hostname" },
        },
        {
          name: "--insecure-storage",
          description: "Store the token as plaintext in the configuration file",
        },
        {
          name: ["-j", "--job-token"],
          description: "Ci job token",
          args: { name: "job-token" },
        },
        {
          name: "--ssh-hostname",
          description:
            "Ssh hostname for instances with a different SSH endpoint",
          args: { name: "ssh-hostname" },
        },
        {
          name: "--stdin",
          description: "Read the token from standard input",
        },
        {
          name: ["-t", "--token"],
          description: "Your GitLab access token",
          args: { name: "token" },
        },
        {
          name: "--web",
          description: "Skip the login type prompt and use web/OAuth login",
        },
        helpOption,
      ],
    },
    {
      name: "logout",
      description: "Log out from a GitLab instance",
      options: [
        {
          name: ["-a", "--all"],
          description: "Log out from all hosts",
        },
        {
          name: ["-h", "--hostname"],
          description: "The hostname of the GitLab instance",
          args: { name: "hostname" },
        },
        helpOption,
      ],
    },
    {
      name: "status",
      description: "View authentication status",
      options: [
        {
          name: ["-h", "--hostname"],
          description: "Check a specific instance's authentication status",
          args: { name: "hostname" },
        },
        {
          name: ["-t", "--show-token"],
          description: "Display the auth token",
        },
        helpOption,
      ],
    },
    {
      name: "configure-docker",
      description: "Register glab as a Docker credential helper",
      options: [helpOption],
    },
    {
      name: "docker-helper",
      description: "A Docker credential helper for GitLab registries",
      options: [helpOption],
    },
    {
      name: "dpop-gen",
      description: "Generate a DPoP proof JWT (experimental)",
      options: [helpOption],
    },
  ],
  options: [helpOption],
};

const mrCommand: Fig.Subcommand = {
  name: "mr",
  description: "Create, view, and manage merge requests",
  subcommands: [
    {
      name: "approve",
      description: "Approve merge requests",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "approvers",
      description: "List eligible approvers for merge requests",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "checkout",
      description: "Check out an open merge request",
      args: mrIdArg,
      options: [
        {
          name: ["-b", "--branch"],
          description: "Check out merge request with name <branch>",
          args: { name: "branch" },
        },
        {
          name: ["-f", "--force"],
          description: "Reset local branch to remote when they have diverged",
        },
        {
          name: ["-u", "--set-upstream-to"],
          description: "Set tracking of checked-out branch to [REMOTE/]BRANCH",
          args: { name: "upstream" },
        },
        helpOption,
      ],
    },
    {
      name: "close",
      description: "Close a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: ["create", "new"],
      description: "Create a new merge request",
      options: [
        {
          name: "--allow-collaboration",
          description: "Allow commits from other members",
        },
        {
          name: ["-a", "--assignee"],
          description: "Assign merge request to people by their usernames",
          args: { name: "usernames" },
        },
        {
          name: "--auto-merge",
          description: "Merge when all merge checks pass",
        },
        {
          name: "--copy-issue-labels",
          description: "Copy labels from issue to the merge request",
        },
        {
          name: "--create-source-branch",
          description: "Create a source branch if it does not exist",
        },
        {
          name: ["-d", "--description"],
          description:
            'Description for the merge request ("-" opens an editor)',
          args: { name: "description" },
        },
        {
          name: "--description-file",
          description: "Read the merge request description from a file",
          args: { name: "file", template: "filepaths" },
        },
        { name: "--draft", description: "Mark merge request as a draft" },
        {
          name: ["-f", "--fill"],
          description: "Use commit info for title/description and push",
        },
        {
          name: "--fill-commit-body",
          description: "Fill description with each commit body",
        },
        {
          name: ["-H", "--head"],
          description: "Select another head repository",
          args: { name: "repo" },
        },
        {
          name: ["-l", "--label"],
          description: "Add label by name",
          args: { name: "label" },
        },
        {
          name: ["-m", "--milestone"],
          description: "The global ID or title of a milestone to assign",
          args: { name: "milestone" },
        },
        {
          name: "--no-editor",
          description: "Don't open editor to enter a description",
        },
        {
          name: "--push",
          description: "Push committed changes after creating merge request",
        },
        {
          name: "--recover",
          description: "Save the options to a file if creation fails",
        },
        {
          name: ["-i", "--related-issue"],
          description: "Create a merge request for an issue",
          args: { name: "issue" },
        },
        {
          name: "--remove-source-branch",
          description: "Remove source branch on merge",
        },
        {
          name: "--reviewer",
          description: "Request review from users by their usernames",
          args: { name: "usernames" },
        },
        {
          name: "--signoff",
          description: "Append a DCO signoff to the description",
        },
        {
          name: ["-s", "--source-branch"],
          description: "Create a merge request from this branch",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: "--squash-before-merge",
          description: "Squash commits into a single commit when merging",
        },
        {
          name: ["-b", "--target-branch"],
          description: "The target branch to merge into",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: "--template",
          description:
            "Name of a template in '.gitlab/merge_request_templates/'",
          args: { name: "template" },
        },
        {
          name: ["-t", "--title"],
          description: "Supply a title for the merge request",
          args: { name: "title" },
        },
        {
          name: ["-w", "--web"],
          description: "Continue merge request creation in a browser",
        },
        { name: "--wip", description: "Mark merge request as a draft" },
        {
          name: ["-y", "--yes"],
          description: "Skip submission confirmation prompt",
        },
        helpOption,
      ],
    },
    {
      name: "delete",
      description: "Delete a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "diff",
      description: "View changes in a merge request",
      args: mrIdArg,
      options: [
        {
          name: "--color",
          description: "Use color in diff output",
          args: {
            name: "when",
            suggestions: ["always", "never", "auto"],
          },
        },
        helpOption,
      ],
    },
    {
      name: "for",
      description: "Create a new merge request for an issue",
      options: [helpOption],
    },
    {
      name: "issues",
      description: "Get issues that close when a merge request is merged",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List merge requests",
      options: [
        { name: ["-A", "--all"], description: "Get all merge requests" },
        {
          name: ["-a", "--assignee"],
          description: "Get only merge requests assigned to users",
          args: { name: "usernames" },
        },
        {
          name: "--author",
          description: "Filter merge request by author",
          args: { name: "username" },
        },
        {
          name: ["-c", "--closed"],
          description: "Get only closed merge requests",
        },
        {
          name: "--created-after",
          description: "Filter merge requests created after a date (ISO 8601)",
          args: { name: "date" },
        },
        {
          name: "--created-before",
          description: "Filter merge requests created before a date (ISO 8601)",
          args: { name: "date" },
        },
        {
          name: "--deployed-after",
          description: "Filter merge requests deployed after a date",
          args: { name: "date" },
        },
        {
          name: "--deployed-before",
          description: "Filter merge requests deployed before a date",
          args: { name: "date" },
        },
        {
          name: ["-d", "--draft"],
          description: "Filter by draft merge requests",
        },
        {
          name: "--environment",
          description:
            "Filter merge requests deployed to the given environment",
          args: { name: "name" },
        },
        {
          name: ["-g", "--group"],
          description: "Select a group/subgroup",
          args: { name: "group" },
        },
        {
          name: ["-l", "--label"],
          description: "Filter merge request by label",
          args: { name: "label" },
        },
        {
          name: ["-M", "--merged"],
          description: "Get only merged merge requests",
        },
        {
          name: ["-m", "--milestone"],
          description: "Filter merge request by milestone",
          args: { name: "milestone" },
        },
        {
          name: "--not-draft",
          description: "Filter by non-draft merge requests",
        },
        {
          name: "--not-label",
          description: "Filter merge requests by not having label",
          args: { name: "label" },
        },
        {
          name: ["-o", "--order"],
          description: "Order merge requests by field",
          args: {
            name: "field",
            suggestions: [
              "created_at",
              "updated_at",
              "merged_at",
              "title",
              "priority",
              "label_priority",
              "milestone_due",
              "popularity",
            ],
          },
        },
        {
          name: ["-r", "--reviewer"],
          description: "Get only merge requests with users as reviewer",
          args: { name: "usernames" },
        },
        {
          name: "--search",
          description: "Filter by string in title and description",
          args: { name: "string" },
        },
        {
          name: ["-S", "--sort"],
          description: "Sort direction for --order field",
          args: { name: "sort", suggestions: ["asc", "desc"] },
        },
        {
          name: ["-s", "--source-branch"],
          description: "Filter by source branch",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: ["-t", "--target-branch"],
          description: "Filter by target branch",
          args: { name: "branch", generators: branchesGenerator },
        },
        ...outputOptions,
        ...paginationOptions,
        helpOption,
      ],
    },
    {
      name: ["merge", "accept"],
      description: "Merge or accept a merge request",
      args: mrIdArg,
      options: [
        { name: "--auto-merge", description: "Set auto-merge" },
        {
          name: ["-m", "--message"],
          description: "Custom merge commit message",
          args: { name: "message" },
        },
        {
          name: ["-r", "--rebase"],
          description: "Rebase the commits onto the base branch",
        },
        {
          name: ["-d", "--remove-source-branch"],
          description: "Remove source branch on merge",
        },
        {
          name: "--sha",
          description: "Merge only if the HEAD of the source branch matches",
          args: { name: "sha" },
        },
        { name: ["-s", "--squash"], description: "Squash commits on merge" },
        {
          name: "--squash-message",
          description: "Custom squash commit message",
          args: { name: "message" },
        },
        {
          name: ["-y", "--yes"],
          description: "Skip submission confirmation prompt",
        },
        helpOption,
      ],
    },
    {
      name: ["note", "comment"],
      description: "Manage comments and discussions on a merge request",
      args: mrIdArg,
      options: [
        {
          name: ["-m", "--message"],
          description: "Comment/note message",
          args: { name: "message" },
        },
        helpOption,
      ],
    },
    {
      name: "rebase",
      description: "Rebase the source branch against its target branch",
      args: mrIdArg,
      options: [
        {
          name: "--skip-ci",
          description: "Skip creating a CI/CD pipeline for the rebase",
        },
        helpOption,
      ],
    },
    {
      name: "reopen",
      description: "Reopen a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "revoke",
      description: "Revoke approval on a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "subscribe",
      description: "Subscribe to a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "todo",
      description: "Add a to-do item to a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "unsubscribe",
      description: "Unsubscribe from a merge request",
      args: mrIdArg,
      options: [helpOption],
    },
    {
      name: "update",
      description: "Update a merge request",
      args: mrIdArg,
      options: [
        {
          name: ["-t", "--title"],
          description: "Title of the merge request",
          args: { name: "title" },
        },
        {
          name: ["-d", "--description"],
          description: "Merge request description",
          args: { name: "description" },
        },
        {
          name: ["-l", "--label"],
          description: "Add labels",
          args: { name: "label" },
        },
        {
          name: "--unlabel",
          description: "Remove labels",
          args: { name: "label" },
        },
        { name: "--draft", description: "Mark merge request as a draft" },
        {
          name: "--ready",
          description: "Mark merge request as ready for review",
        },
        helpOption,
      ],
    },
    {
      name: ["view", "show"],
      description: "Display information about a merge request",
      args: mrIdArg,
      options: [
        {
          name: ["-c", "--comments"],
          description: "Show merge request comments and activities",
        },
        { name: "--resolved", description: "Show only resolved discussions" },
        {
          name: "--unresolved",
          description: "Show only unresolved discussions",
        },
        {
          name: ["-s", "--system-logs"],
          description: "Show system activities and logs",
        },
        {
          name: ["-w", "--web"],
          description: "Open merge request in a browser",
        },
        ...outputOptions,
        ...paginationOptions,
        helpOption,
      ],
    },
  ],
  options: [repoOption, helpOption],
};

const issueCommand: Fig.Subcommand = {
  name: "issue",
  description: "Work with GitLab issues",
  subcommands: [
    {
      name: "board",
      description: "Work with GitLab issue boards",
      subcommands: [
        {
          name: "view",
          description: "View a project issue board",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: "close",
      description: "Close an issue",
      args: issueIdArg,
      options: [helpOption],
    },
    {
      name: ["create", "new"],
      description: "Create an issue",
      options: [
        {
          name: ["-a", "--assignee"],
          description: "Assign issue to people by their usernames",
          args: { name: "usernames" },
        },
        {
          name: ["-c", "--confidential"],
          description: "Set an issue to be confidential",
        },
        {
          name: ["-d", "--description"],
          description: 'Issue description ("-" opens an editor)',
          args: { name: "description" },
        },
        {
          name: "--description-file",
          description: "Read the issue description from a file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--due-date",
          description: "A date in 'YYYY-MM-DD' format",
          args: { name: "date" },
        },
        {
          name: "--epic",
          description: "Id of the epic to add the issue to",
          args: { name: "epic" },
        },
        {
          name: ["-l", "--label"],
          description: "Add label by name",
          args: { name: "label" },
        },
        {
          name: "--link-type",
          description: "Type for the issue link",
          args: { name: "link-type", default: "relates_to" },
        },
        {
          name: "--linked-issues",
          description: "The IIDs of issues that this issue links to",
          args: { name: "iids" },
        },
        {
          name: "--linked-mr",
          description: "The IID of a merge request to resolve all issues in",
          args: { name: "iid" },
        },
        {
          name: ["-m", "--milestone"],
          description: "The global ID or title of a milestone to assign",
          args: { name: "milestone" },
        },
        {
          name: "--no-editor",
          description: "Don't open editor to enter a description",
        },
        {
          name: "--recover",
          description: "Save the options to a file if creation fails",
        },
        {
          name: "--template",
          description: "Name of a template in '.gitlab/issue_templates/'",
          args: { name: "template" },
        },
        {
          name: ["-e", "--time-estimate"],
          description: "Set time estimate for the issue",
          args: { name: "estimate" },
        },
        {
          name: ["-s", "--time-spent"],
          description: "Set time spent for the issue",
          args: { name: "spent" },
        },
        {
          name: ["-t", "--title"],
          description: "Issue title",
          args: { name: "title" },
        },
        {
          name: "--web",
          description: "Continue issue creation with web interface",
        },
        {
          name: ["-w", "--weight"],
          description: "Issue weight",
          args: { name: "weight" },
        },
        {
          name: ["-y", "--yes"],
          description: "Don't prompt for confirmation to submit the issue",
        },
        helpOption,
      ],
    },
    {
      name: "delete",
      description: "Delete an issue",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List project issues",
      options: [
        { name: ["-A", "--all"], description: "Get all issues" },
        {
          name: ["-a", "--assignee"],
          description: "Filter issue by assignee",
          args: { name: "username" },
        },
        {
          name: "--author",
          description: "Filter issue by author",
          args: { name: "username" },
        },
        { name: ["-c", "--closed"], description: "Get only closed issues" },
        {
          name: ["-C", "--confidential"],
          description: "Filter by confidential issues",
        },
        {
          name: ["-e", "--epic"],
          description: "List issues belonging to a given epic",
          args: { name: "epic" },
        },
        {
          name: ["-g", "--group"],
          description: "Select a group or subgroup",
          args: { name: "group" },
        },
        {
          name: "--in",
          description: "Search in: title, description",
          args: { name: "in", default: "title,description" },
        },
        {
          name: ["-t", "--issue-type"],
          description: "Filter issue by its type",
          args: {
            name: "type",
            suggestions: ["issue", "incident", "test_case"],
          },
        },
        {
          name: ["-i", "--iteration"],
          description: "Filter issue by iteration",
          args: { name: "id" },
        },
        {
          name: ["-l", "--label"],
          description: "Filter issue by label",
          args: { name: "label" },
        },
        {
          name: ["-m", "--milestone"],
          description: "Filter issue by milestone",
          args: { name: "milestone" },
        },
        {
          name: "--not-assignee",
          description: "Filter issue by not being assigned to a user",
          args: { name: "username" },
        },
        {
          name: "--not-author",
          description: "Filter issue by not being by author(s)",
          args: { name: "username" },
        },
        {
          name: "--not-label",
          description: "Filter issue by lack of label",
          args: { name: "label" },
        },
        {
          name: "--order",
          description: "Order issue by field",
          args: {
            name: "field",
            suggestions: [
              "created_at",
              "updated_at",
              "priority",
              "due_date",
              "relative_position",
              "label_priority",
              "milestone_due",
              "popularity",
              "weight",
            ],
            default: "created_at",
          },
        },
        {
          name: ["-O", "--output"],
          description: "Output format",
          args: {
            name: "output",
            suggestions: ["text", "json"],
            default: "text",
          },
        },
        {
          name: ["-F", "--output-format"],
          description: "Output detail level",
          args: {
            name: "format",
            suggestions: ["details", "ids", "urls"],
            default: "details",
          },
        },
        {
          name: "--search",
          description: "Search string in the fields defined by '--in'",
          args: { name: "string" },
        },
        {
          name: ["-s", "--sort"],
          description: "Sort direction for --order field",
          args: { name: "sort", suggestions: ["asc", "desc"], default: "desc" },
        },
        {
          name: "--jq",
          description: "Filter JSON output with a jq expression",
          args: { name: "expression" },
        },
        ...paginationOptions,
        helpOption,
      ],
    },
    {
      name: ["note", "comment"],
      description: "Comment on an issue in GitLab",
      args: { name: "issue-id" },
      options: [
        {
          name: ["-m", "--message"],
          description: "Comment/note message",
          args: { name: "message" },
        },
        helpOption,
      ],
    },
    {
      name: "reopen",
      description: "Reopen a closed issue",
      args: issueIdArg,
      options: [helpOption],
    },
    {
      name: "subscribe",
      description: "Subscribe to an issue",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "unsubscribe",
      description: "Unsubscribe from an issue",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "update",
      description: "Update issue",
      args: { name: "id" },
      options: [
        {
          name: ["-t", "--title"],
          description: "Title of issue",
          args: { name: "title" },
        },
        {
          name: ["-d", "--description"],
          description: "Issue description",
          args: { name: "description" },
        },
        {
          name: ["-l", "--label"],
          description: "Add labels",
          args: { name: "label" },
        },
        {
          name: "--unlabel",
          description: "Remove labels",
          args: { name: "label" },
        },
        helpOption,
      ],
    },
    {
      name: ["view", "show"],
      description: "Display information about an issue",
      args: { name: "id" },
      options: [
        {
          name: ["-c", "--comments"],
          description: "Show issue comments and activities",
        },
        {
          name: ["-s", "--system-logs"],
          description: "Show system activities and logs",
        },
        { name: ["-w", "--web"], description: "Open issue in a browser" },
        ...outputOptions,
        ...paginationOptions,
        helpOption,
      ],
    },
  ],
  options: [repoOption, helpOption],
};

const repoCommand: Fig.Subcommand = {
  name: ["repo", "project"],
  description: "Work with GitLab repositories and projects",
  subcommands: [
    {
      name: "archive",
      description: "Get an archive of the repository",
      args: [
        { name: "repo", isOptional: true },
        { name: "dir", template: "folders", isOptional: true },
      ],
      options: [helpOption],
    },
    {
      name: "clone",
      description: "Clone a GitLab repository or project",
      args: [
        { name: "repo", isOptional: true },
        { name: "dir", template: "folders", isOptional: true },
      ],
      options: [
        {
          name: ["-g", "--group"],
          description: "Specify the group to clone repositories from",
          args: { name: "group" },
        },
        {
          name: ["-p", "--preserve-namespace"],
          description: "Clone the repository in a subdirectory by namespace",
        },
        { name: "--active", description: "Limit by project status" },
        { name: ["-a", "--archived"], description: "Limit by archived status" },
        {
          name: ["-G", "--include-subgroups"],
          description: "Include projects in subgroups of this group",
        },
        {
          name: ["-m", "--mine"],
          description: "Limit by projects owned by the current user",
        },
        {
          name: ["-v", "--visibility"],
          description: "Limit by visibility",
          args: {
            name: "visibility",
            suggestions: ["public", "internal", "private"],
          },
        },
        {
          name: ["-I", "--with-issues-enabled"],
          description: "Limit by projects with the issues feature enabled",
        },
        {
          name: ["-M", "--with-mr-enabled"],
          description: "Limit by projects with merge requests enabled",
        },
        {
          name: ["-S", "--with-shared"],
          description: "Include projects shared to this group",
        },
        {
          name: "--paginate",
          description: "Fetch all pages of projects before cloning",
        },
        {
          name: "--page",
          description: "Page number",
          args: { name: "page", default: "1" },
        },
        {
          name: "--per-page",
          description: "Number of items to list per page",
          args: { name: "per-page", default: "30" },
        },
        { name: "--wiki", description: "Clone the project's wiki repository" },
        helpOption,
      ],
    },
    {
      name: "contributors",
      description: "Get repository contributors list",
      options: [helpOption],
    },
    {
      name: ["create", "new"],
      description: "Create a new GitLab project/repository",
      args: { name: "path", isOptional: true },
      options: [
        {
          name: "--defaultBranch",
          description: "Branch name for the new project",
          args: { name: "branch" },
        },
        {
          name: ["-d", "--description"],
          description: "Description of the new project",
          args: { name: "description" },
        },
        {
          name: ["-g", "--group"],
          description: "Namespace or group for the new project",
          args: { name: "group" },
        },
        {
          name: "--internal",
          description: "Make project internal: visible to authenticated users",
        },
        {
          name: ["-n", "--name"],
          description: "Name of the new project",
          args: { name: "name" },
        },
        {
          name: ["-p", "--private"],
          description: "Make project private",
        },
        { name: ["-P", "--public"], description: "Make project public" },
        {
          name: "--readme",
          description: "Initialize project with `README.md`",
        },
        {
          name: "--remoteName",
          description: "Remote name for the Git repository",
          args: { name: "remote", default: "origin" },
        },
        {
          name: ["-s", "--skipGitInit"],
          description: "Skip local repository setup",
        },
        {
          name: ["-t", "--tag"],
          description: "The list of tags for the project",
          args: { name: "tag" },
        },
        helpOption,
      ],
    },
    {
      name: "delete",
      description: "Delete an existing project on GitLab",
      args: { name: "repo", isOptional: true },
      options: [
        { name: ["-y", "--yes"], description: "Skip the confirmation prompt" },
        helpOption,
      ],
    },
    {
      name: "fork",
      description: "Fork a GitLab repository",
      args: { name: "repo", isOptional: true },
      options: [
        {
          name: ["-c", "--clone"],
          description: "Clone the fork",
        },
        {
          name: ["-n", "--name"],
          description: "The name assigned to the new project after forking",
          args: { name: "name" },
        },
        {
          name: ["-p", "--path"],
          description: "The path assigned to the new project after forking",
          args: { name: "path" },
        },
        { name: "--remote", description: "Add a remote for the fork" },
        helpOption,
      ],
    },
    {
      name: ["list", "ls"],
      description: "Get list of repositories",
      options: [...paginationOptions, helpOption],
    },
    {
      name: "members",
      description: "Manage project members",
      options: [helpOption],
    },
    {
      name: "mirror",
      description: "Configure mirroring on an existing project",
      options: [helpOption],
    },
    {
      name: "prune",
      description: "Delete local branches whose merge request has been merged",
      options: [helpOption],
    },
    {
      name: "publish",
      description: "Publishes resources in the project",
      options: [helpOption],
    },
    {
      name: "remote",
      description: "Manage Git remotes for a GitLab project",
      options: [helpOption],
    },
    {
      name: "search",
      description: "Search for GitLab repositories and projects by name",
      options: [...paginationOptions, helpOption],
    },
    {
      name: "transfer",
      description: "Transfer a repository to a new namespace",
      args: { name: "repo", isOptional: true },
      options: [helpOption],
    },
    {
      name: "update",
      description: "Update an existing GitLab project or repository",
      args: { name: "path", isOptional: true },
      options: [helpOption],
    },
    {
      name: ["view", "show"],
      description: "View a project or repository",
      args: { name: "repository", isOptional: true },
      options: [
        {
          name: ["-b", "--branch"],
          description: "View a specific branch of the repository",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: ["-w", "--web"],
          description: "Open a project in the browser",
        },
        helpOption,
      ],
    },
  ],
  options: [helpOption],
};

const ciCommand: Fig.Subcommand = {
  name: ["ci", "pipeline", "pipe"],
  description: "Work with GitLab CI/CD pipelines and jobs",
  subcommands: [
    {
      name: "artifact",
      description: "Download all artifacts from the last pipeline",
      args: [{ name: "refName" }, { name: "jobName" }],
      options: [
        {
          name: ["-p", "--path"],
          description: "Path to download the artifacts to",
          args: { name: "path", template: "folders" },
        },
        helpOption,
      ],
    },
    {
      name: "cancel",
      description: "Cancel a running pipeline or job",
      options: [helpOption],
    },
    {
      name: "config",
      description: "View and inspect GitLab CI/CD configuration",
      options: [helpOption],
    },
    {
      name: "delete",
      description: "Delete CI/CD pipelines",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "get",
      description: "Get the details of a CI/CD pipeline",
      options: [...outputOptions, helpOption],
    },
    {
      name: "lint",
      description: "Check if your `.gitlab-ci.yml` file is valid",
      args: { name: "path", template: "filepaths", isOptional: true },
      options: [
        { name: "--dry-run", description: "Run pipeline creation simulation" },
        {
          name: "--include-jobs",
          description: "Include the list of jobs that would exist",
        },
        {
          name: "--ref",
          description: "Branch or tag context for validating the YAML config",
          args: { name: "ref" },
        },
        helpOption,
      ],
    },
    {
      name: ["list", "ls"],
      description: "List CI/CD pipelines",
      options: [
        {
          name: ["-n", "--name"],
          description: "Return only pipelines with the given name",
          args: { name: "name" },
        },
        {
          name: ["-o", "--order"],
          description: "Order pipelines by this field",
          args: {
            name: "field",
            suggestions: ["id", "status", "ref", "updated_at", "user_id"],
            default: "id",
          },
        },
        {
          name: ["-r", "--ref"],
          description: "Return only pipelines for the given ref",
          args: { name: "ref" },
        },
        {
          name: "--scope",
          description: "Return only pipelines with the given scope",
          args: {
            name: "scope",
            suggestions: ["running", "pending", "finished", "branches", "tags"],
          },
        },
        {
          name: "--sha",
          description: "Return only pipelines with the given SHA",
          args: { name: "sha" },
        },
        {
          name: "--sort",
          description: "Sort direction for '--order'",
          args: { name: "sort", suggestions: ["asc", "desc"], default: "desc" },
        },
        {
          name: "--source",
          description: "Return only pipelines triggered by the given source",
          args: { name: "source" },
        },
        {
          name: ["-s", "--status"],
          description: "Filter pipelines by status",
          args: {
            name: "status",
            suggestions: [
              "running",
              "pending",
              "success",
              "failed",
              "canceled",
              "skipped",
              "created",
              "manual",
              "waiting_for_resource",
              "preparing",
              "scheduled",
            ],
          },
        },
        {
          name: ["-a", "--updated-after"],
          description: "Return only pipelines updated after the specified date",
          args: { name: "date" },
        },
        {
          name: ["-b", "--updated-before"],
          description:
            "Return only pipelines updated before the specified date",
          args: { name: "date" },
        },
        {
          name: ["-u", "--username"],
          description: "Return only pipelines triggered by the given username",
          args: { name: "username" },
        },
        {
          name: ["-y", "--yaml-errors"],
          description: "Return only pipelines with invalid configurations",
        },
        ...outputOptions,
        ...paginationOptions,
        helpOption,
      ],
    },
    {
      name: "retry",
      description: "Retry a CI/CD job",
      args: { name: "job-id | job-name", isOptional: true },
      options: [helpOption],
    },
    {
      name: "run",
      description: "Create a new CI/CD pipeline",
      options: [
        {
          name: ["-b", "--branch"],
          description: "Create pipeline on branch or reference",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: ["-i", "--input"],
          description: "Pass inputs to pipeline in format '<key>:<value>'",
          args: { name: "input" },
        },
        {
          name: "--mr",
          description: "Run merge request pipeline instead of branch pipeline",
        },
        {
          name: "--variables",
          description: "Pass variables to the pipeline as <key>:<value>",
          args: { name: "variables" },
        },
        {
          name: "--variables-env",
          description: "Pass env variables to the pipeline as <key>:<value>",
          args: { name: "variables" },
        },
        {
          name: "--variables-file",
          description: "Pass file contents as a file variable",
          args: { name: "variables" },
        },
        {
          name: ["-f", "--variables-from"],
          description: "Json file with variables for pipeline execution",
          args: { name: "file", template: "filepaths" },
        },
        { name: ["-w", "--web"], description: "Open pipeline in a browser" },
        helpOption,
      ],
    },
    {
      name: "run-trig",
      description: "Run a CI/CD pipeline trigger",
      options: [helpOption],
    },
    {
      name: "status",
      description: "View CI/CD pipeline status",
      options: [
        {
          name: ["-b", "--branch"],
          description: "Check pipeline status for a branch or tag",
          args: { name: "branch", generators: branchesGenerator },
        },
        { name: ["-l", "--live"], description: "Show status in real time" },
        helpOption,
      ],
    },
    {
      name: "trace",
      description: "Trace a CI/CD job log in real time",
      args: { name: "job-id | job-name", isOptional: true },
      options: [
        {
          name: ["-b", "--branch"],
          description: "The branch to search for the job",
          args: { name: "branch", generators: branchesGenerator },
        },
        helpOption,
      ],
    },
    {
      name: "trigger",
      description: "Trigger a manual CI/CD job",
      args: { name: "job-id | job-name", isOptional: true },
      options: [helpOption],
    },
    {
      name: "view",
      description: "View, run, retry, and cancel CI/CD pipeline jobs",
      args: { name: "branch | tag", isOptional: true },
      options: [
        {
          name: ["-b", "--branch"],
          description: "Check pipeline status for a branch or tag",
          args: { name: "branch", generators: branchesGenerator },
        },
        {
          name: ["-p", "--pipelineid"],
          description: "Check pipeline status for a specific pipeline ID",
          args: { name: "id" },
        },
        { name: ["-w", "--web"], description: "Open pipeline in a browser" },
        helpOption,
      ],
    },
  ],
  options: [repoOption, helpOption],
};

const releaseCommand: Fig.Subcommand = {
  name: "release",
  description: "Manage GitLab releases",
  subcommands: [
    {
      name: "create",
      description: "Create a new GitLab release, or update an existing one",
      args: [
        { name: "tag" },
        {
          name: "files",
          template: "filepaths",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [
        {
          name: ["-a", "--assets-links"],
          description: "Json string representation of assets links",
          args: { name: "links" },
        },
        {
          name: ["-m", "--milestone"],
          description:
            "The title of each milestone the release is associated with",
          args: { name: "milestone" },
        },
        {
          name: ["-n", "--name"],
          description: "The release name or title",
          args: { name: "name" },
        },
        {
          name: "--no-close-milestone",
          description: "Prevent closing milestones after creating the release",
        },
        {
          name: "--no-update",
          description: "Prevent updating the existing release",
        },
        {
          name: ["-N", "--notes"],
          description: "The release notes or description (Markdown)",
          args: { name: "notes" },
        },
        {
          name: ["-F", "--notes-file"],
          description: "Read release notes from a file ('-' for stdin)",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--package-name",
          description: "The package name when using --use-package-registry",
          args: { name: "name", default: "release-assets" },
        },
        {
          name: "--publish-to-catalog",
          description: "Publish the release to the GitLab CI/CD catalog",
        },
        {
          name: ["-r", "--ref"],
          description: "Create a release from this commit SHA, tag, or branch",
          args: { name: "ref" },
        },
        {
          name: ["-D", "--released-at"],
          description: "Iso 8601 datetime when the release was ready",
          args: { name: "datetime" },
        },
        {
          name: ["-T", "--tag-message"],
          description: "Message to use if creating a new annotated tag",
          args: { name: "message" },
        },
        {
          name: "--use-package-registry",
          description: "Upload release assets to the generic package registry",
        },
        helpOption,
      ],
    },
    {
      name: "delete",
      description: "Delete a GitLab release",
      args: { name: "tag" },
      options: [
        { name: ["-y", "--yes"], description: "Skip the confirmation prompt" },
        helpOption,
      ],
    },
    {
      name: "download",
      description: "Download asset files from a GitLab release",
      args: { name: "tag", isOptional: true },
      options: [
        {
          name: ["-a", "--asset-name"],
          description:
            "Download only assets that match the name or a glob pattern",
          args: { name: "name" },
        },
        {
          name: ["-D", "--dir"],
          description: "Directory to download the release assets to",
          args: { name: "dir", template: "folders" },
        },
        helpOption,
      ],
    },
    {
      name: ["list", "ls"],
      description: "List releases in a repository",
      options: [...outputOptions, ...paginationOptions, helpOption],
    },
    {
      name: "upload",
      description: "Upload release asset files or links to a GitLab release",
      args: [
        { name: "tag" },
        {
          name: "files",
          template: "filepaths",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [helpOption],
    },
    {
      name: ["view", "show"],
      description: "View information about a GitLab release",
      args: { name: "tag", isOptional: true },
      options: [
        {
          name: ["-w", "--web"],
          description: "Open the release in the browser",
        },
        helpOption,
      ],
    },
  ],
  options: [repoOption, helpOption],
};

const variableCommand: Fig.Subcommand = {
  name: "variable",
  description: "Manage variables for a GitLab project or group",
  subcommands: [
    {
      name: "delete",
      description: "Delete a variable for a project or group",
      args: { name: "key" },
      options: [helpOption],
    },
    {
      name: "export",
      description: "Export variables from a project or group",
      options: [helpOption],
    },
    {
      name: "get",
      description: "Get a variable for a project or group",
      args: { name: "key" },
      options: [helpOption],
    },
    {
      name: "import",
      description: "Import variables from a JSON file or standard input",
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List variables for a project or group",
      options: [helpOption],
    },
    {
      name: "set",
      description: "Create a new variable for a project or group",
      args: [{ name: "key" }, { name: "value" }],
      options: [
        {
          name: ["-g", "--group"],
          description: "Set variable for a group",
          args: { name: "group" },
        },
        {
          name: ["-m", "--masked"],
          description: "Whether the variable is masked",
        },
        {
          name: ["-p", "--protected"],
          description: "Whether the variable is protected",
        },
        {
          name: ["-t", "--type"],
          description: "The type of variable",
          args: {
            name: "type",
            suggestions: ["env_var", "file"],
            default: "env_var",
          },
        },
        {
          name: ["-s", "--scope"],
          description: "The environment_scope of the variable",
          args: { name: "scope", default: "*" },
        },
        helpOption,
      ],
    },
    {
      name: "update",
      description: "Update an existing variable for a project or group",
      args: [{ name: "key" }, { name: "value" }],
      options: [helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const labelCommand: Fig.Subcommand = {
  name: "label",
  description: "Manage project and group labels",
  subcommands: [
    {
      name: "create",
      description: "Create a label in a project",
      options: [
        {
          name: ["-n", "--name"],
          description: "Name of the label",
          args: { name: "name" },
        },
        {
          name: ["-c", "--color"],
          description: "Color of the label in plain or HEX code",
          args: { name: "color" },
        },
        {
          name: ["-d", "--description"],
          description: "Description of the label",
          args: { name: "description" },
        },
        helpOption,
      ],
    },
    {
      name: "delete",
      description: "Delete a label from a project",
      args: { name: "name" },
      options: [helpOption],
    },
    {
      name: "edit",
      description: "Edit a label in a project",
      options: [helpOption],
    },
    {
      name: "get",
      description: "Get information about a single label by ID",
      args: { name: "label-id" },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List labels in a project or group",
      options: [...paginationOptions, helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const scheduleCommand: Fig.Subcommand = {
  name: "schedule",
  description: "Work with GitLab CI/CD schedules",
  subcommands: [
    {
      name: "create",
      description: "Create a new pipeline schedule",
      options: [helpOption],
    },
    {
      name: "delete",
      description: "Delete a pipeline schedule by ID",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List pipeline schedules in a project",
      options: [...paginationOptions, helpOption],
    },
    {
      name: "run",
      description: "Trigger a pipeline schedule to run immediately",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "update",
      description: "Update a pipeline schedule",
      args: { name: "id" },
      options: [helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const tokenCommand: Fig.Subcommand = {
  name: "token",
  description: "Manage personal, project, or group tokens",
  subcommands: [
    {
      name: "create",
      description: "Creates user, group, or project access tokens",
      args: { name: "name" },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List user, group, or project access tokens",
      options: [helpOption],
    },
    {
      name: "revoke",
      description: "Revoke user, group, or project access tokens",
      args: { name: "token-name|token-id" },
      options: [helpOption],
    },
    {
      name: "rotate",
      description: "Rotate user, group, or project access tokens",
      args: { name: "token-name|token-id" },
      options: [helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const milestoneCommand: Fig.Subcommand = {
  name: "milestone",
  description: "Manage group or project milestones",
  subcommands: [
    {
      name: "create",
      description: "Create a milestone",
      options: [helpOption],
    },
    {
      name: "delete",
      description: "Delete a milestone",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "edit",
      description: "Edit a milestone",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "get",
      description: "Get a milestone by ID",
      args: { name: "id", isOptional: true },
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List milestones in a project or group",
      options: [...paginationOptions, helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const incidentCommand: Fig.Subcommand = {
  name: "incident",
  description: "Work with GitLab incidents",
  subcommands: [
    {
      name: "close",
      description: "Close an incident",
      args: issueIdArg,
      options: [helpOption],
    },
    {
      name: ["list", "ls"],
      description: "List project incidents",
      options: [...paginationOptions, helpOption],
    },
    {
      name: ["note", "comment"],
      description: "Comment on an incident in GitLab",
      args: { name: "incident-id" },
      options: [helpOption],
    },
    {
      name: "reopen",
      description: "Reopen a resolved incident",
      args: issueIdArg,
      options: [helpOption],
    },
    {
      name: "subscribe",
      description: "Subscribe to an incident",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: "unsubscribe",
      description: "Unsubscribe from an incident",
      args: { name: "id" },
      options: [helpOption],
    },
    {
      name: ["view", "show"],
      description: "Display information about an incident",
      args: { name: "id" },
      options: [helpOption],
    },
  ],
  options: [repoOption, helpOption],
};

const completionSpec: Fig.Spec = {
  name: "glab",
  description: "An open source GitLab CLI tool",
  subcommands: [
    aliasCommand,
    {
      name: "api",
      description: "Make an authenticated request to the GitLab API",
      args: {
        name: "endpoint",
        description: "API v4 endpoint path, or `graphql`",
        suggestions: [
          { name: "graphql", description: "Access the GitLab GraphQL API" },
          "projects/:fullpath",
          "projects/:fullpath/merge_requests",
          "projects/:fullpath/issues",
          "user",
        ],
      },
      options: [
        {
          name: ["-F", "--field"],
          description: "Add a parameter of inferred type",
          args: { name: "key=value" },
          isRepeatable: true,
        },
        {
          name: "--form",
          description: "Add a multipart form field",
          args: { name: "key=value" },
          isRepeatable: true,
        },
        {
          name: ["-H", "--header"],
          description: "Add an additional HTTP request header",
          args: { name: "key:value" },
          isRepeatable: true,
        },
        {
          name: "--hostname",
          description: "The GitLab hostname for the request",
          args: { name: "hostname" },
        },
        {
          name: ["-i", "--include"],
          description: "Include HTTP response headers in the output",
        },
        {
          name: "--input",
          description: "The file to use as the body for the HTTP request",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: ["-X", "--method"],
          description: "The HTTP method for the request",
          args: {
            name: "method",
            suggestions: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"],
            default: "GET",
          },
        },
        {
          name: "--output",
          description: "Format output",
          args: {
            name: "output",
            suggestions: ["json", "ndjson"],
            default: "json",
          },
        },
        {
          name: "--paginate",
          description: "Make additional requests to fetch all pages of results",
        },
        {
          name: ["-f", "--raw-field"],
          description: "Add a string parameter",
          args: { name: "key=value" },
          isRepeatable: true,
        },
        { name: "--silent", description: "Do not print the response body" },
        helpOption,
      ],
    },
    authCommand,
    {
      name: "changelog",
      description: "Generate changelogs from your project's commit history",
      options: [helpOption],
    },
    {
      name: "check-update",
      description: "Check for the latest glab version",
      options: [helpOption],
    },
    ciCommand,
    {
      name: "cluster",
      description: "Manage GitLab Agents for Kubernetes and their clusters",
      options: [helpOption],
    },
    {
      name: "completion",
      description: "Generate shell completion scripts",
      options: [
        {
          name: ["-s", "--shell"],
          description: "Shell type",
          args: {
            name: "shell",
            suggestions: ["bash", "zsh", "fish", "powershell"],
          },
        },
        helpOption,
      ],
    },
    {
      name: "config",
      description: "Manage glab settings",
      subcommands: [
        {
          name: "get",
          description: "Print the value of a given configuration key",
          args: { name: "key" },
          options: [helpOption],
        },
        {
          name: "set",
          description: "Update configuration with a value for the given key",
          args: [{ name: "key" }, { name: "value" }],
          options: [
            {
              name: ["-g", "--global"],
              description: "Write to global config file",
            },
            {
              name: ["-h", "--host"],
              description: "Set per-host setting",
              args: { name: "host" },
            },
            helpOption,
          ],
        },
        {
          name: "edit",
          description: "Open the glab configuration file in an editor",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    {
      name: "container-registry",
      description: "Work with GitLab container registries",
      options: [helpOption],
    },
    {
      name: "deploy-key",
      description: "Manage deploy keys",
      options: [helpOption],
    },
    {
      name: "duo",
      description: "Work with GitLab Duo",
      options: [helpOption],
    },
    {
      name: "gpg-key",
      description: "Manage GPG keys registered with your GitLab account",
      options: [helpOption],
    },
    incidentCommand,
    issueCommand,
    {
      name: "iteration",
      description: "Retrieve iteration information",
      options: [helpOption],
    },
    {
      name: "job",
      description: "Work with GitLab CI/CD jobs",
      subcommands: [
        {
          name: "artifact",
          description: "Download all artifacts from the most recent pipeline",
          args: [{ name: "refName" }, { name: "jobName" }],
          options: [helpOption],
        },
      ],
      options: [repoOption, helpOption],
    },
    labelCommand,
    {
      name: "mcp",
      description: "Work with a Model Context Protocol (MCP) server",
      options: [helpOption],
    },
    milestoneCommand,
    mrCommand,
    {
      name: "packages",
      description: "Manage packages in the GitLab package registry",
      options: [helpOption],
    },
    releaseCommand,
    repoCommand,
    {
      name: "runner",
      description: "Manage GitLab CI/CD runners",
      options: [helpOption],
    },
    scheduleCommand,
    {
      name: "search",
      description: "Search for code and resources in a GitLab project",
      options: [repoOption, helpOption],
    },
    {
      name: "securefile",
      description: "Manage secure files for a project",
      options: [repoOption, helpOption],
    },
    {
      name: "snippet",
      description: "Create, view and manage snippets",
      subcommands: [
        {
          name: "create",
          description: "Create a new snippet",
          args: {
            name: "files",
            template: "filepaths",
            isVariadic: true,
            isOptional: true,
          },
          options: [
            {
              name: ["-t", "--title"],
              description: "Title of the snippet",
              args: { name: "title" },
            },
            {
              name: ["-f", "--filename"],
              description: "Filename of the snippet",
              args: { name: "filename" },
            },
            {
              name: ["-d", "--description"],
              description: "Description of the snippet",
              args: { name: "description" },
            },
            {
              name: ["-p", "--personal"],
              description: "Create a personal snippet",
            },
            {
              name: ["-v", "--visibility"],
              description: "Limit by visibility",
              args: {
                name: "visibility",
                suggestions: ["public", "internal", "private"],
              },
            },
            helpOption,
          ],
        },
      ],
      options: [repoOption, helpOption],
    },
    {
      name: "ssh-key",
      description: "Manage SSH keys registered with your GitLab account",
      options: [helpOption],
    },
    {
      name: "stack",
      description: "Create, manage, and work with stacked diffs (experimental)",
      options: [helpOption],
    },
    {
      name: "todo",
      description: "Manage your to-do list",
      options: [helpOption],
    },
    tokenCommand,
    {
      name: "user",
      description: "Interact with a GitLab user account",
      subcommands: [
        {
          name: "events",
          description: "View user events",
          options: [helpOption],
        },
      ],
      options: [helpOption],
    },
    variableCommand,
    {
      name: "version",
      description: "Show version information for glab",
      options: [helpOption],
    },
    {
      name: "whatsnew",
      description: "Show release notes for new versions of glab",
      args: { name: "version", isOptional: true },
      options: [helpOption],
    },
    {
      name: "help",
      description: "Help about any command",
      args: { name: "command", isOptional: true },
    },
  ],
  options: [
    helpOption,
    {
      name: ["-v", "--version"],
      description: "Show glab version information",
    },
  ],
};

export default completionSpec;
