import type { ApiClient } from '../client';

export class MedicalRecordsApi {
  constructor(private client: ApiClient) {}

  getPatientRecord(patientId: string) {
    return this.client.get(`/medical-records/patients/${patientId}`);
  }

  addConsultation(patientId: string, data: unknown) {
    return this.client.post(`/medical-records/patients/${patientId}/consultations`, data);
  }

  getPrescriptions(patientId: string, params?: Record<string, string>) {
    return this.client.get(`/medical-records/patients/${patientId}/prescriptions`, params);
  }

  addPrescription(patientId: string, data: unknown) {
    return this.client.post(`/medical-records/patients/${patientId}/prescriptions`, data);
  }
}
