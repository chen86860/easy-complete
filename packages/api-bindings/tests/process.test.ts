// @vitest-environment jsdom

import { beforeEach, expect, it, vi } from "vitest";

const { sendRunProcessRequest } = vi.hoisted(() => ({
  sendRunProcessRequest: vi.fn(),
}));

vi.mock("../src/requests.js", () => ({ sendRunProcessRequest }));

import { run } from "../src/process.js";

beforeEach(() => {
  sendRunProcessRequest.mockReset();
  sendRunProcessRequest.mockResolvedValue({
    stdout: "",
    stderr: "",
    exitCode: 0,
  });
});

it("encodes non-whole millisecond timeouts as protobuf nanoseconds", async () => {
  await run({
    executable: "/bin/zsh",
    args: ["-lic", "print ok"],
    timeout: 1500,
  });

  expect(sendRunProcessRequest).toHaveBeenCalledWith(
    expect.objectContaining({
      timeout: expect.objectContaining({
        secs: 1n,
        nanos: 500_000_000,
      }),
    }),
  );
});
