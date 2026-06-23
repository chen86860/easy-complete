import { useState } from "react";
import { Internal } from "@easy-complete/api-bindings";

type UpdateStatus = "idle" | "checking" | "up-to-date" | "available";

export function useCheckForUpdates() {
  const [status, setStatus] = useState<UpdateStatus>("idle");

  async function check() {
    if (status === "checking") return;
    setStatus("checking");
    try {
      const response = await Internal.sendCheckForUpdatesRequest({});
      setStatus(response.isUpdateAvailable ? "available" : "up-to-date");
    } catch {
      setStatus("idle");
    }
  }

  return { status, check };
}
