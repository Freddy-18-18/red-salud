/**
 * @file master-list.ts
 * @description Lista maestra completa de todas las especialidades médicas.
 * Incluye especialidades principales, subespecialidades, y áreas de apoyo.
 * Esta lista debe mantenerse sincronizada con la tabla `specialties` de Supabase.
 *
 * @references
 * - Ministerio de Sanidad de España (listado oficial MIR)
 * - Federación Médica Venezolana
 * - Colegios médicos internacionales
 */

export interface MasterSpecialty {
    /** ID único interno (usado para identificación local) */
    id: string;
    /** Nombre de la especialidad */
    name: string;
    /** Categoría de la especialidad */
    category?: string;
}

/**
 * Lista maestra de especialidades médicas.
 * Organizada por categorías para facilitar mantenimiento.
 */
export const MASTER_SPECIALTIES: MasterSpecialty[] = [
    // ============================================
    // MEDICINA GENERAL Y FAMILIAR
    // ============================================
    { id: "gen-1", name: "Medicina General", category: "general" },
    { id: "gen-2", name: "Medicina Familiar", category: "general" },
    { id: "gen-3", name: "Geriatría", category: "general" },
    { id: "gen-4", name: "Medicina Interna", category: "general" },

    // ============================================
    // CARDIOLOGÍA Y SISTEMA CARDIOVASCULAR
    // ============================================
    { id: "car-1", name: "Cardiología", category: "cardiovascular" },
    { id: "car-2", name: "Cardiología Intervencionista", category: "cardiovascular" },
    { id: "car-3", name: "Electrofisiología Cardíaca", category: "cardiovascular" },
    { id: "car-4", name: "Hemodinamia", category: "cardiovascular" },
    { id: "car-5", name: "Cardiología Pediátrica", category: "cardiovascular" },
    { id: "car-6", name: "Cirugía Cardiovascular", category: "cardiovascular" },

    // ============================================
    // NEUROLOGÍA Y SISTEMA NERVIOSO
    // ============================================
    { id: "neu-1", name: "Neurología", category: "neurologia" },
    { id: "neu-2", name: "Neurocirugía", category: "neurologia" },
    { id: "neu-3", name: "Neurología Pediátrica", category: "neurologia" },
    { id: "neu-4", name: "Neurofisiología Clínica", category: "neurologia" },
    { id: "neu-5", name: "Neuropsicología", category: "neurologia" },

    // ============================================
    // SISTEMA DIGESTIVO
    // ============================================
    { id: "dig-1", name: "Gastroenterología", category: "digestivo" },
    { id: "dig-2", name: "Hepatología", category: "digestivo" },
    { id: "dig-3", name: "Coloproctología", category: "digestivo" },
    { id: "dig-4", name: "Gastroenterología Pediátrica", category: "digestivo" },
    { id: "dig-5", name: "Endoscopia Digestiva", category: "digestivo" },

    // ============================================
    // SISTEMA RESPIRATORIO
    // ============================================
    { id: "res-1", name: "Neumología", category: "respiratorio" },
    { id: "res-2", name: "Neumología Pediátrica", category: "respiratorio" },
    { id: "res-3", name: "Cirugía Torácica", category: "respiratorio" },
    { id: "res-4", name: "Medicina del Sueño", category: "respiratorio" },

    // ============================================
    // SISTEMA RENAL Y UROLÓGICO
    // ============================================
    { id: "ren-1", name: "Nefrología", category: "renal" },
    { id: "ren-2", name: "Nefrología Pediátrica", category: "renal" },
    { id: "ren-3", name: "Urología", category: "renal" },
    { id: "ren-4", name: "Urología Pediátrica", category: "renal" },
    { id: "ren-5", name: "Andrología", category: "renal" },

    // ============================================
    // ENDOCRINOLOGÍA Y METABOLISMO
    // ============================================
    { id: "end-1", name: "Endocrinología", category: "endocrino" },
    { id: "end-2", name: "Diabetología", category: "endocrino" },
    { id: "end-3", name: "Endocrinología Pediátrica", category: "endocrino" },
    { id: "end-4", name: "Nutriología", category: "endocrino" },

    // ============================================
    // REUMATOLOGÍA Y SISTEMA MUSCULOESQUELÉTICO
    // ============================================
    { id: "reu-1", name: "Reumatología", category: "reumatologia" },
    { id: "reu-2", name: "Reumatología Pediátrica", category: "reumatologia" },

    // ============================================
    // HEMATOLOGÍA Y ONCOLOGÍA
    // ============================================
    { id: "hem-1", name: "Hematología", category: "hematologia" },
    { id: "hem-2", name: "Oncología Médica", category: "hematologia" },
    { id: "hem-3", name: "Oncología Radioterápica", category: "hematologia" },
    { id: "hem-4", name: "Hemato-Oncología Pediátrica", category: "hematologia" },
    { id: "hem-5", name: "Mastología", category: "hematologia" },

    // ============================================
    // INFECTOLOGÍA E INMUNOLOGÍA
    // ============================================
    { id: "inf-1", name: "Infectología", category: "infectologia" },
    { id: "inf-2", name: "Infectología Pediátrica", category: "infectologia" },
    { id: "inf-3", name: "Inmunología", category: "infectologia" },
    { id: "inf-4", name: "Alergología", category: "infectologia" },
    { id: "inf-5", name: "Alergología e Inmunología Pediátrica", category: "infectologia" },

    // ============================================
    // DERMATOLOGÍA
    // ============================================
    { id: "der-1", name: "Dermatología", category: "dermatologia" },
    { id: "der-2", name: "Dermato-oncología", category: "dermatologia" },
    { id: "der-3", name: "Dermatopatología", category: "dermatologia" },
    { id: "der-4", name: "Dermatología Pediátrica", category: "dermatologia" },

    // ============================================
    // PSIQUIATRÍA Y SALUD MENTAL
    // ============================================
    { id: "psi-1", name: "Psiquiatría", category: "mental" },
    { id: "psi-2", name: "Psiquiatría Infantil y del Adolescente", category: "mental" },
    { id: "psi-3", name: "Psicología Clínica", category: "mental" },
    { id: "psi-4", name: "Sexología Clínica", category: "mental" },
    { id: "psi-5", name: "Adicciones y Toxicomanías", category: "mental" },

    // ============================================
    // CIRUGÍA GENERAL Y SUBESPECIALIDADES
    // ============================================
    { id: "cir-1", name: "Cirugía General", category: "cirugia" },
    { id: "cir-2", name: "Cirugía Bariátrica", category: "cirugia" },
    { id: "cir-3", name: "Cirugía Laparoscópica", category: "cirugia" },
    { id: "cir-4", name: "Cirugía Oncológica", category: "cirugia" },
    { id: "cir-5", name: "Cirugía Pediátrica", category: "cirugia" },

    // ============================================
    // TRAUMATOLOGÍA Y ORTOPEDIA
    // ============================================
    { id: "tra-1", name: "Traumatología y Ortopedia", category: "traumatologia" },
    { id: "tra-2", name: "Artroscopia", category: "traumatologia" },
    { id: "tra-3", name: "Cirugía de Columna", category: "traumatologia" },
    { id: "tra-4", name: "Cirugía de Mano", category: "traumatologia" },
    { id: "tra-5", name: "Medicina del Deporte", category: "traumatologia" },
    { id: "tra-6", name: "Ortopedia Pediátrica", category: "traumatologia" },

    // ============================================
    // OFTALMOLOGÍA
    // ============================================
    { id: "oft-1", name: "Oftalmología", category: "oftalmologia" },
    { id: "oft-2", name: "Retina y Vítreo", category: "oftalmologia" },
    { id: "oft-3", name: "Glaucoma", category: "oftalmologia" },
    { id: "oft-4", name: "Oftalmología Pediátrica", category: "oftalmologia" },
    { id: "oft-5", name: "Cirugía Refractiva", category: "oftalmologia" },
    { id: "oft-6", name: "Optometría", category: "oftalmologia" },

    // ============================================
    // OTORRINOLARINGOLOGÍA
    // ============================================
    { id: "orl-1", name: "Otorrinolaringología", category: "orl" },
    { id: "orl-2", name: "Audiología", category: "orl" },
    { id: "orl-3", name: "Foniatría", category: "orl" },
    { id: "orl-4", name: "Logofonoaudiología", category: "orl" },
    { id: "orl-5", name: "Cirugía de Cabeza y Cuello", category: "orl" },

    // ============================================
    // GINECOLOGÍA Y OBSTETRICIA
    // ============================================
    { id: "gin-1", name: "Ginecología", category: "ginecologia" },
    { id: "gin-2", name: "Obstetricia", category: "ginecologia" },
    { id: "gin-3", name: "Medicina Reproductiva", category: "ginecologia" },
    { id: "gin-4", name: "Ginecología Oncológica", category: "ginecologia" },
    { id: "gin-5", name: "Medicina Materno-Fetal", category: "ginecologia" },

    // ============================================
    // PEDIATRÍA Y NEONATOLOGÍA
    // ============================================
    { id: "ped-1", name: "Pediatría", category: "pediatria" },
    { id: "ped-2", name: "Neonatología", category: "pediatria" },
    { id: "ped-3", name: "Cuidados Intensivos Pediátricos", category: "pediatria" },
    { id: "ped-4", name: "Medicina del Adolescente", category: "pediatria" },

    // ============================================
    // CIRUGÍA PLÁSTICA Y RECONSTRUCTIVA
    // ============================================
    { id: "pla-1", name: "Cirugía Plástica y Reconstructiva", category: "plastica" },
    { id: "pla-2", name: "Cirugía Estética", category: "plastica" },
    { id: "pla-3", name: "Quemados", category: "plastica" },

    // ============================================
    // CIRUGÍA VASCULAR
    // ============================================
    { id: "vas-1", name: "Cirugía Vascular y Endovascular", category: "vascular" },
    { id: "vas-2", name: "Angiología", category: "vascular" },
    { id: "vas-3", name: "Flebología", category: "vascular" },

    // ============================================
    // MEDICINA INTENSIVA Y EMERGENCIAS
    // ============================================
    { id: "int-1", name: "Medicina Intensiva", category: "intensiva" },
    { id: "int-2", name: "Medicina de Emergencias", category: "intensiva" },
    { id: "int-3", name: "Medicina Paliativa", category: "intensiva" },
    { id: "int-4", name: "Medicina del Dolor", category: "intensiva" },

    // ============================================
    // DIAGNÓSTICO POR IMÁGENES
    // ============================================
    { id: "img-1", name: "Radiología e Imágenes", category: "diagnostico" },
    { id: "img-2", name: "Medicina Nuclear", category: "diagnostico" },
    { id: "img-3", name: "Intervencionismo Vascular", category: "diagnostico" },
    { id: "img-4", name: "Ecografía", category: "diagnostico" },

    // ============================================
    // ANESTESIOLOGÍA
    // ============================================
    { id: "ane-1", name: "Anestesiología", category: "anestesia" },
    { id: "ane-2", name: "Anestesia Pediátrica", category: "anestesia" },
    { id: "ane-3", name: "Anestesia Cardiovascular", category: "anestesia" },

    // ============================================
    // PATOLOGÍA Y LABORATORIO
    // ============================================
    { id: "pat-1", name: "Patología", category: "patologia" },
    { id: "pat-2", name: "Patología Clínica", category: "patologia" },
    { id: "pat-3", name: "Citopatología", category: "patologia" },

    // ============================================
    // MEDICINA FÍSICA Y REHABILITACIÓN
    // ============================================
    { id: "reh-1", name: "Medicina Física y Rehabilitación", category: "rehabilitacion" },
    { id: "reh-2", name: "Fisioterapia", category: "rehabilitacion" },
    { id: "reh-3", name: "Terapia Ocupacional", category: "rehabilitacion" },
    { id: "reh-4", name: "Quiropráctica", category: "rehabilitacion" },

    // ============================================
    // GENÉTICA Y MEDICINA ESPECIALIZADA
    // ============================================
    { id: "esp-1", name: "Genética Médica", category: "especializada" },
    { id: "esp-2", name: "Farmacología Clínica", category: "especializada" },
    { id: "esp-3", name: "Toxicología", category: "especializada" },
    { id: "esp-4", name: "Medicina del Trabajo", category: "especializada" },
    { id: "esp-5", name: "Medicina Legal y Forense", category: "especializada" },
    { id: "esp-6", name: "Medicina Preventiva y Salud Pública", category: "especializada" },
    { id: "esp-7", name: "Medicina Hiperbárica", category: "especializada" },
    { id: "esp-8", name: "Transplante de Órganos", category: "especializada" },

    // ============================================
    // ODONTOLOGÍA Y SUBESPECIALIDADES
    // ============================================
    { id: "odo-1", name: "Odontología", category: "odontologia" },
    { id: "odo-2", name: "Ortodoncia", category: "odontologia" },
    { id: "odo-3", name: "Endodoncia", category: "odontologia" },
    { id: "odo-4", name: "Periodoncia", category: "odontologia" },
    { id: "odo-5", name: "Implantología Dental", category: "odontologia" },
    { id: "odo-6", name: "Cirugía Oral y Maxilofacial", category: "odontologia" },
    { id: "odo-7", name: "Odontopediatría", category: "odontologia" },
    { id: "odo-8", name: "Ortopedia Dentomaxilofacial", category: "odontologia" },
    { id: "odo-9", name: "Prostodoncia", category: "odontologia" },

    // ============================================
    // OTRAS ESPECIALIDADES
    // ============================================
    { id: "oth-1", name: "Psicología", category: "otros" },
    { id: "oth-2", name: "Podología", category: "otros" },
    { id: "oth-3", name: "Psicopedagogía", category: "otros" },
    { id: "oth-4", name: "Estimulación Temprana", category: "otros" },
    { id: "oth-5", name: "Acupuntura", category: "otros" },
    { id: "oth-6", name: "Homeopatía", category: "otros" },
];

/**
 * Obtiene todas las especialidades de una categoría específica.
 *
 * @param category - Categoría a filtrar
 * @returns Lista de especialidades de esa categoría
 */
export function getSpecialtiesByCategory(category: string): MasterSpecialty[] {
    return MASTER_SPECIALTIES.filter((s) => s.category === category);
}

/**
 * Obtiene todas las categorías únicas disponibles.
 *
 * @returns Set de categorías
 */
export function getAllCategories(): Set<string> {
    return new Set(MASTER_SPECIALTIES.map((s) => s.category).filter(Boolean) as string[]);
}

/**
 * Busca una especialidad por nombre (normalizado).
 *
 * @param name - Nombre a buscar
 * @returns Especialidad encontrada o undefined
 */
export function findSpecialtyByName(name: string): MasterSpecialty | undefined {
    const normalized = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    return MASTER_SPECIALTIES.find((s) => {
        const sNormalized = s.name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim();
        return sNormalized === normalized || sNormalized.includes(normalized);
    });
}
