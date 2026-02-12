import { Invoice, Product, Batch } from '@red-salud/types';

/**
 * Offline-First Sync Manager
 * Handles offline operations and synchronization with the server
 */
export class OfflineSyncManager {
  private static SYNC_QUEUE_KEY = 'pharmacy_sync_queue';
  private static LAST_SYNC_KEY = 'pharmacy_last_sync';
  private static OFFLINE_DATA_KEY = 'pharmacy_offline_data';

  /**
   * Check if device is online
   */
  static isOnline(): boolean {
    if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true;
  }

  /**
   * Add action to sync queue
   */
  static addToSyncQueue(action: {
    type: 'create' | 'update' | 'delete';
    entity: string;
    entityId: string;
    data: any;
    timestamp: Date;
  }): void {
    const queue = this.getSyncQueue();
    queue.push(action);
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Get sync queue
   */
  static getSyncQueue(): Array<{
    type: 'create' | 'update' | 'delete';
    entity: string;
    entityId: string;
    data: any;
    timestamp: Date;
  }> {
    try {
      const stored = localStorage.getItem(this.SYNC_QUEUE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
    return [];
  }

  /**
   * Clear sync queue
   */
  static clearSyncQueue(): void {
    localStorage.removeItem(this.SYNC_QUEUE_KEY);
  }

  /**
   * Get last sync timestamp
   */
  static getLastSync(): Date | null {
    try {
      const stored = localStorage.getItem(this.LAST_SYNC_KEY);
      if (stored) {
        return new Date(stored);
      }
    } catch (error) {
      console.error('Error loading last sync:', error);
    }
    return null;
  }

  /**
   * Set last sync timestamp
   */
  static setLastSync(date: Date): void {
    localStorage.setItem(this.LAST_SYNC_KEY, date.toISOString());
  }

  /**
   * Save offline data
   */
  static saveOfflineData(data: {
    products: Product[];
    batches: Batch[];
    invoices: Invoice[];
    lastUpdated: Date;
  }): void {
    localStorage.setItem(this.OFFLINE_DATA_KEY, JSON.stringify(data));
  }

  /**
   * Load offline data
   */
  static loadOfflineData(): {
    products: Product[];
    batches: Batch[];
    invoices: Invoice[];
    lastUpdated: Date | null;
  } | null {
    try {
      const stored = localStorage.getItem(this.OFFLINE_DATA_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return {
          ...data,
          lastUpdated: new Date(data.lastUpdated),
        };
      }
    } catch (error) {
      console.error('Error loading offline data:', error);
    }
    return null;
  }

  /**
   * Sync pending changes to server
   */
  static async syncPendingChanges(apiUrl: string, apiKey: string): Promise<{
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const queue = this.getSyncQueue();
    let synced = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const action of queue) {
      try {
        await this.executeSyncAction(action, apiUrl, apiKey);
        synced++;
      } catch (error) {
        failed++;
        errors.push(`Failed to sync ${action.entity} ${action.entityId}: ${error}`);
      }
    }

    if (synced > 0) {
      // Remove synced items from queue
      const remainingQueue = queue.slice(synced);
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remainingQueue));
      this.setLastSync(new Date());
    }

    return { synced, failed, errors };
  }

  /**
   * Execute sync action
   */
  private static async executeSyncAction(
    action: {
      type: 'create' | 'update' | 'delete';
      entity: string;
      entityId: string;
      data: any;
    },
    apiUrl: string,
    apiKey: string
  ): Promise<void> {
    const url = `${apiUrl}/api/${action.entity}/${action.entityId}`;
    
    const options: RequestInit = {
      method: action.type === 'create' ? 'POST' : action.type === 'update' ? 'PUT' : 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
    };

    if (action.type !== 'delete') {
      options.body = JSON.stringify(action.data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Check if sync is needed
   */
  static needsSync(): boolean {
    const queue = this.getSyncQueue();
    return queue.length > 0;
  }

  /**
   * Get sync queue size
   */
  static getSyncQueueSize(): number {
    return this.getSyncQueue().length;
  }

  /**
   * Get offline status
   */
  static getOfflineStatus(): {
    isOnline: boolean;
    pendingSyncs: number;
    lastSync: Date | null;
    needsSync: boolean;
  } {
    return {
      isOnline: this.isOnline(),
      pendingSyncs: this.getSyncQueueSize(),
      lastSync: this.getLastSync(),
      needsSync: this.needsSync(),
    };
  }
}

/**
 * Mobile Inventory Scanner
 * Handles barcode scanning and inventory management on mobile devices
 */
export class MobileInventoryScanner {
  /**
   * Scan barcode using device camera
   */
  static async scanBarcode(): Promise<string | null> {
    // In a real implementation, this would use a barcode scanning library
    // For now, we'll return a mock implementation
    return new Promise((resolve) => {
      // Simulate scanning delay
      setTimeout(() => {
        // Return a mock barcode
        const mockBarcodes = [
          '7500000000001',
          '7500000000002',
          '7500000000003',
        ];
        const selected = mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)] ?? null;
        resolve(selected);
      }, 1000);
    });
  };

  /**
   * Search product by barcode
   */
  static findProductByBarcode(
    barcode: string,
    products: Product[]
  ): Product | null {
    return products.find(p => p.sku === barcode || p.barcode === barcode) || null;
  }

  /**
   * Record inventory count
   */
  static recordInventoryCount(
    productId: string,
    countedQuantity: number,
    systemQuantity: number,
    userId: string
  ): {
    productId: string;
    countedQuantity: number;
    systemQuantity: number;
    difference: number;
    userId: string;
    timestamp: Date;
  } {
    return {
      productId,
      countedQuantity,
      systemQuantity,
      difference: countedQuantity - systemQuantity,
      userId,
      timestamp: new Date(),
    };
  }

  /**
   * Generate inventory report
   */
  static generateInventoryReport(
    counts: Array<{
      productId: string;
      countedQuantity: number;
      systemQuantity: number;
      difference: number;
      timestamp: Date;
    }>,
    products: Product[]
  ): {
    title: string;
    date: Date;
    totalItems: number;
    matchedItems: number;
    discrepancies: number;
    discrepanciesByProduct: Array<{
      productId: string;
      productName: string;
      systemQuantity: number;
      countedQuantity: number;
      difference: number;
      percentage: number;
    }>;
  } {
    const discrepancies = counts.filter(c => c.difference !== 0);
    
    return {
      title: 'Reporte de Inventario Móvil',
      date: new Date(),
      totalItems: counts.length,
      matchedItems: counts.length - discrepancies.length,
      discrepancies: discrepancies.length,
      discrepanciesByProduct: discrepancies.map(count => {
        const product = products.find(p => p.id === count.productId);
        return {
          productId: count.productId,
          productName: product?.name || 'Desconocido',
          systemQuantity: count.systemQuantity,
          countedQuantity: count.countedQuantity,
          difference: count.difference,
          percentage: count.systemQuantity > 0 
            ? (count.difference / count.systemQuantity) * 100 
            : 0,
        };
      }),
    };
  }

  /**
   * Check camera permissions
   */
  static async checkCameraPermissions(): Promise<boolean> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return false;
    }

    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      return true;
    } catch (error) {
      console.error('Camera permission check failed:', error);
      return false;
    }
  }

  /**
   * Request camera permissions
   */
  static async requestCameraPermissions(): Promise<boolean> {
    try {
      await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      return true;
    } catch (error) {
      console.error('Camera permission request failed:', error);
      return false;
    }
  }

  /**
   * Take photo of product
   */
  static async takePhoto(): Promise<string | null> {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) {
        stream.getTracks().forEach((track) => track.stop());
        return null;
      }
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(void 0);
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0);

      // Stop stream
      stream.getTracks().forEach(track => track.stop());

      // Convert to base64
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      return dataUrl;
    } catch (error) {
      console.error('Photo capture failed:', error);
      return null;
    }
  }

  /**
   * Generate inventory adjustment report
   */
  static generateAdjustmentReport(
    counts: Array<{
      productId: string;
      countedQuantity: number;
      systemQuantity: number;
      difference: number;
      timestamp: Date;
    }>,
    products: Product[]
  ): string {
    const lines: string[] = [];

    lines.push('REPORTE DE AJUSTE DE INVENTARIO');
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Fecha: ${new Date().toLocaleDateString('es-VE')}`);
    lines.push('');

    const discrepancies = counts.filter(c => c.difference !== 0);

    if (discrepancies.length === 0) {
      lines.push('✓ No se encontraron discrepancias');
    } else {
      lines.push('DISCREPANCIAS ENCONTRADAS:');
      lines.push('-'.repeat(60));
      lines.push('');

      discrepancies.forEach((count, index) => {
        const product = products.find(p => p.id === count.productId);
        lines.push(`${index + 1}. ${product?.name || 'Desconocido'}`);
        lines.push(`   Sistema: ${count.systemQuantity} | Contado: ${count.countedQuantity} | Diferencia: ${count.difference}`);
        lines.push('');
      });
    }

    lines.push('='.repeat(60));
    lines.push(`Total items verificados: ${counts.length}`);
    lines.push(`Items con discrepancia: ${discrepancies.length}`);
    lines.push(`Items sin discrepancia: ${counts.length - discrepancies.length}`);

    return lines.join('\n');
  }
}
