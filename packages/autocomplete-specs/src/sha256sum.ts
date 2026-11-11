const spec: Fig.Spec = {
  name: "sha256sum",
  description: "Print or check SHA-256 checksums",
  args: {
    name: "file",
    template: "filepaths",
    isOptional: true,
    isVariadic: true,
  },
  options: [
    { name: "-b", description: "Read in binary mode" },
    { name: "-c", description: "Read checksums from files and check them" },
    { name: "-t", description: "Read in text mode" },
    {
      name: "-w",
      description: "Warn about improperly formatted checksum lines",
    },
    { name: "-z", description: "End each output line with NUL, not newline" },
  ],
};

export default spec;
