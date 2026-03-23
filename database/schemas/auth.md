# Auth & User Management

Tables related to user accounts, authentication, roles, security, and preferences.

## Core

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles linked to `auth.users` | `id`, `email`, `full_name`, `role`, `avatar_url` |
| `roles` | Available roles in the system | `id`, `name`, `description` |
| `user_roles` | Many-to-many user-role assignments | `user_id`, `role_id` |
| `user_preferences` | Per-user app preferences (theme, locale) | `user_id`, `preferences` (jsonb) |

## Security

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `user_2fa_settings` | Two-factor authentication configuration | `user_id`, `method`, `is_enabled` |
| `user_2fa_codes` | Temporary 2FA verification codes | `user_id`, `code`, `expires_at` |
| `user_sessions` | Active session tracking | `user_id`, `token`, `device_info`, `expires_at` |
| `login_history` | Login attempt audit log | `user_id`, `ip_address`, `success`, `created_at` |
| `security_notifications` | Security-related alerts for users | `user_id`, `type`, `message`, `read` |
| `user_behavior_analysis` | Behavioral anomaly detection data | `user_id`, `metric`, `value` |
| `account_locks` | Locked accounts after failed attempts | `user_id`, `locked_until`, `reason` |
| `trusted_devices` | Remembered/trusted devices | `user_id`, `device_fingerprint`, `name` |
| `deletion_requests` | Account deletion grace-period requests | `user_id`, `requested_at`, `grace_expires_at` |

## Audit

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `audit_logs` | System-wide audit trail | `user_id`, `action`, `table_name`, `record_id`, `changes` |

## Migrations

- `001_create_profiles_table.sql`
- `003_security_policies.sql`
- `20241107000001_security_system.sql`
- `20241110000001_create_user_preferences_table.sql`
- `20260205000000_account_deletion_grace_period.sql`
- `20260205000001_security_enhancements.sql`
- `20260216000003_multi_role_support.sql`
