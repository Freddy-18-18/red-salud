/**
 * Web PDF Service
 * 
 * PDF generation service implementation for web environment.
 * 
 * This is a stub implementation - will be fully implemented in Task 11.
 */

import type { PDFService, PDFResult } from '../types';

export class WebPDFService implements PDFService {
  /**
   * Generate a prescription PDF
   */
  async generatePrescription(): Promise<PDFResult> {
    // TODO: Implement in Task 11
    throw new Error('Prescription PDF generation not yet implemented');
  }

  /**
   * Generate a medical history PDF
   */
  async generateMedicalHistory(): Promise<PDFResult> {
    // TODO: Implement in Task 11
    throw new Error('Medical history PDF generation not yet implemented');
  }
}
