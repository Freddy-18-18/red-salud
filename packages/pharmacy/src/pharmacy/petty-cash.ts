import type { PettyCash, PettyCashTransaction } from '@red-salud/types';

export class PettyCashManager {
  /**
   * Create a petty cash account
   */
  static createPettyCash(
    warehouseId: string,
    name: string,
    initialBalanceUsd: number,
    initialBalanceVes: number,
    custodianId: string
  ): Omit<PettyCash, 'id' | 'created_at' | 'updated_at'> {
    return {
      warehouse_id: warehouseId,
      name,
      initial_balance_usd: initialBalanceUsd,
      initial_balance_ves: initialBalanceVes,
      current_balance_usd: initialBalanceUsd,
      current_balance_ves: initialBalanceVes,
      custodian_id: custodianId,
      is_active: true,
    };
  }

  /**
   * Create a transaction
   */
  static createTransaction(
    pettyCashId: string,
    type: 'deposit' | 'withdrawal' | 'replenishment',
    amountUsd: number,
    amountVes: number,
    balanceAfterUsd: number,
    balanceAfterVes: number,
    description: string,
    category: 'supplies' | 'transport' | 'food' | 'miscellaneous' | 'replenishment' | 'other',
    createdBy: string,
    receiptNumber?: string,
    approvedBy?: string
  ): Omit<PettyCashTransaction, 'id' | 'created_at'> {
    return {
      petty_cash_id: pettyCashId,
      type,
      amount_usd: amountUsd,
      amount_ves: amountVes,
      balance_after_usd: balanceAfterUsd,
      balance_after_ves: balanceAfterVes,
      description,
      category,
      receipt_number: receiptNumber,
      approved_by: approvedBy,
      created_by: createdBy,
    };
  }

  /**
   * Process a deposit
   */
  static deposit(
    pettyCash: PettyCash,
    amountUsd: number,
    amountVes: number,
    description: string,
    category: 'supplies' | 'transport' | 'food' | 'miscellaneous' | 'replenishment' | 'other',
    createdBy: string,
    receiptNumber?: string,
    approvedBy?: string
  ): { pettyCash: PettyCash; transaction: Omit<PettyCashTransaction, 'id' | 'created_at'> } {
    const newBalanceUsd = pettyCash.current_balance_usd + amountUsd;
    const newBalanceVes = pettyCash.current_balance_ves + amountVes;

    const updatedPettyCash = {
      ...pettyCash,
      current_balance_usd: newBalanceUsd,
      current_balance_ves: newBalanceVes,
      updated_at: new Date(),
    };

    const transaction = this.createTransaction(
      pettyCash.id,
      'deposit',
      amountUsd,
      amountVes,
      newBalanceUsd,
      newBalanceVes,
      description,
      category,
      createdBy,
      receiptNumber,
      approvedBy
    );

    return { pettyCash: updatedPettyCash, transaction };
  }

  /**
   * Process a withdrawal
   */
  static withdraw(
    pettyCash: PettyCash,
    amountUsd: number,
    amountVes: number,
    description: string,
    category: 'supplies' | 'transport' | 'food' | 'miscellaneous' | 'replenishment' | 'other',
    createdBy: string,
    receiptNumber?: string,
    approvedBy?: string
  ): { pettyCash: PettyCash; transaction: Omit<PettyCashTransaction, 'id' | 'created_at'> } | null {
    // Check if sufficient balance
    if (amountUsd > pettyCash.current_balance_usd || amountVes > pettyCash.current_balance_ves) {
      return null;
    }

    const newBalanceUsd = pettyCash.current_balance_usd - amountUsd;
    const newBalanceVes = pettyCash.current_balance_ves - amountVes;

    const updatedPettyCash = {
      ...pettyCash,
      current_balance_usd: newBalanceUsd,
      current_balance_ves: newBalanceVes,
      updated_at: new Date(),
    };

    const transaction = this.createTransaction(
      pettyCash.id,
      'withdrawal',
      amountUsd,
      amountVes,
      newBalanceUsd,
      newBalanceVes,
      description,
      category,
      createdBy,
      receiptNumber,
      approvedBy
    );

    return { pettyCash: updatedPettyCash, transaction };
  }

  /**
   * Replenish petty cash
   */
  static replenish(
    pettyCash: PettyCash,
    targetBalanceUsd: number,
    targetBalanceVes: number,
    createdBy: string
  ): { pettyCash: PettyCash; transaction: Omit<PettyCashTransaction, 'id' | 'created_at'> } {
    const amountUsd = targetBalanceUsd - pettyCash.current_balance_usd;
    const amountVes = targetBalanceVes - pettyCash.current_balance_ves;

    return this.deposit(
      pettyCash,
      amountUsd,
      amountVes,
      'Replenishment',
      'replenishment',
      createdBy,
      undefined,
      undefined
    );
  }

  /**
   * Check if balance is below minimum
   */
  static isBelowMinimum(pettyCash: PettyCash, minBalanceUsd: number, minBalanceVes: number): boolean {
    return pettyCash.current_balance_usd < minBalanceUsd || pettyCash.current_balance_ves < minBalanceVes;
  }

  /**
   * Check if balance is above maximum
   */
  static isAboveMaximum(pettyCash: PettyCash): boolean {
    if (pettyCash.max_balance_usd && pettyCash.current_balance_usd > pettyCash.max_balance_usd) {
      return true;
    }
    if (pettyCash.max_balance_ves && pettyCash.current_balance_ves > pettyCash.max_balance_ves) {
      return true;
    }
    return false;
  }

  /**
   * Get transactions by category
   */
  static getTransactionsByCategory(
    transactions: PettyCashTransaction[],
    category: 'supplies' | 'transport' | 'food' | 'miscellaneous' | 'replenishment' | 'other'
  ): PettyCashTransaction[] {
    return transactions.filter(t => t.category === category);
  }

  /**
   * Calculate spending by category
   */
  static calculateSpendingByCategory(
    transactions: PettyCashTransaction[]
  ): Record<string, { amountUsd: number; amountVes: number }> {
    const spending: Record<string, { amountUsd: number; amountVes: number }> = {};

    for (const transaction of transactions) {
      if (transaction.type !== 'withdrawal') continue;

      const category = transaction.category;
      if (!spending[category]) {
        spending[category] = { amountUsd: 0, amountVes: 0 };
      }

      spending[category].amountUsd += transaction.amount_usd;
      spending[category].amountVes += transaction.amount_ves;
    }

    return spending;
  }

  /**
   * Get recent transactions
   */
  static getRecentTransactions(
    transactions: PettyCashTransaction[],
    limit: number = 10
  ): PettyCashTransaction[] {
    return [...transactions]
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime())
      .slice(0, limit);
  }

  /**
   * Calculate total deposits and withdrawals
   */
  static calculateTotals(transactions: PettyCashTransaction[]): {
    totalDepositsUsd: number;
    totalDepositsVes: number;
    totalWithdrawalsUsd: number;
    totalWithdrawalsVes: number;
    netChangeUsd: number;
    netChangeVes: number;
  } {
    let totalDepositsUsd = 0;
    let totalDepositsVes = 0;
    let totalWithdrawalsUsd = 0;
    let totalWithdrawalsVes = 0;

    for (const transaction of transactions) {
      if (transaction.type === 'deposit' || transaction.type === 'replenishment') {
        totalDepositsUsd += transaction.amount_usd;
        totalDepositsVes += transaction.amount_ves;
      } else if (transaction.type === 'withdrawal') {
        totalWithdrawalsUsd += transaction.amount_usd;
        totalWithdrawalsVes += transaction.amount_ves;
      }
    }

    return {
      totalDepositsUsd,
      totalDepositsVes,
      totalWithdrawalsUsd,
      totalWithdrawalsVes,
      netChangeUsd: totalDepositsUsd - totalWithdrawalsUsd,
      netChangeVes: totalDepositsVes - totalWithdrawalsVes,
    };
  }

  /**
   * Get active petty cash accounts
   */
  static getActiveAccounts(accounts: PettyCash[]): PettyCash[] {
    return accounts.filter(a => a.is_active);
  }

  /**
   * Get petty cash by warehouse
   */
  static getByWarehouse(accounts: PettyCash[], warehouseId: string): PettyCash[] {
    return accounts.filter(a => a.warehouse_id === warehouseId);
  }

  /**
   * Search petty cash accounts
   */
  static searchAccounts(accounts: PettyCash[], query: string): PettyCash[] {
    const lowerQuery = query.toLowerCase();
    return accounts.filter(a => a.name.toLowerCase().includes(lowerQuery));
  }
}
