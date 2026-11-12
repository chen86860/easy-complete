// exiftool's tag, group, language and API option lists change with every
// release, so they come from the installed exiftool. The command-line options
// themselves have only grown by a handful since 12.00, so the spec is not
// versioned.
const exiftoolCatalogCache: Fig.Cache = {
  strategy: "stale-while-revalidate",
  ttl: 1000 * 60 * 60,
};

// `exiftool -list...` output: a "Heading:" line, then indented words
const parseListSections = (out: string): Map<string, string[]> => {
  const sections = new Map<string, string[]>();
  let words: string[] = [];
  for (const line of out.split("\n")) {
    if (/^\S.*:$/.test(line)) {
      words = [];
      sections.set(line.slice(0, -1), words);
    } else {
      words.push(...line.trim().split(/\s+/).filter(Boolean));
    }
  }
  return sections;
};

const listedWords = (out: string): string[] =>
  [...parseListSections(out).values()].flat();

const tagsGenerator: Fig.Generator = {
  script: ["exiftool", "-list"],
  cache: exiftoolCatalogCache,
  postProcess: (out) =>
    listedWords(out).map((tag) => ({ name: tag, description: "Tag" })),
};

const extensionsGenerator: Fig.Generator = {
  script: ["exiftool", "-listf"],
  cache: exiftoolCatalogCache,
  postProcess: (out) =>
    listedWords(out).map((extension) => ({
      name: extension.toLowerCase(),
      description: "Supported file extension",
    })),
};

// Lines look like "  de - German (Deutsch)" or "  Binary   - flag to ..."
const parseNameDescriptionLines = (out: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^\s+(\S+)\s+-\s+(.*)$/);
    return match ? [{ name: match[1], description: match[2] }] : [];
  });

const languagesGenerator: Fig.Generator = {
  script: ["exiftool", "-lang"],
  cache: exiftoolCatalogCache,
  postProcess: parseNameDescriptionLines,
};

// `exiftool -api` lists the API options since 12.65. Older versions print
// nothing, which leaves the argument free-form.
const apiOptionsGenerator: Fig.Generator = {
  script: ["exiftool", "-api"],
  cache: exiftoolCatalogCache,
  postProcess: parseNameDescriptionLines,
};

const charsetsGenerator: Fig.Generator = {
  script: ["exiftool", "-charset"],
  cache: exiftoolCatalogCache,
  postProcess: (out) =>
    listedWords(out).map((charset) => ({
      name: charset,
      description: "Character set",
    })),
};

const charsetTypes: Fig.Suggestion[] = [
  { name: "FileName=", description: "Encoding of file names" },
  { name: "EXIF=", description: 'Internal encoding of EXIF "ASCII" strings' },
  { name: "ID3=", description: "Internal encoding of ID3v1 information" },
  { name: "IPTC=", description: "Internal IPTC encoding" },
  { name: "Photoshop=", description: "Internal encoding of Photoshop IRB" },
  { name: "QuickTime=", description: "Internal encoding of QuickTime strings" },
  { name: "RIFF=", description: "Internal encoding of RIFF strings" },
].map((suggestion) => ({ ...suggestion, priority: 40 }));

const options: Fig.Option[] = [
  // Tag operations
  {
    name: "-tagsFromFile",
    description: "Copy tag values from file",
    isRepeatable: true,
    args: {
      name: "SRCFILE",
      suggestions: [{ name: "@", description: "The file being processed" }],
      template: "filepaths",
    },
  },
  {
    name: ["-x", "-exclude"],
    description: "Exclude specified tag",
    isRepeatable: true,
    args: { name: "TAG", generators: tagsGenerator },
  },

  // Input-output text formatting
  {
    name: ["-args", "-argFormat"],
    description: "Format metadata as exiftool arguments",
  },
  {
    name: ["-b", "-binary"],
    description: "Output metadata in binary format",
  },
  {
    name: ["--b", "--binary"],
    description: "Suppress tags containing binary data",
  },
  {
    name: ["-c", "-coordFormat"],
    description: "Set format for GPS coordinates",
    args: { name: "FMT" },
  },
  {
    name: "-charset",
    description: "Specify encoding for special characters",
    isRepeatable: true,
    args: {
      name: "[TYPE=]CHARSET",
      isOptional: true,
      suggestions: charsetTypes,
      generators: charsetsGenerator,
    },
  },
  {
    name: "-csv",
    description: "Export/import tags in CSV format",
    requiresSeparator: true,
    args: { name: "CSVFILE", isOptional: true, template: "filepaths" },
  },
  {
    name: "-csvDelim",
    description: "Set delimiter for CSV file",
    args: { name: "STR" },
  },
  {
    name: ["-d", "-dateFormat"],
    description: "Set format for date/time values",
    args: {
      name: "FMT",
      suggestions: [
        {
          name: "%Y%m%d_%H%M%S%%-c.%%e",
          description: "Rename by date, adding a copy number on clashes",
        },
        { name: "%Y/%m/%d", description: "Move into year/month/day folders" },
        { name: "%Y%m%d", description: "Date only" },
      ],
    },
  },
  {
    name: ["-D", "-decimal"],
    description: "Show tag ID numbers in decimal",
  },
  {
    name: ["-E", "-escapeHTML"],
    description: "Escape tag values for HTML",
  },
  {
    name: ["-ex", "-escapeXML"],
    description: "Escape tag values for XML",
  },
  {
    name: ["-ec", "-escapeC"],
    description: "Escape tag values for C",
  },
  {
    name: ["-f", "-forcePrint"],
    description: "Force printing of all specified tags",
  },
  {
    name: ["-g", "-groupHeadings"],
    description: "Organize output by tag group (-g1 for family 1)",
  },
  {
    name: ["-G", "-groupNames"],
    description: "Print group name for each tag (-G1 for family 1)",
  },
  {
    name: ["-h", "-htmlFormat"],
    description: "Use HTML formatting for output",
  },
  {
    name: ["-H", "-hex"],
    description: "Show tag ID numbers in hexadecimal",
  },
  {
    name: "-htmlDump",
    description: "Generate HTML-format binary dump",
  },
  {
    name: ["-j", "-json"],
    description: "Export/import tags in JSON format",
    requiresSeparator: true,
    args: { name: "JSONFILE", isOptional: true, template: "filepaths" },
  },
  {
    name: ["-l", "-long"],
    description: "Use long 2-line output format",
  },
  {
    name: ["-L", "-latin"],
    description: "Use Windows Latin1 encoding",
  },
  {
    name: "-lang",
    description: "Set current language",
    args: { name: "LANG", isOptional: true, generators: languagesGenerator },
  },
  {
    name: "-listItem",
    description: "Extract specific item from a list",
    args: { name: "INDEX" },
  },
  {
    name: ["-n", "--printConv"],
    description: "No print conversion",
  },
  {
    name: ["-p", "-printFormat"],
    description: "Print output in specified format",
    isRepeatable: true,
    args: { name: "STR or FMTFILE", template: "filepaths" },
  },
  {
    name: ["-p-", "-printFormat-"],
    description: "Print output in specified format, without a final newline",
    isRepeatable: true,
    args: { name: "STR or FMTFILE", template: "filepaths" },
  },
  {
    name: "-php",
    description: "Export tags as a PHP Array",
  },
  {
    name: "-plot",
    description: "Output tags as SVG plot file",
  },
  {
    name: ["-s", "-short"],
    description: "Short output format (-s for tag names)",
  },
  {
    name: ["-S", "-veryShort"],
    description: "Very short output format",
  },
  {
    name: ["-sep", "-separator"],
    description: "Set separator string for list items",
    args: { name: "STR" },
  },
  {
    name: "-sort",
    description: "Sort output alphabetically",
  },
  {
    name: "--sort",
    description: "Disable grouping of output with -g or -G",
  },
  {
    name: "-struct",
    description: "Enable output of structured information",
  },
  {
    name: "--struct",
    description: "Disable copying of structured tags",
  },
  {
    name: ["-t", "-tab"],
    description: "Output in tab-delimited list format",
  },
  {
    name: ["-T", "-table"],
    description: "Output in tabular format",
  },
  {
    name: ["-v", "-verbose"],
    description: "Print verbose messages (-v0 to -v5)",
  },
  {
    name: ["-w", "-textOut"],
    description: "Write output text files",
    args: { name: "EXT or FMT" },
  },
  {
    name: ["-w!", "-textOut!"],
    description: "Write output text files, overwriting existing ones",
    args: { name: "EXT or FMT" },
  },
  {
    name: ["-w+", "-textOut+"],
    description: "Write output text files, appending to existing ones",
    args: { name: "EXT or FMT" },
  },
  {
    name: ["-w+!", "-textOut+!"],
    description: "Overwrite files that existed before the command, then append",
    args: { name: "EXT or FMT" },
  },
  {
    name: ["-W", "-tagOut"],
    description: "Write output text file for each tag",
    args: { name: "FMT" },
  },
  {
    name: ["-W!", "-tagOut!"],
    description: "Write a text file for each tag, overwriting existing ones",
    args: { name: "FMT" },
  },
  {
    name: ["-W+", "-tagOut+"],
    description: "Write a text file for each tag, appending to existing ones",
    args: { name: "FMT" },
  },
  {
    name: ["-W+!", "-tagOut+!"],
    description:
      "Overwrite tag files that existed before the command, then append",
    args: { name: "FMT" },
  },
  {
    name: ["-Wext", "-tagOutExt"],
    description: "Write only specified file types with -W",
    isRepeatable: true,
    args: { name: "EXT" },
  },
  {
    name: "--Wext",
    description: "Do not write specified file types with -W",
    isRepeatable: true,
    args: { name: "EXT" },
  },
  {
    name: ["-X", "-xmlFormat"],
    description: "Use RDF/XML output format",
  },

  // Processing control
  {
    name: ["-a", "-duplicates"],
    description: "Allow duplicate tags to be extracted",
  },
  {
    name: ["--a", "--duplicates"],
    description: "Suppress duplicate tags",
  },
  {
    name: ["-e", "--composite"],
    description: "Do not generate composite tags",
  },
  {
    name: ["-ee", "-extractEmbedded"],
    description: "Extract information from embedded files (-ee2, -ee3)",
  },
  {
    name: ["-ext", "-extension"],
    description: "Process files with specified extension",
    isRepeatable: true,
    args: { name: "EXT", generators: extensionsGenerator },
  },
  {
    name: ["-ext+", "-extension+"],
    description: "Process files with specified extension, and the defaults",
    isRepeatable: true,
    args: { name: "EXT", generators: extensionsGenerator },
  },
  {
    name: "--ext",
    description: "Do not process files with specified extension",
    isRepeatable: true,
    args: { name: "EXT", generators: extensionsGenerator },
  },
  {
    name: ["-F", "-fixBase"],
    description: "Fix the base for maker notes offsets",
  },
  {
    name: "-fast",
    description: "Increase speed when extracting metadata (-fast2 to -fast5)",
  },
  {
    name: "-fileOrder",
    description: "Set file processing order",
    isRepeatable: true,
    args: { name: "[-]TAG", generators: tagsGenerator },
  },
  {
    name: ["-i", "-ignore"],
    description: "Ignore specified directory name",
    isRepeatable: true,
    args: {
      name: "DIR",
      suggestions: [
        {
          name: "HIDDEN",
          description: 'Ignore files whose names start with "."',
        },
        {
          name: "SYMLINKS",
          description: "Do not recurse into symbolic links with -r",
        },
      ],
      template: "folders",
    },
  },
  {
    name: "-if",
    description: "Conditionally process files",
    isRepeatable: true,
    args: { name: "EXPR" },
  },
  {
    name: ["-m", "-ignoreMinorErrors"],
    description: "Ignore minor errors and warnings",
  },
  {
    name: ["-o", "-out"],
    description: "Set output file or directory name",
    args: { name: "OUTFILE or FMT", template: "filepaths" },
  },
  {
    name: "-overwrite_original",
    description: "Overwrite original by renaming tmp file",
  },
  {
    name: "-overwrite_original_in_place",
    description: "Overwrite original by copying tmp file",
  },
  {
    name: ["-P", "-preserve"],
    description: "Preserve file modification date/time",
  },
  {
    name: "-password",
    description: "Password for processing protected files",
    args: { name: "PASSWD" },
  },
  {
    name: "-progress",
    description: "Show file progress count",
  },
  {
    name: ["-q", "-quiet"],
    description: "Quiet processing (twice to also suppress warnings)",
    isRepeatable: 2,
  },
  {
    name: ["-r", "-recurse"],
    description: "Recursively process subdirectories",
  },
  {
    name: ["-r.", "-recurse."],
    description: "Recursively process subdirectories, including hidden ones",
  },
  {
    name: "-scanForXMP",
    description: "Brute force XMP scan",
  },
  {
    name: ["-u", "-unknown"],
    description: "Extract unknown tags",
  },
  {
    name: ["-U", "-unknown2"],
    description: "Extract unknown binary tags too",
  },
  {
    name: ["-wm", "-writeMode"],
    description: "Set mode for writing/creating tags",
    args: {
      name: "MODE",
      suggestions: [
        { name: "wcg", description: "Write, create tags and groups (default)" },
        { name: "cg", description: "Only create new tags" },
        { name: "w", description: "Only write existing tags" },
        { name: "wc", description: "Write and create tags, no new groups" },
      ],
    },
  },
  {
    name: ["-z", "-zip"],
    description: "Read/write compressed information",
  },

  // Other options
  {
    name: "-@",
    description: "Read command-line arguments from file",
    isRepeatable: true,
    args: { name: "ARGFILE", template: "filepaths" },
  },
  {
    name: ["-k", "-pause"],
    description: "Pause before terminating",
  },
  {
    name: "-list",
    description: "List all tag names",
  },
  {
    name: "-listw",
    description: "List all writable tag names",
  },
  {
    name: "-listf",
    description: "List all supported file extensions",
  },
  {
    name: "-listr",
    description: "List all recognized file extensions",
  },
  {
    name: "-listwf",
    description: "List all writable file extensions",
  },
  {
    name: "-listg",
    description: "List all tag groups (-listg1 for family 1)",
  },
  {
    name: "-listd",
    description: "List all deletable tag groups",
  },
  {
    name: "-listx",
    description: "Print an XML database of tag details",
  },
  {
    name: "-listgeo",
    description: "Print the Geolocation database",
  },
  {
    name: "-ver",
    description: "Print exiftool version number",
  },

  // Special features
  {
    name: "-diff",
    description: "Compare metadata with another file",
    args: { name: "FILE2", template: "filepaths" },
  },
  {
    name: "-geotag",
    description: "Geotag images from specified GPS log",
    isRepeatable: true,
    args: { name: "TRKFILE", template: "filepaths" },
  },
  {
    name: "-globalTimeShift",
    description: "Shift all formatted date/time values",
    args: { name: "SHIFT" },
  },
  {
    name: "-use",
    description: "Add features from plug-in module",
    args: {
      name: "MODULE",
      suggestions: [
        { name: "MWG", description: "Metadata Working Group tags" },
      ],
    },
  },

  // Utilities
  {
    name: "-delete_original",
    description: 'Delete "_original" backups',
  },
  {
    name: "-delete_original!",
    description: 'Delete "_original" backups without asking',
    isDangerous: true,
  },
  {
    name: "-restore_original",
    description: 'Restore from "_original" backups',
  },

  // Advanced options
  {
    name: "-api",
    description: "Set ExifTool API option",
    isRepeatable: true,
    args: { name: "OPT[=VAL]", generators: apiOptionsGenerator },
  },
  {
    name: "-common_args",
    description: "Define common arguments",
  },
  {
    name: "-config",
    description: "Specify configuration file name",
    args: { name: "CFGFILE", template: "filepaths" },
  },
  {
    name: "-echo",
    description: "Echo text to stdout (-echo2 for stderr)",
    isRepeatable: true,
    args: { name: "TEXT" },
  },
  {
    name: "-efile",
    description: "Save names of files with errors",
    args: { name: "TXTFILE", template: "filepaths" },
  },
  {
    name: "-execute",
    description: "Execute multiple commands on one line",
    isRepeatable: true,
  },
  {
    name: "-file1",
    description: "Load tags from alternate file (-file2, -file3, …)",
    args: { name: "ALTFILE", template: "filepaths" },
  },
  {
    name: "-list_dir",
    description: "List directories, not their contents",
  },
  {
    name: "-srcfile",
    description: "Process a different source file",
    isRepeatable: true,
    args: { name: "FMT" },
  },
  {
    name: "-stay_open",
    description: "Keep reading -@ argfile even after EOF",
    args: {
      name: "FLAG",
      suggestions: [
        { name: "True", description: "Start reading the -@ argfile" },
        { name: "False", description: "Stop reading the -@ argfile" },
      ],
    },
  },
  {
    name: "-userParam",
    description: "Set user parameter (API UserParam opt)",
    isRepeatable: true,
    args: { name: "PARAM[=VAL]" },
  },
];

const optionNames = new Set(
  options.flatMap((option) =>
    (Array.isArray(option.name) ? option.name : [option.name]).map((name) =>
      name.toLowerCase(),
    ),
  ),
);

// A token like -Make, --GPS:all or -EXIF:Artist=Bob names a tag. Returns the
// dashes and, for group-qualified names, the group before the last colon.
const tagToken = (
  token: string,
): { dashes: string; group: string | undefined } | undefined => {
  const match = token.match(/^(--?)([A-Za-z][^=<]*)/);
  if (!match) {
    return undefined;
  }
  const [, dashes, name] = match;
  const colon = name.lastIndexOf(":");
  return { dashes, group: colon > 0 ? name.slice(0, colon) : undefined };
};

const tagOption = (
  name: string,
  description: string,
  priority: number,
): Fig.Option => ({ name, description, priority });

// Tags only join the option list while one is being typed, so that `exiftool `
// and `exiftool -` show exiftool's own options rather than 20,000 tag names.
const generateTagOptions = async (
  tokens: string[],
  executeShellCommand: Fig.ExecuteCommandFunction,
): Promise<Fig.Spec> => {
  const token = tagToken(tokens[tokens.length - 1] ?? "");
  if (!token) {
    return { name: "exiftool" };
  }
  const { dashes, group } = token;
  const excluding = dashes === "--";
  const describe = (included: string, excluded: string) =>
    excluding ? excluded : included;

  if (group) {
    const { stdout } = await executeShellCommand({
      command: "exiftool",
      args: ["-list", `-${group}:All`],
    });
    return {
      name: "exiftool",
      options: [
        tagOption(
          `${dashes}${group}:all`,
          describe(`All ${group} tags`, `Exclude all ${group} tags`),
          45,
        ),
        ...listedWords(stdout).map((tag) =>
          tagOption(
            `${dashes}${group}:${tag}`,
            describe(`${group} tag`, `Exclude ${group} tag`),
            40,
          ),
        ),
      ],
    };
  }

  const { stdout } = await executeShellCommand({
    command: "exiftool",
    args: ["-list", "-listw", "-listg", "-listg1"],
  });
  const sections = parseListSections(stdout);
  const tags = new Set(sections.get("Available tags"));
  const writable = new Set(sections.get("Writable tags"));
  const groups = new Set([
    ...(sections.get("Groups in family 0") ?? []),
    ...(sections.get("Groups in family 1") ?? []),
  ]);
  // Shortcuts such as AllDates stand for several tags
  const shortcuts = (sections.get("Command-line shortcuts") ?? []).filter(
    (name) => !tags.has(name),
  );
  const notAnOption = (name: string) =>
    !optionNames.has(`${dashes}${name}`.toLowerCase());
  const tagDescription = (tag: string) =>
    describe(
      writable.has(tag) ? "Writable tag" : "Read-only tag",
      "Exclude tag",
    );

  return {
    name: "exiftool",
    options: [
      tagOption(`${dashes}all`, describe("All tags", "Exclude all tags"), 45),
      ...[...groups].map((name) =>
        tagOption(
          `${dashes}${name}:all`,
          describe(`All ${name} tags`, `Exclude all ${name} tags`),
          40,
        ),
      ),
      ...shortcuts
        .filter(notAnOption)
        .map((name) =>
          tagOption(
            `${dashes}${name}`,
            describe("Shortcut tag", "Exclude shortcut tag"),
            40,
          ),
        ),
      ...[...tags]
        .filter(notAnOption)
        .map((tag) => tagOption(`${dashes}${tag}`, tagDescription(tag), 40)),
    ],
  };
};

const completionSpec: Fig.Spec = {
  name: "exiftool",
  description:
    "Read, write and edit meta information in images, audio, video and documents",
  parserDirectives: { flagsArePosixNoncompliant: true },
  args: {
    name: "FILE",
    template: "filepaths",
    isOptional: true,
    isVariadic: true,
  },
  options,
  generateSpec: generateTagOptions,
  generateSpecCacheKey: ({ tokens }) => {
    const token = tagToken(tokens[tokens.length - 1] ?? "");
    if (!token) {
      return "no-tags";
    }
    return `tags${token.dashes}${token.group ?? ""}`;
  },
};

export default completionSpec;
