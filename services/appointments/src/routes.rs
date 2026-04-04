use axum::{
    routing::{delete, get, patch},
    Router,
};
use sqlx::PgPool;

use crate::handlers;

pub fn appointment_routes() -> Router<PgPool> {
    Router::new()
        .route("/", get(handlers::list_appointments).post(handlers::create_appointment))
        .route("/{id}", get(handlers::get_appointment).put(handlers::update_appointment).delete(handlers::delete_appointment))
        .route("/{id}/status", patch(handlers::change_status))
}

pub fn doctor_routes() -> Router<PgPool> {
    Router::new()
        .route("/{id}/schedule", get(handlers::get_doctor_schedule).put(handlers::update_doctor_schedule))
        .route("/{id}/availability", get(handlers::get_doctor_availability))
        .route("/{id}/time-blocks", get(handlers::list_time_blocks).post(handlers::create_time_block))
        .route("/{id}/time-blocks/{block_id}", delete(handlers::delete_time_block))
}
