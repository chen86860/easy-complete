import { filepaths } from "@fig/autocomplete-generators";

// Options follow FFmpeg 9.1. ffprobe's own option table has not changed since
// 8.1 and older releases only lack a few options, which say so in their
// descriptions, so the spec is not versioned. Argument arity comes from that
// table rather than from `ffprobe -h`, which shows an argument for -hide_banner
// and none for several options that take one. Demuxer, decoder, device,
// protocol and pixel format names come from the installed ffprobe, because
// they depend on how FFmpeg was built.
//
// The arguments of -h, -sources and -sinks are optional and also declared
// variadic: the engine only completes an optional option argument ahead of
// the pending input_url when the argument is variadic. Extra values are
// harmless, because each of these options prints its listing and exits.
//
// Any unknown -name is passed to libavformat and libavcodec as an AVOption
// that takes one value; only the commonly used ones of those 2,200 are
// listed. The mermaid writers are left out of -of: they only draw filter
// graphs, and 9.0 crashes on them.

// With FFREPORT set, every run would leave a report file in the current
// directory
const listingCommand = (flag: string): Fig.ExecuteCommandInput => ({
  command: "ffprobe",
  args: ["-hide_banner", "-loglevel", "quiet", flag],
  env: { FFREPORT: undefined },
});

// The listings only change when FFmpeg is upgraded
const listing = (
  flag: string,
  parse: (out: string) => Fig.Suggestion[],
): Fig.Generator => ({
  script: listingCommand(flag),
  cache: {
    strategy: "stale-while-revalidate",
    ttl: 1000 * 60 * 60 * 24,
    cacheKey: `ffprobe ${flag}`,
  },
  postProcess: (out) => parse(out),
});

// "-demuxers" and "-muxers" rows: " D   matroska,webm   Matroska / WebM", with
// a device flag in the third column (" D d avfoundation ...")
const parseFormats = (out: string, column: "D" | "E"): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^ ([D ])([E ])([d ]?) (\S+)\s+(.*)$/);
    if (!match || !(match[1] + match[2]).includes(column)) {
      return [];
    }
    return match[4]
      .split(",")
      .map((name) => ({ name, description: match[5].trim() }));
  });

// "-decoders" and "-encoders" rows: " V....D h264    H.264 / AVC / ..."
const parseCodecs = (out: string, type?: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^ ([VASDT])[F.][S.][X.][B.][D.] (\S+)\s+(.*)$/);
    if (!match || match[2] === "=" || (type && match[1] !== type)) {
      return [];
    }
    return [{ name: match[2], description: match[3].trim() }];
  });

// "-devices" rows: " D  avfoundation    AVFoundation input device"
const parseDevices = (out: string, column: "D" | "E"): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^ ([D ])([E ]) (\S+)\s+(.*)$/);
    if (!match || !(match[1] + match[2]).includes(column)) {
      return [];
    }
    return [{ name: match[3], description: match[4].trim() }];
  });

// "-protocols" prints "Input:" and "Output:", each followed by names indented
// two spaces
const parseProtocols = (out: string, headings: string[]): Fig.Suggestion[] => {
  const names = new Set<string>();
  let heading = "";
  for (const line of out.split("\n")) {
    if (!line.startsWith("  ")) {
      heading = line.trim();
    } else if (headings.includes(heading)) {
      names.add(line.trim());
    }
  }
  return [...names].map((name) => ({ name, description: "Protocol" }));
};

// "-filters" rows: " TS aap               AA->A      Apply Affine Projection ..."
const parseFilters = (out: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^ [T.][S.] (\S+)\s+\S+\s+(.*)$/);
    return match ? [{ name: match[1], description: match[2].trim() }] : [];
  });

// "-bsfs" prints a "Bitstream filters:" heading, then one name per line
const parseBitstreamFilters = (out: string): Fig.Suggestion[] =>
  out
    .split("\n")
    .filter((line) => /^\w+$/.test(line))
    .map((name) => ({ name, description: "Bitstream filter" }));

// "-pix_fmts" rows: "IO... yuv420p                3             12      8-8-8"
const parsePixelFormats = (out: string): Fig.Suggestion[] =>
  out.split("\n").flatMap((line) => {
    const match = line.match(/^[I.][O.][H.][P.][B.] (\S+)\s+\d+\s+(\d+)/);
    return match
      ? [{ name: match[1], description: `${match[2]} bits per pixel` }]
      : [];
  });

const demuxersGenerator = listing("-demuxers", (out) => parseFormats(out, "D"));
const decodersGenerator = (type?: string) =>
  listing("-decoders", (out) => parseCodecs(out, type));
const inputProtocolsGenerator = listing("-protocols", (out) =>
  parseProtocols(out, ["Input:"]),
);

// For comma-separated values: completes the value after the last comma and
// leaves out the ones already listed
const commaList = (generator: Fig.Generator): Fig.Generator => ({
  ...generator,
  trigger: ",",
  getQueryTerm: ",",
  postProcess: (out, tokens) => {
    const listed = new Set(
      (tokens[tokens.length - 1] ?? "").split(",").slice(0, -1),
    );
    return generator
      .postProcess(out, tokens)
      .filter(({ name }) => !listed.has(name as string));
  },
});

// For values made of parts, such as "stream=width,height" or "+genpts+igndts":
// completes the part after the last separator, and reruns `custom` whenever
// the text before it changes
const partsGenerator = (
  separators: string,
  custom: Fig.Generator["custom"],
): Fig.Generator => {
  const head = (token: string) =>
    token.slice(
      0,
      Math.max(
        ...[...separators].map((separator) => token.lastIndexOf(separator)),
      ) + 1,
    );
  return {
    trigger: (newToken, oldToken) => head(newToken) !== head(oldToken),
    getQueryTerm: (token) => token.slice(head(token).length),
    custom,
  };
};

// AVOption flags combine as "flag1+flag2", or "+flag"/"-flag" to change the
// defaults
const flagsGenerator = (flags: Fig.Suggestion[]): Fig.Generator =>
  partsGenerator("+-", async (tokens) => {
    const given = (tokens[tokens.length - 1] ?? "").split(/[+-]/).slice(0, -1);
    return flags.filter(({ name }) => !given.includes(name as string));
  });

const flagsArg = (flags: Fig.Suggestion[]): Fig.Arg => ({
  name: "flags",
  generators: flagsGenerator(flags),
});

const booleanArg: Fig.Arg = {
  name: "boolean",
  suggestions: [
    { name: "1", description: "Enable" },
    { name: "0", description: "Disable" },
  ],
};

const logLevels = [
  { name: "quiet", value: -8, description: "Show nothing" },
  {
    name: "panic",
    value: 0,
    description: "Only errors that crash the process",
  },
  { name: "fatal", value: 8, description: "Only unrecoverable errors" },
  { name: "error", value: 16, description: "All errors" },
  { name: "warning", value: 24, description: "Warnings and errors" },
  { name: "info", value: 32, description: "Informative messages, the default" },
  { name: "verbose", value: 40, description: "Like info, but more verbose" },
  { name: "debug", value: 48, description: "Debugging information too" },
  { name: "trace", value: 56, description: "Everything" },
];

const logFlags: Fig.Suggestion[] = [
  { name: "repeat+", description: "Print repeated messages in full" },
  { name: "level+", description: "Prefix each message with its level" },
  { name: "time+", description: "Prefix each message with the time" },
  { name: "datetime+", description: "Prefix each message with date and time" },
];

const writers: Fig.Suggestion[] = [
  { name: "default", description: "[SECTION] blocks of key=value lines" },
  { name: "compact", description: "One line per section, fields split by |" },
  {
    name: "csv",
    description: "One line of comma-separated values per section",
  },
  { name: "flat", description: "One shell-escaped key=value line per field" },
  { name: "ini", description: "INI file" },
  { name: "json", description: "JSON" },
  { name: "xml", description: "XML" },
  { name: "default=nw=1", description: "key=value lines without [SECTION]" },
  { name: "default=nw=1:nk=1", description: "Bare values, one per line" },
  { name: "compact=p=0", description: "Compact without section names" },
  { name: "compact=p=0:nk=1", description: "Bare values separated by |" },
  { name: "csv=p=0", description: "Bare comma-separated values" },
  {
    name: "csv=s=x:p=0",
    description: "Values joined by x, as in WIDTHxHEIGHT",
  },
  { name: "flat=s=_", description: "Keys usable as shell variable names" },
  { name: "json=c=1", description: "JSON with one line per section" },
  { name: "xml=q=1:x=1", description: "XSD-compliant XML (add -noprivate)" },
];

const streamSpecifiers: Fig.Suggestion[] = [
  { name: "v", description: "Video streams" },
  { name: "a", description: "Audio streams" },
  { name: "s", description: "Subtitle streams" },
  { name: "d", description: "Data streams" },
  { name: "t", description: "Attachment streams" },
  { name: "V", description: "Video streams that are not attached pictures" },
  { name: "v:0", description: "First video stream" },
  { name: "a:0", description: "First audio stream" },
  { name: "s:0", description: "First subtitle stream" },
  { name: "0", description: "Stream with index 0" },
  {
    name: "p:",
    description: "Streams in the program with this ID: p:ID[:SPEC]",
  },
  {
    name: "g:",
    description: "Streams in a stream group: g:INDEX, g:#ID or g:i:ID[:SPEC]",
  },
  { name: "i:", description: "Stream with this format-specific ID: i:ID" },
  {
    name: "m:language:",
    description: "Streams with a metadata tag: m:KEY[:VALUE]",
  },
  { name: "u", description: "Streams with a usable codec configuration" },
];

const readIntervals: Fig.Suggestion[] = [
  { name: "%+#1", description: "First packet only" },
  { name: "%+10", description: "First 10 seconds" },
  { name: "10%+20", description: "20 seconds from 00:10" },
  { name: "%02:30", description: "From the start to 02:30" },
  { name: "01:23%+#42", description: "42 packets from 01:23" },
];

const hashAlgorithms = [
  "MD5",
  "murmur3",
  "RIPEMD128",
  "RIPEMD160",
  "RIPEMD256",
  "RIPEMD320",
  "SHA160",
  "SHA224",
  "SHA256",
  "SHA512/224",
  "SHA512/256",
  "SHA384",
  "SHA512",
  "CRC32",
  "adler32",
];

const cpuFlags: Fig.Suggestion[] = [
  ...[
    "armv8",
    "neon",
    "vfp",
    "dotprod",
    "i8mm",
    "sve",
    "sve2",
    "sme",
    "crc",
    "sme_i16i64",
    "sme2",
    "pmull",
    "eor3",
  ].map((name) => ({ name, description: "ARM CPU flag" })),
  { name: "aes", description: "ARM CPU flag (FFmpeg 9.1+)" },
  ...[
    "mmx",
    "mmxext",
    "sse",
    "sse2",
    "sse3",
    "ssse3",
    "sse4.1",
    "sse4.2",
    "avx",
    "avx2",
    "fma3",
    "bmi1",
    "bmi2",
    "avx512",
    "avx512icl",
  ].map((name) => ({ name, description: "x86 CPU flag" })),
  { name: "0", description: "Clear all flags" },
];

// Help topics and the listing that names their components
const helpTopics: Record<
  string,
  {
    description: string;
    flag: string;
    parse: (out: string) => Fig.Suggestion[];
  }
> = {
  decoder: {
    description: "Show a decoder's options",
    flag: "-decoders",
    parse: (out) => parseCodecs(out),
  },
  encoder: {
    description: "Show an encoder's options",
    flag: "-encoders",
    parse: (out) => parseCodecs(out),
  },
  demuxer: {
    description: "Show a demuxer's options",
    flag: "-demuxers",
    parse: (out) => parseFormats(out, "D"),
  },
  muxer: {
    description: "Show a muxer's options",
    flag: "-muxers",
    parse: (out) => parseFormats(out, "E"),
  },
  filter: {
    description: "Show a filter's options",
    flag: "-filters",
    parse: parseFilters,
  },
  bsf: {
    description: "Show a bitstream filter's options",
    flag: "-bsfs",
    parse: parseBitstreamFilters,
  },
  protocol: {
    description: "Show a protocol's options",
    flag: "-protocols",
    parse: (out) => parseProtocols(out, ["Input:", "Output:"]),
  },
};

const helpTopicGenerator = partsGenerator(
  "=",
  async (tokens, executeCommand) => {
    const token = tokens[tokens.length - 1] ?? "";
    const separator = token.indexOf("=");
    if (separator === -1) {
      return [
        { name: "long", description: "Same as plain -h in ffprobe" },
        { name: "full", description: "Same as plain -h in ffprobe" },
        ...Object.entries(helpTopics).map(([name, { description }]) => ({
          name: `${name}=`,
          description,
        })),
      ];
    }
    const topic = helpTopics[token.slice(0, separator)];
    if (!topic) {
      return [];
    }
    const { stdout } = await executeCommand(listingCommand(topic.flag));
    return topic.parse(stdout);
  },
);

// -show_entries sections and their fields, from ffprobe.c in FFmpeg 9.1
const sections: Fig.Suggestion[] = [
  { name: "format", description: "Container format" },
  { name: "format_tags", description: "Container metadata tags" },
  { name: "stream", description: "Streams" },
  { name: "stream_tags", description: "Stream metadata tags" },
  { name: "stream_disposition", description: "Stream disposition flags" },
  { name: "stream_side_data", description: "Stream side data" },
  { name: "packet", description: "Packets" },
  { name: "packet_tags", description: "Packet metadata tags" },
  { name: "packet_side_data", description: "Packet side data" },
  { name: "frame", description: "Decoded frames" },
  { name: "frame_tags", description: "Frame metadata tags" },
  { name: "frame_side_data", description: "Frame side data" },
  { name: "subtitle", description: "Decoded subtitles" },
  { name: "chapter", description: "Chapters" },
  { name: "chapter_tags", description: "Chapter metadata tags" },
  { name: "program", description: "Programs" },
  { name: "program_tags", description: "Program metadata tags" },
  { name: "program_stream", description: "Streams within programs" },
  { name: "stream_group", description: "Stream groups" },
  { name: "stream_group_stream", description: "Streams within stream groups" },
  { name: "error", description: "Probing error" },
  { name: "program_version", description: "ffprobe version" },
  { name: "library_version", description: "Library versions" },
  { name: "pixel_format", description: "Pixel format descriptions" },
  { name: "log", description: "Decoder log messages, with -show_log" },
  { name: "tags", description: "Metadata tags of every section" },
  { name: "disposition", description: "Disposition flags of every section" },
];

const showEntriesPresets: Fig.Suggestion[] = [
  { name: "format=duration", description: "Duration in seconds" },
  { name: "stream=width,height", description: "Video dimensions" },
  {
    name: "stream=codec_name,width,height,r_frame_rate,pix_fmt",
    description: "Main video properties",
  },
  { name: "stream_tags=language", description: "Stream languages" },
  {
    name: "stream=nb_read_frames",
    description: "Frame count, with -count_frames",
  },
  {
    name: "stream_side_data=rotation",
    description: "Rotation from the display matrix",
  },
  { name: "frame=pts_time,pict_type", description: "Frame times and types" },
  {
    name: "packet=pts_time,duration_time,stream_index,flags",
    description: "Packet timing and keyframe flags",
  },
];

const sectionFields: Record<string, string[]> = {
  format: [
    "filename",
    "nb_streams",
    "nb_programs",
    "nb_stream_groups",
    "format_name",
    "format_long_name",
    "start_time",
    "duration",
    "size",
    "bit_rate",
    "probe_score",
  ],
  stream: [
    "index",
    "codec_name",
    "codec_long_name",
    "profile",
    "level",
    "codec_type",
    "codec_tag_string",
    "codec_tag",
    "mime_codec_string",
    "extradata",
    "extradata_size",
    "extradata_hash",
    "width",
    "height",
    "coded_width",
    "coded_height",
    "closed_captions",
    "film_grain",
    "has_b_frames",
    "sample_aspect_ratio",
    "display_aspect_ratio",
    "pix_fmt",
    "color_range",
    "color_space",
    "color_transfer",
    "color_primaries",
    "chroma_location",
    "field_order",
    "refs",
    "sample_fmt",
    "sample_rate",
    "channels",
    "channel_layout",
    "bits_per_sample",
    "initial_padding",
    "seek_preroll",
    "id",
    "r_frame_rate",
    "avg_frame_rate",
    "time_base",
    "start_pts",
    "start_time",
    "duration_ts",
    "duration",
    "bit_rate",
    "max_bit_rate",
    "bits_per_raw_sample",
    "nb_frames",
    "nb_read_frames",
    "nb_read_packets",
  ],
  packet: [
    "codec_type",
    "stream_index",
    "pts",
    "pts_time",
    "dts",
    "dts_time",
    "duration",
    "duration_time",
    "size",
    "pos",
    "flags",
    "data",
    "data_hash",
  ],
  frame: [
    "media_type",
    "stream_index",
    "key_frame",
    "pts",
    "pts_time",
    "pkt_dts",
    "pkt_dts_time",
    "best_effort_timestamp",
    "best_effort_timestamp_time",
    "duration",
    "duration_time",
    "pkt_pos",
    "pkt_size",
    "width",
    "height",
    "crop_top",
    "crop_bottom",
    "crop_left",
    "crop_right",
    "pix_fmt",
    "sample_aspect_ratio",
    "pict_type",
    "interlaced_frame",
    "top_field_first",
    "lossless",
    "repeat_pict",
    "color_range",
    "color_space",
    "color_primaries",
    "color_transfer",
    "chroma_location",
    "alpha_mode",
    "sample_fmt",
    "nb_samples",
    "channels",
    "channel_layout",
  ],
  subtitle: [
    "media_type",
    "pts",
    "pts_time",
    "format",
    "start_display_time",
    "end_display_time",
    "num_rects",
  ],
  chapter: ["id", "time_base", "start", "start_time", "end", "end_time"],
  program: ["program_id", "program_num", "nb_streams", "pmt_pid", "pcr_pid"],
  stream_group: ["index", "id", "nb_streams", "type"],
  error: ["code", "string"],
  program_version: ["version", "copyright", "compiler_ident", "configuration"],
  library_version: ["name", "major", "minor", "micro", "version", "ident"],
  pixel_format: [
    "name",
    "nb_components",
    "log2_chroma_w",
    "log2_chroma_h",
    "bits_per_pixel",
  ],
  pixel_format_flags: [
    "big_endian",
    "palette",
    "bitstream",
    "hwaccel",
    "planar",
    "rgb",
    "alpha",
  ],
  component: ["index", "bit_depth"],
  log: [
    "context",
    "level",
    "category",
    "parent_context",
    "parent_category",
    "message",
  ],
};

// Unique section names that print the same fields as another section
const sectionAliases: Record<string, string> = {
  program_stream: "stream",
  stream_group_stream: "stream",
  stream_group_stream_group: "stream_group",
};

const dispositions = [
  "default",
  "dub",
  "original",
  "comment",
  "lyrics",
  "karaoke",
  "forced",
  "hearing_impaired",
  "visual_impaired",
  "clean_effects",
  "attached_pic",
  "timed_thumbnails",
  "non_diegetic",
  "captions",
  "descriptions",
  "metadata",
  "dependent",
  "still_image",
  "multilayer",
];

// Tag keys vary by file; these are the common ones
const tagKeys = [
  "title",
  "language",
  "encoder",
  "creation_time",
  "handler_name",
  "major_brand",
  "artist",
  "album",
  "date",
  "comment",
  "timecode",
];

const sectionEntries = (section: string): Fig.Suggestion[] => {
  const described = (names: string[], description: string) =>
    names.map((name) => ({ name, description }));
  if (section === "tags" || section.endsWith("_tags")) {
    return described(tagKeys, "Metadata tag");
  }
  if (section.endsWith("disposition")) {
    return described(dispositions, "Disposition flag");
  }
  if (section.endsWith("side_data")) {
    return described(
      ["side_data_type", "displaymatrix", "rotation"],
      "Side data field",
    );
  }
  const fields = sectionFields[sectionAliases[section] ?? section] ?? [];
  return described(fields, `Field of ${section}`);
};

// SECTION[=FIELD[,FIELD...]][:SECTION...]
const showEntriesGenerator = partsGenerator(":=,", async (tokens) => {
  const segments = (tokens[tokens.length - 1] ?? "").split(":");
  const current = segments[segments.length - 1];
  const equals = current.indexOf("=");
  if (equals === -1) {
    const named = new Set(
      segments.slice(0, -1).map((segment) => segment.split("=")[0]),
    );
    return [
      ...(segments.length === 1 ? showEntriesPresets : []),
      ...sections.filter(({ name }) => !named.has(name as string)),
    ];
  }
  const listed = new Set(
    current
      .slice(equals + 1)
      .split(",")
      .slice(0, -1),
  );
  return sectionEntries(current.slice(0, equals)).filter(
    ({ name }) => !listed.has(name as string),
  );
});

// `type` is the media type letter of the -decoders listing
const decoderOption = (type: string, kind: string): Fig.Option => ({
  name: [`-c:${type.toLowerCase()}`, `-codec:${type.toLowerCase()}`],
  description: `Force the decoder of ${kind} streams (FFmpeg 8.1+)`,
  args: { name: "decoder", generators: decodersGenerator(type) },
});

const ffprobeOptions: Fig.Option[] = [
  {
    name: ["-L", "-license"],
    description: "Show license (-license: FFmpeg 8.1+)",
  },
  {
    name: ["-h", "-?", "-help", "--help"],
    description: "Show help, or the options of one component",
    args: {
      name: "topic",
      generators: helpTopicGenerator,
      isOptional: true,
      isVariadic: true,
    },
  },
  { name: "-version", description: "Show version" },
  { name: "-buildconf", description: "Show build configuration" },
  { name: "-formats", description: "Show available formats" },
  { name: "-muxers", description: "Show available muxers" },
  { name: "-demuxers", description: "Show available demuxers" },
  { name: "-devices", description: "Show available devices" },
  { name: "-codecs", description: "Show available codecs" },
  { name: "-decoders", description: "Show available decoders" },
  { name: "-encoders", description: "Show available encoders" },
  { name: "-bsfs", description: "Show available bitstream filters" },
  { name: "-protocols", description: "Show available protocols" },
  { name: "-filters", description: "Show available filters" },
  { name: "-pix_fmts", description: "Show available pixel formats" },
  { name: "-layouts", description: "Show standard channel layouts" },
  { name: "-sample_fmts", description: "Show available audio sample formats" },
  { name: "-dispositions", description: "Show available stream dispositions" },
  { name: "-colors", description: "Show available color names" },
  {
    name: ["-v", "-loglevel"],
    description: "Set the logging level and flags",
    priority: 60,
    args: {
      name: "level",
      description: "[FLAG+...]LEVEL",
      generators: partsGenerator("+", async (tokens) => {
        const given = (tokens[tokens.length - 1] ?? "").split("+");
        return [
          ...logLevels.map(({ name, value, description }) => ({
            name,
            description: `${description} (${value})`,
          })),
          ...logFlags.filter(
            ({ name }) => !given.includes((name as string).slice(0, -1)),
          ),
        ];
      }),
    },
  },
  {
    name: "-report",
    description: "Write the command line and full log to ffprobe-DATE-TIME.log",
  },
  {
    name: "-max_alloc",
    description: "Set the maximum size of a single allocated block",
    args: { name: "bytes" },
  },
  {
    name: "-cpuflags",
    description: "Set or clear CPU flags, for testing",
    args: { name: "flags", generators: flagsGenerator(cpuFlags) },
  },
  {
    name: "-cpucount",
    description: "Override the detected CPU count, for testing",
    args: { name: "count" },
  },
  {
    name: "-hide_banner",
    description: "Hide the copyright notice and build information",
    priority: 60,
  },
  {
    name: "-sources",
    description: "List the sources of an input device",
    args: {
      name: "device",
      generators: listing("-devices", (out) => parseDevices(out, "D")),
      isOptional: true,
      isVariadic: true,
    },
  },
  {
    name: "-sinks",
    description: "List the sinks of an output device",
    args: {
      name: "device",
      generators: listing("-devices", (out) => parseDevices(out, "E")),
      isOptional: true,
      isVariadic: true,
    },
  },
  {
    name: "-f",
    description: "Force the input format",
    args: { name: "format", generators: demuxersGenerator },
  },
  { name: "-unit", description: "Show the unit of displayed values" },
  { name: "-prefix", description: "Use SI prefixes for displayed values" },
  {
    name: "-byte_binary_prefix",
    description: "Use binary prefixes for byte values",
  },
  {
    name: "-sexagesimal",
    description: "Show times as HH:MM:SS.MICROSECONDS",
  },
  {
    name: "-pretty",
    description:
      "Make values human-readable (-unit -prefix -byte_binary_prefix -sexagesimal)",
  },
  {
    name: ["-of", "-output_format", "-print_format"],
    description: "Set the output format",
    priority: 60,
    args: {
      name: "writer",
      description: "WRITER[=KEY=VALUE[:KEY=VALUE...]]",
      suggestions: writers,
    },
  },
  {
    name: "-select_streams",
    description: "Only show streams matching a stream specifier",
    priority: 60,
    args: { name: "stream_specifier", suggestions: streamSpecifiers },
  },
  {
    name: "-sections",
    description: "Print the output section structure and exit",
  },
  {
    name: "-data_dump_format",
    description: "Set the format of -show_data dumps (FFmpeg 8.1+)",
    args: {
      name: "format",
      suggestions: [
        { name: "xxd", description: "Hex dump, as xxd prints it (default)" },
        { name: "base64", description: "Base64" },
      ],
    },
  },
  {
    name: "-show_data",
    description: "Dump packet data, or codec extradata with -show_streams",
  },
  {
    name: "-show_data_hash",
    description: "Hash packet data, or codec extradata with -show_streams",
    args: { name: "algorithm", suggestions: hashAlgorithms },
  },
  { name: "-show_error", description: "Show the error found while probing" },
  {
    name: "-show_format",
    description: "Show container format information",
    priority: 60,
  },
  {
    name: "-show_frames",
    description: "Show every frame and subtitle",
    priority: 60,
  },
  {
    name: "-show_entries",
    description: "Show the listed sections, limited to the listed fields",
    priority: 60,
    isRepeatable: true,
    args: {
      name: "entries",
      description: "SECTION[=FIELD[,FIELD...]][:SECTION...]",
      generators: showEntriesGenerator,
    },
  },
  {
    name: "-show_log",
    description: "Show decoder log messages for each frame, with -show_frames",
    args: {
      name: "level",
      suggestions: logLevels
        .filter(({ value }) => value >= 0)
        .map(({ name, value, description }) => ({
          name: `${value}`,
          description: `${name}: ${description}`,
        })),
    },
  },
  {
    name: "-show_packets",
    description: "Show every packet",
    priority: 60,
  },
  { name: "-show_programs", description: "Show programs and their streams" },
  {
    name: "-show_stream_groups",
    description: "Show stream groups and their streams",
  },
  {
    name: "-show_streams",
    description: "Show every stream",
    priority: 60,
  },
  { name: "-show_chapters", description: "Show chapters" },
  {
    name: "-count_frames",
    description: "Count the frames of each stream, decoding the whole input",
    priority: 60,
  },
  {
    name: "-count_packets",
    description: "Count the packets of each stream, reading the whole input",
  },
  {
    name: "-show_program_version",
    description: "Show the ffprobe version",
    exclusiveOn: ["-bitexact"],
  },
  {
    name: "-show_library_versions",
    description: "Show library versions",
    exclusiveOn: ["-bitexact"],
  },
  {
    name: "-show_versions",
    description: "Show program and library versions",
    exclusiveOn: ["-bitexact"],
  },
  {
    name: "-show_pixel_formats",
    description: "Show pixel format descriptions",
  },
  {
    name: "-show_optional_fields",
    description: "Whether to print fields that have no valid value",
    args: {
      name: "mode",
      suggestions: [
        { name: "always", description: "Print them with every writer" },
        {
          name: "never",
          description: "Hide every field, even those with a valid value",
        },
        {
          name: "auto",
          description:
            "JSON and XML hide them, other writers print them (default)",
        },
      ],
    },
  },
  {
    name: ["-show_private_data", "-private"],
    description: "Show format-specific private data (default)",
  },
  {
    name: ["-noshow_private_data", "-noprivate"],
    description: "Hide format-specific private data, as XSD-valid XML needs",
  },
  {
    name: "-analyze_frames",
    description:
      "Analyze frames for more stream fields, with -show_streams (FFmpeg 8.0+)",
  },
  {
    name: "-bitexact",
    description: "Force output that does not depend on the build",
    exclusiveOn: [
      "-show_program_version",
      "-show_library_versions",
      "-show_versions",
    ],
  },
  {
    name: "-read_intervals",
    description: "Only read the given intervals of the input",
    priority: 60,
    args: {
      name: "intervals",
      description: "[START|+OFFSET][%[END|+OFFSET|+#PACKETS]][,...]",
      suggestions: readIntervals,
    },
  },
  {
    name: "-i",
    description: "Read this input",
    priority: 60,
    args: { name: "input_url", template: "filepaths" },
  },
  {
    name: "-o",
    description: "Write output to a file instead of stdout, overwriting it",
    args: { name: "output_file", template: "filepaths", isDangerous: true },
  },
  {
    name: "-print_filename",
    description: "Override the input filename shown in the output",
    args: { name: "name" },
  },
  {
    name: "-find_stream_info",
    description: "Decode streams to fill in missing information (default)",
  },
  {
    name: "-nofind_stream_info",
    description: "Skip decoding streams to fill in missing information",
  },
  decoderOption("V", "video"),
  decoderOption("A", "audio"),
  decoderOption("S", "subtitle"),
  decoderOption("D", "data"),
];

// Commonly used AVOptions of the format, protocol, demuxer and decoder contexts
const avOptions: Fig.Option[] = [
  // Format
  {
    name: "-probesize",
    description: "Maximum bytes to read when probing the input",
    args: { name: "bytes" },
  },
  {
    name: "-analyzeduration",
    description: "Maximum microseconds of input to analyze for stream info",
    args: { name: "microseconds" },
  },
  {
    name: "-formatprobesize",
    description: "Bytes to read when detecting the format",
    args: { name: "bytes" },
  },
  {
    name: "-fpsprobesize",
    description: "Frames to read when estimating the frame rate",
    args: { name: "frames" },
  },
  {
    name: "-max_probe_packets",
    description: "Maximum packets to buffer when probing a codec",
    args: { name: "count" },
  },
  {
    name: "-fflags",
    description: "Set demuxer flags",
    args: flagsArg([
      { name: "ignidx", description: "Ignore the index" },
      { name: "genpts", description: "Generate missing timestamps" },
      { name: "nofillin", description: "Don't fill in calculable values" },
      { name: "noparse", description: "Disable parsers (needs nofillin)" },
      { name: "igndts", description: "Ignore DTS" },
      { name: "discardcorrupt", description: "Discard corrupted packets" },
      { name: "sortdts", description: "Interleave packets by DTS" },
      { name: "fastseek", description: "Fast but inaccurate seeks" },
      { name: "nobuffer", description: "Reduce buffering latency" },
    ]),
  },
  {
    name: "-avioflags",
    description: "Set I/O flags",
    args: flagsArg([{ name: "direct", description: "Reduce buffering" }]),
  },
  {
    name: "-skip_initial_bytes",
    description: "Skip bytes before reading the header",
    args: { name: "bytes" },
  },
  {
    name: "-seek2any",
    description: "Allow seeking to non-keyframes",
    args: booleanArg,
  },
  {
    name: "-use_wallclock_as_timestamps",
    description: "Use the wall clock as timestamps",
    args: booleanArg,
  },
  {
    name: "-err_detect",
    description: "Set error detection flags",
    args: flagsArg([
      { name: "crccheck", description: "Verify embedded CRCs" },
      { name: "bitstream", description: "Detect bitstream deviations" },
      { name: "buffer", description: "Detect improper bitstream length" },
      { name: "explode", description: "Abort on minor errors" },
      { name: "ignore_err", description: "Ignore errors" },
      { name: "careful", description: "Treat spec violations as errors" },
      { name: "compliant", description: "Treat any non-compliance as error" },
      { name: "aggressive", description: "Treat unusual encoding as error" },
    ]),
  },
  {
    name: "-strict",
    description: "How strictly to follow the standards",
    args: {
      name: "level",
      suggestions: [
        { name: "very", description: "Follow an older, stricter spec" },
        { name: "strict", description: "Follow the spec in every detail" },
        { name: "normal", description: "Default" },
        { name: "unofficial", description: "Allow unofficial extensions" },
        { name: "experimental", description: "Allow experimental features" },
      ],
    },
  },
  {
    name: "-codec_whitelist",
    description: "Only allow these decoders",
    args: { name: "decoders", generators: commaList(decodersGenerator()) },
  },
  {
    name: "-format_whitelist",
    description: "Only allow these demuxers",
    args: { name: "demuxers", generators: commaList(demuxersGenerator) },
  },
  {
    name: "-protocol_whitelist",
    description: "Only allow these protocols",
    args: { name: "protocols", generators: commaList(inputProtocolsGenerator) },
  },
  {
    name: "-protocol_blacklist",
    description: "Never use these protocols",
    args: { name: "protocols", generators: commaList(inputProtocolsGenerator) },
  },
  {
    name: "-max_streams",
    description: "Maximum number of streams",
    args: { name: "count" },
  },
  {
    name: "-cryptokey",
    description: "Decryption key, as hex",
    args: { name: "key" },
  },
  {
    name: "-recursion_limit",
    description:
      "Maximum times a demuxer can be opened recursively (FFmpeg 9.1+)",
    args: { name: "count" },
  },

  // Protocols
  {
    name: "-rw_timeout",
    description: "Timeout for I/O operations, in microseconds",
    args: { name: "microseconds" },
  },
  {
    name: "-timeout",
    description:
      "Socket I/O timeout in microseconds; for RTMP, a listen timeout in seconds",
    args: { name: "timeout" },
  },
  {
    name: "-user_agent",
    description: "Override the HTTP User-Agent header",
    args: { name: "user_agent" },
  },
  {
    name: "-headers",
    description: "Set custom HTTP headers, separated by CRLF",
    args: { name: "headers" },
  },
  {
    name: "-referer",
    description: "Override the HTTP Referer header",
    args: { name: "url" },
  },
  {
    name: "-cookies",
    description: "Set cookies to send with HTTP requests",
    args: { name: "cookies" },
  },
  {
    name: "-http_proxy",
    description: "Tunnel HTTP through this proxy",
    args: { name: "url" },
  },
  {
    name: "-reconnect",
    description: "Reconnect after a disconnect before EOF",
    args: booleanArg,
  },
  {
    name: "-reconnect_at_eof",
    description: "Reconnect at EOF too, for endless streams",
    args: booleanArg,
  },
  {
    name: "-reconnect_streamed",
    description: "Reconnect non-seekable streams too",
    args: booleanArg,
  },
  {
    name: "-reconnect_on_network_error",
    description: "Reconnect on TCP or TLS errors while connecting",
    args: booleanArg,
  },
  {
    name: "-reconnect_delay_max",
    description: "Stop reconnecting after this many seconds",
    args: { name: "seconds" },
  },
  {
    name: "-multiple_requests",
    description: "Use persistent HTTP connections",
    args: booleanArg,
  },
  {
    name: "-seekable",
    description: "Whether the input is seekable",
    args: {
      name: "seekable",
      suggestions: [
        { name: "-1", description: "Detect (default)" },
        { name: "0", description: "Not seekable" },
        {
          name: "1",
          description: "Seekable (HTTP only; files accept -1 or 0)",
        },
      ],
    },
  },
  {
    name: "-icy",
    description: "Request ICY (SHOUTcast) metadata",
    args: booleanArg,
  },
  {
    name: "-method",
    description: "Set the HTTP method",
    args: { name: "method" },
  },
  {
    name: "-offset",
    description: "Start HTTP requests at this byte offset",
    args: { name: "bytes" },
  },
  {
    name: "-end_offset",
    description: "Stop HTTP requests before this byte offset",
    args: { name: "bytes" },
  },
  {
    name: "-tls_verify",
    description: "Verify the TLS peer certificate",
    args: booleanArg,
  },
  {
    name: "-ca_file",
    description: "Certificate authority file for TLS",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "-cert_file",
    description: "TLS client certificate file",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "-key_file",
    description: "TLS client private key file",
    args: { name: "file", template: "filepaths" },
  },
  {
    name: "-follow",
    description: "Keep reading a file that is still being written",
    args: booleanArg,
  },

  // Demuxers
  {
    name: "-safe",
    description: "Reject unsafe paths in concat lists (default 1)",
    args: booleanArg,
  },
  {
    name: "-live_start_index",
    description: "HLS segment to start live streams at, negative from the end",
    args: { name: "index" },
  },
  {
    name: "-allowed_extensions",
    description: "File extensions HLS may open, comma-separated",
    args: {
      name: "extensions",
      suggestions: [{ name: "ALL", description: "Allow every extension" }],
    },
  },
  {
    name: "-http_persistent",
    description: "Use persistent HTTP connections for HLS",
    args: booleanArg,
  },
  {
    name: "-rtsp_transport",
    description: "Set the RTSP transport protocols",
    args: flagsArg([
      { name: "udp", description: "UDP" },
      { name: "tcp", description: "TCP" },
      { name: "udp_multicast", description: "UDP multicast" },
      { name: "http", description: "HTTP tunneling" },
      { name: "https", description: "HTTPS tunneling" },
    ]),
  },
  {
    name: "-pattern_type",
    description: "Filename pattern type of image sequences",
    args: {
      name: "type",
      suggestions: [
        { name: "glob", description: "Shell glob pattern" },
        { name: "sequence", description: "printf-style %d sequence" },
        { name: "none", description: "No pattern matching" },
      ],
    },
  },
  {
    name: "-start_number",
    description: "First number of an image sequence",
    args: { name: "number" },
  },
  {
    name: "-loop",
    description: "Loop over an image sequence",
    args: booleanArg,
  },
  {
    name: "-framerate",
    description: "Frame rate of raw video or image input",
    args: { name: "rate" },
  },
  {
    name: "-video_size",
    description: "Frame size of raw video input",
    args: { name: "size" },
  },
  {
    name: "-pixel_format",
    description: "Pixel format of raw video input",
    args: {
      name: "format",
      generators: listing("-pix_fmts", parsePixelFormats),
    },
  },
  {
    name: "-sample_rate",
    description: "Sample rate of raw audio input",
    args: { name: "hz" },
  },
  {
    name: "-ch_layout",
    description: "Channel layout of raw audio input",
    args: { name: "layout" },
  },
  {
    name: "-decryption_key",
    description: "Media decryption key, as hex",
    args: { name: "key" },
  },
  {
    name: "-activation_bytes",
    description: "Activation bytes of Audible AAX files",
    args: { name: "bytes" },
  },
  {
    name: "-ignore_editlist",
    description: "Ignore MP4 edit lists",
    args: booleanArg,
  },
  {
    name: "-export_all",
    description: "Export unrecognized MP4 metadata",
    args: booleanArg,
  },
  {
    name: "-export_xmp",
    description: "Export full XMP metadata",
    args: booleanArg,
  },

  // Decoders
  {
    name: "-skip_frame",
    description: "Skip decoding these frames",
    args: {
      name: "frames",
      suggestions: [
        { name: "none", description: "Decode every frame" },
        { name: "default", description: "Skip useless frames (default)" },
        { name: "noref", description: "Skip non-reference frames" },
        { name: "bidir", description: "Skip bidirectional frames" },
        { name: "nointra", description: "Only decode intra frames" },
        { name: "nokey", description: "Only decode keyframes" },
        { name: "all", description: "Skip every frame" },
      ],
    },
  },
  {
    name: "-export_side_data",
    description: "Export frame side data",
    args: flagsArg([
      { name: "mvs", description: "Motion vectors" },
      { name: "venc_params", description: "Video encoding parameters" },
      { name: "film_grain", description: "Film grain parameters" },
      { name: "enhancements", description: "Picture enhancement metadata" },
    ]),
  },
  {
    name: "-flags2",
    description: "Set extra decoder flags",
    args: flagsArg([
      { name: "ignorecrop", description: "Ignore cropping from the SPS" },
      { name: "showall", description: "Show frames before the first keyframe" },
      { name: "export_mvs", description: "Export motion vectors" },
      { name: "skip_manual", description: "Export skip info as side data" },
      { name: "icc_profiles", description: "Generate or parse ICC profiles" },
    ]),
  },
  {
    name: "-threads",
    description: "Number of decoder threads",
    args: {
      name: "count",
      suggestions: [{ name: "auto", description: "Choose automatically" }],
    },
  },
  {
    name: "-ec",
    description: "Set the error concealment strategy",
    args: flagsArg([
      { name: "guess_mvs", description: "Search motion vectors (slow)" },
      { name: "deblock", description: "Deblock damaged macroblocks" },
      { name: "favor_inter", description: "Predict from the previous frame" },
    ]),
  },
  {
    name: "-lowres",
    description: "Decode at a reduced resolution",
    args: {
      name: "factor",
      suggestions: [
        { name: "1", description: "Half size" },
        { name: "2", description: "Quarter size" },
        { name: "3", description: "Eighth size" },
      ],
    },
  },
  {
    name: "-apply_cropping",
    description: "Apply the cropping signalled in the stream",
    args: booleanArg,
  },
  {
    name: "-sub_charenc",
    description: "Character encoding of text subtitles",
    args: { name: "encoding" },
  },
];

// AVOptions rank below ffprobe's own options when both match what is typed
const options: Fig.Option[] = [
  ...ffprobeOptions,
  ...avOptions.map((option) => ({ ...option, priority: 40 })),
];

const optionNames = new Set(options.flatMap((option) => option.name));

const completionSpec: Fig.Spec = {
  name: "ffprobe",
  description: "Gather information from multimedia streams",
  parserDirectives: { flagsArePosixNoncompliant: true },
  args: {
    name: "input_url",
    description: "Input file or URL, or - for stdin",
    // The overlay sorts by priority even before anything is typed, so without
    // this the boosted options would push the files out of view. filepaths()
    // is used rather than filterTemplateSuggestions, which the engine stores
    // on the filepaths generator that every spec shares.
    generators: filepaths({
      editFileSuggestions: { priority: 70 },
      editFolderSuggestions: { priority: 70 },
    }),
    isOptional: true,
  },
  options,
  // Declares the unlisted AVOptions already on the line, so that their value
  // is not taken for a second input. -noNAME, where NAME is a listed option,
  // is how ffprobe switches a boolean off, and takes no value. The token being
  // typed is left out, or its partial name would be offered back.
  generateSpec: async (tokens) => ({
    name: "ffprobe",
    options: tokens
      .slice(1, -1)
      .filter((token) => /^-[^-]/.test(token) && !optionNames.has(token))
      .map((name) =>
        name.startsWith("-no") && optionNames.has(`-${name.slice(3)}`)
          ? { name, hidden: true }
          : { name, hidden: true, args: { name: "value" } },
      ),
  }),
};

export default completionSpec;
