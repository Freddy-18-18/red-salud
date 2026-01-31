-- Script para insertar registros médicos de prueba
-- Ejecutar en Supabase SQL Editor

-- IMPORTANTE: Reemplaza estos UUIDs con IDs reales de tu base de datos
-- Obtén los IDs ejecutando: SELECT id, email FROM profiles WHERE role IN ('paciente', 'medico');

DO $$
DECLARE
  paciente_id UUID := 'TU_PACIENTE_ID_AQUI'; -- Reemplazar con ID real
  medico_id_1 UUID := 'TU_MEDICO_ID_1_AQUI'; -- Reemplazar con ID real
  medico_id_2 UUID := 'TU_MEDICO_ID_2_AQUI'; -- Reemplazar con ID real
  appointment_id UUID;
BEGIN
  -- Registro 1: Consulta General
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Gripe Común',
    'Fiebre de 38°C, dolor de garganta, congestión nasal, malestar general',
    'Reposo en cama, hidratación abundante, medicación sintomática',
    'Paracetamol 500mg cada 8 horas, Loratadina 10mg cada 24 horas',
    'Paciente presenta cuadro viral típico. Evolución favorable esperada en 5-7 días.',
    NOW() - INTERVAL '30 days'
  );

  -- Registro 2: Control de Presión Arterial
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    examenes_solicitados,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_2,
    'Hipertensión Arterial Controlada',
    'Presión arterial 140/90 mmHg, sin síntomas asociados',
    'Continuar con medicación antihipertensiva, dieta baja en sodio, ejercicio regular',
    'Losartán 50mg cada 24 horas, Hidroclorotiazida 25mg cada 24 horas',
    'Perfil lipídico, Glucosa en ayunas, Creatinina sérica',
    'Paciente con buen control. Continuar seguimiento mensual.',
    NOW() - INTERVAL '60 days'
  );

  -- Registro 3: Dolor de Espalda
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    examenes_solicitados,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Lumbalgia Mecánica',
    'Dolor lumbar de 3 días de evolución, aumenta con movimiento, sin irradiación',
    'Fisioterapia, ejercicios de estiramiento, aplicación de calor local',
    'Ibuprofeno 400mg cada 8 horas por 5 días, Ciclobenzaprina 10mg cada 12 horas',
    'Radiografía de columna lumbar AP y lateral',
    'Dolor de origen mecánico. Mejoría esperada con tratamiento conservador.',
    NOW() - INTERVAL '45 days'
  );

  -- Registro 4: Chequeo Anual
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    examenes_solicitados,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Chequeo Médico Preventivo',
    'Asintomático, consulta de rutina',
    'Mantener hábitos saludables, dieta balanceada, ejercicio regular',
    'Multivitamínico 1 tableta diaria',
    'Hemograma completo, Perfil lipídico, Glucosa, TSH, Antígeno prostático (si aplica)',
    'Paciente en buen estado general. Continuar con prevención.',
    NOW() - INTERVAL '90 days'
  );

  -- Registro 5: Alergia Estacional
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Rinitis Alérgica Estacional',
    'Estornudos frecuentes, picazón nasal, lagrimeo, congestión nasal',
    'Evitar alérgenos, mantener ambientes limpios, antihistamínicos',
    'Cetirizina 10mg cada 24 horas, Spray nasal de corticoides',
    'Paciente con cuadro alérgico típico de primavera. Respuesta favorable a tratamiento.',
    NOW() - INTERVAL '15 days'
  );

  -- Registro 6: Gastritis
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    examenes_solicitados,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Gastritis Aguda',
    'Dolor epigástrico, náuseas, sensación de llenura, ardor estomacal',
    'Dieta blanda, evitar irritantes, medicación protectora gástrica',
    'Omeprazol 20mg cada 12 horas por 14 días, Sucralfato 1g cada 8 horas',
    'Endoscopia digestiva alta si no mejora en 2 semanas',
    'Gastritis probablemente relacionada con estrés y dieta. Mejoría esperada con tratamiento.',
    NOW() - INTERVAL '20 days'
  );

  -- Registro 7: Migraña
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_2,
    'Migraña con Aura',
    'Dolor de cabeza pulsátil unilateral, fotofobia, náuseas, aura visual',
    'Evitar desencadenantes, manejo del estrés, medicación preventiva',
    'Sumatriptán 50mg al inicio del dolor, Propranolol 40mg cada 12 horas (preventivo)',
    'Paciente con migraña típica. Identificar y evitar desencadenantes.',
    NOW() - INTERVAL '10 days'
  );

  -- Registro 8: Infección Urinaria
  INSERT INTO medical_records (
    paciente_id,
    medico_id,
    diagnostico,
    sintomas,
    tratamiento,
    medicamentos,
    examenes_solicitados,
    observaciones,
    created_at
  ) VALUES (
    paciente_id,
    medico_id_1,
    'Infección del Tracto Urinario',
    'Disuria, polaquiuria, urgencia miccional, dolor suprapúbico',
    'Antibioticoterapia, hidratación abundante, analgésicos',
    'Ciprofloxacino 500mg cada 12 horas por 7 días, Fenazopiridina 200mg cada 8 horas',
    'Urocultivo con antibiograma, Examen general de orina',
    'ITU no complicada. Control en 7 días para verificar resolución.',
    NOW() - INTERVAL '5 days'
  );

END $$;

-- Verificar registros insertados
SELECT 
  mr.diagnostico,
  mr.created_at::date as fecha,
  p.nombre_completo as medico,
  mr.medicamentos
FROM medical_records mr
JOIN profiles p ON p.id = mr.medico_id
ORDER BY mr.created_at DESC;

-- Comentarios
COMMENT ON SCRIPT IS 'Datos de prueba para historial clínico - 8 registros médicos variados';
