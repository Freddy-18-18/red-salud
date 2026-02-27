import type {
  Discount,
  Combo,
  DiscountType,
  DiscountScope,
  DiscountTrigger,
  Product,
  ProductCategory,
  Invoice,
} from '@red-salud/types';

export class CommercialManager {
  /**
   * Find applicable discounts for an invoice
   */
  static findApplicableDiscounts(
    discounts: Discount[],
    invoice: Invoice,
    products: Product[],
    warehouseId: string,
    currentDateTime: Date = new Date()
  ): Discount[] {
    return discounts.filter(discount => {
      // Check if discount is active
      if (!discount.is_active) return false;

      // Check warehouse applicability
      if (discount.warehouse_ids.length > 0 && !discount.warehouse_ids.includes(warehouseId)) {
        return false;
      }

      // Check validity period
      if (discount.valid_from && currentDateTime < discount.valid_from) return false;
      if (discount.valid_until && currentDateTime > discount.valid_until) return false;

      // Check trigger conditions
      if (!this.checkTriggerCondition(discount, invoice, currentDateTime)) {
        return false;
      }

      // Check applicability
      return this.checkApplicability(discount, invoice, products);
    });
  }

  /**
   * Check if discount trigger condition is met
   */
  private static checkTriggerCondition(
    discount: Discount,
    invoice: Invoice,
    currentDateTime: Date
  ): boolean {
    switch (discount.trigger_type) {
      case 'time_based':
        return this.checkTimeBasedTrigger(discount, currentDateTime);

      case 'volume_based':
        return this.checkVolumeBasedTrigger(discount, invoice);

      case 'customer_type':
      case 'promotional':
        return true; // These require additional context

      default:
        return false;
    }
  }

  /**
   * Check time-based trigger
   */
  private static checkTimeBasedTrigger(
    discount: Discount,
    currentDateTime: Date
  ): boolean {
    const dayOfWeek = currentDateTime.getDay();
    const hour = currentDateTime.getHours();

    // Check day of week
    if (discount.days_of_week.length > 0 && !discount.days_of_week.includes(dayOfWeek)) {
      return false;
    }

    // Check hour range
    if (discount.hours_start !== undefined && hour < discount.hours_start) {
      return false;
    }
    if (discount.hours_end !== undefined && hour >= discount.hours_end) {
      return false;
    }

    return true;
  }

  /**
   * Check volume-based trigger
   */
  private static checkVolumeBasedTrigger(
    discount: Discount,
    invoice: Invoice
  ): boolean {
    if (discount.min_quantity !== undefined) {
      const totalQuantity = invoice.items.reduce((sum, item) => sum + item.quantity, 0);
      if (totalQuantity < discount.min_quantity) return false;
    }

    if (discount.min_amount_usd !== undefined) {
      if (invoice.subtotal_usd < discount.min_amount_usd) return false;
    }

    if (discount.min_amount_ves !== undefined) {
      if (invoice.subtotal_ves < discount.min_amount_ves) return false;
    }

    return true;
  }

  /**
   * Check discount applicability
   */
  private static checkApplicability(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): boolean {
    switch (discount.discount_scope) {
      case 'product':
        return this.checkProductScope(discount, invoice);

      case 'category':
        return this.checkCategoryScope(discount, invoice, products);

      case 'brand':
        return this.checkBrandScope(discount, invoice, products);

      case 'order':
        return true;

      case 'customer':
        return true; // Requires customer context

      case 'warehouse':
        return true; // Already checked warehouse applicability

      default:
        return false;
    }
  }

  /**
   * Check product scope
   */
  private static checkProductScope(discount: Discount, invoice: Invoice): boolean {
    if (discount.applicable_product_ids.length === 0) return true;

    return invoice.items.some(item =>
      discount.applicable_product_ids.includes(item.product_id)
    );
  }

  /**
   * Check category scope
   */
  private static checkCategoryScope(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): boolean {
    if (discount.applicable_categories.length === 0) return true;

    return invoice.items.some(item => {
      const product = products.find(p => p.id === item.product_id);
      return product && discount.applicable_categories.includes(product.category);
    });
  }

  /**
   * Check brand scope
   */
  private static checkBrandScope(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): boolean {
    if (discount.applicable_brands.length === 0) return true;

    return invoice.items.some(item => {
      const product = products.find(p => p.id === item.product_id);
      return product && discount.applicable_brands.includes(product.brand || '');
    });
  }

  /**
   * Calculate discount amount for an invoice
   */
  static calculateDiscount(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): { discountUsd: number; discountVes: number } {
    switch (discount.discount_type) {
      case 'percentage':
        return this.calculatePercentageDiscount(discount, invoice, products);

      case 'fixed_amount':
        return this.calculateFixedAmountDiscount(discount, invoice);

      case 'buy_x_get_y':
        return this.calculateBuyXGetYDiscount(discount, invoice, products);

      default:
        return { discountUsd: 0, discountVes: 0 };
    }
  }

  /**
   * Calculate percentage discount
   */
  private static calculatePercentageDiscount(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): { discountUsd: number; discountVes: number } {
    const eligibleItems = this.getEligibleItems(discount, invoice, products);
    const eligibleSubtotalUsd = eligibleItems.reduce((sum, item) => sum + item.subtotal_usd, 0);
    const eligibleSubtotalVes = eligibleItems.reduce((sum, item) => sum + item.subtotal_ves, 0);

    const discountUsd = eligibleSubtotalUsd * (discount.discount_percent! / 100);
    const discountVes = eligibleSubtotalVes * (discount.discount_percent! / 100);

    return { discountUsd, discountVes };
  }

  /**
   * Calculate fixed amount discount
   */
  private static calculateFixedAmountDiscount(
    discount: Discount,
    invoice: Invoice
  ): { discountUsd: number; discountVes: number } {
    return {
      discountUsd: discount.discount_amount_usd || 0,
      discountVes: discount.discount_amount_ves || 0,
    };
  }

  /**
   * Calculate Buy X Get Y discount
   */
  private static calculateBuyXGetYDiscount(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ): { discountUsd: number; discountVes: number } {
    const eligibleItems = this.getEligibleItems(discount, invoice, products);
    const buyQuantity = discount.buy_quantity || 0;
    const getQuantity = discount.get_quantity || 0;
    const getDiscountPercent = discount.get_discount_percent || 0;

    if (eligibleItems.length < buyQuantity + getQuantity) {
      return { discountUsd: 0, discountVes: 0 };
    }

    // Calculate how many free items
    const sets = Math.floor(eligibleItems.length / (buyQuantity + getQuantity));
    const freeItems = sets * getQuantity;

    // Calculate discount value
    const avgPriceUsd = eligibleItems.reduce((sum, item) => sum + item.unit_price_usd, 0) / eligibleItems.length;
    const avgPriceVes = eligibleItems.reduce((sum, item) => sum + item.unit_price_ves, 0) / eligibleItems.length;

    const discountUsd = freeItems * avgPriceUsd * (getDiscountPercent / 100);
    const discountVes = freeItems * avgPriceVes * (getDiscountPercent / 100);

    return { discountUsd, discountVes };
  }

  /**
   * Get eligible items for a discount
   */
  private static getEligibleItems(
    discount: Discount,
    invoice: Invoice,
    products: Product[]
  ) {
    return invoice.items.filter(item => {
      const product = products.find(p => p.id === item.product_id);
      if (!product) return false;

      // Check product eligibility
      if (discount.applicable_product_ids.length > 0) {
        return discount.applicable_product_ids.includes(item.product_id);
      }

      // Check category eligibility
      if (discount.applicable_categories.length > 0) {
        return discount.applicable_categories.includes(product.category);
      }

      // Check brand eligibility
      if (discount.applicable_brands.length > 0) {
        return discount.applicable_brands.includes(product.brand || '');
      }

      return true;
    });
  }

  /**
   * Find applicable combos
   */
  static findApplicableCombos(
    combos: Combo[],
    invoice: Invoice
  ): Combo[] {
    return combos.filter(combo => {
      if (!combo.is_active) return false;

      // Check if all combo items are in invoice
      const invoiceProductIds = new Set(invoice.items.map(item => item.product_id));
      const comboProductIds = new Set(combo.items.map(item => item.product_id));

      // Check if all combo products are in invoice
      for (const productId of comboProductIds) {
        if (!invoiceProductIds.has(productId)) return false;
      }

      // Check quantities
      for (const comboItem of combo.items) {
        const invoiceItem = invoice.items.find(item => item.product_id === comboItem.product_id);
        if (!invoiceItem || invoiceItem.quantity < comboItem.quantity) return false;
      }

      return true;
    });
  }

  /**
   * Calculate combo discount
   */
  static calculateComboDiscount(combo: Combo): {
    discountUsd: number;
    discountVes: number;
    discountPercent: number;
  } {
    const discountUsd = combo.regular_price_usd - combo.combo_price_usd;
    const discountVes = combo.regular_price_ves - combo.combo_price_ves;

    return {
      discountUsd,
      discountVes,
      discountPercent: combo.discount_percent,
    };
  }

  /**
   * Check if discounts can be combined
   */
  static canCombineDiscounts(discounts: Discount[]): boolean {
    return discounts.every(d => d.can_combine);
  }

  /**
   * Calculate maximum discount percentage
   */
  static calculateMaxDiscount(discounts: Discount[]): number {
    const maxPercent = discounts.reduce((max, d) => {
      if (d.max_discount_percent !== undefined) {
        return Math.min(max, d.max_discount_percent);
      }
      return max;
    }, 100);

    return maxPercent;
  }
}
