-- Migration: Resolve duplicate indexes
-- Description: Drops redundant indexes to reduce write overhead and save storage.

-- 1. Resolve duplicate index on doctor_availability_exceptions
-- Redundant with UNIQUE(doctor_id, date) constraint which creates an index.
DROP INDEX IF EXISTS idx_availability_doctor;

-- 2. Resolve redundant index on doctor_reviews
-- Redundant with UNIQUE(doctor_id, patient_id, appointment_id) constraint.
DROP INDEX IF EXISTS idx_reviews_doctor;
