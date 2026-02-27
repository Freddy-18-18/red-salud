import type { DeliveryOrder, DeliveryZone } from '@red-salud/types';

export class DeliveryManager {
  /**
   * Create a delivery order
   */
  static createDeliveryOrder(
    patientId: string,
    customerName: string,
    customerPhone: string,
    deliveryAddress: string,
    deliveryZoneId: string,
    invoiceId: string,
    warehouseId: string,
    createdBy: string
  ): Omit<DeliveryOrder, 'id' | 'created_at' | 'updated_at'> {
    const orderNumber = `DEL-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Calculate estimated delivery time (30 minutes from now by default)
    const estimatedDeliveryTime = new Date(Date.now() + 30 * 60 * 1000);

    return {
      order_number: orderNumber,
      patient_id: patientId,
      customer_name: customerName,
      customer_phone: customerPhone,
      delivery_address: deliveryAddress,
      delivery_zone_id: deliveryZoneId,
      invoice_id: invoiceId,
      delivery_fee_usd: 0, // Will be calculated based on zone
      delivery_fee_ves: 0,
      requested_time: undefined,
      estimated_delivery_time: estimatedDeliveryTime,
      status: 'pending',
      delivery_commission_percent: 10,
      delivery_commission_usd: 0,
      delivery_commission_ves: 0,
      warehouse_id: warehouseId,
      created_by: createdBy,
      tracking_notes: [],
    };
  }

  /**
   * Calculate delivery fee based on zone
   */
  static calculateDeliveryFee(
    zone: DeliveryZone,
    distanceKm: number = 0
  ): { feeUsd: number; feeVes: number } {
    const feeUsd = zone.base_fee_usd + (zone.fee_per_km_usd * distanceKm);
    const feeVes = zone.base_fee_ves + (zone.fee_per_km_ves * distanceKm);
    return { feeUsd, feeVes };
  }

  /**
   * Update delivery order status
   */
  static updateStatus(
    order: DeliveryOrder,
    newStatus: 'pending' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled'
  ): DeliveryOrder {
    const updatedOrder = {
      ...order,
      status: newStatus,
      updated_at: new Date(),
    };

    // Set actual delivery time when delivered
    if (newStatus === 'delivered') {
      updatedOrder.actual_delivery_time = new Date();
    }

    return updatedOrder;
  }

  /**
   * Add tracking note
   */
  static addTrackingNote(
    order: DeliveryOrder,
    note: string,
    userId: string
  ): DeliveryOrder {
    return {
      ...order,
      tracking_notes: [
        ...order.tracking_notes,
        {
          timestamp: new Date(),
          note,
          user_id: userId,
        },
      ],
      updated_at: new Date(),
    };
  }

  /**
   * Set delivery person
   */
  static setDeliveryPerson(
    order: DeliveryOrder,
    deliveryPersonId: string
  ): DeliveryOrder {
    return {
      ...order,
      delivered_by: deliveryPersonId,
      updated_at: new Date(),
    };
  }

  /**
   * Calculate delivery commission
   */
  static calculateCommission(
    order: DeliveryOrder,
    deliveryFeeUsd: number,
    deliveryFeeVes: number
  ): DeliveryOrder {
    const commissionUsd = deliveryFeeUsd * (order.delivery_commission_percent / 100);
    const commissionVes = deliveryFeeVes * (order.delivery_commission_percent / 100);

    return {
      ...order,
      delivery_commission_usd: commissionUsd,
      delivery_commission_ves: commissionVes,
      updated_at: new Date(),
    };
  }

  /**
   * Get pending delivery orders
   */
  static getPendingOrders(orders: DeliveryOrder[]): DeliveryOrder[] {
    return orders.filter(o => o.status === 'pending');
  }

  /**
   * Get orders out for delivery
   */
  static getOutForDeliveryOrders(orders: DeliveryOrder[]): DeliveryOrder[] {
    return orders.filter(o => o.status === 'out_for_delivery');
  }

  /**
   * Get overdue deliveries
   */
  static getOverdueDeliveries(orders: DeliveryOrder[]): DeliveryOrder[] {
    const now = new Date();
    return orders.filter(
      o =>
        o.estimated_delivery_time < now &&
        o.status !== 'delivered' &&
        o.status !== 'cancelled'
    );
  }

  /**
   * Get delivery statistics
   */
  static calculateStatistics(orders: DeliveryOrder[]): {
    total: number;
    delivered: number;
    pending: number;
    cancelled: number;
    averageDeliveryTimeMinutes: number;
    onTimeDeliveryRate: number;
  } {
    const delivered = orders.filter(o => o.status === 'delivered');
    const pending = orders.filter(o => o.status === 'pending');
    const cancelled = orders.filter(o => o.status === 'cancelled');

    // Calculate average delivery time
    let totalDeliveryTime = 0;
    let deliveryTimeCount = 0;
    let onTimeCount = 0;

    for (const order of delivered) {
      if (order.actual_delivery_time && order.estimated_delivery_time) {
        const deliveryTime = Math.floor(
          (order.actual_delivery_time.getTime() - order.estimated_delivery_time.getTime()) / (1000 * 60)
        );
        totalDeliveryTime += deliveryTime;
        deliveryTimeCount++;

        // Count on-time deliveries (within 15 minutes)
        if (deliveryTime <= 15) {
          onTimeCount++;
        }
      }
    }

    const averageDeliveryTimeMinutes = deliveryTimeCount > 0 ? totalDeliveryTime / deliveryTimeCount : 0;
    const onTimeDeliveryRate = delivered.length > 0 ? (onTimeCount / delivered.length) * 100 : 0;

    return {
      total: orders.length,
      delivered: delivered.length,
      pending: pending.length,
      cancelled: cancelled.length,
      averageDeliveryTimeMinutes,
      onTimeDeliveryRate,
    };
  }

  /**
   * Get active delivery zones
   */
  static getActiveZones(zones: DeliveryZone[]): DeliveryZone[] {
    return zones.filter(z => z.is_active);
  }

  /**
   * Find zone by postal code
   */
  static findZoneByPostalCode(
    zones: DeliveryZone[],
    postalCode: string
  ): DeliveryZone | undefined {
    return zones.find(z =>
      z.is_active && z.postal_codes.includes(postalCode)
    );
  }

  /**
   * Find zone by neighborhood
   */
  static findZoneByNeighborhood(
    zones: DeliveryZone[],
    neighborhood: string
  ): DeliveryZone | undefined {
    return zones.find(z =>
      z.is_active && z.neighborhoods.includes(neighborhood)
    );
  }

  /**
   * Search delivery orders
   */
  static searchOrders(
    orders: DeliveryOrder[],
    query: string
  ): DeliveryOrder[] {
    const lowerQuery = query.toLowerCase();
    return orders.filter(
      o =>
        o.order_number.toLowerCase().includes(lowerQuery) ||
        o.customer_name.toLowerCase().includes(lowerQuery) ||
        o.customer_phone.includes(query)
    );
  }
}
