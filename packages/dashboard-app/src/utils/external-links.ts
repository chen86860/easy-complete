import { Native } from "@easy-complete/api-bindings";

export const PRIVACY_URL = "https://easy-complete.emmmm.dev/privacy-policy";

/** Opens a URL in the default browser, falling back to a new window outside the app. */
export async function openExternalUrl(url: string) {
  try {
    await Native.open(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}
