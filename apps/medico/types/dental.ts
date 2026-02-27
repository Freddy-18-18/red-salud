// =============================================================================
// Dental Types — Shared across all dental/odontology modules
// =============================================================================

// ─── Tooth & Surface ─────────────────────────────────────────────────────────
export type ToothCode = number; // 11-48 (FDI) or 51-85 (primary)
export type SurfaceCode = "M" | "D" | "O" | "B" | "L" | "I"; // Mesial, Distal, Oclusal, Bucal, Lingual, Incisal
export type PerioSite = "MB" | "B" | "DB" | "ML" | "L" | "DL";

export const PERMANENT_TEETH_UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28] as const;
export const PERMANENT_TEETH_LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38] as const;
export const ALL_PERMANENT_TEETH = [...PERMANENT_TEETH_UPPER, ...PERMANENT_TEETH_LOWER] as const;

export const PERIO_SITES: PerioSite[] = ["MB", "B", "DB", "ML", "L", "DL"];

// ─── Periodontogram ──────────────────────────────────────────────────────────
export interface PerioMeasurement {
  toothCode: ToothCode;
  site: PerioSite;
  probingDepth: number; // mm
  recession: number;    // mm (positive = recession, negative = hyperplasia)
  bleeding: boolean;
  suppuration: boolean;
  plaque: boolean;
  furcation?: 1 | 2 | 3; // Furcation grade for specific sites (usually B/L on molars)
}

export interface PerioToothData {
  toothCode: ToothCode;
  mobility: 0 | 1 | 2 | 3;
  implant: boolean;
  missing: boolean;
  notes?: string;
  measurements: Record<PerioSite, PerioMeasurement>;
  furcation?: 1 | 2 | 3;
}

export interface PerioExam {
  id: string;
  patientId: string;
  doctorId: string;
  examDate: string;
  teeth: Record<number, PerioToothData>;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export function calculateCAL(probing: number, recession: number): number {
  return probing + recession; // Clinical Attachment Loss
}

export function getDepthSeverity(depth: number): "healthy" | "mild" | "moderate" | "severe" {
  if (depth <= 3) return "healthy";
  if (depth <= 5) return "mild";
  if (depth <= 7) return "moderate";
  return "severe";
}

export const DEPTH_COLORS: Record<ReturnType<typeof getDepthSeverity>, string> = {
  healthy: "#22c55e",
  mild: "#f59e0b",
  moderate: "#f97316",
  severe: "#ef4444",
};

// ─── SOAP Notes ──────────────────────────────────────────────────────────────
export interface SOAPNote {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  vitalSigns?: VitalSigns;
  icdCodes: string[];
  cptCodes: string[];
  templateId?: string;
  status: "draft" | "signed" | "amended";
  signedAt?: string;
  amendedAt?: string;
  amendmentNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VitalSigns {
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
}

export interface SOAPTemplate {
  id: string;
  name: string;
  specialty: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  isDefault: boolean;
}

// ─── Smart Waitlist ──────────────────────────────────────────────────────────
export interface WaitlistEntry {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  procedureType: string;
  estimatedDuration: number; // minutes
  priority: "low" | "normal" | "high" | "urgent";
  preferredDays: string[];   // ["monday", "tuesday", ...]
  preferredTimeStart?: string; // "08:00"
  preferredTimeEnd?: string;   // "17:00"
  status: "waiting" | "notified" | "confirmed" | "expired" | "cancelled";
  notifiedAt?: string;
  confirmedAt?: string;
  notes: string;
  createdAt: string;
  // Campos odontológicos opcionales
  procedureCode?: string;
  toothNumbers?: number[];
  requiresAnesthesia?: boolean;
}

// ─── Digital Intake Forms ────────────────────────────────────────────────────
export type IntakeFieldType = "text" | "textarea" | "select" | "checkbox" | "radio" | "date" | "signature" | "file";

export interface IntakeFormField {
  id: string;
  label: string;
  type: IntakeFieldType;
  required: boolean;
  options?: string[];
  placeholder?: string;
  helpText?: string;
  triggerAlert?: { condition: string; message: string; severity: "info" | "warning" | "critical" };
}

export interface IntakeFormTemplate {
  id: string;
  name: string;
  description: string;
  sections: IntakeFormSection[];
  isActive: boolean;
  createdAt: string;
}

export interface IntakeFormSection {
  id: string;
  title: string;
  description?: string;
  fields: IntakeFormField[];
}

export interface IntakeFormSubmission {
  id: string;
  patientId: string;
  templateId: string;
  data: Record<string, unknown>;
  signatureDataUrl?: string;
  alerts: Array<{ field: string; message: string; severity: string }>;
  status: "pending" | "reviewed" | "approved";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

// ─── Treatment Plan Estimator ────────────────────────────────────────────────
export interface TreatmentEstimate {
  id: string;
  patientId: string;
  items: TreatmentEstimateItem[];
  totalEstimated: number;
  insuranceCoverage: number;
  patientResponsibility: number;
  status: "draft" | "presented" | "accepted" | "declined" | "partially_accepted";
  presentedAt?: string;
  respondedAt?: string;
  createdAt: string;
}

export interface TreatmentEstimateItem {
  id: string;
  procedureCode: string;
  procedureName: string;
  toothCode?: number;
  toothNumber?: number;
  surfaceCodes?: SurfaceCode[];
  quantity: number;
  unitFee: number;
  totalFee?: number;
  discountPercent?: number;
  insuranceCoveragePercent?: number;
  insurancePays?: number;
  patientPays?: number;
  patientResponsibility?: number;
  accepted?: boolean;
  status?: "pending" | "accepted" | "rejected" | "scheduled" | "completed" | "proposed";
  scheduledDate?: string;
}

// ─── Lab Case Tracking ────────────────────────────────────────────────────────
export type LabCaseStatus =
  | "impression_sent"
  | "received_by_lab"
  | "in_fabrication"
  | "cad_design"
  | "milling"
  | "glazing_finishing"
  | "quality_check"
  | "try_in"
  | "adjustment"
  | "shipped"
  | "received_by_clinic"
  | "seated"
  | "rejected"
  | "rework_needed";

export interface LabCase {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  labId: string;
  labName: string;
  caseType?: "crown" | "bridge" | "implant_abutment" | "denture" | "veneer" | "inlay_onlay" | "orthodontic" | "other";
  type?: string;
  toothCodes?: number[];
  toothNumbers?: number[];
  shade?: string;
  material?: string;
  status: LabCaseStatus;
  priority?: "urgent" | "high" | "normal" | "low";
  impressionType?: "digital" | "physical";
  notes?: string;
  dueDate?: string;
  expectedDate?: string;
  sentDate?: string;
  statusHistory?: LabCaseEvent[];
  events?: LabCaseEvent[];
  createdAt: string;
  updatedAt?: string;
}

export interface LabCaseEvent {
  id: string;
  status: LabCaseStatus;
  notes?: string;
  note?: string;
  date?: string;
  updatedBy?: string;
  by?: string;
  timestamp?: string;
}

// ─── Insurance / Seguro Module ───────────────────────────────────────────────
export interface InsurancePlan {
  id: string;
  name?: string;
  payerName: string;
  planName: string;
  insurerName?: string;
  insurerCode?: string;
  coverageType?: string;
  planType: "PPO" | "HMO" | "indemnity" | "discount" | "government";
  groupNumber?: string;
  annualMaximum: number;
  deductible: number;
  deductibleMet: number;
  preventiveCoverage: number; // percentage
  basicCoverage: number;
  majorCoverage: number;
  orthodonticCoverage: number;
  coveragePercentages?: { preventive: number; basic: number; major: number; orthodontics: number };
  waitingPeriods: Record<string, number | undefined>; // category -> months
  exclusions: string[];
  isActive?: boolean;
  effectiveDate: string;
  terminationDate?: string;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  patientName: string;
  planId: string;
  planName?: string;
  claimNumber?: string;
  status: "draft" | "submitted" | "pending" | "accepted" | "approved" | "denied" | "appealed" | "paid" | "void";
  procedures?: ClaimProcedure[];
  procedureCodes?: string[];
  diagnosisCodes?: string[];
  totalCharged?: number;
  totalAllowed?: number;
  totalPaid?: number;
  totalAmount?: number;
  approvedAmount?: number;
  patientResponsibility?: number;
  submittedAt?: string;
  processedAt?: string;
  paidAt?: string;
  denialReason?: string;
  denialCode?: string;
  eobUrl?: string;
  notes?: string;
  createdAt?: string;
}

export interface ClaimProcedure {
  procedureCode: string;
  procedureName: string;
  toothCode?: number;
  surfaceCodes?: string[];
  fee: number;
  allowedAmount: number;
  paidAmount: number;
  serviceDate: string;
}

// ─── Membership / Subscription Plans ─────────────────────────────────────────
export interface MembershipPlan {
  id: string;
  name: string;
  description: string;
  tier: "basic" | "standard" | "premium" | "family";
  monthlyPrice: number;
  annualPrice: number;
  benefits?: MembershipBenefit[];
  features?: string[];
  includedProcedures?: string[];
  discountOnServices?: number;
  maxMembers: number; // 1 for individual, >1 for family
  isActive: boolean;
  createdAt: string;
}

export interface MembershipBenefit {
  category: string;
  description: string;
  discountPercentage?: number;
  includedQuantity?: number;
  annualLimit?: number;
}

export interface MembershipSubscription {
  id: string;
  patientId: string;
  patientName?: string;
  planId: string;
  planName: string;
  status: "active" | "past_due" | "cancelled" | "expired";
  billingCycle: "monthly" | "annual";
  amount?: number;
  members?: number;
  startDate?: string;
  endDate?: string;
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  nextPaymentDate?: string;
  nextBillingDate?: string;
  paymentMethodLast4?: string;
  totalPaid?: number;
  savingsToDate?: number;
  createdAt: string;
}

// ─── Inventory QR / Barcode ──────────────────────────────────────────────────
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  qrCode?: string;
  category: string;
  currentStock: number;
  minimumStock?: number; // par level
  maximumStock?: number;
  minStock?: number;
  maxStock?: number;
  unit?: string;
  unitCost: number;
  supplier: string;
  expirationDate?: string;
  lotNumber?: string;
  location: string;
  lastRestocked?: string;
  status?: "in_stock" | "low_stock" | "out_of_stock" | "expired";
}

export interface InventoryScanResult {
  barcode: string;
  item?: InventoryItem;
  action: "add" | "remove" | "lookup";
  quantity: number;
  timestamp: string;
}

// ─── AI Diagnostic Imaging ───────────────────────────────────────────────────
export interface DiagnosticImage {
  id: string;
  patientId: string;
  type?: "periapical" | "bitewing" | "panoramic" | "cbct" | "intraoral_photo" | "cephalometric";
  imageType?: string;
  imageUrl: string;
  thumbnailUrl?: string;
  toothNumbers?: number[];
  notes?: string;
  metadata?: ImageMetadata;
  aiAnalysis?: AIAnalysisResult;
  annotations?: ImageAnnotation[];
  capturedAt: string;
  uploadedAt?: string;
}

export interface ImageMetadata {
  width: number;
  height: number;
  fileSize: number;
  format: string;
  toothRegion?: number[];
  brightness?: number;
  contrast?: number;
}

export interface AIAnalysisResult {
  id: string;
  imageId?: string;
  model: string;
  findings: AIFinding[];
  overallAssessment?: string;
  summary?: string;
  recommendations?: string[];
  confidence?: number;
  analyzedAt: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface AIFinding {
  id: string;
  type: "caries" | "bone_loss" | "calculus" | "periapical_lesion" | "fracture" | "impaction" | "impacted_tooth" | "restoration" | "other";
  location?: { x: number; y: number; width: number; height: number };
  boundingBox?: { x: number; y: number; width: number; height: number };
  confidence: number;
  severity: "low" | "medium" | "high" | "critical" | "moderate" | "mild" | "info";
  description: string;
  suggestedDiagnosis?: string;
  status?: "pending" | "accepted" | "rejected";
}

export interface ImageAnnotation {
  id: string;
  type: "marker" | "arrow" | "text" | "measurement" | "region";
  coordinates: { x: number; y: number; x2?: number; y2?: number };
  label?: string;
  color: string;
  createdBy: string;
  createdAt: string;
}

// ─── DICOM Viewer ────────────────────────────────────────────────────────────
export interface DICOMStudy {
  id: string;
  patientId: string;
  studyDate: string;
  modality: "IO" | "PX" | "CT" | "OT"; // Intraoral, Panoramic, CT, Other
  description: string;
  seriesCount: number;
  imageCount?: number;
  instanceCount?: number;
  institutionName?: string;
  bodyPart?: string; thumbnailUrl?: string; accessionNumber?: string;
  referringPhysician?: string;
  createdAt?: string;
  series?: DICOMSeries[];
}

export interface DICOMSeries {
  id: string;
  seriesNumber: number;
  description: string;
  modality: string;
  images: DICOMImage[];
}

export interface DICOMImage {
  id: string;
  instanceNumber: number;
  url: string;
  rows: number;
  columns: number;
  windowCenter: number;
  windowWidth: number;
  rescaleSlope: number;
  rescaleIntercept: number;
}

// ─── VoIP / Call Intelligence ────────────────────────────────────────────────
export interface CallRecord {
  id: string;
  patientId?: string;
  patientName?: string;
  callerNumber: string;
  phoneNumber?: string;
  direction: "inbound" | "outbound";
  status: "ringing" | "answered" | "missed" | "voicemail" | "completed" | "in_progress";
  startTime?: string;
  endTime?: string;
  duration: number; // seconds
  recordingUrl?: string;
  transcript?: string;
  transcription?: string;
  aiSummary?: string;
  aiSentiment?: "positive" | "neutral" | "negative";
  aiFollowUp?: string[];
  aiKeywords?: string[];
  sentimentScore?: number; // -1 to 1
  assignedTo?: string;
  notes?: string;
  extractedActions?: CallAction[];
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
}

export interface CallAction {
  type: "schedule_appointment" | "confirm_appointment" | "cancel_appointment" | "billing_inquiry" | "prescription_refill" | "general_inquiry";
  description: string;
  completed: boolean;
  linkedEntityId?: string;
}

// ─── 3D Dental Visualization ─────────────────────────────────────────────────
export interface Dental3DModel {
  id: string;
  patientId: string;
  type: "full_arch_upper" | "full_arch_lower" | "single_tooth" | "implant_plan" | "orthodontic";
  modelUrl: string; // STL/OBJ/GLTF
  annotations: Model3DAnnotation[];
  createdAt: string;
}

export interface Model3DAnnotation {
  id: string;
  position: { x: number; y: number; z: number };
  label: string;
  description: string;
  color: string;
}

// ─── Teledentistry / Remote Monitoring ───────────────────────────────────────
export interface RemoteMonitoringCase {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  type: "orthodontic_tracking" | "post_operative" | "periodontal" | "general_checkup";
  status: "active" | "completed" | "paused" | "flagged";
  schedule: MonitoringSchedule;
  submissions: MonitoringSubmission[];
  alerts: MonitoringAlert[];
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringSchedule {
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  nextDueDate: string;
  totalSessions: number;
  completedSessions: number;
}

export interface MonitoringSubmission {
  id: string;
  photos: string[];
  selfAssessment: Record<string, unknown>;
  painLevel: number; // 0-10
  notes: string;
  aiAnalysis?: {
    progressScore: number;
    deviationDetected: boolean;
    deviationDescription?: string;
    recommendation: string;
  };
  submittedAt: string;
  reviewedAt?: string;
  doctorNotes?: string;
}

export interface MonitoringAlert {
  id: string;
  type: "deviation" | "missed_submission" | "pain_increase" | "photo_quality";
  severity: "info" | "warning" | "critical";
  message: string;
  resolved: boolean;
  createdAt: string;
}

// ─── Dental Chairs ───────────────────────────────────────────────────────────
export interface DentalChair {
  id: string;
  officeId: string;
  name: string;
  number: number;
  isActive: boolean;
  equipmentNotes: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Procedure Catalog ───────────────────────────────────────────────────────
export type ProcedureCategory = 
  | "preventive" 
  | "restorative" 
  | "endodontic" 
  | "periodontic" 
  | "surgical" 
  | "prosthetic" 
  | "orthodontic";

export interface DentalProcedureCatalog {
  id: string;
  code: string;
  name: string;
  category: ProcedureCategory;
  subcategory: string;
  description: string;
  defaultDuration: number; // minutes
  requiresAnesthesia: boolean;
  typicalMaterials: string[];
  typicalCostMin: number;
  typicalCostMax: number;
  adaCode?: string;
  isActive: boolean;
  createdAt: string;
}

// ─── Appointment Details ─────────────────────────────────────────────────────
export interface DentalAppointmentDetails {
  appointmentId: string;
  
  // Chair & Staff
  chairId?: string;
  hygienistId?: string;
  assistantId?: string;
  
  // Procedure Information
  procedureCode?: string;
  procedureName?: string;
  toothNumbers: number[]; // FDI notation (11-48)
  surfaces: SurfaceCode[];
  quadrant?: 1 | 2 | 3 | 4;
  
  // Clinical Details
  requiresAnesthesia: boolean;
  anesthesiaType?: string;
  requiresSedation: boolean;
  sedationType?: string;
  
  // Materials & Preparation
  materialsNeeded: string[];
  materialsPrepared: boolean;
  specialEquipment: string[];
  
  // Financial
  estimatedCost?: number;
  insuranceAuthorization?: string;
  
  // Clinical Notes
  preopNotes: string;
  postopNotes: string;
  complications: string;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

// ─── Appointment with Details ────────────────────────────────────────────────
export interface AppointmentWithDentalDetails {
  // Core appointment fields
  id: string;
  doctorId: string;
  patientId: string;
  fechaHora: string;
  duracion: number;
  motivoConsulta: string;
  status: string;
  notas: string;
  
  // Dental details (if odontology)
  chairId?: string;
  chairName?: string;
  chairNumber?: number;
  procedureCode?: string;
  procedureName?: string;
  toothNumbers?: number[];
  surfaces?: SurfaceCode[];
  requiresAnesthesia?: boolean;
  anesthesiaType?: string;
  materialsNeeded?: string[];
  materialsPrepared?: boolean;
  estimatedCost?: number;
  procedureCategory?: ProcedureCategory;
  procedureDuration?: number;
}
