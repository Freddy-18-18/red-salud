/**
 * Runtime Service - Singleton for Runtime Detection
 * 
 * This service detects the runtime environment (Tauri vs Web) and provides
 * factory methods to get the appropriate service implementations.
 * 
 * Validates: Requirements 9.1, 9.2, 9.3
 */

import type {
  RuntimeService as IRuntimeService,
  RuntimeEnvironment,
  StorageService,
  NetworkService,
  PDFService,
  NotificationService,
} from './types';

class RuntimeServiceImpl implements IRuntimeService {
  private static instance: RuntimeServiceImpl;
  private environment: RuntimeEnvironment;
  private storageService: StorageService | null = null;
  private networkService: NetworkService | null = null;
  private pdfService: PDFService | null = null;
  private notificationService: NotificationService | null = null;

  private constructor() {
    // Detect runtime environment
    this.environment = this.detectEnvironment();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): RuntimeServiceImpl {
    if (!RuntimeServiceImpl.instance) {
      RuntimeServiceImpl.instance = new RuntimeServiceImpl();
    }
    return RuntimeServiceImpl.instance;
  }

  /**
   * Detect the runtime environment
   */
  private detectEnvironment(): RuntimeEnvironment {
    if (typeof window !== 'undefined' && '__TAURI__' in window) {
      return 'tauri';
    }
    return 'web';
  }

  /**
   * Check if running in Tauri environment
   */
  public isTauri(): boolean {
    return this.environment === 'tauri';
  }

  /**
   * Check if running in web environment
   */
  public isWeb(): boolean {
    return this.environment === 'web';
  }

  /**
   * Get the current runtime environment
   */
  public getEnvironment(): RuntimeEnvironment {
    return this.environment;
  }

  /**
   * Get the storage service for the current runtime
   */
  public getStorageService(): StorageService {
    if (!this.storageService) {
      if (this.isTauri()) {
        // Lazy load Tauri storage service
        const { TauriStorageService } = require('./services/tauri-storage-service');
        this.storageService = new TauriStorageService();
      } else {
        // Lazy load Web storage service
        const { WebStorageService } = require('./services/web-storage-service');
        this.storageService = new WebStorageService();
      }
    }
    return this.storageService!;
  }

  /**
   * Get the network service for the current runtime
   */
  public getNetworkService(): NetworkService {
    if (!this.networkService) {
      if (this.isTauri()) {
        // Lazy load Tauri network service
        const { TauriNetworkService } = require('./services/tauri-network-service');
        this.networkService = new TauriNetworkService();
      } else {
        // Lazy load Web network service
        const { WebNetworkService } = require('./services/web-network-service');
        this.networkService = new WebNetworkService();
      }
    }
    return this.networkService!;
  }

  /**
   * Get the PDF service for the current runtime
   */
  public getPDFService(): PDFService {
    if (!this.pdfService) {
      if (this.isTauri()) {
        // Lazy load Tauri PDF service
        const { TauriPDFService } = require('./services/tauri-pdf-service');
        this.pdfService = new TauriPDFService();
      } else {
        // Lazy load Web PDF service
        const { WebPDFService } = require('./services/web-pdf-service');
        this.pdfService = new WebPDFService();
      }
    }
    return this.pdfService!;
  }

  /**
   * Get the notification service for the current runtime
   */
  public getNotificationService(): NotificationService {
    if (!this.notificationService) {
      if (this.isTauri()) {
        // Lazy load Tauri notification service
        const { TauriNotificationService } = require('./services/tauri-notification-service');
        this.notificationService = new TauriNotificationService();
      } else {
        // Lazy load Web notification service
        const { WebNotificationService } = require('./services/web-notification-service');
        this.notificationService = new WebNotificationService();
      }
    }
    return this.notificationService!;
  }

  /**
   * Reset all services (useful for testing)
   */
  public resetServices(): void {
    this.storageService = null;
    this.networkService = null;
    this.pdfService = null;
    this.notificationService = null;
    // Re-detect environment
    this.environment = this.detectEnvironment();
  }

  /**
   * Reset the singleton instance (useful for testing)
   */
  public static resetInstance(): void {
    RuntimeServiceImpl.instance = null as any;
  }
}

// Export singleton instance
export const RuntimeService = RuntimeServiceImpl.getInstance();

// Export class for testing
export { RuntimeServiceImpl };
