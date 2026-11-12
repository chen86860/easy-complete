import autocannon from "./autocannon";

export const npxSuggestions: Fig.Suggestion[] = [
  {
    name: autocannon.name,
    ...("icon" in autocannon && { icon: autocannon.icon }),
  },
  {
    name: "vite",
    icon: "https://vitejs.dev/logo.svg",
  },
  {
    name: "babel",
    icon: "https://raw.githubusercontent.com/babel/logo/master/babel.png",
  },
  {
    name: "react-native",
    icon: "https://reactnative.dev/img/pwa/manifest-icon-512.png",
  },
  {
    name: "tailwindcss",
    icon: "https://tailwindcss.com/favicons/favicon-32x32.png",
  },
  {
    name: "next",
    icon: "https://nextjs.org/favicon.ico",
  },
  {
    name: "nuxi",
    icon: "https://avatars.githubusercontent.com/u/23360933?s=64&v=4",
  },
  {
    name: "gltfjsx",
    icon: "https://raw.githubusercontent.com/pmndrs/branding/master/logo.svg",
  },
  {
    name: "prisma",
    icon: "https://avatars.githubusercontent.com/u/17219288?s=64&v=4",
  },
  {
    name: "eslint",
    icon: "https://raw.githubusercontent.com/eslint/eslint.org/main/src/static/icon-512.png",
  },
  {
    name: "prettier",
    icon: "https://prettier.io/icon.png",
  },
  {
    name: "tsc",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/120px-Typescript_logo_2020.svg.png",
  },
  {
    name: "typeorm",
    icon: "https://avatars.githubusercontent.com/u/20165699?s=200&v=4",
  },
  {
    name: "@withfig/autocomplete-tools",
    icon: "https://avatars.githubusercontent.com/u/68212401?s=64&v=4",
  },
  {
    name: "create-next-app",
    icon: "https://nextjs.org/favicon.ico",
  },
  {
    name: "create-t3-app",
    icon: "https://create.t3.gg/favicon.svg",
  },
  {
    name: "create-video",
    icon: "https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/static/img/logo-small.png",
  },
  {
    name: "remotion",
    icon: "https://raw.githubusercontent.com/remotion-dev/remotion/main/packages/docs/static/img/logo-small.png",
  },
  {
    name: "create-remix",
    icon: "https://avatars.githubusercontent.com/u/64235328?s=64&v=4",
  },
  {
    name: "remix",
    icon: "https://avatars.githubusercontent.com/u/64235328?s=64&v=4",
  },
  {
    name: "playwright",
    icon: "https://playwright.dev/img/playwright-logo.svg",
  },
  {
    name: "ignite-cli",
    icon: "🔥",
  },
  {
    name: "degit",
    icon: "fig://icon?type=git",
  },
  {
    name: "mikro-orm",
    icon: "https://raw.githubusercontent.com/mikro-orm/mikro-orm/master/docs/static/img/favicon.ico",
  },
  {
    name: "pod-install",
  },
  {
    name: "capacitor",
    icon: "https://capacitorjs.com/docs/img/meta/favicon.png",
  },
  {
    name: "cap",
    icon: "https://capacitorjs.com/docs/img/meta/favicon.png",
  },
  {
    name: "stencil",
    icon: "https://avatars.githubusercontent.com/u/31999222?s=64&v=4",
  },
  {
    name: "@wordpress/create-block",
    icon: "https://s1.wp.com/i/webclip.png",
  },
  {
    name: "astro",
    icon: "https://astro.build/favicon.svg",
  },
  {
    name: "ampx",
    icon: "https://raw.githubusercontent.com/aws-amplify/docs/refs/heads/main/public/favicon.ico",
  },
  {
    name: "create-vite",
    description: "Scaffold a Vite project",
    icon: "https://vitejs.dev/logo.svg",
  },
  {
    name: "@tanstack/cli",
    description: "Create a TanStack Start or Router app",
    icon: "https://avatars.githubusercontent.com/u/72518640?s=64&v=4",
  },
  {
    name: "gitpick",
    description:
      "Clone a folder from a GitHub repository, e.g. an example project",
    icon: "fig://icon?type=git",
  },
  {
    name: "create-expo-app",
    description: "Create a React Native app with Expo",
    icon: "https://avatars.githubusercontent.com/u/12504344?s=64&v=4",
  },
  {
    name: "create-react-router",
    description: "Create a React Router app",
    icon: "https://avatars.githubusercontent.com/u/64235328?s=64&v=4",
  },
  {
    name: "create-vue",
    description: "Create a Vite-powered Vue project",
    icon: "https://avatars.githubusercontent.com/u/6128107?s=64&v=4",
  },
  {
    name: "create-astro",
    description: "Create an Astro project",
    icon: "https://astro.build/favicon.svg",
  },
  {
    name: "sv",
    description: "Create and maintain Svelte apps",
    icon: "https://avatars.githubusercontent.com/u/23617963?s=64&v=4",
  },
  {
    name: "@angular/cli",
    description: "Angular CLI",
    icon: "https://avatars.githubusercontent.com/u/139426?s=64&v=4",
  },
  {
    name: "create-turbo",
    description: "Create a Turborepo monorepo",
    icon: "https://avatars.githubusercontent.com/u/14985020?s=64&v=4",
  },
  {
    name: "shadcn",
    description: "Add shadcn/ui components to your app",
    icon: "https://avatars.githubusercontent.com/u/139895814?s=64&v=4",
  },
  {
    name: "tsx",
    description: "Run TypeScript files with Node.js",
    icon: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Typescript_logo_2020.svg/120px-Typescript_logo_2020.svg.png",
  },
  {
    name: "vitest",
    description: "Run tests with Vitest",
    icon: "https://avatars.githubusercontent.com/u/95747107?s=64&v=4",
  },
  {
    name: "@biomejs/biome",
    description: "Format and lint with Biome",
    icon: "https://avatars.githubusercontent.com/u/140182603?s=64&v=4",
  },
  {
    name: "oxlint",
    description: "Lint JavaScript and TypeScript with Oxlint",
    icon: "https://avatars.githubusercontent.com/u/149946238?s=64&v=4",
  },
  {
    name: "knip",
    description: "Find unused files, dependencies and exports",
    icon: "https://avatars.githubusercontent.com/u/170418124?s=64&v=4",
  },
  {
    name: "drizzle-kit",
    description: "Drizzle ORM migrations and schema tools",
    icon: "https://avatars.githubusercontent.com/u/108468352?s=64&v=4",
  },
  {
    name: "storybook",
    description: "Set up and run Storybook",
    icon: "https://avatars.githubusercontent.com/u/22632046?s=64&v=4",
  },
  {
    name: "turbo",
    description: "Turborepo build system",
    icon: "https://avatars.githubusercontent.com/u/14985020?s=64&v=4",
  },
  {
    name: "wrangler",
    description: "Cloudflare Workers CLI",
    icon: "https://avatars.githubusercontent.com/u/314135?s=64&v=4",
  },
  {
    name: "vercel",
    description: "Vercel CLI",
    icon: "https://avatars.githubusercontent.com/u/14985020?s=64&v=4",
  },
  {
    name: "npm-check-updates",
    description: "Upgrade package.json dependencies to the latest versions",
    icon: "https://avatars.githubusercontent.com/u/6078720?s=64&v=4",
  },
  {
    name: "@changesets/cli",
    description: "Manage versions and changelogs",
    icon: "https://avatars.githubusercontent.com/u/51163350?s=64&v=4",
  },
  {
    name: "serve",
    description: "Serve a static site or folder",
    icon: "https://avatars.githubusercontent.com/u/14985020?s=64&v=4",
  },
  {
    name: "http-server",
    description: "Zero-configuration static HTTP server",
    icon: "https://avatars.githubusercontent.com/u/10845406?s=64&v=4",
  },
  {
    name: "@vscode/vsce",
    description: "Package and publish VS Code extensions",
    icon: "https://avatars.githubusercontent.com/u/6154722?s=64&v=4",
  },
  {
    name: "@modelcontextprotocol/inspector",
    description: "Inspect and debug MCP servers",
    icon: "https://avatars.githubusercontent.com/u/182288589?s=64&v=4",
  },
];

const completionSpec: Fig.Spec = {
  name: "npx",
  description: "Execute binaries from npm packages",
  args: {
    name: "command",
    isCommand: true,
    generators: {
      script: [
        "bash",
        "-c",
        "until [[ -d node_modules/ ]] || [[ $PWD = '/' ]]; do cd ..; done; ls -1 node_modules/.bin/",
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
    suggestions: [...npxSuggestions],
    isOptional: true,
  },

  options: [
    {
      name: ["--package", "-p"],
      description: "Package to be installed",
      args: {
        name: "package",
      },
      isRepeatable: true,
    },
    {
      name: "--cache",
      args: {
        name: "path",
        template: "filepaths",
      },
      description: "Location of the npm cache",
    },
    {
      name: "--always-spawn",
      description: "Always spawn a child process to execute the command",
    },
    {
      name: "-y",
      description: "Execute npx command without prompting for confirmation",
    },
    {
      description: "Skip installation if a package is missing",
      name: "--no-install",
    },
    {
      args: {
        name: "path",
        template: "filepaths",
      },
      description: "Path to user npmrc",
      name: "--userconfig",
    },
    {
      name: ["--call", "-c"],
      args: {
        name: "script",
      },
      description: "Execute string as if inside `npm run-script`",
    },
    {
      name: ["--workspace", "-w"],
      description:
        "Run in the context of the configured workspace with the given name",
      args: { name: "workspace-name" },
      isRepeatable: true,
    },
    {
      name: "--workspaces",
      description:
        "Run in the context of all configured workspaces in the current project",
    },
    {
      name: "--include-workspace-root",
      description: "Include the workspace root when workspaces are enabled",
    },
    {
      name: "--allow-scripts",
      description:
        "Comma-separated list of packages whose install-time lifecycle scripts may run",
      args: { name: "package-list" },
      isRepeatable: true,
    },
    {
      name: "--strict-allow-scripts",
      description: "Turn install-script policy warnings into hard errors",
    },
    {
      name: "--dangerously-allow-all-scripts",
      description:
        "Bypass the allowScripts policy and run every lifecycle script",
    },
    {
      name: ["--shell", "-s"],
      description: "Shell to execute the command with, if any",
      args: {
        name: "shell",
        suggestions: [
          {
            name: "bash",
          },
          {
            name: "fish",
          },
          {
            name: "zsh",
          },
        ],
      },
    },
    {
      args: {
        name: "shell-fallback",
        suggestions: [
          {
            name: "bash",
          },
          {
            name: "fish",
          },
          {
            name: "zsh",
          },
        ],
      },
      name: "--shell-auto-fallback",
      description:
        'Generate shell code to use npx as the "command not found" fallback',
    },
    {
      name: "--ignore-existing",
      description:
        "Ignores existing binaries in $PATH, or in the localproject. This forces npx to do a temporary install and use the latest version",
    },
    {
      name: ["--quiet", "-q"],
      description:
        "Suppress output from npx itself. Subcommands will not be affected",
    },
    {
      name: "--npm",
      args: {
        name: "path to binary",
        template: "filepaths",
      },
      description: "Npm binary to use for internal operations",
    },
    {
      args: {},
      description: "Extra node argument when calling a node binary",
      name: ["--node-arg", "-n"],
    },
    {
      description: "Show version number",
      name: ["--version", "-v"],
    },
    {
      description: "Show help",
      name: ["--help", "-h"],
    },
  ],
};

export default completionSpec;
