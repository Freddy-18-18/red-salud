use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/", get(handlers::list_appointments).post(handlers::create_appointment))
        .route("/:id", get(handlers::get_appointment).put(handlers::update_appointment))
        .route("/doctors/:id/schedule", get(handlers::get_doctor_schedule))
        .route("/doctors/:id/availability", get(handlers::get_doctor_availability))
        .with_state(pool)
}
