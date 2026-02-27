/**
 * Offline Transaction Record
 */
export interface OfflineTransaction {
  id: string;
  
  // Transaction data
  invoice_id: string;
  invoice_number: string;
  transaction_date: Date;
  
  // Customer info
  customer_id: string;
  customer_name: string;
  
  // Products
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price_usd: number;
    unit_price_ves: number;
    total_usd: number;
    total_ves: number;
  }>;
  
  // Totals
  subtotal_usd: number;
  subtotal_ves: number;
   iva_usd: number;
  iva_ves: number;
  igtf_usd: number;
  igtf_ves: number;
  total_usd: number;
  total_ves: number;
  
  // Payment
  payment_method: string;
  payment_currency: string;
  payment_amount_usd: number;
  payment_amount_ves: number;
  change_usd: number;
  change_ves: number;
  
  // Sync status
  synced: boolean;
  sync_attempt_count: number;
  last_sync_attempt?: Date;
  sync_error?: string;
  
  created_at: Date;
}

/**
 * Sync Status
 */
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

/**
 * Offline First Manager
 * Manages offline-first architecture with deferred synchronization
 */
export class OfflineFirstManager {
  private static transactions: OfflineTransaction[] = [];
  private static STORAGE_KEY = 'offline_transactions';
  
  /**
   * Create offline transaction
   */
  static async createTransaction(data: {
    invoiceId: string;
    invoiceNumber: string;
    transactionDate: Date;
    customerId: string;
    customerName: string;
    items: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_price_usd: number;
      unit_price_ves: number;
      total_usd: number;
      total_ves: number;
    }>;
    subtotalUSD: number;
    subtotalVES: number;
    ivaUSD: number;
    ivaVES: number;
    igtfUSD: number;
    igtfVES: number;
    totalUSD: number;
    totalVES: number;
    paymentMethod: string;
    paymentCurrency: string;
    paymentAmountUSD: number;
    paymentAmountVES: number;
    changeUSD: number;
    changeVES: number;
  }): Promise<OfflineTransaction> {
    const transaction: OfflineTransaction = {
      id: crypto.randomUUID(),
      invoice_id: data.invoiceId,
      invoice_number: data.invoiceNumber,
      transaction_date: data.transactionDate,
      customer_id: data.customerId,
      customer_name: data.customerName,
      items: data.items,
      subtotal_usd: data.subtotalUSD,
      subtotal_ves: data.subtotalVES,
      iva_usd: data.ivaUSD,
      iva_ves: data.ivaVES,
      igtf_usd: data.igtfUSD,
      igtf_ves: data.igtfVES,
      total_usd: data.totalUSD,
      total_ves: data.totalVES,
      payment_method: data.paymentMethod,
      payment_currency: data.paymentCurrency,
      payment_amount_usd: data.paymentAmountUSD,
      payment_amount_ves: data.paymentAmountVES,
      change_usd: data.changeUSD,
      change_ves: data.changeVES,
      synced: false,
      sync_attempt_count: 0,
      created_at: new Date(),
    };

    this.transactions.push(transaction);
    await this.persistTransactions();

    return transaction;
  }

  /**
   * Get pending transactions (not synced yet)
   */
  static getPendingTransactions(): OfflineTransaction[] {
    return this.transactions.filter(t => !t.synced);
  }

  /**
   * Sync transaction to server
   */
  static async syncTransaction(transactionId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    const transaction = this.transactions.find(t => t.id === transactionId);
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    transaction.sync_attempt_count++;
    transaction.last_sync_attempt = new Date();
    transaction.synced = false;

    try {
      // Simulate server sync (in real implementation, this would call API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      transaction.synced = true;
      await this.persistTransactions();
      
      return { success: true };
    } catch (error) {
      transaction.sync_error = error instanceof Error ? error.message : 'Unknown error';
      transaction.synced = false;
      await this.persistTransactions();
      
      return { success: false, error: transaction.sync_error };
    }
  }

  /**
   * Sync all pending transactions
   */
  static async syncAllPendingTransactions(): Promise<{
    synced: number;
    failed: number;
    errors: Array<{ transactionId: string; error: string }>;
  }> {
    const pending = this.getPendingTransactions();
    let synced = 0;
    let failed = 0;
    const errors: Array<{ transactionId: string; error: string }> = [];

    for (const transaction of pending) {
      const result = await this.syncTransaction(transaction.id);
      
      if (result.success) {
        synced++;
      } else {
        failed++;
        errors.push({
          transactionId: transaction.id,
          error: result.error || 'Unknown error',
        });
      }
    }

    return { synced, failed, errors };
  }

  /**
   * Get sync statistics
   */
  static getSyncStatistics(): {
    total: number;
    synced: number;
    pending: number;
    failed: number;
    sync_rate: number;
  } {
    const total = this.transactions.length;
    const synced = this.transactions.filter(t => t.synced).length;
    const pending = this.transactions.filter(t => !t.synced).length;
    const failed = this.transactions.filter(t => !t.synced && t.sync_attempt_count > 3).length;
    const syncRate = total > 0 ? (synced / total) * 100 : 0;

    return {
      total,
      synced,
      pending,
      failed,
      sync_rate: syncRate,
    };
  }

  /**
   * Get transactions by date range
   */
  static getTransactionsByDateRange(startDate: Date, endDate: Date): OfflineTransaction[] {
    return this.transactions.filter(transaction => {
      const transactionDate = new Date(transaction.transaction_date);
      return transactionDate >= startDate && transactionDate <= endDate;
    }).sort((a, b) => a.transaction_date.getTime() - b.transaction_date.getTime());
  }

  /**
   * Persist transactions
   */
  private static async persistTransactions(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Error persisting offline transactions:', error);
    }
  }

  /**
   * Load transactions
   */
  static async loadTransactions(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.transactions = JSON.parse(stored).map((transaction: any) => ({
          ...transaction,
          transaction_date: new Date(transaction.transaction_date),
          last_sync_attempt: transaction.last_sync_attempt ? new Date(transaction.last_sync_attempt) : undefined,
          created_at: new Date(transaction.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading offline transactions:', error);
    }
  }
}
