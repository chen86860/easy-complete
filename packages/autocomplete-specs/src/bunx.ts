import { npxSuggestions } from "./npx";

const bunx: Fig.Spec = {
  name: "bunx",
  description:
    "Execute an npm package executable, automatically installing if needed",
  args: {
    name: "command",
    isCommand: true,
    generators: {
      script: [
        "bash",
        "-c",
        "until [[ -d node_modules/ ]] || [[ $PWD = '/' ]]; do cd ..; done; ls -1 node_modules/.bin/`",
      ],
      postProcess: function (out) {
        const cli = [...npxSuggestions].reduce(
          (acc, { name }) => [...acc, name],
          [],
        );
        return out
          .split("\n")
          .filter((name) => !cli.includes(name))
          .map((name) => ({
            name,
            icon: "fig://icon?type=command",
            loadSpec: name,
          }));
      },
    },
    description: "The command to run",
    suggestions: [...npxSuggestions],
  },
  options: [
    {
      name: "--bun",
      description: "Force the command to run with Bun instead of Node.js",
    },
    {
      name: ["-p", "--package"],
      description:
        "Specify package to install when binary name differs from package name",
      args: {
        name: "package",
      },
    },
    {
      name: "--no-install",
      description: "Skip installation if package is not already installed",
    },
    {
      name: "--verbose",
      description: "Enable verbose output during installation",
    },
    {
      name: "--silent",
      description: "Suppress output during installation",
    },
  ],
};

export default bunx;
