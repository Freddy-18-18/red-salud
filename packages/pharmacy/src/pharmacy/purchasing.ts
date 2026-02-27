import { Product, Supplier, PurchaseOrder } from '@red-salud/types';

/**
 * B2B Price Comparison Entry
 */
export interface PriceComparisonEntry {
  product_id: string;
  product_name: string;
  supplier_name: string;
  supplier_id: string;
  
  price_usd: number;
  price_ves: number;
  
  freight_cost_usd?: number;
  freight_cost_ves?: number;
  
  discount_rate?: number;
  discount_amount_usd?: number;
  discount_amount_ves?: number;
  
  payment_terms_days?: number;
  
  real_cost_usd: number;
  real_cost_ves: number;
  
  exchange_rate: number;
  
  created_at: Date;
}

/**
 * Reorder Recommendation
 */
export interface ReorderRecommendation {
  product_id: string;
  product_name: string;
  
  current_stock: number;
  min_stock: number;
  max_stock: number;
  
  vmd: number; // Ventas Medias Diarias
  lead_time_days: number;
  
  recommended_quantity: number;
  recommended_supplier?: string;
  
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  abc_category: 'A' | 'B' | 'C' | 'D';
  profitability_score: number;
  
  seasonal_factor?: number;
  
  created_at: Date;
}

/**
 * Blind Receiving Session
 */
export interface BlindReceivingSession {
  id: string;
  purchase_order_id: string;
  supplier_id: string;
  
  started_at: Date;
  completed_at?: Date;
  
  operator_id: string;
  
  expected_items: Array<{
    product_id: string;
    product_name: string;
    expected_quantity: number;
  }>;
  
  counted_items: Array<{
    product_id: string;
    counted_quantity: number;
    lot_number?: string;
    expiry_date?: Date;
  }>;
  
  discrepancies: Array<{
    product_id: string;
    expected: number;
    counted: number;
    difference: number;
  }>;
  
  status: 'in_progress' | 'completed' | 'discrepancy_found';
  
  created_at: Date;
  updated_at: Date;
}

/**
 * B2B Price Comparison Manager
 * Compares prices across multiple suppliers and calculates real cost
 */
export class B2BPriceComparator {
  /**
   * Compare prices for a product across multiple suppliers
   */
  static comparePrices(
    product: Product,
    suppliers: Supplier[],
    supplierPrices: Array<{ supplier_id: string; price_usd: number; price_ves: number; freight_cost_usd?: number; discount_rate?: number; payment_terms_days?: number }>,
    exchangeRate: number
  ): PriceComparisonEntry[] {
    return supplierPrices.map(price => {
      const supplier = suppliers.find(s => s.id === price.supplier_id);
      if (!supplier) throw new Error(`Supplier ${price.supplier_id} not found`);

      const freightCostUSD = price.freight_cost_usd || 0;
      const freightCostVES = freightCostUSD * exchangeRate;
      
      const basePriceUSD = price.price_usd;
      const basePriceVES = price.price_ves;
      
      const discountAmountUSD = price.discount_rate ? basePriceUSD * price.discount_rate : 0;
      const discountAmountVES = price.discount_rate ? basePriceVES * price.discount_rate : 0;
      
      const priceAfterDiscountUSD = basePriceUSD - discountAmountUSD;
      const priceAfterDiscountVES = basePriceVES - discountAmountVES;
      
      const realCostUSD = priceAfterDiscountUSD + freightCostUSD;
      const realCostVES = priceAfterDiscountVES + freightCostVES;

      return {
        product_id: product.id,
        product_name: product.name,
        supplier_name: supplier.name,
        supplier_id: supplier.id,
        price_usd: basePriceUSD,
        price_ves: basePriceVES,
        freight_cost_usd: freightCostUSD,
        freight_cost_ves: freightCostVES,
        discount_rate: price.discount_rate,
        discount_amount_usd: discountAmountUSD,
        discount_amount_ves: discountAmountVES,
        payment_terms_days: price.payment_terms_days,
        real_cost_usd: realCostUSD,
        real_cost_ves: realCostVES,
        exchange_rate: exchangeRate,
        created_at: new Date(),
      };
    }).sort((a, b) => a.real_cost_usd - b.real_cost_usd);
  }

  /**
   * Find best price for a product
   */
  static findBestPrice(comparisons: PriceComparisonEntry[]): PriceComparisonEntry | null {
    if (comparisons.length === 0) return null;
    return comparisons[0]; // Already sorted by real_cost_usd
  }

  /**
   * Calculate savings by switching suppliers
   */
  static calculateSavings(
    currentPrice: PriceComparisonEntry,
    bestPrice: PriceComparisonEntry,
    quantity: number
  ): { usd: number; ves: number; percentage: number } {
    const currentTotalUSD = currentPrice.real_cost_usd * quantity;
    const bestTotalUSD = bestPrice.real_cost_usd * quantity;
    
    const savingUSD = currentTotalUSD - bestTotalUSD;
    const savingVES = savingUSD * bestPrice.exchange_rate;
    const percentage = (savingUSD / currentTotalUSD) * 100;

    return {
      usd: savingUSD,
      ves: savingVES,
      percentage,
    };
  }
}

/**
 * Predictive Reordering Manager
 * Uses VMD (Ventas Medias Diárias) and ABC/ABCD analysis
 */
export class PredictiveReorderingManager {
  /**
   * Calculate VMD (Ventas Medias Diárias) from sales data
   */
  static calculateVMD(salesData: Array<{ date: Date; quantity: number }>, days: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentSales = salesData.filter(sale => sale.date >= cutoffDate);
    const totalQuantity = recentSales.reduce((sum, sale) => sum + sale.quantity, 0);

    return totalQuantity / days;
  }

  /**
   * Calculate ABC category based on revenue contribution
   */
  static calculateABCCategory(
    productRevenue: number,
    totalRevenue: number
  ): 'A' | 'B' | 'C' | 'D' {
    const percentage = (productRevenue / totalRevenue) * 100;

    if (percentage >= 80) return 'A';
    if (percentage >= 60) return 'B';
    if (percentage >= 40) return 'C';
    return 'D';
  }

  /**
   * Calculate profitability score
   */
  static calculateProfitabilityScore(
    margin: number,
    turnover: number
  ): number {
    return (margin * 0.6) + (turnover * 0.4);
  }

  /**
   * Generate reorder recommendations
   */
  static generateRecommendations(
    products: Product[],
    salesData: Map<string, Array<{ date: Date; quantity: number }>>,
    supplierLeadTimes: Map<string, number>,
    exchangeRate: number,
    seasonalFactors?: Map<string, number>
  ): ReorderRecommendation[] {
    const recommendations: ReorderRecommendation[] = [];

    products.forEach(product => {
      const productSales = salesData.get(product.id) || [];
      const vmd = this.calculateVMD(productSales);
      const leadTimeDays = supplierLeadTimes.get(product.id) || 7;
      
      const currentStock = 0; // Would come from inventory
      const minStock = product.min_stock;
      const maxStock = product.max_stock;

      // Calculate recommended quantity based on VMD and lead time
      const daysOfStockNeeded = leadTimeDays + 7; // Lead time + 7 days buffer
      const recommendedQuantity = Math.ceil(vmd * daysOfStockNeeded);

      // Determine priority
      let priority: 'low' | 'medium' | 'high' | 'critical';
      if (currentStock <= 0) {
        priority = 'critical';
      } else if (currentStock <= minStock) {
        priority = 'high';
      } else if (currentStock <= product.reorder_point) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      // Apply seasonal factor if available
      const seasonalFactor = seasonalFactors?.get(product.id);
      const adjustedQuantity = seasonalFactor 
        ? Math.ceil(recommendedQuantity * seasonalFactor)
        : recommendedQuantity;

      recommendations.push({
        product_id: product.id,
        product_name: product.name,
        current_stock: currentStock,
        min_stock: minStock,
        max_stock: maxStock,
        vmd,
        lead_time_days: leadTimeDays,
        recommended_quantity: Math.min(adjustedQuantity, maxStock - currentStock),
        priority,
        abc_category: 'B', // Would calculate from actual revenue data
        profitability_score: 0.75, // Would calculate from actual margin/turnover
        seasonal_factor: seasonalFactor,
        created_at: new Date(),
      });
    });

    return recommendations
      .filter(rec => rec.recommended_quantity > 0)
      .sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
  }
}

/**
 * Blind Receiving Manager
 * Implements blind receiving with FEFO validation
 */
export class BlindReceivingManager {
  private static sessions: Map<string, BlindReceivingSession> = new Map();

  /**
   * Start a blind receiving session
   */
  static startSession(
    purchaseOrderId: string,
    supplierId: string,
    expectedItems: Array<{ product_id: string; product_name: string; expected_quantity: number }>,
    operatorId: string
  ): BlindReceivingSession {
    const session: BlindReceivingSession = {
      id: crypto.randomUUID(),
      purchase_order_id: purchaseOrderId,
      supplier_id: supplierId,
      started_at: new Date(),
      operator_id: operatorId,
      expected_items: expectedItems,
      counted_items: [],
      discrepancies: [],
      status: 'in_progress',
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  /**
   * Count an item (operator doesn't see expected quantity)
   */
  static countItem(
    sessionId: string,
    productId: string,
    countedQuantity: number,
    lotNumber?: string,
    expiryDate?: Date
  ): BlindReceivingSession {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    if (session.status !== 'in_progress') {
      throw new Error('Session is not in progress');
    }

    session.counted_items.push({
      product_id: productId,
      counted_quantity: countedQuantity,
      lot_number: lotNumber,
      expiry_date: expiryDate,
    });

    session.updated_at = new Date();
    return session;
  }

  /**
   * Complete session and check for discrepancies
   */
  static completeSession(sessionId: string): {
    session: BlindReceivingSession;
    discrepanciesFound: boolean;
    discrepancies: Array<{ product_id: string; product_name: string; expected: number; counted: number; difference: number }>;
  } {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    session.completed_at = new Date();
    session.status = 'completed';

    const discrepancies: Array<{ product_id: string; product_name: string; expected: number; counted: number; difference: number }> = [];

    session.expected_items.forEach(expected => {
      const counted = session.counted_items.find(c => c.product_id === expected.product_id);
      const countedQuantity = counted?.counted_quantity || 0;
      const difference = countedQuantity - expected.expected_quantity;

      if (difference !== 0) {
        discrepancies.push({
          product_id: expected.product_id,
          product_name: expected.product_name,
          expected: expected.expected_quantity,
          counted: countedQuantity,
          difference,
        });
      }
    });

    if (discrepancies.length > 0) {
      session.status = 'discrepancy_found';
      session.discrepancies = discrepancies;
    }

    return {
      session,
      discrepanciesFound: discrepancies.length > 0,
      discrepancies,
    };
  }

  /**
   * Validate FEFO compliance for received items
   */
  static validateFEFO(
    expiryDate: Date,
    policyMonths: number = 6
  ): { valid: boolean; daysRemaining: number; message: string } {
    const today = new Date();
    const minExpiryDate = new Date();
    minExpiryDate.setMonth(minExpiryDate.getMonth() + policyMonths);

    const daysRemaining = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (expiryDate < today) {
      return {
        valid: false,
        daysRemaining,
        message: 'Product is already expired',
      };
    }

    if (expiryDate < minExpiryDate) {
      return {
        valid: false,
        daysRemaining,
        message: `Product expires in ${daysRemaining} days, below policy minimum of ${policyMonths} months`,
      };
    }

    return {
      valid: true,
      daysRemaining,
      message: 'Product meets FEFO policy',
    };
  }

  /**
   * Get session
   */
  static getSession(sessionId: string): BlindReceivingSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Get all active sessions
   */
  static getActiveSessions(): BlindReceivingSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'in_progress');
  }
}
