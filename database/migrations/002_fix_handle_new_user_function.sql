-- Migración 002: Arreglar la función handle_new_user para que use el tipo completo
-- El problema es que cuando el trigger se ejecuta desde auth.users, no puede ver public.user_role

-- Eliminar la función existente
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Recrear la función con el tipo completamente calificado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public, auth
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre_completo, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'paciente'::public.user_role)
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log el error pero no fallar el registro
    RAISE WARNING 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Comentario
COMMENT ON FUNCTION public.handle_new_user() IS 'Crea automáticamente un perfil cuando se registra un nuevo usuario';
