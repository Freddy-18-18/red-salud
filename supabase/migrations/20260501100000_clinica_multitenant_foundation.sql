-- =============================================================================
-- Clinica Multi-Tenant Foundation
-- =============================================================================
-- Schema raíz para el SaaS de gestión clínica. Cada `organization` es un
-- tenant aislado con sus propias sedes, personal, módulos y branding.
--
-- Diseño preparado para todo el espectro:
--   - Clínica especializada pequeña (1 sede, 3-5 médicos)
--   - Multi-especialidad mediana (1-3 sedes, 10-30 médicos)
--   - Red hospitalaria (5-50 sedes, consolidación corporativa)
--
-- Aislamiento: RLS estricto por `organization_id` en TODAS las tablas.
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- Tipos enumerados
-- -----------------------------------------------------------------------------

DO $$ BEGIN
  CREATE TYPE organization_type AS ENUM (
    'specialty_clinic',          -- Clínica especializada (oftalmo, odonto, etc.)
    'multi_specialty_clinic',    -- Multi-especialidad
    'hospital_network',          -- Red hospitalaria multi-sucursal
    'medical_center',            -- Centro médico genérico
    'diagnostic_center',         -- Centro de diagnóstico
    'rehabilitation_center'      -- Centro de rehabilitación
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_status AS ENUM (
    'pending_setup',  -- Recién creada, onboarding sin terminar
    'active',         -- Operativa
    'suspended',      -- Pausada por billing/admin
    'archived'        -- Cerrada permanentemente
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_plan AS ENUM (
    'trial',
    'starter',
    'professional',
    'enterprise',
    'custom'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE organization_role AS ENUM (
    'owner',          -- Dueño, control total
    'admin',          -- Administrador organizacional
    'finance',        -- Finanzas / facturación
    'operations',     -- Operaciones / coordinación
    'medical_lead',   -- Director médico / jefe de servicio
    'doctor',         -- Médico
    'secretary',      -- Secretaría / recepción
    'nurse',          -- Enfermería
    'inventory',      -- Encargado de insumos
    'viewer'          -- Solo lectura (auditor, contador externo)
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE invite_status AS ENUM (
    'pending',
    'accepted',
    'revoked',
    'expired'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- -----------------------------------------------------------------------------
-- organizations — Tenant raíz
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identidad
  name VARCHAR(200) NOT NULL,
  legal_name VARCHAR(200),
  slug VARCHAR(63) NOT NULL UNIQUE,        -- subdominio: {slug}.redsalud.app
  tax_id VARCHAR(50),                       -- RIF en Venezuela
  type organization_type NOT NULL DEFAULT 'specialty_clinic',

  -- Especialización
  primary_specialty VARCHAR(100),          -- ej: "Odontología", "Oftalmología"
  specialties TEXT[] DEFAULT '{}',         -- listado completo de especialidades
  services TEXT[] DEFAULT '{}',            -- catálogo de servicios ofrecidos

  -- Contacto
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),

  -- Estado
  status organization_status NOT NULL DEFAULT 'pending_setup',
  plan organization_plan NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,

  -- Branding y customización (no genérico)
  branding JSONB NOT NULL DEFAULT '{
    "logo_url": null,
    "icon_url": null,
    "primary_color": "#0066FF",
    "secondary_color": "#6B7280",
    "accent_color": "#10B981",
    "font_family": "Inter",
    "ui_density": "comfortable",
    "terminology": {
      "patient": "paciente",
      "appointment": "cita",
      "consultation": "consulta"
    }
  }'::jsonb,

  -- Onboarding
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  onboarding_step INTEGER NOT NULL DEFAULT 0,

  -- Custom domain (Fase 3)
  custom_domain VARCHAR(255),
  custom_domain_verified BOOLEAN NOT NULL DEFAULT FALSE,

  -- Localización
  country_code CHAR(2) NOT NULL DEFAULT 'VE',
  timezone VARCHAR(50) NOT NULL DEFAULT 'America/Caracas',
  default_locale VARCHAR(10) NOT NULL DEFAULT 'es-VE',
  default_currency CHAR(3) NOT NULL DEFAULT 'USD',

  -- Auditoría
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT organizations_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,61}[a-z0-9]$')
);

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations (slug);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON public.organizations (status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_organizations_created_by ON public.organizations (created_by);
CREATE INDEX IF NOT EXISTS idx_organizations_custom_domain ON public.organizations (custom_domain) WHERE custom_domain IS NOT NULL;

-- -----------------------------------------------------------------------------
-- organization_locations — Sedes/sucursales
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organization_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  name VARCHAR(200) NOT NULL,
  code VARCHAR(20),                         -- código interno (ej: "CCS-01")
  is_main BOOLEAN NOT NULL DEFAULT FALSE,   -- sede principal
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Dirección
  address_line VARCHAR(300),
  city VARCHAR(100),
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country_code CHAR(2) NOT NULL DEFAULT 'VE',

  -- Geo
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),

  -- Contacto local
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Horarios (estructura: { "monday": [{"open": "08:00", "close": "18:00"}], ... })
  business_hours JSONB NOT NULL DEFAULT '{}'::jsonb,
  timezone VARCHAR(50),                     -- override del tenant si difiere

  -- Capacidad operativa
  total_consultation_rooms INTEGER DEFAULT 0,
  total_beds INTEGER DEFAULT 0,
  has_emergency BOOLEAN NOT NULL DEFAULT FALSE,
  has_hospitalization BOOLEAN NOT NULL DEFAULT FALSE,
  has_surgery_rooms BOOLEAN NOT NULL DEFAULT FALSE,
  has_lab BOOLEAN NOT NULL DEFAULT FALSE,
  has_imaging BOOLEAN NOT NULL DEFAULT FALSE,

  -- Auditoría
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT organization_locations_code_unique UNIQUE (organization_id, code)
);

CREATE INDEX IF NOT EXISTS idx_org_locations_org ON public.organization_locations (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_locations_main ON public.organization_locations (organization_id, is_main) WHERE is_main = TRUE;

-- Garantizar que sólo una sede sea principal por organización
CREATE UNIQUE INDEX IF NOT EXISTS uniq_org_main_location
  ON public.organization_locations (organization_id)
  WHERE is_main = TRUE;

-- -----------------------------------------------------------------------------
-- organization_members — Relación user ↔ organización con role
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  role organization_role NOT NULL,
  -- Si el rol está limitado a una sede específica (NULL = todas las sedes)
  location_id UUID REFERENCES public.organization_locations(id) ON DELETE CASCADE,

  -- Permisos extra granulares (override del role)
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Estado
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Auditoría
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Un usuario puede tener distintos roles en distintas sedes pero un único registro por (org, user, location)
  CONSTRAINT organization_members_unique UNIQUE (organization_id, user_id, location_id)
);

CREATE INDEX IF NOT EXISTS idx_org_members_org ON public.organization_members (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON public.organization_members (user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_active ON public.organization_members (organization_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_org_members_role ON public.organization_members (organization_id, role);

-- -----------------------------------------------------------------------------
-- organization_modules — Qué módulos tiene prendidos cada org
-- -----------------------------------------------------------------------------
--
-- Catálogo de módulos disponibles (no se hardcodea en código, vive acá).
-- Cada organización elige cuáles prender.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.module_catalog (
  key VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,           -- 'core' | 'operations' | 'specialty' | 'enterprise'
  is_core BOOLEAN NOT NULL DEFAULT FALSE,  -- core = siempre prendido, no se puede apagar
  min_plan organization_plan NOT NULL DEFAULT 'starter',
  icon VARCHAR(50),
  display_order INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.organization_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  module_key VARCHAR(50) NOT NULL REFERENCES public.module_catalog(key) ON DELETE CASCADE,

  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enabled_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Configuración específica del módulo (cada módulo define su propio shape)
  config JSONB NOT NULL DEFAULT '{}'::jsonb,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT organization_modules_unique UNIQUE (organization_id, module_key)
);

CREATE INDEX IF NOT EXISTS idx_org_modules_org ON public.organization_modules (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_modules_enabled ON public.organization_modules (organization_id, is_enabled) WHERE is_enabled = TRUE;

-- Seed del catálogo de módulos (Fase 1 + Fase 2 + Fase 3)
INSERT INTO public.module_catalog (key, name, description, category, is_core, min_plan, icon, display_order)
VALUES
  -- Core (siempre prendidos)
  ('overview',       'Inicio',           'Dashboard ejecutivo con KPIs principales',    'core',       TRUE,  'starter',      'home',           10),
  ('locations',      'Sedes',            'Gestión de sucursales y áreas',                'core',       TRUE,  'starter',      'map-pin',        20),
  ('staff',          'Personal',         'Equipo médico y administrativo',                'core',       TRUE,  'starter',      'users',          30),
  ('settings',       'Configuración',    'Branding, dominio, preferencias',               'core',       TRUE,  'starter',      'settings',       999),

  -- Operations (Fase 2 — prendidos por defecto en planes pagos)
  ('schedule',       'Agenda',           'Agenda compartida multi-médico, multi-sede',   'operations', FALSE, 'starter',      'calendar',       40),
  ('patients',       'Pacientes',        'Registro centralizado de pacientes',            'operations', FALSE, 'starter',      'user',           50),
  ('resources',      'Recursos',         'Consultorios, equipos, salas',                  'operations', FALSE, 'starter',      'box',            60),
  ('inventory',      'Inventario',       'Insumos médicos y stock',                       'operations', FALSE, 'professional', 'package',        70),
  ('billing',        'Facturación',      'Comprobantes, BCV, reportes',                   'operations', FALSE, 'starter',      'file-text',      80),
  ('metrics',        'Métricas',         'KPIs operativos, ocupación, revenue',           'operations', FALSE, 'professional', 'bar-chart',      90),

  -- Specialty (Fase 3 — opt-in por organización)
  ('hospitalization','Hospitalización',  'Camas, internaciones, altas',                   'specialty',  FALSE, 'professional', 'bed',           100),
  ('emergency',      'Urgencias',        'Triaje y atención de urgencias',                'specialty',  FALSE, 'professional', 'siren',         110),
  ('surgery',        'Quirófano',        'Planificación y gestión de cirugías',           'specialty',  FALSE, 'professional', 'scissors',      120),
  ('lab',            'Laboratorio',      'Lab interno integrado',                          'specialty',  FALSE, 'professional', 'flask-conical', 130),
  ('imaging',        'Imagenología',     'Estudios de imagen',                             'specialty',  FALSE, 'professional', 'scan',          140),
  ('telemedicine',   'Telemedicina',     'Consultas virtuales',                            'specialty',  FALSE, 'starter',      'video',         150),

  -- Enterprise (Fase 3+)
  ('rcm',            'Seguros / RCM',    'Revenue cycle management con aseguradoras',     'enterprise', FALSE, 'enterprise',   'shield-check',  200),
  ('international',  'Pacientes intl',   'Turismo médico internacional',                   'enterprise', FALSE, 'enterprise',   'plane',         210),
  ('crm',            'CRM / Marketing',  'Campañas, recall, fidelización',                'enterprise', FALSE, 'enterprise',   'megaphone',     220),
  ('ai',             'IA Asistida',      'Sugerencias diagnósticas, summaries con IA',    'enterprise', FALSE, 'enterprise',   'sparkles',      230),
  ('multi_org',      'Consolidación',    'Reportería corporativa multi-organización',     'enterprise', FALSE, 'enterprise',   'network',       240)
ON CONFLICT (key) DO NOTHING;

-- -----------------------------------------------------------------------------
-- organization_invites — Sistema de invitación con token
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.organization_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  email VARCHAR(255) NOT NULL,
  role organization_role NOT NULL,
  location_id UUID REFERENCES public.organization_locations(id) ON DELETE CASCADE,

  -- Token para link de invitación (URL-safe random)
  token VARCHAR(128) NOT NULL UNIQUE,

  status invite_status NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_org ON public.organization_invites (organization_id);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON public.organization_invites (email);
CREATE INDEX IF NOT EXISTS idx_org_invites_token ON public.organization_invites (token);
CREATE INDEX IF NOT EXISTS idx_org_invites_pending ON public.organization_invites (organization_id, status) WHERE status = 'pending';

-- -----------------------------------------------------------------------------
-- Triggers de updated_at
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_organizations_updated_at ON public.organizations;
CREATE TRIGGER trg_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_organization_locations_updated_at ON public.organization_locations;
CREATE TRIGGER trg_organization_locations_updated_at
  BEFORE UPDATE ON public.organization_locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_organization_members_updated_at ON public.organization_members;
CREATE TRIGGER trg_organization_members_updated_at
  BEFORE UPDATE ON public.organization_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_organization_modules_updated_at ON public.organization_modules;
CREATE TRIGGER trg_organization_modules_updated_at
  BEFORE UPDATE ON public.organization_modules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_organization_invites_updated_at ON public.organization_invites;
CREATE TRIGGER trg_organization_invites_updated_at
  BEFORE UPDATE ON public.organization_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER, evitan recursión RLS)
-- -----------------------------------------------------------------------------

-- Lista de organization_id donde el usuario actual es miembro activo
CREATE OR REPLACE FUNCTION public.current_user_organizations()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT om.organization_id
  FROM public.organization_members om
  WHERE om.user_id = auth.uid()
    AND om.is_active = TRUE;
$$;

-- ¿Tiene el usuario actual al menos uno de los roles dados en la organización?
CREATE OR REPLACE FUNCTION public.has_org_role(
  p_organization_id UUID,
  p_roles organization_role[]
)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = TRUE
      AND om.role = ANY (p_roles)
  );
$$;

-- ¿Es el usuario miembro activo de la organización?
CREATE OR REPLACE FUNCTION public.is_org_member(p_organization_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.organization_members om
    WHERE om.organization_id = p_organization_id
      AND om.user_id = auth.uid()
      AND om.is_active = TRUE
  );
$$;

-- Crear organización + asignar al creador como owner + setear módulos core
-- (atómico, evita estados inconsistentes en el onboarding)
CREATE OR REPLACE FUNCTION public.create_organization(
  p_name VARCHAR,
  p_slug VARCHAR,
  p_type organization_type,
  p_primary_specialty VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_user_id UUID := auth.uid();
  v_module RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  -- Crear organización
  INSERT INTO public.organizations (name, slug, type, primary_specialty, created_by, status, plan, trial_ends_at)
  VALUES (p_name, p_slug, p_type, p_primary_specialty, v_user_id, 'pending_setup', 'trial', NOW() + INTERVAL '30 days')
  RETURNING id INTO v_org_id;

  -- Asignar creador como owner
  INSERT INTO public.organization_members (organization_id, user_id, role, invited_by)
  VALUES (v_org_id, v_user_id, 'owner', v_user_id);

  -- Prender módulos core automáticamente
  FOR v_module IN SELECT key FROM public.module_catalog WHERE is_core = TRUE
  LOOP
    INSERT INTO public.organization_modules (organization_id, module_key, enabled_by)
    VALUES (v_org_id, v_module.key, v_user_id);
  END LOOP;

  RETURN v_org_id;
END;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.module_catalog ENABLE ROW LEVEL SECURITY;

-- module_catalog: lectura pública (es un catálogo)
DROP POLICY IF EXISTS module_catalog_read ON public.module_catalog;
CREATE POLICY module_catalog_read ON public.module_catalog
  FOR SELECT USING (TRUE);

-- organizations: el miembro lee la suya, el creador puede crear
DROP POLICY IF EXISTS organizations_select_member ON public.organizations;
CREATE POLICY organizations_select_member ON public.organizations
  FOR SELECT USING (id IN (SELECT public.current_user_organizations()));

DROP POLICY IF EXISTS organizations_insert_authenticated ON public.organizations;
CREATE POLICY organizations_insert_authenticated ON public.organizations
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

DROP POLICY IF EXISTS organizations_update_owner_admin ON public.organizations;
CREATE POLICY organizations_update_owner_admin ON public.organizations
  FOR UPDATE USING (public.has_org_role(id, ARRAY['owner', 'admin']::organization_role[]))
  WITH CHECK (public.has_org_role(id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS organizations_delete_owner ON public.organizations;
CREATE POLICY organizations_delete_owner ON public.organizations
  FOR DELETE USING (public.has_org_role(id, ARRAY['owner']::organization_role[]));

-- organization_locations: miembro lee, owner/admin/operations escribe
DROP POLICY IF EXISTS org_locations_select ON public.organization_locations;
CREATE POLICY org_locations_select ON public.organization_locations
  FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS org_locations_insert ON public.organization_locations;
CREATE POLICY org_locations_insert ON public.organization_locations
  FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin', 'operations']::organization_role[]));

DROP POLICY IF EXISTS org_locations_update ON public.organization_locations;
CREATE POLICY org_locations_update ON public.organization_locations
  FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin', 'operations']::organization_role[]))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin', 'operations']::organization_role[]));

DROP POLICY IF EXISTS org_locations_delete ON public.organization_locations;
CREATE POLICY org_locations_delete ON public.organization_locations
  FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

-- organization_members: miembro lee la lista, owner/admin gestiona
DROP POLICY IF EXISTS org_members_select ON public.organization_members;
CREATE POLICY org_members_select ON public.organization_members
  FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS org_members_insert ON public.organization_members;
CREATE POLICY org_members_insert ON public.organization_members
  FOR INSERT WITH CHECK (
    -- el creador inicial se autoinserta como owner
    (auth.uid() = user_id AND role = 'owner')
    OR public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[])
  );

DROP POLICY IF EXISTS org_members_update ON public.organization_members;
CREATE POLICY org_members_update ON public.organization_members
  FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_members_delete ON public.organization_members;
CREATE POLICY org_members_delete ON public.organization_members
  FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

-- organization_modules
DROP POLICY IF EXISTS org_modules_select ON public.organization_modules;
CREATE POLICY org_modules_select ON public.organization_modules
  FOR SELECT USING (public.is_org_member(organization_id));

DROP POLICY IF EXISTS org_modules_insert ON public.organization_modules;
CREATE POLICY org_modules_insert ON public.organization_modules
  FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_modules_update ON public.organization_modules;
CREATE POLICY org_modules_update ON public.organization_modules
  FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_modules_delete ON public.organization_modules;
CREATE POLICY org_modules_delete ON public.organization_modules
  FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

-- organization_invites
DROP POLICY IF EXISTS org_invites_select ON public.organization_invites;
CREATE POLICY org_invites_select ON public.organization_invites
  FOR SELECT USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_invites_insert ON public.organization_invites;
CREATE POLICY org_invites_insert ON public.organization_invites
  FOR INSERT WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_invites_update ON public.organization_invites;
CREATE POLICY org_invites_update ON public.organization_invites
  FOR UPDATE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]))
  WITH CHECK (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

DROP POLICY IF EXISTS org_invites_delete ON public.organization_invites;
CREATE POLICY org_invites_delete ON public.organization_invites
  FOR DELETE USING (public.has_org_role(organization_id, ARRAY['owner', 'admin']::organization_role[]));

-- -----------------------------------------------------------------------------
-- Permissions
-- -----------------------------------------------------------------------------

GRANT SELECT ON public.module_catalog TO authenticated, anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_locations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_modules TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organization_invites TO authenticated;

GRANT EXECUTE ON FUNCTION public.current_user_organizations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_role(UUID, organization_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_org_member(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_organization(VARCHAR, VARCHAR, organization_type, VARCHAR) TO authenticated;

-- -----------------------------------------------------------------------------
-- Comments (documentación inline)
-- -----------------------------------------------------------------------------

COMMENT ON TABLE public.organizations IS 'Tenant raíz del SaaS de clínica. Cada fila es una clínica/red hospitalaria independiente.';
COMMENT ON TABLE public.organization_locations IS 'Sedes/sucursales de una organización. Una org tiene 1..N sedes.';
COMMENT ON TABLE public.organization_members IS 'Relación user ↔ org con role + scope opcional por sede.';
COMMENT ON TABLE public.organization_modules IS 'Módulos prendidos por organización. Define qué ve el sidebar y qué features están activas.';
COMMENT ON TABLE public.organization_invites IS 'Invitaciones pendientes para sumar miembros con un token + role predefinido.';
COMMENT ON TABLE public.module_catalog IS 'Catálogo central de módulos disponibles. Se popula desde acá, no desde código.';

COMMIT;
