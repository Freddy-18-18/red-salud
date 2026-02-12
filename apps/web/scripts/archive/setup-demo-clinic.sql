-- Script para crear clínica de demostración
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear clínica demo
INSERT INTO clinics (
  name, 
  legal_name, 
  tax_id, 
  country, 
  timezone,
  tier, 
  email,
  phone,
  website,
  status,
  metadata
)
VALUES (
  'Clínica Demo', 
  'Clínica Demo SA de CV', 
  'DEMO123456ABC', 
  'MEX',
  'America/Mexico_City',
  'professional', 
  'demo@clinica.com',
  '+52 55 1234 5678',
  'https://demo-clinica.com',
  'active',
  jsonb_build_object(
    'currency', 'MXN',
    'languages', ARRAY['es', 'en'],
    'services', ARRAY['consultas', 'cirugía', 'urgencias']
  )
)
RETURNING id;

-- IMPORTANTE: Copia el ID que se muestra arriba y reemplaza 'TU_CLINIC_ID_AQUI' en los siguientes comandos

-- 2. Crear sede principal
INSERT INTO clinic_locations (
  clinic_id,
  name,
  code,
  address,
  city,
  state,
  country,
  postal_code,
  latitude,
  longitude,
  is_main,
  status,
  opening_hours,
  specialties
)
VALUES (
  'TU_CLINIC_ID_AQUI', -- Reemplaza con el ID de arriba
  'Sede Principal',
  'MAIN',
  'Av. Reforma 123',
  'Ciudad de México',
  'CDMX',
  'MEX',
  '01000',
  19.4326,
  -99.1332,
  true,
  'active',
  jsonb_build_object(
    'monday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'tuesday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'wednesday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'thursday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'friday', jsonb_build_object('open', '08:00', 'close', '20:00'),
    'saturday', jsonb_build_object('open', '09:00', 'close', '14:00'),
    'sunday', jsonb_build_object('open', null, 'close', null)
  ),
  ARRAY['medicina_general', 'pediatria', 'cardiologia']
)
RETURNING id;

-- 3. Asignar rol de owner al usuario actual (tú)
-- Este comando asigna el rol al usuario que está logueado
INSERT INTO clinic_roles (
  clinic_id,
  user_id,
  role,
  location_id, -- NULL = acceso a todas las sedes
  status,
  permissions
)
VALUES (
  'TU_CLINIC_ID_AQUI', -- Reemplaza con el ID de la clínica
  auth.uid(), -- Tu usuario actual
  'owner',
  NULL,
  'active',
  jsonb_build_object(
    'manage_clinic', true,
    'manage_finance', true,
    'manage_operations', true,
    'manage_staff', true,
    'view_reports', true
  )
);

-- 4. (Opcional) Crear algunos recursos de ejemplo
INSERT INTO clinic_resources (
  clinic_id,
  location_id,
  name,
  resource_type,
  department,
  capacity,
  status
)
SELECT
  'TU_CLINIC_ID_AQUI', -- Reemplaza con el ID de la clínica
  location.id,
  resource.name,
  resource.type,
  resource.dept,
  resource.cap,
  'available'
FROM (
  SELECT id FROM clinic_locations WHERE clinic_id = 'TU_CLINIC_ID_AQUI' LIMIT 1
) AS location,
(
  VALUES
    ('Cama 101', 'bed', 'hospitalization', 1),
    ('Cama 102', 'bed', 'hospitalization', 1),
    ('Cama 103', 'bed', 'hospitalization', 1),
    ('Quirófano 1', 'operating_room', 'surgery', 1),
    ('Consultorio 1', 'consultation_room', 'outpatient', 1),
    ('Consultorio 2', 'consultation_room', 'outpatient', 1),
    ('Sala de Urgencias', 'emergency_room', 'emergency', 5)
) AS resource(name, type, dept, cap);

-- ¡Listo! Ahora recarga la página /dashboard/clinica
