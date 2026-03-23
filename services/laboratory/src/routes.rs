use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/orders", get(handlers::list_orders).post(handlers::create_order))
        .route("/orders/:id", get(handlers::get_order).put(handlers::update_order))
        .route("/orders/:id/results", get(handlers::get_results).post(handlers::submit_results))
        .route("/catalog", get(handlers::list_test_catalog))
        .route("/catalog/:id", get(handlers::get_test_info))
        .with_state(pool)
}
