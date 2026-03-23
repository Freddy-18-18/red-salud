use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/conversations", get(handlers::list_conversations).post(handlers::create_conversation))
        .route("/conversations/:id", get(handlers::get_conversation))
        .route("/conversations/:id/messages", get(handlers::list_messages).post(handlers::send_message))
        .route("/messages/:id/read", put(handlers::mark_as_read))
        .route("/notifications", get(handlers::list_notifications))
        .route("/notifications/:id/read", put(handlers::mark_notification_read))
        .with_state(pool)
}
