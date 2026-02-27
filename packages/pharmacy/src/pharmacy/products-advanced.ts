import { Product } from '@red-salud/types';

/**
 * Fractional Sale Option
 */
export interface FractionalSaleOption {
  unit_type: 'unit' | 'blister' | 'pack' | 'box';
  quantity: number;
  price_usd: number;
  price_ves: number;
  label: string;
}

/**
 * Product Kit/Combo
 */
export interface ProductKit {
  id: string;
  name: string;
  description: string;
  
  components: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    unit_type: 'unit' | 'box' | 'blister' | 'pack';
  }>;
  
  kit_price_usd: number;
  kit_price_ves: number;
  
  discount_percentage: number;
  
  is_active: boolean;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Product Substitute
 */
export interface ProductSubstitute {
  original_product_id: string;
  original_product_name: string;
  original_price_usd: number;
  original_price_ves: number;
  
  substitute_product_id: string;
  substitute_product_name: string;
  substitute_active_ingredient: string;
  substitute_concentration: string;
  substitute_price_usd: number;
  substitute_price_ves: number;
  
  price_difference_usd: number;
  price_difference_ves: number;
  price_difference_percentage: number;
  
  in_stock: boolean;
  available_quantity: number;
  
  created_at: Date;
}

/**
 * Fractional Unit Manager
 * Handles sale of fractional units (blister, single unit) from boxes
 */
export class FractionalUnitManager {
  /**
   * Get fractional sale options for a product
   */
  static getFractionalOptions(product: Product): FractionalSaleOption[] {
    const options: FractionalSaleOption[] = [];

    // Single unit option
    if (product.allow_fractional_sale) {
      const unitPriceUSD = product.sale_price_usd / product.units_per_box;
      const unitPriceVES = product.sale_price_ves / product.units_per_box;

      options.push({
        unit_type: 'unit',
        quantity: 1,
        price_usd: unitPriceUSD,
        price_ves: unitPriceVES,
        label: 'Unidad',
      });

      // Blister option (assuming 10 units per blister)
      if (product.units_per_box >= 10) {
        const blisterPriceUSD = unitPriceUSD * 10;
        const blisterPriceVES = unitPriceVES * 10;

        options.push({
          unit_type: 'blister',
          quantity: 10,
          price_usd: blisterPriceUSD,
          price_ves: blisterPriceVES,
          label: 'Blíster (10)',
        });
      }
    }

    // Box option
    options.push({
      unit_type: 'box',
      quantity: product.units_per_box,
      price_usd: product.sale_price_usd,
      price_ves: product.sale_price_ves,
      label: 'Caja',
    });

    return options;
  }

  /**
   * Calculate price for fractional quantity
   */
  static calculateFractionalPrice(
    product: Product,
    quantity: number,
    unitType: 'unit' | 'blister' | 'box'
  ): { usd: number; ves: number } {
    const unitPriceUSD = product.sale_price_usd / product.units_per_box;
    const unitPriceVES = product.sale_price_ves / product.units_per_box;

    let unitsNeeded: number;

    switch (unitType) {
      case 'unit':
        unitsNeeded = quantity;
        break;
      case 'blister':
        unitsNeeded = quantity * 10;
        break;
      case 'box':
        unitsNeeded = quantity * product.units_per_box;
        break;
      default:
        unitsNeeded = quantity;
    }

    return {
      usd: unitPriceUSD * unitsNeeded,
      ves: unitPriceVES * unitsNeeded,
    };
  }

  /**
   * Validate fractional sale
   */
  static validateFractionalSale(
    product: Product,
    quantity: number,
    unitType: 'unit' | 'blister' | 'box',
    availableStock: number
  ): { valid: boolean; message?: string } {
    if (!product.allow_fractional_sale && (unitType === 'unit' || unitType === 'blister')) {
      return {
        valid: false,
        message: 'Este producto no permite venta fraccionada',
      };
    }

    let unitsNeeded: number;
    switch (unitType) {
      case 'unit':
        unitsNeeded = quantity;
        break;
      case 'blister':
        unitsNeeded = quantity * 10;
        break;
      case 'box':
        unitsNeeded = quantity * product.units_per_box;
        break;
      default:
        unitsNeeded = quantity;
    }

    if (unitsNeeded > availableStock) {
      return {
        valid: false,
        message: `Stock insuficiente. Disponible: ${availableStock}, Solicitado: ${unitsNeeded}`,
      };
    }

    return { valid: true };
  }
}

/**
 * Product Kit Manager
 * Manages product combos/kits with automatic component deduction
 */
export class ProductKitManager {
  private static kits: ProductKit[] = [];
  private static STORAGE_KEY = 'product_kits';

  /**
   * Create a product kit
   */
  static async createKit(data: {
    name: string;
    description: string;
    components: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_type: 'unit' | 'box' | 'blister' | 'pack';
    }>;
    kitPriceUSD: number;
    kitPriceVES: number;
    discountPercentage: number;
  }): Promise<ProductKit> {
    const kit: ProductKit = {
      id: crypto.randomUUID(),
      name: data.name,
      description: data.description,
      components: data.components,
      kit_price_usd: data.kitPriceUSD,
      kit_price_ves: data.kitPriceVES,
      discount_percentage: data.discountPercentage,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.kits.push(kit);
    await this.persistKits();

    return kit;
  }

  /**
   * Get kit components for sale
   */
  static getKitComponents(kitId: string): Array<{
    product_id: string;
    quantity: number;
    unit_type: 'unit' | 'box' | 'blister' | 'pack';
  }> | null {
    const kit = this.kits.find(k => k.id === kitId);
    if (!kit || !kit.is_active) return null;

    return kit.components;
  }

  /**
   * Calculate kit savings
   */
  static calculateKitSavings(
    kit: ProductKit,
    componentPrices: Map<string, { price_usd: number; price_ves: number }>
  ): {
    original_total_usd: number;
    original_total_ves: number;
    kit_price_usd: number;
    kit_price_ves: number;
    savings_usd: number;
    savings_ves: number;
    savings_percentage: number;
  } {
    let originalTotalUSD = 0;
    let originalTotalVES = 0;

    kit.components.forEach(component => {
      const price = componentPrices.get(component.product_id);
      if (price) {
        originalTotalUSD += price.price_usd * component.quantity;
        originalTotalVES += price.price_ves * component.quantity;
      }
    });

    const savingsUSD = originalTotalUSD - kit.kit_price_usd;
    const savingsVES = originalTotalVES - kit.kit_price_ves;
    const savingsPercentage = (savingsUSD / originalTotalUSD) * 100;

    return {
      original_total_usd: originalTotalUSD,
      original_total_ves: originalTotalVES,
      kit_price_usd: kit.kit_price_usd,
      kit_price_ves: kit.kit_price_ves,
      savings_usd: savingsUSD,
      savings_ves: savingsVES,
      savings_percentage: savingsPercentage,
    };
  }

  /**
   * Get all active kits
   */
  static getActiveKits(): ProductKit[] {
    return this.kits.filter(k => k.is_active);
  }

  /**
   * Update kit
   */
  static async updateKit(
    kitId: string,
    data: {
      name?: string;
      description?: string;
      components?: Array<{
        product_id: string;
        product_name: string;
        quantity: number;
        unit_type: 'unit' | 'box' | 'blister' | 'pack';
      }>;
      kitPriceUSD?: number;
      kitPriceVES?: number;
      discountPercentage?: number;
      isActive?: boolean;
    }
  ): Promise<void> {
    const kit = this.kits.find(k => k.id === kitId);
    if (!kit) throw new Error('Kit not found');

    if (data.name) kit.name = data.name;
    if (data.description) kit.description = data.description;
    if (data.components) kit.components = data.components;
    if (data.kitPriceUSD !== undefined) kit.kit_price_usd = data.kitPriceUSD;
    if (data.kitPriceVES !== undefined) kit.kit_price_ves = data.kitPriceVES;
    if (data.discountPercentage !== undefined) kit.discount_percentage = data.discountPercentage;
    if (data.isActive !== undefined) kit.is_active = data.isActive;

    kit.updated_at = new Date();
    await this.persistKits();
  }

  /**
   * Persist kits
   */
  private static async persistKits(): Promise<void> {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.kits));
    } catch (error) {
      console.error('Error persisting product kits:', error);
    }
  }

  /**
   * Load kits
   */
  static async loadKits(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.kits = JSON.parse(stored).map((kit: any) => ({
          ...kit,
          created_at: new Date(kit.created_at),
          updated_at: new Date(kit.updated_at),
        }));
      }
    } catch (error) {
      console.error('Error loading product kits:', error);
    }
  }
}

/**
 * Semantic Search Manager
 * Searches products by active ingredient and suggests substitutes
 */
export class SemanticSearchManager {
  /**
   * Search products by active ingredient and concentration
   */
  static searchByActiveIngredient(
    products: Product[],
    searchTerm: string
  ): Product[] {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return products.filter(product => {
      const activeIngredient = (product.active_ingredient || '').toLowerCase();
      const name = product.name.toLowerCase();
      const genericName = (product.generic_name || '').toLowerCase();

      return (
        activeIngredient.includes(lowerSearchTerm) ||
        name.includes(lowerSearchTerm) ||
        genericName.includes(lowerSearchTerm)
      );
    });
  }

  /**
   * Find substitutes for a product
   */
  static findSubstitutes(
    originalProduct: Product,
    allProducts: Product[]
  ): ProductSubstitute[] {
    const substitutes: ProductSubstitute[] = [];

    const originalActiveIngredient = (originalProduct.active_ingredient || '').toLowerCase();

    allProducts.forEach(product => {
      if (product.id === originalProduct.id) return;

      const productActiveIngredient = (product.active_ingredient || '').toLowerCase();

      // Check if same active ingredient
      if (productActiveIngredient === originalActiveIngredient) {
        const priceDifferenceUSD = product.sale_price_usd - originalProduct.sale_price_usd;
        const priceDifferenceVES = product.sale_price_ves - originalProduct.sale_price_ves;
        const priceDifferencePercentage = (priceDifferenceUSD / originalProduct.sale_price_usd) * 100;

        substitutes.push({
          original_product_id: originalProduct.id,
          original_product_name: originalProduct.name,
          original_price_usd: originalProduct.sale_price_usd,
          original_price_ves: originalProduct.sale_price_ves,
          substitute_product_id: product.id,
          substitute_product_name: product.name,
          substitute_active_ingredient: product.active_ingredient || '',
          substitute_concentration: '', // Would need concentration field in Product type
          substitute_price_usd: product.sale_price_usd,
          substitute_price_ves: product.sale_price_ves,
          price_difference_usd: priceDifferenceUSD,
          price_difference_ves: priceDifferenceVES,
          price_difference_percentage: priceDifferencePercentage,
          in_stock: true, // Would need to check actual inventory
          available_quantity: 0, // Would need to check actual inventory
          created_at: new Date(),
        });
      }
    });

    // Sort by price difference (cheapest first)
    return substitutes.sort((a, b) => a.price_difference_usd - b.price_difference_usd);
  }

  /**
   * Search and suggest substitutes in one call
   */
  static searchWithSubstitutes(
    products: Product[],
    searchTerm: string
  ): {
    exactMatches: Product[];
    substitutes: ProductSubstitute[];
  } {
    const exactMatches = this.searchByActiveIngredient(products, searchTerm);
    const substitutes = exactMatches.length > 0
      ? this.findSubstitutes(exactMatches[0], products)
      : [];

    return {
      exactMatches,
      substitutes,
    };
  }

  /**
   * Get cross-selling suggestions
   */
  static getCrossSellSuggestions(
    products: Product[],
    category: string,
    limit: number = 5
  ): Product[] {
    return products
      .filter(p => p.category === category && p.id !== undefined)
      .slice(0, limit);
  }

  /**
   * Get up-selling suggestions (higher margin alternatives)
   */
  static getUpSellSuggestions(
    products: Product[],
    originalProduct: Product,
    limit: number = 3
  ): Product[] {
    const originalCategory = originalProduct.category;
    const originalPriceUSD = originalProduct.sale_price_usd;

    return products
      .filter(p => 
        p.category === originalCategory &&
        p.id !== originalProduct.id &&
        p.sale_price_usd > originalPriceUSD
      )
      .sort((a, b) => b.sale_price_usd - a.sale_price_usd)
      .slice(0, limit);
  }
}
