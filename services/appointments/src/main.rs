use axum::{routing::get, Router};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod error;
mod handlers;
mod models;
mod routes;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    dotenvy::dotenv().ok();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "red_salud_appointments=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = config::Config::from_env()?;
    let pool = config.create_db_pool().await?;

    let cors = build_cors_layer(&config);

    let app = Router::new()
        .route("/health", get(|| async { "OK" }))
        .nest("/api/v1/appointments", routes::appointment_routes())
        .nest("/api/v1/doctors", routes::doctor_routes())
        .with_state(pool)
        .layer(cors)
        .layer(TraceLayer::new_for_http());

    let addr = format!("{}:{}", config.host, config.port);
    tracing::info!("Appointments service listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

fn build_cors_layer(config: &config::Config) -> CorsLayer {
    let mut cors = CorsLayer::new()
        .allow_methods(Any)
        .allow_headers(Any);

    if config.allowed_origins.is_empty() {
        // In development, allow all localhost dev ports (3001-3009)
        let dev_origins: Vec<_> = (3001..=3009)
            .map(|port| format!("http://localhost:{port}").parse().unwrap())
            .collect();
        cors = cors.allow_origin(dev_origins);
    } else {
        let origins: Vec<_> = config
            .allowed_origins
            .iter()
            .filter_map(|o| o.parse().ok())
            .collect();
        cors = cors.allow_origin(origins);
    }

    cors
}
