use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/dispatch", post(handlers::create_dispatch))
        .route("/dispatch/:id", get(handlers::get_dispatch).put(handlers::update_dispatch))
        .route("/dispatch/active", get(handlers::list_active_dispatches))
        .route("/ambulances", get(handlers::list_ambulances))
        .route("/ambulances/:id/location", get(handlers::get_ambulance_location).put(handlers::update_ambulance_location))
        .route("/ambulances/:id/status", put(handlers::update_ambulance_status))
        .with_state(pool)
}
