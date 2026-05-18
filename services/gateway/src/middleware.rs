//! Authentication middleware that verifies Supabase Auth JWTs against the
//! project's JWKS endpoint.
//!
//! Supabase signs user access tokens with the project's signing key. After
//! migrating to "JWT Signing Keys" the public key is published as a JWK at
//! `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`. We resolve the key by the
//! token's `kid`, verify the signature, and stash the claims in the request
//! extensions for handlers to read.

use axum::{
    extract::{FromRequestParts, Request, State},
    http::{header, request::Parts, StatusCode},
    middleware::Next,
    response::Response,
};
use jsonwebtoken::{decode, decode_header, DecodingKey, Validation};
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
    let claims = extract_claims(&state, &request)
        .await
        .ok_or(StatusCode::UNAUTHORIZED)?;
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
    let claims = extract_claims(&state, &request).await;
    request.extensions_mut().insert::<Option<Claims>>(claims);
    next.run(request).await
}

async fn extract_claims(state: &AppState, request: &Request) -> Option<Claims> {
    extract_claims_from_header(state, request.headers().get(header::AUTHORIZATION)).await
}

async fn extract_claims_from_header(
    state: &AppState,
    auth_header: Option<&axum::http::HeaderValue>,
) -> Option<Claims> {
    let header_value = auth_header?.to_str().ok()?;
    let token = header_value.strip_prefix("Bearer ").unwrap_or(header_value);

    let header = decode_header(token).ok()?;
    let kid = header.kid?;

    let jwk = state.inner.jwks.get(&kid).await.ok()?;
    let key = DecodingKey::from_jwk(&jwk).ok()?;

    let mut validation = Validation::new(header.alg);
    // Supabase tokens carry aud="authenticated"; don't fail if absent though.
    validation.set_audience(&["authenticated"]);
    validation.validate_aud = false;

    decode::<Claims>(token, &key, &validation)
        .ok()
        .map(|data| data.claims)
}

/// Extractor that gates a handler on a valid Supabase Auth JWT. Use as the
/// first parameter of any protected handler:
///
/// ```ignore
/// async fn handler(AuthClaims(claims): AuthClaims, ...) -> ... { ... }
/// ```
pub struct AuthClaims(pub Claims);

impl FromRequestParts<AppState> for AuthClaims {
    type Rejection = StatusCode;

    async fn from_request_parts(parts: &mut Parts, state: &AppState) -> Result<Self, Self::Rejection> {
        let header = parts.headers.get(header::AUTHORIZATION);
        match extract_claims_from_header(state, header).await {
            Some(claims) => Ok(AuthClaims(claims)),
            None => Err(StatusCode::UNAUTHORIZED),
        }
    }
}
