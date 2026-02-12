import {
  Invoice,
  InvoiceItem,
  Product,
  Batch,
  PharmacyPaymentMethod,
  Currency,
} from '@red-salud/types';
import { FEFOManager } from './inventory';
import { CurrencyManager, PriceCalculator } from './currency';

/**
 * Point of Sale Manager
 * Handles POS operations including cart management, checkout, and invoice generation
 */
export class POSManager {
  private cart: InvoiceItem[] = [];
  private payments: Array<{
    method: PharmacyPaymentMethod;
    amount_usd: number;
    amount_ves: number;
    reference?: string;
  }> = [];

  /**
   * Add product to cart
   */
  addToCart(
    product: Product,
    quantity: number,
    batches: Batch[],
    exchangeRate: number
  ): void {
    // Check if product allows fractional sale
    if (!product.allow_fractional_sale && !Number.isInteger(quantity)) {
      throw new Error('Fractional quantities not allowed for this product');
    }

    // Check stock availability using FEFO
    const availableQuantity = FEFOManager.getTotalAvailableQuantity(
      batches.filter((b) => b.product_id === product.id)
    );

    const currentCartQuantity = this.cart
      .filter((item) => item.product_id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (currentCartQuantity + quantity > availableQuantity) {
      throw new Error(
        `Insufficient stock. Available: ${availableQuantity - currentCartQuantity}, Requested: ${quantity}`
      );
    }

    // Calculate prices
    const unitPriceVes = product.sale_price_ves;
    const ivaAmountUsd = product.sale_price_usd * quantity * product.iva_rate;
    const ivaAmountVes = unitPriceVes * quantity * product.iva_rate;
    const subtotalUsd = product.sale_price_usd * quantity;
    const subtotalVes = unitPriceVes * quantity;

    // Check if item already exists in cart
    const existingItemIndex = this.cart.findIndex(
      (item) => item.product_id === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const existingItem = this.cart[existingItemIndex];
      if (!existingItem) {
        throw new Error('Item not found in cart');
      }
      this.cart[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
        subtotal_usd: existingItem.subtotal_usd + subtotalUsd,
        subtotal_ves: existingItem.subtotal_ves + subtotalVes,
        iva_usd: existingItem.iva_usd + ivaAmountUsd,
        iva_ves: existingItem.iva_ves + ivaAmountVes,
        total_usd: existingItem.total_usd + subtotalUsd + ivaAmountUsd,
        total_ves: existingItem.total_ves + subtotalVes + ivaAmountVes,
      };
    } else {
      // Add new item
      this.cart.push({
        product_id: product.id,
        product_name: product.name,
        generic_name: product.generic_name,
        quantity,
        unit_type: product.unit_type,
        unit_price_usd: product.sale_price_usd,
        unit_price_ves: unitPriceVes,
        subtotal_usd: subtotalUsd,
        subtotal_ves: subtotalVes,
        discount_usd: 0,
        discount_ves: 0,
        iva_rate: product.iva_rate,
        iva_usd: ivaAmountUsd,
        iva_ves: ivaAmountVes,
        total_usd: subtotalUsd + ivaAmountUsd,
        total_ves: subtotalVes + ivaAmountVes,
      });
    }
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): void {
    this.cart = this.cart.filter((item) => item.product_id !== productId);
  }

  /**
   * Update item quantity in cart
   */
  updateCartItemQuantity(
    productId: string,
    newQuantity: number,
    product: Product,
    batches: Batch[]
  ): void {
    const existingItem = this.cart.find((item) => item.product_id === productId);
    
    if (!existingItem) {
      throw new Error('Item not found in cart');
    }

    // Remove old quantity and add new quantity
    this.removeFromCart(productId);
    this.addToCart(product, newQuantity, batches, 1);
  }

  /**
   * Calculate cart totals
   */
  getCartTotals() {
    const totals = this.cart.reduce(
      (acc, item) => ({
        subtotal_usd: acc.subtotal_usd + item.subtotal_usd,
        subtotal_ves: acc.subtotal_ves + item.subtotal_ves,
        iva_usd: acc.iva_usd + item.iva_usd,
        iva_ves: acc.iva_ves + item.iva_ves,
        total_usd: acc.total_usd + item.total_usd,
        total_ves: acc.total_ves + item.total_ves,
      }),
      {
        subtotal_usd: 0,
        subtotal_ves: 0,
        iva_usd: 0,
        iva_ves: 0,
        total_usd: 0,
        total_ves: 0,
      }
    );

    return totals;
  }

  /**
   * Add payment
   */
  addPayment(
    method: PharmacyPaymentMethod,
    amountUsd: number,
    amountVes: number,
    reference?: string
  ): void {
    const totals = this.getCartTotals();
    const totalPaidUsd = this.payments.reduce((sum, p) => sum + p.amount_usd, 0);
    const totalPaidVes = this.payments.reduce((sum, p) => sum + p.amount_ves, 0);

    // Check if payment exceeds total
    if (totalPaidUsd + amountUsd > totals.total_usd) {
      throw new Error('Payment amount exceeds total');
    }

    this.payments.push({
      method,
      amount_usd: amountUsd,
      amount_ves: amountVes,
      reference,
    });
  }

  /**
   * Calculate change
   */
  calculateChange() {
    const totals = this.getCartTotals();
    const totalPaidUsd = this.payments.reduce((sum, p) => sum + p.amount_usd, 0);
    const totalPaidVes = this.payments.reduce((sum, p) => sum + p.amount_ves, 0);

    return {
      change_usd: Math.max(0, totalPaidUsd - totals.total_usd),
      change_ves: Math.max(0, totalPaidVes - totals.total_ves),
    };
  }

  /**
   * Check if payment is complete
   */
  isPaymentComplete(exchangeRate: number): boolean {
    const totals = this.getCartTotals();
    const totalPaidUsd = this.payments.reduce((sum, p) => sum + p.amount_usd, 0);
    const totalPaidVes = this.payments.reduce((sum, p) => sum + p.amount_ves, 0);
    const totalPaidInUsd = totalPaidUsd + (totalPaidVes / exchangeRate);

    return totalPaidInUsd >= totals.total_usd;
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.cart = [];
    this.payments = [];
  }

  /**
   * Get cart items
   */
  getCartItems(): InvoiceItem[] {
    return [...this.cart];
  }

  /**
   * Get payments
   */
  getPayments() {
    return [...this.payments];
  }

  /**
   * Hold current cart (save for later)
   */
  holdCart(holdId: string): void {
    // In a real implementation, this would save to localStorage or database
    const heldCart = {
      id: holdId,
      items: this.cart,
      payments: this.payments,
      timestamp: new Date(),
    };
    
    localStorage.setItem(`hold_${holdId}`, JSON.stringify(heldCart));
    this.clearCart();
  }

  /**
   * Retrieve held cart
   */
  retrieveHeldCart(holdId: string): void {
    const heldCartStr = localStorage.getItem(`hold_${holdId}`);
    
    if (!heldCartStr) {
      throw new Error('Held cart not found');
    }

    const heldCart = JSON.parse(heldCartStr);
    this.cart = heldCart.items;
    this.payments = heldCart.payments;
  }

  /**
   * List all held carts
   */
  listHeldCarts(): Array<{ id: string; timestamp: string; itemCount: number }> {
    const heldCarts: Array<{ id: string; timestamp: string; itemCount: number }> = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('hold_')) {
        const heldCartStr = localStorage.getItem(key);
        if (heldCartStr) {
          const heldCart = JSON.parse(heldCartStr);
          heldCarts.push({
            id: heldCart.id,
            timestamp: heldCart.timestamp,
            itemCount: heldCart.items.length,
          });
        }
      }
    }
    
    return heldCarts;
  }

  /**
   * Delete held cart
   */
  deleteHeldCart(holdId: string): void {
    localStorage.removeItem(`hold_${holdId}`);
  }
}

/**
 * Product Search Manager
 * Advanced search functionality for POS
 */
export class ProductSearchManager {
  /**
   * Search products by name, generic name, or active ingredient
   */
  static searchProducts(
    query: string,
    products: Product[]
  ): Product[] {
    const normalizedQuery = query.toLowerCase().trim();
    
    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.generic_name?.toLowerCase().includes(normalizedQuery) ||
        product.active_ingredient?.toLowerCase().includes(normalizedQuery) ||
        product.sku.toLowerCase().includes(normalizedQuery) ||
        product.barcode?.toLowerCase().includes(normalizedQuery)
      );
    });
  }

  /**
   * Search products by barcode
   */
  static searchByBarcode(barcode: string, products: Product[]): Product | null {
    return products.find((product) => product.barcode === barcode) || null;
  }

  /**
   * Get products by category
   */
  static getProductsByCategory(category: string, products: Product[]): Product[] {
    return products.filter((product) => product.category === category);
  }

  /**
   * Get products with low stock
   */
  static getLowStockProducts(products: Product[], batches: Batch[]): Product[] {
    return products.filter((product) => {
      const available = FEFOManager.getTotalAvailableQuantity(
        batches.filter((b) => b.product_id === product.id)
      );
      return FEFOManager.isLowStock(product, available);
    });
  }

  /**
   * Get products expiring soon
   */
  static getExpiringProducts(products: Product[], batches: Batch[]): Array<{
    product: Product;
    expiryDate: Date;
    quantity: number;
  }> {
    const expiringBatches = FEFOManager.getExpiringBatches(batches, 90);
    
    return expiringBatches.map((batch) => ({
      product: products.find((p) => p.id === batch.product_id)!,
      expiryDate: new Date(batch.expiry_date),
      quantity: batch.quantity,
    }));
  }
}

/**
 * POS Keyboard Shortcuts Manager
 */
export class POSKeyboardManager {
  private shortcuts: Map<string, () => void> = new Map();

  /**
   * Register keyboard shortcut
   */
  registerShortcut(key: string, callback: () => void): void {
    this.shortcuts.set(key, callback);
  }

  /**
   * Handle keyboard event
   */
  handleKeyPress(event: KeyboardEvent): void {
    const key = event.key;
    const callback = this.shortcuts.get(key);
    
    if (callback) {
      event.preventDefault();
      callback();
    }
  }

  /**
   * Register default POS shortcuts
   */
  registerDefaultShortcuts(handlers: {
    onSearch?: () => void;
    onAddToCart?: () => void;
    onCheckout?: () => void;
    onHold?: () => void;
    onRetrieveHold?: () => void;
    onClearCart?: () => void;
    onTotal?: () => void;
    onDiscount?: () => void;
    onQuantity?: () => void;
  }): void {
    this.registerShortcut('F1', handlers.onSearch || (() => {}));
    this.registerShortcut('F2', handlers.onAddToCart || (() => {}));
    this.registerShortcut('F9', handlers.onCheckout || (() => {}));
    this.registerShortcut('F4', handlers.onHold || (() => {}));
    this.registerShortcut('F5', handlers.onRetrieveHold || (() => {}));
    this.registerShortcut('F6', handlers.onClearCart || (() => {}));
    this.registerShortcut('F10', handlers.onTotal || (() => {}));
    this.registerShortcut('F7', handlers.onDiscount || (() => {}));
    this.registerShortcut('F8', handlers.onQuantity || (() => {}));
  }
}
