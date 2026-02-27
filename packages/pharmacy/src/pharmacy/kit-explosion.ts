import { Product } from '@red-salud/types';

/**
 * Virtual Kit Component
 */
export interface KitComponent {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_type: 'unit' | 'box' | 'blister' | 'pack';
  cost_usd: number;
  cost_ves: number;
}

/**
 * Virtual Kit Definition
 */
export interface VirtualKit {
  id: string;
  name: string;
  description: string;
  
  components: KitComponent[];
  
  kit_price_usd: number;
  kit_price_ves: number;
  
  discount_percentage: number;
  
  is_active: boolean;
  
  created_at: Date;
  updated_at: Date;
}

/**
 * Kit Explosion Result
 */
export interface KitExplosionResult {
  kit_id: string;
  kit_name: string;
  
  exploded_components: Array<{
    product_id: string;
    product_name: string;
    quantity_needed: number;
    available_quantity: number;
    can_fulfill: boolean;
    shortage: number;
  }>;
  
  can_fulfill_all: boolean;
  total_shortage: number;
  
  explosion_timestamp: Date;
}

/**
 * Kit Explosion Manager
 * Handles virtual kits with atomic material explosion
 */
export class KitExplosionManager {
  private static kits: VirtualKit[] = [];
  private static STORAGE_KEY = 'virtual_kits';

  /**
   * Create virtual kit
   */
  static async createKit(data: {
    name: string;
    description: string;
    components: Array<{
      product_id: string;
      product_name: string;
      quantity: number;
      unit_type: 'unit' | 'box' | 'blister' | 'pack';
      cost_usd: number;
      cost_ves: number;
    }>;
    kitPriceUSD: number;
    kitPriceVES: number;
    discountPercentage: number;
  }): Promise<VirtualKit> {
    const kit: VirtualKit = {
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
   * Explode kit into components
   * Checks availability of all components
   */
  static explodeKit(
    kitId: string,
    inventoryAvailability: Map<string, number>
  ): KitExplosionResult {
    const kit = this.kits.find(k => k.id === kitId);
    if (!kit || !kit.is_active) {
      throw new Error('Kit not found or not active');
    }

    const explodedComponents = kit.components.map(component => {
      const availableQuantity = inventoryAvailability.get(component.product_id) || 0;
      const canFulfill = availableQuantity >= component.quantity;
      const shortage = Math.max(0, component.quantity - availableQuantity);

      return {
        product_id: component.product_id,
        product_name: component.product_name,
        quantity_needed: component.quantity,
        available_quantity: availableQuantity,
        can_fulfill: canFulfill,
        shortage,
      };
    });

    const canFulfillAll = explodedComponents.every(c => c.can_fulfill);
    const totalShortage = explodedComponents.reduce((sum, c) => sum + c.shortage, 0);

    return {
      kit_id: kit.id,
      kit_name: kit.name,
      exploded_components: explodedComponents,
      can_fulfill_all: canFulfillAll,
      total_shortage: totalShortage,
      explosion_timestamp: new Date(),
    };
  }

  /**
   * Process kit sale - atomically deduct components
   */
  static async processKitSale(
    kitId: string,
    quantity: number,
    deductComponent: (productId: string, quantity: number) => Promise<void>
  ): Promise<{
    success: boolean;
    componentsDeducted: Array<{
      product_id: string;
      product_name: string;
      quantity_deducted: number;
    }>;
    error?: string;
  }> {
    const kit = this.kits.find(k => k.id === kitId);
    if (!kit || !kit.is_active) {
      return { success: false, componentsDeducted: [], error: 'Kit not found or not active' };
    }

    const componentsDeducted: Array<{
      product_id: string;
      product_name: string;
      quantity_deducted: number;
    }> = [];

    try {
      // Deduct each component atomically
      for (const component of kit.components) {
        const quantityToDeduct = component.quantity * quantity;
        await deductComponent(component.product_id, quantityToDeduct);

        componentsDeducted.push({
          product_id: component.product_id,
          product_name: component.product_name,
          quantity_deducted: quantityToDeduct,
        });
      }

      return {
        success: true,
        componentsDeducted,
      };
    } catch (error) {
      return {
        success: false,
        componentsDeducted,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Calculate kit savings
   */
  static calculateKitSavings(
    kitId: string,
    componentPrices: Map<string, { price_usd: number; price_ves: number }>
  ): {
    original_total_usd: number;
    original_total_ves: number;
    kit_price_usd: number;
    kit_price_ves: number;
    savings_usd: number;
    savings_ves: number;
    savings_percentage: number;
  } | null {
    const kit = this.kits.find(k => k.id === kitId);
    if (!kit) return null;

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
    const savingsPercentage = originalTotalUSD > 0 ? (savingsUSD / originalTotalUSD) * 100 : 0;

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
  static getActiveKits(): VirtualKit[] {
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
      components?: KitComponent[];
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
      console.error('Error persisting virtual kits:', error);
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
      console.error('Error loading virtual kits:', error);
    }
  }
}
