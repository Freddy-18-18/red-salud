-- ============================================================================
-- SISTEMA DE RECETAS MÉDICAS AVANZADO
-- ============================================================================
-- Migración para implementar templates de recetas, firmas digitales,
-- escaneo con OCR, y sistema de impresión profesional
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLA: prescription_templates
-- Templates de recetas (sistema, personalizados, escaneados)
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS prescription_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Datos básicos
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(20) DEFAULT 'personalizado', -- 'sistema', 'personalizado', 'escaneado'
  categoria VARCHAR(100), -- 'general', 'pediatria', 'cardiologia', etc.

  -- Configuración visual (JSONB)
  layout_config JSONB DEFAULT '{
    "show_logo": true,
    "show_header": true,
    "show_medico_name": true,
    "show_medico_specialty": true,
    "show_medico_address": true,
    "show_patient_details": true,
    "show_patient_fields": ["nombre", "edad", "sexo", "peso", "id"],
    "show_horario": true,
    "show_firma": true,
    "show_instrucciones": true,
    "show_footer": true,
    "orientation": "portrait"
  }'::jsonb,

  -- Estilos personalizados
  custom_styles JSONB DEFAULT '{
    "primary_color": "#1e40af",
    "secondary_color": "#7c3aed",
    "font_family": "Arial",
    "font_size": 12,
    "line_height": 1.4
  }'::jsonb,

  -- Contenido del template
  header_config JSONB DEFAULT '{
    "logo_type": "esculapio",
    "logo_url": null,
    "show_medico_data": true
  }'::jsonb,

  patient_fields JSONB DEFAULT '[
    {"field": "nombre", "required": true, "label": "NOMBRE"},
    {"field": "apellido", "required": true, "label": "APELLIDO"},
    {"field": "edad", "required": false, "label": "EDAD"},
    {"field": "sexo", "required": false, "label": "SEXO"},
    {"field": "peso", "required": false, "label": "PESO"},
    {"field": "id", "required": false, "label": "ID"}
  ]'::jsonb,

  footer_config JSONB DEFAULT '{
    "show_firma": true,
    "show_horario": true,
    "horario_texto": null,
    "show_instrucciones": true
  }'::jsonb,

  -- Textos predefinidos
  texto_encabezado TEXT,
  texto_pie TEXT,
  texto_instrucciones TEXT DEFAULT 'Favor de traer su receta en la próxima cita',

  -- Metadatos
  es_predeterminado BOOLEAN DEFAULT false,
  activo BOOLEAN DEFAULT true,
  usos_count INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para prescription_templates
CREATE INDEX idx_templates_medico ON prescription_templates(medico_id) WHERE medico_id IS NOT NULL;
CREATE INDEX idx_templates_tipo ON prescription_templates(tipo);
CREATE INDEX idx_templates_categoria ON prescription_templates(categoria);
CREATE INDEX idx_templates_activos ON prescription_templates(activo) WHERE activo = true;

-- Comentario
COMMENT ON TABLE prescription_templates IS 'Templates de recetas médicas para personalizar el formato de impresión';


-- ----------------------------------------------------------------------------
-- 2. TABLA: doctor_signatures
-- Firmas digitales de los médicos
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS doctor_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

  -- Datos de la firma
  firma_url VARCHAR(500), -- URL en Supabase Storage
  firma_type VARCHAR(20) DEFAULT 'digital', -- 'digital' (canvas), 'upload', 'touch' (táctil)
  firma_data TEXT, -- SVG o base64 para respaldo

  -- Metadatos
  es_firma_autografa BOOLEAN DEFAULT false,
  fecha_creacion TIMESTAMPTZ DEFAULT NOW(),
  activa BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para doctor_signatures
CREATE INDEX idx_signatures_medico ON doctor_signatures(medico_id);
CREATE INDEX idx_signatures_activas ON doctor_signatures(activa) WHERE activa = true;

-- Comentario
COMMENT ON TABLE doctor_signatures IS 'Firmas digitales de los médicos para usar en recetas';


-- ----------------------------------------------------------------------------
-- 3. TABLA: prescription_scans
-- Recetas escaneadas para procesamiento OCR
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS prescription_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medico_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Datos del escaneo
  imagen_url VARCHAR(500) NOT NULL, -- URL en Supabase Storage
  imagen_type VARCHAR(20) DEFAULT 'scan', -- 'scan', 'photo', 'upload'
  ocr_data JSONB, -- Resultado de OCR con Tesseract.js

  -- Procesamiento
  procesada BOOLEAN DEFAULT false,
  template_id UUID REFERENCES prescription_templates(id) ON DELETE SET NULL,
  prescription_id UUID REFERENCES farmacia_recetas(id) ON DELETE SET NULL,

  -- Metadatos
  notas TEXT,
  fecha_escaneo TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para prescription_scans
CREATE INDEX idx_scans_medico ON prescription_scans(medico_id);
CREATE INDEX idx_scans_paciente ON prescription_scans(paciente_id);
CREATE INDEX idx_scans_procesada ON prescription_scans(procesada);
CREATE INDEX idx_scans_template ON prescription_scans(template_id) WHERE template_id IS NOT NULL;

-- Comentario
COMMENT ON TABLE prescription_scans IS 'Recetas escaneadas para procesamiento con OCR y réplica de formato';


-- ----------------------------------------------------------------------------
-- 4. TABLA: prescription_prints
-- Historial de impresiones de recetas
-- ----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS prescription_prints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID REFERENCES farmacia_recetas(id) ON DELETE CASCADE,
  medico_id UUID REFERENCES profiles(id) ON DELETE CASCADE,

  -- Datos de impresión
  template_id UUID REFERENCES prescription_templates(id) ON DELETE SET NULL,
  formato VARCHAR(20) DEFAULT 'pdf', -- 'pdf', 'print'
  copias INTEGER DEFAULT 1,

  -- Metadatos
  ip_address VARCHAR(45),
  user_agent TEXT,
  fecha_impresion TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para prescription_prints
CREATE INDEX idx_prints_prescription ON prescription_prints(prescription_id);
CREATE INDEX idx_prints_medico ON prescription_prints(medico_id);
CREATE INDEX idx_prints_template ON prescription_prints(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX idx_prints_fecha ON prescription_prints(fecha_impresion);

-- Comentario
COMMENT ON TABLE prescription_prints IS 'Historial de impresiones de recetas para auditoría';


-- ----------------------------------------------------------------------------
-- 5. MODIFICACIONES A TABLAS EXISTENTES
-- ----------------------------------------------------------------------------

-- Agregar campos a farmacia_recetas
ALTER TABLE farmacia_recetas
  ADD COLUMN IF NOT EXISTS template_id UUID REFERENCES prescription_templates(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS custom_layout JSONB, -- Layout personalizado override
  ADD COLUMN IF NOT EXISTS signature_id UUID REFERENCES doctor_signatures(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS numero_receta VARCHAR(50) UNIQUE, -- Número único de receta
  ADD COLUMN IF NOT EXISTS paciente_data JSONB, -- Snapshot de datos del paciente
  ADD COLUMN IF NOT EXISTS medico_data JSONB; -- Snapshot de datos del médico

-- Agregar índices para las nuevas columnas
CREATE INDEX IF NOT EXISTS idx_farmacia_recetas_template ON farmacia_recetas(template_id) WHERE template_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_farmacia_recetas_signature ON farmacia_recetas(signature_id) WHERE signature_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_farmacia_recetas_numero ON farmacia_recetas(numero_receta) WHERE numero_receta IS NOT NULL;


-- ----------------------------------------------------------------------------
-- 6. FUNCIONES Y TRIGGERS
-- ----------------------------------------------------------------------------

-- Función para generar número único de receta
CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS VARCHAR AS $$
DECLARE
  fecha VARCHAR(8);
  secuencia INTEGER;
  numero VARCHAR(50);
BEGIN
  fecha := TO_CHAR(NOW(), 'YYYYMMDD');

  SELECT COALESCE(MAX(CAST(SUBSTRING(numero_receta FROM 10) AS INTEGER)), 0) + 1
  INTO secuencia
  FROM farmacia_recetas
  WHERE numero_receta LIKE 'REC-' || fecha || '%';

  numero := 'REC-' || fecha || '-' || LPAD(secuencia::TEXT, 4, '0');
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asignar número automáticamente
CREATE TRIGGER assign_prescription_number
  BEFORE INSERT ON farmacia_recetas
  FOR EACH ROW
  WHEN (NEW.numero_receta IS NULL)
  EXECUTE FUNCTION generate_prescription_number();

-- Función para actualizar contador de usos de template
CREATE OR REPLACE FUNCTION increment_template_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.template_id IS NOT NULL THEN
    UPDATE prescription_templates
    SET usos_count = usos_count + 1
    WHERE id = NEW.template_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar contador de usos
DROP TRIGGER IF EXISTS update_template_usage ON farmacia_recetas;
CREATE TRIGGER update_template_usage
  AFTER INSERT ON farmacia_recetas
  FOR EACH ROW
  WHEN (NEW.template_id IS NOT NULL)
  EXECUTE FUNCTION increment_template_usage();

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON prescription_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_signatures_updated_at BEFORE UPDATE ON doctor_signatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scans_updated_at BEFORE UPDATE ON prescription_scans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ----------------------------------------------------------------------------
-- 7. POLICIES DE SEGURIDAD (RLS)
-- ----------------------------------------------------------------------------

-- Habilitar RLS en todas las tablas nuevas
ALTER TABLE prescription_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_prints ENABLE ROW LEVEL SECURITY;

-- Policies para prescription_templates
CREATE POLICY "Los médicos pueden ver todos los templates activos"
  ON prescription_templates FOR SELECT
  USING (
    medico_id = auth.uid()
    OR tipo = 'sistema'
  );

CREATE POLICY "Los médicos pueden crear sus templates"
  ON prescription_templates FOR INSERT
  WITH CHECK (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden actualizar sus templates"
  ON prescription_templates FOR UPDATE
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden eliminar sus templates"
  ON prescription_templates FOR DELETE
  USING (medico_id = auth.uid());

-- Policies para doctor_signatures
CREATE POLICY "Los médicos pueden ver su firma"
  ON doctor_signatures FOR SELECT
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden crear su firma"
  ON doctor_signatures FOR INSERT
  WITH CHECK (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden actualizar su firma"
  ON doctor_signatures FOR UPDATE
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden eliminar su firma"
  ON doctor_signatures FOR DELETE
  USING (medico_id = auth.uid());

-- Policies para prescription_scans
CREATE POLICY "Los médicos pueden ver sus escaneos"
  ON prescription_scans FOR SELECT
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden crear escaneos"
  ON prescription_scans FOR INSERT
  WITH CHECK (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden actualizar sus escaneos"
  ON prescription_scans FOR UPDATE
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden eliminar sus escaneos"
  ON prescription_scans FOR DELETE
  USING (medico_id = auth.uid());

-- Policies para prescription_prints
CREATE POLICY "Los médicos pueden ver su historial de impresiones"
  ON prescription_prints FOR SELECT
  USING (medico_id = auth.uid());

CREATE POLICY "Los médicos pueden crear registro de impresión"
  ON prescription_prints FOR INSERT
  WITH CHECK (medico_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 8. VISTAS
-- ----------------------------------------------------------------------------

-- Vista para recetas con información completa
CREATE OR REPLACE VIEW vw_prescription_detail AS
SELECT
  fr.*,
  pt.nombre as template_nombre,
  pt.tipo as template_tipo,
  pt.layout_config,
  pt.custom_styles,
  ds.firma_url,
  ds.firma_type,
  ps.imagen_url as scan_imagen_url,
  ps.ocr_data
FROM farmacia_recetas fr
LEFT JOIN prescription_templates pt ON fr.template_id = pt.id
LEFT JOIN doctor_signatures ds ON fr.signature_id = ds.id
LEFT JOIN prescription_scans ps ON fr.id = ps.prescription_id;

COMMENT ON VIEW vw_prescription_detail IS 'Vista de recetas con información completa de template, firma y escaneo';


-- ----------------------------------------------------------------------------
-- 9. DATOS SEMILLA (SEED DATA)
-- ----------------------------------------------------------------------------

-- Templates predeterminados del sistema
INSERT INTO prescription_templates (
  medico_id,
  nombre,
  descripcion,
  tipo,
  categoria,
  es_predeterminado,
  layout_config,
  custom_styles,
  patient_fields,
  texto_instrucciones
) VALUES
(
  NULL, -- medico_id NULL indica template del sistema
  'Formato Estándar Esculapio',
  'Formato profesional con logo de Esculapio, ideal para medicina general',
  'sistema',
  'general',
  true,
  '{
    "show_logo": true,
    "show_header": true,
    "show_medico_name": true,
    "show_medico_specialty": true,
    "show_medico_address": true,
    "show_patient_details": true,
    "show_patient_fields": ["nombre", "edad", "sexo", "peso", "id"],
    "show_horario": true,
    "show_firma": true,
    "show_instrucciones": true,
    "show_footer": true,
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primary_color": "#1e40af",
    "secondary_color": "#7c3aed",
    "font_family": "Arial",
    "font_size": 12,
    "line_height": 1.4
  }'::jsonb,
  '[
    {"field": "nombre", "required": true, "label": "NOMBRE"},
    {"field": "apellido", "required": true, "label": "APELLIDO"},
    {"field": "edad", "required": false, "label": "EDAD"},
    {"field": "sexo", "required": false, "label": "SEXO"},
    {"field": "peso", "required": false, "label": "PESO"},
    {"field": "id", "required": false, "label": "ID"}
  ]'::jsonb,
  'Favor de traer su receta en la próxima cita'
),
(
  NULL,
  'Formato Pediátrico',
  'Formato optimizado para pediatría con énfasis en peso y edad del paciente',
  'sistema',
  'pediatria',
  true,
  '{
    "show_logo": true,
    "show_header": true,
    "show_medico_name": true,
    "show_medico_specialty": true,
    "show_medico_address": true,
    "show_patient_details": true,
    "show_patient_fields": ["nombre", "edad", "peso", "sexo"],
    "show_horario": true,
    "show_firma": true,
    "show_instrucciones": true,
    "show_footer": true,
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primary_color": "#0891b2",
    "secondary_color": "#06b6d4",
    "font_family": "Arial",
    "font_size": 11,
    "line_height": 1.3
  }'::jsonb,
  '[
    {"field": "nombre", "required": true, "label": "NOMBRE"},
    {"field": "edad", "required": true, "label": "EDAD"},
    {"field": "peso", "required": true, "label": "PESO"},
    {"field": "sexo", "required": true, "label": "SEXO"}
  ]'::jsonb,
  'Favor de traer su receta en la próxima cita. Recuerde administrar los medicamentos según el peso del niño.'
),
(
  NULL,
  'Formato Cardiología',
  'Formato especializado para cardiología con campos adicionales',
  'sistema',
  'cardiologia',
  true,
  '{
    "show_logo": true,
    "show_header": true,
    "show_medico_name": true,
    "show_medico_specialty": true,
    "show_medico_address": true,
    "show_patient_details": true,
    "show_patient_fields": ["nombre", "edad", "peso", "sexo", "id"],
    "show_horario": true,
    "show_firma": true,
    "show_instrucciones": true,
    "show_footer": true,
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primary_color": "#dc2626",
    "secondary_color": "#ef4444",
    "font_family": "Arial",
    "font_size": 12,
    "line_height": 1.4
  }'::jsonb,
  '[
    {"field": "nombre", "required": true, "label": "NOMBRE"},
    {"field": "edad", "required": true, "label": "EDAD"},
    {"field": "peso", "required": true, "label": "PESO"},
    {"field": "sexo", "required": true, "label": "SEXO"},
    {"field": "id", "required": true, "label": "ID"}
  ]'::jsonb,
  'Favor de traer su receta en la próxima cita. Siga estrictamente las indicaciones de dosificación.'
),
(
  NULL,
  'Formato Minimalista',
  'Formato simple y limpio sin logo, ideal para recetas rápidas',
  'sistema',
  'general',
  true,
  '{
    "show_logo": false,
    "show_header": true,
    "show_medico_name": true,
    "show_medico_specialty": false,
    "show_medico_address": false,
    "show_patient_details": true,
    "show_patient_fields": ["nombre", "edad"],
    "show_horario": false,
    "show_firma": true,
    "show_instrucciones": true,
    "show_footer": true,
    "orientation": "portrait"
  }'::jsonb,
  '{
    "primary_color": "#374151",
    "secondary_color": "#6b7280",
    "font_family": "Arial",
    "font_size": 11,
    "line_height": 1.3
  }'::jsonb,
  '[
    {"field": "nombre", "required": true, "label": "NOMBRE"},
    {"field": "edad", "required": false, "label": "EDAD"}
  ]'::jsonb,
  'Favor de traer su receta en la próximacita.'
);

-- ----------------------------------------------------------------------------
-- FIN DE MIGRACIÓN
-- ----------------------------------------------------------------------------
