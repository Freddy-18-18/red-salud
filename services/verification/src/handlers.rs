use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn verify_sacs(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "SACS verification endpoint" }))
}

pub async fn get_sacs_status(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "SACS status endpoint" }))
}

pub async fn list_credentials(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "credentials endpoint" }))
}

pub async fn submit_credential(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "credential submitted" }))
}

pub async fn get_credential(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "credential endpoint" }))
}

pub async fn update_credential(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "credential updated" }))
}

pub async fn verify_credential(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "credential verified" }))
}

pub async fn get_professional_status(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "professional status endpoint" }))
}
