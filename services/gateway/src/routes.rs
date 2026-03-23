use axum::Router;

pub fn api_routes() -> Router {
    Router::new()
        // Routes will proxy to individual services
        // e.g., /api/v1/pharmacy/* -> pharmacy service
        // e.g., /api/v1/appointments/* -> appointments service
}
