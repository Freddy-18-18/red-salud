use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_invoices(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "invoices endpoint" }))
}

pub async fn create_invoice(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "invoice created" }))
}

pub async fn get_invoice(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "invoice endpoint" }))
}

pub async fn update_invoice(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "invoice updated" }))
}

pub async fn list_payments(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "payments endpoint" }))
}

pub async fn process_payment(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "payment processed" }))
}

pub async fn get_payment(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "payment endpoint" }))
}

pub async fn revenue_report(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "revenue report endpoint" }))
}

pub async fn outstanding_report(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "outstanding report endpoint" }))
}
