const completionSpec: Fig.Spec = {
  name: "rm",
  description: "Remove directory entries",
  args: {
    isVariadic: true,
    template: ["folders", "filepaths"],
  },

  options: [
    {
      name: ["-r", "-R"],
      description:
        "Recursive. Attempt to remove the file hierarchy rooted in each file argument",
      isDangerous: true,
    },
    {
      name: "-P",
      description: "Overwrite regular files before deleting them",
      isDangerous: true,
    },
    {
      name: "-d",
      description:
        "Attempt to remove directories as well as other types of files",
    },
    {
      name: "-f",
      description:
        "⚠️ Attempt to remove the files without prompting for confirmation",
      isDangerous: true,
    },
    {
      name: "-i",
      description: "Request confirmation before attempting to remove each file",
    },
    {
      name: "-I",
      description:
        "Request confirmation once before removing more than three files or recursively removing files",
    },
    {
      name: "-v",
      description: "Be verbose when deleting files",
    },
    {
      name: "-W",
      description: "Attempt to undelete the named files",
    },
    {
      name: "-x",
      description: "When removing a hierarchy, do not cross mount points",
    },
  ],
};

export default completionSpec;
