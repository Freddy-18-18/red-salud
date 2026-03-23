use axum::{
    Router,
    routing::get,
};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod routes;
mod handlers;
mod models;
mod error;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "red_salud_pharmacy=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::Config::from_env()?;
    let pool = config.create_db_pool().await?;

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest("/api/v1/pharmacy", routes::service_routes(pool))
        .layer(TraceLayer::new_for_http());

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("Pharmacy service listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
