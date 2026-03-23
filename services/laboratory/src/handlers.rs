use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_orders(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "lab orders endpoint" }))
}

pub async fn create_order(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "lab order created" }))
}

pub async fn get_order(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "lab order endpoint" }))
}

pub async fn update_order(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "lab order updated" }))
}

pub async fn get_results(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "lab results endpoint" }))
}

pub async fn submit_results(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "lab results submitted" }))
}

pub async fn list_test_catalog(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "test catalog endpoint" }))
}

pub async fn get_test_info(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "test info endpoint" }))
}
