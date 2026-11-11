const fileArg: Fig.Arg = {
  name: "file",
  template: "filepaths",
  isVariadic: true,
};

const commonOptions: Fig.Option[] = [
  { name: "-h", description: "Print help" },
  {
    name: "-l",
    description: "Print long format",
  },
  {
    name: "-r",
    description: "Act recursively",
  },
  {
    name: "-s",
    description: "Act on the symbolic link itself",
  },
  {
    name: "-v",
    description: "Also print filename",
  },
  {
    name: "-x",
    description: "Represent attr_value as a hex string for input and output",
  },
];

const spec: Fig.Spec = {
  name: "xattr",
  description: "Display and manipulate extended attributes",
  args: fileArg,
  options: [
    ...commonOptions,
    {
      name: "-p",
      description: "Print the value of an extended attribute",
      args: { name: "attr_name" },
    },
    {
      name: "-w",
      description: "Set the value of an extended attribute",
      args: [{ name: "attr_name" }, { name: "attr_value" }],
    },
    {
      name: "-d",
      description: "Delete an extended attribute",
      args: { name: "attr_name" },
    },
    {
      name: "-c",
      description: "Clear all extended attributes",
    },
  ],
};

export default spec;
