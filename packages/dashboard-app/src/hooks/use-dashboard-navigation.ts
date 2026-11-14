import { useEffect } from "react";
import { Event as EventNotifications } from "@easy-complete/api-bindings";
import type { DashboardNavigatePayload, Section } from "../types";
import { sectionForPath } from "../utils/section-for-path";

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
