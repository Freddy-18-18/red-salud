import type { Consultation } from '@red-salud/types';

export class ConsultationManager {
  /**
   * Create a consultation record
   */
  static createConsultation(
    patientId: string,
    consultationType: 'general' | 'specialist' | 'follow_up',
    reason: string,
    consultedBy: string,
    warehouseId: string
  ): Omit<Consultation, 'id' | 'created_at' | 'updated_at'> {
    return {
      patient_id: patientId,
      consultation_type: consultationType,
      reason,
      symptoms: [],
      consulted_by: consultedBy,
      warehouse_id: warehouseId,
      prescribed_medications: [],
    };
  }

  /**
   * Add vital signs to consultation
   */
  static addVitalSigns(
    consultation: Consultation,
    vitalSigns: {
      blood_pressure_systolic?: number;
      blood_pressure_diastolic?: number;
      heart_rate?: number;
      temperature?: number;
      weight?: number;
      height?: number;
    }
  ): Consultation {
    return {
      ...consultation,
      ...vitalSigns,
      updated_at: new Date(),
    };
  }

  /**
   * Add diagnosis and treatment
   */
  static addDiagnosisAndTreatment(
    consultation: Consultation,
    diagnosis: string,
    treatment: string
  ): Consultation {
    return {
      ...consultation,
      diagnosis,
      treatment,
      updated_at: new Date(),
    };
  }

  /**
   * Add prescribed medication
   */
  static addPrescribedMedication(
    consultation: Consultation,
    medication: {
      product_id: string;
      product_name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }
  ): Consultation {
    return {
      ...consultation,
      prescribed_medications: [...consultation.prescribed_medications, medication],
      updated_at: new Date(),
    };
  }

  /**
   * Set follow-up appointment
   */
  static setFollowUp(
    consultation: Consultation,
    followUpDate: Date,
    followUpNotes?: string
  ): Consultation {
    return {
      ...consultation,
      follow_up_date: followUpDate,
      follow_up_notes: followUpNotes,
      updated_at: new Date(),
    };
  }

  /**
   * Set consultation fee
   */
  static setConsultationFee(
    consultation: Consultation,
    feeUsd: number,
    feeVes: number
  ): Consultation {
    return {
      ...consultation,
      fee_usd: feeUsd,
      fee_ves: feeVes,
      updated_at: new Date(),
    };
  }

  /**
   * Get consultations by patient
   */
  static getConsultationsByPatient(
    consultations: Consultation[],
    patientId: string
  ): Consultation[] {
    return consultations.filter(c => c.patient_id === patientId);
  }

  /**
   * Get consultations by date range
   */
  static getConsultationsByDateRange(
    consultations: Consultation[],
    startDate: Date,
    endDate: Date
  ): Consultation[] {
    return consultations.filter(
      c => c.created_at >= startDate && c.created_at <= endDate
    );
  }

  /**
   * Get upcoming follow-ups
   */
  static getUpcomingFollowUps(
    consultations: Consultation[],
    daysAhead: number = 7
  ): Consultation[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return consultations.filter(
      c =>
        c.follow_up_date &&
        c.follow_up_date >= now &&
        c.follow_up_date <= futureDate
    );
  }

  /**
   * Get overdue follow-ups
   */
  static getOverdueFollowUps(consultations: Consultation[]): Consultation[] {
    const now = new Date();
    return consultations.filter(
      c => c.follow_up_date && c.follow_up_date < now
    );
  }

  /**
   * Calculate consultation statistics
   */
  static calculateStatistics(consultations: Consultation[]): {
    total: number;
    byType: Record<string, number>;
    averageFeeUsd: number;
    averageFeeVes: number;
  } {
    const byType: Record<string, number> = {};
    let totalFeeUsd = 0;
    let totalFeeVes = 0;
    let feeCount = 0;

    for (const consultation of consultations) {
      // Count by type
      byType[consultation.consultation_type] = (byType[consultation.consultation_type] || 0) + 1;

      // Sum fees
      if (consultation.fee_usd !== undefined) {
        totalFeeUsd += consultation.fee_usd;
        feeCount++;
      }
      if (consultation.fee_ves !== undefined) {
        totalFeeVes += consultation.fee_ves;
      }
    }

    return {
      total: consultations.length,
      byType,
      averageFeeUsd: feeCount > 0 ? totalFeeUsd / feeCount : 0,
      averageFeeVes: feeCount > 0 ? totalFeeVes / feeCount : 0,
    };
  }

  /**
   * Search consultations
   */
  static searchConsultations(
    consultations: Consultation[],
    query: string
  ): Consultation[] {
    const lowerQuery = query.toLowerCase();
    return consultations.filter(
      c =>
        c.reason.toLowerCase().includes(lowerQuery) ||
        (c.diagnosis && c.diagnosis.toLowerCase().includes(lowerQuery)) ||
        (c.treatment && c.treatment.toLowerCase().includes(lowerQuery))
    );
  }
}
