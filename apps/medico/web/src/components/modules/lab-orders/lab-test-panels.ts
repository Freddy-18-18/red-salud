// ============================================
// LAB TEST PANELS — Pre-configured panels per specialty
// ============================================

export interface TestPanel {
  name: string;
  tests: string[];
}

/**
 * Default test panels organized by specialty slug.
 * When a specialty is not found, the 'default' panels are used.
 */
export const SPECIALTY_TEST_PANELS: Record<string, TestPanel[]> = {
  cardiologia: [
    { name: 'Panel Cardíaco', tests: ['Troponina', 'BNP', 'CK-MB', 'D-Dímero'] },
    { name: 'Perfil Lipídico', tests: ['Colesterol Total', 'LDL', 'HDL', 'Triglicéridos', 'VLDL'] },
    { name: 'Marcadores de Riesgo', tests: ['PCR ultrasensible', 'Homocisteína', 'Lipoproteína(a)'] },
    { name: 'Coagulación', tests: ['PT', 'PTT', 'INR', 'Fibrinógeno'] },
  ],
  endocrinologia: [
    { name: 'Panel Tiroideo', tests: ['TSH', 'T3 libre', 'T4 libre', 'Anti-TPO', 'Tiroglobulina'] },
    { name: 'Panel Metabólico', tests: ['Glicemia', 'HbA1c', 'Insulina', 'Péptido C', 'HOMA'] },
    { name: 'Panel Adrenal', tests: ['Cortisol AM', 'ACTH', 'DHEA-S', 'Aldosterona', 'Renina'] },
    { name: 'Panel Gonadal', tests: ['FSH', 'LH', 'Estradiol', 'Testosterona', 'Prolactina'] },
  ],
  nefrologia: [
    { name: 'Función Renal', tests: ['Creatinina', 'BUN', 'Ácido úrico', 'TFG estimada'] },
    { name: 'Electrolitos', tests: ['Sodio', 'Potasio', 'Cloro', 'Calcio', 'Fósforo', 'Magnesio'] },
    { name: 'Orina', tests: ['Examen de orina', 'Proteinuria 24h', 'Microalbuminuria', 'Creatinina urinaria'] },
    { name: 'Gases Arteriales', tests: ['pH', 'pCO2', 'pO2', 'HCO3', 'Lactato'] },
  ],
  hematologia: [
    { name: 'Hematología Completa', tests: ['Hemoglobina', 'Hematocrito', 'Leucocitos', 'Plaquetas', 'Diferencial'] },
    { name: 'Estudio de Anemia', tests: ['Hierro sérico', 'Ferritina', 'Transferrina', 'TIBC', 'Reticulocitos'] },
    { name: 'Coagulación Ampliada', tests: ['PT', 'PTT', 'Fibrinógeno', 'Factor VIII', 'Factor von Willebrand'] },
    { name: 'Electroforesis', tests: ['Electroforesis de Hb', 'Electroforesis proteínas séricas'] },
  ],
  gastroenterologia: [
    { name: 'Panel Hepático', tests: ['AST/TGO', 'ALT/TGP', 'Bilirrubina total/directa', 'Fosfatasa alcalina', 'GGT'] },
    { name: 'Función Pancreática', tests: ['Amilasa', 'Lipasa', 'Elastasa fecal'] },
    { name: 'Marcadores de Hepatitis', tests: ['HBsAg', 'Anti-HBs', 'Anti-HCV', 'Carga viral VHB', 'Carga viral VHC'] },
    { name: 'Malabsorción', tests: ['IgA anti-transglutaminasa', 'IgA anti-endomisio', 'IgA total'] },
  ],
  reumatologia: [
    { name: 'Autoinmunidad', tests: ['ANA', 'Anti-DNA', 'Factor Reumatoideo', 'Anti-CCP', 'Complemento C3/C4'] },
    { name: 'Inflamación', tests: ['PCR', 'VSG', 'Ferritina'] },
    { name: 'Panel de Anticuerpos', tests: ['Anti-Sm', 'Anti-RNP', 'Anti-Ro/SSA', 'Anti-La/SSB', 'Anticoagulante lúpico'] },
  ],
  infectologia: [
    { name: 'Panel Infeccioso Básico', tests: ['Hemocultivo', 'Urocultivo', 'PCR', 'Procalcitonina'] },
    { name: 'Serología VIH/ITS', tests: ['VIH 1/2', 'VDRL', 'RPR', 'Hepatitis B y C'] },
    { name: 'Panel Tropical', tests: ['Dengue IgM/IgG', 'Chikungunya', 'Zika', 'Malaria (gota gruesa)'] },
    { name: 'Tuberculosis', tests: ['PPD', 'BK esputo', 'Cultivo de Koch', 'QuantiFERON'] },
  ],
  pediatria: [
    { name: 'Panel Pediátrico Básico', tests: ['Hematología completa', 'PCR', 'VSG', 'Examen de orina'] },
    { name: 'Panel Neonatal', tests: ['TSH neonatal', 'Bilirrubina', 'Hemoclasificación', 'Coombs directo'] },
    { name: 'Crecimiento', tests: ['IGF-1', 'GH basal', 'Edad ósea'] },
    { name: 'Alergias', tests: ['IgE total', 'Panel de alérgenos'] },
  ],
  ginecologia: [
    { name: 'Panel Prenatal', tests: ['Hemoclasificación', 'Hematología', 'Glicemia', 'VDRL', 'VIH', 'Toxoplasma IgG/IgM'] },
    { name: 'Panel Hormonal', tests: ['FSH', 'LH', 'Estradiol', 'Progesterona', 'Prolactina', 'Testosterona', 'DHEA-S'] },
    { name: 'Citología', tests: ['Papanicolaou', 'VPH tipificación', 'Cultivo vaginal'] },
  ],
  oncologia: [
    { name: 'Marcadores Tumorales', tests: ['CEA', 'AFP', 'CA 19-9', 'CA 125', 'CA 15-3', 'PSA'] },
    { name: 'Pre-Quimioterapia', tests: ['Hematología completa', 'Función renal', 'Función hepática', 'Electrolitos'] },
    { name: 'Coagulación', tests: ['PT', 'PTT', 'Fibrinógeno', 'D-Dímero'] },
  ],
  default: [
    { name: 'Hematología Básica', tests: ['Hematología completa', 'VSG'] },
    { name: 'Química Sanguínea', tests: ['Glicemia', 'Creatinina', 'BUN', 'Ácido úrico'] },
    { name: 'Perfil Lipídico', tests: ['Colesterol Total', 'LDL', 'HDL', 'Triglicéridos'] },
    { name: 'Examen de Orina', tests: ['Examen de orina completo'] },
  ],
};

/**
 * Get test panels for a given specialty slug.
 * Falls back to default panels if the specialty is not found.
 */
export function getTestPanels(specialtySlug: string): TestPanel[] {
  return SPECIALTY_TEST_PANELS[specialtySlug] ?? SPECIALTY_TEST_PANELS.default;
}

/**
 * Get all unique test names across all panels for a specialty.
 */
export function getAllTests(specialtySlug: string): string[] {
  const panels = getTestPanels(specialtySlug);
  const testSet = new Set<string>();
  for (const panel of panels) {
    for (const test of panel.tests) {
      testSet.add(test);
    }
  }
  return Array.from(testSet).sort();
}
