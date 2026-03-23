use anyhow::Result;
use sqlx::PgPool;

pub struct Config {
    pub host: String,
    pub port: u16,
    pub database_url: String,
}

impl Config {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            host: std::env::var("HOST").unwrap_or_else(|_| "0.0.0.0".into()),
            port: std::env::var("PORT").unwrap_or_else(|_| "8087".into()).parse()?,
            database_url: std::env::var("DATABASE_URL")?,
        })
    }

    pub async fn create_db_pool(&self) -> Result<PgPool> {
        let pool = PgPool::connect(&self.database_url).await?;
        sqlx::migrate!("../../database/migrations")
            .run(&pool)
            .await?;
        Ok(pool)
    }
}
