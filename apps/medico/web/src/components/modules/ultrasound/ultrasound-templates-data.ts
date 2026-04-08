// ============================================================================
// ULTRASOUND REPORT TEMPLATES — Structured templates per ultrasound type
// All labels in Venezuelan Spanish for medical practice
// ============================================================================

// ============================================================================
// TYPES
// ============================================================================

export interface MeasurementField {
  id: string;
  label: string;
  unit: string;
  /** Normal range for adult reference */
  normalRange?: { min: number; max: number };
  /** Placeholder text */
  placeholder?: string;
  /** Step for numeric input */
  step?: number;
  /** Whether this field is used to derive another value */
  derivedFrom?: string[];
}

export interface TemplateSection {
  id: string;
  label: string;
  /** Structured measurement fields for this section */
  measurements: MeasurementField[];
  /** Free-text finding fields for this section */
  findingFields: Array<{
    id: string;
    label: string;
    placeholder: string;
    /** Predefined options for select-style fields */
    options?: string[];
  }>;
}

export interface UltrasoundTemplate {
  id: UltrasoundType;
  label: string;
  description: string;
  icon: string;
  sections: TemplateSection[];
}

export type UltrasoundType =
  | 'abdominal'
  | 'pelvic_female'
  | 'obstetric_1st'
  | 'obstetric_2nd_3rd'
  | 'thyroid'
  | 'musculoskeletal'
  | 'vascular'
  | 'renal';

export const ULTRASOUND_TYPE_OPTIONS: Array<{ value: UltrasoundType; label: string }> = [
  { value: 'abdominal', label: 'Abdominal' },
  { value: 'pelvic_female', label: 'Pelvica' },
  { value: 'obstetric_1st', label: 'Obstétrica 1er trimestre' },
  { value: 'obstetric_2nd_3rd', label: 'Obstétrica 2do/3er trimestre' },
  { value: 'thyroid', label: 'Tiroidea' },
  { value: 'musculoskeletal', label: 'Musculoesquelética' },
  { value: 'vascular', label: 'Vascular' },
  { value: 'renal', label: 'Renal' },
];

// ============================================================================
// ABDOMINAL TEMPLATE
// ============================================================================

const ABDOMINAL_TEMPLATE: UltrasoundTemplate = {
  id: 'abdominal',
  label: 'Ecografía Abdominal',
  description: 'Hígado, vesícula biliar, páncreas, bazo, riñones, aorta y vejiga',
  icon: 'Activity',
  sections: [
    {
      id: 'liver',
      label: 'Hígado',
      measurements: [
        {
          id: 'liver_size',
          label: 'Tamaño longitudinal',
          unit: 'cm',
          normalRange: { min: 12, max: 15.5 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'liver_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Homogénea / Heterogénea',
          options: ['Homogénea normal', 'Aumentada difusa (esteatosis)', 'Heterogénea', 'Disminuida'],
        },
        {
          id: 'liver_focal_lesions',
          label: 'Lesiones focales',
          placeholder: 'Describir lesiones focales si las hay...',
        },
        {
          id: 'liver_hepatic_veins',
          label: 'Venas hepáticas',
          placeholder: 'Permeables / Dilatadas...',
          options: ['Permeables, calibre normal', 'Dilatadas', 'No evaluables'],
        },
      ],
    },
    {
      id: 'gallbladder',
      label: 'Vesícula Biliar',
      measurements: [
        {
          id: 'gb_wall_thickness',
          label: 'Grosor de pared',
          unit: 'mm',
          normalRange: { min: 1, max: 3 },
          step: 0.1,
        },
        {
          id: 'cbd_diameter',
          label: 'Colédoco (VBP)',
          unit: 'mm',
          normalRange: { min: 2, max: 6 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'gb_stones',
          label: 'Litiasis',
          placeholder: 'Presencia de cálculos...',
          options: ['Sin litiasis', 'Litiasis única', 'Litiasis múltiple', 'Barro biliar', 'Alitiásica'],
        },
        {
          id: 'gb_distension',
          label: 'Distensión',
          placeholder: 'Normal / Distendida...',
          options: ['Normodistendida', 'Distendida', 'Colapsada', 'Colecistectomizada'],
        },
      ],
    },
    {
      id: 'pancreas',
      label: 'Páncreas',
      measurements: [
        {
          id: 'pancreas_head',
          label: 'Cabeza',
          unit: 'cm',
          normalRange: { min: 1.5, max: 3.0 },
          step: 0.1,
        },
        {
          id: 'pancreas_body',
          label: 'Cuerpo',
          unit: 'cm',
          normalRange: { min: 1.0, max: 2.5 },
          step: 0.1,
        },
        {
          id: 'pancreas_tail',
          label: 'Cola',
          unit: 'cm',
          normalRange: { min: 1.0, max: 2.5 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'pancreas_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Ecogenicidad pancreática...',
          options: ['Homogéneo, ecogenicidad normal', 'Ecogenicidad aumentada (infiltración grasa)', 'Heterogéneo', 'No evaluable por interposición gaseosa'],
        },
        {
          id: 'pancreatic_duct',
          label: 'Conducto de Wirsung',
          placeholder: 'Calibre del conducto pancreático...',
          options: ['No dilatado', 'Dilatado', 'No visualizado'],
        },
      ],
    },
    {
      id: 'spleen',
      label: 'Bazo',
      measurements: [
        {
          id: 'spleen_size',
          label: 'Eje longitudinal',
          unit: 'cm',
          normalRange: { min: 8, max: 13 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'spleen_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Ecogenicidad esplénica...',
          options: ['Homogénea normal', 'Esplenomegalia', 'Lesiones focales presentes'],
        },
      ],
    },
    {
      id: 'kidneys',
      label: 'Riñones',
      measurements: [
        {
          id: 'right_kidney_length',
          label: 'Riñón derecho - longitud',
          unit: 'cm',
          normalRange: { min: 9, max: 12 },
          step: 0.1,
        },
        {
          id: 'right_kidney_cortex',
          label: 'Riñón derecho - corteza',
          unit: 'mm',
          normalRange: { min: 10, max: 16 },
          step: 0.1,
        },
        {
          id: 'left_kidney_length',
          label: 'Riñón izquierdo - longitud',
          unit: 'cm',
          normalRange: { min: 9, max: 12 },
          step: 0.1,
        },
        {
          id: 'left_kidney_cortex',
          label: 'Riñón izquierdo - corteza',
          unit: 'mm',
          normalRange: { min: 10, max: 16 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'kidney_hydronephrosis',
          label: 'Hidronefrosis',
          placeholder: 'Grado de hidronefrosis...',
          options: ['Sin hidronefrosis', 'Grado I (leve)', 'Grado II (moderada)', 'Grado III (severa)', 'Grado IV (severa con adelgazamiento cortical)'],
        },
        {
          id: 'kidney_stones',
          label: 'Litiasis renal',
          placeholder: 'Presencia de cálculos renales...',
          options: ['Sin litiasis', 'Litiasis renal derecha', 'Litiasis renal izquierda', 'Litiasis bilateral'],
        },
        {
          id: 'kidney_cysts',
          label: 'Quistes renales',
          placeholder: 'Quistes simples o complejos...',
        },
      ],
    },
    {
      id: 'aorta',
      label: 'Aorta Abdominal',
      measurements: [
        {
          id: 'aorta_diameter',
          label: 'Diámetro anteroposterior',
          unit: 'cm',
          normalRange: { min: 1.5, max: 2.5 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'aorta_findings',
          label: 'Hallazgos',
          placeholder: 'Calibre y paredes de la aorta...',
          options: ['Calibre y paredes normales', 'Ectasia', 'Aneurisma', 'Calcificaciones parietales'],
        },
      ],
    },
    {
      id: 'bladder',
      label: 'Vejiga',
      measurements: [],
      findingFields: [
        {
          id: 'bladder_findings',
          label: 'Hallazgos',
          placeholder: 'Contenido y paredes de la vejiga...',
          options: ['Distendida, paredes regulares, contenido anecoico', 'Paredes engrosadas', 'Contenido ecogénico', 'Colapsada (no evaluable)'],
        },
      ],
    },
  ],
};

// ============================================================================
// PELVIC FEMALE TEMPLATE
// ============================================================================

const PELVIC_FEMALE_TEMPLATE: UltrasoundTemplate = {
  id: 'pelvic_female',
  label: 'Ecografía Pélvica Femenina',
  description: 'Útero, ovarios y fondo de saco',
  icon: 'Heart',
  sections: [
    {
      id: 'uterus',
      label: 'Útero',
      measurements: [
        {
          id: 'uterus_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 6, max: 9 },
          step: 0.1,
        },
        {
          id: 'uterus_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 3, max: 5 },
          step: 0.1,
        },
        {
          id: 'uterus_transverse',
          label: 'Transverso',
          unit: 'cm',
          normalRange: { min: 4, max: 6 },
          step: 0.1,
        },
        {
          id: 'endometrium_thickness',
          label: 'Grosor endometrial',
          unit: 'mm',
          normalRange: { min: 4, max: 14 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'uterus_position',
          label: 'Posición',
          placeholder: 'Posición uterina...',
          options: ['Anteversión', 'Retroversión', 'Anteversoflexión', 'Retroversoflexión', 'En posición media'],
        },
        {
          id: 'myometrium',
          label: 'Miometrio',
          placeholder: 'Ecoestructura miometrial...',
          options: ['Homogéneo', 'Heterogéneo', 'Mioma intramural', 'Mioma submucoso', 'Mioma subseroso', 'Adenomiosis'],
        },
        {
          id: 'endometrium_pattern',
          label: 'Patrón endometrial',
          placeholder: 'Características del endometrio...',
          options: ['Trilaminar (proliferativo)', 'Secretor', 'Atrófico', 'Engrosado (>14 mm)', 'Irregular'],
        },
      ],
    },
    {
      id: 'right_ovary',
      label: 'Ovario Derecho',
      measurements: [
        {
          id: 'right_ovary_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 2.5, max: 5 },
          step: 0.1,
        },
        {
          id: 'right_ovary_width',
          label: 'Ancho',
          unit: 'cm',
          normalRange: { min: 1.5, max: 3 },
          step: 0.1,
        },
        {
          id: 'right_ovary_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 1.5, max: 3 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'right_ovary_follicles',
          label: 'Folículos',
          placeholder: 'Número y tamaño de folículos...',
          options: ['Folículos normales', 'Folículo dominante presente', 'Aspecto multifolicular', 'Aspecto poliquístico (>12 folículos periféricos)'],
        },
        {
          id: 'right_ovary_masses',
          label: 'Masas',
          placeholder: 'Descripción de masas o quistes...',
          options: ['Sin masas', 'Quiste simple', 'Quiste hemorrágico', 'Quiste complejo', 'Masa sólida', 'Teratoma'],
        },
      ],
    },
    {
      id: 'left_ovary',
      label: 'Ovario Izquierdo',
      measurements: [
        {
          id: 'left_ovary_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 2.5, max: 5 },
          step: 0.1,
        },
        {
          id: 'left_ovary_width',
          label: 'Ancho',
          unit: 'cm',
          normalRange: { min: 1.5, max: 3 },
          step: 0.1,
        },
        {
          id: 'left_ovary_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 1.5, max: 3 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'left_ovary_follicles',
          label: 'Folículos',
          placeholder: 'Número y tamaño de folículos...',
          options: ['Folículos normales', 'Folículo dominante presente', 'Aspecto multifolicular', 'Aspecto poliquístico (>12 folículos periféricos)'],
        },
        {
          id: 'left_ovary_masses',
          label: 'Masas',
          placeholder: 'Descripción de masas o quistes...',
          options: ['Sin masas', 'Quiste simple', 'Quiste hemorrágico', 'Quiste complejo', 'Masa sólida', 'Teratoma'],
        },
      ],
    },
    {
      id: 'cul_de_sac',
      label: 'Fondo de Saco',
      measurements: [],
      findingFields: [
        {
          id: 'cul_de_sac_fluid',
          label: 'Líquido libre',
          placeholder: 'Presencia de líquido en fondo de saco...',
          options: ['Sin líquido libre', 'Escaso líquido libre (fisiológico)', 'Moderada cantidad de líquido', 'Abundante líquido libre'],
        },
      ],
    },
  ],
};

// ============================================================================
// OBSTETRIC 1ST TRIMESTER TEMPLATE
// ============================================================================

const OBSTETRIC_1ST_TEMPLATE: UltrasoundTemplate = {
  id: 'obstetric_1st',
  label: 'Ecografía Obstétrica - 1er Trimestre',
  description: 'CRL, saco gestacional, saco vitelino, latido cardíaco y translucencia nucal',
  icon: 'Baby',
  sections: [
    {
      id: 'gestational_sac',
      label: 'Saco Gestacional',
      measurements: [
        {
          id: 'gs_mean_diameter',
          label: 'Diámetro medio',
          unit: 'mm',
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'gs_location',
          label: 'Ubicación',
          placeholder: 'Ubicación del saco gestacional...',
          options: ['Intrauterino, fúndico', 'Intrauterino, corporal', 'Intrauterino, bajo', 'No identificado'],
        },
        {
          id: 'gs_shape',
          label: 'Forma',
          placeholder: 'Forma del saco...',
          options: ['Regular', 'Irregular'],
        },
      ],
    },
    {
      id: 'yolk_sac',
      label: 'Saco Vitelino',
      measurements: [
        {
          id: 'yolk_sac_diameter',
          label: 'Diámetro',
          unit: 'mm',
          normalRange: { min: 2, max: 6 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'yolk_sac_presence',
          label: 'Presencia',
          placeholder: 'Presencia y aspecto del saco vitelino...',
          options: ['Presente, normal', 'Presente, grande (>6 mm)', 'Presente, irregular', 'No identificado'],
        },
      ],
    },
    {
      id: 'embryo',
      label: 'Embrión',
      measurements: [
        {
          id: 'crl',
          label: 'LCC (CRL)',
          unit: 'mm',
          step: 0.1,
          placeholder: 'Longitud cráneo-caudal',
        },
      ],
      findingFields: [
        {
          id: 'fetal_heartbeat',
          label: 'Latido cardíaco fetal',
          placeholder: 'Presencia y frecuencia...',
          options: ['Presente, rítmico, normofrequente', 'Presente, bradicárdico (<100 lpm)', 'Presente, taquicárdico (>180 lpm)', 'No detectado'],
        },
        {
          id: 'fetal_heart_rate',
          label: 'Frecuencia cardíaca (lpm)',
          placeholder: 'Frecuencia en latidos por minuto',
        },
      ],
    },
    {
      id: 'nuchal_translucency',
      label: 'Translucencia Nucal',
      measurements: [
        {
          id: 'nt_thickness',
          label: 'TN',
          unit: 'mm',
          normalRange: { min: 0.5, max: 2.5 },
          step: 0.01,
        },
      ],
      findingFields: [
        {
          id: 'nt_assessment',
          label: 'Evaluación',
          placeholder: 'Evaluación de translucencia nucal...',
          options: ['Normal para edad gestacional', 'Aumentada (>p95)', 'No medible (posición fetal inadecuada)'],
        },
      ],
    },
    {
      id: 'gestational_age',
      label: 'Edad Gestacional',
      measurements: [
        {
          id: 'ga_weeks',
          label: 'Semanas',
          unit: 'sem',
          step: 1,
        },
        {
          id: 'ga_days',
          label: 'Días',
          unit: 'd',
          step: 1,
        },
      ],
      findingFields: [
        {
          id: 'ga_concordance',
          label: 'Concordancia con FUM',
          placeholder: 'Concordancia con fecha de última menstruación...',
          options: ['Concordante con FUM', 'Discordante (mayor que FUM)', 'Discordante (menor que FUM)', 'FUM incierta'],
        },
      ],
    },
  ],
};

// ============================================================================
// OBSTETRIC 2ND/3RD TRIMESTER TEMPLATE
// ============================================================================

const OBSTETRIC_2ND_3RD_TEMPLATE: UltrasoundTemplate = {
  id: 'obstetric_2nd_3rd',
  label: 'Ecografía Obstétrica - 2do/3er Trimestre',
  description: 'Biometría fetal, líquido amniótico, placenta, presentación y cérvix',
  icon: 'Baby',
  sections: [
    {
      id: 'fetal_biometry',
      label: 'Biometría Fetal',
      measurements: [
        {
          id: 'bpd',
          label: 'DBP (BPD)',
          unit: 'mm',
          step: 0.1,
          placeholder: 'Diámetro biparietal',
        },
        {
          id: 'hc',
          label: 'CC (HC)',
          unit: 'mm',
          step: 0.1,
          placeholder: 'Circunferencia cefálica',
        },
        {
          id: 'ac',
          label: 'CA (AC)',
          unit: 'mm',
          step: 0.1,
          placeholder: 'Circunferencia abdominal',
        },
        {
          id: 'fl',
          label: 'LF (FL)',
          unit: 'mm',
          step: 0.1,
          placeholder: 'Longitud femoral',
        },
      ],
      findingFields: [],
    },
    {
      id: 'estimated_fetal_weight',
      label: 'Peso Fetal Estimado',
      measurements: [
        {
          id: 'efw',
          label: 'PFE (Hadlock)',
          unit: 'g',
          step: 1,
          placeholder: 'Peso fetal estimado',
          derivedFrom: ['bpd', 'hc', 'ac', 'fl'],
        },
        {
          id: 'efw_percentile',
          label: 'Percentil',
          unit: '%',
          step: 1,
        },
      ],
      findingFields: [
        {
          id: 'efw_classification',
          label: 'Clasificación',
          placeholder: 'Clasificación por percentil...',
          options: ['AEG (p10-p90)', 'PEG (<p10)', 'GEG (>p90)', 'RCIU sospechado'],
        },
      ],
    },
    {
      id: 'amniotic_fluid',
      label: 'Líquido Amniótico',
      measurements: [
        {
          id: 'afi',
          label: 'ILA (AFI)',
          unit: 'cm',
          normalRange: { min: 5, max: 25 },
          step: 0.1,
          placeholder: 'Índice de líquido amniótico',
        },
        {
          id: 'max_pool',
          label: 'Bolsillo máximo',
          unit: 'cm',
          normalRange: { min: 2, max: 8 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'af_assessment',
          label: 'Evaluación',
          placeholder: 'Evaluación del líquido amniótico...',
          options: ['Normal', 'Oligohidramnios (ILA <5)', 'Polihidramnios (ILA >25)', 'Anhidramnios'],
        },
      ],
    },
    {
      id: 'placenta',
      label: 'Placenta',
      measurements: [
        {
          id: 'placenta_thickness',
          label: 'Grosor',
          unit: 'mm',
          step: 1,
        },
      ],
      findingFields: [
        {
          id: 'placenta_location',
          label: 'Ubicación',
          placeholder: 'Localización placentaria...',
          options: ['Anterior', 'Posterior', 'Fúndica', 'Lateral derecha', 'Lateral izquierda', 'Previa total', 'Previa parcial', 'Previa marginal', 'De inserción baja'],
        },
        {
          id: 'placenta_grade',
          label: 'Grado de madurez (Grannum)',
          placeholder: 'Grado placentario...',
          options: ['Grado 0', 'Grado I', 'Grado II', 'Grado III'],
        },
      ],
    },
    {
      id: 'presentation',
      label: 'Presentación Fetal',
      measurements: [],
      findingFields: [
        {
          id: 'fetal_presentation',
          label: 'Presentación',
          placeholder: 'Presentación fetal...',
          options: ['Cefálica', 'Podálica', 'Transversa', 'Oblicua'],
        },
        {
          id: 'fetal_dorsum',
          label: 'Dorso fetal',
          placeholder: 'Posición del dorso...',
          options: ['Anterior', 'Posterior', 'Lateral derecho', 'Lateral izquierdo'],
        },
      ],
    },
    {
      id: 'cervix',
      label: 'Cérvix',
      measurements: [
        {
          id: 'cervical_length',
          label: 'Longitud cervical',
          unit: 'mm',
          normalRange: { min: 25, max: 50 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'cervix_assessment',
          label: 'Evaluación',
          placeholder: 'Evaluación cervical...',
          options: ['OCI cerrado, longitud normal', 'Acortamiento cervical (<25 mm)', 'Funneling (embudo)', 'OCI dilatado'],
        },
      ],
    },
    {
      id: 'fetal_heart',
      label: 'Actividad Cardíaca Fetal',
      measurements: [
        {
          id: 'fhr_2nd',
          label: 'FCF',
          unit: 'lpm',
          normalRange: { min: 110, max: 160 },
          step: 1,
        },
      ],
      findingFields: [
        {
          id: 'fhr_rhythm',
          label: 'Ritmo',
          placeholder: 'Ritmo cardíaco fetal...',
          options: ['Rítmico, normofrequente', 'Bradicárdico (<110 lpm)', 'Taquicárdico (>160 lpm)', 'Arrítmico'],
        },
      ],
    },
  ],
};

// ============================================================================
// THYROID TEMPLATE
// ============================================================================

const THYROID_TEMPLATE: UltrasoundTemplate = {
  id: 'thyroid',
  label: 'Ecografía Tiroidea',
  description: 'Dimensiones, ecogenicidad, nódulos (TI-RADS) y vascularidad',
  icon: 'Stethoscope',
  sections: [
    {
      id: 'right_lobe',
      label: 'Lóbulo Derecho',
      measurements: [
        {
          id: 'right_lobe_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 4, max: 6 },
          step: 0.1,
        },
        {
          id: 'right_lobe_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 1, max: 2 },
          step: 0.1,
        },
        {
          id: 'right_lobe_transverse',
          label: 'Transverso',
          unit: 'cm',
          normalRange: { min: 1, max: 2 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'right_lobe_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Ecogenicidad del lóbulo derecho...',
          options: ['Normal (isoecogénico al músculo)', 'Hipoecogénico', 'Hiperecogénico', 'Heterogéneo'],
        },
      ],
    },
    {
      id: 'left_lobe',
      label: 'Lóbulo Izquierdo',
      measurements: [
        {
          id: 'left_lobe_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 4, max: 6 },
          step: 0.1,
        },
        {
          id: 'left_lobe_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 1, max: 2 },
          step: 0.1,
        },
        {
          id: 'left_lobe_transverse',
          label: 'Transverso',
          unit: 'cm',
          normalRange: { min: 1, max: 2 },
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'left_lobe_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Ecogenicidad del lóbulo izquierdo...',
          options: ['Normal (isoecogénico al músculo)', 'Hipoecogénico', 'Hiperecogénico', 'Heterogéneo'],
        },
      ],
    },
    {
      id: 'isthmus',
      label: 'Istmo',
      measurements: [
        {
          id: 'isthmus_thickness',
          label: 'Grosor',
          unit: 'mm',
          normalRange: { min: 1, max: 5 },
          step: 0.1,
        },
      ],
      findingFields: [],
    },
    {
      id: 'nodules',
      label: 'Nódulos',
      measurements: [
        {
          id: 'nodule_max_size',
          label: 'Tamaño mayor nódulo',
          unit: 'mm',
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'nodule_composition',
          label: 'Composición',
          placeholder: 'Composición del nódulo...',
          options: ['Quístico', 'Predominantemente quístico (>50%)', 'Predominantemente sólido (>50%)', 'Sólido', 'Espongiforme'],
        },
        {
          id: 'nodule_echogenicity',
          label: 'Ecogenicidad',
          placeholder: 'Ecogenicidad nodular...',
          options: ['Anecoico', 'Hiperecoico', 'Isoecoico', 'Hipoecoico', 'Muy hipoecoico'],
        },
        {
          id: 'nodule_shape',
          label: 'Forma',
          placeholder: 'Forma del nódulo...',
          options: ['Más ancho que alto', 'Más alto que ancho (sospechoso)'],
        },
        {
          id: 'nodule_margins',
          label: 'Márgenes',
          placeholder: 'Márgenes del nódulo...',
          options: ['Lisos', 'Mal definidos', 'Lobulados', 'Irregulares', 'Extensión extratiroidea'],
        },
        {
          id: 'nodule_calcifications',
          label: 'Calcificaciones',
          placeholder: 'Presencia de calcificaciones...',
          options: ['Sin calcificaciones', 'Macrocalcificaciones', 'Calcificaciones periféricas (cáscara de huevo)', 'Microcalcificaciones puntiformes (sospechoso)'],
        },
        {
          id: 'tirads_score',
          label: 'Clasificación TI-RADS',
          placeholder: 'Puntuación TI-RADS...',
          options: ['TR1 - Benigno', 'TR2 - No sospechoso', 'TR3 - Levemente sospechoso', 'TR4 - Moderadamente sospechoso', 'TR5 - Altamente sospechoso'],
        },
      ],
    },
    {
      id: 'vascularity',
      label: 'Vascularidad',
      measurements: [],
      findingFields: [
        {
          id: 'vascularity_pattern',
          label: 'Patrón vascular',
          placeholder: 'Vascularidad al Doppler color...',
          options: ['Patrón vascular normal', 'Hipervascularidad difusa', 'Hipovascularidad', 'Vascularidad nodular periférica', 'Vascularidad nodular central'],
        },
      ],
    },
    {
      id: 'lymph_nodes',
      label: 'Ganglios Cervicales',
      measurements: [],
      findingFields: [
        {
          id: 'lymph_nodes_assessment',
          label: 'Evaluación',
          placeholder: 'Ganglios cervicales...',
          options: ['Sin adenopatías significativas', 'Adenopatías reactivas (conservan hilio)', 'Adenopatías sospechosas (pérdida de hilio, forma redondeada)', 'Ganglios calcificados'],
        },
      ],
    },
  ],
};

// ============================================================================
// MUSCULOSKELETAL TEMPLATE
// ============================================================================

const MUSCULOSKELETAL_TEMPLATE: UltrasoundTemplate = {
  id: 'musculoskeletal',
  label: 'Ecografía Musculoesquelética',
  description: 'Integridad tendínea, derrame articular y masas de tejidos blandos',
  icon: 'Bone',
  sections: [
    {
      id: 'tendon',
      label: 'Tendón / Estructura Evaluada',
      measurements: [
        {
          id: 'tendon_thickness',
          label: 'Grosor del tendón',
          unit: 'mm',
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'tendon_region',
          label: 'Región evaluada',
          placeholder: 'Ej: Hombro derecho, rodilla izquierda...',
        },
        {
          id: 'tendon_integrity',
          label: 'Integridad tendínea',
          placeholder: 'Estado del tendón...',
          options: ['Íntegro, ecoestructura normal', 'Tendinopatía (engrosamiento, hipoecogenicidad)', 'Rotura parcial', 'Rotura completa', 'Calcificación tendínea', 'Tenosinovitis'],
        },
        {
          id: 'tendon_fibrillar_pattern',
          label: 'Patrón fibrilar',
          placeholder: 'Patrón ecográfico del tendón...',
          options: ['Patrón fibrilar conservado', 'Patrón fibrilar alterado focalmente', 'Patrón fibrilar ausente'],
        },
      ],
    },
    {
      id: 'joint',
      label: 'Articulación',
      measurements: [
        {
          id: 'effusion_depth',
          label: 'Derrame articular',
          unit: 'mm',
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'joint_effusion',
          label: 'Derrame articular',
          placeholder: 'Presencia de derrame...',
          options: ['Sin derrame', 'Derrame leve', 'Derrame moderado', 'Derrame severo', 'Derrame complejo (corpuscular)'],
        },
        {
          id: 'synovial_thickening',
          label: 'Sinovial',
          placeholder: 'Estado de la membrana sinovial...',
          options: ['Sin engrosamiento sinovial', 'Sinovitis leve', 'Sinovitis moderada', 'Pannus sinovial'],
        },
        {
          id: 'cartilage_surface',
          label: 'Superficie cartilaginosa',
          placeholder: 'Estado del cartílago articular...',
          options: ['Superficie regular', 'Irregularidades focales', 'Adelgazamiento difuso', 'No evaluable'],
        },
      ],
    },
    {
      id: 'soft_tissue',
      label: 'Tejidos Blandos',
      measurements: [
        {
          id: 'mass_length',
          label: 'Longitud de masa',
          unit: 'mm',
          step: 0.1,
        },
        {
          id: 'mass_width',
          label: 'Ancho de masa',
          unit: 'mm',
          step: 0.1,
        },
        {
          id: 'mass_depth',
          label: 'Profundidad de masa',
          unit: 'mm',
          step: 0.1,
        },
      ],
      findingFields: [
        {
          id: 'soft_tissue_masses',
          label: 'Masas',
          placeholder: 'Masas de tejidos blandos...',
          options: ['Sin masas identificadas', 'Lipoma', 'Quiste ganglionar', 'Quiste de Baker', 'Bursitis', 'Hematoma', 'Masa sólida indeterminada'],
        },
        {
          id: 'muscle_findings',
          label: 'Hallazgos musculares',
          placeholder: 'Estado muscular...',
          options: ['Ecoestructura muscular normal', 'Desgarro muscular parcial', 'Desgarro muscular completo', 'Hematoma intramuscular', 'Atrofia muscular'],
        },
      ],
    },
  ],
};

// ============================================================================
// VASCULAR TEMPLATE
// ============================================================================

const VASCULAR_TEMPLATE: UltrasoundTemplate = {
  id: 'vascular',
  label: 'Ecografía Vascular',
  description: 'Carótidas (GIM, estenosis), Doppler venoso de miembros inferiores',
  icon: 'HeartPulse',
  sections: [
    {
      id: 'right_carotid',
      label: 'Carótida Derecha',
      measurements: [
        {
          id: 'right_imt',
          label: 'GIM (IMT)',
          unit: 'mm',
          normalRange: { min: 0.4, max: 0.9 },
          step: 0.01,
          placeholder: 'Grosor íntima-media',
        },
        {
          id: 'right_ica_psv',
          label: 'VPS en ACI',
          unit: 'cm/s',
          step: 1,
          placeholder: 'Velocidad pico sistólica en arteria carótida interna',
        },
      ],
      findingFields: [
        {
          id: 'right_carotid_stenosis',
          label: 'Grado de estenosis',
          placeholder: 'Porcentaje de estenosis...',
          options: ['Sin estenosis significativa', '<50% estenosis', '50-69% estenosis', '70-99% estenosis (severa)', 'Oclusión completa'],
        },
        {
          id: 'right_carotid_plaque',
          label: 'Placa',
          placeholder: 'Características de la placa...',
          options: ['Sin placa', 'Placa calcificada', 'Placa fibrolipídica', 'Placa ulcerada', 'Placa mixta'],
        },
      ],
    },
    {
      id: 'left_carotid',
      label: 'Carótida Izquierda',
      measurements: [
        {
          id: 'left_imt',
          label: 'GIM (IMT)',
          unit: 'mm',
          normalRange: { min: 0.4, max: 0.9 },
          step: 0.01,
          placeholder: 'Grosor íntima-media',
        },
        {
          id: 'left_ica_psv',
          label: 'VPS en ACI',
          unit: 'cm/s',
          step: 1,
          placeholder: 'Velocidad pico sistólica en arteria carótida interna',
        },
      ],
      findingFields: [
        {
          id: 'left_carotid_stenosis',
          label: 'Grado de estenosis',
          placeholder: 'Porcentaje de estenosis...',
          options: ['Sin estenosis significativa', '<50% estenosis', '50-69% estenosis', '70-99% estenosis (severa)', 'Oclusión completa'],
        },
        {
          id: 'left_carotid_plaque',
          label: 'Placa',
          placeholder: 'Características de la placa...',
          options: ['Sin placa', 'Placa calcificada', 'Placa fibrolipídica', 'Placa ulcerada', 'Placa mixta'],
        },
      ],
    },
    {
      id: 'vertebral_arteries',
      label: 'Arterias Vertebrales',
      measurements: [],
      findingFields: [
        {
          id: 'vertebral_flow',
          label: 'Flujo vertebral',
          placeholder: 'Flujo en arterias vertebrales...',
          options: ['Flujo anterógrado bilateral', 'Flujo reducido derecho', 'Flujo reducido izquierdo', 'Flujo reverso (robo subclavio)'],
        },
      ],
    },
    {
      id: 'lower_extremity_dvt',
      label: 'Miembros Inferiores - TVP',
      measurements: [],
      findingFields: [
        {
          id: 'dvt_right_leg',
          label: 'Miembro inferior derecho',
          placeholder: 'Compresibilidad venosa derecha...',
          options: ['Venas compresibles, sin TVP', 'TVP femoral común', 'TVP femoral superficial', 'TVP poplítea', 'TVP gemelar', 'Trombosis crónica (recanalización parcial)'],
        },
        {
          id: 'dvt_left_leg',
          label: 'Miembro inferior izquierdo',
          placeholder: 'Compresibilidad venosa izquierda...',
          options: ['Venas compresibles, sin TVP', 'TVP femoral común', 'TVP femoral superficial', 'TVP poplítea', 'TVP gemelar', 'Trombosis crónica (recanalización parcial)'],
        },
        {
          id: 'venous_reflux',
          label: 'Reflujo venoso',
          placeholder: 'Presencia de reflujo...',
          options: ['Sin reflujo significativo', 'Reflujo safena mayor derecha', 'Reflujo safena mayor izquierda', 'Insuficiencia venosa bilateral'],
        },
      ],
    },
  ],
};

// ============================================================================
// RENAL TEMPLATE
// ============================================================================

const RENAL_TEMPLATE: UltrasoundTemplate = {
  id: 'renal',
  label: 'Ecografía Renal',
  description: 'Dimensiones renales, grosor cortical y Doppler (índice de resistencia)',
  icon: 'Droplets',
  sections: [
    {
      id: 'right_kidney',
      label: 'Riñón Derecho',
      measurements: [
        {
          id: 'rk_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 9, max: 12 },
          step: 0.1,
        },
        {
          id: 'rk_width',
          label: 'Ancho',
          unit: 'cm',
          normalRange: { min: 4, max: 6 },
          step: 0.1,
        },
        {
          id: 'rk_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 3, max: 5 },
          step: 0.1,
        },
        {
          id: 'rk_cortex',
          label: 'Grosor cortical',
          unit: 'mm',
          normalRange: { min: 10, max: 16 },
          step: 0.1,
        },
        {
          id: 'rk_ri',
          label: 'Índice de resistencia (IR)',
          unit: '',
          normalRange: { min: 0.5, max: 0.7 },
          step: 0.01,
          placeholder: 'Doppler IR',
        },
      ],
      findingFields: [
        {
          id: 'rk_parenchyma',
          label: 'Parénquima',
          placeholder: 'Ecogenicidad parenquimatosa...',
          options: ['Ecogenicidad normal', 'Hiperecogenicidad (nefropatía médica)', 'Diferenciación córtico-medular conservada', 'Pérdida de diferenciación córtico-medular'],
        },
        {
          id: 'rk_collecting_system',
          label: 'Sistema colector',
          placeholder: 'Dilatación del sistema colector...',
          options: ['Sin dilatación', 'Ectasia pielocalicial', 'Hidronefrosis leve', 'Hidronefrosis moderada', 'Hidronefrosis severa'],
        },
        {
          id: 'rk_stones',
          label: 'Litiasis',
          placeholder: 'Cálculos renales...',
          options: ['Sin litiasis', 'Cálculo calicial', 'Cálculo piélico', 'Cálculo coraliforme', 'Nefrocalcinosis'],
        },
      ],
    },
    {
      id: 'left_kidney',
      label: 'Riñón Izquierdo',
      measurements: [
        {
          id: 'lk_length',
          label: 'Longitud',
          unit: 'cm',
          normalRange: { min: 9, max: 12 },
          step: 0.1,
        },
        {
          id: 'lk_width',
          label: 'Ancho',
          unit: 'cm',
          normalRange: { min: 4, max: 6 },
          step: 0.1,
        },
        {
          id: 'lk_ap',
          label: 'Anteroposterior',
          unit: 'cm',
          normalRange: { min: 3, max: 5 },
          step: 0.1,
        },
        {
          id: 'lk_cortex',
          label: 'Grosor cortical',
          unit: 'mm',
          normalRange: { min: 10, max: 16 },
          step: 0.1,
        },
        {
          id: 'lk_ri',
          label: 'Índice de resistencia (IR)',
          unit: '',
          normalRange: { min: 0.5, max: 0.7 },
          step: 0.01,
          placeholder: 'Doppler IR',
        },
      ],
      findingFields: [
        {
          id: 'lk_parenchyma',
          label: 'Parénquima',
          placeholder: 'Ecogenicidad parenquimatosa...',
          options: ['Ecogenicidad normal', 'Hiperecogenicidad (nefropatía médica)', 'Diferenciación córtico-medular conservada', 'Pérdida de diferenciación córtico-medular'],
        },
        {
          id: 'lk_collecting_system',
          label: 'Sistema colector',
          placeholder: 'Dilatación del sistema colector...',
          options: ['Sin dilatación', 'Ectasia pielocalicial', 'Hidronefrosis leve', 'Hidronefrosis moderada', 'Hidronefrosis severa'],
        },
        {
          id: 'lk_stones',
          label: 'Litiasis',
          placeholder: 'Cálculos renales...',
          options: ['Sin litiasis', 'Cálculo calicial', 'Cálculo piélico', 'Cálculo coraliforme', 'Nefrocalcinosis'],
        },
      ],
    },
    {
      id: 'bladder_renal',
      label: 'Vejiga',
      measurements: [
        {
          id: 'bladder_volume',
          label: 'Volumen vesical',
          unit: 'mL',
          step: 1,
        },
        {
          id: 'post_void_residual',
          label: 'Residuo post-miccional',
          unit: 'mL',
          normalRange: { min: 0, max: 50 },
          step: 1,
        },
      ],
      findingFields: [
        {
          id: 'bladder_wall_renal',
          label: 'Pared vesical',
          placeholder: 'Grosor y regularidad de la pared...',
          options: ['Paredes regulares, grosor normal', 'Paredes engrosadas (>5 mm)', 'Trabeculaciones', 'Divertículos'],
        },
        {
          id: 'ureteral_jets',
          label: 'Jets ureterales',
          placeholder: 'Presencia de jets...',
          options: ['Jets bilaterales presentes', 'Jet derecho ausente', 'Jet izquierdo ausente', 'No evaluados'],
        },
      ],
    },
  ],
};

// ============================================================================
// TEMPLATE REGISTRY
// ============================================================================

export const ULTRASOUND_TEMPLATES: Record<UltrasoundType, UltrasoundTemplate> = {
  abdominal: ABDOMINAL_TEMPLATE,
  pelvic_female: PELVIC_FEMALE_TEMPLATE,
  obstetric_1st: OBSTETRIC_1ST_TEMPLATE,
  obstetric_2nd_3rd: OBSTETRIC_2ND_3RD_TEMPLATE,
  thyroid: THYROID_TEMPLATE,
  musculoskeletal: MUSCULOSKELETAL_TEMPLATE,
  vascular: VASCULAR_TEMPLATE,
  renal: RENAL_TEMPLATE,
};

/**
 * Get template by ultrasound type. Returns null if not found.
 */
export function getUltrasoundTemplate(type: UltrasoundType): UltrasoundTemplate | null {
  return ULTRASOUND_TEMPLATES[type] ?? null;
}

/**
 * Get all measurement field IDs for a given template (flat list).
 */
export function getTemplateMeasurementIds(type: UltrasoundType): string[] {
  const template = ULTRASOUND_TEMPLATES[type];
  if (!template) return [];
  return template.sections.flatMap((s) => s.measurements.map((m) => m.id));
}
