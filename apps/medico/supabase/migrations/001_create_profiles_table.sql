-- Migración 001: Crear tabla profiles para almacenar roles de usuarios
-- Esta tabla es esencial para el flujo de autenticación

-- Crear tabla profiles (almacena el perfil del usuario con su rol)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre_completo VARCHAR(255),
  role VARCHAR(50) NOT NULL DEFAULT 'paciente',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice en role para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Habilitar RLS (Row Level Security) en profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver solo su propio perfil
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar solo su propio perfil
CREATE POLICY "Usuarios pueden actualizar su propio perfil"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Política: Los usuarios administradores pueden ver todos los perfiles (si hay columna is_admin)
-- (Se puede activar después si se necesita)

-- Crear función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Comentarios
COMMENT ON TABLE profiles IS 'Tabla de perfiles de usuarios con roles (paciente, médico, etc.)';
COMMENT ON COLUMN profiles.id IS 'ID del usuario de auth.users (PK)';
COMMENT ON COLUMN profiles.email IS 'Email del usuario';
COMMENT ON COLUMN profiles.nombre_completo IS 'Nombre completo del usuario';
COMMENT ON COLUMN profiles.role IS 'Rol del usuario (paciente, medico, clinica, farmacia, laboratorio, ambulancia, seguro)';
COMMENT ON COLUMN profiles.avatar_url IS 'URL del avatar del usuario';
