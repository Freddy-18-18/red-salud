-- =============================================================================
-- Migration: Team Checklist Daily
-- Description: Tabla para persistir el checklist diario del equipo odontológico
-- Author: AI Assistant
-- Date: 2026-02-13
-- =============================================================================

-- ─── Daily Team Checklist ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS daily_team_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  office_id UUID NOT NULL REFERENCES doctor_offices(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(office_id, date)
);

ALTER TABLE daily_team_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doctors_view_checklist" ON daily_team_checklist
  FOR SELECT USING (
    office_id IN (
      SELECT id FROM doctor_offices WHERE doctor_id = auth.uid()
    )
  );

CREATE POLICY "doctors_manage_checklist" ON daily_team_checklist
  FOR ALL USING (
    office_id IN (
      SELECT id FROM doctor_offices WHERE doctor_id = auth.uid()
    )
  );

CREATE INDEX idx_checklist_office_date ON daily_team_checklist(office_id, date);

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_checklist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_team_checklist
  BEFORE UPDATE ON daily_team_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_checklist_updated_at();

-- Estructura del JSONB items:
-- [
--   {
--     "id": "uuid",
--     "title": "string",
--     "completed": boolean,
--     "assignedTo": "string (optional)",
--     "completedAt": "timestamp (optional)"
--   }
-- ]

COMMENT ON TABLE daily_team_checklist IS 'Checklist diario del equipo para morning huddle';
COMMENT ON COLUMN daily_team_checklist.items IS 'Array de items del checklist en formato JSONB';
