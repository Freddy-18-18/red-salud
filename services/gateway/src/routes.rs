use axum::{
    routing::{get, any},
    Router,
};

use crate::{handlers, state::AppState};

/// Nested under `/api/v1` in `main.rs`.
pub fn api_routes(state: AppState) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/version", get(handlers::version))
        .route("/doctors/search", get(handlers::search_doctors))
        .route(
            "/doctors/{id}/availability",
            get(handlers::doctor_availability),
        )
        .fallback(any(handlers::not_found))
        .with_state(state)
}
