use axum::{extract::State, Json};
use sqlx::PgPool;
use serde_json::{json, Value};

pub async fn list_courses(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "courses endpoint" }))
}

pub async fn create_course(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "course created" }))
}

pub async fn get_course(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "course endpoint" }))
}

pub async fn update_course(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "course updated" }))
}

pub async fn enroll_in_course(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "enrolled in course" }))
}

pub async fn get_course_progress(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "course progress endpoint" }))
}

pub async fn get_user_progress(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": null, "message": "user progress endpoint" }))
}

pub async fn list_achievements(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "achievements endpoint" }))
}

pub async fn get_leaderboard(State(_pool): State<PgPool>) -> Json<Value> {
    Json(json!({ "data": [], "message": "leaderboard endpoint" }))
}
