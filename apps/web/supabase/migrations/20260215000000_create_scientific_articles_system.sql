-- Tabla para almacenar artículos científicos importados de PubMed
-- Fecha: 20260215000000

CREATE TABLE IF NOT EXISTS scientific_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pmid VARCHAR(20) UNIQUE NOT NULL,
    pmcid VARCHAR(20),
    doi VARCHAR(100),
    title TEXT NOT NULL,
    abstract TEXT,
    authors TEXT[] DEFAULT '{}',
    journal VARCHAR(255),
    pub_date DATE,
    mesh_terms TEXT[] DEFAULT '{}',
    full_text_url TEXT,
    is_open_access BOOLEAN DEFAULT false,
    source_category VARCHAR(100) NOT NULL,
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_scientific_articles_pmid ON scientific_articles(pmid);
CREATE INDEX idx_scientific_articles_pmcid ON scientific_articles(pmcid);
CREATE INDEX idx_scientific_articles_category ON scientific_articles(source_category);
CREATE INDEX idx_scientific_articles_open_access ON scientific_articles(is_open_access) WHERE is_open_access = true;
CREATE INDEX idx_scientific_articles_pub_date ON scientific_articles(pub_date DESC);

-- Búsqueda Full-Text
ALTER TABLE scientific_articles ADD COLUMN IF NOT EXISTS search_vector tsvector
    GENERATED ALWAYS AS (to_tsvector('spanish', title || ' ' || COALESCE(abstract, '') || ' ' || array_to_string(authors, ' ') || ' ' || journal)) STORED;

CREATE INDEX idx_scientific_articles_search ON scientific_articles USING GIN(search_vector);

-- Función para actualizar búsqueda
CREATE OR REPLACE FUNCTION update_scientific_article_search()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := to_tsvector('spanish', NEW.title || ' ' || COALESCE(NEW.abstract, '') || ' ' || array_to_string(NEW.authors, ' ') || ' ' || NEW.journal);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_scientific_article_search
    BEFORE INSERT OR UPDATE ON scientific_articles
    FOR EACH ROW EXECUTE FUNCTION update_scientific_article_search();

-- Tabla de categorías médicas para artículos científicos
CREATE TABLE IF NOT EXISTS scientific_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    pubmed_term VARCHAR(255) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar categorías médicas por defecto
INSERT INTO scientific_categories (name, slug, description, pubmed_term, color, sort_order) VALUES
    ('Cardiología', 'cardiologia', 'Enfermedades del corazón y sistema cardiovascular', 'cardiovascular disease[MeSH Terms]', '#EF4444', 1),
    ('Neurología', 'neurologia', 'Trastornos del sistema nervioso', 'neurology[MeSH Terms]', '#8B5CF6', 2),
    ('Oncología', 'oncologia', 'Cáncer y tumores', 'cancer[MeSH Terms]', '#F59E0B', 3),
    ('Endocrinología', 'endocrinologia', 'Glándulas y hormonas', 'diabetes[MeSH Terms]', '#10B981', 4),
    ('Gastroenterología', 'gastroenterologia', 'Sistema digestivo', 'gastrointestinal[MeSH Terms]', '#3B82F6', 5),
    ('Neumología', 'neumologia', 'Enfermedades pulmonares', 'pulmonology[MeSH Terms]', '#06B6D4', 6),
    ('Nefrología', 'nefrologia', 'Enfermedades renales', 'kidney disease[MeSH Terms]', '#EC4899', 7),
    ('Reumatología', 'reumatologia', 'Enfermedades reumáticas', 'rheumatology[MeSH Terms]', '#F97316', 8),
    ('Enfermedades Infecciosas', 'enfermedades-infecciosas', 'Infecciones y enfermedades transmisibles', 'infectious disease[MeSH Terms]', '#84CC16', 9),
    ('Pediatría', 'pediatria', 'Salud infantil', 'pediatrics[MeSH Terms]', '#14B8A6', 10),
    ('Obstetricia', 'obstetricia', 'Embarazo y parto', 'pregnancy[MeSH Terms]', '#E11D48', 11),
    ('Psiquiatría', 'psiquiatria', 'Salud mental', 'mental health[MeSH Terms]', '#6366F1', 12),
    ('Dermatología', 'dermatologia', 'Enfermedades de la piel', 'dermatology[MeSH Terms]', '#D97706', 13),
    ('Oftalmología', 'oftalmologia', 'Enfermedades de los ojos', 'ophthalmology[MeSH Terms]', '#0EA5E9', 14),
    ('Otorrinolaringología', 'otorrinolaringologia', 'ENT - Oído, nariz y garganta', 'otolaryngology[MeSH Terms]', '#A855F7', 15),
    ('Traumatología', 'traumatologia', 'Lesiones y huesos', 'orthopedics[MeSH Terms]', '#F43F5E', 16),
    ('Urología', 'urologia', 'Sistema urinario', 'urology[MeSH Terms]', '#22C55E', 17),
    ('Nutrición', 'nutricion', 'Alimentación y dietética', 'nutrition[MeSH Terms]', '#EAB308', 18),
    ('Medicina Preventiva', 'medicina-preventiva', 'Prevención de enfermedades', 'preventive medicine[MeSH Terms]', '#0D9488', 19),
    ('Salud Pública', 'salud-publica', 'Salud comunitaria', 'public health[MeSH Terms]', '#64748B', 20)
ON CONFLICT (slug) DO NOTHING;

-- Función para importar artículo desde PubMed
CREATE OR REPLACE FUNCTION import_scientific_article(
    p_pmid VARCHAR(20),
    p_pmcid VARCHAR(20),
    p_doi VARCHAR(100),
    p_title TEXT,
    p_abstract TEXT,
    p_authors TEXT[],
    p_journal VARCHAR(255),
    p_pub_date DATE,
    p_mesh_terms TEXT[],
    p_full_text_url TEXT,
    p_is_open_access BOOLEAN,
    p_source_category VARCHAR(100)
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO scientific_articles (
        pmid, pmcid, doi, title, abstract, authors, journal,
        pub_date, mesh_terms, full_text_url, is_open_access, source_category
    ) VALUES (
        p_pmid, p_pmcid, p_doi, p_title, p_abstract, p_authors, p_journal,
        p_pub_date, p_mesh_terms, p_full_text_url, p_is_open_access, p_source_category
    )
    ON CONFLICT (pmid) DO UPDATE SET
        pmcid = EXCLUDED.pmcid,
        doi = EXCLUDED.doi,
        title = EXCLUDED.title,
        abstract = EXCLUDED.abstract,
        authors = EXCLUDED.authors,
        journal = EXCLUDED.journal,
        pub_date = EXCLUDED.pub_date,
        mesh_terms = EXCLUDED.mesh_terms,
        full_text_url = EXCLUDED.full_text_url,
        is_open_access = EXCLUDED.is_open_access,
        synced_at = NOW()
    RETURNING id INTO v_id;

    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Habilitar Row Level Security
ALTER TABLE scientific_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scientific_categories ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso público
CREATE POLICY "Public read access to scientific_articles"
    ON scientific_articles FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Public read access to scientific_categories"
    ON scientific_categories FOR SELECT
    TO anon, authenticated
    USING (is_active = true);

-- Vista para artículos open access
CREATE OR REPLACE VIEW v_open_access_articles AS
SELECT * FROM scientific_articles
WHERE is_open_access = true
ORDER BY pub_date DESC;

-- Comentario de la tabla
COMMENT ON TABLE scientific_articles IS 'Artículos científicos importados automáticamente desde PubMed/NCBI';
COMMENT ON TABLE scientific_categories IS 'Categorías médicas para clasificar artículos científicos';
