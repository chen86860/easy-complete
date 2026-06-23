use std::borrow::Cow;
use std::io::ErrorKind;
use std::path::Path;
use std::sync::Arc;

use fig_os_shim::Context;
use percent_encoding::percent_decode_str;
use tracing::info;
use wry::http::header::CONTENT_TYPE;
use wry::http::{
    Request,
    Response,
};

use super::util::{
    res_400,
    res_404,
    res_500,
};
use crate::webview::WindowId;

pub async fn clear_index_cache() {}

fn relativize(path: &Path) -> &Path {
    match path.strip_prefix("/") {
        Ok(path) => path,
        Err(_) => path,
    }
}

fn content_type(path: &Path, content: &[u8]) -> &'static str {
    match path.extension().and_then(|ext| ext.to_str()) {
        Some("js") => mime::APPLICATION_JAVASCRIPT_UTF_8.as_ref(),
        Some("json") => mime::APPLICATION_JSON.as_ref(),
        Some("png") => mime::IMAGE_PNG.as_ref(),
        Some("svg") => mime::IMAGE_SVG.as_ref(),
        Some("txt" | "text") => mime::TEXT_PLAIN.as_ref(),
        _ => infer::get(content).map_or(mime::APPLICATION_OCTET_STREAM.as_ref(), |mime| mime.mime_type()),
    }
}

/// handle `spec://localhost/spec.js` from bundled `Contents/Resources/specs`.
pub async fn handle(
    ctx: Arc<Context>,
    request: Request<Vec<u8>>,
    _: WindowId,
) -> anyhow::Result<Response<Cow<'static, [u8]>>> {
    if request.uri().host() != Some("localhost") {
        return res_400();
    }

    let specs_path = fig_util::directories::resources_path_ctx(&ctx)?.join("specs");
    let resources_path = match specs_path.canonicalize() {
        Ok(path) => path,
        Err(err) if err.kind() == ErrorKind::NotFound => return res_404(),
        Err(err) => return res_500(err),
    };

    let decoded_uri_path = match percent_decode_str(request.uri().path()).decode_utf8() {
        Ok(path) => path,
        Err(_) => return res_400(),
    };
    let uri_path = Path::new(decoded_uri_path.as_ref());
    let path = match resources_path.join(relativize(uri_path)).canonicalize() {
        Ok(path) => path,
        Err(err) if err.kind() == ErrorKind::NotFound => return res_404(),
        Err(err) => return res_500(err),
    };

    if !path.starts_with(&resources_path) {
        return res_400();
    }

    let content = match std::fs::read(&path) {
        Ok(content) => content,
        Err(err) if err.kind() == ErrorKind::NotFound => return res_404(),
        Err(err) => return res_500(err),
    };

    info!("serving bundled spec resource: {}", path.display());

    Ok(Response::builder()
        .header(CONTENT_TYPE, content_type(&path, &content))
        .body(content.into())?)
}
