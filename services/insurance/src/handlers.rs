use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_policies(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "policies endpoint" }))
}

pub async fn create_policy(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "policy created" }))
}

pub async fn get_policy(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "policy endpoint" }))
}

pub async fn update_policy(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "policy updated" }))
}

pub async fn list_claims(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "claims endpoint" }))
}

pub async fn submit_claim(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "claim submitted" }))
}

pub async fn get_claim(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "claim endpoint" }))
}

pub async fn update_claim(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "claim updated" }))
}

pub async fn list_authorizations(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "authorizations endpoint" }))
}

pub async fn request_authorization(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "authorization requested" }))
}

pub async fn get_authorization(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "authorization endpoint" }))
}
