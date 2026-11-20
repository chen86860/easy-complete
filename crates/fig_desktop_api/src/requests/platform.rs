use fig_os_shim::PlatformProvider;
use fig_proto::fig::{GetPlatformInfoRequest, GetPlatformInfoResponse, Os};

use super::{RequestResult, ServerOriginatedSubMessage};

pub async fn get_platform_info<Ctx>(_request: GetPlatformInfoRequest, ctx: &Ctx) -> RequestResult
where
    Ctx: PlatformProvider,
{
    let os = match ctx.platform().os() {
        fig_os_shim::Os::Mac => Os::Macos,
        _ => return Err("Unsupported operating system".into()),
    };

    let response = ServerOriginatedSubMessage::GetPlatformInfoResponse(GetPlatformInfoResponse {
        os: os.into(),
        desktop_environment: None,
        display_server_protocol: None,
        app_bundle_type: None,
    });
    Ok(response.into())
}
