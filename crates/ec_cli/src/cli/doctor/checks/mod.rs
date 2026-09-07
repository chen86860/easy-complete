mod bash_version;
mod fish_version;
#[cfg(target_os = "linux")]
pub mod linux;

pub use bash_version::BashVersionCheck;
pub use fish_version::FishVersionCheck;
