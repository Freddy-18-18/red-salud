// ============================================
// ECG INTERPRETATION TEMPLATES
// Common ECG pattern templates for quick auto-fill
// ============================================

import type {
  EcgClassification,
  EcgMorphologyFindings,
  RhythmType,
  RhythmRegularity,
  AxisDeviation,
} from './use-ecg';

// ============================================================================
// TYPES
// ============================================================================

export type EcgTemplateCategory =
  | 'normal'
  | 'arrhythmia'
  | 'ischemia'
  | 'conduction'
  | 'hypertrophy'
  | 'other';

export interface EcgTemplateFindings {
  rhythm?: RhythmType;
  rate_regular?: boolean;
  axis?: AxisDeviation;
  classification: EcgClassification;
  heart_rate?: number;
  pr_interval?: number;
  qrs_duration?: number;
  qtc_interval?: number;
  st_elevation?: string[];
  st_depression?: string[];
  t_wave_inversion?: string[];
  q_waves?: string[];
  bundle_branch_block?: 'lbbb' | 'rbbb' | null;
  lvh?: boolean;
  rvh?: boolean;
  atrial_enlargement?: 'left' | 'right' | 'bilateral' | null;
}

export interface EcgTemplate {
  name: string;
  category: EcgTemplateCategory;
  interpretation: string;
  findings: EcgTemplateFindings;
}

// ============================================================================
// CATEGORY LABELS
// ============================================================================

export const ECG_TEMPLATE_CATEGORY_LABELS: Record<EcgTemplateCategory, string> = {
  normal: 'Normal',
  arrhythmia: 'Arritmias',
  ischemia: 'Isquemia / Infarto',
  conduction: 'Trastornos de Conducción',
  hypertrophy: 'Hipertrofia',
  other: 'Otros',
};

// ============================================================================
// TEMPLATES
// ============================================================================

export const ECG_INTERPRETATION_TEMPLATES: EcgTemplate[] = [
  // ── Normal ──────────────────────────────────────────────────────────
  {
    name: 'ECG Normal',
    category: 'normal',
    interpretation:
      'Ritmo sinusal regular. FC dentro de límites normales. Eje normal. Intervalos PR, QRS, QT/QTc normales. Sin alteraciones del segmento ST ni de la onda T. Sin criterios de hipertrofia ventricular.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      axis: 'normal',
      classification: 'normal',
      heart_rate: 75,
      pr_interval: 160,
      qrs_duration: 90,
      qtc_interval: 420,
    },
  },

  // ── Arritmias ───────────────────────────────────────────────────────
  {
    name: 'Fibrilación Auricular',
    category: 'arrhythmia',
    interpretation:
      'Fibrilación auricular con respuesta ventricular controlada/rápida. Ausencia de ondas P, intervalos RR irregulares. QRS estrecho sin preexcitación. Sin alteraciones agudas del segmento ST.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: false,
      classification: 'abnormal',
      qrs_duration: 90,
    },
  },
  {
    name: 'Flutter Auricular',
    category: 'arrhythmia',
    interpretation:
      'Flutter auricular con conducción 2:1 (o variable). Ondas F en dientes de sierra, mejor observadas en DII, DIII, aVF y V1. Frecuencia auricular ~300 lpm. QRS estrecho.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: false,
      classification: 'abnormal',
      heart_rate: 150,
    },
  },
  {
    name: 'Taquicardia Ventricular',
    category: 'arrhythmia',
    interpretation:
      'Taquicardia de complejos anchos (QRS >120ms), regular, compatible con taquicardia ventricular monomórfica sostenida. Disociación AV presente. REQUIERE MANEJO URGENTE.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: true,
      classification: 'critical',
      heart_rate: 180,
      qrs_duration: 160,
    },
  },
  {
    name: 'Taquicardia Supraventricular',
    category: 'arrhythmia',
    interpretation:
      'Taquicardia de complejos estrechos, regular, sin ondas P visibles. Compatible con taquicardia supraventricular paroxística (TPSV). Considerar maniobras vagales o adenosina.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: true,
      classification: 'abnormal',
      heart_rate: 160,
      qrs_duration: 88,
    },
  },
  {
    name: 'Bradicardia Sinusal',
    category: 'arrhythmia',
    interpretation:
      'Bradicardia sinusal con FC <60 lpm. Ritmo regular, ondas P presentes antes de cada QRS. Intervalos PR y QRS normales. Asintomática / sintomática. Evaluar medicación cronotrópica negativa.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      axis: 'normal',
      classification: 'borderline',
      heart_rate: 48,
      pr_interval: 180,
      qrs_duration: 90,
    },
  },

  // ── Isquemia / Infarto ──────────────────────────────────────────────
  {
    name: 'IAMCEST Anterior',
    category: 'ischemia',
    interpretation:
      'Ritmo sinusal. Elevación del segmento ST >2mm en V1-V4 con imagen recíproca en cara inferior (DII, DIII, aVF). Compatible con infarto agudo de miocardio con elevación del ST (IAMCEST) de localización anterior. ACTIVAR CÓDIGO INFARTO.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      st_elevation: ['V1', 'V2', 'V3', 'V4'],
      st_depression: ['II', 'III', 'aVF'],
    },
  },
  {
    name: 'IAMCEST Inferior',
    category: 'ischemia',
    interpretation:
      'Ritmo sinusal. Elevación del segmento ST >1mm en DII, DIII, aVF con imagen recíproca en DI, aVL. Compatible con IAMCEST de localización inferior. Solicitar V3R-V4R para descartar extensión a VD. ACTIVAR CÓDIGO INFARTO.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      st_elevation: ['II', 'III', 'aVF'],
      st_depression: ['I', 'aVL'],
    },
  },
  {
    name: 'IAMCEST Lateral',
    category: 'ischemia',
    interpretation:
      'Ritmo sinusal. Elevación del segmento ST en DI, aVL, V5-V6 con imagen recíproca en cara inferior. Compatible con IAMCEST de localización lateral. ACTIVAR CÓDIGO INFARTO.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      st_elevation: ['I', 'aVL', 'V5', 'V6'],
      st_depression: ['III', 'aVF'],
    },
  },
  {
    name: 'Isquemia Subendocárdica',
    category: 'ischemia',
    interpretation:
      'Ritmo sinusal regular. Depresión del segmento ST difusa (>1mm) con inversión de ondas T en derivaciones precordiales. Compatible con isquemia subendocárdica / IAMSEST. Correlacionar con troponina y clínica.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      st_depression: ['V3', 'V4', 'V5', 'V6'],
      t_wave_inversion: ['V3', 'V4', 'V5', 'V6'],
    },
  },

  // ── Trastornos de Conducción ────────────────────────────────────────
  {
    name: 'Bloqueo de Rama Izquierda (BRIHH)',
    category: 'conduction',
    interpretation:
      'Ritmo sinusal regular. QRS ancho >120ms con morfología de bloqueo de rama izquierda del haz de His (BRIHH): QS o rS en V1, R mellada en V5-V6 (M-pattern). Alteraciones secundarias del ST-T. Nota: invalida interpretación de isquemia por ST.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'abnormal',
      qrs_duration: 140,
      bundle_branch_block: 'lbbb',
    },
  },
  {
    name: 'Bloqueo de Rama Derecha (BRDHH)',
    category: 'conduction',
    interpretation:
      'Ritmo sinusal regular. QRS ancho >120ms con morfología de bloqueo de rama derecha del haz de His (BRDHH): rsR\' en V1-V2 (patrón M), S empastada en DI y V6. Alteraciones secundarias del ST-T en V1-V3.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'abnormal',
      qrs_duration: 135,
      bundle_branch_block: 'rbbb',
    },
  },
  {
    name: 'Bloqueo AV de 1er Grado',
    category: 'conduction',
    interpretation:
      'Ritmo sinusal regular. Intervalo PR prolongado >200ms (bloqueo AV de 1er grado). QRS estrecho. Sin otras alteraciones. Generalmente benigno; evaluar medicación y monitorizar.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'borderline',
      pr_interval: 240,
      qrs_duration: 90,
    },
  },
  {
    name: 'Bloqueo AV de 2do Grado Mobitz I (Wenckebach)',
    category: 'conduction',
    interpretation:
      'Prolongación progresiva del intervalo PR hasta que una onda P no conduce (patrón Wenckebach). Bloqueo AV de 2do grado tipo Mobitz I. QRS estrecho. Generalmente suprahisiano y benigno. Monitorizar.',
    findings: {
      rhythm: 'sinus',
      rate_regular: false,
      classification: 'abnormal',
      qrs_duration: 90,
    },
  },
  {
    name: 'Bloqueo AV de 2do Grado Mobitz II',
    category: 'conduction',
    interpretation:
      'Ondas P con intervalos PR constantes seguidas de ondas P no conducidas (sin prolongación progresiva). Bloqueo AV de 2do grado tipo Mobitz II. Alto riesgo de progresión a bloqueo completo. EVALUAR MARCAPASOS.',
    findings: {
      rhythm: 'sinus',
      rate_regular: false,
      classification: 'critical',
      qrs_duration: 130,
    },
  },
  {
    name: 'Bloqueo AV Completo (3er Grado)',
    category: 'conduction',
    interpretation:
      'Disociación AV completa: ondas P y complejos QRS con frecuencias independientes. Bloqueo AV de 3er grado (completo). Ritmo de escape ventricular/nodal. REQUIERE MARCAPASOS URGENTE.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: true,
      classification: 'critical',
      heart_rate: 38,
      qrs_duration: 140,
    },
  },
  {
    name: 'Preexcitación (Wolff-Parkinson-White)',
    category: 'conduction',
    interpretation:
      'Ritmo sinusal. Intervalo PR corto (<120ms), onda delta presente, QRS ancho. Compatible con síndrome de Wolff-Parkinson-White (WPW). Evitar frenadores del nodo AV en caso de fibrilación auricular. Referir a electrofisiología.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'abnormal',
      pr_interval: 100,
      qrs_duration: 130,
    },
  },

  // ── Hipertrofia ─────────────────────────────────────────────────────
  {
    name: 'Hipertrofia Ventricular Izquierda (HVI)',
    category: 'hypertrophy',
    interpretation:
      'Ritmo sinusal regular. Criterios de voltaje de HVI (Sokolow-Lyon: S en V1 + R en V5/V6 >35mm). Strain pattern con infradesnivel del ST y onda T invertida en derivaciones laterales. Eje normal o con desviación izquierda.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      axis: 'left',
      classification: 'abnormal',
      lvh: true,
      st_depression: ['V5', 'V6', 'I', 'aVL'],
      t_wave_inversion: ['V5', 'V6', 'I', 'aVL'],
    },
  },
  {
    name: 'Hipertrofia Ventricular Derecha (HVD)',
    category: 'hypertrophy',
    interpretation:
      'Ritmo sinusal regular. Desviación del eje a la derecha. R dominante en V1, S profunda en V5-V6. Strain pattern en derivaciones derechas. Compatible con hipertrofia ventricular derecha (HVD). Evaluar causa pulmonar o cardíaca.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      axis: 'right',
      classification: 'abnormal',
      rvh: true,
    },
  },

  // ── Otros ───────────────────────────────────────────────────────────
  {
    name: 'QT Largo',
    category: 'other',
    interpretation:
      'Ritmo sinusal regular. Intervalo QTc prolongado (>470ms en hombres, >480ms en mujeres). Riesgo de Torsades de Pointes. Revisar medicación (antiarrítmicos, antibióticos, antipsicóticos), electrolitos (K+, Mg2+, Ca2+). Monitorización continua.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'abnormal',
      qtc_interval: 520,
    },
  },
  {
    name: 'Patrón de Brugada',
    category: 'other',
    interpretation:
      'Ritmo sinusal regular. Elevación del ST cóncava (tipo 1 "coved") o convexa (tipo 2 "saddleback") en V1-V3 con BRDHH incompleto. Compatible con patrón de Brugada. Riesgo de muerte súbita. Referir a electrofisiología para estratificación de riesgo.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      st_elevation: ['V1', 'V2', 'V3'],
      bundle_branch_block: 'rbbb',
    },
  },
  {
    name: 'Pericarditis Aguda',
    category: 'other',
    interpretation:
      'Ritmo sinusal regular. Elevación difusa del segmento ST de concavidad superior en múltiples territorios sin imagen recíproca (excepto aVR con depresión del ST). Depresión del segmento PR. Compatible con pericarditis aguda. Descartar miopericarditis.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'abnormal',
      st_elevation: ['I', 'II', 'III', 'aVF', 'V3', 'V4', 'V5', 'V6'],
      st_depression: ['aVR'],
    },
  },
  {
    name: 'Hiperpotasemia',
    category: 'other',
    interpretation:
      'Ritmo sinusal. Ondas T altas, picudas y simétricas ("en tienda de campaña"), especialmente en V2-V5. Ensanchamiento del QRS. Considerar potasio sérico urgente. Si K+ >6.5: tratamiento emergente con calcio IV, insulina + dextrosa, salbutamol. Riesgo de FV/asistolia.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      classification: 'critical',
      qrs_duration: 130,
    },
  },
  {
    name: 'Tromboembolismo Pulmonar (TEP)',
    category: 'other',
    interpretation:
      'Taquicardia sinusal. Patrón S1Q3T3 (S profunda en DI, Q en DIII, T invertida en DIII). Desviación del eje a la derecha. Strain derecho con inversión de ondas T en V1-V4. Compatible con sobrecarga aguda de VD / TEP. Solicitar angioTAC y D-dímero urgente.',
    findings: {
      rhythm: 'sinus',
      rate_regular: true,
      axis: 'right',
      classification: 'critical',
      heart_rate: 110,
      t_wave_inversion: ['V1', 'V2', 'V3', 'V4', 'III'],
      q_waves: ['III'],
    },
  },
  {
    name: 'Ritmo de Marcapasos',
    category: 'other',
    interpretation:
      'Ritmo de marcapasos con espigas visibles. Captura ventricular con QRS ancho y morfología de BRIHH (estimulación desde VD). Sensado y captura adecuados. FC programada dentro de parámetros. Sin signos de disfunción del dispositivo.',
    findings: {
      rhythm: 'non_sinus',
      rate_regular: true,
      classification: 'borderline',
      qrs_duration: 160,
      bundle_branch_block: 'lbbb',
    },
  },
];

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get templates grouped by category for display in dropdowns.
 */
export function getTemplatesByCategory(): Record<EcgTemplateCategory, EcgTemplate[]> {
  const grouped = {} as Record<EcgTemplateCategory, EcgTemplate[]>;
  for (const template of ECG_INTERPRETATION_TEMPLATES) {
    if (!grouped[template.category]) {
      grouped[template.category] = [];
    }
    grouped[template.category].push(template);
  }
  return grouped;
}

/**
 * Build partial morphology findings from a template's findings.
 */
export function buildMorphologyFromTemplate(
  findings: EcgTemplateFindings,
): EcgMorphologyFindings {
  return {
    st_elevation: findings.st_elevation ?? [],
    st_depression: findings.st_depression ?? [],
    t_wave_inversion: findings.t_wave_inversion ?? [],
    q_waves: findings.q_waves ?? [],
    bundle_branch_block: findings.bundle_branch_block ?? null,
    lvh: findings.lvh ?? false,
    rvh: findings.rvh ?? false,
    atrial_enlargement: findings.atrial_enlargement ?? null,
  };
}
