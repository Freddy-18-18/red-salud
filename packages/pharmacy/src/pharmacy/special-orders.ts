import type {
  SpecialOrder,
  PharmacyPaymentMethod,
} from '@red-salud/types';

export class SpecialOrderManager {
  /**
   * Create a special order
   */
  static createSpecialOrder(
    patientId: string,
    customerName: string,
    customerPhone: string,
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price_usd: number;
      unit_price_ves: number;
    }>,
    advancePaymentPercent: number,
    warehouseId: string,
    createdBy: string
  ): Omit<SpecialOrder, 'id' | 'created_at' | 'updated_at'> {
    // Calculate totals
    let subtotalUsd = 0;
    let subtotalVes = 0;

    for (const item of items) {
      subtotalUsd += item.unit_price_usd * item.quantity;
      subtotalVes += item.unit_price_ves * item.quantity;
    }

    const ivaUsd = subtotalUsd * 0.16;
    const ivaVes = subtotalVes * 0.16;
    const totalUsd = subtotalUsd + ivaUsd;
    const totalVes = subtotalVes + ivaVes;

    // Calculate advance payment
    const advancePaymentUsd = totalUsd * (advancePaymentPercent / 100);
    const advancePaymentVes = totalVes * (advancePaymentPercent / 100);
    const remainingUsd = totalUsd - advancePaymentUsd;
    const remainingVes = totalVes - advancePaymentVes;

    // Generate order number
    const orderNumber = `PED-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    return {
      order_number: orderNumber,
      patient_id: patientId,
      customer_name: customerName,
      customer_phone: customerPhone,
      items: items.map(item => ({
        ...item,
        subtotal_usd: item.unit_price_usd * item.quantity,
        subtotal_ves: item.unit_price_ves * item.quantity,
      })),
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      iva_usd: ivaUsd,
      iva_ves: ivaVes,
      total_usd: totalUsd,
      total_ves: totalVes,
      advance_payment_percent: advancePaymentPercent,
      advance_payment_usd: advancePaymentUsd,
      advance_payment_ves: advancePaymentVes,
      remaining_usd: remainingUsd,
      remaining_ves: remainingVes,
      status: 'pending',
      warehouse_id: warehouseId,
      created_by: createdBy,
    };
  }

  /**
   * Update special order status
   */
  static updateStatus(
    order: SpecialOrder,
    newStatus: 'pending' | 'confirmed' | 'ordered' | 'received' | 'completed' | 'cancelled'
  ): SpecialOrder {
    return {
      ...order,
      status: newStatus,
      updated_at: new Date(),
    };
  }

  /**
   * Set estimated delivery date
   */
  static setEstimatedDeliveryDate(
    order: SpecialOrder,
    date: Date
  ): SpecialOrder {
    return {
      ...order,
      estimated_delivery_date: date,
      updated_at: new Date(),
    };
  }

  /**
   * Confirm actual delivery
   */
  static confirmDelivery(
    order: SpecialOrder,
    deliveryDate: Date
  ): SpecialOrder {
    return {
      ...order,
      status: 'completed',
      actual_delivery_date: deliveryDate,
      updated_at: new Date(),
    };
  }

  /**
   * Set payment methods
   */
  static setPaymentMethods(
    order: SpecialOrder,
    advancePaymentMethod: PharmacyPaymentMethod,
    balancePaymentMethod: PharmacyPaymentMethod
  ): SpecialOrder {
    return {
      ...order,
      advance_payment_method: advancePaymentMethod,
      balance_payment_method: balancePaymentMethod,
      updated_at: new Date(),
    };
  }

  /**
   * Calculate remaining balance
   */
  static calculateRemainingBalance(order: SpecialOrder): {
    remainingUsd: number;
    remainingVes: number;
  } {
    return {
      remainingUsd: order.remaining_usd,
      remainingVes: order.remaining_ves,
    };
  }

  /**
   * Check if order is fully paid
   */
  static isFullyPaid(order: SpecialOrder): boolean {
    return order.remaining_usd === 0 && order.remaining_ves === 0;
  }

  /**
   * Get pending orders for a patient
   */
  static getPendingOrdersForPatient(
    orders: SpecialOrder[],
    patientId: string
  ): SpecialOrder[] {
    return orders.filter(
      o => o.patient_id === patientId && o.status !== 'completed' && o.status !== 'cancelled'
    );
  }

  /**
   * Get overdue orders
   */
  static getOverdueOrders(orders: SpecialOrder[]): SpecialOrder[] {
    const now = new Date();
    return orders.filter(
      o =>
        o.estimated_delivery_date &&
        o.estimated_delivery_date < now &&
        o.status !== 'completed' &&
        o.status !== 'cancelled'
    );
  }

  /**
   * Calculate average delivery time
   */
  static calculateAverageDeliveryTime(orders: SpecialOrder[]): number {
    const completedOrders = orders.filter(
      o => o.status === 'completed' && o.estimated_delivery_date && o.actual_delivery_date
    );

    if (completedOrders.length === 0) return 0;

    const totalDays = completedOrders.reduce((sum, order) => {
      const estimated = order.estimated_delivery_date!;
      const actual = order.actual_delivery_date!;
      const diff = Math.floor((actual.getTime() - estimated.getTime()) / (1000 * 60 * 60 * 24));
      return sum + diff;
    }, 0);

    return totalDays / completedOrders.length;
  }
}
