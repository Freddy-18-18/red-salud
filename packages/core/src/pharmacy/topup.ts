import { v4 as uuidv4 } from 'uuid';
import {
  TopupTransaction,
  TopupOperator,
  TopupOperatorSchema,
  TopupStatus,
} from '@red-salud/types';

export interface ProcessTopupOptions {
  operator_id: string;
  phone_number: string;
  amount_usd: number;
  amount_ves: number;
  created_by: string;
  warehouse_id: string;
}

export interface TopupResult {
  success: boolean;
  transaction?: TopupTransaction;
  error?: string;
}

export class TopupManager {
  private operators: TopupOperatorSchema[] = [];
  private transactions: TopupTransaction[] = [];

  constructor() {
    this.loadOperators();
    this.loadTransactions();
    this.initializeOperators();
  }

  async loadOperators(): Promise<void> {
    const stored = localStorage.getItem('topup_operators');
    if (stored) {
      this.operators = JSON.parse(stored) as TopupOperatorSchema[];
    }
  }

  async saveOperators(): Promise<void> {
    localStorage.setItem('topup_operators', JSON.stringify(this.operators));
  }

  async loadTransactions(): Promise<void> {
    const stored = localStorage.getItem('topup_transactions');
    if (stored) {
      this.transactions = JSON.parse(stored) as TopupTransaction[];
    }
  }

  async saveTransactions(): Promise<void> {
    localStorage.setItem('topup_transactions', JSON.stringify(this.transactions));
  }

  private initializeOperators(): void {
    if (this.operators.length === 0) {
      this.operators = [
        {
          id: uuidv4(),
          name: TopupOperator.MOVISTAR,
          display_name: 'Movistar',
          commission_percent: 5,
          min_amount_usd: 1,
          max_amount_usd: 100,
          is_active: true,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          name: TopupOperator.DIGITEL,
          display_name: 'Digitel',
          commission_percent: 4,
          min_amount_usd: 1,
          max_amount_usd: 100,
          is_active: true,
          created_at: new Date(),
        },
        {
          id: uuidv4(),
          name: TopupOperator.CANTV,
          display_name: 'Cantv',
          commission_percent: 3,
          min_amount_usd: 1,
          max_amount_usd: 50,
          is_active: true,
          created_at: new Date(),
        },
      ];
      this.saveOperators();
    }
  }

  async processTopup(options: ProcessTopupOptions): Promise<TopupResult> {
    const operator = this.operators.find((o) => o.id === options.operator_id);
    if (!operator) {
      return { success: false, error: 'Operator not found' };
    }

    if (!operator.is_active) {
      return { success: false, error: 'Operator is not active' };
    }

    if (options.amount_usd < operator.min_amount_usd) {
      return {
        success: false,
        error: `Minimum amount is ${operator.min_amount_usd} USD`,
      };
    }

    if (options.amount_usd > operator.max_amount_usd) {
      return {
        success: false,
        error: `Maximum amount is ${operator.max_amount_usd} USD`,
      };
    }

    // Validate phone number (Venezuela format: 04XX-XXX-XXXX)
    const phoneRegex = /^04\d{2}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(options.phone_number)) {
      return { success: false, error: 'Invalid phone number format' };
    }

    const commissionUSD = options.amount_usd * (operator.commission_percent / 100);
    const totalUSD = options.amount_usd + commissionUSD;

    const transaction: TopupTransaction = {
      id: uuidv4(),
      operator_id: options.operator_id,
      phone_number: options.phone_number,
      amount_usd: options.amount_usd,
      amount_ves: options.amount_ves,
      commission_usd: commissionUSD,
      total_usd: totalUSD,
      status: TopupStatus.PROCESSING,
      created_by: options.created_by,
      warehouse_id: options.warehouse_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.transactions.push(transaction);
    await this.saveTransactions();

    // Simulate processing
    setTimeout(async () => {
      const success = Math.random() > 0.1; // 90% success rate

      transaction.status = success ? TopupStatus.COMPLETED : TopupStatus.FAILED;
      transaction.processed_at = new Date();

      if (!success) {
        transaction.error_message = 'Operator API error';
      }

      await this.saveTransactions();
    }, 2000);

    return { success: true, transaction };
  }

  async refundTransaction(transactionId: string): Promise<TopupResult> {
    const transaction = this.transactions.find((t) => t.id === transactionId);
    if (!transaction) {
      return { success: false, error: 'Transaction not found' };
    }

    if (transaction.status !== TopupStatus.COMPLETED) {
      return { success: false, error: 'Cannot refund non-completed transaction' };
    }

    transaction.status = TopupStatus.REFUNDED;
    transaction.updated_at = new Date();

    await this.saveTransactions();

    return { success: true, transaction };
  }

  getOperators(): TopupOperatorSchema[] {
    return this.operators.filter((o) => o.is_active);
  }

  getOperator(operatorId: string): TopupOperatorSchema | undefined {
    return this.operators.find((o) => o.id === operatorId);
  }

  getTransactions(phoneNumber?: string, limit?: number): TopupTransaction[] {
    let transactions = [...this.transactions];

    if (phoneNumber) {
      transactions = transactions.filter((t) => t.phone_number === phoneNumber);
    }

    transactions.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return limit ? transactions.slice(0, limit) : transactions;
  }

  getTransaction(transactionId: string): TopupTransaction | undefined {
    return this.transactions.find((t) => t.id === transactionId);
  }

  getTopupStats() {
    const total = this.transactions.length;
    const completed = this.transactions.filter((t) => t.status === TopupStatus.COMPLETED).length;
    const failed = this.transactions.filter((t) => t.status === TopupStatus.FAILED).length;
    const refunded = this.transactions.filter((t) => t.status === TopupStatus.REFUNDED).length;
    const processing = this.transactions.filter((t) => t.status === TopupStatus.PROCESSING).length;

    const totalAmountUSD = this.transactions
      .filter((t) => t.status === TopupStatus.COMPLETED)
      .reduce((sum, t) => sum + t.amount_usd, 0);

    const totalCommissionUSD = this.transactions
      .filter((t) => t.status === TopupStatus.COMPLETED)
      .reduce((sum, t) => sum + t.commission_usd, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const transactionsToday = this.transactions.filter((t) => t.created_at >= today).length;

    return {
      total,
      completed,
      failed,
      refunded,
      processing,
      totalAmountUSD,
      totalCommissionUSD,
      transactionsToday,
    };
  }

  async cleanupOldTransactions(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.transactions.length;
    this.transactions = this.transactions.filter((t) => t.created_at > cutoffDate);
    const removedCount = initialCount - this.transactions.length;

    await this.saveTransactions();

    return removedCount;
  }
}
