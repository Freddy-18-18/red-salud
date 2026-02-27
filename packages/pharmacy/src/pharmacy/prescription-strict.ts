import { Product, Patient } from '@red-salud/types';

/**
 * Prescription Record
 */
export interface PrescriptionRecord {
  id: string;
  
  // Invoice info
  invoice_id: string;
  invoice_number: string;
  invoice_date: Date;
  
  // Patient info
  patient_id: string;
  patient_name: string;
  patient_ci: string;
  patient_age?: number;
  
  // Doctor info
  doctor_name: string;
  doctor_registration_number: string;
  doctor_ci: string;
  
  // Prescription details
  products: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    dosage: string;
  }>;
  
  // Prescription image
  prescription_image_url?: string;
  
  // Validation
  validated: boolean;
  validated_by: string;
  validated_at?: Date;
  
  created_at: Date;
}

/**
 * Psychotropic Sale Record
 */
export interface PsychotropicSaleRecord {
  id: string;
  
  // Invoice info
  invoice_id: string;
  invoice_number: string;
  invoice_date: Date;
  
  // Patient info
  patient_id: string;
  patient_name: string;
  patient_ci: string;
  
  // Doctor info
  doctor_name: string;
  doctor_registration_number: string;
  doctor_ci: string;
  
  // Product info
  product_id: string;
  product_name: string;
  active_ingredient: string;
  quantity: number;
  
  // Prescription image
  prescription_image_url: string;
  
  // Book entry
  book_entry_number: string;
  book_page_number: number;
  
  created_at: Date;
}

/**
 * Prescription and Psychotropic Manager
 * Manages strict prescription handling and psychotropic sales
 */
export class PrescriptionPsychotropicManager {
  private static prescriptions: PrescriptionRecord[] = [];
  private static psychotropicSales: PsychotropicSaleRecord[] = [];
  private static STORAGE_KEY_PRESCRIPTIONS = 'prescription_records';
  private static STORAGE_KEY_PSYCHOTROPIC = 'psychotropic_sales';

  /**
   * Validate prescription before sale
   */
  static async validatePrescription(data: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    patientId: string;
    patientName: string;
    patientCI: string;
    patientAge?: number;
    doctorName: string;
    doctorRegistrationNumber: string;
    doctorCI: string;
    prescriptionImageUrl?: string;
  }): Promise<{
    valid: boolean;
    reason?: string;
    record?: PrescriptionRecord;
  }> {
    // Validate required fields
    if (!data.doctorName || !data.doctorRegistrationNumber || !data.doctorCI) {
      return {
        valid: false,
        reason: 'Se requiere información del médico (nombre, matrícula y CI)',
      };
    }

    if (!data.patientName || !data.patientCI) {
      return {
        valid: false,
        reason: 'Se requiere información del paciente (nombre y CI)',
      };
    }

    if (!data.prescriptionImageUrl) {
      return {
        valid: false,
        reason: 'Se requiere digitalizar la receta médica',
      };
    }

    const record: PrescriptionRecord = {
      id: crypto.randomUUID(),
      invoice_id: data.invoiceId,
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate,
      patient_id: data.patientId,
      patient_name: data.patientName,
      patient_ci: data.patientCI,
      patient_age: data.patientAge,
      doctor_name: data.doctorName,
      doctor_registration_number: data.doctorRegistrationNumber,
      doctor_ci: data.doctorCI,
      products: [],
      prescription_image_url: data.prescriptionImageUrl,
      validated: true,
      validated_by: 'system',
      validated_at: new Date(),
      created_at: new Date(),
    };

    this.prescriptions.push(record);
    await this.persistPrescriptions();

    return {
      valid: true,
      record,
    };
  }

  /**
   * Record psychotropic sale
   */
  static async recordPsychotropicSale(data: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    patientId: string;
    patientName: string;
    patientCI: string;
    doctorName: string;
    doctorRegistrationNumber: string;
    doctorCI: string;
    productId: string;
    productName: string;
    activeIngredient: string;
    quantity: number;
    prescriptionImageUrl: string;
    bookEntryNumber: string;
    bookPageNumber: number;
  }): Promise<PsychotropicSaleRecord> {
    // Validate required fields
    if (!data.doctorName || !data.doctorRegistrationNumber || !data.doctorCI) {
      throw new Error('Se requiere información del médico (nombre, matrícula y CI)');
    }

    if (!data.patientName || !data.patientCI) {
      throw new Error('Se requiere información del paciente (nombre y CI)');
    }

    if (!data.prescriptionImageUrl) {
      throw new Error('Se requiere digitalizar la receta médica');
    }

    const record: PsychotropicSaleRecord = {
      id: crypto.randomUUID(),
      invoice_id: data.invoiceId,
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate,
      patient_id: data.patientId,
      patient_name: data.patientName,
      patient_ci: data.patientCI,
      doctor_name: data.doctorName,
      doctor_registration_number: data.doctorRegistrationNumber,
      doctor_ci: data.doctorCI,
      product_id: data.productId,
      product_name: data.productName,
      active_ingredient: data.activeIngredient,
      quantity: data.quantity,
      prescription_image_url: data.prescriptionImageUrl,
      book_entry_number: data.bookEntryNumber,
      book_page_number: data.bookPageNumber,
      created_at: new Date(),
    };

    this.psychotropicSales.push(record);
    await this.persistPsychotropicSales();

    return record;
  }

  /**
   * Generate psychotropic book entry
   */
  static generatePsychotropicBookEntry(record: PsychotropicSaleRecord) {
    return {
      entry_number: record.book_entry_number,
      page_number: record.book_page_number,
      invoice_number: record.invoice_number,
      invoice_date: record.invoice_date,
      product_name: record.product_name,
      active_ingredient: record.active_ingredient,
      quantity: record.quantity,
      patient_name: record.patient_name,
      patient_ci: record.patient_ci,
      doctor_name: record.doctor_name,
      doctor_registration_number: record.doctor_registration_number,
      prescription_image_url: record.prescription_image_url,
    };
  }

  /**
   * Get psychotropic sales by date range
   */
  static getPsychotropicSalesByDateRange(startDate: Date, endDate: Date): PsychotropicSaleRecord[] {
    return this.psychotropicSales.filter(record => {
      const recordDate = new Date(record.invoice_date);
      return recordDate >= startDate && recordDate <= endDate;
    }).sort((a, b) => a.invoice_date.getTime() - b.invoice_date.getTime());
  }

  /**
   * Get prescriptions by patient
   */
  static getPrescriptionsByPatient(patientId: string): PrescriptionRecord[] {
    return this.prescriptions
      .filter(record => record.patient_id === patientId)
      .sort((a, b) => b.invoice_date.getTime() - a.invoice_date.getTime());
  }

  /**
   * Persist prescriptions
   */
  private static async persistPrescriptions(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_PRESCRIPTIONS, JSON.stringify(this.prescriptions));
    } catch (error) {
      console.error('Error persisting prescription records:', error);
    }
  }

  /**
   * Persist psychotropic sales
   */
  private static async persistPsychotropicSales(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_PSYCHOTROPIC, JSON.stringify(this.psychotropicSales));
    } catch (error) {
      console.error('Error persisting psychotropic sales:', error);
    }
  }

  /**
   * Load prescriptions
   */
  static async loadPrescriptions(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PRESCRIPTIONS);
      if (stored) {
        this.prescriptions = JSON.parse(stored).map((record: any) => ({
          ...record,
          invoice_date: new Date(record.invoice_date),
          validated_at: record.validated_at ? new Date(record.validated_at) : undefined,
          created_at: new Date(record.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading prescription records:', error);
    }
  }

  /**
   * Load psychotropic sales
   */
  static async loadPsychotropicSales(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PSYCHOTROPIC);
      if (stored) {
        this.psychotropicSales = JSON.parse(stored).map((record: any) => ({
          ...record,
          invoice_date: new Date(record.invoice_date),
          created_at: new Date(record.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading psychotropic sales:', error);
    }
  }
}
