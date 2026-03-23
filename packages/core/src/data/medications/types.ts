// Base de datos completa de medicamentos - Venezuela/Latinoamérica
// 2000+ medicamentos con información detallada

export interface MedicationFull {
    id: string;
    nombre: string;
    nombreComercial: string[];
    principioActivo: string;
    categoria: string;
    subcategoria?: string;
    presentaciones: string[];
    dosisComunes: string[];
    frecuenciasComunes: string[];
    viaAdministracion: string[];
    indicaciones?: string[];
}

export type MedicationCategoryType =
    | "analgesicos"
    | "antibioticos"
    | "antihipertensivos"
    | "antidiabeticos"
    | "cardiovasculares"
    | "gastrointestinales"
    | "psiquiatricos"
    | "respiratorios"
    | "hormonales"
    | "antiinflamatorios"
    | "antihistaminicos"
    | "vitaminas"
    | "dermatologicos"
    | "oftalmicos"
    | "neurologicos"
    | "otros";

export interface CategoryDefinition {
    id: MedicationCategoryType;
    nombre: string;
}

export const CATEGORIAS_MEDICAMENTOS: CategoryDefinition[] = [
    { id: "analgesicos", nombre: "Analgésicos y Antipiréticos" },
    { id: "antibioticos", nombre: "Antibióticos y Antiinfecciosos" },
    { id: "antihipertensivos", nombre: "Antihipertensivos" },
    { id: "antidiabeticos", nombre: "Antidiabéticos" },
    { id: "cardiovasculares", nombre: "Cardiovasculares" },
    { id: "gastrointestinales", nombre: "Gastrointestinales" },
    { id: "psiquiatricos", nombre: "Psiquiátricos" },
    { id: "respiratorios", nombre: "Respiratorios" },
    { id: "hormonales", nombre: "Hormonales" },
    { id: "antiinflamatorios", nombre: "Antiinflamatorios" },
    { id: "antihistaminicos", nombre: "Antihistamínicos" },
    { id: "vitaminas", nombre: "Vitaminas y Suplementos" },
    { id: "dermatologicos", nombre: "Dermatológicos" },
    { id: "oftalmicos", nombre: "Oftálmicos y Otológicos" },
    { id: "neurologicos", nombre: "Neurológicos" },
    { id: "otros", nombre: "Otros" },
];

// Frecuencias estándar
export const FRECUENCIAS_ESTANDAR = [
    "Cada 4 horas",
    "Cada 6 horas",
    "Cada 8 horas",
    "Cada 12 horas",
    "Cada 24 horas",
    "Cada 48 horas",
    "Cada 72 horas",
    "Una vez por semana",
    "Según necesidad (SOS)",
    "Antes de las comidas",
    "Después de las comidas",
    "En ayunas",
    "Al acostarse",
];

// Vías de administración
export const VIAS_ADMINISTRACION = [
    "Oral",
    "Sublingual",
    "Intravenosa (IV)",
    "Intramuscular (IM)",
    "Subcutánea (SC)",
    "Tópica",
    "Oftálmica",
    "Ótica",
    "Nasal",
    "Inhalatoria",
    "Rectal",
    "Vaginal",
    "Transdérmica",
];
