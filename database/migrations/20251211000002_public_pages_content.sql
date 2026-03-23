-- Migración: Crear tablas para contenido dinámico de páginas públicas y estadísticas
-- Fecha: 2025-12-11

-- ============================================
-- 1. TABLA: site_content (Contenido Dinámico)
-- ============================================
-- Almacena textos, títulos y configuraciones de las páginas para edición sin código

CREATE TABLE IF NOT EXISTS site_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_key VARCHAR(50) NOT NULL, -- ej: 'pacientes', 'home', 'medicos'
  section_key VARCHAR(50) NOT NULL, -- ej: 'hero', 'benefits', 'features'
  content JSONB NOT NULL DEFAULT '{}'::jsonb, -- Estructura flexible
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(page_key, section_key)
);

-- RLS para site_content
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contenido activo es público"
  ON site_content FOR SELECT
  USING (is_active = true);

-- Solo admins pueden editar (asumiendo rol admin o service_role)
-- Por ahora solo lectura pública


-- ============================================
-- 2. TABLA: testimonials (Si no existe del plan anterior)
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- ej: 'Paciente verificado', 'Cardiólogo'
  content TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  image_url TEXT,
  
  page_context VARCHAR(50) DEFAULT 'general', -- ej: 'pacientes', 'medicos', 'home'
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS para testimonials
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Testimonios activos son públicos"
  ON testimonials FOR SELECT
  USING (is_active = true);


-- ============================================
-- 3. DATOS SEMILLA (Seed Data)
-- ============================================

-- Insertar contenido inicial para Features (reemplazando placeholders)
INSERT INTO site_content (page_key, section_key, content)
VALUES 
(
  'pacientes', 
  'features', 
  '{
    "items": [
      {
        "title": "Expediente Médico Universal",
        "description": "Tu historial médico viaja contigo. Accede a tus recetas, resultados de laboratorio e imágenes diagnósticas desde cualquier lugar, de forma segura y centralizada.",
        "benefits": ["Acceso 24/7 desde cualquier dispositivo", "Historial compartido con tus especialistas", "Seguridad de grado bancario"]
      },
      {
        "title": "Comunicación Directa",
        "description": "Mantén el contacto con tu médico después de la consulta. Resuelve dudas puntuales y da seguimiento a tu tratamiento sin necesidad de una nueva cita completa.",
        "benefits": ["Chat seguro y privado", "Envío de archivos y fotos", "Notificaciones en tiempo real"]
      },
      {
        "title": "Privacidad Garantizada",
        "description": "Tus datos de salud son sensibles y los tratamos con el máximo rigor. Cumplimos con estándares internacionales de protección de datos para tu tranquilidad.",
        "benefits": ["Encriptación de extremo a extremo", "Control total de quién ve tus datos", "Auditoría de accesos"]
      }
    ]
  }'::jsonb
)
ON CONFLICT (page_key, section_key) DO UPDATE
SET content = EXCLUDED.content;

-- Insertar testimonios de ejemplo
INSERT INTO testimonials (name, role, content, rating, page_context, is_featured)
VALUES
('Ana García', 'Paciente Verificada', 'La facilidad para encontrar un especialista y agendar en el mismo día fue increíble. Me ahorró horas de espera.', 5, 'pacientes', true),
('Carlos Mendez', 'Usuario Frecuente', 'Tener todo mi historial en la app me ha ayudado mucho al cambiar de ciudad. Los nuevos médicos tenían todo claro.', 5, 'pacientes', true),
('Lucía Torres', 'Madre de Familia', 'Excelente para consultas pediátricas rápidas. La videollamada funciona perfecto y la receta llega al instante.', 5, 'pacientes', true);
