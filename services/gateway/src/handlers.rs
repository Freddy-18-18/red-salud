//! HTTP handlers. Today these forward to Supabase PostgREST / RPC endpoints
//! using `reqwest`; future iterations can swap to direct sqlx queries once
//! the gateway owns the domain logic.

use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use serde::Deserialize;
use serde_json::Value;

use crate::{error::AppError, state::AppState};

// ---------------------------------------------------------------
// Health
// ---------------------------------------------------------------
pub async fn health() -> &'static str {
    "OK"
}

pub async fn version() -> Json<Value> {
    Json(serde_json::json!({
        "service": "red-salud-gateway",
        "version": env!("CARGO_PKG_VERSION"),
    }))
}

// ---------------------------------------------------------------
// GET /v1/doctors/search
// ---------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct DoctorSearchQuery {
    pub specialty_id: Option<String>,
    pub accepts_insurance: Option<bool>,
    pub min_rating: Option<f32>,
    pub page: Option<u32>,
    pub page_size: Option<u32>,
}

pub async fn search_doctors(
    State(state): State<AppState>,
    Query(q): Query<DoctorSearchQuery>,
) -> Result<Json<Value>, AppError> {
    let page = q.page.unwrap_or(1).max(1);
    let page_size = q.page_size.unwrap_or(20).clamp(1, 50);
    let from = (page - 1) * page_size;
    let to = from + page_size - 1;

    let mut url = format!(
        "{}/rest/v1/doctor_profiles?select=id,specialty_id,consultation_fee,consultation_price,average_rating,total_reviews,accepts_insurance,languages,profile:profiles!doctor_profiles_profile_id_fkey(full_name,avatar_url,city,state)",
        state.inner.supabase_url
    );
    url.push_str("&verified=eq.true");

    if let Some(sid) = &q.specialty_id {
        url.push_str(&format!("&specialty_id=eq.{}", urlencoding::encode(sid)));
    }
    if let Some(true) = q.accepts_insurance {
        url.push_str("&accepts_insurance=eq.true");
    }
    if let Some(r) = q.min_rating {
        url.push_str(&format!("&average_rating=gte.{}", r));
    }

    let req = state
        .inner
        .http
        .get(&url)
        .header("apikey", &state.inner.supabase_anon_key)
        .header("Authorization", format!("Bearer {}", state.inner.supabase_anon_key))
        .header("Range", format!("{}-{}", from, to))
        .header("Prefer", "count=exact");

    let res = req
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("supabase http: {e}")))?;

    if !res.status().is_success() {
        return Err(AppError::Internal(anyhow::anyhow!(
            "supabase search returned {}",
            res.status()
        )));
    }

    let total = parse_content_range_total(res.headers().get("content-range"));
    let data: Value = res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("supabase body: {e}")))?;

    Ok(Json(serde_json::json!({
        "data": data,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
        }
    })))
}

fn parse_content_range_total(header: Option<&axum::http::HeaderValue>) -> Option<u64> {
    let h = header?.to_str().ok()?;
    // format: "0-19/142" or "*/0"
    let (_, total) = h.split_once('/')?;
    total.parse::<u64>().ok()
}

// ---------------------------------------------------------------
// GET /v1/doctors/:id/availability?date=YYYY-MM-DD
// ---------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct AvailabilityQuery {
    pub date: Option<String>,
    pub days_ahead: Option<u32>,
}

pub async fn doctor_availability(
    State(state): State<AppState>,
    Path(doctor_id): Path<String>,
    Query(q): Query<AvailabilityQuery>,
) -> Result<Json<Value>, AppError> {
    let (rpc, body) = match &q.date {
        Some(date) => (
            "get_doctor_public_availability",
            serde_json::json!({
                "p_doctor_id": doctor_id,
                "p_date": date,
                "p_slot_duration_mins": null as Option<i32>,
            }),
        ),
        None => (
            "get_doctor_available_dates",
            serde_json::json!({
                "p_doctor_id": doctor_id,
                "p_days_ahead": q.days_ahead.unwrap_or(30),
            }),
        ),
    };

    let url = format!("{}/rest/v1/rpc/{}", state.inner.supabase_url, rpc);
    let res = state
        .inner
        .http
        .post(&url)
        .header("apikey", &state.inner.supabase_anon_key)
        .header(
            "Authorization",
            format!("Bearer {}", state.inner.supabase_anon_key),
        )
        .json(&body)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("supabase rpc: {e}")))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "availability rpc {} failed: {} {}",
            rpc,
            status,
            body
        )));
    }

    let data: Value = res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("supabase body: {e}")))?;
    Ok(Json(serde_json::json!({ "data": data })))
}

// ---------------------------------------------------------------
// Not found fallback
// ---------------------------------------------------------------
pub async fn not_found() -> (StatusCode, Json<Value>) {
    (
        StatusCode::NOT_FOUND,
        Json(serde_json::json!({ "code": "NOT_FOUND", "message": "Route not found" })),
    )
}
