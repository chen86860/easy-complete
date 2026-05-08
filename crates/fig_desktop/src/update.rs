#[cfg(not(target_os = "linux"))]
pub async fn check_for_update(_show_webview: bool, _relaunch_dashboard: bool) -> bool {
    false
}
