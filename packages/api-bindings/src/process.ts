import { create } from "@bufbuild/protobuf";
import { sendRunProcessRequest } from "./requests.js";
import {
  DurationSchema,
  EnvironmentVariableSchema,
} from "@easy-complete/proto/fig_common";

export async function run({
  executable,
  args,
  environment,
  workingDirectory,
  terminalSessionId,
  timeout,
}: {
  executable: string;
  args: string[];
  environment?: Record<string, string | undefined>;
  workingDirectory?: string;
  terminalSessionId?: string;
  timeout?: number;
}) {
  const env = environment ?? {};
  return sendRunProcessRequest({
    executable,
    arguments: args,
    env: Object.keys(env).map((key) =>
      create(EnvironmentVariableSchema, { key, value: env[key] }),
    ),
    workingDirectory,
    terminalSessionId,
    timeout: timeout
      ? create(DurationSchema, {
          // `timeout` is milliseconds; protobuf Duration stores the fractional
          // second as nanoseconds. One millisecond is one million nanoseconds.
          nanos: Math.floor((timeout % 1000) * 1_000_000),
          secs: BigInt(Math.floor(timeout / 1000)),
        })
      : undefined,
  });
}
