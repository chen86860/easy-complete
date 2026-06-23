#!/usr/bin/swift
// Generates bundle/dmg/background.png (660×400) and background@2x.png (1320×800)
// Run: swift scripts/make-dmg-background.swift
import AppKit

let logW: CGFloat = 660
let logH: CGFloat = 400

func renderBackground(scale: CGFloat) -> Data {
    let pxW = Int(logW * scale)
    let pxH = Int(logH * scale)

    let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil,
        pixelsWide: pxW, pixelsHigh: pxH,
        bitsPerSample: 8, samplesPerPixel: 4,
        hasAlpha: true, isPlanar: false,
        colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0
    )!

    NSGraphicsContext.saveGraphicsState()
    defer { NSGraphicsContext.restoreGraphicsState() }
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)!

    // Scale so all drawing uses logical (660×400) coordinates.
    // AppKit origin: (0,0) = bottom-left, y increases upward.
    let t = NSAffineTransform()
    t.scale(by: scale)
    t.concat()

    // ── Background ────────────────────────────────────────────────────────────
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: logW, height: logH).fill()

    let centered = { () -> NSMutableParagraphStyle in
        let p = NSMutableParagraphStyle()
        p.alignment = .center
        return p
    }()

    func draw(_ text: String, font: NSFont, color: NSColor, centerY: CGFloat) {
        let attrs: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: color,
            .paragraphStyle: centered,
        ]
        let str = NSAttributedString(string: text, attributes: attrs)
        let sz = str.size()
        // x=0, full width → paragraph centering handles horizontal
        str.draw(in: NSRect(x: 0, y: centerY - sz.height / 2, width: logW, height: sz.height + 2))
    }

    // ── Title ─────────────────────────────────────────────────────────────────
    // ~96pt from top  →  centerY from bottom = 400 − 96 = 304
    draw(
        "Easy Complete",
        font: NSFont.systemFont(ofSize: 30, weight: .semibold),
        color: NSColor(srgbRed: 0.10, green: 0.10, blue: 0.10, alpha: 1),
        centerY: 302
    )

    // ── Arrow ─────────────────────────────────────────────────────────────────
    // Icon centers sit at y=255 from top (create-dmg coords)
    // → centerY from bottom = 400 − 255 = 145
    draw(
        "→",
        font: NSFont.systemFont(ofSize: 34, weight: .thin),
        color: NSColor(srgbRed: 0.44, green: 0.44, blue: 0.44, alpha: 1),
        centerY: 150
    )

    // ── Subtitle ──────────────────────────────────────────────────────────────
    draw(
        "Drag to Applications to install",
        font: NSFont.systemFont(ofSize: 12, weight: .regular),
        color: NSColor(srgbRed: 0.54, green: 0.54, blue: 0.54, alpha: 1),
        centerY: 118
    )

    return rep.representation(using: .png, properties: [:])!
}

// ── Write both resolutions ────────────────────────────────────────────────────
let scriptURL  = URL(fileURLWithPath: #file)
let repoURL    = scriptURL.deletingLastPathComponent().deletingLastPathComponent()
let dmgDir     = repoURL.appendingPathComponent("bundle/dmg")

let data1x = renderBackground(scale: 1)
let data2x = renderBackground(scale: 2)

try! data1x.write(to: dmgDir.appendingPathComponent("background.png"))
try! data2x.write(to: dmgDir.appendingPathComponent("background@2x.png"))

print("✓ bundle/dmg/background.png    (660×400)")
print("✓ bundle/dmg/background@2x.png (1320×800)")
