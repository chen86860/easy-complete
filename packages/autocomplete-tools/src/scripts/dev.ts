import path from "node:path";
import chalk from "chalk";
import { Command } from "commander";
import { runCompiler } from "./compile";
import { isEcInstalled, setSetting } from "./settings";

function disableDevMode() {
  console.log("\n\nDev mode disabled\n");
  setSetting("autocomplete.developerMode", false);
  setSetting("autocomplete.developerModeNPM", false);
  setSetting("autocomplete.developerModeNPMInvalidateCache", true);
  process.exit(0);
}

function cleanup() {
  disableDevMode();
}

async function runProgram({ outdir }: { outdir?: string }) {
  console.clear();

  if (!isEcInstalled()) {
    console.log(
      "\n******\n\n",
      chalk.bold(chalk.yellow(" WARNING: the ec CLI from Easy Complete is not on your PATH")),
      "\n\n",
      chalk.bold(chalk.cyan(" Install Easy Complete from:")),
      "\n https://easy-complete.emmmm.dev/",
      "\n\n******\n"
    );
  }

  console.log(
    `Welcome to ${chalk.magenta("Easy Complete Dev Mode")}!\n\n`,
    `All completions will be loaded from ${chalk.bold(
      `${process.cwd()}/${outdir ?? "build"}`
    )}. (Note: other completions won't work while in dev mode).\n\n`,
    `1. Edit your spec(s) in the ${chalk.bold("src/")} directory.\n`,
    `2. Test changes ${chalk.bold("instantly")} on save in your terminal.\n`,
    `3. Exit developer mode with ${chalk.bold("ctrl + c")}.\n\n`,
    `${chalk.bold("Other Notes:")}\n`,
    `- Generators run on every keystroke\n`
  );
  process.addListener("SIGTERM", cleanup);
  process.addListener("SIGINT", cleanup);
  process.addListener("SIGQUIT", cleanup);

  setSetting("autocomplete.developerModeNPM", true);
  setSetting(
    "autocomplete.devCompletionsFolder",
    path.join(process.cwd(), outdir ?? "build")
  );
  await runCompiler({ watch: true, outdir, notifyApp: true });
}

const program = new Command("dev")
  .description("watch for changes and compile specs")
  .option("-o, --outdir <dir>", "Output directory")
  .action(runProgram);

export default program;
