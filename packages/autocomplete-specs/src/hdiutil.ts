import { filepaths, keyValue } from "@fig/autocomplete-generators";

// hdiutil options are single-dash words (-readonly, -srcfolder), so the parser
// must not split them into chained short flags. hdiutil has no version of its
// own and its options have not changed since macOS 11: the macOS 27 man page
// lists the same ones as macOS 15 and only adds the deprecation in favour of
// `diskutil image`, so the spec is not versioned. Left out: the verbs macOS
// removed (flatten, unflatten, internet-enable), the undocumented debugging
// verbs (header, hfsanalyze, test...), and the obsolete flags hdiutil still
// accepts but ignores (-idme, -trackpid, -growonly...). Attached images are read
// from `hdiutil info -plist`, the output Apple documents for programs.

// No .asif: only `diskutil image` can open ASIF images. hdiutil ignores the
// extension's case, so Setup.DMG is an image too.
const imagePattern =
  /\.(dmg|sparseimage|sparsebundle|iso|cdr|img|toast|dvdr|smi|udif)$/i;

const imageFiles = filepaths({ matches: imagePattern });

// Verbs that read a /dev entry like an image list the disk nodes once /dev/ is
// typed
const imageOrDeviceFiles = filepaths({
  matches: new RegExp(`${imagePattern.source}|^r?disk\\d+(s\\d+)*$`, "i"),
});

const imageArg: Fig.Arg = { name: "image", generators: imageFiles };

interface SystemEntity {
  device: string;
  contentHint?: string;
  mountPoint?: string;
}

interface AttachedImage {
  name: string;
  entities: SystemEntity[];
}

const unescapeXml = (text: string): string =>
  text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");

const plistString = (xml: string, key: string): string | undefined => {
  const match = xml.match(
    new RegExp(`<key>${key}</key>\\s*<string>([^<]*)</string>`),
  );
  return match ? unescapeXml(match[1]) : undefined;
};

// File images are named by their file name, ram:// and http(s) images by URL
const imageName = (path: string): string =>
  path.startsWith("/") ? (path.split("/").filter(Boolean).pop() ?? path) : path;

// `hdiutil info -plist` sorts dictionary keys, so each image's image-path comes
// before its system-entities array, which holds one dict per /dev entry
const parseAttachedImages = (xml: string): AttachedImage[] =>
  xml
    .split("<key>image-path</key>")
    .slice(1)
    .map((chunk) => {
      const path = chunk.match(/^\s*<string>([^<]*)<\/string>/)?.[1];
      const entities = chunk.split("<key>system-entities</key>")[1] ?? "";
      return {
        name: path ? imageName(unescapeXml(path)) : "Disk image",
        entities: entities.split("<dict>").flatMap((entity) => {
          const device = plistString(entity, "dev-entry");
          if (!device) {
            return [];
          }
          return [
            {
              device,
              contentHint: plistString(entity, "content-hint"),
              mountPoint: plistString(entity, "mount-point"),
            },
          ];
        }),
      };
    });

// `hdiutil info` reports GPT partitions by type GUID rather than by name
const partitionTypeNames: Record<string, string> = {
  "48465300-0000-11AA-AA11-00306543ECAC": "Apple_HFS",
  "7C3457EF-0000-11AA-AA11-00306543ECAC": "Apple_APFS",
  "EF57347C-0000-11AA-AA11-00306543ECAC": "APFS container",
  "41504653-0000-11AA-AA11-00306543ECAC": "APFS volume",
  "C12A7328-F81F-11D2-BA4B-00A0C93EC93B": "EFI",
  "EBD0A0A2-B9E5-4433-87C0-68B6B72699C7": "Microsoft Basic Data",
};

const contentName = (hint?: string): string | undefined => {
  if (!hint) {
    return undefined;
  }
  const isGuid = /^[\dA-F]{8}(-[\dA-F]{4}){3}-[\dA-F]{12}$/i.test(hint);
  return partitionTypeNames[hint.toUpperCase()] ?? (isGuid ? undefined : hint);
};

const describeEntity = (image: string, entity: SystemEntity): string =>
  [image, entity.mountPoint ?? contentName(entity.contentHint)]
    .filter(Boolean)
    .join(", ");

const deviceSuggestion = (
  image: string,
  entity: SystemEntity,
): Fig.Suggestion => ({
  name: entity.device,
  description: describeEntity(image, entity),
});

const mountPointSuggestions = (
  image: string,
  entities: SystemEntity[],
): Fig.Suggestion[] =>
  entities
    .filter(({ mountPoint }) => mountPoint)
    .map(({ device, mountPoint }) => ({
      name: mountPoint,
      description: `${image}, ${device}`,
      priority: 75,
    }));

// Attaching or detaching changes the list, so it is only reused for a moment
const attachedImagesGenerator = (
  suggest: (image: AttachedImage) => Fig.Suggestion[],
): Fig.Generator => ({
  script: ["hdiutil", "info", "-plist"],
  cache: { strategy: "max-age", ttl: 3000, cacheKey: "hdiutil info -plist" },
  postProcess: (out) => parseAttachedImages(out).flatMap(suggest),
});

const diskNumber = (device: string): number =>
  Number(device.match(/^\/dev\/disk(\d+)$/)?.[1] ?? Number.NaN);

// An image's own device is its lowest-numbered whole disk; any higher one is a
// synthesized APFS container
const detachableGenerator = attachedImagesGenerator(({ name, entities }) => {
  const [disk] = entities
    .filter(({ device }) => !Number.isNaN(diskNumber(device)))
    .sort((a, b) => diskNumber(a.device) - diskNumber(b.device));
  return [
    ...(disk ? [{ name: disk.device, description: name, priority: 80 }] : []),
    ...mountPointSuggestions(name, entities),
  ];
});

const mountedGenerator = attachedImagesGenerator(({ name, entities }) => [
  ...mountPointSuggestions(name, entities),
  ...entities
    .filter(({ mountPoint }) => mountPoint)
    .map((entity) => deviceSuggestion(name, entity)),
]);

const holdsFilesystem = ({ contentHint }: SystemEntity): boolean => {
  const content = contentName(contentHint);
  return (
    content !== undefined &&
    !/_partition_(scheme|map)$|^Apple_APFS$|^APFS container$/.test(content)
  );
};

// mountvol mounts filesystems, so the entries holding one come before the
// partition maps and APFS containers around them
const unmountedGenerator = attachedImagesGenerator(({ name, entities }) =>
  entities
    .filter(({ mountPoint }) => !mountPoint)
    .map((entity) => ({
      ...deviceSuggestion(name, entity),
      priority: holdsFilesystem(entity) ? 60 : 50,
    })),
);

// The few attached devices rank above the image files of the current folder
const attachedDevicesGenerator = attachedImagesGenerator(({ name, entities }) =>
  entities.map((entity) => ({
    ...deviceSuggestion(name, entity),
    priority: 60,
  })),
);

// Names insert without /dev/, as in the help, and keep a typed /dev/ prefix
const diskNodesGenerator: Fig.Generator = {
  script: ["ls", "/dev"],
  getQueryTerm: "/",
  postProcess: (out) =>
    out
      .split("\n")
      .filter((name) => /^disk\d+(s\d+)*$/.test(name))
      .map((name) => ({
        name,
        description: /^disk\d+$/.test(name)
          ? "Whole disk"
          : "Partition or volume",
      })),
};

// mkfile(8) style: a bare number is bytes, b is 512-byte sectors
const sizeUnits = [
  { suffix: "m", unit: "MiB" },
  { suffix: "g", unit: "GiB" },
  { suffix: "t", unit: "TiB" },
  { suffix: "k", unit: "KiB" },
  { suffix: "b", unit: "sectors of 512 bytes" },
];

const sizeGenerator: Fig.Generator = {
  trigger: { on: "change" },
  custom: async (tokens) => {
    const amount = tokens[tokens.length - 1];
    if (!/^\d+(\.\d+)?$/.test(amount)) {
      return [];
    }
    return sizeUnits.map(({ suffix, unit }, index) => ({
      name: `${amount}${suffix}`,
      description: `${amount} ${unit}`,
      priority: 60 - index,
    }));
  },
};

const sizeArg: Fig.Arg = { name: "size", generators: sizeGenerator };

const levels = (description: string): Fig.Suggestion[] =>
  ["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((level) => ({
    name: level,
    description,
  }));

const imageKeyValues: Record<string, Fig.Suggestion[]> = {
  "zlib-level": levels("zlib compression level"),
  "bzip2-level": levels("bzip2 compression level"),
  "sparse-band-size": [
    { name: "16384", description: "8 MiB bands (default)" },
    { name: "2048", description: "1 MiB bands (minimum)" },
    { name: "16777216", description: "8 GiB bands (maximum)" },
  ],
  "diskimage-class": [
    { name: "CRawDiskImage", description: "Open the file as a raw image" },
  ],
};

const imageKeyArg: Fig.Arg = {
  name: "key=value",
  generators: keyValue({
    keys: [
      {
        name: "zlib-level",
        description: "UDZO compression level, 1 (fastest, default) to 9",
      },
      { name: "bzip2-level", description: "UDBZ compression level, 1 to 9" },
      {
        name: "sparse-band-size",
        description: "SPARSEBUNDLE band size in sectors, 2048 to 16777216",
      },
      { name: "udif-chunk-size", description: "UDIF chunk size in sectors" },
      {
        name: "diskimage-class",
        description: "Image class used to open the image",
      },
    ],
    values: async (tokens) =>
      imageKeyValues[tokens[tokens.length - 1].split("=")[0]] ?? [],
  }),
};

// Each "-[no]name" toggle is a pair of options that cancel each other out
const toggle = (name: string, on: string, off: string): Fig.Option[] => [
  { name: `-${name}`, description: on, exclusiveOn: [`-no${name}`] },
  { name: `-no${name}`, description: off, exclusiveOn: [`-${name}`] },
];

const verbosityOptions: Fig.Option[] = [
  {
    name: "-verbose",
    description: "Print extra progress output and error diagnostics",
    exclusiveOn: ["-quiet"],
  },
  {
    name: "-debug",
    description: "Print very verbose output, implies -verbose",
    exclusiveOn: ["-quiet"],
  },
  {
    name: "-quiet",
    description: "Close stdout and stderr, leaving only the exit status",
    exclusiveOn: ["-verbose", "-debug"],
  },
  { name: "-help", description: "Show usage for this verb" },
];

const plistOption: Fig.Option = {
  name: "-plist",
  description: "Print the result as a property list",
};

const puppetstringsOption: Fig.Option = {
  name: "-puppetstrings",
  description: "Print progress output that is easy for programs to parse",
};

// The cipher is optional because the man page's examples follow a bare
// -encryption with another option
const encryptionOptions: Fig.Option[] = [
  {
    name: "-encryption",
    description: "Use encryption with this cipher (default AES-128)",
    args: {
      name: "method",
      isOptional: true,
      suggestions: [
        { name: "AES-256", description: "256-bit AES (recommended)" },
        { name: "AES-128", description: "128-bit AES (default)" },
      ],
    },
  },
  {
    name: "-stdinpass",
    description: "Read a NUL-terminated passphrase from standard input",
  },
  {
    name: "-agentpass",
    description: "Prompt for a passphrase, also when -pubkey is given",
  },
];

const srcImageKeyOption: Fig.Option = {
  name: ["-srcimagekey", "-imagekey"],
  description: "Set a key/value pair for opening the source image",
  isRepeatable: true,
  args: imageKeyArg,
};

const tgtImageKeyOption: Fig.Option = {
  name: "-tgtimagekey",
  description: "Set a key/value pair for the image being created",
  isRepeatable: true,
  args: imageKeyArg,
};

const shadowOption: Fig.Option = {
  name: "-shadow",
  description:
    "Redirect writes to a shadow file (default <image>.shadow), leaving the image unchanged",
  args: {
    name: "shadowfile",
    isOptional: true,
    generators: filepaths({ extensions: ["shadow"] }),
  },
};

const shadowOptions: Fig.Option[] = [
  shadowOption,
  {
    name: "-insecurehttp",
    description: "Ignore SSL host validation failures",
  },
  {
    name: "-cacert",
    description:
      "Certificate authority certificate, a PEM file or a directory of certificates",
    args: { name: "cert", template: "filepaths" },
  },
];

const recoverArg: Fig.Arg = {
  name: "keychain_file",
  generators: filepaths({ extensions: ["keychain", "keychain-db"] }),
};

const certificateArg: Fig.Arg = {
  name: "cert_file",
  description: "DER-encoded certificate",
  generators: filepaths({ extensions: ["cer", "der", "crt"] }),
};

const pubkeyArg: Fig.Arg = {
  name: "hashes",
  description: "Comma-separated hexadecimal public key hashes",
};

const overwriteOption: Fig.Option = {
  name: "-ov",
  description: "Overwrite existing files",
  isDangerous: true,
};

const imageFormats: Fig.Suggestion[] = [
  { name: "UDZO", description: "zlib-compressed UDIF image" },
  { name: "ULFO", description: "lzfse-compressed UDIF image" },
  { name: "ULMO", description: "lzma-compressed UDIF image" },
  { name: "UDCO", description: "ADC-compressed UDIF image" },
  {
    name: "UDBZ",
    description: "bzip2-compressed UDIF image (deprecated)",
    deprecated: true,
  },
  { name: "UDRO", description: "Read-only UDIF image" },
  { name: "UDRW", description: "Read/write UDIF image" },
  { name: "UDSP", description: "Sparse image that grows with its content" },
  {
    name: "UDSB",
    description: "Sparse bundle that grows with its content in band files",
  },
  { name: "UDTO", description: "DVD/CD-R master" },
  { name: "UFBI", description: "Entire device with an MD5 checksum" },
  { name: "IPOD", description: "iPod image" },
];

const mountRootOptions = ["-mountpoint", "-mountroot", "-mountrandom"];

const mountFolderOption = (name: string, description: string): Fig.Option => ({
  name,
  description,
  exclusiveOn: mountRootOptions.filter((other) => other !== name),
  args: { name: "path", template: "folders" },
});

const attach: Fig.Subcommand = {
  name: ["attach", "mount"],
  description: "Attach a disk image as a device and mount its volumes",
  args: {
    ...imageArg,
    description: "Image file, http(s) URL, or ram://<sectors>",
    suggestions: [
      {
        name: "ram://",
        description: "RAM disk of the given size in sectors, needs -nomount",
      },
    ],
  },
  options: [
    {
      name: "-readonly",
      description: "Force the device to be read-only",
      exclusiveOn: ["-readwrite"],
    },
    {
      name: "-readwrite",
      description: "Attach read/write even if hdiutil would choose read-only",
      exclusiveOn: ["-readonly"],
    },
    ...toggle(
      "kernel",
      "Attach in the kernel without a helper process",
      "Attach with a helper process (default)",
    ),
    {
      name: "-notremovable",
      description: "Prevent the image from being detached until reboot (root)",
    },
    {
      name: "-mount",
      description: "Whether volumes must be mounted (default required)",
      exclusiveOn: ["-nomount"],
      args: {
        name: "mode",
        suggestions: [
          { name: "required", description: "Fail if no filesystem mounts" },
          { name: "optional", description: "Mount what can be mounted" },
          { name: "suppressed", description: "Do not mount" },
        ],
      },
    },
    {
      name: "-nomount",
      description: "Attach without mounting, same as -mount suppressed",
      exclusiveOn: ["-mount"],
    },
    mountFolderOption(
      "-mountpoint",
      "Mount the only volume at this path instead of in /Volumes",
    ),
    mountFolderOption(
      "-mountroot",
      "Mount volumes in this folder instead of /Volumes",
    ),
    mountFolderOption(
      "-mountrandom",
      "Mount volumes in randomly named folders inside this path",
    ),
    {
      name: "-nobrowse",
      description: "Hide the volumes from applications such as the Finder",
    },
    {
      name: "-private",
      description: "Same as -nobrowse",
      hidden: true,
    },
    {
      name: "-owners",
      description: "Whether to honor file owners on the volumes",
      args: {
        name: "on|off",
        suggestions: ["on", "off"],
      },
    },
    {
      name: "-drivekey",
      description: "Set a key/value pair on the device in the IOKit registry",
      isRepeatable: true,
      args: { name: "key=value" },
    },
    {
      name: "-section",
      description: "Attach only part of the image",
      args: {
        name: "subspec",
        description: "offset, first-last or start,count in 0-based sectors",
      },
    },
    ...toggle(
      "verify",
      "Verify image checksums before attaching",
      "Do not verify image checksums",
    ),
    ...toggle(
      "ignorebadchecksums",
      "Continue when a checksum is bad",
      "Abort when a checksum is bad (default)",
    ),
    ...toggle(
      "autoopen",
      "Open the new volumes in the Finder",
      "Do not open the new volumes (default)",
    ),
    ...toggle(
      "autoopenro",
      "Open new read-only volumes in the Finder",
      "Do not open new read-only volumes",
    ),
    ...toggle(
      "autoopenrw",
      "Open new read/write volumes in the Finder",
      "Do not open new read/write volumes",
    ),
    ...toggle(
      "autofsck",
      "Check filesystems before mounting",
      "Do not check filesystems before mounting",
    ),
    ...encryptionOptions,
    {
      name: "-recover",
      description: "Keychain holding the secret for the image's -certificate",
      args: recoverArg,
    },
    {
      name: "-imagekey",
      description: "Set a key/value pair for opening the image",
      isRepeatable: true,
      args: imageKeyArg,
    },
    ...shadowOptions,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const detach: Fig.Subcommand = {
  name: ["detach", "eject"],
  description: "Unmount the volumes of an attached image and detach it",
  args: {
    name: "device",
    description: "/dev entry or mount point",
    generators: detachableGenerator,
  },
  options: [
    {
      name: "-force",
      description: "Detach even if files on its volumes are open",
    },
    ...verbosityOptions,
  ],
};

const verify: Fig.Subcommand = {
  name: "verify",
  description: "Verify a read-only image against its internal checksum",
  args: imageArg,
  options: [
    ...toggle(
      "cache",
      "Cache the verification result (default)",
      "Do not cache the verification result",
    ),
    ...encryptionOptions,
    srcImageKeyOption,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const create: Fig.Subcommand = {
  name: "create",
  description: "Create a blank disk image, or one from a folder or device",
  args: { name: "imagepath", template: "filepaths" },
  options: [
    {
      name: "-size",
      description: "Image size with a unit: b (sectors), k, m, g, t, p or e",
      exclusiveOn: ["-sectors", "-megabytes"],
      args: sizeArg,
    },
    {
      name: "-sectors",
      description: "Image size in 512-byte sectors",
      exclusiveOn: ["-size", "-megabytes"],
      args: { name: "count" },
    },
    {
      name: "-megabytes",
      description: "Image size in MiB",
      exclusiveOn: ["-size", "-sectors"],
      args: { name: "count" },
    },
    {
      name: "-library",
      description: "Partition layout library (default MediaKit's MKDrivers)",
      args: { name: "bundle", template: "folders" },
    },
    {
      name: "-layout",
      description: "Partition layout (default GPTSPUD or per -fs)",
      args: {
        name: "layout",
        suggestions: [
          {
            name: "GPTSPUD",
            description: "Single partition, GUID partition map (default)",
          },
          {
            name: "SPUD",
            description: "Single partition, Apple partition map",
          },
          {
            name: "MBRSPUD",
            description: "Single partition, master boot record",
          },
          { name: "NONE", description: "No partition map" },
          { name: "SPCD", description: "Single partition, CD/DVD" },
          {
            name: "ISOCD",
            description: "Single partition, CD/DVD with ISO data",
          },
          { name: "UNIVERSAL CD", description: "CD/DVD" },
          { name: "UNIVERSAL HD", description: "Hard disk" },
        ],
      },
    },
    {
      name: "-partitionType",
      description: "Type of the single partition (default per -fs)",
      args: { name: "type" },
    },
    {
      name: "-align",
      description: "Align the data partition to this many sectors (default 8)",
      args: { name: "sectors" },
    },
    overwriteOption,
    {
      name: "-fs",
      description: "Filesystem to create (default APFS)",
      args: {
        name: "filesystem",
        suggestions: [
          { name: "APFS", description: "APFS (default)" },
          { name: "Case-sensitive APFS", description: "APFS, case-sensitive" },
          {
            name: ["Journaled HFS+", "JHFS+", "HFS+J"],
            description: "Mac OS Extended, journaled",
          },
          { name: "HFS+", description: "Mac OS Extended" },
          {
            name: ["Case-sensitive Journaled HFS+", "JHFS+X"],
            description: "Mac OS Extended, case-sensitive and journaled",
          },
          {
            name: ["Case-sensitive HFS+", "HFSX"],
            description: "Mac OS Extended, case-sensitive",
          },
          { name: "ExFAT", description: "ExFAT" },
          { name: "MS-DOS", description: "MS-DOS (FAT)" },
          { name: "MS-DOS FAT12", description: "MS-DOS (FAT12)" },
          { name: "MS-DOS FAT16", description: "MS-DOS (FAT16)" },
          { name: ["MS-DOS FAT32", "FAT32"], description: "MS-DOS (FAT32)" },
          { name: "UDF", description: "Universal Disk Format" },
        ],
      },
    },
    {
      name: "-volname",
      description: 'Volume name (default "untitled")',
      args: { name: "name" },
    },
    {
      name: "-stretch",
      description: "Let the HFS+ volume be stretched later up to this size",
      exclusiveOn: ["-autostretch"],
      args: sizeArg,
    },
    {
      name: "-type",
      description: "Format of a blank image (default UDIF)",
      exclusiveOn: ["-format", "-srcfolder", "-srcdevice"],
      args: {
        name: "type",
        suggestions: [
          { name: "UDIF", description: "Read/write image (default)" },
          { name: "SPARSE", description: "Sparse image, grows with content" },
          {
            name: "SPARSEBUNDLE",
            description: "Sparse bundle, grows with content in band files",
          },
          { name: "UDTO", description: "DVD/CD master" },
        ],
      },
    },
    ...toggle(
      "spotlight",
      "Create a Spotlight index",
      "Do not create a Spotlight index",
    ),
    {
      name: ["-srcfolder", "-srcdir"],
      description: "Copy this folder's contents into the image",
      isRepeatable: true,
      exclusiveOn: ["-srcdevice", "-type"],
      args: { name: "folder", template: "folders" },
    },
    ...toggle(
      "anyowners",
      "Do not fail when file owners cannot be preserved",
      "Fail when file owners cannot be preserved",
    ),
    ...toggle(
      "skipunreadable",
      "Skip files that cannot be read",
      "Fail on files that cannot be read (default)",
    ),
    ...toggle(
      "atomic",
      "Copy to a temporary location, then rename (default)",
      "Copy files directly to their destination",
    ),
    {
      name: "-srcowners",
      description: "Owners setting on the source (default auto)",
      args: {
        name: "setting",
        suggestions: [
          { name: "on", description: "Enable owners on the source" },
          { name: "off", description: "Disable owners on the source" },
          { name: "any", description: "Leave the source's setting unchanged" },
          {
            name: "auto",
            description: "Enable owners if the source is a volume",
          },
        ],
      },
    },
    {
      name: "-format",
      description: "Final image format with a source (default UDZO)",
      exclusiveOn: ["-type"],
      args: {
        name: "format",
        suggestions: [
          ...imageFormats,
          { name: "UNIV", description: "Hybrid HFS+/ISO/UDF image" },
        ],
      },
    },
    {
      name: "-srcdevice",
      description: "Copy the blocks of this device into the image",
      exclusiveOn: ["-srcfolder", "-type"],
      args: { name: "device", generators: diskNodesGenerator },
    },
    {
      name: "-segmentSize",
      description: "Write the image in segments of this size (deprecated)",
      deprecated: true,
      args: { name: "size" },
    },
    { name: "-attach", description: "Attach the image after creating it" },
    {
      name: "-uid",
      description: "Numeric owner of the volume root (99 is unknown)",
      args: { name: "uid" },
    },
    {
      name: "-gid",
      description: "Numeric group of the volume root (99 is unknown)",
      args: { name: "gid" },
    },
    {
      name: "-mode",
      description: "Octal mode of the volume root",
      args: { name: "mode" },
    },
    {
      name: "-autostretch",
      description: "Make large volumes stretchable on older systems",
      exclusiveOn: ["-noautostretch", "-stretch"],
    },
    {
      name: "-noautostretch",
      description: "Do not make large volumes stretchable",
      exclusiveOn: ["-autostretch"],
    },
    {
      name: "-fsargs",
      description: "Extra arguments for the newfs program implied by -fs",
      args: { name: "newfs_args" },
    },
    ...toggle(
      "crossdev",
      "Cross device boundaries in the source",
      "Stay on the source's device",
    ),
    ...toggle(
      "scrub",
      "Skip trashes, temporary files and swap files",
      "Copy temporary files too",
    ),
    {
      name: "-copyuid",
      description: "Copy files as this user (root)",
      args: { name: "user" },
    },
    {
      name: "-o",
      description: "Path of the new image",
      hidden: true,
      args: { name: "imagepath", template: "filepaths" },
    },
    ...encryptionOptions,
    {
      name: "-certificate",
      description: "Secondary access certificate for the encrypted image",
      args: certificateArg,
    },
    {
      name: "-pubkey",
      description: "Protect the encrypted image with these public keys",
      args: pubkeyArg,
    },
    { ...tgtImageKeyOption, name: ["-imagekey", "-tgtimagekey"] },
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const compact: Fig.Subcommand = {
  name: "compact",
  description: "Reclaim unused space in a sparse image",
  args: {
    name: "image",
    generators: filepaths({ matches: /\.(sparseimage|sparsebundle)$/i }),
  },
  options: [
    {
      name: "-batteryallowed",
      description: "Allow compacting on battery power",
    },
    {
      name: "-sleepallowed",
      description: "Allow idle sleep, which cancels compacting",
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const convert: Fig.Subcommand = {
  name: "convert",
  description: "Convert an image or device to another format",
  args: { name: "image|device", generators: imageOrDeviceFiles },
  options: [
    {
      name: "-format",
      description: "Format of the new image",
      isRequired: true,
      args: { name: "format", suggestions: imageFormats },
    },
    {
      name: "-o",
      description: "Path of the new image",
      isRequired: true,
      args: { name: "outfile", template: "filepaths" },
    },
    overwriteOption,
    {
      name: "-align",
      description: "Align the data partition to this many sectors (default 4)",
      args: { name: "sectors" },
    },
    {
      name: "-pmap",
      description: "Add a partition map",
    },
    {
      name: "-segmentSize",
      description: "Write the image in segments of this size (deprecated)",
      deprecated: true,
      args: { name: "size" },
    },
    {
      name: "-tasks",
      description: "Number of compression threads (default: active CPUs)",
      args: { name: "count" },
    },
    ...encryptionOptions,
    {
      name: "-certificate",
      description: "Secondary access certificate for the encrypted image",
      args: certificateArg,
    },
    srcImageKeyOption,
    tgtImageKeyOption,
    ...shadowOptions,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const burn: Fig.Subcommand = {
  name: "burn",
  description: "Burn an image to optical media",
  args: { ...imageArg, isOptional: true },
  options: [
    {
      name: "-speed",
      description: "Burn speed factor (default max)",
      args: {
        name: "speed",
        suggestions: [
          { name: "max", description: "Fastest speed of the drive (default)" },
          "1",
          "2",
          "4",
          "8",
        ],
      },
    },
    {
      name: "-device",
      description: "Burning device to use, as printed by -list",
      args: { name: "device" },
    },
    {
      name: "-sizequery",
      description: "Print the disc size needed in sectors without burning",
      exclusiveOn: ["-synth", "-synthesize"],
    },
    { name: "-testburn", description: "Do not turn on the laser" },
    ...toggle(
      "eject",
      "Eject the disc after burning (default)",
      "Do not eject the disc",
    ),
    ...toggle(
      "verifyburn",
      "Verify the disc after burning (default)",
      "Do not verify the disc",
    ),
    ...toggle(
      "addpmap",
      "Add a partition map if needed (default)",
      "Do not add a partition map",
    ),
    {
      name: ["-synth", "-synthesize"],
      description: "Synthesize a hybrid filesystem when needed (default)",
      exclusiveOn: ["-nosynth", "-nosynthesize", "-sizequery"],
    },
    {
      name: ["-nosynth", "-nosynthesize"],
      description: "Do not synthesize a filesystem",
      exclusiveOn: ["-synth", "-synthesize"],
    },
    ...toggle(
      "skipfinalfree",
      "Skip a trailing free partition (default)",
      "Burn a trailing free partition",
    ),
    ...toggle(
      "optimizeimage",
      "Shrink the HFS+ volume to its data before burning",
      "Burn every block of the image (default)",
    ),
    ...toggle(
      "forceclose",
      "Close the disc, preventing further burns",
      "Leave the disc open (default)",
    ),
    ...toggle(
      "underrun",
      "Enable buffer underrun protection",
      "Disable buffer underrun protection",
    ),
    {
      name: "-erase",
      description: "Quickly erase rewritable media, then burn any image",
      isDangerous: true,
    },
    {
      name: "-fullerase",
      description: "Erase every sector of rewritable media",
      isDangerous: true,
    },
    { name: "-list", description: "List burning devices for -device" },
    {
      name: "-anydevice",
      description: "Allow devices not qualified by Apple (deprecated)",
      deprecated: true,
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const info: Fig.Subcommand = {
  name: "info",
  description: "Show the disk image framework and the attached images",
  options: [
    {
      name: "-s",
      description: "Show only the framework and driver versions",
    },
    plistOption,
    ...verbosityOptions,
  ],
};

const checksum: Fig.Subcommand = {
  name: "checksum",
  description: "Calculate a checksum of the image data",
  args: imageArg,
  options: [
    {
      name: "-type",
      description: "Checksum to calculate",
      isRequired: true,
      args: {
        name: "type",
        suggestions: [
          { name: "UDIF-CRC32", description: "CRC-32 image checksum" },
          { name: "UDIF-MD5", description: "MD5 image checksum" },
          { name: "IPOD", description: "iPod image checksum" },
          { name: "CRC32", description: "CRC-32" },
          { name: "MD5", description: "MD5" },
          { name: "SHA", description: "SHA" },
          { name: "SHA1", description: "SHA-1" },
          { name: "SHA256", description: "SHA-256" },
          { name: "SHA384", description: "SHA-384" },
          { name: "SHA512", description: "SHA-512" },
        ],
      },
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const chpass: Fig.Subcommand = {
  name: "chpass",
  description: "Change the passphrase of an encrypted image",
  args: imageArg,
  options: [
    {
      name: "-oldstdinpass",
      description: "Read the old passphrase from standard input",
    },
    {
      name: "-newstdinpass",
      description: "Read the new passphrase from standard input",
    },
    {
      name: "-recover",
      description: "Keychain holding the secret for the image's -certificate",
      args: recoverArg,
    },
    {
      name: "-pubkey",
      description: "Protect the image with these public keys",
      args: pubkeyArg,
    },
    srcImageKeyOption,
    ...verbosityOptions,
  ],
};

const erasekeys: Fig.Subcommand = {
  name: "erasekeys",
  description: "Delete the keys of an encrypted image, making it inaccessible",
  isDangerous: true,
  args: imageArg,
  options: [plistOption, ...verbosityOptions],
};

const imageinfo: Fig.Subcommand = {
  name: "imageinfo",
  description: "Print information about a disk image",
  args: imageArg,
  options: [
    {
      name: "-format",
      description: "Print only the image format",
      exclusiveOn: ["-checksum"],
    },
    {
      name: "-checksum",
      description: "Print only the image checksum",
      exclusiveOn: ["-format"],
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    plistOption,
    // The only verb that rejects -quiet
    ...verbosityOptions.filter(({ name }) => name !== "-quiet"),
  ],
};

const isencrypted: Fig.Subcommand = {
  name: "isencrypted",
  description: "Report whether an image is encrypted",
  args: imageArg,
  options: [plistOption, ...verbosityOptions],
};

const globArg: Fig.Arg = { name: "glob" };
const nameArg: Fig.Arg = { name: "name" };
const sourceFileArg: Fig.Arg = {
  name: "file",
  description: "8.3 name in the root of the source",
  template: "filepaths",
};

const makehybrid: Fig.Subcommand = {
  name: "makehybrid",
  description: "Create a read-only hybrid HFS+/ISO9660/Joliet/UDF image",
  args: {
    name: "source",
    description: "Folder or disk image",
    generators: imageFiles,
  },
  options: [
    {
      name: "-o",
      description: "Path of the new image",
      isRequired: true,
      args: { name: "image", template: "filepaths" },
    },
    { name: "-hfs", description: "Generate an HFS+ filesystem" },
    { name: "-iso", description: "Generate an ISO9660 Level 2 filesystem" },
    { name: "-joliet", description: "Generate Joliet extensions to ISO9660" },
    { name: "-udf", description: "Generate a UDF filesystem" },
    {
      name: "-hfs-blessed-directory",
      description: "Folder to bless for booting (HFS+)",
      args: { name: "directory", template: "folders" },
    },
    {
      name: "-hfs-openfolder",
      description: "Folder the Finder opens automatically (HFS+)",
      args: { name: "directory", template: "folders" },
    },
    {
      name: "-hfs-startupfile-size",
      description: "Size in bytes of an empty Startup File (HFS+)",
      args: { name: "bytes" },
    },
    {
      name: "-hfs-volume-name",
      description: "Volume name of the HFS+ filesystem",
      args: nameArg,
    },
    {
      name: "-hide-hfs",
      description: "Glob of files to hide from HFS+",
      args: globArg,
    },
    {
      name: "-only-hfs",
      description: "Glob of files to show only in HFS+",
      args: globArg,
    },
    {
      name: "-abstract-file",
      description: "Abstract file (ISO9660/Joliet)",
      args: sourceFileArg,
    },
    {
      name: "-bibliography-file",
      description: "Bibliography file (ISO9660/Joliet)",
      args: sourceFileArg,
    },
    {
      name: "-copyright-file",
      description: "Copyright file (ISO9660/Joliet)",
      args: sourceFileArg,
    },
    {
      name: "-application",
      description: "Creator application name (ISO9660/Joliet)",
      args: nameArg,
    },
    {
      name: "-preparer",
      description: "Data preparer name (ISO9660/Joliet)",
      args: nameArg,
    },
    {
      name: "-publisher",
      description: "Publisher name (ISO9660/Joliet)",
      args: nameArg,
    },
    {
      name: "-system-id",
      description: "System identifier (ISO9660/Joliet)",
      args: { name: "id" },
    },
    {
      name: "-keep-mac-specific",
      description: "Keep Mac-specific files such as .DS_Store (ISO9660/Joliet)",
    },
    {
      name: "-eltorito-boot",
      description: "El Torito boot image inside the source (ISO9660/Joliet)",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "-hard-disk-boot",
      description: "Use El Torito hard disk emulation",
    },
    {
      name: "-no-emul-boot",
      description: "Use El Torito no emulation mode",
    },
    {
      name: "-no-boot",
      description: "Mark the El Torito image as not bootable",
    },
    {
      name: "-boot-load-seg",
      description: "Segment address to load a no-emulation boot image at",
      args: { name: "segment" },
    },
    {
      name: "-boot-load-size",
      description: "Sectors of a no-emulation boot image to load (default 4)",
      args: { name: "sectors" },
    },
    {
      name: "-eltorito-platform",
      description: "Numeric El Torito platform ID (default 0, x86)",
      args: { name: "id" },
    },
    {
      name: "-eltorito-specification",
      description: "Plist array of dictionaries describing extra boot images",
      args: { name: "plist" },
    },
    {
      name: "-iso-volume-name",
      description: "Volume name of the ISO9660 filesystem",
      args: nameArg,
    },
    {
      name: "-joliet-volume-name",
      description: "Volume name of the Joliet filesystem",
      args: nameArg,
    },
    {
      name: "-hide-iso",
      description: "Glob of files to hide from ISO9660",
      args: globArg,
    },
    {
      name: "-hide-joliet",
      description: "Glob of files to hide from Joliet",
      args: globArg,
    },
    {
      name: "-only-iso",
      description: "Glob of files to show only in ISO9660",
      args: globArg,
    },
    {
      name: "-only-joliet",
      description: "Glob of files to show only in Joliet",
      args: globArg,
    },
    {
      name: "-udf-version",
      description: "UDF version to generate (default 1.50)",
      args: { name: "version", suggestions: ["1.50", "1.02"] },
    },
    {
      name: "-udf-volume-name",
      description: "Volume name of the UDF filesystem",
      args: nameArg,
    },
    {
      name: "-hide-udf",
      description: "Glob of files to hide from UDF",
      args: globArg,
    },
    {
      name: "-only-udf",
      description: "Glob of files to show only in UDF",
      args: globArg,
    },
    {
      name: "-default-volume-name",
      description: "Volume name of every filesystem (default: source name)",
      args: nameArg,
    },
    {
      name: "-hide-all",
      description: "Glob of files to hide from every filesystem",
      args: globArg,
    },
    overwriteOption,
    {
      name: "-print-size",
      description: "Print an upper bound of the image size and quit",
    },
    {
      name: "-plistin",
      description: "Read the options as a plist from standard input",
    },
    ...toggle(
      "verify",
      "Verify a source disk image",
      "Do not verify a source disk image",
    ),
    ...toggle(
      "kernel",
      "Attach a source disk image in the kernel",
      "Attach a source disk image with a helper process",
    ),
    ...encryptionOptions,
    ...shadowOptions,
    ...verbosityOptions,
  ],
};

const mountvol: Fig.Subcommand = {
  name: "mountvol",
  description: "Mount a volume using Disk Arbitration",
  args: {
    name: "device",
    description: "/dev entry of the volume",
    generators: unmountedGenerator,
  },
  options: [
    {
      name: "-whole",
      description: "Mount every partition on the same disk",
    },
    {
      name: "-notimeout",
      description: "Wait for the mount without a time limit",
      exclusiveOn: ["-timeout"],
    },
    {
      name: "-timeout",
      description: "Give up mounting after this many seconds (default 30)",
      exclusiveOn: ["-notimeout"],
      args: { name: "seconds" },
    },
    plistOption,
    ...verbosityOptions,
  ],
};

const unmount: Fig.Subcommand = {
  name: "unmount",
  description: "Unmount a volume without detaching its image",
  args: {
    name: "volume",
    description: "Mount point or /dev entry",
    generators: mountedGenerator,
  },
  options: [
    {
      name: "-force",
      description: "Unmount even if files on the volume are open",
    },
    {
      name: "-whole",
      description: "Unmount every partition on the same disk",
    },
    {
      name: "-notimeout",
      description: "Wait for the unmount without a time limit",
      exclusiveOn: ["-timeout"],
    },
    {
      name: "-timeout",
      description: "Give up unmounting after this many seconds (default 30)",
      exclusiveOn: ["-notimeout"],
      args: { name: "seconds" },
    },
    ...verbosityOptions,
  ],
};

const plugins: Fig.Subcommand = {
  name: "plugins",
  description: "Show the installed DiskImages plugins",
  options: [plistOption, ...verbosityOptions],
};

const resizeSizeOptions = ["-size", "-sectors"];
const limitsOptions = ["-limits", "-alllimits"];

const resize: Fig.Subcommand = {
  name: "resize",
  description: "Resize an image, its partition or its HFS+ filesystem",
  args: imageArg,
  options: [
    {
      name: "-size",
      description: "New size with a unit: b (sectors), k, m, g, t, p or e",
      exclusiveOn: ["-sectors", ...limitsOptions],
      args: {
        ...sizeArg,
        suggestions: [{ name: "min", description: "Smallest possible size" }],
      },
    },
    {
      name: "-sectors",
      description: "New size in 512-byte sectors, or min",
      exclusiveOn: ["-size", ...limitsOptions],
      args: {
        name: "count",
        suggestions: [{ name: "min", description: "Smallest possible size" }],
      },
    },
    {
      name: "-imageonly",
      description: "Resize only the image file",
      exclusiveOn: ["-partitiononly"],
    },
    {
      name: "-partitiononly",
      description: "Resize only the partition and filesystem",
      exclusiveOn: ["-imageonly"],
    },
    {
      name: "-partitionID",
      description: "1-based number of the partition to resize",
      exclusiveOn: ["-alllimits"],
      args: { name: "id" },
    },
    {
      name: "-nofinalgap",
      description: "Allow removing the trailing free space of an APM map",
    },
    {
      name: "-limits",
      description: "Print the minimum, current and maximum sizes, no resize",
      exclusiveOn: ["-alllimits", ...resizeSizeOptions],
    },
    {
      name: "-alllimits",
      description: "Print resize limits of the image and every partition",
      exclusiveOn: ["-limits", "-partitionID", ...resizeSizeOptions],
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    plistOption,
    ...verbosityOptions,
  ],
};

const segment: Fig.Subcommand = {
  name: "segment",
  description: "Split a UDIF image into segments (deprecated)",
  deprecated: true,
  args: imageArg,
  options: [
    {
      name: "-o",
      description: "Path of the first segment",
      isRequired: true,
      args: { name: "outfile", template: "filepaths" },
    },
    {
      name: "-segmentCount",
      description: "Number of segments",
      exclusiveOn: ["-segmentSize"],
      args: { name: "count" },
    },
    {
      name: "-segmentSize",
      description: "Segment size, in sectors unless a unit is given",
      exclusiveOn: ["-segmentCount"],
      args: { name: "size" },
    },
    {
      name: "-firstSegmentSize",
      description: "Size of the first segment",
      args: { name: "size" },
    },
    {
      name: "-restricted",
      description: "Make restricted segments for multi-CD restores",
    },
    overwriteOption,
    ...encryptionOptions,
    srcImageKeyOption,
    tgtImageKeyOption,
    plistOption,
    puppetstringsOption,
    ...verbosityOptions,
  ],
};

const reportOptions = ["-simple", "-standard", "-complete", "-diagnostic"];

const reportOption = (name: string, description: string): Fig.Option => ({
  name,
  description,
  exclusiveOn: reportOptions.filter((other) => other !== name),
});

const pmap: Fig.Subcommand = {
  name: "pmap",
  description: "Show the partition map of an image or device",
  args: {
    name: "image|device",
    generators: [imageOrDeviceFiles, attachedDevicesGenerator],
  },
  options: [
    reportOption("-simple", "Minimal report: partition types, names and sizes"),
    reportOption(
      "-standard",
      "Standard report with offsets in sectors (default)",
    ),
    reportOption("-complete", "Comprehensive report with end offsets"),
    reportOption("-diagnostic", "Diagnostic report of every partition scheme"),
    {
      name: "-endoffsets",
      description: "Show the last block of each partition",
    },
    {
      name: "-nofreespace",
      description: "Hide free space",
      exclusiveOn: ["-shims"],
    },
    {
      name: "-shims",
      description: "Show free space smaller than 32 sectors",
      exclusiveOn: ["-nofreespace"],
    },
    { name: "-uuids", description: "Show the UUID of each partition" },
    // pmap rejects -insecurehttp and -cacert, which hdiutil passes as image keys
    shadowOption,
    ...verbosityOptions,
  ],
};

const udifderez: Fig.Subcommand = {
  name: "udifderez",
  description: "Extract the resources of a UDIF image (deprecated)",
  deprecated: true,
  args: imageArg,
  options: [
    {
      name: "-xml",
      description: "Print the resources as XML (default)",
      exclusiveOn: ["-rez"],
    },
    {
      name: "-rez",
      description: "Print the resources in Rez format",
      exclusiveOn: ["-xml"],
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...verbosityOptions,
  ],
};

const udifrez: Fig.Subcommand = {
  name: "udifrez",
  description: "Embed resources in a UDIF image (deprecated)",
  deprecated: true,
  args: imageArg,
  options: [
    {
      name: "-xml",
      description: "Copy resources from this XML resource file",
      args: {
        name: "file",
        generators: filepaths({ extensions: ["xml", "plist"] }),
      },
    },
    {
      name: "-replaceall",
      description: "Delete all existing resources first",
      isDangerous: true,
    },
    ...encryptionOptions,
    srcImageKeyOption,
    ...verbosityOptions,
  ],
};

const fsid: Fig.Subcommand = {
  name: "fsid",
  description: "Print information about the filesystems on an image or device",
  args: {
    name: "image|device",
    generators: [imageOrDeviceFiles, attachedDevicesGenerator],
  },
  options: [
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    ...verbosityOptions,
  ],
};

// Not in `hdiutil help`, but the macOS 27 man page names it
const partition: Fig.Subcommand = {
  name: "partition",
  description: "List the partitions of an image or device",
  hidden: true,
  args: {
    name: "image|device",
    generators: [imageOrDeviceFiles, attachedDevicesGenerator],
  },
  options: [
    { name: "-list", description: "List the partitions" },
    ...encryptionOptions,
    srcImageKeyOption,
    ...shadowOptions,
    ...verbosityOptions,
  ],
};

const completionSpec: Fig.Spec = {
  name: "hdiutil",
  description:
    "Manipulate disk images (deprecated in macOS 27 in favour of diskutil image)",
  parserDirectives: { flagsArePosixNoncompliant: true },
  subcommands: [
    attach,
    detach,
    verify,
    create,
    compact,
    convert,
    burn,
    info,
    checksum,
    chpass,
    erasekeys,
    imageinfo,
    isencrypted,
    makehybrid,
    mountvol,
    unmount,
    plugins,
    resize,
    segment,
    pmap,
    udifderez,
    udifrez,
    fsid,
    partition,
    { name: "help", description: "Show usage for every verb" },
  ],
};

export default completionSpec;
