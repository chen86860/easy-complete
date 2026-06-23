#!/usr/bin/swift
// Generates bundle/dmg/background.png (660×460) and background@2x.png (1980×1380)
// The @2x file uses 3× pixel density so text and edges stay crisp on Retina.
// Run: swift scripts/make-dmg-background.swift
import AppKit

let logW: CGFloat = 660
let logH: CGFloat = 460   // window height (passed to create-dmg --window-size)

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

    // Apply scale so we always draw in logical (660×460) coordinates.
    // AppKit origin: (0,0) = bottom-left, y increases upward.
    let t = NSAffineTransform()
    t.scale(by: scale)
    t.concat()

    // ── Background ────────────────────────────────────────────────────────────
    NSColor.white.setFill()
    NSRect(x: 0, y: 0, width: logW, height: logH).fill()

    let para = NSMutableParagraphStyle()
    para.alignment = .center

    func draw(_ text: String, font: NSFont, color: NSColor, centerY: CGFloat) {
        let attrs: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: color,
            .paragraphStyle: para,
        ]
        let str = NSAttributedString(string: text, attributes: attrs)
        let sz = str.size()
        str.draw(in: NSRect(x: 0, y: centerY - sz.height / 2, width: logW, height: sz.height + 2))
    }

    // All centerY values are measured from the BOTTOM in logical (460 pt) space.
    // Corresponding "from top" = logH − centerY.

    // ── Title ─────────────────────────────────────────────────────────────────
    // ~100 pt from top  →  centerY = 460 − 100 = 360
    draw(
        "Easy Complete",
        font: NSFont.systemFont(ofSize: 30, weight: .semibold),
        color: NSColor(srgbRed: 0.10, green: 0.10, blue: 0.10, alpha: 1),
        centerY: 358
    )

    // ── Arrow ─────────────────────────────────────────────────────────────────
    // Icon centers at y=275 from top (create-dmg coords, see make-dmg.sh)
    // → centerY from bottom = 460 − 275 = 185
    draw(
        "→",
        font: NSFont.systemFont(ofSize: 34, weight: .thin),
        color: NSColor(srgbRed: 0.44, green: 0.44, blue: 0.44, alpha: 1),
        centerY: 188
    )

    // ── Subtitle ──────────────────────────────────────────────────────────────
    // 32 pt below arrow center
    draw(
        "Drag to Applications to install",
        font: NSFont.systemFont(ofSize: 12, weight: .regular),
        color: NSColor(srgbRed: 0.54, green: 0.54, blue: 0.54, alpha: 1),
        centerY: 154
    )

    return rep.representation(using: .png, properties: [:])!
}

// ── Write both resolutions ────────────────────────────────────────────────────
let repoURL = URL(fileURLWithPath: #file)
    .deletingLastPathComponent()   // scripts/
    .deletingLastPathComponent()   // repo root
let dmgDir  = repoURL.appendingPathComponent("bundle/dmg")

// 1×  — 660×460
let data1x = renderBackground(scale: 1)
try! data1x.write(to: dmgDir.appendingPathComponent("background.png"))
print("✓ bundle/dmg/background.png    (660×460)")

// @2× — 1980×1380 at 3× pixel density (named @2x so create-dmg picks it up)
let data2x = renderBackground(scale: 3)
try! data2x.write(to: dmgDir.appendingPathComponent("background@2x.png"))
print("✓ bundle/dmg/background@2x.png (1980×1380, 3× density)")
