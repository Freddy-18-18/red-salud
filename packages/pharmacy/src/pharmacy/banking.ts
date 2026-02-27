import { v4 as uuidv4 } from 'uuid';
import {
  BankAccount,
  BankTransaction,
  Reconciliation,
} from '@red-salud/types';

export class BankingManager {
  private accounts: BankAccount[] = [];
  private transactions: BankTransaction[] = [];
  private reconciliations: Reconciliation[] = [];

  constructor() {
    this.loadAccounts();
    this.loadTransactions();
    this.loadReconciliations();
  }

  async loadAccounts(): Promise<void> {
    const stored = localStorage.getItem('bank_accounts');
    if (stored) {
      this.accounts = JSON.parse(stored) as BankAccount[];
    }
  }

  async saveAccounts(): Promise<void> {
    localStorage.setItem('bank_accounts', JSON.stringify(this.accounts));
  }

  async loadTransactions(): Promise<void> {
    const stored = localStorage.getItem('bank_transactions');
    if (stored) {
      this.transactions = JSON.parse(stored) as BankTransaction[];
    }
  }

  async saveTransactions(): Promise<void> {
    localStorage.setItem('bank_transactions', JSON.stringify(this.transactions));
  }

  async loadReconciliations(): Promise<void> {
    const stored = localStorage.getItem('bank_reconciliations');
    if (stored) {
      this.reconciliations = JSON.parse(stored) as Reconciliation[];
    }
  }

  async saveReconciliations(): Promise<void> {
    localStorage.setItem('bank_reconciliations', JSON.stringify(this.reconciliations));
  }

  async createAccount(account: Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>): Promise<BankAccount> {
    const newAccount: BankAccount = {
      ...account,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.accounts.push(newAccount);
    await this.saveAccounts();

    return newAccount;
  }

  async createTransaction(transaction: Omit<BankTransaction, 'id' | 'created_at'>): Promise<BankTransaction> {
    const newTransaction: BankTransaction = {
      ...transaction,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.transactions.push(newTransaction);
    await this.saveTransactions();

    return newTransaction;
  }

  async reconcileAccount(
    accountId: string,
    periodStart: Date,
    periodEnd: Date,
    reconciledBy: string,
  ): Promise<Reconciliation> {
    const accountTransactions = this.transactions.filter(
      (t) => t.account_id === accountId &&
        t.transaction_date >= periodStart &&
        t.transaction_date <= periodEnd,
    );

    const reconciliation: Reconciliation = {
      id: uuidv4(),
      account_id: accountId,
      period_start: periodStart,
      period_end: periodEnd,
      opening_balance_usd: 0,
      opening_balance_ves: 0,
      closing_balance_usd: 0,
      closing_balance_ves: 0,
      transactions_count: accountTransactions.length,
      discrepancies: [],
      reconciled_by: reconciledBy,
      reconciled_at: new Date(),
      created_at: new Date(),
    };

    this.reconciliations.push(reconciliation);
    await this.saveReconciliations();

    return reconciliation;
  }

  getAccounts(): BankAccount[] {
    return this.accounts.filter((a) => a.is_active);
  }

  getAccount(accountId: string): BankAccount | undefined {
    return this.accounts.find((a) => a.id === accountId);
  }

  getTransactions(accountId?: string): BankTransaction[] {
    let transactions = [...this.transactions];

    if (accountId) {
      transactions = transactions.filter((t) => t.account_id === accountId);
    }

    return transactions.sort((a, b) => b.transaction_date.getTime() - a.transaction_date.getTime());
  }

  getReconciliations(accountId?: string): Reconciliation[] {
    let reconciliations = [...this.reconciliations];

    if (accountId) {
      reconciliations = reconciliations.filter((r) => r.account_id === accountId);
    }

    return reconciliations.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }
}
