import { ApiClient } from './client';
import { AppointmentsApi } from './domains/appointments';
import { BillingApi } from './domains/billing';
import { LaboratoryApi } from './domains/laboratory';
import { MedicalRecordsApi } from './domains/medical-records';
import { MessagingApi } from './domains/messaging';
import { PharmacyApi } from './domains/pharmacy';
import type { ApiClientConfig } from './types';

export function createApiClient(config: ApiClientConfig) {
  const client = new ApiClient(config);

  return {
    client,
    pharmacy: new PharmacyApi(client),
    appointments: new AppointmentsApi(client),
    laboratory: new LaboratoryApi(client),
    medicalRecords: new MedicalRecordsApi(client),
    messaging: new MessagingApi(client),
    billing: new BillingApi(client),
  };
}
