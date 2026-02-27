import type {
  Service,
  ServiceInvoiceItem,
  ServiceType,
} from '@red-salud/types';

export class ServicesManager {
  /**
   * Create a service invoice item
   */
  static createServiceInvoiceItem(
    invoiceId: string,
    service: Service,
    quantity: number = 1
  ): Omit<ServiceInvoiceItem, 'id' | 'created_at'> {
    const subtotalUsd = service.sale_price_usd * quantity;
    const subtotalVes = service.sale_price_ves * quantity;
    const ivaUsd = subtotalUsd * 0.16; // Standard IVA rate
    const ivaVes = subtotalVes * 0.16;

    return {
      invoice_id: invoiceId,
      service_id: service.id,
      service_name: service.name,
      quantity,
      unit_price_usd: service.sale_price_usd,
      unit_price_ves: service.sale_price_ves,
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      discount_usd: 0,
      discount_ves: 0,
      iva_rate: 0.16,
      iva_usd: ivaUsd,
      iva_ves: ivaVes,
      total_usd: subtotalUsd + ivaUsd,
      total_ves: subtotalVes + ivaVes,
    };
  }

  /**
   * Calculate service duration
   */
  static calculateServiceDuration(
    service: Service,
    quantity: number
  ): number {
    if (!service.duration_minutes) return 0;
    return service.duration_minutes * quantity;
  }

  /**
   * Check if service requires appointment
   */
  static requiresAppointment(service: Service): boolean {
    return service.requires_appointment;
  }

  /**
   * Check if service requires prescription
   */
  static requiresPrescription(service: Service): boolean {
    return service.requires_prescription;
  }

  /**
   * Get services by type
   */
  static getServicesByType(
    services: Service[],
    type: ServiceType
  ): Service[] {
    return services.filter(s => s.service_type === type && s.is_active);
  }

  /**
   * Calculate service profit margin
   */
  static calculateProfitMargin(service: Service): {
    marginUsd: number;
    marginVes: number;
    marginPercent: number;
  } {
    const marginUsd = service.sale_price_usd - service.cost_price_usd;
    const marginVes = service.sale_price_ves - service.cost_price_ves;
    const marginPercent = (marginUsd / service.cost_price_usd) * 100;

    return { marginUsd, marginVes, marginPercent };
  }

  /**
   * Validate service availability
   */
  static isServiceAvailable(service: Service): boolean {
    return service.is_active;
  }

  /**
   * Get active services
   */
  static getActiveServices(services: Service[]): Service[] {
    return services.filter(s => s.is_active);
  }

  /**
   * Search services
   */
  static searchServices(
    services: Service[],
    query: string
  ): Service[] {
    const lowerQuery = query.toLowerCase();
    return services.filter(
      s =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.code.toLowerCase().includes(lowerQuery) ||
        (s.description && s.description.toLowerCase().includes(lowerQuery))
    );
  }
}
