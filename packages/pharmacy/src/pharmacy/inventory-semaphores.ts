import { Product } from '@red-salud/types';

/**
 * Inventory Semaphore Status
 */
export type SemaphoreStatus = 'critical' | 'warning' | 'normal';

/**
 * Inventory Semaphore
 */
export interface InventorySemaphore {
  id: string;
  
  // Product info
  product_id: string;
  product_name: string;
  product_sku: string;
  
  // Inventory levels
  current_stock: number;
  min_stock: number;
  max_stock: number;
  reorder_point: number;
  
  // Semaphore status
  status: SemaphoreStatus;
  
  // Flags
  is_no_sell_authorized: boolean;
  is_refrigerated: boolean;
  requires_prescription: boolean;
  
  // Expiry info
  nearest_expiry_date?: Date;
  days_to_expiry?: number;
  
  // Metadata
  last_updated: Date;
}

/**
 * Semaphore Configuration
 */
export interface SemaphoreConfiguration {
  // Thresholds
  critical_threshold: number; // Below this = critical (red)
  warning_threshold: number; // Below this = warning (yellow)
  
  // Flags
  refrigerated_products: boolean;
  prescription_required: boolean;
  
  // Time-based flags
  expiry_warning_days: number; // Days before expiry to flag
}

/**
 * Inventory Semaphore Manager
 * Manages inventory semaphores (red/yellow/blue) for visual indication
 */
export class InventorySemaphoreManager {
  private static semaphores: Map<string, InventorySemaphore> = new Map();
  private static configuration: SemaphoreConfiguration = {
    critical_threshold: 10,
    warning_threshold: 30,
    refrigerated_products: true,
    prescription_required: true,
    expiry_warning_days: 60,
  };
  private static STORAGE_KEY = 'inventory_semaphores';

  /**
   * Calculate semaphore status
   */
  static calculateSemaphoreStatus(
    currentStock: number,
    minStock: number,
    maxStock: number,
    reorderPoint: number,
    daysToExpiry?: number
  ): SemaphoreStatus {
    // Critical conditions
    if (currentStock <= 0) return 'critical';
    if (currentStock <= this.configuration.critical_threshold) return 'critical';
    if (daysToExpiry && daysToExpiry <= 7) return 'critical';
    
    // Warning conditions
    if (currentStock <= this.configuration.warning_threshold) return 'warning';
    if (daysToExpiry && daysToExpiry <= this.configuration.expiry_warning_days) return 'warning';
    if (currentStock <= reorderPoint) return 'warning';
    
    // Normal
    return 'normal';
  }

  /**
   * Create or update semaphore
   */
  static async createOrUpdateSemaphore(data: {
    productId: string;
    productName: string;
    productSku: string;
    currentStock: number;
    minStock: number;
    maxStock: number;
    reorderPoint: number;
    isNoSellAuthorized?: boolean;
    isRefrigerated?: boolean;
    requiresPrescription?: boolean;
    nearestExpiryDate?: Date;
  }): Promise<InventorySemaphore> {
    const daysToExpiry = data.nearestExpiryDate
      ? Math.floor((data.nearestExpiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : undefined;

    const status = this.calculateSemaphoreStatus(
      data.currentStock,
      data.minStock,
      data.maxStock,
      data.reorderPoint,
      daysToExpiry
    );

    const semaphore: InventorySemaphore = {
      id: data.productId,
      product_id: data.productId,
      product_name: data.productName,
      product_sku: data.productSku,
      current_stock: data.currentStock,
      min_stock: data.minStock,
      max_stock: data.maxStock,
      reorder_point: data.reorderPoint,
      status,
      is_no_sell_authorized: data.isNoSellAuthorized || false,
      is_refrigerated: data.isRefrigerated || false,
      requires_prescription: data.requiresPrescription || false,
      nearest_expiry_date: data.nearestExpiryDate,
      days_to_expiry: daysToExpiry,
      last_updated: new Date(),
    };

    this.semaphores.set(data.productId, semaphore);
    await this.persistSemaphores();

    return semaphore;
  }

  /**
   * Get semaphore by product
   */
  static getSemaphore(productId: string): InventorySemaphore | undefined {
    return this.semaphores.get(productId);
  }

  /**
   * Get all semaphores
   */
  static getAllSemaphores(): InventorySemaphore[] {
    return Array.from(this.semaphores.values());
  }

  /**
   * Get semaphores by status
   */
  static getSemaphoresByStatus(status: SemaphoreStatus): InventorySemaphore[] {
    return Array.from(this.semaphores.values()).filter(s => s.status === status);
  }

  /**
   * Get critical items (red semaphore)
   */
  static getCriticalItems(): InventorySemaphore[] {
    return this.getSemaphoresByStatus('critical');
  }

  /**
   * Get warning items (yellow semaphore)
   */
  static getWarningItems(): InventorySemaphore[] {
    return this.getSemaphoresByStatus('warning');
  }

  /**
   * Get normal items (blue semaphore)
   */
  static getNormalItems(): InventorySemaphore[] {
    return this.getSemaphoresByStatus('normal');
  }

  /**
   * Get semaphore statistics
   */
  static getSemaphoreStatistics(): {
    total: number;
    critical: number;
    warning: number;
    normal: number;
    refrigerated: number;
    no_sell_authorized: number;
    requires_prescription: number;
  } {
    const semaphores = this.getAllSemaphores();

    return {
      total: semaphores.length,
      critical: semaphores.filter(s => s.status === 'critical').length,
      warning: semaphores.filter(s => s.status === 'warning').length,
      normal: semaphores.filter(s => s.status === 'normal').length,
      refrigerated: semaphores.filter(s => s.is_refrigerated).length,
      no_sell_authorized: semaphores.filter(s => s.is_no_sell_authorized).length,
      requires_prescription: semaphores.filter(s => s.requires_prescription).length,
    };
  }

  /**
   * Update semaphore configuration
   */
  static async updateConfiguration(config: Partial<SemaphoreConfiguration>): Promise<void> {
    this.configuration = { ...this.configuration, ...config };
    // Recalculate all semaphores with new configuration
    for (const semaphore of this.semaphores.values()) {
      const status = this.calculateSemaphoreStatus(
        semaphore.current_stock,
        semaphore.min_stock,
        semaphore.max_stock,
        semaphore.reorder_point,
        semaphore.days_to_expiry
      );
      semaphore.status = status;
    }
    await this.persistSemaphores();
  }

  /**
   * Get configuration
   */
  static getConfiguration(): SemaphoreConfiguration {
    return { ...this.configuration };
  }

  /**
   * Persist semaphores
   */
  private static async persistSemaphores(): Promise<void> {
    try {
      const data = Array.from(this.semaphores.entries());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error persisting inventory semaphores:', error);
    }
  }

  /**
   * Load semaphores
   */
  static async loadSemaphores(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.semaphores = new Map(
          data.map(([id, semaphore]: [string, any]) => [
            id,
            {
              ...semaphore,
              nearest_expiry_date: semaphore.nearest_expiry_date ? new Date(semaphore.nearest_expiry_date) : undefined,
              last_updated: new Date(semaphore.last_updated),
            },
          ])
        );
      }
    } catch (error) {
      console.error('Error loading inventory semaphores:', error);
    }
  }
}
