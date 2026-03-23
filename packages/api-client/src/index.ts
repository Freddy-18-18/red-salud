export { ApiClient } from './client';
export { createApiClient } from './factory';
export type { ApiClientConfig, ApiResponse, ApiError, PaginatedResponse } from './types';

// Domain-specific clients
export { PharmacyApi } from './domains/pharmacy';
export { AppointmentsApi } from './domains/appointments';
export { LaboratoryApi } from './domains/laboratory';
export { MedicalRecordsApi } from './domains/medical-records';
export { MessagingApi } from './domains/messaging';
export { BillingApi } from './domains/billing';
