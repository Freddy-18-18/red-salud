/**
 * Lost Sale Record
 */
export interface LostSaleRecord {
  id: string;
  
  // Product info
  product_id: string;
  product_name: string;
  product_sku: string;
  
  // Customer info
  customer_id?: string;
  customer_name?: string;
  
  // Sale details
  requested_quantity: number;
  reason: 'out_of_stock' | 'no_sell_authorized' | 'prescription_required' | 'other';
  reason_detail?: string;
  
  // Suggested reorder
  suggested_reorder_quantity: number;
  
  // Follow-up
  customer_notified?: boolean;
  notification_method?: 'whatsapp' | 'sms' | 'email';
  notification_sent_at?: Date;
  
  // Timestamp
  created_at: Date;
}

/**
 * Lost Sale Analysis
 */
export interface LostSaleAnalysis {
  period: { start: Date; end: Date };
  
  // Totals
  total_lost_sales: number;
  total_lost_revenue_usd: number;
  total_lost_revenue_ves: number;
  
  // By reason
  by_reason: {
    out_of_stock: { count: number; revenue_usd: number; revenue_ves: number };
    no_sell_authorized: { count: number; revenue_usd: number; revenue_ves: number };
    prescription_required: { count: number; revenue_usd: number; revenue_ves: number };
    other: { count: number; revenue_usd: number; revenue_ves: number };
  };
  
  // Top products
  top_lost_products: Array<{
    product_id: string;
    product_name: string;
    lost_sales: number;
    lost_revenue_usd: number;
    lost_revenue_ves: number;
  }>;
  
  // Recovery potential
  recovery_potential: {
    products_to_reorder: string[];
    estimated_revenue_usd: number;
    estimated_revenue_ves: number;
  };
}

/**
 * Lost Sale Manager
 * Manages lost sales tracking and analysis with "Falta" button
 */
export class LostSaleManager {
  private static lostSales: LostSaleRecord[] = [];
  private static STORAGE_KEY = 'lost_sales';

  /**
   * Record lost sale
   */
  static async recordLostSale(data: {
    productId: string;
    productName: string;
    productSku: string;
    customerId?: string;
    customerName?: string;
    requestedQuantity: number;
    reason: 'out_of_stock' | 'no_sell_authorized' | 'prescription_required' | 'other';
    reasonDetail?: string;
    unitPriceUSD?: number;
    unitPriceVES?: number;
    suggestedReorderQuantity?: number;
  }): Promise<LostSaleRecord> {
    const record: LostSaleRecord = {
      id: crypto.randomUUID(),
      product_id: data.productId,
      product_name: data.productName,
      product_sku: data.productSku,
      customer_id: data.customerId,
      customer_name: data.customerName,
      requested_quantity: data.requestedQuantity,
      reason: data.reason,
      reason_detail: data.reasonDetail,
      suggested_reorder_quantity: data.suggestedReorderQuantity || data.requestedQuantity,
      created_at: new Date(),
    };

    this.lostSales.push(record);
    await this.persistLostSales();

    return record;
  }

  /**
   * Analyze lost sales for period
   */
  static analyzeLostSales(startDate: Date, endDate: Date): LostSaleAnalysis {
    const salesInRange = this.lostSales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalLostSales = salesInRange.length;
    
    // Group by reason
    const byReason = {
      out_of_stock: { count: 0, revenue_usd: 0, revenue_ves: 0 },
      no_sell_authorized: { count: 0, revenue_usd: 0, revenue_ves: 0 },
      prescription_required: { count: 0, revenue_usd: 0, revenue_ves: 0 },
      other: { count: 0, revenue_usd: 0, revenue_ves: 0 },
    };

    // Group by product
    const productMap = new Map<string, {
      product_id: string;
      product_name: string;
      lost_sales: number;
      lost_revenue_usd: number;
      lost_revenue_ves: number;
    }>();

    salesInRange.forEach(sale => {
      // Count by reason
      byReason[sale.reason].count++;

      // Group by product
      const existing = productMap.get(sale.product_id);
      if (existing) {
        existing.lost_sales += sale.requested_quantity;
      } else {
        productMap.set(sale.product_id, {
          product_id: sale.product_id,
          product_name: sale.product_name,
          lost_sales: sale.requested_quantity,
          lost_revenue_usd: 0,
          lost_revenue_ves: 0,
        });
      }
    });

    // Get top lost products
    const topLostProducts = Array.from(productMap.values())
      .sort((a, b) => b.lost_sales - a.lost_sales)
      .slice(0, 10);

    // Calculate recovery potential
    const productsToReorder = topLostProducts
      .filter(p => p.lost_sales >= 5) // Only products with 5+ lost sales
      .map(p => p.product_id);

    const estimatedRevenueUSD = productsToReorder.length * 100; // Estimated average
    const estimatedRevenueVES = productsToReorder.length * 350; // Estimated average

    return {
      period: { start: startDate, end: endDate },
      total_lost_sales: totalLostSales,
      total_lost_revenue_usd: 0,
      total_lost_revenue_ves: 0,
      by_reason: byReason,
      top_lost_products: topLostProducts,
      recovery_potential: {
        products_to_reorder: productsToReorder,
        estimated_revenue_usd: estimatedRevenueUSD,
        estimated_revenue_ves: estimatedRevenueVES,
      },
    };
  }

  /**
   * Notify customer when product becomes available
   */
  static async notifyCustomerAvailable(
    lostSaleId: string,
    notificationMethod: 'whatsapp' | 'sms' | 'email'
  ): Promise<void> {
    const lostSale = this.lostSales.find(s => s.id === lostSaleId);
    if (!lostSale) throw new Error('Lost sale not found');

    lostSale.customer_notified = true;
    lostSale.notification_method = notificationMethod;
    lostSale.notification_sent_at = new Date();

    await this.persistLostSales();
  }

  /**
   * Get lost sales by product
   */
  static getLostSalesByProduct(productId: string): LostSaleRecord[] {
    return this.lostSales
      .filter(s => s.product_id === productId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * Get lost sales by reason
   */
  static getLostSalesByReason(reason: string): LostSaleRecord[] {
    return this.lostSales
      .filter(s => s.reason === reason)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * Get all lost sales
   */
  static getAllLostSales(): LostSaleRecord[] {
    return [...this.lostSales];
  }

  /**
   * Get lost sales by date range
   */
  static getLostSalesByDateRange(startDate: Date, endDate: Date): LostSaleRecord[] {
    return this.lostSales.filter(sale => {
      const saleDate = new Date(sale.created_at);
      return saleDate >= startDate && saleDate <= endDate;
    }).sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  /**
   * Persist lost sales
   */
  private static async persistLostSales(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.lostSales));
    } catch (error) {
      console.error('Error persisting lost sales:', error);
    }
  }

  /**
   * Load lost sales
   */
  static async loadLostSales(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.lostSales = JSON.parse(stored).map((sale: any) => ({
          ...sale,
          created_at: new Date(sale.created_at),
          notification_sent_at: sale.notification_sent_at ? new Date(sale.notification_sent_at) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error loading lost sales:', error);
    }
  }
}
