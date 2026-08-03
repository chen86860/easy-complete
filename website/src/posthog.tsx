import { useEffect } from "react";

const POSTHOG_PROJECT_TOKEN = "phc_9biiBNdgbqZlxcJdISohgz7VWJnC83jCexzXhrMKnd";
const POSTHOG_IDLE_DELAY_MS = 2_000;

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
    // Keep the analytics SDK off the critical rendering path. A real user
    // interaction still initializes it immediately so intentional visits and
    // events are captured without waiting for the idle fallback.
    let delayId: number | undefined;
    let idleId: number | undefined;

    const removeInteractionListeners = () => {
      window.removeEventListener("pointerdown", initialize);
      window.removeEventListener("keydown", initialize);
      window.removeEventListener("touchstart", initialize);
    };

    const cancelScheduledInitialization = () => {
      if (delayId !== undefined) window.clearTimeout(delayId);
      if (idleId !== undefined) window.cancelIdleCallback(idleId);
      window.removeEventListener("load", scheduleWhenIdle);
      removeInteractionListeners();
    };

    function initialize() {
      cancelScheduledInitialization();
      initPostHog();
    }

    function scheduleWhenIdle() {
      delayId = window.setTimeout(() => {
        if ("requestIdleCallback" in window) {
          idleId = window.requestIdleCallback(initialize, { timeout: 2_000 });
        } else {
          initialize();
        }
      }, POSTHOG_IDLE_DELAY_MS);
    }

    window.addEventListener("pointerdown", initialize, {
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", initialize, { once: true });
    window.addEventListener("touchstart", initialize, {
      once: true,
      passive: true,
    });

    if (document.readyState === "complete") {
      scheduleWhenIdle();
    } else {
      window.addEventListener("load", scheduleWhenIdle, { once: true });
    }

    return cancelScheduledInitialization;
  }, []);

  return null;
}
