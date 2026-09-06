#!/usr/bin/swift
// Regenerate the checked-in desktop icons on macOS:
//   swift scripts/generate-icons.swift
import AppKit

let repo = URL(fileURLWithPath: #filePath)
    .deletingLastPathComponent().deletingLastPathComponent()
let icons = repo.appendingPathComponent("crates/fig_desktop/icons")
let iconset = icons.appendingPathComponent("AppIcon.iconset")

func load(_ path: String) -> NSImage {
    guard let image = NSImage(contentsOf: repo.appendingPathComponent(path)) else {
        fatalError("Cannot load \(path)")
    }
    return image
}

// Keep the original artwork separate from the padded output so repeated runs
// never shrink it again. The website/README logo intentionally stays full bleed.
let appArtwork = load("assets/logo.png")
let menuArtwork = load("assets/menu-bar-tray.svg")

func render(size: Int, draw: () -> Void) -> Data {
    let bitmap = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
        isPlanar: false, colorSpaceName: .deviceRGB,
        bytesPerRow: 0, bitsPerPixel: 0
    )!
    let context = NSGraphicsContext(bitmapImageRep: bitmap)!
    NSGraphicsContext.saveGraphicsState()
    defer { NSGraphicsContext.restoreGraphicsState() }
    NSGraphicsContext.current = context
    context.imageInterpolation = .high
    context.shouldAntialias = true
    context.cgContext.clear(CGRect(x: 0, y: 0, width: size, height: size))
    draw()
    return bitmap.representation(using: .png, properties: [:])!
}

func appIcon(size: Int) -> Data {
    render(size: size) {
        // An 824 px body on a 1024 px canvas leaves 100 px of transparent
        // margin on each side, matching the scale of macOS Dock/Finder icons.
        let inset = CGFloat(size) * 100 / 1024
        appArtwork.draw(in: NSRect(
            x: inset, y: inset,
            width: CGFloat(size) - 2 * inset, height: CGFloat(size) - 2 * inset
        ))
    }
}

func menuIcon(scale: Int, light: Bool = false) -> Data {
    let size = 18 * scale
    return render(size: size) {
        // Preserve the original bitmap's 22×22 coordinate system, proportions,
        // and placement. Only the raster density and edge antialiasing change.
        menuArtwork.draw(in: NSRect(x: 0, y: 0, width: size, height: size))
        if light {
            NSColor.white.setFill()
            NSRect(x: 0, y: 0, width: size, height: size).fill(using: .sourceIn)
        }
    }
}

try FileManager.default.createDirectory(at: iconset, withIntermediateDirectories: true)
for points in [16, 32, 128, 256, 512] {
    for scale in [1, 2] {
        let suffix = scale == 1 ? "" : "@2x"
        let name = "\(points)x\(points)\(suffix).png"
        let data = appIcon(size: points * scale)
        try data.write(to: icons.appendingPathComponent(name))
        try data.write(to: iconset.appendingPathComponent("icon_\(name)"))
    }
}
try appIcon(size: 512).write(to: icons.appendingPathComponent("icon.png"))

for name in ["icon-monochrome", "not-logged-in"] {
    try menuIcon(scale: 1).write(to: icons.appendingPathComponent("\(name).png"))
    try menuIcon(scale: 2).write(to: icons.appendingPathComponent("\(name)@2x.png"))
    try menuIcon(scale: 1, light: true).write(to: icons.appendingPathComponent("\(name)-light.png"))
}

let iconutil = Process()
iconutil.executableURL = URL(fileURLWithPath: "/usr/bin/iconutil")
iconutil.arguments = ["--convert", "icns", "--output",
                      icons.appendingPathComponent("icon.icns").path, iconset.path]
try iconutil.run()
iconutil.waitUntilExit()
guard iconutil.terminationStatus == 0 else {
    fatalError("iconutil failed with status \(iconutil.terminationStatus)")
}
print("Generated padded app icons, icon.icns, and 18/36 px menu bar icons.")
