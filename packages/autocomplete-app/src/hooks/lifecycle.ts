import { useEffect, useRef } from "react";

/**
 * Signals the desktop app that the overlay finished loading and can receive window events.
 *
 * The native side defers events like Show until this arrives, so a lazily rebuilt overlay does
 * not flash an empty window.
 */
export function useReportMounted() {
  useEffect(() => {
    window.ipc?.postMessage?.("__ec_autocomplete_mounted__");
  }, []);
}

/**
 * Reports the first time the overlay actually rendered suggestions.
 *
 * This is what the `autocomplete_webview_ready` metric measures, so it deliberately fires later
 * than {@link useReportMounted} — mounting an empty app says nothing about time to first
 * suggestion.
 */
export function useReportFirstSuggestions(hasSuggestions: boolean) {
  const reported = useRef(false);

  useEffect(() => {
    if (reported.current || !hasSuggestions) return;
    reported.current = true;
    window.ipc?.postMessage?.("__ec_autocomplete_ready__");
  }, [hasSuggestions]);
}
