const languagesGenerator: Fig.Generator = {
  script: ["tesseract", "--list-langs"],
  postProcess: (output) =>
    output
      .split("\n")
      .slice(1)
      .map((lang) => lang.trim())
      .filter(Boolean)
      .map((lang) => ({
        name: lang,
        description: "Language",
        icon: "fig://icon?type=string",
      })),
};

const psmModes = [
  {
    name: ["0", "osd_only"],
    description: "Orientation and script detection only",
  },
  {
    name: ["1", "auto_osd"],
    description: "Automatic page segmentation with OSD",
  },
  {
    name: ["2", "auto_only"],
    description: "Automatic page segmentation, but no OSD or OCR",
  },
  {
    name: ["3", "auto"],
    description: "Fully automatic page segmentation, but no OSD (default)",
  },
  {
    name: ["4", "single_column"],
    description: "Assume a single column of text of variable sizes",
  },
  {
    name: ["5", "single_block_vert_text"],
    description: "Assume a single uniform block of vertically aligned text",
  },
  {
    name: ["6", "single_block"],
    description: "Assume a single uniform block of text",
  },
  {
    name: ["7", "single_line"],
    description: "Treat the image as a single line",
  },
  {
    name: ["8", "single_word"],
    description: "Treat the image as a single word",
  },
  {
    name: ["9", "circle_word"],
    description: "Treat the image as a single word in a circle",
  },
  {
    name: ["10", "single_char"],
    description: "Treat the image as a single character",
  },
  {
    name: ["11", "sparse_text"],
    description: "Find as much text as possible in no particular order",
  },
  { name: ["12", "sparse_text_osd"], description: "Sparse text with OSD" },
  {
    name: ["13", "raw_line"],
    description: "Treat the image as a single raw text line",
  },
];

const oemModes = [
  { name: ["0", "tesseract_only"], description: "Legacy engine only" },
  { name: ["1", "lstm_only"], description: "Neural nets LSTM engine only" },
  {
    name: ["2", "tesseract_lstm_combined"],
    description: "Legacy + LSTM engines",
  },
  {
    name: ["3", "default"],
    description: "Default, based on what is available",
  },
];

const completionSpec: Fig.Spec = {
  name: "tesseract",
  description: "An OCR (Optical Character Recognition) engine",
  args: [
    {
      name: "imagename",
      description: "The image, image list, or `stdin` to recognize",
      template: "filepaths",
      isOptional: true,
    },
    {
      name: "outputbase",
      description: "Basename of the output files, or `stdout`",
      suggestions: [
        { name: "stdout", description: "Write to standard output" },
      ],
      isOptional: true,
    },
    {
      name: "configfile",
      description: "Config file(s), e.g. pdf, hocr, tsv, txt",
      suggestions: [
        "txt",
        "pdf",
        "hocr",
        "tsv",
        "alto",
        "page",
        "quiet",
        "makebox",
        "get.images",
        "logfile",
      ],
      isVariadic: true,
      isOptional: true,
    },
  ],
  options: [
    {
      name: "-l",
      description: "Specify language(s) used for OCR, e.g. eng+chi_sim",
      args: { name: "lang", generators: languagesGenerator },
    },
    {
      name: "--psm",
      description: "Specify page segmentation mode",
      args: { name: "psm", suggestions: psmModes },
    },
    {
      name: "--oem",
      description: "Specify OCR Engine mode",
      args: { name: "oem", suggestions: oemModes },
    },
    {
      name: "-c",
      description: "Set value for a config variable (VAR=VALUE)",
      args: { name: "var=value" },
      isRepeatable: true,
    },
    {
      name: "--tessdata-dir",
      description: "Specify the location of tessdata path",
      args: { name: "path", template: "folders" },
    },
    {
      name: "--user-words",
      description: "Specify the location of user words file",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--user-patterns",
      description: "Specify the location of user patterns file",
      args: { name: "path", template: "filepaths" },
    },
    {
      name: "--dpi",
      description: "Specify DPI for input image",
      args: { name: "value" },
    },
    {
      name: "--loglevel",
      description: "Specify logging level",
      args: {
        name: "level",
        suggestions: [
          "ALL",
          "TRACE",
          "DEBUG",
          "INFO",
          "WARN",
          "ERROR",
          "FATAL",
          "OFF",
        ],
      },
    },
    {
      name: ["-h", "--help"],
      description: "Show minimal help message",
    },
    {
      name: "--help-extra",
      description: "Show extra help for advanced users",
    },
    {
      name: "--help-psm",
      description: "Show page segmentation modes",
    },
    {
      name: "--help-oem",
      description: "Show OCR Engine modes",
    },
    {
      name: ["-v", "--version"],
      description: "Show version information",
    },
    {
      name: "--list-langs",
      description: "List available languages for tesseract engine",
    },
    {
      name: "--print-fonts-table",
      description: "Print tesseract fonts table",
    },
    {
      name: "--print-parameters",
      description: "Print tesseract parameters",
    },
  ],
};

export default completionSpec;
