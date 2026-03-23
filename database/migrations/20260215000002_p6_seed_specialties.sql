-- ============================================
-- P6: ADD SLUG COLUMN TO SPECIALTIES
-- ============================================
-- All 132 specialties already exist in the table (with TEXT id PK).
-- This migration adds the slug column and populates it to match
-- the frontend identity system (lib/specialties/data/identities.ts).
-- Applied via execute_sql on 2025-02-15.

-- Step 1: Add slug column (category already exists)
ALTER TABLE specialties ADD COLUMN IF NOT EXISTS slug TEXT;

-- Step 2: Fix name mismatch
UPDATE specialties SET name = 'Cirugía Plástica y Reconstructiva'
WHERE name = 'Cirugía Plástica';

-- Step 3: Populate all 132 slugs via name-based mapping
UPDATE specialties s SET slug = m.slug
FROM (VALUES
  -- GENERAL (4)
  ('Medicina General', 'medicina-general'),
  ('Medicina Familiar', 'medicina-familiar'),
  ('Geriatría', 'geriatria'),
  ('Medicina Interna', 'medicina-interna'),
  -- CARDIOVASCULAR (6)
  ('Cardiología', 'cardiologia'),
  ('Cardiología Intervencionista', 'cardiologia-intervencionista'),
  ('Electrofisiología Cardíaca', 'electrofisiologia-cardiaca'),
  ('Hemodinamia', 'hemodinamia'),
  ('Cardiología Pediátrica', 'cardiologia-pediatrica'),
  ('Cirugía Cardiovascular', 'cirugia-cardiovascular'),
  -- NEUROLOGÍA (5)
  ('Neurología', 'neurologia'),
  ('Neurocirugía', 'neurocirugia'),
  ('Neurología Pediátrica', 'neurologia-pediatrica'),
  ('Neurofisiología Clínica', 'neurofisiologia-clinica'),
  ('Neuropsicología', 'neuropsicologia'),
  -- DIGESTIVO (5)
  ('Gastroenterología', 'gastroenterologia'),
  ('Hepatología', 'hepatologia'),
  ('Coloproctología', 'coloproctologia'),
  ('Gastroenterología Pediátrica', 'gastroenterologia-pediatrica'),
  ('Endoscopia Digestiva', 'endoscopia-digestiva'),
  -- RESPIRATORIO (4)
  ('Neumología', 'neumologia'),
  ('Neumología Pediátrica', 'neumologia-pediatrica'),
  ('Cirugía Torácica', 'cirugia-toracica'),
  ('Medicina del Sueño', 'medicina-del-sueno'),
  -- RENAL (5)
  ('Nefrología', 'nefrologia'),
  ('Nefrología Pediátrica', 'nefrologia-pediatrica'),
  ('Urología', 'urologia'),
  ('Urología Pediátrica', 'urologia-pediatrica'),
  ('Andrología', 'andrologia'),
  -- ENDOCRINO (4)
  ('Endocrinología', 'endocrinologia'),
  ('Diabetología', 'diabetologia'),
  ('Endocrinología Pediátrica', 'endocrinologia-pediatrica'),
  ('Nutriología', 'nutriologia'),
  -- REUMATOLOGÍA (2)
  ('Reumatología', 'reumatologia'),
  ('Reumatología Pediátrica', 'reumatologia-pediatrica'),
  -- HEMATOLOGÍA (5)
  ('Hematología', 'hematologia'),
  ('Oncología Médica', 'oncologia-medica'),
  ('Oncología Radioterápica', 'oncologia-radioterapica'),
  ('Hemato-Oncología Pediátrica', 'hemato-oncologia-pediatrica'),
  ('Mastología', 'mastologia'),
  -- INFECTOLOGÍA (5)
  ('Infectología', 'infectologia'),
  ('Infectología Pediátrica', 'infectologia-pediatrica'),
  ('Inmunología', 'inmunologia'),
  ('Alergología', 'alergologia'),
  ('Alergología e Inmunología Pediátrica', 'alergologia-pediatrica'),
  -- DERMATOLOGÍA (4)
  ('Dermatología', 'dermatologia'),
  ('Dermato-oncología', 'dermato-oncologia'),
  ('Dermatopatología', 'dermatopatologia'),
  ('Dermatología Pediátrica', 'dermatologia-pediatrica'),
  -- MENTAL (5)
  ('Psiquiatría', 'psiquiatria'),
  ('Psiquiatría Infantil y del Adolescente', 'psiquiatria-infantil'),
  ('Psicología Clínica', 'psicologia-clinica'),
  ('Sexología Clínica', 'sexologia-clinica'),
  ('Adicciones y Toxicomanías', 'adicciones'),
  -- CIRUGÍA (5)
  ('Cirugía General', 'cirugia-general'),
  ('Cirugía Bariátrica', 'cirugia-bariatrica'),
  ('Cirugía Laparoscópica', 'cirugia-laparoscopica'),
  ('Cirugía Oncológica', 'cirugia-oncologica'),
  ('Cirugía Pediátrica', 'cirugia-pediatrica'),
  -- TRAUMATOLOGÍA (6)
  ('Traumatología y Ortopedia', 'traumatologia'),
  ('Artroscopia', 'artroscopia'),
  ('Cirugía de Columna', 'cirugia-columna'),
  ('Cirugía de Mano', 'cirugia-mano'),
  ('Medicina del Deporte', 'medicina-deporte'),
  ('Ortopedia Pediátrica', 'ortopedia-pediatrica'),
  -- OFTALMOLOGÍA (6)
  ('Oftalmología', 'oftalmologia'),
  ('Retina y Vítreo', 'retina-vitreo'),
  ('Glaucoma', 'glaucoma'),
  ('Oftalmología Pediátrica', 'oftalmologia-pediatrica'),
  ('Cirugía Refractiva', 'cirugia-refractiva'),
  ('Optometría', 'optometria'),
  -- ORL (5)
  ('Otorrinolaringología', 'otorrinolaringologia'),
  ('Audiología', 'audiologia'),
  ('Foniatría', 'foniatria'),
  ('Logofonoaudiología', 'logofonoaudiologia'),
  ('Cirugía de Cabeza y Cuello', 'cirugia-cabeza-cuello'),
  -- GINECOLOGÍA (5)
  ('Ginecología', 'ginecologia'),
  ('Obstetricia', 'obstetricia'),
  ('Medicina Reproductiva', 'medicina-reproductiva'),
  ('Ginecología Oncológica', 'ginecologia-oncologica'),
  ('Medicina Materno-Fetal', 'medicina-materno-fetal'),
  -- PEDIATRÍA (4)
  ('Pediatría', 'pediatria'),
  ('Neonatología', 'neonatologia'),
  ('Cuidados Intensivos Pediátricos', 'cuidados-intensivos-pediatricos'),
  ('Medicina del Adolescente', 'medicina-adolescente'),
  -- PLÁSTICA (3)
  ('Cirugía Plástica y Reconstructiva', 'cirugia-plastica'),
  ('Cirugía Estética', 'cirugia-estetica'),
  ('Quemados', 'quemados'),
  -- VASCULAR (3)
  ('Cirugía Vascular y Endovascular', 'cirugia-vascular'),
  ('Angiología', 'angiologia'),
  ('Flebología', 'flebologia'),
  -- INTENSIVA (4)
  ('Medicina Intensiva', 'medicina-intensiva'),
  ('Medicina de Emergencias', 'medicina-emergencias'),
  ('Medicina Paliativa', 'medicina-paliativa'),
  ('Medicina del Dolor', 'medicina-dolor'),
  -- DIAGNÓSTICO POR IMAGEN (4)
  ('Radiología e Imágenes', 'radiologia'),
  ('Medicina Nuclear', 'medicina-nuclear'),
  ('Intervencionismo Vascular', 'intervencionismo-vascular'),
  ('Ecografía', 'ecografia'),
  -- ANESTESIA (3)
  ('Anestesiología', 'anestesiologia'),
  ('Anestesia Pediátrica', 'anestesia-pediatrica'),
  ('Anestesia Cardiovascular', 'anestesia-cardiovascular'),
  -- PATOLOGÍA (3)
  ('Patología', 'patologia'),
  ('Patología Clínica', 'patologia-clinica'),
  ('Citopatología', 'citopatologia'),
  -- REHABILITACIÓN (4)
  ('Medicina Física y Rehabilitación', 'medicina-fisica-rehabilitacion'),
  ('Fisioterapia', 'fisioterapia'),
  ('Terapia Ocupacional', 'terapia-ocupacional'),
  ('Quiropráctica', 'quiropractica'),
  -- ESPECIALIZADA (8)
  ('Genética Médica', 'genetica-medica'),
  ('Farmacología Clínica', 'farmacologia-clinica'),
  ('Toxicología', 'toxicologia'),
  ('Medicina del Trabajo', 'medicina-trabajo'),
  ('Medicina Legal y Forense', 'medicina-legal'),
  ('Medicina Preventiva y Salud Pública', 'medicina-preventiva'),
  ('Medicina Hiperbárica', 'medicina-hiperbarica'),
  ('Transplante de Órganos', 'transplante-organos'),
  -- ODONTOLOGÍA (9)
  ('Odontología', 'odontologia'),
  ('Ortodoncia', 'ortodoncia'),
  ('Endodoncia', 'endodoncia'),
  ('Periodoncia', 'periodoncia'),
  ('Implantología Dental', 'implantologia-dental'),
  ('Cirugía Oral y Maxilofacial', 'cirugia-oral-maxilofacial'),
  ('Odontopediatría', 'odontopediatria'),
  ('Ortopedia Dentomaxilofacial', 'ortopedia-dentomaxilofacial'),
  ('Prostodoncia', 'prostodoncia'),
  -- OTROS (6)
  ('Psicología', 'psicologia'),
  ('Podología', 'podologia'),
  ('Psicopedagogía', 'psicopedagogia'),
  ('Estimulación Temprana', 'estimulacion-temprana'),
  ('Acupuntura', 'acupuntura'),
  ('Homeopatía', 'homeopatia')
) AS m(name, slug)
WHERE s.name = m.name;

-- Step 4: Add UNIQUE index on slug
CREATE UNIQUE INDEX IF NOT EXISTS uq_specialties_slug ON specialties (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_specialties_category ON specialties (category) WHERE category IS NOT NULL;

-- Step 5: Verify all 132 slugs populated
DO $$
DECLARE
  total INTEGER;
BEGIN
  SELECT COUNT(*) INTO total FROM specialties WHERE slug IS NOT NULL;
  RAISE NOTICE 'Total specialties with slugs: %', total;
  IF total < 132 THEN
    RAISE WARNING 'Expected at least 132 specialties, got %', total;
  END IF;
END $$;
