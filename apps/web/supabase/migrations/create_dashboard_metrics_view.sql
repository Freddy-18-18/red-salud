-- Migración: Crear vista materializada para métricas del dashboard
-- Ejecutar esto en el SQL Editor de Supabase

-- Primero, asegurarnos de que las tablas base existan
CREATE TABLE IF NOT EXISTS specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  specialty_id UUID REFERENCES specialties(id),
  license_number VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultation_id UUID REFERENCES consultations(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar especialidades base
INSERT INTO specialties (name, description, icon) VALUES
  ('Medicina General', 'Atención primaria y diagnóstico general', 'stethoscope'),
  ('Cardiología', 'Especialistas en el corazón y sistema circulatorio', 'heart'),
  ('Neurología', 'Tratamiento de trastornos del sistema nervioso', 'brain'),
  ('Pediatría', 'Atención médica para niños y adolescentes', 'baby'),
  ('Oftalmología', 'Cuidado de la salud visual', 'eye'),
  ('Traumatología', 'Tratamiento de lesiones musculoesqueléticas', 'bone'),
  ('Medicina Deportiva', 'Prevención y tratamiento de lesiones deportivas', 'activity'),
  ('Odontología', 'Salud bucal y dental', 'smile'),
  ('Farmacología', 'Gestión de medicamentos y tratamientos', 'pill'),
  ('Laboratorio', 'Análisis clínicos y diagnóstico', 'microscope'),
  ('Vacunación', 'Prevención mediante inmunización', 'syringe'),
  ('Telemedicina', 'Consultas médicas remotas', 'radio')
ON CONFLICT (name) DO NOTHING;

-- Crear vista materializada para métricas
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics;

CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT
  (SELECT COUNT(*) FROM patients)::INTEGER AS total_patients,
  (SELECT COUNT(*) FROM doctors)::INTEGER AS total_doctors,
  (SELECT COUNT(*) FROM specialties)::INTEGER AS total_specialties,
  (
    SELECT COALESCE(ROUND(AVG(rating))::INTEGER, 0)
    FROM ratings
  ) AS satisfaction_percentage;

-- Crear índice para mejorar el rendimiento
CREATE UNIQUE INDEX ON dashboard_metrics ((true));

-- Función para refrescar automáticamente la vista (ejecutar manualmente o con cron)
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_metrics;
END;
$$ LANGUAGE plpgsql;

-- Comentario: Para refrescar manualmente, ejecutar:
-- SELECT refresh_dashboard_metrics();

-- Comentario: Para refrescar automáticamente cada hora, configurar pg_cron:
-- SELECT cron.schedule('refresh-metrics', '0 * * * *', 'SELECT refresh_dashboard_metrics();');
