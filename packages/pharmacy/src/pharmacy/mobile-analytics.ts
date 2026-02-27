import { v4 as uuidv4 } from 'uuid';
import {
  MobileReport,
  TimeRange,
  ChartType,
} from '@red-salud/types';

export interface GenerateReportOptions {
  report_name: string;
  time_range: TimeRange;
  start_date: Date;
  end_date: Date;
  comparison_year?: number;
  generated_by: string;
  warehouse_id?: string;
}

export class MobileAnalyticsManager {
  private reports: MobileReport[] = [];

  constructor() {
    this.loadReports();
  }

  async loadReports(): Promise<void> {
    const stored = localStorage.getItem('mobile_reports');
    if (stored) {
      this.reports = JSON.parse(stored) as MobileReport[];
    }
  }

  async saveReports(): Promise<void> {
    localStorage.setItem('mobile_reports', JSON.stringify(this.reports));
  }

  async generateReport(options: GenerateReportOptions): Promise<MobileReport> {
    const salesData = this.generateSalesData(options.start_date, options.end_date);
    const comparisonData = options.comparison_year
      ? this.generateComparisonData(options.comparison_year)
      : undefined;

    const totalSalesUSD = salesData.reduce((sum, d) => sum + d.sales_usd, 0);
    const totalSalesVES = salesData.reduce((sum, d) => sum + d.sales_ves, 0);
    const totalTransactions = salesData.reduce((sum, d) => sum + d.transactions, 0);

    const report: MobileReport = {
      id: uuidv4(),
      report_number: `MOB-${Date.now()}`,
      report_name: options.report_name,
      time_range: options.time_range,
      start_date: options.start_date,
      end_date: options.end_date,
      sales_data: salesData,
      comparison_year: options.comparison_year,
      comparison_data: comparisonData,
      total_sales_usd: totalSalesUSD,
      total_sales_ves: totalSalesVES,
      total_transactions: totalTransactions,
      average_ticket_usd: totalTransactions > 0 ? totalSalesUSD / totalTransactions : 0,
      average_ticket_ves: totalTransactions > 0 ? totalSalesVES / totalTransactions : 0,
      growth_rate: comparisonData ? this.calculateGrowthRate(totalSalesUSD, comparisonData) : undefined,
      charts: this.generateCharts(salesData),
      generated_by: options.generated_by,
      warehouse_id: options.warehouse_id,
      is_cached: false,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.reports.push(report);
    await this.saveReports();

    return report;
  }

  private generateSalesData(startDate: Date, endDate: Date): MobileReport['sales_data'] {
    const data: MobileReport['sales_data'] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const transactions = Math.floor(Math.random() * 50) + 10;
      const salesUSD = transactions * (Math.random() * 50 + 10);
      const salesVES = salesUSD * 35; // Approximate exchange rate

      data.push({
        date: new Date(currentDate),
        sales_usd: salesUSD,
        sales_ves: salesVES,
        transactions,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }

  private generateComparisonData(year: number): MobileReport['comparison_data'] {
    return [
      { year, sales_usd: 100000 + Math.random() * 50000, sales_ves: 3500000 + Math.random() * 1750000, transactions: 2000 + Math.floor(Math.random() * 1000) },
      { year: year - 1, sales_usd: 90000 + Math.random() * 40000, sales_ves: 3150000 + Math.random() * 1400000, transactions: 1800 + Math.floor(Math.random() * 800) },
      { year: year - 2, sales_usd: 80000 + Math.random() * 30000, sales_ves: 2800000 + Math.random() * 1050000, transactions: 1600 + Math.floor(Math.random() * 600) },
    ];
  }

  private calculateGrowthRate(currentSalesUSD: number, comparisonData: MobileReport['comparison_data']): number {
    if (!comparisonData || comparisonData.length === 0) return 0;

    const previousYearSales = comparisonData.at(-1)?.sales_usd ?? 0;
    return previousYearSales > 0 ? ((currentSalesUSD - previousYearSales) / previousYearSales) * 100 : 0;
  }

  private generateCharts(salesData: MobileReport['sales_data']): MobileReport['charts'] {
    const cumulativeData: Array<{ date: string; cumulative_usd: number; cumulative_ves: number }> = [];
    let runningUSD = 0;
    let runningVES = 0;

    for (const day of salesData) {
      runningUSD += day.sales_usd;
      runningVES += day.sales_ves;
      cumulativeData.push({
        date: day.date.toISOString().split('T')[0] ?? '',
        cumulative_usd: runningUSD,
        cumulative_ves: runningVES,
      });
    }

    return [
      {
        chart_type: ChartType.LINE,
        title: 'Ventas Diarias',
        data: salesData.map((d) => ({
          date: d.date.toISOString().split('T')[0] ?? '',
          sales_usd: d.sales_usd,
          sales_ves: d.sales_ves,
        })),
      },
      {
        chart_type: ChartType.BAR,
        title: 'Transacciones',
        data: salesData.map((d) => ({
          date: d.date.toISOString().split('T')[0] ?? '',
          transactions: d.transactions,
        })),
      },
      {
        chart_type: ChartType.AREA,
        title: 'Ventas Acumuladas',
        data: cumulativeData,
      },
    ];
  }

  getReport(reportId: string): MobileReport | undefined {
    return this.reports.find((r) => r.id === reportId);
  }

  getReports(userId?: string, limit?: number): MobileReport[] {
    let reports = [...this.reports];

    if (userId) {
      reports = reports.filter((r) => r.generated_by === userId);
    }

    reports.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return limit ? reports.slice(0, limit) : reports;
  }

  async updateReport(reportId: string, updates: Partial<MobileReport>): Promise<MobileReport | null> {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return null;

    const updated: MobileReport = {
      ...report,
      ...updates,
      updated_at: new Date(),
    };

    const index = this.reports.findIndex((r) => r.id === reportId);
    this.reports[index] = updated;
    await this.saveReports();

    return updated;
  }

  async deleteReport(reportId: string): Promise<boolean> {
    const index = this.reports.findIndex((r) => r.id === reportId);
    if (index === -1) return false;

    this.reports.splice(index, 1);
    await this.saveReports();

    return true;
  }

  async exportReport(reportId: string, format: 'json' | 'csv' | 'pdf'): Promise<{ success: boolean; data?: string; error?: string }> {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) {
      return { success: false, error: 'Report not found' };
    }

    try {
      let data: string;

      switch (format) {
        case 'json':
          data = JSON.stringify(report, null, 2);
          break;
        case 'csv':
          data = this.convertToCSV(report);
          break;
        case 'pdf':
          data = 'PDF export would be implemented with a PDF library';
          break;
        default:
          return { success: false, error: 'Unsupported format' };
      }

      report.export_format = format;
      report.export_path = `/exports/${report.report_number}.${format}`;
      report.updated_at = new Date();
      await this.saveReports();

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }

  private convertToCSV(report: MobileReport): string {
    const headers = ['Date', 'Sales USD', 'Sales VES', 'Transactions'];
    const rows = report.sales_data.map((d) => [
      d.date.toISOString().split('T')[0],
      d.sales_usd.toFixed(2),
      d.sales_ves.toFixed(2),
      d.transactions,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  getReportStats() {
    const total = this.reports.length;
    const cached = this.reports.filter((r) => r.is_cached).length;
    const expired = this.reports.filter((r) => r.cache_expiry && r.cache_expiry < new Date()).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const generatedToday = this.reports.filter((r) => r.created_at >= today).length;

    return {
      total,
      cached,
      expired,
      generatedToday,
    };
  }

  async cleanupExpiredReports(): Promise<number> {
    const now = new Date();
    const expiredReports = this.reports.filter((r) => r.cache_expiry && r.cache_expiry < now);

    for (const report of expiredReports) {
      const index = this.reports.findIndex((r) => r.id === report.id);
      if (index > -1) {
        this.reports.splice(index, 1);
      }
    }

    await this.saveReports();

    return expiredReports.length;
  }

  async cacheReport(reportId: string, expiryHours: number = 24): Promise<MobileReport | null> {
    const report = this.reports.find((r) => r.id === reportId);
    if (!report) return null;

    report.is_cached = true;
    report.cache_expiry = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    report.updated_at = new Date();

    await this.saveReports();

    return report;
  }

  getCachedReports(): MobileReport[] {
    return this.reports.filter((r) => r.is_cached && (!r.cache_expiry || r.cache_expiry > new Date()));
  }
}
