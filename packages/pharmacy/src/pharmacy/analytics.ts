import { Invoice, Product, Batch, PharmacyDashboardMetrics, ReportType } from '@red-salud/types';

/**
 * Analytics Dashboard Manager
 * Generates comprehensive analytics and reports for pharmacy operations
 */
export class PharmacyAnalyticsManager {
  /**
   * Generate dashboard metrics
   */
  static generateDashboardMetrics(
    sales: Invoice[],
    products: Product[],
    batches: Batch[],
    exchangeRate: number
  ): PharmacyDashboardMetrics {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Today's sales
    const todaySales = sales.filter(
      sale => new Date(sale.created_at).toDateString() === today.toDateString()
    );
    const todaySalesUsd = todaySales.reduce((sum, sale) => sum + sale.total_usd, 0);
    const todaySalesVes = todaySales.reduce((sum, sale) => sum + sale.total_ves, 0);
    const todayTransactions = todaySales.length;
    const averageTicketUsd = todayTransactions > 0 ? todaySalesUsd / todayTransactions : 0;
    const averageTicketVes = todayTransactions > 0 ? todaySalesVes / todayTransactions : 0;

    // Inventory metrics
    const totalProducts = products.length;
    const lowStockProducts = products.filter(product => {
      const available = this.getAvailableStock(product.id, batches);
      return available <= product.min_stock;
    }).length;
    
    const expiringSoonBatches = this.getExpiringBatches(batches, 90);
    const expiredBatches = this.getExpiredBatches(batches);
    const expiringSoonCount = expiringSoonBatches.length;
    const expiredCount = expiredBatches.length;

    // Top selling products
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

    const topSellingProducts = Array.from(productSales.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)
      .map(item => ({
        product_id: '', // Would need to map back to product ID
        product_name: item.name,
        quantity_sold: item.quantity,
        revenue_usd: item.revenue,
      }));

    // Alerts
    const criticalAlerts = expiredCount + lowStockProducts;
    const warningAlerts = expiringSoonCount;

    return {
      today_sales_usd: todaySalesUsd,
      today_sales_ves: todaySalesVes,
      today_transactions: todayTransactions,
      average_ticket_usd: averageTicketUsd,
      average_ticket_ves: averageTicketVes,
      total_products: totalProducts,
      low_stock_count: lowStockProducts,
      expiring_soon_count: expiringSoonCount,
      expired_count: expiredCount,
      top_selling_products: topSellingProducts,
      critical_alerts: criticalAlerts,
      warning_alerts: warningAlerts,
      current_exchange_rate: exchangeRate,
      generated_at: new Date(),
    };
  }

  /**
   * Generate sales report
   */
  static generateSalesReport(
    sales: Invoice[],
    startDate: Date,
    endDate: Date
  ) {
    const periodSales = sales.filter(
      sale => {
        const saleDate = new Date(sale.created_at);
        return saleDate >= startDate && saleDate <= endDate;
      }
    );

    const totalSalesUsd = periodSales.reduce((sum, sale) => sum + sale.total_usd, 0);
    const totalSalesVes = periodSales.reduce((sum, sale) => sum + sale.total_ves, 0);
    const totalIvaUsd = periodSales.reduce((sum, sale) => sum + sale.iva_usd, 0);
    const totalIvaVes = periodSales.reduce((sum, sale) => sum + sale.iva_ves, 0);

    // Sales by payment method
    const salesByMethod = periodSales.reduce((acc, sale) => {
      sale.payments.forEach(payment => {
        const method = payment.method;
        acc[method] = (acc[method] || 0) + payment.amount_usd;
      });
      return acc;
    }, {} as Record<string, number>);

    // Sales by hour
    const salesByHour = periodSales.reduce((acc, sale) => {
      const hour = new Date(sale.created_at).getHours();
      acc[hour] = (acc[hour] || 0) + sale.total_usd;
      return acc;
    }, {} as Record<number, number>);

    // Sales by day of week
    const salesByDay = periodSales.reduce((acc, sale) => {
      const day = new Date(sale.created_at).getDay();
      acc[day] = (acc[day] || 0) + sale.total_usd;
      return acc;
    }, {} as Record<number, number>);

    return {
      report_type: ReportType.SALES,
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_sales_usd: totalSalesUsd,
      total_sales_ves: totalSalesVes,
      total_iva_usd: totalIvaUsd,
      total_iva_ves: totalIvaVes,
      total_transactions: periodSales.length,
      average_ticket_usd: periodSales.length > 0 ? totalSalesUsd / periodSales.length : 0,
      sales_by_method: salesByMethod,
      sales_by_hour: salesByHour,
      sales_by_day: salesByDay,
    };
  }

  /**
   * Generate inventory report
   */
  static generateInventoryReport(
    products: Product[],
    batches: Batch[]
  ) {
    const inventoryByProduct = products.map(product => {
      const productBatches = batches.filter(b => b.product_id === product.id);
      const available = productBatches
        .filter(b => b.quantity > 0 && new Date(b.expiry_date) > new Date())
        .reduce((sum, b) => sum + b.quantity, 0);
      const expiring = this.getExpiringBatches(productBatches, 90);
      const expired = this.getExpiredBatches(productBatches);

      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        available_stock: available,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        reorder_point: product.reorder_point,
        needs_reorder: available <= product.reorder_point,
        expiring_batches: expiring.length,
        expired_batches: expired.length,
        total_batches: productBatches.length,
      };
    });

    const totalProducts = products.length;
    const lowStock = inventoryByProduct.filter(i => i.available_stock <= i.min_stock).length;
    const outOfStock = inventoryByProduct.filter(i => i.available_stock === 0).length;
    const totalStock = inventoryByProduct.reduce((sum, i) => sum + i.available_stock, 0);

    return {
      report_type: ReportType.INVENTORY,
      total_products: totalProducts,
      low_stock_count: lowStock,
      out_of_stock_count: outOfStock,
      total_stock: totalStock,
      inventory_by_product: inventoryByProduct,
    };
  }

  /**
   * Generate profitability report
   */
  static generateProfitabilityReport(
    sales: Invoice[],
    products: Product[]
  ) {
    const profitabilityByProduct = products.map(product => {
      const productSales = sales.filter(sale =>
        sale.items.some(item => item.product_id === product.id)
      );

      const totalRevenueUsd = productSales.reduce((sum, sale) => {
        const item = sale.items.find(i => i.product_id === product.id);
        return sum + (item ? item.total_usd : 0);
      }, 0);

      const totalCostUsd = productSales.reduce((sum, sale) => {
        const item = sale.items.find(i => i.product_id === product.id);
        if (!item) return sum;
        return sum + (product.cost_price_usd * item.quantity);
      }, 0);

      const profitUsd = totalRevenueUsd - totalCostUsd;
      const profitMargin = totalRevenueUsd > 0 ? (profitUsd / totalRevenueUsd) * 100 : 0;
      const quantitySold = productSales.reduce((sum, sale) => {
        const item = sale.items.find(i => i.product_id === product.id);
        return sum + (item ? item.quantity : 0);
      }, 0);

      return {
        product_id: product.id,
        product_name: product.name,
        quantity_sold: quantitySold,
        revenue_usd: totalRevenueUsd,
        cost_usd: totalCostUsd,
        profit_usd: profitUsd,
        profit_margin_percent: profitMargin,
      };
    }).filter(p => p.quantity_sold > 0);

    const totalRevenueUsd = profitabilityByProduct.reduce((sum, p) => sum + p.revenue_usd, 0);
    const totalCostUsd = profitabilityByProduct.reduce((sum, p) => sum + p.cost_usd, 0);
    const totalProfitUsd = totalRevenueUsd - totalCostUsd;
    const overallProfitMargin = totalRevenueUsd > 0 ? (totalProfitUsd / totalRevenueUsd) * 100 : 0;

    return {
      report_type: ReportType.PROFITABILITY,
      total_revenue_usd: totalRevenueUsd,
      total_cost_usd: totalCostUsd,
      total_profit_usd: totalProfitUsd,
      overall_profit_margin_percent: overallProfitMargin,
      profitability_by_product: profitabilityByProduct
        .sort((a, b) => b.profit_usd - a.profit_usd),
    };
  }

  /**
   * Get available stock for a product
   */
  private static getAvailableStock(productId: string, batches: Batch[]): number {
    return batches
      .filter(b => 
        b.product_id === productId && 
        b.quantity > 0 && 
        new Date(b.expiry_date) > new Date()
      )
      .reduce((sum, b) => sum + b.quantity, 0);
  }

  /**
   * Get batches expiring within warning period
   */
  private static getExpiringBatches(batches: Batch[], warningDays: number): Batch[] {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);

    return batches.filter(
      batch =>
        batch.quantity > 0 &&
        new Date(batch.expiry_date) <= warningDate &&
        new Date(batch.expiry_date) > new Date()
    );
  }

  /**
   * Get expired batches
   */
  private static getExpiredBatches(batches: Batch[]): Batch[] {
    return batches.filter(
      batch =>
        batch.quantity > 0 &&
        new Date(batch.expiry_date) < new Date()
    );
  }
}

/**
 * Report Generator
 * Creates formatted reports for printing/exporting
 */
export class ReportGenerator {
  /**
   * Generate sales summary report text
   */
  static generateSalesSummaryReport(
    sales: Invoice[],
    startDate: Date,
    endDate: Date
  ): string {
    const analytics = PharmacyAnalyticsManager.generateSalesReport(sales, startDate, endDate);

    const lines: string[] = [];

    lines.push('REPORTE DE VENTAS');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Período: ${startDate.toLocaleDateString('es-VE')} - ${endDate.toLocaleDateString('es-VE')}`);
    lines.push('');

    lines.push('RESUMEN GENERAL');
    lines.push('-'.repeat(60));
    lines.push(`  Ventas Totales: $${analytics.total_sales_usd.toFixed(2)} USD`);
    lines.push(`  IVA (16%): $${analytics.total_iva_usd.toFixed(2)} USD`);
    lines.push(`  Transacciones: ${analytics.total_transactions}`);
    lines.push(`  Ticket Promedio: $${analytics.average_ticket_usd.toFixed(2)} USD`);
    lines.push('');

    lines.push('VENTAS POR MÉTODO DE PAGO');
    lines.push('-'.repeat(60));
    Object.entries(analytics.sales_by_method).forEach(([method, amount]) => {
      lines.push(`  ${method}: $${amount.toFixed(2)} USD`);
    });
    lines.push('');

    lines.push('='.repeat(60));
    lines.push(`Generado: ${new Date().toLocaleString('es-VE')}`);

    return lines.join('\n');
  }

  /**
   * Generate inventory summary report text
   */
  static generateInventorySummaryReport(
    products: Product[],
    batches: Batch[]
  ): string {
    const analytics = PharmacyAnalyticsManager.generateInventoryReport(products, batches);

    const lines: string[] = [];

    lines.push('REPORTE DE INVENTARIO');
    lines.push('='.repeat(60));
    lines.push('');

    lines.push('RESUMEN GENERAL');
    lines.push('-'.repeat(60));
    lines.push(`  Total Productos: ${analytics.total_products}`);
    lines.push(`  Stock Bajo: ${analytics.low_stock_count}`);
    lines.push(`  Sin Stock: ${analytics.out_of_stock_count}`);
    lines.push(`  Stock Total: ${analytics.total_stock}`);
    lines.push('');

    lines.push('PRODUCTOS CON STOCK BAJO');
    lines.push('-'.repeat(60));
    const lowStockProducts = analytics.inventory_by_product.filter(p => p.needs_reorder);
    if (lowStockProducts.length === 0) {
      lines.push('  Ningún producto con stock bajo');
    } else {
      lowStockProducts.slice(0, 20).forEach(product => {
        lines.push(`  ${product.product_name}`);
        lines.push(`    SKU: ${product.sku} | Stock: ${product.available_stock} | Mínimo: ${product.min_stock}`);
      });
    }
    lines.push('');

    lines.push('='.repeat(60));
    lines.push(`Generado: ${new Date().toLocaleString('es-VE')}`);

    return lines.join('\n');
  }

  /**
   * Generate profitability summary report text
   */
  static generateProfitabilitySummaryReport(
    sales: Invoice[],
    products: Product[]
  ): string {
    const analytics = PharmacyAnalyticsManager.generateProfitabilityReport(sales, products);

    const lines: string[] = [];

    lines.push('REPORTE DE RENTABILIDAD');
    lines.push('='.repeat(60));
    lines.push('');

    lines.push('RESUMEN GENERAL');
    lines.push('-'.repeat(60));
    lines.push(`  Ingresos Totales: $${analytics.total_revenue_usd.toFixed(2)} USD`);
    lines.push(`  Costos Totales: $${analytics.total_cost_usd.toFixed(2)} USD`);
    lines.push(`  Ganancia Neta: $${analytics.total_profit_usd.toFixed(2)} USD`);
    lines.push(`  Margen de Ganancia: ${analytics.overall_profit_margin_percent.toFixed(2)}%`);
    lines.push('');

    lines.push('TOP 10 PRODUCTOS MÁS RENTABLES');
    lines.push('-'.repeat(60));
    analytics.profitability_by_product.slice(0, 10).forEach((product, index) => {
      lines.push(`  ${index + 1}. ${product.product_name}`);
      lines.push(`     Ingresos: $${product.revenue_usd.toFixed(2)}`);
      lines.push(`     Ganancia: $${product.profit_usd.toFixed(2)} (${product.profit_margin_percent.toFixed(1)}%)`);
      lines.push(`     Cantidad: ${product.quantity_sold}`);
      lines.push('');
    });

    lines.push('='.repeat(60));
    lines.push(`Generado: ${new Date().toLocaleString('es-VE')}`);

    return lines.join('\n');
  }

  /**
   * Export report to CSV
   */
  static exportToCSV(data: any[], headers: string[]): string {
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value ?? '');
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        }).join(',')
      ),
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate sales CSV
   */
  static generateSalesCSV(sales: Invoice[]): string {
    const headers = ['invoice_number', 'date', 'customer_name', 'total_usd', 'total_ves', 'payment_method', 'status'];
    const data = sales.map(sale => ({
      invoice_number: sale.invoice_number,
      date: new Date(sale.created_at).toISOString(),
      customer_name: sale.customer_name || '',
      total_usd: sale.total_usd,
      total_ves: sale.total_ves,
      payment_method: sale.payments.map(p => p.method).join(','),
      status: sale.status,
    }));

    return this.exportToCSV(data, headers);
  }

  /**
   * Generate inventory CSV
   */
  static generateInventoryCSV(products: Product[], batches: Batch[]): string {
    const headers = ['product_id', 'name', 'sku', 'available_stock', 'min_stock', 'max_stock', 'category'];
    const data = products.map(product => {
      const available = batches
        .filter(b => b.product_id === product.id && b.quantity > 0)
        .reduce((sum, b) => sum + b.quantity, 0);

      return {
        product_id: product.id,
        name: product.name,
        sku: product.sku,
        available_stock: available,
        min_stock: product.min_stock,
        max_stock: product.max_stock,
        category: product.category,
      };
    });

    return this.exportToCSV(data, headers);
  }
}
