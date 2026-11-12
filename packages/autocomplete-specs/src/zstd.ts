const compressionLevels = Array.from({ length: 19 }, (_, index) => ({
  name: `-${index + 1}`,
  description: `Compression level ${index + 1}${index === 2 ? " (default)" : ""}`,
}));

const completionSpec: Fig.Spec = {
  name: ["zstd", "unzstd", "zstdcat", "zstdmt"],
  description: "Zstandard, a fast real-time compression algorithm",
  args: {
    name: "input",
    template: "filepaths",
    isVariadic: true,
    isOptional: true,
  },
  options: [
    {
      name: "-o",
      description: "Write output to a single file",
      args: { name: "output", template: "filepaths" },
    },
    {
      name: ["-k", "--keep"],
      description: "Preserve INPUT file(s) [default]",
    },
    {
      name: "--rm",
      description: "Remove INPUT file(s) after successful (de)compression",
    },
    ...compressionLevels,
    {
      name: ["-d", "--decompress"],
      description: "Perform decompression",
    },
    {
      name: "-D",
      description: "Use DICT as the dictionary for compression/decompression",
      args: { name: "dict", template: "filepaths" },
    },
    {
      name: ["-f", "--force"],
      description: "Disable input and output checks; allow overwriting",
    },
    {
      name: "-h",
      description: "Display short usage and exit",
    },
    {
      name: ["-H", "--help"],
      description: "Display full help and exit",
    },
    {
      name: ["-V", "--version"],
      description: "Display the program version and exit",
    },
    // Advanced
    {
      name: ["-c", "--stdout"],
      description: "Write to STDOUT and keep the INPUT file(s)",
    },
    {
      name: ["-v", "--verbose"],
      description: "Enable verbose output; pass multiple times for more",
      isRepeatable: true,
    },
    {
      name: ["-q", "--quiet"],
      description: "Suppress warnings; pass twice to suppress errors",
      isRepeatable: 2,
    },
    {
      name: "--trace",
      description: "Log tracing information to LOG",
      args: { name: "log", template: "filepaths" },
    },
    {
      name: "--progress",
      description: "Forcibly show the progress counter",
    },
    {
      name: "--no-progress",
      description: "Forcibly hide the progress counter",
    },
    {
      name: "-r",
      description: "Operate recursively on directories",
    },
    {
      name: "--filelist",
      description: "Read a list of files to operate on from LIST",
      args: { name: "list", template: "filepaths" },
      requiresEquals: true,
    },
    {
      name: "--output-dir-flat",
      description: "Store processed files in DIR",
      args: { name: "dir", template: "folders" },
      requiresEquals: true,
    },
    {
      name: "--output-dir-mirror",
      description:
        "Store processed files in DIR, respecting directory structure",
      args: { name: "dir", template: "folders" },
      requiresEquals: true,
    },
    {
      name: "--asyncio",
      description: "Use asynchronous IO [default]",
    },
    {
      name: "--no-asyncio",
      description: "Disable asynchronous IO",
    },
    {
      name: "--check",
      description: "Add XXH64 integrity checksums during compression [default]",
    },
    {
      name: "--no-check",
      description: "Do not add XXH64 integrity checksums",
    },
    // Advanced compression
    {
      name: "--ultra",
      description: "Enable levels beyond 19, up to 22; requires more memory",
    },
    {
      name: "--fast",
      description: "Use very fast compression levels",
      args: { name: "level", isOptional: true },
      requiresEquals: true,
    },
    {
      name: "--adapt",
      description: "Dynamically adapt compression level to I/O conditions",
    },
    {
      name: "--long",
      description: "Enable long distance matching with window log #",
      args: { name: "windowLog", isOptional: true },
      requiresEquals: true,
    },
    {
      name: "--patch-from",
      description: "Use REF as the reference point for the diff engine",
      args: { name: "ref", template: "filepaths" },
      requiresEquals: true,
    },
    {
      name: "-T",
      description: "Spawn # compression threads (0 = core count)",
      args: { name: "threads" },
    },
    {
      name: "--single-thread",
      description: "Share a single thread for I/O and compression",
    },
    {
      name: "--auto-threads",
      description: "Use physical/logical cores when using `-T0`",
      args: {
        name: "mode",
        suggestions: ["physical", "logical"],
      },
      requiresEquals: true,
    },
    {
      name: "-B",
      description: "Set job size to #",
      args: { name: "size" },
    },
    {
      name: "--rsyncable",
      description: "Compress using a rsync-friendly method",
    },
    {
      name: "--exclude-compressed",
      description: "Only compress files that are not already compressed",
    },
    {
      name: "--stream-size",
      description: "Specify size of streaming input from STDIN",
      args: { name: "size" },
      requiresEquals: true,
    },
    {
      name: "--size-hint",
      description: "Optimize parameters for streaming input of about this size",
      args: { name: "size" },
      requiresEquals: true,
    },
    {
      name: "--no-dictID",
      description: "Don't write `dictID` into the header",
    },
    {
      name: "--format",
      description: "Output format",
      args: {
        name: "format",
        suggestions: ["zstd", "gzip", "xz", "lzma", "lz4"],
        default: "zstd",
      },
      requiresEquals: true,
    },
    // Advanced decompression
    {
      name: "-l",
      description: "Print information about Zstandard-compressed files",
    },
    {
      name: "--test",
      description: "Test compressed file integrity",
    },
    {
      name: "-M",
      description: "Set the memory usage limit to # megabytes",
      args: { name: "memory" },
    },
    {
      name: "--sparse",
      description: "Enable sparse mode",
    },
    {
      name: "--no-sparse",
      description: "Disable sparse mode [default]",
    },
    {
      name: "--pass-through",
      description: "Pass through uncompressed files as-is",
    },
    {
      name: "--no-pass-through",
      description: "Do not pass through uncompressed files [default]",
    },
    // Dictionary builder
    {
      name: "--train",
      description: "Create a dictionary from a training set of files",
    },
    {
      name: "--train-cover",
      description: "Use the cover algorithm",
      args: { name: "params", isOptional: true },
      requiresEquals: true,
    },
    {
      name: "--train-fastcover",
      description: "Use the fast cover algorithm",
      args: { name: "params", isOptional: true },
      requiresEquals: true,
    },
    {
      name: "--train-legacy",
      description: "Use the legacy dictionary training algorithm",
      args: { name: "params", isOptional: true },
      requiresEquals: true,
    },
    {
      name: "--maxdict",
      description: "Limit dictionary to specified size",
      args: { name: "size" },
      requiresEquals: true,
    },
    {
      name: "--dictID",
      description: "Force dictionary ID to #",
      args: { name: "id" },
      requiresEquals: true,
    },
    // Benchmark
    {
      name: "-b",
      description: "Perform benchmarking with compression level #",
      args: { name: "level", isOptional: true },
    },
    {
      name: "-e",
      description: "Test all compression levels up to #",
      args: { name: "level", isOptional: true },
    },
    {
      name: "-i",
      description: "Set the minimum evaluation time to # seconds",
      args: { name: "seconds" },
    },
    {
      name: "-S",
      description: "Output one benchmark result per input file",
    },
    {
      name: "--priority",
      description: "Set process priority to real-time",
      args: { name: "priority", suggestions: ["rt"] },
      requiresEquals: true,
    },
  ],
};

export default completionSpec;
