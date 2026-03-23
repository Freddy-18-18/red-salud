import type { ApiClient } from '../client';

export class AppointmentsApi {
  constructor(private client: ApiClient) {}

  getAppointments(params?: Record<string, string>) {
    return this.client.get('/appointments', params);
  }

  createAppointment(data: unknown) {
    return this.client.post('/appointments', data);
  }

  updateAppointment(id: string, data: unknown) {
    return this.client.put(`/appointments/${id}`, data);
  }

  cancelAppointment(id: string) {
    return this.client.delete(`/appointments/${id}`);
  }

  getDoctorSchedule(doctorId: string, params?: Record<string, string>) {
    return this.client.get(`/appointments/doctors/${doctorId}/schedule`, params);
  }
}
