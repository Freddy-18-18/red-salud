/**
 * @file nutrition-reference-data.ts
 * @description Nutrition assessment reference data: BMI, Harris-Benedict, Mifflin-St Jeor,
 * activity factors, macronutrient ranges.
 * All labels in Venezuelan Spanish.
 */

// ============================================================================
// TYPES
// ============================================================================

export type BmiCategory =
  | 'underweight_severe'
  | 'underweight_moderate'
  | 'underweight_mild'
  | 'normal'
  | 'overweight'
  | 'obese_i'
  | 'obese_ii'
  | 'obese_iii';

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

export type NutritionGoal =
  | 'lose_fast'
  | 'lose'
  | 'maintain'
  | 'gain'
  | 'gain_fast';

export interface MacroSplit {
  protein: number; // % of total kcal
  carbs: number;
  fat: number;
}

// ============================================================================
// BMI CLASSIFICATION (WHO)
// ============================================================================

export const BMI_CATEGORIES: Array<{
  key: BmiCategory;
  label: string;
  min: number;
  max: number;
  color: string;
}> = [
  { key: 'underweight_severe', label: 'Bajo peso severo', min: 0, max: 16, color: '#dc2626' },
  { key: 'underweight_moderate', label: 'Bajo peso moderado', min: 16, max: 17, color: '#f97316' },
  { key: 'underweight_mild', label: 'Bajo peso leve', min: 17, max: 18.5, color: '#eab308' },
  { key: 'normal', label: 'Peso normal', min: 18.5, max: 25, color: '#22c55e' },
  { key: 'overweight', label: 'Sobrepeso', min: 25, max: 30, color: '#eab308' },
  { key: 'obese_i', label: 'Obesidad grado I', min: 30, max: 35, color: '#f97316' },
  { key: 'obese_ii', label: 'Obesidad grado II', min: 35, max: 40, color: '#ef4444' },
  { key: 'obese_iii', label: 'Obesidad grado III', min: 40, max: 100, color: '#991b1b' },
];

// ============================================================================
// ACTIVITY FACTORS
// ============================================================================

export const ACTIVITY_LEVELS: Array<{
  key: ActivityLevel;
  label: string;
  description: string;
  factor: number;
}> = [
  { key: 'sedentary', label: 'Sedentario', description: 'Poco o nada de ejercicio', factor: 1.2 },
  { key: 'light', label: 'Ligera actividad', description: 'Ejercicio 1-3 días/sem', factor: 1.375 },
  { key: 'moderate', label: 'Moderada actividad', description: 'Ejercicio 3-5 días/sem', factor: 1.55 },
  { key: 'active', label: 'Activo', description: 'Ejercicio 6-7 días/sem', factor: 1.725 },
  { key: 'very_active', label: 'Muy activo', description: 'Ejercicio intenso diario', factor: 1.9 },
];

// ============================================================================
// NUTRITION GOALS
// ============================================================================

export const NUTRITION_GOALS: Array<{
  key: NutritionGoal;
  label: string;
  adjustment: number; // kcal offset from TDEE
}> = [
  { key: 'lose_fast', label: 'Pérdida rápida (-750 kcal)', adjustment: -750 },
  { key: 'lose', label: 'Pérdida gradual (-500 kcal)', adjustment: -500 },
  { key: 'maintain', label: 'Mantenimiento', adjustment: 0 },
  { key: 'gain', label: 'Ganancia gradual (+300 kcal)', adjustment: 300 },
  { key: 'gain_fast', label: 'Ganancia rápida (+500 kcal)', adjustment: 500 },
];

// ============================================================================
// MACRONUTRIENT SPLITS
// ============================================================================

export const MACRO_PRESETS: Array<{
  label: string;
  description: string;
  split: MacroSplit;
}> = [
  { label: 'Equilibrada', description: 'Dieta general', split: { protein: 20, carbs: 50, fat: 30 } },
  { label: 'Alta proteína', description: 'Preservar masa muscular', split: { protein: 30, carbs: 40, fat: 30 } },
  { label: 'Baja en carbohidratos', description: 'Control glucémico', split: { protein: 25, carbs: 30, fat: 45 } },
  { label: 'Cetogénica', description: 'Muy baja en CHO', split: { protein: 20, carbs: 10, fat: 70 } },
  { label: 'Mediterránea', description: 'Cardiosaludable', split: { protein: 20, carbs: 45, fat: 35 } },
];

// ============================================================================
// FORMULAS
// ============================================================================

/**
 * Calculate BMI.
 */
export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

/**
 * Classify BMI into category.
 */
export function classifyBMI(bmi: number): BmiCategory {
  for (const cat of BMI_CATEGORIES) {
    if (bmi >= cat.min && bmi < cat.max) return cat.key;
  }
  return bmi >= 40 ? 'obese_iii' : 'underweight_severe';
}

/**
 * Get BMI category info.
 */
export function getBMICategoryInfo(bmi: number) {
  const key = classifyBMI(bmi);
  return BMI_CATEGORIES.find((c) => c.key === key) ?? BMI_CATEGORIES[3]; // default normal
}

/**
 * Harris-Benedict BMR (revised 1984).
 */
export function harrisBenedictBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
): number {
  if (sex === 'male') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * age;
}

/**
 * Mifflin-St Jeor BMR (1990).
 */
export function mifflinStJeorBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure).
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const factor = ACTIVITY_LEVELS.find((a) => a.key === activityLevel)?.factor ?? 1.2;
  return Math.round(bmr * factor);
}

/**
 * Calculate target calories based on goal.
 */
export function calculateTargetCalories(tdee: number, goal: NutritionGoal): number {
  const adjustment = NUTRITION_GOALS.find((g) => g.key === goal)?.adjustment ?? 0;
  return Math.max(1200, Math.round(tdee + adjustment)); // Floor at 1200 kcal
}

/**
 * Calculate macros in grams from total kcal and split percentages.
 */
export function calculateMacroGrams(
  totalKcal: number,
  split: MacroSplit,
): { proteinG: number; carbsG: number; fatG: number } {
  return {
    proteinG: Math.round((totalKcal * split.protein / 100) / 4), // 4 kcal/g
    carbsG: Math.round((totalKcal * split.carbs / 100) / 4),     // 4 kcal/g
    fatG: Math.round((totalKcal * split.fat / 100) / 9),          // 9 kcal/g
  };
}

/**
 * Calculate waist-to-hip ratio.
 */
export function waistHipRatio(waistCm: number, hipCm: number): number {
  if (hipCm <= 0) return 0;
  return Math.round((waistCm / hipCm) * 100) / 100;
}

/**
 * Estimate body fat % from skinfold measurements (Durnin-Womersley).
 * Uses 4-site: biceps, triceps, subscapular, suprailiac.
 */
export function estimateBodyFat(
  sex: 'male' | 'female',
  age: number,
  skinfolds: { biceps: number; triceps: number; subscapular: number; suprailiac: number },
): number {
  const sum = skinfolds.biceps + skinfolds.triceps + skinfolds.subscapular + skinfolds.suprailiac;
  const logSum = Math.log10(sum);

  let density: number;
  if (sex === 'male') {
    if (age < 20) density = 1.1620 - 0.0630 * logSum;
    else if (age < 30) density = 1.1631 - 0.0632 * logSum;
    else if (age < 40) density = 1.1422 - 0.0544 * logSum;
    else if (age < 50) density = 1.1620 - 0.0700 * logSum;
    else density = 1.1715 - 0.0779 * logSum;
  } else {
    if (age < 20) density = 1.1549 - 0.0678 * logSum;
    else if (age < 30) density = 1.1599 - 0.0717 * logSum;
    else if (age < 40) density = 1.1423 - 0.0632 * logSum;
    else if (age < 50) density = 1.1333 - 0.0612 * logSum;
    else density = 1.1339 - 0.0645 * logSum;
  }

  // Siri equation
  const bodyFat = (4.95 / density - 4.5) * 100;
  return Math.round(bodyFat * 10) / 10;
}
