use axum::{Router, routing::{get, post, put}};
use sqlx::PgPool;

use crate::handlers;

pub fn service_routes(pool: PgPool) -> Router {
    Router::new()
        .route("/courses", get(handlers::list_courses).post(handlers::create_course))
        .route("/courses/:id", get(handlers::get_course).put(handlers::update_course))
        .route("/courses/:id/enroll", post(handlers::enroll_in_course))
        .route("/courses/:id/progress", get(handlers::get_course_progress))
        .route("/users/:id/progress", get(handlers::get_user_progress))
        .route("/users/:id/achievements", get(handlers::list_achievements))
        .route("/leaderboard", get(handlers::get_leaderboard))
        .with_state(pool)
}
