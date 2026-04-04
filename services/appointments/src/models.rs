use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ─── Enums ──────────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, sqlx::Type, PartialEq)]
#[sqlx(type_name = "text", rename_all = "snake_case")]
#[serde(rename_all = "snake_case")]
pub enum AppointmentStatus {
    Pending,
    Confirmed,
    Completed,
    Cancelled,
    Waiting,
    InProgress,
    NoShow,
}

impl AppointmentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Confirmed => "confirmed",
            Self::Completed => "completed",
            Self::Cancelled => "cancelled",
            Self::Waiting => "waiting",
            Self::InProgress => "in_progress",
            Self::NoShow => "no_show",
        }
    }

    pub fn from_str(s: &str) -> Option<Self> {
        match s {
            "pending" => Some(Self::Pending),
            "confirmed" => Some(Self::Confirmed),
            "completed" => Some(Self::Completed),
            "cancelled" => Some(Self::Cancelled),
            "waiting" => Some(Self::Waiting),
            "in_progress" => Some(Self::InProgress),
            "no_show" => Some(Self::NoShow),
            _ => None,
        }
    }

    /// Validates whether a status transition is allowed.
    /// Returns true if the transition from `self` to `target` is valid.
    pub fn can_transition_to(&self, target: &Self) -> bool {
        matches!(
            (self, target),
            // From pending
            (Self::Pending, Self::Confirmed)
                | (Self::Pending, Self::Cancelled)
                | (Self::Pending, Self::Waiting)
                // From confirmed
                | (Self::Confirmed, Self::Waiting)
                | (Self::Confirmed, Self::InProgress)
                | (Self::Confirmed, Self::Cancelled)
                | (Self::Confirmed, Self::NoShow)
                // From waiting
                | (Self::Waiting, Self::InProgress)
                | (Self::Waiting, Self::Cancelled)
                | (Self::Waiting, Self::NoShow)
                // From in_progress
                | (Self::InProgress, Self::Completed)
                | (Self::InProgress, Self::Cancelled)
        )
    }
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum AppointmentType {
    InPerson,
    Telemedicine,
    Emergency,
    FollowUp,
    FirstVisit,
}

impl AppointmentType {
    #[allow(dead_code)]
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::InPerson => "in_person",
            Self::Telemedicine => "telemedicine",
            Self::Emergency => "emergency",
            Self::FollowUp => "follow_up",
            Self::FirstVisit => "first_visit",
        }
    }
}

// ─── Appointment ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct Appointment {
    pub id: Uuid,
    pub patient_id: Uuid,
    pub doctor_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_minutes: i32,
    pub status: String,
    pub appointment_type: Option<String>,
    pub reason: Option<String>,
    pub internal_notes: Option<String>,
    pub payment_method: Option<String>,
    pub payment_status: Option<String>,
    pub price: Option<f64>,
    pub meeting_url: Option<String>,
    pub send_reminder: Option<bool>,
    pub location_id: Option<Uuid>,
    pub google_event_id: Option<String>,
    pub buffer_before_min: Option<i32>,
    pub buffer_after_min: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
}

/// Extended appointment with patient and doctor name from JOIN.
#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct AppointmentWithNames {
    pub id: Uuid,
    pub patient_id: Uuid,
    pub doctor_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_minutes: i32,
    pub status: String,
    pub appointment_type: Option<String>,
    pub reason: Option<String>,
    pub internal_notes: Option<String>,
    pub payment_method: Option<String>,
    pub payment_status: Option<String>,
    pub price: Option<f64>,
    pub meeting_url: Option<String>,
    pub send_reminder: Option<bool>,
    pub location_id: Option<Uuid>,
    pub google_event_id: Option<String>,
    pub buffer_before_min: Option<i32>,
    pub buffer_after_min: Option<i32>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    pub deleted_at: Option<DateTime<Utc>>,
    pub patient_name: Option<String>,
    pub doctor_name: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateAppointmentRequest {
    pub patient_id: Uuid,
    pub doctor_id: Uuid,
    pub scheduled_at: DateTime<Utc>,
    pub duration_minutes: Option<i32>,
    pub appointment_type: Option<String>,
    pub reason: Option<String>,
    pub internal_notes: Option<String>,
    pub payment_method: Option<String>,
    pub price: Option<f64>,
    pub meeting_url: Option<String>,
    pub send_reminder: Option<bool>,
    pub location_id: Option<Uuid>,
    pub buffer_before_min: Option<i32>,
    pub buffer_after_min: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateAppointmentRequest {
    pub scheduled_at: Option<DateTime<Utc>>,
    pub duration_minutes: Option<i32>,
    pub appointment_type: Option<String>,
    pub reason: Option<String>,
    pub internal_notes: Option<String>,
    pub payment_method: Option<String>,
    pub payment_status: Option<String>,
    pub price: Option<f64>,
    pub meeting_url: Option<String>,
    pub send_reminder: Option<bool>,
    pub location_id: Option<Uuid>,
    pub google_event_id: Option<String>,
    pub buffer_before_min: Option<i32>,
    pub buffer_after_min: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct StatusChangeRequest {
    pub status: String,
}

#[derive(Debug, Deserialize)]
pub struct AppointmentFilter {
    pub doctor_id: Option<Uuid>,
    pub patient_id: Option<Uuid>,
    pub status: Option<String>,
    pub from: Option<DateTime<Utc>>,
    pub to: Option<DateTime<Utc>>,
    pub page: Option<i64>,
    pub per_page: Option<i64>,
}

// ─── Weekly Schedule Template ───────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WeeklyScheduleTemplate {
    pub id: Uuid,
    pub doctor_id: Uuid,
    pub day_of_week: i32,
    pub slots: Option<serde_json::Value>,
    pub breaks: Option<serde_json::Value>,
    pub buffer_after_mins: Option<i32>,
    pub max_appointments: Option<i32>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
pub struct UpsertScheduleRequest {
    pub schedules: Vec<ScheduleDayEntry>,
}

#[derive(Debug, Deserialize)]
pub struct ScheduleDayEntry {
    pub day_of_week: i32,
    pub slots: serde_json::Value,
    pub breaks: Option<serde_json::Value>,
    pub buffer_after_mins: Option<i32>,
    pub max_appointments: Option<i32>,
    pub is_active: Option<bool>,
}

// ─── Time Blocks ────────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct TimeBlock {
    pub id: Uuid,
    pub doctor_id: Uuid,
    pub block_type: Option<String>,
    pub title: Option<String>,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub all_day: Option<bool>,
    pub is_recurring: Option<bool>,
    pub recurrence_rule: Option<String>,
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct CreateTimeBlockRequest {
    pub block_type: Option<String>,
    pub title: Option<String>,
    pub starts_at: DateTime<Utc>,
    pub ends_at: DateTime<Utc>,
    pub all_day: Option<bool>,
    pub is_recurring: Option<bool>,
    pub recurrence_rule: Option<String>,
    pub notes: Option<String>,
}

// ─── Availability ───────────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct AvailabilityQuery {
    pub from: DateTime<Utc>,
    pub to: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AvailableSlot {
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

#[derive(Debug, Serialize)]
pub struct AvailabilityResponse {
    pub doctor_id: Uuid,
    pub consultation_duration_minutes: i32,
    pub slots: Vec<AvailableSlot>,
}

// ─── Slot definition inside weekly_schedule_template.slots JSONB ────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleSlot {
    pub start: String, // "HH:MM" format
    pub end: String,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleBreak {
    pub start: String,
    pub end: String,
}

// ─── Pagination wrapper ─────────────────────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct PaginatedResponse<T: Serialize> {
    pub data: Vec<T>,
    pub total: i64,
    pub page: i64,
    pub per_page: i64,
}
