import { useEffect } from "react";
import { Event as EventNotifications } from "@easy-complete/api-bindings";
import type { DashboardNavigatePayload, Section } from "../types";

function sectionForPath(path: string): Section {
  if (path === "/about") {
    return "about";
  }

  // `/behavior` is the old name of the autocomplete page; the tray menu and old
  // deep links may still use it.
  if (path === "/autocomplete" || path === "/behavior") {
    return "autocomplete";
  }

  if (path === "/appearance") {
    return "appearance";
  }

  return "general";
}

export function useDashboardNavigation(setSection: (section: Section) => void) {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    setSection(sectionForPath(window.location.pathname));

    EventNotifications.subscribe<DashboardNavigatePayload>(
      "dashboard.navigate",
      (payload) => {
        if (payload?.path) {
          window.history.replaceState(null, "", payload.path);
          setSection(sectionForPath(payload.path));
        }

        return { unsubscribe: false };
      },
    )
      ?.then((subscription) => {
        unsubscribe = subscription.unsubscribe;
      })
      .catch(() => {});

    return () => unsubscribe?.();
  }, [setSection]);
}
