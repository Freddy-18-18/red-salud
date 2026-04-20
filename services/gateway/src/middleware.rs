//! Authentication middleware that decodes a Supabase-issued JWT.
//!
//! Supabase signs user JWTs with HS256 using the project's JWT secret
//! (`SUPABASE_JWT_SECRET` in Supabase terms). We accept `Authorization:
//! Bearer <token>`, decode and verify, then attach the resulting claims
//! to the request extensions so handlers can pull the user id without
//! reparsing the header.

use axum::{
    extract::{Request, State},
    http::{header, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, Algorithm, DecodingKey, Validation};
use serde::{Deserialize, Serialize};

use crate::state::AppState;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    #[serde(default)]
    pub email: Option<String>,
    #[serde(default)]
    pub role: Option<String>,
    pub exp: usize,
}

/// Strict auth: rejects with 401 if no bearer token or verification fails.
pub async fn require_auth(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let claims = extract_claims(&state, &request).ok_or(StatusCode::UNAUTHORIZED)?;
    request.extensions_mut().insert(claims);
    Ok(next.run(request).await)
}

/// Optional auth: lets the request through even without a token and stashes
/// claims only when a valid one is present. Handlers that want anon access
/// can inspect `Extension<Option<Claims>>`.
pub async fn optional_auth(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Response {
    let claims = extract_claims(&state, &request);
    request.extensions_mut().insert::<Option<Claims>>(claims);
    next.run(request).await
}

fn extract_claims(state: &AppState, request: &Request) -> Option<Claims> {
    let header_value = request.headers().get(header::AUTHORIZATION)?.to_str().ok()?;
    let token = header_value.strip_prefix("Bearer ").unwrap_or(header_value);

    let mut validation = Validation::new(Algorithm::HS256);
    // Supabase tokens carry aud="authenticated"; don't fail if absent though.
    validation.set_audience(&["authenticated"]);
    validation.validate_aud = false;

    decode::<Claims>(
        token,
        &DecodingKey::from_secret(state.inner.jwt_secret.as_bytes()),
        &validation,
    )
    .ok()
    .map(|data| data.claims)
}
