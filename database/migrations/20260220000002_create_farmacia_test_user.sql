-- Crear usuario de prueba para farmacia
-- Ejecutar esto en el SQL Editor de Supabase Dashboard

-- Paso 1: Crear el usuario en auth.users
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000001'::uuid,
  'authenticated',
  'authenticated',
  'farmacia@red-salud.com',
  crypt('Farmacia123!', gen_salt('bf')),
  NOW(),
  '{"role":"farmacia"}',
  NOW(),
  NOW()
);

-- Paso 2: Crear el perfil en profiles
INSERT INTO profiles (
  id,
  email,
  nombre_completo,
  role,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001'::uuid,
  'farmacia@red-salud.com',
  'Farmacia de Prueba',
  'farmacia',
  NOW(),
  NOW()
);

-- Paso 3: Insertar datos de ejemplo en inventario
INSERT INTO farmacia_inventario (
  nombre,
  descripcion,
  categoria,
  presentacion,
  concentracion,
  laboratorio,
  fecha_vencimiento,
  stock_actual,
  stock_minimo,
  precio_venta,
  requiere_receta,
  farmacia_id
) VALUES
('Paracetamol 500mg', 'Analgésico y antipirético', 'Analgésicos', 'Comprimidos', '500mg', 'Farmacéutica ABC', '2025-12-31', 150, 20, 2.50, false, '00000000-0000-0000-0000-000000000001'::uuid),
('Amoxicilina 500mg', 'Antibiótico de amplio espectro', 'Antibióticos', 'Cápsulas', '500mg', 'Laboratorios XYZ', '2024-08-15', 8, 15, 8.75, true, '00000000-0000-0000-0000-000000000001'::uuid),
('Ibuprofeno 400mg', 'Antiinflamatorio no esteroideo', 'Antiinflamatorios', 'Comprimidos', '400mg', 'Farmacéutica ABC', '2025-06-20', 0, 10, 3.25, false, '00000000-0000-0000-0000-000000000001'::uuid);

-- Paso 4: Insertar proveedores de ejemplo
INSERT INTO farmacia_proveedores (
  nombre,
  rif,
  telefono,
  email,
  direccion,
  contacto_principal,
  telefono_contacto,
  farmacia_id
) VALUES
('Farmacéutica ABC', 'J-12345678-9', '0212-555-0101', 'ventas@farmabc.com', 'Caracas, Venezuela', 'María López', '0414-123-4567', '00000000-0000-0000-0000-000000000001'::uuid),
('Laboratorios XYZ', 'J-87654321-0', '0212-555-0202', 'info@labxyz.com', 'Valencia, Venezuela', 'Carlos Rodríguez', '0416-987-6543', '00000000-0000-0000-0000-000000000001'::uuid);
