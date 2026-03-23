/**
 * @file 20251218000002_create_academy_gamification.sql
 * @description Migración para el sistema de logros, ligas y certificaciones de Red Salud Academy
 * 
 * Este archivo crea:
 * - Sistema de logros/insignias
 * - Sistema de ligas semanales
 * - Certificaciones
 * - Suscripciones premium
 */

-- ============================================================================
-- PARTE 1: SISTEMA DE LOGROS/INSIGNIAS
-- ============================================================================

-- Catálogo de logros disponibles
CREATE TABLE IF NOT EXISTS academy_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL, -- Código único para referencia
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50) DEFAULT 'Trophy',
  image_url TEXT, -- Imagen personalizada del logro
  category VARCHAR(50) NOT NULL, -- 'streak', 'progress', 'mastery', 'social', 'special'
  tier VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  requirement JSONB NOT NULL, -- Condiciones para desbloquear
  xp_reward INTEGER DEFAULT 0,
  gem_reward INTEGER DEFAULT 0,
  is_hidden BOOLEAN DEFAULT false, -- Logros secretos
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_achievement_category CHECK (category IN ('streak', 'progress', 'mastery', 'social', 'speed', 'special')),
  CONSTRAINT valid_achievement_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond'))
);

CREATE INDEX IF NOT EXISTS idx_academy_achievements_category ON academy_achievements(category);
CREATE INDEX IF NOT EXISTS idx_academy_achievements_active ON academy_achievements(is_active);

-- Logros desbloqueados por usuario
CREATE TABLE IF NOT EXISTS academy_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES academy_achievements(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}', -- Progreso actual hacia el logro
  unlocked_at TIMESTAMPTZ,
  notified BOOLEAN DEFAULT false, -- Si ya se mostró la notificación
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_achievement UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON academy_user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_unlocked ON academy_user_achievements(unlocked_at);

-- ============================================================================
-- PARTE 2: SISTEMA DE LIGAS SEMANALES
-- ============================================================================

-- Ligas semanales (se crean automáticamente cada lunes)
CREATE TABLE IF NOT EXISTS academy_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  tier VARCHAR(20) NOT NULL, -- 'bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'finished'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_league_week_tier UNIQUE(week_start, tier),
  CONSTRAINT valid_league_tier CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'))
);

CREATE INDEX IF NOT EXISTS idx_leagues_week ON academy_leagues(week_start, week_end);
CREATE INDEX IF NOT EXISTS idx_leagues_status ON academy_leagues(status);

-- Participantes en cada liga
CREATE TABLE IF NOT EXISTS academy_league_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID NOT NULL REFERENCES academy_leagues(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_earned INTEGER DEFAULT 0,
  final_position INTEGER, -- Se calcula al finalizar la semana
  promoted BOOLEAN DEFAULT false, -- Subió de liga
  demoted BOOLEAN DEFAULT false, -- Bajó de liga
  stayed BOOLEAN DEFAULT false, -- Se quedó en la misma liga
  rewards_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_league_participant UNIQUE(league_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_league_participants_league ON academy_league_participants(league_id);
CREATE INDEX IF NOT EXISTS idx_league_participants_user ON academy_league_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_league_participants_xp ON academy_league_participants(xp_earned DESC);

-- ============================================================================
-- PARTE 3: CERTIFICACIONES
-- ============================================================================

-- Certificados emitidos
CREATE TABLE IF NOT EXISTS academy_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty_id UUID NOT NULL REFERENCES academy_specialties(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES academy_levels(id) ON DELETE CASCADE,
  
  -- Información del certificado
  certificate_number VARCHAR(50) UNIQUE NOT NULL, -- Número único para verificación
  certificate_type VARCHAR(50) DEFAULT 'completion', -- 'completion', 'excellence', 'mastery'
  
  -- Datos del usuario al momento de emisión (para el PDF)
  user_name VARCHAR(200) NOT NULL,
  specialty_name VARCHAR(100) NOT NULL,
  level_name VARCHAR(100) NOT NULL,
  
  -- Métricas logradas
  final_score INTEGER, -- Puntaje del examen final
  total_xp INTEGER,
  completion_time_hours INTEGER,
  
  -- Validación
  issued_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ, -- NULL = no expira
  is_valid BOOLEAN DEFAULT true,
  revoked_at TIMESTAMPTZ,
  revocation_reason TEXT,
  
  -- Verificación blockchain (opcional futuro)
  blockchain_hash TEXT,
  verification_url TEXT,
  
  -- Metadata adicional
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_certificates_user ON academy_certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_certificates_specialty ON academy_certificates(specialty_id);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON academy_certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_valid ON academy_certificates(is_valid);

-- Función para generar número de certificado único
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  prefix TEXT := 'RSA'; -- Red Salud Academy
  year_suffix TEXT := TO_CHAR(NOW(), 'YY');
  random_part TEXT;
  new_number TEXT;
  exists_check BOOLEAN;
BEGIN
  LOOP
    -- Generar parte aleatoria de 6 caracteres alfanuméricos
    random_part := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
    new_number := prefix || '-' || year_suffix || '-' || random_part;
    
    -- Verificar que no existe
    SELECT EXISTS(SELECT 1 FROM academy_certificates WHERE certificate_number = new_number) INTO exists_check;
    
    EXIT WHEN NOT exists_check;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PARTE 4: SUSCRIPCIONES PREMIUM
-- ============================================================================

-- Planes de suscripción disponibles
CREATE TABLE IF NOT EXISTS academy_subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price_usd DECIMAL(10, 2) NOT NULL,
  price_local DECIMAL(10, 2), -- Precio en moneda local (Bs)
  billing_period VARCHAR(20) NOT NULL, -- 'monthly', 'quarterly', 'yearly', 'lifetime'
  features JSONB NOT NULL DEFAULT '[]', -- Lista de características incluidas
  max_specialties INTEGER, -- NULL = ilimitado
  includes_certificates BOOLEAN DEFAULT false,
  includes_unlimited_lives BOOLEAN DEFAULT false,
  includes_streak_freeze INTEGER DEFAULT 0, -- Cantidad de freeze incluidos
  trial_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suscripciones de usuarios
CREATE TABLE IF NOT EXISTS academy_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES academy_subscription_plans(id),
  
  status VARCHAR(20) DEFAULT 'active', -- 'trial', 'active', 'cancelled', 'expired', 'paused'
  
  -- Fechas importantes
  trial_started_at TIMESTAMPTZ,
  trial_ends_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  -- Información de pago
  payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'manual', etc.
  payment_id VARCHAR(100), -- ID de transacción del proveedor
  auto_renew BOOLEAN DEFAULT true,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_subscription_status CHECK (status IN ('trial', 'active', 'cancelled', 'expired', 'paused'))
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON academy_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON academy_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires ON academy_subscriptions(expires_at);

-- ============================================================================
-- PARTE 5: COMPRAS IN-APP (Gemas, vidas, etc.)
-- ============================================================================

-- Historial de transacciones de gemas
CREATE TABLE IF NOT EXISTS academy_gem_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- Positivo = ganancia, negativo = gasto
  balance_after INTEGER NOT NULL, -- Balance después de la transacción
  transaction_type VARCHAR(50) NOT NULL, -- 'reward', 'purchase', 'spend', 'refund'
  description TEXT,
  reference_type VARCHAR(50), -- 'lesson', 'achievement', 'purchase', 'streak_freeze', etc.
  reference_id UUID, -- ID del item relacionado
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_gem_transaction_type CHECK (transaction_type IN ('reward', 'purchase', 'spend', 'refund', 'bonus', 'admin'))
);

CREATE INDEX IF NOT EXISTS idx_gem_transactions_user ON academy_gem_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_gem_transactions_created ON academy_gem_transactions(created_at DESC);

-- ============================================================================
-- PARTE 6: RLS POLICIES
-- ============================================================================

ALTER TABLE academy_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_league_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_gem_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública
CREATE POLICY "Anyone can view active achievements"
  ON academy_achievements FOR SELECT
  USING (is_active = true AND is_hidden = false);

CREATE POLICY "Anyone can view active subscription plans"
  ON academy_subscription_plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view active leagues"
  ON academy_leagues FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view league participants"
  ON academy_league_participants FOR SELECT
  USING (true);

-- Políticas de datos privados del usuario
CREATE POLICY "Users can view own achievements"
  ON academy_user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements"
  ON academy_user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievements"
  ON academy_user_achievements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own certificates"
  ON academy_certificates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Certificate verification by number"
  ON academy_certificates FOR SELECT
  USING (is_valid = true); -- Permite verificar cualquier certificado válido

CREATE POLICY "Users can view own subscriptions"
  ON academy_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own gem transactions"
  ON academy_gem_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================================================
-- PARTE 7: DATOS INICIALES DE LOGROS
-- ============================================================================

INSERT INTO academy_achievements (code, name, description, icon, category, tier, requirement, xp_reward, gem_reward, order_index) VALUES
-- Logros de Rachas
('streak_3', 'Constante', 'Mantén una racha de 3 días', 'Flame', 'streak', 'bronze', '{"streak_days": 3}', 25, 10, 1),
('streak_7', 'Dedicado', 'Mantén una racha de 7 días', 'Flame', 'streak', 'silver', '{"streak_days": 7}', 50, 25, 2),
('streak_30', 'Imparable', 'Mantén una racha de 30 días', 'Flame', 'streak', 'gold', '{"streak_days": 30}', 200, 100, 3),
('streak_100', 'Leyenda', 'Mantén una racha de 100 días', 'Flame', 'streak', 'platinum', '{"streak_days": 100}', 500, 250, 4),
('streak_365', 'Maestro del Tiempo', 'Mantén una racha de 365 días', 'Flame', 'streak', 'diamond', '{"streak_days": 365}', 1000, 500, 5),

-- Logros de Progreso
('first_lesson', 'Primer Paso', 'Completa tu primera lección', 'BookOpen', 'progress', 'bronze', '{"lessons_completed": 1}', 10, 5, 10),
('lessons_10', 'Estudiante Activo', 'Completa 10 lecciones', 'BookOpen', 'progress', 'bronze', '{"lessons_completed": 10}', 50, 20, 11),
('lessons_50', 'Erudito', 'Completa 50 lecciones', 'BookOpen', 'progress', 'silver', '{"lessons_completed": 50}', 150, 50, 12),
('lessons_100', 'Sabio', 'Completa 100 lecciones', 'BookOpen', 'progress', 'gold', '{"lessons_completed": 100}', 300, 100, 13),
('lessons_500', 'Enciclopedia Médica', 'Completa 500 lecciones', 'BookOpen', 'progress', 'platinum', '{"lessons_completed": 500}', 750, 300, 14),

-- Logros de Maestría
('perfect_lesson', 'Perfeccionista', 'Obtén 100% en una lección', 'Star', 'mastery', 'bronze', '{"perfect_lessons": 1}', 25, 10, 20),
('perfect_10', 'Excelencia', 'Obtén 100% en 10 lecciones', 'Star', 'mastery', 'silver', '{"perfect_lessons": 10}', 100, 40, 21),
('first_level', 'Nivel Completado', 'Completa tu primer nivel', 'Award', 'mastery', 'silver', '{"levels_completed": 1}', 100, 50, 22),
('first_specialty', 'Especialista', 'Completa una especialidad completa', 'GraduationCap', 'mastery', 'gold', '{"specialties_completed": 1}', 500, 200, 23),
('all_stars', 'Coleccionista de Estrellas', 'Obtén 3 estrellas en 50 lecciones', 'Stars', 'mastery', 'gold', '{"three_star_lessons": 50}', 250, 100, 24),

-- Logros de Velocidad
('speed_demon', 'Veloz', 'Completa una lección en menos de 2 minutos', 'Zap', 'speed', 'bronze', '{"lesson_time_seconds": 120}', 15, 5, 30),
('daily_10', 'Maratonista', 'Completa 10 lecciones en un día', 'Timer', 'speed', 'silver', '{"lessons_in_day": 10}', 75, 30, 31),

-- Logros de Ligas
('first_league', 'Competidor', 'Participa en tu primera liga', 'Trophy', 'social', 'bronze', '{"leagues_joined": 1}', 20, 10, 40),
('top_3', 'Podio', 'Termina en el Top 3 de una liga', 'Medal', 'social', 'silver', '{"top_3_finishes": 1}', 100, 50, 41),
('league_champion', 'Campeón', 'Gana una liga (1er lugar)', 'Crown', 'social', 'gold', '{"league_wins": 1}', 200, 100, 42),
('promotion', 'Ascenso', 'Promociona a una liga superior', 'TrendingUp', 'social', 'silver', '{"promotions": 1}', 75, 30, 43),
('diamond_league', 'Élite', 'Alcanza la Liga Diamante', 'Diamond', 'social', 'platinum', '{"reach_league": "diamond"}', 500, 200, 44),

-- Logros Especiales
('early_bird', 'Madrugador', 'Completa una lección antes de las 7 AM', 'Sun', 'special', 'bronze', '{"lesson_before_hour": 7}', 20, 10, 50),
('night_owl', 'Noctámbulo', 'Completa una lección después de las 11 PM', 'Moon', 'special', 'bronze', '{"lesson_after_hour": 23}', 20, 10, 51),
('weekend_warrior', 'Guerrero de Fin de Semana', 'Estudia sábado y domingo', 'Calendar', 'special', 'bronze', '{"weekend_study": true}', 30, 15, 52),
('comeback', 'El Regreso', 'Vuelve después de 30 días de inactividad', 'RefreshCw', 'special', 'silver', '{"comeback_days": 30}', 50, 25, 53);

-- ============================================================================
-- PARTE 8: PLANES DE SUSCRIPCIÓN INICIALES
-- ============================================================================

INSERT INTO academy_subscription_plans (code, name, description, price_usd, billing_period, features, includes_certificates, includes_unlimited_lives, includes_streak_freeze, order_index) VALUES
(
  'free',
  'Plan Gratuito',
  'Acceso básico a contenido educativo',
  0.00,
  'lifetime',
  '["1 lección por día", "Acceso al Nivel 1 de todas las especialidades", "Sistema de rachas básico", "Participación en ligas"]',
  false,
  false,
  0,
  1
),
(
  'premium_monthly',
  'Premium Mensual',
  'Acceso completo a Red Salud Academy',
  9.99,
  'monthly',
  '["Lecciones ilimitadas", "Acceso a todos los niveles", "Vidas ilimitadas", "Certificaciones oficiales", "Sin publicidad", "2 Streak Freeze por mes", "Contenido exclusivo", "Soporte prioritario"]',
  true,
  true,
  2,
  2
),
(
  'premium_yearly',
  'Premium Anual',
  'Acceso completo con 40% de descuento',
  71.88, -- $5.99/mes
  'yearly',
  '["Todo lo del plan mensual", "40% de descuento", "5 Streak Freeze por mes", "Acceso anticipado a nuevas especialidades", "Badge exclusivo de miembro anual"]',
  true,
  true,
  5,
  3
),
(
  'institutional',
  'Plan Institucional',
  'Para universidades y clínicas',
  0.00, -- Precio personalizado
  'yearly',
  '["Licencias múltiples", "Dashboard administrativo", "Reportes de progreso", "Certificaciones personalizadas", "API de integración", "Soporte dedicado"]',
  true,
  true,
  10,
  4
);

-- Comentarios
COMMENT ON TABLE academy_achievements IS 'Catálogo de logros e insignias disponibles en la plataforma';
COMMENT ON TABLE academy_user_achievements IS 'Logros desbloqueados por cada usuario';
COMMENT ON TABLE academy_leagues IS 'Ligas semanales para competencia entre usuarios';
COMMENT ON TABLE academy_certificates IS 'Certificaciones emitidas al completar especialidades/niveles';
COMMENT ON TABLE academy_subscriptions IS 'Suscripciones premium de los usuarios';
