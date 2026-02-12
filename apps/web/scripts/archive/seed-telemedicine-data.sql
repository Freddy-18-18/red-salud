-- =====================================================
-- DATOS DE PRUEBA PARA TELEMEDICINA
-- =====================================================

-- Nota: Reemplaza los UUIDs con IDs reales de tu base de datos

-- Variables de ejemplo (reemplazar con IDs reales)
DO $$
DECLARE
  patient_id UUID := '00000000-0000-0000-0000-000000000001'; -- Reemplazar
  doctor_id UUID := '00000000-0000-0000-0000-000000000002';  -- Reemplazar
  appointment_id UUID;
  session_id UUID;
BEGIN

-- 1. Crear una cita de ejemplo (si no existe)
INSERT INTO appointments (
  id,
  paciente_id,
  medico_id,
  fecha_hora,
  duracion_minutos,
  motivo,
  status
) VALUES (
  gen_random_uuid(),
  patient_id,
  doctor_id,
  NOW() + INTERVAL '2 hours',
  30,
  'Consulta de seguimiento - Control de presión arterial',
  'confirmada'
) RETURNING id INTO appointment_id;

-- 2. Crear sesión de telemedicina programada
INSERT INTO telemedicine_sessions (
  id,
  appointment_id,
  patient_id,
  doctor_id,
  session_token,
  room_name,
  status,
  scheduled_start_time,
  video_enabled,
  audio_enabled,
  recording_enabled
) VALUES (
  gen_random_uuid(),
  appointment_id,
  patient_id,
  doctor_id,
  'session_' || gen_random_uuid()::text,
  'room_' || gen_random_uuid()::text,
  'scheduled',
  NOW() + INTERVAL '2 hours',
  true,
  true,
  false
) RETURNING id INTO session_id;

-- 3. Crear sesión completada de ejemplo
INSERT INTO telemedicine_sessions (
  id,
  patient_id,
  doctor_id,
  session_token,
  room_name,
  status,
  scheduled_start_time,
  actual_start_time,
  end_time,
  duration_minutes,
  video_enabled,
  audio_enabled,
  session_notes,
  connection_quality
) VALUES (
  gen_random_uuid(),
  patient_id,
  doctor_id,
  'session_' || gen_random_uuid()::text,
  'room_' || gen_random_uuid()::text,
  'completed',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days' + INTERVAL '25 minutes',
  25,
  true,
  true,
  'Consulta completada exitosamente. Paciente presenta mejoría en síntomas.',
  'good'
);

-- 4. Crear receta de ejemplo para la sesión completada
INSERT INTO telemedicine_prescriptions (
  session_id,
  patient_id,
  doctor_id,
  prescription_number,
  diagnosis,
  medications,
  instructions,
  valid_from,
  valid_until,
  status,
  signed_at
) VALUES (
  (SELECT id FROM telemedicine_sessions WHERE status = 'completed' LIMIT 1),
  patient_id,
  doctor_id,
  'RX-' || to_char(NOW(), 'YYYYMMDD') || '-' || substring(md5(random()::text) from 1 for 6),
  'Hipertensión arterial controlada',
  '[
    {
      "name": "Losartán",
      "dosage": "50mg",
      "frequency": "1 vez al día",
      "duration": "30 días",
      "instructions": "Tomar en ayunas por la mañana"
    },
    {
      "name": "Hidroclorotiazida",
      "dosage": "25mg",
      "frequency": "1 vez al día",
      "duration": "30 días",
      "instructions": "Tomar junto con el Losartán"
    }
  ]'::jsonb,
  'Mantener dieta baja en sodio. Control de presión arterial diario. Ejercicio moderado 30 minutos al día.',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'active',
  NOW()
);

-- 5. Crear mensajes de chat de ejemplo
INSERT INTO telemedicine_chat_messages (
  session_id,
  sender_id,
  message,
  message_type,
  is_read
) VALUES
  (session_id, doctor_id, 'Hola, ¿cómo se encuentra hoy?', 'text', true),
  (session_id, patient_id, 'Bien doctor, gracias por preguntar', 'text', true),
  (session_id, doctor_id, 'Perfecto, vamos a revisar sus síntomas', 'text', true);

-- 6. Crear entrada en sala de espera
INSERT INTO telemedicine_waiting_room (
  session_id,
  patient_id,
  status,
  reason_for_visit,
  priority
) VALUES (
  session_id,
  patient_id,
  'waiting',
  'Control de presión arterial',
  'normal'
);

END $$;

-- =====================================================
-- CONSULTAS ÚTILES PARA VERIFICAR DATOS
-- =====================================================

-- Ver todas las sesiones
-- SELECT 
--   s.*,
--   pp.nombre_completo as patient_name,
--   dp.nombre_completo as doctor_name
-- FROM telemedicine_sessions s
-- LEFT JOIN profiles pp ON s.patient_id = pp.id
-- LEFT JOIN profiles dp ON s.doctor_id = dp.id
-- ORDER BY s.scheduled_start_time DESC;

-- Ver recetas generadas
-- SELECT 
--   p.*,
--   prof.nombre_completo as doctor_name
-- FROM telemedicine_prescriptions p
-- LEFT JOIN profiles prof ON p.doctor_id = prof.id
-- ORDER BY p.created_at DESC;

-- Ver mensajes de chat
-- SELECT 
--   m.*,
--   p.nombre_completo as sender_name
-- FROM telemedicine_chat_messages m
-- LEFT JOIN profiles p ON m.sender_id = p.id
-- ORDER BY m.created_at;

-- Ver sala de espera
-- SELECT 
--   w.*,
--   p.nombre_completo as patient_name
-- FROM telemedicine_waiting_room w
-- LEFT JOIN profiles p ON w.patient_id = p.id
-- WHERE w.status = 'waiting'
-- ORDER BY w.priority DESC, w.entered_at;
