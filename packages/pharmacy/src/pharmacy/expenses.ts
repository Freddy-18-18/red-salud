import { v4 as uuidv4 } from 'uuid';
import {
  Expense,
  Creditor,
} from '@red-salud/types';

export class ExpensesManager {
  private expenses: Expense[] = [];
  private creditors: Creditor[] = [];

  constructor() {
    this.loadExpenses();
    this.loadCreditors();
  }

  async loadExpenses(): Promise<void> {
    const stored = localStorage.getItem('expenses');
    if (stored) {
      this.expenses = JSON.parse(stored) as Expense[];
    }
  }

  async saveExpenses(): Promise<void> {
    localStorage.setItem('expenses', JSON.stringify(this.expenses));
  }

  async loadCreditors(): Promise<void> {
    const stored = localStorage.getItem('creditors');
    if (stored) {
      this.creditors = JSON.parse(stored) as Creditor[];
    }
  }

  async saveCreditors(): Promise<void> {
    localStorage.setItem('creditors', JSON.stringify(this.creditors));
  }

  async createExpense(expense: Omit<Expense, 'id' | 'created_at'>): Promise<Expense> {
    const newExpense: Expense = {
      ...expense,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.expenses.push(newExpense);
    await this.saveExpenses();

    return newExpense;
  }

  async createCreditor(creditor: Omit<Creditor, 'id' | 'created_at'>): Promise<Creditor> {
    const newCreditor: Creditor = {
      ...creditor,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.creditors.push(newCreditor);
    await this.saveCreditors();

    return newCreditor;
  }

  getExpenses(status?: Expense['status'], warehouseId?: string): Expense[] {
    let expenses = [...this.expenses];

    if (status) {
      expenses = expenses.filter((e) => e.status === status);
    }

    if (warehouseId) {
      expenses = expenses.filter((e) => e.warehouse_id === warehouseId);
    }

    return expenses.sort((a, b) => b.expense_date.getTime() - a.expense_date.getTime());
  }

  getCreditors(): Creditor[] {
    return this.creditors.filter((c) => c.is_active);
  }

  getCreditor(creditorId: string): Creditor | undefined {
    return this.creditors.find((c) => c.id === creditorId);
  }
}
