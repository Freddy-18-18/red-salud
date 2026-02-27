-- ============================================================================
-- SISTEMA INTELIGENTE DE SUGERENCIAS DE MOTIVOS DE CONSULTA
-- ============================================================================
-- Este sistema proporciona sugerencias personalizadas basadas en:
-- 1. Especialidad del médico
-- 2. Historial de uso del médico
-- 3. Búsqueda semántica con embeddings (opcional)
-- ============================================================================

-- ============================================================================
-- TABLA 1: Catálogo de motivos por especialidad
-- ============================================================================
CREATE TABLE IF NOT EXISTS specialty_consultation_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id TEXT REFERENCES specialties(id) ON DELETE CASCADE,
  specialty_name TEXT, -- Backup del nombre para queries rápidos
  reason TEXT NOT NULL,
  category TEXT DEFAULT 'común' CHECK (category IN ('común', 'urgencia', 'preventivo', 'seguimiento', 'diagnóstico')),
  priority INTEGER DEFAULT 50 CHECK (priority >= 1 AND priority <= 100), -- 1-100, mayor = más relevante
  tags TEXT[] DEFAULT '{}', -- Para búsqueda por tags
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_specialty ON specialty_consultation_reasons(specialty_id);
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_specialty_name ON specialty_consultation_reasons(specialty_name);
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_category ON specialty_consultation_reasons(category);
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_priority ON specialty_consultation_reasons(priority DESC);
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_reason_gin ON specialty_consultation_reasons USING gin(to_tsvector('spanish', reason));
CREATE INDEX IF NOT EXISTS idx_specialty_reasons_tags ON specialty_consultation_reasons USING gin(tags);

-- ============================================================================
-- TABLA 2: Historial de uso por médico
-- ============================================================================
CREATE TABLE IF NOT EXISTS doctor_reason_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  use_count INTEGER DEFAULT 1,
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, reason)
);

-- Índices para búsqueda eficiente
CREATE INDEX IF NOT EXISTS idx_doctor_reason_usage_doctor ON doctor_reason_usage(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_reason_usage_count ON doctor_reason_usage(doctor_id, use_count DESC);
CREATE INDEX IF NOT EXISTS idx_doctor_reason_usage_last_used ON doctor_reason_usage(doctor_id, last_used_at DESC);

-- ============================================================================
-- FUNCIÓN: Incrementar contador de uso
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_reason_usage(
  p_doctor_id UUID,
  p_reason TEXT
) RETURNS void AS $$
BEGIN
  INSERT INTO doctor_reason_usage (doctor_id, reason, use_count, last_used_at)
  VALUES (p_doctor_id, p_reason, 1, NOW())
  ON CONFLICT (doctor_id, reason) 
  DO UPDATE SET 
    use_count = doctor_reason_usage.use_count + 1,
    last_used_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNCIÓN: Obtener sugerencias inteligentes
-- ============================================================================
CREATE OR REPLACE FUNCTION get_smart_suggestions(
  p_doctor_id UUID,
  p_specialty_name TEXT,
  p_query TEXT DEFAULT '',
  p_limit INTEGER DEFAULT 20
) RETURNS TABLE (
  reason TEXT,
  source TEXT,
  priority INTEGER,
  use_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH 
  -- Motivos frecuentes del médico
  frequent_reasons AS (
    SELECT 
      dru.reason,
      'frequent'::TEXT as source,
      90 + LEAST(dru.use_count, 10) as priority, -- Max 100
      dru.use_count
    FROM doctor_reason_usage dru
    WHERE dru.doctor_id = p_doctor_id
      AND (p_query = '' OR dru.reason ILIKE '%' || p_query || '%')
    ORDER BY dru.use_count DESC, dru.last_used_at DESC
    LIMIT 5
  ),
  -- Motivos de la especialidad
  specialty_reasons AS (
    SELECT 
      scr.reason,
      'specialty'::TEXT as source,
      scr.priority,
      0 as use_count
    FROM specialty_consultation_reasons scr
    WHERE scr.is_active = true
      AND (scr.specialty_name ILIKE '%' || p_specialty_name || '%' OR scr.specialty_id IS NULL)
      AND (p_query = '' OR scr.reason ILIKE '%' || p_query || '%')
      AND scr.reason NOT IN (SELECT reason FROM frequent_reasons)
    ORDER BY scr.priority DESC
    LIMIT 15
  ),
  -- Combinar resultados
  combined AS (
    SELECT * FROM frequent_reasons
    UNION ALL
    SELECT * FROM specialty_reasons
  )
  SELECT * FROM combined
  ORDER BY priority DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_specialty_reasons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_specialty_reasons_updated_at ON specialty_consultation_reasons;
CREATE TRIGGER trigger_update_specialty_reasons_updated_at
  BEFORE UPDATE ON specialty_consultation_reasons
  FOR EACH ROW
  EXECUTE FUNCTION update_specialty_reasons_updated_at();

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
ALTER TABLE specialty_consultation_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_reason_usage ENABLE ROW LEVEL SECURITY;

-- Políticas para specialty_consultation_reasons (lectura pública)
DROP POLICY IF EXISTS "Anyone can view active consultation reasons" ON specialty_consultation_reasons;
CREATE POLICY "Anyone can view active consultation reasons"
  ON specialty_consultation_reasons FOR SELECT
  USING (is_active = true);

-- Políticas para doctor_reason_usage (solo el médico ve sus datos)
DROP POLICY IF EXISTS "Doctors can view own reason usage" ON doctor_reason_usage;
CREATE POLICY "Doctors can view own reason usage"
  ON doctor_reason_usage FOR SELECT
  USING (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can insert own reason usage" ON doctor_reason_usage;
CREATE POLICY "Doctors can insert own reason usage"
  ON doctor_reason_usage FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

DROP POLICY IF EXISTS "Doctors can update own reason usage" ON doctor_reason_usage;
CREATE POLICY "Doctors can update own reason usage"
  ON doctor_reason_usage FOR UPDATE
  USING (auth.uid() = doctor_id);

-- ============================================================================
-- COMENTARIOS
-- ============================================================================
COMMENT ON TABLE specialty_consultation_reasons IS 'Catálogo de motivos de consulta organizados por especialidad médica';
COMMENT ON TABLE doctor_reason_usage IS 'Historial de motivos de consulta usados por cada médico';
COMMENT ON FUNCTION increment_reason_usage IS 'Incrementa el contador de uso de un motivo para un médico';
COMMENT ON FUNCTION get_smart_suggestions IS 'Obtiene sugerencias inteligentes basadas en especialidad y uso';
