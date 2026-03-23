import type { ApiClient } from '../client';

export class LaboratoryApi {
  constructor(private client: ApiClient) {}

  getOrders(params?: Record<string, string>) {
    return this.client.get('/laboratory/orders', params);
  }

  createOrder(data: unknown) {
    return this.client.post('/laboratory/orders', data);
  }

  getResults(orderId: string) {
    return this.client.get(`/laboratory/orders/${orderId}/results`);
  }

  submitResults(orderId: string, data: unknown) {
    return this.client.post(`/laboratory/orders/${orderId}/results`, data);
  }
}
