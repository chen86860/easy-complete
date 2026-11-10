use std::path::PathBuf;

use objc2_app_kit::NSWorkspace;
use objc2_foundation::NSString;

pub fn path_for_application(bundle_identifier: &str) -> Option<PathBuf> {
    let bundle_identifier = NSString::from_str(bundle_identifier);
    let workspace = NSWorkspace::sharedWorkspace();
    let url = workspace.URLForApplicationWithBundleIdentifier(&bundle_identifier)?;
    let path = url.path()?;
    Some(path.to_string().into())
}
