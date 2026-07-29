use std::sync::LazyLock;

use tracing::error;
use url::Url;

use crate::protocol::resource::RESOURCE_URL;

pub static AUTOCOMPLETE_RESOURCE_URL: LazyLock<Url> = LazyLock::new(|| Url::parse(RESOURCE_URL).unwrap());

pub fn url() -> Url {
    if let Ok(autocomplete_url) = std::env::var("AUTOCOMPLETE_URL") {
        return Url::parse(&autocomplete_url).unwrap();
    }

    if let Some(dev_url) = fig_settings::settings::get_string_opt("developer.autocomplete.host") {
        match Url::parse(&dev_url) {
            Ok(url) => return url,
            Err(err) => {
                error!(%err, "Failed to parse developer.autocomplete.host");
            },
        }
    };

    AUTOCOMPLETE_RESOURCE_URL.clone()
}
