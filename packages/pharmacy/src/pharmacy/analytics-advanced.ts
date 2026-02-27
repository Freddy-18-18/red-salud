import { Patient, Product } from '@red-salud/types';

/**
 * Treatment Adherence Record
 */
export interface TreatmentAdherence {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone?: string;
  patient_email?: string;
  
  product_id: string;
  product_name: string;
  active_ingredient: string;
  
  purchase_date: Date;
  expected_duration_days: number;
  next_refill_date: Date;
  
  adherence_score: number; // 0-100
  doses_taken?: number;
  doses_missed?: number;
  
  last_reminder_sent?: Date;
  reminder_method?: 'whatsapp' | 'sms' | 'email';
  reminder_response?: 'yes' | 'no' | 'pending';
  
  is_active: boolean;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Profitability Metrics
 */
export interface ProfitabilityMetrics {
  period: { start: Date; end: Date };
  
  // Revenue
  revenue_usd: number;
  revenue_ves: number;
  revenue_growth_percentage: number;
  
  // Costs
  cost_of_goods_sold_usd: number;
  cost_of_goods_sold_ves: number;
  operating_costs_usd: number;
  operating_costs_ves: number;
  
  // Margins
  gross_margin_usd: number;
  gross_margin_ves: number;
  gross_margin_percentage: number;
  
  net_margin_usd: number;
  net_margin_ves: number;
  net_margin_percentage: number;
  
  // IGTF
  igtf_collected_usd: number;
  igtf_collected_ves: number;
  igtf_to_declare_usd: number;
  igtf_to_declare_ves: number;
  
  // Inventory
  inventory_turnover_ratio: number;
  days_sales_of_inventory: number;
  
  // Exchange Rate Impact
  exchange_rate_start: number;
  exchange_rate_end: number;
  exchange_rate_impact_usd: number;
  
  generated_at: Date;
}

/**
 * Treatment Adherence CRM Manager
 * Manages patient treatment adherence with automatic alerts
 */
export class TreatmentAdherenceCRM {
  private static adherenceRecords: TreatmentAdherence[] = [];
  private static STORAGE_KEY = 'treatment_adherence';

  /**
   * Create adherence record
   */
  static async createAdherenceRecord(data: {
    patientId: string;
    patientName: string;
    patientPhone?: string;
    patientEmail?: string;
    productId: string;
    productName: string;
    activeIngredient: string;
    purchaseDate: Date;
    expectedDurationDays: number;
  }): Promise<TreatmentAdherence> {
    const nextRefillDate = new Date(data.purchaseDate);
    nextRefillDate.setDate(nextRefillDate.getDate() + data.expectedDurationDays - 3);

    const record: TreatmentAdherence = {
      id: crypto.randomUUID(),
      patient_id: data.patientId,
      patient_name: data.patientName,
      patient_phone: data.patientPhone,
      patient_email: data.patientEmail,
      product_id: data.productId,
      product_name: data.productName,
      active_ingredient: data.activeIngredient,
      purchase_date: data.purchaseDate,
      expected_duration_days: data.expectedDurationDays,
      next_refill_date: nextRefillDate,
      adherence_score: 100,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.adherenceRecords.push(record);
    await this.persistRecords();

    return record;
  }

  /**
   * Generate WhatsApp message for adherence reminder
   */
  static generateWhatsAppReminder(record: TreatmentAdherence): string {
    const daysUntilRefill = Math.ceil(
      (record.next_refill_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return `🏥 *Farmacia Red Salud - Recordatorio de Tratamiento*\n\n` +
      `Hola ${record.patient_name},\n\n` +
      `Es hora de reponer tu tratamiento para ${record.product_name}.\n\n` +
      `⏰ Días restantes: ${daysUntilRefill}\n` +
      `💊 Medicamento: ${record.product_name}\n\n` +
      `Responde SÍ para apartar tu medicamento o visítanos en la farmacia.\n\n` +
      `📍 Dirección: [Tu dirección]\n` +
      `📞 Teléfono: [Tu teléfono]\n\n` +
      `Gracias por confiar en nosotros.`;
  }

  /**
   * Generate SMS message for adherence reminder
   */
  static generateSMSReminder(record: TreatmentAdherence): string {
    const daysUntilRefill = Math.ceil(
      (record.next_refill_date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return `Farmacia Red Salud: Hola ${record.patient_name}, es hora de reponer tu tratamiento. Días restantes: ${daysUntilRefill}. Responde SI para apartar o visitanos.`;
  }

  /**
   * Get records needing reminders
   */
  static getRecordsNeedingReminders(daysAhead: number = 3): TreatmentAdherence[] {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysAhead);

    return this.adherenceRecords.filter(record => {
      if (!record.is_active) return false;
      return record.next_refill_date <= reminderDate && record.next_refill_date >= today;
    });
  }

  /**
   * Mark reminder as sent
   */
  static async markReminderSent(
    recordId: string,
    method: 'whatsapp' | 'sms' | 'email'
  ): Promise<void> {
    const record = this.adherenceRecords.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');

    record.last_reminder_sent = new Date();
    record.reminder_method = method;
    record.reminder_response = 'pending';
    record.updated_at = new Date();

    await this.persistRecords();
  }

  /**
   * Record reminder response
   */
  static async recordReminderResponse(
    recordId: string,
    response: 'yes' | 'no'
  ): Promise<void> {
    const record = this.adherenceRecords.find(r => r.id === recordId);
    if (!record) throw new Error('Record not found');

    record.reminder_response = response;
    record.updated_at = new Date();

    if (response === 'yes') {
      record.adherence_score = Math.min(100, record.adherence_score + 5);
    } else {
      record.adherence_score = Math.max(0, record.adherence_score - 10);
    }

    await this.persistRecords();
  }

  /**
   * Get adherence statistics
   */
  static getAdherenceStatistics(): {
    total_patients: number;
    average_adherence_score: number;
    high_adherence: number;
    medium_adherence: number;
    low_adherence: number;
    reminders_sent: number;
    positive_responses: number;
  } {
    const totalPatients = this.adherenceRecords.length;
    const averageScore = totalPatients > 0
      ? this.adherenceRecords.reduce((sum, r) => sum + r.adherence_score, 0) / totalPatients
      : 0;

    const highAdherence = this.adherenceRecords.filter(r => r.adherence_score >= 80).length;
    const mediumAdherence = this.adherenceRecords.filter(
      r => r.adherence_score >= 50 && r.adherence_score < 80
    ).length;
    const lowAdherence = this.adherenceRecords.filter(r => r.adherence_score < 50).length;

    const remindersSent = this.adherenceRecords.filter(r => r.last_reminder_sent).length;
    const positiveResponses = this.adherenceRecords.filter(r => r.reminder_response === 'yes').length;

    return {
      total_patients: totalPatients,
      average_adherence_score: averageScore,
      high_adherence: highAdherence,
      medium_adherence: mediumAdherence,
      low_adherence: lowAdherence,
      reminders_sent: remindersSent,
      positive_responses: positiveResponses,
    };
  }

  /**
   * Persist records
   */
  private static async persistRecords(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.adherenceRecords));
    } catch (error) {
      console.error('Error persisting treatment adherence records:', error);
    }
  }

  /**
   * Load records
   */
  static async loadRecords(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.adherenceRecords = JSON.parse(stored).map((record: any) => ({
          ...record,
          purchase_date: new Date(record.purchase_date),
          next_refill_date: new Date(record.next_refill_date),
          last_reminder_sent: record.last_reminder_sent ? new Date(record.last_reminder_sent) : undefined,
          created_at: new Date(record.created_at),
          updated_at: new Date(record.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading treatment adherence records:', error);
    }
  }
}

/**
 * Real Profitability Dashboard Manager
 * Calculates real contribution margin after all costs and taxes
 */
export class RealProfitabilityDashboard {
  /**
   * Calculate profitability metrics
   */
  static calculateProfitabilityMetrics(
    salesData: Array<{
      date: Date;
      revenue_usd: number;
      revenue_ves: number;
      cost_usd: number;
      cost_ves: number;
    }>,
    operatingCosts: { usd: number; ves: number },
    igtfCollected: { usd: number; ves: number },
    exchangeRates: { start: number; end: number },
    inventoryData: {
      average_inventory_usd: number;
      cost_of_goods_sold_usd: number;
    }
  ): ProfitabilityMetrics {
    const startDate = salesData[0]?.date || new Date();
    const endDate = salesData[salesData.length - 1]?.date || new Date();

    // Calculate totals
    const totalRevenueUSD = salesData.reduce((sum, s) => sum + s.revenue_usd, 0);
    const totalRevenueVES = salesData.reduce((sum, s) => sum + s.revenue_ves, 0);
    const totalCOGSUSD = salesData.reduce((sum, s) => sum + s.cost_usd, 0);
    const totalCOGSVES = salesData.reduce((sum, s) => sum + s.cost_ves, 0);

    // Gross margin
    const grossMarginUSD = totalRevenueUSD - totalCOGSUSD;
    const grossMarginVES = totalRevenueVES - totalCOGSVES;
    const grossMarginPercentage = totalRevenueUSD > 0
      ? (grossMarginUSD / totalRevenueUSD) * 100
      : 0;

    // Net margin (after operating costs)
    const netMarginUSD = grossMarginUSD - operatingCosts.usd;
    const netMarginVES = grossMarginVES - operatingCosts.ves;
    const netMarginPercentage = totalRevenueUSD > 0
      ? (netMarginUSD / totalRevenueUSD) * 100
      : 0;

    // Inventory turnover
    const inventoryTurnoverRatio = totalCOGSUSD / inventoryData.average_inventory_usd;
    const daysSalesOfInventory = inventoryTurnoverRatio > 0
      ? 365 / inventoryTurnoverRatio
      : 0;

    // Exchange rate impact
    const exchangeRateImpactUSD = totalRevenueUSD * (exchangeRates.end - exchangeRates.start);

    return {
      period: { start: startDate, end: endDate },
      revenue_usd: totalRevenueUSD,
      revenue_ves: totalRevenueVES,
      revenue_growth_percentage: 0, // Would need previous period data
      cost_of_goods_sold_usd: totalCOGSUSD,
      cost_of_goods_sold_ves: totalCOGSVES,
      operating_costs_usd: operatingCosts.usd,
      operating_costs_ves: operatingCosts.ves,
      gross_margin_usd: grossMarginUSD,
      gross_margin_ves: grossMarginVES,
      gross_margin_percentage: grossMarginPercentage,
      net_margin_usd: netMarginUSD,
      net_margin_ves: netMarginVES,
      net_margin_percentage: netMarginPercentage,
      igtf_collected_usd: igtfCollected.usd,
      igtf_collected_ves: igtfCollected.ves,
      igtf_to_declare_usd: igtfCollected.usd,
      igtf_to_declare_ves: igtfCollected.ves,
      inventory_turnover_ratio: inventoryTurnoverRatio,
      days_sales_of_inventory: daysSalesOfInventory,
      exchange_rate_start: exchangeRates.start,
      exchange_rate_end: exchangeRates.end,
      exchange_rate_impact_usd: exchangeRateImpactUSD,
      generated_at: new Date(),
    };
  }

  /**
   * Generate profitability report
   */
  static generateProfitabilityReport(metrics: ProfitabilityMetrics): {
    summary: {
      total_revenue_usd: number;
      total_revenue_ves: number;
      gross_margin_usd: number;
      gross_margin_ves: number;
      net_margin_usd: number;
      net_margin_ves: number;
      net_margin_percentage: number;
    };
    insights: string[];
    recommendations: string[];
  } {
    const insights: string[] = [];
    const recommendations: string[] = [];

    // Gross margin analysis
    if (metrics.gross_margin_percentage < 20) {
      insights.push(`Margen bruto bajo (${metrics.gross_margin_percentage.toFixed(1)}%)`);
      recommendations.push('Revisar precios de venta y negociar mejores condiciones con proveedores');
    } else if (metrics.gross_margin_percentage > 40) {
      insights.push(`Margen bruto alto (${metrics.gross_margin_percentage.toFixed(1)}%)`);
      recommendations.push('Considerar promociones para aumentar volumen de ventas');
    }

    // Net margin analysis
    if (metrics.net_margin_percentage < 10) {
      insights.push(`Margen neto bajo (${metrics.net_margin_percentage.toFixed(1)}%)`);
      recommendations.push('Reducir costos operativos y optimizar gestión de inventario');
    }

    // Inventory analysis
    if (metrics.days_sales_of_inventory > 90) {
      insights.push(`Inventario alto (${metrics.days_sales_of_inventory.toFixed(0)} días de venta)`);
      recommendations.push('Implementar programa de liquidación de inventario lento');
    } else if (metrics.days_sales_of_inventory < 30) {
      insights.push(`Inventario bajo (${metrics.days_sales_of_inventory.toFixed(0)} días de venta)`);
      recommendations.push('Aumentar stock de productos de alta rotación para evitar desabastecimiento');
    }

    // Exchange rate impact
    if (Math.abs(metrics.exchange_rate_impact_usd) > 1000) {
      insights.push(`Impacto significativo por tasa de cambio: $${metrics.exchange_rate_impact_usd.toFixed(2)}`);
      recommendations.push('Revisar estrategia de precios y consideración de ajustes por inflación');
    }

    return {
      summary: {
        total_revenue_usd: metrics.revenue_usd,
        total_revenue_ves: metrics.revenue_ves,
        gross_margin_usd: metrics.gross_margin_usd,
        gross_margin_ves: metrics.gross_margin_ves,
        net_margin_usd: metrics.net_margin_usd,
        net_margin_ves: metrics.net_margin_ves,
        net_margin_percentage: metrics.net_margin_percentage,
      },
      insights,
      recommendations,
    };
  }

  /**
   * Calculate product profitability
   */
  static calculateProductProfitability(
    product: Product,
    salesData: Array<{ quantity: number; price_usd: number }>,
    periodDays: number = 30
  ): {
    product_id: string;
    product_name: string;
    total_sales_usd: number;
    total_cost_usd: number;
    gross_margin_usd: number;
    gross_margin_percentage: number;
    contribution_margin: number;
    turnover_rate: number;
  } {
    const totalQuantity = salesData.reduce((sum, s) => sum + s.quantity, 0);
    const totalSalesUSD = salesData.reduce((sum, s) => sum + (s.quantity * s.price_usd), 0);
    const totalCostUSD = totalQuantity * product.cost_price_usd;

    const grossMarginUSD = totalSalesUSD - totalCostUSD;
    const grossMarginPercentage = totalSalesUSD > 0 ? (grossMarginUSD / totalSalesUSD) * 100 : 0;

    const turnoverRate = periodDays > 0 ? totalQuantity / periodDays : 0;

    return {
      product_id: product.id,
      product_name: product.name,
      total_sales_usd: totalSalesUSD,
      total_cost_usd: totalCostUSD,
      gross_margin_usd: grossMarginUSD,
      gross_margin_percentage: grossMarginPercentage,
      contribution_margin: grossMarginUSD,
      turnover_rate: turnoverRate,
    };
  }

  /**
   * Generate top products report
   */
  static generateTopProductsReport(
    products: Product[],
    salesData: Map<string, Array<{ quantity: number; price_usd: number }>>,
    periodDays: number = 30,
    limit: number = 10
  ): Array<{
    product_id: string;
    product_name: string;
    total_sales_usd: number;
    gross_margin_usd: number;
    gross_margin_percentage: number;
    contribution_margin: number;
    rank: number;
  }> {
    const productProfitability = products.map(product => {
      const productSales = salesData.get(product.id) || [];
      const profitability = this.calculateProductProfitability(product, productSales, periodDays);

      return {
        ...profitability,
        rank: 0,
      };
    });

    return productProfitability
      .sort((a, b) => b.contribution_margin - a.contribution_margin)
      .slice(0, limit)
      .map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
  }
}
