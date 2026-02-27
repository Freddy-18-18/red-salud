import { Product } from '@red-salud/types';

/**
 * Profitability Metrics
 */
export interface ProfitabilityMetrics {
  // Sales metrics
  total_sales_usd: number;
  total_sales_ves: number;
  
  // Cost metrics
  total_cost_usd: number;
  total_cost_ves: number;
  
  // Gross profit
  gross_profit_usd: number;
  gross_profit_ves: number;
  gross_profit_margin_usd: number;
  gross_profit_margin_ves: number;
  
  // Replacement cost profit
  replacement_cost_usd: number;
  replacement_cost_ves: number;
  replacement_profit_usd: number;
  replacement_profit_ves: number;
  replacement_profit_margin_usd: number;
  replacement_profit_margin_ves: number;
  
  // Period
  start_date: Date;
  end_date: Date;
}

/**
 * Product Profitability
 */
export interface ProductProfitability {
  product_id: string;
  product_name: string;
  
  // Sales
  quantity_sold: number;
  sales_usd: number;
  sales_ves: number;
  
  // Cost
  cost_usd: number;
  cost_ves: number;
  
  // Replacement cost
  replacement_cost_usd: number;
  replacement_cost_ves: number;
  
  // Profitability
  gross_profit_usd: number;
  gross_profit_ves: number;
  gross_profit_margin_usd: number;
  gross_profit_margin_ves: number;
  
  replacement_profit_usd: number;
  replacement_profit_ves: number;
  replacement_profit_margin_usd: number;
  replacement_profit_margin_ves: number;
  
  // Ranking
  profitability_rank: number;
}

/**
 * Profitability Dashboard Manager
 * Calculates real profitability based on replacement cost
 */
export class ProfitabilityDashboardManager {
  private static salesData: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price_usd: number;
    unit_price_ves: number;
    unit_cost_usd: number;
    unit_cost_ves: number;
    replacement_cost_usd: number;
    replacement_cost_ves: number;
    sale_date: Date;
  }> = [];
  
  private static STORAGE_KEY = 'profitability_dashboard';

  /**
   * Add sale record
   */
  static async addSale(data: {
    productId: string;
    productName: string;
    quantity: number;
    unitPriceUSD: number;
    unitPriceVES: number;
    unitCostUSD: number;
    unitCostVES: number;
    replacementCostUSD: number;
    replacementCostVES: number;
    saleDate: Date;
  }): Promise<void> {
    this.salesData.push({
      product_id: data.productId,
      product_name: data.productName,
      quantity: data.quantity,
      unit_price_usd: data.unitPriceUSD,
      unit_price_ves: data.unitPriceVES,
      unit_cost_usd: data.unitCostUSD,
      unit_cost_ves: data.unitCostVES,
      replacement_cost_usd: data.replacementCostUSD,
      replacement_cost_ves: data.replacementCostVES,
      sale_date: data.saleDate,
    });
    
    await this.persistSalesData();
  }

  /**
   * Calculate profitability metrics for period
   */
  static calculateProfitabilityMetrics(startDate: Date, endDate: Date): ProfitabilityMetrics {
    const salesInRange = this.salesData.filter(sale => {
      const saleDate = new Date(sale.sale_date);
      return saleDate >= startDate && saleDate <= endDate;
    });

    const totalSalesUSD = salesInRange.reduce((sum, sale) => sum + (sale.unit_price_usd * sale.quantity), 0);
    const totalSalesVES = salesInRange.reduce((sum, sale) => sum + (sale.unit_price_ves * sale.quantity), 0);
    
    const totalCostUSD = salesInRange.reduce((sum, sale) => sum + (sale.unit_cost_usd * sale.quantity), 0);
    const totalCostVES = salesInRange.reduce((sum, sale) => sum + (sale.unit_cost_ves * sale.quantity), 0);
    
    const grossProfitUSD = totalSalesUSD - totalCostUSD;
    const grossProfitVES = totalSalesVES - totalCostVES;
    const grossProfitMarginUSD = totalSalesUSD > 0 ? (grossProfitUSD / totalSalesUSD) * 100 : 0;
    const grossProfitMarginVES = totalSalesVES > 0 ? (grossProfitVES / totalSalesVES) * 100 : 0;

    const replacementCostUSD = salesInRange.reduce((sum, sale) => sum + (sale.replacement_cost_usd * sale.quantity), 0);
    const replacementCostVES = salesInRange.reduce((sum, sale) => sum + (sale.replacement_cost_ves * sale.quantity), 0);
    
    const replacementProfitUSD = totalSalesUSD - replacementCostUSD;
    const replacementProfitVES = totalSalesVES - replacementCostVES;
    const replacementProfitMarginUSD = totalSalesUSD > 0 ? (replacementProfitUSD / totalSalesUSD) * 100 : 0;
    const replacementProfitMarginVES = totalSalesVES > 0 ? (replacementProfitVES / totalSalesVES) * 100 : 0;

    return {
      total_sales_usd: totalSalesUSD,
      total_sales_ves: totalSalesVES,
      total_cost_usd: totalCostUSD,
      total_cost_ves: totalCostVES,
      gross_profit_usd: grossProfitUSD,
      gross_profit_ves: grossProfitVES,
      gross_profit_margin_usd: grossProfitMarginUSD,
      gross_profit_margin_ves: grossProfitMarginVES,
      replacement_cost_usd: replacementCostUSD,
      replacement_cost_ves: replacementCostVES,
      replacement_profit_usd: replacementProfitUSD,
      replacement_profit_ves: replacementProfitVES,
      replacement_profit_margin_usd: replacementProfitMarginUSD,
      replacement_profit_margin_ves: replacementProfitMarginVES,
      start_date: startDate,
      end_date: endDate,
    };
  }

  /**
   * Calculate product profitability
   */
  static calculateProductProfitability(startDate: Date, endDate: Date): ProductProfitability[] {
    const productMap = new Map<string, {
      product_id: string;
      product_name: string;
      quantity_sold: number;
      sales_usd: number;
      sales_ves: number;
      cost_usd: number;
      cost_ves: number;
      replacement_cost_usd: number;
      replacement_cost_ves: number;
    }>();

    this.salesData.forEach(sale => {
      const saleDate = new Date(sale.sale_date);
      if (saleDate < startDate || saleDate > endDate) return;

      const existing = productMap.get(sale.product_id);
      if (existing) {
        existing.quantity_sold += sale.quantity;
        existing.sales_usd += sale.unit_price_usd * sale.quantity;
        existing.sales_ves += sale.unit_price_ves * sale.quantity;
        existing.cost_usd += sale.unit_cost_usd * sale.quantity;
        existing.cost_ves += sale.unit_cost_ves * sale.quantity;
        existing.replacement_cost_usd += sale.replacement_cost_usd * sale.quantity;
        existing.replacement_cost_ves += sale.replacement_cost_ves * sale.quantity;
      } else {
        productMap.set(sale.product_id, {
          product_id: sale.product_id,
          product_name: sale.product_name,
          quantity_sold: sale.quantity,
          sales_usd: sale.unit_price_usd * sale.quantity,
          sales_ves: sale.unit_price_ves * sale.quantity,
          cost_usd: sale.unit_cost_usd * sale.quantity,
          cost_ves: sale.unit_cost_ves * sale.quantity,
          replacement_cost_usd: sale.replacement_cost_usd * sale.quantity,
          replacement_cost_ves: sale.replacement_cost_ves * sale.quantity,
        });
      }
    });

    const profitability = Array.from(productMap.values()).map(product => {
      const grossProfitUSD = product.sales_usd - product.cost_usd;
      const grossProfitVES = product.sales_ves - product.cost_ves;
      const grossProfitMarginUSD = product.sales_usd > 0 ? (grossProfitUSD / product.sales_usd) * 100 : 0;
      const grossProfitMarginVES = product.sales_ves > 0 ? (grossProfitVES / product.sales_ves) * 100 : 0;

      const replacementProfitUSD = product.sales_usd - product.replacement_cost_usd;
      const replacementProfitVES = product.sales_ves - product.replacement_cost_ves;
      const replacementProfitMarginUSD = product.sales_usd > 0 ? (replacementProfitUSD / product.sales_usd) * 100 : 0;
      const replacementProfitMarginVES = product.sales_ves > 0 ? (replacementProfitVES / product.sales_ves) * 100 : 0;

      return {
        product_id: product.product_id,
        product_name: product.product_name,
        quantity_sold: product.quantity_sold,
        sales_usd: product.sales_usd,
        sales_ves: product.sales_ves,
        cost_usd: product.cost_usd,
        cost_ves: product.cost_ves,
        replacement_cost_usd: product.replacement_cost_usd,
        replacement_cost_ves: product.replacement_cost_ves,
        gross_profit_usd: grossProfitUSD,
        gross_profit_ves: grossProfitVES,
        gross_profit_margin_usd: grossProfitMarginUSD,
        gross_profit_margin_ves: grossProfitMarginVES,
        replacement_profit_usd: replacementProfitUSD,
        replacement_profit_ves: replacementProfitVES,
        replacement_profit_margin_usd: replacementProfitMarginUSD,
        replacement_profit_margin_ves: replacementProfitMarginVES,
        profitability_rank: 0,
      };
    });

    // Sort by replacement profit margin descending
    profitability.sort((a, b) => b.replacement_profit_margin_usd - a.replacement_profit_margin_usd);

    // Assign ranks
    profitability.forEach((product, index) => {
      product.profitability_rank = index + 1;
    });

    return profitability;
  }

  /**
   * Get top profitable products
   */
  static getTopProfitableProducts(startDate: Date, endDate: Date, limit: number = 10): ProductProfitability[] {
    const profitability = this.calculateProductProfitability(startDate, endDate);
    return profitability.slice(0, limit);
  }

  /**
   * Get least profitable products
   */
  static getLeastProfitableProducts(startDate: Date, endDate: Date, limit: number = 10): ProductProfitability[] {
    const profitability = this.calculateProductProfitability(startDate, endDate);
    return profitability.slice(-limit).reverse();
  }

  /**
   * Persist sales data
   */
  private static async persistSalesData(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.salesData));
    } catch (error) {
      console.error('Error persisting sales data:', error);
    }
  }

  /**
   * Load sales data
   */
  static async loadSalesData(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.salesData = JSON.parse(stored).map((sale: any) => ({
          ...sale,
          sale_date: new Date(sale.sale_date),
        }));
      }
    } catch (error) {
      console.error('Error loading sales data:', error);
    }
  }
}
