-- Script simplificado para crear clínica demo
-- Ejecuta este script COMPLETO en el SQL Editor de Supabase (pegarlo todo de una vez)

DO $$
DECLARE
  new_clinic_id uuid;
  new_location_id uuid;
BEGIN
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
  RETURNING id INTO new_clinic_id;

  RAISE NOTICE 'Clínica creada con ID: %', new_clinic_id;

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
    new_clinic_id,
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
  RETURNING id INTO new_location_id;

  RAISE NOTICE 'Sede creada con ID: %', new_location_id;

  -- 3. Asignar rol de owner al usuario actual
  INSERT INTO clinic_roles (
    clinic_id,
    user_id,
    role,
    location_id,
    status,
    permissions
  )
  VALUES (
    new_clinic_id,
    auth.uid(),
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

  RAISE NOTICE 'Rol owner asignado al usuario: %', auth.uid();

  -- 4. Crear recursos de ejemplo
  INSERT INTO clinic_resources (
    clinic_id,
    location_id,
    name,
    resource_type,
    department,
    capacity,
    status
  )
  VALUES
    (new_clinic_id, new_location_id, 'Cama 101', 'bed', 'hospitalization', 1, 'available'),
    (new_clinic_id, new_location_id, 'Cama 102', 'bed', 'hospitalization', 1, 'available'),
    (new_clinic_id, new_location_id, 'Cama 103', 'bed', 'hospitalization', 1, 'available'),
    (new_clinic_id, new_location_id, 'Quirófano 1', 'operating_room', 'surgery', 1, 'available'),
    (new_clinic_id, new_location_id, 'Consultorio 1', 'consultation_room', 'outpatient', 1, 'available'),
    (new_clinic_id, new_location_id, 'Consultorio 2', 'consultation_room', 'outpatient', 1, 'available'),
    (new_clinic_id, new_location_id, 'Sala de Urgencias', 'emergency_room', 'emergency', 5, 'available');

  RAISE NOTICE 'Recursos creados exitosamente';
  RAISE NOTICE '✅ ¡Setup completo! Recarga /dashboard/clinica';
  
END $$;
