use axum::{
    routing::{any, get, post},
    Router,
};

use crate::{handlers, state::AppState};

/// Nested under `/api/v1` in `main.rs`. Auth is enforced at the handler level
/// via the `AuthClaims` extractor, which 401s before the handler body runs.
pub fn api_routes(state: AppState) -> Router {
    Router::new()
        .route("/health", get(handlers::health))
        .route("/version", get(handlers::version))
        .route("/doctors/search", get(handlers::search_doctors))
        .route(
            "/doctors/{id}/availability",
            get(handlers::doctor_availability),
        )
        .route(
            "/appointments",
            post(handlers::create_appointment).get(handlers::list_appointments),
        )
        .fallback(any(handlers::not_found))
        .with_state(state)
}
