-- Script para insertar datos de prueba del sistema de citas
-- Ejecutar en Supabase SQL Editor

-- 1. Crear perfiles de doctores de prueba
-- Nota: Reemplaza los UUIDs con IDs reales de usuarios existentes o crea nuevos usuarios

-- Ejemplo de doctor 1: Medicina General
DO $$
DECLARE
  doctor_id_1 UUID;
  specialty_general UUID;
BEGIN
  -- Obtener ID de especialidad
  SELECT id INTO specialty_general FROM medical_specialties WHERE name = 'Medicina General';
  
  -- Crear perfil de usuario (si no existe)
  INSERT INTO profiles (id, email, nombre_completo, role, avatar_url)
  VALUES (
    gen_random_uuid(),
    'dr.garcia@redsalud.com',
    'Dr. Carlos García',
    'doctor',
    NULL
  )
  ON CONFLICT (email) DO UPDATE SET role = 'doctor'
  RETURNING id INTO doctor_id_1;
  
  -- Crear perfil de doctor
  INSERT INTO doctor_profiles (
    id,
    specialty_id,
    license_number,
    years_experience,
    bio,
    consultation_price,
    consultation_duration,
    is_available
  )
  VALUES (
    doctor_id_1,
    specialty_general,
    'MED-12345',
    15,
    'Médico general con 15 años de experiencia en atención primaria. Especializado en medicina preventiva y diagnóstico temprano.',
    45.00,
    30,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Crear horarios (Lunes a Viernes, 9am-5pm)
  INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
  VALUES
    (doctor_id_1, 1, '09:00:00', '17:00:00', true), -- Lunes
    (doctor_id_1, 2, '09:00:00', '17:00:00', true), -- Martes
    (doctor_id_1, 3, '09:00:00', '17:00:00', true), -- Miércoles
    (doctor_id_1, 4, '09:00:00', '17:00:00', true), -- Jueves
    (doctor_id_1, 5, '09:00:00', '17:00:00', true)  -- Viernes
  ON CONFLICT (doctor_id, day_of_week, start_time) DO NOTHING;
END $$;

-- Ejemplo de doctor 2: Cardiología
DO $$
DECLARE
  doctor_id_2 UUID;
  specialty_cardio UUID;
BEGIN
  SELECT id INTO specialty_cardio FROM medical_specialties WHERE name = 'Cardiología';
  
  INSERT INTO profiles (id, email, nombre_completo, role)
  VALUES (
    gen_random_uuid(),
    'dra.martinez@redsalud.com',
    'Dra. Ana Martínez',
    'doctor'
  )
  ON CONFLICT (email) DO UPDATE SET role = 'doctor'
  RETURNING id INTO doctor_id_2;
  
  INSERT INTO doctor_profiles (
    id,
    specialty_id,
    license_number,
    years_experience,
    bio,
    consultation_price,
    consultation_duration,
    is_available
  )
  VALUES (
    doctor_id_2,
    specialty_cardio,
    'CARD-67890',
    20,
    'Cardióloga certificada con amplia experiencia en enfermedades cardiovasculares y prevención.',
    80.00,
    45,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
  VALUES
    (doctor_id_2, 1, '10:00:00', '18:00:00', true),
    (doctor_id_2, 3, '10:00:00', '18:00:00', true),
    (doctor_id_2, 5, '10:00:00', '18:00:00', true)
  ON CONFLICT (doctor_id, day_of_week, start_time) DO NOTHING;
END $$;

-- Ejemplo de doctor 3: Pediatría
DO $$
DECLARE
  doctor_id_3 UUID;
  specialty_pediatria UUID;
BEGIN
  SELECT id INTO specialty_pediatria FROM medical_specialties WHERE name = 'Pediatría';
  
  INSERT INTO profiles (id, email, nombre_completo, role)
  VALUES (
    gen_random_uuid(),
    'dr.rodriguez@redsalud.com',
    'Dr. Luis Rodríguez',
    'doctor'
  )
  ON CONFLICT (email) DO UPDATE SET role = 'doctor'
  RETURNING id INTO doctor_id_3;
  
  INSERT INTO doctor_profiles (
    id,
    specialty_id,
    license_number,
    years_experience,
    bio,
    consultation_price,
    consultation_duration,
    is_available
  )
  VALUES (
    doctor_id_3,
    specialty_pediatria,
    'PED-11223',
    12,
    'Pediatra dedicado al cuidado integral de niños y adolescentes. Enfoque en desarrollo infantil.',
    55.00,
    30,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
  VALUES
    (doctor_id_3, 1, '08:00:00', '14:00:00', true),
    (doctor_id_3, 2, '08:00:00', '14:00:00', true),
    (doctor_id_3, 3, '08:00:00', '14:00:00', true),
    (doctor_id_3, 4, '08:00:00', '14:00:00', true),
    (doctor_id_3, 5, '08:00:00', '14:00:00', true)
  ON CONFLICT (doctor_id, day_of_week, start_time) DO NOTHING;
END $$;

-- Ejemplo de doctor 4: Dermatología
DO $$
DECLARE
  doctor_id_4 UUID;
  specialty_dermato UUID;
BEGIN
  SELECT id INTO specialty_dermato FROM medical_specialties WHERE name = 'Dermatología';
  
  INSERT INTO profiles (id, email, nombre_completo, role)
  VALUES (
    gen_random_uuid(),
    'dra.lopez@redsalud.com',
    'Dra. María López',
    'doctor'
  )
  ON CONFLICT (email) DO UPDATE SET role = 'doctor'
  RETURNING id INTO doctor_id_4;
  
  INSERT INTO doctor_profiles (
    id,
    specialty_id,
    license_number,
    years_experience,
    bio,
    consultation_price,
    consultation_duration,
    is_available
  )
  VALUES (
    doctor_id_4,
    specialty_dermato,
    'DERM-44556',
    10,
    'Dermatóloga especializada en tratamientos de piel, acné y enfermedades dermatológicas.',
    65.00,
    30,
    true
  )
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active)
  VALUES
    (doctor_id_4, 2, '13:00:00', '19:00:00', true),
    (doctor_id_4, 4, '13:00:00', '19:00:00', true),
    (doctor_id_4, 6, '09:00:00', '13:00:00', true) -- Sábado
  ON CONFLICT (doctor_id, day_of_week, start_time) DO NOTHING;
END $$;

-- Verificar datos insertados
SELECT 
  p.nombre_completo,
  p.email,
  ms.name as especialidad,
  dp.consultation_price,
  dp.years_experience,
  dp.is_available
FROM doctor_profiles dp
JOIN profiles p ON p.id = dp.id
LEFT JOIN medical_specialties ms ON ms.id = dp.specialty_id
ORDER BY p.nombre_completo;

-- Ver horarios de doctores
SELECT 
  p.nombre_completo,
  ds.day_of_week,
  ds.start_time,
  ds.end_time,
  ds.is_active
FROM doctor_schedules ds
JOIN profiles p ON p.id = ds.doctor_id
ORDER BY p.nombre_completo, ds.day_of_week, ds.start_time;

-- Comentarios
COMMENT ON SCRIPT IS 'Script de datos de prueba para el sistema de citas médicas';
