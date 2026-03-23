/**
 * Runtime Detection and Service Abstraction Layer
 * 
 * This module provides a unified interface for accessing platform-specific
 * services (storage, network, PDF, notifications) that work seamlessly
 * in both Tauri (desktop) and web environments.
 * 
 * Usage:
 * ```typescript
 * import { RuntimeService } from '@/lib/runtime';
 * 
 * // Check environment
 * if (RuntimeService.isTauri()) {
 *   console.log('Running in desktop mode');
 * }
 * 
 * // Get services
 * const storage = RuntimeService.getStorageService();
 * const network = RuntimeService.getNetworkService();
 * const pdf = RuntimeService.getPDFService();
 * const notifications = RuntimeService.getNotificationService();
 * 
 * // Use services (same API regardless of environment)
 * await storage.save('key', data);
 * const result = await network.get('/api/endpoint');
 * await pdf.generatePrescription(prescriptionData);
 * await notifications.show({ title: 'Hello', body: 'World' });
 * ```
 */

// Export the singleton RuntimeService instance
export { RuntimeService } from './runtime-service';

// Export storage keys for data organization
export * from './storage-keys';

// Export types for consumers
export type {
  RuntimeEnvironment,
  RuntimeService as IRuntimeService,
  StorageService,
  NetworkService,
  PDFService,
  NotificationService,
  RequestOptions,
  PrescriptionData,
  MedicalHistoryData,
  PatientInfo,
  DoctorInfo,
  Medication,
  Consultation,
  Diagnosis,
  Prescription,
  LabOrder,
  PDFResult,
  NotificationData,
  NotificationAction,
} from './types';

// Export service implementations for testing
export { TauriStorageService } from './services/tauri-storage-service';
export { WebStorageService } from './services/web-storage-service';
export { TauriNetworkService } from './services/tauri-network-service';
export { WebNetworkService } from './services/web-network-service';
export { TauriPDFService } from './services/tauri-pdf-service';
export { WebPDFService } from './services/web-pdf-service';
export { TauriNotificationService } from './services/tauri-notification-service';
export { WebNotificationService } from './services/web-notification-service';
