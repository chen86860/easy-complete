const supportedNamedIconTypes = new Set([
  "alert",
  "asterisk",
  "box",
  "carrot",
  "characters",
  "command",
  "commandkey",
  "cpu",
  "database",
  "file",
  "folder",
  "flag",
  "gear",
  "invite",
  "option",
  "package",
  "string",
  "symlink",
  "template",
]);

const normalizeNamedIcon = (icon: URL): URL => {
  if (icon.hostname !== "icon") {
    return icon;
  }

  const type = icon.searchParams.get("type");
  if (!type || supportedNamedIconTypes.has(type)) {
    return icon;
  }

  const normalized = new URL(icon.toString());
  normalized.searchParams.set("type", "package");
  return normalized;
};

export const transformIconUri = (icon: URL): URL => {
  if (icon.protocol !== "fig:") {
    return icon;
  }

  icon = normalizeNamedIcon(icon);
  let { host } = icon;

  if (host === "" && window.fig?.constants?.newUriFormat) {
    host = "path";
  }

  if (window.fig?.constants?.os === "windows") {
    return new URL(
      `https://fig.${host}${icon.pathname}${icon.search}${icon.hash}`,
    );
  }

  return new URL(`fig://${host}${icon.pathname}${icon.search}${icon.hash}`);
};
