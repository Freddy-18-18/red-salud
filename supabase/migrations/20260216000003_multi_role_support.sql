-- Migración: Soporte para Múltiples Roles (Identidad Unificada)
-- Descripción: Crea la tabla user_roles y migra los datos de profiles.role.

DO $$ 
BEGIN
    -- 1. Crear tabla de roles (catálogo si no existe)
    CREATE TABLE IF NOT EXISTS public.roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text UNIQUE NOT NULL,
        description text,
        created_at timestamptz DEFAULT now()
    );

    -- 2. Insertar roles base
    INSERT INTO public.roles (name, description)
    VALUES 
        ('paciente', 'Usuario final buscador de salud'),
        ('medico', 'Profesional de la salud verificado'),
        ('farmacia', 'Establecimiento farmacéutico'),
        ('laboratorio', 'Laboratorio clínico'),
        ('seguro', 'Entidad aseguradora')
    ON CONFLICT (name) DO NOTHING;

    -- 3. Crear tabla intermedia user_roles
    CREATE TABLE IF NOT EXISTS public.user_roles (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
        active boolean DEFAULT true,
        created_at timestamptz DEFAULT now(),
        UNIQUE(user_id, role_id)
    );

    -- 4. Migrar datos existentes de profiles
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT p.id, r.id
    FROM public.profiles p
    JOIN public.roles r ON r.name::text = p.role::text
    ON CONFLICT (user_id, role_id) DO NOTHING;

    -- 5. Habilitar RLS en las nuevas tablas
    ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

    -- 6. Políticas básicas
    -- Roles: Visible para todos los autenticados
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Roles visible to authenticated users') THEN
        CREATE POLICY "Roles visible to authenticated users" ON public.roles
            FOR SELECT TO authenticated USING (true);
    END IF;

    -- User Roles: Usuario solo ve sus propios roles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own roles') THEN
        CREATE POLICY "Users can view their own roles" ON public.user_roles
            FOR SELECT TO authenticated USING (auth.uid() = user_id);
    END IF;

END $$;
