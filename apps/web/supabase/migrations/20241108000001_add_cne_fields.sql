-- Agregar campos CNE a la tabla profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS cne_estado VARCHAR(100),
ADD COLUMN IF NOT EXISTS cne_municipio VARCHAR(100),
ADD COLUMN IF NOT EXISTS cne_parroquia VARCHAR(100),
ADD COLUMN IF NOT EXISTS cne_centro_electoral VARCHAR(255),
ADD COLUMN IF NOT EXISTS rif VARCHAR(20),
ADD COLUMN IF NOT EXISTS primer_nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS segundo_nombre VARCHAR(100),
ADD COLUMN IF NOT EXISTS primer_apellido VARCHAR(100),
ADD COLUMN IF NOT EXISTS segundo_apellido VARCHAR(100),
ADD COLUMN IF NOT EXISTS nacionalidad VARCHAR(1) DEFAULT 'V' CHECK (nacionalidad IN ('V', 'E'));

-- Índice para búsquedas por cédula
CREATE INDEX IF NOT EXISTS idx_profiles_cedula ON profiles(cedula);

-- Comentarios
COMMENT ON COLUMN profiles.cne_estado IS 'Estado según CNE';
COMMENT ON COLUMN profiles.cne_municipio IS 'Municipio según CNE';
COMMENT ON COLUMN profiles.cne_parroquia IS 'Parroquia según CNE';
COMMENT ON COLUMN profiles.cne_centro_electoral IS 'Centro electoral según CNE';
COMMENT ON COLUMN profiles.rif IS 'RIF del usuario';
COMMENT ON COLUMN profiles.nacionalidad IS 'Nacionalidad: V (Venezolano) o E (Extranjero)';
