-- Agregar columnas de verificación de cédula y foto
-- Esta migración agrega todas las columnas necesarias para el sistema de verificación

-- Agregar columnas si no existen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cedula_verificada BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cedula_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cedula_photo_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS cedula_photo_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS photo_upload_deadline TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS didit_request_id VARCHAR(255);

-- Agregar columnas de datos personales si no existen
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cedula VARCHAR(20),
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE,
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS ciudad VARCHAR(100),
ADD COLUMN IF NOT EXISTS estado VARCHAR(100),
ADD COLUMN IF NOT EXISTS codigo_postal VARCHAR(10);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_profiles_cedula ON profiles(cedula);
CREATE INDEX IF NOT EXISTS idx_profiles_cedula_verificada ON profiles(cedula_verificada);
CREATE INDEX IF NOT EXISTS idx_profiles_telefono ON profiles(telefono);

-- Comentarios para documentación
COMMENT ON COLUMN profiles.cedula_verificada IS 'Indica si la cédula ha sido anclada a la cuenta';
COMMENT ON COLUMN profiles.cedula_verified_at IS 'Fecha y hora cuando la cédula fue anclada';
COMMENT ON COLUMN profiles.cedula_photo_verified IS 'Indica si la foto de la cédula ha sido verificada';
COMMENT ON COLUMN profiles.cedula_photo_verified_at IS 'Fecha y hora cuando la foto fue verificada';
COMMENT ON COLUMN profiles.photo_upload_deadline IS 'Fecha límite para subir la foto de la cédula (30 días desde anclaje)';
COMMENT ON COLUMN profiles.didit_request_id IS 'ID de la solicitud de verificación con Didit';
COMMENT ON COLUMN profiles.cedula IS 'Cédula de identidad del usuario (formato: V-12345678 o E-12345678)';
COMMENT ON COLUMN profiles.telefono IS 'Número de teléfono del usuario';
COMMENT ON COLUMN profiles.fecha_nacimiento IS 'Fecha de nacimiento del usuario';
COMMENT ON COLUMN profiles.direccion IS 'Dirección completa del usuario';
COMMENT ON COLUMN profiles.ciudad IS 'Ciudad de residencia';
COMMENT ON COLUMN profiles.estado IS 'Estado de residencia';
COMMENT ON COLUMN profiles.codigo_postal IS 'Código postal';
