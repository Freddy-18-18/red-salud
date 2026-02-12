-- Script para poblar datos de prueba del sistema de laboratorio
-- Ejecutar después de aplicar la migración principal

-- Insertar tipos de exámenes de laboratorio
INSERT INTO lab_test_types (codigo, nombre, categoria, descripcion, preparacion_requerida, tiempo_entrega_horas, requiere_ayuno, precio_referencia) VALUES
-- Hematología
('HEM001', 'Hemograma Completo', 'Hematología', 'Conteo completo de células sanguíneas', 'No requiere ayuno', 4, FALSE, 25.00),
('HEM002', 'Velocidad de Sedimentación (VSG)', 'Hematología', 'Mide la velocidad de sedimentación de glóbulos rojos', 'No requiere ayuno', 2, FALSE, 15.00),
('HEM003', 'Tiempo de Protrombina (TP)', 'Hematología', 'Evalúa la coagulación sanguínea', 'No requiere ayuno', 4, FALSE, 20.00),

-- Química Sanguínea
('QUI001', 'Glucosa en Ayunas', 'Química Sanguínea', 'Medición de glucosa en sangre', 'Ayuno de 8-12 horas', 4, TRUE, 10.00),
('QUI002', 'Perfil Lipídico', 'Química Sanguínea', 'Colesterol total, HDL, LDL, triglicéridos', 'Ayuno de 12 horas', 6, TRUE, 35.00),
('QUI003', 'Creatinina', 'Química Sanguínea', 'Evaluación de función renal', 'No requiere ayuno', 4, FALSE, 12.00),
('QUI004', 'Urea', 'Química Sanguínea', 'Evaluación de función renal', 'No requiere ayuno', 4, FALSE, 12.00),
('QUI005', 'Ácido Úrico', 'Química Sanguínea', 'Detección de gota y problemas renales', 'Ayuno de 8 horas', 4, TRUE, 15.00),
('QUI006', 'Transaminasas (TGO/TGP)', 'Química Sanguínea', 'Evaluación de función hepática', 'No requiere ayuno', 6, FALSE, 25.00),

-- Urianálisis
('URI001', 'Examen General de Orina', 'Urianálisis', 'Análisis físico, químico y microscópico de orina', 'Primera orina de la mañana', 2, FALSE, 15.00),
('URI002', 'Urocultivo', 'Urianálisis', 'Cultivo para detectar infecciones urinarias', 'Muestra estéril', 48, FALSE, 30.00),

-- Hormonas
('HOR001', 'TSH (Hormona Estimulante de Tiroides)', 'Hormonas', 'Evaluación de función tiroidea', 'No requiere ayuno', 24, FALSE, 35.00),
('HOR002', 'T3 y T4', 'Hormonas', 'Hormonas tiroideas', 'No requiere ayuno', 24, FALSE, 45.00),
('HOR003', 'Hemoglobina Glicosilada (HbA1c)', 'Hormonas', 'Control de diabetes a largo plazo', 'No requiere ayuno', 6, FALSE, 40.00),

-- Inmunología
('INM001', 'PCR (Proteína C Reactiva)', 'Inmunología', 'Marcador de inflamación', 'No requiere ayuno', 6, FALSE, 25.00),
('INM002', 'Factor Reumatoide', 'Inmunología', 'Detección de artritis reumatoide', 'No requiere ayuno', 24, FALSE, 30.00),

-- Microbiología
('MIC001', 'Coprocultivo', 'Microbiología', 'Cultivo de heces para detectar bacterias', 'Muestra fresca', 72, FALSE, 35.00),
('MIC002', 'Examen de Heces', 'Microbiología', 'Análisis parasitológico', 'Muestra fresca', 24, FALSE, 20.00)

ON CONFLICT (codigo) DO NOTHING;

-- Crear una orden de ejemplo (ajustar IDs según tu base de datos)
DO $$
DECLARE
  patient_id UUID;
  doctor_id UUID;
  order_id UUID;
  test_type_id UUID;
  result_id UUID;
BEGIN
  -- Obtener un paciente
  SELECT id INTO patient_id FROM profiles WHERE role = 'paciente' LIMIT 1;
  
  -- Obtener un doctor
  SELECT id INTO doctor_id FROM profiles WHERE role = 'doctor' LIMIT 1;
  
  IF patient_id IS NULL OR doctor_id IS NULL THEN
    RAISE NOTICE 'No se encontraron usuarios necesarios. Asegúrate de tener al menos un paciente y un doctor.';
    RETURN;
  END IF;
  
  -- Crear orden de laboratorio
  INSERT INTO lab_orders (
    paciente_id,
    medico_id,
    numero_orden,
    fecha_orden,
    fecha_entrega_estimada,
    diagnostico_presuntivo,
    status,
    prioridad,
    requiere_ayuno,
    instrucciones_paciente
  ) VALUES (
    patient_id,
    doctor_id,
    generate_lab_order_number(),
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '6 days',
    'Control de rutina',
    'completada',
    'normal',
    TRUE,
    'Presentarse en ayunas de 12 horas. Traer orden médica.'
  ) RETURNING id INTO order_id;
  
  -- Agregar exámenes a la orden
  INSERT INTO lab_order_tests (order_id, test_type_id, status, resultado_disponible)
  SELECT 
    order_id,
    id,
    'completado',
    TRUE
  FROM lab_test_types
  WHERE codigo IN ('HEM001', 'QUI001', 'QUI002')
  LIMIT 3;
  
  -- Crear resultados para Hemograma
  SELECT id INTO test_type_id FROM lab_test_types WHERE codigo = 'HEM001';
  
  INSERT INTO lab_results (
    order_id,
    test_type_id,
    fecha_resultado,
    observaciones_generales,
    notificado_paciente
  ) VALUES (
    order_id,
    test_type_id,
    NOW() - INTERVAL '5 days',
    'Valores dentro de rangos normales',
    TRUE
  ) RETURNING id INTO result_id;
  
  -- Valores del hemograma
  INSERT INTO lab_result_values (result_id, parametro, valor, unidad, rango_referencia, valor_minimo, valor_maximo, es_anormal, nivel_alerta, orden) VALUES
  (result_id, 'Glóbulos Rojos', '4.8', 'mill/mm³', '4.5 - 5.5', 4.5, 5.5, FALSE, 'normal', 1),
  (result_id, 'Hemoglobina', '14.5', 'g/dL', '13.5 - 17.5', 13.5, 17.5, FALSE, 'normal', 2),
  (result_id, 'Hematocrito', '43', '%', '40 - 50', 40, 50, FALSE, 'normal', 3),
  (result_id, 'Glóbulos Blancos', '7.2', 'mil/mm³', '4.5 - 11.0', 4.5, 11.0, FALSE, 'normal', 4),
  (result_id, 'Plaquetas', '250', 'mil/mm³', '150 - 400', 150, 400, FALSE, 'normal', 5);
  
  -- Crear resultados para Glucosa
  SELECT id INTO test_type_id FROM lab_test_types WHERE codigo = 'QUI001';
  
  INSERT INTO lab_results (
    order_id,
    test_type_id,
    fecha_resultado,
    observaciones_generales,
    notificado_paciente
  ) VALUES (
    order_id,
    test_type_id,
    NOW() - INTERVAL '5 days',
    'Glucosa ligeramente elevada. Se recomienda control',
    TRUE
  ) RETURNING id INTO result_id;
  
  INSERT INTO lab_result_values (result_id, parametro, valor, unidad, rango_referencia, valor_minimo, valor_maximo, es_anormal, nivel_alerta, orden) VALUES
  (result_id, 'Glucosa en Ayunas', '115', 'mg/dL', '70 - 100', 70, 100, TRUE, 'alto', 1);
  
  -- Crear resultados para Perfil Lipídico
  SELECT id INTO test_type_id FROM lab_test_types WHERE codigo = 'QUI002';
  
  INSERT INTO lab_results (
    order_id,
    test_type_id,
    fecha_resultado,
    observaciones_generales,
    notificado_paciente
  ) VALUES (
    order_id,
    test_type_id,
    NOW() - INTERVAL '5 days',
    'Colesterol total elevado. Se recomienda dieta y ejercicio',
    TRUE
  ) RETURNING id INTO result_id;
  
  INSERT INTO lab_result_values (result_id, parametro, valor, unidad, rango_referencia, valor_minimo, valor_maximo, es_anormal, nivel_alerta, orden) VALUES
  (result_id, 'Colesterol Total', '220', 'mg/dL', '< 200', 0, 200, TRUE, 'alto', 1),
  (result_id, 'HDL Colesterol', '45', 'mg/dL', '> 40', 40, 999, FALSE, 'normal', 2),
  (result_id, 'LDL Colesterol', '145', 'mg/dL', '< 130', 0, 130, TRUE, 'alto', 3),
  (result_id, 'Triglicéridos', '180', 'mg/dL', '< 150', 0, 150, TRUE, 'alto', 4);
  
  -- Crear una orden pendiente
  INSERT INTO lab_orders (
    paciente_id,
    medico_id,
    numero_orden,
    fecha_orden,
    fecha_entrega_estimada,
    diagnostico_presuntivo,
    status,
    prioridad,
    requiere_ayuno,
    instrucciones_paciente
  ) VALUES (
    patient_id,
    doctor_id,
    generate_lab_order_number(),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '2 days',
    'Seguimiento de tratamiento',
    'pendiente',
    'normal',
    TRUE,
    'Presentarse en ayunas de 8 horas. Traer identificación.'
  ) RETURNING id INTO order_id;
  
  INSERT INTO lab_order_tests (order_id, test_type_id, status, resultado_disponible)
  SELECT 
    order_id,
    id,
    'pendiente',
    FALSE
  FROM lab_test_types
  WHERE codigo IN ('QUI003', 'QUI004', 'URI001')
  LIMIT 3;
  
  RAISE NOTICE 'Datos de prueba creados exitosamente';
  RAISE NOTICE 'Orden completada ID: %', order_id;
  RAISE NOTICE 'Paciente ID: %', patient_id;
  RAISE NOTICE 'Doctor ID: %', doctor_id;
  
END $$;

-- Verificar datos creados
SELECT 
  lo.numero_orden,
  lo.status,
  p.nombre_completo as paciente,
  d.nombre_completo as doctor,
  lo.fecha_orden,
  (SELECT COUNT(*) FROM lab_order_tests WHERE order_id = lo.id) as num_tests,
  (SELECT COUNT(*) FROM lab_results WHERE order_id = lo.id) as num_results
FROM lab_orders lo
JOIN profiles p ON lo.paciente_id = p.id
LEFT JOIN profiles d ON lo.medico_id = d.id
ORDER BY lo.created_at DESC
LIMIT 5;
