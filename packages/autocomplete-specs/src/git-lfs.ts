// Covers git-lfs 3.8. The only changes since 3.7 are two added flags (fetch
// --stdin, pointer --no-extensions), which older releases reject with a clear
// error, so the spec is not versioned. git.ts loads it for `git lfs`.
//
// Generators run plain git rather than git-lfs. Listing patterns with
// `git lfs track` installs hooks, `git lfs locks` contacts the LFS server
// unless given --local, and most git-lfs commands create an lfs directory,
// in .git or, outside a repository, in the current directory. Own locks are
// the one exception: they exist only in git-lfs's local cache, so that
// lookup runs only once the cache file exists.
//
// File lists show one directory level at a time, as the filepaths template
// does, so a repository with thousands of LFS files stays navigable.

const git = (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
  args: string[],
): Promise<Fig.ExecuteCommandOutput> =>
  // spec-check-allow denied-command: callers pass read-only subcommands (for-each-ref, ls-files, remote, rev-parse)
  executeCommand({
    command: "git",
    args: ["--no-optional-locks", ...args],
    cwd: context.currentWorkingDirectory,
  });

const splitNul = (out: string): string[] => out.split("\0").filter(Boolean);

const hasAnyToken = (tokens: string[], names: string[]): boolean =>
  tokens.some((token) =>
    names.some((name) => token === name || token.startsWith(`${name}=`)),
  );

// Some options make positional arguments an error, such as --stdin
const unless = (
  options: string[],
  generator: Fig.Generator,
): Fig.Generator => ({
  ...generator,
  custom: async (tokens, executeCommand, context) =>
    hasAnyToken(tokens, options) || !generator.custom
      ? []
      : generator.custom(tokens, executeCommand, context),
});

const others = (names: string[], name: string): string[] =>
  names.filter((other) => other !== name);

const ranked = (suggestions: Fig.Suggestion[]): Fig.Suggestion[] =>
  suggestions.map((suggestion) => ({ ...suggestion, priority: 76 }));

const refKinds = [
  { prefix: "refs/heads/", description: "Branch" },
  { prefix: "refs/tags/", description: "Tag" },
  { prefix: "refs/remotes/", description: "Remote branch" },
];

const parseRefs = (out: string, fullName: boolean): Fig.Suggestion[] =>
  out.split("\n").flatMap((ref) => {
    const kind = refKinds.find(({ prefix }) => ref.startsWith(prefix));
    if (!kind || ref.endsWith("/HEAD")) {
      return [];
    }
    return [
      {
        name: fullName ? ref : ref.slice(kind.prefix.length),
        description: kind.description,
      },
    ];
  });

const listRefs = async (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
  namespaces: string[],
  fullName = false,
): Promise<Fig.Suggestion[]> => {
  const { stdout } = await git(executeCommand, context, [
    "for-each-ref",
    "--format=%(refname)",
    ...namespaces,
  ]);
  return parseRefs(stdout, fullName);
};

const allRefNamespaces = ["refs/heads", "refs/tags", "refs/remotes"];

const refsGenerator: Fig.Generator = {
  custom: (_tokens, executeCommand, context) =>
    listRefs(executeCommand, context, allRefNamespaces),
};

// --include-ref and --exclude-ref are string slices, so one value may hold a
// comma-separated list. The documentation uses full ref names. In the
// --opt=value form the engine reruns generators on every keystroke, and the
// fixed cache key spares those runs.
const fullRefsGenerator: Fig.Generator = {
  getQueryTerm: ",",
  cache: {
    strategy: "max-age",
    ttl: 5000,
    cacheByDirectory: true,
    cacheKey: "git-lfs full refs",
  },
  custom: (_tokens, executeCommand, context) =>
    listRefs(executeCommand, context, allRefNamespaces, true),
};

// With --object-id, `push` takes object IDs, which have no cheap listing
const pushRefsGenerator = unless(["-o", "--object-id", "--stdin"], {
  custom: (_tokens, executeCommand, context) =>
    listRefs(executeCommand, context, ["refs/heads", "refs/tags"]),
});

// ls-files takes no refs with --all, and migrate none with --everything
const lsFilesRefsGenerator = unless(["-a", "--all"], refsGenerator);

const migrateRefsGenerator = unless(["--everything"], refsGenerator);

// fsck also takes a range A..B, so only the part after ".." is matched
const fsckRevisionGenerator: Fig.Generator = {
  ...refsGenerator,
  getQueryTerm: (term) => {
    const range = term.lastIndexOf("..");
    return range === -1 ? term : term.slice(range + 2);
  },
};

const remotesGenerator: Fig.Generator = {
  custom: async (_tokens, executeCommand, context) => {
    const { stdout } = await git(executeCommand, context, ["remote"]);
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((name) => ({ name, description: "Remote" }));
  },
};

// -z keeps non-ASCII names unquoted. Conflicted files are listed once per
// stage, so the result is deduplicated.
const lsFiles = async (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
  args: string[],
): Promise<string[]> => {
  const { stdout } = await git(executeCommand, context, [
    "ls-files",
    "-z",
    ...args,
  ]);
  return [...new Set(splitNul(stdout))];
};

const parentOf = (path: string): string =>
  path.slice(0, path.lastIndexOf("/") + 1);

// Resolves . and .. segments, because ls-files prints a path inside the
// current directory without the ../dir/ the user may have typed
const resolvePath = (base: string, path: string): string => {
  const segments: string[] = [];
  const start = path.startsWith("/") ? "" : base;
  for (const segment of `${start}/${path}`.split("/")) {
    if (segment === "..") {
      segments.pop();
    } else if (segment && segment !== ".") {
      segments.push(segment);
    }
  }
  return segments.join("/");
};

interface TreeQuery {
  attribute: string;
  fromRoot?: boolean;
  unmerged?: boolean;
}

// Lists the files and folders directly inside `directory` that hold files
// with the attribute. `fromRoot` reads the directory, and prints the paths,
// relative to the repository root instead of the current directory.
const lfsTree = async (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
  directory: string,
  description: string,
  { attribute, fromRoot = false, unmerged = false }: TreeQuery,
): Promise<Fig.Suggestion[]> => {
  const entries = await lsFiles(executeCommand, context, [
    ...(unmerged ? ["-u"] : []),
    ...(fromRoot ? ["--full-name"] : []),
    "--",
    `:(${fromRoot ? "top," : ""}literal,attr:${attribute})${directory}`,
  ]);
  const base = fromRoot ? "" : context.currentWorkingDirectory;
  const parent = resolvePath(base, directory);
  const children = new Map<string, Fig.Suggestion>();
  for (const entry of entries) {
    // `ls-files -u` prints "<mode> <object> <stage>\t<path>" per stage
    const path = resolvePath(
      base,
      unmerged ? entry.slice(entry.indexOf("\t") + 1) : entry,
    );
    if (parent && !path.startsWith(`${parent}/`)) {
      continue;
    }
    const rest = parent ? path.slice(parent.length + 1) : path;
    const slash = rest.indexOf("/");
    const name = slash === -1 ? rest : rest.slice(0, slash + 1);
    children.set(
      name,
      slash === -1
        ? { name, description, type: "file" }
        : { name, type: "folder" },
    );
  }
  return [...children.values()];
};

// `checkout --to` takes the path of a conflicted LFS file instead of patterns
const checkoutPathsGenerator: Fig.Generator = {
  trigger: "/",
  getQueryTerm: "/",
  custom: (tokens, executeCommand, context) => {
    const directory = parentOf(context.searchTerm);
    return hasAnyToken(tokens, ["--to", "--ours", "--theirs", "--base"])
      ? lfsTree(executeCommand, context, directory, "Conflicted Git LFS file", {
          attribute: "filter=lfs",
          unmerged: true,
        })
      : lfsTree(executeCommand, context, directory, "Git LFS file", {
          attribute: "filter=lfs",
        });
  },
};

// Lockable files first. Any LFS file can be locked, so a directory without
// lockable files lists those instead.
const lockCandidatesGenerator: Fig.Generator = {
  trigger: "/",
  getQueryTerm: "/",
  custom: async (_tokens, executeCommand, context) => {
    const directory = parentOf(context.searchTerm);
    const lockable = await lfsTree(
      executeCommand,
      context,
      directory,
      "Lockable file",
      { attribute: "lockable" },
    );
    return lockable.length > 0
      ? lockable
      : lfsTree(executeCommand, context, directory, "Git LFS file", {
          attribute: "filter=lfs",
        });
  },
};

// With --no-rewrite, `migrate import` takes files matching LFS patterns
// instead of branches, as paths from the repository root
const noRewriteFilesGenerator: Fig.Generator = {
  trigger: "/",
  getQueryTerm: "/",
  custom: async (tokens, executeCommand, context) =>
    hasAnyToken(tokens, ["--no-rewrite"])
      ? lfsTree(
          executeCommand,
          context,
          parentOf(context.searchTerm),
          "Matches a Git LFS pattern",
          { attribute: "filter=lfs", fromRoot: true },
        )
      : [],
};

// Mirrors how `git lfs untrack` reads patterns: only the repository root's
// .gitattributes, first field of each line containing "filter=lfs", with a
// leading ./ dropped and the escapes git-lfs writes for spaces and # undone.
const parseTrackedPatterns = (attributes: string): Fig.Suggestion[] =>
  attributes.split("\n").flatMap((line) => {
    const [pattern, ...attrs] = line.trim().split(/\s+/);
    if (
      !pattern ||
      pattern.startsWith("#") ||
      pattern.startsWith("[attr]") ||
      !line.includes("filter=lfs")
    ) {
      return [];
    }
    const name = pattern
      .replace(/^\.\//, "")
      .replaceAll("[[:space:]]", " ")
      .replaceAll("\\#", "#")
      .replaceAll("\\\\", "\\");
    return [
      {
        name,
        description: attrs.includes("lockable")
          ? "Tracked pattern, lockable"
          : "Tracked pattern",
      },
    ];
  });

const trackedPatterns = async (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
): Promise<Fig.Suggestion[]> => {
  const top = await git(executeCommand, context, [
    "rev-parse",
    "--show-toplevel",
  ]);
  if (top.status !== 0) {
    return [];
  }
  const { stdout } = await executeCommand({
    command: "cat",
    args: [`${top.stdout}/.gitattributes`],
  });
  return parseTrackedPatterns(stdout);
};

const trackedPatternsGenerator: Fig.Generator = {
  custom: (_tokens, executeCommand, context) =>
    trackedPatterns(executeCommand, context),
};

// -I and -X take comma-separated lists, and the patterns do not depend on
// the typed token, so one cached run serves the whole list
const trackedPatternListGenerator: Fig.Generator = {
  getQueryTerm: ",",
  cache: {
    strategy: "max-age",
    ttl: 5000,
    cacheByDirectory: true,
    cacheKey: "git-lfs tracked patterns",
  },
  custom: async (_tokens, executeCommand, context) =>
    ranked(await trackedPatterns(executeCommand, context)),
};

const listItem = (term: string): string =>
  term.slice(term.lastIndexOf(",") + 1);

// Include and exclude filters match paths from the repository root
const pathFilterTreeGenerator: Fig.Generator = {
  trigger: (current, previous) =>
    parentOf(listItem(current)) !== parentOf(listItem(previous)),
  getQueryTerm: (term) =>
    term.slice(Math.max(term.lastIndexOf(","), term.lastIndexOf("/")) + 1),
  custom: (_tokens, executeCommand, context) =>
    lfsTree(
      executeCommand,
      context,
      parentOf(listItem(context.searchTerm)),
      "Git LFS file",
      { attribute: "filter=lfs", fromRoot: true },
    ),
};

const countExtensions = (paths: string[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const path of paths) {
    const extension = path.match(/[^/]\.([^./]+)$/)?.[1];
    if (extension) {
      counts.set(extension, (counts.get(extension) ?? 0) + 1);
    }
  }
  return counts;
};

// Import and info mostly deal with files that are not in LFS yet, so this
// offers a *.ext pattern per untracked extension in the tree. Export only
// converts existing pointers, so it gets the tracked patterns alone. It has
// no cache: a fixed key would share one result between the subcommands.
const extensionPatternsGenerator: Fig.Generator = {
  getQueryTerm: ",",
  custom: async (tokens, executeCommand, context) => {
    if (tokens.includes("export")) {
      return [];
    }
    const [patterns, files] = await Promise.all([
      trackedPatterns(executeCommand, context),
      lsFiles(executeCommand, context, ["--full-name", "--", ":(top)"]),
    ]);
    const tracked = new Set(patterns.map(({ name }) => name));
    return [...countExtensions(files)]
      .filter(([extension]) => !tracked.has(`*.${extension}`))
      .map(([extension, count]) => ({
        name: `*.${extension}`,
        description: count === 1 ? "1 file" : `${count} files`,
      }));
  },
};

interface Lock {
  id: string;
  path: string;
}

// The lock cache records paths from the repository root, while lock and
// unlock read paths relative to the current directory. `git lfs lock` writes
// the cache file; before that, `git lfs locks` would only create .git/lfs.
const ownLocks = async (
  executeCommand: Fig.ExecuteCommandFunction,
  context: Fig.GeneratorContext,
): Promise<Lock[]> => {
  const location = await git(executeCommand, context, [
    "rev-parse",
    "--git-common-dir",
    "--show-prefix",
    "--show-cdup",
  ]);
  if (location.status !== 0) {
    return [];
  }
  const [commonDir, prefix = "", cdup = ""] = location.stdout.split("\n");
  const cache = await executeCommand({
    command: "test",
    args: ["-f", `${commonDir}/lfs/lockcache.db`],
    cwd: context.currentWorkingDirectory,
  });
  if (cache.status !== 0) {
    return [];
  }
  const { stdout } = await executeCommand({
    command: "git",
    args: ["lfs", "locks", "--local", "--json"],
    cwd: context.currentWorkingDirectory,
  });
  const locks = (stdout.trim() ? JSON.parse(stdout) : []) as Lock[];
  return locks.map((lock) => ({
    id: lock.id,
    path: lock.path.startsWith(prefix)
      ? lock.path.slice(prefix.length)
      : `${cdup}${lock.path}`,
  }));
};

const lockPathsGenerator: Fig.Generator = {
  custom: async (_tokens, executeCommand, context) =>
    ranked(
      (await ownLocks(executeCommand, context)).map(({ id, path }) => ({
        name: path,
        description: `Your lock ${id}`,
        type: "file",
      })),
    ),
};

const lockIdsGenerator: Fig.Generator = {
  custom: async (_tokens, executeCommand, context) =>
    (await ownLocks(executeCommand, context)).map(({ id, path }) => ({
      name: id,
      description: path,
    })),
};

// Logs live in <git common dir>/lfs/logs unless lfs.storage moves them
const logsGenerator: Fig.Generator = {
  custom: async (_tokens, executeCommand, context) => {
    const gitDir = await git(executeCommand, context, [
      "rev-parse",
      "--git-common-dir",
    ]);
    if (gitDir.status !== 0) {
      return [];
    }
    const { stdout } = await executeCommand({
      command: "ls",
      args: ["-1", `${gitDir.stdout}/lfs/logs`],
      cwd: context.currentWorkingDirectory,
    });
    return stdout
      .split("\n")
      .filter(Boolean)
      .map((name) => ({ name, description: "Error log" }));
  },
};

const extensionsGenerator: Fig.Generator = {
  script: [
    "git",
    "config",
    "--name-only",
    "--get-regexp",
    "^lfs\\.extension\\.",
  ],
  postProcess: (out) => {
    const names = out
      .split("\n")
      .flatMap((key) => key.match(/^lfs\.extension\.(.+)\.[^.]+$/)?.[1] ?? []);
    return [...new Set(names)].map((name) => ({
      name,
      description: "Extension",
    }));
  },
};

const pathFilterGenerators = [
  trackedPatternListGenerator,
  pathFilterTreeGenerator,
];

const includeOption: Fig.Option = {
  name: ["-I", "--include"],
  description: "Only paths matching these comma-separated patterns",
  args: { name: "patterns", generators: pathFilterGenerators },
};

const excludeOption: Fig.Option = {
  name: ["-X", "--exclude"],
  description: "Skip paths matching these comma-separated patterns",
  args: { name: "patterns", generators: pathFilterGenerators },
};

const remoteOption: Fig.Option = {
  name: ["-r", "--remote"],
  description: "Git LFS server to use, by remote name",
  args: { name: "remote", generators: remotesGenerator },
};

const jsonOption: Fig.Option = {
  name: ["-j", "--json"],
  description: "Print the output as JSON for scripts",
};

const configScopes = ["--local", "--worktree", "--system", "--file"];

const configFileArg: Fig.Arg = {
  name: "file",
  description: "Git configuration file",
  template: "filepaths",
};

const objectMapOption: Fig.Option = {
  name: "--object-map",
  description: "Write a CSV of old and new commit IDs to this file",
  args: { name: "path", template: "filepaths" },
};

const migrateVerboseOption: Fig.Option = {
  name: "--verbose",
  description: "Print the commit and path of each converted file",
};

const migrateBranchesArg: Fig.Arg = {
  name: "branch",
  description: "Branches to migrate. Defaults to the checked-out branch",
  isOptional: true,
  isVariadic: true,
  generators: migrateRefsGenerator,
};

const sizeArg: Fig.Arg = {
  name: "size",
  description: "Bytes, or a number with a unit such as 20mb or 3gib",
};

const migratePatternGenerators = [
  trackedPatternListGenerator,
  extensionPatternsGenerator,
];

// import's --above also excludes -I and -X, but listing it here would hide
// --above from info, which accepts both
const migrateOptions: Fig.Option[] = [
  {
    ...includeOption,
    args: { name: "patterns", generators: migratePatternGenerators },
    exclusiveOn: ["--fixup"],
    isPersistent: true,
  },
  {
    ...excludeOption,
    args: { name: "patterns", generators: migratePatternGenerators },
    exclusiveOn: ["--fixup"],
    isPersistent: true,
  },
  {
    name: "--include-ref",
    description: "Migrate commits reachable from this ref",
    isRepeatable: true,
    exclusiveOn: ["--everything"],
    args: { name: "ref", generators: fullRefsGenerator },
    isPersistent: true,
  },
  {
    name: "--exclude-ref",
    description: "Skip commits reachable from this ref",
    isRepeatable: true,
    exclusiveOn: ["--everything"],
    args: { name: "ref", generators: fullRefsGenerator },
    isPersistent: true,
  },
  {
    name: "--everything",
    description: "Migrate commits reachable from every local and remote ref",
    exclusiveOn: ["--include-ref", "--exclude-ref"],
    isPersistent: true,
  },
  {
    name: "--skip-fetch",
    description: "Use the remote refs already known instead of fetching them",
    isPersistent: true,
  },
  {
    name: ["-y", "--yes"],
    description: "Answer yes to prompts, including overwriting local changes",
    isDangerous: true,
    isPersistent: true,
  },
];

const mergeDriverFiles = ["--ancestor", "--current", "--other", "--output"];

const cloneOptions: Fig.Option[] = [
  {
    name: "--template",
    description: "Directory to copy templates from",
    args: { name: "directory", template: "folders" },
  },
  {
    name: ["-l", "--local"],
    description: "Copy a local repository with hard links",
  },
  {
    name: ["-s", "--shared"],
    description: "Share objects with a local source repository",
  },
  {
    name: "--no-hardlinks",
    description: "Copy local objects instead of hard-linking them",
  },
  { name: ["-q", "--quiet"], description: "Suppress progress output" },
  {
    name: ["-n", "--no-checkout"],
    description: "Do not check out HEAD after cloning",
  },
  { name: "--progress", description: "Report progress even without a tty" },
  { name: "--bare", description: "Make a bare repository" },
  { name: "--mirror", description: "Make a bare mirror of the source" },
  {
    name: ["-o", "--origin"],
    description: "Name for the source remote instead of origin",
    args: { name: "name" },
  },
  {
    name: ["-b", "--branch"],
    description: "Branch to check out instead of the remote HEAD",
    args: { name: "branch" },
  },
  {
    name: ["-u", "--upload-pack"],
    description: "Path to git-upload-pack on the remote",
    args: { name: "path" },
  },
  {
    name: "--reference",
    description: "Borrow objects from this local repository",
    args: { name: "repository", template: "folders" },
  },
  {
    name: "--reference-if-able",
    description: "Borrow objects from this repository if it exists",
    args: { name: "repository", template: "folders" },
  },
  {
    name: "--dissociate",
    description: "Copy borrowed objects so the clone stands alone",
  },
  {
    name: "--separate-git-dir",
    description: "Put the Git directory at this path",
    args: { name: "directory", template: "folders" },
  },
  {
    name: "--depth",
    description: "Make a shallow clone with this many commits",
    args: { name: "depth" },
  },
  { name: "--recursive", description: "Also clone submodules" },
  { name: "--recurse-submodules", description: "Also clone submodules" },
  {
    name: ["-c", "--config"],
    description: "Set a configuration variable in the new repository",
    args: { name: "key=value" },
  },
  {
    name: "--single-branch",
    description: "Clone only the history of one branch",
  },
  {
    name: "--no-single-branch",
    description: "Clone the history of every branch",
  },
  { name: ["-v", "--verbose"], description: "Report more detail" },
  { name: "--ipv4", description: "Use IPv4 addresses only" },
  { name: "--ipv6", description: "Use IPv6 addresses only" },
  {
    name: "--shallow-since",
    description: "Make a shallow clone of history after this date",
    args: { name: "date" },
  },
  {
    name: "--shallow-exclude",
    description: "Make a shallow clone that excludes history of this ref",
    args: { name: "ref" },
  },
  {
    name: "--shallow-submodules",
    description: "Clone submodules shallowly",
  },
  {
    name: "--no-shallow-submodules",
    description: "Clone submodules with full history",
  },
  {
    name: ["-j", "--jobs"],
    description: "Number of submodules fetched at the same time",
    args: { name: "count" },
  },
  // The repository does not exist yet, so there is nothing to look up
  { ...includeOption, args: { name: "patterns" } },
  { ...excludeOption, args: { name: "patterns" } },
  { name: "--skip-repo", description: "Do not install Git LFS hooks" },
];

const commands: Fig.Subcommand[] = [
  {
    name: "checkout",
    description: "Populate the working copy with Git LFS file contents",
    args: {
      name: "pattern",
      description:
        "Gitignore-style patterns to limit the files, or with --to, one conflicted file",
      isOptional: true,
      isVariadic: true,
      generators: checkoutPathsGenerator,
    },
    options: [
      {
        name: "--base",
        description: "With --to, check out the merge base version",
        exclusiveOn: ["--ours", "--theirs"],
        dependsOn: ["--to"],
      },
      {
        name: "--ours",
        description: "With --to, check out the current branch's version",
        exclusiveOn: ["--base", "--theirs"],
        dependsOn: ["--to"],
      },
      {
        name: "--theirs",
        description: "With --to, check out the other branch's version",
        exclusiveOn: ["--base", "--ours"],
        dependsOn: ["--to"],
      },
      {
        name: "--to",
        description:
          "Write one side of a conflicted file to this path, replacing it",
        args: { name: "path", template: "filepaths" },
      },
    ],
  },
  {
    name: "completion",
    description: "Print a shell completion script",
    args: { name: "shell", suggestions: ["bash", "fish", "zsh"] },
  },
  {
    name: "dedup",
    description:
      "Turn working tree files into copy-on-write clones of LFS objects",
    options: [
      {
        name: ["-t", "--test"],
        description:
          "Only check whether the file system supports copy-on-write clones",
      },
    ],
  },
  { name: "env", description: "Display the Git LFS environment" },
  {
    name: "ext",
    description: "Display Git LFS extension details",
    subcommands: [
      {
        name: "list",
        description: "Show all extensions, or the named ones",
        args: {
          name: "name",
          isOptional: true,
          isVariadic: true,
          generators: extensionsGenerator,
        },
      },
    ],
  },
  {
    name: "fetch",
    description: "Download Git LFS objects from a remote",
    args: [
      {
        name: "remote",
        description: "Defaults to the tracked remote, or origin",
        isOptional: true,
        generators: remotesGenerator,
      },
      {
        name: "ref",
        description: "Defaults to the checked-out ref",
        isOptional: true,
        isVariadic: true,
        generators: unless(["--stdin"], refsGenerator),
      },
    ],
    options: [
      { ...includeOption, exclusiveOn: ["--all"] },
      { ...excludeOption, exclusiveOn: ["--all"] },
      {
        name: ["-r", "--recent"],
        description: "Also fetch objects for recent branches and commits",
        exclusiveOn: ["--all"],
      },
      {
        name: ["-a", "--all"],
        description:
          "Fetch every object reachable from the given refs, or from all refs",
        exclusiveOn: ["--recent", "--include", "--exclude"],
      },
      { name: "--stdin", description: "Read refs from standard input" },
      {
        name: ["-p", "--prune"],
        description: "Prune old and unreferenced objects afterwards",
        isDangerous: true,
        exclusiveOn: ["--json"],
      },
      {
        name: "--refetch",
        description: "Also fetch objects that are already present locally",
      },
      {
        name: ["-d", "--dry-run"],
        description: "Show what would be fetched without fetching",
      },
      { ...jsonOption, exclusiveOn: ["--prune"] },
    ],
  },
  {
    name: "fsck",
    description: "Check Git LFS files for consistency",
    args: {
      name: "revision",
      description: "A commit, or a range A..B. Defaults to HEAD",
      isOptional: true,
      generators: fsckRevisionGenerator,
    },
    options: [
      {
        name: "--objects",
        description: "Check that each object exists and matches its hash",
      },
      {
        name: "--pointers",
        description:
          "Check that pointers are canonical and LFS files are stored as pointers",
      },
      {
        name: ["-d", "--dry-run"],
        description: "Do not move corrupted objects to .git/lfs/bad",
      },
    ],
  },
  {
    name: "install",
    description:
      "Set up the Git LFS filters, plus hooks when inside a repository",
    subcommands: [
      {
        name: "hooks",
        description: "Install only the Git LFS hooks in this repository",
        hidden: true,
      },
    ],
    options: [
      {
        name: ["-f", "--force"],
        description:
          "Overwrite existing filter settings, plus hooks when inside a repository",
        isDangerous: true,
        exclusiveOn: ["--manual"],
      },
      {
        name: ["-l", "--local"],
        description: "Set the filters in this repository's config only",
        exclusiveOn: others(configScopes, "--local"),
      },
      {
        name: ["-w", "--worktree"],
        description: "Set the filters in this working tree's config only",
        exclusiveOn: others(configScopes, "--worktree"),
      },
      {
        name: "--system",
        description: "Set the filters in the system-wide config",
        exclusiveOn: others(configScopes, "--system"),
      },
      {
        name: "--file",
        description: "Set the filters in this config file only",
        exclusiveOn: others(configScopes, "--file"),
        args: configFileArg,
      },
      {
        name: ["-s", "--skip-smudge"],
        description: "Do not download LFS objects on clone or pull",
      },
      {
        name: "--skip-repo",
        description: "Set up the filters without installing hooks",
      },
      {
        name: ["-m", "--manual"],
        description: "Print instructions for adding the hooks by hand",
        exclusiveOn: ["--force"],
      },
    ],
  },
  {
    name: "lock",
    description: "Lock files on the Git LFS server",
    args: {
      name: "path",
      isVariadic: true,
      generators: lockCandidatesGenerator,
    },
    options: [remoteOption, jsonOption],
  },
  {
    name: "locks",
    description: "List locked files from the Git LFS server",
    options: [
      remoteOption,
      {
        name: ["-i", "--id"],
        description: "Show only the lock with this ID",
        exclusiveOn: ["--cached", "--verify"],
        args: { name: "id", generators: lockIdsGenerator },
      },
      {
        name: ["-p", "--path"],
        description: "Show only the lock on this path",
        exclusiveOn: ["--cached", "--verify"],
        args: { name: "path", generators: lockPathsGenerator },
      },
      {
        name: ["-l", "--limit"],
        description: "Maximum number of locks to return",
        exclusiveOn: ["--cached"],
        args: { name: "count" },
      },
      {
        name: "--local",
        description: "List your own locks from the local cache, offline",
        exclusiveOn: ["--cached", "--verify"],
      },
      {
        name: "--cached",
        description: "List everyone's locks as of the last server query",
        exclusiveOn: ["--limit", "--id", "--path", "--local"],
      },
      {
        name: "--verify",
        description: "Check owners on the server and mark your locks with O",
        exclusiveOn: ["--id", "--path", "--local"],
      },
      jsonOption,
    ],
  },
  {
    name: "logs",
    description: "List error logs from Git LFS commands",
    subcommands: [
      { name: "last", description: "Show the most recent error log" },
      {
        name: "show",
        description: "Show an error log",
        args: { name: "log", generators: logsGenerator },
      },
      {
        name: "clear",
        description: "Delete all error logs",
        isDangerous: true,
      },
      {
        name: "boomtown",
        description: "Crash on purpose to write a sample log",
        hidden: true,
      },
    ],
  },
  {
    name: "ls-files",
    description: "List Git LFS files in a ref, or changed between two refs",
    args: [
      {
        name: "ref",
        description: "Defaults to the checked-out branch",
        isOptional: true,
        generators: lsFilesRefsGenerator,
      },
      {
        name: "ref",
        description: "List the files changed from the first ref to this one",
        isOptional: true,
        generators: lsFilesRefsGenerator,
      },
    ],
    options: [
      {
        name: ["-l", "--long"],
        description: "Show the full 64-character object ID",
      },
      {
        name: ["-s", "--size"],
        description: "Show the size of each object",
      },
      {
        name: ["-n", "--name-only"],
        description: "Show only file names",
      },
      {
        name: ["-d", "--debug"],
        description: "Show everything known about each file",
      },
      {
        name: ["-a", "--all"],
        description: "Scan the whole history instead of one ref",
      },
      {
        name: "--deleted",
        description: "Include files deleted in the ref's history",
      },
      includeOption,
      excludeOption,
      jsonOption,
    ],
  },
  {
    name: "migrate",
    description: "Convert history to or from Git LFS, or report file sizes",
    requiresSubcommand: true,
    options: migrateOptions,
    subcommands: [
      {
        name: "info",
        description: "Summarize file sizes by file type",
        args: migrateBranchesArg,
        options: [
          {
            name: "--above",
            description: "Count only files larger than this",
            args: sizeArg,
          },
          {
            name: "--top",
            description: "Number of entries to show. Defaults to 5",
            args: { name: "count" },
          },
          {
            name: "--unit",
            description: "Unit for sizes. Defaults to the largest that fits",
            args: {
              name: "unit",
              suggestions: [
                "b",
                "kib",
                "mib",
                "gib",
                "tib",
                "pib",
                "kb",
                "mb",
                "gb",
                "tb",
                "pb",
              ],
            },
          },
          {
            name: "--pointers",
            description: "How to count existing Git LFS pointers",
            args: {
              name: "mode",
              suggestions: [
                {
                  name: "follow",
                  description:
                    "Total the objects they point to on a separate line (default)",
                },
                {
                  name: "no-follow",
                  description: "Count the pointer files like regular files",
                },
                { name: "ignore", description: "Leave pointers out" },
              ],
            },
          },
          {
            name: "--fixup",
            description:
              "Count only files .gitattributes puts in LFS that are not pointers yet",
            exclusiveOn: ["--include", "--exclude"],
          },
        ],
      },
      {
        name: "import",
        description: "Convert Git files to Git LFS pointers, rewriting history",
        isDangerous: true,
        args: {
          name: "branch",
          description:
            "Branches to rewrite, or with --no-rewrite, files to convert, from the repository root",
          isOptional: true,
          isVariadic: true,
          generators: [
            unless(["--no-rewrite", "--everything"], refsGenerator),
            noRewriteFilesGenerator,
          ],
        },
        options: [
          {
            name: "--above",
            description: "Convert only files larger than this",
            exclusiveOn: ["--include", "--exclude", "--fixup"],
            args: sizeArg,
          },
          migrateVerboseOption,
          objectMapOption,
          {
            name: "--no-rewrite",
            description:
              "Convert the given files in a new commit instead of rewriting history",
            exclusiveOn: ["--fixup"],
          },
          {
            name: ["-m", "--message"],
            description: "Message for the commit that --no-rewrite creates",
            args: { name: "message" },
          },
          {
            name: "--fixup",
            description:
              "Convert files .gitattributes puts in LFS that are not pointers yet",
            exclusiveOn: ["--include", "--exclude", "--above", "--no-rewrite"],
          },
        ],
      },
      {
        name: "export",
        description: "Convert Git LFS pointers to Git files, rewriting history",
        isDangerous: true,
        args: migrateBranchesArg,
        options: [
          migrateVerboseOption,
          objectMapOption,
          {
            name: "--remote",
            description:
              "Remote to download missing objects from. Defaults to origin",
            args: { name: "remote", generators: remotesGenerator },
          },
        ],
      },
    ],
  },
  {
    name: "prune",
    description: "Delete old Git LFS objects from local storage",
    isDangerous: true,
    options: [
      {
        name: ["-d", "--dry-run"],
        description: "Report what would be deleted without deleting",
      },
      {
        name: ["-v", "--verbose"],
        description: "List each object that is or would be deleted",
      },
      {
        name: "--recent",
        description: "Also prune objects the recent-refs settings would keep",
      },
      {
        name: ["-f", "--force"],
        description:
          "Prune everything pushed, including the current checkout's objects",
        isDangerous: true,
      },
      {
        name: ["-c", "--verify-remote"],
        description: "Check that the remote has reachable objects first",
        exclusiveOn: ["--no-verify-remote"],
      },
      {
        name: "--no-verify-remote",
        description:
          "Skip remote verification despite lfs.pruneverifyremotealways",
        exclusiveOn: ["--verify-remote"],
      },
      {
        name: "--verify-unreachable",
        description: "With --verify-remote, also check unreachable objects",
      },
      {
        name: "--no-verify-unreachable",
        description:
          "Skip checking unreachable objects despite lfs.pruneverifyunreachablealways",
      },
      {
        name: "--when-unverified",
        description: "What to do when the remote lacks an object",
        args: {
          name: "action",
          suggestions: [
            { name: "halt", description: "Stop without deleting (default)" },
            {
              name: "continue",
              description: "Delete the objects that were verified",
            },
          ],
        },
      },
    ],
  },
  {
    name: "pull",
    description: "Fetch Git LFS objects and check them out",
    args: {
      name: "remote",
      description: "Defaults to the tracked remote, or origin",
      isOptional: true,
      generators: remotesGenerator,
    },
    options: [includeOption, excludeOption],
  },
  {
    name: "push",
    description: "Upload Git LFS objects to a remote's LFS server",
    args: [
      { name: "remote", generators: remotesGenerator },
      {
        name: "ref",
        description: "Refs to push, or object IDs with --object-id",
        isOptional: true,
        isVariadic: true,
        generators: pushRefsGenerator,
      },
    ],
    options: [
      {
        name: ["-d", "--dry-run"],
        description: "Show the files that would be pushed without pushing",
      },
      {
        name: ["-a", "--all"],
        description:
          "Push every object reachable from the given refs, or all local refs",
      },
      {
        name: ["-o", "--object-id"],
        description: "Push the given object IDs instead of refs",
      },
      {
        name: "--stdin",
        description: "Read refs, or object IDs, from standard input",
      },
    ],
  },
  {
    name: "status",
    description: "Show Git LFS files that are unpushed, staged or modified",
    options: [
      {
        name: ["-p", "--porcelain"],
        description: "Print an easy-to-parse format for scripts",
      },
      jsonOption,
    ],
  },
  {
    name: "track",
    description: "Track file patterns with Git LFS, or list tracked patterns",
    args: {
      name: "pattern",
      description: "Gitignore-style pattern written to .gitattributes",
      isOptional: true,
      isVariadic: true,
      template: "filepaths",
    },
    options: [
      {
        name: ["-v", "--verbose"],
        description: "Log the files that are touched",
      },
      {
        name: ["-d", "--dry-run"],
        description: "Log what would change without changing anything",
      },
      {
        ...jsonOption,
        description: "Print the tracked patterns as JSON. Takes no patterns",
      },
      {
        name: "--filename",
        description: "Treat the arguments as literal file names",
      },
      {
        name: ["-l", "--lockable"],
        description: "Make matching files read-only unless locked",
      },
      {
        name: "--not-lockable",
        description: "Remove the lockable attribute from the patterns",
      },
      {
        name: "--no-excluded",
        description: "List only tracked patterns, not excluded ones",
      },
      {
        name: "--no-modify-attrs",
        description:
          "Mark matching files for re-indexing without editing .gitattributes",
      },
    ],
  },
  {
    name: "uninstall",
    description:
      "Remove the Git LFS filters, plus hooks when inside a repository",
    isDangerous: true,
    subcommands: [
      {
        name: "hooks",
        description: "Remove only the Git LFS hooks from this repository",
        hidden: true,
      },
    ],
    options: [
      {
        name: ["-l", "--local"],
        description: "Remove the filters from this repository's config only",
        exclusiveOn: others(configScopes, "--local"),
      },
      {
        name: ["-w", "--worktree"],
        description: "Remove the filters from this working tree's config only",
        exclusiveOn: others(configScopes, "--worktree"),
      },
      {
        name: "--system",
        description: "Remove the filters from the system-wide config",
        exclusiveOn: others(configScopes, "--system"),
      },
      {
        name: "--file",
        description: "Remove the filters from this config file only",
        exclusiveOn: others(configScopes, "--file"),
        args: configFileArg,
      },
      {
        name: "--skip-repo",
        description: "Leave this repository's hooks in place",
      },
    ],
  },
  {
    name: "unlock",
    description: "Release locks on the Git LFS server",
    args: {
      name: "path",
      description: "Locked files, unless --id is given",
      isOptional: true,
      isVariadic: true,
      generators: [
        unless(["-i", "--id"], lockPathsGenerator),
        unless(["-i", "--id"], lockCandidatesGenerator),
      ],
    },
    options: [
      remoteOption,
      {
        name: ["-i", "--id"],
        description: "Release the lock with this ID instead of by path",
        args: { name: "id", generators: lockIdsGenerator },
      },
      {
        name: ["-f", "--force"],
        description: "Break the lock even if another user holds it",
        isDangerous: true,
      },
      jsonOption,
    ],
  },
  {
    name: "untrack",
    description: "Stop tracking patterns with Git LFS",
    args: {
      name: "pattern",
      description: "A pattern as written in the root .gitattributes",
      isVariadic: true,
      generators: trackedPatternsGenerator,
    },
  },
  {
    name: "update",
    description: "Update the Git LFS hooks in this repository",
    options: [
      {
        name: ["-f", "--force"],
        description: "Overwrite existing hooks",
        isDangerous: true,
        exclusiveOn: ["--manual"],
      },
      {
        name: ["-m", "--manual"],
        description: "Print instructions for updating the hooks by hand",
        exclusiveOn: ["--force"],
      },
    ],
  },
  {
    name: "version",
    description: "Print the Git LFS version",
    options: [
      { name: ["-c", "--comics"], description: "Easter egg", hidden: true },
    ],
  },
  {
    name: "pointer",
    description: "Build and compare Git LFS pointers",
    priority: 40,
    options: [
      {
        name: ["-f", "--file"],
        description: "Build a pointer from this file",
        args: { name: "path", template: "filepaths" },
      },
      {
        name: ["-p", "--pointer"],
        description: "Compare with the pointer in this file",
        exclusiveOn: ["--check", "--stdin"],
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "--stdin",
        description: "Read the pointer to compare or check from standard input",
        exclusiveOn: ["--pointer"],
      },
      {
        name: "--check",
        description: "Exit 0 if --file or --stdin holds a valid pointer",
        exclusiveOn: ["--pointer"],
      },
      {
        name: "--strict",
        description: "With --check, also require a canonical pointer",
        exclusiveOn: ["--no-strict"],
      },
      {
        name: "--no-strict",
        description: "With --check, accept non-canonical pointers (default)",
        exclusiveOn: ["--strict"],
      },
      {
        name: "--no-extensions",
        description: "Build a plain pointer without extensions",
      },
    ],
  },
  {
    name: "merge-driver",
    description: "Merge text files stored in Git LFS",
    priority: 40,
    options: [
      {
        name: "--ancestor",
        description: "File with the ancestor version (%O)",
        dependsOn: others(mergeDriverFiles, "--ancestor"),
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "--current",
        description: "File with the current version (%A)",
        dependsOn: others(mergeDriverFiles, "--current"),
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "--other",
        description: "File with the other version (%B)",
        dependsOn: others(mergeDriverFiles, "--other"),
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "--output",
        description: "File to write the merged result to",
        dependsOn: others(mergeDriverFiles, "--output"),
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "--marker-size",
        description: "Conflict marker size (%L). Defaults to 12",
        args: { name: "size" },
      },
      {
        name: "--program",
        description:
          "Shell command that merges instead of git merge-file, with %A %B %D %O %L substituted",
        args: { name: "command" },
      },
    ],
  },
  {
    name: "clean",
    description: "Git clean filter that converts large files to pointers",
    hidden: true,
    args: { name: "path", isOptional: true, template: "filepaths" },
  },
  {
    name: "filter-process",
    description: "Git process filter that converts files and pointers",
    hidden: true,
    options: [
      {
        name: ["-s", "--skip"],
        description: "Leave pointers in place instead of downloading",
      },
    ],
  },
  {
    name: "smudge",
    description: "Git smudge filter that converts pointers to file contents",
    hidden: true,
    args: { name: "path", isOptional: true, template: "filepaths" },
    options: [
      {
        name: ["-s", "--skip"],
        description: "Leave pointers in place instead of downloading",
      },
    ],
  },
  {
    name: "post-checkout",
    description: "Git post-checkout hook",
    hidden: true,
    args: [
      { name: "rev-before", generators: refsGenerator },
      { name: "ref-after", generators: refsGenerator },
      {
        name: "is-branch-checkout",
        suggestions: [
          { name: "1", description: "Branch checkout" },
          { name: "0", description: "File checkout" },
        ],
      },
    ],
  },
  { name: "post-commit", description: "Git post-commit hook", hidden: true },
  {
    name: "post-merge",
    description: "Git post-merge hook",
    hidden: true,
    args: {
      name: "is-squash",
      suggestions: [
        { name: "0", description: "Regular merge" },
        { name: "1", description: "Squash merge" },
      ],
    },
  },
  {
    name: "pre-push",
    description: "Git pre-push hook that uploads LFS objects",
    hidden: true,
    args: [
      { name: "remote", generators: remotesGenerator },
      { name: "remote-url", isOptional: true },
    ],
    options: [
      {
        name: ["-d", "--dry-run"],
        description: "Show the files that would be pushed without pushing",
      },
    ],
  },
  {
    name: "standalone-file",
    description: "Transfer adapter for file:// remotes",
    hidden: true,
  },
  {
    name: "clone",
    description: "Clone a repository and fetch its LFS files in bulk",
    hidden: true,
    deprecated: {
      description: "Use git clone, which is now as fast",
    },
    args: [
      { name: "repository" },
      { name: "directory", isOptional: true, template: "folders" },
    ],
    options: cloneOptions,
  },
];

// The help template walks the spec tree from the root, so under `git lfs`,
// where this spec is loaded into git's, it would find no commands
const helpCommand: Fig.Subcommand = {
  name: "help",
  description: "Show help for a command or topic",
  args: {
    name: "command",
    isOptional: true,
    suggestions: [
      ...commands
        .filter(({ hidden }) => !hidden)
        .map(({ name, description }) => ({ name, description })),
      { name: "config", description: "Git LFS configuration options" },
      { name: "faq", description: "Frequently asked questions" },
    ],
  },
};

const completionSpec: Fig.Spec = {
  name: "git-lfs",
  description: "Manage large files with Git Large File Storage",
  options: [
    {
      name: ["-h", "--help"],
      description: "Show help for git-lfs or a command",
      isPersistent: true,
    },
    { name: ["-v", "--version"], description: "Print the Git LFS version" },
  ],
  subcommands: [...commands, helpCommand],
};

export default completionSpec;
