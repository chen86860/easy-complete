import { Process } from "@easy-complete/api-bindings";
import { withTimeout } from "@easy-complete/shared/utils";
import { createErrorInstance } from "@easy-complete/shared/errors";
import logger from "loglevel";
import { cleanOutput, executeCommandTimeout } from "./executeCommand.js";
import { fread } from "./fs.js";

export const LoginShellError = createErrorInstance("LoginShellError");

const DONE_SOURCING_OSC = "\u001b]697;DoneSourcing\u0007";

let etcShells: Promise<string[]> | undefined;

const getShellExecutable = async (shellName: string) => {
  if (!etcShells) {
    etcShells = fread("/etc/shells").then((shells) =>
      shells
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith("#")),
    );
  }

  try {
    return (
      (await etcShells).find((shell) => shell.includes(shellName)) ??
      (
        await executeCommandTimeout({
          command: "/usr/bin/which",
          args: [shellName],
        })
      ).stdout
    );
  } catch (_) {
    return undefined;
  }
};

export const executeLoginShell = async ({
  command,
  executable,
  shell,
  timeout,
}: {
  command: string;
  executable?: string;
  shell?: string;
  timeout?: number;
}): Promise<string> => {
  let exe = executable;
  if (!exe) {
    if (!shell) {
      throw new LoginShellError("Must pass shell or executable");
    }
    exe = await getShellExecutable(shell);
    if (!exe) {
      throw new LoginShellError(`Could not find executable for ${shell}`);
    }
  }
  const flags = window.fig.constants?.os === "linux" ? "-lc" : "-lic";

  // When Process.run goes through figterm it does not apply the local
  // set_fig_vars() path, so without this the child is an interactive login
  // shell that re-enters Easy Complete hooks and may exec ecterm — hang/empty
  // output for callers like firstTokenSpec. Marking the process as launched by
  // us skips the PTY wrap and still emits DoneSourcing from post hooks.
  const process = Process.run({
    executable: exe,
    args: [flags, command],
    environment: {
      PROCESS_LAUNCHED_BY_Q: "1",
      HISTFILE: "",
    },
    terminalSessionId: window.globalTerminalSessionId,
    timeout,
  });

  try {
    logger.info(`About to run login shell command '${command}'`, {
      separateProcess: Boolean(window.f.Process),
      shell: exe,
    });
    const start = performance.now();
    const result = await withTimeout(
      timeout ?? 5000,
      process.then((output) => {
        if (output.exitCode !== 0) {
          logger.warn(
            `Command ${command} exited with exit code ${output.exitCode}: ${output.stderr}`,
          );
        }
        return cleanOutput(output.stdout);
      }),
    );
    const marker = result.lastIndexOf(DONE_SOURCING_OSC);
    // Missing marker used to slice at index 16 and corrupt short/empty output.
    const trimmed =
      marker >= 0 ? result.slice(marker + DONE_SOURCING_OSC.length) : result;
    const end = performance.now();
    logger.info(`Result of login shell command '${command}'`, {
      result: trimmed,
      time: end - start,
    });
    return trimmed;
  } catch (err) {
    logger.error(`Error running login shell command '${command}'`, { err });
    throw err;
  }
};

export const executeCommand: Fig.ExecuteCommandFunction = (args) =>
  executeCommandTimeout(args);
