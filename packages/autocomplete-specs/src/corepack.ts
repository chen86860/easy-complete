const installDirectoryOption: Fig.Option = {
  name: "--install-directory",
  description: "Directory where Corepack shims are installed",
  args: { name: "directory", template: "folders" },
};

const spec: Fig.Spec = {
  name: "corepack",
  description: "Package manager shim manager bundled with Node.js",
  subcommands: [
    {
      name: "cache",
      description: "Manage Corepack cache",
      subcommands: [{ name: "clean", description: "Clean Corepack cache" }],
    },
    {
      name: "disable",
      description: "Remove the Corepack shims from the install directory",
      options: [installDirectoryOption],
    },
    {
      name: "enable",
      description: "Add the Corepack shims to the install directory",
      options: [installDirectoryOption],
    },
    {
      name: "install",
      description:
        "Install the package manager configured in the local project",
      options: [
        {
          name: ["-g", "--global"],
          description: "Install package managers on the system",
        },
        {
          name: "--cache-only",
          description: "Install only from the local cache",
        },
      ],
    },
    {
      name: "pack",
      description: "Store package managers in a tarball",
      options: [
        { name: "--json", description: "Print the result as JSON" },
        {
          name: ["-o", "--output"],
          description: "Output tarball path",
          args: { name: "path", template: "filepaths" },
        },
      ],
    },
    {
      name: "up",
      description: "Update the package manager used in the current project",
    },
    {
      name: "use",
      description: "Define the package manager to use for the current project",
      args: { name: "pattern" },
    },
  ],
};

export default spec;
