-- =====================================================
-- Sistema de Cobertura Geográfica para Venezuela
-- =====================================================

-- Tabla de Estados de Venezuela
CREATE TABLE IF NOT EXISTS public.estados_venezuela (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  codigo TEXT NOT NULL UNIQUE, -- Ejemplo: "DC", "MIR", "CAR"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de Municipios
CREATE TABLE IF NOT EXISTS public.municipios_venezuela (
  id SERIAL PRIMARY KEY,
  estado_id INTEGER NOT NULL REFERENCES public.estados_venezuela(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(estado_id, nombre)
);

-- Agregar campos de ubicación a doctor_profiles
ALTER TABLE public.doctor_profiles
ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados_venezuela(id),
ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios_venezuela(id),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Agregar campos de ubicación a pharmacy_profiles
ALTER TABLE public.pharmacy_profiles
ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados_venezuela(id),
ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios_venezuela(id),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Agregar campos de ubicación a laboratory_profiles
ALTER TABLE public.laboratory_profiles
ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados_venezuela(id),
ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios_venezuela(id),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Agregar campos de ubicación a insurance_profiles (aseguradoras)
ALTER TABLE public.insurance_profiles
ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados_venezuela(id),
ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios_venezuela(id),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Agregar campos de ubicación a clinic_profiles
ALTER TABLE public.clinic_profiles
ADD COLUMN IF NOT EXISTS estado_id INTEGER REFERENCES public.estados_venezuela(id),
ADD COLUMN IF NOT EXISTS municipio_id INTEGER REFERENCES public.municipios_venezuela(id),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- Insertar los 23 estados + Distrito Capital de Venezuela
INSERT INTO public.estados_venezuela (nombre, codigo) VALUES
('Distrito Capital', 'DC'),
('Amazonas', 'AMA'),
('Anzoátegui', 'ANZ'),
('Apure', 'APU'),
('Aragua', 'ARA'),
('Barinas', 'BAR'),
('Bolívar', 'BOL'),
('Carabobo', 'CAR'),
('Cojedes', 'COJ'),
('Delta Amacuro', 'DEL'),
('Falcón', 'FAL'),
('Guárico', 'GUA'),
('Lara', 'LAR'),
('Mérida', 'MER'),
('Miranda', 'MIR'),
('Monagas', 'MON'),
('Nueva Esparta', 'NUE'),
('Portuguesa', 'POR'),
('Sucre', 'SUC'),
('Táchira', 'TAC'),
('Trujillo', 'TRU'),
('Vargas', 'VAR'),
('Yaracuy', 'YAR'),
('Zulia', 'ZUL')
ON CONFLICT (codigo) DO NOTHING;

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_estado ON public.doctor_profiles(estado_id);
CREATE INDEX IF NOT EXISTS idx_doctor_profiles_municipio ON public.doctor_profiles(municipio_id);
CREATE INDEX IF NOT EXISTS idx_pharmacy_profiles_estado ON public.pharmacy_profiles(estado_id);
CREATE INDEX IF NOT EXISTS idx_laboratory_profiles_estado ON public.laboratory_profiles(estado_id);
CREATE INDEX IF NOT EXISTS idx_insurance_profiles_estado ON public.insurance_profiles(estado_id);
CREATE INDEX IF NOT EXISTS idx_clinic_profiles_estado ON public.clinic_profiles(estado_id);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.estados_venezuela ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.municipios_venezuela ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para estados y municipios
CREATE POLICY "Estados son públicos" ON public.estados_venezuela FOR SELECT USING (true);
CREATE POLICY "Municipios son públicos" ON public.municipios_venezuela FOR SELECT USING (true);

-- Comentarios para documentación
COMMENT ON TABLE public.estados_venezuela IS 'Tabla de estados de Venezuela para sistema de cobertura geográfica';
COMMENT ON TABLE public.municipios_venezuela IS 'Tabla de municipios de Venezuela por estado';
COMMENT ON COLUMN public.doctor_profiles.estado_id IS 'Estado donde opera el médico';
COMMENT ON COLUMN public.doctor_profiles.municipio_id IS 'Municipio donde opera el médico';
COMMENT ON COLUMN public.doctor_profiles.direccion IS 'Dirección completa del consultorio';
