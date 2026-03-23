use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Forbidden")]
    Forbidden,

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, code, message) = match &self {
            AppError::NotFound(msg) => (StatusCode::NOT_FOUND, "NOT_FOUND", msg.clone()),
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, "BAD_REQUEST", msg.clone()),
            AppError::Unauthorized => (StatusCode::UNAUTHORIZED, "UNAUTHORIZED", "Unauthorized".into()),
            AppError::Forbidden => (StatusCode::FORBIDDEN, "FORBIDDEN", "Forbidden".into()),
            AppError::Internal(e) => (StatusCode::INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", e.to_string()),
            AppError::Database(e) => (StatusCode::INTERNAL_SERVER_ERROR, "DATABASE_ERROR", e.to_string()),
        };

        (status, Json(json!({ "code": code, "message": message }))).into_response()
    }
}
