use std::os::raw::c_void;

use core_foundation::array::CFArrayRef;
use core_foundation::base::{
    CFRelease,
    CFTypeRef,
    OSStatus,
    TCFType,
};
use core_foundation::boolean::CFBoolean;
use core_foundation::dictionary::{
    CFDictionary,
    CFDictionaryRef,
};
use core_foundation::string::{
    CFString,
    CFStringRef,
};
use core_foundation::url::CFURL;
use fig_log::{
    LogArgs,
    initialize_logging,
};
use fig_util::directories;
use objc2::rc::autoreleasepool;
use objc2::runtime::Bool;
use objc2::{
    ClassType,
    msg_send,
};
use objc2_app_kit::NSApp;
use objc2_foundation::{
    MainThreadMarker,
    NSBundle,
    NSObject,
    ns_string,
};
use tracing::info;

use crate::imk;

const CONNECTION_NAME: &str = env!("InputMethodConnectionName");

type TISInputSourceRef = *const c_void;

#[link(name = "Carbon", kind = "framework")]
unsafe extern "C" {
    fn TISRegisterInputSource(location: *const core_foundation::url::__CFURL) -> OSStatus;

    static kTISPropertyInputSourceID: CFStringRef;
    static kTISPropertyInputSourceIsEnabled: CFStringRef;

    fn TISCreateInputSourceList(properties: CFDictionaryRef, include_all_installed: bool) -> CFArrayRef;
    fn TISGetInputSourceProperty(input_source: TISInputSourceRef, key: CFStringRef) -> CFTypeRef;
    fn TISEnableInputSource(input_source: TISInputSourceRef) -> OSStatus;
    fn TISSelectInputSource(input_source: TISInputSourceRef) -> OSStatus;
}

#[link(name = "CoreFoundation", kind = "framework")]
unsafe extern "C" {
    fn CFArrayGetCount(array: CFArrayRef) -> isize;
    fn CFArrayGetValueAtIndex(array: CFArrayRef, idx: isize) -> *const c_void;
}

/// Enable (and select) our own input source via the TIS API.
///
/// The CLI installer (`ec integrations install input-method`) cannot do this: TIS
/// APIs need an `NSApplication` run loop, which the CLI lacks, so `TISEnableInputSource`
/// silently fails there. The IME process *does* have that context, so it enables itself
/// on startup. Without this, terminals that depend on the IME for cursor tracking
/// (Ghostty, Kitty, WezTerm, Zed, Alacritty) get the autocomplete window stuck at a
/// default position instead of following the caret.
fn enable_self_in_tis(input_source_id: &str) {
    let id_value = CFString::new(input_source_id);
    let key = unsafe { CFString::wrap_under_get_rule(kTISPropertyInputSourceID) };
    let dict = CFDictionary::from_CFType_pairs(&[(key.as_CFType(), id_value.as_CFType())]);

    // `include_all_installed = true` so we find the source even while it is still disabled.
    let list = unsafe { TISCreateInputSourceList(dict.as_concrete_TypeRef(), true) };
    if list.is_null() {
        info!("enable_self_in_tis: TISCreateInputSourceList returned null (no NSApplication context?)");
        return;
    }

    let count = unsafe { CFArrayGetCount(list) };
    if count <= 0 {
        info!("enable_self_in_tis: no input source found for {input_source_id}");
        unsafe { CFRelease(list.cast()) };
        return;
    }

    // Borrowed pointer into `list`; valid until we release the list below.
    let src: TISInputSourceRef = unsafe { CFArrayGetValueAtIndex(list, 0) };

    let already_enabled = unsafe {
        let value = TISGetInputSourceProperty(src, kTISPropertyInputSourceIsEnabled);
        !value.is_null() && CFBoolean::wrap_under_get_rule(value.cast()).into()
    };

    if already_enabled {
        info!("enable_self_in_tis: input source already enabled");
    } else {
        let status = unsafe { TISEnableInputSource(src) };
        info!("enable_self_in_tis: TISEnableInputSource status = {status}");
    }

    // Selecting a `palette` (non-keyboard) input method returns paramErr (-50); that is
    // expected and harmless — enabling alone makes it active alongside the keyboard.
    let select_status = unsafe { TISSelectInputSource(src) };
    info!("enable_self_in_tis: TISSelectInputSource status = {select_status}");

    unsafe { CFRelease(list.cast()) };
}

fn register_self_with_tis() {
    // Get the bundle path and register with TIS so macOS routes IMK connections to us
    let bundle = objc2_foundation::NSBundle::mainBundle();
    let bundle_path = unsafe { bundle.bundlePath() };
    let path_str = bundle_path.to_string();
    if let Some(url) = CFURL::from_path(&path_str, true) {
        let result = unsafe { TISRegisterInputSource(url.as_concrete_TypeRef()) };
        info!("TISRegisterInputSource result: {result}");
    }
}

#[tokio::main]
pub async fn main() {
    let _log_guard = initialize_logging(LogArgs {
        log_level: Some("trace".to_owned()),
        log_to_stdout: true,
        log_file_path: Some(directories::logs_dir().expect("home dir must be set").join("imk.log")),
        delete_old_log_file: false,
    });

    info!("Registering imk controller");
    imk::register_controller();
    info!("Registered imk controller");

    let mtm = MainThreadMarker::new().expect("must be on the main thread");

    autoreleasepool(|_pool| {
        let app = NSApp(mtm);

        let k_connection_name = ns_string!(CONNECTION_NAME);
        let nib_name = ns_string!("MainMenu");

        let bundle = NSBundle::mainBundle();
        let identifier = unsafe { bundle.bundleIdentifier() };

        register_self_with_tis();

        info!("Attempting connection...");
        imk::connect_imkserver(k_connection_name, identifier.as_deref());
        info!("Connected!");

        // Enable ourselves in TIS now that we have an NSApplication context. The input
        // source ID matches the bundle identifier (see Info.plist TISInputSourceID).
        if let Some(id) = identifier.as_deref() {
            enable_self_in_tis(&id.to_string());
        } else {
            info!("Could not determine bundle identifier; skipping TIS self-enable");
        }

        let app_id: &NSObject = app.as_ref();
        let loaded_nib: Bool = unsafe { msg_send![NSBundle::class(), loadNibNamed:nib_name owner:app_id] };
        info!("RUNNING {loaded_nib:?}!");

        unsafe { app.run() };
    });
}
