/**
 * Connectivity Monitor
 * 
 * Monitors network connectivity status and emits events when status changes.
 * Checks connectivity every 30 seconds using the appropriate NetworkService
 * implementation based on the runtime environment (Tauri vs Web).
 * 
 * Features:
 * - Continuous connectivity checking (every 30 seconds)
 * - Event emission on status changes (online ↔ offline)
 * - Runtime-aware (uses Tauri or Web NetworkService)
 * - Multiple listener support
 * 
 * Validates: Requirements 8.1, 8.2, 8.6
 */

import { RuntimeService } from './runtime-service';
import type { NetworkService } from './types';

/**
 * Callback function type for connectivity status changes
 */
export type ConnectivityCallback = (online: boolean) => void;

/**
 * ConnectivityMonitor interface
 */
export interface ConnectivityMonitor {
  /**
   * Start monitoring connectivity
   */
  start(): void;

  /**
   * Stop monitoring connectivity
   */
  stop(): void;

  /**
   * Get current connectivity status
   */
  isOnline(): boolean;

  /**
   * Register a callback for connectivity status changes
   * Returns an unsubscribe function
   */
  onStatusChange(callback: ConnectivityCallback): () => void;
}

/**
 * ConnectivityMonitor implementation
 */
export class ConnectivityMonitorImpl implements ConnectivityMonitor {
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private networkService: NetworkService;
  private listeners: Set<ConnectivityCallback>;
  private intervalId: NodeJS.Timeout | null = null;
  private currentStatus: boolean = true; // Assume online initially
  private isRunning: boolean = false;

  constructor() {
    this.networkService = RuntimeService.getNetworkService();
    this.listeners = new Set();
  }

  /**
   * Start monitoring connectivity
   */
  public start(): void {
    if (this.isRunning) {
      console.warn('ConnectivityMonitor is already running');
      return;
    }

    this.isRunning = true;

    // Check connectivity immediately
    this.checkConnectivity();

    // Set up periodic checks
    this.intervalId = setInterval(() => {
      this.checkConnectivity();
    }, this.CHECK_INTERVAL);

    console.log('ConnectivityMonitor started');
  }

  /**
   * Stop monitoring connectivity
   */
  public stop(): void {
    if (!this.isRunning) {
      console.warn('ConnectivityMonitor is not running');
      return;
    }

    this.isRunning = false;

    // Clear the interval
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    console.log('ConnectivityMonitor stopped');
  }

  /**
   * Get current connectivity status
   */
  public isOnline(): boolean {
    return this.currentStatus;
  }

  /**
   * Register a callback for connectivity status changes
   * Returns an unsubscribe function
   */
  public onStatusChange(callback: ConnectivityCallback): () => void {
    this.listeners.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Check connectivity and emit events if status changed
   */
  private async checkConnectivity(): Promise<void> {
    try {
      const isOnline = await this.networkService.checkConnectivity();
      
      // Check if status changed
      if (isOnline !== this.currentStatus) {
        const previousStatus = this.currentStatus;
        this.currentStatus = isOnline;
        
        console.log(
          `Connectivity status changed: ${previousStatus ? 'online' : 'offline'} → ${isOnline ? 'online' : 'offline'}`
        );
        
        // Emit event to all listeners
        this.emitStatusChange(isOnline);
      }
    } catch (error) {
      console.error('Error checking connectivity:', error);
      
      // On error, assume offline
      if (this.currentStatus !== false) {
        this.currentStatus = false;
        this.emitStatusChange(false);
      }
    }
  }

  /**
   * Emit status change event to all listeners
   */
  private emitStatusChange(online: boolean): void {
    this.listeners.forEach(callback => {
      try {
        callback(online);
      } catch (error) {
        console.error('Error in connectivity status change callback:', error);
      }
    });
  }

  /**
   * Get the number of registered listeners (useful for testing)
   */
  public getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Force a connectivity check (useful for testing)
   */
  public async forceCheck(): Promise<void> {
    await this.checkConnectivity();
  }
}

// Export singleton instance
let monitorInstance: ConnectivityMonitor | null = null;

/**
 * Get the singleton ConnectivityMonitor instance
 */
export function getConnectivityMonitor(): ConnectivityMonitor {
  if (!monitorInstance) {
    monitorInstance = new ConnectivityMonitorImpl();
  }
  return monitorInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetConnectivityMonitor(): void {
  if (monitorInstance) {
    monitorInstance.stop();
    monitorInstance = null;
  }
}
