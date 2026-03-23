import type { ApiClient } from '../client';

export class BillingApi {
  constructor(private client: ApiClient) {}

  getInvoices(params?: Record<string, string>) {
    return this.client.get('/billing/invoices', params);
  }

  createInvoice(data: unknown) {
    return this.client.post('/billing/invoices', data);
  }

  processPayment(invoiceId: string, data: unknown) {
    return this.client.post(`/billing/invoices/${invoiceId}/payments`, data);
  }
}
