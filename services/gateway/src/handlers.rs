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

    // FK names below carry the legacy `doctor_details_*` prefix because
    // `doctor_profiles` was renamed from `doctor_details` and the FK
    // constraints kept their original names.
    let select = "id,slug,specialty_id,consultation_fee,consultation_price,\
average_rating,total_reviews,accepts_insurance,accepts_new_patients,\
accepts_telemedicine,verified,years_experience,biography,languages,\
profile:profiles!doctor_details_profile_id_fkey(id,full_name,avatar_url,city,state),\
specialty:specialties!fk_doctor_specialty(id,name,slug,icon)";

    let mut url = format!(
        "{}/rest/v1/doctor_profiles?select={}",
        state.inner.supabase_url, select
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
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "supabase search {} {}",
            status,
            body
        )));
    }

    let total = parse_content_range_total(res.headers().get("content-range")).unwrap_or(0);
    let total_pages = if total == 0 {
        0
    } else {
        ((total as f64) / (page_size as f64)).ceil() as u64
    };
    let data: Value = res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("supabase body: {e}")))?;

    Ok(Json(serde_json::json!({
        "data": data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": total_pages,
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
                "p_slot_duration_mins": serde_json::Value::Null,
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
// Appointments — POST /v1/appointments
// ---------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct CreateAppointmentBody {
    pub doctor_id: String,
    pub scheduled_at: String,
    #[serde(default)]
    pub duration_minutes: Option<i32>,
    pub reason: String,
    #[serde(default)]
    pub notes: Option<String>,
    #[serde(default)]
    pub appointment_type: Option<String>,
    #[serde(default)]
    pub location_id: Option<String>,
    #[serde(default)]
    pub price: Option<f64>,
}

pub async fn create_appointment(
    State(state): State<AppState>,
    crate::middleware::AuthClaims(claims): crate::middleware::AuthClaims,
    headers: axum::http::HeaderMap,
    Json(body): Json<CreateAppointmentBody>,
) -> Result<(StatusCode, Json<Value>), AppError> {
    let duration = body.duration_minutes.unwrap_or(30).clamp(5, 480);

    // Compute end timestamp for conflict check.
    let start_dt = chrono::DateTime::parse_from_rfc3339(&body.scheduled_at)
        .map_err(|e| AppError::BadRequest(format!("scheduled_at must be ISO-8601: {e}")))?;
    let end_dt = start_dt + chrono::Duration::minutes(duration as i64);

    // 1. Check for slot conflicts via RPC (no location required).
    let conflict_url = format!(
        "{}/rest/v1/rpc/check_time_block_conflict",
        state.inner.supabase_url
    );
    let conflict_res = state
        .inner
        .http
        .post(&conflict_url)
        .header("apikey", &state.inner.supabase_anon_key)
        .header(
            "Authorization",
            forwarded_auth(&headers, &state.inner.supabase_anon_key),
        )
        .json(&serde_json::json!({
            "p_doctor_id": body.doctor_id,
            "p_start": start_dt.to_rfc3339(),
            "p_end": end_dt.to_rfc3339(),
        }))
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("conflict rpc: {e}")))?;

    if !conflict_res.status().is_success() {
        let status = conflict_res.status();
        let txt = conflict_res.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "check_time_block_conflict {} {}",
            status,
            txt
        )));
    }

    let has_conflict: bool = conflict_res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("conflict parse: {e}")))?;

    if has_conflict {
        return Ok((
            StatusCode::CONFLICT,
            Json(serde_json::json!({
                "code": "SLOT_CONFLICT",
                "message": "El horario seleccionado ya no esta disponible.",
            })),
        ));
    }

    // 2. Insert appointment. RLS uses the forwarded user JWT to enforce
    //    `patient_id = auth.uid`, so we trust the claim from middleware.
    let mut row = serde_json::json!({
        "doctor_id": body.doctor_id,
        "patient_id": claims.sub,
        "scheduled_at": start_dt.to_rfc3339(),
        "duration_minutes": duration,
        "reason": body.reason,
    });
    if let Some(notes) = body.notes {
        row["notes"] = serde_json::Value::String(notes);
    }
    if let Some(t) = body.appointment_type {
        row["appointment_type"] = serde_json::Value::String(t);
    }
    if let Some(lid) = body.location_id {
        row["location_id"] = serde_json::Value::String(lid);
    }
    if let Some(p) = body.price {
        row["price"] = serde_json::json!(p);
    }

    let insert_url = format!("{}/rest/v1/appointments", state.inner.supabase_url);
    let insert_res = state
        .inner
        .http
        .post(&insert_url)
        .header("apikey", &state.inner.supabase_anon_key)
        .header(
            "Authorization",
            forwarded_auth(&headers, &state.inner.supabase_anon_key),
        )
        .header("Prefer", "return=representation")
        .json(&row)
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("insert appointment: {e}")))?;

    if !insert_res.status().is_success() {
        let status = insert_res.status();
        let txt = insert_res.text().await.unwrap_or_default();
        let code = if status.as_u16() == 401 || status.as_u16() == 403 {
            StatusCode::FORBIDDEN
        } else {
            StatusCode::BAD_REQUEST
        };
        return Ok((
            code,
            Json(serde_json::json!({
                "code": "INSERT_FAILED",
                "message": "No se pudo crear la cita.",
                "details": txt,
            })),
        ));
    }

    let inserted: Value = insert_res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("insert body: {e}")))?;

    let row = inserted
        .as_array()
        .and_then(|a| a.first().cloned())
        .unwrap_or(inserted);

    Ok((StatusCode::CREATED, Json(serde_json::json!({ "data": row }))))
}

// ---------------------------------------------------------------
// Appointments — GET /v1/appointments
// ---------------------------------------------------------------
#[derive(Debug, Deserialize)]
pub struct ListAppointmentsQuery {
    pub status: Option<String>,
    pub from: Option<String>, // ISO-8601
    pub to: Option<String>,   // ISO-8601
    pub page: Option<u32>,
    pub page_size: Option<u32>,
}

pub async fn list_appointments(
    State(state): State<AppState>,
    crate::middleware::AuthClaims(claims): crate::middleware::AuthClaims,
    Query(q): Query<ListAppointmentsQuery>,
    headers: axum::http::HeaderMap,
) -> Result<Json<Value>, AppError> {
    let page = q.page.unwrap_or(1).max(1);
    let page_size = q.page_size.unwrap_or(20).clamp(1, 100);
    let from = (page - 1) * page_size;
    let to = from + page_size - 1;

    let select = "id,doctor_id,patient_id,scheduled_at,duration_minutes,reason,\
notes,status,appointment_type,price,location_id,created_at,updated_at";

    let mut url = format!(
        "{}/rest/v1/appointments?select={}",
        state.inner.supabase_url, select
    );

    // Either party can list — RLS filters by visibility, but we hint
    // PostgREST so the planner can use indexes too.
    url.push_str(&format!(
        "&or=(patient_id.eq.{0},doctor_id.eq.{0})",
        urlencoding::encode(&claims.sub)
    ));

    if let Some(s) = &q.status {
        url.push_str(&format!("&status=eq.{}", urlencoding::encode(s)));
    }
    if let Some(f) = &q.from {
        url.push_str(&format!("&scheduled_at=gte.{}", urlencoding::encode(f)));
    }
    if let Some(t) = &q.to {
        url.push_str(&format!("&scheduled_at=lte.{}", urlencoding::encode(t)));
    }
    url.push_str("&order=scheduled_at.desc");

    let res = state
        .inner
        .http
        .get(&url)
        .header("apikey", &state.inner.supabase_anon_key)
        .header(
            "Authorization",
            forwarded_auth(&headers, &state.inner.supabase_anon_key),
        )
        .header("Range", format!("{}-{}", from, to))
        .header("Prefer", "count=exact")
        .send()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("list appointments: {e}")))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(AppError::Internal(anyhow::anyhow!(
            "appointments list {} {}",
            status,
            body
        )));
    }

    let total = parse_content_range_total(res.headers().get("content-range")).unwrap_or(0);
    let total_pages = if total == 0 {
        0
    } else {
        ((total as f64) / (page_size as f64)).ceil() as u64
    };
    let data: Value = res
        .json()
        .await
        .map_err(|e| AppError::Internal(anyhow::anyhow!("appointments body: {e}")))?;

    Ok(Json(serde_json::json!({
        "data": data,
        "pagination": {
            "page": page,
            "pageSize": page_size,
            "total": total,
            "totalPages": total_pages,
        }
    })))
}

/// Forward the inbound `Authorization` header to PostgREST so RLS sees the
/// real user. Falls back to anon if missing (which middleware should prevent
/// for protected routes).
fn forwarded_auth(headers: &axum::http::HeaderMap, anon: &str) -> String {
    headers
        .get(axum::http::header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string())
        .unwrap_or_else(|| format!("Bearer {anon}"))
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
