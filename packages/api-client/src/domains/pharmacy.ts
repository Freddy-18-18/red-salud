import type { ApiClient } from '../client';

export class PharmacyApi {
  constructor(private client: ApiClient) {}

  // Inventory
  getInventory(pharmacyId: string, params?: Record<string, string>) {
    return this.client.get(`/pharmacy/${pharmacyId}/inventory`, params);
  }

  // POS
  createSale(pharmacyId: string, data: unknown) {
    return this.client.post(`/pharmacy/${pharmacyId}/sales`, data);
  }

  // Prescriptions
  getPrescriptions(pharmacyId: string, params?: Record<string, string>) {
    return this.client.get(`/pharmacy/${pharmacyId}/prescriptions`, params);
  }
}
