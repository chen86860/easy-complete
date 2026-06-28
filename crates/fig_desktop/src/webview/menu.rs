#[allow(unused_imports)]
use fig_util::consts::PRODUCT_NAME;
use fig_util::consts::url::{
    ISSUE_TRACKER,
    RELEASE_NOTES,
    USER_MANUAL,
};
#[allow(unused_imports)]
use muda::{
    Menu,
    MenuEvent,
    Submenu,
};
use tao::event_loop::ControlFlow;

use crate::event::{
    Event,
    WindowEvent,
};
use crate::{
    DASHBOARD_ID,
    EventLoopProxy,
};

const DASHBOARD_QUIT: &str = "dashboard-quit";
const DASHBOARD_CLOSE: &str = "dashboard-close";
const DASHBOARD_ABOUT: &str = "dashboard-about";
const DASHBOARD_CHECK_FOR_UPDATES: &str = "dashboard-check-for-updates";
const DASHBOARD_OPEN_GITHUB: &str = "dashboard-open-github";
const DASHBOARD_OPEN_RELEASE_NOTES: &str = "dashboard-open-release-notes";
const DASHBOARD_REPORT_ISSUE: &str = "dashboard-report-issue";

#[cfg(target_os = "macos")]
pub fn menu_bar() -> Menu {
    use muda::{
        MenuItemBuilder,
        PredefinedMenuItem,
        Submenu,
    };

    let menu_bar = Menu::new();

    let app_submenu = Submenu::new(PRODUCT_NAME, true);
    app_submenu
        .append_items(&[
            &MenuItemBuilder::new()
                .text(format!("About {}", PRODUCT_NAME))
                .id(DASHBOARD_ABOUT.into())
                .enabled(true)
                .build(),
            &MenuItemBuilder::new()
                .text("Check for Updates…")
                .id(DASHBOARD_CHECK_FOR_UPDATES.into())
                .enabled(true)
                .build(),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::services(None),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::hide(None),
            &PredefinedMenuItem::hide_others(None),
            &PredefinedMenuItem::show_all(None),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::quit(Some("Quit Easy Complete")),
        ])
        .unwrap();

    menu_bar.append(&app_submenu).unwrap();

    let file_submenu = Submenu::new("File", true);
    file_submenu
        .append_items(&[&MenuItemBuilder::new()
            .text("Close Window")
            .id(DASHBOARD_CLOSE.into())
            .enabled(true)
            .accelerator(Some("super+w"))
            .unwrap()
            .build()])
        .unwrap();

    menu_bar.append(&file_submenu).unwrap();

    let edit_submenu = Submenu::new("Edit", true);
    edit_submenu
        .append_items(&[
            &PredefinedMenuItem::undo(None),
            &PredefinedMenuItem::redo(None),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::cut(None),
            &PredefinedMenuItem::copy(None),
            &PredefinedMenuItem::paste(None),
            &PredefinedMenuItem::select_all(None),
        ])
        .unwrap();

    menu_bar.append(&edit_submenu).unwrap();

    let window_submenu = Submenu::new("Window", true);
    window_submenu
        .append_items(&[
            &PredefinedMenuItem::minimize(None),
            &PredefinedMenuItem::maximize(Some("Zoom")),
            &PredefinedMenuItem::separator(),
            &PredefinedMenuItem::bring_all_to_front(None),
        ])
        .unwrap();

    menu_bar.append(&window_submenu).unwrap();

    let help_submenu = Submenu::new("Help", true);
    help_submenu
        .append_items(&[
            &MenuItemBuilder::new()
                .text(format!("{PRODUCT_NAME} on GitHub"))
                .id(DASHBOARD_OPEN_GITHUB.into())
                .enabled(true)
                .build(),
            &MenuItemBuilder::new()
                .text("Release Notes")
                .id(DASHBOARD_OPEN_RELEASE_NOTES.into())
                .enabled(true)
                .build(),
            &MenuItemBuilder::new()
                .text("Report an Issue")
                .id(DASHBOARD_REPORT_ISSUE.into())
                .enabled(true)
                .build(),
        ])
        .unwrap();

    menu_bar.append(&help_submenu).unwrap();

    menu_bar
}

// TODO(chay): add whatever is ergonomic for Windows
#[cfg(target_os = "windows")]
pub fn menu_bar() -> MenuBar {
    let mut menu_bar = MenuBar::new();

    let mut app_submenu = MenuBar::new();
    app_submenu.add_native_item(MenuItem::Hide);
    app_submenu.add_native_item(MenuItem::HideOthers);
    app_submenu.add_native_item(MenuItem::ShowAll);
    app_submenu.add_native_item(MenuItem::Separator);
    app_submenu.add_native_item(MenuItem::CloseWindow);
    app_submenu.add_native_item(MenuItem::Quit);

    menu_bar.add_submenu(PRODUCT_NAME, true, app_submenu);

    let mut edit_submenu = MenuBar::new();

    edit_submenu.add_native_item(MenuItem::Undo);
    edit_submenu.add_native_item(MenuItem::Redo);
    edit_submenu.add_native_item(MenuItem::Separator);
    edit_submenu.add_native_item(MenuItem::Cut);
    edit_submenu.add_native_item(MenuItem::Copy);
    edit_submenu.add_native_item(MenuItem::Paste);
    edit_submenu.add_native_item(MenuItem::Paste);
    edit_submenu.add_native_item(MenuItem::SelectAll);

    menu_bar.add_submenu("Edit", true, edit_submenu);

    menu_bar
}

#[cfg(target_os = "linux")]
pub fn menu_bar() -> Menu {
    Menu::new()
}

pub fn handle_event(menu_event: &MenuEvent, proxy: &EventLoopProxy) {
    match &menu_event.id().0 {
        menu_id if menu_id == DASHBOARD_QUIT => proxy.send_event(Event::ControlFlow(ControlFlow::Exit)).unwrap(),
        menu_id if menu_id == DASHBOARD_CLOSE => proxy
            .send_event(Event::WindowEvent {
                window_id: DASHBOARD_ID,
                window_event: WindowEvent::Hide,
            })
            .unwrap(),
        menu_id if menu_id == DASHBOARD_ABOUT => proxy
            .send_event(Event::WindowEvent {
                window_id: DASHBOARD_ID,
                window_event: WindowEvent::Batch(vec![
                    WindowEvent::NavigateRelative { path: "/about".into() },
                    WindowEvent::Show,
                ]),
            })
            .unwrap(),
        menu_id if menu_id == DASHBOARD_CHECK_FOR_UPDATES => {
            tokio::runtime::Handle::current().spawn(async move {
                let _ = crate::update::check_for_update(true, true).await;
            });
        },
        menu_id if menu_id == DASHBOARD_OPEN_GITHUB => {
            if let Err(err) = fig_util::open_url(USER_MANUAL) {
                tracing::error!(%err, "Failed to open project url");
            }
        },
        menu_id if menu_id == DASHBOARD_OPEN_RELEASE_NOTES => {
            if let Err(err) = fig_util::open_url(RELEASE_NOTES) {
                tracing::error!(%err, "Failed to open release notes url");
            }
        },
        menu_id if menu_id == DASHBOARD_REPORT_ISSUE => {
            if let Err(err) = fig_util::open_url(ISSUE_TRACKER) {
                tracing::error!(%err, "Failed to open issue tracker url");
            }
        },
        _ => (),
    }
}
