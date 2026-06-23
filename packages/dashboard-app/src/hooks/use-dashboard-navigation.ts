import { useEffect } from "react";
import { Event as EventNotifications } from "@easy-complete/api-bindings";
import type { DashboardNavigatePayload, Section } from "../types";

export function useDashboardNavigation(setSection: (section: Section) => void) {
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    EventNotifications.subscribe<DashboardNavigatePayload>(
      "dashboard.navigate",
      (payload) => {
        if (payload?.path === "/about") {
          setSection("about");
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
