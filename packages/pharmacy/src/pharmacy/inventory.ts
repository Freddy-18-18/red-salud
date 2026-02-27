import { Batch, Product, InventoryZone } from '@red-salud/types';

/**
 * FEFO (First-Expired, First-Out) Inventory Manager
 * Ensures products with nearest expiry dates are dispensed first
 */
export class FEFOManager {
  /**
   * Select the optimal batch for dispensing based on FEFO principle
   * @param batches - Available batches for a product
   * @param quantity - Quantity needed
   * @returns Selected batches with quantities
   */
  static selectBatchesForDispensing(
    batches: Batch[],
    quantity: number
  ): { batchId: string; quantity: number }[] {
    // Filter available batches and sort by expiry date (nearest first)
    const availableBatches = batches
      .filter(
        (batch) =>
          batch.zone === InventoryZone.AVAILABLE &&
          batch.quantity > 0 &&
          new Date(batch.expiry_date) > new Date()
      )
      .sort((a, b) =>
        new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
      );

    const selectedBatches: { batchId: string; quantity: number }[] = [];
    let remainingQuantity = quantity;

    for (const batch of availableBatches) {
      if (remainingQuantity <= 0) break;

      const takeQuantity = Math.min(batch.quantity, remainingQuantity);
      selectedBatches.push({
        batchId: batch.id,
        quantity: takeQuantity,
      });
      remainingQuantity -= takeQuantity;
    }

    if (remainingQuantity > 0) {
      throw new Error(
        `Insufficient stock. Available: ${quantity - remainingQuantity}, Requested: ${quantity}`
      );
    }

    return selectedBatches;
  }

  /**
   * Get batches expiring within warning period (default: 90 days)
   */
  static getExpiringBatches(
    batches: Batch[],
    warningDays: number = 90
  ): Batch[] {
    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + warningDays);

    return batches.filter(
      (batch) =>
        batch.zone === InventoryZone.AVAILABLE &&
        new Date(batch.expiry_date) <= warningDate &&
        new Date(batch.expiry_date) > new Date()
    );
  }

  /**
   * Get expired batches
   */
  static getExpiredBatches(batches: Batch[]): Batch[] {
    return batches.filter(
      (batch) =>
        batch.zone === InventoryZone.AVAILABLE &&
        new Date(batch.expiry_date) < new Date()
    );
  }

  /**
   * Calculate total available quantity across all batches
   */
  static getTotalAvailableQuantity(batches: Batch[]): number {
    return batches
      .filter(
        (batch) =>
          batch.zone === InventoryZone.AVAILABLE &&
          new Date(batch.expiry_date) > new Date()
      )
      .reduce((sum, batch) => sum + batch.quantity, 0);
  }

  /**
   * Get batch with nearest expiry date
   */
  static getNearestExpiryBatch(batches: Batch[]): Batch | null {
    const availableBatches = batches.filter(
      (batch) =>
        batch.zone === InventoryZone.AVAILABLE &&
        batch.quantity > 0 &&
        new Date(batch.expiry_date) > new Date()
    );

    if (availableBatches.length === 0) return null;

    const sorted = availableBatches.sort((a, b) =>
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
    );

    return sorted[0] || null;
  }

  /**
   * Check if product is in low stock
   */
  static isLowStock(product: Product, availableQuantity: number): boolean {
    return availableQuantity <= product.min_stock;
  }

  /**
   * Check if product needs reordering
   */
  static needsReorder(product: Product, availableQuantity: number): boolean {
    return availableQuantity <= product.reorder_point;
  }

  /**
   * Calculate recommended reorder quantity
   */
  static calculateReorderQuantity(product: Product): number {
    return product.max_stock - product.reorder_point;
  }
}

/**
 * Inventory Alert Generator
 */
export class InventoryAlertGenerator {
  static generateLowStockAlerts(
    products: Product[],
    batches: Batch[]
  ): Array<{ productId: string; productName: string; available: number; min: number }> {
    return products
      .map((product) => {
        const available = FEFOManager.getTotalAvailableQuantity(
          batches.filter((b) => b.product_id === product.id)
        );

        if (FEFOManager.isLowStock(product, available)) {
          return {
            productId: product.id,
            productName: product.name,
            available,
            min: product.min_stock,
          };
        }
        return null;
      })
      .filter((alert): alert is NonNullable<typeof alert> => alert !== null);
  }

  static generateExpiryAlerts(
    batches: Batch[],
    warningDays: number = 90
  ): Array<{ batchId: string; expiryDate: Date; daysUntilExpiry: number }> {
    const expiringBatches = FEFOManager.getExpiringBatches(batches, warningDays);

    return expiringBatches.map((batch) => ({
      batchId: batch.id,
      expiryDate: new Date(batch.expiry_date),
      daysUntilExpiry: Math.floor(
        (new Date(batch.expiry_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      ),
    }));
  }
}

/**
 * Stock Transfer Manager
 */
export class StockTransferManager {
  /**
   * Transfer stock between warehouses
   */
  static transferBetweenWarehouses(
    batches: Batch[],
    fromWarehouseId: string,
    toWarehouseId: string,
    productId: string,
    quantity: number
  ): { batchId: string; quantity: number }[] {
    const sourceBatches = batches.filter(
      (b) =>
        b.product_id === productId &&
        b.warehouse_id === fromWarehouseId &&
        b.zone === InventoryZone.AVAILABLE
    );

    const selectedBatches = FEFOManager.selectBatchesForDispensing(sourceBatches, quantity);

    return selectedBatches.map((selection) => ({
      batchId: selection.batchId,
      quantity: selection.quantity,
    }));
  }

  /**
   * Move batch to quarantine zone
   */
  static moveToQuarantine(batch: Batch): Batch {
    return {
      ...batch,
      zone: InventoryZone.QUARANTINE,
      updated_at: new Date(),
    };
  }

  /**
   * Move batch to rejected zone
   */
  static moveToRejected(batch: Batch): Batch {
    return {
      ...batch,
      zone: InventoryZone.REJECTED,
      updated_at: new Date(),
    };
  }
}
