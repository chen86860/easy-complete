use fig_proto::fig::{
    CheckForUpdatesRequest,
    CheckForUpdatesResponse,
    UpdateApplicationRequest,
};

use super::{
    RequestResult,
    RequestResultImpl,
    ServerOriginatedSubMessage,
};

pub async fn update_application(_request: UpdateApplicationRequest) -> RequestResult {
    RequestResult::success()
}

pub async fn check_for_updates(_request: CheckForUpdatesRequest) -> RequestResult {
    Ok(Box::new(ServerOriginatedSubMessage::CheckForUpdatesResponse(
        CheckForUpdatesResponse {
            is_update_available: Some(false),
            version: None,
        },
    )))
}
