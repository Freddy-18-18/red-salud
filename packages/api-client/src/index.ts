export { ApiClient } from './client';
export { createApiClient } from './factory';
export type { ApiClientConfig, ApiResponse, ApiError, PaginatedResponse } from './types';

// Domain-specific clients
export { PharmacyApi } from './domains/pharmacy';
export { AppointmentsApi } from './domains/appointments';
export type {
  AppointmentFilters,
  CreateAppointmentData,
  UpdateAppointmentData,
  CancelAppointmentData,
  RescheduleAppointmentData,
  ScheduleFilters,
  TimeSlot,
} from './domains/appointments';
export { DoctorsApi } from './domains/doctors';
export { LaboratoryApi } from './domains/laboratory';
export { MedicalRecordsApi } from './domains/medical-records';
export { MessagingApi } from './domains/messaging';
export { BillingApi } from './domains/billing';

// Doctor-specific types (local until promoted to @red-salud/contracts)
export type {
  MedicalSpecialty,
  DoctorAvailabilitySlot,
  DoctorAvailability,
  DoctorReview,
  NearbyDoctorParams,
} from './domains/doctors';
