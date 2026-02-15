-- Migración: Configuración de Storage para documentos de médicos
-- Fecha: 2026-02-13
-- Descripción: Crea bucket y políticas RLS para almacenar certificados,
--              CV y otros documentos profesionales de los médicos

-- ============================================
-- 1. CREAR BUCKET DE STORAGE
-- ============================================

-- Insertar bucket en storage.buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'doctor-documents',
  'doctor-documents',
  FALSE, -- No público, requiere autenticación
  5242880, -- 5MB en bytes
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/jpg',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', -- .docx
    'application/msword' -- .doc
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. POLÍTICAS RLS PARA EL BUCKET
-- ============================================

-- Permitir a los médicos subir archivos a su propia carpeta
CREATE POLICY "Doctors can upload their own documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'doctor-documents' AND
  -- La carpeta debe ser el ID del usuario autenticado
  (storage.foldername(name))[1] = auth.uid()::text AND
  -- Solo médicos pueden subir (tienen registro en doctor_profiles)
  EXISTS (
    SELECT 1 FROM doctor_profiles 
    WHERE id = auth.uid()
  )
);

-- Permitir a los médicos ver sus propios archivos
CREATE POLICY "Doctors can view their own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a los médicos actualizar sus propios archivos
CREATE POLICY "Doctors can update their own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'doctor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'doctor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Permitir a los médicos eliminar sus propios archivos
CREATE POLICY "Doctors can delete their own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'doctor-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 3. POLÍTICAS ADICIONALES PARA ADMINS
-- ============================================

-- Los admins pueden ver todos los documentos
CREATE POLICY "Admins can view all doctor documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'doctor-documents' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND rol = 'admin'
  )
);

-- Los admins pueden eliminar cualquier documento (moderación)
CREATE POLICY "Admins can delete any doctor document"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'doctor-documents' AND
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND rol = 'admin'
  )
);

-- ============================================
-- 4. ESTRUCTURA DE CARPETAS RECOMENDADA
-- ============================================

-- La estructura de carpetas seguirá el patrón:
-- doctor-documents/
--   {user_id}/
--     certifications/
--       {timestamp}-{random}.pdf
--     cv/
--       {timestamp}-{random}.pdf
--     licenses/
--       {timestamp}-{random}.pdf
--     other/
--       {timestamp}-{random}.pdf

-- Esto se maneja desde el frontend en el hook useFileUploadStorage.ts

-- ============================================
-- 5. TABLA DE REGISTRO DE DOCUMENTOS (OPCIONAL)
-- ============================================

-- Tabla para trackear documentos subidos (metadata adicional)
CREATE TABLE IF NOT EXISTS doctor_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctor_profiles(id) ON DELETE CASCADE,
  
  -- Información del archivo
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Ruta completa en Storage
  file_url TEXT NOT NULL, -- URL pública generada por Supabase
  file_size INTEGER, -- Bytes
  mime_type TEXT,
  
  -- Metadata
  document_type TEXT NOT NULL CHECK (document_type IN ('certification', 'cv', 'license', 'other')),
  document_title TEXT, -- Título descriptivo
  document_description TEXT,
  
  -- Verificación
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES profiles(id),
  
  -- Seguridad
  virus_scan_status TEXT CHECK (virus_scan_status IN ('pending', 'clean', 'infected')) DEFAULT 'pending',
  scan_date TIMESTAMP WITH TIME ZONE,
  
  -- Auditoría
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(doctor_id, file_path)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_doctor_documents_doctor ON doctor_documents(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_documents_type ON doctor_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_doctor_documents_verified ON doctor_documents(is_verified);

-- RLS para doctor_documents
ALTER TABLE doctor_documents ENABLE ROW LEVEL SECURITY;

-- Los médicos pueden ver sus propios documentos
CREATE POLICY "Doctors can view their own document records"
ON doctor_documents
FOR SELECT
TO authenticated
USING (doctor_id = auth.uid());

-- Los médicos pueden insertar registros de sus documentos
CREATE POLICY "Doctors can create their own document records"
ON doctor_documents
FOR INSERT
TO authenticated
WITH CHECK (doctor_id = auth.uid());

-- Los médicos pueden actualizar sus propios registros
CREATE POLICY "Doctors can update their own document records"
ON doctor_documents
FOR UPDATE
TO authenticated
USING (doctor_id = auth.uid())
WITH CHECK (doctor_id = auth.uid());

-- Los médicos pueden eliminar sus propios registros
CREATE POLICY "Doctors can delete their own document records"
ON doctor_documents
FOR DELETE
TO authenticated
USING (doctor_id = auth.uid());

-- Los admins pueden ver todos los documentos
CREATE POLICY "Admins can view all document records"
ON doctor_documents
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND rol = 'admin'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_doctor_documents_updated_at
  BEFORE UPDATE ON doctor_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. FUNCIÓN HELPER PARA LIMPIAR ARCHIVOS HUÉRFANOS
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_documents()
RETURNS TABLE (deleted_count BIGINT) AS $$
DECLARE
  count_deleted BIGINT := 0;
BEGIN
  -- Eliminar registros de doctor_documents cuyo archivo ya no existe en Storage
  -- Esto debe ejecutarse manualmente o como cronjob
  
  DELETE FROM doctor_documents
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects
    WHERE bucket_id = 'doctor-documents'
    AND name = doctor_documents.file_path
  );
  
  GET DIAGNOSTICS count_deleted = ROW_COUNT;
  
  RETURN QUERY SELECT count_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_orphaned_documents IS 'Elimina registros de documentos cuyos archivos ya no existen en Storage';

-- ============================================
-- 7. VISTA PARA ESTADÍSTICAS DE DOCUMENTOS
-- ============================================

CREATE OR REPLACE VIEW doctor_documents_stats AS
SELECT 
  dp.id as doctor_id,
  CONCAT(p.nombres, ' ', p.apellidos) as doctor_name,
  COUNT(*) as total_documents,
  COUNT(*) FILTER (WHERE dd.document_type = 'certification') as certifications_count,
  COUNT(*) FILTER (WHERE dd.document_type = 'cv') as cv_count,
  COUNT(*) FILTER (WHERE dd.document_type = 'license') as licenses_count,
  COUNT(*) FILTER (WHERE dd.is_verified = true) as verified_count,
  SUM(dd.file_size)::BIGINT as total_storage_bytes,
  ROUND(SUM(dd.file_size)::NUMERIC / 1024 / 1024, 2) as total_storage_mb
FROM doctor_profiles dp
JOIN profiles p ON dp.id = p.id
LEFT JOIN doctor_documents dd ON dp.id = dd.doctor_id
GROUP BY dp.id, p.nombres, p.apellidos;

COMMENT ON VIEW doctor_documents_stats IS 'Estadísticas de documentos por médico';

-- ============================================
-- NOTAS DE CONFIGURACIÓN
-- ============================================

-- IMPORTANTE: Después de ejecutar esta migración:
-- 
-- 1. Verificar que el bucket se creó correctamente:
--    SELECT * FROM storage.buckets WHERE id = 'doctor-documents';
--
-- 2. Probar subida de archivo desde el frontend
--
-- 3. Configurar CORS si es necesario (desde Supabase Dashboard):
--    Settings > Storage > CORS Configuration
--
-- 4. Opcional: Configurar limpieza automática de archivos temporales
--    usando pg_cron o Edge Functions
--
-- 5. Monitorear uso de storage:
--    SELECT * FROM doctor_documents_stats;

-- ============================================
-- ROLLBACK
-- ============================================

/*
-- Para revertir esta migración:

DROP VIEW IF EXISTS doctor_documents_stats;
DROP FUNCTION IF EXISTS cleanup_orphaned_documents;
DROP TABLE IF EXISTS doctor_documents;

DROP POLICY IF EXISTS "Admins can view all document records" ON doctor_documents;
DROP POLICY IF EXISTS "Doctors can delete their own document records" ON doctor_documents;
DROP POLICY IF EXISTS "Doctors can update their own document records" ON doctor_documents;
DROP POLICY IF EXISTS "Doctors can create their own document records" ON doctor_documents;
DROP POLICY IF EXISTS "Doctors can view their own document records" ON doctor_documents;

DROP POLICY IF EXISTS "Admins can delete any doctor document" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all doctor documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can update their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Doctors can upload their own documents" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'doctor-documents';
*/
