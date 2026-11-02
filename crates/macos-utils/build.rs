fn main() {
    if std::env::var("CARGO_CFG_TARGET_OS").as_deref() != Ok("macos") {
        return;
    }
    println!("cargo:rerun-if-changed=native/permission_guide.m");
    for framework in [
        "AppKit",
        "ApplicationServices",
        "CoreGraphics",
        "CoreImage",
        "QuartzCore",
    ] {
        println!("cargo:rustc-link-lib=framework={framework}");
    }
    cc::Build::new()
        .file("native/permission_guide.m")
        .flag("-fobjc-arc")
        .compile("ec_permission_guide");
}
