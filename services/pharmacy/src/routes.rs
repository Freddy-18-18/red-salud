use axum::{Router, routing::{get, post}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/inventory", get(handlers::list_inventory))
        .route("/inventory/:id", get(handlers::get_product))
        .route("/sales", post(handlers::create_sale))
        .route("/sales", get(handlers::list_sales))
        .route("/prescriptions", get(handlers::list_prescriptions))
        .route("/deliveries", get(handlers::list_deliveries))
        .with_state(pool)
}
