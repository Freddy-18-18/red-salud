-- ============================================
-- FUNCIONES: Sistema de Verificación Multi-Nivel
-- Fecha: 2026-02-14
-- Descripción: Funciones de utilidad para el sistema de verificación
-- ============================================

-- 1. Función para obtener verificación completa de un usuario
-- ============================================

CREATE OR REPLACE FUNCTION get_user_verification(p_user_id UUID)
RETURNS TABLE (
  verification_id UUID,
  verification_level verification_level,
  verification_status TEXT,
  main_role main_role_type,
  sub_role TEXT,
  professional_id TEXT,
  institution TEXT,
  department TEXT,
  sacs_verified BOOLEAN,
  sacs_data JSONB,
  documents_count INTEGER,
  documents_approved INTEGER,
  documents_pending INTEGER,
  verified_by_name TEXT,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  days_until_expiry INTEGER,
  is_expired BOOLEAN,
  custom_permissions JSONB,
  restrictions JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id as verification_id,
    pv.verification_level,
    pv.verification_status,
    pv.main_role,
    pv.sub_role,
    pv.professional_id,
    pv.institution,
    pv.department,
    pv.sacs_verified,
    pv.sacs_data,
    pv.documents_count,
    pv.documents_approved,
    (pv.documents_count - pv.documents_approved) as documents_pending,
    vp.nombre_completo as verified_by_name,
    pv.verified_at,
    pv.expires_at,
    EXTRACT(DAY FROM (pv.expires_at - NOW()))::INTEGER as days_until_expiry,
    (pv.expires_at IS NOT NULL AND pv.expires_at < NOW()) as is_expired,
    pv.custom_permissions,
    pv.restrictions
  FROM professional_verifications pv
  LEFT JOIN profiles vp ON vp.id = pv.verified_by
  WHERE pv.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_verification IS 'Obtiene toda la información de verificación de un usuario';

-- 2. Función para aprobar una verificación
-- ============================================

CREATE OR REPLACE FUNCTION approve_verification(
  p_verification_id UUID,
  p_verified_by UUID,
  p_verified_by_role TEXT,
  p_notes TEXT DEFAULT NULL,
  p_expires_at TIMESTAMPTZ DEFAULT NULL,
  p_custom_permissions JSONB DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
  v_user_id UUID;
  v_main_role main_role_type;
  v_documents_count INTEGER;
  v_documents_approved INTEGER;
BEGIN
  -- Obtener información de la verificación
  SELECT user_id, main_role, documents_count, documents_approved
  INTO v_user_id, v_main_role, v_documents_count, v_documents_approved
  FROM professional_verifications
  WHERE id = p_verification_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Verification not found'
    );
  END IF;
  
  -- Validar que todos los documentos estén aprobados
  IF v_documents_count > 0 AND v_documents_approved < v_documents_count THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not all documents have been approved',
      'documents_pending', v_documents_count - v_documents_approved
    );
  END IF;
  
  -- Actualizar la verificación
  UPDATE professional_verifications
  SET 
    verification_status = 'approved',
    verified_by = p_verified_by,
    verified_by_role = p_verified_by_role,
    verification_notes = p_notes,
    verified_at = NOW(),
    expires_at = p_expires_at,
    custom_permissions = COALESCE(p_custom_permissions, custom_permissions),
    updated_at = NOW()
  WHERE id = p_verification_id;
  
  -- Registrar en historial
  INSERT INTO verification_history (
    verification_id,
    user_id,
    action,
    performed_by,
    performed_by_role,
    notes,
    changes,
    created_at
  ) VALUES (
    p_verification_id,
    v_user_id,
    'approved',
    p_verified_by,
    p_verified_by_role,
    p_notes,
    jsonb_build_object(
      'status', 'approved',
      'verified_at', NOW(),
      'expires_at', p_expires_at
    ),
    NOW()
  );
  
  -- Devolver resultado
  RETURN jsonb_build_object(
    'success', true,
    'verification_id', p_verification_id,
    'user_id', v_user_id,
    'approved_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION approve_verification IS 'Aprueba una verificación profesional';

-- 3. Función para rechazar una verificación
-- ============================================

CREATE OR REPLACE FUNCTION reject_verification(
  p_verification_id UUID,
  p_rejected_by UUID,
  p_rejected_by_role TEXT,
  p_rejection_reason TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Obtener user_id
  SELECT user_id INTO v_user_id
  FROM professional_verifications
  WHERE id = p_verification_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Verification not found'
    );
  END IF;
  
  -- Actualizar la verificación
  UPDATE professional_verifications
  SET 
    verification_status = 'rejected',
    verified_by = p_rejected_by,
    verified_by_role = p_rejected_by_role,
    verification_notes = p_rejection_reason || COALESCE(' - ' || p_notes, ''),
    verified_at = NOW(),
    updated_at = NOW()
  WHERE id = p_verification_id;
  
  -- Registrar en historial
  INSERT INTO verification_history (
    verification_id,
    user_id,
    action,
    performed_by,
    performed_by_role,
    reason,
    notes,
    changes,
    created_at
  ) VALUES (
    p_verification_id,
    v_user_id,
    'rejected',
    p_rejected_by,
    p_rejected_by_role,
    p_rejection_reason,
    p_notes,
    jsonb_build_object(
      'status', 'rejected',
      'rejected_at', NOW(),
      'reason', p_rejection_reason
    ),
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'verification_id', p_verification_id,
    'user_id', v_user_id,
    'rejected_at', NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION reject_verification IS 'Rechaza una verificación profesional';

-- 4. Función para verificar permisos de un usuario
-- ============================================

CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_permission_path TEXT[] -- Ejemplo: ['radiology', 'operate_equipment']
)
RETURNS BOOLEAN AS $$
DECLARE
  v_verification RECORD;
  v_has_permission BOOLEAN;
BEGIN
  -- Obtener verificación del usuario
  SELECT 
    verification_status,
    custom_permissions,
    expires_at
  INTO v_verification
  FROM professional_verifications
  WHERE user_id = p_user_id;
  
  -- Si no hay verificación, no tiene permiso
  IF v_verification IS NULL THEN
    RETURN false;
  END IF;
  
  -- Si la verificación no está aprobada, no tiene permiso
  IF v_verification.verification_status != 'approved' THEN
    RETURN false;
  END IF;
  
  -- Si está expirada, no tiene permiso
  IF v_verification.expires_at IS NOT NULL AND v_verification.expires_at < NOW() THEN
    RETURN false;
  END IF;
  
  -- Navegar por el JSON de permisos usando el path
  SELECT 
    COALESCE(
      (v_verification.custom_permissions #>> p_permission_path)::BOOLEAN,
      false
    )
  INTO v_has_permission;
  
  RETURN v_has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_user_permission IS 'Verifica si un usuario tiene un permiso específico';

-- 5. Función para obtener profesionales por supervisar
-- ============================================

CREATE OR REPLACE FUNCTION get_supervised_professionals(p_supervisor_id UUID)
RETURNS TABLE (
  user_id UUID,
  nombre_completo TEXT,
  email TEXT,
  main_role main_role_type,
  sub_role TEXT,
  verification_status TEXT,
  institution TEXT,
  department TEXT,
  documents_count INTEGER,
  documents_approved INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as user_id,
    p.nombre_completo,
    p.email,
    pv.main_role,
    pv.sub_role,
    pv.verification_status,
    pv.institution,
    pv.department,
    pv.documents_count,
    pv.documents_approved,
    pv.created_at
  FROM professional_verifications pv
  JOIN profiles p ON p.id = pv.user_id
  WHERE pv.supervisor_id = p_supervisor_id
  ORDER BY pv.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_supervised_professionals IS 'Obtiene todos los profesionales supervisados por un usuario';

-- 6. Función para verificaciones próximas a vencer
-- ============================================

CREATE OR REPLACE FUNCTION get_expiring_verifications(p_days_threshold INTEGER DEFAULT 30)
RETURNS TABLE (
  verification_id UUID,
  user_id UUID,
  nombre_completo TEXT,
  email TEXT,
  main_role main_role_type,
  sub_role TEXT,
  professional_id TEXT,
  expires_at TIMESTAMPTZ,
  days_until_expiry INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pv.id as verification_id,
    pv.user_id,
    p.nombre_completo,
    p.email,
    pv.main_role,
    pv.sub_role,
    pv.professional_id,
    pv.expires_at,
    EXTRACT(DAY FROM (pv.expires_at - NOW()))::INTEGER as days_until_expiry
  FROM professional_verifications pv
  JOIN profiles p ON p.id = pv.user_id
  WHERE pv.expires_at IS NOT NULL
    AND pv.expires_at > NOW()
    AND pv.expires_at <= NOW() + (p_days_threshold || ' days')::INTERVAL
    AND pv.verification_status = 'approved'
  ORDER BY pv.expires_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_expiring_verifications IS 'Obtiene verificaciones próximas a vencer';

-- 7. Función para renovar verificación
-- ============================================

CREATE OR REPLACE FUNCTION renew_verification(
  p_verification_id UUID,
  p_renewed_by UUID,
  p_new_expiry_date TIMESTAMPTZ,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_old_expiry TIMESTAMPTZ;
BEGIN
  -- Obtener datos actuales
  SELECT user_id, expires_at
  INTO v_user_id, v_old_expiry
  FROM professional_verifications
  WHERE id = p_verification_id;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Verification not found'
    );
  END IF;
  
  -- Actualizar fecha de expiración
  UPDATE professional_verifications
  SET 
    expires_at = p_new_expiry_date,
    last_reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_verification_id;
  
  -- Registrar en historial
  INSERT INTO verification_history (
    verification_id,
    user_id,
    action,
    performed_by,
    performed_by_role,
    notes,
    changes,
    created_at
  ) VALUES (
    p_verification_id,
    v_user_id,
    'renewed',
    p_renewed_by,
    'admin',
    p_notes,
    jsonb_build_object(
      'old_expiry', v_old_expiry,
      'new_expiry', p_new_expiry_date,
      'renewed_at', NOW()
    ),
    NOW()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'verification_id', p_verification_id,
    'old_expiry', v_old_expiry,
    'new_expiry', p_new_expiry_date
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION renew_verification IS 'Renueva una verificación extendiendo su fecha de expiración';

-- 8. Función para estadísticas del panel de admin
-- ============================================

CREATE OR REPLACE FUNCTION get_verification_statistics()
RETURNS JSONB AS $$
DECLARE
  v_stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_verifications', COUNT(*),
    'pending', COUNT(*) FILTER (WHERE verification_status = 'pending'),
    'under_review', COUNT(*) FILTER (WHERE verification_status = 'under_review'),
    'approved', COUNT(*) FILTER (WHERE verification_status = 'approved'),
    'rejected', COUNT(*) FILTER (WHERE verification_status = 'rejected'),
    'by_level', jsonb_object_agg(
      verification_level::TEXT,
      level_count
    )
  ) INTO v_stats
  FROM (
    SELECT 
      verification_status,
      verification_level,
      COUNT(*) as level_count
    FROM professional_verifications
    GROUP BY verification_status, verification_level
  ) subq;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_verification_statistics IS 'Obtiene estadísticas del sistema de verificación';

-- ============================================
-- GRANTS - Permisos para las funciones
-- ============================================

-- Las funciones son SECURITY DEFINER, se ejecutan con permisos del owner
-- Solo usuarios autenticados pueden ejecutarlas
GRANT EXECUTE ON FUNCTION get_user_verification TO authenticated;
GRANT EXECUTE ON FUNCTION approve_verification TO authenticated;
GRANT EXECUTE ON FUNCTION reject_verification TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_permission TO authenticated;
GRANT EXECUTE ON FUNCTION get_supervised_professionals TO authenticated;
GRANT EXECUTE ON FUNCTION get_expiring_verifications TO authenticated;
GRANT EXECUTE ON FUNCTION renew_verification TO authenticated;
GRANT EXECUTE ON FUNCTION get_verification_statistics TO authenticated;

-- ============================================
-- FIN DE FUNCIONES
-- ============================================
