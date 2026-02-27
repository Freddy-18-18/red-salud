-- =====================================================
-- MIGRATION: Extensión de Recursos Clínicos para Visualización
-- Descripción: Agrega campos espaciales y tablas para visualización interactiva
-- Fecha: 2026-01-12
-- =====================================================

-- Agregar campos de posición espacial a recursos existentes
ALTER TABLE public.clinic_resources 
ADD COLUMN IF NOT EXISTS position_x DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS position_y DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS floor INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS area_id UUID REFERENCES public.clinic_areas(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS rotation INTEGER DEFAULT 0, -- grados de rotación para el canvas
ADD COLUMN IF NOT EXISTS width DECIMAL(10, 2) DEFAULT 1.0, -- ancho en metros
ADD COLUMN IF NOT EXISTS height DECIMAL(10, 2) DEFAULT 2.0; -- alto en metros

-- Tabla de áreas/departamentos de la clínica
CREATE TABLE IF NOT EXISTS public.clinic_areas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    floor INTEGER NOT NULL DEFAULT 1,
    department VARCHAR(100), -- 'Emergency', 'ICU', 'Surgery', etc.
    color VARCHAR(7) DEFAULT '#3B82F6', -- color hex para visualización
    -- Coordenadas del área rectangular en el mapa
    map_x DECIMAL(10, 2),
    map_y DECIMAL(10, 2),
    map_width DECIMAL(10, 2),
    map_height DECIMAL(10, 2),
    capacity INT DEFAULT 0, -- capacidad total del área
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_clinic_areas_location ON public.clinic_areas(location_id);
CREATE INDEX idx_clinic_areas_floor ON public.clinic_areas(floor);
CREATE INDEX idx_clinic_areas_department ON public.clinic_areas(department);

-- Tabla de asignación de pacientes a recursos (camas)
CREATE TABLE IF NOT EXISTS public.resource_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource_id UUID NOT NULL REFERENCES public.clinic_resources(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    admission_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    discharge_date TIMESTAMPTZ,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discharged', 'transferred')),
    admission_reason TEXT,
    discharge_notes TEXT,
    assigned_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resource_assignments_resource ON public.resource_assignments(resource_id);
CREATE INDEX idx_resource_assignments_patient ON public.resource_assignments(patient_id);
CREATE INDEX idx_resource_assignments_status ON public.resource_assignments(status);
CREATE INDEX idx_resource_assignments_admission ON public.resource_assignments(admission_date);

-- Tabla de inventario/farmacia
CREATE TABLE IF NOT EXISTS public.clinic_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    product_code VARCHAR(100) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    category VARCHAR(100), -- 'medication', 'supplies', 'equipment'
    unit_of_measure VARCHAR(50) NOT NULL, -- 'unit', 'box', 'mg', 'ml'
    current_stock DECIMAL(12, 2) NOT NULL DEFAULT 0,
    minimum_stock DECIMAL(12, 2) DEFAULT 0,
    maximum_stock DECIMAL(12, 2),
    unit_cost DECIMAL(10, 2),
    currency VARCHAR(3) DEFAULT 'MXN',
    supplier VARCHAR(255),
    expiry_date DATE,
    is_shared BOOLEAN DEFAULT false, -- si es compartido entre sedes
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'discontinued', 'out_of_stock')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(location_id, product_code)
);

CREATE INDEX idx_clinic_inventory_location ON public.clinic_inventory(location_id);
CREATE INDEX idx_clinic_inventory_category ON public.clinic_inventory(category);
CREATE INDEX idx_clinic_inventory_stock ON public.clinic_inventory(current_stock);
CREATE INDEX idx_clinic_inventory_shared ON public.clinic_inventory(is_shared);

-- Tabla de movimientos de inventario
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_id UUID NOT NULL REFERENCES public.clinic_inventory(id) ON DELETE RESTRICT,
    movement_type VARCHAR(50) NOT NULL CHECK (movement_type IN ('purchase', 'consumption', 'transfer_in', 'transfer_out', 'adjustment', 'expiry', 'return')),
    quantity DECIMAL(12, 2) NOT NULL,
    from_location_id UUID REFERENCES public.clinic_locations(id),
    to_location_id UUID REFERENCES public.clinic_locations(id),
    reference_number VARCHAR(100),
    notes TEXT,
    performed_by UUID REFERENCES auth.users(id),
    movement_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_inventory_movements_inventory ON public.inventory_movements(inventory_id);
CREATE INDEX idx_inventory_movements_type ON public.inventory_movements(movement_type);
CREATE INDEX idx_inventory_movements_date ON public.inventory_movements(movement_date);

-- Tabla de configuración de mapas/planos
CREATE TABLE IF NOT EXISTS public.clinic_floor_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE CASCADE,
    floor INTEGER NOT NULL,
    plan_name VARCHAR(255) NOT NULL,
    background_image_url TEXT, -- URL de imagen de fondo
    scale_meters_per_pixel DECIMAL(10, 4) DEFAULT 0.1, -- escala del mapa
    width_pixels INTEGER DEFAULT 1000,
    height_pixels INTEGER DEFAULT 800,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(location_id, floor)
);

CREATE INDEX idx_clinic_floor_plans_location ON public.clinic_floor_plans(location_id);

-- Triggers para updated_at
CREATE TRIGGER update_clinic_areas_timestamp 
    BEFORE UPDATE ON public.clinic_areas 
    FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

CREATE TRIGGER update_resource_assignments_timestamp 
    BEFORE UPDATE ON public.resource_assignments 
    FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

CREATE TRIGGER update_clinic_inventory_timestamp 
    BEFORE UPDATE ON public.clinic_inventory 
    FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

CREATE TRIGGER update_clinic_floor_plans_timestamp 
    BEFORE UPDATE ON public.clinic_floor_plans 
    FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

-- Trigger para actualizar estado de recurso cuando hay asignación
CREATE OR REPLACE FUNCTION update_resource_status_on_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = 'active') THEN
        UPDATE public.clinic_resources
        SET status = 'occupied'
        WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('discharged', 'transferred') THEN
        UPDATE public.clinic_resources
        SET status = 'available'
        WHERE id = NEW.resource_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.clinic_resources
        SET status = 'available'
        WHERE id = OLD.resource_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_resource_on_assignment
    AFTER INSERT OR UPDATE OR DELETE ON public.resource_assignments
    FOR EACH ROW
    EXECUTE FUNCTION update_resource_status_on_assignment();

-- Trigger para actualizar stock en inventario
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.movement_type IN ('purchase', 'transfer_in', 'return', 'adjustment') THEN
        UPDATE public.clinic_inventory
        SET current_stock = current_stock + NEW.quantity
        WHERE id = NEW.inventory_id;
    ELSIF NEW.movement_type IN ('consumption', 'transfer_out', 'expiry') THEN
        UPDATE public.clinic_inventory
        SET current_stock = current_stock - NEW.quantity
        WHERE id = NEW.inventory_id;
    END IF;
    
    -- Actualizar estado si está fuera de stock
    UPDATE public.clinic_inventory
    SET status = CASE 
        WHEN current_stock <= 0 THEN 'out_of_stock'
        ELSE 'active'
    END
    WHERE id = NEW.inventory_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_on_movement
    AFTER INSERT ON public.inventory_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_stock();

-- RLS Policies
ALTER TABLE public.clinic_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_floor_plans ENABLE ROW LEVEL SECURITY;

-- Policies para clinic_areas
CREATE POLICY clinic_areas_select_policy ON public.clinic_areas
    FOR SELECT TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

-- Policies para resource_assignments
CREATE POLICY resource_assignments_select_policy ON public.resource_assignments
    FOR SELECT TO authenticated
    USING (
        resource_id IN (
            SELECT r.id FROM public.clinic_resources r
            INNER JOIN public.clinic_locations cl ON r.location_id = cl.id
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
        OR patient_id = auth.uid()
    );

-- Policies para inventory (similar pattern)
CREATE POLICY clinic_inventory_select_policy ON public.clinic_inventory
    FOR SELECT TO authenticated
    USING (
        location_id IN (
            SELECT cl.id FROM public.clinic_locations cl
            INNER JOIN public.clinic_roles cr ON cl.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

COMMENT ON TABLE public.clinic_areas IS 'Áreas y departamentos dentro de cada sede clínica';
COMMENT ON TABLE public.resource_assignments IS 'Asignación de pacientes a recursos (camas, habitaciones)';
COMMENT ON TABLE public.clinic_inventory IS 'Inventario y farmacia por sede clínica';
COMMENT ON TABLE public.inventory_movements IS 'Movimientos de inventario (compras, consumos, transferencias)';
COMMENT ON TABLE public.clinic_floor_plans IS 'Configuración de planos por piso para visualización';
