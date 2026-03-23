# Clinic Management Domain

Tables for clinic operations: multi-location management, staff scheduling, resources, revenue cycle management (RCM), and international patients.

## Clinic Foundation

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `clinics` | Clinic/organization records | `id`, `name`, `owner_id`, `type`, `status` |
| `clinic_locations` | Physical clinic locations | `id`, `clinic_id`, `name`, `address`, `coordinates` |
| `clinic_roles` | Staff roles within a clinic | `id`, `clinic_id`, `name`, `permissions` |
| `clinic_resources` | Equipment/rooms/assets | `id`, `clinic_id`, `name`, `type`, `status` |
| `clinic_staff_shifts` | Staff shift scheduling | `id`, `staff_id`, `clinic_id`, `start`, `end` |
| `clinic_operational_metrics` | Operational KPIs | `clinic_id`, `metric`, `value`, `period` |

## Extended Resources

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `clinic_areas` | Named areas within a clinic (waiting room, exam room) | `id`, `clinic_id`, `name`, `type` |
| `resource_assignments` | Resource-to-area/doctor assignments | `id`, `resource_id`, `assigned_to`, `start`, `end` |
| `clinic_floor_plans` | Floor plan images/data | `id`, `clinic_id`, `name`, `data` |

## Revenue Cycle Management (RCM)

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `payer_contracts` | Contracts with insurance payers | `id`, `clinic_id`, `payer_name`, `terms`, `rates` |
| `rcm_claims` | Insurance claims | `id`, `clinic_id`, `patient_id`, `payer_id`, `amount`, `status` |
| `rcm_claim_items` | Line items in a claim | `id`, `claim_id`, `service`, `code`, `amount` |
| `rcm_payments` | Payments received on claims | `id`, `claim_id`, `amount`, `payment_date`, `method` |

## International Patients

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `international_patients` | International patient profiles | `id`, `patient_id`, `nationality`, `passport_number`, `visa_type` |
| `travel_documents` | Travel/visa documents | `id`, `patient_id`, `document_type`, `file_url`, `expires_at` |

## Geographic

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `estados_venezuela` | Venezuelan states | `id`, `name`, `code` |
| `municipios_venezuela` | Venezuelan municipalities | `id`, `estado_id`, `name` |

## Dashboard & Customization

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `dashboard_preferences` | Dashboard layout per user | `user_id`, `layout`, `widgets` |
| `dashboard_widget_configs` | Widget configuration | `id`, `user_id`, `widget_type`, `config` |
| `doctor_quick_actions` | Quick-action shortcuts | `doctor_id`, `action`, `label`, `position` |
| `doctor_themes` | UI theme preferences | `doctor_id`, `theme`, `colors` |
| `doctor_tasks` | Task/todo items | `id`, `doctor_id`, `title`, `status`, `due_date` |
| `doctor_notifications` | In-app notifications | `id`, `doctor_id`, `type`, `message`, `read` |

## Signatures

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `signature_requests` | Electronic signature requests | `id`, `document_id`, `requester_id`, `status` |
| `signature_signers` | Signers on a signature request | `id`, `request_id`, `signer_id`, `signed_at` |
| `signature_fields` | Signature field placement on a document | `id`, `request_id`, `page`, `x`, `y`, `type` |
| `signature_audit` | Signature audit trail | `id`, `request_id`, `action`, `actor_id`, `timestamp` |

## Payments

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `payments` | General payment records | `id`, `patient_id`, `amount`, `method`, `status` |
| `exchange_rates` | Currency exchange rates (USD/VES) | `id`, `rate`, `source`, `date` |

## Migrations

- `20251115000001_create_geographic_coverage.sql`
- `20251116000001_create_clinic_foundation.sql`
- `20251116000002_create_clinic_rcm.sql`
- `20260104000005_create_exchange_rates.sql`
- `20260112000001_extend_clinic_resources.sql`
- `20260212000001_create_payments_table.sql`
- `20260214000100_signature_system.sql`
- `20251218000003_create_dashboard_customization.sql`
