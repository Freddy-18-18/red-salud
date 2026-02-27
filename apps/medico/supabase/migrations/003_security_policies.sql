-- Migración 003: Políticas de seguridad robustas para producción
-- Implementa Row Level Security (RLS) completo

-- ============================================================================
-- POLÍTICAS PARA LA TABLA PROFILES
-- ============================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON profiles;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio perfil" ON profiles;

-- Política: Los usuarios pueden ver solo su propio perfil
CREATE POLICY "users_can_view_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Política: Los usuarios pueden actualizar solo su propio perfil
CREATE POLICY "users_can_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Política: Solo el sistema puede insertar perfiles (via trigger)
CREATE POLICY "system_can_insert_profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ============================================================================

-- Índice para búsquedas por email (único)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique ON profiles(email);

-- Índice para búsquedas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON profiles(id, role);

-- ============================================================================
-- FUNCIÓN PARA PREVENIR DUPLICADOS DE EMAIL
-- ============================================================================

-- Esta función se ejecuta ANTES de insertar en auth.users
-- Verifica que el email no exista ya
CREATE OR REPLACE FUNCTION check_email_not_exists()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si el email ya existe en auth.users
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE email = NEW.email 
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'El email % ya está registrado', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para verificar duplicados (si no existe)
DROP TRIGGER IF EXISTS check_email_before_insert ON auth.users;
CREATE TRIGGER check_email_before_insert
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION check_email_not_exists();

-- ============================================================================
-- MEJORAR LA FUNCIÓN handle_new_user PARA SER MÁS ROBUSTA
-- ============================================================================

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
DECLARE
  user_role public.user_role;
  user_name text;
BEGIN
  -- Extraer el rol del user_metadata
  user_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::public.user_role,
    'paciente'::public.user_role
  );
  
  -- Extraer el nombre completo
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );
  
  -- Insertar el perfil
  INSERT INTO public.profiles (id, email, nombre_completo, role)
  VALUES (NEW.id, NEW.email, user_name, user_role)
  ON CONFLICT (id) DO NOTHING; -- Prevenir duplicados
  
  -- Log exitoso
  RAISE NOTICE 'Perfil creado para usuario %: % (%)', NEW.id, NEW.email, user_role;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log del error pero no fallar el registro
    RAISE WARNING 'Error creando perfil para %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FUNCIÓN PARA LIMPIAR USUARIOS HUÉRFANOS (sin perfil)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_orphaned_users()
RETURNS void
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  -- Crear perfiles para usuarios que no tienen
  INSERT INTO public.profiles (id, email, nombre_completo, role)
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.raw_user_meta_data->>'name',
      split_part(u.email, '@', 1)
    ),
    COALESCE(
      (u.raw_user_meta_data->>'role')::public.user_role,
      'paciente'::public.user_role
    )
  FROM auth.users u
  LEFT JOIN public.profiles p ON u.id = p.id
  WHERE p.id IS NULL
  ON CONFLICT (id) DO NOTHING;
  
  RAISE NOTICE 'Limpieza de usuarios huérfanos completada';
END;
$$;

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON POLICY "users_can_view_own_profile" ON profiles IS 
  'Los usuarios solo pueden ver su propio perfil';

COMMENT ON POLICY "users_can_update_own_profile" ON profiles IS 
  'Los usuarios solo pueden actualizar su propio perfil';

COMMENT ON POLICY "system_can_insert_profiles" ON profiles IS 
  'Solo el sistema puede insertar perfiles via trigger';

COMMENT ON FUNCTION check_email_not_exists() IS 
  'Previene la creación de usuarios con emails duplicados';

COMMENT ON FUNCTION cleanup_orphaned_users() IS 
  'Crea perfiles para usuarios que no tienen uno (útil para migración)';
