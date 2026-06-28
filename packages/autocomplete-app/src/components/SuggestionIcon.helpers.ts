export const transformIconUri = (icon: URL): URL => {
  let { host } = icon;

  if (icon.protocol !== "fig:") {
    return icon;
  }

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
