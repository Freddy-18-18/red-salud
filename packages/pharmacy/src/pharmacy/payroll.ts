import { v4 as uuidv4 } from 'uuid';
import {
  Employee,
  PayrollRecord,
} from '@red-salud/types';

export class PayrollManager {
  private employees: Employee[] = [];
  private payrollRecords: PayrollRecord[] = [];

  constructor() {
    this.loadEmployees();
    this.loadPayrollRecords();
  }

  async loadEmployees(): Promise<void> {
    const stored = localStorage.getItem('employees');
    if (stored) {
      this.employees = JSON.parse(stored) as Employee[];
    }
  }

  async saveEmployees(): Promise<void> {
    localStorage.setItem('employees', JSON.stringify(this.employees));
  }

  async loadPayrollRecords(): Promise<void> {
    const stored = localStorage.getItem('payroll_records');
    if (stored) {
      this.payrollRecords = JSON.parse(stored) as PayrollRecord[];
    }
  }

  async savePayrollRecords(): Promise<void> {
    localStorage.setItem('payroll_records', JSON.stringify(this.payrollRecords));
  }

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at'>): Promise<Employee> {
    const newEmployee: Employee = {
      ...employee,
      id: uuidv4(),
      created_at: new Date(),
    };

    this.employees.push(newEmployee);
    await this.saveEmployees();

    return newEmployee;
  }

  async generatePayroll(record: Omit<PayrollRecord, 'id' | 'generated_at'>): Promise<PayrollRecord> {
    const newRecord: PayrollRecord = {
      ...record,
      id: uuidv4(),
      generated_at: new Date(),
    };

    this.payrollRecords.push(newRecord);
    await this.savePayrollRecords();

    return newRecord;
  }

  getEmployees(isActive?: boolean): Employee[] {
    let employees = [...this.employees];

    if (isActive !== undefined) {
      employees = employees.filter((e) => e.is_active === isActive);
    }

    return employees.sort((a, b) => a.hire_date.getTime() - b.hire_date.getTime());
  }

  getEmployee(employeeId: string): Employee | undefined {
    return this.employees.find((e) => e.id === employeeId);
  }

  getPayrollRecords(employeeId?: string): PayrollRecord[] {
    let records = [...this.payrollRecords];

    if (employeeId) {
      records = records.filter((r) => r.employee_id === employeeId);
    }

    return records.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
  }
}
