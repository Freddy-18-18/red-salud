import { Supplier, PurchaseOrder, Product } from '@red-salud/types';

/**
 * Supplier Comparison Manager
 * Compares prices and availability across multiple suppliers
 */
export class SupplierComparisonManager {
  /**
   * Compare product prices across suppliers
   */
  static compareProductPrices(
    productId: string,
    suppliers: Supplier[],
    supplierPrices: Array<{
      supplier_id: string;
      product_id: string;
      price_usd: number;
      price_ves: number;
      availability: number;
      last_updated: Date;
    }>
  ): Array<{
    supplier: Supplier;
    price_usd: number;
    price_ves: number;
    availability: number;
    last_updated: Date;
  }> {
    return supplierPrices
      .filter(price => price.product_id === productId)
      .map(price => {
        const supplier = suppliers.find(s => s.id === price.supplier_id);
        if (!supplier) return null;
        return {
          supplier,
          price_usd: price.price_usd,
          price_ves: price.price_ves,
          availability: price.availability,
          last_updated: price.last_updated,
        };
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
      .sort((a, b) => a.price_usd - b.price_usd);
  }

  /**
   * Find best supplier for a product based on price and availability
   */
  static findBestSupplier(
    productId: string,
    suppliers: Supplier[],
    supplierPrices: Array<{
      supplier_id: string;
      product_id: string;
      price_usd: number;
      price_ves: number;
      availability: number;
      last_updated: Date;
    }>,
    quantity: number
  ): { supplier: Supplier; price_usd: number; price_ves: number } | null {
    const comparisons = this.compareProductPrices(productId, suppliers, supplierPrices);

    // Filter suppliers with sufficient availability
    const available = comparisons.filter(c => c.availability >= quantity);

    if (available.length === 0) {
      return null;
    }

    const best = available[0];
    if (!best) return null;

    // Return the cheapest available supplier
    return {
      supplier: best.supplier,
      price_usd: best.price_usd,
      price_ves: best.price_ves,
    };
  }

  /**
   * Generate supplier comparison report
   */
  static generateComparisonReport(
    products: Product[],
    suppliers: Supplier[],
    supplierPrices: Array<{
      supplier_id: string;
      product_id: string;
      price_usd: number;
      price_ves: number;
      availability: number;
      last_updated: Date;
    }>
  ) {
    return products.map(product => {
      const comparisons = this.compareProductPrices(product.id, suppliers, supplierPrices);

      return {
        product_id: product.id,
        product_name: product.name,
        sku: product.sku,
        suppliers: comparisons.map(c => ({
          supplier_name: c.supplier.name,
          price_usd: c.price_usd,
          price_ves: c.price_ves,
          availability: c.availability,
          last_updated: c.last_updated,
        })),
        best_price_usd: comparisons[0]?.price_usd ?? null,
        best_supplier: comparisons[0]?.supplier.name ?? null,
      };
    });
  }
}

/**
 * Purchase Order Manager
 * Handles purchase order creation and management
 */
export class PurchaseOrderManager {
  /**
   * Generate purchase order number
   */
  static generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 10000)).padStart(4, '0');

    return `PO-${year}${month}${day}-${sequence}`;
  }

  /**
   * Create purchase order
   */
  static createPurchaseOrder(
    supplierId: string,
    warehouseId: string,
    items: Array<{
      product_id: string;
      quantity: number;
      unit_price_usd: number;
      unit_price_ves: number;
    }>,
    ivaRate: number = 0.16
  ): Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at' | 'created_by'> {
    const subtotalUsd = items.reduce((sum, item) => sum + (item.unit_price_usd * item.quantity), 0);
    const subtotalVes = items.reduce((sum, item) => sum + (item.unit_price_ves * item.quantity), 0);
    const ivaUsd = subtotalUsd * ivaRate;
    const ivaVes = subtotalVes * ivaRate;

    return {
      order_number: this.generateOrderNumber(),
      supplier_id: supplierId,
      warehouse_id: warehouseId,
      items: items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price_usd: item.unit_price_usd,
        unit_price_ves: item.unit_price_ves,
      })),
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      iva_usd: ivaUsd,
      iva_ves: ivaVes,
      total_usd: subtotalUsd + ivaUsd,
      total_ves: subtotalVes + ivaVes,
      status: 'draft',
    };
  }

  /**
   * Generate suggested purchase orders based on inventory analysis
   */
  static generateSuggestedOrders(
    products: Product[],
    currentStock: Map<string, number>,
    supplierPrices: Map<string, Array<{
      supplier_id: string;
      price_usd: number;
      price_ves: number;
      availability: number;
    }>>
  ): Array<{
    product_id: string;
    product_name: string;
    suggested_quantity: number;
    best_supplier_id: string;
    estimated_cost_usd: number;
    estimated_cost_ves: number;
  }> {
    const suggestions: Array<{
      product_id: string;
      product_name: string;
      suggested_quantity: number;
      best_supplier_id: string;
      estimated_cost_usd: number;
      estimated_cost_ves: number;
    }> = [];

    products.forEach(product => {
      const stock = currentStock.get(product.id) || 0;

      // Check if reordering is needed
      if (stock <= product.reorder_point) {
        const suggestedQuantity = product.max_stock - stock;
        const prices = supplierPrices.get(product.id) || [];

        if (prices.length > 0) {
          const sortedPrices = [...prices].sort((a, b) => a.price_usd - b.price_usd);
          const bestPrice = sortedPrices[0];

          if (bestPrice) {
            suggestions.push({
              product_id: product.id,
              product_name: product.name,
              suggested_quantity: suggestedQuantity,
              best_supplier_id: bestPrice.supplier_id,
              estimated_cost_usd: bestPrice.price_usd * suggestedQuantity,
              estimated_cost_ves: bestPrice.price_ves * suggestedQuantity,
            });
          }
        }
      }
    });

    return suggestions;
  }

  /**
   * Calculate total purchase order cost
   */
  static calculateOrderCost(order: PurchaseOrder): {
    subtotal_usd: number;
    subtotal_ves: number;
    iva_usd: number;
    iva_ves: number;
    total_usd: number;
    total_ves: number;
  } {
    const subtotalUsd = order.items.reduce(
      (sum, item) => sum + (item.unit_price_usd * item.quantity),
      0
    );
    const subtotalVes = order.items.reduce(
      (sum, item) => sum + (item.unit_price_ves * item.quantity),
      0
    );

    // Calculate IVA (assuming 16% for all items)
    const ivaUsd = subtotalUsd * 0.16;
    const ivaVes = subtotalVes * 0.16;

    return {
      subtotal_usd: subtotalUsd,
      subtotal_ves: subtotalVes,
      iva_usd: ivaUsd,
      iva_ves: ivaVes,
      total_usd: subtotalUsd + ivaUsd,
      total_ves: subtotalVes + ivaVes,
    };
  }
}

/**
 * Supplier Performance Manager
 * Tracks supplier performance metrics
 */
export class SupplierPerformanceManager {
  /**
   * Calculate supplier on-time delivery rate
   */
  static calculateOnTimeDeliveryRate(
    supplierId: string,
    orders: PurchaseOrder[]
  ): number {
    const supplierOrders = orders.filter(o => o.supplier_id === supplierId && o.status === 'received');

    if (supplierOrders.length === 0) {
      return 0;
    }

    const onTimeOrders = supplierOrders.filter(order => {
      if (!order.expected_date || !order.received_at) {
        return false;
      }
      return new Date(order.received_at) <= new Date(order.expected_date);
    });

    return (onTimeOrders.length / supplierOrders.length) * 100;
  }

  /**
   * Calculate supplier defect rate
   */
  static calculateDefectRate(
    supplierId: string,
    orders: PurchaseOrder[],
    defectiveItems: Map<string, number>
  ): number {
    const supplierOrders = orders.filter(o => o.supplier_id === supplierId && o.status === 'received');

    if (supplierOrders.length === 0) {
      return 0;
    }

    let totalItems = 0;
    let defectiveItemsCount = 0;

    supplierOrders.forEach(order => {
      order.items.forEach(item => {
        totalItems += item.quantity;
        defectiveItemsCount += defectiveItems.get(`${order.id}_${item.product_id}`) || 0;
      });
    });

    if (totalItems === 0) {
      return 0;
    }

    return (defectiveItemsCount / totalItems) * 100;
  }

  /**
   * Generate supplier performance report
   */
  static generatePerformanceReport(
    suppliers: Supplier[],
    orders: PurchaseOrder[],
    defectiveItems: Map<string, number>
  ) {
    return suppliers.map(supplier => {
      const supplierOrders = orders.filter(o => o.supplier_id === supplier.id);

      return {
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        total_orders: supplierOrders.length,
        on_time_delivery_rate: this.calculateOnTimeDeliveryRate(supplier.id, orders),
        defect_rate: this.calculateDefectRate(supplier.id, orders, defectiveItems),
        total_spent_usd: supplierOrders.reduce((sum, order) => sum + order.total_usd, 0),
        total_spent_ves: supplierOrders.reduce((sum, order) => sum + order.total_ves, 0),
      };
    });
  }
}
