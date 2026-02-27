import { v4 as uuidv4 } from 'uuid';
import {
  BarcodeGeneration,
  BarcodeType,
} from '@red-salud/types';

export interface GenerateBarcodeOptions {
  product_id: string;
  product_name: string;
  barcode?: string;
  barcode_type?: BarcodeType;
  generated_by: string;
  warehouse_id: string;
}

export class BarcodeManager {
  private generations: BarcodeGeneration[] = [];

  constructor() {
    this.loadGenerations();
  }

  async loadGenerations(): Promise<void> {
    const stored = localStorage.getItem('barcode_generations');
    if (stored) {
      this.generations = JSON.parse(stored) as BarcodeGeneration[];
    }
  }

  async saveGenerations(): Promise<void> {
    localStorage.setItem('barcode_generations', JSON.stringify(this.generations));
  }

  async generateBarcode(options: GenerateBarcodeOptions): Promise<BarcodeGeneration> {
    const barcode = options.barcode || this.generateBarcodeString(options.barcode_type || BarcodeType.EAN13);

    const generation: BarcodeGeneration = {
      id: uuidv4(),
      product_id: options.product_id,
      product_name: options.product_name,
      barcode,
      barcode_type: options.barcode_type || BarcodeType.EAN13,
      generated_at: new Date(),
      generated_by: options.generated_by,
      warehouse_id: options.warehouse_id,
      print_count: 0,
      created_at: new Date(),
    };

    this.generations.push(generation);
    await this.saveGenerations();

    return generation;
  }

  private generateBarcodeString(type: BarcodeType): string {
    switch (type) {
      case BarcodeType.EAN13:
        return this.generateEAN13();
      case BarcodeType.CODE128:
        return this.generateCode128();
      case BarcodeType.CODE39:
        return this.generateCode39();
      case BarcodeType.QR:
        return this.generateQR();
      case BarcodeType.UPC:
        return this.generateUPC();
      default:
        return this.generateEAN13();
    }
  }

  private generateEAN13(): string {
    // Generate 12 random digits, then calculate checksum
    let digits = '';
    for (let i = 0; i < 12; i++) {
      digits += Math.floor(Math.random() * 10);
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(digits[i] as string);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checksum = (10 - (sum % 10)) % 10;

    return digits + checksum;
  }

  private generateCode128(): string {
    // Generate a random alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateCode39(): string {
    // Generate uppercase alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateQR(): string {
    // Generate a random string for QR code
    return `QR-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  }

  private generateUPC(): string {
    // Generate 11 random digits, then calculate checksum
    let digits = '';
    for (let i = 0; i < 11; i++) {
      digits += Math.floor(Math.random() * 10);
    }

    // Calculate checksum
    let sum = 0;
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(digits[i] as string);
      sum += i % 2 === 0 ? digit * 3 : digit;
    }
    const checksum = (10 - (sum % 10)) % 10;

    return digits + checksum;
  }

  async recordPrint(barcodeId: string, printedBy: string): Promise<BarcodeGeneration | null> {
    const generation = this.generations.find((g) => g.id === barcodeId);
    if (!generation) return null;

    generation.print_count++;
    generation.last_printed_at = new Date();
    generation.last_printed_by = printedBy;

    await this.saveGenerations();

    return generation;
  }

  getGenerations(productId?: string): BarcodeGeneration[] {
    let generations = [...this.generations];

    if (productId) {
      generations = generations.filter((g) => g.product_id === productId);
    }

    return generations.sort((a, b) => b.generated_at.getTime() - a.generated_at.getTime());
  }

  getGeneration(barcodeId: string): BarcodeGeneration | undefined {
    return this.generations.find((g) => g.id === barcodeId);
  }

  getGenerationByBarcode(barcode: string): BarcodeGeneration | undefined {
    return this.generations.find((g) => g.barcode === barcode);
  }

  async validateBarcode(barcode: string): Promise<{ valid: boolean; type?: BarcodeType }> {
    // Check if barcode exists
    const generation = this.generations.find((g) => g.barcode === barcode);

    if (generation) {
      return {
        valid: true,
        type: generation.barcode_type,
      };
    }

    // Validate format
    if (barcode.length === 13 && /^\d+$/.test(barcode)) {
      return {
        valid: true,
        type: BarcodeType.EAN13,
      };
    }

    if (barcode.length === 12 && /^\d+$/.test(barcode)) {
      return {
        valid: true,
        type: BarcodeType.UPC,
      };
    }

    if (/^[A-Z0-9]+$/.test(barcode) && barcode.length <= 10) {
      return {
        valid: true,
        type: BarcodeType.CODE128,
      };
    }

    if (barcode.startsWith('QR-')) {
      return {
        valid: true,
        type: BarcodeType.QR,
      };
    }

    return {
      valid: false,
    };
  }

  getBarcodeStats() {
    const total = this.generations.length;
    const byType = this.generations.reduce(
      (acc, g) => {
        acc[g.barcode_type] = (acc[g.barcode_type] || 0) + 1;
        return acc;
      },
      {} as Record<BarcodeType, number>,
    );

    const totalPrints = this.generations.reduce((sum, g) => sum + g.print_count, 0);
    const avgPrints = total > 0 ? totalPrints / total : 0;

    const recentlyGenerated = this.generations.filter(
      (g) => g.generated_at > new Date(Date.now() - 24 * 60 * 60 * 1000),
    ).length;

    return {
      total,
      byType,
      totalPrints,
      avgPrints,
      recentlyGenerated,
    };
  }

  async cleanupOldGenerations(retentionDays: number = 365): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const initialCount = this.generations.length;
    this.generations = this.generations.filter((g) => g.generated_at > cutoffDate);
    const removedCount = initialCount - this.generations.length;

    await this.saveGenerations();

    return removedCount;
  }
}
