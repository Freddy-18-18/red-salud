-- Agregar campos para fecha límite de foto y fecha de anclaje
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cedula_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS photo_upload_deadline TIMESTAMP WITH TIME ZONE;

-- Comentarios
COMMENT ON COLUMN profiles.cedula_verified_at IS 'Fecha y hora cuando la cédula fue anclada';
COMMENT ON COLUMN profiles.photo_upload_deadline IS 'Fecha límite para subir la foto de la cédula (30 días desde anclaje)';
