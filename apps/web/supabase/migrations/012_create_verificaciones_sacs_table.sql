-- ============================================
-- TABLA: verificaciones_sacs
-- Almacena todas las verificaciones de médicos en el SACS
-- ============================================

CREATE TABLE IF NOT EXISTS verificaciones_sacs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Datos de identificación
  cedula TEXT NOT NULL,
  tipo_documento TEXT NOT NULL CHECK (tipo_documento IN ('V', 'E')),
  nombre_completo TEXT NOT NULL,
  
  -- Datos profesionales
  profesion_principal TEXT NOT NULL,
  matricula_principal TEXT NOT NULL,
  especialidad TEXT,
  
  -- Datos completos del SACS (JSON)
  profesiones JSONB DEFAULT '[]'::jsonb,
  postgrados JSONB DEFAULT '[]'::jsonb,
  
  -- Validación
  es_medico_humano BOOLEAN NOT NULL DEFAULT false,
  es_veterinario BOOLEAN NOT NULL DEFAULT false,
  apto_red_salud BOOLEAN NOT NULL DEFAULT false,
  verificado BOOLEAN NOT NULL DEFAULT false,
  razon_rechazo TEXT CHECK (razon_rechazo IN ('NO_REGISTRADO_SACS', 'MEDICO_VETERINARIO', 'PROFESION_NO_HABILITADA')),
  
  -- Metadata
  fecha_verificacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_verificaciones_sacs_user_id ON verificaciones_sacs(user_id);
CREATE INDEX IF NOT EXISTS idx_verificaciones_sacs_cedula ON verificaciones_sacs(cedula);
CREATE INDEX IF NOT EXISTS idx_verificaciones_sacs_apto ON verificaciones_sacs(apto_red_salud);
CREATE INDEX IF NOT EXISTS idx_verificaciones_sacs_fecha ON verificaciones_sacs(fecha_verificacion DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_verificaciones_sacs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_verificaciones_sacs_updated_at
  BEFORE UPDATE ON verificaciones_sacs
  FOR EACH ROW
  EXECUTE FUNCTION update_verificaciones_sacs_updated_at();

-- RLS Policies
ALTER TABLE verificaciones_sacs ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias verificaciones
CREATE POLICY "Users can view own verifications"
  ON verificaciones_sacs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar verificaciones (via service role)
CREATE POLICY "Service role can insert verifications"
  ON verificaciones_sacs
  FOR INSERT
  WITH CHECK (true);

-- Admins pueden ver todas las verificaciones
CREATE POLICY "Admins can view all verifications"
  ON verificaciones_sacs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'
    )
  );

-- ============================================
-- ACTUALIZAR TABLA: medico_profiles
-- Agregar campos de verificación SACS
-- ============================================

ALTER TABLE medico_profiles
ADD COLUMN IF NOT EXISTS cedula_verificada BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sacs_verificado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sacs_nombre TEXT,
ADD COLUMN IF NOT EXISTS sacs_matricula TEXT,
ADD COLUMN IF NOT EXISTS sacs_especialidad TEXT,
ADD COLUMN IF NOT EXISTS sacs_fecha_verificacion TIMESTAMPTZ;

-- Índice para búsquedas de médicos verificados
CREATE INDEX IF NOT EXISTS idx_medico_profiles_sacs_verificado 
  ON medico_profiles(sacs_verificado) 
  WHERE sacs_verificado = true;

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON TABLE verificaciones_sacs IS 'Registro de todas las verificaciones de médicos en el sistema SACS de Venezuela';
COMMENT ON COLUMN verificaciones_sacs.cedula IS 'Número de cédula del profesional';
COMMENT ON COLUMN verificaciones_sacs.tipo_documento IS 'V = Venezolano, E = Extranjero';
COMMENT ON COLUMN verificaciones_sacs.profesiones IS 'Array JSON con todas las profesiones registradas en SACS';
COMMENT ON COLUMN verificaciones_sacs.postgrados IS 'Array JSON con todos los postgrados registrados en SACS';
COMMENT ON COLUMN verificaciones_sacs.apto_red_salud IS 'true si el profesional puede usar Red-Salud';
COMMENT ON COLUMN verificaciones_sacs.razon_rechazo IS 'Razón por la cual fue rechazado (si aplica)';
