/**
 * Storage Keys for Data Organization
 * 
 * This module defines the standardized keys used for organizing data
 * in the offline storage system. These keys ensure consistent data
 * access patterns across both Tauri and Web storage implementations.
 * 
 * Key Format Conventions:
 * - Entity collections: `{entity}:all` (e.g., "patients:all")
 * - Individual entities: `{entity}:{id}` (e.g., "patients:123")
 * - Date-based data: `{entity}:{date}` (e.g., "appointments:2024-01-15")
 * - User-specific data: `{entity}:{userId}:{id}` (e.g., "consultations:user123:456")
 * - System data: `sync:{type}` (e.g., "sync:queue", "sync:metadata")
 * 
 * Validates: Requirements 2.4, 7.5
 */

// ============================================================================
// Patient Data Keys
// ============================================================================

/**
 * Get key for all patients list
 */
export const PATIENTS_ALL = 'patients:all';

/**
 * Get key for a specific patient
 */
export const patientKey = (id: string) => `patients:${id}`;

// ============================================================================
// Appointment Data Keys
// ============================================================================

/**
 * Get key for appointments on a specific date
 * @param date - Date in YYYY-MM-DD format
 */
export const appointmentsDateKey = (date: string) => `appointments:${date}`;

/**
 * Get key for a specific appointment
 */
export const appointmentKey = (id: string) => `appointments:${id}`;

/**
 * Get key for all appointments for a patient
 */
export const patientAppointmentsKey = (patientId: string) => 
  `appointments:patient:${patientId}`;

// ============================================================================
// Consultation Data Keys
// ============================================================================

/**
 * Get key for all consultations for a patient
 */
export const consultationsKey = (patientId: string) => 
  `consultations:${patientId}`;

/**
 * Get key for a specific consultation
 */
export const consultationKey = (id: string) => `consultations:${id}`;

// ============================================================================
// Message Data Keys
// ============================================================================

/**
 * Get key for messages in a conversation
 */
export const messagesKey = (conversationId: string) => 
  `messages:${conversationId}`;

/**
 * Get key for a specific message
 */
export const messageKey = (id: string) => `messages:${id}`;

/**
 * Get key for all conversations list
 */
export const CONVERSATIONS_ALL = 'conversations:all';

// ============================================================================
// Doctor Settings Keys
// ============================================================================

/**
 * Get key for doctor settings
 */
export const doctorSettingsKey = (doctorId: string) => 
  `settings:doctor:${doctorId}`;

/**
 * Get key for doctor schedule
 */
export const doctorScheduleKey = (doctorId: string) => 
  `settings:schedule:${doctorId}`;

// ============================================================================
// Sync System Keys
// ============================================================================

/**
 * Key for the sync queue (pending changes)
 */
export const SYNC_QUEUE = 'sync:queue';

/**
 * Key for sync metadata (last sync time, etc.)
 */
export const SYNC_METADATA = 'sync:metadata';

/**
 * Key for sync errors log
 */
export const SYNC_ERRORS = 'sync:errors';

// ============================================================================
// Cache Keys
// ============================================================================

/**
 * Get key for cached API response
 */
export const cacheKey = (endpoint: string) => `cache:${endpoint}`;

/**
 * Key for cache metadata (expiration times, etc.)
 */
export const CACHE_METADATA = 'cache:metadata';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parse a storage key to extract entity type and ID
 */
export function parseStorageKey(key: string): { 
  entity: string; 
  id?: string; 
  type?: string;
} {
  const parts = key.split(':');
  return {
    entity: parts[0],
    id: parts[1],
    type: parts[2],
  };
}

/**
 * Check if a key is a sync system key
 */
export function isSyncKey(key: string): boolean {
  return key.startsWith('sync:');
}

/**
 * Check if a key is a cache key
 */
export function isCacheKey(key: string): boolean {
  return key.startsWith('cache:');
}

/**
 * Get all keys for a specific entity type
 */
export function getEntityKeys(allKeys: string[], entity: string): string[] {
  return allKeys.filter(key => key.startsWith(`${entity}:`));
}
