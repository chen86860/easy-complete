# Desktop icons

Regenerate these checked-in assets on macOS with:

```sh
swift scripts/generate-icons.swift
```

- `assets/logo.png` is the original app artwork. The generator adds a transparent
  margin of 100 px per side at 1024 px, then writes every PNG size, the matching
  `AppIcon.iconset`, and `icon.icns`. Always regenerate from the source so padding
  does not accumulate. The website and README retain the original logo.
- `assets/menu-bar-tray.svg` traces the original 22×22 tray bitmap's tall chevron,
  stroke widths, underline, and placement. Do not substitute `assets/menu-bar.svg`,
  which has a different shape. The tray artwork is rendered with antialiasing
  at 18×18 and 36×36 pixels. On macOS, `tray.rs` embeds the `@2x` image because
  `tray-icon` sets its logical height to 18 points. AppKit scales the same image
  for a 1× display and tints it as a template in light/dark mode. The light PNGs
  are used by the Linux tray.
- `scripts/build-app.sh` copies `icon.icns` into the app's Resources directory.
  `utils.rs` embeds `icon.png` for window icons. Commit the regenerated assets
  together so the packaged app and embedded resources stay in sync.
