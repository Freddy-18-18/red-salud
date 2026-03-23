use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_appointments(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "appointments endpoint" }))
}

pub async fn create_appointment(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "appointment created" }))
}

pub async fn get_appointment(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "appointment endpoint" }))
}

pub async fn update_appointment(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "appointment updated" }))
}

pub async fn get_doctor_schedule(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "doctor schedule endpoint" }))
}

pub async fn get_doctor_availability(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "doctor availability endpoint" }))
}
