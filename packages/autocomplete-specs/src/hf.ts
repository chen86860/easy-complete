const helpOption: Fig.Option = {
  name: ["-h", "--help"],
  description: "Show this message and exit",
  priority: 1,
};

const formattingOptions: Fig.Option[] = [
  {
    name: "--format",
    description: "Output format",
    args: {
      name: "format",
      suggestions: ["auto", "human", "agent", "json", "quiet"],
      default: "auto",
    },
  },
  {
    name: "--json",
    description: "JSON output. Equivalent to '--format json'",
  },
  {
    name: ["-q", "--quiet"],
    description: "Quiet output (one ID per line)",
  },
  {
    name: "--no-truncate",
    description: "Do not truncate scalar values in human tables",
  },
];

const tokenOption: Fig.Option = {
  name: "--token",
  description: "A User Access Token from huggingface.co/settings/tokens",
  args: { name: "token" },
};

const repoTypeOption: Fig.Option = {
  name: ["--type", "--repo-type"],
  description: "The type of repository",
  args: {
    name: "repo_type",
    suggestions: ["model", "dataset", "space"],
    default: "model",
  },
};

const revisionOption: Fig.Option = {
  name: "--revision",
  description: "Git revision id: a branch name, a tag, or a commit hash",
  args: { name: "revision" },
};

const commonOptions: Fig.Option[] = [helpOption, ...formattingOptions];

const repoIdArg: Fig.Arg = {
  name: "repo_id",
  description: "The ID of the repo, e.g. `username/repo-name`",
};

/** Repos cached locally — useful for `hf cache rm`, `hf download`, … */
const cachedReposGenerator: Fig.Generator = {
  script: ["hf", "cache", "ls", "--quiet"],
  postProcess: (output) =>
    output
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((repo) => ({
        name: repo,
        description: "Cached repo",
        icon: "fig://icon?type=package",
      })),
};

/** Build a `<group> {card,info,list}` subcommand shared by models/datasets/spaces */
const hubItemSubcommands = (
  kind: string,
  cardDescription: string,
): Fig.Subcommand[] => [
  {
    name: "card",
    description: cardDescription,
    args: repoIdArg,
    options: commonOptions,
  },
  {
    name: "info",
    description: `Get info about a ${kind} on the Hub`,
    args: repoIdArg,
    options: [tokenOption, ...commonOptions],
  },
  {
    name: ["list", "ls"],
    description: `List ${kind}s on the Hub, or files in a ${kind} repo`,
    args: { name: "repo_id", isOptional: true },
    options: [
      {
        name: "--sort",
        description: "Sort key",
        args: {
          name: "sort",
          suggestions: [
            "downloads",
            "likes",
            "trending",
            "created",
            "modified",
          ],
        },
      },
      {
        name: "--limit",
        description: "Maximum number of results",
        args: { name: "limit" },
      },
      {
        name: "--search",
        description: "Filter by name",
        args: { name: "search" },
      },
      tokenOption,
      ...commonOptions,
    ],
  },
];

const completionSpec: Fig.Spec = {
  name: "hf",
  description: "Hugging Face Hub CLI",
  subcommands: [
    {
      name: "auth",
      description: "Manage authentication (login, logout, etc.)",
      subcommands: [
        {
          name: ["list", "ls"],
          description: "List all stored access tokens",
          options: commonOptions,
        },
        {
          name: "login",
          description: "Login from your browser, or using a token",
          options: [
            tokenOption,
            {
              name: "--add-to-git-credential",
              description: "Save token as git credential",
            },
            ...commonOptions,
          ],
        },
        {
          name: "logout",
          description: "Logout from a specific token",
          options: commonOptions,
        },
        {
          name: "switch",
          description: "Switch between access tokens",
          options: commonOptions,
        },
        {
          name: "token",
          description: "Print the current access token to stdout",
          options: commonOptions,
        },
        {
          name: "whoami",
          description: "Find out which account you are logged in as",
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "buckets",
      description: "Commands to interact with buckets",
      options: [helpOption],
    },
    {
      name: "cache",
      description: "Manage local cache directory",
      subcommands: [
        {
          name: ["list", "ls"],
          description: "List cached repositories or revisions",
          options: commonOptions,
        },
        {
          name: "prune",
          description: "Remove detached revisions and incomplete downloads",
          options: commonOptions,
        },
        {
          name: "rm",
          description: "Remove cached repositories or revisions",
          args: {
            name: "repo",
            generators: cachedReposGenerator,
            isVariadic: true,
          },
          options: commonOptions,
        },
        {
          name: "verify",
          description: "Verify checksums for a single repo revision",
          args: { name: "repo_id", generators: cachedReposGenerator },
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "collections",
      description: "Interact with collections on the Hub",
      subcommands: [
        {
          name: "add-item",
          description: "Add an item to a collection",
          args: [
            { name: "collection_slug" },
            { name: "item_id" },
            {
              name: "item_type",
              suggestions: ["model", "dataset", "space", "paper"],
            },
          ],
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "create",
          description: "Create a new collection on the Hub",
          args: { name: "title" },
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "delete",
          description: "Delete a collection from the Hub",
          args: { name: "collection_slug" },
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "delete-item",
          description: "Delete an item from a collection",
          args: [{ name: "collection_slug" }, { name: "item_object_id" }],
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "info",
          description: "Get info about a collection on the Hub",
          args: { name: "collection_slug" },
          options: [tokenOption, ...commonOptions],
        },
        {
          name: ["list", "ls"],
          description: "List collections on the Hub",
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "update",
          description: "Update a collection's metadata on the Hub",
          args: { name: "collection_slug" },
          options: [
            {
              name: "--title",
              description: "New title",
              args: { name: "title" },
            },
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "update-item",
          description: "Update an item in a collection",
          args: [{ name: "collection_slug" }, { name: "item_object_id" }],
          options: [
            {
              name: "--note",
              description: "Note for the item",
              args: { name: "note" },
            },
            tokenOption,
            ...commonOptions,
          ],
        },
      ],
      options: [helpOption],
    },
    {
      name: "cp",
      description: "Copy files between local paths, repositories, and buckets",
      args: [
        {
          name: "src",
          description: "Local file, hf:// URI, or - for stdin",
          template: "filepaths",
        },
        {
          name: "dst",
          description: "Local path, hf:// URI, or - for stdout",
          template: "filepaths",
          isOptional: true,
        },
      ],
      options: [tokenOption, ...commonOptions],
    },
    {
      name: "datasets",
      description: "Interact with datasets on the Hub",
      subcommands: [
        ...hubItemSubcommands(
          "dataset",
          "Get the dataset card (README) for a dataset on the Hub",
        ),
        {
          name: "leaderboard",
          description: "List model scores from a dataset leaderboard",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "parquet",
          description: "List parquet file URLs available for a dataset",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "sql",
          description:
            "Execute a raw SQL query with DuckDB against parquet URLs",
          args: { name: "query" },
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "discussions",
      description: "Manage discussions and pull requests on the Hub",
      subcommands: [
        {
          name: "close",
          description: "Close a discussion or pull request",
          args: [repoIdArg, { name: "number" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "comment",
          description: "Comment on a discussion or pull request",
          args: [repoIdArg, { name: "number" }],
          options: [
            {
              name: "--body",
              description: "Comment body",
              args: { name: "body" },
            },
            repoTypeOption,
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "create",
          description: "Create a new discussion or pull request on a repo",
          args: repoIdArg,
          options: [
            {
              name: "--title",
              description: "Discussion title",
              args: { name: "title" },
            },
            {
              name: "--pull-request",
              description: "Create a pull request instead of a discussion",
            },
            repoTypeOption,
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "diff",
          description: "Show the diff of a pull request",
          args: [repoIdArg, { name: "number" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "edit",
          description: "Edit an existing comment",
          args: [repoIdArg, { name: "number" }, { name: "comment_id" }],
          options: [
            {
              name: "--body",
              description: "New comment body",
              args: { name: "body" },
            },
            repoTypeOption,
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "info",
          description: "Get info about a discussion or pull request",
          args: [repoIdArg, { name: "number" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: ["list", "ls"],
          description: "List discussions and pull requests on a repo",
          args: repoIdArg,
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "merge",
          description: "Merge a pull request",
          args: [repoIdArg, { name: "number" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "rename",
          description: "Rename a discussion or pull request",
          args: [repoIdArg, { name: "number" }, { name: "title" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "reopen",
          description: "Reopen a closed discussion or pull request",
          args: [repoIdArg, { name: "number" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
      ],
      options: [helpOption],
    },
    {
      name: "download",
      description: "Download files from the Hub",
      args: [
        repoIdArg,
        {
          name: "filenames",
          description: "Files to download, e.g. `config.json`",
          isVariadic: true,
          isOptional: true,
        },
      ],
      options: [
        repoTypeOption,
        revisionOption,
        {
          name: "--include",
          description: "Glob patterns to include, e.g. *.json",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--exclude",
          description: "Glob patterns to exclude",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--cache-dir",
          description: "Directory where to save files",
          args: { name: "dir", template: "folders" },
        },
        {
          name: "--local-dir",
          description: "Place the downloaded files under this directory",
          args: { name: "dir", template: "folders" },
        },
        {
          name: "--force-download",
          description: "Download even if the files are already cached",
        },
        {
          name: "--no-force-download",
          description: "Do not re-download cached files (default)",
        },
        {
          name: "--dry-run",
          description: "Perform a dry run without actually downloading",
        },
        { name: "--no-dry-run", description: "Actually download (default)" },
        tokenOption,
        {
          name: "--max-workers",
          description: "Maximum number of workers for downloading files",
          args: { name: "workers", default: "8" },
        },
        ...commonOptions,
      ],
    },
    {
      name: "endpoints",
      description: "Manage Hugging Face Inference Endpoints",
      subcommands: [
        {
          name: "catalog",
          description: "Interact with the Inference Endpoints catalog",
          options: commonOptions,
        },
        {
          name: "delete",
          description: "Delete an Inference Endpoint permanently",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "deploy",
          description: "Deploy an Inference Endpoint from a Hub repository",
          args: { name: "name" },
          options: [
            {
              name: "--repo",
              description: "Hub repository to deploy",
              args: { name: "repo" },
            },
            {
              name: "--framework",
              description: "Framework to use",
              args: { name: "framework" },
            },
            ...commonOptions,
          ],
        },
        {
          name: "describe",
          description: "Get information about an existing endpoint",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "hardware",
          description: "List the hardware available for Inference Endpoints",
          options: commonOptions,
        },
        {
          name: ["list", "ls"],
          description: "List all Inference Endpoints for the given namespace",
          options: commonOptions,
        },
        {
          name: "pause",
          description: "Pause an Inference Endpoint",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "resume",
          description: "Resume an Inference Endpoint",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "scale-to-zero",
          description: "Scale an Inference Endpoint to zero",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "update",
          description: "Update an existing endpoint",
          args: { name: "name" },
          options: [
            {
              name: "--min-replica",
              description: "Minimum number of replicas",
              args: { name: "n" },
            },
            {
              name: "--max-replica",
              description: "Maximum number of replicas",
              args: { name: "n" },
            },
            ...commonOptions,
          ],
        },
      ],
      options: [helpOption],
    },
    {
      name: ["extensions", "ext"],
      description: "Manage hf CLI extensions",
      subcommands: [
        {
          name: "exec",
          description: "Execute an installed extension",
          args: [
            { name: "name" },
            { name: "args", isVariadic: true, isOptional: true },
          ],
          options: commonOptions,
        },
        {
          name: "install",
          description: "Install an extension from a public GitHub repository",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: ["list", "ls"],
          description: "List installed extension commands",
          options: commonOptions,
        },
        {
          name: ["remove", "rm"],
          description: "Remove an installed extension",
          args: { name: "name" },
          options: commonOptions,
        },
        {
          name: "search",
          description: "Search extensions available on GitHub",
          args: { name: "query", isOptional: true },
          options: commonOptions,
        },
        {
          name: "update",
          description: "Update installed extension(s) to their latest version",
          args: { name: "name", isOptional: true },
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "jobs",
      description: "Run and manage Jobs on the Hub",
      subcommands: [
        {
          name: "cancel",
          description: "Cancel a Job",
          args: { name: "job_id" },
          options: commonOptions,
        },
        {
          name: "hardware",
          description: "List available hardware options for Jobs",
          options: commonOptions,
        },
        {
          name: "inspect",
          description: "Display detailed information on one or more Jobs",
          args: { name: "job_id", isVariadic: true },
          options: commonOptions,
        },
        {
          name: "labels",
          description: "Update labels on a Job",
          args: { name: "job_id" },
          options: [
            {
              name: "--name",
              description: "Label name",
              args: { name: "name" },
            },
            ...commonOptions,
          ],
        },
        {
          name: ["list", "ls", "ps"],
          description: "List Jobs",
          options: commonOptions,
        },
        {
          name: "logs",
          description: "Fetch the logs of a Job",
          args: { name: "job_id" },
          options: commonOptions,
        },
        {
          name: "run",
          description: "Run a Job",
          args: [
            { name: "image" },
            { name: "command", isVariadic: true, isOptional: true },
          ],
          options: [
            {
              name: "--name",
              description: "Job name",
              args: { name: "name" },
            },
            {
              name: ["-e", "--env"],
              description: "Environment variable",
              args: { name: "KEY=value" },
              isRepeatable: true,
            },
            {
              name: ["-s", "--secrets"],
              description: "Secret environment variable",
              args: { name: "KEY=value" },
              isRepeatable: true,
            },
            {
              name: "--flavor",
              description: "Hardware flavor",
              args: { name: "flavor" },
            },
            {
              name: ["-d", "--detach"],
              description: "Run the Job in the background",
            },
            ...commonOptions,
          ],
        },
        {
          name: "scheduled",
          description: "Create and manage scheduled Jobs on the Hub",
          options: commonOptions,
        },
        {
          name: "ssh",
          description: "SSH into a running Job",
          args: { name: "job_id" },
          options: commonOptions,
        },
        {
          name: "stats",
          description: "Fetch the resource usage statistics of Jobs",
          args: { name: "job_id", isVariadic: true },
          options: commonOptions,
        },
        {
          name: "uv",
          description: "Run UV scripts on HF infrastructure",
          options: commonOptions,
        },
        {
          name: "wait",
          description: "Wait for one or more Jobs to reach a terminal state",
          args: { name: "job_id", isVariadic: true },
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "models",
      description: "Interact with models on the Hub",
      subcommands: hubItemSubcommands(
        "model",
        "Get the model card (README) for a model on the Hub",
      ),
      options: [helpOption],
    },
    {
      name: "papers",
      description: "Interact with papers on the Hub",
      subcommands: [
        {
          name: "info",
          description: "Get info about a paper on the Hub",
          args: { name: "paper_id" },
          options: commonOptions,
        },
        {
          name: ["list", "ls"],
          description: "List daily papers on the Hub",
          options: commonOptions,
        },
        {
          name: "read",
          description: "Read a paper as markdown",
          args: { name: "paper_id" },
          options: commonOptions,
        },
        {
          name: "search",
          description: "Search papers on the Hub",
          args: { name: "query" },
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: ["repos", "repo"],
      description: "Manage repos on the Hub",
      subcommands: [
        {
          name: "branch",
          description: "Manage branches for a repo on the Hub",
          options: commonOptions,
        },
        {
          name: "cp",
          description: "Copy files between local paths, repos, and buckets",
          args: [
            { name: "src", template: "filepaths" },
            { name: "dst", template: "filepaths", isOptional: true },
          ],
          options: [tokenOption, ...commonOptions],
        },
        {
          name: "create",
          description: "Create a new repo on the Hub",
          args: { name: "repo_id" },
          options: [
            repoTypeOption,
            {
              name: "--private",
              description: "Create a private repo",
            },
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "delete",
          description: "Delete a repo from the Hub",
          args: repoIdArg,
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "delete-files",
          description: "Delete files from a repo on the Hub",
          args: [repoIdArg, { name: "patterns", isVariadic: true }],
          options: [
            repoTypeOption,
            revisionOption,
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "duplicate",
          description: "Duplicate a repo on the Hub",
          args: repoIdArg,
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: ["list", "ls"],
          description: "List all repos with storage info",
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "move",
          description: "Move a repository from a namespace to another",
          args: [{ name: "from_repo" }, { name: "to_repo" }],
          options: [repoTypeOption, tokenOption, ...commonOptions],
        },
        {
          name: "settings",
          description: "Update the settings of a repository",
          args: repoIdArg,
          options: [
            { name: "--private", description: "Make the repo private" },
            { name: "--public", description: "Make the repo public" },
            repoTypeOption,
            tokenOption,
            ...commonOptions,
          ],
        },
        {
          name: "tag",
          description: "Manage tags for a repo on the Hub",
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "sandbox",
      description: "Run and manage sandboxes on Hugging Face Jobs",
      subcommands: [
        {
          name: "cp",
          description: "Copy a file between the local machine and a sandbox",
          args: [{ name: "src" }, { name: "dst" }],
          options: commonOptions,
        },
        {
          name: "create",
          description: "Create a sandbox",
          options: commonOptions,
        },
        {
          name: "exec",
          description: "Run a command in a sandbox, streaming output",
          args: [
            { name: "sandbox_id" },
            { name: "command", isVariadic: true, isOptional: true },
          ],
          options: commonOptions,
        },
        {
          name: "kill",
          description: "Terminate a sandbox, a shared host, or everything",
          args: { name: "sandbox_id", isOptional: true },
          options: [
            { name: "--all", description: "Terminate everything" },
            ...commonOptions,
          ],
        },
        {
          name: "pool",
          description: "Manage warm pools of host VMs",
          options: commonOptions,
        },
        {
          name: "process",
          description: "List and stop background processes in a sandbox",
          options: commonOptions,
        },
        {
          name: "spawn",
          description: "Start a long-running command in the background",
          args: [
            { name: "sandbox_id" },
            { name: "command", isVariadic: true, isOptional: true },
          ],
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "skills",
      description: "Manage skills for AI assistants",
      subcommands: [
        {
          name: "add",
          description: "Install a Hugging Face skill for an AI assistant",
          args: { name: "skill", isOptional: true },
          options: [
            {
              name: ["-g", "--global"],
              description: "Install globally",
            },
            {
              name: "--claude",
              description: "Install for Claude",
            },
            ...commonOptions,
          ],
        },
        {
          name: ["list", "ls"],
          description: "List available skills from the marketplace",
          options: commonOptions,
        },
        {
          name: "preview",
          description: "Print the generated `hf-cli` SKILL.md to stdout",
          options: commonOptions,
        },
        {
          name: "update",
          description: "Update installed Hugging Face marketplace skills",
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "spaces",
      description: "Interact with spaces on the Hub",
      subcommands: [
        ...hubItemSubcommands(
          "space",
          "Get the Space card (README) for a Space on the Hub",
        ),
        {
          name: "dev-mode",
          description: "Enable or disable dev mode on a Space",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "hardware",
          description: "List available hardware options for Spaces",
          options: commonOptions,
        },
        {
          name: "hot-reload",
          description: "Hot-reload a Python file of a Space",
          args: [repoIdArg, { name: "file", template: "filepaths" }],
          options: commonOptions,
        },
        {
          name: "logs",
          description: "Fetch the run or build logs of a Space",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "pause",
          description: "Pause a Space",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "restart",
          description: "Restart a Space",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "search",
          description: "Search spaces on the Hub using semantic search",
          args: { name: "query" },
          options: commonOptions,
        },
        {
          name: "secrets",
          description: "Manage secrets for a Space on the Hub",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "settings",
          description: "Update the settings of a Space",
          args: repoIdArg,
          options: [
            {
              name: "--sleep-time",
              description: "Sleep time in seconds",
              args: { name: "seconds" },
            },
            ...commonOptions,
          ],
        },
        {
          name: "ssh",
          description: "SSH into a Space's Dev Mode container",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "templates",
          description: "List the available Space templates",
          options: commonOptions,
        },
        {
          name: "variables",
          description: "Manage environment variables for a Space",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "volumes",
          description: "Manage volumes for a Space on the Hub",
          args: repoIdArg,
          options: commonOptions,
        },
        {
          name: "wait",
          description: "Wait for a Space to finish building/starting",
          args: repoIdArg,
          options: commonOptions,
        },
      ],
      options: [helpOption],
    },
    {
      name: "sync",
      description: "Sync files between local directory and a bucket",
      args: [
        {
          name: "source",
          description: "Local directory or hf://buckets/... path",
          template: "folders",
          isOptional: true,
        },
        {
          name: "dest",
          description: "Local directory or hf://buckets/... path",
          template: "folders",
          isOptional: true,
        },
      ],
      options: [
        {
          name: "--delete",
          description: "Delete destination files not present in source",
        },
        {
          name: "--no-delete",
          description: "Keep destination files not present in source (default)",
        },
        {
          name: "--ignore-times",
          description: "Skip files only based on size",
        },
        {
          name: "--ignore-sizes",
          description: "Skip files only based on modification times",
        },
        {
          name: "--plan",
          description: "Save sync plan to a JSONL file instead of executing",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--apply",
          description: "Apply a previously saved plan file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--dry-run",
          description: "Print sync plan to stdout as JSONL without executing",
        },
        {
          name: "--include",
          description: "Include files matching pattern",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--exclude",
          description: "Exclude files matching pattern",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--filter-from",
          description: "Read include/exclude patterns from file",
          args: { name: "file", template: "filepaths" },
        },
        {
          name: "--existing",
          description: "Skip creating new files on receiver",
        },
        {
          name: "--ignore-existing",
          description: "Skip updating files that exist on receiver",
        },
        {
          name: ["-v", "--verbose"],
          description: "Show detailed logging with reasoning",
        },
        tokenOption,
        ...commonOptions,
      ],
    },
    {
      name: "upload",
      description: "Upload a file or a folder to the Hub",
      args: [
        repoIdArg,
        {
          name: "local_path",
          description: "Local path to the file or folder to upload",
          template: ["filepaths", "folders"],
          isOptional: true,
        },
        {
          name: "path_in_repo",
          description: "Path of the file or folder in the repo",
          isOptional: true,
        },
      ],
      options: [
        repoTypeOption,
        revisionOption,
        {
          name: "--private",
          description: "Create a private repo if it doesn't exist",
        },
        { name: "--no-private", description: "Create a public repo" },
        {
          name: "--include",
          description: "Glob patterns to match files to upload",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--exclude",
          description: "Glob patterns to exclude from files to upload",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--delete",
          description: "Glob patterns for files to delete while committing",
          args: { name: "pattern" },
          isRepeatable: true,
        },
        {
          name: "--commit-message",
          description: "The summary / title of the generated commit",
          args: { name: "message" },
        },
        {
          name: "--commit-description",
          description: "The description of the generated commit",
          args: { name: "description" },
        },
        {
          name: "--create-pr",
          description: "Upload content as a new Pull Request",
        },
        {
          name: "--no-create-pr",
          description: "Commit directly (default)",
        },
        {
          name: "--every",
          description: "Schedule a background commit every N minutes",
          args: { name: "minutes" },
        },
        tokenOption,
        ...commonOptions,
      ],
    },
    {
      name: "upload-large-folder",
      description: "[Deprecated] Upload a large folder to the Hub",
      args: [
        repoIdArg,
        { name: "local_path", template: "folders", isOptional: true },
      ],
      options: [repoTypeOption, tokenOption, ...commonOptions],
    },
    {
      name: "webhooks",
      description: "Manage webhooks on the Hub",
      subcommands: [
        {
          name: "create",
          description: "Create a new webhook",
          options: [
            {
              name: "--url",
              description: "Webhook target URL",
              args: { name: "url" },
            },
            {
              name: "--watch",
              description: "Resource to watch, e.g. model:bert-base-uncased",
              args: { name: "watch" },
              isRepeatable: true,
            },
            ...commonOptions,
          ],
        },
        {
          name: "delete",
          description: "Delete a webhook permanently",
          args: { name: "webhook_id" },
          options: commonOptions,
        },
        {
          name: "disable",
          description: "Disable an active webhook",
          args: { name: "webhook_id" },
          options: commonOptions,
        },
        {
          name: "enable",
          description: "Enable a disabled webhook",
          args: { name: "webhook_id" },
          options: commonOptions,
        },
        {
          name: "info",
          description: "Show full details for a single webhook",
          args: { name: "webhook_id" },
          options: commonOptions,
        },
        {
          name: ["list", "ls"],
          description: "List all webhooks for the current user",
          options: commonOptions,
        },
        {
          name: "update",
          description: "Update an existing webhook",
          args: { name: "webhook_id" },
          options: [
            {
              name: "--url",
              description: "Webhook target URL",
              args: { name: "url" },
            },
            ...commonOptions,
          ],
        },
      ],
      options: [helpOption],
    },
    {
      name: "env",
      description: "Print information about the environment",
      options: commonOptions,
    },
    {
      name: "update",
      description: "Update the `hf` CLI to the latest version",
      options: commonOptions,
    },
    {
      name: "version",
      description: "Print information about the hf version",
      options: commonOptions,
    },
  ],
  options: [
    {
      name: "--install-completion",
      description: "Install completion for the current shell",
    },
    {
      name: "--show-completion",
      description: "Show completion for the current shell",
    },
    helpOption,
  ],
};

export default completionSpec;
