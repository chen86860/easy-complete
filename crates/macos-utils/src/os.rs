use objc2_foundation::{NSLocale, NSOperatingSystemVersion, NSProcessInfo};

/// The user's first preferred language, as a BCP 47 tag such as `en-US` or `zh-Hans-CN`.
pub fn preferred_language() -> Option<String> {
    NSLocale::preferredLanguages().firstObject().map(|l| l.to_string())
}

#[derive(Clone, Copy, Debug)]
pub struct OperatingSystemVersion(NSOperatingSystemVersion);

impl OperatingSystemVersion {
    pub fn get() -> Self {
        Self(NSProcessInfo::processInfo().operatingSystemVersion())
    }

    pub fn major(&self) -> isize {
        self.0.majorVersion
    }

    pub fn minor(&self) -> isize {
        self.0.minorVersion
    }

    pub fn patch(&self) -> isize {
        self.0.patchVersion
    }
}

impl std::fmt::Display for OperatingSystemVersion {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}.{}.{}", self.major(), self.minor(), self.patch())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preferred_language_is_a_language_tag() {
        let language = preferred_language().expect("macOS always has a preferred language");
        assert!(
            language.chars().next().is_some_and(|c| c.is_ascii_lowercase()),
            "{language}"
        );
    }

    #[test]
    fn test_operating_system_version() {
        let v = OperatingSystemVersion::get();
        assert!(v.major() >= 10);

        let formatted = format!("{v}");
        println!("version: {formatted}");
        assert!(formatted.contains('.'));
    }
}
