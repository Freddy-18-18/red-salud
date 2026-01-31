/**
 * Runtime Detection and Service Abstraction Layer Types
 * 
 * This module defines the TypeScript interfaces for all service abstractions
 * that allow the same code to work in both Tauri (desktop) and web environments.
 */

// ============================================================================
// Core Runtime Types
// ============================================================================

export type RuntimeEnvironment = 'tauri' | 'web';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

// ============================================================================
// Storage Service Interface
// ============================================================================

export interface StorageService {
  /**
   * Retrieve data from storage by key
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Save data to storage
   */
  save<T>(key: string, data: T): Promise<void>;

  /**
   * Delete data from storage by key
   */
  delete(key: string): Promise<void>;

  /**
   * Clear all data from storage
   */
  clear(): Promise<void>;

  /**
   * Get all storage keys
   */
  keys(): Promise<string[]>;
}

// ============================================================================
// Network Service Interface
// ============================================================================

export interface NetworkService {
  /**
   * Perform a GET request
   */
  get<T>(url: string, options?: RequestOptions): Promise<T>;

  /**
   * Perform a POST request
   */
  post<T>(url: string, body: any, options?: RequestOptions): Promise<T>;

  /**
   * Perform a PATCH request
   */
  patch<T>(url: string, body: any, options?: RequestOptions): Promise<T>;

  /**
   * Perform a DELETE request
   */
  delete<T>(url: string, options?: RequestOptions): Promise<T>;

  /**
   * Check network connectivity
   */
  checkConnectivity(): Promise<boolean>;
}

// ============================================================================
// PDF Service Interface
// ============================================================================

export interface PDFService {
  /**
   * Generate a prescription PDF
   */
  generatePrescription(data: PrescriptionData): Promise<PDFResult>;

  /**
   * Generate a medical history PDF
   */
  generateMedicalHistory(data: MedicalHistoryData): Promise<PDFResult>;
}

export interface PrescriptionData {
  patient: PatientInfo;
  doctor: DoctorInfo;
  medications: Medication[];
  date: Date;
  clinicLogo?: string;
}

export interface MedicalHistoryData {
  patient: PatientInfo;
  consultations: Consultation[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
}

export interface PatientInfo {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  email?: string;
}

export interface DoctorInfo {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  licenseNumber: string;
  digitalSignature?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Consultation {
  id: string;
  date: Date;
  chiefComplaint: string;
  symptoms: string[];
  physicalExam?: string;
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  labOrders: LabOrder[];
  notes?: string;
}

export interface Diagnosis {
  id: string;
  icd11Code: string;
  description: string;
  type: 'primary' | 'secondary';
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface LabOrder {
  id: string;
  testName: string;
  labName?: string;
  orderDate: Date;
  status: 'ordered' | 'completed' | 'cancelled';
  results?: string;
  resultDate?: Date;
}

export interface PDFResult {
  success: boolean;
  filePath?: string;
  error?: Error;
}

// ============================================================================
// Notification Service Interface
// ============================================================================

export interface NotificationService {
  /**
   * Show a notification
   */
  show(notification: NotificationData): Promise<void>;

  /**
   * Schedule a notification for later
   */
  schedule(notification: NotificationData, delay: number): Promise<string>;

  /**
   * Cancel a scheduled notification
   */
  cancel(notificationId: string): Promise<void>;

  /**
   * Request notification permission
   */
  requestPermission(): Promise<boolean>;
}

export interface NotificationData {
  title: string;
  body: string;
  icon?: string;
  action?: NotificationAction;
}

export interface NotificationAction {
  type: 'navigate' | 'open_url';
  target: string;
}

// ============================================================================
// Sync Service Interface
// ============================================================================

export interface SyncService {
  /**
   * Start automatic synchronization (every 5 minutes)
   */
  start(): void;

  /**
   * Stop automatic synchronization
   */
  stop(): void;

  /**
   * Trigger immediate synchronization
   */
  syncNow(): Promise<SyncResult>;

  /**
   * Queue a change for later synchronization
   */
  queueChange(change: PendingChange): Promise<void>;

  /**
   * Get all pending changes
   */
  getPendingChanges(): Promise<PendingChange[]>;

  /**
   * Check if sync is currently in progress
   */
  isSyncing(): boolean;

  /**
   * Get sync metadata (last sync time, etc.)
   */
  getSyncMetadata(): Promise<SyncMetadata>;
}

export interface PendingChange {
  id: string;
  type: 'create' | 'update' | 'delete';
  entity: 'patient' | 'appointment' | 'consultation' | 'message' | 'settings';
  data: any;
  timestamp: number;
  retries: number;
}

export interface SyncResult {
  success: boolean;
  uploaded: number;
  downloaded: number;
  conflicts: number;
  errors: SyncError[];
}

export interface SyncError {
  id: string;
  changeId: string;
  error: string;
  timestamp: Date;
  retries: number;
}

export interface SyncMetadata {
  lastSyncTime: Date | null;
  lastSuccessfulSync: Date | null;
  pendingChanges: number;
  conflicts: number;
  errors: SyncError[];
}

// ============================================================================
// Runtime Service Interface
// ============================================================================

export interface RuntimeService {
  /**
   * Check if running in Tauri environment
   */
  isTauri(): boolean;

  /**
   * Check if running in web environment
   */
  isWeb(): boolean;

  /**
   * Get the current runtime environment
   */
  getEnvironment(): RuntimeEnvironment;

  /**
   * Get the storage service for the current runtime
   */
  getStorageService(): StorageService;

  /**
   * Get the network service for the current runtime
   */
  getNetworkService(): NetworkService;

  /**
   * Get the PDF service for the current runtime
   */
  getPDFService(): PDFService;

  /**
   * Get the notification service for the current runtime
   */
  getNotificationService(): NotificationService;
}
