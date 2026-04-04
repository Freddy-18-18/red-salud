use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    Json,
};
use chrono::{DateTime, Datelike, Duration, NaiveTime, TimeZone, Utc};
use sqlx::PgPool;
use uuid::Uuid;

use crate::error::AppError;
use crate::models::*;

type Result<T> = std::result::Result<T, AppError>;

// ─── Appointments CRUD ──────────────────────────────────────────────────────

/// GET /api/v1/appointments?doctor_id=&patient_id=&status=&from=&to=&page=&per_page=
pub async fn list_appointments(
    State(pool): State<PgPool>,
    Query(filter): Query<AppointmentFilter>,
) -> Result<Json<PaginatedResponse<AppointmentWithNames>>> {
    let page = filter.page.unwrap_or(1).max(1);
    let per_page = filter.per_page.unwrap_or(20).clamp(1, 100);
    let offset = (page - 1) * per_page;

    // Build dynamic query with filters
    let mut conditions = vec!["a.deleted_at IS NULL".to_string()];
    let mut bind_idx = 0u32;

    if filter.doctor_id.is_some() {
        bind_idx += 1;
        conditions.push(format!("a.doctor_id = ${bind_idx}"));
    }
    if filter.patient_id.is_some() {
        bind_idx += 1;
        conditions.push(format!("a.patient_id = ${bind_idx}"));
    }
    if filter.status.is_some() {
        bind_idx += 1;
        conditions.push(format!("a.status = ${bind_idx}"));
    }
    if filter.from.is_some() {
        bind_idx += 1;
        conditions.push(format!("a.scheduled_at >= ${bind_idx}"));
    }
    if filter.to.is_some() {
        bind_idx += 1;
        conditions.push(format!("a.scheduled_at < ${bind_idx}"));
    }

    let where_clause = conditions.join(" AND ");

    let count_sql = format!(
        "SELECT COUNT(*) as count FROM appointments a WHERE {where_clause}"
    );
    let data_sql = format!(
        r#"
        SELECT
            a.id, a.patient_id, a.doctor_id, a.scheduled_at, a.duration_minutes,
            a.status, a.appointment_type, a.reason, a.internal_notes,
            a.payment_method, a.payment_status, a.price::float8 as price, a.meeting_url,
            a.send_reminder, a.location_id, a.google_event_id,
            a.buffer_before_min, a.buffer_after_min,
            a.created_at, a.updated_at, a.deleted_at,
            pp.nombre_completo as patient_name,
            pd.nombre_completo as doctor_name
        FROM appointments a
        LEFT JOIN profiles pp ON a.patient_id = pp.id
        LEFT JOIN profiles pd ON a.doctor_id = pd.id
        WHERE {where_clause}
        ORDER BY a.scheduled_at DESC
        LIMIT ${} OFFSET ${}
        "#,
        bind_idx + 1,
        bind_idx + 2,
    );

    // We need to bind parameters dynamically. Since sqlx doesn't support
    // truly dynamic binding with format strings, we use query_as with raw SQL
    // and manually bind.

    // Count query
    let mut count_query = sqlx::query_scalar::<_, i64>(&count_sql);
    if let Some(ref doctor_id) = filter.doctor_id {
        count_query = count_query.bind(doctor_id);
    }
    if let Some(ref patient_id) = filter.patient_id {
        count_query = count_query.bind(patient_id);
    }
    if let Some(ref status) = filter.status {
        count_query = count_query.bind(status);
    }
    if let Some(ref from) = filter.from {
        count_query = count_query.bind(from);
    }
    if let Some(ref to) = filter.to {
        count_query = count_query.bind(to);
    }

    let total = count_query.fetch_one(&pool).await?;

    // Data query
    let mut data_query = sqlx::query_as::<_, AppointmentWithNames>(&data_sql);
    if let Some(ref doctor_id) = filter.doctor_id {
        data_query = data_query.bind(doctor_id);
    }
    if let Some(ref patient_id) = filter.patient_id {
        data_query = data_query.bind(patient_id);
    }
    if let Some(ref status) = filter.status {
        data_query = data_query.bind(status);
    }
    if let Some(ref from) = filter.from {
        data_query = data_query.bind(from);
    }
    if let Some(ref to) = filter.to {
        data_query = data_query.bind(to);
    }
    data_query = data_query.bind(per_page).bind(offset);

    let data = data_query.fetch_all(&pool).await?;

    tracing::debug!(total, page, per_page, "Listed appointments");

    Ok(Json(PaginatedResponse {
        data,
        total,
        page,
        per_page,
    }))
}

/// POST /api/v1/appointments
pub async fn create_appointment(
    State(pool): State<PgPool>,
    Json(req): Json<CreateAppointmentRequest>,
) -> Result<(StatusCode, Json<Appointment>)> {
    // Validate appointment_type if provided
    if let Some(ref apt_type) = req.appointment_type {
        let valid = ["in_person", "telemedicine", "emergency", "follow_up", "first_visit"];
        if !valid.contains(&apt_type.as_str()) {
            return Err(AppError::BadRequest(format!(
                "Invalid appointment_type '{}'. Must be one of: {}",
                apt_type,
                valid.join(", ")
            )));
        }
    }

    // Validate payment_method if provided
    if let Some(ref pm) = req.payment_method {
        let valid = ["cash", "transfer", "card", "insurance", "mobile_payment", "pending"];
        if !valid.contains(&pm.as_str()) {
            return Err(AppError::BadRequest(format!(
                "Invalid payment_method '{}'. Must be one of: {}",
                pm,
                valid.join(", ")
            )));
        }
    }

    let duration = req.duration_minutes.unwrap_or(30);

    // Check for conflicts: overlapping appointments for the same doctor
    let conflict_count = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) FROM appointments
        WHERE doctor_id = $1
          AND deleted_at IS NULL
          AND status NOT IN ('cancelled', 'no_show')
          AND (
            (scheduled_at < $2 + make_interval(mins => $3) AND scheduled_at + make_interval(mins => duration_minutes) > $2)
          )
        "#,
    )
    .bind(req.doctor_id)
    .bind(req.scheduled_at)
    .bind(duration)
    .fetch_one(&pool)
    .await?;

    if conflict_count > 0 {
        return Err(AppError::Conflict(
            "The requested time slot conflicts with an existing appointment".into(),
        ));
    }

    // Check time block conflicts
    let block_conflict = sqlx::query_scalar::<_, i64>(
        r#"
        SELECT COUNT(*) FROM time_blocks
        WHERE doctor_id = $1
          AND (
            (starts_at < $2 + make_interval(mins => $3) AND ends_at > $2)
          )
        "#,
    )
    .bind(req.doctor_id)
    .bind(req.scheduled_at)
    .bind(duration)
    .fetch_one(&pool)
    .await?;

    if block_conflict > 0 {
        return Err(AppError::Conflict(
            "The requested time slot is blocked by the doctor".into(),
        ));
    }

    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        INSERT INTO appointments (
            patient_id, doctor_id, scheduled_at, duration_minutes, status,
            appointment_type, reason, internal_notes, payment_method,
            payment_status, price, meeting_url, send_reminder, location_id,
            buffer_before_min, buffer_after_min
        ) VALUES (
            $1, $2, $3, $4, 'pending',
            $5, $6, $7, $8,
            'pending', $9, $10, $11, $12,
            $13, $14
        )
        RETURNING
            id, patient_id, doctor_id, scheduled_at, duration_minutes,
            status, appointment_type, reason, internal_notes,
            payment_method, payment_status, price::float8 as price, meeting_url,
            send_reminder, location_id, google_event_id,
            buffer_before_min, buffer_after_min,
            created_at, updated_at, deleted_at
        "#,
    )
    .bind(req.patient_id)
    .bind(req.doctor_id)
    .bind(req.scheduled_at)
    .bind(duration)
    .bind(&req.appointment_type)
    .bind(&req.reason)
    .bind(&req.internal_notes)
    .bind(&req.payment_method)
    .bind(req.price)
    .bind(&req.meeting_url)
    .bind(req.send_reminder.unwrap_or(true))
    .bind(req.location_id)
    .bind(req.buffer_before_min.unwrap_or(0))
    .bind(req.buffer_after_min.unwrap_or(0))
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        appointment_id = %appointment.id,
        doctor_id = %appointment.doctor_id,
        patient_id = %appointment.patient_id,
        "Appointment created"
    );

    Ok((StatusCode::CREATED, Json(appointment)))
}

/// GET /api/v1/appointments/:id
pub async fn get_appointment(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<AppointmentWithNames>> {
    let appointment = sqlx::query_as::<_, AppointmentWithNames>(
        r#"
        SELECT
            a.id, a.patient_id, a.doctor_id, a.scheduled_at, a.duration_minutes,
            a.status, a.appointment_type, a.reason, a.internal_notes,
            a.payment_method, a.payment_status, a.price::float8 as price, a.meeting_url,
            a.send_reminder, a.location_id, a.google_event_id,
            a.buffer_before_min, a.buffer_after_min,
            a.created_at, a.updated_at, a.deleted_at,
            pp.nombre_completo as patient_name,
            pd.nombre_completo as doctor_name
        FROM appointments a
        LEFT JOIN profiles pp ON a.patient_id = pp.id
        LEFT JOIN profiles pd ON a.doctor_id = pd.id
        WHERE a.id = $1 AND a.deleted_at IS NULL
        "#,
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Appointment {} not found", id)))?;

    Ok(Json(appointment))
}

/// PUT /api/v1/appointments/:id
pub async fn update_appointment(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<UpdateAppointmentRequest>,
) -> Result<Json<Appointment>> {
    // Verify appointment exists
    let _existing = sqlx::query_scalar::<_, Uuid>(
        "SELECT id FROM appointments WHERE id = $1 AND deleted_at IS NULL",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Appointment {} not found", id)))?;

    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        UPDATE appointments SET
            scheduled_at      = COALESCE($2, scheduled_at),
            duration_minutes  = COALESCE($3, duration_minutes),
            appointment_type  = COALESCE($4, appointment_type),
            reason            = COALESCE($5, reason),
            internal_notes    = COALESCE($6, internal_notes),
            payment_method    = COALESCE($7, payment_method),
            payment_status    = COALESCE($8, payment_status),
            price             = COALESCE($9, price),
            meeting_url       = COALESCE($10, meeting_url),
            send_reminder     = COALESCE($11, send_reminder),
            location_id       = COALESCE($12, location_id),
            google_event_id   = COALESCE($13, google_event_id),
            buffer_before_min = COALESCE($14, buffer_before_min),
            buffer_after_min  = COALESCE($15, buffer_after_min),
            updated_at        = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING
            id, patient_id, doctor_id, scheduled_at, duration_minutes,
            status, appointment_type, reason, internal_notes,
            payment_method, payment_status, price::float8 as price, meeting_url,
            send_reminder, location_id, google_event_id,
            buffer_before_min, buffer_after_min,
            created_at, updated_at, deleted_at
        "#,
    )
    .bind(id)
    .bind(req.scheduled_at)
    .bind(req.duration_minutes)
    .bind(&req.appointment_type)
    .bind(&req.reason)
    .bind(&req.internal_notes)
    .bind(&req.payment_method)
    .bind(&req.payment_status)
    .bind(req.price)
    .bind(&req.meeting_url)
    .bind(req.send_reminder)
    .bind(req.location_id)
    .bind(&req.google_event_id)
    .bind(req.buffer_before_min)
    .bind(req.buffer_after_min)
    .fetch_one(&pool)
    .await?;

    tracing::info!(appointment_id = %id, "Appointment updated");

    Ok(Json(appointment))
}

/// DELETE /api/v1/appointments/:id (soft delete)
pub async fn delete_appointment(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<StatusCode> {
    let rows = sqlx::query(
        "UPDATE appointments SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL",
    )
    .bind(id)
    .execute(&pool)
    .await?
    .rows_affected();

    if rows == 0 {
        return Err(AppError::NotFound(format!("Appointment {} not found", id)));
    }

    tracing::info!(appointment_id = %id, "Appointment soft-deleted");

    Ok(StatusCode::NO_CONTENT)
}

/// PATCH /api/v1/appointments/:id/status
pub async fn change_status(
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(req): Json<StatusChangeRequest>,
) -> Result<Json<Appointment>> {
    let target = AppointmentStatus::from_str(&req.status).ok_or_else(|| {
        AppError::BadRequest(format!("Invalid status '{}'", req.status))
    })?;

    // Fetch current status
    let current_status_str = sqlx::query_scalar::<_, String>(
        "SELECT status FROM appointments WHERE id = $1 AND deleted_at IS NULL",
    )
    .bind(id)
    .fetch_optional(&pool)
    .await?
    .ok_or_else(|| AppError::NotFound(format!("Appointment {} not found", id)))?;

    let current = AppointmentStatus::from_str(&current_status_str).ok_or_else(|| {
        AppError::Internal(anyhow::anyhow!(
            "Unknown status '{}' in database",
            current_status_str
        ))
    })?;

    if !current.can_transition_to(&target) {
        return Err(AppError::BadRequest(format!(
            "Cannot transition from '{}' to '{}'",
            current_status_str, req.status
        )));
    }

    let appointment = sqlx::query_as::<_, Appointment>(
        r#"
        UPDATE appointments SET status = $2, updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING
            id, patient_id, doctor_id, scheduled_at, duration_minutes,
            status, appointment_type, reason, internal_notes,
            payment_method, payment_status, price::float8 as price, meeting_url,
            send_reminder, location_id, google_event_id,
            buffer_before_min, buffer_after_min,
            created_at, updated_at, deleted_at
        "#,
    )
    .bind(id)
    .bind(target.as_str())
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        appointment_id = %id,
        from = %current_status_str,
        to = %req.status,
        "Appointment status changed"
    );

    Ok(Json(appointment))
}

// ─── Doctor Schedule ────────────────────────────────────────────────────────

/// GET /api/v1/doctors/:id/schedule
pub async fn get_doctor_schedule(
    State(pool): State<PgPool>,
    Path(doctor_id): Path<Uuid>,
) -> Result<Json<Vec<WeeklyScheduleTemplate>>> {
    let schedules = sqlx::query_as::<_, WeeklyScheduleTemplate>(
        r#"
        SELECT id, doctor_id, day_of_week, slots, breaks,
               buffer_after_mins, max_appointments, is_active
        FROM weekly_schedule_template
        WHERE doctor_id = $1
        ORDER BY day_of_week
        "#,
    )
    .bind(doctor_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(schedules))
}

/// PUT /api/v1/doctors/:id/schedule
pub async fn update_doctor_schedule(
    State(pool): State<PgPool>,
    Path(doctor_id): Path<Uuid>,
    Json(req): Json<UpsertScheduleRequest>,
) -> Result<Json<Vec<WeeklyScheduleTemplate>>> {
    // Validate day_of_week values
    for entry in &req.schedules {
        if !(0..=6).contains(&entry.day_of_week) {
            return Err(AppError::BadRequest(format!(
                "day_of_week must be 0-6, got {}",
                entry.day_of_week
            )));
        }
    }

    let mut tx = pool.begin().await?;

    // Delete existing schedules for this doctor, then re-insert
    sqlx::query("DELETE FROM weekly_schedule_template WHERE doctor_id = $1")
        .bind(doctor_id)
        .execute(&mut *tx)
        .await?;

    for entry in &req.schedules {
        sqlx::query(
            r#"
            INSERT INTO weekly_schedule_template
                (doctor_id, day_of_week, slots, breaks, buffer_after_mins, max_appointments, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            "#,
        )
        .bind(doctor_id)
        .bind(entry.day_of_week)
        .bind(&entry.slots)
        .bind(&entry.breaks)
        .bind(entry.buffer_after_mins)
        .bind(entry.max_appointments)
        .bind(entry.is_active.unwrap_or(true))
        .execute(&mut *tx)
        .await?;
    }

    tx.commit().await?;

    tracing::info!(doctor_id = %doctor_id, days = req.schedules.len(), "Schedule updated");

    // Re-fetch and return
    let schedules = sqlx::query_as::<_, WeeklyScheduleTemplate>(
        r#"
        SELECT id, doctor_id, day_of_week, slots, breaks,
               buffer_after_mins, max_appointments, is_active
        FROM weekly_schedule_template
        WHERE doctor_id = $1
        ORDER BY day_of_week
        "#,
    )
    .bind(doctor_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(schedules))
}

// ─── Availability ───────────────────────────────────────────────────────────

/// GET /api/v1/doctors/:id/availability?from=&to=
pub async fn get_doctor_availability(
    State(pool): State<PgPool>,
    Path(doctor_id): Path<Uuid>,
    Query(query): Query<AvailabilityQuery>,
) -> Result<Json<AvailabilityResponse>> {
    if query.from >= query.to {
        return Err(AppError::BadRequest(
            "'from' must be before 'to'".into(),
        ));
    }

    // Cap range to 31 days
    let max_range = Duration::days(31);
    if query.to - query.from > max_range {
        return Err(AppError::BadRequest(
            "Date range cannot exceed 31 days".into(),
        ));
    }

    // 1. Get doctor's consultation duration
    let consultation_duration = sqlx::query_scalar::<_, Option<i32>>(
        "SELECT consultation_duration FROM doctor_profiles WHERE profile_id = $1",
    )
    .bind(doctor_id)
    .fetch_optional(&pool)
    .await?
    .flatten()
    .unwrap_or(30);

    // 2. Fetch weekly schedule templates
    let templates = sqlx::query_as::<_, WeeklyScheduleTemplate>(
        r#"
        SELECT id, doctor_id, day_of_week, slots, breaks,
               buffer_after_mins, max_appointments, is_active
        FROM weekly_schedule_template
        WHERE doctor_id = $1 AND is_active = true
        "#,
    )
    .bind(doctor_id)
    .fetch_all(&pool)
    .await?;

    // 3. Fetch existing appointments in range
    let existing_appointments = sqlx::query_as::<_, Appointment>(
        r#"
        SELECT id, patient_id, doctor_id, scheduled_at, duration_minutes,
               status, appointment_type, reason, internal_notes,
               payment_method, payment_status, price::float8 as price, meeting_url,
               send_reminder, location_id, google_event_id,
               buffer_before_min, buffer_after_min,
               created_at, updated_at, deleted_at
        FROM appointments
        WHERE doctor_id = $1
          AND deleted_at IS NULL
          AND status NOT IN ('cancelled', 'no_show')
          AND scheduled_at >= $2
          AND scheduled_at < $3
        "#,
    )
    .bind(doctor_id)
    .bind(query.from)
    .bind(query.to)
    .fetch_all(&pool)
    .await?;

    // 4. Fetch time blocks in range
    let time_blocks = sqlx::query_as::<_, TimeBlock>(
        r#"
        SELECT id, doctor_id, block_type, title, starts_at, ends_at,
               all_day, is_recurring, recurrence_rule, notes
        FROM time_blocks
        WHERE doctor_id = $1
          AND starts_at < $3
          AND ends_at > $2
        "#,
    )
    .bind(doctor_id)
    .bind(query.from)
    .bind(query.to)
    .fetch_all(&pool)
    .await?;

    // 5. Generate available slots
    let slots = compute_available_slots(
        &templates,
        &existing_appointments,
        &time_blocks,
        consultation_duration,
        query.from,
        query.to,
    );

    Ok(Json(AvailabilityResponse {
        doctor_id,
        consultation_duration_minutes: consultation_duration,
        slots,
    }))
}

/// Computes available time slots by:
/// 1. Generating candidate slots from weekly templates for each day in range
/// 2. Subtracting existing appointments
/// 3. Subtracting time blocks
fn compute_available_slots(
    templates: &[WeeklyScheduleTemplate],
    appointments: &[Appointment],
    blocks: &[TimeBlock],
    consultation_duration: i32,
    from: DateTime<Utc>,
    to: DateTime<Utc>,
) -> Vec<AvailableSlot> {
    let mut available = Vec::new();
    let duration = Duration::minutes(consultation_duration as i64);

    // Iterate day by day
    let mut current_day = from.date_naive();
    let end_day = to.date_naive();

    while current_day <= end_day {
        let weekday = current_day.weekday().num_days_from_sunday() as i32;

        // Find template for this day of week
        for template in templates.iter().filter(|t| t.day_of_week == weekday) {
            let slots: Vec<ScheduleSlot> = template
                .slots
                .as_ref()
                .and_then(|v| serde_json::from_value(v.clone()).ok())
                .unwrap_or_default();

            for slot in &slots {
                let start_time = match NaiveTime::parse_from_str(&slot.start, "%H:%M") {
                    Ok(t) => t,
                    Err(_) => continue,
                };
                let end_time = match NaiveTime::parse_from_str(&slot.end, "%H:%M") {
                    Ok(t) => t,
                    Err(_) => continue,
                };

                // Generate consultation-sized slots within this time window
                let mut slot_start = current_day.and_time(start_time);
                let slot_end = current_day.and_time(end_time);

                while slot_start + duration <= slot_end {
                    let candidate_start = Utc
                        .from_local_datetime(&slot_start)
                        .single()
                        .unwrap_or_else(|| DateTime::<Utc>::from_naive_utc_and_offset(slot_start, Utc));
                    let candidate_end = candidate_start + duration;

                    // Skip slots in the past
                    if candidate_start < from {
                        slot_start = slot_start + duration;
                        continue;
                    }
                    // Skip slots beyond range
                    if candidate_start >= to {
                        break;
                    }

                    // Check appointment conflicts
                    let has_appointment_conflict = appointments.iter().any(|apt| {
                        let apt_end =
                            apt.scheduled_at + Duration::minutes(apt.duration_minutes as i64);
                        apt.scheduled_at < candidate_end && apt_end > candidate_start
                    });

                    // Check time block conflicts
                    let has_block_conflict = blocks.iter().any(|b| {
                        b.starts_at < candidate_end && b.ends_at > candidate_start
                    });

                    if !has_appointment_conflict && !has_block_conflict {
                        available.push(AvailableSlot {
                            start: candidate_start,
                            end: candidate_end,
                        });
                    }

                    slot_start = slot_start + duration;
                }
            }
        }

        current_day = current_day
            .succ_opt()
            .unwrap_or(current_day);
    }

    available
}

// ─── Time Blocks ────────────────────────────────────────────────────────────

/// GET /api/v1/doctors/:id/time-blocks
pub async fn list_time_blocks(
    State(pool): State<PgPool>,
    Path(doctor_id): Path<Uuid>,
) -> Result<Json<Vec<TimeBlock>>> {
    let blocks = sqlx::query_as::<_, TimeBlock>(
        r#"
        SELECT id, doctor_id, block_type, title, starts_at, ends_at,
               all_day, is_recurring, recurrence_rule, notes
        FROM time_blocks
        WHERE doctor_id = $1
        ORDER BY starts_at
        "#,
    )
    .bind(doctor_id)
    .fetch_all(&pool)
    .await?;

    Ok(Json(blocks))
}

/// POST /api/v1/doctors/:id/time-blocks
pub async fn create_time_block(
    State(pool): State<PgPool>,
    Path(doctor_id): Path<Uuid>,
    Json(req): Json<CreateTimeBlockRequest>,
) -> Result<(StatusCode, Json<TimeBlock>)> {
    if req.starts_at >= req.ends_at {
        return Err(AppError::BadRequest(
            "'starts_at' must be before 'ends_at'".into(),
        ));
    }

    // Validate block_type
    if let Some(ref bt) = req.block_type {
        let valid = [
            "block", "lunch", "meeting", "vacation", "emergency", "preparation", "administrative",
        ];
        if !valid.contains(&bt.as_str()) {
            return Err(AppError::BadRequest(format!(
                "Invalid block_type '{}'. Must be one of: {}",
                bt,
                valid.join(", ")
            )));
        }
    }

    let block = sqlx::query_as::<_, TimeBlock>(
        r#"
        INSERT INTO time_blocks
            (doctor_id, block_type, title, starts_at, ends_at,
             all_day, is_recurring, recurrence_rule, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id, doctor_id, block_type, title, starts_at, ends_at,
                  all_day, is_recurring, recurrence_rule, notes
        "#,
    )
    .bind(doctor_id)
    .bind(req.block_type.as_deref().unwrap_or("block"))
    .bind(&req.title)
    .bind(req.starts_at)
    .bind(req.ends_at)
    .bind(req.all_day.unwrap_or(false))
    .bind(req.is_recurring.unwrap_or(false))
    .bind(&req.recurrence_rule)
    .bind(&req.notes)
    .fetch_one(&pool)
    .await?;

    tracing::info!(
        block_id = %block.id,
        doctor_id = %doctor_id,
        "Time block created"
    );

    Ok((StatusCode::CREATED, Json(block)))
}

/// DELETE /api/v1/doctors/:id/time-blocks/:block_id
pub async fn delete_time_block(
    State(pool): State<PgPool>,
    Path((doctor_id, block_id)): Path<(Uuid, Uuid)>,
) -> Result<StatusCode> {
    let rows = sqlx::query("DELETE FROM time_blocks WHERE id = $1 AND doctor_id = $2")
        .bind(block_id)
        .bind(doctor_id)
        .execute(&pool)
        .await?
        .rows_affected();

    if rows == 0 {
        return Err(AppError::NotFound(format!(
            "Time block {} not found for doctor {}",
            block_id, doctor_id
        )));
    }

    tracing::info!(block_id = %block_id, doctor_id = %doctor_id, "Time block deleted");

    Ok(StatusCode::NO_CONTENT)
}
