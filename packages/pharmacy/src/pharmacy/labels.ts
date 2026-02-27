import { v4 as uuidv4 } from 'uuid';
import {
  LabelTemplate,
  LabelPrintJob,
  LabelSize,
} from '@red-salud/types';

export interface CreateTemplateOptions {
  name: string;
  description?: string;
  label_size: LabelSize;
  width_mm?: number;
  height_mm?: number;
  barcode_type: LabelTemplate['barcode_type'];
  show_barcode?: boolean;
  barcode_position?: LabelTemplate['barcode_position'];
  show_product_name?: boolean;
  show_price?: boolean;
  show_expiry_date?: boolean;
  show_batch_number?: boolean;
  show_sku?: boolean;
  price_currency?: 'USD' | 'VES' | 'BOTH';
  show_iva?: boolean;
  font_size?: number;
  font_family?: string;
  border_width?: number;
  margin?: number;
  custom_fields?: LabelTemplate['custom_fields'];
  is_default?: boolean;
  warehouse_id?: string;
  created_by: string;
}

export interface PrintJobOptions {
  items: Array<{
    product_id: string;
    product_name: string;
    barcode: string;
    quantity: number;
    template_id?: string;
  }>;
  printer_name?: string;
  printer_ip?: string;
  created_by: string;
  warehouse_id: string;
}

export class LabelManager {
  private templates: LabelTemplate[] = [];
  private printJobs: LabelPrintJob[] = [];

  constructor() {
    this.loadTemplates();
    this.loadPrintJobs();
  }

  async loadTemplates(): Promise<void> {
    const stored = localStorage.getItem('label_templates');
    if (stored) {
      this.templates = JSON.parse(stored) as LabelTemplate[];
    }
  }

  async saveTemplates(): Promise<void> {
    localStorage.setItem('label_templates', JSON.stringify(this.templates));
  }

  async loadPrintJobs(): Promise<void> {
    const stored = localStorage.getItem('label_print_jobs');
    if (stored) {
      this.printJobs = JSON.parse(stored) as LabelPrintJob[];
    }
  }

  async savePrintJobs(): Promise<void> {
    localStorage.setItem('label_print_jobs', JSON.stringify(this.printJobs));
  }

  async createTemplate(options: CreateTemplateOptions): Promise<LabelTemplate> {
    // Check if default template already exists
    if (options.is_default) {
      this.templates.forEach((t) => {
        t.is_default = false;
      });
    }

    const template: LabelTemplate = {
      id: uuidv4(),
      name: options.name,
      description: options.description,
      label_size: options.label_size,
      width_mm: options.width_mm,
      height_mm: options.height_mm,
      barcode_type: options.barcode_type,
      show_barcode: options.show_barcode ?? true,
      barcode_position: options.barcode_position || 'bottom',
      show_product_name: options.show_product_name ?? true,
      show_price: options.show_price ?? true,
      show_expiry_date: options.show_expiry_date ?? true,
      show_batch_number: options.show_batch_number ?? false,
      show_sku: options.show_sku ?? false,
      price_currency: options.price_currency || 'BOTH',
      show_iva: options.show_iva ?? false,
      font_size: options.font_size || 12,
      font_family: options.font_family || 'Arial',
      border_width: options.border_width || 1,
      margin: options.margin || 2,
      custom_fields: options.custom_fields || [],
      is_default: options.is_default || false,
      is_active: true,
      warehouse_id: options.warehouse_id,
      created_by: options.created_by,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.templates.push(template);
    await this.saveTemplates();

    return template;
  }

  async updateTemplate(
    templateId: string,
    updates: Partial<LabelTemplate>,
  ): Promise<LabelTemplate | null> {
    const template = this.templates.find((t) => t.id === templateId);
    if (!template) return null;

    if (updates.is_default) {
      this.templates.forEach((t) => {
        t.is_default = false;
      });
    }

    const updated: LabelTemplate = {
      ...template,
      ...updates,
      updated_at: new Date(),
    };

    const index = this.templates.findIndex((t) => t.id === templateId);
    this.templates[index] = updated;
    await this.saveTemplates();

    return updated;
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    const index = this.templates.findIndex((t) => t.id === templateId);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    await this.saveTemplates();

    return true;
  }

  getTemplate(templateId: string): LabelTemplate | undefined {
    return this.templates.find((t) => t.id === templateId);
  }

  getTemplates(warehouseId?: string): LabelTemplate[] {
    let templates = [...this.templates];

    if (warehouseId) {
      templates = templates.filter((t) => t.warehouse_id === warehouseId);
    }

    return templates.filter((t) => t.is_active);
  }

  getDefaultTemplate(warehouseId?: string): LabelTemplate | undefined {
    let templates = this.templates.filter((t) => t.is_default && t.is_active);

    if (warehouseId) {
      templates = templates.filter((t) => t.warehouse_id === warehouseId);
    }

    return templates[0];
  }

  async createPrintJob(options: PrintJobOptions): Promise<LabelPrintJob> {
    const totalItems = options.items.reduce((sum, item) => sum + item.quantity, 0);

    const job: LabelPrintJob = {
      id: uuidv4(),
      job_number: `LBL-${Date.now()}`,
      items: options.items,
      printer_name: options.printer_name,
      printer_ip: options.printer_ip,
      status: 'pending',
      total_items: totalItems,
      printed_items: 0,
      failed_items: 0,
      created_by: options.created_by,
      warehouse_id: options.warehouse_id,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.printJobs.push(job);
    await this.savePrintJobs();

    return job;
  }

  async startPrintJob(jobId: string): Promise<LabelPrintJob | null> {
    const job = this.printJobs.find((j) => j.id === jobId);
    if (!job) return null;

    if (job.status !== 'pending') return null;

    job.status = 'printing';
    job.started_at = new Date();
    job.updated_at = new Date();

    await this.savePrintJobs();

    // Simulate printing process
    this.simulatePrinting(job);

    return job;
  }

  private async simulatePrinting(job: LabelPrintJob): Promise<void> {
    const totalItems = job.total_items;
    let printed = 0;

    const printInterval = setInterval(async () => {
      printed += Math.min(5, totalItems - printed);
      job.printed_items = printed;
      job.updated_at = new Date();

      if (printed >= totalItems) {
        clearInterval(printInterval);
        job.status = 'completed';
        job.completed_at = new Date();
        await this.savePrintJobs();
      } else {
        await this.savePrintJobs();
      }
    }, 200);
  }

  async cancelPrintJob(jobId: string): Promise<LabelPrintJob | null> {
    const job = this.printJobs.find((j) => j.id === jobId);
    if (!job) return null;

    if (job.status === 'completed') return null;

    job.status = 'failed';
    job.error_message = 'Print job cancelled';
    job.completed_at = new Date();
    job.updated_at = new Date();

    await this.savePrintJobs();

    return job;
  }

  getPrintJob(jobId: string): LabelPrintJob | undefined {
    return this.printJobs.find((j) => j.id === jobId);
  }

  getPrintJobs(warehouseId?: string, limit?: number): LabelPrintJob[] {
    let jobs = [...this.printJobs];

    if (warehouseId) {
      jobs = jobs.filter((j) => j.warehouse_id === warehouseId);
    }

    jobs.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    return limit ? jobs.slice(0, limit) : jobs;
  }

  getActivePrintJobs(warehouseId?: string): LabelPrintJob[] {
    let jobs = this.printJobs.filter((j) => j.status === 'printing' || j.status === 'pending');

    if (warehouseId) {
      jobs = jobs.filter((j) => j.warehouse_id === warehouseId);
    }

    return jobs.sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
  }

  getPrintJobStats() {
    const total = this.printJobs.length;
    const pending = this.printJobs.filter((j) => j.status === 'pending').length;
    const printing = this.printJobs.filter((j) => j.status === 'printing').length;
    const completed = this.printJobs.filter((j) => j.status === 'completed').length;
    const failed = this.printJobs.filter((j) => j.status === 'failed').length;

    const totalItemsPrinted = this.printJobs.reduce((sum, j) => sum + j.printed_items, 0);
    const avgItemsPerJob = completed > 0 ? totalItemsPrinted / completed : 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const jobsToday = this.printJobs.filter((j) => j.created_at >= today).length;

    return {
      total,
      pending,
      printing,
      completed,
      failed,
      totalItemsPrinted,
      avgItemsPerJob,
      jobsToday,
    };
  }

  async cleanupOldJobs(retentionDays: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.printJobs.length;
    this.printJobs = this.printJobs.filter((j) => j.created_at > cutoffDate);
    const removedCount = initialCount - this.printJobs.length;

    await this.savePrintJobs();

    return removedCount;
  }

  async cleanupOldTemplates(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.templates.length;
    this.templates = this.templates.filter((t) => t.created_at > cutoffDate || t.is_default);
    const removedCount = initialCount - this.templates.length;

    await this.saveTemplates();

    return removedCount;
  }
}
