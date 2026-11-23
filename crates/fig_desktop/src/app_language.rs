//! Makes the native UI follow the display language chosen in Settings, not only the
//! web views. Sparkle's update window, and the `xml:lang` release notes it picks from
//! the appcast, are localized from the languages the process resolves at launch, which
//! come from `AppleLanguages`. Writing that key into the app's own defaults domain is
//! what System Settings › Language & Region › Applications does for a per-app language.
//!
//! The process resolves its languages once, on first use: a value written before that
//! applies right away, a later change only after a restart. So this runs at launch,
//! before the tray or Sparkle load anything localized.

/// The `dashboard.language` setting.
const SETTING_KEY: &str = "dashboard.language";

/// Maps `dashboard.language` to the language to pin, or `None` to follow the system.
fn pinned_language(setting: Option<&str>) -> Option<&'static str> {
    match setting {
        Some("en") => Some("en"),
        Some("zh-CN") => Some("zh-Hans"),
        _ => None,
    }
}

#[cfg(target_os = "macos")]
pub fn apply() {
    use objc2_foundation::{NSArray, NSBundle, NSString, NSUserDefaults, ns_string};

    let key = ns_string!("AppleLanguages");
    // Set while the value under `key` is ours. Following the system again then restores
    // what was there before, such as a per-app language chosen in System Settings,
    // instead of removing it.
    let marker = ns_string!("ECAppleLanguagesPinned");
    let backup = ns_string!("ECAppleLanguagesBeforePin");
    let defaults = NSUserDefaults::standardUserDefaults();
    // Only the app's own domain: `objectForKey` would also return the global value.
    let own_value = || {
        let bundle_id = NSBundle::mainBundle().bundleIdentifier()?;
        defaults.persistentDomainForName(&bundle_id)?.objectForKey(key)
    };

    match pinned_language(fig_settings::settings::get_string_opt(SETTING_KEY).as_deref()) {
        Some(language) => {
            if !defaults.boolForKey(marker) {
                match own_value() {
                    // SAFETY: the value was read from user defaults, so it is a property list.
                    Some(previous) => unsafe { defaults.setObject_forKey(Some(&previous), backup) },
                    None => defaults.removeObjectForKey(backup),
                }
                defaults.setBool_forKey(true, marker);
            }
            let languages = NSArray::from_retained_slice(&[NSString::from_str(language)]);
            // SAFETY: an NSArray of NSString is a valid property-list value.
            unsafe { defaults.setObject_forKey(Some(&languages), key) };
        },
        None => {
            if defaults.boolForKey(marker) {
                match defaults.objectForKey(backup) {
                    // SAFETY: the backup was read from user defaults, so it is a property list.
                    Some(previous) => unsafe { defaults.setObject_forKey(Some(&previous), key) },
                    None => defaults.removeObjectForKey(key),
                }
                defaults.removeObjectForKey(backup);
                defaults.removeObjectForKey(marker);
            }
        },
    }
}

#[cfg(not(target_os = "macos"))]
pub fn apply() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pins_only_an_explicit_choice() {
        assert_eq!(pinned_language(Some("en")), Some("en"));
        assert_eq!(pinned_language(Some("zh-CN")), Some("zh-Hans"));
        assert_eq!(pinned_language(Some("system")), None);
        assert_eq!(pinned_language(None), None);
    }
}
