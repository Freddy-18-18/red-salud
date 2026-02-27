import { v4 as uuidv4 } from 'uuid';
import {
  EPrescription,
  DigitalSignature,
  PrescriptionValidation,
  PrescriptionStatus,
  DigitalSignatureAlgorithm,
  UserRole,
} from '@red-salud/types';

export interface PrescriptionData {
  prescription_number: string;
  patient_id: string;
  patient_name: string;
  patient_ci: string;
  prescriber_id: string;
  prescriber_name: string;
  prescriber_license: string;
  prescription_date: Date;
  expiry_date: Date;
  medications: EPrescription['medications'];
  signature_data?: string;
  signature_algorithm?: DigitalSignatureAlgorithm;
  notes?: string;
  created_by: string;
  warehouse_id: string;
}

export interface ValidationResult {
  success: boolean;
  validation?: PrescriptionValidation;
  error?: string;
}

export interface DispenseResult {
  success: boolean;
  prescription?: EPrescription;
  error?: string;
}

export class EPrescriptionManager {
  private prescriptions: EPrescription[] = [];
  private signatures: DigitalSignature[] = [];
  private validations: PrescriptionValidation[] = [];

  constructor() {
    this.loadPrescriptions();
    this.loadSignatures();
    this.loadValidations();
  }

  async loadPrescriptions(): Promise<void> {
    const stored = localStorage.getItem('e_prescriptions');
    if (stored) {
      this.prescriptions = JSON.parse(stored) as EPrescription[];
    }
  }

  async savePrescriptions(): Promise<void> {
    localStorage.setItem('e_prescriptions', JSON.stringify(this.prescriptions));
  }

  async loadSignatures(): Promise<void> {
    const stored = localStorage.getItem('digital_signatures');
    if (stored) {
      this.signatures = JSON.parse(stored) as DigitalSignature[];
    }
  }

  async saveSignatures(): Promise<void> {
    localStorage.setItem('digital_signatures', JSON.stringify(this.signatures));
  }

  async loadValidations(): Promise<void> {
    const stored = localStorage.getItem('prescription_validations');
    if (stored) {
      this.validations = JSON.parse(stored) as PrescriptionValidation[];
    }
  }

  async saveValidations(): Promise<void> {
    localStorage.setItem('prescription_validations', JSON.stringify(this.validations));
  }

  async createPrescription(data: PrescriptionData): Promise<EPrescription> {
    const prescription: EPrescription = {
      id: uuidv4(),
      prescription_number: data.prescription_number,
      patient_id: data.patient_id,
      patient_name: data.patient_name,
      patient_ci: data.patient_ci,
      prescriber_id: data.prescriber_id,
      prescriber_name: data.prescriber_name,
      prescriber_license: data.prescriber_license,
      prescription_date: data.prescription_date,
      expiry_date: data.expiry_date,
      medications: data.medications,
      status: PrescriptionStatus.VALID,
      signature_data: data.signature_data,
      signature_algorithm: data.signature_algorithm,
      signed_at: data.signature_data ? new Date() : undefined,
      notes: data.notes,
      created_by: data.created_by,
      warehouse_id: data.warehouse_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.prescriptions.push(prescription);
    await this.savePrescriptions();

    return prescription;
  }

  async validatePrescription(
    prescriptionId: string,
    validatorId: string,
    validatorName: string,
  ): Promise<ValidationResult> {
    const prescription = this.prescriptions.find((p) => p.id === prescriptionId);

    if (!prescription) {
      return {
        success: false,
        error: 'Prescription not found',
      };
    }

    const now = new Date();
    const checks = {
      signature_valid: false,
      not_expired: false,
      not_dispensed: false,
      prescriber_authorized: false,
      patient_exists: false,
    };

    let isValid = true;
    let message = '';

    // Check if expired
    if (prescription.expiry_date < now) {
      checks.not_expired = false;
      isValid = false;
      message = 'Prescription has expired';
    } else {
      checks.not_expired = true;
    }

    // Check if already dispensed
    if (prescription.status === PrescriptionStatus.DISPENSED) {
      checks.not_dispensed = false;
      isValid = false;
      message = message || 'Prescription has already been dispensed';
    } else {
      checks.not_dispensed = true;
    }

    // Check signature
    if (prescription.signature_data) {
      checks.signature_valid = true;
    } else {
      checks.signature_valid = false;
      isValid = false;
      message = message || 'Prescription lacks digital signature';
    }

    // Simulate prescriber authorization check
    checks.prescriber_authorized = true;

    // Simulate patient existence check
    checks.patient_exists = true;

    // SENIAT validation (simulated)
    const seniatValid = Math.random() > 0.1; // 90% success rate

    const validation: PrescriptionValidation = {
      id: uuidv4(),
      prescription_id: prescriptionId,
      is_valid: isValid,
      validation_date: now,
      validation_message: message || 'Prescription is valid',
      checks,
      seniat_valid: seniatValid,
      seniat_response: seniatValid ? 'Valid' : 'Invalid',
      validated_by: validatorId,
      validated_by_name: validatorName,
      created_at: now,
    };

    // Update prescription status
    if (isValid) {
      prescription.status = PrescriptionStatus.VALID;
      prescription.validated_at = now;
      prescription.validated_by = validatorId;
      prescription.validation_message = validation.validation_message;
    } else {
      prescription.status = PrescriptionStatus.INVALID;
      prescription.validated_at = now;
      prescription.validated_by = validatorId;
      prescription.validation_message = validation.validation_message;
    }

    prescription.updated_at = now;

    this.validations.push(validation);
    await this.saveValidations();
    await this.savePrescriptions();

    return {
      success: isValid,
      validation,
    };
  }

  async dispensePrescription(
    prescriptionId: string,
    dispenserId: string,
    warehouseId: string,
  ): Promise<DispenseResult> {
    const prescription = this.prescriptions.find((p) => p.id === prescriptionId);

    if (!prescription) {
      return {
        success: false,
        error: 'Prescription not found',
      };
    }

    if (prescription.status !== PrescriptionStatus.VALID) {
      return {
        success: false,
        error: `Prescription status is ${prescription.status}, cannot dispense`,
      };
    }

    if (prescription.expiry_date < new Date()) {
      prescription.status = PrescriptionStatus.EXPIRED;
      await this.savePrescriptions();
      return {
        success: false,
        error: 'Prescription has expired',
      };
    }

    // Check stock for each medication (simulated)
    for (const medication of prescription.medications) {
      const hasStock = Math.random() > 0.2; // 80% chance of having stock
      if (!hasStock) {
        return {
          success: false,
          error: `Insufficient stock for ${medication.product_name}`,
        };
      }
    }

    // Dispense the prescription
    prescription.status = PrescriptionStatus.DISPENSED;
    prescription.dispensed_at = new Date();
    prescription.dispensed_by = dispenserId;
    prescription.dispensed_warehouse_id = warehouseId;
    prescription.updated_at = new Date();

    await this.savePrescriptions();

    return {
      success: true,
      prescription,
    };
  }

  async cancelPrescription(
    prescriptionId: string,
    cancelledBy: string,
    reason: string,
  ): Promise<EPrescription | null> {
    const prescription = this.prescriptions.find((p) => p.id === prescriptionId);

    if (!prescription) return null;

    if (prescription.status === PrescriptionStatus.DISPENSED) {
      return null; // Cannot cancel dispensed prescriptions
    }

    prescription.status = PrescriptionStatus.CANCELLED;
    prescription.notes = `${prescription.notes || ''}\nCancelled: ${reason}`;
    prescription.updated_at = new Date();

    await this.savePrescriptions();

    return prescription;
  }

  async syncWithSENAT(prescriptionId: string): Promise<{ success: boolean; error?: string }> {
    const prescription = this.prescriptions.find((p) => p.id === prescriptionId);

    if (!prescription) {
      return { success: false, error: 'Prescription not found' };
    }

    try {
      // Simulate SENIAT API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const seniatId = `SEN-${Date.now()}`;
      prescription.seniat_prescription_id = seniatId;
      prescription.seniat_synced_at = new Date();
      prescription.updated_at = new Date();

      await this.savePrescriptions();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SENIAT sync failed',
      };
    }
  }

  async verifySignature(signatureId: string): Promise<{ success: boolean; error?: string }> {
    const signature = this.signatures.find((s) => s.id === signatureId);

    if (!signature) {
      return { success: false, error: 'Signature not found' };
    }

    try {
      // Simulate signature verification
      await new Promise((resolve) => setTimeout(resolve, 500));

      signature.verified = true;
      signature.verified_at = new Date();
      signature.verification_result = 'Signature is valid';

      await this.saveSignatures();

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  getPrescription(prescriptionId: string): EPrescription | undefined {
    return this.prescriptions.find((p) => p.id === prescriptionId);
  }

  getPrescriptionsByPatient(patientId: string): EPrescription[] {
    return this.prescriptions
      .filter((p) => p.patient_id === patientId)
      .sort((a, b) => b.prescription_date.getTime() - a.prescription_date.getTime());
  }

  getPrescriptionsByPrescriber(prescriberId: string): EPrescription[] {
    return this.prescriptions
      .filter((p) => p.prescriber_id === prescriberId)
      .sort((a, b) => b.prescription_date.getTime() - a.prescription_date.getTime());
  }

  getPrescriptionsByStatus(status: PrescriptionStatus): EPrescription[] {
    return this.prescriptions
      .filter((p) => p.status === status)
      .sort((a, b) => b.prescription_date.getTime() - a.prescription_date.getTime());
  }

  getExpiringPrescriptions(days: number = 7): EPrescription[] {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);

    return this.prescriptions
      .filter(
        (p) =>
          p.status === PrescriptionStatus.VALID &&
          p.expiry_date <= cutoffDate &&
          p.expiry_date > new Date(),
      )
      .sort((a, b) => a.expiry_date.getTime() - b.expiry_date.getTime());
  }

  getValidations(prescriptionId?: string): PrescriptionValidation[] {
    let validations = [...this.validations];

    if (prescriptionId) {
      validations = validations.filter((v) => v.prescription_id === prescriptionId);
    }

    return validations.sort((a, b) => b.validation_date.getTime() - a.validation_date.getTime());
  }

  getPrescriptionStats() {
    const total = this.prescriptions.length;
    const valid = this.prescriptions.filter((p) => p.status === PrescriptionStatus.VALID).length;
    const expired = this.prescriptions.filter((p) => p.status === PrescriptionStatus.EXPIRED).length;
    const dispensed = this.prescriptions.filter((p) => p.status === PrescriptionStatus.DISPENSED).length;
    const cancelled = this.prescriptions.filter((p) => p.status === PrescriptionStatus.CANCELLED).length;
    const invalid = this.prescriptions.filter((p) => p.status === PrescriptionStatus.INVALID).length;

    const expiringSoon = this.getExpiringPrescriptions(7).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dispensedToday = this.prescriptions.filter(
      (p) => p.dispensed_at && p.dispensed_at >= today,
    ).length;

    return {
      total,
      valid,
      expired,
      dispensed,
      cancelled,
      invalid,
      expiringSoon,
      dispensedToday,
    };
  }

  async checkDuplicatePrescription(prescriptionNumber: string): Promise<boolean> {
    return this.prescriptions.some((p) => p.prescription_number === prescriptionNumber);
  }

  async generatePrescriptionReport(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    prescriptions: EPrescription[];
    stats: any;
    byStatus: Record<string, number>;
  }> {
    const prescriptions = this.prescriptions.filter(
      (p) => p.prescription_date >= startDate && p.prescription_date <= endDate,
    );

    const byStatus = prescriptions.reduce(
      (acc, p) => {
        acc[p.status] = (acc[p.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      prescriptions,
      stats: this.getPrescriptionStats(),
      byStatus,
    };
  }
}
