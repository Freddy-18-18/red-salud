/**
 * Runtime Service - Singleton for Runtime Detection
 *
 * This service detects the runtime environment (Tauri vs Web) and provides
 * factory methods to get the appropriate service implementations.
 *
 * Tauri service implementations are loaded dynamically at runtime to avoid
 * bundling @tauri-apps/api in web-only builds. Web services are used as
 * the default, and Tauri services are swapped in asynchronously when the
 * Tauri runtime is detected.
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
import { WebStorageService } from './services/services/web-storage-service';
import { WebNetworkService } from './services/services/web-network-service';
import { WebPDFService } from './services/services/web-pdf-service';
import { WebNotificationService } from './services/services/web-notification-service';

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
   * Get the storage service for the current runtime.
   * Returns WebStorageService by default. In Tauri environments,
   * consumers should dynamically import TauriStorageService.
   */
  public getStorageService(): StorageService {
    if (!this.storageService) {
      this.storageService = new WebStorageService();
    }
    return this.storageService!;
  }

  /**
   * Get the network service for the current runtime.
   */
  public getNetworkService(): NetworkService {
    if (!this.networkService) {
      this.networkService = new WebNetworkService();
    }
    return this.networkService!;
  }

  /**
   * Get the PDF service for the current runtime.
   */
  public getPDFService(): PDFService {
    if (!this.pdfService) {
      this.pdfService = new WebPDFService();
    }
    return this.pdfService!;
  }

  /**
   * Get the notification service for the current runtime.
   */
  public getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new WebNotificationService();
    }
    return this.notificationService!;
  }

  /**
   * Override a service implementation (used by Tauri apps to inject
   * platform-specific services after dynamic import).
   */
  public setStorageService(service: StorageService): void {
    this.storageService = service;
  }

  public setNetworkService(service: NetworkService): void {
    this.networkService = service;
  }

  public setPDFService(service: PDFService): void {
    this.pdfService = service;
  }

  public setNotificationService(service: NotificationService): void {
    this.notificationService = service;
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
  setStorageService: (s: StorageService) => RuntimeServiceImpl.getInstance().setStorageService(s),
  setNetworkService: (s: NetworkService) => RuntimeServiceImpl.getInstance().setNetworkService(s),
  setPDFService: (s: PDFService) => RuntimeServiceImpl.getInstance().setPDFService(s),
  setNotificationService: (s: NotificationService) => RuntimeServiceImpl.getInstance().setNotificationService(s),
  resetServices: () => RuntimeServiceImpl.getInstance().resetServices(),
} satisfies IRuntimeService & {
  setStorageService(s: StorageService): void;
  setNetworkService(s: NetworkService): void;
  setPDFService(s: PDFService): void;
  setNotificationService(s: NotificationService): void;
  resetServices(): void;
};

// Export class for testing
export { RuntimeServiceImpl };
