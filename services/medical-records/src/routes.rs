use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/patients/:id", get(handlers::get_patient_record))
        .route("/patients/:id/consultations", get(handlers::list_consultations).post(handlers::create_consultation))
        .route("/consultations/:id", get(handlers::get_consultation).put(handlers::update_consultation))
        .route("/consultations/:id/soap", get(handlers::get_soap_note).post(handlers::create_soap_note))
        .route("/patients/:id/history", get(handlers::get_medical_history))
        .route("/patients/:id/allergies", get(handlers::list_allergies))
        .route("/patients/:id/diagnoses", get(handlers::list_diagnoses))
        .with_state(pool)
}
