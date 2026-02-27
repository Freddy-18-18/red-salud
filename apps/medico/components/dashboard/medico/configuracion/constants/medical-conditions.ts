export const MEDICAL_CONDITIONS = [
    // General / Comunes
    "Hipertensión Arterial",
    "Diabetes Mellitus Tipo 1",
    "Diabetes Mellitus Tipo 2",
    "Obesidad",
    "Asma Bronquial",
    "Artritis Reumatoide",
    "Migraña",
    "Gastritis",
    "Ansiedad",
    "Depresión",
    "Insomnio",
    "Alergias Estacionales",
    "Dermatitis Atópica",
    "Acné",
    "Gripe / Influenza",
    "Resfriado Común",
    "Colesterol Alto (Dislipidemia)",
    "Anemia",
    "Infección Urinaria",
    "Dolor Lumbar (Lumbago)",

    // Cardiología
    "Insuficiencia Cardíaca",
    "Arritmia Cardíaca",
    "Fibrilación Auricular",
    "Cardiopatía Isquémica",
    "Valvulopatías",
    "Aterosclerosis",
    "Trombosis Venosa Profunda",
    "Várices",

    // Endocrinología
    "Hipotiroidismo",
    "Hipertiroidismo",
    "Síndrome de Ovario Poliquístico (SOP)",
    "Osteoporosis",
    "Menopausia",
    "Síndrome Metabólico",

    // Gastroenterología
    "Reflujo Gastroesofágico (ERGE)",
    "Síndrome del Intestino Irritable (Colon Irritable)",
    "Enfermedad de Crohn",
    "Colitis Ulcerosa",
    "Hepatitis",
    "Hígado Graso",
    "Cálculos Biliares",
    "Estreñimiento Crónico",
    "Intolerancia a la Lactosa",
    "Enfermedad Celíaca",

    // Neurología
    "Epilepsia",
    "Alzheimer",
    "Parkinson",
    "Esclerosis Múltiple",
    "Accidente Cerebrovascular (ACV)",
    "Neuropatía Periférica",
    "Vértigo",

    // Respiratorio
    "EPOC (Enfermedad Pulmonar Obstructiva Crónica)",
    "Bronquitis Crónica",
    "Neumonía",
    "Apnea del Sueño",
    "Rinitis Alérgica",
    "Sinusitis",

    // Traumatología y Reumatología
    "Artrosis",
    "Osteoartritis",
    "Fibromialgia",
    "Tendinitis",
    "Fascitis Plantar",
    "Hernia Discal",
    "Escoliosis",
    "Gota",
    "Lupus Eritematoso Sistémico",

    // Dermatología
    "Psoriasis",
    "Rosácea",
    "Eczema",
    "Vitiligo",
    "Melasma",
    "Alopecia",
    "Hongos en las uñas (Onicomicosis)",
    "Verrugas",

    // Pediatría (Comunes)
    "Varicela",
    "Otitis Media",
    "Amigdalitis",
    "Faringitis",
    "Bronquiolitis",
    "Cólicos del Lactante",
    "Fiebre",

    // Ginecología y Urología
    "Infecciones de Transmisión Sexual (ITS)",
    "Candidiasis",
    "Vaginosis Bacteriana",
    "Endometriosis",
    "Miomas Uterinos",
    "Hiperplasia Benigna de Próstata",
    "Disfunción Eréctil",
    "Cálculos Renales",
    "Incontinencia Urinaria",

    // Oftalmología
    "Miopía",
    "Astigmatismo",
    "Hipermetropía",
    "Presbicia",
    "Cataratas",
    "Glaucoma",
    "Conjuntivitis",
    "Ojo Seco",

    // Salud Mental
    "Trastorno Bipolar",
    "Trastorno de Pánico",
    "Trastorno Obsesivo-Compulsivo (TOC)",
    "Trastorno de Estrés Postraumático (TEPT)",
    "TDAH (Déficit de Atención e Hiperactividad)",
    "Anorexia Nerviosa",
    "Bulimia Nerviosa",

    // Otros
    "Cáncer (General)",
    "Fatiga Crónica",
    "Cefalea Tensional",
    "Infecciones de Oído",
    "Quemaduras",
    "Heridas",
];

export interface SearchableConditionOption {
    value: string;
    label: string;
}

export const MEDICAL_CONDITIONS_OPTIONS: SearchableConditionOption[] = MEDICAL_CONDITIONS.sort().map(c => ({
    value: c,
    label: c
}));
