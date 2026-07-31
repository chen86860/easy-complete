import React from "react";
import { Suggestion, SuggestionType } from "@easy-complete/shared/internal";
import { localProtocol } from "@easy-complete/shared/utils";
import { transformIconUri } from "./SuggestionIcon.helpers";

type SuggestionIconProps = {
  suggestion: Suggestion;
  iconPath: string;
  style: React.CSSProperties;
};

// Tint of the rounded tile behind the history glyph. Deliberately neutral so
// history rows recede next to the saturated tiles specs pick, while staying
// legible on both the dark row background and the blue selected row.
const HISTORY_ICON_COLOR = "#6b7280";

// lucide rotate-ccw-clock, drawn into the same rounded-square tile that
// `fig://template` icons render as (32x32 asset, ~25% corner radius) so history
// rows match the surrounding icon style instead of reading as a bare outline.
function HistoryIcon({ size }: { size: number }) {
  return (
    <div
      role="img"
      aria-label="Icon for past command"
      style={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius: size * 0.25,
        backgroundColor: HISTORY_ICON_COLOR,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size * 0.74}
        height={size * 0.74}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#fff"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    </div>
  );
}

function renderIcon(icon: URL, height: string | number, fallbackIcon?: URL) {
  const isFigProtocol = icon.protocol === "fig:";

  const isTemplate = isFigProtocol ? icon.host.endsWith("template") : false;

  const color = isFigProtocol ? icon.searchParams.get("color") : undefined;
  const badge = isFigProtocol ? icon.searchParams.get("badge") : undefined;
  const type = isFigProtocol ? icon.searchParams.get("type") : undefined;
  const ariaLabel = type
    ? `Icon for ${type}`
    : isTemplate
      ? "Template icon"
      : `Icon for ${icon.pathname}`;

  return (
    <div
      role={isTemplate ? "img" : undefined}
      aria-label={isTemplate ? ariaLabel : undefined}
      className="grid overflow-hidden bg-contain bg-no-repeat"
      style={{
        height,
        width: height,
        minWidth: height,
        minHeight: height,
        fontSize: typeof height === "number" ? height * 0.6 : height,
        backgroundImage: isTemplate
          ? `url(${transformIconUri(new URL(`fig://template?color=${color}`))})`
          : `url(${icon})`,
      }}
    >
      {!isTemplate && (
        <img
          src={icon.toString()}
          alt={ariaLabel}
          className="col-start-1 row-start-1 h-full w-full object-contain"
          onError={({ currentTarget }) => {
            if (fallbackIcon && currentTarget.src !== fallbackIcon.toString()) {
              currentTarget.src = fallbackIcon.toString();
            }
          }}
        />
      )}
      {badge &&
        (isTemplate ? (
          <span
            className="place-self-center text-center text-white"
            style={{
              fontSize: typeof height === "number" ? height * 0.5 : height,
            }}
          >
            {badge}
          </span>
        ) : (
          <span
            className="col-start-1 row-start-1 flex h-2.5 w-2.5 place-content-center place-self-end bg-contain bg-no-repeat text-[80%] text-white"
            style={{
              backgroundImage: `url(${transformIconUri(
                new URL(`fig://template?color=${color}`),
              )})`,
            }}
          >
            {badge}
          </span>
        ))}
    </div>
  );
}

const SuggestionIcon = ({
  suggestion,
  iconPath,
  style,
}: SuggestionIconProps) => {
  const { icon, name, type } = suggestion;
  let img;
  let { height } = style;

  if (type === "history" && !icon) {
    // Full height, matching renderIcon — template tiles fill the icon box.
    return (
      <div style={style}>
        <HistoryIcon size={typeof height === "number" ? height : 16} />
      </div>
    );
  }

  // The icon is a Emoji or text if it is <4 length
  if (icon && icon.length < 4) {
    if (typeof height === "number") {
      height *= 0.8;
    }
    img = (
      <span
        style={{
          fontSize: height,
        }}
        className="relative right-[0.0625rem] pb-2.5"
      >
        {icon}
      </span>
    );
  }

  if (!img && icon && typeof icon === "string") {
    try {
      const iconUri = new URL(icon);
      img = renderIcon(transformIconUri(iconUri), height ?? 0);
    } catch (_err) {
      if (typeof height === "number") {
        height *= 0.8;
      }
      img = (
        <span
          style={{
            fontSize: height,
          }}
          className="relative right-[0.0625rem] pb-2.5"
        >
          {icon}
        </span>
      );
    }
  }

  if (!img) {
    const fallbackIconMap: Partial<Record<SuggestionType, URL>> = {
      folder: transformIconUri(new URL("fig://icon?type=folder")),
      file: transformIconUri(new URL("fig://icon?type=file")),
    };
    const srcMap: Partial<Record<SuggestionType | "other", URL>> = {
      folder: new URL(localProtocol("path", `${iconPath}${name}`)),
      file: new URL(localProtocol("path", `${iconPath}${name}`)),
      subcommand: transformIconUri(new URL("fig://icon?type=command")),
      option: transformIconUri(new URL("fig://icon?type=option")),
      shortcut: new URL(localProtocol("template", "?color=3498db&badge=💡")),
      "auto-execute": transformIconUri(new URL("fig://icon?type=carrot")),
      arg: transformIconUri(new URL("fig://icon?type=box")),
      mixin: new URL(localProtocol("template", "?color=628dad&badge=➡️")),
    };

    const src =
      (type && srcMap[type] ? srcMap[type] : undefined) ??
      new URL(localProtocol("icon", "?type=box"));

    img = renderIcon(
      src,
      height ?? 0,
      type ? fallbackIconMap[type] : undefined,
    );
  }

  return <div style={style}>{img}</div>;
};

export default SuggestionIcon;
