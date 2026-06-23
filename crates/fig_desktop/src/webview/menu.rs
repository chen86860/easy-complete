#[allow(unused_imports)]
use fig_util::consts::PRODUCT_NAME;
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
                .text("About Project")
                .id(DASHBOARD_ABOUT.into())
                .enabled(true)
                .build(),
            &PredefinedMenuItem::separator(),
            &MenuItemBuilder::new()
                .text("Close Settings Window")
                .id(DASHBOARD_CLOSE.into())
                .enabled(true)
                .accelerator(Some("super+w"))
                .unwrap()
                .build(),
            &PredefinedMenuItem::separator(),
            &MenuItemBuilder::new()
                .text(format!("Quit {PRODUCT_NAME}"))
                .id(DASHBOARD_QUIT.into())
                .enabled(true)
                .accelerator(Some("super+q"))
                .unwrap()
                .build(),
        ])
        .unwrap();

    menu_bar.append(&app_submenu).unwrap();

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
        _ => (),
    }
}
