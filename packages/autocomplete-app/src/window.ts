import {
  getDefaultSetting,
  getDefaultWidth,
  getSettings,
  SETTINGS,
} from "@easy-complete/api-bindings-wrappers";

export const POPOUT_WIDTH = 200;

export const getMaxWidth = (): number => {
  const maxWidthSetting = getSettings()[SETTINGS.WIDTH];
  return typeof maxWidthSetting !== "number"
    ? getDefaultWidth()
    : maxWidthSetting;
};

export const getMaxHeight = (): number => {
  const maxHeightSetting = getSettings()[SETTINGS.HEIGHT];
  return typeof maxHeightSetting !== "number"
    ? (getDefaultSetting(SETTINGS.HEIGHT) as number)
    : maxHeightSetting;
};
