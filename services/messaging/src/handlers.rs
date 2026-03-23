use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_conversations(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "conversations endpoint" }))
}

pub async fn create_conversation(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "conversation created" }))
}

pub async fn get_conversation(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "conversation endpoint" }))
}

pub async fn list_messages(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "messages endpoint" }))
}

pub async fn send_message(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "message sent" }))
}

pub async fn mark_as_read(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "message marked as read" }))
}

pub async fn list_notifications(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "notifications endpoint" }))
}

pub async fn mark_notification_read(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "notification marked as read" }))
}
