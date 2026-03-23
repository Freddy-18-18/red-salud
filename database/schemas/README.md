# Database Schema Documentation

This directory contains documentation for the Red Salud database schema, organized by domain. Each file describes the tables, their purpose, and key columns for a specific area of the system.

These are **documentation files only** -- they do not contain executable SQL. The actual table definitions live in `database/migrations/`.

## Domains

| File | Domain | Description |
|------|--------|-------------|
| [auth.md](auth.md) | Authentication & Users | Profiles, roles, security, sessions, preferences |
| [medical.md](medical.md) | Medical / Doctors | Doctor profiles, schedules, appointments, prescriptions, consultations |
| [dental.md](dental.md) | Dental | Periodontograma, dental imaging, treatment plans, dental RCM |
| [pharmacy.md](pharmacy.md) | Pharmacy | Inventory, products, invoices, POS, deliveries, loyalty |
| [clinic.md](clinic.md) | Clinic Management | Clinics, resources, shifts, RCM claims, international patients |
| [lab.md](lab.md) | Laboratory & Telemedicine | Lab orders, results, telemedicine sessions, video calls |

## How tables are organized

The schema follows a domain-driven approach. Some tables are shared across domains (e.g., `profiles` is referenced by almost every other table). The migration files in `database/migrations/` are numbered chronologically, but this documentation groups them by domain for easier navigation.
