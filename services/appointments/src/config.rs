use anyhow::Result;
use sqlx::postgres::PgPoolOptions;
use sqlx::PgPool;

pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
    pub allowed_origins: Vec<String>,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        let allowed_origins = std::env::var("ALLOWED_ORIGINS")
            .unwrap_or_default()
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect();

        Ok(Self {
            host: std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8083".into())
                .parse()?,
            database_url: std::env::var("DATABASE_URL")?,
            allowed_origins,
        })
    }

    pub async fn create_db_pool(&self) -> Result<PgPool> {
        let pool = PgPoolOptions::new()
            .max_connections(10)
            .connect(&self.database_url)
            .await?;

        tracing::info!("Database connection pool established");

        Ok(pool)
    }
}
