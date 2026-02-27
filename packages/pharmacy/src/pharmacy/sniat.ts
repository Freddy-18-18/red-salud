import { Invoice, ReportType } from '@red-salud/types';

/**
 * SENIAT Fiscal Compliance Manager
 * Handles Venezuelan tax authority compliance requirements
 */
export class SENIATComplianceManager {
  /**
   * Generate fiscal invoice number
   * Format: INV-YYYYMMDD-XXXX
   */
  static generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    
    return `INV-${year}${month}${day}-${sequence}`;
  }

  /**
   * Generate fiscal control number
   * Format: FC-XXXXX
   */
  static generateFiscalControlNumber(): string {
    const sequence = String(Math.floor(Math.random() * 100000)).padStart(5, '0');
    return `FC-${sequence}`;
  }

  /**
   * Validate invoice for SENIAT compliance
   */
  static validateInvoice(invoice: Invoice): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!invoice.invoice_number) {
      errors.push('Número de factura es requerido');
    }

    if (!invoice.items || invoice.items.length === 0) {
      errors.push('La factura debe tener al menos un item');
    }

    // Check customer information for invoices above threshold
    const totalUsd = invoice.total_usd;
    if (totalUsd > 100 && !invoice.patient_id && !invoice.customer_ci) {
      errors.push('Facturas mayores a $100 requieren información del cliente');
    }

    // Check payment method compliance
    if (invoice.payments.length === 0) {
      errors.push('Debe especificar al menos un método de pago');
    }

    // Validate IVA calculations
    const calculatedIvaUsd = invoice.items.reduce(
      (sum, item) => sum + (item.subtotal_usd * item.iva_rate),
      0
    );

    if (Math.abs(calculatedIvaUsd - invoice.iva_usd) > 0.01) {
      errors.push('Cálculo de IVA incorrecto');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate Z-Report (Cierre de Caja Fiscal)
   * Daily fiscal closing report
   */
  static generateZReport(sales: Invoice[], date: Date) {
    const daySales = sales.filter(
      sale => new Date(sale.created_at).toDateString() === date.toDateString()
    );

    const totalSales = daySales.reduce((sum, sale) => sum + sale.total_usd, 0);
    const totalIva = daySales.reduce((sum, sale) => sum + sale.iva_usd, 0);
    const totalExempt = daySales.reduce((sum, sale) => {
      return sum + sale.items
        .filter(item => item.iva_rate === 0)
        .reduce((sum, item) => sum + item.subtotal_usd, 0);
    }, 0);
    const totalTaxable = totalSales - totalExempt;

    const transactionsByMethod = daySales.reduce((acc, sale) => {
      sale.payments.forEach(payment => {
        const method = payment.method;
        acc[method] = (acc[method] || 0) + payment.amount_usd;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      report_type: ReportType.Z_REPORT,
      report_number: this.generateInvoiceNumber(),
      date: date.toISOString(),
      
      // Totals
      total_sales_usd: totalSales,
      total_sales_ves: daySales.reduce((sum, sale) => sum + sale.total_ves, 0),
      total_iva_usd: totalIva,
      total_iva_ves: daySales.reduce((sum, sale) => sum + sale.iva_ves, 0),
      total_taxable_usd: totalTaxable,
      total_exempt_usd: totalExempt,
      
      // Counts
      total_transactions: daySales.length,
      average_ticket_usd: daySales.length > 0 ? totalSales / daySales.length : 0,
      
      // Payment methods breakdown
      payment_methods: transactionsByMethod,
      
      // Items breakdown
      items_sold: daySales.reduce((sum, sale) => 
        sum + sale.items.reduce((sum, item) => sum + item.quantity, 0),
        0
      ),
      
      // Time breakdown
      sales_by_hour: this.groupSalesByHour(daySales),
    };
  }

  /**
   * Generate X-Report (Reporte de Corte)
   * Interim sales report without closing fiscal day
   */
  static generateXReport(sales: Invoice[], startDate: Date, endDate: Date) {
    const periodSales = sales.filter(
      sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= startDate && saleDate <= endDate;
      }
    );

    const totalSales = periodSales.reduce((sum, sale) => sum + sale.total_usd, 0);
    const totalIva = periodSales.reduce((sum, sale) => sum + sale.iva_usd, 0);

    return {
      report_type: ReportType.X_CUT,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      
      total_sales_usd: totalSales,
      total_sales_ves: periodSales.reduce((sum, sale) => sum + sale.total_ves, 0),
      total_iva_usd: totalIva,
      total_iva_ves: periodSales.reduce((sum, sale) => sum + sale.iva_ves, 0),
      
      total_transactions: periodSales.length,
      average_ticket_usd: periodSales.length > 0 ? totalSales / periodSales.length : 0,
      
      top_products: this.getTopProducts(periodSales, 10),
      payment_methods: this.getPaymentMethodsBreakdown(periodSales),
    };
  }

  /**
   * Generate psychotropic substances report
   * Required for controlled substances tracking
   */
  static generatePsychotropicReport(sales: Invoice[], date: Date) {
    const daySales = sales.filter(
      sale => new Date(sale.created_at).toDateString() === date.toDateString()
    );

    const psychotropicItems = daySales.flatMap(sale =>
      sale.items.filter(item => 
        item.product_name.toLowerCase().includes('psicotrópico') ||
        item.product_name.toLowerCase().includes('controlada')
      )
    );

    return {
      report_type: ReportType.PSYCHOTROPIC,
      date: date.toISOString(),
      
      total_items: psychotropicItems.length,
      total_quantity: psychotropicItems.reduce((sum, item) => sum + item.quantity, 0),
      
      items: psychotropicItems.map(item => ({
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        total_usd: item.total_usd,
      })),
    };
  }

  /**
   * Group sales by hour
   */
  private static groupSalesByHour(sales: Invoice[]): Record<number, number> {
    return sales.reduce((acc, sale) => {
      const hour = new Date(sale.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + sale.total_usd;
      return acc;
    }, {} as Record<number, number>);
  }

  /**
   * Get top selling products
   */
  private static getTopProducts(sales: Invoice[], limit: number) {
    const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

    sales.forEach(sale => {
      sale.items.forEach(item => {
        const existing = productSales.get(item.product_id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.total_usd;
        } else {
          productSales.set(item.product_id, {
            name: item.product_name,
            quantity: item.quantity,
            revenue: item.total_usd,
          });
        }
      });
    });

    return Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map(item => ({
        product_name: item.name,
        quantity_sold: item.quantity,
        revenue_usd: item.revenue,
      }));
  }

  /**
   * Get payment methods breakdown
   */
  private static getPaymentMethodsBreakdown(sales: Invoice[]) {
    return sales.reduce((acc, sale) => {
      sale.payments.forEach(payment => {
        const method = payment.method;
        acc[method] = (acc[method] || 0) + payment.amount_usd;
      });
      return acc;
    }, {} as Record<string, number>);
  }

  /**
   * Check if invoice requires customer identification
   */
  static requiresCustomerIdentification(totalUsd: number): boolean {
    return totalUsd > 100;
  }

  /**
   * Format invoice for fiscal printer
   */
  static formatInvoiceForPrinter(invoice: Invoice): string {
    const lines: string[] = [];

    lines.push('='.repeat(40));
    lines.push('FACTURA FISCAL');
    lines.push('='.repeat(40));
    lines.push(`Número: ${invoice.invoice_number}`);
    lines.push(`Fecha: ${new Date(invoice.created_at).toLocaleString('es-VE')}`);
    lines.push(`Control Fiscal: ${invoice.fiscal_control_number || 'N/A'}`);
    lines.push('');

    if (invoice.customer_name) {
      lines.push('Cliente:');
      lines.push(`  Nombre: ${invoice.customer_name}`);
      if (invoice.customer_ci) {
        lines.push(`  CI/RIF: ${invoice.customer_ci}`);
      }
      lines.push('');
    }

    lines.push('Items:');
    lines.push('-'.repeat(40));
    invoice.items.forEach((item, index) => {
      lines.push(`${index + 1}. ${item.product_name}`);
      lines.push(`   Cantidad: ${item.quantity} x $${item.unit_price_usd.toFixed(2)}`);
      lines.push(`   Subtotal: $${item.subtotal_usd.toFixed(2)}`);
      if (item.iva_rate > 0) {
        lines.push(`   IVA (${(item.iva_rate * 100).toFixed(0)}%): $${item.iva_usd.toFixed(2)}`);
      }
      lines.push('');
    });

    lines.push('='.repeat(40));
    lines.push('Resumen:');
    lines.push(`  Subtotal Gravado: $${invoice.subtotal_usd.toFixed(2)}`);
    lines.push(`  IVA (16%): $${invoice.iva_usd.toFixed(2)}`);
    lines.push(`  Total Exento: $${invoice.items
      .filter(item => item.iva_rate === 0)
      .reduce((sum, item) => sum + item.subtotal_usd, 0)
      .toFixed(2)}`);
    lines.push(`  TOTAL: $${invoice.total_usd.toFixed(2)}`);
    lines.push('='.repeat(40));

    lines.push('Métodos de Pago:');
    invoice.payments.forEach(payment => {
      lines.push(`  ${payment.method}: $${payment.amount_usd.toFixed(2)}`);
    });

    if (invoice.change_usd > 0) {
      lines.push(`  Cambio: $${invoice.change_usd.toFixed(2)}`);
    }

    lines.push('');
    lines.push('¡Gracias por su compra!');

    return lines.join('\n');
  }

  /**
   * Validate fiscal printer connection
   */
  static async validateFiscalPrinter(printerId: string): Promise<{ connected: boolean; error?: string }> {
    // In a real implementation, this would check the fiscal printer
    // For now, we'll simulate the check
    return {
      connected: true,
    };
  }

  /**
   * Send Z-Report to SENIAT
   */
  static async sendZReportToSENIAT(zReport: any): Promise<{ success: boolean; error?: string }> {
    // In a real implementation, this would send the report to SENIAT
    // For now, we'll simulate the transmission
    console.log('Sending Z-Report to SENIAT:', zReport);
    
    return {
      success: true,
    };
  }
}
