/**
 * Tauri PDF Service
 * 
 * PDF generation service implementation for Tauri (desktop) environment.
 * 
 * This is a stub implementation - will be fully implemented in Task 11.
 */

import type { PDFService, PrescriptionData, MedicalHistoryData, PDFResult } from '../types';

export class TauriPDFService implements PDFService {
  /**
   * Generate a prescription PDF
   */
  async generatePrescription(_data: PrescriptionData): Promise<PDFResult> {
    // TODO: Implement in Task 11
    throw new Error('Prescription PDF generation not yet implemented');
  }

  /**
   * Generate a medical history PDF
   */
  async generateMedicalHistory(_data: MedicalHistoryData): Promise<PDFResult> {
    // TODO: Implement in Task 11
    throw new Error('Medical history PDF generation not yet implemented');
  }
}
