use anyhow::Result;

pub struct Config {
    pub host: String,
    pub port: u16,
    pub allowed_origins: Vec<String>,
    pub jwt_secret: String,
    pub supabase_url: String,
    pub supabase_anon_key: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            host: std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: std::env::var("PORT").unwrap_or_else(|_| "8080".into()).parse()?,
            allowed_origins: std::env::var("ALLOWED_ORIGINS")
                .unwrap_or_else(|_| "http://localhost:3001,http://localhost:3002,http://localhost:3003".into())
                .split(',')
                .map(String::from)
                .collect(),
            jwt_secret: std::env::var("JWT_SECRET")?,
            supabase_url: std::env::var("SUPABASE_URL")?,
            supabase_anon_key: std::env::var("SUPABASE_ANON_KEY")?,
        })
    }
}
