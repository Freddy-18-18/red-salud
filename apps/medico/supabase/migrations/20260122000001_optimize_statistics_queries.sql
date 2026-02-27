-- ============================================================================
-- Migration: Optimize Statistics Queries
-- Date: 2026-01-22
-- Description: Create optimized indexes for statistics queries
-- ============================================================================

-- Index: Appointments by doctor, date and status (for volume statistics)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date_status
  ON appointments(doctor_id, appointment_date, status)
  WHERE appointment_date >= CURRENT_DATE - INTERVAL '1 year';

-- Index: Appointments by doctor and office (for multi-office statistics)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_office_date
  ON appointments(doctor_id, office_id, appointment_date);

-- Index: Appointments by consultation type (for type distribution stats)
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_type_date
  ON appointments(doctor_id, consultation_type, appointment_date)
  WHERE appointment_date >= CURRENT_DATE - INTERVAL '1 year';

-- Index: Recent appointments for active patients tracking
CREATE INDEX IF NOT EXISTS idx_appointments_active_recent
  ON appointments(doctor_id, appointment_date, status)
  WHERE status IN ('confirmada', 'pendiente', 'en_curso')
  AND appointment_date >= CURRENT_DATE;

-- Index: Appointments for revenue analytics
CREATE INDEX IF NOT EXISTS idx_appointments_price_date
  ON appointments(doctor_id, price, appointment_date)
  WHERE price IS NOT NULL
  AND appointment_date >= CURRENT_DATE - INTERVAL '1 year';

-- Index: Consultations by doctor and created date (for recent activity)
CREATE INDEX IF NOT EXISTS idx_consultations_doctor_created
  ON consultations(doctor_id, created_at DESC);

-- Index: Ratings by consultation (for average rating calculation)
CREATE INDEX IF NOT EXISTS idx_ratings_consultation_created
  ON ratings(consultation_id, created_at DESC);

-- Index: Patient age distribution (for demographic statistics)
CREATE INDEX IF NOT EXISTS idx_profiles_dob
  ON profiles(date_of_birth)
  WHERE date_of_birth IS NOT NULL;

-- Enable introspection for these indexes
COMMENT ON INDEX idx_appointments_doctor_date_status IS
  'Optimized index for appointment volume statistics by doctor, date and status';

COMMENT ON INDEX idx_appointments_doctor_office_date IS
  'Index for multi-office statistics comparison';

COMMENT ON INDEX idx_appointments_doctor_type_date IS
  'Index for appointment type distribution statistics';

COMMENT ON INDEX idx_appointments_active_recent IS
  'Partial index for recent active appointments only';

COMMENT ON INDEX idx_appointments_price_date IS
  'Index for revenue and financial analytics';

COMMENT ON INDEX idx_consultations_doctor_created IS
  'Index for recent consultations activity tracking';

COMMENT ON INDEX idx_ratings_consultation_created IS
  'Index for ratings and satisfaction metrics';

COMMENT ON INDEX idx_profiles_dob IS
  'Index for patient age demographics';
