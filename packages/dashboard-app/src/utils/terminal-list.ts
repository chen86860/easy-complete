/** The first three names, then "and others", so a long list stays one line. */
export function terminalList(
  names: string[],
  t: (
    key: "permission.terminalListSeparator" | "permission.terminalListMore",
  ) => string,
) {
  const list = names.slice(0, 3).join(t("permission.terminalListSeparator"));
  return names.length > 3
    ? t("permission.terminalListMore").replace("{list}", list)
    : list;
}
