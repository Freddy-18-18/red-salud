# Dental Domain

Tables specific to dental/odontology specialties, including clinical findings, periodontograma, treatment plans, dental imaging, RCM, and growth campaigns.

## Clinical Core

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dental_clinical_findings` | Per-tooth clinical findings | `id`, `patient_id`, `tooth_number`, `finding_type`, `severity` |
| `dental_perio_chart_entries` | Periodontal charting data | `id`, `patient_id`, `tooth_number`, `pocket_depth`, `recession` |
| `dental_perio_exams` | Periodontal exam sessions | `id`, `patient_id`, `exam_date`, `teeth` (jsonb) |
| `dental_treatment_plans` | Treatment plan headers | `id`, `patient_id`, `doctor_id`, `status`, `total_cost` |
| `dental_treatment_plan_items` | Individual procedures in a plan | `id`, `plan_id`, `tooth_number`, `procedure`, `cost` |
| `dental_imaging_studies` | Dental imaging records (X-ray, CBCT) | `id`, `patient_id`, `study_type`, `file_url` |
| `dental_ai_findings` | AI-detected findings from images | `id`, `study_id`, `finding`, `confidence` |

## Appointments & Chairs

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dental_chairs` | Physical dental chairs/units | `id`, `name`, `location`, `is_active` |
| `dental_appointment_details` | Dental-specific appointment metadata | `appointment_id`, `chair_id`, `procedures`, `tooth_numbers` |
| `dental_procedure_catalog` | Catalog of dental procedures with codes | `id`, `code`, `name`, `category`, `default_fee` |

## Insurance & Memberships

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `insurance_plans` | Insurance plan definitions | `id`, `name`, `payer`, `coverage_details` |
| `insurance_claims` | Filed insurance claims | `id`, `patient_id`, `plan_id`, `amount`, `status` |
| `membership_plans` | In-house membership/discount plans | `id`, `name`, `price`, `benefits` |
| `membership_subscriptions` | Patient membership enrollments | `id`, `patient_id`, `plan_id`, `status`, `expires_at` |

## Estimates & Lab

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `treatment_estimates` | Cost estimates for proposed treatment | `id`, `patient_id`, `doctor_id`, `total`, `status` |
| `treatment_estimate_items` | Line items in an estimate | `id`, `estimate_id`, `procedure`, `tooth`, `fee` |
| `dental_labs` | External dental laboratories | `id`, `name`, `contact`, `specializations` |
| `lab_cases` | Lab cases sent to external labs | `id`, `lab_id`, `patient_id`, `case_type`, `status` |
| `lab_case_events` | Status updates for lab cases | `id`, `case_id`, `event_type`, `timestamp` |

## Imaging & Monitoring

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `diagnostic_images` | General diagnostic image storage | `id`, `patient_id`, `image_type`, `file_url` |
| `dicom_studies` | DICOM-format imaging studies | `id`, `patient_id`, `study_uid`, `modality` |
| `call_records` | Tele-dentistry call records | `id`, `doctor_id`, `patient_id`, `duration`, `type` |
| `remote_monitoring_cases` | Remote patient monitoring cases | `id`, `patient_id`, `doctor_id`, `condition`, `status` |
| `monitoring_submissions` | Patient-submitted monitoring data | `id`, `case_id`, `data`, `submitted_at` |
| `monitoring_alerts` | Alerts triggered by monitoring data | `id`, `case_id`, `alert_type`, `severity` |

## RCM (Revenue Cycle Management)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dental_eligibility_checks` | Insurance eligibility verification | `id`, `patient_id`, `plan_id`, `result`, `checked_at` |
| `dental_claim_lifecycle_events` | Claim status change history | `id`, `claim_id`, `event`, `timestamp` |
| `dental_rcm_work_queues` | Work queues for claim processing | `id`, `claim_id`, `queue_type`, `priority` |

## Growth & Marketing

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dental_growth_segments` | Patient segments for campaigns | `id`, `name`, `criteria`, `patient_count` |
| `dental_growth_campaigns` | Marketing campaigns | `id`, `name`, `segment_id`, `channel`, `status` |
| `dental_growth_campaign_events` | Campaign delivery/open events | `id`, `campaign_id`, `event_type`, `timestamp` |

## Migrations

- `20260213103000_create_dental_clinical_core.sql`
- `20260213113000_create_dental_rcm_growth_phase3.sql`
- `20260213140000_dental_features_complete.sql`
- `20260213150000_dental_appointment_details.sql`
- `20260213150100_seed_dental_chairs.sql`
