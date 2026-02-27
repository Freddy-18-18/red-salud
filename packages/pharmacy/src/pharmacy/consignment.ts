import type { Consignment } from '@red-salud/types';

export class ConsignmentManager {
  /**
   * Create a consignment agreement
   */
  static createConsignment(
    supplierId: string,
    supplierName: string,
    items: Array<{
      product_id: string;
      product_name: string;
      batch_id: string;
      lot_number: string;
      quantity_consigned: number;
      unit_cost_usd: number;
      unit_cost_ves: number;
      unit_price_usd: number;
      unit_price_ves: number;
    }>,
    consignmentPercent: number,
    paymentTermsDays: number,
    warehouseId: string
  ): Omit<Consignment, 'id' | 'created_at' | 'updated_at'> {
    // Calculate totals
    let totalValueUsd = 0;
    let totalValueVes = 0;

    for (const item of items) {
      totalValueUsd += item.unit_cost_usd * item.quantity_consigned;
      totalValueVes += item.unit_cost_ves * item.quantity_consigned;
    }

    const consignmentNumber = `CON-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    return {
      consignment_number: consignmentNumber,
      supplier_id: supplierId,
      supplier_name: supplierName,
      items: items.map(item => ({
        ...item,
        quantity_sold: 0,
        quantity_returned: 0,
      })),
      total_value_usd: totalValueUsd,
      total_value_ves: totalValueVes,
      total_sold_usd: 0,
      total_sold_ves: 0,
      consignment_percent: consignmentPercent,
      payment_terms_days: paymentTermsDays,
      status: 'active',
      start_date: new Date(),
      warehouse_id: warehouseId,
    };
  }

  /**
   * Update consignment status
   */
  static updateStatus(
    consignment: Consignment,
    newStatus: 'active' | 'completed' | 'cancelled'
  ): Consignment {
    const updated = {
      ...consignment,
      status: newStatus,
      updated_at: new Date(),
    };

    if (newStatus === 'completed' || newStatus === 'cancelled') {
      updated.end_date = new Date();
    }

    return updated;
  }

  /**
   * Record a sale from consignment
   */
  static recordSale(
    consignment: Consignment,
    productId: string,
    quantitySold: number
  ): Consignment {
    const updatedItems = consignment.items.map(item => {
      if (item.product_id === productId) {
        const newQuantitySold = Math.min(
          item.quantity_consigned - item.quantity_returned,
          quantitySold
        );
        const soldUsd = item.unit_price_usd * newQuantitySold;
        const soldVes = item.unit_price_ves * newQuantitySold;

        return {
          ...item,
          quantity_sold: item.quantity_sold + newQuantitySold,
        };
      }
      return item;
    });

    // Recalculate totals
    let totalSoldUsd = 0;
    let totalSoldVes = 0;

    for (const item of updatedItems) {
      totalSoldUsd += item.unit_price_usd * item.quantity_sold;
      totalSoldVes += item.unit_price_ves * item.quantity_sold;
    }

    return {
      ...consignment,
      items: updatedItems,
      total_sold_usd: totalSoldUsd,
      total_sold_ves: totalSoldVes,
      updated_at: new Date(),
    };
  }

  /**
   * Return unsold items from consignment
   */
  static returnItems(
    consignment: Consignment,
    productId: string,
    quantityToReturn: number
  ): Consignment {
    const updatedItems = consignment.items.map(item => {
      if (item.product_id === productId) {
        const unsoldQuantity = item.quantity_consigned - item.quantity_sold;
        const actualReturn = Math.min(unsoldQuantity, quantityToReturn);

        return {
          ...item,
          quantity_returned: item.quantity_returned + actualReturn,
        };
      }
      return item;
    });

    return {
      ...consignment,
      items: updatedItems,
      updated_at: new Date(),
    };
  }

  /**
   * Calculate payment due to supplier
   */
  static calculatePaymentDue(consignment: Consignment): {
    paymentUsd: number;
    paymentVes: number;
  } {
    const paymentUsd = consignment.total_sold_usd * (consignment.consignment_percent / 100);
    const paymentVes = consignment.total_sold_ves * (consignment.consignment_percent / 100);

    return { paymentUsd, paymentVes };
  }

  /**
   * Get active consignments
   */
  static getActiveConsignments(consignments: Consignment[]): Consignment[] {
    return consignments.filter(c => c.status === 'active');
  }

  /**
   * Get consignments by supplier
   */
  static getConsignmentsBySupplier(
    consignments: Consignment[],
    supplierId: string
  ): Consignment[] {
    return consignments.filter(c => c.supplier_id === supplierId);
  }

  /**
   * Get consignments nearing payment due date
   */
  static getConsignmentsNePaymentDue(
    consignments: Consignment[],
    daysAhead: number = 5
  ): Consignment[] {
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return consignments.filter(c => {
      if (c.status !== 'active' || !c.start_date) return false;
      
      const dueDate = new Date(c.start_date.getTime() + c.payment_terms_days * 24 * 60 * 60 * 1000);
      return dueDate >= now && dueDate <= futureDate;
    });
  }

  /**
   * Get overdue consignments
   */
  static getOverdueConsignments(consignments: Consignment[]): Consignment[] {
    const now = new Date();

    return consignments.filter(c => {
      if (c.status !== 'active' || !c.start_date) return false;
      
      const dueDate = new Date(c.start_date.getTime() + c.payment_terms_days * 24 * 60 * 60 * 1000);
      return dueDate < now;
    });
  }

  /**
   * Calculate consignment performance
   */
  static calculatePerformance(consignment: Consignment): {
    sellThroughRate: number;
    remainingValueUsd: number;
    remainingValueVes: number;
    totalValueUsd: number;
    totalValueVes: number;
  } {
    let remainingValueUsd = 0;
    let remainingValueVes = 0;

    for (const item of consignment.items) {
      const remainingQuantity = item.quantity_consigned - item.quantity_sold - item.quantity_returned;
      remainingValueUsd += item.unit_cost_usd * remainingQuantity;
      remainingValueVes += item.unit_cost_ves * remainingQuantity;
    }

    const totalValueUsd = consignment.total_value_usd;
    const totalValueVes = consignment.total_value_ves;
    const sellThroughRate = totalValueUsd > 0 ? (consignment.total_sold_usd / totalValueUsd) * 100 : 0;

    return {
      sellThroughRate,
      remainingValueUsd,
      remainingValueVes,
      totalValueUsd,
      totalValueVes,
    };
  }

  /**
   * Search consignments
   */
  static searchConsignments(
    consignments: Consignment[],
    query: string
  ): Consignment[] {
    const lowerQuery = query.toLowerCase();
    return consignments.filter(
      c =>
        c.consignment_number.toLowerCase().includes(lowerQuery) ||
        c.supplier_name.toLowerCase().includes(lowerQuery)
    );
  }
}
