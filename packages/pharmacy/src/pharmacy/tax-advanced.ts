import { PharmacyPaymentMethod } from '@red-salud/types';

/**
 * Tax Transaction Record
 */
export interface TaxTransaction {
  id: string;
  invoice_id: string;
  
  // IGTF
  igtf_applicable: boolean;
  igtf_rate: number; // 3% or configured rate
  igtf_amount_usd: number;
  igtf_amount_ves: number;
  igtf_exchange_rate: number;
  
  // Retention
  retention_applicable: boolean;
  retention_rate: number; // 75% or configured rate
  iva_amount_usd: number;
  iva_amount_ves: number;
  iva_retained_usd: number;
  iva_retained_ves: number;
  
  // Payment method details
  payment_method: PharmacyPaymentMethod;
  payment_currency: 'USD' | 'EUR' | 'VES';
  is_cash_foreign_currency: boolean;
  
  // Customer info
  customer_is_special_taxpayer: boolean;
  customer_rif?: string;
  
  transaction_date: Date;
  
  created_at: Date;
}

/**
 * Retention Voucher
 * Generated for SENIAT compliance
 */
export interface RetentionVoucher {
  id: string;
  voucher_number: string;
  
  invoice_id: string;
  invoice_number: string;
  invoice_date: Date;
  
  // Customer info
  customer_name: string;
  customer_rif: string;
  customer_address?: string;
  
  // Retention details
  iva_base_usd: number;
  iva_base_ves: number;
  iva_rate: number;
  iva_amount_usd: number;
  iva_amount_ves: number;
  retention_rate: number;
  retention_amount_usd: number;
  retention_amount_ves: number;
  
  // Payment info
  payment_method: string;
  
  // Generation
  generated_at: Date;
  
  // SENIAT submission
  submitted_to_seniat?: boolean;
  submitted_date?: Date;
  seniat_reference?: string;
}

/**
 * Tax Configuration
 */
export interface TaxConfiguration {
  // IGTF
  igtf_rate: number; // Default 3%
  igtf_applicable_methods: PharmacyPaymentMethod[];
  igtf_exempt_methods: PharmacyPaymentMethod[];
  
  // Retention
  retention_rate: number; // Default 75%
  special_taxpayer_rifs: string[]; // List of RIFs for special taxpayers
  
  // IVA rates
  iva_general_rate: number; // 16%
  iva_reduced_rate: number; // 8%
  iva_exempt_categories: string[];
}

/**
 * Advanced Tax Manager
 * Handles IGTF calculation and automatic retention for special taxpayers
 */
export class AdvancedTaxManager {
  private static transactions: TaxTransaction[] = [];
  private static vouchers: RetentionVoucher[] = [];
  private static configuration: TaxConfiguration = {
    igtf_rate: 0.03,
    igtf_applicable_methods: [PharmacyPaymentMethod.CASH],
    igtf_exempt_methods: [
      PharmacyPaymentMethod.CARD,
      PharmacyPaymentMethod.PAGO_MOVIL,
      PharmacyPaymentMethod.TRANSFER,
    ],
    retention_rate: 0.75,
    special_taxpayer_rifs: [],
    iva_general_rate: 0.16,
    iva_reduced_rate: 0.08,
    iva_exempt_categories: ['medicamentos', 'servicios médicos'],
  };
  
  private static STORAGE_KEY_TRANSACTIONS = 'tax_transactions';
  private static STORAGE_KEY_VOUCHERS = 'retention_vouchers';
  private static STORAGE_KEY_CONFIG = 'tax_configuration';

  /**
   * Detect if IGTF applies based on payment method
   */
  static detectIGTFApplicability(
    paymentMethod: PharmacyPaymentMethod,
    paymentCurrency: 'USD' | 'EUR' | 'VES'
  ): boolean {
    // IGTF applies to cash payments in foreign currency
    const isCash = paymentMethod === PharmacyPaymentMethod.CASH;
    const isForeignCurrency = paymentCurrency !== 'VES';
    const isApplicableMethod = this.configuration.igtf_applicable_methods.includes(paymentMethod);
    const isExemptMethod = this.configuration.igtf_exempt_methods.includes(paymentMethod);

    return isCash && isForeignCurrency && isApplicableMethod && !isExemptMethod;
  }

  /**
   * Calculate IGTF for a transaction
   */
  static calculateIGTF(
    baseAmountUSD: number,
    baseAmountVES: number,
    exchangeRate: number,
    paymentMethod: PharmacyPaymentMethod,
    paymentCurrency: 'USD' | 'EUR' | 'VES'
  ): {
    applicable: boolean;
    rate: number;
    amountUSD: number;
    amountVES: number;
  } {
    const applicable = this.detectIGTFApplicability(paymentMethod, paymentCurrency);
    
    if (!applicable) {
      return {
        applicable: false,
        rate: 0,
        amountUSD: 0,
        amountVES: 0,
      };
    }

    const amountUSD = baseAmountUSD * this.configuration.igtf_rate;
    const amountVES = amountUSD * exchangeRate;

    return {
      applicable: true,
      rate: this.configuration.igtf_rate,
      amountUSD,
      amountVES,
    };
  }

  /**
   * Check if customer is special taxpayer
   */
  static isSpecialTaxpayer(customerRIF: string): boolean {
    return this.configuration.special_taxpayer_rifs.includes(customerRIF);
  }

  /**
   * Calculate retention for special taxpayer
   */
  static calculateRetention(
    ivaAmountUSD: number,
    ivaAmountVES: number,
    customerRIF: string
  ): {
    applicable: boolean;
    rate: number;
    retainedUSD: number;
    retainedVES: number;
  } {
    const isSpecial = this.isSpecialTaxpayer(customerRIF);

    if (!isSpecial) {
      return {
        applicable: false,
        rate: 0,
        retainedUSD: 0,
        retainedVES: 0,
      };
    }

    const retainedUSD = ivaAmountUSD * this.configuration.retention_rate;
    const retainedVES = ivaAmountVES * this.configuration.retention_rate;

    return {
      applicable: true,
      rate: this.configuration.retention_rate,
      retainedUSD,
      retainedVES,
    };
  }

  /**
   * Create tax transaction
   */
  static async createTaxTransaction(data: {
    invoiceId: string;
    baseAmountUSD: number;
    baseAmountVES: number;
    ivaAmountUSD: number;
    ivaAmountVES: number;
    paymentMethod: PharmacyPaymentMethod;
    paymentCurrency: 'USD' | 'EUR' | 'VES';
    customerRIF?: string;
    exchangeRate: number;
  }): Promise<TaxTransaction> {
    // Calculate IGTF
    const igtfCalc = this.calculateIGTF(
      data.baseAmountUSD,
      data.baseAmountVES,
      data.exchangeRate,
      data.paymentMethod,
      data.paymentCurrency
    );

    // Calculate Retention
    const retentionCalc = this.calculateRetention(
      data.ivaAmountUSD,
      data.ivaAmountVES,
      data.customerRIF || ''
    );

    const transaction: TaxTransaction = {
      id: crypto.randomUUID(),
      invoice_id: data.invoiceId,
      igtf_applicable: igtfCalc.applicable,
      igtf_rate: igtfCalc.rate,
      igtf_amount_usd: igtfCalc.amountUSD,
      igtf_amount_ves: igtfCalc.amountVES,
      igtf_exchange_rate: data.exchangeRate,
      retention_applicable: retentionCalc.applicable,
      retention_rate: retentionCalc.rate,
      iva_amount_usd: data.ivaAmountUSD,
      iva_amount_ves: data.ivaAmountVES,
      iva_retained_usd: retentionCalc.retainedUSD,
      iva_retained_ves: retentionCalc.retainedVES,
      payment_method: data.paymentMethod,
      payment_currency: data.paymentCurrency,
      is_cash_foreign_currency: data.paymentMethod === PharmacyPaymentMethod.CASH && data.paymentCurrency !== 'VES',
      customer_is_special_taxpayer: this.isSpecialTaxpayer(data.customerRIF || ''),
      customer_rif: data.customerRIF,
      transaction_date: new Date(),
      created_at: new Date(),
    };

    this.transactions.push(transaction);
    await this.persistTransactions();

    return transaction;
  }

  /**
   * Generate retention voucher for SENIAT
   */
  static async generateRetentionVoucher(data: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceDate: Date;
    customerName: string;
    customerRIF: string;
    customerAddress?: string;
    ivaBaseUSD: number;
    ivaBaseVES: number;
    paymentMethod: string;
  }): Promise<RetentionVoucher> {
    const voucherNumber = `RET-${Date.now().toString().slice(-8)}`;

    const ivaRate = this.configuration.iva_general_rate;
    const ivaAmountUSD = data.ivaBaseUSD * ivaRate;
    const ivaAmountVES = data.ivaBaseVES * ivaRate;
    const retainedUSD = ivaAmountUSD * this.configuration.retention_rate;
    const retainedVES = ivaAmountVES * this.configuration.retention_rate;

    const voucher: RetentionVoucher = {
      id: crypto.randomUUID(),
      voucher_number: voucherNumber,
      invoice_id: data.invoiceId,
      invoice_number: data.invoiceNumber,
      invoice_date: data.invoiceDate,
      customer_name: data.customerName,
      customer_rif: data.customerRIF,
      customer_address: data.customerAddress,
      iva_base_usd: data.ivaBaseUSD,
      iva_base_ves: data.ivaBaseVES,
      iva_rate: ivaRate,
      iva_amount_usd: ivaAmountUSD,
      iva_amount_ves: ivaAmountVES,
      retention_rate: this.configuration.retention_rate,
      retention_amount_usd: retainedUSD,
      retention_amount_ves: retainedVES,
      payment_method: data.paymentMethod,
      generated_at: new Date(),
    };

    this.vouchers.push(voucher);
    await this.persistVouchers();

    return voucher;
  }

  /**
   * Mark voucher as submitted to SENIAT
   */
  static async markVoucherSubmitted(
    voucherId: string,
    seniatReference: string
  ): Promise<void> {
    const voucher = this.vouchers.find(v => v.id === voucherId);
    if (!voucher) throw new Error('Voucher not found');

    voucher.submitted_to_seniat = true;
    voucher.submitted_date = new Date();
    voucher.seniat_reference = seniatReference;

    await this.persistVouchers();
  }

  /**
   * Get IGTF accumulation for declaration
   */
  static getIGTFAccumulation(startDate: Date, endDate: Date): {
    total_usd: number;
    total_ves: number;
    transactions: number;
  } {
    const transactionsInRange = this.transactions.filter(t => {
      const transactionDate = new Date(t.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate && t.igtf_applicable;
    });

    const totalUSD = this.transactions.reduce((sum: number, t: TaxTransaction) => sum + t.igtf_amount_usd, 0);
    const totalVES = this.transactions.reduce((sum: number, t: TaxTransaction) => sum + t.igtf_amount_ves, 0);

    return {
      total_usd: totalUSD,
      total_ves: totalVES,
      transactions: transactionsInRange.length,
    };
  }

  /**
   * Get retention accumulation for declaration
   */
  static getRetentionAccumulation(startDate: Date, endDate: Date): {
    total_usd: number;
    total_ves: number;
    vouchers: number;
  } {
    const vouchersInRange = this.vouchers.filter(v => {
      const voucherDate = new Date(v.generated_at);
      return voucherDate >= startDate && voucherDate <= endDate;
    });

    const totalUSD = vouchersInRange.reduce((sum: number, v: RetentionVoucher) => sum + v.retention_amount_usd, 0);
    const totalVES = vouchersInRange.reduce((sum: number, v: RetentionVoucher) => sum + v.retention_amount_ves, 0);

    return {
      total_usd: totalUSD,
      total_ves: totalVES,
      vouchers: vouchersInRange.length,
    };
  }

  /**
   * Update tax configuration
   */
  static async updateConfiguration(config: Partial<TaxConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
    await this.persistConfiguration();
  }

  /**
   * Get configuration
   */
  static getConfiguration(): TaxConfiguration {
    return { ...this.configuration };
  }

  /**
   * Persist transactions
   */
  private static async persistTransactions(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_TRANSACTIONS, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error persisting tax transactions:', error);
    }
  }

  /**
   * Persist vouchers
   */
  private static async persistVouchers(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_VOUCHERS, JSON.stringify(this.vouchers));
    } catch (error) {
      console.error('Error persisting retention vouchers:', error);
    }
  }

  /**
   * Persist configuration
   */
  private static async persistConfiguration(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_CONFIG, JSON.stringify(this.configuration));
    } catch (error) {
      console.error('Error persisting tax configuration:', error);
    }
  }

  /**
   * Load transactions
   */
  static async loadTransactions(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_TRANSACTIONS);
      if (stored) {
        this.transactions = JSON.parse(stored).map((t: any) => ({
          ...t,
          transaction_date: new Date(t.transaction_date),
          created_at: new Date(t.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading tax transactions:', error);
    }
  }

  /**
   * Load vouchers
   */
  static async loadVouchers(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_VOUCHERS);
      if (stored) {
        this.vouchers = JSON.parse(stored).map((v: any) => ({
          ...v,
          invoice_date: new Date(v.invoice_date),
          generated_at: new Date(v.generated_at),
          submitted_date: v.submitted_date ? new Date(v.submitted_date) : undefined,
        }));
      }
    } catch (error) {
      console.error('Error loading retention vouchers:', error);
    }
  }

  /**
   * Load configuration
   */
  static async loadConfiguration(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_CONFIG);
      if (stored) {
        this.configuration = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading tax configuration:', error);
    }
  }
}
