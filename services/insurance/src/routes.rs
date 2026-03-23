use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/policies", get(handlers::list_policies).post(handlers::create_policy))
        .route("/policies/:id", get(handlers::get_policy).put(handlers::update_policy))
        .route("/claims", get(handlers::list_claims).post(handlers::submit_claim))
        .route("/claims/:id", get(handlers::get_claim).put(handlers::update_claim))
        .route("/authorizations", get(handlers::list_authorizations).post(handlers::request_authorization))
        .route("/authorizations/:id", get(handlers::get_authorization))
        .with_state(pool)
}
