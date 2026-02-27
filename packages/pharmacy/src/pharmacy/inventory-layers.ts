import { Product, Batch } from '@red-salud/types';

/**
 * Inventory Layer (Capa de Inventario)
 * Each layer represents a unique purchase entry with its own cost and exchange rate
 */
export interface InventoryLayer {
  id: string;
  product_id: string;
  
  // Layer identification
  layer_number: number;
  internal_lot_number: string; // Generated: YYYYMM-XXXX
  manufacturer_lot_number?: string;
  
  // Cost and pricing
  entry_date: Date;
  exchange_rate: number; // Rate at entry
  cost_usd: number;
  cost_ves: number;
  
  // Supplier info
  supplier_id: string;
  supplier_name: string;
  
  // Quantities
  original_quantity: number;
  remaining_quantity: number;
  
  // Status
  status: 'quarantine' | 'available' | 'reserved' | 'depleted';
  
  // Approval
  requires_approval: boolean;
  approved_by?: string;
  approved_at?: Date;
  approval_notes?: string;
  
  // Metadata
  created_at: Date;
  updated_at: Date;
}

/**
 * Layer Transaction
 * Tracks consumption from specific layers
 */
export interface LayerTransaction {
  id: string;
  layer_id: string;
  invoice_id: string;
  
  quantity_consumed: number;
  cost_usd_per_unit: number;
  cost_ves_per_unit: number;
  total_cost_usd: number;
  total_cost_ves: number;
  
  transaction_date: Date;
  
  created_at: Date;
}

/**
 * Inventory Layer Manager
 * Implements PEPS/UEPS dynamic pricing with replacement cost
 */
export class InventoryLayerManager {
  private static layers: Map<string, InventoryLayer[]> = new Map();
  private static transactions: LayerTransaction[] = [];
  private static STORAGE_KEY = 'inventory_layers';

  /**
   * Create a new inventory layer when receiving goods
   */
  static async createLayer(data: {
    productId: string;
    manufacturerLotNumber?: string;
    entryDate: Date;
    exchangeRate: number;
    costUSD: number;
    supplierId: string;
    supplierName: string;
    quantity: number;
    requiresApproval: boolean;
  }): Promise<InventoryLayer> {
    const existingLayers = this.layers.get(data.productId) || [];
    const nextLayerNumber = existingLayers.length + 1;
    
    // Generate internal lot number: YYYYMM-XXXX
    const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
    const internalLotNumber = `${yearMonth}-${String(nextLayerNumber).padStart(4, '0')}`;

    const layer: InventoryLayer = {
      id: crypto.randomUUID(),
      product_id: data.productId,
      layer_number: nextLayerNumber,
      internal_lot_number: internalLotNumber,
      manufacturer_lot_number: data.manufacturerLotNumber,
      entry_date: data.entryDate,
      exchange_rate: data.exchangeRate,
      cost_usd: data.costUSD,
      cost_ves: data.costUSD * data.exchangeRate,
      supplier_id: data.supplierId,
      supplier_name: data.supplierName,
      original_quantity: data.quantity,
      remaining_quantity: data.quantity,
      status: data.requiresApproval ? 'quarantine' : 'available',
      requires_approval: data.requiresApproval,
      created_at: new Date(),
      updated_at: new Date(),
    };

    existingLayers.push(layer);
    this.layers.set(data.productId, existingLayers);
    await this.persistLayers();

    return layer;
  }

  /**
   * Approve layer (move from quarantine to available)
   */
  static async approveLayer(
    layerId: string,
    approvedBy: string,
    notes?: string
  ): Promise<void> {
    for (const [productId, layers] of this.layers.entries()) {
      const layer = layers.find(l => l.id === layerId);
      if (layer) {
        layer.status = 'available';
        layer.approved_by = approvedBy;
        layer.approved_at = new Date();
        layer.approval_notes = notes;
        layer.updated_at = new Date();
        await this.persistLayers();
        return;
      }
    }
    throw new Error('Layer not found');
  }

  /**
   * Consume from layers following PEPS (FIFO)
   * Returns the layers and quantities consumed
   */
  static async consumeFromLayers(
    productId: string,
    quantity: number,
    invoiceId: string
  ): Promise<{
    consumed: Array<{
      layer_id: string;
      layer_number: number;
      quantity: number;
      cost_usd: number;
      cost_ves: number;
    }>;
    remaining: number;
  }> {
    const layers = this.layers.get(productId) || [];
    const availableLayers = layers.filter(l => l.status === 'available' && l.remaining_quantity > 0);
    
    // Sort by layer_number (PEPS - oldest first)
    availableLayers.sort((a, b) => a.layer_number - b.layer_number);
    
    const consumed: Array<{
      layer_id: string;
      layer_number: number;
      quantity: number;
      cost_usd: number;
      cost_ves: number;
    }> = [];
    
    let remainingToConsume = quantity;
    
    for (const layer of availableLayers) {
      if (remainingToConsume <= 0) break;
      
      const consumeQuantity = Math.min(layer.remaining_quantity, remainingToConsume);
      
      // Update layer
      layer.remaining_quantity -= consumeQuantity;
      if (layer.remaining_quantity === 0) {
        layer.status = 'depleted';
      }
      layer.updated_at = new Date();
      
      // Create transaction record
      const transaction: LayerTransaction = {
        id: crypto.randomUUID(),
        layer_id: layer.id,
        invoice_id: invoiceId,
        quantity_consumed: consumeQuantity,
        cost_usd_per_unit: layer.cost_usd,
        cost_ves_per_unit: layer.cost_ves,
        total_cost_usd: layer.cost_usd * consumeQuantity,
        total_cost_ves: layer.cost_ves * consumeQuantity,
        transaction_date: new Date(),
        created_at: new Date(),
      };
      
      this.transactions.push(transaction);
      
      consumed.push({
        layer_id: layer.id,
        layer_number: layer.layer_number,
        quantity: consumeQuantity,
        cost_usd: layer.cost_usd,
        cost_ves: layer.cost_ves,
      });
      
      remainingToConsume -= consumeQuantity;
    }
    
    await this.persistLayers();
    
    return {
      consumed,
      remaining: remainingToConsume,
    };
  }

  /**
   * Calculate replacement cost (latest layer or current exchange rate)
   */
  static calculateReplacementCost(
    productId: string,
    currentExchangeRate: number
  ): {
    cost_usd: number;
    cost_ves: number;
    exchange_rate: number;
    source: 'latest_layer' | 'current_rate';
  } {
    const layers = this.layers.get(productId) || [];
    const availableLayers = layers.filter(l => l.status === 'available' || l.status === 'quarantine');
    
    if (availableLayers.length > 0) {
      // Get the most recent layer (highest layer_number)
      const latestLayer = availableLayers.reduce((a, b) => 
        a.layer_number > b.layer_number ? a : b
      );
      
      return {
        cost_usd: latestLayer.cost_usd,
        cost_ves: latestLayer.cost_ves,
        exchange_rate: latestLayer.exchange_rate,
        source: 'latest_layer',
      };
    }
    
    // Fallback to current exchange rate with default cost
    return {
      cost_usd: 0,
      cost_ves: 0,
      exchange_rate: currentExchangeRate,
      source: 'current_rate',
    };
  }

  /**
   * Calculate selling price based on replacement cost
   * Protects profit margin in foreign currency
   */
  static calculateSellingPrice(
    productId: string,
    currentExchangeRate: number,
    marginPercentage: number = 0.30
  ): {
    price_usd: number;
    price_ves: number;
    replacement_cost_usd: number;
    replacement_cost_ves: number;
    margin_usd: number;
    margin_ves: number;
  } {
    const replacementCost = this.calculateReplacementCost(productId, currentExchangeRate);
    
    // Calculate price based on replacement cost
    const priceUSD = replacementCost.cost_usd * (1 + marginPercentage);
    const priceVES = priceUSD * currentExchangeRate;
    
    const marginUSD = priceUSD - replacementCost.cost_usd;
    const marginVES = priceVES - replacementCost.cost_ves;
    
    return {
      price_usd: priceUSD,
      price_ves: priceVES,
      replacement_cost_usd: replacementCost.cost_usd,
      replacement_cost_ves: replacementCost.cost_ves,
      margin_usd: marginUSD,
      margin_ves: marginVES,
    };
  }

  /**
   * Get product layers
   */
  static getProductLayers(productId: string): InventoryLayer[] {
    return this.layers.get(productId) || [];
  }

  /**
   * Get layer statistics
   */
  static getLayerStatistics(productId: string): {
    total_layers: number;
    available_quantity: number;
    average_cost_usd: number;
    average_cost_ves: number;
    oldest_layer_date: Date | null;
    newest_layer_date: Date | null;
  } {
    const layers = this.layers.get(productId) || [];
    const availableLayers = layers.filter(l => l.status === 'available');
    
    if (layers.length === 0) {
      return {
        total_layers: 0,
        available_quantity: 0,
        average_cost_usd: 0,
        average_cost_ves: 0,
        oldest_layer_date: null,
        newest_layer_date: null,
      };
    }
    
    const totalQuantity = availableLayers.reduce((sum, l) => sum + l.remaining_quantity, 0);
    const avgCostUSD = availableLayers.reduce((sum, l) => sum + l.cost_usd, 0) / availableLayers.length;
    const avgCostVES = availableLayers.reduce((sum, l) => sum + l.cost_ves, 0) / availableLayers.length;
    
    const sortedByDate = [...layers].sort((a, b) => 
      a.entry_date.getTime() - b.entry_date.getTime()
    );
    
    return {
      total_layers: layers.length,
      available_quantity: totalQuantity,
      average_cost_usd: avgCostUSD,
      average_cost_ves: avgCostVES,
      oldest_layer_date: sortedByDate[0]?.entry_date || null,
      newest_layer_date: sortedByDate[sortedByDate.length - 1]?.entry_date || null,
    };
  }

  /**
   * Persist layers
   */
  private static async persistLayers(): Promise<void> {
    try {
      const layersArray: Array<{ productId: string; layers: InventoryLayer[] }> = [];
      
      for (const [productId, layers] of this.layers.entries()) {
        layersArray.push({ productId, layers });
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(layersArray));
    } catch (error) {
      console.error('Error persisting inventory layers:', error);
    }
  }

  /**
   * Load layers
   */
  static async loadLayers(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        
        this.layers.clear();
        
        for (const item of data) {
          const layers = item.layers.map((layer: any) => ({
            ...layer,
            entry_date: new Date(layer.entry_date),
            approved_at: layer.approved_at ? new Date(layer.approved_at) : undefined,
            created_at: new Date(layer.created_at),
            updated_at: new Date(layer.updated_at),
          }));
          this.layers.set(item.productId, layers);
        }
      }
    } catch (error) {
      console.error('Error loading inventory layers:', error);
    }
  }
}
