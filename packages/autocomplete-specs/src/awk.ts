const completionSpec: Fig.Spec = {
  name: "awk",
  description:
    "Pattern-directed scanning and processing language. Scans each input file for lines that match a set of patterns",
  args: [
    {
      name: "program",
      description: "The awk program text (e.g. '{ print $1 }')",
      isOptional: true,
    },
    {
      name: "file",
      description: "Input file(s) to process",
      isVariadic: true,
      isOptional: true,
      template: "filepaths",
    },
  ],
  options: [
    {
      name: "-F",
      description:
        "Define the input field separator to be the regular expression fs",
      args: {
        name: "fs",
        description: "Field separator (e.g. ',' or '\\t' or ':')",
      },
    },
    {
      name: "-v",
      description:
        "Assign value to the variable var before the program begins execution",
      isRepeatable: true,
      requiresSeparator: false,
      args: {
        name: "var=value",
        description: "Variable assignment",
      },
    },
    {
      name: "-f",
      description:
        "Read the awk program source from progfile instead of the command line",
      isRepeatable: true,
      args: {
        name: "progfile",
        description: "File containing the awk program",
        template: "filepaths",
      },
    },
    // gawk-specific options (GNU awk)
    {
      name: ["-e", "--source"],
      description: "Provide program source code (GNU awk)",
      args: { name: "program-text" },
    },
    {
      name: ["-E", "--exec"],
      description:
        "Read program text from file and disable command-line variable assignments (GNU awk)",
      args: { name: "file", template: "filepaths" },
    },
    {
      name: ["-i", "--include"],
      description: "Load an awk source library (GNU awk)",
      args: { name: "include-file", template: "filepaths" },
    },
    {
      name: ["-l", "--load"],
      description: "Load a gawk extension from the shared library (GNU awk)",
      args: { name: "ext" },
    },
    {
      name: ["-c", "--traditional"],
      description:
        "Run in compatibility mode, disabling GNU-specific extensions (GNU awk)",
    },
    {
      name: ["-C", "--copyright"],
      description: "Print the short version of the GNU copyright (GNU awk)",
    },
    {
      name: ["-d", "--dump-variables"],
      description:
        "Print a sorted list of global variables to a file (default awkvars.out) (GNU awk)",
      args: { name: "file", isOptional: true, template: "filepaths" },
    },
    {
      name: ["-D", "--debug"],
      description: "Enable the gawk debugger (GNU awk)",
      args: { name: "file", isOptional: true, template: "filepaths" },
    },
    {
      name: ["-g", "--gen-pot"],
      description:
        "Scan and analyze the program, generating a GNU gettext .pot file (GNU awk)",
    },
    {
      name: ["-h", "--help"],
      description: "Print a usage message and exit (GNU awk)",
    },
    {
      name: ["-L", "--lint"],
      description:
        "Warn about constructs that are dubious or non-portable (GNU awk)",
      args: {
        name: "value",
        isOptional: true,
        suggestions: ["fatal", "invalid", "no-ext"],
      },
    },
    {
      name: ["-n", "--non-decimal-data"],
      description:
        "Recognize octal and hexadecimal values in input data (GNU awk)",
    },
    {
      name: ["-N", "--use-lc-numeric"],
      description:
        "Force use of the locale's decimal point character (GNU awk)",
    },
    {
      name: ["-o", "--pretty-print"],
      description:
        "Output a pretty-printed version of the program to a file (GNU awk)",
      args: { name: "file", isOptional: true, template: "filepaths" },
    },
    {
      name: ["-O", "--optimize"],
      description: "Enable gawk's default optimizations (GNU awk)",
    },
    {
      name: ["-p", "--profile"],
      description:
        "Enable profiling, sending profile data to a file (default awkprof.out) (GNU awk)",
      args: { name: "file", isOptional: true, template: "filepaths" },
    },
    {
      name: ["-P", "--posix"],
      description: "Operate in strict POSIX compatibility mode (GNU awk)",
    },
    {
      name: ["-r", "--re-interval"],
      description:
        "Enable the use of interval expressions in regexps (GNU awk)",
    },
    {
      name: ["-s", "--no-optimize"],
      description: "Disable gawk's default optimizations (GNU awk)",
    },
    {
      name: ["-S", "--sandbox"],
      description:
        "Run in sandbox mode, disabling system(), input/output redirection and dynamic extensions (GNU awk)",
    },
    {
      name: ["-t", "--lint-old"],
      description:
        "Warn about constructs not portable to the original version of UNIX awk (GNU awk)",
    },
    {
      name: ["-V", "--version"],
      description: "Print version information and exit (GNU awk)",
    },
  ],
};

export default completionSpec;
