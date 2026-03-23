use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_inventory(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "inventory endpoint" }))
}

pub async fn get_product(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "product endpoint" }))
}

pub async fn create_sale(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "sale created" }))
}

pub async fn list_sales(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "sales endpoint" }))
}

pub async fn list_prescriptions(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "prescriptions endpoint" }))
}

pub async fn list_deliveries(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "deliveries endpoint" }))
}
