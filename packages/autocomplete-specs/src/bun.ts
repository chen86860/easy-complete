import { keyValueList, filepaths } from "@fig/autocomplete-generators";
import {
  npmScriptsGenerator,
  npmSearchGenerator,
  dependenciesGenerator,
} from "./npm";
import { npxSuggestions } from "./npx";
import { createCLIsGenerator } from "./yarn";

const icon =
  "data:image/svg+xml;base64,PHN2ZyBpZD0iQnVuIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA4MCA3MCI+PHRpdGxlPkJ1biBMb2dvPC90aXRsZT48cGF0aCBpZD0iU2hhZG93IiBkPSJNNzEuMDksMjAuNzRjLS4xNi0uMTctLjMzLS4zNC0uNS0uNXMtLjMzLS4zNC0uNS0uNS0uMzMtLjM0LS41LS41LS4zMy0uMzQtLjUtLjUtLjMzLS4zNC0uNS0uNS0uMzMtLjM0LS41LS41LS4zMy0uMzQtLjUtLjVBMjYuNDYsMjYuNDYsMCwwLDEsNzUuNSwzNS43YzAsMTYuNTctMTYuODIsMzAuMDUtMzcuNSwzMC4wNS0xMS41OCwwLTIxLjk0LTQuMjMtMjguODMtMTAuODZsLjUuNS41LjUuNS41LjUuNS41LjUuNS41LjUuNUMxOS41NSw2NS4zLDMwLjE0LDY5Ljc1LDQyLDY5Ljc1YzIwLjY4LDAsMzcuNS0xMy40OCwzNy41LTMwQzc5LjUsMzIuNjksNzYuNDYsMjYsNzEuMDksMjAuNzRaIi8+PGcgaWQ9IkJvZHkiPjxwYXRoIGlkPSJCYWNrZ3JvdW5kIiBkPSJNNzMsMzUuN2MwLDE1LjIxLTE1LjY3LDI3LjU0LTM1LDI3LjU0UzMsNTAuOTEsMywzNS43QzMsMjYuMjcsOSwxNy45NCwxOC4yMiwxM1MzMy4xOCwzLDM4LDNzOC45NCw0LjEzLDE5Ljc4LDEwQzY3LDE3Ljk0LDczLDI2LjI3LDczLDM1LjdaIiBzdHlsZT0iZmlsbDojZmJmMGRmIi8+PHBhdGggaWQ9IkJvdHRvbV9TaGFkb3ciIGRhdGEtbmFtZT0iQm90dG9tIFNoYWRvdyIgZD0iTTczLDM1LjdhMjEuNjcsMjEuNjcsMCwwLDAtLjgtNS43OGMtMi43MywzMy4zLTQzLjM1LDM0LjktNTkuMzIsMjQuOTRBNDAsNDAsMCwwLDAsMzgsNjMuMjRDNTcuMyw2My4yNCw3Myw1MC44OSw3MywzNS43WiIgc3R5bGU9ImZpbGw6I2Y2ZGVjZSIvPjxwYXRoIGlkPSJMaWdodF9TaGluZSIgZGF0YS1uYW1lPSJMaWdodCBTaGluZSIgZD0iTTI0LjUzLDExLjE3QzI5LDguNDksMzQuOTQsMy40Niw0MC43OCwzLjQ1QTkuMjksOS4yOSwwLDAsMCwzOCwzYy0yLjQyLDAtNSwxLjI1LTguMjUsMy4xMy0xLjEzLjY2LTIuMywxLjM5LTMuNTQsMi4xNS0yLjMzLDEuNDQtNSwzLjA3LTgsNC43QzguNjksMTguMTMsMywyNi42MiwzLDM1LjdjMCwuNCwwLC44LDAsMS4xOUM5LjA2LDE1LjQ4LDIwLjA3LDEzLjg1LDI0LjUzLDExLjE3WiIgc3R5bGU9ImZpbGw6I2ZmZmVmYyIvPjxwYXRoIGlkPSJUb3AiIGQ9Ik0zNS4xMiw1LjUzQTE2LjQxLDE2LjQxLDAsMCwxLDI5LjQ5LDE4Yy0uMjguMjUtLjA2LjczLjMuNTksMy4zNy0xLjMxLDcuOTItNS4yMyw2LTEzLjE0QzM1LjcxLDUsMzUuMTIsNS4xMiwzNS4xMiw1LjUzWm0yLjI3LDBBMTYuMjQsMTYuMjQsMCwwLDEsMzksMTljLS4xMi4zNS4zMS42NS41NS4zNkM0MS43NCwxNi41Niw0My42NSwxMSwzNy45Myw1LDM3LjY0LDQuNzQsMzcuMTksNS4xNCwzNy4zOSw1LjQ5Wm0yLjc2LS4xN0ExNi40MiwxNi40MiwwLDAsMSw0NywxNy4xMmEuMzMuMzMsMCwwLDAsLjY1LjExYy45Mi0zLjQ5LjQtOS40NC03LjE3LTEyLjUzQzQwLjA4LDQuNTQsMzkuODIsNS4wOCw0MC4xNSw1LjMyWk0yMS42OSwxNS43NmExNi45NCwxNi45NCwwLDAsMCwxMC40Ny05Yy4xOC0uMzYuNzUtLjIyLjY2LjE4LTEuNzMsOC03LjUyLDkuNjctMTEuMTIsOS40NUMyMS4zMiwxNi40LDIxLjMzLDE1Ljg3LDIxLjY5LDE1Ljc2WiIgc3R5bGU9ImZpbGw6I2NjYmVhNztmaWxsLXJ1bGU6ZXZlbm9kZCIvPjxwYXRoIGlkPSJPdXRsaW5lIiBkPSJNMzgsNjUuNzVDMTcuMzIsNjUuNzUuNSw1Mi4yNy41LDM1LjdjMC0xMCw2LjE4LTE5LjMzLDE2LjUzLTI0LjkyLDMtMS42LDUuNTctMy4yMSw3Ljg2LTQuNjIsMS4yNi0uNzgsMi40NS0xLjUxLDMuNi0yLjE5QzMyLDEuODksMzUsLjUsMzgsLjVzNS42MiwxLjIsOC45LDMuMTRjMSwuNTcsMiwxLjE5LDMuMDcsMS44NywyLjQ5LDEuNTQsNS4zLDMuMjgsOSw1LjI3QzY5LjMyLDE2LjM3LDc1LjUsMjUuNjksNzUuNSwzNS43LDc1LjUsNTIuMjcsNTguNjgsNjUuNzUsMzgsNjUuNzVaTTM4LDNjLTIuNDIsMC01LDEuMjUtOC4yNSwzLjEzLTEuMTMuNjYtMi4zLDEuMzktMy41NCwyLjE1LTIuMzMsMS40NC01LDMuMDctOCw0LjdDOC42OSwxOC4xMywzLDI2LjYyLDMsMzUuNywzLDUwLjg5LDE4LjcsNjMuMjUsMzgsNjMuMjVTNzMsNTAuODksNzMsMzUuN0M3MywyNi42Miw2Ny4zMSwxOC4xMyw1Ny43OCwxMyw1NCwxMSw1MS4wNSw5LjEyLDQ4LjY2LDcuNjRjLTEuMDktLjY3LTIuMDktMS4yOS0zLTEuODRDNDIuNjMsNCw0MC40MiwzLDM4LDNaIi8+PC9nPjxnIGlkPSJNb3V0aCI+PGcgaWQ9IkJhY2tncm91bmQtMiIgZGF0YS1uYW1lPSJCYWNrZ3JvdW5kIj48cGF0aCBkPSJNNDUuMDUsNDNhOC45Myw4LjkzLDAsMCwxLTIuOTIsNC43MSw2LjgxLDYuODEsMCwwLDEtNCwxLjg4QTYuODQsNi44NCwwLDAsMSwzNCw0Ny43MSw4LjkzLDguOTMsMCwwLDEsMzEuMTIsNDNhLjcyLjcyLDAsMCwxLC44LS44MUg0NC4yNkEuNzIuNzIsMCwwLDEsNDUuMDUsNDNaIiBzdHlsZT0iZmlsbDojYjcxNDIyIi8+PC9nPjxnIGlkPSJUb25ndWUiPjxwYXRoIGlkPSJCYWNrZ3JvdW5kLTMiIGRhdGEtbmFtZT0iQmFja2dyb3VuZCIgZD0iTTM0LDQ3Ljc5YTYuOTEsNi45MSwwLDAsMCw0LjEyLDEuOSw2LjkxLDYuOTEsMCwwLDAsNC4xMS0xLjksMTAuNjMsMTAuNjMsMCwwLDAsMS0xLjA3LDYuODMsNi44MywwLDAsMC00LjktMi4zMSw2LjE1LDYuMTUsMCwwLDAtNSwyLjc4QzMzLjU2LDQ3LjQsMzMuNzYsNDcuNiwzNCw0Ny43OVoiIHN0eWxlPSJmaWxsOiNmZjYxNjQiLz48cGF0aCBpZD0iT3V0bGluZS0yIiBkYXRhLW5hbWU9Ik91dGxpbmUiIGQ9Ik0zNC4xNiw0N2E1LjM2LDUuMzYsMCwwLDEsNC4xOS0yLjA4LDYsNiwwLDAsMSw0LDEuNjljLjIzLS4yNS40NS0uNTEuNjYtLjc3YTcsNywwLDAsMC00LjcxLTEuOTMsNi4zNiw2LjM2LDAsMCwwLTQuODksMi4zNkE5LjUzLDkuNTMsMCwwLDAsMzQuMTYsNDdaIi8+PC9nPjxwYXRoIGlkPSJPdXRsaW5lLTMiIGRhdGEtbmFtZT0iT3V0bGluZSIgZD0iTTM4LjA5LDUwLjE5YTcuNDIsNy40MiwwLDAsMS00LjQ1LTIsOS41Miw5LjUyLDAsMCwxLTMuMTEtNS4wNSwxLjIsMS4yLDAsMCwxLC4yNi0xLDEuNDEsMS40MSwwLDAsMSwxLjEzLS41MUg0NC4yNmExLjQ0LDEuNDQsMCwwLDEsMS4xMy41MSwxLjE5LDEuMTksMCwwLDEsLjI1LDFoMGE5LjUyLDkuNTIsMCwwLDEtMy4xMSw1LjA1QTcuNDIsNy40MiwwLDAsMSwzOC4wOSw1MC4xOVptLTYuMTctNy40Yy0uMTYsMC0uMi4wNy0uMjEuMDlhOC4yOSw4LjI5LDAsMCwwLDIuNzMsNC4zN0E2LjIzLDYuMjMsMCwwLDAsMzguMDksNDlhNi4yOCw2LjI4LDAsMCwwLDMuNjUtMS43Myw4LjMsOC4zLDAsMCwwLDIuNzItNC4zNy4yMS4yMSwwLDAsMC0uMi0uMDlaIi8+PC9nPjxnIGlkPSJGYWNlIj48ZWxsaXBzZSBpZD0iUmlnaHRfQmx1c2giIGRhdGEtbmFtZT0iUmlnaHQgQmx1c2giIGN4PSI1My4yMiIgY3k9IjQwLjE4IiByeD0iNS44NSIgcnk9IjMuNDQiIHN0eWxlPSJmaWxsOiNmZWJiZDAiLz48ZWxsaXBzZSBpZD0iTGVmdF9CbHVjaCIgZGF0YS1uYW1lPSJMZWZ0IEJsdWNoIiBjeD0iMjIuOTUiIGN5PSI0MC4xOCIgcng9IjUuODUiIHJ5PSIzLjQ0IiBzdHlsZT0iZmlsbDojZmViYmQwIi8+PHBhdGggaWQ9IkV5ZXMiIGQ9Ik0yNS43LDM4LjhhNS41MSw1LjUxLDAsMSwwLTUuNS01LjUxQTUuNTEsNS41MSwwLDAsMCwyNS43LDM4LjhabTI0Ljc3LDBBNS41MSw1LjUxLDAsMSwwLDQ1LDMzLjI5LDUuNSw1LjUsMCwwLDAsNTAuNDcsMzguOFoiIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZCIvPjxwYXRoIGlkPSJJcmlzIiBkPSJNMjQsMzMuNjRhMi4wNywyLjA3LDAsMSwwLTIuMDYtMi4wN0EyLjA3LDIuMDcsMCwwLDAsMjQsMzMuNjRabTI0Ljc3LDBhMi4wNywyLjA3LDAsMSwwLTIuMDYtMi4wN0EyLjA3LDIuMDcsMCwwLDAsNDguNzUsMzMuNjRaIiBzdHlsZT0iZmlsbDojZmZmO2ZpbGwtcnVsZTpldmVub2RkIi8+PC9nPjwvc3ZnPg==";

/** Suggest common ports for the various --inspect options */
const inspectArgs: Fig.SingleOrArray<Fig.Arg> = {
  name: "[host:]port",
  isOptional: true,
  suggestions: [
    {
      name: "3000",
      icon: "fig://icon?type=box",
      description: "Serve on port 3000",
    },
    {
      name: "8080",
      icon: "fig://icon?type=box",
      description: "Serve on port 8080",
    },
  ],
  description: "Activate inspector on particular port and/or hostname",
};

const loaders = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "toml",
  "text",
  "file",
  "wasm",
  "napi",
];
/** Format from `bun --help` in Bun 1.3.14 */
const sharedPublicParams: Fig.Option[] = [
  {
    name: ["-h", "--help"],
    description: "Display this help and exit",
  },
  {
    name: ["-b", "--bun"],
    description:
      "Force a script or package to use Bun's runtime instead of Node.js (via symlinking node)",
  },
  {
    name: "--cwd",
    args: {
      name: "path",
      template: "folders",
      description:
        "Absolute path to resolve files & entry points from. This just changes the process' cwd",
    },
  },
  {
    name: ["-c", "--config"],
    args: {
      name: "path",
      template: "filepaths",
      description: "Config file to load Bun from (e.g. -c bunfig.toml)",
      isOptional: true,
    },
    description: "Load config (bunfig.toml)",
  },
  {
    name: "--extension-order",
    args: {
      name: "order",
      description: "Defaults to: .tsx,.ts,.jsx,.js,.json",
    },
  },
  {
    name: "--jsx-factory",
    args: {
      name: "name",
      suggestions: ["React.createElement", "h", "preact.h"],
    },
    description: `Changes the function called when compiling JSX elements using the classic JSX runtime`,
  },
  {
    name: "--jsx-fragment",
    priority: 49,
    args: { name: "string", isOptional: true },
    insertValue: "--jsx-fragment='{cursor}'",
    description: "Changes the function called when compiling JSX fragments",
  },
  {
    name: "--jsx-import-source",
    args: { name: "module", suggestions: ["react"] },
    description: `Declares the module specifier to be used for importing the jsx and jsxs factory functions. Default: "react"`,
  },
  {
    name: "--jsx-runtime",
    args: { name: "name", suggestions: ["automatic", "classic"] },
    description: `"automatic" (default) or "classic"`,
  },
  {
    name: ["-r", "--preload"],
    args: {
      name: "module",
      description: "Import a module before other modules are loaded",
    },
  },
  {
    name: "--require",
    args: { name: "module" },
    description: "Alias of --preload, for Node.js compatibility",
  },
  {
    name: "--import",
    args: { name: "module" },
    description: "Alias of --preload, for Node.js compatibility",
  },
  {
    name: "--main-fields",
    args: {
      name: "fields",
      description:
        "Main fields to lookup in package.json. Defaults to --target dependent",
    },
  },
  {
    name: "--preserve-symlinks",
    description: "Preserve symlinks when resolving files",
  },
  {
    name: "--preserve-symlinks-main",
    description: "Preserve symlinks when resolving the main entry point",
  },
  {
    name: ["-v", "--version"],
    description: "Print version and exit",
  },
  {
    name: "--revision",
    description: "Print version with revision and exit",
  },
  {
    name: "--tsconfig-override",
    args: {
      name: "path",
      template: "filepaths",
      description: "Specify custom tsconfig.json",
    },
  },
  {
    name: ["-d", "--define"],
    args: {
      name: "key:value",
      isVariadic: true,
      description:
        'Substitute K:V while parsing, e.g. --define process.env.NODE_ENV:"development"',
    },
  },
  {
    name: "--drop",
    args: { name: "name" },
    description:
      "Remove function calls, e.g. --drop=console removes all console.* calls",
  },
  {
    name: "--feature",
    args: { name: "name" },
    description:
      "Enable a feature flag for dead-code elimination, e.g. --feature=SUPER_SECRET",
  },
  {
    name: ["-l", "--loader"],
    args: {
      name: "args",
      isVariadic: true,
      description:
        "Parse files with .ext:loader, e.g. --loader .js:jsx. Valid loaders: js, jsx, ts, tsx, json, toml, text, file, wasm, napi",
      generators: keyValueList({
        keys: loaders.map((loader) => "." + loader),
        values: loaders,
      }),
    },
  },
  {
    name: "--port",
    args: {
      name: "port",
      description: "Set the default port for Bun.serve",
    },
  },
  {
    name: "--smol",
    description: "Use less memory, but run garbage collection more often",
  },
  {
    name: "--no-macros",
    description:
      "Disable macros from being executed in the bundler, transpiler and runtime",
  },
  {
    name: "--inspect",
    description: "Activate Bun's debugger for a file",
    requiresSeparator: true,
    args: inspectArgs,
  },
  {
    name: "--inspect-wait",
    description:
      "Activate Bun's Debugger, wait for a connection before executing",
    requiresSeparator: true,
    args: inspectArgs,
  },
  {
    name: "--inspect-brk",
    description:
      "Activate Bun's Debugger, set breakpoint on first line of code and wait",
    requiresSeparator: true,
    args: inspectArgs,
  },
  {
    name: "--if-present",
    description: "Exit if the entrypoint does not exist",
  },
  {
    name: "--no-orphans",
    description:
      "Exit when the parent process dies, and on exit SIGKILL every descendant. Linux/macOS only",
  },
  {
    name: "--env-file",
    args: { name: "path", template: "filepaths" },
    description: "Load environment variables from the specified file(s)",
  },
  {
    name: "--no-env-file",
    description: "Disable automatic loading of .env files",
  },
  {
    name: "--cpu-prof",
    description: "Start CPU profiler and write profile to disk on exit",
  },
  {
    name: "--cpu-prof-name",
    args: { name: "name" },
    description: "Specify the name of the CPU profile file",
  },
  {
    name: "--cpu-prof-dir",
    args: { name: "path", template: "folders" },
    description: "Specify the directory where the CPU profile will be saved",
  },
  {
    name: "--cpu-prof-md",
    description:
      "Output CPU profile in markdown format (grep-friendly, designed for LLM analysis)",
  },
  {
    name: "--cpu-prof-interval",
    args: { name: "microseconds" },
    description:
      "Specify the sampling interval in microseconds for CPU profiling",
  },
  {
    name: "--heap-prof",
    description: "Generate V8 heap snapshot on exit (.heapsnapshot)",
  },
  {
    name: "--heap-prof-name",
    args: { name: "name" },
    description: "Specify the name of the heap profile file",
  },
  {
    name: "--heap-prof-dir",
    args: { name: "path", template: "folders" },
    description: "Specify the directory where the heap profile will be saved",
  },
  {
    name: "--heap-prof-md",
    description: "Generate markdown heap profile on exit (for CLI analysis)",
  },
  {
    name: ["-e", "--eval"],
    args: { name: "script" },
    description: "Evaluate argument as a script",
  },
  {
    name: ["-p", "--print"],
    args: { name: "script" },
    description: "Evaluate argument as a script and print the result",
  },
  {
    name: "--conditions",
    args: { name: "condition" },
    description: "Pass custom conditions to resolve",
  },
  {
    name: "--fetch-preconnect",
    args: { name: "url" },
    description: "Preconnect to a URL while code is loading",
  },
  {
    name: "--experimental-http2-fetch",
    description: "Offer h2 in fetch() TLS ALPN",
  },
  {
    name: "--experimental-http3-fetch",
    description: "Honor Alt-Svc: h3 in fetch() and upgrade to HTTP/3",
  },
  {
    name: "--max-http-header-size",
    args: { name: "bytes" },
    description: "Set the maximum size of HTTP headers in bytes",
  },
  {
    name: "--dns-result-order",
    args: {
      name: "order",
      suggestions: ["verbatim", "ipv4first", "ipv6first"],
    },
    description: "Set the default order of DNS lookup results",
  },
  {
    name: "--expose-gc",
    description: "Expose gc() on the global object",
  },
  {
    name: "--no-deprecation",
    description: "Suppress all reporting of the custom deprecation",
  },
  {
    name: "--throw-deprecation",
    description:
      "Determine whether or not deprecation warnings result in errors",
  },
  {
    name: "--title",
    args: { name: "title" },
    description: "Set the process title",
  },
  {
    name: "--zero-fill-buffers",
    description: "Force Buffer.allocUnsafe(size) to be zero-filled",
  },
  {
    name: "--use-system-ca",
    description: "Use the system's trusted certificate authorities",
  },
  {
    name: "--use-openssl-ca",
    description: "Use OpenSSL's default CA store",
  },
  {
    name: "--use-bundled-ca",
    description: "Use bundled CA store",
  },
  {
    name: "--redis-preconnect",
    description: "Preconnect to $REDIS_URL at startup",
  },
  {
    name: "--sql-preconnect",
    description: "Preconnect to PostgreSQL at startup",
  },
  {
    name: "--no-addons",
    description:
      'Throw an error if process.dlopen is called, and disable export condition "node-addons"',
  },
  {
    name: "--unhandled-rejections",
    args: {
      name: "mode",
      suggestions: ["strict", "throw", "warn", "none", "warn-with-error-code"],
    },
    description: "Configure unhandled rejection behavior",
  },
  {
    name: "--console-depth",
    args: { name: "depth" },
    description: "Set the default depth for console.log object inspection",
  },
  {
    name: "--user-agent",
    args: { name: "agent" },
    description: "Set the default User-Agent header for HTTP requests",
  },
  {
    name: "--cron-title",
    args: { name: "title" },
    description: "Title for cron execution mode",
  },
  {
    name: "--cron-period",
    args: { name: "period" },
    description: "Cron period for cron execution mode",
  },
];

const notBunDevFlags: Fig.Option[] = [
  {
    name: "--hot",
    description:
      "Enable auto reload in the Bun runtime, test runner, or bundler",
    priority: 50,
  },
  {
    name: "--no-clear-screen",
    description:
      "Disable clearing the terminal screen on reload when --hot or --watch is enabled",
  },
  {
    name: "--watch",
    description: "Automatically restart the process on file change",
    priority: 50,
  },
  {
    name: "--no-install",
    description: "Disable auto install in the Bun runtime",
  },
  {
    name: "-i",
    description:
      "Automatically install dependencies and use global cache in Bun's runtime, equivalent to --install=fallback",
  },
  {
    name: "--install",
    args: {
      name: "arg",
      description: `Install dependencies automatically when no node_modules are present, default: "auto". "force" to ignore node_modules, fallback to install any missing`,
      suggestions: ["auto", "force", "fallback", "disable"],
    },
  },
  {
    name: "--prefer-offline",
    description:
      "Skip staleness checks for packages in the Bun runtime and resolve from disk",
  },
  {
    name: "--prefer-latest",
    description:
      "Use the latest matching versions of packages in the Bun runtime, always checking npm",
  },
  {
    name: "--silent",
    description: "Don't repeat the command for bun run",
  },
  {
    name: "--elide-lines",
    args: { name: "number" },
    description:
      "Number of lines of script output shown when using --filter. Set to 0 to show all lines",
  },
  {
    name: ["-F", "--filter"],
    args: { name: "pattern" },
    description: "Run a script in all workspace packages matching the pattern",
  },
  {
    name: "--shell",
    args: { name: "shell", suggestions: ["bun", "system"] },
    description: "Control the shell used for package.json scripts",
  },
  {
    name: "--workspaces",
    description: "Run a script in all workspace packages",
  },
  {
    name: "--parallel",
    description: "Run multiple scripts concurrently with Foreman-style output",
  },
  {
    name: "--sequential",
    description: "Run multiple scripts sequentially with Foreman-style output",
  },
  {
    name: "--no-exit-on-error",
    description: "Continue running other scripts when one fails",
  },
];

const buildOnlyParams: Fig.Option[] = [
  {
    name: "--production",
    description: "Set NODE_ENV=production and enable minification",
  },
  {
    name: "--compile",
    description:
      "Generate a standalone Bun executable containing your bundled code",
    priority: 50,
  },
  {
    name: "--compile-exec-argv",
    args: { name: "arg" },
    description: "Prepend arguments to the standalone executable's execArgv",
  },
  {
    name: "--compile-autoload-dotenv",
    description: "Enable autoloading of .env files in standalone executable",
  },
  {
    name: "--no-compile-autoload-dotenv",
    description: "Disable autoloading of .env files in standalone executable",
  },
  {
    name: "--compile-autoload-bunfig",
    description: "Enable autoloading of bunfig.toml in standalone executable",
  },
  {
    name: "--no-compile-autoload-bunfig",
    description: "Disable autoloading of bunfig.toml in standalone executable",
  },
  {
    name: "--compile-autoload-tsconfig",
    description:
      "Enable autoloading of tsconfig.json at runtime in standalone executable",
  },
  {
    name: "--no-compile-autoload-tsconfig",
    description:
      "Disable autoloading of tsconfig.json at runtime in standalone executable",
  },
  {
    name: "--compile-autoload-package-json",
    description:
      "Enable autoloading of package.json at runtime in standalone executable",
  },
  {
    name: "--no-compile-autoload-package-json",
    description:
      "Disable autoloading of package.json at runtime in standalone executable",
  },
  {
    name: "--compile-executable-path",
    args: { name: "path", template: "filepaths" },
    description:
      "Path to a Bun executable to use for cross-compilation instead of downloading",
  },
  {
    name: "--bytecode",
    description: "Use a bytecode cache",
  },
  {
    name: "--target",
    description: "Target environment",
    priority: 50,
    args: {
      name: "environment",
      suggestions: ["browser", "bun", "node"],
    },
  },
  {
    name: ["-e", "--external"],
    args: {
      name: "package",
      isVariadic: true,
      description:
        "Exclude module from transpilation (can use * wildcards). ex: -e react",
    },
  },
  {
    name: "--minify",
    description: "Enable all minification flags",
    priority: 50,
  },
  {
    name: "--minify-syntax",
    description: "Minify syntax and inline data",
  },
  {
    name: "--minify-whitespace",
    description: "Minify whitespace",
  },
  {
    name: "--minify-identifiers",
    description: "Minify identifiers",
  },
  {
    name: "--format",
    description:
      'Specifies the module format to build to. "esm", "cjs" and "iife" are supported',
    args: {
      name: "format",
      suggestions: ["esm", "cjs", "iife"],
    },
  },
  {
    name: "--outdir",
    description: 'Default to "dist" if multiple files',
    priority: 50,
    args: {
      name: "path",
      template: "folders",
    },
  },
  {
    name: "--outfile",
    description: "Write to a file",
    priority: 50,
    args: {
      name: "path",
      template: "filepaths",
    },
  },
  {
    name: "--metafile",
    description: "Write a JSON file with metadata about the build",
    args: {
      name: "path",
      template: "filepaths",
    },
  },
  {
    name: "--metafile-md",
    description:
      "Write a markdown file with a visualization of the module graph",
    args: {
      name: "path",
      template: "filepaths",
    },
  },
  {
    name: "--root",
    description: "Root directory used for multiple entry points",
    args: {
      name: "path",
      template: "folders",
    },
  },
  {
    name: "--splitting",
    description: "Enable code splitting",
    priority: 50,
  },
  {
    name: "--public-path",
    description: "A prefix to be appended to any import paths in bundled code",
    args: {
      name: "args",
    },
  },
  {
    name: "--sourcemap",
    description:
      "Build with sourcemaps - 'linked', 'inline', 'external', or 'none'",
    requiresSeparator: "-",
    priority: 50,
    args: {
      name: "args",
      isOptional: true,
      suggestions: ["linked", "inline", "external", "none"],
    },
  },
  {
    name: "--banner",
    args: { name: "text" },
    description: 'Add a banner to the bundled output such as "use client"',
  },
  {
    name: "--footer",
    args: { name: "text" },
    description: "Add a footer to the bundled output",
  },
  {
    name: "--allow-unresolved",
    args: { name: "pattern" },
    description:
      "Allow unresolved dynamic import()/require() specifiers matching these glob patterns",
  },
  {
    name: "--reject-unresolved",
    description:
      "Fail the build on any dynamic import()/require() specifier that cannot be resolved at build time",
  },
  {
    name: "--packages",
    args: { name: "mode", suggestions: ["external", "bundle"] },
    description: "Add dependencies to bundle or keep them external",
  },
  {
    name: "--entry-naming",
    description:
      'Customize entry point filenames. Defaults to "[dir]/[name].[ext]"',
    args: {
      name: "args",
    },
  },
  {
    name: "--chunk-naming",
    description: 'Customize chunk filenames. Defaults to "[name]-[hash].[ext]"',
    args: {
      name: "args",
    },
  },
  {
    name: "--asset-naming",
    description: 'Customize asset filenames. Defaults to "[name]-[hash].[ext]"',
    args: {
      name: "args",
    },
  },
  {
    name: "--server-components",
    description: "(EXPERIMENTAL) Enable server components",
  },
  {
    name: "--no-bundle",
    description: "Transpile file only, do not bundle",
  },
  {
    name: "--react-fast-refresh",
    description: "Enable React Fast Refresh transform",
  },
  {
    name: "--emit-dce-annotations",
    description: "Re-emit DCE annotations in bundles",
  },
  {
    name: "--keep-names",
    description: "Preserve original function and class names when minifying",
  },
  {
    name: "--css-chunking",
    description:
      "Chunk CSS files together to reduce duplicated CSS loaded in a browser",
  },
  {
    name: "--app",
    description: "(EXPERIMENTAL) Build a web app for production using Bun Bake",
  },
  {
    name: "--env",
    args: { name: "mode" },
    description:
      "Inline environment variables into the bundle as process.env.${name}",
  },
  {
    name: "--windows-hide-console",
    description:
      "When using --compile targeting Windows, prevent a Command prompt from opening alongside the executable",
  },
  {
    name: "--windows-icon",
    args: { name: "path", template: "filepaths" },
    description:
      "When using --compile targeting Windows, assign an executable icon",
  },
  {
    name: "--windows-title",
    args: { name: "title" },
    description:
      "When using --compile targeting Windows, set the executable product name",
  },
  {
    name: "--windows-publisher",
    args: { name: "publisher" },
    description:
      "When using --compile targeting Windows, set the executable company name",
  },
  {
    name: "--windows-version",
    args: { name: "version" },
    description:
      "When using --compile targeting Windows, set the executable version",
  },
  {
    name: "--windows-description",
    args: { name: "description" },
    description:
      "When using --compile targeting Windows, set the executable description",
  },
  {
    name: "--windows-copyright",
    args: { name: "copyright" },
    description:
      "When using --compile targeting Windows, set the executable copyright",
  },
];

const testOnlyParams: Fig.Option[] = [
  {
    name: "--timeout",
    description: "Set the per-test timeout in milliseconds, default is 5000",
    args: {
      name: "number",
    },
  },
  {
    name: ["-u", "--update-snapshots"],
    description: "Update snapshot files",
  },
  {
    name: "--rerun-each",
    description:
      "Re-run each test file <NUMBER> times, helps catch certain bugs",
    args: {
      name: "number",
    },
  },
  {
    name: "--retry",
    description:
      "Default retry count for all tests, overridden by per-test { retry: N }",
    args: {
      name: "number",
    },
  },
  {
    name: "--only",
    description:
      'Only run tests that are marked with "test.only()" or "describe.only()"',
  },
  {
    name: "--todo",
    description: 'Include tests that are marked with "test.todo()"',
  },
  {
    name: "--pass-with-no-tests",
    description: "Exit with code 0 when no tests are found",
  },
  {
    name: "--concurrent",
    description: "Treat all tests as `test.concurrent()` tests",
  },
  {
    name: "--randomize",
    description: "Run tests in random order",
  },
  {
    name: "--seed",
    description: "Set the random seed for test randomization",
    args: {
      name: "seed",
    },
  },
  {
    name: "--coverage",
    description: "Generate a coverage profile",
  },
  {
    name: "--coverage-reporter",
    description: "Report coverage in 'text' and/or 'lcov'",
    args: {
      name: "reporter",
      suggestions: ["text", "lcov"],
    },
  },
  {
    name: "--coverage-dir",
    description: "Directory for coverage files",
    args: {
      name: "path",
      template: "folders",
    },
  },
  {
    name: "--bail",
    description:
      "Exit the test suite after <NUMBER> failures. If you do not specify a number, it defaults to 1",
    args: {
      name: "number",
      isOptional: true,
    },
  },
  {
    name: ["-t", "--test-name-pattern"],
    description: "Run only tests with a name that matches the given regex",
    args: {
      name: "pattern",
    },
  },
  {
    name: "--reporter",
    description: "Test output reporter format",
    args: {
      name: "reporter",
      suggestions: ["junit", "dots"],
    },
  },
  {
    name: "--reporter-outfile",
    description: "Output file path for the reporter format",
    args: {
      name: "path",
      template: "filepaths",
    },
  },
  {
    name: "--dots",
    description: "Enable dots reporter. Shorthand for --reporter=dots",
  },
  {
    name: "--only-failures",
    description: "Only display test failures, hiding passing tests",
  },
  {
    name: "--max-concurrency",
    description: "Maximum number of concurrent tests to execute at once",
    args: {
      name: "number",
    },
  },
  {
    name: "--path-ignore-patterns",
    description: "Glob patterns for test file paths to ignore",
    args: {
      name: "pattern",
    },
  },
  {
    name: "--changed",
    description:
      "Only run test files affected by changed files according to git",
    args: {
      name: "ref",
      isOptional: true,
    },
  },
  {
    name: "--isolate",
    description: "Run each test file in a fresh global object",
  },
  {
    name: "--parallel",
    description: "Run test files in parallel using N worker processes",
    args: {
      name: "number",
      isOptional: true,
    },
  },
  {
    name: "--parallel-delay",
    description:
      "Milliseconds the first --parallel worker must be busy before spawning the rest",
    args: {
      name: "milliseconds",
    },
  },
  {
    name: "--test-worker",
    description:
      "(internal) Run as a --parallel worker, receiving files over IPC",
  },
  {
    name: "--shard",
    description:
      "Run a subset of test files, e.g. '--shard=1/3' runs the first of three shards",
    args: {
      name: "index/count",
    },
  },
];

const debugParams: Fig.Option[] = [
  {
    name: "--dump-environment-variables",
    description:
      "Dump environment variables from .env and process as JSON and quit. Useful for debugging",
    priority: 49,
  },
  {
    name: "--dump-limits",
    description: "Dump system limits. Useful for debugging",
    priority: 49,
  },
];

const publicParams = [...sharedPublicParams, ...notBunDevFlags];
const buildParams = [...publicParams, ...buildOnlyParams, ...debugParams];
const testParams = [...publicParams, ...testOnlyParams, ...debugParams];

const dependencyOptions: Fig.Option[] = [
  {
    name: ["-c", "--config"],
    args: {
      name: "path",
      template: "filepaths",
      isOptional: true,
    },
    description: "Specify path to config file (bunfig.toml)",
  },
  {
    name: ["-y", "--yarn"],
    description: "Write a yarn.lock file (yarn v1)",
  },
  {
    name: ["-p", "--production"],
    description: "Don't install devDependencies",
  },
  {
    name: "--no-save",
    description: "Don't update package.json or save a lockfile",
  },
  {
    name: "--save",
    description: "Save to package.json (true by default)",
  },
  {
    name: "--ca",
    args: { name: "certificate" },
    description: "Provide a Certificate Authority signing certificate",
  },
  {
    name: "--cafile",
    args: { name: "path", template: "filepaths" },
    description: "The same as `--ca`, but is a file path to the certificate",
  },
  {
    name: "--dry-run",
    description: "Perform a dry run without making changes",
  },
  {
    name: "--frozen-lockfile",
    description: "Disallow changes to lockfile",
  },
  {
    name: ["-f", "--force"],
    description:
      "Always request the latest versions from the registry & reinstall all dependencies",
  },
  {
    name: "--cache-dir",
    args: { name: "path", template: "folders" },
    description: "Store & load cached data from a specific directory path",
  },
  {
    name: "--no-cache",
    description: "Ignore manifest cache entirely",
  },
  {
    name: "--silent",
    description: "Don't log anything",
  },
  {
    name: "--quiet",
    description: "Only show tarball name when packing",
  },
  {
    name: "--verbose",
    description: "Excessively verbose logging",
  },
  {
    name: ["-g", "--global"],
    description: "Install globally",
  },
  {
    name: "--cwd",
    args: { name: "path", template: "folders" },
    description: "Set a specific cwd",
  },
  {
    name: "--backend",
    args: {
      name: "syscall",
      suggestions: ["clonefile", "hardlink", "symlink", "copyfile"],
    },
    description: "Platform-specific optimizations for installing dependencies",
  },
  {
    name: "--link-native-bins",
    args: {
      name: "str",
      isVariadic: true,
    },
    description:
      "Link 'bin' from a matching platform-specific 'optionalDependencies' instead. Default: esbuild, turbo",
  },
  {
    name: "--help",
    description: "Print the help menu",
  },
  {
    name: "--no-progress",
    description: "Disable the progress bar",
  },
  {
    name: "--no-summary",
    description: "Don't print a summary",
  },
  {
    name: "--no-verify",
    description: "Skip verifying integrity of newly downloaded packages",
  },
  {
    name: "--ignore-scripts",
    description:
      "Skip lifecycle scripts in the project's package.json (dependency scripts are never run)",
  },
  {
    name: "--trust",
    description:
      "Add to trustedDependencies in the project's package.json and install the package(s)",
  },
  {
    name: ["-d", "--dev", "-D", "--development"],
    description: "Install as devDependency",
    priority: 75,
    isRepeatable: false,
  },
  {
    name: ["-E", "--exact"],
    description: "Install exact version",
  },
  {
    name: "--optional",
    description: "Install as optionalDependency",
  },
  {
    name: "--peer",
    description: "Install as peerDependency",
  },
  {
    name: "--registry",
    args: { name: "url" },
    description:
      "Use a specific registry by default, overriding .npmrc, bunfig.toml and environment variables",
  },
  {
    name: "--concurrent-scripts",
    args: { name: "number" },
    description: "Maximum number of concurrent jobs for lifecycle scripts",
  },
  {
    name: "--network-concurrency",
    args: { name: "number" },
    description: "Maximum number of concurrent network requests",
  },
  {
    name: "--save-text-lockfile",
    description: "Save a text-based lockfile",
  },
  {
    name: "--omit",
    args: {
      name: "dependency-type",
      suggestions: ["dev", "optional", "peer"],
    },
    description:
      "Exclude 'dev', 'optional', or 'peer' dependencies from install",
  },
  {
    name: "--lockfile-only",
    description: "Generate a lockfile without installing dependencies",
  },
  {
    name: "--linker",
    args: { name: "strategy", suggestions: ["isolated", "hoisted"] },
    description: "Linker strategy",
  },
  {
    name: "--minimum-release-age",
    args: { name: "seconds" },
    description:
      "Only install packages published at least N seconds ago (security feature)",
  },
  {
    name: "--cpu",
    args: { name: "architecture", suggestions: ["x64", "arm64", "*"] },
    description: "Override CPU architecture for optional dependencies",
  },
  {
    name: "--os",
    args: { name: "operating-system", suggestions: ["linux", "darwin", "*"] },
    description: "Override operating system for optional dependencies",
  },
  {
    name: ["-a", "--analyze"],
    description:
      "Analyze and install all dependencies of files passed as arguments recursively",
  },
  {
    name: "--only-missing",
    description:
      "Only add dependencies to package.json if they are not already present",
  },
  {
    name: "--filter",
    args: { name: "pattern" },
    description: "Apply command to matching workspaces",
  },
  {
    name: ["-r", "--recursive"],
    description: "Run in all workspaces",
  },
  {
    name: "--latest",
    description: "Update packages to their latest versions",
  },
  {
    name: ["-i", "--interactive"],
    description: "Show an interactive list of outdated packages to select",
  },
];

/** Generate the globally linked packages stored in $BUN_INSTALL directory */
const bunLinksGenerator: Fig.Generator = {
  script: [
    "command",
    "sh",
    "-c",
    "find $BUN_INSTALL/install/global/node_modules -type l -o -type d -maxdepth 2 | awk -F 'node_modules/' '{print $2}'",
  ],
  postProcess(out) {
    return out.split("\n").map((dep) => {
      return {
        name: dep,
        description: "Link to this package",
        icon: "📦",
      };
    });
  },
  cache: {
    strategy: "stale-while-revalidate",
    ttl: 60 * 60 * 24, // 24 hours
  },
};

const spec: Fig.Spec = {
  name: "bun",
  description:
    "A fast bundler, transpiler, JavaScript Runtime and package manager for web software",
  icon,
  args: [
    {
      name: "file",
      generators: [
        // js jsx mjs cjs ts tsx mts cts
        filepaths({ matches: /\.[mc]?[jt]sx?$/ }),
        npmScriptsGenerator,
      ],
    },
    {
      name: "args",
    },
  ],
  options: publicParams,
  subcommands: [
    {
      name: ["c", "create"],
      icon,
      description: "Start a new project from a template",
      args: [
        {
          name: "template",
          description: "Package from @bun-examples, GitHub repo, or local file",
          suggestions: [
            "react",
            "next",
            "hono",
            "discord-interactions",
            "blank",
            "bun-bakery",
            ...npxSuggestions
              .filter((bin) =>
                typeof bin.name === "string"
                  ? bin.name.startsWith("create-")
                  : bin.name.some((name) => name.startsWith("create-")),
              )
              .map((bin) => {
                let name = bin.name;
                if (typeof name !== "string") name = name[0];
                name = name.replace(/^create-/, "");

                return { ...bin, name, priority: 76 };
              }),
          ],
          generators: [
            { template: "folders" },
            {
              custom: async (_, executeCommand, context) => {
                const { stdout } = await executeCommand({
                  command: "ls",
                  args: [
                    "-1",
                    `${context.environmentVariables["HOME"]}/.bun-create`,
                  ],
                });
                return stdout.split("\n").map((name) => ({
                  name,
                }));
              },
            },
            { script: ["command", "ls", "-1", ".bun-create"], splitOn: "\n" },
            createCLIsGenerator,
          ],
          loadSpec: async (token) => ({
            name: "create-" + token,
            type: "global",
          }),
          isCommand: true,
        },
        {
          name: "name",
          template: "folders",
          suggestCurrentToken: true,
        },
      ],
      options: [
        { name: "--force", description: "Overwrite existing files" },
        { name: "--no-install", description: "Don't install node_modules" },
        { name: "--no-git", description: "Don't create a git repository" },
        { name: "--verbose", description: "Too many logs" },
        {
          name: "--no-package-json",
          description: "Disable package.json transforms",
        },
        {
          name: "--open",
          description: "On finish, start bun and open in browser",
        },
      ],
    },
    {
      name: "run",
      icon,
      description: "Run a package.json script or executable",
      args: {
        name: "script",
        filterStrategy: "fuzzy",
        generators: [
          filepaths({
            extensions: ["ts", "tsx", "js", "jsx", "mjs", "cjs"],
          }),
          npmScriptsGenerator,
        ],
      },
      options: publicParams,
    },
    {
      name: ["i", "install"],
      icon: "📦",
      description: "Install dependencies for a package.json",
      args: {
        name: "package",
        isOptional: true,
        isVariadic: true,
        debounce: true,
        generators: npmSearchGenerator,
        filterStrategy: "fuzzy",
      },
      options: dependencyOptions,
    },
    {
      name: ["a", "add"],
      icon: "📦",
      description: "Add a dependency to package.json",
      options: dependencyOptions,
      args: {
        name: "package",
        isVariadic: true,
        debounce: true,
        generators: npmSearchGenerator,
        filterStrategy: "fuzzy",
      },
    },
    {
      name: ["r", "rm", "remove"],
      icon: "📦",
      description: "Remove a dependency from package.json",
      options: dependencyOptions,
      args: {
        name: "package",
        filterStrategy: "fuzzy",
        generators: dependenciesGenerator,
        isVariadic: true,
      },
    },
    {
      name: ["build", "bun"],
      icon,
      description: "Bundle files using Bun's native bundler",
      args: {
        name: "entrypoints",
        isVariadic: true,
        generators: filepaths({
          extensions: ["ts", "tsx", "js", "jsx", "mjs", "cjs"],
        }),
        description:
          "Entrypoint to bundle. If multiple entrypoints provided, must specify --outdir",
      },
      options: buildParams,
    },
    {
      name: "update",
      icon,
      description: "Update outdated dependencies",
      options: dependencyOptions,
      args: {
        name: "package",
        filterStrategy: "fuzzy",
        isOptional: true,
        generators: dependenciesGenerator,
        isVariadic: true,
      },
    },
    {
      name: "link",
      icon: "📦",
      description:
        "Run without an argument to register this package to the global package registry. Uses the name field from package.json",
      args: {
        name: "package",
        filterStrategy: "fuzzy",
        isOptional: true,
        generators: bunLinksGenerator,
        description: "Install a package from the global package registry",
      },
      options: [
        ...dependencyOptions,
        {
          name: "--save",
          description: "Save to package.json",
          dependsOn: ["package"],
        },
      ],
    },
    {
      name: "unlink",
      icon: "📦",
      description: "Unlink this package from the global package registry",
      options: dependencyOptions,
      // Unliking a package by name is not yet implemented. Use bunLinksGenerator once it is implemented.
    },
    {
      name: "upgrade",
      icon,
      description: "Upgrade to latest version of Bun",
      options: [
        {
          name: "--canary",
          description: "Install the latest canary release",
        },
      ],
    },
    {
      name: "test",
      icon,
      description: "Run unit tests with Bun",
      args: {
        name: "files",
        generators: {
          // Suggest test files -> https://bun.sh/docs/cli/test. (not in node_modules or .git)
          script: [
            "command",
            "sh",
            "-c",
            'find $(npm prefix) | grep -E ".*.(test|_test|spec|_spec).(ts|tsx|js|jsx)$" | grep -vE ".*/node_modules/.*" | sed "s|$(npm prefix)/||"',
          ],
          postProcess(out) {
            return out.split("\n").map((file) => {
              return {
                name: file.split("/").pop(),
                priority: 76,
                description: `run ${file}`,
                insertValue: file,
              };
            });
          },
          cache: {
            strategy: "stale-while-revalidate",
            ttl: 60 * 60 * 24, // 24 hours
          },
        },
        isVariadic: true,
        filterStrategy: "fuzzy",
        isOptional: true,
        description: "Test files to run",
      },
      options: testParams,
    },
    {
      name: "pm",
      icon,
      description: "Set of utilities for working with Bun's package manager",
      subcommands: [
        {
          name: "scan",
          description:
            "Scan all packages in lockfile for security vulnerabilities",
        },
        {
          name: "pack",
          description: "Create a tarball of the current workspace",
          options: [
            {
              name: "--dry-run",
              description:
                "Do everything except for writing the tarball to disk",
            },
            {
              name: "--destination",
              description: "The directory the tarball will be saved in",
              args: { name: "path", template: "folders" },
            },
            {
              name: "--filename",
              description: "The name of the tarball",
              args: { name: "filename" },
            },
            {
              name: "--ignore-scripts",
              description: "Don't run pre/postpack and prepare scripts",
            },
            {
              name: "--gzip-level",
              description: "Specify a custom compression level for gzip",
              args: { name: "level", suggestions: ["0", "1", "9"] },
            },
            {
              name: "--quiet",
              description: "Only output the tarball filename",
            },
          ],
        },
        {
          name: "bin",
          description: "Print the path to bin folder",
          options: [
            {
              name: "-g",
              description: "Print the global path to bin folder",
            },
          ],
        },
        {
          name: "cache",
          description: "Print the path to the cache folder",
          subcommands: [
            {
              name: "rm",
              description: "Clear the cache",
            },
          ],
        },
        {
          name: "why",
          description:
            "Show dependency tree explaining why a package is installed",
          args: {
            name: "package",
            generators: dependenciesGenerator,
            filterStrategy: "fuzzy",
          },
        },
        {
          name: "whoami",
          description: "Print the current npm username",
        },
        {
          name: "view",
          description:
            "View package metadata from the registry (use `bun info` instead)",
          args: {
            name: "package",
            isOptional: true,
            generators: npmSearchGenerator,
            filterStrategy: "fuzzy",
          },
        },
        {
          name: "version",
          description: "Bump the version in package.json and create a git tag",
          args: {
            name: "increment",
            isOptional: true,
            suggestions: [
              "patch",
              "minor",
              "major",
              "prepatch",
              "preminor",
              "premajor",
              "prerelease",
              "from-git",
            ],
          },
        },
        {
          name: "pkg",
          description: "Manage data in package.json",
          subcommands: [
            {
              name: "get",
              description: "Get values from package.json",
              args: { name: "key", isOptional: true, isVariadic: true },
            },
            {
              name: "set",
              description: "Set values in package.json",
              args: { name: "key=value", isVariadic: true },
            },
            {
              name: "delete",
              description: "Delete values from package.json",
              args: { name: "key", isVariadic: true },
            },
            {
              name: "fix",
              description: "Auto-correct common package.json errors",
            },
          ],
        },
        {
          name: "hash",
          description: "Generate & print the hash of the current lockfile",
        },
        {
          name: "hash-print",
          description: "Print the hash stored in the current lockfile",
        },
        {
          name: "hash-string",
          description: "Print the string used to hash the lockfile",
        },
        {
          name: "ls",
          description:
            "List the dependency tree according to the current lockfile",
          options: [
            {
              name: "--all",
              description: "List the entire dependency tree",
            },
          ],
        },
        {
          name: "migrate",
          description:
            "Migrate another package manager's lockfile without installing anything",
        },
        {
          name: "untrusted",
          description: "Print current untrusted dependencies with scripts",
        },
        {
          name: "trust",
          description:
            "Run scripts for untrusted dependencies and add to trustedDependencies",
          args: {
            name: "package",
            isVariadic: true,
            generators: dependenciesGenerator,
            filterStrategy: "fuzzy",
          },
          options: [
            {
              name: "--all",
              description: "Trust all untrusted dependencies",
            },
          ],
        },
        {
          name: "default-trusted",
          description: "Print the default trusted dependencies list",
        },
      ],
    },
    {
      name: "list",
      icon: "📦",
      description: "List the dependency tree according to the current lockfile",
      options: [
        {
          name: "--all",
          description: "List the entire dependency tree",
        },
      ],
    },
    {
      name: "completions",
      icon,
      description: "Install shell completions",
    },
    {
      name: "discord",
      icon: "fig://icon?type=discord",
      description: "Open bun's Discord server",
    },
    {
      name: "help",
      description: "Print the help menu",
      icon,
    },
    {
      name: "x",
      icon,
      description: "Execute a package binary, installing if needed",
      loadSpec: "bunx",
    },
    {
      name: "repl",
      icon,
      description: "Start a REPL session with Bun",
    },
    {
      name: "init",
      icon,
      description: "Initialize a new bun project",
      args: { name: "folder", isOptional: true, template: "folders" },
      options: [
        {
          name: ["-y", "--yes"],
          description: "Answer yes to all prompts",
        },
        {
          name: ["-m", "--minimal"],
          description: "Only initialize type definitions",
        },
        {
          name: ["-r", "--react"],
          description: "Initialize a React project",
          args: {
            name: "variant",
            isOptional: true,
            suggestions: ["tailwind", "shadcn"],
          },
        },
      ],
    },
    {
      name: "exec",
      icon,
      description: "Execute a shell script directly from Bun",
      args: { name: "script", isCommand: true },
    },
    {
      name: "info",
      icon,
      description: "Display package metadata from the registry",
      args: [
        {
          name: "package",
          isOptional: true,
          generators: npmSearchGenerator,
          filterStrategy: "fuzzy",
        },
        {
          name: "property path",
          isOptional: true,
          isVariadic: true,
        },
      ],
      options: [
        ...dependencyOptions,
        {
          name: "--json",
          description: "Output in JSON format",
        },
      ],
    },
    {
      name: "outdated",
      icon,
      description: "Display the latest versions of outdated dependencies",
      args: { name: "filter", isOptional: true },
      options: [
        ...dependencyOptions,
        {
          name: ["-F", "--filter"],
          description: "Include only matching workspace packages",
          args: { name: "pattern" },
        },
        {
          name: ["-r", "--recursive"],
          description: "Check outdated packages in all workspaces",
        },
      ],
    },
    {
      name: "why",
      icon,
      description: "Explain why a package is installed",
      args: { name: "package", generators: dependenciesGenerator },
      options: [
        {
          name: "--top",
          description:
            "Show only the top dependency tree instead of nested ones",
        },
        {
          name: "--depth",
          description: "Maximum depth of the dependency tree to display",
          args: { name: "number" },
        },
      ],
    },
    {
      name: "audit",
      icon,
      description: "Check installed packages for vulnerabilities",
      options: [
        {
          name: "--json",
          description: "Output in JSON format",
        },
        {
          name: "--audit-level",
          description:
            "Only print advisories with severity greater than or equal to level",
          args: {
            name: "level",
            suggestions: ["low", "moderate", "high", "critical"],
          },
        },
        {
          name: "--ignore",
          description: "Ignore specific CVE IDs from audit",
          args: { name: "cve" },
        },
      ],
    },
    {
      name: "patch",
      icon,
      description: "Prepare a package for patching",
      args: {
        name: "package",
        description: "Package and version, e.g. is-even@1.0.0",
      },
      options: [
        ...dependencyOptions,
        {
          name: "--commit",
          description: "Install a patch and commit it to the patches directory",
        },
        {
          name: "--patches-dir",
          description:
            "The directory to put the patch file in (only if --commit is used)",
          args: { name: "path", template: "folders" },
        },
      ],
    },
    {
      name: "publish",
      icon,
      description: "Publish a package to the npm registry",
      args: { name: "dist", isOptional: true, template: "filepaths" },
      options: [
        ...dependencyOptions,
        {
          name: "--access",
          description: "Set access level for scoped packages",
          args: { name: "level", suggestions: ["public", "restricted"] },
        },
        {
          name: "--tag",
          description: 'Tag the release. Default is "latest"',
          args: { name: "tag" },
        },
        {
          name: "--otp",
          description: "Provide a one-time password for authentication",
          args: { name: "otp" },
        },
        {
          name: "--auth-type",
          description: "Specify the type of one-time password authentication",
          args: { name: "type", suggestions: ["web", "legacy"] },
        },
        {
          name: "--gzip-level",
          description: "Specify a custom compression level for gzip",
          args: { name: "level", suggestions: ["0", "1", "9"] },
        },
        {
          name: "--tolerate-republish",
          description:
            "Don't exit with code 1 when republishing over an existing version number",
        },
      ],
    },
    {
      name: "feedback",
      icon,
      description: "Provide feedback to the Bun team",
      args: {
        name: "feedback text or files",
        isOptional: true,
        isVariadic: true,
      },
      options: [
        {
          name: ["-e", "--email"],
          description: "Set the email address used for this submission",
          args: { name: "email" },
        },
        {
          name: ["-h", "--help"],
          description: "Show this help message and exit",
        },
      ],
    },
  ],
};

export default spec;
