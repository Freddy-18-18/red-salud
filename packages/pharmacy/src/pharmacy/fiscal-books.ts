/**
 * Fiscal Book Entry
 * Represents a single entry in Sales or Purchase Book
 */
export interface FiscalBookEntry {
  id: string;
  entry_type: 'sale' | 'purchase';
  
  // Invoice details
  invoice_number: string;
  invoice_date: Date;
  
  // Customer/Supplier info
  'customer_or_supplier_rif': string;
  'customer_or_supplier_name': string;
  
  // Amounts
  'base_amount_usd': number;
  'base_amount_ves': number;
  'iva_amount_usd': number;
  'iva_amount_ves': number;
  'total_amount_usd': number;
  'total_amount_ves': number;
  
  // Tax rate
  iva_rate: number; // 0%, 8%, 16%
  'iva_rate_type': 'exempt' | 'reduced' | 'general' | 'luxury';
  
  // Classification
  classification: 'exempt' | 'gravada_general' | 'gravada_reducida' | 'gravada_suntuaria';
  
  // Retention (for sales only)
  'iva_retained_usd'?: number;
  'iva_retained_ves'?: number;
  'retention_voucher_number'?: string;
  
  // IGTF (for sales only)
  'igtf_amount_usd'?: number;
  'igtf_amount_ves'?: number;
  
  // Exchange rate
  exchange_rate: number;
  
  // Metadata
  created_at: Date;
}

/**
 * Fiscal Book Summary
 */
export interface FiscalBookSummary {
  period: { start: Date; end: Date };
  
  // Totals
  total_transactions: number;
  total_base_usd: number;
  total_base_ves: number;
  total_iva_usd: number;
  total_iva_ves: number;
  total_igtf_usd: number;
  total_igtf_ves: number;
  total_iva_retained_usd: number;
  total_iva_retained_ves: number;
  
  // By classification
  by_classification: {
    exempt: { base_usd: number; base_ves: number; count: number };
    gravada_general: { base_usd: number; base_ves: number; count: number };
    gravada_reducida: { base_usd: number; base_ves: number; count: number };
    gravada_suntuaria: { base_usd: number; base_ves: number; count: number };
  };
  
  // By rate
  by_rate: {
    rate_0: { base_usd: number; base_ves: number; iva_usd: number; iva_ves: number };
    rate_8: { base_usd: number; base_ves: number; iva_usd: number; iva_ves: number };
    rate_16: { base_usd: number; base_ves: number; iva_usd: number; iva_ves: number };
  };
  
  generated_at: Date;
}

/**
 * Fiscal Books Manager
 * Manages Sales and Purchase Books per SENIAT regulations
 */
export class FiscalBooksManager {
  private static salesEntries: FiscalBookEntry[] = [];
  private static purchaseEntries: FiscalBookEntry[] = [];
  private static STORAGE_KEY_SALES = 'fiscal_book_sales';
  private static STORAGE_KEY_PURCHASES = 'fiscal_book_purchases';

  /**
   * Determine IVA rate type
   */
  static determineIVARateType(ivaRate: number): 'exempt' | 'reduced' | 'general' | 'luxury' {
    if (ivaRate === 0) return 'exempt';
    if (ivaRate === 0.08) return 'reduced';
    if (ivaRate === 0.16) return 'general';
    return 'luxury'; // > 16%
  }

  /**
   * Determine classification
   */
  static determineClassification(ivaRate: number, category?: string): 'exempt' | 'gravada_general' | 'gravada_reducida' | 'gravada_suntuaria' {
    if (ivaRate === 0) return 'exempt';
    if (ivaRate === 0.08) return 'gravada_reducida';
    if (ivaRate > 0.16) return 'gravada_suntuaria';
    return 'gravada_general';
  }

  /**
   * Create sales book entry
   */
  static async createSalesEntry(data: {
    invoiceNumber: string;
    invoiceDate: Date;
    customerRIF: string;
    customerName: string;
    baseAmountUSD: number;
    baseAmountVES: number;
    ivaAmountUSD: number;
    ivaAmountVES: number;
    totalAmountUSD: number;
    totalAmountVES: number;
    ivaRate: number;
    category?: string;
    ivaRetainedUSD?: number;
    ivaRetainedVES?: number;
    retentionVoucherNumber?: string;
    igtfAmountUSD?: number;
    igtfAmountVES?: number;
    exchangeRate: number;
  }): Promise<FiscalBookEntry> {
    const ivaRateType = this.determineIVARateType(data.ivaRate);
    const classification = this.determineClassification(data.ivaRate, data.category);

    const entry: FiscalBookEntry = {
      id: crypto.randomUUID(),
      entry_type: 'sale',
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate,
      'customer_or_supplier_rif': data.customerRIF,
      'customer_or_supplier_name': data.customerName,
      'base_amount_usd': data.baseAmountUSD,
      'base_amount_ves': data.baseAmountVES,
      'iva_amount_usd': data.ivaAmountUSD,
      'iva_amount_ves': data.ivaAmountVES,
      'total_amount_usd': data.totalAmountUSD,
      'total_amount_ves': data.totalAmountVES,
      iva_rate: data.ivaRate,
      'iva_rate_type': ivaRateType,
      classification: classification,
      'iva_retained_usd': data.ivaRetainedUSD,
      'iva_retained_ves': data.ivaRetainedVES,
      'retention_voucher_number': data.retentionVoucherNumber,
      'igtf_amount_usd': data.igtfAmountUSD,
      'igtf_amount_ves': data.igtfAmountVES,
      exchange_rate: data.exchangeRate,
      created_at: new Date(),
    };

    this.salesEntries.push(entry);
    await this.persistSalesEntries();

    return entry;
  }

  /**
   * Create purchase book entry
   */
  static async createPurchaseEntry(data: {
    invoiceNumber: string;
    invoiceDate: Date;
    supplierRIF: string;
    supplierName: string;
    baseAmountUSD: number;
    baseAmountVES: number;
    ivaAmountUSD: number;
    ivaAmountVES: number;
    totalAmountUSD: number;
    totalAmountVES: number;
    ivaRate: number;
    category?: string;
    exchangeRate: number;
  }): Promise<FiscalBookEntry> {
    const ivaRateType = this.determineIVARateType(data.ivaRate);
    const classification = this.determineClassification(data.ivaRate, data.category);

    const entry: FiscalBookEntry = {
      id: crypto.randomUUID(),
      entry_type: 'purchase',
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate,
      'customer_or_supplier_rif': data.supplierRIF,
      'customer_or_supplier_name': data.supplierName,
      'base_amount_usd': data.baseAmountUSD,
      'base_amount_ves': data.baseAmountVES,
      'iva_amount_usd': data.ivaAmountUSD,
      'iva_amount_ves': data.ivaAmountVES,
      'total_amount_usd': data.totalAmountUSD,
      'total_amount_ves': data.totalAmountVES,
      iva_rate: data.ivaRate,
      'iva_rate_type': ivaRateType,
      classification: classification,
      exchange_rate: data.exchangeRate,
      created_at: new Date(),
    };

    this.purchaseEntries.push(entry);
    await this.persistPurchaseEntries();

    return entry;
  }

  /**
   * Generate sales book summary
   */
  static generateSalesBookSummary(startDate: Date, endDate: Date): FiscalBookSummary {
    const entriesInRange = this.salesEntries.filter(entry => {
      const entryDate = new Date(entry.invoice_date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    return this.generateSummary(entriesInRange, startDate, endDate);
  }

  /**
   * Generate purchase book summary
   */
  static generatePurchaseBookSummary(startDate: Date, endDate: Date): FiscalBookSummary {
    const entriesInRange = this.purchaseEntries.filter(entry => {
      const entryDate = new Date(entry.invoice_date);
      return entryDate >= startDate && entryDate <= endDate;
    });

    return this.generateSummary(entriesInRange, startDate, endDate);
  }

  /**
   * Generate summary from entries
   */
  private static generateSummary(entries: FiscalBookEntry[], startDate: Date, endDate: Date): FiscalBookSummary {
    const summary: FiscalBookSummary = {
      period: { start: startDate, end: endDate },
      total_transactions: entries.length,
      total_base_usd: 0,
      total_base_ves: 0,
      total_iva_usd: 0,
      total_iva_ves: 0,
      total_igtf_usd: 0,
      total_igtf_ves: 0,
      total_iva_retained_usd: 0,
      total_iva_retained_ves: 0,
      by_classification: {
        exempt: { base_usd: 0, base_ves: 0, count: 0 },
        gravada_general: { base_usd: 0, base_ves: 0, count: 0 },
        gravada_reducida: { base_usd: 0, base_ves: 0, count: 0 },
        gravada_suntuaria: { base_usd: 0, base_ves: 0, count: 0 },
      },
      by_rate: {
        rate_0: { base_usd: 0, base_ves: 0, iva_usd: 0, iva_ves: 0 },
        rate_8: { base_usd: 0, base_ves: 0, iva_usd: 0, iva_ves: 0 },
        rate_16: { base_usd: 0, base_ves: 0, iva_usd: 0, iva_ves: 0 },
      },
      generated_at: new Date(),
    };

    entries.forEach(entry => {
      // Totals
      summary.total_base_usd += entry['base_amount_usd'];
      summary.total_base_ves += entry['base_amount_ves'];
      summary.total_iva_usd += entry['iva_amount_usd'];
      summary.total_iva_ves += entry['iva_amount_ves'];
      summary.total_igtf_usd += entry['igtf_amount_usd'] || 0;
      summary.total_igtf_ves += entry['igtf_amount_ves'] || 0;
      summary.total_iva_retained_usd += entry['iva_retained_usd'] || 0;
      summary.total_iva_retained_ves += entry['iva_retained_ves'] || 0;

      // By classification
      summary.by_classification[entry.classification].base_usd += entry['base_amount_usd'];
      summary.by_classification[entry.classification].base_ves += entry['base_amount_ves'];
      summary.by_classification[entry.classification].count++;

      // By rate
      if (entry.iva_rate === 0) {
        summary.by_rate.rate_0.base_usd += entry['base_amount_usd'];
        summary.by_rate.rate_0.base_ves += entry['base_amount_ves'];
        summary.by_rate.rate_0.iva_usd += entry['iva_amount_usd'];
        summary.by_rate.rate_0.iva_ves += entry['iva_amount_ves'];
      } else if (entry.iva_rate === 0.08) {
        summary.by_rate.rate_8.base_usd += entry['base_amount_usd'];
        summary.by_rate.rate_8.base_ves += entry['base_amount_ves'];
        summary.by_rate.rate_8.iva_usd += entry['iva_amount_usd'];
        summary.by_rate.rate_8.iva_ves += entry['iva_amount_ves'];
      } else if (entry.iva_rate === 0.16) {
        summary.by_rate.rate_16.base_usd += entry['base_amount_usd'];
        summary.by_rate.rate_16.base_ves += entry['base_amount_ves'];
        summary.by_rate.rate_16.iva_usd += entry['iva_amount_usd'];
        summary.by_rate.rate_16.iva_ves += entry['iva_amount_ves'];
      }
    });

    return summary;
  }

  /**
   * Get sales entries by date range
   */
  static getSalesEntriesByDateRange(startDate: Date, endDate: Date): FiscalBookEntry[] {
    return this.salesEntries.filter(entry => {
      const entryDate = new Date(entry.invoice_date);
      return entryDate >= startDate && entryDate <= endDate;
    }).sort((a, b) => a.invoice_date.getTime() - b.invoice_date.getTime());
  }

  /**
   * Get purchase entries by date range
   */
  static getPurchaseEntriesByDateRange(startDate: Date, endDate: Date): FiscalBookEntry[] {
    return this.purchaseEntries.filter(entry => {
      const entryDate = new Date(entry.invoice_date);
      return entryDate >= startDate && entryDate <= endDate;
    }).sort((a, b) => a.invoice_date.getTime() - b.invoice_date.getTime());
  }

  /**
   * Persist sales entries
   */
  private static async persistSalesEntries(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_SALES, JSON.stringify(this.salesEntries));
    } catch (error) {
      console.error('Error persisting sales entries:', error);
    }
  }

  /**
   * Persist purchase entries
   */
  private static async persistPurchaseEntries(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_PURCHASES, JSON.stringify(this.purchaseEntries));
    } catch (error) {
      console.error('Error persisting purchase entries:', error);
    }
  }

  /**
   * Load sales entries
   */
  static async loadSalesEntries(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SALES);
      if (stored) {
        this.salesEntries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          invoice_date: new Date(entry.invoice_date),
          created_at: new Date(entry.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading sales entries:', error);
    }
  }

  /**
   * Load purchase entries
   */
  static async loadPurchaseEntries(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_PURCHASES);
      if (stored) {
        this.purchaseEntries = JSON.parse(stored).map((entry: any) => ({
          ...entry,
          invoice_date: new Date(entry.invoice_date),
          created_at: new Date(entry.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading purchase entries:', error);
    }
  }
}
