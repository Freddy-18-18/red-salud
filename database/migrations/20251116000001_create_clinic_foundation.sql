-- =====================================================
-- MIGRATION: Dashboard Clínica - Fundaciones
-- Descripción: Tablas base para clínicas, sedes, roles y recursos
-- Fecha: 2025-11-16
-- =====================================================

-- Tabla principal de clínicas
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(100) UNIQUE NOT NULL,
    country VARCHAR(3) NOT NULL DEFAULT 'MEX', -- ISO 3166-1 alpha-3
    timezone VARCHAR(50) NOT NULL DEFAULT 'America/Mexico_City',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'closed')),
    tier VARCHAR(20) NOT NULL DEFAULT 'lite' CHECK (tier IN ('lite', 'professional', 'enterprise')),
    logo_url TEXT,
    website TEXT,
    phone VARCHAR(50),
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Índices para búsqueda eficiente
CREATE INDEX idx_clinics_status ON public.clinics(status);
CREATE INDEX idx_clinics_country ON public.clinics(country);
CREATE INDEX idx_clinics_tier ON public.clinics(tier);

-- Tabla de sedes/locaciones
CREATE TABLE IF NOT EXISTS public.clinic_locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(3) NOT NULL DEFAULT 'MEX',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    phone VARCHAR(50),
    email VARCHAR(255),
    is_main BOOLEAN DEFAULT false,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    opening_hours JSONB DEFAULT '{}'::jsonb, -- {monday: [{open: '08:00', close: '20:00'}], ...}
    specialties TEXT[], -- array de especialidades disponibles
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_clinic_locations_clinic_id ON public.clinic_locations(clinic_id);
CREATE INDEX idx_clinic_locations_status ON public.clinic_locations(status);
CREATE INDEX idx_clinic_locations_country ON public.clinic_locations(country);
CREATE INDEX idx_clinic_locations_code ON public.clinic_locations(code);

-- Tabla de roles y permisos de clínica
CREATE TABLE IF NOT EXISTS public.clinic_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'finance', 'operations', 'concierge', 'auditor', 'viewer')),
    location_id UUID REFERENCES public.clinic_locations(id) ON DELETE SET NULL, -- NULL = acceso a todas las sedes
    permissions JSONB DEFAULT '{}'::jsonb, -- permisos granulares adicionales
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, user_id, location_id, role)
);

CREATE INDEX idx_clinic_roles_clinic_user ON public.clinic_roles(clinic_id, user_id);
CREATE INDEX idx_clinic_roles_user ON public.clinic_roles(user_id);
CREATE INDEX idx_clinic_roles_location ON public.clinic_roles(location_id);
CREATE INDEX idx_clinic_roles_status ON public.clinic_roles(status);

-- Tabla de recursos clínicos (camas, quirófanos, equipos)
CREATE TABLE IF NOT EXISTS public.clinic_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('bed', 'operating_room', 'consultation_room', 'imaging', 'laboratory', 'equipment', 'ambulance')),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100), -- ej: 'Cardiology', 'Emergency', 'ICU'
    capacity INT DEFAULT 1,
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved', 'out_of_service')),
    priority INT DEFAULT 0, -- para ordenar en listados
    cost_per_hour DECIMAL(10, 2), -- costo operativo por hora
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_clinic_resources_location ON public.clinic_resources(location_id);
CREATE INDEX idx_clinic_resources_type ON public.clinic_resources(type);
CREATE INDEX idx_clinic_resources_status ON public.clinic_resources(status);
CREATE INDEX idx_clinic_resources_code ON public.clinic_resources(code);

-- Tabla de turnos de personal
CREATE TABLE IF NOT EXISTS public.clinic_staff_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    staff_role VARCHAR(100) NOT NULL, -- 'doctor', 'nurse', 'receptionist', 'technician'
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed', 'cancelled', 'no_show')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinic_staff_shifts_location ON public.clinic_staff_shifts(location_id);
CREATE INDEX idx_clinic_staff_shifts_staff ON public.clinic_staff_shifts(staff_id);
CREATE INDEX idx_clinic_staff_shifts_date ON public.clinic_staff_shifts(shift_date);
CREATE INDEX idx_clinic_staff_shifts_status ON public.clinic_staff_shifts(status);

-- Tabla de métricas operacionales
CREATE TABLE IF NOT EXISTS public.clinic_operational_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    metric_hour INT CHECK (metric_hour >= 0 AND metric_hour < 24), -- NULL para métricas diarias
    total_appointments INT DEFAULT 0,
    completed_appointments INT DEFAULT 0,
    cancelled_appointments INT DEFAULT 0,
    no_show_appointments INT DEFAULT 0,
    average_wait_time_minutes INT,
    occupancy_rate DECIMAL(5, 2), -- porcentaje
    revenue_amount DECIMAL(12, 2) DEFAULT 0,
    patient_count INT DEFAULT 0,
    emergency_count INT DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(location_id, metric_date, metric_hour)
);

CREATE INDEX idx_clinic_operational_metrics_location_date ON public.clinic_operational_metrics(location_id, metric_date);
CREATE INDEX idx_clinic_operational_metrics_date ON public.clinic_operational_metrics(metric_date);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_clinic_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clinics_timestamp BEFORE UPDATE ON public.clinics FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_clinic_locations_timestamp BEFORE UPDATE ON public.clinic_locations FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_clinic_roles_timestamp BEFORE UPDATE ON public.clinic_roles FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_clinic_resources_timestamp BEFORE UPDATE ON public.clinic_resources FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_clinic_staff_shifts_timestamp BEFORE UPDATE ON public.clinic_staff_shifts FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_clinic_operational_metrics_timestamp BEFORE UPDATE ON public.clinic_operational_metrics FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

-- RLS Policies
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_staff_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_operational_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: usuarios autenticados pueden ver clínicas donde tienen rol
CREATE POLICY clinic_select_policy ON public.clinics
    FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Policy: solo owners pueden crear clínicas
CREATE POLICY clinic_insert_policy ON public.clinics
    FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

-- Policy: owners y admins pueden actualizar
CREATE POLICY clinic_update_policy ON public.clinics
    FOR UPDATE
    TO authenticated
    USING (
        id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin')
        )
    );

-- Policy similar para clinic_locations
CREATE POLICY clinic_locations_select_policy ON public.clinic_locations
    FOR SELECT
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY clinic_locations_insert_policy ON public.clinic_locations
    FOR INSERT
    TO authenticated
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin', 'manager')
        )
    );

CREATE POLICY clinic_locations_update_policy ON public.clinic_locations
    FOR UPDATE
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Policy para clinic_roles
CREATE POLICY clinic_roles_select_policy ON public.clinic_roles
    FOR SELECT
    TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY clinic_roles_insert_policy ON public.clinic_roles
    FOR INSERT
    TO authenticated
    WITH CHECK (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin')
        )
    );

-- Policy para clinic_resources
CREATE POLICY clinic_resources_select_policy ON public.clinic_resources
    FOR SELECT
    TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

CREATE POLICY clinic_resources_modify_policy ON public.clinic_resources
    FOR ALL
    TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() 
            AND cr.status = 'active'
            AND cr.role IN ('owner', 'admin', 'manager', 'operations')
        )
    );

-- Policy para clinic_staff_shifts
CREATE POLICY clinic_staff_shifts_select_policy ON public.clinic_staff_shifts
    FOR SELECT
    TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
        OR staff_id = auth.uid()
    );

-- Policy para clinic_operational_metrics
CREATE POLICY clinic_operational_metrics_select_policy ON public.clinic_operational_metrics
    FOR SELECT
    TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

COMMENT ON TABLE public.clinics IS 'Tabla maestra de clínicas registradas en el sistema';
COMMENT ON TABLE public.clinic_locations IS 'Sedes físicas de cada clínica para operaciones multi-localización';
COMMENT ON TABLE public.clinic_roles IS 'Asignación de roles y permisos a usuarios dentro de clínicas';
COMMENT ON TABLE public.clinic_resources IS 'Recursos clínicos disponibles (camas, quirófanos, equipos)';
COMMENT ON TABLE public.clinic_staff_shifts IS 'Turnos programados para personal médico y administrativo';
COMMENT ON TABLE public.clinic_operational_metrics IS 'Métricas operacionales agregadas por sede y período';
