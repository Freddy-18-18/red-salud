-- =====================================================
-- MIGRATION: Dashboard Clínica - RCM (Revenue Cycle Management)
-- Descripción: Tablas para gestión completa del ciclo de ingresos
-- Fecha: 2025-11-16
-- =====================================================

-- Tabla de contratos con pagadores (aseguradoras, convenios)
CREATE TABLE IF NOT EXISTS public.payer_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    payer_name VARCHAR(255) NOT NULL,
    payer_type VARCHAR(50) NOT NULL CHECK (payer_type IN ('insurance', 'government', 'corporate', 'international', 'self_pay')),
    country VARCHAR(3) NOT NULL DEFAULT 'MEX',
    contract_number VARCHAR(100) UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE,
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN', -- ISO 4217
    discount_rate DECIMAL(5, 2) DEFAULT 0, -- porcentaje de descuento
    payment_terms_days INT DEFAULT 30, -- días para pago
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'expired')),
    contact_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    billing_rules JSONB DEFAULT '{}'::jsonb, -- reglas específicas de facturación
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_payer_contracts_clinic ON public.payer_contracts(clinic_id);
CREATE INDEX idx_payer_contracts_status ON public.payer_contracts(status);
CREATE INDEX idx_payer_contracts_payer_type ON public.payer_contracts(payer_type);
CREATE INDEX idx_payer_contracts_country ON public.payer_contracts(country);

-- Tabla de claims (reclamaciones/facturas)
CREATE TABLE IF NOT EXISTS public.rcm_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.clinic_locations(id) ON DELETE RESTRICT,
    claim_number VARCHAR(100) UNIQUE NOT NULL,
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    payer_contract_id UUID REFERENCES public.payer_contracts(id) ON DELETE SET NULL,
    claim_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_date DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'in_review', 'approved', 'partially_paid', 'paid', 'denied', 'appealed', 'cancelled')),
    claim_type VARCHAR(30) NOT NULL CHECK (claim_type IN ('outpatient', 'inpatient', 'emergency', 'surgical', 'diagnostic', 'preventive')),
    total_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    approved_amount DECIMAL(12, 2),
    paid_amount DECIMAL(12, 2) DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000, -- tasa de cambio al momento
    denial_reason TEXT,
    denial_code VARCHAR(50),
    appeal_date DATE,
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES auth.users(id), -- usuario de finanzas responsable
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_rcm_claims_clinic ON public.rcm_claims(clinic_id);
CREATE INDEX idx_rcm_claims_location ON public.rcm_claims(location_id);
CREATE INDEX idx_rcm_claims_patient ON public.rcm_claims(patient_id);
CREATE INDEX idx_rcm_claims_payer ON public.rcm_claims(payer_contract_id);
CREATE INDEX idx_rcm_claims_status ON public.rcm_claims(status);
CREATE INDEX idx_rcm_claims_claim_date ON public.rcm_claims(claim_date);
CREATE INDEX idx_rcm_claims_claim_number ON public.rcm_claims(claim_number);

-- Tabla de items/líneas de claim
CREATE TABLE IF NOT EXISTS public.rcm_claim_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.rcm_claims(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    service_code VARCHAR(50) NOT NULL, -- CPT, ICD, código interno
    service_description TEXT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    approved_price DECIMAL(12, 2),
    denial_reason TEXT,
    provider_id UUID REFERENCES auth.users(id), -- médico que prestó el servicio
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(claim_id, line_number)
);

CREATE INDEX idx_rcm_claim_items_claim ON public.rcm_claim_items(claim_id);
CREATE INDEX idx_rcm_claim_items_provider ON public.rcm_claim_items(provider_id);

-- Tabla de pagos recibidos
CREATE TABLE IF NOT EXISTS public.rcm_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id UUID NOT NULL REFERENCES public.rcm_claims(id) ON DELETE RESTRICT,
    payment_number VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    exchange_rate DECIMAL(10, 4) DEFAULT 1.0000,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'credit_card', 'debit_card', 'transfer', 'check', 'insurance_payment', 'other')),
    reference_number VARCHAR(100), -- número de transacción bancaria
    payer_name VARCHAR(255),
    reconciled BOOLEAN DEFAULT false,
    reconciled_at TIMESTAMPTZ,
    reconciled_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX idx_rcm_payments_claim ON public.rcm_payments(claim_id);
CREATE INDEX idx_rcm_payments_payment_date ON public.rcm_payments(payment_date);
CREATE INDEX idx_rcm_payments_reconciled ON public.rcm_payments(reconciled);
CREATE INDEX idx_rcm_payments_payment_number ON public.rcm_payments(payment_number);

-- Tabla de pacientes internacionales
CREATE TABLE IF NOT EXISTS public.international_patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    clinic_id UUID NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
    origin_country VARCHAR(3) NOT NULL, -- ISO 3166-1 alpha-3
    passport_number VARCHAR(100),
    visa_type VARCHAR(50),
    visa_expiry DATE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'es', -- ISO 639-1
    needs_translation BOOLEAN DEFAULT false,
    needs_accommodation BOOLEAN DEFAULT false,
    accommodation_details JSONB DEFAULT '{}'::jsonb,
    needs_transportation BOOLEAN DEFAULT false,
    transportation_details JSONB DEFAULT '{}'::jsonb,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_country VARCHAR(3),
    travel_insurance_provider VARCHAR(255),
    travel_insurance_policy VARCHAR(100),
    medical_travel_agency VARCHAR(255),
    referral_source VARCHAR(255),
    estimated_arrival_date DATE,
    estimated_departure_date DATE,
    special_requirements TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'arrived', 'in_treatment', 'discharged', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb,
    UNIQUE(patient_id, clinic_id)
);

CREATE INDEX idx_international_patients_patient ON public.international_patients(patient_id);
CREATE INDEX idx_international_patients_clinic ON public.international_patients(clinic_id);
CREATE INDEX idx_international_patients_origin_country ON public.international_patients(origin_country);
CREATE INDEX idx_international_patients_status ON public.international_patients(status);

-- Tabla de documentos de viaje/legales
CREATE TABLE IF NOT EXISTS public.travel_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    international_patient_id UUID NOT NULL REFERENCES public.international_patients(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('passport', 'visa', 'medical_clearance', 'insurance_card', 'consent_form', 'prescription', 'medical_records', 'invoice', 'other')),
    document_name VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL, -- URL en Supabase Storage
    file_size_bytes BIGINT,
    mime_type VARCHAR(100),
    expiry_date DATE,
    verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMPTZ,
    verified_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_travel_documents_patient ON public.travel_documents(international_patient_id);
CREATE INDEX idx_travel_documents_type ON public.travel_documents(document_type);
CREATE INDEX idx_travel_documents_verified ON public.travel_documents(verified);

-- Vista materializada para KPIs financieros
CREATE MATERIALIZED VIEW IF NOT EXISTS public.clinic_financial_kpis AS
SELECT 
    c.id AS clinic_id,
    c.name AS clinic_name,
    DATE_TRUNC('month', rc.claim_date) AS month,
    COUNT(rc.id) AS total_claims,
    COUNT(rc.id) FILTER (WHERE rc.status = 'paid') AS paid_claims,
    COUNT(rc.id) FILTER (WHERE rc.status = 'denied') AS denied_claims,
    SUM(rc.total_amount) AS total_billed,
    SUM(rc.approved_amount) AS total_approved,
    SUM(rc.paid_amount) AS total_collected,
    ROUND(AVG(EXTRACT(EPOCH FROM (rc.paid_at - rc.claim_date)) / 86400.0), 2) AS avg_days_to_payment,
    ROUND((COUNT(rc.id) FILTER (WHERE rc.status = 'denied')::DECIMAL / NULLIF(COUNT(rc.id), 0)) * 100, 2) AS denial_rate_pct,
    ROUND((SUM(rc.paid_amount) / NULLIF(SUM(rc.total_amount), 0)) * 100, 2) AS collection_rate_pct
FROM public.clinics c
LEFT JOIN public.rcm_claims rc ON c.id = rc.clinic_id
WHERE rc.claim_date IS NOT NULL
GROUP BY c.id, c.name, DATE_TRUNC('month', rc.claim_date);

CREATE UNIQUE INDEX idx_clinic_financial_kpis ON public.clinic_financial_kpis(clinic_id, month);

-- Trigger para actualizar paid_amount en claims cuando se registra pago
CREATE OR REPLACE FUNCTION update_claim_paid_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.rcm_claims
    SET 
        paid_amount = (
            SELECT COALESCE(SUM(amount), 0)
            FROM public.rcm_payments
            WHERE claim_id = NEW.claim_id
        ),
        updated_at = NOW()
    WHERE id = NEW.claim_id;
    
    -- Actualizar estado si está completamente pagado
    UPDATE public.rcm_claims
    SET status = CASE 
        WHEN paid_amount >= total_amount THEN 'paid'
        WHEN paid_amount > 0 THEN 'partially_paid'
        ELSE status
    END
    WHERE id = NEW.claim_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_claim_on_payment
    AFTER INSERT OR UPDATE ON public.rcm_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_paid_amount();

-- Trigger para actualizar total_amount en claim cuando cambian items
CREATE OR REPLACE FUNCTION update_claim_total_amount()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.rcm_claims
    SET 
        total_amount = (
            SELECT COALESCE(SUM(total_price), 0)
            FROM public.rcm_claim_items
            WHERE claim_id = COALESCE(NEW.claim_id, OLD.claim_id)
        ),
        updated_at = NOW()
    WHERE id = COALESCE(NEW.claim_id, OLD.claim_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_claim_on_item_change
    AFTER INSERT OR UPDATE OR DELETE ON public.rcm_claim_items
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_total_amount();

-- Triggers para updated_at
CREATE TRIGGER update_payer_contracts_timestamp BEFORE UPDATE ON public.payer_contracts FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_rcm_claims_timestamp BEFORE UPDATE ON public.rcm_claims FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_rcm_claim_items_timestamp BEFORE UPDATE ON public.rcm_claim_items FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_rcm_payments_timestamp BEFORE UPDATE ON public.rcm_payments FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_international_patients_timestamp BEFORE UPDATE ON public.international_patients FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();
CREATE TRIGGER update_travel_documents_timestamp BEFORE UPDATE ON public.travel_documents FOR EACH ROW EXECUTE FUNCTION update_clinic_timestamp();

-- RLS Policies
ALTER TABLE public.payer_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_claim_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rcm_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.international_patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_documents ENABLE ROW LEVEL SECURITY;

-- Policies para payer_contracts
CREATE POLICY payer_contracts_select_policy ON public.payer_contracts
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY payer_contracts_modify_policy ON public.payer_contracts
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin', 'finance')
        )
    );

-- Policies para rcm_claims
CREATE POLICY rcm_claims_select_policy ON public.rcm_claims
    FOR SELECT TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
        OR patient_id = auth.uid()
    );

CREATE POLICY rcm_claims_modify_policy ON public.rcm_claims
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin', 'finance', 'manager')
        )
    );

-- Policies para rcm_claim_items
CREATE POLICY rcm_claim_items_select_policy ON public.rcm_claim_items
    FOR SELECT TO authenticated
    USING (
        claim_id IN (SELECT id FROM public.rcm_claims WHERE patient_id = auth.uid())
        OR claim_id IN (
            SELECT rc.id FROM public.rcm_claims rc
            INNER JOIN public.clinic_roles cr ON rc.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

-- Policies para rcm_payments
CREATE POLICY rcm_payments_select_policy ON public.rcm_payments
    FOR SELECT TO authenticated
    USING (
        claim_id IN (
            SELECT rc.id FROM public.rcm_claims rc
            INNER JOIN public.clinic_roles cr ON rc.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

CREATE POLICY rcm_payments_modify_policy ON public.rcm_payments
    FOR ALL TO authenticated
    USING (
        claim_id IN (
            SELECT rc.id FROM public.rcm_claims rc
            INNER JOIN public.clinic_roles cr ON rc.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() 
            AND cr.status = 'active'
            AND cr.role IN ('owner', 'admin', 'finance')
        )
    );

-- Policies para international_patients
CREATE POLICY international_patients_select_policy ON public.international_patients
    FOR SELECT TO authenticated
    USING (
        patient_id = auth.uid()
        OR clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY international_patients_modify_policy ON public.international_patients
    FOR ALL TO authenticated
    USING (
        clinic_id IN (
            SELECT clinic_id FROM public.clinic_roles 
            WHERE user_id = auth.uid() 
            AND status = 'active'
            AND role IN ('owner', 'admin', 'manager', 'concierge')
        )
    );

-- Policies para travel_documents
CREATE POLICY travel_documents_select_policy ON public.travel_documents
    FOR SELECT TO authenticated
    USING (
        international_patient_id IN (
            SELECT id FROM public.international_patients 
            WHERE patient_id = auth.uid()
        )
        OR international_patient_id IN (
            SELECT ip.id FROM public.international_patients ip
            INNER JOIN public.clinic_roles cr ON ip.clinic_id = cr.clinic_id
            WHERE cr.user_id = auth.uid() AND cr.status = 'active'
        )
    );

COMMENT ON TABLE public.payer_contracts IS 'Contratos con aseguradoras y pagadores para gestión de RCM';
COMMENT ON TABLE public.rcm_claims IS 'Claims/facturas del ciclo de ingresos con seguimiento de estados';
COMMENT ON TABLE public.rcm_claim_items IS 'Líneas de detalle de servicios en cada claim';
COMMENT ON TABLE public.rcm_payments IS 'Pagos recibidos y conciliación contra claims';
COMMENT ON TABLE public.international_patients IS 'Registro de pacientes internacionales con datos de viaje';
COMMENT ON TABLE public.travel_documents IS 'Documentos legales y médicos de pacientes internacionales';
COMMENT ON MATERIALIZED VIEW public.clinic_financial_kpis IS 'KPIs financieros agregados por clínica y mes';
