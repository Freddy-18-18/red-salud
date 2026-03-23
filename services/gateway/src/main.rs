use axum::{
    Router,
    routing::get,
    http::{HeaderValue, Method},
};
use tower_http::cors::CorsLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod routes;
mod middleware;
mod error;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env()
            .unwrap_or_else(|_| "red_salud_gateway=debug,tower_http=debug".into()))
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::Config::from_env()?;

    let cors = CorsLayer::new()
        .allow_origin(config.allowed_origins.iter()
            .map(|o| o.parse::<HeaderValue>().unwrap())
            .collect::<Vec<_>>())
        .allow_methods([Method::GET, Method::POST, Method::PUT, Method::PATCH, Method::DELETE])
        .allow_headers(tower_http::cors::Any);

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest("/api/v1", routes::api_routes())
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("Gateway listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
