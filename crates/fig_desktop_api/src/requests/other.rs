use fig_proto::fig::server_originated_message::Submessage as ServerSubmessage;
use fig_proto::fig::{OpenInExternalApplicationRequest, PingRequest, PingResponse};
use fig_util::open_url_async;
use url::Url;

use super::{RequestResult, RequestResultImpl};

const OPEN_SOURCE_LICENSES_URL: &str = "ec-internal://open-source-licenses";

pub async fn open_in_external_application(request: OpenInExternalApplicationRequest) -> RequestResult {
    match request.url {
        Some(url) => match resolve_url(&url) {
            Ok(url) => match open_url_async(&url).await {
                Ok(_) => RequestResult::success(),
                Err(err) => RequestResult::error(format!("Failed to open url {url}: {err}")),
            },
            Err(err) => RequestResult::error(err),
        },
        None => RequestResult::error("No url provided to open"),
    }
}

fn resolve_url(url: &str) -> Result<String, String> {
    if url != OPEN_SOURCE_LICENSES_URL {
        return Ok(url.to_owned());
    }

    let licenses_path = fig_util::directories::resources_path()
        .map_err(|err| format!("Failed to locate application resources: {err}"))?
        .join("Licenses");

    if !licenses_path.is_dir() {
        return Err(format!(
            "Bundled licenses directory does not exist: {}",
            licenses_path.display()
        ));
    }

    Url::from_directory_path(&licenses_path)
        .map(|url| url.to_string())
        .map_err(|()| {
            format!(
                "Failed to create a file URL for bundled licenses: {}",
                licenses_path.display()
            )
        })
}

#[cfg(test)]
mod tests {
    use super::resolve_url;

    #[test]
    fn external_urls_are_unchanged() {
        let url = "https://example.com/licenses";

        assert_eq!(resolve_url(url).unwrap(), url);
    }
}

pub fn ping(_request: PingRequest) -> RequestResult {
    RequestResult::Ok(Box::new(ServerSubmessage::PingResponse(PingResponse {})))
}
