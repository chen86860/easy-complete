use std::cell::Cell;

use fig_ipc::local::send_hook_to_socket;
use fig_proto::hooks::new_caret_position_hook;
use fig_proto::local::caret_position_hook::Origin;
use fig_util::Terminal;
use macos_utils::NotificationCenter;
use objc2::mutability::InteriorMutable;
use objc2::rc::{Allocated, Retained};
use objc2::runtime::{AnyObject, Bool, Sel};
use objc2::{ClassType, DeclaredClass, declare_class, msg_send, msg_send_id, sel};
use objc2_foundation::{NSPoint, NSRange, NSRect, NSSize, NSString, ns_string};
use objc2_input_method_kit::{IMKInputController, IMKServer};
use tracing::{debug, info, trace, warn};

const INPUT_CONTROLLER_CLASS_NAME: &str = env!("InputMethodServerControllerClass");

fn bundle_identifier(client: &AnyObject) -> Option<String> {
    let bundle_id: &NSString = unsafe { msg_send![client, bundleIdentifier] };
    Some(bundle_id.to_string())
}

/// A client that no longer backs a live window — a closed Ghostty window whose input controller
/// is still registered, for example — leaves `attributesForCharacterIndex:lineHeightRectangle:`
/// untouched, so the caret rect stays at its zeroed default. Sending that on would place the
/// overlay at the screen-space origin, which the desktop then clamps to the bottom-left corner of
/// the primary monitor — on multi-monitor setups that is a different screen than the terminal.
fn is_valid_caret_rect(rect: NSRect) -> bool {
    rect.origin.x.is_finite()
        && rect.origin.y.is_finite()
        && rect.size.width.is_finite()
        && rect.size.height.is_finite()
        && rect.size.height > 0.0
}

struct Ivars {
    is_active: Cell<bool>,
}

declare_class!(
    struct MyInputController;

    // - The superclass IMKInputController does not have any subclassing requirements.
    // - Interior mutability is a safe default.
    // - `MyInputController` does not implement `Drop`.
    unsafe impl ClassType for MyInputController {
        type Super = IMKInputController;
        type Mutability = InteriorMutable;
        const NAME: &'static str = INPUT_CONTROLLER_CLASS_NAME;
    }

    impl DeclaredClass for MyInputController {
        type Ivars = Ivars;
    }

    unsafe impl MyInputController {
        #[method_id(initWithServer:delegate:client:)]
        fn init_with_server_delegate_client(this: Allocated<Self>, server: Option<&IMKServer>, delegate: Option<&AnyObject>, client: Option<&AnyObject>) -> Retained<Self> {
            info!("INITING");
            let partial = this.set_ivars(Ivars { is_active: Cell::new(true) });
            let this: Retained<Self> = unsafe { msg_send_id![super(partial, IMKInputController::class()), initWithServer:server delegate: delegate client: client] };

            let mut center = NotificationCenter::distributed_center();
            unsafe {
                center.subscribe_with_observer(
                    ns_string!("com.amazon.codewhisperer.edit_buffer_updated"),
                    &this,
                    sel!(handleCursorPositionRequest:),
                );
            }

            this
        }

        #[method(activateServer:)]
        fn activate_server(&self, client: Option<&AnyObject>) {
            let client = client.unwrap();
            self.ivars().is_active.set(true);

            let bundle_id = bundle_identifier(client);
            info!("activated server: {:?}", bundle_id);

            let terminal = Terminal::from_bundle_id(bundle_id.unwrap_or_default().as_str());

            // Used to trigger input method enabled in Alacritty
            if matches!(terminal, Some(Terminal::Alacritty)) {
                let empty_range = NSRange::new(0, 0);
                let space_string = ns_string!(" ");
                let empty_string = ns_string!("");

                unsafe {
                    // First, setMarkedText with a non-empty string in order to enable winit IME
                    // https://github.com/rust-windowing/winit/blob/97d4c7b303bb8110df6c492f0c2327b7d5098347/src/platform_impl/macos/view.rs#L330-L337
                    let _: () = msg_send![client, setMarkedText: space_string selectionRange: empty_range replacementRange: empty_range];

                    // Then, since we don't *actually* want to be in the preedit state, set marked text to an empty
                    // string to invalidate https://github.com/rust-windowing/winit/blob/97d4c7b303bb8110df6c492f0c2327b7d5098347/src/platform_impl/macos/view.rs#L345-L351
                    let _: () = msg_send![client, setMarkedText: empty_string selectionRange: empty_range replacementRange: empty_range];
                }
            }
        }

        #[method(deactivateServer:)]
        fn deactivate_server(&self, client: Option<&AnyObject>) {
            self.ivars().is_active.set(false);
            info!("deactivated server: {:?}", bundle_identifier(client.unwrap()));
        }

        #[method(handleCursorPositionRequest:)]
        fn handle_cursor_position_request(&self, _notif: Option<&AnyObject>) {
            let client: &AnyObject = unsafe { msg_send![self, client] };
            let bundle_id = bundle_identifier(client);

            let is_active = self.ivars().is_active.get();
            if is_active {
                let terminal = Terminal::from_bundle_id(bundle_id.as_deref().unwrap_or_default());
                match terminal {
                    Some(term) if term.supports_macos_input_method() => {
                        info!("Instance {bundle_id:?} is active, handling request");
                        let mut rect: NSRect = NSRect {
                            origin: NSPoint { x: 0.0, y: 0.0 },
                            size: NSSize {
                                height: 0.0,
                                width: 0.0,
                            },
                        };
                        let _: () = unsafe { msg_send![client, attributesForCharacterIndex: 0 lineHeightRectangle: &mut rect] };

                        if !is_valid_caret_rect(rect) {
                            warn!("Instance {bundle_id:?} reported an invalid caret rect {rect:?}, ignoring request");
                            return;
                        }

                        let hook = new_caret_position_hook(
                            rect.origin.x,
                            rect.origin.y,
                            rect.size.width,
                            rect.size.height,
                            Origin::BottomLeft,
                        );

                        info!("Sending cursor position for {bundle_id:?}: {hook:?}");
                        tokio::spawn(async {
                            match send_hook_to_socket(hook).await {
                                Ok(_) => debug!("Sent hook successfully"),
                                Err(_) => warn!("Failed to send hook"),
                            }
                        });
                    },
                    _ => {
                        info!("Instance {bundle_id:?} is not a supported terminal, ignoring request");
                    },
                }
            }
        }

        #[method(respondsToSelector:)]
        fn responds_to_selector(&self, selector: Sel) -> Bool {
            info!("responds_to_selector");
            info!("superclass");
            let superclass = unsafe { msg_send![self, superclass] };
            info!("should_respond");
            let should_respond: Bool = unsafe { msg_send![super(self, superclass), respondsToSelector: selector] };
            trace!("`{}` should respond? {}", selector.name(), should_respond.as_bool());
            should_respond
        }
    }
);

pub fn connect_imkserver(name: &NSString, identifier: Option<&NSString>) {
    info!("connecting to imkserver");
    let server_alloc = IMKServer::alloc();
    unsafe { IMKServer::initWithName_bundleIdentifier(server_alloc, Some(name), identifier) };
    info!("connected to imkserver");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rect(x: f64, y: f64, width: f64, height: f64) -> NSRect {
        NSRect {
            origin: NSPoint { x, y },
            size: NSSize { width, height },
        }
    }

    #[test]
    fn zeroed_caret_rect_is_rejected() {
        assert!(!is_valid_caret_rect(rect(0.0, 0.0, 0.0, 0.0)));
    }

    #[test]
    fn caret_rect_without_height_is_rejected() {
        assert!(!is_valid_caret_rect(rect(1200.0, 800.0, 8.0, 0.0)));
        assert!(!is_valid_caret_rect(rect(1200.0, 800.0, 8.0, -16.0)));
    }

    #[test]
    fn non_finite_caret_rect_is_rejected() {
        assert!(!is_valid_caret_rect(rect(f64::NAN, 800.0, 8.0, 16.0)));
        assert!(!is_valid_caret_rect(rect(1200.0, f64::INFINITY, 8.0, 16.0)));
    }

    #[test]
    fn caret_rect_on_a_secondary_monitor_is_accepted() {
        // Screens left of or below the primary one report negative Cocoa origins.
        assert!(is_valid_caret_rect(rect(-1920.0, -450.0, 0.0, 16.0)));
        assert!(is_valid_caret_rect(rect(1200.0, 800.0, 8.0, 16.0)));
    }
}

pub fn register_controller() {
    info!("registering {INPUT_CONTROLLER_CLASS_NAME}...");

    MyInputController::class();

    info!("finished registering {INPUT_CONTROLLER_CLASS_NAME}.");
}
