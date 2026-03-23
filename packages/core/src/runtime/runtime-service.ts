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
import { TauriStorageService } from './services/tauri-storage-service';
import { WebStorageService } from './services/web-storage-service';
import { TauriNetworkService } from './services/tauri-network-service';
import { WebNetworkService } from './services/web-network-service';
import { TauriPDFService } from './services/tauri-pdf-service';
import { WebPDFService } from './services/web-pdf-service';
import { TauriNotificationService } from './services/tauri-notification-service';
import { WebNotificationService } from './services/web-notification-service';

class RuntimeServiceImpl implements IRuntimeService {
  private static instance: RuntimeServiceImpl | null = null;
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
    const tauriBridge =
      typeof window !== 'undefined'
        ? (window as unknown as { __TAURI__?: { invoke?: unknown } }).__TAURI__
        : undefined;

    if (typeof tauriBridge?.invoke === 'function') {
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
        this.storageService = new TauriStorageService();
      } else {
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
        this.networkService = new TauriNetworkService();
      } else {
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
        this.pdfService = new TauriPDFService();
      } else {
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
        this.notificationService = new TauriNotificationService();
      } else {
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
    RuntimeServiceImpl.instance = null;
  }
}

// Export delegating facade so tests that reset the singleton always observe a fresh instance
export const RuntimeService = {
  isTauri: () => RuntimeServiceImpl.getInstance().isTauri(),
  isWeb: () => RuntimeServiceImpl.getInstance().isWeb(),
  getEnvironment: () => RuntimeServiceImpl.getInstance().getEnvironment(),
  getStorageService: () => RuntimeServiceImpl.getInstance().getStorageService(),
  getNetworkService: () => RuntimeServiceImpl.getInstance().getNetworkService(),
  getPDFService: () => RuntimeServiceImpl.getInstance().getPDFService(),
  getNotificationService: () => RuntimeServiceImpl.getInstance().getNotificationService(),
  resetServices: () => RuntimeServiceImpl.getInstance().resetServices(),
} satisfies IRuntimeService & { resetServices(): void };

// Export class for testing
export { RuntimeServiceImpl };
