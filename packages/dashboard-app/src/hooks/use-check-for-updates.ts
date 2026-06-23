import { useState } from "react";
import { Internal } from "@easy-complete/api-bindings";

export function useCheckForUpdates() {
  const [isChecking, setIsChecking] = useState(false);

  async function check() {
    if (isChecking) return;
    setIsChecking(true);
    try {
      await Internal.sendCheckForUpdatesRequest({});
    } catch {
      // Native side handles presenting the Sparkle panel when available.
    } finally {
      setIsChecking(false);
    }
  }

  return { isChecking, check };
}
