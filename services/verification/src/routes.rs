use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/sacs/verify", post(handlers::verify_sacs))
        .route("/sacs/status/:id", get(handlers::get_sacs_status))
        .route("/credentials", get(handlers::list_credentials).post(handlers::submit_credential))
        .route("/credentials/:id", get(handlers::get_credential).put(handlers::update_credential))
        .route("/credentials/:id/verify", post(handlers::verify_credential))
        .route("/professionals/:id/status", get(handlers::get_professional_status))
        .with_state(pool)
}
