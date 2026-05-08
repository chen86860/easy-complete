import {
  Action,
  ActionListSchema,
  KeybindingPressedNotification,
  NotificationType,
} from "@autocomplete-v5/proto/fig";
import { sendUpdateApplicationPropertiesRequest } from "./requests.js";
import { _subscribe, NotificationResponse } from "./notifications.js";
import { create } from "@bufbuild/protobuf";

export function pressed(
  handler: (
    notification: KeybindingPressedNotification,
  ) => NotificationResponse | undefined,
) {
  return _subscribe(
    { type: NotificationType.NOTIFY_ON_KEYBINDING_PRESSED },
    (notification) => {
      switch (notification?.type?.case) {
        case "keybindingPressedNotification":
          return handler(notification.type.value);
        default:
          break;
      }

      return { unsubscribe: false };
    },
  );
}

export function setInterceptKeystrokes(
  actions: Omit<Action, "$typeName">[],
  intercept: boolean,
  globalIntercept?: boolean,
  currentTerminalSessionId?: string,
) {
  sendUpdateApplicationPropertiesRequest({
    interceptBoundKeystrokes: intercept,
    interceptGlobalKeystrokes: globalIntercept,
    actionList: create(ActionListSchema, { actions }),
    currentTerminalSessionId,
  });
}
