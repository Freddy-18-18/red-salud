-- Migración: Agregar campos completos de información médica
-- Esta migración expande patient_details con campos para un perfil médico completo

-- Agregar campos vitales y físicos
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS sexo_biologico VARCHAR(20),
ADD COLUMN IF NOT EXISTS perimetro_cintura_cm INTEGER,
ADD COLUMN IF NOT EXISTS presion_arterial_sistolica INTEGER,
ADD COLUMN IF NOT EXISTS presion_arterial_diastolica INTEGER,
ADD COLUMN IF NOT EXISTS frecuencia_cardiaca INTEGER;

-- Campos específicos para mujeres
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS embarazada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS lactancia BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_ultima_menstruacion DATE,
ADD COLUMN IF NOT EXISTS usa_anticonceptivos BOOLEAN,
ADD COLUMN IF NOT EXISTS tipo_anticonceptivo VARCHAR(100),
ADD COLUMN IF NOT EXISTS embarazos_previos INTEGER;

-- Alergias expandidas
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS alergias_alimentarias TEXT,
ADD COLUMN IF NOT EXISTS otras_alergias TEXT;

-- Condiciones médicas
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS condiciones_mentales TEXT,
ADD COLUMN IF NOT EXISTS discapacidades TEXT;

-- Medicamentos y tratamientos
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS suplementos TEXT,
ADD COLUMN IF NOT EXISTS tratamientos_actuales TEXT;

-- Hábitos de vida
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS fuma VARCHAR(50),
ADD COLUMN IF NOT EXISTS cigarrillos_por_dia INTEGER,
ADD COLUMN IF NOT EXISTS ex_fumador_desde DATE,
ADD COLUMN IF NOT EXISTS consume_alcohol VARCHAR(50),
ADD COLUMN IF NOT EXISTS frecuencia_alcohol VARCHAR(100),
ADD COLUMN IF NOT EXISTS actividad_fisica VARCHAR(50),
ADD COLUMN IF NOT EXISTS horas_ejercicio_semanal NUMERIC(4,1),
ADD COLUMN IF NOT EXISTS horas_sueno_promedio NUMERIC(3,1);

-- Información adicional
ALTER TABLE patient_details
ADD COLUMN IF NOT EXISTS dispositivos_medicos TEXT,
ADD COLUMN IF NOT EXISTS donante_organos VARCHAR(20),
ADD COLUMN IF NOT EXISTS observaciones_adicionales TEXT;

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_patient_details_sexo ON patient_details(sexo_biologico);
CREATE INDEX IF NOT EXISTS idx_patient_details_embarazada ON patient_details(embarazada) WHERE embarazada = true;

-- Comentarios para documentación
COMMENT ON COLUMN patient_details.sexo_biologico IS 'Sexo biológico: masculino, femenino, otro';
COMMENT ON COLUMN patient_details.perimetro_cintura_cm IS 'Perímetro de cintura en centímetros (riesgo cardiovascular)';
COMMENT ON COLUMN patient_details.presion_arterial_sistolica IS 'Presión arterial sistólica (máxima)';
COMMENT ON COLUMN patient_details.presion_arterial_diastolica IS 'Presión arterial diastólica (mínima)';
COMMENT ON COLUMN patient_details.frecuencia_cardiaca IS 'Frecuencia cardíaca en reposo (latidos por minuto)';

COMMENT ON COLUMN patient_details.embarazada IS 'Indica si está embarazada actualmente';
COMMENT ON COLUMN patient_details.lactancia IS 'Indica si está en período de lactancia';
COMMENT ON COLUMN patient_details.fecha_ultima_menstruacion IS 'Fecha de última menstruación (FUM)';
COMMENT ON COLUMN patient_details.usa_anticonceptivos IS 'Indica si usa métodos anticonceptivos';
COMMENT ON COLUMN patient_details.tipo_anticonceptivo IS 'Tipo de anticonceptivo utilizado';
COMMENT ON COLUMN patient_details.embarazos_previos IS 'Número de embarazos previos';

COMMENT ON COLUMN patient_details.alergias_alimentarias IS 'Alergias a alimentos';
COMMENT ON COLUMN patient_details.otras_alergias IS 'Otras alergias (polen, látex, etc.)';

COMMENT ON COLUMN patient_details.condiciones_mentales IS 'Condiciones de salud mental (si desea compartir)';
COMMENT ON COLUMN patient_details.discapacidades IS 'Discapacidades o limitaciones físicas';

COMMENT ON COLUMN patient_details.suplementos IS 'Suplementos vitamínicos o nutricionales';
COMMENT ON COLUMN patient_details.tratamientos_actuales IS 'Tratamientos médicos en curso';

COMMENT ON COLUMN patient_details.fuma IS 'Hábito de fumar: no, si, ex-fumador';
COMMENT ON COLUMN patient_details.cigarrillos_por_dia IS 'Número de cigarrillos por día (si fuma)';
COMMENT ON COLUMN patient_details.ex_fumador_desde IS 'Fecha desde que dejó de fumar';
COMMENT ON COLUMN patient_details.consume_alcohol IS 'Consumo de alcohol: no, ocasional, regular';
COMMENT ON COLUMN patient_details.frecuencia_alcohol IS 'Frecuencia de consumo de alcohol';
COMMENT ON COLUMN patient_details.actividad_fisica IS 'Nivel de actividad física: sedentario, ligera, moderada, intensa';
COMMENT ON COLUMN patient_details.horas_ejercicio_semanal IS 'Horas de ejercicio por semana';
COMMENT ON COLUMN patient_details.horas_sueno_promedio IS 'Horas de sueño promedio por noche';

COMMENT ON COLUMN patient_details.dispositivos_medicos IS 'Dispositivos médicos que usa (marcapasos, insulina, etc.)';
COMMENT ON COLUMN patient_details.donante_organos IS 'Donante de órganos: si, no, no_especificado';
COMMENT ON COLUMN patient_details.observaciones_adicionales IS 'Observaciones médicas adicionales';
