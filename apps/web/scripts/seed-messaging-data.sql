-- Script para crear datos de prueba del sistema de mensajería
-- Ejecutar después de aplicar la migración principal

-- NOTA: Ajusta los UUIDs según los usuarios reales en tu base de datos
-- Puedes obtener IDs reales con: SELECT id, nombre_completo, role FROM profiles;

-- Variables de ejemplo (reemplazar con IDs reales)
DO $$
DECLARE
  patient_id UUID;
  doctor_id UUID;
  conversation_id UUID;
BEGIN
  -- Obtener un paciente de prueba
  SELECT id INTO patient_id 
  FROM profiles 
  WHERE role = 'paciente' 
  LIMIT 1;

  -- Obtener un doctor de prueba
  SELECT id INTO doctor_id 
  FROM profiles 
  WHERE role = 'doctor' 
  LIMIT 1;

  -- Verificar que existen usuarios
  IF patient_id IS NULL THEN
    RAISE NOTICE 'No se encontró ningún paciente. Crea uno primero.';
    RETURN;
  END IF;

  IF doctor_id IS NULL THEN
    RAISE NOTICE 'No se encontró ningún doctor. Crea uno primero.';
    RETURN;
  END IF;

  -- Crear conversación de prueba
  INSERT INTO conversations (
    patient_id,
    doctor_id,
    subject,
    status,
    last_message_at
  ) VALUES (
    patient_id,
    doctor_id,
    'Consulta sobre resultados de laboratorio',
    'active',
    NOW()
  )
  RETURNING id INTO conversation_id;

  -- Crear mensajes de prueba
  INSERT INTO messages (conversation_id, sender_id, content, is_read, created_at) VALUES
  (
    conversation_id,
    patient_id,
    'Hola doctor, recibí los resultados de mis análisis de sangre y tengo algunas dudas sobre los valores.',
    true,
    NOW() - INTERVAL '2 hours'
  ),
  (
    conversation_id,
    doctor_id,
    'Hola, con gusto te ayudo. ¿Qué valores te preocupan específicamente?',
    true,
    NOW() - INTERVAL '1 hour 50 minutes'
  ),
  (
    conversation_id,
    patient_id,
    'El nivel de colesterol salió en 220 mg/dL. ¿Es algo preocupante?',
    true,
    NOW() - INTERVAL '1 hour 45 minutes'
  ),
  (
    conversation_id,
    doctor_id,
    'Es un nivel ligeramente elevado. Te recomendaría hacer algunos ajustes en tu dieta y aumentar la actividad física. Podemos agendar una cita para revisar un plan detallado.',
    false,
    NOW() - INTERVAL '1 hour 30 minutes'
  );

  -- Crear otra conversación archivada
  INSERT INTO conversations (
    patient_id,
    doctor_id,
    subject,
    status,
    last_message_at
  ) VALUES (
    patient_id,
    doctor_id,
    'Seguimiento post-consulta',
    'archived',
    NOW() - INTERVAL '30 days'
  );

  RAISE NOTICE 'Datos de prueba creados exitosamente';
  RAISE NOTICE 'Conversación ID: %', conversation_id;
  RAISE NOTICE 'Paciente ID: %', patient_id;
  RAISE NOTICE 'Doctor ID: %', doctor_id;

END $$;

-- Verificar datos creados
SELECT 
  c.id,
  c.subject,
  c.status,
  p1.nombre_completo as paciente,
  p2.nombre_completo as doctor,
  c.last_message_at,
  (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id) as message_count
FROM conversations c
JOIN profiles p1 ON c.patient_id = p1.id
JOIN profiles p2 ON c.doctor_id = p2.id
ORDER BY c.created_at DESC
LIMIT 5;
