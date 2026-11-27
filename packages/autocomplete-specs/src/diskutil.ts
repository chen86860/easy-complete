import { filepaths } from "@fig/autocomplete-generators";

// diskutil has no version of its own, so the spec follows the latest macOS
// (27) and is not versioned. macOS 26 added the image features marked
// "(macOS 26+)" and dropped resetFusion and the two-disk Fusion forms of
// apfs create and createContainer, which only Intel Fusion Drive Macs used;
// the spec leaves those out. The rest is unchanged since macOS 15.
//
// diskutil matches verbs and most keywords case-insensitively and the parser
// does not, so names use Apple's casing plus the aliases its usage prints.
// Keywords without a dash (force, readOnly, internal, ...) are options: the
// parser tries every token as an option first. Positions that shift with
// optional words (eraseDisk's partition scheme, randomDisk's pass count,
// partitionDisk's count, scheme and format-name-size triplets) are worked out
// from the tokens already typed. `image` is a Swift ArgumentParser command
// with POSIX options, unlike the rest.
//
// Disks, volumes, containers and RAID sets come from the installed diskutil's
// -plist listings and are only cached for a few seconds, because disks come
// and go. Crypto user UUIDs are not listed (listCryptoUsers shows passphrase
// hints), nor are snapshots, which need a listing per volume. Verbs and
// aliases that diskutil accepts but neither its usage nor its man page
// documents (listSessions, resetUserPermissions, help, the top-level
// listUsers, apfs createVolume, snaps, ...) are left out.

type PlistValue =
  | string
  | number
  | boolean
  | PlistValue[]
  | { [key: string]: PlistValue };

const xmlEntities: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
};

const decodeXml = (text: string): string =>
  text.replace(
    /&(?:#x([\da-f]+)|#(\d+)|(\w+));/gi,
    (entity, hex: string, decimal: string, name: string) => {
      if (hex) {
        return String.fromCodePoint(Number.parseInt(hex, 16));
      }
      if (decimal) {
        return String.fromCodePoint(Number(decimal));
      }
      return xmlEntities[name] ?? entity;
    },
  );

// The -plist listings are XML property lists of dicts, arrays, strings,
// integers and booleans. Anything else, such as the error diskutil prints
// when DiskArbitration is unavailable, gives undefined.
const parsePlist = (xml: string): PlistValue | undefined => {
  const tags = [
    ...xml.matchAll(
      /<(\/?)(dict|array|key|string|integer|real|true|false|date|data)(\/?)>([^<]*)/g,
    ),
  ];
  let index = 0;
  const closes = (tag: string): boolean =>
    tags[index]?.[1] === "/" && tags[index][2] === tag;
  const parseValue = (): PlistValue => {
    const [, , tag, selfClosing, text] = tags[index++];
    if (tag === "dict") {
      const dict: Record<string, PlistValue> = {};
      while (!selfClosing && !closes("dict")) {
        const key = decodeXml(tags[index][4]);
        index += 2;
        dict[key] = parseValue();
      }
      if (!selfClosing) {
        index++;
      }
      return dict;
    }
    if (tag === "array") {
      const array: PlistValue[] = [];
      while (!selfClosing && !closes("array")) {
        array.push(parseValue());
      }
      if (!selfClosing) {
        index++;
      }
      return array;
    }
    if (!selfClosing) {
      index++;
    }
    if (tag === "true" || tag === "false") {
      return tag === "true";
    }
    const value = selfClosing ? "" : decodeXml(text);
    return tag === "integer" || tag === "real" ? Number(value) : value;
  };
  try {
    return parseValue();
  } catch {
    return undefined;
  }
};

const sizeUnits = ["B", "KB", "MB", "GB", "TB", "PB", "EB"];

// Base ten with one decimal, as `diskutil list` prints sizes
const formatSize = (bytes: number): string => {
  let value = bytes;
  let unit = 0;
  while (value >= 1000 && unit < sizeUnits.length - 1) {
    value /= 1000;
    unit++;
  }
  return unit === 0 ? `${value} B` : `${value.toFixed(1)} ${sizeUnits[unit]}`;
};

const joinDefined = (parts: (string | undefined)[]): string =>
  parts.filter(Boolean).join(", ");

interface ListedDisk {
  DeviceIdentifier: string;
  Content?: string;
  VolumeName?: string;
  MountPoint?: string;
  Size?: number;
  CapacityInUse?: number;
  OSInternal?: boolean;
  Partitions?: ListedDisk[];
  APFSVolumes?: ListedDisk[];
  APFSPhysicalStores?: { DeviceIdentifier: string }[];
}

type DiskKind = "whole" | "partition" | "volume" | "snapshot";

interface Disk {
  id: string;
  kind: DiskKind;
  description: string;
  volumeName?: string;
  mountPoint?: string;
}

// The disks `diskutil list` prints, without the OS-internal ones it also
// hides. Descriptions follow its NAME, mount point and SIZE columns.
const listDisks = (out: string): Disk[] => {
  const wholeDisks =
    (parsePlist(out) as { AllDisksAndPartitions?: ListedDisk[] } | undefined)
      ?.AllDisksAndPartitions ?? [];
  const containers = new Map<string, string>();
  for (const whole of wholeDisks) {
    for (const store of whole.APFSPhysicalStores ?? []) {
      containers.set(store.DeviceIdentifier, whole.DeviceIdentifier);
    }
  }
  const toDisk = (disk: ListedDisk, kind: DiskKind): Disk => {
    const container = containers.get(disk.DeviceIdentifier);
    const label =
      kind === "snapshot"
        ? `Snapshot of ${disk.VolumeName}`
        : (disk.VolumeName ??
          (container ? `Container ${container}` : disk.Content));
    const size =
      kind === "volume" || kind === "snapshot" ? disk.CapacityInUse : disk.Size;
    return {
      id: disk.DeviceIdentifier,
      kind,
      description: joinDefined([
        label,
        disk.MountPoint,
        size === undefined ? undefined : formatSize(size),
      ]),
      volumeName: disk.VolumeName,
      mountPoint: disk.MountPoint,
    };
  };
  return wholeDisks
    .flatMap((whole) => [
      { disk: whole, kind: "whole" as const },
      ...(whole.Partitions ?? []).map((disk) => ({
        disk,
        kind: "partition" as const,
      })),
      ...(whole.APFSVolumes ?? []).map((disk) => ({
        disk,
        kind: /s\d+s\d+$/.test(disk.DeviceIdentifier)
          ? ("snapshot" as const)
          : ("volume" as const),
      })),
    ])
    .filter(({ disk }) => !disk.OSInternal)
    .map(({ disk, kind }) => toDisk(disk, kind));
};

const diskCache: Fig.Cache = { strategy: "max-age", ttl: 5000 };

const diskGenerator = (
  include: (disk: Disk, tokens: string[]) => boolean,
): Fig.Generator => ({
  script: ["diskutil", "list", "-plist"],
  cache: diskCache,
  postProcess: (out, tokens) =>
    listDisks(out)
      .filter((disk) => include(disk, tokens))
      .map((disk) => ({ name: disk.id, description: disk.description })),
});

const isVolume = (disk: Disk): boolean =>
  disk.kind === "volume" ||
  (disk.kind !== "snapshot" && disk.volumeName !== undefined);

const wholeDiskGenerator = diskGenerator((disk) => disk.kind === "whole");
const partitionGenerator = diskGenerator((disk) => disk.kind === "partition");
const diskOrPartitionGenerator = diskGenerator(
  (disk) => disk.kind === "whole" || disk.kind === "partition",
);
const notSnapshotGenerator = diskGenerator((disk) => disk.kind !== "snapshot");
const volumeGenerator = diskGenerator(isVolume);
// From `diskutil list` rather than `diskutil apfs list`, which also prints the
// OS-internal volumes (iSCPreboot, xART, Hardware, the Recovery container) and
// takes several times longer
const apfsVolumeGenerator = diskGenerator((disk) => disk.kind === "volume");

interface ApfsVolume {
  DeviceIdentifier: string;
  Name?: string;
  Roles?: string[];
  Encryption?: boolean;
  FileVault?: boolean;
  Locked?: boolean;
  CapacityInUse?: number;
}

interface ApfsContainer {
  ContainerReference: string;
  CapacityCeiling?: number;
  PhysicalStores?: { DeviceIdentifier: string }[];
  Volumes?: ApfsVolume[];
}

const listContainers = (out: string): ApfsContainer[] =>
  (parsePlist(out) as { Containers?: ApfsContainer[] } | undefined)
    ?.Containers ?? [];

const apfsListScript = ["diskutil", "apfs", "list", "-plist"];

const containerGenerator = (withStores: boolean): Fig.Generator => ({
  script: apfsListScript,
  cache: diskCache,
  postProcess: (out) => {
    const containers = listContainers(out);
    return [
      ...containers.map((container) => ({
        name: container.ContainerReference,
        description: [
          formatSize(container.CapacityCeiling ?? 0),
          (container.Volumes ?? []).map((volume) => volume.Name).join(", "),
        ]
          .filter(Boolean)
          .join(": "),
      })),
      ...(withStores
        ? containers.flatMap((container) =>
            (container.PhysicalStores ?? []).map((store) => ({
              name: store.DeviceIdentifier,
              description: `Physical store of ${container.ContainerReference}`,
            })),
          )
        : []),
    ];
  },
});

const apfsContainerGenerator = containerGenerator(false);
const apfsContainerOrStoreGenerator = containerGenerator(true);

// For arguments that depend on the lock, encryption or role state, which only
// `diskutil apfs list` prints
const apfsStateGenerator = (
  include: (volume: ApfsVolume) => boolean,
): Fig.Generator => ({
  script: apfsListScript,
  cache: diskCache,
  postProcess: (out) =>
    listContainers(out)
      .flatMap((container) => container.Volumes ?? [])
      .filter(include)
      .map((volume) => {
        const roles = (volume.Roles ?? []).filter(
          (role) => role !== volume.Name,
        );
        return {
          name: volume.DeviceIdentifier,
          description: joinDefined([
            roles.length > 0
              ? `${volume.Name} (${roles.join(", ")})`
              : volume.Name,
            volume.Locked ? "locked" : undefined,
            formatSize(volume.CapacityInUse ?? 0),
          ]),
        };
      }),
});

interface RaidMember {
  "BSD Name"?: string;
  AppleRAIDMemberUUID?: string;
  MemberStatus?: string;
}

interface RaidSet {
  "BSD Name"?: string;
  AppleRAIDSetUUID?: string;
  Name?: string;
  Level?: string;
  Status?: string;
  Members?: RaidMember[];
  Spares?: RaidMember[];
}

const listRaidSets = (out: string): RaidSet[] =>
  (parsePlist(out) as { AppleRAIDSets?: RaidSet[] } | undefined)
    ?.AppleRAIDSets ?? [];

const raidListScript = ["diskutil", "appleRAID", "list", "-plist"];

const suggestEach = (
  names: (string | undefined)[],
  description: string,
): Fig.Suggestion[] =>
  names.filter(Boolean).map((name) => ({ name, description }));

// A set can be named by its disk or its UUID; `appleRAID list` takes only the
// UUID
const raidSetGenerator = (uuidsOnly: boolean): Fig.Generator => ({
  script: raidListScript,
  cache: diskCache,
  postProcess: (out) =>
    listRaidSets(out).flatMap((set) =>
      suggestEach(
        [uuidsOnly ? undefined : set["BSD Name"], set.AppleRAIDSetUUID],
        `${set.Name} (${set.Level}, ${set.Status})`,
      ),
    ),
});

const quoted = (name: string): Fig.Suggestion =>
  name.includes(" ") ? { name, insertValue: `"${name}"` } : { name };

// diskutil defines these aliases itself, so the -plist listing leaves them out
const filesystemAliases: Fig.Suggestion[] = [
  ["JHFS+", "Journaled HFS+"],
  ["JHFSX", "Case-sensitive Journaled HFS+"],
  ["HFSX", "Case-sensitive HFS+"],
  ["APFSX", "Case-sensitive APFS"],
  ["APFSI", "APFS"],
  ["FAT32", "MS-DOS FAT32"],
  ["FREE", "Free Space"],
].map(([name, personality]) => ({
  name,
  description: `Alias for ${personality}`,
}));

interface Filesystem {
  Personality?: string;
  UserVisibleName?: string;
  Bundle?: string;
  BundlePath?: string;
}

const filesystemSuggestions = (out: string): Fig.Suggestion[] => {
  const filesystems = parsePlist(out);
  if (!Array.isArray(filesystems)) {
    return [];
  }
  // Personalities without a file system bundle (Linux Swap, Linux Native)
  // cannot format anything, and the text listing leaves them out. Free Space
  // has no bundle either but is valid: it leaves the space unallocated.
  return (filesystems as Filesystem[])
    .filter(
      ({ Bundle, BundlePath }) =>
        Boolean(BundlePath) || Bundle === "FREE_SPACE",
    )
    .flatMap(({ Personality, UserVisibleName }) =>
      Personality
        ? [{ ...quoted(Personality), description: UserVisibleName ?? "" }]
        : [],
    )
    .sort((a, b) => a.description.localeCompare(b.description));
};

// The personalities of the installed file system bundles, which only change
// when one is installed
const filesystemGenerator: Fig.Generator = {
  script: ["diskutil", "listFilesystems", "-plist"],
  cache: { strategy: "stale-while-revalidate", ttl: 1000 * 60 * 60 },
  postProcess: filesystemSuggestions,
};

const formatArg: Fig.Arg = {
  name: "format",
  description: "File system personality",
  suggestions: filesystemAliases,
  generators: filesystemGenerator,
};

// A partition type between percent signs leaves the partition unformatted
const partitionTypes: Fig.Suggestion[] = [
  { name: "%Apple_APFS%", description: "APFS partition type, unformatted" },
  { name: "%Apple_HFS%", description: "HFS partition type, unformatted" },
  { name: "%Apple_Boot%", description: "Booter partition type, unformatted" },
];

const noFormatName: Fig.Suggestion = {
  name: "%noformat%",
  description: "Leave the partition without a file system",
};

const volumeNameArg: Fig.Arg = {
  name: "name",
  description: "Name of the new volume",
  suggestions: [noFormatName],
};

const partitionSchemes: Fig.Suggestion[] = [
  { name: "GPT", description: "GUID Partition Table, to start up a Mac" },
  { name: "MBR", description: "Master Boot Record, for DOS and Windows" },
  { name: "APM", description: "Apple Partition Map" },
];

const isScheme = (token = ""): boolean =>
  /^(APM|MBR|GPT)(Format|Scheme)?$/i.test(token);

// The SIZES section of diskutil(8): bytes, or a number with a unit. Exabytes
// and the device-dependent DBS are left out as no disk needs them.
const sizeSuffixes: Fig.Suggestion[] = [
  { name: "G", description: "Gigabytes (10^9 bytes)" },
  { name: "GiB", description: "Gibibytes (2^30 bytes)" },
  { name: "M", description: "Megabytes (10^6 bytes)" },
  { name: "MiB", description: "Mebibytes (2^20 bytes)" },
  { name: "T", description: "Terabytes (10^12 bytes)" },
  { name: "TiB", description: "Tebibytes (2^40 bytes)" },
  { name: "K", description: "Kilobytes (10^3 bytes)" },
  { name: "KiB", description: "Kibibytes (2^10 bytes)" },
  { name: "P", description: "Petabytes (10^15 bytes)" },
  { name: "PiB", description: "Pebibytes (2^50 bytes)" },
  { name: "S", description: "512-byte sectors" },
];

const partitionSizeSuffixes: Fig.Suggestion[] = [
  ...sizeSuffixes,
  { name: "%", description: "Percent of the disk" },
];

const sizeSuggestions = (
  typed: string,
  suffixes: Fig.Suggestion[],
): Fig.Suggestion[] =>
  /^\d+(\.\d+)?$/.test(typed)
    ? suffixes.map(({ name, description }) => ({
        name: `${typed}${name}`,
        description,
      }))
    : [];

const sizeGenerator = (suffixes: Fig.Suggestion[]): Fig.Generator => ({
  trigger: { on: "change" },
  custom: async (_tokens, _executeCommand, { searchTerm }) =>
    sizeSuggestions(searchTerm, suffixes),
});

const byteSizeGenerator = sizeGenerator(sizeSuffixes);
const partitionSizeGenerator = sizeGenerator(partitionSizeSuffixes);

const fillSize: Fig.Suggestion = {
  name: "0",
  description: "Fill the available space",
};

const remainderSize: Fig.Suggestion = {
  name: "R",
  description: "The space the other partitions leave, for one partition only",
};

const recoverySize: Fig.Suggestion = {
  name: "%recovery%",
  description: "Customary size of a pre-macOS 13 Recovery partition",
};

interface Layout {
  verb: string;
  // Positional arguments of the verb before the layout
  leading: number;
  count: boolean;
  scheme: boolean;
  // Sizes without a number that the verb accepts in a triplet
  sizes: Fig.Suggestion[];
}

interface LayoutPosition {
  slot: "schemeOrFormat" | "format" | "name" | "size";
  // Sizes of the triplets already typed
  sizes: string[];
}

// Where the current token falls in "[count] [scheme] (format name size)...".
// Option tokens are skipped; no layout follows a size of limits or mapsize.
const layoutPosition = (
  tokens: string[],
  layout: Layout,
): LayoutPosition | undefined => {
  const verb = tokens.findIndex(
    (token) => token.toLowerCase() === layout.verb.toLowerCase(),
  );
  const args = tokens
    .slice(verb + 1, -1)
    .filter((token) => !token.startsWith("-"));
  if (/^(limits|mapsize)$/i.test(args[layout.leading - 1] ?? "")) {
    return undefined;
  }
  let start = layout.leading;
  if (layout.count && /^\d+$/.test(args[start] ?? "")) {
    start++;
  }
  const hasScheme = layout.scheme && isScheme(args[start]);
  if (hasScheme) {
    start++;
  }
  const position = args.length - start;
  if (position < 0) {
    return undefined;
  }
  const sizes = args.slice(start).filter((_, index) => index % 3 === 2);
  if (layout.scheme && !hasScheme && position === 0) {
    return { slot: "schemeOrFormat", sizes };
  }
  return { slot: (["format", "name", "size"] as const)[position % 3], sizes };
};

const layoutArg = (layout: Layout, description: string): Fig.Arg => ({
  name: "partition",
  description,
  isOptional: true,
  isVariadic: true,
  generators: [
    {
      trigger: { on: "change" },
      custom: async (tokens, _executeCommand, { searchTerm }) => {
        const position = layoutPosition(tokens, layout);
        switch (position?.slot) {
          case "schemeOrFormat":
            return [
              ...partitionSchemes,
              ...filesystemAliases,
              ...partitionTypes,
            ];
          case "format":
            return [...filesystemAliases, ...partitionTypes];
          case "name":
            return [noFormatName];
          case "size": {
            // R may size at most one triplet
            const remainderUsed = position.sizes.some((size) =>
              /^r$/i.test(size),
            );
            return [
              ...layout.sizes.filter(
                (size) => !remainderUsed || size !== remainderSize,
              ),
              ...sizeSuggestions(searchTerm, partitionSizeSuffixes),
            ];
          }
          default:
            return [];
        }
      },
    },
    {
      ...filesystemGenerator,
      trigger: { on: "change" },
      postProcess: (out, tokens) => {
        const slot = layoutPosition(tokens, layout)?.slot;
        return slot === "format" || slot === "schemeOrFormat"
          ? filesystemSuggestions(out)
          : [];
      },
    },
  ],
});

// The argument after an optional word (eraseDisk's scheme, randomDisk's pass
// count), completed only when that word was given
const afterWord = (
  generator: Fig.Generator,
  isWord: (token: string) => boolean,
): Fig.Generator => ({
  ...generator,
  postProcess: (out, tokens) =>
    isWord(tokens[tokens.length - 2] ?? "")
      ? (generator.postProcess?.(out, tokens) ?? [])
      : [],
});

const dangerousSuggestion = (
  suggestion: string | Fig.Suggestion,
): Fig.Suggestion =>
  typeof suggestion === "string"
    ? { name: suggestion, isDangerous: true }
    : { isDangerous: true, ...suggestion };

// The engine applies an argument's isDangerous to string suggestions only, so
// object and generated suggestions are marked here
const dangerousGenerator = (generator: Fig.Generator): Fig.Generator => {
  const { postProcess, custom } = generator;
  return {
    ...generator,
    ...(postProcess && {
      postProcess: (out, tokens) =>
        postProcess(out, tokens).map(dangerousSuggestion),
    }),
    ...(custom && {
      custom: async (tokens, executeCommand, context) =>
        (await custom(tokens, executeCommand, context)).map(
          dangerousSuggestion,
        ),
    }),
  };
};

const dangerousArg = (arg: Fig.Arg): Fig.Arg => ({
  ...arg,
  isDangerous: true,
  ...(arg.suggestions && {
    suggestions: arg.suggestions.map(dangerousSuggestion),
  }),
  ...(arg.generators && {
    generators: [arg.generators].flat().map(dangerousGenerator),
  }),
});

// Marks an erasing verb and everything completed for it, options included, so
// that no suggestion runs it straight away. Suggestions and options that set
// isDangerous: false (the read-only limits form of the resize verbs) are kept.
const destructive = (verb: Fig.Subcommand): Fig.Subcommand => ({
  ...verb,
  isDangerous: true,
  args: [verb.args ?? []].flat().map(dangerousArg),
  ...(verb.options && {
    options: verb.options.map((option) => ({
      isDangerous: true,
      ...option,
      ...(option.args && { args: [option.args].flat().map(dangerousArg) }),
    })),
  }),
});

// The usage of these verbs puts every option before the arguments
const optionsFirst = {
  flagsArePosixNoncompliant: true,
  optionsMustPrecedeArguments: true,
};

const plistOption: Fig.Option = {
  name: "-plist",
  description: "Print a property list instead of text",
};

const deviceArg = (
  generator: Fig.Generator,
  description?: string,
): Fig.Arg => ({
  name: "device",
  description,
  generators: generator,
});

const forceUnmountOption: Fig.Option = {
  name: "force",
  description: "Force the unmount, even with files open",
};

const raidTypes: Fig.Suggestion[] = [
  { name: "mirror", description: "Mirrored set (RAID 1)" },
  { name: "stripe", description: "Striped set (RAID 0)" },
  { name: "concat", description: "Concatenated set (spanning)" },
];

const raidSetArg: Fig.Arg = {
  name: "set",
  description: "RAID set disk, UUID or mount point",
  generators: raidSetGenerator(false),
};

const raidCreate = destructive({
  name: "create",
  description: "Create a RAID set from disks or other sets",
  args: [
    { name: "type", suggestions: raidTypes },
    { name: "name", description: "Name of the set and its volume" },
    formatArg,
    {
      name: "device",
      description: "Member disk, or the UUID of a set to nest",
      isVariadic: true,
      generators: [diskOrPartitionGenerator, raidSetGenerator(true)],
    },
  ],
});

const raidList: Fig.Subcommand = {
  name: "list",
  description: "Show RAID sets and their members",
  options: [plistOption],
  args: {
    name: "set",
    description: "UUID of the set to show",
    isOptional: true,
    generators: raidSetGenerator(true),
  },
};

const raidDelete = destructive({
  name: "delete",
  description: "Delete a RAID set",
  args: raidSetArg,
});

const raidRepairMirror = destructive({
  name: "repairMirror",
  description: "Replace a failed mirror member with a new disk",
  args: [
    raidSetArg,
    {
      name: "device",
      description: "New member disk",
      generators: diskOrPartitionGenerator,
    },
  ],
});

const raidAdd = destructive({
  name: "add",
  description: "Add a member or hot spare disk to a RAID set",
  args: [
    {
      name: "type",
      suggestions: [
        { name: "member", description: "Add a member" },
        { name: "spare", description: "Add a hot spare (mirrors only)" },
      ],
    },
    {
      name: "device",
      description: "New disk, or the UUID of a set to nest",
      generators: [diskOrPartitionGenerator, raidSetGenerator(true)],
    },
    raidSetArg,
  ],
});

const raidRemove: Fig.Subcommand = {
  name: "remove",
  description: "Remove a member or spare from a RAID set",
  args: [
    {
      name: "member",
      description: "Member disk, or its UUID when it is missing",
      generators: {
        script: raidListScript,
        cache: diskCache,
        postProcess: (out) =>
          listRaidSets(out).flatMap((set) => [
            ...(set.Members ?? []).flatMap((member) =>
              suggestEach(
                [member["BSD Name"], member.AppleRAIDMemberUUID],
                joinDefined([`Member of ${set.Name}`, member.MemberStatus]),
              ),
            ),
            ...(set.Spares ?? []).flatMap((spare) =>
              suggestEach(
                [spare["BSD Name"], spare.AppleRAIDMemberUUID],
                `Spare of ${set.Name}`,
              ),
            ),
          ]),
      },
    },
    raidSetArg,
  ],
};

const raidEnable: Fig.Subcommand = {
  name: "enable",
  description: "Turn a partition with a resizable file system into a RAID set",
  args: [
    {
      name: "type",
      suggestions: raidTypes.filter((type) => type.name !== "stripe"),
    },
    deviceArg(volumeGenerator),
  ],
};

const raidUpdate: Fig.Subcommand = {
  name: "update",
  description: "Change a setting of a RAID set",
  args: [
    {
      name: "key",
      suggestions: [
        {
          name: "AutoRebuild",
          description: "Rebuild degraded mirrors automatically: 1 or 0",
        },
        {
          name: "SetTimeout",
          description: "Seconds to wait for a missing member before degrading",
        },
      ],
    },
    {
      name: "value",
      generators: {
        custom: async (tokens) =>
          /^AutoRebuild$/i.test(tokens[tokens.length - 2] ?? "")
            ? [
                { name: "1", description: "Rebuild automatically" },
                { name: "0", description: "Do not rebuild automatically" },
              ]
            : [],
      },
    },
    raidSetArg,
  ],
};

const deprecatedRaidVerb = (
  name: string,
  verb: Fig.Subcommand,
): Fig.Subcommand => ({
  ...verb,
  name,
  description: `Deprecated synonym for appleRAID ${[verb.name].flat()[0]}`,
  hidden: true,
  deprecated: true,
});

const userOption = (description: string): Fig.Option => ({
  name: "-user",
  description,
  args: {
    name: "user",
    description: "Crypto user UUID, or disk for the Disk user",
    suggestions: [
      {
        name: "disk",
        description: "The Disk user, whose UUID is the volume UUID",
      },
    ],
  },
});

const passphraseOption: Fig.Option = {
  name: "-passphrase",
  description: "Passphrase, instead of prompting for it",
  args: { name: "passphrase" },
};

const stdinPassphraseOption: Fig.Option = {
  name: "-stdinpassphrase",
  description: "Read the passphrase from standard input",
};

const recoveryKeychainOption: Fig.Option = {
  name: "-recoverykeychain",
  description: "Use the institutional recovery key in this unlocked keychain",
  args: { name: "keychain", template: "filepaths" },
};

const volumeRoles: [string, string][] = [
  ["B", "Preboot (boot loader)"],
  ["R", "Recovery"],
  ["V", "VM (swap space)"],
  ["I", "Installer"],
  ["T", "Backup (Time Machine)"],
  ["S", "System"],
  ["D", "Data"],
  ["E", "Update"],
  ["X", "xART (hardware security)"],
  ["H", "Hardware"],
  ["C", "Sidecar (Time Machine)"],
  ["Y", "Enterprise (data)"],
];

// Options addVolume and eraseVolume share for the new volume
const newVolumeOptions: Fig.Option[] = [
  {
    name: "-passprompt",
    description: "Encrypt the volume, prompting for a passphrase",
  },
  {
    name: "-passphrase",
    description: "Encrypt the volume with this passphrase",
    args: { name: "passphrase" },
  },
  {
    name: "-stdinpassphrase",
    description:
      "Encrypt the volume, reading the passphrase from standard input",
  },
  {
    name: "-passphraseHint",
    description: "Hint that is shown while the volume is locked",
    args: { name: "hint" },
  },
  {
    name: "-role",
    description: "Role flags of the volume, one or more letters",
    args: {
      name: "roles",
      suggestions: [
        ...volumeRoles.map(([name, description]) => ({ name, description })),
        { name: "0", description: "No role" },
      ],
    },
  },
  {
    name: ["-groupWith", "-group", "-sibling"],
    description: "Join the volume group of this APFS volume",
    args: { name: "volume", generators: apfsVolumeGenerator },
  },
];

const apfsVolumeArg = (
  generator: Fig.Generator = apfsVolumeGenerator,
): Fig.Arg => ({
  name: "volume",
  description: "APFS volume",
  generators: generator,
});

const apfsSubcommands: Fig.Subcommand[] = [
  {
    name: "list",
    description: "Show APFS containers and their volumes",
    options: [plistOption],
    args: {
      name: "container",
      isOptional: true,
      generators: apfsContainerGenerator,
    },
  },
  {
    name: ["listCryptoUsers", "listUsers", "listCryptoKeys", "listKeys"],
    description: "List the cryptographic users of an APFS volume",
    parserDirectives: optionsFirst,
    options: [plistOption],
    args: apfsVolumeArg(),
  },
  {
    name: ["listSnapshots", "listVolumeSnapshots", "snapshots"],
    description: "List the snapshots of an APFS volume",
    parserDirectives: optionsFirst,
    options: [plistOption],
    args: apfsVolumeArg(),
  },
  {
    name: ["listVolumeGroups", "listGroups"],
    description: "List APFS volume groups",
    options: [plistOption],
    args: {
      name: "container",
      isOptional: true,
      generators: apfsContainerGenerator,
    },
  },
  {
    name: "convert",
    description: "Convert an HFS volume to APFS without erasing it",
    options: [
      {
        name: "-dryrun",
        description: "Run every check and calculation, leaving the volume HFS",
      },
      {
        name: "-prebootSource",
        description:
          "Staging directory of macOS boot items for a Preboot volume",
        args: { name: "directory", template: "folders" },
      },
      {
        name: "-noPrebootAdditions",
        description: "Do not add items to the staging directory",
      },
    ],
    args: deviceArg(volumeGenerator),
  },
  destructive({
    name: "create",
    description: "Create an APFS container with one volume",
    args: [
      deviceArg(diskOrPartitionGenerator, "Disk to become the physical store"),
      { name: "name", description: "Name of the volume" },
    ],
  }),
  destructive({
    name: "createContainer",
    description: "Create an empty APFS container",
    args: deviceArg(
      diskOrPartitionGenerator,
      "Disk to become the physical store",
    ),
  }),
  destructive({
    name: "deleteContainer",
    description: "Delete an APFS container and all of its volumes",
    parserDirectives: optionsFirst,
    options: [
      {
        name: "-force",
        description:
          "Reclaim the physical store of a damaged container, as a last resort",
      },
    ],
    args: [
      {
        name: "container",
        description: "Container reference, or a physical store",
        generators: apfsContainerOrStoreGenerator,
      },
      {
        ...formatArg,
        description:
          "Reformat the store with this file system, or with just a volume name",
        isOptional: true,
      },
      { name: "name", isOptional: true },
      {
        name: "size",
        isOptional: true,
        suggestions: [
          { name: "0", description: "Fill the store, the only size supported" },
        ],
      },
    ],
  }),
  destructive({
    name: "resizeContainer",
    description: "Resize an APFS container, or print its size limits",
    options: [{ ...plistOption, isDangerous: false }],
    args: [
      {
        name: "container",
        description: "Container reference, or a physical store",
        generators: apfsContainerOrStoreGenerator,
      },
      {
        name: "size",
        suggestions: [
          {
            name: "limits",
            description: "Print the valid sizes",
            isDangerous: false,
          },
          { name: "0", description: "Grow to fill the free space" },
        ],
        generators: byteSizeGenerator,
      },
      layoutArg(
        {
          verb: "resizeContainer",
          leading: 2,
          count: false,
          scheme: false,
          sizes: [fillSize],
        },
        "Format, name and size of each partition for the freed space",
      ),
    ],
  }),
  {
    name: "addVolume",
    description: "Add a volume to an APFS container",
    options: [
      ...newVolumeOptions,
      {
        name: "-reserve",
        description: "Capacity guaranteed to the volume",
        args: { name: "size", generators: byteSizeGenerator },
      },
      {
        name: "-quota",
        description: "Most capacity the volume may use",
        args: { name: "size", generators: byteSizeGenerator },
      },
      { name: "-nomount", description: "Leave the new volume unmounted" },
      {
        name: "-mountpoint",
        description: "Mount at this existing directory (root only)",
        args: { name: "path", template: "folders" },
      },
    ],
    args: [
      { name: "container", generators: apfsContainerGenerator },
      {
        name: "format",
        suggestions: [
          { name: "APFS", description: "APFS" },
          {
            ...quoted("Case-sensitive APFS"),
            description: "APFS (Case-sensitive)",
          },
          { name: "APFSX", description: "Alias for Case-sensitive APFS" },
          { name: "APFSI", description: "Alias for APFS" },
        ],
      },
      { name: "name", description: "Name of the volume" },
    ],
  },
  destructive({
    name: "deleteVolume",
    description: "Delete an APFS volume and its data",
    args: apfsVolumeArg(),
  }),
  destructive({
    name: "deleteVolumeGroup",
    description: "Delete every volume of an APFS volume group",
    args: {
      name: "group",
      description: "Volume group UUID, from diskutil apfs listVolumeGroups",
    },
  }),
  destructive({
    name: "eraseVolume",
    description: "Erase the contents of an APFS volume, keeping the volume",
    options: [
      {
        name: "-name",
        description: "New name of the volume (required)",
        args: { name: "name" },
      },
      ...newVolumeOptions,
    ],
    args: apfsVolumeArg(),
  }),
  {
    name: ["changeVolumeRole", "chrole"],
    description: "Change the role flags of an APFS volume",
    args: [
      apfsVolumeArg(),
      {
        name: "roles",
        description: "Upper case sets a flag, lower case clears it",
        suggestions: [
          ...volumeRoles.flatMap(([name, description]) => [
            { name, description: `Set ${description}` },
            { name: name.toLowerCase(), description: `Clear ${description}` },
          ]),
          { name: "clear", description: "Clear every role" },
          { name: "0", description: "Change nothing" },
        ],
      },
    ],
  },
  {
    name: ["unlockVolume", "unlock"],
    description: "Unlock and mount a locked APFS volume",
    options: [
      userOption("Unlock as this crypto user"),
      recoveryKeychainOption,
      passphraseOption,
      stdinPassphraseOption,
      { name: "-nomount", description: "Unlock without mounting" },
      {
        name: "-mountpoint",
        description: "Mount at this existing directory",
        args: { name: "path", template: "folders" },
      },
      {
        name: "-systemreadwrite",
        description: "Mount a System role volume read-write",
      },
      { name: "-verify", description: "Only check the passphrase" },
      plistOption,
    ],
    args: apfsVolumeArg(apfsStateGenerator((volume) => volume.Locked === true)),
  },
  {
    name: ["lockVolume", "lock"],
    description: "Unmount and lock an encrypted APFS volume",
    args: apfsVolumeArg(
      apfsStateGenerator(
        (volume) => volume.Encryption === true && !volume.Locked,
      ),
    ),
  },
  {
    name: ["changePassphrase", "changeCryptoUserPassphrase", "passwd"],
    description: "Change the passphrase of a cryptographic user",
    options: [
      userOption("Crypto user whose passphrase to change (required)"),
      {
        name: "-oldPassphrase",
        description: "Current passphrase, instead of prompting for it",
        args: { name: "passphrase" },
      },
      {
        name: "-oldStdinpassphrase",
        description: "Read the current passphrase from standard input",
      },
      {
        name: "-newPassphrase",
        description: "New passphrase, instead of prompting for it",
        args: { name: "passphrase" },
      },
      {
        name: "-newStdinpassphrase",
        description: "Read the new passphrase from standard input",
      },
    ],
    args: apfsVolumeArg(),
  },
  {
    name: ["setPassphraseHint", "setCryptoUserPassphraseHint", "hint"],
    description: "Set or clear the passphrase hint of a cryptographic user",
    options: [
      userOption("Crypto user whose hint to change (required)"),
      { name: "-hint", description: "Hint to set", args: { name: "hint" } },
      { name: "-clear", description: "Remove the hint" },
    ],
    args: apfsVolumeArg(),
  },
  {
    name: ["encryptVolume", "encrypt", "enableFileVault"],
    description: "Start encrypting an APFS volume (enable FileVault)",
    options: [
      userOption("Existing crypto user, or disk to create the Disk user"),
      passphraseOption,
      stdinPassphraseOption,
    ],
    // macOS manages the encryption of the volumes with a system role
    args: apfsVolumeArg(
      apfsStateGenerator(
        (volume) =>
          !volume.FileVault &&
          (volume.Roles ?? []).every((role) => role === "Data"),
      ),
    ),
  },
  {
    name: ["decryptVolume", "decrypt", "disableFileVault"],
    description: "Start decrypting an APFS volume (disable FileVault)",
    options: [
      userOption("Crypto user to authenticate as"),
      recoveryKeychainOption,
      passphraseOption,
      stdinPassphraseOption,
    ],
    args: apfsVolumeArg(
      apfsStateGenerator((volume) => volume.FileVault === true),
    ),
  },
  destructive({
    name: ["deleteSnapshot", "deleteVolumeSnapshot"],
    description: "Delete an APFS snapshot",
    options: [
      {
        name: "-uuid",
        description: "UUID of the snapshot, from diskutil apfs listSnapshots",
        args: { name: "uuid" },
      },
      {
        name: "-xid",
        description: "Numeric ID of the snapshot",
        args: { name: "xid" },
      },
      {
        name: "-name",
        description: "Name of the snapshot",
        args: { name: "name" },
      },
      { name: "-wait", description: "Wait until the space is reclaimed" },
    ],
    args: apfsVolumeArg(),
  }),
  {
    name: ["defragment", "defrag"],
    description: "Check or set automatic defragmentation",
    args: [
      {
        name: "device",
        description: "APFS container or volume",
        generators: [apfsContainerGenerator, apfsVolumeGenerator],
      },
      {
        name: "action",
        suggestions: [
          { name: "status", description: "Show whether it is enabled" },
          { name: "enable", description: "Enable automatic defragmentation" },
          { name: "disable", description: "Disable automatic defragmentation" },
        ],
      },
    ],
  },
  {
    name: "updatePreboot",
    description: "Update the Preboot volume of a macOS volume",
    options: [
      {
        name: "-noGlobalEFIGraphics",
        description: "Skip the localized login graphics shared by all users",
      },
      {
        name: "-od",
        description: "Open Directory database to use instead of the volume's",
        args: {
          name: "path",
          suggestions: [
            { name: "/", description: "The database of the running macOS" },
          ],
          template: "folders",
        },
      },
    ],
    args: apfsVolumeArg(),
  },
  {
    name: "syncPatchUsers",
    description: "Copy crypto users from a System volume to its Data volume",
    args: apfsVolumeArg(
      apfsStateGenerator((volume) => volume.Roles?.includes("System") === true),
    ),
  },
];

const coreStorageSubcommands: Fig.Subcommand[] = [
  {
    name: "list",
    description: "Show CoreStorage volume groups and volumes",
    options: [plistOption],
    args: { name: "uuid", description: "UUID to show", isOptional: true },
  },
  {
    name: ["info", "information"],
    description: "Show the properties of a CoreStorage object",
    parserDirectives: optionsFirst,
    options: [plistOption],
    args: deviceArg(
      diskGenerator(() => true),
      "CoreStorage UUID or disk",
    ),
  },
  destructive({
    name: ["delete", "deleteLVG"],
    description: "Delete a CoreStorage logical volume group",
    args: { name: "group", description: "Logical volume group UUID or name" },
  }),
  {
    name: ["unlockVolume", "unlockLV"],
    description: "Unlock and mount an encrypted logical volume",
    options: [
      { name: "-nomount", description: "Unlock without mounting" },
      stdinPassphraseOption,
      passphraseOption,
      recoveryKeychainOption,
    ],
    args: { name: "uuid", description: "Logical volume UUID" },
  },
];

const imageFiles = filepaths({
  extensions: [
    "dmg",
    "asif",
    "sparsebundle",
    "sparseimage",
    "img",
    "iso",
    "cdr",
  ],
});

const imageArg: Fig.Arg = { name: "image", generators: imageFiles };

const imageFormats: Fig.Suggestion[] = [
  { name: "RAW", description: "Read-write raw image (formerly UDRW)" },
  { name: "UDRO", description: "Read-only UDIF, uncompressed" },
  { name: "UDZO", description: "Read-only UDIF, zlib-compressed" },
  { name: "ULFO", description: "Read-only UDIF, LZFSE-compressed" },
  { name: "ULMO", description: "Read-only UDIF, LZMA-compressed" },
  { name: "ASIF", description: "Apple sparse image (macOS 26+)" },
  { name: "UDSB", description: "Sparse bundle" },
];

const formatOption = (formats: string[], description: string): Fig.Option => ({
  name: ["-f", "--format"],
  description,
  args: {
    name: "format",
    suggestions: imageFormats.filter((format) =>
      formats.includes(format.name as string),
    ),
  },
});

const imageSubcommands: Fig.Subcommand[] = [
  {
    name: "attach",
    description: "Attach a disk image as a device",
    options: [
      { name: ["-r", "--readOnly"], description: "Attach the image read-only" },
      {
        name: ["-b", "--nobrowse"],
        description: "Hide the volumes from apps such as the Finder",
      },
      {
        name: "--mountPoint",
        description: "Mount the volume at this path instead of /Volumes",
        args: { name: "path", template: "folders" },
      },
      {
        name: "--mountOptions",
        description: "Mount options, separated by commas (see mount(8))",
        args: { name: "options" },
      },
      {
        name: ["--mountPolicy", "--mp"],
        description: "Whether to mount after attaching",
        args: {
          name: "policy",
          suggestions: [
            { name: "noMount", description: "Attach only" },
            {
              name: "autoMount",
              description: "Mount if the image has a mountable file system",
            },
            {
              name: "forceMount",
              description: "Mount, failing if nothing can be mounted",
            },
          ],
        },
      },
      { name: "--noMount", description: "Attach without mounting" },
      {
        name: "--shadow",
        description:
          "Write changes to <image>_shadow, or to --shadow=PATH (macOS 26+)",
        isRepeatable: true,
        requiresSeparator: true,
        args: { name: "shadow-path", isOptional: true, template: "filepaths" },
      },
    ],
    args: {
      name: "image",
      description: "Image path, http(s) URL, or ram://size for a RAM disk",
      suggestions: [
        {
          name: "ram://",
          description: "RAM disk of a size in 512-byte sectors, or with a unit",
        },
      ],
      generators: imageFiles,
    },
  },
  {
    name: "info",
    description: "Show information about a disk image",
    options: [
      {
        name: "--extra",
        description: "Include extra information for some image types",
      },
    ],
    args: imageArg,
  },
  {
    name: "chpass",
    description: "Change the passphrase of an encrypted image (macOS 26+)",
    args: imageArg,
  },
  {
    name: "create",
    description: "Create a blank disk image, or one from a source",
    options: [
      {
        name: ["-e", "--encrypt"],
        description: "Encrypt the image with AES-256",
        isPersistent: true,
      },
    ],
    subcommands: [
      {
        name: "blank",
        description: "Create a blank disk image",
        options: [
          formatOption(
            ["RAW", "ASIF", "UDSB"],
            "Image format (default: RAW, or that of a .asif or .sparsebundle path)",
          ),
          {
            name: ["-s", "--size"],
            description: "Size of the image, in bytes unless a unit is given",
            args: { name: "size", generators: byteSizeGenerator },
          },
          {
            name: "--volumeName",
            description: "Name of the volume (default: untitled)",
            args: { name: "name" },
          },
          // The man page writes -fs; Apple's published example uses --fs
          {
            name: "--fs",
            description: "File system to create (macOS 26+, default: APFS)",
            args: {
              name: "filesystem",
              suggestions: [
                { name: "APFS", description: "APFS" },
                { name: "ExFAT", description: "ExFAT" },
                { name: "MS-DOS", description: "MS-DOS (FAT)" },
                { name: "None", description: "No file system" },
              ],
            },
          },
        ],
        args: { name: "path", template: "filepaths" },
      },
      {
        name: "from",
        description: "Create a disk image from a disk, image or folder",
        options: [
          formatOption(
            ["RAW", "UDRO", "UDZO", "ULFO", "ULMO", "ASIF", "UDSB"],
            "Image format (default: ULFO, or that of a .asif or .sparsebundle path)",
          ),
          {
            name: "--shadow",
            description: "Shadow file of a source image (macOS 26+)",
            args: { name: "shadow-path", template: "filepaths" },
          },
        ],
        args: [
          {
            name: "source",
            description: "Disk, disk image or folder (folders: macOS 26+)",
            generators: [notSnapshotGenerator, { template: "filepaths" }],
          },
          { name: "path", template: "filepaths" },
        ],
      },
    ],
  },
  {
    name: "resize",
    description: "Resize a disk image, or print its size limits",
    options: [
      {
        name: ["-s", "--size"],
        description: "New size; without it the limits are printed",
        args: {
          name: "size",
          suggestions: [
            { name: "min", description: "The smallest size possible" },
          ],
          generators: byteSizeGenerator,
        },
      },
      {
        name: "--image-only",
        description:
          "Resize only the image and its secondary GPT; shrinking cuts off data",
        isDangerous: true,
      },
    ],
    args: imageArg,
  },
];

const verbs: Fig.Subcommand[] = [
  {
    name: "list",
    description: "List disks, partitions and volumes",
    parserDirectives: optionsFirst,
    options: [
      plistOption,
      {
        name: "internal",
        description: "Only internal disks",
        exclusiveOn: ["external"],
      },
      {
        name: "external",
        description: "Only external disks",
        exclusiveOn: ["internal"],
      },
      {
        name: "physical",
        description: "Only physical disks",
        exclusiveOn: ["virtual"],
      },
      {
        name: "virtual",
        description: "Only virtual disks, such as disk images",
        exclusiveOn: ["physical"],
      },
    ],
    args: {
      name: "device",
      description: "Only this whole disk",
      isOptional: true,
      generators: wholeDiskGenerator,
    },
  },
  {
    name: ["info", "information"],
    description: "Show details of a disk or partition",
    parserDirectives: optionsFirst,
    options: [
      { ...plistOption, exclusiveOn: ["-all"] },
      {
        name: "-all",
        description: "Show every disk and partition",
        exclusiveOn: ["-plist"],
      },
    ],
    // -all takes the place of the device
    args: {
      ...deviceArg(diskGenerator((_disk, tokens) => !tokens.includes("-all"))),
      isOptional: true,
    },
  },
  {
    name: "listFilesystems",
    description: "List the file system personalities for formatting",
    options: [plistOption],
  },
  {
    name: "listClients",
    description: "List the current disk management clients (root only)",
  },
  {
    name: "activity",
    description: "Show disk arbitration activity until interrupted",
  },
  {
    name: ["unmount", "umount"],
    description: "Unmount a volume",
    parserDirectives: optionsFirst,
    options: [forceUnmountOption],
    args: deviceArg(
      diskGenerator(
        (disk) => disk.kind !== "snapshot" && disk.mountPoint !== undefined,
      ),
    ),
  },
  {
    name: ["unmountDisk", "umountDisk"],
    description: "Unmount every volume of a disk",
    parserDirectives: optionsFirst,
    options: [forceUnmountOption],
    args: deviceArg(wholeDiskGenerator),
  },
  {
    name: "eject",
    description: "Eject a disk",
    parserDirectives: optionsFirst,
    options: [forceUnmountOption],
    args: deviceArg(wholeDiskGenerator),
  },
  {
    name: "mount",
    description: "Mount a volume",
    parserDirectives: optionsFirst,
    options: [
      { name: "readOnly", description: "Mount read-only" },
      { name: "nobrowse", description: "Hide the volume from the Finder" },
      {
        name: "-mountOptions",
        description: "Options for mount -o, separated by commas",
        args: { name: "options" },
      },
      {
        name: "-mountPoint",
        description: "Mount at this existing directory instead of /Volumes",
        args: { name: "path", template: "folders" },
      },
    ],
    args: deviceArg(
      diskGenerator((disk) => isVolume(disk) && disk.mountPoint === undefined),
    ),
  },
  {
    name: "mountDisk",
    description: "Mount every mountable volume of a disk",
    args: deviceArg(wholeDiskGenerator),
  },
  {
    name: "enableJournal",
    description: "Enable journaling on an HFS+ volume",
    args: deviceArg(volumeGenerator),
  },
  {
    name: "disableJournal",
    description: "Disable journaling on an HFS+ volume",
    parserDirectives: optionsFirst,
    options: [
      {
        name: "force",
        description:
          "Disable it directly on disk; the volume must be unmounted",
      },
    ],
    args: deviceArg(volumeGenerator),
  },
  {
    name: "moveJournal",
    description:
      "Move the journal of an HFS+ volume to another partition or back",
    subcommands: [
      {
        name: "internal",
        description: "Move the journal back onto the volume",
        args: deviceArg(volumeGenerator),
      },
      destructive({
        name: "external",
        description: "Repartition a partition to hold the journal",
        args: [
          {
            name: "journal device",
            description: "Partition to repartition for the journal",
            generators: partitionGenerator,
          },
          deviceArg(volumeGenerator),
        ],
      }),
    ],
  },
  {
    name: "enableOwnership",
    description: "Honor on-disk user and group IDs on a volume (root only)",
    args: deviceArg(volumeGenerator),
  },
  {
    name: "disableOwnership",
    description: "Ignore on-disk user and group IDs on a volume (root only)",
    args: deviceArg(volumeGenerator),
  },
  {
    name: ["rename", "renameVolume"],
    description: "Rename a volume",
    args: [
      deviceArg(volumeGenerator),
      { name: "name", description: "New name of the volume" },
    ],
  },
  {
    name: "verifyVolume",
    description: "Verify the file system of a volume",
    args: deviceArg(volumeGenerator),
  },
  {
    name: "repairVolume",
    description: "Repair the file system of a volume",
    args: deviceArg(volumeGenerator),
  },
  {
    name: "verifyDisk",
    description: "Verify the partition map of a whole disk",
    args: deviceArg(wholeDiskGenerator),
  },
  {
    name: "repairDisk",
    description: "Repair the partition map of a whole disk",
    args: deviceArg(wholeDiskGenerator),
  },
  destructive({
    name: "eraseDisk",
    description: "Erase a whole disk, leaving one new volume",
    parserDirectives: optionsFirst,
    options: [
      { name: "-noEFI", description: "Do not create an EFI partition" },
    ],
    args: [
      formatArg,
      volumeNameArg,
      {
        name: "device",
        description: "Whole disk, after an optional partition scheme",
        suggestions: partitionSchemes,
        generators: wholeDiskGenerator,
      },
      {
        name: "device",
        isOptional: true,
        generators: afterWord(wholeDiskGenerator, isScheme),
      },
    ],
  }),
  destructive({
    name: "eraseVolume",
    description: "Erase a partition or volume with a new file system",
    args: [
      {
        ...formatArg,
        description:
          "File system personality, or Free Space to delete the partition",
      },
      volumeNameArg,
      deviceArg(notSnapshotGenerator),
    ],
  }),
  destructive({
    name: "reformat",
    description: "Erase a volume, keeping its name and file system",
    args: deviceArg(volumeGenerator),
  }),
  destructive({
    name: "eraseOptical",
    description: "Erase optical media",
    parserDirectives: optionsFirst,
    options: [
      { name: "quick", description: "Quick erase instead of a full one" },
    ],
    args: deviceArg(wholeDiskGenerator),
  }),
  destructive({
    name: "zeroDisk",
    description: "Erase a disk or partition by writing zeros",
    parserDirectives: optionsFirst,
    options: [
      { name: "force", description: "Force unmounts and shared-mode writes" },
      {
        name: "short",
        description: "Write only enough zeros to hide existing file systems",
      },
    ],
    args: deviceArg(diskOrPartitionGenerator),
  }),
  destructive({
    name: "randomDisk",
    description: "Erase a disk or partition by writing random data",
    args: [
      deviceArg(
        diskOrPartitionGenerator,
        "Disk or partition, after an optional number of passes",
      ),
      {
        name: "device",
        isOptional: true,
        generators: afterWord(diskOrPartitionGenerator, (token) =>
          /^\d+$/.test(token),
        ),
      },
    ],
  }),
  destructive({
    name: "secureErase",
    description: "Securely erase a whole disk, or the free space of a volume",
    parserDirectives: optionsFirst,
    options: [
      {
        name: "freespace",
        description: "Erase only the free space of a mounted volume",
      },
    ],
    args: [
      {
        name: "level",
        suggestions: [
          { name: "0", description: "Single pass of zeros" },
          { name: "1", description: "Single pass of random data" },
          { name: "2", description: "Seven passes" },
          { name: "3", description: "Gutmann algorithm, 35 passes" },
          { name: "4", description: "Three passes" },
        ],
      },
      deviceArg(notSnapshotGenerator),
    ],
  }),
  destructive({
    name: "partitionDisk",
    description: "Repartition a whole disk, removing all volumes",
    parserDirectives: optionsFirst,
    options: [
      { name: "-noEFI", description: "Do not create an EFI partition" },
    ],
    args: [
      deviceArg(wholeDiskGenerator),
      layoutArg(
        {
          verb: "partitionDisk",
          leading: 1,
          count: true,
          scheme: true,
          sizes: [fillSize, remainderSize, recoverySize],
        },
        "Optional count and scheme, then a format, name and size per partition",
      ),
    ],
  }),
  destructive({
    name: "addPartition",
    description: "Create a partition in free space",
    args: [
      deviceArg(
        diskOrPartitionGenerator,
        "Partition to follow, or a whole disk to add the last partition",
      ),
      {
        ...formatArg,
        suggestions: [...filesystemAliases, ...partitionTypes],
      },
      volumeNameArg,
      {
        name: "size",
        suggestions: [fillSize],
        generators: partitionSizeGenerator,
      },
    ],
  }),
  destructive({
    name: "splitPartition",
    description: "Split a partition into several, erasing it",
    args: [
      deviceArg(partitionGenerator),
      {
        ...layoutArg(
          {
            verb: "splitPartition",
            leading: 1,
            count: true,
            scheme: false,
            sizes: [fillSize, remainderSize, recoverySize],
          },
          "Optional count, then a format, name and size per partition",
        ),
        isOptional: false,
      },
    ],
  }),
  destructive({
    name: "mergePartitions",
    description: "Merge a range of partitions into one",
    parserDirectives: optionsFirst,
    options: [
      {
        name: "force",
        description: "Format the result, erasing the first partition too",
      },
    ],
    args: [
      formatArg,
      { name: "name", description: "Name of the volume" },
      deviceArg(partitionGenerator, "First partition of the range"),
      deviceArg(partitionGenerator, "Last partition of the range"),
    ],
  }),
  destructive({
    name: "resizeVolume",
    description: "Resize a Journaled HFS+ partition, or print its size limits",
    options: [{ ...plistOption, isDangerous: false }],
    args: [
      deviceArg(partitionGenerator),
      {
        name: "size",
        suggestions: [
          {
            name: "limits",
            description: "Print the valid sizes",
            isDangerous: false,
          },
          {
            name: "mapsize",
            description: "Print the size of the partition map",
            isDangerous: false,
          },
          { name: "R", description: "Grow to the largest size possible" },
          fillSize,
        ],
        generators: partitionSizeGenerator,
      },
      layoutArg(
        {
          verb: "resizeVolume",
          leading: 2,
          count: true,
          scheme: false,
          sizes: [fillSize],
        },
        "Optional count, then a format, name and size per new partition",
      ),
    ],
  }),
  {
    name: ["appleRAID", "AppleRAID", "AR", "ar"],
    description: "Manage AppleRAID software RAID sets",
    subcommands: [
      raidList,
      raidCreate,
      raidDelete,
      raidRepairMirror,
      raidAdd,
      raidRemove,
      raidEnable,
      raidUpdate,
    ],
  },
  {
    name: ["coreStorage", "CS", "cs"],
    description: "Manage CoreStorage volumes, deprecated in favor of APFS",
    deprecated: true,
    subcommands: coreStorageSubcommands,
  },
  {
    name: ["apfs", "APFS", "ap"],
    description: "Manage APFS containers and volumes",
    subcommands: apfsSubcommands,
  },
  {
    name: "image",
    description: "Attach, create and resize disk images",
    parserDirectives: { flagsArePosixNoncompliant: false },
    options: [
      {
        name: ["-v", "--verbose"],
        description: "Verbose output",
        isPersistent: true,
      },
      {
        name: ["--stdinpassphrase", "--stdinpass"],
        description:
          "Read the passphrase from standard input (--stdinpass: macOS 26+)",
        isPersistent: true,
      },
      {
        name: "--plist",
        description: "Print a property list instead of text",
        isPersistent: true,
      },
      {
        name: ["-h", "--help"],
        description: "Show help information",
        isPersistent: true,
      },
    ],
    subcommands: imageSubcommands,
  },
  deprecatedRaidVerb("createRAID", raidCreate),
  deprecatedRaidVerb("destroyRAID", raidDelete),
  deprecatedRaidVerb("enableRAID", raidEnable),
  deprecatedRaidVerb("listRAID", raidList),
  deprecatedRaidVerb("checkRAID", raidList),
  deprecatedRaidVerb("repairMirror", raidRepairMirror),
  deprecatedRaidVerb("updateRAID", raidUpdate),
  deprecatedRaidVerb("addToRAID", raidAdd),
  deprecatedRaidVerb("removeFromRAID", raidRemove),
];

const completionSpec: Fig.Spec = {
  name: "diskutil",
  description: "Modify, verify and repair local disks",
  parserDirectives: { flagsArePosixNoncompliant: true },
  subcommands: [
    {
      name: "quiet",
      description: "Run a verb with less output",
      subcommands: verbs,
    },
    ...verbs,
  ],
};

export default completionSpec;
