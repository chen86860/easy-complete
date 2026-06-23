use std::borrow::Cow;

use cfg_if::cfg_if;
use fig_install::InstallComponents;
use fig_os_shim::Context;
use fig_remote_ipc::figterm::FigtermState;
use fig_util::consts::PRODUCT_NAME;
use fig_util::url::USER_MANUAL;
use muda::accelerator::Accelerator;
use muda::{
    IconMenuItem,
    Menu,
    MenuEvent,
    MenuId,
    PredefinedMenuItem,
    Submenu,
};
use tao::event_loop::ControlFlow;
use tracing::{
    error,
    trace,
};
use tray_icon::{
    Icon,
    TrayIcon,
    TrayIconBuilder,
};

use crate::event::{
    Event,
    ShowMessageNotification,
    WindowEvent,
};
use crate::webview::LOGIN_PATH;
use crate::{
    AUTOCOMPLETE_ID,
    DASHBOARD_ID,
    EventLoopProxy,
    EventLoopWindowTarget,
};

// macro_rules! icon {
//     ($icon:literal) => {{
//         #[cfg(target_os = "macos")]
//         {
//             Some(include_bytes!(concat!(
//                 env!("TRAY_ICONS_PROCESSED"),
//                 "/",
//                 $icon,
//                 ".png"
//             )))
//         }
//         #[cfg(not(target_os = "macos"))]
//         {
//             None
//         }
//     }};
// }

const LOGIN_MENU_ID: &str = "onboarding";

fn tray_update(proxy: &EventLoopProxy) {
    let proxy = proxy.clone();
    tokio::runtime::Handle::current().spawn(async move {
        if !crate::update::check_for_update(true, true).await {
            proxy
                .send_event(
                    ShowMessageNotification {
                        title: format!("{PRODUCT_NAME} updates are unavailable").into(),
                        body: "Sparkle.framework is not bundled in this build.".into(),
                        ..Default::default()
                    }
                    .into(),
                )
                .unwrap();
        }
    });
}

pub fn handle_event(menu_event: &MenuEvent, proxy: &EventLoopProxy) {
    match &*menu_event.id().0 {
        "dashboard-devtools" => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID,
                    window_event: WindowEvent::Devtools,
                })
                .unwrap();
        },
        "autocomplete-devtools" => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: AUTOCOMPLETE_ID,
                    window_event: WindowEvent::Devtools,
                })
                .unwrap();
        },
        "update" => {
            tray_update(proxy);
        },
        "quit" => {
            proxy.send_event(Event::ControlFlow(ControlFlow::Exit)).unwrap();
        },
        "dashboard" => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID.clone(),
                    window_event: WindowEvent::Batch(vec![
                        WindowEvent::NavigateRelative { path: "/".into() },
                        WindowEvent::Show,
                    ]),
                })
                .unwrap();
        },
        LOGIN_MENU_ID => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID.clone(),
                    window_event: WindowEvent::Batch(vec![
                        WindowEvent::NavigateRelative {
                            path: LOGIN_PATH.into(),
                        },
                        WindowEvent::Show,
                    ]),
                })
                .unwrap();
        },
        "settings" => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID.clone(),
                    window_event: WindowEvent::Batch(vec![
                        WindowEvent::NavigateRelative {
                            path: "/autocomplete".into(),
                        },
                        WindowEvent::Show,
                    ]),
                })
                .unwrap();
        },
        "not-working" => {
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID.clone(),
                    window_event: WindowEvent::Batch(vec![
                        WindowEvent::NavigateRelative { path: "/help".into() },
                        WindowEvent::Show,
                    ]),
                })
                .unwrap();
        },
        "uninstall" => {
            tokio::runtime::Handle::current().spawn(async {
                fig_install::uninstall(InstallComponents::all(), Context::new())
                    .await
                    .ok();
                #[allow(clippy::exit)]
                std::process::exit(0);
            });
        },
        "user-manual" => {
            if let Err(err) = fig_util::open_url(USER_MANUAL) {
                error!(%err, "Failed to open user manual url");
            }
        },
        id => {
            trace!(?id, "Unhandled tray event");
        },
    }

    // fig_telemetry removed
}

#[allow(dead_code)]
#[cfg(target_os = "linux")]
fn load_icon(path: impl AsRef<std::path::Path>) -> Option<Icon> {
    let image = image::open(path).ok()?.into_rgba8();
    let (width, height) = image.dimensions();
    let rgba = image.into_raw();
    Icon::from_rgba(rgba, width, height).ok()
}

pub async fn build_tray(
    _event_loop_window_target: &EventLoopWindowTarget,
    _figterm_state: &FigtermState,
) -> tray_icon::Result<TrayIcon> {
    let is_logged_in = true; // fig_auth removed
    TrayIconBuilder::new()
        .with_icon(get_icon(is_logged_in))
        .with_icon_as_template(true)
        .with_menu(Box::new(get_context_menu(is_logged_in)))
        .build()
}

pub fn get_icon(is_logged_in: bool) -> Icon {
    let (icon_rgba, icon_width, icon_height) = {
        let bytes = if is_logged_in {
            cfg_if! {
                if #[cfg(target_os = "linux")] {
                    include_bytes!("../icons/icon-monochrome-light.png").to_vec()
                } else {
                    include_bytes!("../icons/icon-monochrome.png").to_vec()
                }
            }
        } else {
            cfg_if! {
                if #[cfg(target_os = "linux")] {
                    // This is intentionally the same as when logged in since Linux tray icons
                    // don't really seem to work that well when multiple choices are available.
                    include_bytes!("../icons/icon-monochrome-light.png").to_vec()
                } else {
                    include_bytes!("../icons/not-logged-in.png").to_vec()
                }
            }
        };
        let image = image::load_from_memory(&bytes)
            .expect("Failed to open icon path")
            .into_rgba8();
        let (width, height) = image.dimensions();
        let rgba = image.into_raw();
        (rgba, width, height)
    };
    Icon::from_rgba(icon_rgba, icon_width, icon_height).expect("Failed to open icon")
}

fn get_image_rgba(image_bytes: &[u8]) -> (Vec<u8>, u32, u32) {
    let image = image::load_from_memory(image_bytes)
        .expect("Failed to open icon path")
        .into_rgba8();
    let (width, height) = image.dimensions();
    let rgba = image.into_raw();
    (rgba, width, height)
}

pub fn get_context_menu(is_logged_in: bool) -> Menu {
    let mut tray_menu = Menu::new();

    let elements = menu(is_logged_in);
    for elem in elements {
        elem.add_to_menu(&mut tray_menu);
    }

    tray_menu
}

enum MenuElement {
    Info {
        image_icon: Option<muda::Icon>,
        text: Cow<'static, str>,
    },
    Entry {
        emoji_icon: Option<Cow<'static, str>>,
        image_icon: Option<muda::Icon>,
        text: Cow<'static, str>,
        id: Cow<'static, str>,
        accelerator: Option<Accelerator>,
    },
    Separator,
    #[allow(dead_code)]
    SubMenu {
        title: Cow<'static, str>,
        elements: Vec<MenuElement>,
    },
}

impl MenuElement {
    fn info(image_icon: Option<(Vec<u8>, u32, u32)>, text: impl Into<Cow<'static, str>>) -> Self {
        Self::Info {
            image_icon: image_icon.and_then(|(bytes, width, height)| muda::Icon::from_rgba(bytes, width, height).ok()),
            text: text.into(),
        }
    }

    fn entry(
        emoji_icon: Option<Cow<'static, str>>,
        image_icon: Option<(Vec<u8>, u32, u32)>,
        text: impl Into<Cow<'static, str>>,
        id: impl Into<Cow<'static, str>>,
    ) -> Self {
        Self::Entry {
            emoji_icon,
            image_icon: image_icon.and_then(|(bytes, width, height)| muda::Icon::from_rgba(bytes, width, height).ok()),
            text: text.into(),
            id: id.into(),
            accelerator: None,
        }
    }

    fn with_accelerator(mut self, accel: &str) -> Self {
        if let Self::Entry {
            ref mut accelerator, ..
        } = self
        {
            *accelerator = accel.parse::<Accelerator>().ok();
        }
        self
    }

    // fn sub_menu(title: impl Into<Cow<'static, str>>, elements: Vec<MenuElement>) -> Self {
    //     Self::SubMenu {
    //         title: title.into(),
    //         elements,
    //     }
    // }

    fn add_to_menu(&self, menu: &mut Menu) {
        match self {
            MenuElement::Info { text, image_icon } => {
                let menu_item = IconMenuItem::new(
                    text,
                    false,
                    image_icon.clone(), // Some(muda::Icon::from_rgba(bytes, width, height).unwrap()),
                    None,
                );
                menu.append(&menu_item).unwrap();
            },
            MenuElement::Entry {
                emoji_icon,
                image_icon,
                text,
                id,
                accelerator,
            } => {
                let text = match (std::env::consts::OS, emoji_icon) {
                    ("linux", Some(emoji_icon)) => format!("{emoji_icon} {text}"),
                    _ => text.to_string(),
                };
                let menu_item = IconMenuItem::with_id(MenuId::new(id), text, true, image_icon.clone(), *accelerator);
                menu.append(&menu_item).unwrap();
            },
            MenuElement::Separator => {
                menu.append(&PredefinedMenuItem::separator()).unwrap();
            },
            MenuElement::SubMenu { title, elements } => {
                let sub_menu = Submenu::new(title, true);
                for element in elements {
                    element.add_to_submenu(&sub_menu);
                }

                menu.append(&sub_menu).unwrap();
            },
        }
    }

    fn add_to_submenu(&self, submenu: &Submenu) {
        match self {
            MenuElement::Info { image_icon, text } => {
                // menu.append(MenuItemAttributes::new(info).with_enabled(false));
                let menu_item = IconMenuItem::new(
                    text,
                    false,
                    image_icon.clone(), // Some(muda::Icon::from_rgba(bytes, width, height).unwrap()),
                    None,
                );
                submenu.append(&menu_item).unwrap();
            },
            MenuElement::Entry {
                emoji_icon,
                text,
                id,
                accelerator,
                ..
            } => {
                let text: String = match (std::env::consts::OS, emoji_icon) {
                    ("linux", Some(emoji_icon)) => format!("{emoji_icon} {text}"),
                    _ => text.to_string(),
                };
                let menu_item = muda::MenuItem::with_id(MenuId::new(id), text, true, *accelerator);
                submenu.append(&menu_item).unwrap();
            },
            MenuElement::Separator => {
                submenu.append(&PredefinedMenuItem::separator()).unwrap();
            },
            MenuElement::SubMenu { title, elements } => {
                let sub_menu = Submenu::new(title, true);
                for element in elements {
                    element.add_to_submenu(&sub_menu);
                }

                submenu.append(&sub_menu).unwrap();
            },
        }
    }
}

fn menu(is_logged_in: bool) -> Vec<MenuElement> {
    let quit = MenuElement::entry(None, None, "Quit", "quit").with_accelerator("super+KeyQ");
    let settings = MenuElement::entry(None, None, "Settings", "settings").with_accelerator("super+Comma");

    let onboarded_completed = fig_settings::state::get_bool_or("desktop.completedOnboarding", false);
    let yellow_circle_img = get_image_rgba(include_bytes!("../icons/yellow-circle.png"));
    let mut menu = if !is_logged_in && !onboarded_completed {
        vec![
            MenuElement::info(
                Some(yellow_circle_img),
                format!("{PRODUCT_NAME} hasn't been set up yet..."),
            ),
            MenuElement::entry(None, None, "Get Started", LOGIN_MENU_ID),
        ]
    } else if !is_logged_in {
        vec![
            MenuElement::info(Some(yellow_circle_img), "Your session has expired"),
            MenuElement::entry(None, None, "Log back in", LOGIN_MENU_ID),
        ]
    } else {
        vec![settings]
    };

    menu.extend(vec![MenuElement::Separator, quit]);

    menu
}
