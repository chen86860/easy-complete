use accessibility_sys::{AXIsProcessTrusted, AXIsProcessTrustedWithOptions, kAXTrustedCheckOptionPrompt};
use core_foundation::base::TCFType;
use core_foundation::boolean::{CFBoolean, kCFBooleanTrue};
use core_foundation::dictionary::CFDictionary;
use core_foundation::string::CFString;
use objc2::AnyThread;
use objc2_app_kit::NSWorkspace;
use objc2_foundation::{NSURL, ns_string};

static ACCESSIBILITY_SETTINGS_URL: &str =
    "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility";

pub fn open_accessibility() -> bool {
    let string = ns_string!(ACCESSIBILITY_SETTINGS_URL);
    let url = NSURL::initWithString(NSURL::alloc(), string);
    if let Some(url) = url {
        let workspace = NSWorkspace::sharedWorkspace();
        workspace.openURL(&url)
    } else {
        false
    }
}

pub fn prompt_for_accessibility() -> bool {
    unsafe {
        let prompt_key = CFString::wrap_under_get_rule(kAXTrustedCheckOptionPrompt);
        let prompt_value = CFBoolean::wrap_under_get_rule(kCFBooleanTrue);
        let options = CFDictionary::from_CFType_pairs(&[(prompt_key.as_CFType(), prompt_value.as_CFType())]);

        AXIsProcessTrustedWithOptions(options.as_concrete_TypeRef())
    }
}

pub fn accessibility_is_enabled() -> bool {
    unsafe { AXIsProcessTrusted() }
}

unsafe extern "C" {
    fn ec_show_accessibility_guide(locale: i32) -> bool;
}

/// Language for the guide's instruction, mirroring `dashboard.language`.
#[derive(Debug, Clone, Copy, Default, PartialEq, Eq)]
pub enum GuideLocale {
    /// Follow the macOS preferred language.
    #[default]
    System,
    English,
    SimplifiedChinese,
}

impl GuideLocale {
    /// Parses a `dashboard.language` value; anything unknown follows the system.
    pub fn from_setting(value: Option<&str>) -> Self {
        match value {
            Some("en") => Self::English,
            Some("zh-CN") => Self::SimplifiedChinese,
            _ => Self::System,
        }
    }
}

/// Opens System Settings at the Accessibility list with a floating guide beside
/// it that offers the app as a tile to drag into the list. Callable from any
/// thread. Returns `false` without doing anything when not running from a
/// `.app` bundle (dev builds), which has nothing to drag.
pub fn show_accessibility_guide(locale: GuideLocale) -> bool {
    let code = match locale {
        GuideLocale::System => 0,
        GuideLocale::English => 1,
        GuideLocale::SimplifiedChinese => 2,
    };
    unsafe { ec_show_accessibility_guide(code) }
}

#[cfg(test)]
mod tests {
    use super::GuideLocale;

    #[test]
    fn guide_locale_follows_dashboard_language() {
        assert_eq!(GuideLocale::from_setting(Some("en")), GuideLocale::English);
        assert_eq!(GuideLocale::from_setting(Some("zh-CN")), GuideLocale::SimplifiedChinese);
        assert_eq!(GuideLocale::from_setting(Some("system")), GuideLocale::System);
        assert_eq!(GuideLocale::from_setting(None), GuideLocale::System);
    }
}
