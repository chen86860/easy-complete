// Tower 18 rewrote gittower. Earlier versions only opened a path, so this spec
// covers Tower 18 and later and is not versioned.

// The view commands target the repository given with -C, or the current
// directory, so git lookups do the same. A leading ~ is expanded as the shell
// would, since the path reaches git without a shell.
const gitInRepository = async (
  tokens: string[],
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
  args: string[],
): Promise<string> => {
  const index = tokens.lastIndexOf("-C");
  const repository =
    index > 0 && index < tokens.length - 2
      ? tokens[index + 1].replace(/^(['"])(.*)\1$/, "$2")
      : undefined;
  const home = context.environmentVariables.HOME;
  const path =
    repository && home ? repository.replace(/^~(?=\/|$)/, home) : repository;
  const { stdout } = await executeCommand({
    command: "git",
    args: [...(path ? ["-C", path] : []), "--no-optional-locks", ...args],
    cwd: context.currentWorkingDirectory,
  });
  return stdout;
};

const refKinds = [
  { prefix: "refs/heads/", description: "Branch" },
  { prefix: "refs/tags/", description: "Tag" },
  { prefix: "refs/remotes/", description: "Remote branch" },
];

const refsGenerator = (namespaces: string[]): Fig.Generator => ({
  custom: async (tokens, executeCommand, context) => {
    const out = await gitInRepository(tokens, executeCommand, context, [
      "for-each-ref",
      "--format=%(refname)",
      ...namespaces,
    ]);
    return out.split("\n").flatMap((ref) => {
      const kind = refKinds.find(({ prefix }) => ref.startsWith(prefix));
      if (!kind || ref.endsWith("/HEAD")) {
        return [];
      }
      return [
        { name: ref.slice(kind.prefix.length), description: kind.description },
      ];
    });
  },
});

const branchesGenerator = refsGenerator(["refs/heads"]);
const branchesAndRemotesGenerator = refsGenerator([
  "refs/heads",
  "refs/remotes",
]);
const allRefsGenerator = refsGenerator([
  "refs/heads",
  "refs/tags",
  "refs/remotes",
]);

const recentCommitsGenerator: Fig.Generator = {
  custom: async (tokens, executeCommand, context) => {
    const out = await gitInRepository(tokens, executeCommand, context, [
      "log",
      "-n",
      "50",
      "--format=%h%x09%s",
    ]);
    return out
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [hash, ...subject] = line.split("\t");
        return { name: hash, description: subject.join("\t") };
      });
  },
};

const dryRunOption: Fig.Option = {
  name: "--dry-run",
  description:
    "Print the request that would be sent to Tower without opening anything",
  hidden: true,
};

const windowOptions: Fig.Option[] = [
  {
    name: ["-n", "--new-window"],
    description: "Open the repository in a new window",
  },
  {
    name: "--new-tab",
    description: "Open the repository in a new tab in the frontmost window",
  },
  dryRunOption,
];

const repositoryOption: Fig.Option = {
  name: "-C",
  description: "Run as if started in this directory",
  args: { name: "path", template: "folders" },
};

const viewOptions: Fig.Option[] = [repositoryOption, ...windowOptions];

const branchArg: Fig.Arg = {
  name: "branch",
  description: "The branch to act on. Defaults to the checked-out branch",
  isOptional: true,
  generators: branchesGenerator,
};

const licenseOptions: Fig.Option[] = [
  {
    name: ["-c", "--code"],
    description: "License key",
    args: { name: "code" },
  },
  {
    name: ["-e", "--email"],
    description: "Registered email address",
    args: { name: "email" },
  },
  {
    name: ["-u", "--user"],
    description: "Anonymous user identifier, from gittower license info",
    args: { name: "user" },
  },
  {
    name: ["-m", "--machine"],
    description: "Anonymous machine identifier, from gittower license info",
    args: { name: "machine" },
  },
  {
    name: "--machine-name",
    description: "Machine name shown in the Customer Portal",
    args: { name: "machine-name" },
  },
];

const pathArg: Fig.Arg = {
  name: "path",
  description: "Repository or file path",
  template: "filepaths",
};

const completionSpec: Fig.Spec = {
  name: "gittower",
  description: "Open Git repositories in Tower from the command line",
  args: { ...pathArg, isOptional: true },
  options: [
    {
      name: ["-h", "--help"],
      description: "Show help information",
      isPersistent: true,
    },
    { name: ["-v", "--version"], description: "Show the version and exit" },
    ...windowOptions,
  ],
  subcommands: [
    {
      name: "open",
      description:
        "Open a repository. A path that is not a repository yet is offered for creation",
      args: pathArg,
      options: windowOptions,
    },
    {
      name: "history",
      description: "Open the History view",
      args: {
        name: "target",
        description: "A ref, a file, or <rev>:<file>",
        isOptional: true,
        generators: [allRefsGenerator, { template: "filepaths" }],
      },
      options: [
        ...viewOptions,
        { name: "--force-file", hidden: true, args: { name: "force-file" } },
        { name: "--force-ref", hidden: true, args: { name: "force-ref" } },
      ],
    },
    {
      name: "commit",
      description: "Open History with a commit selected",
      args: {
        name: "rev",
        description: "The commit to select",
        generators: [recentCommitsGenerator, allRefsGenerator],
      },
      options: viewOptions,
    },
    {
      name: "blame",
      description: "Open the Blame view for a file",
      args: {
        name: "target",
        description: "A file, or <rev>:<file>",
        template: "filepaths",
      },
      options: viewOptions,
    },
    {
      name: ["working-copy", "status"],
      description: "Open the Working Copy view",
      options: viewOptions,
    },
    {
      name: "stashes",
      description: "Open the Stashes view",
      options: viewOptions,
    },
    {
      name: "branches-review",
      description: "Open the Branches Review view",
      options: [
        {
          name: "--branch",
          description: "Preselect this branch's row",
          args: { name: "name", generators: branchesGenerator },
        },
        {
          name: "--base",
          description: "Compare against this branch",
          args: { name: "branch", generators: branchesAndRemotesGenerator },
        },
        {
          name: "--search",
          description: "Prefill the search field",
          args: { name: "text" },
        },
        {
          name: "--filter",
          description: "Filter the list",
          args: {
            name: "value",
            suggestions: [
              "none",
              "mergeable",
              "fully-merged",
              "conflicts",
              "active",
              "stale",
              "tracking-error",
              "has-pr",
              "no-pr",
            ],
          },
        },
        {
          name: "--sort",
          description: "Sort by name or last-updated",
          args: { name: "attr", suggestions: ["name", "last-updated"] },
        },
        { name: "--desc", description: "Sort descending" },
        ...viewOptions,
      ],
    },
    {
      name: ["pull-requests", "prs"],
      description: "Open the Pull Requests view",
      options: viewOptions,
    },
    {
      name: "settings",
      description: "Open the repository's settings",
      options: viewOptions,
    },
    {
      name: "clone",
      description: "Open Tower's clone dialog for a remote URL",
      args: { name: "url", description: "The remote URL to clone" },
      options: [dryRunOption],
    },
    {
      name: "branch",
      description: "Read and change Tower's branch stacking metadata",
      subcommands: [
        {
          name: "parent",
          description: "Show, set or remove a branch's parent",
          args: branchArg,
          options: [
            repositoryOption,
            {
              name: "--set",
              description: "Record this branch as the parent",
              args: { name: "branch", generators: branchesGenerator },
            },
            {
              name: "--clear",
              description: "Remove the parent and the stacked flag",
            },
          ],
        },
        {
          name: "stacked",
          description: "Show, set or clear a branch's stacked flag",
          args: branchArg,
          options: [
            repositoryOption,
            {
              name: "--set",
              description: "Mark the branch as stacked on its parent",
            },
            {
              name: "--clear",
              description: "Clear the stacked flag, keeping the parent",
            },
          ],
        },
      ],
    },
    {
      name: "license",
      description: "Manage local Tower licenses",
      hidden: true,
      subcommands: [
        {
          name: "info",
          description: "Print machine activation information",
          options: licenseOptions,
        },
        {
          name: "activate",
          description: "Activate a license and print its plist",
          args: {
            name: "info-file",
            description: "Optional activation-info plist",
            isOptional: true,
            template: "filepaths",
          },
          options: licenseOptions,
        },
        {
          name: "trial",
          description: "Register a trial and print its plist",
          args: {
            name: "info-file",
            description: "Optional activation-info plist",
            isOptional: true,
            template: "filepaths",
          },
          options: licenseOptions,
        },
        {
          name: "deactivate",
          description: "Deactivate the license in a plist",
          args: {
            name: "license-file",
            description: "License plist to deactivate",
            template: "filepaths",
          },
          options: licenseOptions,
        },
        {
          name: "install",
          description: "Install a license plist locally",
          args: {
            name: "license-file",
            description: "License or trial plist to install",
            template: "filepaths",
          },
          options: licenseOptions,
        },
      ],
    },
    {
      name: "help",
      description: "Show subcommand help information",
      args: {
        name: "subcommand",
        isOptional: true,
        isVariadic: true,
        template: "help",
      },
    },
  ],
};

export default completionSpec;
