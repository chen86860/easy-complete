import { filepaths } from "@fig/autocomplete-generators";

interface LlmModel {
  model_id: string;
  aliases: string[];
  options?: Record<string, { description?: string }>;
}

// Models, tools and plugins only change when plugins are installed or
// removed, so they are cached. Templates, keys, aliases and the like change
// with every edit and are always read fresh.
const pluginCatalogCache: Fig.Cache = {
  strategy: "stale-while-revalidate",
  ttl: 1000 * 60 * 5,
};

// `llm ... --json` prints nothing to stdout when it exits with an error,
// for example when no log database exists yet.
const parseJson = <T>(out: string, empty: T): T =>
  out.trim() === "" ? empty : (JSON.parse(out) as T);

const modelSuggestions = (
  modelId: string,
  aliases: string[],
  kind: string,
): Fig.Suggestion[] => [
  {
    name: modelId,
    description:
      aliases.length > 0 ? `${kind} (aliases: ${aliases.join(", ")})` : kind,
  },
  ...aliases.map((alias) => ({
    name: alias,
    description: `Alias for ${modelId}`,
  })),
];

const modelsGenerator: Fig.Generator = {
  script: ["llm", "models", "list", "--json"],
  cache: pluginCatalogCache,
  postProcess: (out) =>
    parseJson<LlmModel[]>(out, []).flatMap((model) =>
      modelSuggestions(model.model_id, model.aliases, "Model"),
    ),
};

// `llm embed-models list` has no --json flag. Lines look like
// "OpenAIEmbeddingModel: text-embedding-3-small (aliases: 3-small)".
const embeddingModelsGenerator: Fig.Generator = {
  script: ["llm", "embed-models", "list"],
  cache: pluginCatalogCache,
  postProcess: (out) =>
    out.split("\n").flatMap((line) => {
      const match = line.match(/^[^:]+: (\S+)(?: \(aliases: (.+)\))?$/);
      if (!match) {
        return [];
      }
      const [, modelId, aliases] = match;
      return modelSuggestions(
        modelId,
        aliases ? aliases.split(", ") : [],
        "Embedding model",
      );
    }),
};

const parseModelOptions = (out: string): Fig.Suggestion[] =>
  parseJson<LlmModel[]>(out, []).flatMap((model) =>
    Object.entries(model.options ?? {}).map(([key, option]) => ({
      name: key,
      description: option.description,
    })),
  );

const modelOptionsCommand = (model: string | undefined): string[] =>
  model
    ? ["llm", "models", "list", "--options", "--json", "-m", model]
    : [
        "bash",
        "-c",
        'llm models list --options --json -m "$(llm models default)"',
      ];

const modelFromOptions = (tokens: string[]): string | undefined => {
  let model: string | undefined;
  for (let index = 0; index < tokens.length - 1; index++) {
    const token = tokens[index];
    if (token === "-m" || token === "--model") {
      model = tokens[index + 1];
    } else if (token.startsWith("--model=")) {
      model = token.slice("--model=".length);
    }
  }
  return model;
};

// Option keys for `-o`, from the model given with `-m`, or the default model
const promptModelOptionsGenerator: Fig.Generator = {
  script: (tokens) => modelOptionsCommand(modelFromOptions(tokens)),
  cache: pluginCatalogCache,
  postProcess: parseModelOptions,
};

// Option keys for `llm models options set|clear <model> <key>`
const positionalModelOptionsGenerator: Fig.Generator = {
  script: (tokens) => modelOptionsCommand(tokens[4]),
  cache: pluginCatalogCache,
  postProcess: parseModelOptions,
};

const aliasesGenerator: Fig.Generator = {
  script: ["llm", "aliases", "list", "--json"],
  postProcess: (out) =>
    Object.entries(parseJson<Record<string, string>>(out, {})).map(
      ([alias, modelId]) => ({
        name: alias,
        description: `Alias for ${modelId}`,
      }),
    ),
};

// Lines look like "name    : system: ... prompt: ..."
const templatesGenerator: Fig.Generator = {
  script: ["llm", "templates", "list"],
  postProcess: (out) =>
    out
      .split("\n")
      .filter((line) => line.includes(" : "))
      .map((line) => {
        const separator = line.indexOf(" : ");
        return {
          name: line.slice(0, separator).trim(),
          description: line.slice(separator + 3),
        };
      }),
};

// Loaders print "prefix:" followed by indented documentation
const parseLoaders = (out: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line, index, lines) => {
    const prefix = line.match(/^(\S+):$/)?.[1];
    if (!prefix) {
      return [];
    }
    return [
      {
        name: `${prefix}:`,
        description: lines[index + 1]?.trim() || "Loader",
      },
    ];
  });

const templateLoadersGenerator: Fig.Generator = {
  script: ["llm", "templates", "loaders"],
  cache: pluginCatalogCache,
  postProcess: parseLoaders,
};

const fragmentLoadersGenerator: Fig.Generator = {
  script: ["llm", "fragments", "loaders"],
  cache: pluginCatalogCache,
  postProcess: parseLoaders,
};

const keysGenerator: Fig.Generator = {
  script: ["llm", "keys", "list"],
  postProcess: (out) =>
    out
      .split("\n")
      .filter((line) => line !== "" && line !== "No keys found")
      .map((name) => ({ name, description: "Stored key" })),
};

const toolsGenerator: Fig.Generator = {
  script: ["llm", "tools", "list", "--json"],
  cache: pluginCatalogCache,
  postProcess: (out) => {
    const { tools = [], toolboxes = [] } = parseJson<{
      tools?: { name: string; description?: string }[];
      toolboxes?: { name: string }[];
    }>(out, {});
    return [
      ...tools.map((tool) => ({
        name: tool.name,
        description: tool.description?.split("\n")[0],
      })),
      ...toolboxes.map((toolbox) => ({
        name: toolbox.name,
        description: "Toolbox",
      })),
    ];
  },
};

// `llm fragments list` creates logs.db when it is missing, so check first
const fragmentsGenerator: Fig.Generator = {
  script: [
    "bash",
    "-c",
    '[ -f "$(llm logs path)" ] && llm fragments list --aliases --json',
  ],
  postProcess: (out) =>
    parseJson<{ aliases: string[]; source: string }[]>(out, []).flatMap(
      (fragment) =>
        fragment.aliases.map((alias) => ({
          name: alias,
          description: fragment.source,
        })),
    ),
};

const schemasGenerator: Fig.Generator = {
  script: ["llm", "schemas", "list", "--json"],
  postProcess: (out) =>
    parseJson<{ id: string; content: { properties?: object } }[]>(out, [])
      .reverse()
      .map((schema) => ({
        name: schema.id,
        description: Object.keys(schema.content.properties ?? {}).join(", "),
      })),
};

// `llm collections list` creates embeddings.db when it is missing
const collectionsGenerator: Fig.Generator = {
  script: [
    "bash",
    "-c",
    '[ -f "$(llm collections path)" ] && llm collections list --json',
  ],
  postProcess: (out) =>
    parseJson<{ name: string; model: string; num_embeddings: number }[]>(
      out,
      [],
    ).map((collection) => ({
      name: collection.name,
      description: `${collection.num_embeddings} embeddings, ${collection.model}`,
    })),
};

// `llm logs list` prints the latest responses oldest first. List each of their
// conversations once, newest first.
const conversationsGenerator: Fig.Generator = {
  script: ["llm", "logs", "list", "--json", "-n", "50"],
  postProcess: (out) => {
    const seen = new Set<string>();
    return parseJson<
      {
        conversation_id: string;
        conversation_name?: string;
        conversation_model?: string;
      }[]
    >(out, [])
      .reverse()
      .filter((entry) => {
        if (seen.has(entry.conversation_id)) {
          return false;
        }
        seen.add(entry.conversation_id);
        return true;
      })
      .map((entry) => ({
        name: entry.conversation_id,
        description: `${entry.conversation_name ?? ""} (${entry.conversation_model ?? "unknown model"})`,
      }));
  },
};

const pluginsGenerator: Fig.Generator = {
  script: ["llm", "plugins"],
  postProcess: (out) =>
    parseJson<{ name: string; version?: string }[]>(out, []).map((plugin) => ({
      name: plugin.name,
      description: plugin.version ? `Plugin ${plugin.version}` : "Plugin",
    })),
};

const endpointsGenerator: Fig.Generator = {
  script: ["llm", "openai", "endpoint", "list", "--json"],
  postProcess: (out) =>
    parseJson<{ model_id: string; api_base: string }[]>(out, []).map(
      (endpoint) => ({
        name: endpoint.model_id,
        description: endpoint.api_base,
      }),
    ),
};

const modelArg: Fig.Arg = {
  name: "model",
  generators: modelsGenerator,
  filterStrategy: "fuzzy",
};

const embeddingModelArg: Fig.Arg = {
  name: "model",
  generators: embeddingModelsGenerator,
  filterStrategy: "fuzzy",
};

const templateArg: Fig.Arg = {
  name: "template",
  generators: [
    templatesGenerator,
    templateLoadersGenerator,
    filepaths({ extensions: ["yaml", "yml"] }),
  ],
};

const fragmentArg: Fig.Arg = {
  name: "fragment",
  description: "Alias, URL, hash or file path",
  generators: [
    fragmentsGenerator,
    fragmentLoadersGenerator,
    { template: "filepaths" },
  ],
};

const schemaArg: Fig.Arg = {
  name: "schema",
  description: "Schema DSL, JSON schema, file path or ID",
  generators: [schemasGenerator, filepaths({ extensions: ["json"] })],
};

const keyOption: Fig.Option = {
  name: "--key",
  description: "API key or the name of a stored key",
  args: { name: "key", generators: keysGenerator },
};

const systemOption: Fig.Option = {
  name: ["-s", "--system"],
  description: "System prompt to use",
  args: { name: "system" },
};

const paramOption: Fig.Option = {
  name: ["-p", "--param"],
  description: "Parameters for template",
  isRepeatable: true,
  args: [{ name: "name" }, { name: "value" }],
};

const modelOptionOption: Fig.Option = {
  name: ["-o", "--option"],
  description: "Key/value options for the model",
  isRepeatable: true,
  args: [
    { name: "key", generators: promptModelOptionsGenerator },
    { name: "value" },
  ],
};

const logDatabaseOption: Fig.Option = {
  name: ["-d", "--database"],
  description: "Path to log database",
  args: { name: "path", template: "filepaths" },
};

const embeddingsDatabaseOption: Fig.Option = {
  name: ["-d", "--database"],
  description: "Path to embeddings database",
  args: { name: "path", template: "filepaths" },
};

const hiddenPathOption: Fig.Option = {
  name: ["-p", "--path"],
  description: "Path to log database",
  hidden: true,
  args: { name: "path", template: "filepaths" },
};

const noStreamOption: Fig.Option = {
  name: "--no-stream",
  description: "Do not stream output",
};

const hideReasoningOption: Fig.Option = {
  name: ["-R", "--hide-reasoning"],
  description: "Hide reasoning output",
};

const jsonOption: Fig.Option = {
  name: "--json",
  description: "Output as JSON",
};

const attachmentOptions: Fig.Option[] = [
  {
    name: ["-a", "--attachment"],
    description: "Attachment path or URL or -",
    isRepeatable: true,
    args: { name: "attachment", template: "filepaths" },
  },
  {
    name: ["--at", "--attachment-type"],
    description: "Attachment with explicit mimetype",
    isRepeatable: true,
    args: [{ name: "path", template: "filepaths" }, { name: "mimetype" }],
  },
];

const functionsOption: Fig.Option = {
  name: "--functions",
  description:
    "Python code block or file path defining functions to register as tools",
  isRepeatable: true,
  args: { name: "code", generators: filepaths({ extensions: ["py"] }) },
};

const toolOptions: Fig.Option[] = [
  {
    name: ["-T", "--tool"],
    description: "Name of a tool to make available to the model",
    isRepeatable: true,
    args: { name: "tool", generators: toolsGenerator },
  },
  functionsOption,
  {
    name: ["--td", "--tools-debug"],
    description: "Show full details of tool executions",
  },
  {
    name: ["--ta", "--tools-approve"],
    description: "Manually approve every tool execution",
  },
  {
    name: ["--cl", "--chain-limit"],
    description:
      "How many chained tool responses to allow, default 5, set 0 for unlimited",
    args: { name: "limit" },
  },
];

const fragmentOptions: Fig.Option[] = [
  {
    name: ["-f", "--fragment"],
    description:
      "Fragment (alias, URL, hash or file path) to add to the prompt",
    isRepeatable: true,
    args: fragmentArg,
  },
  {
    name: ["--sf", "--system-fragment"],
    description: "Fragment to add to system prompt",
    isRepeatable: true,
    args: fragmentArg,
  },
];

const continueOptions: Fig.Option[] = [
  {
    name: ["-c", "--continue"],
    description: "Continue the most recent conversation",
  },
  {
    name: ["--cid", "--conversation"],
    description: "Continue the conversation with the given ID",
    args: { name: "id", generators: conversationsGenerator },
  },
];

const extractOptions: Fig.Option[] = [
  { name: ["-x", "--extract"], description: "Extract first fenced code block" },
  {
    name: ["--xl", "--extract-last"],
    description: "Extract last fenced code block",
  },
];

const modelOption: Fig.Option = {
  name: ["-m", "--model"],
  description: "Model to use",
  args: modelArg,
};

const promptArg: Fig.Arg = {
  name: "prompt",
  isOptional: true,
};

const promptOptions: Fig.Option[] = [
  systemOption,
  modelOption,
  logDatabaseOption,
  {
    name: ["-q", "--query"],
    description: "Use first model matching these strings",
    isRepeatable: true,
    args: { name: "query" },
  },
  ...attachmentOptions,
  ...toolOptions,
  modelOptionOption,
  {
    name: "--options",
    description: "Show options for the selected model",
  },
  {
    name: "--schema",
    description: "Schema DSL, JSON schema, filepath or ID",
    args: schemaArg,
  },
  {
    name: "--schema-multi",
    description: "Schema for multiple results",
    args: schemaArg,
  },
  ...fragmentOptions,
  {
    name: ["-t", "--template"],
    description: "Template to use; can be repeated to combine templates",
    isRepeatable: true,
    args: templateArg,
  },
  paramOption,
  noStreamOption,
  { name: ["-n", "--no-log"], description: "Don't log to database" },
  { name: "--log", description: "Log prompt and response to the database" },
  hideReasoningOption,
  ...continueOptions,
  keyOption,
  {
    name: "--save",
    description: "Save prompt with this template name",
    args: { name: "template" },
  },
  { name: "--async", description: "Run prompt asynchronously" },
  { name: ["-u", "--usage"], description: "Show token usage" },
  ...extractOptions,
  {
    name: "--json",
    description: "Output the response as JSON, same format as llm logs --json",
  },
];

const chatOptions: Fig.Option[] = [
  systemOption,
  modelOption,
  ...continueOptions,
  ...fragmentOptions,
  {
    name: ["-t", "--template"],
    description: "Template to use",
    args: templateArg,
  },
  paramOption,
  modelOptionOption,
  logDatabaseOption,
  noStreamOption,
  hideReasoningOption,
  {
    name: ["-u", "--usage"],
    description: "Show token usage after each chat turn",
  },
  keyOption,
  ...toolOptions,
];

const logsList: Fig.Subcommand = {
  name: "list",
  description: "Show logged prompts and their responses",
  options: [
    {
      name: ["-n", "--count"],
      description: "Number of entries to show - defaults to 3, use 0 for all",
      args: { name: "count" },
    },
    hiddenPathOption,
    logDatabaseOption,
    {
      name: ["-m", "--model"],
      description: "Filter by model or model alias",
      args: modelArg,
    },
    {
      name: ["-q", "--query"],
      description: "Search for logs matching this string",
      args: { name: "query" },
    },
    {
      name: ["-f", "--fragment"],
      description: "Filter for prompts using these fragments",
      isRepeatable: true,
      args: fragmentArg,
    },
    {
      name: ["-T", "--tool"],
      description: "Filter for prompts with results from these tools",
      isRepeatable: true,
      args: { name: "tool", generators: toolsGenerator },
    },
    {
      name: "--tools",
      description: "Filter for prompts with results from any tools",
    },
    {
      name: "--schema",
      description: "Filter for responses using this schema",
      args: schemaArg,
    },
    {
      name: "--schema-multi",
      description:
        "Filter for responses using this schema for multiple results",
      args: schemaArg,
    },
    {
      name: ["-l", "--latest"],
      description: "Return latest results matching search query",
    },
    {
      name: "--data",
      description: "Output newline-delimited JSON data for schema",
    },
    {
      name: "--data-array",
      description: "Output JSON array of data for schema",
    },
    {
      name: "--data-key",
      description: "Return JSON objects from array in this key",
      args: { name: "key" },
    },
    {
      name: "--data-ids",
      description: "Attach corresponding IDs to JSON objects",
    },
    {
      name: ["-t", "--truncate"],
      description: "Truncate long strings in output",
    },
    {
      name: ["-s", "--short"],
      description: "Shorter YAML output with truncated prompts",
    },
    { name: ["-u", "--usage"], description: "Include token usage" },
    {
      name: ["-r", "--response"],
      description: "Just output the last response",
    },
    ...extractOptions,
    {
      name: ["-c", "--current"],
      description: "Show logs from the current conversation",
    },
    {
      name: ["--cid", "--conversation"],
      description: "Show logs for this conversation ID",
      args: { name: "id", generators: conversationsGenerator },
    },
    {
      name: "--id-gt",
      description: "Return responses with ID > this",
      args: { name: "id" },
    },
    {
      name: "--id-gte",
      description: "Return responses with ID >= this",
      args: { name: "id" },
    },
    { name: "--json", description: "Output logs as JSON" },
    {
      name: ["-e", "--expand"],
      description: "Expand fragments to show their content",
    },
  ],
};

const modelsList: Fig.Subcommand = {
  name: "list",
  description: "List available models",
  options: [
    {
      name: "--options",
      description: "Show options for each model, if available",
    },
    { name: "--async", description: "List async models" },
    { name: "--schemas", description: "List models that support schemas" },
    { name: "--tools", description: "List models that support tools" },
    jsonOption,
    {
      name: ["-q", "--query"],
      description: "Search for models matching these strings",
      isRepeatable: true,
      args: { name: "query" },
    },
    {
      name: ["-m", "--model"],
      description: "Specific model IDs",
      isRepeatable: true,
      args: modelArg,
    },
  ],
};

const schemasList: Fig.Subcommand = {
  name: "list",
  description: "List stored schemas",
  options: [
    hiddenPathOption,
    logDatabaseOption,
    {
      name: ["-q", "--query"],
      description: "Search for schemas matching this string",
      isRepeatable: true,
      args: { name: "query" },
    },
    { name: "--full", description: "Output full schema contents" },
    jsonOption,
    { name: "--nl", description: "Output as newline-delimited JSON" },
  ],
};

const toolsList: Fig.Subcommand = {
  name: "list",
  description:
    "List available tools, optionally including tools supported by a model",
  args: {
    name: "tool",
    isOptional: true,
    isVariadic: true,
    generators: toolsGenerator,
  },
  options: [
    jsonOption,
    {
      name: ["-m", "--model"],
      description: "List tools supported by this model",
      args: modelArg,
    },
    functionsOption,
  ],
};

const aliasesList: Fig.Subcommand = {
  name: "list",
  description: "List current aliases",
  options: [jsonOption],
};

const fragmentsList: Fig.Subcommand = {
  name: "list",
  description: "List current fragments",
  options: [
    {
      name: ["-q", "--query"],
      description: "Search for fragments matching these strings",
      isRepeatable: true,
      args: { name: "query" },
    },
    { name: "--aliases", description: "Show only fragments with aliases" },
    jsonOption,
  ],
};

const embedModelsList: Fig.Subcommand = {
  name: "list",
  description: "List available embedding models",
  options: [
    {
      name: ["-q", "--query"],
      description: "Search for embedding models matching these strings",
      isRepeatable: true,
      args: { name: "query" },
    },
  ],
};

const collectionsList: Fig.Subcommand = {
  name: "list",
  description: "View a list of collections",
  options: [embeddingsDatabaseOption, jsonOption],
};

const endpointPromptArgs: Fig.Arg[] = [
  { name: "url", description: "Base URL of the OpenAI-compatible API" },
  promptArg,
];

const endpointPromptOptions: Fig.Option[] = [
  {
    name: ["-m", "--model"],
    description: "Model ID (required unless --models or provided by template)",
    args: { name: "model" },
  },
  systemOption,
  {
    name: ["-t", "--template"],
    description: "Template to use",
    args: templateArg,
  },
  paramOption,
  {
    name: ["-o", "--option"],
    description: "Key/value options for the model",
    isRepeatable: true,
    args: [{ name: "key" }, { name: "value" }],
  },
  {
    name: "--schema",
    description: "Schema DSL, JSON schema, filepath or ID",
    args: schemaArg,
  },
  {
    name: "--schema-multi",
    description: "JSON schema to use for multiple results",
    args: schemaArg,
  },
  ...attachmentOptions,
  ...toolOptions,
  {
    name: "--key",
    description: "API key or stored key alias to send",
    args: { name: "key", generators: keysGenerator },
  },
  {
    name: ["-H", "--header"],
    description: "Additional HTTP header",
    isRepeatable: true,
    args: [{ name: "name" }, { name: "value" }],
  },
  {
    name: "--responses",
    description: "Use the Responses API instead of Chat Completions",
  },
  { name: "--chat", description: "Start an interactive chat" },
  {
    name: "--models",
    description: "List model IDs from the endpoint and exit",
  },
  noStreamOption,
  hideReasoningOption,
];

const completionSpec: Fig.Spec = {
  name: "llm",
  description: "Access Large Language Models from the command-line",
  args: promptArg,
  options: [
    {
      name: ["-h", "--help"],
      description: "Show help for llm",
      isPersistent: true,
    },
    { name: "--version", description: "Show the version and exit" },
    ...promptOptions,
  ],
  subcommands: [
    {
      name: "prompt",
      description: "Execute a prompt",
      args: promptArg,
      options: promptOptions,
    },
    {
      name: "chat",
      description: "Hold an ongoing chat with a model",
      options: chatOptions,
    },
    {
      name: "keys",
      description: "Manage stored API keys for different models",
      subcommands: [
        { name: "list", description: "List names of all stored keys" },
        {
          name: "path",
          description: "Output the path to the keys.json file",
        },
        {
          name: "get",
          description: "Return the value of a stored key",
          args: { name: "name", generators: keysGenerator },
        },
        {
          name: "set",
          description: "Save a key in the keys.json file",
          args: { name: "name", generators: keysGenerator },
          options: [
            {
              name: "--value",
              description: "Value to set",
              args: { name: "value" },
            },
          ],
        },
      ],
    },
    {
      name: "logs",
      description: "Tools for exploring logged prompts and responses",
      options: logsList.options,
      subcommands: [
        { name: "path", description: "Output the path to the logs.db file" },
        {
          name: "status",
          description: "Show current status of database logging",
        },
        {
          name: "backup",
          description: "Backup your logs database to this file",
          args: { name: "path", template: "filepaths" },
        },
        { name: "on", description: "Turn on logging for all prompts" },
        { name: "off", description: "Turn off logging for all prompts" },
        logsList,
      ],
    },
    {
      name: "models",
      description: "Manage available models",
      options: modelsList.options,
      subcommands: [
        modelsList,
        {
          name: "default",
          description: "Show or set the default model",
          args: { ...modelArg, isOptional: true },
        },
        {
          name: "options",
          description: "Manage default options for models",
          subcommands: [
            {
              name: "list",
              description: "List default options for all models",
            },
            {
              name: "show",
              description: "List default options set for a specific model",
              args: modelArg,
            },
            {
              name: "set",
              description: "Set a default option for a model",
              args: [
                modelArg,
                {
                  name: "key",
                  generators: positionalModelOptionsGenerator,
                },
                { name: "value" },
              ],
            },
            {
              name: "clear",
              description: "Clear default option(s) for a model",
              args: [
                modelArg,
                {
                  name: "key",
                  isOptional: true,
                  generators: positionalModelOptionsGenerator,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "templates",
      description: "Manage stored prompt templates",
      subcommands: [
        { name: "list", description: "List available prompt templates" },
        {
          name: "show",
          description: "Show the specified prompt template",
          args: { name: "name", generators: templatesGenerator },
        },
        {
          name: "edit",
          description:
            "Edit the specified prompt template using the default $EDITOR",
          args: { name: "name", generators: templatesGenerator },
        },
        {
          name: "path",
          description: "Output the path to the templates directory",
        },
        {
          name: "loaders",
          description: "Show template loaders registered by plugins",
        },
      ],
    },
    {
      name: "schemas",
      description: "Manage stored schemas",
      options: schemasList.options,
      subcommands: [
        schemasList,
        {
          name: "show",
          description: "Show a stored schema",
          args: { name: "schema_id", generators: schemasGenerator },
          options: [hiddenPathOption, logDatabaseOption],
        },
        {
          name: "dsl",
          description: "Convert LLM's schema DSL to a JSON schema",
          args: { name: "input" },
          options: [{ name: "--multi", description: "Wrap in an array" }],
        },
      ],
    },
    {
      name: "tools",
      description: "Manage tools that can be made available to LLMs",
      args: toolsList.args,
      options: toolsList.options,
      subcommands: [toolsList],
    },
    {
      name: "aliases",
      description: "Manage model aliases",
      options: aliasesList.options,
      subcommands: [
        aliasesList,
        {
          name: "set",
          description: "Set an alias for a model",
          args: [
            { name: "alias" },
            {
              name: "model_id",
              isOptional: true,
              generators: [modelsGenerator, embeddingModelsGenerator],
              filterStrategy: "fuzzy",
            },
          ],
          options: [
            {
              name: ["-q", "--query"],
              description: "Set alias for model matching these strings",
              isRepeatable: true,
              args: { name: "query" },
            },
          ],
        },
        {
          name: "remove",
          description: "Remove an alias",
          args: { name: "alias", generators: aliasesGenerator },
        },
        {
          name: "path",
          description: "Output the path to the aliases.json file",
        },
      ],
    },
    {
      name: "fragments",
      description: "Manage fragments that are stored in the database",
      options: fragmentsList.options,
      subcommands: [
        fragmentsList,
        {
          name: "set",
          description: "Set an alias for a fragment",
          args: [
            { name: "alias" },
            {
              name: "fragment",
              description: "URL, hash or file path",
              generators: [fragmentLoadersGenerator, { template: "filepaths" }],
            },
          ],
        },
        {
          name: "show",
          description: "Display the fragment stored under an alias or hash",
          args: { name: "alias_or_hash", generators: fragmentsGenerator },
        },
        {
          name: "remove",
          description: "Remove a fragment alias",
          args: { name: "alias", generators: fragmentsGenerator },
        },
        {
          name: "loaders",
          description: "Show fragment loaders registered by plugins",
        },
      ],
    },
    {
      name: "plugins",
      description: "List installed plugins",
      options: [
        { name: "--all", description: "Include built-in default plugins" },
        {
          name: "--hook",
          description: "Filter for plugins that implement this hook",
          isRepeatable: true,
          args: {
            name: "hook",
            suggestions: [
              "register_commands",
              "register_models",
              "register_embedding_models",
              "register_template_loaders",
              "register_fragment_loaders",
              "register_tools",
            ],
          },
        },
      ],
    },
    {
      name: "install",
      description:
        "Install packages from PyPI into the same environment as LLM",
      args: { name: "packages", isOptional: true, isVariadic: true },
      options: [
        {
          name: ["-U", "--upgrade"],
          description: "Upgrade packages to latest version",
        },
        {
          name: ["-e", "--editable"],
          description: "Install a project in editable mode from this path",
          args: { name: "path", template: "folders" },
        },
        {
          name: "--force-reinstall",
          description:
            "Reinstall all packages even if they are already up-to-date",
        },
        { name: "--no-cache-dir", description: "Disable the cache" },
        {
          name: "--pre",
          description: "Include pre-release and development versions",
        },
      ],
    },
    {
      name: "uninstall",
      description: "Uninstall Python packages from the LLM environment",
      args: {
        name: "packages",
        isVariadic: true,
        generators: pluginsGenerator,
      },
      options: [
        { name: ["-y", "--yes"], description: "Don't ask for confirmation" },
      ],
    },
    {
      name: "embed",
      description: "Embed text and store or return the result",
      args: [
        {
          name: "collection",
          isOptional: true,
          generators: collectionsGenerator,
        },
        { name: "id", isOptional: true },
      ],
      options: [
        {
          name: ["-i", "--input"],
          description: "File to embed",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: ["-m", "--model"],
          description: "Embedding model to use",
          args: embeddingModelArg,
        },
        keyOption,
        {
          name: "--store",
          description: "Store the text itself in the database",
        },
        embeddingsDatabaseOption,
        {
          name: ["-c", "--content"],
          description: "Content to embed",
          args: { name: "content" },
        },
        { name: "--binary", description: "Treat input as binary data" },
        ...attachmentOptions,
        {
          name: "--metadata",
          description: "JSON object metadata to store",
          args: { name: "json" },
        },
        {
          name: ["-f", "--format"],
          description: "Output format",
          args: {
            name: "format",
            suggestions: ["json", "blob", "base64", "hex"],
          },
        },
      ],
    },
    {
      name: "embed-multi",
      description:
        "Store embeddings for multiple strings at once in the specified collection",
      args: [
        { name: "collection", generators: collectionsGenerator },
        { name: "input_path", isOptional: true, template: "filepaths" },
      ],
      options: [
        {
          name: "--format",
          description: "Format of input file - defaults to auto-detect",
          args: { name: "format", suggestions: ["json", "csv", "tsv", "nl"] },
        },
        {
          name: "--files",
          description:
            "Embed files in this directory - specify directory and glob pattern",
          isRepeatable: true,
          args: [{ name: "directory", template: "folders" }, { name: "glob" }],
        },
        ...attachmentOptions,
        {
          name: "--encoding",
          description: "Encodings to try when reading --files",
          isRepeatable: true,
          args: { name: "encoding" },
        },
        { name: "--binary", description: "Treat --files as binary data" },
        {
          name: "--sql",
          description: "Read input using this SQL query",
          args: { name: "sql" },
        },
        {
          name: "--attach",
          description:
            "Additional databases to attach - specify alias and file path",
          isRepeatable: true,
          args: [{ name: "alias" }, { name: "path", template: "filepaths" }],
        },
        {
          name: "--batch-size",
          description: "Batch size to use when running embeddings",
          args: { name: "size" },
        },
        {
          name: "--prefix",
          description: "Prefix to add to the IDs",
          args: { name: "prefix" },
        },
        {
          name: ["-m", "--model"],
          description: "Embedding model to use",
          args: embeddingModelArg,
        },
        keyOption,
        {
          name: "--prepend",
          description: "Prepend this string to all content before embedding",
          args: { name: "text" },
        },
        {
          name: "--store",
          description: "Store the text itself in the database",
        },
        embeddingsDatabaseOption,
      ],
    },
    {
      name: "similar",
      description:
        "Return top N similar IDs from a collection using cosine similarity",
      args: [
        { name: "collection", generators: collectionsGenerator },
        { name: "id", isOptional: true },
      ],
      options: [
        {
          name: ["-i", "--input"],
          description: "File to embed for comparison",
          args: { name: "path", template: "filepaths" },
        },
        {
          name: ["-c", "--content"],
          description: "Content to embed for comparison",
          args: { name: "content" },
        },
        { name: "--binary", description: "Treat input as binary data" },
        ...attachmentOptions,
        {
          name: ["-n", "--number"],
          description: "Number of results to return",
          args: { name: "number" },
        },
        { name: ["-p", "--plain"], description: "Output in plain text format" },
        embeddingsDatabaseOption,
        {
          name: "--prefix",
          description: "Just IDs with this prefix",
          args: { name: "prefix" },
        },
      ],
    },
    {
      name: "embed-models",
      description: "Manage available embedding models",
      options: embedModelsList.options,
      subcommands: [
        embedModelsList,
        {
          name: "default",
          description: "Show or set the default embedding model",
          args: { ...embeddingModelArg, isOptional: true },
          options: [
            {
              name: "--remove-default",
              description: "Reset to specifying no default model",
            },
          ],
        },
      ],
    },
    {
      name: "collections",
      description: "View and manage collections of embeddings",
      options: collectionsList.options,
      subcommands: [
        {
          name: "path",
          description: "Output the path to the embeddings database",
        },
        collectionsList,
        {
          name: "delete",
          description: "Delete the specified collection",
          args: {
            name: "collection",
            isDangerous: true,
            generators: collectionsGenerator,
          },
          options: [embeddingsDatabaseOption],
        },
      ],
    },
    {
      name: "openai",
      description:
        "Commands for working with OpenAI and OpenAI-compatible APIs",
      subcommands: [
        {
          name: "endpoint",
          description: "Work with OpenAI-compatible endpoints",
          args: endpointPromptArgs,
          options: endpointPromptOptions,
          subcommands: [
            {
              name: "prompt",
              description:
                "Run against an OpenAI-compatible endpoint without logging",
              args: endpointPromptArgs,
              options: endpointPromptOptions,
            },
            {
              name: "add",
              description:
                "Save an OpenAI-compatible endpoint to extra-openai-models.yaml",
              args: {
                name: "url",
                description: "Base URL of the OpenAI-compatible API",
              },
              options: [
                {
                  name: ["-m", "--model"],
                  description: "Model name to send to the API",
                  isRequired: true,
                  args: { name: "model" },
                },
                {
                  name: "--id",
                  description:
                    "Model ID to use with LLM, defaults to the model name",
                  args: { name: "id" },
                },
                {
                  name: "--alias",
                  description:
                    "Alias for the model, can be used multiple times",
                  isRepeatable: true,
                  args: { name: "alias" },
                },
                {
                  name: "--key",
                  description: "Name of a stored key to send to the endpoint",
                  args: { name: "key", generators: keysGenerator },
                },
                {
                  name: ["-H", "--header"],
                  description: "Additional HTTP header",
                  isRepeatable: true,
                  args: [{ name: "name" }, { name: "value" }],
                },
                {
                  name: "--responses",
                  description:
                    "Use the Responses API instead of Chat Completions",
                },
                {
                  name: "--completion",
                  description: "Use the Completions API",
                },
                {
                  name: "--supports-tools",
                  description: "Model supports tool calling",
                },
                {
                  name: "--supports-schema",
                  description: "Model supports JSON schema output",
                },
                {
                  name: "--vision",
                  description: "Model accepts image attachments",
                },
                {
                  name: "--audio",
                  description: "Model accepts audio attachments",
                },
                {
                  name: "--reasoning",
                  description: "Model is a reasoning model",
                },
                {
                  name: "--service-tier",
                  description: "Model supports the service_tier option",
                },
                {
                  name: "--no-stream",
                  description: "Model cannot stream responses",
                },
                {
                  name: "--api-type",
                  description: "Azure OpenAI api_type",
                  args: { name: "type" },
                },
                {
                  name: "--api-version",
                  description: "Azure OpenAI api_version",
                  args: { name: "version" },
                },
                {
                  name: "--api-engine",
                  description: "Azure OpenAI api_engine",
                  args: { name: "engine" },
                },
                {
                  name: "--replace",
                  description:
                    "Replace an existing record with the same model ID",
                },
              ],
            },
            {
              name: "list",
              description: "List endpoints saved in extra-openai-models.yaml",
              options: [jsonOption],
            },
            {
              name: "remove",
              description:
                "Remove a saved endpoint from extra-openai-models.yaml",
              args: { name: "model_id", generators: endpointsGenerator },
            },
            {
              name: "path",
              description:
                "Output the path to the extra-openai-models.yaml file",
            },
          ],
        },
        {
          name: "models",
          description: "List models available to you from the OpenAI API",
          options: [jsonOption, keyOption],
        },
      ],
    },
  ],
};

export default completionSpec;
