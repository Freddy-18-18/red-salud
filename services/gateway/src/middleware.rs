use axum::{
    extract::Request,
    middleware::Next,
    response::Response,
    http::StatusCode,
};

pub async fn auth_middleware(request: Request, next: Next) -> Result<Response, StatusCode> {
    let auth_header = request.headers().get("Authorization");

    match auth_header {
        Some(header) => {
            let _token = header.to_str().map_err(|_| StatusCode::UNAUTHORIZED)?;
            // TODO: Validate JWT token with Supabase
            Ok(next.run(request).await)
        }
        None => Err(StatusCode::UNAUTHORIZED),
    }
}
