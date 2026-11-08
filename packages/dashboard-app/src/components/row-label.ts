import { createContext, useContext } from "react";

/**
 * Ids of the label and description of the row a control sits in. Controls name
 * themselves from these, so VoiceOver reads "Launch at Login, switch, on"
 * instead of an anonymous "switch, on".
 */
export const RowLabelContext = createContext<{
  labelId?: string;
  descriptionId?: string;
}>({});

export function useRowLabel() {
  const { labelId, descriptionId } = useContext(RowLabelContext);
  return {
    "aria-labelledby": labelId,
    "aria-describedby": descriptionId,
  };
}
