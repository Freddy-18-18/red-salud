import { Product } from '@red-salud/types';

/**
 * Quarantine Inspection Record
 */
export interface QuarantineInspection {
  id: string;
  layer_id: string;
  product_id: string;
  internal_lot_number: string;
  
  inspected_by: string;
  inspected_at: Date;
  
  // Inspection checks
  seals_intact: boolean;
  temperature_ok: boolean;
  temperature_celsius?: number;
  packaging_condition: 'good' | 'damaged' | 'wet';
  expiration_date_ok: boolean;
  expiration_date?: Date;
  
  // Approval
  approved: boolean;
  rejection_reason?: string;
  
  notes?: string;
  
  created_at: Date;
}

/**
 * Lost Sale Record
 */
export interface LostSale {
  id: string;
  product_id: string;
  product_name: string;
  requested_quantity: number;
  
  requested_at: Date;
  requested_by: string; // cashier_id
  
  reason: 'out_of_stock' | 'expired' | 'in_quarantine';
  
  // Auto-suggested reorder
  auto_suggested: boolean;
  suggested_quantity?: number;
  
  created_at: Date;
}

/**
 * Inventory Semaphore (Semáforo de Inventario)
 */
export interface InventorySemaphore {
  product_id: string;
  status: 'critical' | 'warning' | 'normal';
  
  // Critical (Rojo)
  stock_critical: boolean;
  no_sell_without_auth: boolean;
  
  // Warning (Amarillo)
  expiring_soon: boolean;
  days_until_expiry?: number;
  
  // Special (Azul)
  refrigerated: boolean;
  deliver_with_ice: boolean;
  
  updated_at: Date;
}

/**
 * Advanced Inventory Manager
 * Handles micro-management of inventory with quarantine, lot tracking, and lost sales
 */
export class AdvancedInventoryManager {
  private static quarantineRecords: QuarantineInspection[] = [];
  private static lostSales: LostSale[] = [];
  private static semaphores: Map<string, InventorySemaphore> = new Map();
  
  private static STORAGE_KEY_QUARANTINE = 'quarantine_inspections';
  private static STORAGE_KEY_LOST_SALES = 'lost_sales';
  private static STORAGE_KEY_SEMAPHORES = 'inventory_semaphores';

  /**
   * Create quarantine inspection record
   */
  static async createQuarantineInspection(data: {
    layerId: string;
    productId: string;
    internalLotNumber: string;
    inspectedBy: string;
    sealsIntact: boolean;
    temperatureOk: boolean;
    temperatureCelsius?: number;
    packagingCondition: 'good' | 'damaged' | 'wet';
    expirationDateOk: boolean;
    expirationDate?: Date;
    approved: boolean;
    rejectionReason?: string;
    notes?: string;
  }): Promise<QuarantineInspection> {
    const inspection: QuarantineInspection = {
      id: crypto.randomUUID(),
      layer_id: data.layerId,
      product_id: data.productId,
      internal_lot_number: data.internalLotNumber,
      inspected_by: data.inspectedBy,
      inspected_at: new Date(),
      seals_intact: data.sealsIntact,
      temperature_ok: data.temperatureOk,
      temperature_celsius: data.temperatureCelsius,
      packaging_condition: data.packagingCondition,
      expiration_date_ok: data.expirationDateOk,
      expiration_date: data.expirationDate,
      approved: data.approved,
      rejection_reason: data.rejectionReason,
      notes: data.notes,
      created_at: new Date(),
    };

    this.quarantineRecords.push(inspection);
    await this.persistQuarantineRecords();

    return inspection;
  }

  /**
   * Record lost sale
   */
  static async recordLostSale(data: {
    productId: string;
    productName: string;
    requestedQuantity: number;
    requestedBy: string;
    reason: 'out_of_stock' | 'expired' | 'in_quarantine';
  }): Promise<LostSale> {
    const lostSale: LostSale = {
      id: crypto.randomUUID(),
      product_id: data.productId,
      product_name: data.productName,
      requested_quantity: data.requestedQuantity,
      requested_at: new Date(),
      requested_by: data.requestedBy,
      reason: data.reason,
      auto_suggested: false,
      created_at: new Date(),
    };

    this.lostSales.push(lostSale);
    await this.persistLostSales();

    return lostSale;
  }

  /**
   * Get lost sales by product and date range
   */
  static getLostSalesByProduct(
    productId: string,
    startDate: Date,
    endDate: Date
  ): LostSale[] {
    return this.lostSales.filter(sale => {
      const saleDate = new Date(sale.requested_at);
      return sale.product_id === productId && saleDate >= startDate && saleDate <= endDate;
    });
  }

  /**
   * Generate lost sales report for reordering
   */
  static generateLostSalesReport(startDate: Date, endDate: Date): Array<{
    product_id: string;
    product_name: string;
    total_requests: number;
    total_quantity_requested: number;
    last_requested: Date;
    suggested_reorder_quantity: number;
  }> {
    const productStats = new Map<string, {
      product_id: string;
      product_name: string;
      total_requests: number;
      total_quantity: number;
      last_requested: Date;
    }>();

    this.lostSales.forEach(sale => {
      const saleDate = new Date(sale.requested_at);
      if (saleDate >= startDate && saleDate <= endDate) {
        const existing = productStats.get(sale.product_id);
        
        if (existing) {
          existing.total_requests++;
          existing.total_quantity += sale.requested_quantity;
          if (saleDate > existing.last_requested) {
            existing.last_requested = saleDate;
          }
        } else {
          productStats.set(sale.product_id, {
            product_id: sale.product_id,
            product_name: sale.product_name,
            total_requests: 1,
            total_quantity: sale.requested_quantity,
            last_requested: saleDate,
          });
        }
      }
    });

    return Array.from(productStats.values()).map(stat => ({
      product_id: stat.product_id,
      product_name: stat.product_name,
      total_requests: stat.total_requests,
      total_quantity_requested: stat.total_quantity,
      last_requested: stat.last_requested,
      suggested_reorder_quantity: Math.ceil(stat.total_quantity * 1.5), // 50% buffer
    }));
  }

  /**
   * Update inventory semaphore status
   */
  static updateSemaphore(productId: string, data: {
    stockCritical?: boolean;
    noSellWithoutAuth?: boolean;
    expiringSoon?: boolean;
    daysUntilExpiry?: number;
    refrigerated?: boolean;
    deliverWithIce?: boolean;
  }): void {
    const current = this.semaphores.get(productId) || {
      product_id: productId,
      status: 'normal',
      stock_critical: false,
      no_sell_without_auth: false,
      expiring_soon: false,
      refrigerated: false,
      deliver_with_ice: false,
      updated_at: new Date(),
    };

    if (data.stockCritical !== undefined) current.stock_critical = data.stockCritical;
    if (data.noSellWithoutAuth !== undefined) current.no_sell_without_auth = data.noSellWithoutAuth;
    if (data.expiringSoon !== undefined) current.expiring_soon = data.expiringSoon;
    if (data.daysUntilExpiry !== undefined) current.days_until_expiry = data.daysUntilExpiry;
    if (data.refrigerated !== undefined) current.refrigerated = data.refrigerated;
    if (data.deliverWithIce !== undefined) current.deliver_with_ice = data.deliverWithIce;

    // Determine status
    if (current.stock_critical) {
      current.status = 'critical';
    } else if (current.expiring_soon) {
      current.status = 'warning';
    } else {
      current.status = 'normal';
    }

    current.updated_at = new Date();
    this.semaphores.set(productId, current);
  }

  /**
   * Get semaphore for product
   */
  static getSemaphore(productId: string): InventorySemaphore | undefined {
    return this.semaphores.get(productId);
  }

  /**
   * Get all semaphores by status
   */
  static getSemaphoresByStatus(status: 'critical' | 'warning' | 'normal'): InventorySemaphore[] {
    return Array.from(this.semaphores.values()).filter(s => s.status === status);
  }

  /**
   * Persist quarantine records
   */
  private static async persistQuarantineRecords(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_QUARANTINE, JSON.stringify(this.quarantineRecords));
    } catch (error) {
      console.error('Error persisting quarantine records:', error);
    }
  }

  /**
   * Persist lost sales
   */
  private static async persistLostSales(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY_LOST_SALES, JSON.stringify(this.lostSales));
    } catch (error) {
      console.error('Error persisting lost sales:', error);
    }
  }

  /**
   * Load quarantine records
   */
  static async loadQuarantineRecords(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_QUARANTINE);
      if (stored) {
        this.quarantineRecords = JSON.parse(stored).map((record: any) => ({
          ...record,
          inspected_at: new Date(record.inspected_at),
          expiration_date: record.expiration_date ? new Date(record.expiration_date) : undefined,
          created_at: new Date(record.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading quarantine records:', error);
    }
  }

  /**
   * Load lost sales
   */
  static async loadLostSales(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_LOST_SALES);
      if (stored) {
        this.lostSales = JSON.parse(stored).map((sale: any) => ({
          ...sale,
          requested_at: new Date(sale.requested_at),
          created_at: new Date(sale.created_at),
        }));
      }
    } catch (error) {
      console.error('Error loading lost sales:', error);
    }
  }

  /**
   * Load semaphores
   */
  static async loadSemaphores(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY_SEMAPHORES);
      if (stored) {
        const data = JSON.parse(stored);
        this.semaphores = new Map(
          data.map((s: any) => [
            s.product_id,
            {
              ...s,
              updated_at: new Date(s.updated_at),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Error loading semaphores:', error);
    }
  }
}
