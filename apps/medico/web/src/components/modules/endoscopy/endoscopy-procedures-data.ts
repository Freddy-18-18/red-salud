// ============================================
// ENDOSCOPY PROCEDURES DATA — Procedure definitions,
// classifications, and common findings
// ============================================

// ============================================================================
// PROCEDURE TYPES
// ============================================================================

export type EndoscopyProcedureType =
  | 'gastroscopy'
  | 'colonoscopy'
  | 'bronchoscopy'
  | 'cystoscopy'
  | 'arthroscopy'
  | 'laparoscopy'
  | 'hysteroscopy'
  | 'ercp';

export const PROCEDURE_TYPE_LABELS: Record<EndoscopyProcedureType, string> = {
  gastroscopy: 'Gastroscopia (EGD)',
  colonoscopy: 'Colonoscopia',
  bronchoscopy: 'Broncoscopia',
  cystoscopy: 'Cistoscopia',
  arthroscopy: 'Artroscopia',
  laparoscopy: 'Laparoscopia',
  hysteroscopy: 'Histeroscopia',
  ercp: 'CPRE',
};

export const PROCEDURE_TYPE_ICONS: Record<EndoscopyProcedureType, string> = {
  gastroscopy: 'Scan',
  colonoscopy: 'ScanLine',
  bronchoscopy: 'Wind',
  cystoscopy: 'Droplets',
  arthroscopy: 'Bone',
  laparoscopy: 'Aperture',
  hysteroscopy: 'HeartPulse',
  ercp: 'Zap',
};

export const PROCEDURE_TYPE_COLORS: Record<EndoscopyProcedureType, string> = {
  gastroscopy: '#EF4444',
  colonoscopy: '#3B82F6',
  bronchoscopy: '#8B5CF6',
  cystoscopy: '#F59E0B',
  arthroscopy: '#10B981',
  laparoscopy: '#EC4899',
  hysteroscopy: '#14B8A6',
  ercp: '#F97316',
};

// ============================================================================
// ANATOMIC SEGMENTS
// ============================================================================

export interface AnatomicSegment {
  id: string;
  label: string;
  /** Group label for UI grouping */
  group?: string;
}

export const GASTROSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'esophagus-upper', label: 'Esófago superior', group: 'Esófago' },
  { id: 'esophagus-middle', label: 'Esófago medio', group: 'Esófago' },
  { id: 'esophagus-lower', label: 'Esófago inferior', group: 'Esófago' },
  { id: 'gej', label: 'Unión gastroesofágica', group: 'Esófago' },
  { id: 'fundus', label: 'Fundus gástrico', group: 'Estómago' },
  { id: 'body', label: 'Cuerpo gástrico', group: 'Estómago' },
  { id: 'antrum', label: 'Antro gástrico', group: 'Estómago' },
  { id: 'pylorus', label: 'Píloro', group: 'Estómago' },
  { id: 'duodenal-bulb', label: 'Bulbo duodenal', group: 'Duodeno' },
  { id: 'duodenum-d2', label: 'Segunda porción duodenal', group: 'Duodeno' },
];

export const COLONOSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'rectum', label: 'Recto', group: 'Colon distal' },
  { id: 'sigmoid', label: 'Sigmoides', group: 'Colon distal' },
  { id: 'descending', label: 'Colon descendente', group: 'Colon izquierdo' },
  { id: 'splenic-flexure', label: 'Ángulo esplénico', group: 'Colon izquierdo' },
  { id: 'transverse', label: 'Colon transverso', group: 'Colon transverso' },
  { id: 'hepatic-flexure', label: 'Ángulo hepático', group: 'Colon derecho' },
  { id: 'ascending', label: 'Colon ascendente', group: 'Colon derecho' },
  { id: 'cecum', label: 'Ciego', group: 'Colon derecho' },
  { id: 'terminal-ileum', label: 'Íleon terminal', group: 'Colon derecho' },
];

export const BRONCHOSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'trachea', label: 'Tráquea', group: 'Vía aérea central' },
  { id: 'carina', label: 'Carina', group: 'Vía aérea central' },
  { id: 'right-main', label: 'Bronquio principal derecho', group: 'Árbol derecho' },
  { id: 'right-upper-lobe', label: 'Lóbulo superior derecho', group: 'Árbol derecho' },
  { id: 'right-middle-lobe', label: 'Lóbulo medio derecho', group: 'Árbol derecho' },
  { id: 'right-lower-lobe', label: 'Lóbulo inferior derecho', group: 'Árbol derecho' },
  { id: 'left-main', label: 'Bronquio principal izquierdo', group: 'Árbol izquierdo' },
  { id: 'left-upper-lobe', label: 'Lóbulo superior izquierdo', group: 'Árbol izquierdo' },
  { id: 'lingula', label: 'Língula', group: 'Árbol izquierdo' },
  { id: 'left-lower-lobe', label: 'Lóbulo inferior izquierdo', group: 'Árbol izquierdo' },
];

export const ERCP_SEGMENTS: AnatomicSegment[] = [
  { id: 'ampulla', label: 'Ampolla de Vater', group: 'Papila' },
  { id: 'cbd-distal', label: 'Colédoco distal', group: 'Vía biliar' },
  { id: 'cbd-mid', label: 'Colédoco medio', group: 'Vía biliar' },
  { id: 'cbd-proximal', label: 'Colédoco proximal', group: 'Vía biliar' },
  { id: 'chd', label: 'Conducto hepático común', group: 'Vía biliar' },
  { id: 'right-hepatic', label: 'Conducto hepático derecho', group: 'Vía biliar' },
  { id: 'left-hepatic', label: 'Conducto hepático izquierdo', group: 'Vía biliar' },
  { id: 'cystic-duct', label: 'Conducto cístico', group: 'Vía biliar' },
  { id: 'pancreatic-duct', label: 'Conducto pancreático principal', group: 'Páncreas' },
];

export const CYSTOSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'urethra', label: 'Uretra', group: 'Uretra' },
  { id: 'bladder-neck', label: 'Cuello vesical', group: 'Vejiga' },
  { id: 'trigone', label: 'Trígono', group: 'Vejiga' },
  { id: 'right-ureteral-orifice', label: 'Orificio ureteral derecho', group: 'Vejiga' },
  { id: 'left-ureteral-orifice', label: 'Orificio ureteral izquierdo', group: 'Vejiga' },
  { id: 'dome', label: 'Cúpula vesical', group: 'Vejiga' },
  { id: 'anterior-wall', label: 'Pared anterior', group: 'Vejiga' },
  { id: 'posterior-wall', label: 'Pared posterior', group: 'Vejiga' },
  { id: 'lateral-walls', label: 'Paredes laterales', group: 'Vejiga' },
];

export const ARTHROSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'suprapatellar', label: 'Receso suprapatelar', group: 'Rodilla' },
  { id: 'medial-compartment', label: 'Compartimiento medial', group: 'Rodilla' },
  { id: 'lateral-compartment', label: 'Compartimiento lateral', group: 'Rodilla' },
  { id: 'intercondylar-notch', label: 'Escotadura intercondílea', group: 'Rodilla' },
  { id: 'acl', label: 'Ligamento cruzado anterior', group: 'Ligamentos' },
  { id: 'pcl', label: 'Ligamento cruzado posterior', group: 'Ligamentos' },
  { id: 'medial-meniscus', label: 'Menisco medial', group: 'Meniscos' },
  { id: 'lateral-meniscus', label: 'Menisco lateral', group: 'Meniscos' },
];

export const LAPAROSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'liver-surface', label: 'Superficie hepática', group: 'Abdomen superior' },
  { id: 'gallbladder', label: 'Vesícula biliar', group: 'Abdomen superior' },
  { id: 'stomach', label: 'Estómago (serosa)', group: 'Abdomen superior' },
  { id: 'spleen', label: 'Bazo', group: 'Abdomen superior' },
  { id: 'small-bowel', label: 'Intestino delgado', group: 'Abdomen medio' },
  { id: 'appendix', label: 'Apéndice', group: 'Abdomen inferior' },
  { id: 'colon', label: 'Colon (serosa)', group: 'Abdomen medio' },
  { id: 'pelvis', label: 'Pelvis', group: 'Abdomen inferior' },
  { id: 'peritoneum', label: 'Peritoneo', group: 'General' },
];

export const HYSTEROSCOPY_SEGMENTS: AnatomicSegment[] = [
  { id: 'cervical-canal', label: 'Canal cervical', group: 'Cérvix' },
  { id: 'internal-os', label: 'Orificio cervical interno', group: 'Cérvix' },
  { id: 'uterine-cavity', label: 'Cavidad uterina', group: 'Útero' },
  { id: 'anterior-wall', label: 'Pared anterior', group: 'Útero' },
  { id: 'posterior-wall', label: 'Pared posterior', group: 'Útero' },
  { id: 'fundus', label: 'Fundus', group: 'Útero' },
  { id: 'right-ostium', label: 'Ostium tubárico derecho', group: 'Ostia' },
  { id: 'left-ostium', label: 'Ostium tubárico izquierdo', group: 'Ostia' },
];

export function getSegmentsForProcedure(
  type: EndoscopyProcedureType,
): AnatomicSegment[] {
  switch (type) {
    case 'gastroscopy': return GASTROSCOPY_SEGMENTS;
    case 'colonoscopy': return COLONOSCOPY_SEGMENTS;
    case 'bronchoscopy': return BRONCHOSCOPY_SEGMENTS;
    case 'ercp': return ERCP_SEGMENTS;
    case 'cystoscopy': return CYSTOSCOPY_SEGMENTS;
    case 'arthroscopy': return ARTHROSCOPY_SEGMENTS;
    case 'laparoscopy': return LAPAROSCOPY_SEGMENTS;
    case 'hysteroscopy': return HYSTEROSCOPY_SEGMENTS;
  }
}

// ============================================================================
// COMMON FINDINGS
// ============================================================================

export interface FindingDefinition {
  id: string;
  label: string;
  /** Which procedure types this finding applies to */
  applicableTo: EndoscopyProcedureType[];
  /** Severity: low | moderate | high */
  severity: 'low' | 'moderate' | 'high';
}

export const COMMON_FINDINGS: FindingDefinition[] = [
  // GI — shared gastroscopy/colonoscopy
  { id: 'polyp', label: 'Pólipo', applicableTo: ['gastroscopy', 'colonoscopy', 'cystoscopy', 'hysteroscopy'], severity: 'moderate' },
  { id: 'ulcer', label: 'Úlcera', applicableTo: ['gastroscopy', 'colonoscopy'], severity: 'moderate' },
  { id: 'mass', label: 'Masa / neoplasia', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'cystoscopy', 'laparoscopy', 'hysteroscopy'], severity: 'high' },
  { id: 'stricture', label: 'Estenosis', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'ercp', 'hysteroscopy'], severity: 'moderate' },
  { id: 'varices', label: 'Várices', applicableTo: ['gastroscopy'], severity: 'high' },
  { id: 'erosion', label: 'Erosión', applicableTo: ['gastroscopy', 'colonoscopy'], severity: 'low' },
  { id: 'erythema', label: 'Eritema', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'cystoscopy'], severity: 'low' },
  { id: 'edema', label: 'Edema', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'cystoscopy'], severity: 'low' },
  { id: 'inflammation', label: 'Inflamación', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'cystoscopy', 'arthroscopy'], severity: 'low' },
  { id: 'bleeding', label: 'Sangrado activo', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'cystoscopy'], severity: 'high' },
  { id: 'diverticulum', label: 'Divertículo', applicableTo: ['gastroscopy', 'colonoscopy', 'cystoscopy'], severity: 'low' },
  { id: 'atrophy', label: 'Atrofia', applicableTo: ['gastroscopy'], severity: 'low' },
  { id: 'barrett', label: 'Esófago de Barrett', applicableTo: ['gastroscopy'], severity: 'moderate' },
  { id: 'hiatal-hernia', label: 'Hernia hiatal', applicableTo: ['gastroscopy'], severity: 'low' },
  { id: 'angiodysplasia', label: 'Angiodisplasia', applicableTo: ['gastroscopy', 'colonoscopy'], severity: 'moderate' },

  // Bronchoscopy
  { id: 'secretions', label: 'Secreciones', applicableTo: ['bronchoscopy'], severity: 'low' },
  { id: 'mucosal-abnormality', label: 'Anomalía mucosa', applicableTo: ['bronchoscopy'], severity: 'moderate' },
  { id: 'vocal-cord-paralysis', label: 'Parálisis de cuerda vocal', applicableTo: ['bronchoscopy'], severity: 'moderate' },
  { id: 'foreign-body', label: 'Cuerpo extraño', applicableTo: ['bronchoscopy', 'gastroscopy'], severity: 'high' },

  // ERCP
  { id: 'stone', label: 'Cálculo / lito', applicableTo: ['ercp', 'cystoscopy'], severity: 'moderate' },
  { id: 'dilated-duct', label: 'Conducto dilatado', applicableTo: ['ercp'], severity: 'moderate' },
  { id: 'papillitis', label: 'Papilitis', applicableTo: ['ercp'], severity: 'low' },

  // Cystoscopy
  { id: 'trabeculation', label: 'Trabeculación', applicableTo: ['cystoscopy'], severity: 'low' },
  { id: 'prostatic-enlargement', label: 'Crecimiento prostático', applicableTo: ['cystoscopy'], severity: 'low' },

  // Arthroscopy
  { id: 'cartilage-damage', label: 'Daño condral', applicableTo: ['arthroscopy'], severity: 'moderate' },
  { id: 'meniscal-tear', label: 'Rotura meniscal', applicableTo: ['arthroscopy'], severity: 'moderate' },
  { id: 'ligament-tear', label: 'Rotura ligamentaria', applicableTo: ['arthroscopy'], severity: 'high' },
  { id: 'synovitis', label: 'Sinovitis', applicableTo: ['arthroscopy'], severity: 'low' },
  { id: 'loose-body', label: 'Cuerpo libre', applicableTo: ['arthroscopy'], severity: 'moderate' },

  // Laparoscopy
  { id: 'adhesions', label: 'Adherencias', applicableTo: ['laparoscopy', 'hysteroscopy'], severity: 'low' },
  { id: 'endometriosis', label: 'Endometriosis', applicableTo: ['laparoscopy', 'hysteroscopy'], severity: 'moderate' },
  { id: 'abscess', label: 'Absceso', applicableTo: ['laparoscopy'], severity: 'high' },

  // Hysteroscopy
  { id: 'septum', label: 'Septo uterino', applicableTo: ['hysteroscopy'], severity: 'moderate' },
  { id: 'myoma', label: 'Mioma submucoso', applicableTo: ['hysteroscopy'], severity: 'moderate' },

  // Generic
  { id: 'normal', label: 'Normal', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'ercp', 'cystoscopy', 'arthroscopy', 'laparoscopy', 'hysteroscopy'], severity: 'low' },
];

export function getFindingsForProcedure(
  type: EndoscopyProcedureType,
): FindingDefinition[] {
  return COMMON_FINDINGS.filter((f) => f.applicableTo.includes(type));
}

// ============================================================================
// FORREST CLASSIFICATION — GI bleeding
// ============================================================================

export interface ForrestClass {
  code: string;
  label: string;
  description: string;
  rebleedRisk: string;
}

export const FORREST_CLASSIFICATION: ForrestClass[] = [
  { code: 'Ia', label: 'Forrest Ia', description: 'Sangrado arterial activo (en chorro)', rebleedRisk: '90%' },
  { code: 'Ib', label: 'Forrest Ib', description: 'Sangrado en napa (rezumamiento)', rebleedRisk: '50%' },
  { code: 'IIa', label: 'Forrest IIa', description: 'Vaso visible no sangrante', rebleedRisk: '43%' },
  { code: 'IIb', label: 'Forrest IIb', description: 'Coágulo adherido', rebleedRisk: '22%' },
  { code: 'IIc', label: 'Forrest IIc', description: 'Manchas hemáticas planas', rebleedRisk: '10%' },
  { code: 'III', label: 'Forrest III', description: 'Fondo limpio (sin estigmas de sangrado)', rebleedRisk: '5%' },
];

// ============================================================================
// PARIS CLASSIFICATION — Polyps (superficial neoplastic lesions)
// ============================================================================

export interface ParisClass {
  code: string;
  label: string;
  description: string;
  morphology: string;
}

export const PARIS_CLASSIFICATION: ParisClass[] = [
  { code: '0-Ip', label: 'París 0-Ip', description: 'Pediculada', morphology: 'Protruida con pedículo' },
  { code: '0-Is', label: 'París 0-Is', description: 'Sésil', morphology: 'Protruida con base ancha' },
  { code: '0-IIa', label: 'París 0-IIa', description: 'Plana elevada', morphology: 'Ligeramente elevada' },
  { code: '0-IIb', label: 'París 0-IIb', description: 'Plana', morphology: 'Plana a nivel de la mucosa' },
  { code: '0-IIc', label: 'París 0-IIc', description: 'Plana deprimida', morphology: 'Ligeramente deprimida' },
  { code: '0-III', label: 'París 0-III', description: 'Excavada / ulcerada', morphology: 'Excavación profunda' },
];

// ============================================================================
// SYDNEY SYSTEM — Gastritis grading
// ============================================================================

export type SydneyGrade = 0 | 1 | 2 | 3;

export const SYDNEY_GRADE_LABELS: Record<SydneyGrade, string> = {
  0: 'Ausente',
  1: 'Leve',
  2: 'Moderado',
  3: 'Severo',
};

export interface SydneyParameter {
  id: string;
  label: string;
  description: string;
}

export const SYDNEY_PARAMETERS: SydneyParameter[] = [
  { id: 'inflammation', label: 'Inflamación', description: 'Densidad de infiltrado inflamatorio' },
  { id: 'activity', label: 'Actividad', description: 'Infiltración neutrofílica' },
  { id: 'atrophy', label: 'Atrofia', description: 'Pérdida de glándulas' },
  { id: 'intestinal-metaplasia', label: 'Metaplasia intestinal', description: 'Reemplazo por epitelio intestinal' },
  { id: 'h-pylori', label: 'H. pylori', description: 'Densidad de H. pylori' },
];

// ============================================================================
// BOSTON BOWEL PREPARATION SCALE — Colonoscopy
// ============================================================================

export type BostonScore = 0 | 1 | 2 | 3;

export const BOSTON_SCORE_LABELS: Record<BostonScore, string> = {
  0: 'Inadecuada — segmento no examinado',
  1: 'Pobre — residuos sólidos, mucosa parcialmente visible',
  2: 'Buena — residuos menores, mucosa bien visualizada',
  3: 'Excelente — mucosa completamente visualizada',
};

export interface BostonSegment {
  id: string;
  label: string;
}

export const BOSTON_SEGMENTS: BostonSegment[] = [
  { id: 'right', label: 'Colon derecho (ciego, ascendente, ángulo hepático)' },
  { id: 'transverse', label: 'Colon transverso (incluye ambos ángulos)' },
  { id: 'left', label: 'Colon izquierdo (descendente, sigmoides, recto)' },
];

// ============================================================================
// SEDATION TYPES
// ============================================================================

export interface SedationType {
  id: string;
  label: string;
}

export const SEDATION_TYPES: SedationType[] = [
  { id: 'none', label: 'Sin sedación' },
  { id: 'topical', label: 'Anestesia tópica' },
  { id: 'conscious', label: 'Sedación consciente' },
  { id: 'deep', label: 'Sedación profunda' },
  { id: 'general', label: 'Anestesia general' },
];

// ============================================================================
// INTERVENTION TYPES
// ============================================================================

export interface InterventionType {
  id: string;
  label: string;
  applicableTo: EndoscopyProcedureType[];
}

export const INTERVENTION_TYPES: InterventionType[] = [
  { id: 'polypectomy', label: 'Polipectomía', applicableTo: ['gastroscopy', 'colonoscopy', 'cystoscopy', 'hysteroscopy'] },
  { id: 'emr', label: 'Mucosectomía endoscópica (EMR)', applicableTo: ['gastroscopy', 'colonoscopy'] },
  { id: 'esd', label: 'Disección submucosa (ESD)', applicableTo: ['gastroscopy', 'colonoscopy'] },
  { id: 'hemostasis-injection', label: 'Hemostasia — inyección', applicableTo: ['gastroscopy', 'colonoscopy'] },
  { id: 'hemostasis-clip', label: 'Hemostasia — clip', applicableTo: ['gastroscopy', 'colonoscopy'] },
  { id: 'hemostasis-thermal', label: 'Hemostasia — térmica', applicableTo: ['gastroscopy', 'colonoscopy'] },
  { id: 'band-ligation', label: 'Ligadura con bandas', applicableTo: ['gastroscopy'] },
  { id: 'dilation', label: 'Dilatación', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'ercp'] },
  { id: 'stent', label: 'Colocación de stent', applicableTo: ['gastroscopy', 'colonoscopy', 'bronchoscopy', 'ercp'] },
  { id: 'sphincterotomy', label: 'Esfinterotomía', applicableTo: ['ercp'] },
  { id: 'stone-extraction', label: 'Extracción de cálculos', applicableTo: ['ercp', 'cystoscopy'] },
  { id: 'bal', label: 'Lavado broncoalveolar (BAL)', applicableTo: ['bronchoscopy'] },
  { id: 'transbronchial-biopsy', label: 'Biopsia transbronquial', applicableTo: ['bronchoscopy'] },
  { id: 'turbt', label: 'Resección transuretral (RTU)', applicableTo: ['cystoscopy'] },
  { id: 'meniscectomy', label: 'Meniscectomía', applicableTo: ['arthroscopy'] },
  { id: 'chondroplasty', label: 'Condroplastia', applicableTo: ['arthroscopy'] },
  { id: 'synovectomy', label: 'Sinovectomía', applicableTo: ['arthroscopy', 'hysteroscopy'] },
  { id: 'myomectomy', label: 'Miomectomía', applicableTo: ['hysteroscopy', 'laparoscopy'] },
  { id: 'adhesiolysis', label: 'Adhesiolisis', applicableTo: ['laparoscopy', 'hysteroscopy'] },
  { id: 'septoplasty', label: 'Septoplastia', applicableTo: ['hysteroscopy'] },
];

export function getInterventionsForProcedure(
  type: EndoscopyProcedureType,
): InterventionType[] {
  return INTERVENTION_TYPES.filter((i) => i.applicableTo.includes(type));
}

// ============================================================================
// COMPLICATION TYPES
// ============================================================================

export interface ComplicationType {
  id: string;
  label: string;
  severity: 'mild' | 'moderate' | 'severe';
}

export const COMPLICATION_TYPES: ComplicationType[] = [
  { id: 'none', label: 'Sin complicaciones', severity: 'mild' },
  { id: 'bleeding-minor', label: 'Sangrado menor (autolimitado)', severity: 'mild' },
  { id: 'bleeding-major', label: 'Sangrado mayor (requirió intervención)', severity: 'severe' },
  { id: 'perforation', label: 'Perforación', severity: 'severe' },
  { id: 'aspiration', label: 'Aspiración', severity: 'severe' },
  { id: 'cardiorespiratory', label: 'Evento cardiorrespiratorio', severity: 'severe' },
  { id: 'post-ercp-pancreatitis', label: 'Pancreatitis post-CPRE', severity: 'moderate' },
  { id: 'sedation-adverse', label: 'Reacción adversa a la sedación', severity: 'moderate' },
  { id: 'infection', label: 'Infección', severity: 'moderate' },
  { id: 'pain', label: 'Dolor significativo', severity: 'mild' },
  { id: 'other', label: 'Otra', severity: 'moderate' },
];

// ============================================================================
// SEVERITY COLORS
// ============================================================================

export const SEVERITY_COLORS: Record<string, string> = {
  low: '#10B981',
  moderate: '#F59E0B',
  high: '#EF4444',
  mild: '#10B981',
  severe: '#EF4444',
};

// ============================================================================
// REPORT STRUCTURE
// ============================================================================

export interface SegmentFinding {
  segmentId: string;
  findingId: string;
  description: string;
  parisClass?: string;
  forrestClass?: string;
  sizeInMm?: number;
}

export interface BiopsySample {
  id: string;
  site: string;
  segmentId: string;
  numberOfSamples: number;
  jarLabel: string;
  indication: string;
}

export interface EndoscopyReportData {
  procedureType: EndoscopyProcedureType;
  indication: string;
  sedationType: string;
  sedationDetails: string;
  scopeModel: string;
  segmentFindings: SegmentFinding[];
  biopsies: BiopsySample[];
  interventions: string[];
  interventionDetails: string;
  complications: string[];
  complicationDetails: string;
  recommendations: string;
  followUp: string;
  photoUrls: string[];
  // Colonoscopy-specific
  bostonScores?: Record<string, BostonScore>;
  cecalIntubation?: boolean;
  withdrawalTimeMinutes?: number;
  // Gastroscopy-specific
  sydneyGrades?: Record<string, SydneyGrade>;
  // ERCP-specific
  cannulationSuccess?: boolean;
  contrastUsed?: string;
}

/**
 * Get an empty report data structure for a given procedure type.
 */
export function getEmptyReportData(type: EndoscopyProcedureType): EndoscopyReportData {
  const data: EndoscopyReportData = {
    procedureType: type,
    indication: '',
    sedationType: 'conscious',
    sedationDetails: '',
    scopeModel: '',
    segmentFindings: [],
    biopsies: [],
    interventions: [],
    interventionDetails: '',
    complications: ['none'],
    complicationDetails: '',
    recommendations: '',
    followUp: '',
    photoUrls: [],
  };

  if (type === 'colonoscopy') {
    data.bostonScores = { right: 3 as BostonScore, transverse: 3 as BostonScore, left: 3 as BostonScore };
    data.cecalIntubation = true;
    data.withdrawalTimeMinutes = 6;
  }

  if (type === 'gastroscopy') {
    data.sydneyGrades = {};
  }

  if (type === 'ercp') {
    data.cannulationSuccess = true;
    data.contrastUsed = '';
  }

  return data;
}
