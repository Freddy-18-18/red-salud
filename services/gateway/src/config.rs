use anyhow::Result;

pub struct Config {
    pub host: String,
    pub port: u16,
    pub allowed_origins: Vec<String>,
    pub supabase_url: String,
    pub supabase_anon_key: String,
    pub jwks_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let supabase_url = std::env::var("SUPABASE_URL")?;
        // Default to the project's standard JWKS endpoint; allow override for
        // tests or alternate auth deployments.
        let jwks_url = std::env::var("SUPABASE_JWKS_URL")
            .unwrap_or_else(|_| format!("{}/auth/v1/.well-known/jwks.json", supabase_url.trim_end_matches('/')));

        Ok(Self {
            host: std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: std::env::var("PORT").unwrap_or_else(|_| "8080".into()).parse()?,
            allowed_origins: std::env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3001,http://localhost:3002,http://localhost:3003".into())
                .split(',')
                .map(String::from)
                .collect(),
            supabase_url,
            supabase_anon_key: std::env::var("SUPABASE_ANON_KEY")?,
            jwks_url,
        })
    }
}
