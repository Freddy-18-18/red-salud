use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn get_patient_record(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "patient record endpoint" }))
}

pub async fn list_consultations(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "consultations endpoint" }))
}

pub async fn create_consultation(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "consultation created" }))
}

pub async fn get_consultation(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "consultation endpoint" }))
}

pub async fn update_consultation(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "consultation updated" }))
}

pub async fn get_soap_note(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "SOAP note endpoint" }))
}

pub async fn create_soap_note(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "SOAP note created" }))
}

pub async fn get_medical_history(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "medical history endpoint" }))
}

pub async fn list_allergies(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "allergies endpoint" }))
}

pub async fn list_diagnoses(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "diagnoses endpoint" }))
}
