pub mod autocomplete;
pub mod companion;
pub mod dashboard;
pub mod menu;
pub mod notification;
pub mod window;
pub mod window_id;

use std::collections::HashMap;
use std::rc::Rc;
use std::sync::{Arc, LazyLock, OnceLock};
use std::time::{Duration, Instant};

use cfg_if::cfg_if;
use fig_desktop_api::init_script::javascript_init;
use fig_desktop_api::kv::DashKVStore;
use fig_os_shim::Context;
use fig_proto::fig::ClientOriginatedMessage;
use fig_proto::fig::client_originated_message::Submessage;
use fig_remote_ipc::figterm::FigtermState;
use fig_util::consts::PRODUCT_NAME;
use fig_util::{URL_SCHEMA, directories};
use fnv::FnvBuildHasher;
use muda::MenuEvent;
use regex::RegexSet;
use tao::dpi::{LogicalPosition, LogicalSize};
use tao::event::{Event as WryEvent, StartCause, WindowEvent as WryWindowEvent};
use tao::event_loop::{ControlFlow, EventLoopBuilder};
use tao::window::{Theme as TaoTheme, Window, WindowBuilder, WindowId as WryWindowId};
use tokio::sync::mpsc::UnboundedSender;
use tokio::time::MissedTickBehavior;
use tracing::{debug, error, info, trace, warn};
use url::Url;
use window::WindowState;
use wry::{Theme as WryTheme, WebContext, WebView, WebViewBuilder};

use self::menu::menu_bar;
use self::notification::WebviewNotificationsState;
use self::window_id::DashboardId;
use crate::event::{Event, ShowMessageNotification, WindowEvent};
use crate::notification_bus::{JsonNotification, NOTIFICATION_BUS};
use crate::platform::{PlatformBoundEvent, PlatformState};
use crate::protocol::spec::clear_index_cache;
use crate::protocol::{api, icons, resource, spec};
use crate::remote_ipc::RemoteHook;
use crate::request::api_request;
use crate::tray::{self, build_tray, get_context_menu, get_icon};
use crate::webview::window_id::AutocompleteId;
pub use crate::webview::window_id::{AUTOCOMPLETE_ID, DASHBOARD_ID, WindowId};
use crate::{
    EventLoop, EventLoopProxy, EventLoopWindowTarget, InterceptState, auth_watcher, file_watcher, local_ipc, utils,
};

pub const DASHBOARD_SIZE: LogicalSize<f64> = LogicalSize::new(820.0, 640.0);
pub const DASHBOARD_MINIMUM_SIZE: LogicalSize<f64> = LogicalSize::new(DASHBOARD_SIZE.width, 520.0);
pub const DASHBOARD_MAXIMUM_SIZE: LogicalSize<f64> = LogicalSize::new(DASHBOARD_SIZE.width, 10_000.0);

pub const AUTOCOMPLETE_WINDOW_TITLE: &str = "Fig Autocomplete";
pub const AUTOCOMPLETE_KEEP_READY_SETTING: &str = "autocomplete.keepReady";
const AUTOCOMPLETE_RELEASE_DELAY_SETTING: &str = "developer.autocomplete.releaseDelaySeconds";
const DEFAULT_AUTOCOMPLETE_RELEASE_DELAY: Duration = Duration::from_secs(10 * 60);
/// How long to hold window events before giving up on the webview reporting that it mounted.
const AUTOCOMPLETE_MOUNT_TIMEOUT: Duration = Duration::from_secs(5);

pub const LOGIN_PATH: &str = "/";

fn map_theme(theme: &str) -> Option<WryTheme> {
    match theme {
        "dark" => Some(WryTheme::Dark),
        "light" => Some(WryTheme::Light),
        _ => None,
    }
}

fn to_tao_theme(theme: WryTheme) -> Option<TaoTheme> {
    match theme {
        WryTheme::Dark => Some(TaoTheme::Dark),
        WryTheme::Light => Some(TaoTheme::Light),
        WryTheme::Auto => None,
    }
}

pub static THEME: LazyLock<Option<WryTheme>> = LazyLock::new(|| {
    fig_settings::settings::get_string("app.theme")
        .ok()
        .flatten()
        .as_deref()
        .and_then(map_theme)
});

pub type FigIdMap = HashMap<WindowId, Rc<WindowState>, FnvBuildHasher>;
pub type WryIdMap = HashMap<WryWindowId, Rc<WindowState>, FnvBuildHasher>;

pub struct WebviewManager {
    fig_id_map: FigIdMap,
    window_id_map: WryIdMap,
    event_loop: EventLoop,
    figterm_state: Arc<FigtermState>,
    intercept_state: Arc<InterceptState>,
    platform_state: Arc<PlatformState>,
    notifications_state: Arc<WebviewNotificationsState>,
    dash_kv_store: Arc<DashKVStore>,
    context: Arc<Context>,
    show_dashboard_after_normal_launch: bool,
}

pub static GLOBAL_PROXY: OnceLock<EventLoopProxy> = OnceLock::new();
pub static FIGTERM_STATE: OnceLock<Arc<FigtermState>> = OnceLock::new();
pub static INTERCEPT_STATE: OnceLock<Arc<InterceptState>> = OnceLock::new();
pub static PLATFORM_STATE: OnceLock<Arc<PlatformState>> = OnceLock::new();
pub static NOTIFICATIONS_STATE: OnceLock<Arc<WebviewNotificationsState>> = OnceLock::new();
pub static DASH_KV_STORE: OnceLock<Arc<DashKVStore>> = OnceLock::new();

/// Whether an event can only be served by a live window, and so must rebuild a released one.
fn event_requests_window(event: &WindowEvent) -> bool {
    match event {
        WindowEvent::Show | WindowEvent::Devtools => true,
        WindowEvent::Batch(events) => events.iter().any(event_requests_window),
        _ => false,
    }
}

fn autocomplete_should_be_loaded(active_sessions: usize, keep_ready: bool) -> bool {
    active_sessions > 0 || keep_ready
}

fn autocomplete_should_release(
    timer_generation: u64,
    current_generation: u64,
    active_sessions: usize,
    keep_ready: bool,
) -> bool {
    timer_generation == current_generation && !autocomplete_should_be_loaded(active_sessions, keep_ready)
}

fn autocomplete_release_delay() -> Duration {
    let seconds = fig_settings::settings::get_int_or(
        AUTOCOMPLETE_RELEASE_DELAY_SETTING,
        DEFAULT_AUTOCOMPLETE_RELEASE_DELAY.as_secs() as i64,
    )
    .clamp(1, 24 * 60 * 60);
    Duration::from_secs(seconds as u64)
}

fn dashboard_page_for_event(event: &WindowEvent) -> Option<String> {
    match event {
        WindowEvent::NavigateRelative { path } => Some(path.to_string()),
        WindowEvent::Batch(events) => events.iter().filter_map(dashboard_page_for_event).next_back(),
        _ => None,
    }
}

fn build_dashboard_webview(
    context: &Arc<Context>,
    fig_id_map: &mut FigIdMap,
    window_id_map: &mut WryIdMap,
    window_target: &EventLoopWindowTarget,
    page: Option<String>,
) -> anyhow::Result<()> {
    let web_context_path = directories::fig_data_dir()?
        .join("webcontexts")
        .join(DASHBOARD_ID.0.as_ref());
    let mut web_context = WebContext::new(Some(web_context_path));
    let (window, webview) = build_dashboard(
        Arc::clone(context),
        &mut web_context,
        window_target,
        DashboardOptions {
            show_onboarding: false,
            visible: false,
            page,
        },
    )?;
    let window_state = Rc::new(WindowState::new(
        window,
        DASHBOARD_ID,
        webview,
        web_context,
        true,
        dashboard::url(),
    ));
    insert_webview(fig_id_map, window_id_map, window_state);
    Ok(())
}

fn build_autocomplete_webview(
    context: &Arc<Context>,
    fig_id_map: &mut FigIdMap,
    window_id_map: &mut WryIdMap,
    window_target: &EventLoopWindowTarget,
) -> anyhow::Result<Instant> {
    let started_at = Instant::now();
    let web_context_path = directories::fig_data_dir()?
        .join("webcontexts")
        .join(AUTOCOMPLETE_ID.0.as_ref());
    let mut web_context = WebContext::new(Some(web_context_path));
    let (window, webview) = build_autocomplete(
        Arc::clone(context),
        &mut web_context,
        window_target,
        AutocompleteOptions,
    )?;
    let enabled = !fig_settings::settings::get_bool_or("autocomplete.disable", false)
        && PlatformState::accessibility_is_enabled().unwrap_or(true);
    let window_state = Rc::new(WindowState::new(
        window,
        AUTOCOMPLETE_ID,
        webview,
        web_context,
        enabled,
        autocomplete::url(),
    ));
    insert_webview(fig_id_map, window_id_map, window_state);

    // A rebuilt overlay gets a brand new native window, so the level the focus handler applied to
    // the previous one is gone. Without this it stays at the default level until the user switches
    // terminals again, which puts it behind always-on-top terminals like iTerm's Quake mode.
    GLOBAL_PROXY
        .get()
        .expect("event loop proxy is initialized")
        .send_event(Event::PlatformBoundEvent(
            PlatformBoundEvent::AutocompleteWindowLevelUpdateRequested,
        ))
        .ok();

    let duration_ms = started_at.elapsed().as_millis() as u64;
    info!(duration_ms, "Autocomplete webview created");
    fig_telemetry::track_with_props(
        "autocomplete_webview_created",
        serde_json::json!({ "duration_ms": duration_ms }),
    );
    Ok(started_at)
}

fn insert_webview(fig_id_map: &mut FigIdMap, window_id_map: &mut WryIdMap, window_state: Rc<WindowState>) {
    fig_id_map.insert(window_state.window_id.clone(), window_state.clone());
    window_id_map.insert(window_state.window.id(), window_state);
}

fn remove_webview(
    fig_id_map: &mut FigIdMap,
    window_id_map: &mut WryIdMap,
    notifications_state: &WebviewNotificationsState,
    window_id: &WindowId,
) {
    if let Some(window_state) = fig_id_map.remove(window_id) {
        window_id_map.remove(&window_state.window.id());
        notifications_state.subscriptions.remove(window_id);
        debug!(%window_id, "Released window and webview");
    }
}

fn close_dashboard(
    fig_id_map: &mut FigIdMap,
    window_id_map: &mut WryIdMap,
    notifications_state: &WebviewNotificationsState,
    proxy: &EventLoopProxy,
) {
    if !fig_id_map.contains_key(&DASHBOARD_ID) {
        return;
    }

    proxy
        .send_event(Event::PlatformBoundEvent(PlatformBoundEvent::AppWindowFocusChanged {
            window_id: DASHBOARD_ID,
            focused: true,
            fullscreen: false,
            visible: false,
        }))
        .ok();
    remove_webview(fig_id_map, window_id_map, notifications_state, &DASHBOARD_ID);
}

/// Dispatches events that were held back while the autocomplete webview was loading.
///
/// These are handled inline rather than pushed back through the event loop proxy: the proxy is
/// FIFO, so re-sending would put these older events *behind* any event that arrived while the
/// webview was mounting, and a stale `Show` replayed after a fresh `Hide` would leave the overlay
/// stuck on screen.
fn dispatch_deferred_autocomplete_events(
    events: Vec<WindowEvent>,
    fig_id_map: &FigIdMap,
    figterm_state: &FigtermState,
    platform_state: &PlatformState,
    notifications_state: &WebviewNotificationsState,
    window_target: &EventLoopWindowTarget,
    api_tx: &UnboundedSender<(WindowId, String)>,
) {
    let Some(window_state) = fig_id_map.get(&AUTOCOMPLETE_ID) else {
        return;
    };

    for window_event in events {
        if window_state.enabled() || window_event.is_allowed_while_disabled() {
            window_state.handle(
                window_event,
                figterm_state,
                platform_state,
                notifications_state,
                window_target,
                api_tx,
            );
        } else {
            trace!(
                ?window_event,
                "Ignoring deferred event for disabled autocomplete window"
            );
        }
    }
}

/// Handles [`WindowEvent::Close`] for the windows that can be rebuilt on demand.
///
/// Returns `false` for every other window, in which case the caller falls through to the regular
/// handler, which hides the window instead of releasing it.
fn release_window(
    window_id: &WindowId,
    fig_id_map: &mut FigIdMap,
    window_id_map: &mut WryIdMap,
    notifications_state: &WebviewNotificationsState,
    autocomplete_lifecycle: &mut AutocompleteLifecycle,
    proxy: &EventLoopProxy,
) -> bool {
    if *window_id == DASHBOARD_ID {
        close_dashboard(fig_id_map, window_id_map, notifications_state, proxy);
        return true;
    }

    if *window_id == AUTOCOMPLETE_ID {
        autocomplete_lifecycle.release(fig_id_map, window_id_map, notifications_state);
        return true;
    }

    false
}

#[derive(Default)]
struct AutocompleteLifecycle {
    /// Last known `autocomplete.keepReady` value.
    ///
    /// Seeded from settings at startup and updated from settings notifications after that. It is
    /// deliberately not re-read on every reconcile: see [`Event::AutocompleteLifecycleChanged`].
    keep_ready: bool,
    release_generation: u64,
    release_task: Option<tokio::task::JoinHandle<()>>,
    created_at: Option<Instant>,
    mount_generation: u64,
    mounted: bool,
    deferred_events: Vec<WindowEvent>,
    ready_reported: bool,
    specs_ready_reported: bool,
}

impl AutocompleteLifecycle {
    fn new() -> Self {
        Self {
            keep_ready: fig_settings::settings::get_bool_or(AUTOCOMPLETE_KEEP_READY_SETTING, false),
            ..Default::default()
        }
    }

    /// Records a fresh `autocomplete.keepReady` value observed in a settings notification.
    fn set_keep_ready(&mut self, keep_ready: bool) {
        self.keep_ready = keep_ready;
    }

    fn ensure_loaded(
        &mut self,
        context: &Arc<Context>,
        fig_id_map: &mut FigIdMap,
        window_id_map: &mut WryIdMap,
        window_target: &EventLoopWindowTarget,
        proxy: &EventLoopProxy,
    ) -> anyhow::Result<()> {
        if fig_id_map.contains_key(&AUTOCOMPLETE_ID) {
            return Ok(());
        }

        self.created_at = Some(build_autocomplete_webview(
            context,
            fig_id_map,
            window_id_map,
            window_target,
        )?);
        self.reset_mount_state();
        self.ready_reported = false;
        self.specs_ready_reported = false;

        // The webview normally reports in as soon as its React app mounts. If it never does — a
        // bundle that fails to load, say — drain the deferred events anyway rather than leaving
        // the overlay permanently deaf.
        let generation = self.mount_generation;
        let proxy = proxy.clone();
        tokio::spawn(async move {
            tokio::time::sleep(AUTOCOMPLETE_MOUNT_TIMEOUT).await;
            proxy
                .send_event(Event::AutocompleteMountTimeoutElapsed { generation })
                .ok();
        });

        Ok(())
    }

    /// Invalidates any in-flight mount timeout and drops events deferred for the old webview.
    fn reset_mount_state(&mut self) {
        self.mount_generation = self.mount_generation.wrapping_add(1);
        self.mounted = false;
        self.deferred_events.clear();
    }

    /// Holds an event back while the webview is still loading.
    ///
    /// Returns the event when it can be dispatched now, or [`None`] once it has been deferred.
    /// Showing a freshly built overlay immediately would flash an empty window, and the edit
    /// buffer state behind the event would be lost because the new app starts blank.
    fn defer_until_mounted(&mut self, loaded: bool, window_event: WindowEvent) -> Option<WindowEvent> {
        if self.mounted || !loaded {
            return Some(window_event);
        }

        debug!(?window_event, "Deferring autocomplete event until the webview mounts");
        self.deferred_events.push(window_event);
        None
    }

    /// Marks the webview as ready for events and returns everything deferred, in arrival order.
    fn mark_mounted(&mut self) -> Vec<WindowEvent> {
        if self.mounted {
            return Vec::new();
        }

        self.mounted = true;
        let deferred = std::mem::take(&mut self.deferred_events);
        if !deferred.is_empty() {
            debug!(count = deferred.len(), "Replaying deferred autocomplete events");
        }
        deferred
    }

    fn mount_timeout_elapsed(&mut self, generation: u64) -> Vec<WindowEvent> {
        if generation != self.mount_generation || self.mounted {
            return Vec::new();
        }

        warn!("Autocomplete webview never reported mounting, replaying deferred events anyway");
        self.mark_mounted()
    }

    fn reconcile(
        &mut self,
        context: &Arc<Context>,
        fig_id_map: &mut FigIdMap,
        window_id_map: &mut WryIdMap,
        figterm_state: &FigtermState,
        window_target: &EventLoopWindowTarget,
        proxy: &EventLoopProxy,
    ) -> anyhow::Result<()> {
        if let Some(release_task) = self.release_task.take() {
            release_task.abort();
        }
        self.release_generation = self.release_generation.wrapping_add(1);
        let active_sessions = figterm_state.inner.lock().linked_sessions.len();
        let keep_ready = self.keep_ready;

        if autocomplete_should_be_loaded(active_sessions, keep_ready) {
            self.ensure_loaded(context, fig_id_map, window_id_map, window_target, proxy)?;
            debug!(active_sessions, keep_ready, "Keeping autocomplete webview loaded");
        } else if fig_id_map.contains_key(&AUTOCOMPLETE_ID) {
            let generation = self.release_generation;
            let proxy = proxy.clone();
            let release_delay = autocomplete_release_delay();
            self.release_task = Some(tokio::spawn(async move {
                tokio::time::sleep(release_delay).await;
                proxy
                    .send_event(Event::AutocompleteReleaseTimerElapsed { generation })
                    .ok();
            }));
            info!(
                active_sessions,
                delay_seconds = release_delay.as_secs(),
                "Scheduled autocomplete webview release"
            );
        } else {
            debug!(active_sessions, keep_ready, "Autocomplete webview stays unloaded");
        }

        Ok(())
    }

    fn release_if_idle(
        &mut self,
        timer_generation: u64,
        fig_id_map: &mut FigIdMap,
        window_id_map: &mut WryIdMap,
        notifications_state: &WebviewNotificationsState,
        figterm_state: &FigtermState,
    ) {
        self.release_task = None;
        let active_sessions = figterm_state.inner.lock().linked_sessions.len();
        let keep_ready = self.keep_ready;
        if autocomplete_should_release(timer_generation, self.release_generation, active_sessions, keep_ready) {
            self.release(fig_id_map, window_id_map, notifications_state);
            info!("Released idle autocomplete webview");
        } else {
            debug!(
                timer_generation,
                current_generation = self.release_generation,
                active_sessions,
                keep_ready,
                "Ignored stale autocomplete release timer"
            );
        }
    }

    /// Tears down the webview and forgets everything tied to that instance.
    fn release(
        &mut self,
        fig_id_map: &mut FigIdMap,
        window_id_map: &mut WryIdMap,
        notifications_state: &WebviewNotificationsState,
    ) {
        remove_webview(fig_id_map, window_id_map, notifications_state, &AUTOCOMPLETE_ID);
        self.reset_mount_state();
        self.created_at = None;
        self.ready_reported = false;
        self.specs_ready_reported = false;
    }

    fn mark_ready(&mut self) {
        if self.ready_reported {
            return;
        }
        if let Some(created_at) = self.created_at.as_ref() {
            let duration_ms = created_at.elapsed().as_millis() as u64;
            info!(duration_ms, "Autocomplete rendered its first suggestions");
            fig_telemetry::track_with_props(
                "autocomplete_webview_ready",
                serde_json::json!({ "duration_ms": duration_ms }),
            );
            self.ready_reported = true;
        }
    }

    fn mark_specs_ready(&mut self) {
        if self.specs_ready_reported {
            return;
        }
        if let Some(created_at) = self.created_at.as_ref() {
            let duration_ms = created_at.elapsed().as_millis() as u64;
            info!(duration_ms, "Autocomplete preloaded specs ready");
            fig_telemetry::track_with_props(
                "autocomplete_preloaded_specs_ready",
                serde_json::json!({ "duration_ms": duration_ms }),
            );
            self.specs_ready_reported = true;
        }
    }
}

impl WebviewManager {
    #[allow(unused_variables)]
    #[allow(unused_mut)]
    pub fn new(context: Arc<Context>, visible: bool, show_dashboard_after_normal_launch: bool) -> Self {
        let mut event_loop = EventLoopBuilder::with_user_event().build();

        #[cfg(target_os = "macos")]
        if !visible {
            use tao::platform::macos::{ActivationPolicy, EventLoopExtMacOS};

            use crate::platform::ACTIVATION_POLICY;

            *ACTIVATION_POLICY.lock().unwrap() = ActivationPolicy::Accessory;
            event_loop.set_activation_policy(ActivationPolicy::Accessory);
        }

        let proxy = event_loop.create_proxy();
        GLOBAL_PROXY.set(proxy.clone()).unwrap();

        let figterm_state = Arc::new(FigtermState::default());
        FIGTERM_STATE.set(figterm_state.clone()).unwrap();

        let intercept_state = Arc::new(InterceptState::default());
        INTERCEPT_STATE.set(intercept_state.clone()).unwrap();

        let platform_state = Arc::new(PlatformState::new(proxy));
        PLATFORM_STATE.set(platform_state.clone()).unwrap();

        let notifications_state = Arc::new(WebviewNotificationsState::default());
        NOTIFICATIONS_STATE.set(notifications_state.clone()).unwrap();

        let dash_kv_store = Arc::new(DashKVStore::new());
        DASH_KV_STORE.set(dash_kv_store.clone()).unwrap();

        Self {
            fig_id_map: Default::default(),
            window_id_map: Default::default(),
            event_loop,
            figterm_state,
            intercept_state,
            platform_state,
            notifications_state,
            dash_kv_store,
            context,
            show_dashboard_after_normal_launch,
        }
    }

    fn insert_webview(
        &mut self,
        window: Window,
        window_id: WindowId,
        webview: WebView,
        context: WebContext,
        enabled: bool,
        url: Url,
    ) {
        let window_state = Rc::new(WindowState::new(window, window_id, webview, context, enabled, url));
        insert_webview(&mut self.fig_id_map, &mut self.window_id_map, window_state);
    }

    pub fn build_webview<T>(
        &mut self,
        window_id: WindowId,
        builder: impl Fn(Arc<Context>, &mut WebContext, &EventLoopWindowTarget, T) -> anyhow::Result<(Window, WebView)>,
        options: T,
        enabled: bool,
        url_fn: impl Fn() -> Url,
    ) -> anyhow::Result<()> {
        let web_context_path = directories::fig_data_dir()?
            .join("webcontexts")
            .join(window_id.0.as_ref());
        let mut web_context = WebContext::new(Some(web_context_path));
        let (window, webview) = builder(Arc::clone(&self.context), &mut web_context, &self.event_loop, options)?;
        self.insert_webview(window, window_id, webview, web_context, enabled, url_fn());
        Ok(())
    }

    #[allow(unused_mut)]
    pub async fn run(mut self) -> wry::Result<()> {
        self.platform_state
            .handle(
                PlatformBoundEvent::Initialize,
                &self.event_loop,
                &self.fig_id_map,
                &self.notifications_state,
            )
            .expect("Failed to initialize platform state");

        // TODO: implement
        // tokio::spawn(figterm::clean_figterm_cache(self.figterm_state.clone()));

        // Start the local ipc task, listens for requests to the desktop socket.
        {
            let platform_state = self.platform_state.clone();
            let figterm_state = self.figterm_state.clone();
            let notifications_state = self.notifications_state.clone();
            let event_loop = self.event_loop.create_proxy();
            tokio::spawn(async move {
                match local_ipc::start_local_ipc(platform_state, figterm_state, notifications_state, event_loop).await {
                    Ok(_) => (),
                    Err(err) => error!("Unable to start local ipc: {:?}", err),
                }
            });
        }

        tokio::spawn(fig_remote_ipc::remote::start_remote_ipc(
            fig_util::directories::local_remote_socket_path().unwrap(),
            self.figterm_state.clone(),
            RemoteHook {
                notifications_state: self.notifications_state.clone(),
                proxy: self.event_loop.create_proxy(),
            },
        ));

        let (api_handler_tx, mut api_handler_rx) = tokio::sync::mpsc::unbounded_channel::<(WindowId, String)>();
        let (sync_api_handler_tx, mut sync_api_handler_rx) = tokio::sync::mpsc::unbounded_channel::<(
            WindowId,
            fig_desktop_api::error::Result<ClientOriginatedMessage>,
        )>();

        {
            let sync_proxy = self.event_loop.create_proxy();
            let sync_figterm_state = self.figterm_state.clone();
            let sync_intercept_state = self.intercept_state.clone();
            let sync_notifications_state = self.notifications_state.clone();
            let dash_kv_store = self.dash_kv_store.clone();

            tokio::spawn(async move {
                while let Some((fig_id, message)) = sync_api_handler_rx.recv().await {
                    let proxy = sync_proxy.clone();
                    let figterm_state = sync_figterm_state.clone();
                    let intercept_state = sync_intercept_state.clone();
                    let notifications_state = sync_notifications_state.clone();
                    api_request(
                        fig_id,
                        message,
                        &figterm_state,
                        &intercept_state,
                        &notifications_state,
                        &proxy.clone(),
                        &dash_kv_store,
                    )
                    .await;
                }
            });

            let proxy = self.event_loop.create_proxy();
            let figterm_state = self.figterm_state.clone();
            let intercept_state = self.intercept_state.clone();
            let notifications_state = self.notifications_state.clone();
            let dash_kv_store = self.dash_kv_store.clone();

            tokio::spawn(async move {
                while let Some((fig_id, payload)) = api_handler_rx.recv().await {
                    let message = fig_desktop_api::handler::request_from_b64(&payload);
                    if matches!(
                        message,
                        Ok(ClientOriginatedMessage {
                            id: _,
                            submessage: Some(Submessage::PositionWindowRequest(_) | Submessage::WindowFocusRequest(_))
                        })
                    ) {
                        sync_api_handler_tx.send((fig_id, message)).ok();
                    } else {
                        let proxy = proxy.clone();
                        let figterm_state = figterm_state.clone();
                        let intercept_state = intercept_state.clone();
                        let notifications_state = notifications_state.clone();
                        let dash_kv_store = dash_kv_store.clone();
                        tokio::spawn(async move {
                            api_request(
                                fig_id,
                                message,
                                &figterm_state,
                                &intercept_state,
                                &notifications_state,
                                &proxy.clone(),
                                &dash_kv_store,
                            )
                            .await;
                        });
                    }
                }
            });
        }

        file_watcher::setup_listeners(self.notifications_state.clone(), self.event_loop.create_proxy()).await;
        auth_watcher::spawn_auth_watcher();

        init_webview_notification_listeners(self.event_loop.create_proxy()).await;

        let tray_visible = !fig_settings::settings::get_bool_or("app.hideMenubarIcon", false);
        let tray = build_tray(&self.event_loop, &self.figterm_state).await.unwrap();
        if let Err(err) = tray.set_visible(tray_visible) {
            error!(%err, "Failed to set tray visible");
        }

        #[allow(unused_variables)]
        let menu_bar = menu_bar();

        // TODO: fix these
        // #[cfg(target_os = "windows")]
        // menu_bar.init_for_hwnd(window_hwnd);
        // #[cfg(target_os = "linux")]
        // menu_bar.init_for_gtk_window(&gtk_window, Some(&vertical_gtk_box));
        #[cfg(target_os = "macos")]
        menu_bar.init_for_nsapp();

        let proxy = self.event_loop.create_proxy();
        proxy
            .send_event(Event::PlatformBoundEvent(PlatformBoundEvent::InitializePostRun))
            .expect("Failed to send post init event");

        let mut autocomplete_lifecycle = AutocompleteLifecycle::new();

        self.event_loop.run(move |event, window_target, control_flow| {
            *control_flow = ControlFlow::Wait;
            trace!(?event, "Main loop event");

            if let Ok(menu_event) = MenuEvent::receiver().try_recv() {
                info!(?menu_event, "Menu Event");
                menu::handle_event(&menu_event, &proxy);
                tray::handle_event(&menu_event, &proxy);
            }

            match event {
                WryEvent::NewEvents(StartCause::Init) => {
                    info!("Fig has started");
                    proxy
                        .send_event(Event::AutocompleteLifecycleChanged { keep_ready: None })
                        .ok();
                    #[cfg(target_os = "macos")]
                    if self.show_dashboard_after_normal_launch && !crate::platform::launched_as_login_item() {
                        proxy
                            .send_event(Event::WindowEvent {
                                window_id: DASHBOARD_ID,
                                window_event: WindowEvent::Show,
                            })
                            .ok();
                    }
                },
                WryEvent::WindowEvent { event, window_id, .. } => {
                    let should_close_dashboard = self
                        .window_id_map
                        .get(&window_id)
                        .is_some_and(|window_state| {
                            matches!(&event, WryWindowEvent::CloseRequested)
                                && window_state.window_id == DASHBOARD_ID
                        });

                    if should_close_dashboard {
                        close_dashboard(
                            &mut self.fig_id_map,
                            &mut self.window_id_map,
                            &self.notifications_state,
                            &proxy,
                        );
                    } else if let Some(window_state) = self.window_id_map.get(&window_id) {
                        match event {
                            WryWindowEvent::CloseRequested => {
                                // Non-dashboard windows retain their existing hide behavior.
                                window_state.window.set_visible(false);
                            },
                            WryWindowEvent::ThemeChanged(theme) => window_state.set_theme(match theme {
                                TaoTheme::Light => Some(WryTheme::Light),
                                TaoTheme::Dark => Some(WryTheme::Dark),
                                _ => None,
                            }),
                            WryWindowEvent::Focused(focused) => {
                                if window_state.window_id == DASHBOARD_ID {
                                    // Mirror native focus so the sidebar can dim its selection
                                    // like System Settings when the window resigns key.
                                    window_state
                                        .webview
                                        .evaluate_script(&format!(
                                            "document.documentElement.classList.toggle('dashboard-window-blurred', {});",
                                            !focused
                                        ))
                                        .ok();
                                }

                                if focused && window_state.window_id != AUTOCOMPLETE_ID {
                                    proxy
                                        .send_event(Event::WindowEvent {
                                            window_id: AUTOCOMPLETE_ID,
                                            window_event: WindowEvent::Hide,
                                        })
                                        .unwrap();
                                }

                                proxy
                                    .send_event(Event::PlatformBoundEvent(PlatformBoundEvent::AppWindowFocusChanged {
                                        window_id: window_state.window_id.clone(),
                                        focused,
                                        fullscreen: window_state.window.fullscreen().is_some(),
                                        visible: window_state.window.is_visible(),
                                    }))
                                    .unwrap();
                            },
                            _ => (),
                        }
                    }
                },
                WryEvent::UserEvent(event) => {
                    match event {
                        Event::WindowEvent {
                            window_id,
                            window_event,
                        } => {
                            if matches!(&window_event, WindowEvent::Close)
                                && release_window(
                                    &window_id,
                                    &mut self.fig_id_map,
                                    &mut self.window_id_map,
                                    &self.notifications_state,
                                    &mut autocomplete_lifecycle,
                                    &proxy,
                                )
                            {
                                return;
                            }

                            if window_id == DASHBOARD_ID
                                && !self.fig_id_map.contains_key(&DASHBOARD_ID)
                                && event_requests_window(&window_event)
                            {
                                let page = dashboard_page_for_event(&window_event);
                                if let Err(err) = build_dashboard_webview(
                                    &self.context,
                                    &mut self.fig_id_map,
                                    &mut self.window_id_map,
                                    window_target,
                                    page,
                                ) {
                                    error!(%err, "Failed to rebuild dashboard webview");
                                    return;
                                }
                            }

                            let window_event = if window_id == AUTOCOMPLETE_ID {
                                if !self.fig_id_map.contains_key(&AUTOCOMPLETE_ID)
                                    && event_requests_window(&window_event)
                                {
                                    if let Err(err) = autocomplete_lifecycle.ensure_loaded(
                                        &self.context,
                                        &mut self.fig_id_map,
                                        &mut self.window_id_map,
                                        window_target,
                                        &proxy,
                                    ) {
                                        error!(%err, "Failed to rebuild autocomplete webview");
                                        return;
                                    }
                                    proxy
                        .send_event(Event::AutocompleteLifecycleChanged { keep_ready: None })
                        .ok();
                                }

                                let loaded = self.fig_id_map.contains_key(&AUTOCOMPLETE_ID);
                                match autocomplete_lifecycle.defer_until_mounted(loaded, window_event) {
                                    Some(window_event) => window_event,
                                    None => return,
                                }
                            } else {
                                window_event
                            };

                            match self.fig_id_map.get(&window_id) {
                            Some(window_state) => {
                                if window_state.enabled() || window_event.is_allowed_while_disabled() {
                                    window_state.handle(
                                        window_event,
                                        &self.figterm_state,
                                        &self.platform_state,
                                        &self.notifications_state,
                                        window_target,
                                        &api_handler_tx,
                                    );
                                } else {
                                    trace!(
                                        window_id =% window_state.window_id,
                                        ?window_event,
                                        "Ignoring event for disabled window"
                                    );
                                }
                            },
                            None => {
                                if window_id == DASHBOARD_ID || window_id == AUTOCOMPLETE_ID {
                                    trace!("Ignored event for unloaded window {window_id}");
                                } else {
                                    warn!("No window {window_id} available for event");
                                }
                                trace!(?window_event, "Event");
                            },
                            }
                        },
                        Event::WindowEventAll { window_event } => {
                            for (_window_id, window_state) in self.window_id_map.iter() {
                                if window_state.enabled() || window_event.is_allowed_while_disabled() {
                                    window_state.handle(
                                        window_event.clone(),
                                        &self.figterm_state,
                                        &self.platform_state,
                                        &self.notifications_state,
                                        window_target,
                                        &api_handler_tx,
                                    );
                                } else {
                                    trace!(
                                        window_id =% window_state.window_id,
                                        ?window_event,
                                        "Ignoring event for disabled window"
                                    );
                                }
                            }
                        },
                        Event::ControlFlow(new_control_flow) => {
                            *control_flow = new_control_flow;
                        },
                        Event::ReloadTray { is_logged_in } => {
                            tray.set_icon(Some(get_icon(is_logged_in)))
                                .map_err(|err| error!(?err))
                                .ok();
                            tray.set_icon_as_template(true);
                            tray.set_menu(Some(Box::new(get_context_menu(is_logged_in))));
                        },
                        Event::AutocompleteLifecycleChanged { keep_ready } => {
                            if let Some(keep_ready) = keep_ready {
                                autocomplete_lifecycle.set_keep_ready(keep_ready);
                            }
                            if let Err(err) = autocomplete_lifecycle.reconcile(
                                &self.context,
                                &mut self.fig_id_map,
                                &mut self.window_id_map,
                                &self.figterm_state,
                                window_target,
                                &proxy,
                            ) {
                                error!(%err, "Failed to update autocomplete lifecycle");
                            }
                        },
                        Event::AutocompleteReleaseTimerElapsed { generation } => {
                            autocomplete_lifecycle.release_if_idle(
                                generation,
                                &mut self.fig_id_map,
                                &mut self.window_id_map,
                                &self.notifications_state,
                                &self.figterm_state,
                            );
                        },
                        Event::AutocompleteWebviewMounted => {
                            dispatch_deferred_autocomplete_events(
                                autocomplete_lifecycle.mark_mounted(),
                                &self.fig_id_map,
                                &self.figterm_state,
                                &self.platform_state,
                                &self.notifications_state,
                                window_target,
                                &api_handler_tx,
                            );
                        },
                        Event::AutocompleteMountTimeoutElapsed { generation } => {
                            dispatch_deferred_autocomplete_events(
                                autocomplete_lifecycle.mount_timeout_elapsed(generation),
                                &self.fig_id_map,
                                &self.figterm_state,
                                &self.platform_state,
                                &self.notifications_state,
                                window_target,
                                &api_handler_tx,
                            );
                        },
                        Event::AutocompleteWebviewReady => {
                            autocomplete_lifecycle.mark_ready();
                        },
                        Event::AutocompleteSpecsReady => {
                            autocomplete_lifecycle.mark_specs_ready();
                        },
                        Event::ReloadCredentials => {
                            // tray.set_menu(Some(Box::new(get_context_menu())));

                            let autocomplete_enabled =
                                !fig_settings::settings::get_bool_or("autocomplete.disable", false)
                                    && PlatformState::accessibility_is_enabled().unwrap_or(true);
                            // && fig_request::fig_auth::is_logged_in();

                            proxy
                                .send_event(Event::WindowEvent {
                                    window_id: AUTOCOMPLETE_ID,
                                    window_event: WindowEvent::SetEnabled(autocomplete_enabled),
                                })
                                .unwrap();
                        },
                        Event::ReloadAccessibility => {
                            // tray.set_menu(Some(Box::new(get_context_menu())));

                            let autocomplete_enabled =
                                !fig_settings::settings::get_bool_or("autocomplete.disable", false)
                                    && PlatformState::accessibility_is_enabled().unwrap_or(true);
                            // && fig_request::fig_auth::is_logged_in();

                            proxy
                                .send_event(Event::WindowEvent {
                                    window_id: AUTOCOMPLETE_ID,
                                    window_event: WindowEvent::SetEnabled(autocomplete_enabled),
                                })
                                .unwrap();
                        },
                        Event::SetTrayVisible(visible) => {
                            if let Err(err) = tray.set_visible(visible) {
                                error!(%err, "Failed to set tray visible");
                            }
                        },
                        Event::PlatformBoundEvent(native_event) => {
                            if let Err(err) = self.platform_state.handle(
                                native_event,
                                window_target,
                                &self.fig_id_map,
                                &self.notifications_state,
                            ) {
                                debug!(%err, "Failed to handle native event");
                            }
                        },
                        Event::ShowMessageNotification(ShowMessageNotification {
                            title,
                            body,
                            parent,
                            buttons,
                            buttons_result,
                        }) => {
                            let mut dialog = rfd::AsyncMessageDialog::new().set_title(title).set_description(body);

                            if let Some(parent) = parent {
                                if let Some(parent_window) = self.fig_id_map.get(&parent) {
                                    dialog = dialog.set_parent(&parent_window.window);
                                }
                            }

                            let dialog = match (buttons, buttons_result.as_ref()) {
                                (Some(buttons), Some(_)) => dialog.set_buttons(buttons),
                                _ => dialog,
                            };

                            tokio::spawn(async move {
                                let res = dialog.show().await;
                                if let Some(buttons_result) = buttons_result {
                                    buttons_result
                                        .send(res)
                                        .await
                                        .map_err(|err| error!(?err, "Failed to send dialog result"))
                                        .ok();
                                }
                            });
                        },
                    }
                },
                WryEvent::Opened { urls } => {
                    let mut events = Vec::new();
                    for url in urls {
                        if url.scheme() == URL_SCHEMA {
                            match url.host_str() {
                                Some("dashboard") => {
                                    events.push(WindowEvent::NavigateRelative {
                                        path: url.path().to_owned().into(),
                                    });
                                },
                                host => {
                                    error!(?host, "Invalid deep link");
                                },
                            }
                        } else {
                            error!(scheme = %url.scheme(), %url, "Invalid scheme");
                        }
                    }

                    if let Err(err) = proxy.send_event(Event::WindowEvent {
                        window_id: DASHBOARD_ID,
                        window_event: WindowEvent::Batch(events),
                    }) {
                        warn!(%err, "Error sending event");
                    }
                },
                WryEvent::MainEventsCleared | WryEvent::NewEvents(StartCause::WaitCancelled { .. }) => {},
                event => trace!(?event, "Unhandled event"),
            }
        });
    }
}

fn navigation_handler<I, S>(window_id: WindowId, exprs: I) -> impl Fn(String) -> bool
where
    I: IntoIterator<Item = S>,
    S: AsRef<str>,
{
    let regex_set = RegexSet::new(exprs);

    if let Err(ref err) = regex_set {
        error!("Failed to compile regex: {err}");
    }

    move |url: String| match regex_set.as_ref().ok().and_then(|r| {
        Url::parse(&url)
            .ok()
            .and_then(|url| url.domain().map(|domain| r.is_match(domain)))
    }) {
        Some(true) => {
            trace!("{window_id} allowed url: {url}");
            true
        },
        Some(false) | None => {
            warn!("{window_id} denied url: {url}");
            false
        },
    }
}

pub struct DashboardOptions {
    pub show_onboarding: bool,
    pub visible: bool,
    pub page: Option<String>,
}

fn dashboard_initialization_script() -> String {
    let mut script = javascript_init(true);

    // Tell the web UI that a native NSVisualEffectView sits behind the sidebar,
    // so it should leave that region transparent instead of painting a fallback.
    #[cfg(target_os = "macos")]
    script.push_str("\ndocument.documentElement.classList.add('dashboard-native-vibrancy');\n");

    let accent = system_accent_css_color();
    let accent_json = serde_json::to_string(&accent).unwrap_or_else(|_| "\"AccentColor\"".to_string());

    script.push_str(&format!(
        r#"
(function() {{
  const accent = {accent_json};
  const applyAccent = () => {{
    document.documentElement.style.setProperty("--dashboard-accent-color", accent);
    document.documentElement.style.accentColor = accent;
  }};

  applyAccent();
  if (document.readyState === "loading") {{
    document.addEventListener("DOMContentLoaded", applyAccent, {{ once: true }});
  }}
}})();

window.close = function() {{
  window.ipc?.postMessage("__ec_close_window__");
}};
"#
    ));

    if !cfg!(debug_assertions) {
        script.push_str(
            r#"
// The production dashboard is application chrome, not a browser surface.
// Suppress WebKit's browser context menu (including Inspect Element).
document.addEventListener("contextmenu", (event) => event.preventDefault(), true);
"#,
        );
    }

    script
}

#[cfg(target_os = "macos")]
fn system_accent_css_color() -> String {
    use objc2::rc::autoreleasepool;
    use objc2_app_kit::{NSColor, NSColorSpace};

    autoreleasepool(|_| unsafe {
        let accent = NSColor::controlAccentColor();
        let srgb = NSColorSpace::sRGBColorSpace();
        let color = accent.colorUsingColorSpace(&srgb).unwrap_or(accent);
        let red = (color.redComponent().clamp(0.0, 1.0) * 255.0).round() as u8;
        let green = (color.greenComponent().clamp(0.0, 1.0) * 255.0).round() as u8;
        let blue = (color.blueComponent().clamp(0.0, 1.0) * 255.0).round() as u8;

        format!("rgb({red}, {green}, {blue})")
    })
}

#[cfg(not(target_os = "macos"))]
fn system_accent_css_color() -> String {
    "AccentColor".to_string()
}

/// Must match the sidebar width in `packages/dashboard-app` (`w-[228px]`).
#[cfg(target_os = "macos")]
const DASHBOARD_SIDEBAR_WIDTH: f64 = 228.0;

/// Installs an `NSVisualEffectView` (sidebar material) beneath the dashboard webview so the
/// sidebar region shows the native macOS translucent material — blurred while the window is
/// key, solid when it isn't — exactly like System Settings. The webview is transparent and the
/// web UI leaves the sidebar unpainted so the material shows through.
#[cfg(target_os = "macos")]
fn install_dashboard_sidebar_vibrancy(window: &Window) {
    use objc2_app_kit::{
        NSAutoresizingMaskOptions, NSVisualEffectBlendingMode, NSVisualEffectMaterial, NSVisualEffectState,
        NSVisualEffectView, NSWindow, NSWindowOrderingMode,
    };
    use objc2_foundation::{CGPoint, CGRect, CGSize, MainThreadMarker};
    use tao::platform::macos::WindowExtMacOS;

    let Some(mtm) = MainThreadMarker::new() else {
        warn!("Cannot install dashboard sidebar vibrancy: not on the main thread");
        return;
    };

    unsafe {
        let ns_window = &*window.ns_window().cast::<NSWindow>();
        let Some(content_view) = ns_window.contentView() else {
            warn!("Cannot install dashboard sidebar vibrancy: no content view");
            return;
        };

        let height = content_view.bounds().size.height;
        let frame = CGRect::new(CGPoint::ZERO, CGSize::new(DASHBOARD_SIDEBAR_WIDTH, height));
        let effect_view = NSVisualEffectView::initWithFrame(mtm.alloc(), frame);
        effect_view.setMaterial(NSVisualEffectMaterial::Sidebar);
        effect_view.setBlendingMode(NSVisualEffectBlendingMode::BehindWindow);
        effect_view.setState(NSVisualEffectState::FollowsWindowActiveState);
        effect_view.setAutoresizingMask(
            NSAutoresizingMaskOptions::NSViewHeightSizable | NSAutoresizingMaskOptions::NSViewMaxXMargin,
        );
        content_view.addSubview_positioned_relativeTo(&effect_view, NSWindowOrderingMode::NSWindowBelow, None);
    }
}

pub fn build_dashboard(
    ctx: Arc<Context>,
    web_context: &mut WebContext,
    event_loop: &EventLoopWindowTarget,
    DashboardOptions {
        show_onboarding,
        visible,
        page,
    }: DashboardOptions,
) -> anyhow::Result<(Window, WebView)> {
    let window_builder = WindowBuilder::new()
        .with_title(PRODUCT_NAME)
        .with_inner_size(DASHBOARD_SIZE)
        .with_min_inner_size(DASHBOARD_MINIMUM_SIZE)
        .with_max_inner_size(DASHBOARD_MAXIMUM_SIZE)
        .with_resizable(true)
        .with_maximizable(false)
        .with_visible(visible)
        .with_focused(visible)
        .with_always_on_top(false)
        .with_window_icon(Some(utils::icon()))
        .with_theme(THEME.and_then(to_tao_theme));

    #[cfg(target_os = "macos")]
    let window_builder = {
        use tao::platform::macos::WindowBuilderExtMacOS;

        window_builder
            .with_titlebar_transparent(true)
            .with_title_hidden(true)
            .with_fullsize_content_view(true)
            .with_traffic_light_inset(LogicalPosition::new(16.0, 16.0))
    };

    let window = window_builder.build(event_loop)?;

    // #[cfg(not(target_os = "linux"))]
    // {
    //     window = window.with_menu(menu::menu_bar());
    // }

    #[cfg(target_os = "linux")]
    {
        use gtk::traits::GtkWindowExt;
        use tao::platform::unix::WindowExtUnix;

        window.gtk_window().set_role("dashboard");
    }

    let proxy = GLOBAL_PROXY.get().expect("event loop proxy is initialized").clone();

    let mut url = dashboard::url();

    if show_onboarding {
        url.set_path(LOGIN_PATH);
    } else if let Some(page) = page {
        url.set_path(&page);
    }

    let dashboard_init_script = dashboard_initialization_script();
    let webview_builder = WebViewBuilder::with_web_context(web_context)
        .with_url(url.as_str())
        .with_ipc_handler(move |payload| {
            let body = payload.into_body();
            if body == "__ec_close_window__" {
                proxy
                    .send_event(Event::WindowEvent {
                        window_id: DASHBOARD_ID.clone(),
                        window_event: WindowEvent::Close,
                    })
                    .unwrap();
                return;
            }
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID.clone(),
                    window_event: WindowEvent::Api { payload: body },
                })
                .unwrap();
        })
        // Local debug builds keep inspector access; release builds stay free of browser UI.
        .with_devtools(cfg!(debug_assertions))
        .with_asynchronous_custom_protocol(
            resource::RESOURCE_SCHEME.into(),
            utils::wrap_custom_protocol(
                Arc::clone(&ctx),
                "ecresource::Dashboard",
                DashboardId,
                resource::handle::<resource::Dashboard>,
            ),
        )
        .with_asynchronous_custom_protocol(
            "api".into(),
            utils::wrap_custom_protocol(Arc::clone(&ctx), "api", DashboardId, api::handle),
        )
        .with_navigation_handler(navigation_handler(DASHBOARD_ID, &[r"^localhost$", r"^127\.0\.0\.1$"]))
        .with_initialization_script(&dashboard_init_script)
        .with_clipboard(true)
        .with_hotkeys_zoom(true);

    // The sidebar region is left transparent so the NSVisualEffectView below shows through.
    #[cfg(target_os = "macos")]
    let webview_builder = webview_builder.with_transparent(true);

    cfg_if! {
        if #[cfg(target_os = "linux")] {
            use tao::platform::unix::WindowExtUnix;
            use wry::WebViewBuilderExtUnix;
            let vbox = window.default_vbox().unwrap();
            let webview = webview_builder.build_gtk(vbox)?;
        } else {
            let webview = webview_builder.build(&window)?;
        }
    };

    #[cfg(target_os = "macos")]
    install_dashboard_sidebar_vibrancy(&window);

    Ok((window, webview))
}

pub struct AutocompleteOptions;

pub fn build_autocomplete(
    ctx: Arc<Context>,
    web_context: &mut WebContext,
    event_loop: &EventLoopWindowTarget,
    _autocomplete_options: AutocompleteOptions,
) -> anyhow::Result<(Window, WebView)> {
    let mut window_builder = WindowBuilder::new()
        .with_title(AUTOCOMPLETE_WINDOW_TITLE)
        .with_transparent(true)
        .with_decorations(false)
        .with_always_on_top(true)
        .with_focused(false)
        .with_window_icon(Some(utils::icon()))
        .with_inner_size(LogicalSize::new(1.0, 1.0))
        .with_theme(THEME.and_then(to_tao_theme));

    cfg_if!(
        if #[cfg(target_os = "linux")] {
            use tao::platform::unix::WindowBuilderExtUnix;
            window_builder = window_builder.with_resizable(true).with_skip_taskbar(true);
        } else if #[cfg(target_os = "macos")] {
            use tao::platform::macos::WindowBuilderExtMacOS;
            window_builder = window_builder.with_resizable(false).with_has_shadow(false).with_visible(false);
        } else if #[cfg(target_os = "windows")] {
            use tao::platform::windows::WindowBuilderExtWindows;
            window_builder = window_builder.with_resizable(false).with_skip_taskbar(true).with_visible(false);
        }
    );

    let window = window_builder.build(event_loop)?;

    #[cfg(target_os = "linux")]
    {
        use gtk::gdk::WindowTypeHint;
        use gtk::traits::{GtkWindowExt, WidgetExt};
        use tao::platform::unix::WindowExtUnix;

        let gtk_window = window.gtk_window();
        gtk_window.set_role("autocomplete");
        gtk_window.set_type_hint(WindowTypeHint::Utility);
        gtk_window.set_accept_focus(false);
        gtk_window.set_decorated(false);
        if let Some(window) = gtk_window.window() {
            window.set_override_redirect(true);
        }
    }

    let proxy = GLOBAL_PROXY.get().expect("event loop proxy is initialized").clone();

    let webview_builder = WebViewBuilder::with_web_context(web_context)
        .with_url(autocomplete::url().as_str())
        .with_ipc_handler(move |payload| {
            let body = payload.into_body();
            if body == "__ec_autocomplete_mounted__" {
                proxy.send_event(Event::AutocompleteWebviewMounted).ok();
                return;
            }
            if body == "__ec_autocomplete_ready__" {
                proxy.send_event(Event::AutocompleteWebviewReady).ok();
                return;
            }
            if body == "__ec_autocomplete_specs_ready__" {
                proxy.send_event(Event::AutocompleteSpecsReady).ok();
                return;
            }
            proxy
                .send_event(Event::WindowEvent {
                    window_id: AUTOCOMPLETE_ID.clone(),
                    window_event: WindowEvent::Api { payload: body },
                })
                .unwrap();
        })
        .with_asynchronous_custom_protocol(
            "fig".into(),
            utils::wrap_custom_protocol(Arc::clone(&ctx), "fig", AutocompleteId, icons::handle),
        )
        .with_asynchronous_custom_protocol(
            "icon".into(),
            utils::wrap_custom_protocol(Arc::clone(&ctx), "icon", AutocompleteId, icons::handle),
        )
        .with_asynchronous_custom_protocol(
            "spec".into(),
            utils::wrap_custom_protocol(Arc::clone(&ctx), "spec", AutocompleteId, spec::handle),
        )
        .with_asynchronous_custom_protocol(
            resource::RESOURCE_SCHEME.into(),
            utils::wrap_custom_protocol(
                Arc::clone(&ctx),
                "ecresource::Autocomplete",
                AutocompleteId,
                resource::handle::<resource::Autocomplete>,
            ),
        )
        .with_asynchronous_custom_protocol(
            "api".into(),
            utils::wrap_custom_protocol(Arc::clone(&ctx), "api", AutocompleteId, api::handle),
        )
        // Local debug builds keep inspector access; release builds stay free of browser UI.
        .with_devtools(cfg!(debug_assertions))
        .with_transparent(true)
        .with_initialization_script(&javascript_init(true))
        .with_navigation_handler(navigation_handler(AUTOCOMPLETE_ID, &[r"localhost$", r"^127\.0\.0\.1$"]))
        .with_clipboard(true)
        .with_hotkeys_zoom(true)
        .with_accept_first_mouse(true);

    cfg_if! {
        if #[cfg(target_os = "linux")] {
            use tao::platform::unix::WindowExtUnix;
            use wry::WebViewBuilderExtUnix;
            let vbox = window.default_vbox().unwrap();
            let webview = webview_builder.build_gtk(vbox)?;
        } else {
            let webview = webview_builder.build(&window)?;
        }
    };

    Ok((window, webview))
}

async fn init_webview_notification_listeners(proxy: EventLoopProxy) {
    #[allow(unused_macros)]
    macro_rules! watcher {
        ($type:ident, $name:expr, $on_update:expr) => {{
            paste::paste! {
                let proxy = proxy.clone();
                tokio::spawn(async move {
                    let mut rx = NOTIFICATION_BUS.[<subscribe_ $type>]($name.into());
                    loop {
                        let res = rx.recv().await;
                        match res {
                            Ok(val) => {
                                #[allow(clippy::redundant_closure_call)]
                                ($on_update)(val, &proxy);
                            },
                            Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                                warn!("Notification bus '{}' lagged by {n} messages", $name);
                            },
                            Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
                        }
                    }
                });
            }
        };};
    }

    #[cfg(target_os = "linux")]
    {
        use fig_integrations::Integration;
        use fig_integrations::desktop_entry::{AutostartIntegration, should_install_autostart_entry};
        use fig_settings::{Settings, State};

        use crate::notification_bus::JsonNotification;
        watcher!(
            settings,
            "autocomplete.disable",
            |notification: JsonNotification, proxy: &EventLoopProxy| {
                let enabled = !notification.as_bool().unwrap_or(false);
                debug!(%enabled, "Autocomplete");
                proxy
                    .send_event(Event::WindowEvent {
                        window_id: AUTOCOMPLETE_ID,
                        window_event: WindowEvent::SetEnabled(enabled),
                    })
                    .unwrap();
            }
        );
        watcher!(
            settings,
            "app.launchOnStartup",
            |notification: JsonNotification, _proxy: &EventLoopProxy| {
                let enabled = notification.as_bool().unwrap_or(false);
                debug!(%enabled, "app.launchOnStartup");
                tokio::spawn(async move {
                    let ctx = Context::new();
                    let settings = Settings::new();
                    let state = State::new();
                    let autostart = match AutostartIntegration::new(&ctx) {
                        Ok(autostart) => autostart,
                        Err(err) => {
                            error!(
                                ?err,
                                "failed to update the autostart integration installed status to {}", enabled
                            );
                            return;
                        },
                    };
                    if should_install_autostart_entry(&ctx, &settings, &state) {
                        autostart
                            .install()
                            .await
                            .map_err(|err| warn!(?err, "unable to install autostart integration"))
                            .ok();
                    } else {
                        autostart
                            .uninstall()
                            .await
                            .map_err(|err| warn!(?err, "unable to uninstall autostart integration"))
                            .ok();
                    }
                });
            }
        );
    }

    watcher!(
        settings,
        "app.theme",
        |notification: JsonNotification, proxy: &EventLoopProxy| {
            let theme = notification.as_string().as_deref().and_then(map_theme);
            debug!(?theme, "Theme changed");
            proxy
                .send_event(Event::WindowEventAll {
                    window_event: WindowEvent::SetTheme(theme),
                })
                .unwrap();
        }
    );

    watcher!(
        settings,
        AUTOCOMPLETE_KEEP_READY_SETTING,
        |notification: JsonNotification, proxy: &EventLoopProxy| {
            debug!(?notification, "autocomplete.keepReady changed");
            proxy
                .send_event(Event::AutocompleteLifecycleChanged {
                    keep_ready: notification.as_bool(),
                })
                .unwrap();
        }
    );

    watcher!(
        settings,
        "app.hideMenubarIcon",
        |notification: JsonNotification, proxy: &EventLoopProxy| {
            let enabled = !notification.as_bool().unwrap_or(false);
            debug!(%enabled, "Tray icon");
            proxy.send_event(Event::SetTrayVisible(enabled)).unwrap();
        }
    );

    watcher!(
        settings,
        "developer.dashboard.host",
        |_notification: JsonNotification, proxy: &EventLoopProxy| {
            let url = dashboard::url();
            debug!(%url, "Dashboard host");
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID,
                    window_event: WindowEvent::NavigateAbsolute { url },
                })
                .unwrap();
        }
    );

    watcher!(
        settings,
        "developer.dashboard.build",
        |_notification: JsonNotification, proxy: &EventLoopProxy| {
            let url = dashboard::url();
            debug!(%url, "Dashboard host");
            proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID,
                    window_event: WindowEvent::NavigateAbsolute { url },
                })
                .unwrap();
        }
    );

    watcher!(
        settings,
        "developer.autocomplete.host",
        |_notification: JsonNotification, proxy: &EventLoopProxy| {
            let url = autocomplete::url();
            debug!(%url, "Autocomplete host");
            proxy
                .send_event(Event::WindowEvent {
                    window_id: AUTOCOMPLETE_ID,
                    window_event: WindowEvent::NavigateAbsolute { url },
                })
                .unwrap();
        }
    );

    watcher!(
        settings,
        "developer.autocomplete.build",
        |_notification: JsonNotification, proxy: &EventLoopProxy| {
            let url = autocomplete::url();
            debug!(%url, "Autocomplete host");
            proxy
                .send_event(Event::WindowEvent {
                    window_id: AUTOCOMPLETE_ID,
                    window_event: WindowEvent::NavigateAbsolute { url },
                })
                .unwrap();
        }
    );

    // I don't think this is meant to be here anymore
    // watcher!(settings, "app.beta", |_: JsonNotification, proxy: &EventLoopProxy| {
    //     let proxy = proxy.clone();
    //     tokio::spawn(fig_install::update(
    //         Some(Box::new(move |_| {
    //             proxy
    //                 .send_event(Event::ShowMessageNotification {
    //                     title: "Fig Update".into(),
    //                     body: "Fig is updating in the background. You can continue to use Fig while
    // it updates.".into(),                     parent: None,
    //                 })
    //                 .unwrap();
    //         })),
    //         fig_install::UpdateOptions {
    //             ignore_rollout: true,
    //             interactive: true,
    //             relaunch_dashboard: true,
    //         },
    //     ));
    // });

    // Midway watcher
    #[cfg(target_os = "macos")]
    let accent_proxy = proxy.clone();
    tokio::spawn(async move {
        let mut res = NOTIFICATION_BUS.subscribe_midway();

        let (tx, mut rx) = tokio::sync::mpsc::channel(1);

        // debounce thread
        tokio::spawn(async move {
            let mut should_send = false;
            let mut interval = tokio::time::interval(Duration::from_millis(500));
            interval.set_missed_tick_behavior(MissedTickBehavior::Skip);

            loop {
                tokio::select! {
                    _ = rx.recv() => {
                        should_send = true;
                        interval.reset();
                    }
                    _ = interval.tick() => {
                        if should_send {
                            info!("clearing autocomplete cache");
                            let _ = proxy.send_event(
                                Event::WindowEvent {
                                    window_id: AUTOCOMPLETE_ID,
                                    window_event: WindowEvent::Event {
                                        event_name: "clear-cache".into(),
                                        payload: None
                                    }
                                }
                            );
                            clear_index_cache().await;
                            should_send = false;
                        }
                    }
                }
            }
        });

        loop {
            match res.recv().await {
                Ok(()) => {
                    if let Err(err) = tx.send(()).await {
                        error!("Error sending notification: {err}");
                    }
                },
                Err(tokio::sync::broadcast::error::RecvError::Lagged(n)) => {
                    warn!("Notification bus 'midway' lagged by {n} messages");
                },
                Err(tokio::sync::broadcast::error::RecvError::Closed) => break,
            }
        }
    });

    #[cfg(target_os = "macos")]
    {
        use macos_utils::NotificationCenter;
        use objc2_foundation::{NSOperationQueue, ns_string};

        let mut default_center = NotificationCenter::default_center();
        let notification_name = ns_string!("NSSystemColorsDidChangeNotification");
        let queue = unsafe { NSOperationQueue::new() };
        default_center.subscribe(notification_name, Some(&queue), move |_| {
            let color = system_accent_css_color();
            let script = format!(
                "document.documentElement.style.setProperty('--dashboard-accent-color','{color}');\
                 document.documentElement.style.accentColor='{color}';"
            );
            accent_proxy
                .send_event(Event::WindowEvent {
                    window_id: DASHBOARD_ID,
                    window_event: WindowEvent::EvalScript(script),
                })
                .ok();
        });
        // NSNotificationCenter retains both the observer block and the queue.
        drop(queue);
    }
}

#[cfg(test)]
mod tests {
    use super::{
        AutocompleteLifecycle, autocomplete_should_be_loaded, autocomplete_should_release, dashboard_page_for_event,
        event_requests_window,
    };
    use crate::event::WindowEvent;

    #[test]
    fn windows_are_rebuilt_only_for_events_that_need_a_window() {
        assert!(event_requests_window(&WindowEvent::Show));
        assert!(event_requests_window(&WindowEvent::Batch(vec![
            WindowEvent::NavigateRelative { path: "/about".into() },
            WindowEvent::Show,
        ])));
        assert!(!event_requests_window(&WindowEvent::NavigateRelative {
            path: "/about".into(),
        }));
        assert!(!event_requests_window(&WindowEvent::Close));
    }

    #[test]
    fn dashboard_rebuild_uses_the_last_requested_page() {
        let event = WindowEvent::Batch(vec![
            WindowEvent::NavigateRelative {
                path: "/behavior".into(),
            },
            WindowEvent::Batch(vec![
                WindowEvent::NavigateRelative { path: "/about".into() },
                WindowEvent::Show,
            ]),
        ]);

        assert_eq!(dashboard_page_for_event(&event).as_deref(), Some("/about"));
    }

    #[test]
    fn autocomplete_loads_for_sessions_or_keep_ready() {
        assert!(!autocomplete_should_be_loaded(0, false));
        assert!(autocomplete_should_be_loaded(1, false));
        assert!(autocomplete_should_be_loaded(0, true));
        assert!(event_requests_window(&WindowEvent::Batch(vec![
            WindowEvent::Hide,
            WindowEvent::Devtools,
        ])));
    }

    #[test]
    fn deferred_events_replay_in_order_once_mounted() {
        let mut lifecycle = AutocompleteLifecycle::default();

        assert!(lifecycle.defer_until_mounted(true, WindowEvent::Show).is_none());
        assert!(lifecycle.defer_until_mounted(true, WindowEvent::Hide).is_none());

        // An unloaded webview has nothing to wait for, so those events pass through untouched.
        assert!(lifecycle.defer_until_mounted(false, WindowEvent::Devtools).is_some());

        let replayed = lifecycle.mark_mounted();
        assert!(matches!(replayed.as_slice(), [WindowEvent::Show, WindowEvent::Hide]));

        // Once mounted, events flow straight through and the queue stays empty.
        assert!(lifecycle.defer_until_mounted(true, WindowEvent::Show).is_some());
        assert!(lifecycle.mark_mounted().is_empty());
    }

    #[test]
    fn stale_mount_timeouts_are_ignored() {
        let mut lifecycle = AutocompleteLifecycle::default();
        lifecycle.reset_mount_state();
        let generation = lifecycle.mount_generation;
        lifecycle.reset_mount_state();

        assert!(lifecycle.mount_timeout_elapsed(generation).is_empty());
        assert!(!lifecycle.mounted);
    }

    #[test]
    fn autocomplete_release_ignores_stale_or_active_timers() {
        assert!(autocomplete_should_release(4, 4, 0, false));
        assert!(!autocomplete_should_release(3, 4, 0, false));
        assert!(!autocomplete_should_release(4, 4, 1, false));
        assert!(!autocomplete_should_release(4, 4, 0, true));
    }
}
