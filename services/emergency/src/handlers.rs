use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn create_dispatch(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "dispatch created" }))
}

pub async fn get_dispatch(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "dispatch endpoint" }))
}

pub async fn update_dispatch(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "dispatch updated" }))
}

pub async fn list_active_dispatches(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "active dispatches endpoint" }))
}

pub async fn list_ambulances(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "ambulances endpoint" }))
}

pub async fn get_ambulance_location(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "ambulance location endpoint" }))
}

pub async fn update_ambulance_location(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "ambulance location updated" }))
}

pub async fn update_ambulance_status(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "ambulance status updated" }))
}
