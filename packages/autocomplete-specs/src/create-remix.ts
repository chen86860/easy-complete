const completionSpec: Fig.Spec = {
  name: "create-remix",
  icon: "https://avatars.githubusercontent.com/u/64235328?s=64&v=4",
  options: [
    {
      name: ["-h", "--help"],
      description: "Display help for command",
    },
    {
      name: ["-v", "--version"],
      description: "Display version for command",
    },
  ],
};

export default completionSpec;
