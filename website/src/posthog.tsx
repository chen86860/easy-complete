import { useEffect } from "react";

const POSTHOG_PROJECT_TOKEN = "phc_9biiBNdgbqZlxcJdISohgz7VWJnC83jCexzXhrMKnd";

type PostHogClient = (typeof import("posthog-js"))["default"];

let clientPromise: Promise<PostHogClient> | undefined;

function loadPostHog() {
  if (typeof window === "undefined") return;

  clientPromise ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(POSTHOG_PROJECT_TOKEN, {
      api_host: "https://a.emmmm.dev",
      defaults: "2026-05-30",
      loaded: (posthog) => {
        posthog.register({
          product: "easy-complete-website",
          environment: import.meta.env.MODE,
        });
      },
    });

    return posthog;
  });

  return clientPromise;
}

export function initPostHog() {
  void loadPostHog();
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  void loadPostHog()?.then((posthog) => posthog.capture(event, properties));
}

export function PostHogAnalytics() {
  useEffect(() => {
    initPostHog();
  }, []);

  return null;
}
