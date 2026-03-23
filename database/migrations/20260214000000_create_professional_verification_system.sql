-- ============================================
-- MIGRACIÓN: Sistema de Verificación Multi-Nivel
-- Fecha: 2026-02-14
-- Descripción: Soporte para múltiples roles profesionales con diferentes
--              niveles de verificación (SACS, manual, supervisor, delegado)
-- ============================================

-- 1. Crear ENUMs para el sistema
-- ============================================

CREATE TYPE verification_level AS ENUM (
  'sacs_verified',        -- Verificado por SACS (solo médicos)
  'manual_verified',      -- Verificación manual por admin
  'supervisor_verified',  -- Verificado por supervisor del área
  'doctor_delegated',     -- Delegado por médico responsable
  'pending',              -- Pendiente de verificación
  'rejected'              -- Rechazado
);

CREATE TYPE verification_document_type AS ENUM (
  'cedula',
  'titulo_universitario',
  'certificado_especialidad',
  'licencia_profesional',
  'certificado_tecnico',
  'constancia_trabajo',
  'carta_recomendacion',
  'curriculum_vitae',
  'carnet_colegio',
  'otro'
);

CREATE TYPE main_role_type AS ENUM (
  'medico',              -- Médico verificado por SACS
  'profesional_salud',   -- Enfermeros, nutricionistas, psicólogos, etc.
  'tecnico_salud'        -- Técnicos radiológicos, asistentes, etc.
);

CREATE TYPE profesional_salud_subtype AS ENUM (
  'enfermero',
  'enfermero_jefe',
  'nutricionista',
  'nutricionista_clinico',
  'psicologo',
  'psicologo_clinico',
  'fisioterapeuta',
  'terapeuta_ocupacional',
  'terapeuta_respiratorio',
  'fonoaudiologo',
  'asistente_medico',
  'otro'
);

CREATE TYPE tecnico_salud_subtype AS ENUM (
  'tecnico_radiologo',
  'tecnico_radiologia',
  'tecnico_electrocardiografia',
  'tecnico_ecografia',
  'tecnico_quirofano',
  'tecnico_esterilizacion',
  'tecnico_laboratorio_clinico',
  'tecnico_hemodinamia',
  'tecnico_emergencias',
  'otro'
);

-- 2. Crear tabla de verificaciones profesionales
-- ============================================

CREATE TABLE professional_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Nivel de verificación
  verification_level verification_level NOT NULL DEFAULT 'pending',
  verification_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (verification_status IN ('pending', 'approved', 'rejected', 'expired', 'under_review')),
  
  -- Datos del profesional
  main_role main_role_type NOT NULL,
  sub_role TEXT, -- Será uno de los subtypes según el main_role
  professional_id TEXT, -- Número de colegiatura, matrícula, licencia, etc.
  institution TEXT, -- Institución donde trabaja
  department TEXT, -- Departamento o área específica
  
  -- Verificación SACS (solo para médicos)
  sacs_cedula TEXT,
  sacs_verified BOOLEAN DEFAULT false,
  sacs_data JSONB,
  sacs_verified_at TIMESTAMPTZ,
  
  -- Documentos subidos (referencias a verification_documents)
  documents_count INTEGER DEFAULT 0,
  documents_approved INTEGER DEFAULT 0,
  
  -- Verificador (quién aprobó)
  verified_by UUID REFERENCES profiles(id),
  verified_by_role TEXT, -- admin, supervisor, doctor
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  
  -- Restricciones y permisos personalizados
  restrictions JSONB DEFAULT '{}'::jsonb,
  /*
    Ejemplo de restricciones:
    {
      "cannot_prescribe_controlled_substances": true,
      "requires_supervision": true,
      "max_patients_per_day": 20,
      "working_hours": {"start": "08:00", "end": "17:00"}
    }
  */
  
  custom_permissions JSONB DEFAULT '{}'::jsonb,
  /*
    Ejemplo de permisos personalizados:
    {
      "radiology": {"operate_equipment": true, "approve_reports": false},
      "laboratory": {"input_results": true, "validate_results": false},
      "medical_records": {"read": true, "write": false}
    }
  */
  
  -- Control de vigencia
  expires_at TIMESTAMPTZ, -- Algunas verificaciones podrían expirar (ej: licencias anuales)
  last_reviewed_at TIMESTAMPTZ,
  next_review_date DATE, -- Fecha de próxima revisión
  
  -- Supervisor o responsable (para técnicos y administrativos)
  supervisor_id UUID REFERENCES profiles(id),
  supervisor_approved BOOLEAN DEFAULT false,
  supervisor_approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id)
);

-- Índices para professional_verifications
CREATE INDEX idx_prof_verif_user_id ON professional_verifications(user_id);
CREATE INDEX idx_prof_verif_level ON professional_verifications(verification_level);
CREATE INDEX idx_prof_verif_status ON professional_verifications(verification_status);
CREATE INDEX idx_prof_verif_role ON professional_verifications(main_role, sub_role);
CREATE INDEX idx_prof_verif_verified_by ON professional_verifications(verified_by);
CREATE INDEX idx_prof_verif_supervisor ON professional_verifications(supervisor_id);
CREATE INDEX idx_prof_verif_institution ON professional_verifications(institution);
CREATE INDEX idx_prof_verif_expires ON professional_verifications(expires_at) 
  WHERE expires_at IS NOT NULL;

COMMENT ON TABLE professional_verifications IS 'Verificación universal para todos los tipos de profesionales de salud';
COMMENT ON COLUMN professional_verifications.verification_level IS 'Nivel de verificación: SACS (auto), manual (admin), supervisor, o delegado';
COMMENT ON COLUMN professional_verifications.professional_id IS 'ID profesional: matrícula, licencia, colegiatura, etc.';

-- 3. Crear tabla de documentos de verificación
-- ============================================

CREATE TABLE verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES professional_verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Tipo y metadata del documento
  document_type verification_document_type NOT NULL,
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL, -- URL en Supabase Storage
  file_path TEXT, -- Path interno en storage
  file_size INTEGER,
  mime_type TEXT,
  
  -- Estado de revisión
  review_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (review_status IN ('pending', 'approved', 'rejected', 'requires_change')),
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  rejection_reason TEXT,
  reviewed_at TIMESTAMPTZ,
  
  -- Control de versiones (si el documento se reemplaza)
  version INTEGER DEFAULT 1,
  replaced_by UUID REFERENCES verification_documents(id),
  is_current BOOLEAN DEFAULT true,
  
  -- Metadata adicional del documento
  document_metadata JSONB DEFAULT '{}'::jsonb,
  /*
    Ejemplo:
    {
      "issue_date": "2024-01-15",
      "expiry_date": "2029-01-15",
      "issuing_authority": "Colegio de Médicos",
      "document_number": "CMV-12345"
    }
  */
  
  -- Metadata
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_file_url CHECK (file_url ~ '^https?://.*')
);

-- Índices para verification_documents
CREATE INDEX idx_verif_docs_verification_id ON verification_documents(verification_id);
CREATE INDEX idx_verif_docs_user_id ON verification_documents(user_id);
CREATE INDEX idx_verif_docs_status ON verification_documents(review_status);
CREATE INDEX idx_verif_docs_type ON verification_documents(document_type);
CREATE INDEX idx_verif_docs_current ON verification_documents(is_current) WHERE is_current = true;
CREATE INDEX idx_verif_docs_reviewed_by ON verification_documents(reviewed_by);

COMMENT ON TABLE verification_documents IS 'Documentos subidos para verificación profesional';
COMMENT ON COLUMN verification_documents.version IS 'Versión del documento (incrementa si se reemplaza)';

-- 4. Crear tabla de historial de cambios de verificación
-- ============================================

CREATE TABLE verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES professional_verifications(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id),
  
  -- Cambio realizado
  action TEXT NOT NULL CHECK (action IN (
    'created', 'approved', 'rejected', 'updated', 'expired', 
    'renewed', 'suspended', 'reactivated', 'documents_added',
    'permissions_changed', 'supervisor_changed'
  )),
  
  -- Quién hizo el cambio
  performed_by UUID REFERENCES profiles(id),
  performed_by_role TEXT,
  
  -- Detalles del cambio
  changes JSONB, -- Diff de lo que cambió
  reason TEXT,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Para auditoría completa
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX idx_verif_history_verification_id ON verification_history(verification_id);
CREATE INDEX idx_verif_history_user_id ON verification_history(user_id);
CREATE INDEX idx_verif_history_performed_by ON verification_history(performed_by);
CREATE INDEX idx_verif_history_created ON verification_history(created_at DESC);
CREATE INDEX idx_verif_history_action ON verification_history(action);

COMMENT ON TABLE verification_history IS 'Auditoría completa de cambios en verificaciones profesionales';

-- 5. Triggers para updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_professional_verifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_professional_verifications_updated_at
  BEFORE UPDATE ON professional_verifications
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_verifications_updated_at();

CREATE TRIGGER trg_update_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_professional_verifications_updated_at();

-- 6. Trigger para actualizar document counts
-- ============================================

CREATE OR REPLACE FUNCTION update_documents_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar contadores en professional_verifications
  UPDATE professional_verifications
  SET 
    documents_count = (
      SELECT COUNT(*) 
      FROM verification_documents 
      WHERE verification_id = NEW.verification_id 
        AND is_current = true
    ),
    documents_approved = (
      SELECT COUNT(*) 
      FROM verification_documents 
      WHERE verification_id = NEW.verification_id 
        AND is_current = true 
        AND review_status = 'approved'
    ),
    updated_at = NOW()
  WHERE id = NEW.verification_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_documents_count_insert
  AFTER INSERT ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_count();

CREATE TRIGGER trg_update_documents_count_update
  AFTER UPDATE OF review_status, is_current ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_documents_count();

-- 7. Función para registrar cambios en el historial
-- ============================================

CREATE OR REPLACE FUNCTION log_verification_change()
RETURNS TRIGGER AS $$
DECLARE
  changes_json JSONB;
BEGIN
  -- Construir JSON con los cambios
  IF TG_OP = 'UPDATE' THEN
    changes_json = jsonb_build_object(
      'old', row_to_json(OLD),
      'new', row_to_json(NEW)
    );
  ELSIF TG_OP = 'INSERT' THEN
    changes_json = jsonb_build_object('new', row_to_json(NEW));
  END IF;
  
  -- Insertar en historial
  INSERT INTO verification_history (
    verification_id,
    user_id,
    action,
    performed_by,
    performed_by_role,
    changes,
    created_at
  ) VALUES (
    NEW.id,
    NEW.user_id,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN NEW.verification_status = 'approved' AND OLD.verification_status != 'approved' THEN 'approved'
      WHEN NEW.verification_status = 'rejected' AND OLD.verification_status != 'rejected' THEN 'rejected'
      ELSE 'updated'
    END,
    NEW.verified_by,
    NEW.verified_by_role,
    changes_json,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_log_verification_change
  AFTER INSERT OR UPDATE ON professional_verifications
  FOR EACH ROW
  EXECUTE FUNCTION log_verification_change();

-- 8. RLS Policies
-- ============================================

ALTER TABLE professional_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_history ENABLE ROW LEVEL SECURITY;

-- Policy: Los usuarios pueden ver su propia verificación
CREATE POLICY "Users can view own verification"
  ON professional_verifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Los usuarios pueden crear su verificación inicial
CREATE POLICY "Users can create own verification"
  ON professional_verifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Los usuarios pueden actualizar su verificación si está pending
CREATE POLICY "Users can update pending verification"
  ON professional_verifications
  FOR UPDATE
  USING (auth.uid() = user_id AND verification_status = 'pending');

-- Policy: Admins pueden ver todas las verificaciones
CREATE POLICY "Admins can view all verifications"
  ON professional_verifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins y supervisores pueden aprobar verificaciones
CREATE POLICY "Admins and supervisors can approve verifications"
  ON professional_verifications
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'medico')
    )
  );

-- Policy: Usuarios pueden subir sus documentos
CREATE POLICY "Users can upload own documents"
  ON verification_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuarios pueden ver sus documentos
CREATE POLICY "Users can view own documents"
  ON verification_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins pueden ver todos los documentos
CREATE POLICY "Admins can view all documents"
  ON verification_documents
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Admins pueden revisar documentos
CREATE POLICY "Admins can review documents"
  ON verification_documents
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Usuarios pueden ver su propio historial
CREATE POLICY "Users can view own history"
  ON verification_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Admins pueden ver todo el historial
CREATE POLICY "Admins can view all history"
  ON verification_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 9. Vistas útiles
-- ============================================

-- Vista de verificaciones pendientes
CREATE OR REPLACE VIEW pending_verifications AS
SELECT 
  pv.*,
  p.nombre_completo,
  p.email,
  p.role as user_current_role,
  CASE 
    WHEN pv.documents_count = 0 THEN 'Sin documentos'
    WHEN pv.documents_approved = pv.documents_count THEN 'Documentos aprobados'
    WHEN pv.documents_approved > 0 THEN 'Parcialmente aprobados'
    ELSE 'En revisión'
  END as documents_status
FROM professional_verifications pv
JOIN profiles p ON p.id = pv.user_id
WHERE pv.verification_status IN ('pending', 'under_review');

-- Vista de verificaciones próximas a vencer
CREATE OR REPLACE VIEW expiring_verifications AS
SELECT 
  pv.*,
  p.nombre_completo,
  p.email,
  (pv.expires_at - NOW()) as time_until_expiry,
  EXTRACT(DAY FROM (pv.expires_at - NOW())) as days_until_expiry
FROM professional_verifications pv
JOIN profiles p ON p.id = pv.user_id
WHERE pv.expires_at IS NOT NULL
  AND pv.expires_at > NOW()
  AND pv.expires_at <= NOW() + INTERVAL '30 days'
  AND pv.verification_status = 'approved'
ORDER BY pv.expires_at ASC;

-- 10. Comentarios finales
-- ============================================

COMMENT ON VIEW pending_verifications IS 'Vista de todas las verificaciones pendientes de aprobación';
COMMENT ON VIEW expiring_verifications IS 'Vista de verificaciones que vencen en los próximos 30 días';

-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
