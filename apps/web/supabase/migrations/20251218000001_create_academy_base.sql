/**
 * @file 20251218000001_create_academy_base.sql
 * @description Migración base para Red Salud Academy - Sistema de aprendizaje gamificado
 * 
 * Este archivo crea las tablas fundamentales para el sistema de academia:
 * - Especialidades y estructura de contenido (niveles, unidades, lecciones)
 * - Sistema de preguntas y ejercicios
 * - Progreso del usuario
 * - Sistema de gamificación (XP, rachas, vidas)
 */

-- ============================================================================
-- PARTE 1: ESTRUCTURA DE CONTENIDO
-- ============================================================================

-- Especialidades de la academia (Cardiología, Pediatría, etc.)
CREATE TABLE IF NOT EXISTS academy_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  short_description VARCHAR(255),
  icon VARCHAR(50),
  color VARCHAR(7) DEFAULT '#0ea5e9',
  cover_image_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  total_lessons INTEGER DEFAULT 0,
  estimated_hours INTEGER DEFAULT 0,
  difficulty_level INTEGER DEFAULT 1, -- 1-5
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsqueda por slug
CREATE INDEX IF NOT EXISTS idx_academy_specialties_slug ON academy_specialties(slug);
CREATE INDEX IF NOT EXISTS idx_academy_specialties_active ON academy_specialties(is_active);

-- Niveles dentro de cada especialidad (5 niveles: Fundamentos → Experto)
CREATE TABLE IF NOT EXISTS academy_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_id UUID NOT NULL REFERENCES academy_specialties(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  required_xp INTEGER DEFAULT 0, -- XP necesario para desbloquear
  icon VARCHAR(50),
  color VARCHAR(7),
  is_locked BOOLEAN DEFAULT true, -- El primer nivel no está bloqueado
  unlock_requirement JSONB, -- Requisitos adicionales para desbloquear
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_level_order UNIQUE(specialty_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_academy_levels_specialty ON academy_levels(specialty_id);

-- Unidades dentro de cada nivel (agrupación temática)
CREATE TABLE IF NOT EXISTS academy_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id UUID NOT NULL REFERENCES academy_levels(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  icon VARCHAR(50),
  estimated_minutes INTEGER DEFAULT 30,
  is_checkpoint BOOLEAN DEFAULT false, -- Si es una unidad de examen/evaluación
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_unit_order UNIQUE(level_id, order_index)
);

CREATE INDEX IF NOT EXISTS idx_academy_units_level ON academy_units(level_id);

-- Lecciones individuales
CREATE TABLE IF NOT EXISTS academy_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES academy_units(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'standard', -- 'standard', 'theory', 'practice', 'quiz', 'case_study', 'video'
  content JSONB NOT NULL DEFAULT '{}', -- Contenido de la lección (texto, imágenes, etc.)
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_reward INTEGER DEFAULT 10,
  gem_reward INTEGER DEFAULT 0,
  estimated_minutes INTEGER DEFAULT 5,
  difficulty INTEGER DEFAULT 1, -- 1-5
  is_premium BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_lesson_order UNIQUE(unit_id, order_index),
  CONSTRAINT valid_lesson_type CHECK (type IN ('standard', 'theory', 'practice', 'quiz', 'case_study', 'video'))
);

CREATE INDEX IF NOT EXISTS idx_academy_lessons_unit ON academy_lessons(unit_id);
CREATE INDEX IF NOT EXISTS idx_academy_lessons_type ON academy_lessons(type);

-- Preguntas/ejercicios de cada lección
CREATE TABLE IF NOT EXISTS academy_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
  question JSONB NOT NULL, -- { text, image_url, audio_url, etc. }
  options JSONB, -- Para multiple choice: [{ id, text, image_url }]
  correct_answer JSONB NOT NULL, -- Puede ser un ID, texto, o estructura compleja
  explanation TEXT, -- Explicación cuando responde incorrectamente
  hint TEXT, -- Pista opcional
  difficulty INTEGER DEFAULT 1, -- 1-5
  order_index INTEGER NOT NULL DEFAULT 0,
  xp_bonus INTEGER DEFAULT 0, -- XP extra por respuesta correcta
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_question_type CHECK (type IN (
    'multiple_choice',   -- Selección múltiple
    'true_false',        -- Verdadero/Falso
    'match_pairs',       -- Emparejar conceptos
    'fill_blank',        -- Completar espacios
    'order_sequence',    -- Ordenar secuencia
    'image_select',      -- Seleccionar área de imagen
    'drag_drop',         -- Arrastrar y soltar
    'case_analysis'      -- Análisis de caso clínico
  ))
);

CREATE INDEX IF NOT EXISTS idx_academy_questions_lesson ON academy_questions(lesson_id);

-- ============================================================================
-- PARTE 2: PROGRESO DEL USUARIO
-- ============================================================================

-- Progreso en lecciones individuales
CREATE TABLE IF NOT EXISTS academy_user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES academy_lessons(id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'not_started',
  score INTEGER DEFAULT 0, -- Porcentaje de respuestas correctas (0-100)
  stars INTEGER DEFAULT 0, -- 0-3 estrellas basado en performance
  attempts INTEGER DEFAULT 0,
  best_score INTEGER DEFAULT 0,
  time_spent_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_attempted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_lesson UNIQUE(user_id, lesson_id),
  CONSTRAINT valid_status CHECK (status IN ('not_started', 'in_progress', 'completed', 'mastered'))
);

CREATE INDEX IF NOT EXISTS idx_academy_progress_user ON academy_user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_lesson ON academy_user_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_academy_progress_status ON academy_user_progress(status);

-- Respuestas a preguntas (para analytics y mejora continua)
CREATE TABLE IF NOT EXISTS academy_user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES academy_questions(id) ON DELETE CASCADE,
  progress_id UUID REFERENCES academy_user_progress(id) ON DELETE SET NULL,
  user_answer JSONB NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academy_answers_user ON academy_user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_answers_question ON academy_user_answers(question_id);

-- ============================================================================
-- PARTE 3: SISTEMA DE GAMIFICACIÓN
-- ============================================================================

-- Estadísticas generales del usuario en Academy
CREATE TABLE IF NOT EXISTS academy_user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- XP y Nivel
  total_xp INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  xp_to_next_level INTEGER DEFAULT 100,
  
  -- Moneda virtual
  gems INTEGER DEFAULT 50, -- Gemas iniciales de bienvenida
  
  -- Rachas
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_available INTEGER DEFAULT 0, -- Protectores de racha
  
  -- Vidas (sistema Duolingo)
  lives INTEGER DEFAULT 5,
  max_lives INTEGER DEFAULT 5,
  lives_last_refill TIMESTAMPTZ DEFAULT NOW(),
  unlimited_lives_until TIMESTAMPTZ, -- Para premium o compra temporal
  
  -- Liga actual
  current_league VARCHAR(20) DEFAULT 'bronze',
  league_xp_this_week INTEGER DEFAULT 0,
  league_start_date DATE,
  
  -- Estadísticas generales
  total_lessons_completed INTEGER DEFAULT 0,
  total_questions_answered INTEGER DEFAULT 0,
  total_correct_answers INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_league CHECK (current_league IN ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'master'))
);

CREATE INDEX IF NOT EXISTS idx_academy_stats_user ON academy_user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_academy_stats_league ON academy_user_stats(current_league);
CREATE INDEX IF NOT EXISTS idx_academy_stats_xp ON academy_user_stats(total_xp DESC);

-- Historial de rachas diarias
CREATE TABLE IF NOT EXISTS academy_streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  lessons_completed INTEGER DEFAULT 0,
  xp_earned INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  streak_maintained BOOLEAN DEFAULT false,
  streak_freeze_used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_user_date UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_streak_history_user ON academy_streak_history(user_id);
CREATE INDEX IF NOT EXISTS idx_streak_history_date ON academy_streak_history(date DESC);

-- ============================================================================
-- PARTE 4: TRIGGERS Y FUNCIONES
-- ============================================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_academy_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas que lo necesitan
CREATE TRIGGER update_academy_specialties_updated_at
  BEFORE UPDATE ON academy_specialties
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

CREATE TRIGGER update_academy_levels_updated_at
  BEFORE UPDATE ON academy_levels
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

CREATE TRIGGER update_academy_units_updated_at
  BEFORE UPDATE ON academy_units
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

CREATE TRIGGER update_academy_lessons_updated_at
  BEFORE UPDATE ON academy_lessons
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

CREATE TRIGGER update_academy_user_progress_updated_at
  BEFORE UPDATE ON academy_user_progress
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

CREATE TRIGGER update_academy_user_stats_updated_at
  BEFORE UPDATE ON academy_user_stats
  FOR EACH ROW EXECUTE FUNCTION update_academy_updated_at();

-- Función para crear stats de usuario cuando se registra
CREATE OR REPLACE FUNCTION create_academy_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO academy_user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear stats automáticamente
CREATE TRIGGER on_auth_user_created_academy_stats
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_academy_user_stats();

-- ============================================================================
-- PARTE 5: ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE academy_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_streak_history ENABLE ROW LEVEL SECURITY;

-- Políticas para contenido (lectura pública de especialidades activas)
CREATE POLICY "Anyone can view active specialties"
  ON academy_specialties FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view levels of active specialties"
  ON academy_levels FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM academy_specialties 
    WHERE id = specialty_id AND is_active = true
  ));

CREATE POLICY "Anyone can view units"
  ON academy_units FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM academy_levels l
    JOIN academy_specialties s ON l.specialty_id = s.id
    WHERE l.id = level_id AND s.is_active = true
  ));

CREATE POLICY "Anyone can view active lessons"
  ON academy_lessons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Anyone can view questions"
  ON academy_questions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM academy_lessons 
    WHERE id = lesson_id AND is_active = true
  ));

-- Políticas para datos de usuario (solo el propio usuario)
CREATE POLICY "Users can view own progress"
  ON academy_user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON academy_user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON academy_user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own answers"
  ON academy_user_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own answers"
  ON academy_user_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own stats"
  ON academy_user_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON academy_user_stats FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own streak history"
  ON academy_streak_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own streak history"
  ON academy_streak_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PARTE 6: DATOS INICIALES
-- ============================================================================

-- Insertar las 5 especialidades iniciales
INSERT INTO academy_specialties (name, slug, description, short_description, icon, color, order_index, is_premium, is_active) VALUES
(
  'Medicina Interna',
  'medicina-interna',
  'Domina los fundamentos de la medicina clínica. Desde la semiología hasta el diagnóstico diferencial de las patologías más comunes en adultos.',
  'Base esencial para todas las especialidades médicas',
  'Stethoscope',
  '#3b82f6',
  1,
  false,
  true
),
(
  'Cardiología',
  'cardiologia',
  'Explora el sistema cardiovascular en profundidad. Desde la anatomía del corazón hasta el manejo de emergencias cardíacas.',
  'Sistema cardiovascular y enfermedades del corazón',
  'Heart',
  '#ef4444',
  2,
  false,
  true
),
(
  'Pediatría',
  'pediatria',
  'Aprende sobre el cuidado integral del paciente pediátrico. Crecimiento, desarrollo, vacunación y patologías comunes en niños.',
  'Salud y desarrollo infantil',
  'Baby',
  '#10b981',
  3,
  false,
  true
),
(
  'Ginecología y Obstetricia',
  'ginecologia-obstetricia',
  'Comprende la salud reproductiva femenina. Desde la pubertad hasta la menopausia, incluyendo el embarazo y parto.',
  'Salud reproductiva y maternidad',
  'Users',
  '#ec4899',
  4,
  false,
  true
),
(
  'Dermatología',
  'dermatologia',
  'Desarrolla el ojo clínico para diagnóstico dermatológico. Atlas visual de lesiones, tratamientos tópicos y procedimientos.',
  'Piel, cabello y uñas',
  'Sparkles',
  '#f59e0b',
  5,
  false,
  true
);

-- Insertar niveles para cada especialidad
-- Usamos una función para no repetir código
DO $$
DECLARE
  spec_record RECORD;
  level_names TEXT[] := ARRAY[
    'Fundamentos Básicos',
    'Nivel Intermedio',
    'Nivel Avanzado',
    'Práctica Especializada',
    'Expertise Profesional'
  ];
  level_descriptions TEXT[] := ARRAY[
    'Conceptos básicos accesibles para cualquier persona. Anatomía, terminología y funciones esenciales.',
    'Profundización en fisiología, patologías comunes y métodos diagnósticos básicos.',
    'Diagnóstico diferencial, farmacología específica y casos clínicos introductorios.',
    'Protocolos de tratamiento, manejo de emergencias y medicina basada en evidencia.',
    'Últimas investigaciones, técnicas avanzadas y actualización continua.'
  ];
  level_colors TEXT[] := ARRAY['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];
  i INTEGER;
BEGIN
  FOR spec_record IN SELECT id, slug FROM academy_specialties LOOP
    FOR i IN 1..5 LOOP
      INSERT INTO academy_levels (specialty_id, name, description, order_index, required_xp, color, is_locked)
      VALUES (
        spec_record.id,
        level_names[i],
        level_descriptions[i],
        i,
        (i - 1) * 500, -- 0, 500, 1000, 1500, 2000 XP requerido
        level_colors[i],
        i > 1 -- Solo el primer nivel está desbloqueado
      );
    END LOOP;
  END LOOP;
END $$;

-- Comentario final
COMMENT ON TABLE academy_specialties IS 'Especialidades médicas disponibles en Red Salud Academy';
COMMENT ON TABLE academy_levels IS 'Niveles de progresión dentro de cada especialidad (5 niveles de básico a experto)';
COMMENT ON TABLE academy_units IS 'Unidades temáticas que agrupan lecciones relacionadas';
COMMENT ON TABLE academy_lessons IS 'Lecciones individuales con contenido educativo';
COMMENT ON TABLE academy_questions IS 'Preguntas y ejercicios dentro de cada lección';
COMMENT ON TABLE academy_user_progress IS 'Progreso del usuario en cada lección';
COMMENT ON TABLE academy_user_stats IS 'Estadísticas de gamificación del usuario (XP, rachas, vidas, etc.)';
