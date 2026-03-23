use axum::{Router, routing::{get, post}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/login", post(handlers::login))
        .route("/register", post(handlers::register))
        .route("/refresh", post(handlers::refresh_token))
        .route("/logout", post(handlers::logout))
        .route("/me", get(handlers::get_current_user))
        .route("/verify-token", post(handlers::verify_token))
        .route("/reset-password", post(handlers::request_password_reset))
        .with_state(pool)
}
