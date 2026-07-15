import { useEffect } from "react";

/**
 * Keeps the `dashboard-window-blurred` class on <html> in sync with window
 * focus when running outside the native app (dev browser). In the desktop app
 * the Rust side toggles the same class from the real NSWindow key state, so
 * this fallback stays inactive there.
 */
export function useWindowFocus() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.classList.contains("dashboard-native-vibrancy")) return;

    const sync = () => {
      root.classList.toggle("dashboard-window-blurred", !document.hasFocus());
    };

    sync();
    window.addEventListener("focus", sync);
    window.addEventListener("blur", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("blur", sync);
    };
  }, []);
}
