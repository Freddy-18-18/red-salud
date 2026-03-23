use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/invoices", get(handlers::list_invoices).post(handlers::create_invoice))
        .route("/invoices/:id", get(handlers::get_invoice).put(handlers::update_invoice))
        .route("/payments", get(handlers::list_payments).post(handlers::process_payment))
        .route("/payments/:id", get(handlers::get_payment))
        .route("/reports/revenue", get(handlers::revenue_report))
        .route("/reports/outstanding", get(handlers::outstanding_report))
        .with_state(pool)
}
