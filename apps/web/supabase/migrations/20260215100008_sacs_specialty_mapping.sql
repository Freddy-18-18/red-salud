-- ============================================
-- SACS Specialty Auto-Mapping Table
-- Maps SACS specialty names/codes to system slugs
-- ============================================

CREATE TABLE IF NOT EXISTS sacs_specialty_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sacs_code TEXT,
  sacs_name_pattern TEXT NOT NULL,
  specialty_slug TEXT NOT NULL,
  confidence TEXT CHECK (confidence IN ('exact', 'keyword', 'manual')) DEFAULT 'exact',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sacs_mapping_pattern ON sacs_specialty_mapping (sacs_name_pattern);
CREATE INDEX IF NOT EXISTS idx_sacs_mapping_code ON sacs_specialty_mapping (sacs_code) WHERE sacs_code IS NOT NULL;

-- Pre-populate with known SACS → slug mappings
INSERT INTO sacs_specialty_mapping (sacs_name_pattern, specialty_slug, confidence) VALUES
  -- Direct profession mappings
  ('MEDICINA GENERAL', 'medicina-general', 'exact'),
  ('ODONTOLOGÍA', 'odontologia', 'exact'),
  ('BIOANÁLISIS', 'bioanalisis', 'exact'),
  ('ENFERMERÍA', 'enfermeria', 'exact'),
  ('FARMACIA', 'farmacia', 'exact'),
  -- Common postgrado names
  ('CARDIOLOGÍA', 'cardiologia', 'exact'),
  ('NEUROLOGÍA', 'neurologia', 'exact'),
  ('PEDIATRÍA', 'pediatria', 'exact'),
  ('GINECOLOGÍA Y OBSTETRICIA', 'ginecologia', 'exact'),
  ('GINECOLOGÍA', 'ginecologia', 'exact'),
  ('OBSTETRICIA', 'ginecologia', 'exact'),
  ('TRAUMATOLOGÍA Y ORTOPEDIA', 'traumatologia', 'exact'),
  ('TRAUMATOLOGÍA', 'traumatologia', 'exact'),
  ('ORTOPEDIA', 'traumatologia', 'exact'),
  ('OFTALMOLOGÍA', 'oftalmologia', 'exact'),
  ('DERMATOLOGÍA', 'dermatologia', 'exact'),
  ('PSIQUIATRÍA', 'psiquiatria', 'exact'),
  ('UROLOGÍA', 'urologia', 'exact'),
  ('GASTROENTEROLOGÍA', 'gastroenterologia', 'exact'),
  ('NEUMOLOGÍA', 'neumologia', 'exact'),
  ('NEFROLOGÍA', 'nefrologia', 'exact'),
  ('ENDOCRINOLOGÍA', 'endocrinologia', 'exact'),
  ('REUMATOLOGÍA', 'reumatologia', 'exact'),
  ('HEMATOLOGÍA', 'hematologia', 'exact'),
  ('ONCOLOGÍA', 'oncologia', 'exact'),
  ('CIRUGÍA GENERAL', 'cirugia-general', 'exact'),
  ('CIRUGÍA CARDIOVASCULAR', 'cirugia-cardiovascular', 'exact'),
  ('CIRUGÍA PLÁSTICA', 'cirugia-plastica', 'exact'),
  ('CIRUGÍA PEDIÁTRICA', 'cirugia-pediatrica', 'exact'),
  ('NEUROCIRUGÍA', 'neurocirugia', 'exact'),
  ('ANESTESIOLOGÍA', 'anestesiologia', 'exact'),
  ('RADIOLOGÍA', 'radiologia', 'exact'),
  ('PATOLOGÍA', 'patologia', 'exact'),
  ('MEDICINA INTERNA', 'medicina-interna', 'exact'),
  ('MEDICINA FAMILIAR', 'medicina-familiar', 'exact'),
  ('MEDICINA FÍSICA Y REHABILITACIÓN', 'medicina-fisica', 'exact'),
  ('INFECTOLOGÍA', 'infectologia', 'exact'),
  ('OTORRINOLARINGOLOGÍA', 'otorrinolaringologia', 'exact'),
  ('GERIATRÍA', 'geriatria', 'exact'),
  ('NEONATOLOGÍA', 'neonatologia', 'exact'),
  ('MEDICINA DE EMERGENCIA', 'medicina-emergencia', 'exact'),
  ('MEDICINA DEPORTIVA', 'medicina-deportiva', 'exact'),
  ('GENÉTICA MÉDICA', 'genetica-medica', 'exact'),
  ('INMUNOLOGÍA', 'inmunologia', 'exact'),
  ('MEDICINA NUCLEAR', 'medicina-nuclear', 'exact'),
  ('TOXICOLOGÍA', 'toxicologia', 'exact'),
  ('FISIOTERAPIA', 'fisioterapia', 'exact'),
  ('NUTRICIÓN', 'nutricion', 'exact'),
  ('PSICOLOGÍA', 'psicologia', 'exact'),
  -- Keyword-based mappings
  ('CARDIO', 'cardiologia', 'keyword'),
  ('NEURO', 'neurologia', 'keyword'),
  ('PEDIATR', 'pediatria', 'keyword'),
  ('GINECO', 'ginecologia', 'keyword'),
  ('OBSTET', 'ginecologia', 'keyword'),
  ('TRAUMA', 'traumatologia', 'keyword'),
  ('ORTO', 'traumatologia', 'keyword'),
  ('OFTALM', 'oftalmologia', 'keyword'),
  ('DERMAT', 'dermatologia', 'keyword'),
  ('PSIQUIAT', 'psiquiatria', 'keyword'),
  ('UROLOG', 'urologia', 'keyword'),
  ('GASTRO', 'gastroenterologia', 'keyword'),
  ('NEUMOL', 'neumologia', 'keyword'),
  ('NEFROL', 'nefrologia', 'keyword'),
  ('ENDOCRIN', 'endocrinologia', 'keyword'),
  ('REUMAT', 'reumatologia', 'keyword'),
  ('HEMATOL', 'hematologia', 'keyword'),
  ('ONCOL', 'oncologia', 'keyword'),
  ('ANESTES', 'anestesiologia', 'keyword'),
  ('RADIOL', 'radiologia', 'keyword'),
  ('PATOLOG', 'patologia', 'keyword'),
  ('INFECT', 'infectologia', 'keyword'),
  ('OTORRINO', 'otorrinolaringologia', 'keyword'),
  ('GERIATR', 'geriatria', 'keyword'),
  ('NEONAT', 'neonatologia', 'keyword'),
  ('ODONTOL', 'odontologia', 'keyword'),
  ('DENTAL', 'odontologia', 'keyword')
ON CONFLICT DO NOTHING;

-- RLS policies
ALTER TABLE sacs_specialty_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read SACS mappings" ON sacs_specialty_mapping
  FOR SELECT USING (true);

CREATE POLICY "Only admins can modify SACS mappings" ON sacs_specialty_mapping
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Function to resolve SACS specialty to slug
CREATE OR REPLACE FUNCTION resolve_sacs_to_slug(sacs_specialty TEXT)
RETURNS TEXT AS $$
DECLARE
  resolved_slug TEXT;
  normalized_input TEXT;
BEGIN
  normalized_input := UPPER(TRIM(sacs_specialty));
  
  -- 1. Exact match
  SELECT specialty_slug INTO resolved_slug
  FROM sacs_specialty_mapping
  WHERE UPPER(sacs_name_pattern) = normalized_input
    AND confidence = 'exact'
  LIMIT 1;
  
  IF resolved_slug IS NOT NULL THEN
    RETURN resolved_slug;
  END IF;
  
  -- 2. Keyword match
  SELECT specialty_slug INTO resolved_slug
  FROM sacs_specialty_mapping
  WHERE confidence = 'keyword'
    AND normalized_input LIKE '%' || UPPER(sacs_name_pattern) || '%'
  ORDER BY LENGTH(sacs_name_pattern) DESC
  LIMIT 1;
  
  IF resolved_slug IS NOT NULL THEN
    RETURN resolved_slug;
  END IF;
  
  -- 3. Fuzzy match
  SELECT specialty_slug INTO resolved_slug
  FROM sacs_specialty_mapping
  WHERE confidence = 'exact'
    AND normalized_input LIKE '%' || UPPER(sacs_name_pattern) || '%'
  ORDER BY LENGTH(sacs_name_pattern) DESC
  LIMIT 1;
  
  RETURN resolved_slug;
END;
$$ LANGUAGE plpgsql STABLE;

-- Auto-resolve trigger on profiles
CREATE OR REPLACE FUNCTION auto_resolve_sacs_specialty()
RETURNS TRIGGER AS $$
DECLARE
  resolved_slug TEXT;
  resolved_specialty_id UUID;
BEGIN
  IF NEW.sacs_especialidad IS NOT NULL 
     AND (OLD.sacs_especialidad IS DISTINCT FROM NEW.sacs_especialidad
          OR NEW.specialty_id IS NULL) THEN
    
    resolved_slug := resolve_sacs_to_slug(NEW.sacs_especialidad);
    
    IF resolved_slug IS NOT NULL THEN
      SELECT id INTO resolved_specialty_id
      FROM specialties
      WHERE slug = resolved_slug;
      
      IF resolved_specialty_id IS NOT NULL THEN
        NEW.specialty_id := resolved_specialty_id;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auto_resolve_sacs ON profiles;

CREATE TRIGGER trg_auto_resolve_sacs
  BEFORE UPDATE OF sacs_especialidad ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_resolve_sacs_specialty();
