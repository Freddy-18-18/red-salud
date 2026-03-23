-- =============================================================================
-- Migration: Add teeth JSONB column to dental_perio_exams
-- Date: 2026-02-13
-- Purpose: Store periodontal measurements for all teeth in structured JSON format
-- =============================================================================

-- Add teeth column to store periodontal data for each tooth
-- Structure: { "tooth_number": { probing_depth, recession, bleeding, etc. } }
ALTER TABLE dental_perio_exams
ADD COLUMN IF NOT EXISTS teeth JSONB NOT NULL DEFAULT '{}';

-- Create GIN index for efficient JSON queries on teeth data
-- This allows fast queries like: WHERE teeth @> '{"11": {"bleeding": true}}'
CREATE INDEX IF NOT EXISTS idx_dental_perio_exams_teeth 
  ON dental_perio_exams USING GIN (teeth);

-- Add comment for documentation
COMMENT ON COLUMN dental_perio_exams.teeth IS 
'JSON object storing periodontal measurements for each tooth. Format: {"tooth_number": {"probing_depth": [6 values], "recession": [6 values], "bleeding": [6 booleans], "suppuration": [6 booleans], "plaque": [6 booleans], "mobility": 0-3, "furcation": 0-3, "missing": boolean}}';
