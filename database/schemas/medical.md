# Medical / Doctor Domain

Tables for doctor profiles, appointments, scheduling, prescriptions, consultations, and the doctor verification system.

## Doctor Profiles

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `medical_specialties` | Catalog of medical specialties | `id`, `name`, `description` |
| `specialties` | Extended specialty catalog | `id`, `name`, `description`, `icon` |
| `doctor_profiles` | Extended doctor info (beyond profiles) | `id` (user_id), `specialty_id`, `license_number`, `university`, `bio` |
| `doctor_details` | Additional doctor metadata | `id`, `doctor_id`, `subespecialidades`, professional info fields |
| `doctor_documents` | Uploaded doctor credentials/certificates | `id`, `doctor_id`, `file_path`, `document_type` |
| `doctor_settings` | Doctor app preferences (consultation, notifications) | `doctor_id`, `settings` (jsonb) |
| `doctor_reviews` | Patient reviews/ratings for doctors | `id`, `doctor_id`, `patient_id`, `rating`, `comment` |
| `doctor_goals` | Doctor's personal/professional goals | `doctor_id`, `title`, `target`, `progress` |
| `doctor_stats_cache` | Cached aggregate doctor statistics | `doctor_id`, `total_patients`, `total_consultations` |
| `office_photos` | Photos of doctor offices | `id`, `doctor_id`, `url` |
| `doctor_secretaries` | Doctor-secretary relationships | `doctor_id`, `secretary_id` |
| `doctor_widget_modes` | Dashboard widget configuration per doctor | `doctor_id`, `widget_id`, `mode` |

## Scheduling

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `doctor_schedules` | Weekly availability templates | `doctor_id`, `day_of_week`, `start_time`, `end_time` |
| `doctor_availability` | Specific availability windows | `doctor_id`, `date`, `start_time`, `end_time` |
| `doctor_availability_exceptions` | Blocked dates/vacations | `doctor_id`, `date`, `reason` |
| `doctor_time_blocks` | Time-blocked slots | `doctor_id`, `start`, `end`, `reason` |
| `doctor_locations` | Office/location addresses | `doctor_id`, `name`, `address`, `coordinates` |
| `doctor_service_prices` | Service pricing per doctor/location | `doctor_id`, `service_name`, `price` |

## Appointments

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `appointments` | Scheduled appointments | `id`, `medico_id`, `paciente_id`, `fecha_hora`, `status` |
| `appointment_notes` | Clinical notes per appointment | `appointment_id`, `note_type`, `content` |
| `appointment_queue` | Real-time waiting queue | `appointment_id`, `position`, `called_at` |
| `smart_waitlist` | Smart waitlist with priority/scoring | `id`, `patient_id`, `doctor_id`, `priority`, `status` |
| `daily_team_checklist` | Daily operational checklists | `id`, `doctor_id`, `date`, `items` |

## Prescriptions

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `prescriptions` | Issued prescriptions | `id`, `doctor_id`, `patient_id`, `date` |
| `prescription_items` | Line items in a prescription | `prescription_id`, `medication`, `dosage`, `frequency` |
| `prescription_templates` | Reusable prescription templates | `id`, `doctor_id`, `name`, `items` |
| `doctor_signatures` | Digital signature images for prescriptions | `doctor_id`, `signature_data` |
| `prescription_scans` | Scanned paper prescriptions | `id`, `prescription_id`, `file_url` |
| `prescription_prints` | Print history for prescriptions | `prescription_id`, `printed_at` |
| `doctor_recipe_settings` | Recipe/prescription header/footer config | `doctor_id`, `header`, `footer`, `logo_url` |
| `prescription_frames` | Visual frames for prescription PDFs | `id`, `name`, `template` |
| `prescription_watermarks` | Watermark settings for prescriptions | `id`, `doctor_id`, `text`, `opacity` |

## Verification (SACS)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `verificaciones_sacs` | SACS verification results cache | `doctor_id`, `cedula`, `status`, `verified_at` |
| `doctor_verifications_cache` | Cached verification data | `doctor_id`, `data`, `fetched_at` |
| `professional_verifications` | Multi-level verification system | `id`, `doctor_id`, `level`, `status`, `verified_by` |
| `verification_documents` | Documents submitted for verification | `id`, `verification_id`, `file_url`, `type` |
| `verification_history` | Audit trail of verification changes | `id`, `verification_id`, `action`, `changed_by` |
| `sacs_specialty_mapping` | Maps SACS specialty codes to internal IDs | `sacs_code`, `specialty_id` |

## Consultations & Suggestions

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `consultations` | Completed consultation records | `id`, `doctor_id`, `patient_id`, `diagnosis`, `notes` |
| `medical_notes` | Free-form medical notes | `id`, `doctor_id`, `patient_id`, `content` |
| `specialty_consultation_reasons` | Common reasons per specialty | `specialty_id`, `reason`, `frequency` |
| `doctor_reason_usage` | Per-doctor consultation reason tracking | `doctor_id`, `reason`, `count` |
| `soap_notes` | SOAP-format clinical notes | `id`, `appointment_id`, `subjective`, `objective`, `assessment`, `plan` |
| `soap_templates` | Reusable SOAP note templates | `id`, `doctor_id`, `name`, `template` |

## Analytics

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `doctor_revenue_analytics` | Revenue metrics per doctor | `doctor_id`, `period`, `revenue`, `consultations` |
| `doctor_productivity_metrics` | Productivity KPIs | `doctor_id`, `metric`, `value`, `period` |

## Migrations

- `004_create_appointments_system.sql`
- `009_create_doctors_system.sql`
- `010_create_doctor_verifications_cache.sql`
- `012_create_verificaciones_sacs_table.sql`
- `013_create_doctor_system_complete.sql`
- `20241113000001_add_secretary_role.sql`
- `20241113000002_enhance_appointments_for_calendar.sql`
- `20241114000001_add_locations_and_payment.sql`
- `20250119000001_create_doctor_widget_modes.sql`
- `20250119000002_create_analytics_tables.sql`
- `20260104000001_create_doctor_goals.sql`
- `20260104000003_enrich_doctor_offices.sql`
- `20260127000001_create_advanced_prescription_system.sql`
- `20260203000001_smart_suggestions.sql`
- `20260204000000_add_recipe_template_fields.sql`
- `20260205000002_create_doctor_settings_tables.sql`
- `20260213000000_add_professional_info_fields.sql`
- `20260213000001_setup_doctor_storage.sql`
- `20260213140000_dental_features_complete.sql` (SOAP notes, waitlist shared)
- `20260213160000_daily_team_checklist.sql`
- `20260214000000_create_professional_verification_system.sql`
- `20260214000100_signature_system.sql`
- `20260215000000_sync_doctor_specialty_from_sacs_on_admin_approval.sql`
- `20260215100008_sacs_specialty_mapping.sql`
