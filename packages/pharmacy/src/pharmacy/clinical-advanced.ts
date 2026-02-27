import { Patient, Product, AdverseReaction } from '@red-salud/types';

/**
 * Pharmacovigilance Report (RAM - Reacciones Adversas a Medicamentos)
 * Standardized format for INHRR (Instituto Nacional de Higiene "Rafael Rangel")
 */
export interface PharmacovigilanceReport {
  id: string;
  report_number: string;
  
  // Patient Information
  patient_id: string;
  patient_name: string;
  patient_age?: number;
  patient_gender?: 'M' | 'F';
  patient_weight?: number;
  
  // Suspected Medication
  product_id: string;
  product_name: string;
  active_ingredient: string;
  batch_number?: string;
  expiry_date?: Date;
  dose?: string;
  route_of_administration?: string;
  
  // Reaction Details
  reaction_type: string;
  reaction_description: string;
  severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
  onset_date: Date;
  outcome: 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';
  
  // Reporter Information
  reporter_name: string;
  reporter_role: 'patient' | 'pharmacist' | 'doctor' | 'nurse' | 'other';
  reporter_profession?: string;
  reporter_contact?: string;
  
  // Additional Information
  concomitant_medications?: Array<{
    product_name: string;
    active_ingredient: string;
    batch_number?: string;
  }>;
  medical_history?: string;
  allergies?: string[];
  
  // Status
  status: 'pending' | 'investigating' | 'confirmed' | 'rejected';
  investigation_notes?: string;
  
  // INHRR Submission
  submitted_to_inhrr?: boolean;
  submitted_date?: Date;
  inhrr_reference?: string;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Electronic Clinical Record (ECE - Expediente Clínico Electrónico)
 * Simplified clinical record for pharmacy with CAF (Consultorio de Atención Farmacéutica)
 */
export interface ClinicalRecord {
  id: string;
  patient_id: string;
  
  // Vital Signs
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  heart_rate?: number;
  temperature?: number;
  weight?: number;
  height?: number;
  
  // Consultation Details
  consultation_date: Date;
  consultation_type: 'in_person' | 'teleconsultation';
  chief_complaint: string;
  symptoms: string[];
  diagnosis?: string;
  
  // Prescriptions
  prescriptions: Array<{
    product_id: string;
    product_name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
  }>;
  
  // Notes
  clinical_notes?: string;
  recommendations?: string;
  
  // Follow-up
  follow_up_date?: Date;
  follow_up_notes?: string;
  
  // Interoperability
  synced_to_pos?: boolean;
  synced_at?: Date;
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Teleconsultation Session
 */
export interface TeleconsultationSession {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  
  consultation_date: Date;
  consultation_type: 'video' | 'audio' | 'chat';
  duration_minutes?: number;
  
  chief_complaint: string;
  symptoms: string[];
  diagnosis?: string;
  
  prescriptions: Array<{
    product_id: string;
    product_name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  
  notes?: string;
  
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Pharmacovigilance Manager
 * Manages adverse reaction reporting for INHRR compliance
 */
export class PharmacovigilanceManager {
  private static reports: PharmacovigilanceReport[] = [];
  private static STORAGE_KEY = 'pharmacovigilance_reports';

  /**
   * Create a new adverse reaction report
   */
  static async createReport(data: {
    patientId: string;
    patientName: string;
    patientAge?: number;
    patientGender?: 'M' | 'F';
    patientWeight?: number;
    productId: string;
    productName: string;
    activeIngredient: string;
    batchNumber?: string;
    expiryDate?: Date;
    dose?: string;
    routeOfAdministration?: string;
    reactionType: string;
    reactionDescription: string;
    severity: 'mild' | 'moderate' | 'severe' | 'life_threatening';
    onsetDate: Date;
    outcome: 'recovered' | 'recovering' | 'not_recovered' | 'fatal' | 'unknown';
    reporterName: string;
    reporterRole: 'patient' | 'pharmacist' | 'doctor' | 'nurse' | 'other';
    reporterProfession?: string;
    reporterContact?: string;
    concomitantMedications?: Array<{
      product_name: string;
      active_ingredient: string;
      batch_number?: string;
    }>;
    medicalHistory?: string;
    allergies?: string[];
  }): Promise<PharmacovigilanceReport> {
    const reportNumber = `RAM-${Date.now().toString().slice(-8)}`;

    const report: PharmacovigilanceReport = {
      id: crypto.randomUUID(),
      report_number: reportNumber,
      patient_id: data.patientId,
      patient_name: data.patientName,
      patient_age: data.patientAge,
      patient_gender: data.patientGender,
      patient_weight: data.patientWeight,
      product_id: data.productId,
      product_name: data.productName,
      active_ingredient: data.activeIngredient,
      batch_number: data.batchNumber,
      expiry_date: data.expiryDate,
      dose: data.dose,
      route_of_administration: data.routeOfAdministration,
      reaction_type: data.reactionType,
      reaction_description: data.reactionDescription,
      severity: data.severity,
      onset_date: data.onsetDate,
      outcome: data.outcome,
      reporter_name: data.reporterName,
      reporter_role: data.reporterRole,
      reporter_profession: data.reporterProfession,
      reporter_contact: data.reporterContact,
      concomitant_medications: data.concomitantMedications,
      medical_history: data.medicalHistory,
      allergies: data.allergies,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.reports.push(report);
    await this.persistReports();

    return report;
  }

  /**
   * Generate INHRR standardized report
   */
  static generateINHRRReport(reportId: string): {
    report_number: string;
    patient_info: any;
    suspected_medication: any;
    reaction_details: any;
    reporter_info: any;
    generated_at: Date;
  } | null {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return null;

    return {
      report_number: report.report_number,
      patient_info: {
        id: report.patient_id,
        name: report.patient_name,
        age: report.patient_age,
        gender: report.patient_gender,
        weight: report.patient_weight,
      },
      suspected_medication: {
        product_name: report.product_name,
        active_ingredient: report.active_ingredient,
        batch_number: report.batch_number,
        expiry_date: report.expiry_date,
        dose: report.dose,
        route_of_administration: report.route_of_administration,
      },
      reaction_details: {
        type: report.reaction_type,
        description: report.reaction_description,
        severity: report.severity,
        onset_date: report.onset_date,
        outcome: report.outcome,
      },
      reporter_info: {
        name: report.reporter_name,
        role: report.reporter_role,
        profession: report.reporter_profession,
        contact: report.reporter_contact,
      },
      generated_at: new Date(),
    };
  }

  /**
   * Mark report as submitted to INHRR
   */
  static async markSubmittedToINHRR(
    reportId: string,
    inhrrReference: string
  ): Promise<void> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    report.submitted_to_inhrr = true;
    report.submitted_date = new Date();
    report.inhrr_reference = inhrrReference;
    report.updated_at = new Date();

    await this.persistReports();
  }

  /**
   * Update report status
   */
  static async updateStatus(
    reportId: string,
    status: 'pending' | 'investigating' | 'confirmed' | 'rejected',
    investigationNotes?: string
  ): Promise<void> {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    report.status = status;
    report.investigation_notes = investigationNotes;
    report.updated_at = new Date();

    await this.persistReports();
  }

  /**
   * Get reports by patient
   */
  static getReportsByPatient(patientId: string): PharmacovigilanceReport[] {
    return this.reports.filter(r => r.patient_id === patientId);
  }

  /**
   * Get reports by product
   */
  static getReportsByProduct(productId: string): PharmacovigilanceReport[] {
    return this.reports.filter(r => r.product_id === productId);
  }

  /**
   * Get all reports
   */
  static getAllReports(): PharmacovigilanceReport[] {
    return [...this.reports];
  }

  /**
   * Get report statistics
   */
  static getStatistics(): {
    total_reports: number;
    by_severity: Record<string, number>;
    by_status: Record<string, number>;
    submitted_to_inhrr: number;
  } {
    const bySeverity: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    this.reports.forEach(report => {
      bySeverity[report.severity] = (bySeverity[report.severity] || 0) + 1;
      byStatus[report.status] = (byStatus[report.status] || 0) + 1;
    });

    return {
      total_reports: this.reports.length,
      by_severity: bySeverity,
      by_status: byStatus,
      submitted_to_inhrr: this.reports.filter(r => r.submitted_to_inhrr).length,
    };
  }

  /**
   * Persist reports
   */
  private static async persistReports(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.reports));
    } catch (error) {
      console.error('Error persisting pharmacovigilance reports:', error);
    }
  }

  /**
   * Load reports
   */
  static async loadReports(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.reports = JSON.parse(stored).map((report: any) => ({
          ...report,
          onset_date: new Date(report.onset_date),
          expiry_date: report.expiry_date ? new Date(report.expiry_date) : undefined,
          submitted_date: report.submitted_date ? new Date(report.submitted_date) : undefined,
          created_at: new Date(report.created_at),
          updated_at: new Date(report.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading pharmacovigilance reports:', error);
    }
  }
}

/**
 * Clinical Records Manager
 * Manages electronic clinical records with POS interoperability
 */
export class ClinicalRecordsManager {
  private static records: ClinicalRecord[] = [];
  private static STORAGE_KEY = 'clinical_records';

  /**
   * Create clinical record
   */
  static async createRecord(data: {
    patientId: string;
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    consultationDate: Date;
    consultationType: 'in_person' | 'teleconsultation';
    chiefComplaint: string;
    symptoms: string[];
    diagnosis?: string;
    prescriptions: Array<{
      product_id: string;
      product_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
    clinicalNotes?: string;
    recommendations?: string;
    followUpDate?: Date;
    followUpNotes?: string;
    createdBy: string;
  }): Promise<ClinicalRecord> {
    const record: ClinicalRecord = {
      id: crypto.randomUUID(),
      patient_id: data.patientId,
      blood_pressure_systolic: data.bloodPressureSystolic,
      blood_pressure_diastolic: data.bloodPressureDiastolic,
      heart_rate: data.heartRate,
      temperature: data.temperature,
      weight: data.weight,
      height: data.height,
      consultation_date: data.consultationDate,
      consultation_type: data.consultationType,
      chief_complaint: data.chiefComplaint,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      prescriptions: data.prescriptions,
      clinical_notes: data.clinicalNotes,
      recommendations: data.recommendations,
      follow_up_date: data.followUpDate,
      follow_up_notes: data.followUpNotes,
      synced_to_pos: false,
      created_by: data.createdBy,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.records.push(record);
    await this.persistRecords();

    return record;
  }

  /**
   * Sync prescriptions to POS
   */
  static async syncToPOS(recordId: string): Promise<void> {
    const record = this.records.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');

    record.synced_to_pos = true;
    record.synced_at = new Date();
    record.updated_at = new Date();

    await this.persistRecords();
  }

  /**
   * Get records by patient
   */
  static getRecordsByPatient(patientId: string): ClinicalRecord[] {
    return this.records
      .filter(r => r.patient_id === patientId)
      .sort((a, b) => b.consultation_date.getTime() - a.consultation_date.getTime());
  }

  /**
   * Get unsynced prescriptions
   */
  static getUnsyncedPrescriptions(): Array<{
    record_id: string;
    patient_id: string;
    patient_name: string;
    prescriptions: Array<{
      product_id: string;
      product_name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
  }> {
    return this.records
      .filter(r => !r.synced_to_pos && r.prescriptions.length > 0)
      .map(r => ({
        record_id: r.id,
        patient_id: r.patient_id,
        patient_name: '', // Would need to fetch from patient data
        prescriptions: r.prescriptions,
      }));
  }

  /**
   * Persist records
   */
  private static async persistRecords(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.records));
    } catch (error) {
      console.error('Error persisting clinical records:', error);
    }
  }

  /**
   * Load records
   */
  static async loadRecords(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.records = JSON.parse(stored).map((record: any) => ({
          ...record,
          consultation_date: new Date(record.consultation_date),
          follow_up_date: record.follow_up_date ? new Date(record.follow_up_date) : undefined,
          synced_at: record.synced_at ? new Date(record.synced_at) : undefined,
          created_at: new Date(record.created_at),
          updated_at: new Date(record.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading clinical records:', error);
    }
  }
}

/**
 * Teleconsultation Manager
 * Manages remote consultations with prescription sending
 */
export class TeleconsultationManager {
  private static sessions: TeleconsultationSession[] = [];
  private static STORAGE_KEY = 'teleconsultation_sessions';

  /**
   * Create teleconsultation session
   */
  static async createSession(data: {
    patientId: string;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    consultationDate: Date;
    consultationType: 'video' | 'audio' | 'chat';
    chiefComplaint: string;
    symptoms: string[];
    diagnosis?: string;
    prescriptions: Array<{
      product_id: string;
      product_name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
    notes?: string;
    createdBy: string;
  }): Promise<TeleconsultationSession> {
    const session: TeleconsultationSession = {
      id: crypto.randomUUID(),
      patient_id: data.patientId,
      patient_name: data.patientName,
      patient_phone: data.patientPhone,
      patient_email: data.patientEmail,
      consultation_date: data.consultationDate,
      consultation_type: data.consultationType,
      chief_complaint: data.chiefComplaint,
      symptoms: data.symptoms,
      diagnosis: data.diagnosis,
      prescriptions: data.prescriptions,
      notes: data.notes,
      status: 'scheduled',
      created_by: data.createdBy,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.sessions.push(session);
    await this.persistSessions();

    return session;
  }

  /**
   * Complete session
   */
  static async completeSession(sessionId: string, durationMinutes?: number): Promise<void> {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) throw new Error('Session not found');

    session.status = 'completed';
    session.duration_minutes = durationMinutes;
    session.updated_at = new Date();

    await this.persistSessions();
  }

  /**
   * Generate WhatsApp message with prescription
   */
  static generateWhatsAppMessage(sessionId: string): string | null {
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session || session.status !== 'completed') return null;

    let message = `📋 *Prescripción Digital*\n\n`;
    message += `👤 Paciente: ${session.patient_name}\n`;
    message += `📅 Fecha: ${session.consultation_date.toLocaleDateString('es-VE')}\n\n`;
    message += `💊 *Medicamentos:*\n\n`;

    session.prescriptions.forEach((prescription, index) => {
      message += `${index + 1}. ${prescription.product_name}\n`;
      message += `   Dosis: ${prescription.dosage}\n`;
      message += `   Frecuencia: ${prescription.frequency}\n`;
      message += `   Duración: ${prescription.duration}\n\n`;
    });

    message += `⚠️ Esta prescripción es válida solo por el tiempo especificado.\n`;
    message += `🏥 Farmacia Red Salud\n`;

    return message;
  }

  /**
   * Get sessions by patient
   */
  static getSessionsByPatient(patientId: string): TeleconsultationSession[] {
    return this.sessions
      .filter(s => s.patient_id === patientId)
      .sort((a, b) => b.consultation_date.getTime() - a.consultation_date.getTime());
  }

  /**
   * Persist sessions
   */
  private static async persistSessions(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.sessions));
    } catch (error) {
      console.error('Error persisting teleconsultation sessions:', error);
    }
  }

  /**
   * Load sessions
   */
  static async loadSessions(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored).map((session: any) => ({
          ...session,
          consultation_date: new Date(session.consultation_date),
          created_at: new Date(session.created_at),
          updated_at: new Date(session.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading teleconsultation sessions:', error);
    }
  }
}
