//! JWKS-based public-key cache for verifying Supabase Auth JWTs.
//!
//! Supabase exposes the project's signing public keys at
//! `${SUPABASE_URL}/auth/v1/.well-known/jwks.json`. We pull and cache the set
//! in-process (10-minute TTL — Supabase's edge cache is also 10 minutes), and
//! refresh on either expiry or a cache miss for an unseen `kid`. This handles
//! key rotation transparently: when Supabase promotes a standby key, the next
//! request that arrives with the new `kid` triggers a fresh fetch.

use std::time::{Duration, Instant};

use anyhow::{anyhow, Result};
use jsonwebtoken::jwk::{Jwk, JwkSet};
use reqwest::Client;
use tokio::sync::RwLock;

const DEFAULT_TTL_SECS: u64 = 600; // 10 minutes — matches Supabase edge cache.

pub struct JwksCache {
    url: String,
    http: Client,
    ttl: Duration,
    inner: RwLock<Option<Cached>>,
}

struct Cached {
    set: JwkSet,
    expires_at: Instant,
}

impl JwksCache {
    pub fn new(url: String, http: Client) -> Self {
        Self {
            url,
            http,
            ttl: Duration::from_secs(DEFAULT_TTL_SECS),
            inner: RwLock::new(None),
        }
    }

    /// Look up a JWK by `kid`. Refreshes the cache on a miss (the key may have
    /// been rotated in since the last fetch) and on TTL expiry.
    pub async fn get(&self, kid: &str) -> Result<Jwk> {
        if let Some(jwk) = self.try_from_cache(kid).await {
            return Ok(jwk);
        }

        // Miss or expired — fetch fresh and try again.
        self.refresh().await?;

        self.try_from_cache(kid)
            .await
            .ok_or_else(|| anyhow!("jwk kid `{}` not found in JWKS", kid))
    }

    async fn try_from_cache(&self, kid: &str) -> Option<Jwk> {
        let guard = self.inner.read().await;
        let cached = guard.as_ref()?;
        if Instant::now() >= cached.expires_at {
            return None;
        }
        cached.set.find(kid).cloned()
    }

    async fn refresh(&self) -> Result<()> {
        let res = self
            .http
            .get(&self.url)
            .send()
            .await
            .map_err(|e| anyhow!("jwks fetch error: {e}"))?;

        if !res.status().is_success() {
            return Err(anyhow!("jwks fetch returned {}", res.status()));
        }

        let set: JwkSet = res
            .json()
            .await
            .map_err(|e| anyhow!("jwks parse error: {e}"))?;

        let mut guard = self.inner.write().await;
        *guard = Some(Cached {
            set,
            expires_at: Instant::now() + self.ttl,
        });
        Ok(())
    }
}
