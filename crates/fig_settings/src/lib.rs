pub mod error;
pub mod history;
pub mod keybindings;
pub mod keys;
pub mod settings;
pub mod sqlite;
pub mod state;

use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

pub use error::{Error, Result};
use fd_lock::RwLock as FileRwLock;
use fig_util::directories;
use parking_lot::{MappedRwLockReadGuard, MappedRwLockWriteGuard, RwLock, RwLockReadGuard, RwLockWriteGuard};
use serde_json::Value;
pub use settings::{Settings, SettingsProvider};
pub use state::{State, StateProvider};
use thiserror::Error;
use tracing::error;

pub type Map = serde_json::Map<String, Value>;

static SETTINGS_FILE_LOCK: RwLock<()> = RwLock::new(());

static SETTINGS_DATA: RwLock<Option<Map>> = RwLock::new(None);

static SETTINGS_LOAD_FAILED: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Clone)]
pub enum Backend {
    Global,
    Memory(Map),
}

pub enum ReadGuard<'a, T> {
    Global(RwLockReadGuard<'a, Option<T>>),
    Memory(&'a T),
}

impl<'a, T> ReadGuard<'a, T> {
    pub fn map<U, F: FnOnce(&T) -> &U>(self, f: F) -> MappedReadGuard<'a, U> {
        match self {
            ReadGuard::Global(guard) => {
                MappedReadGuard::Global(RwLockReadGuard::<'a, Option<T>>::map(guard, |data: &Option<T>| {
                    f(data.as_ref().expect("global backend is not used"))
                }))
            },
            ReadGuard::Memory(data) => MappedReadGuard::Memory(f(data)),
        }
    }

    pub fn try_map<U, F: FnOnce(&T) -> Option<&U>>(self, f: F) -> Option<MappedReadGuard<'a, U>> {
        match self {
            ReadGuard::Global(guard) => RwLockReadGuard::<'a, Option<T>>::try_map(guard, |data: &Option<T>| {
                f(data.as_ref().expect("global backend is not used"))
            })
            .ok()
            .map(MappedReadGuard::Global),
            ReadGuard::Memory(data) => f(data).map(MappedReadGuard::Memory),
        }
    }
}

impl<T> std::ops::Deref for ReadGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        match self {
            ReadGuard::Global(guard) => guard.as_ref().expect("global backend is not used"),
            ReadGuard::Memory(data) => data,
        }
    }
}

pub enum MappedReadGuard<'a, T> {
    Global(MappedRwLockReadGuard<'a, T>),
    Memory(&'a T),
}

impl<T> std::ops::Deref for MappedReadGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        match self {
            MappedReadGuard::Global(guard) => guard,
            MappedReadGuard::Memory(data) => data,
        }
    }
}

pub enum WriteGuard<'a, T> {
    Global(RwLockWriteGuard<'a, Option<T>>),
    Memory(&'a mut T),
}

impl<'a, T> WriteGuard<'a, T> {
    pub fn map<U, F: FnOnce(&mut T) -> &mut U>(self, f: F) -> MappedWriteGuard<'a, U> {
        match self {
            WriteGuard::Global(guard) => {
                MappedWriteGuard::Global(RwLockWriteGuard::<'a, Option<T>>::map(guard, |data: &mut Option<T>| {
                    f(data.as_mut().expect("global backend is not used"))
                }))
            },
            WriteGuard::Memory(data) => MappedWriteGuard::Memory(f(data)),
        }
    }

    pub fn try_map<U, F: FnOnce(&mut T) -> Option<&mut U>>(self, f: F) -> Option<MappedWriteGuard<'a, U>> {
        match self {
            WriteGuard::Global(guard) => RwLockWriteGuard::<'a, Option<T>>::try_map(guard, |data: &mut Option<T>| {
                f(data.as_mut().expect("global backend is not used"))
            })
            .ok()
            .map(MappedWriteGuard::Global),
            WriteGuard::Memory(data) => f(data).map(MappedWriteGuard::Memory),
        }
    }
}

impl<T> std::ops::Deref for WriteGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        match self {
            WriteGuard::Global(guard) => guard.as_ref().expect("global backend is not used"),
            WriteGuard::Memory(data) => data,
        }
    }
}

impl<T> std::ops::DerefMut for WriteGuard<'_, T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        match self {
            WriteGuard::Global(guard) => guard.as_mut().expect("global backend is not used"),
            WriteGuard::Memory(data) => data,
        }
    }
}

pub enum MappedWriteGuard<'a, T> {
    Global(MappedRwLockWriteGuard<'a, T>),
    Memory(&'a mut T),
}

impl<T> std::ops::Deref for MappedWriteGuard<'_, T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        match self {
            MappedWriteGuard::Global(guard) => guard,
            MappedWriteGuard::Memory(data) => data,
        }
    }
}

impl<T> std::ops::DerefMut for MappedWriteGuard<'_, T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        match self {
            MappedWriteGuard::Global(guard) => guard,
            MappedWriteGuard::Memory(data) => data,
        }
    }
}

pub trait JsonStore: Sized {
    /// Path to the file
    fn path() -> Result<PathBuf>;

    /// In mem lock on the file
    fn file_lock() -> &'static RwLock<()>;

    /// [RwLock] on the data, [None] if not using the global backend
    fn data_lock() -> &'static RwLock<Option<Map>>;

    fn new_from_backend(backend: Backend) -> Self;

    fn map(&self) -> ReadGuard<'_, Map>;

    fn map_mut(&mut self) -> WriteGuard<'_, Map>;

    /// Set while the global backend runs on defaults because the file did not parse.
    fn global_load_failed() -> &'static AtomicBool;

    fn load() -> Result<Self> {
        let is_global = Self::data_lock().read().as_ref().is_some();
        if is_global {
            // The global copy holds defaults, not the user's settings, so a save from it would
            // overwrite the file. Read the file again and refuse until it parses.
            if Self::global_load_failed().load(Ordering::Acquire) {
                let json = Self::load_from_file()?;
                *Self::data_lock().write() = Some(json);
                Self::global_load_failed().store(false, Ordering::Release);
            }
            Ok(Self::new_from_backend(Backend::Global))
        } else {
            Ok(Self::new_from_backend(Backend::Memory(Self::load_from_file()?)))
        }
    }

    fn load_from_file() -> Result<Map> {
        let path = Self::path()?;

        // If the folder doesn't exist, create it.
        if let Some(parent) = path.parent()
            && !parent.exists()
        {
            fs::create_dir_all(parent)?;
        }

        let json: Map = {
            let _lock_guard = Self::file_lock().write();

            // If the file doesn't exist, create it. `create_new` so this never truncates what
            // another process wrote in the meantime.
            if !path.exists() {
                match File::options().write(true).create_new(true).open(&path) {
                    Ok(mut file) => file.write_all(b"{}")?,
                    Err(err) if err.kind() == std::io::ErrorKind::AlreadyExists => {},
                    Err(err) => return Err(err.into()),
                }
            }

            let mut file = FileRwLock::new(File::open(&path)?);
            let mut read = file.write()?;
            let mut content = String::new();
            #[allow(clippy::verbose_file_reads)]
            read.read_to_string(&mut content)?;
            if content.trim().is_empty() {
                Map::new()
            } else {
                serde_json::from_str(&content)?
            }
        };

        Ok(json)
    }

    /// Loads data from file into global backend
    fn load_into_global() -> Result<()> {
        match Self::load_from_file() {
            Ok(json) => {
                *Self::data_lock().write() = Some(json);
                Ok(())
            },
            Err(err) => {
                // Run on defaults but leave the file alone: a hand-edit typo must not erase
                // every setting. `load` reads the file again before any change is saved.
                *Self::data_lock().write() = Some(Map::new());
                Self::global_load_failed().store(true, Ordering::Release);
                error!(%err, "Failed to load json file into global backend, running on defaults");
                Err(err)
            },
        }
    }

    fn save_to_file(&self) -> Result<()> {
        let path = Self::path()?;
        // Write a symlinked file's target, so the link (e.g. from a dotfile manager) stays.
        let path = fs::canonicalize(&path).unwrap_or(path);

        // If the folder doesn't exist, create it.
        if let Some(parent) = path.parent()
            && !parent.exists()
        {
            fs::create_dir_all(parent)?;
        }

        let content = serde_json::to_vec_pretty(&*self.map())?;

        let _lock_guard = Self::file_lock().write();

        // Write a sibling file and rename it over the old one, so a reader sees the old or the
        // new file, never a truncated one.
        let mut tmp_name = path.file_name().unwrap_or_default().to_os_string();
        tmp_name.push(format!(".tmp-{}", std::process::id()));
        let tmp_path = path.with_file_name(tmp_name);

        let result = (|| -> Result<()> {
            let mut file_opts = File::options();
            file_opts.create(true).write(true).truncate(true);
            #[cfg(unix)]
            {
                use std::os::unix::fs::OpenOptionsExt;
                file_opts.mode(0o600);
            }
            let mut file = file_opts.open(&tmp_path)?;
            if let Ok(metadata) = fs::metadata(&path) {
                file.set_permissions(metadata.permissions())?;
            }
            file.write_all(&content)?;
            file.sync_data()?;
            fs::rename(&tmp_path, &path)?;
            Ok(())
        })();

        if result.is_err() {
            let _ = fs::remove_file(&tmp_path);
        }
        result
    }

    fn set(&mut self, key: impl Into<String>, value: impl Into<serde_json::Value>) {
        self.map_mut().insert(key.into(), value.into());
    }

    fn get(&self, key: impl AsRef<str>) -> Option<MappedReadGuard<'_, Value>> {
        self.map().try_map(|data| data.get(key.as_ref()))
    }

    fn remove(&mut self, key: impl AsRef<str>) -> Option<Value> {
        self.map_mut().remove(key.as_ref())
    }

    fn get_mut(&mut self, key: impl Into<String>) -> Option<MappedWriteGuard<'_, Value>> {
        self.map_mut().try_map(|data| data.get_mut(&key.into()))
    }

    fn get_bool(&self, key: impl AsRef<str>) -> Option<bool> {
        self.get(key).and_then(|value| value.as_bool())
    }

    fn get_bool_or(&self, key: impl AsRef<str>, default: bool) -> bool {
        self.get_bool(key).unwrap_or(default)
    }

    fn get_string(&self, key: impl AsRef<str>) -> Option<String> {
        self.get(key).and_then(|value| value.as_str().map(|s| s.into()))
    }

    fn get_string_or(&self, key: impl AsRef<str>, default: String) -> String {
        self.get_string(key).unwrap_or(default)
    }

    fn get_int(&self, key: impl AsRef<str>) -> Option<i64> {
        self.get(key).and_then(|value| value.as_i64())
    }

    fn get_int_or(&self, key: impl AsRef<str>, default: i64) -> i64 {
        self.get_int(key).unwrap_or(default)
    }
}

pub struct OldSettings {
    pub(crate) inner: Backend,
}

impl JsonStore for OldSettings {
    fn path() -> Result<PathBuf> {
        Ok(directories::settings_path()?)
    }

    fn file_lock() -> &'static RwLock<()> {
        &SETTINGS_FILE_LOCK
    }

    fn data_lock() -> &'static RwLock<Option<Map>> {
        &SETTINGS_DATA
    }

    fn global_load_failed() -> &'static AtomicBool {
        &SETTINGS_LOAD_FAILED
    }

    fn new_from_backend(backend: Backend) -> Self {
        match backend {
            Backend::Global => Self { inner: Backend::Global },
            Backend::Memory(map) => Self {
                inner: Backend::Memory(map),
            },
        }
    }

    fn map(&self) -> ReadGuard<'_, Map> {
        match &self.inner {
            Backend::Global => ReadGuard::Global(Self::data_lock().read()),
            Backend::Memory(map) => ReadGuard::Memory(map),
        }
    }

    fn map_mut(&mut self) -> WriteGuard<'_, Map> {
        match &mut self.inner {
            Backend::Global => WriteGuard::Global(Self::data_lock().write()),
            Backend::Memory(map) => WriteGuard::Memory(map),
        }
    }
}

// #[cfg(test)]
// mod test {
//     use std::path::Path;

//     use super::*;

//     fn test_store_type(path: &Path, store: JsonType) {
//         let mut local_json = LocalJson::load_file(store).unwrap();
//         assert_eq!(fs::read_to_string(path).unwrap(), "");
//         assert_eq!(local_json.inner, serde_json::Map::new());
//         local_json.save().unwrap();
//         assert_eq!(fs::read_to_string(path).unwrap(), "{}");

//         local_json.set("a", 123);
//         local_json.set("b", "hello");
//         local_json.set("c", false);
//         local_json.save().unwrap();
//         assert_eq!(
//             fs::read_to_string(path).unwrap(),
//             "{\n  \"a\": 123,\n  \"b\": \"hello\",\n  \"c\": false\n}"
//         );

//         local_json.remove("a").unwrap();
//         local_json.save().unwrap();
//         assert_eq!(
//             fs::read_to_string(path).unwrap(),
//             "{\n  \"b\": \"hello\",\n  \"c\": false\n}"
//         );
//         assert_eq!(local_json.get("b").unwrap(), "hello");

//         fs::write(path, "invalid json").unwrap();
//         assert!(matches!(
//             LocalJson::load_file(store).unwrap_err(),
//             Error::SettingsNotObject
//         ));
//     }

//     #[fig_test::test]
//     fn test_settings_raw() {
//         let path = tempfile::tempdir().unwrap().into_path().join("local.json");
//         std::env::set_var("FIG_DIRECTORIES_SETTINGS_PATH", &path);
//         test_store_type(&path, JsonType::Settings);
//     }

//     #[fig_test::test]
//     fn test_state_raw() {
//         let path = tempfile::tempdir().unwrap().into_path().join("local.json");
//         std::env::set_var("FIG_DIRECTORIES_STATE_PATH", &path);
//         test_store_type(&path, JsonType::State);
//     }
// }

#[cfg(test)]
mod store_tests {
    use std::sync::OnceLock;

    use super::*;

    static DIR: OnceLock<tempfile::TempDir> = OnceLock::new();
    static FILE_LOCK: RwLock<()> = RwLock::new(());
    static DATA: RwLock<Option<Map>> = RwLock::new(None);
    static LOAD_FAILED: AtomicBool = AtomicBool::new(false);

    /// A store on its own file and statics, so the test never touches the real settings.
    struct TestStore(Backend);

    impl JsonStore for TestStore {
        fn path() -> Result<PathBuf> {
            Ok(DIR
                .get_or_init(|| tempfile::tempdir().unwrap())
                .path()
                .join("settings.json"))
        }

        fn file_lock() -> &'static RwLock<()> {
            &FILE_LOCK
        }

        fn data_lock() -> &'static RwLock<Option<Map>> {
            &DATA
        }

        fn global_load_failed() -> &'static AtomicBool {
            &LOAD_FAILED
        }

        fn new_from_backend(backend: Backend) -> Self {
            Self(backend)
        }

        fn map(&self) -> ReadGuard<'_, Map> {
            match &self.0 {
                Backend::Global => ReadGuard::Global(Self::data_lock().read()),
                Backend::Memory(map) => ReadGuard::Memory(map),
            }
        }

        fn map_mut(&mut self) -> WriteGuard<'_, Map> {
            match &mut self.0 {
                Backend::Global => WriteGuard::Global(Self::data_lock().write()),
                Backend::Memory(map) => WriteGuard::Memory(map),
            }
        }
    }

    fn set_and_save(key: &str, value: Value) -> Result<()> {
        let mut store = TestStore::load()?;
        store.set(key, value);
        store.save_to_file()
    }

    /// One test, since the store's statics are shared.
    #[cfg(unix)]
    #[test]
    fn broken_file_is_kept_and_saves_replace_the_file_whole() {
        use std::os::unix::fs::{PermissionsExt, symlink};

        // settings.json links to a 0644 file, as a dotfile manager would set it up.
        let path = TestStore::path().unwrap();
        let target = path.with_file_name("target.json");
        fs::write(&target, "").unwrap();
        fs::set_permissions(&target, fs::Permissions::from_mode(0o644)).unwrap();
        symlink(&target, &path).unwrap();

        let broken = "{\n  \"a\": 1,\n  \"b\": oops\n}";
        fs::write(&path, broken).unwrap();

        // Loading a broken file runs on defaults and leaves the file as it was.
        assert!(TestStore::load_into_global().is_err());
        assert_eq!(fs::read_to_string(&path).unwrap(), broken);

        // A change is refused while the file still does not parse.
        assert!(set_and_save("c", Value::Bool(true)).is_err());
        assert_eq!(fs::read_to_string(&path).unwrap(), broken);

        // Once fixed, the change lands on top of what the file holds.
        fs::write(&path, "{\"a\": 1, \"b\": 2}").unwrap();
        set_and_save("c", Value::Bool(true)).unwrap();
        let saved: Map = serde_json::from_str(&fs::read_to_string(&path).unwrap()).unwrap();
        assert_eq!(saved, serde_json::from_str::<Map>(r#"{"a":1,"b":2,"c":true}"#).unwrap());

        // The save wrote the link's target, kept its mode and left no temp file behind.
        assert!(fs::symlink_metadata(&path).unwrap().file_type().is_symlink());
        assert_eq!(fs::metadata(&target).unwrap().permissions().mode() & 0o777, 0o644);
        let mut names: Vec<_> = fs::read_dir(path.parent().unwrap())
            .unwrap()
            .map(|entry| entry.unwrap().file_name().into_string().unwrap())
            .collect();
        names.sort();
        assert_eq!(names, ["settings.json", "target.json"]);

        // An empty file reads as `{}`.
        fs::write(&path, "").unwrap();
        assert!(TestStore::load_from_file().unwrap().is_empty());
    }
}
