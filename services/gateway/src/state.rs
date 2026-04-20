//! Shared application state handed to every handler.
//!
//! The gateway's job is to be a thin, typed façade over Supabase for the
//! browser apps. It keeps one `reqwest::Client` so HTTP keep-alive can be
//! reused across requests and caches the Supabase endpoint + keys read from
//! the environment at boot time.

use std::sync::Arc;

use reqwest::Client;

#[derive(Clone)]
pub struct AppState {
    pub inner: Arc<AppStateInner>,
}

pub struct AppStateInner {
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub jwt_secret: String,
    pub http: Client,
}

impl AppState {
    pub fn new(
        supabase_url: String,
        supabase_anon_key: String,
        jwt_secret: String,
    ) -> Self {
        Self {
            inner: Arc::new(AppStateInner {
                supabase_url,
                supabase_anon_key,
                jwt_secret,
                http: Client::builder()
                    .user_agent("red-salud-gateway/0.1")
                    .build()
                    .expect("reqwest client"),
            }),
        }
    }
}
