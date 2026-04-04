/**
 * @file allergy-panels-data.ts
 * @description Allergen panels organized by category for skin prick and IgE testing.
 * All labels in Venezuelan Spanish.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface Allergen {
  id: string;
  name: string;
  category: AllergenCategory;
}

export type AllergenCategory =
  | 'respiratory'
  | 'food'
  | 'drugs'
  | 'venoms'
  | 'contact';

export interface AllergenPanel {
  category: AllergenCategory;
  label: string;
  icon: string;
  allergens: Allergen[];
}

export type SkinPrickResult = '-' | '+' | '++' | '+++';

export interface SkinPrickEntry {
  allergen: Allergen;
  whealSize: number; // mm
  flareSize: number; // mm
  result: SkinPrickResult;
}

export type IgEClass = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface IgEEntry {
  allergen: Allergen;
  value: number; // kU/L
  igeClass: IgEClass;
}

// ============================================================================
// ALLERGEN PANELS
// ============================================================================

export const ALLERGEN_PANELS: AllergenPanel[] = [
  {
    category: 'respiratory',
    label: 'Aeroalérgenos',
    icon: 'Wind',
    allergens: [
      { id: 'acaro-dp', name: 'Ácaro D. pteronyssinus', category: 'respiratory' },
      { id: 'acaro-df', name: 'Ácaro D. farinae', category: 'respiratory' },
      { id: 'acaro-bt', name: 'Ácaro B. tropicalis', category: 'respiratory' },
      { id: 'hongo-alternaria', name: 'Alternaria alternata', category: 'respiratory' },
      { id: 'hongo-aspergillus', name: 'Aspergillus fumigatus', category: 'respiratory' },
      { id: 'hongo-cladosporium', name: 'Cladosporium herbarum', category: 'respiratory' },
      { id: 'hongo-penicillium', name: 'Penicillium notatum', category: 'respiratory' },
      { id: 'epitelio-gato', name: 'Epitelio de gato', category: 'respiratory' },
      { id: 'epitelio-perro', name: 'Epitelio de perro', category: 'respiratory' },
      { id: 'cucaracha', name: 'Cucaracha (Blatella)', category: 'respiratory' },
      { id: 'polen-gramineas', name: 'Pólenes de gramíneas', category: 'respiratory' },
      { id: 'polen-malezas', name: 'Pólenes de malezas', category: 'respiratory' },
      { id: 'polen-arboles', name: 'Pólenes de árboles', category: 'respiratory' },
    ],
  },
  {
    category: 'food',
    label: 'Alimentos',
    icon: 'UtensilsCrossed',
    allergens: [
      { id: 'leche-vaca', name: 'Leche de vaca', category: 'food' },
      { id: 'huevo-clara', name: 'Clara de huevo', category: 'food' },
      { id: 'huevo-yema', name: 'Yema de huevo', category: 'food' },
      { id: 'trigo', name: 'Trigo', category: 'food' },
      { id: 'soya', name: 'Soya', category: 'food' },
      { id: 'mani', name: 'Maní', category: 'food' },
      { id: 'nuez', name: 'Nueces de árbol', category: 'food' },
      { id: 'pescado', name: 'Pescado (bacalao)', category: 'food' },
      { id: 'camaron', name: 'Camarón', category: 'food' },
      { id: 'cangrejo', name: 'Cangrejo', category: 'food' },
      { id: 'chocolate', name: 'Chocolate/Cacao', category: 'food' },
      { id: 'fresa', name: 'Fresa', category: 'food' },
      { id: 'tomate', name: 'Tomate', category: 'food' },
      { id: 'maiz', name: 'Maíz', category: 'food' },
    ],
  },
  {
    category: 'drugs',
    label: 'Medicamentos',
    icon: 'Pill',
    allergens: [
      { id: 'penicilina', name: 'Penicilina', category: 'drugs' },
      { id: 'amoxicilina', name: 'Amoxicilina', category: 'drugs' },
      { id: 'cefalosporinas', name: 'Cefalosporinas', category: 'drugs' },
      { id: 'sulfas', name: 'Sulfonamidas', category: 'drugs' },
      { id: 'aines-aspirina', name: 'AINEs / Aspirina', category: 'drugs' },
      { id: 'ibuprofeno', name: 'Ibuprofeno', category: 'drugs' },
      { id: 'dipirona', name: 'Dipirona (Metamizol)', category: 'drugs' },
      { id: 'lidocaina', name: 'Lidocaína', category: 'drugs' },
      { id: 'contraste-yodado', name: 'Contraste yodado', category: 'drugs' },
      { id: 'latex', name: 'Látex', category: 'drugs' },
    ],
  },
  {
    category: 'venoms',
    label: 'Venenos',
    icon: 'Bug',
    allergens: [
      { id: 'abeja', name: 'Veneno de abeja (Apis)', category: 'venoms' },
      { id: 'avispa', name: 'Veneno de avispa (Vespula)', category: 'venoms' },
      { id: 'hormiga-fuego', name: 'Hormiga de fuego (Solenopsis)', category: 'venoms' },
      { id: 'escorpion', name: 'Escorpión (Tityus)', category: 'venoms' },
    ],
  },
  {
    category: 'contact',
    label: 'Contacto',
    icon: 'Hand',
    allergens: [
      { id: 'niquel', name: 'Níquel', category: 'contact' },
      { id: 'cromo', name: 'Cromo', category: 'contact' },
      { id: 'cobalto', name: 'Cobalto', category: 'contact' },
      { id: 'formaldehido', name: 'Formaldehído', category: 'contact' },
      { id: 'balsamo-peru', name: 'Bálsamo del Perú', category: 'contact' },
      { id: 'fragancia-mix', name: 'Mezcla de fragancias', category: 'contact' },
      { id: 'ppd', name: 'PPD (tintes capilares)', category: 'contact' },
      { id: 'resina-epoxi', name: 'Resina epoxi', category: 'contact' },
    ],
  },
];

// ============================================================================
// IgE CLASS DEFINITIONS
// ============================================================================

export const IGE_CLASS_RANGES: Record<IgEClass, { min: number; max: number; label: string; color: string }> = {
  0: { min: 0, max: 0.35, label: 'Ausente/Indetectable', color: '#22c55e' },
  1: { min: 0.35, max: 0.7, label: 'Bajo', color: '#84cc16' },
  2: { min: 0.7, max: 3.5, label: 'Moderado', color: '#eab308' },
  3: { min: 3.5, max: 17.5, label: 'Alto', color: '#f97316' },
  4: { min: 17.5, max: 50, label: 'Muy alto', color: '#ef4444' },
  5: { min: 50, max: 100, label: 'Muy alto', color: '#dc2626' },
  6: { min: 100, max: Infinity, label: 'Extremadamente alto', color: '#991b1b' },
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get allergen by ID from all panels.
 */
export function getAllergenById(id: string): Allergen | undefined {
  for (const panel of ALLERGEN_PANELS) {
    const found = panel.allergens.find((a) => a.id === id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Get all allergens from all panels.
 */
export function getAllAllergens(): Allergen[] {
  return ALLERGEN_PANELS.flatMap((p) => p.allergens);
}

/**
 * Interpret skin prick wheal size to result.
 * ≥3mm = positive.
 */
export function interpretWhealSize(whealMm: number): SkinPrickResult {
  if (whealMm < 3) return '-';
  if (whealMm < 5) return '+';
  if (whealMm < 8) return '++';
  return '+++';
}

/**
 * Determine IgE class from value (kU/L).
 */
export function getIgEClass(value: number): IgEClass {
  if (value < 0.35) return 0;
  if (value < 0.7) return 1;
  if (value < 3.5) return 2;
  if (value < 17.5) return 3;
  if (value < 50) return 4;
  if (value < 100) return 5;
  return 6;
}

/**
 * Get panel by category.
 */
export function getPanelByCategory(category: AllergenCategory): AllergenPanel | undefined {
  return ALLERGEN_PANELS.find((p) => p.category === category);
}
