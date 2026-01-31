-- =====================================================
-- SISTEMA DE SEGURIDAD AVANZADO PARA RED-SALUD
-- =====================================================

-- 1. Tabla para Autenticación de Dos Factores (2FA)
CREATE TABLE IF NOT EXISTS user_2fa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  method VARCHAR(20) NOT NULL CHECK (method IN ('sms', 'authenticator', 'email')),
  is_enabled BOOLEAN DEFAULT false,
  phone_number VARCHAR(20), -- Para SMS
  secret_key TEXT, -- Para authenticator app (TOTP)
  backup_codes TEXT[], -- Códigos de respaldo
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, method)
);

-- 2. Tabla para Códigos de Verificación 2FA
CREATE TABLE IF NOT EXISTS user_2fa_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  method VARCHAR(20) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla para Sesiones Activas
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  ip_address INET,
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_current BOOLEAN DEFAULT false,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- 4. Tabla para Historial de Inicios de Sesión
CREATE TABLE IF NOT EXISTS login_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
  method VARCHAR(50), -- 'password', 'oauth_google', etc.
  ip_address INET,
  user_agent TEXT,
  device_fingerprint TEXT,
  location_country VARCHAR(100),
  location_city VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  failure_reason VARCHAR(255),
  is_suspicious BOOLEAN DEFAULT false,
  risk_score INTEGER DEFAULT 0, -- 0-100
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla para Notificaciones de Seguridad
CREATE TABLE IF NOT EXISTS security_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'new_login', 
    'unknown_device', 
    'password_changed', 
    'suspicious_activity',
    'account_locked',
    '2fa_enabled',
    '2fa_disabled'
  )),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  is_read BOOLEAN DEFAULT false,
  metadata JSONB,
  sent_via VARCHAR(20)[], -- ['email', 'push', 'sms']
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla para Análisis de Comportamiento
CREATE TABLE IF NOT EXISTS user_behavior_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  login_count INTEGER DEFAULT 0,
  unique_ips INTEGER DEFAULT 0,
  unique_devices INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  suspicious_activities INTEGER DEFAULT 0,
  risk_score INTEGER DEFAULT 0, -- 0-100
  anomalies JSONB, -- Detalles de anomalías detectadas
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, analysis_date)
);

-- 7. Tabla para Bloqueos de Cuenta
CREATE TABLE IF NOT EXISTS account_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL,
  locked_by UUID REFERENCES auth.users(id), -- Admin que bloqueó (si aplica)
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  unlock_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB
);

-- 8. Tabla para Dispositivos Confiables
CREATE TABLE IF NOT EXISTS trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_fingerprint TEXT NOT NULL,
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  browser VARCHAR(100),
  os VARCHAR(100),
  last_used TIMESTAMPTZ DEFAULT NOW(),
  trust_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, device_fingerprint)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX idx_user_2fa_settings_user_id ON user_2fa_settings(user_id);
CREATE INDEX idx_user_2fa_codes_user_id ON user_2fa_codes(user_id);
CREATE INDEX idx_user_2fa_codes_expires_at ON user_2fa_codes(expires_at);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session_token ON user_sessions(session_token);
CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_created_at ON login_history(created_at DESC);
CREATE INDEX idx_login_history_is_suspicious ON login_history(is_suspicious) WHERE is_suspicious = true;
CREATE INDEX idx_security_notifications_user_id ON security_notifications(user_id);
CREATE INDEX idx_security_notifications_is_read ON security_notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_user_behavior_user_id ON user_behavior_analysis(user_id);
CREATE INDEX idx_account_locks_user_id ON account_locks(user_id);
CREATE INDEX idx_account_locks_is_active ON account_locks(is_active) WHERE is_active = true;
CREATE INDEX idx_trusted_devices_user_id ON trusted_devices(user_id);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para limpiar códigos 2FA expirados
CREATE OR REPLACE FUNCTION cleanup_expired_2fa_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM user_2fa_codes
  WHERE expires_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_2fa_settings
CREATE TRIGGER update_user_2fa_settings_updated_at
  BEFORE UPDATE ON user_2fa_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para detectar actividad sospechosa
CREATE OR REPLACE FUNCTION detect_suspicious_login(
  p_user_id UUID,
  p_ip_address INET,
  p_device_fingerprint TEXT
)
RETURNS INTEGER AS $$
DECLARE
  v_risk_score INTEGER := 0;
  v_recent_failures INTEGER;
  v_known_ip BOOLEAN;
  v_known_device BOOLEAN;
BEGIN
  -- Verificar intentos fallidos recientes
  SELECT COUNT(*) INTO v_recent_failures
  FROM login_history
  WHERE user_id = p_user_id
    AND status = 'failed'
    AND created_at > NOW() - INTERVAL '1 hour';
  
  IF v_recent_failures > 3 THEN
    v_risk_score := v_risk_score + 30;
  END IF;

  -- Verificar si es una IP conocida
  SELECT EXISTS(
    SELECT 1 FROM login_history
    WHERE user_id = p_user_id
      AND ip_address = p_ip_address
      AND status = 'success'
      AND created_at > NOW() - INTERVAL '30 days'
  ) INTO v_known_ip;

  IF NOT v_known_ip THEN
    v_risk_score := v_risk_score + 25;
  END IF;

  -- Verificar si es un dispositivo conocido
  SELECT EXISTS(
    SELECT 1 FROM trusted_devices
    WHERE user_id = p_user_id
      AND device_fingerprint = p_device_fingerprint
      AND trust_expires_at > NOW()
  ) INTO v_known_device;

  IF NOT v_known_device THEN
    v_risk_score := v_risk_score + 20;
  END IF;

  RETURN v_risk_score;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE user_2fa_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_2fa_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_locks ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_devices ENABLE ROW LEVEL SECURITY;

-- Políticas para user_2fa_settings
CREATE POLICY "Users can view their own 2FA settings"
  ON user_2fa_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
  ON user_2fa_settings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
  ON user_2fa_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_sessions
CREATE POLICY "Users can view their own sessions"
  ON user_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON user_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para login_history
CREATE POLICY "Users can view their own login history"
  ON login_history FOR SELECT
  USING (auth.uid() = user_id);

-- Políticas para security_notifications
CREATE POLICY "Users can view their own notifications"
  ON security_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON security_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para trusted_devices
CREATE POLICY "Users can view their own trusted devices"
  ON trusted_devices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own trusted devices"
  ON trusted_devices FOR ALL
  USING (auth.uid() = user_id);

-- =====================================================
-- VISTAS ÚTILES
-- =====================================================

-- Vista de sesiones activas con información detallada
CREATE OR REPLACE VIEW active_sessions_view AS
SELECT 
  s.id,
  s.user_id,
  s.device_name,
  s.device_type,
  s.browser,
  s.os,
  s.ip_address,
  s.location_city,
  s.location_country,
  s.is_current,
  s.last_activity,
  s.created_at,
  EXTRACT(EPOCH FROM (NOW() - s.last_activity)) / 60 AS minutes_inactive
FROM user_sessions s
WHERE s.expires_at > NOW() OR s.expires_at IS NULL;

-- Vista de actividad sospechosa reciente
CREATE OR REPLACE VIEW suspicious_activity_view AS
SELECT 
  lh.user_id,
  lh.ip_address,
  lh.location_city,
  lh.location_country,
  lh.risk_score,
  lh.created_at,
  COUNT(*) OVER (PARTITION BY lh.user_id) as total_suspicious_logins
FROM login_history lh
WHERE lh.is_suspicious = true
  AND lh.created_at > NOW() - INTERVAL '7 days'
ORDER BY lh.created_at DESC;

-- =====================================================
-- DATOS INICIALES
-- =====================================================

-- Crear job para limpiar códigos expirados (requiere pg_cron extension)
-- SELECT cron.schedule('cleanup-2fa-codes', '0 * * * *', 'SELECT cleanup_expired_2fa_codes()');

COMMENT ON TABLE user_2fa_settings IS 'Configuración de autenticación de dos factores por usuario';
COMMENT ON TABLE user_sessions IS 'Sesiones activas de usuarios con información de dispositivo y ubicación';
COMMENT ON TABLE login_history IS 'Historial completo de intentos de inicio de sesión';
COMMENT ON TABLE security_notifications IS 'Notificaciones de seguridad enviadas a usuarios';
COMMENT ON TABLE user_behavior_analysis IS 'Análisis diario del comportamiento de usuarios';
COMMENT ON TABLE account_locks IS 'Bloqueos de cuenta por seguridad';
COMMENT ON TABLE trusted_devices IS 'Dispositivos marcados como confiables por el usuario';
