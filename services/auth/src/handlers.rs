use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn login(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "login endpoint" }))
}

pub async fn register(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "register endpoint" }))
}

pub async fn refresh_token(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "refresh token endpoint" }))
}

pub async fn logout(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "logout endpoint" }))
}

pub async fn get_current_user(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "current user endpoint" }))
}

pub async fn verify_token(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "verify token endpoint" }))
}

pub async fn request_password_reset(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "password reset endpoint" }))
}
