//! Shared application state handed to every handler.
//!
//! The gateway's job is to be a thin, typed façade over Supabase for the
//! browser apps. It keeps one `reqwest::Client` so HTTP keep-alive can be
//! reused across requests, the Supabase endpoint + anon key read from the
//! environment at boot time, and a JWKS cache used to verify user JWTs.

use std::sync::Arc;

use reqwest::Client;

use crate::jwks::JwksCache;

#[derive(Clone)]
pub struct AppState {
    pub inner: Arc<AppStateInner>,
}

pub struct AppStateInner {
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub http: Client,
    pub jwks: JwksCache,
}

impl AppState {
    pub fn new(
        supabase_url: String,
        supabase_anon_key: String,
        jwks_url: String,
    ) -> Self {
        let http = Client::builder()
            .user_agent("red-salud-gateway/0.1")
            .build()
            .expect("reqwest client");

        let jwks = JwksCache::new(jwks_url, http.clone());

        Self {
            inner: Arc::new(AppStateInner {
                supabase_url,
                supabase_anon_key,
                http,
                jwks,
            }),
        }
    }
}
