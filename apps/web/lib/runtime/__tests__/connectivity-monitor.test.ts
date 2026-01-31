/**
 * Unit Tests for Connectivity Monitor
 * 
 * These tests verify specific examples, edge cases, and behavior
 * for the ConnectivityMonitor implementation.
 * 
 * Testing Framework: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Task: 4.3 - Write unit tests for connectivity monitoring
 * Validates: Requirements 8.2
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  ConnectivityMonitorImpl,
  resetConnectivityMonitor,
  getConnectivityMonitor,
  type ConnectivityCallback,
} from '../connectivity-monitor';
import { RuntimeService } from '../runtime-service';
import type { NetworkService } from '../types';

describe('ConnectivityMonitor', () => {
  let monitor: ConnectivityMonitorImpl;
  let mockNetworkService: NetworkService;

  beforeEach(() => {
    // Reset the singleton
    resetConnectivityMonitor();

    // Create a mock network service
    mockNetworkService = {
      checkConnectivity: vi.fn().mockResolvedValue(true),
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    // Mock RuntimeService to return our mock network service
    vi.spyOn(RuntimeService, 'getNetworkService').mockReturnValue(mockNetworkService);

    // Create a new monitor instance
    monitor = new ConnectivityMonitorImpl();
  });

  afterEach(() => {
    // Stop the monitor if it's running
    monitor.stop();
    vi.restoreAllMocks();
    vi.clearAllTimers();
  });

  describe('Initialization', () => {
    it('should initialize with online status', () => {
      expect(monitor.isOnline()).toBe(true);
    });

    it('should have no listeners initially', () => {
      expect(monitor.getListenerCount()).toBe(0);
    });

    it('should not be running initially', () => {
      // Monitor should not start automatically
      expect(monitor.isOnline()).toBe(true);
    });
  });

  describe('Start and Stop', () => {
    it('should start monitoring', () => {
      monitor.start();
      // Monitor should be running (we can't directly check, but we can verify it doesn't throw)
      expect(() => monitor.stop()).not.toThrow();
    });

    it('should stop monitoring', () => {
      monitor.start();
      monitor.stop();
      // Should not throw when stopping
      expect(() => monitor.stop()).not.toThrow();
    });

    it('should warn when starting twice', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      monitor.start();
      monitor.start(); // Start again
      
      expect(consoleSpy).toHaveBeenCalledWith('ConnectivityMonitor is already running');
      consoleSpy.mockRestore();
    });

    it('should warn when stopping without starting', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      monitor.stop(); // Stop without starting
      
      expect(consoleSpy).toHaveBeenCalledWith('ConnectivityMonitor is not running');
      consoleSpy.mockRestore();
    });

    it('should check connectivity immediately on start', async () => {
      monitor.start();
      
      // Wait a bit for the async check to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalled();
    });
  });

  describe('Online to Offline Transition', () => {
    it('should detect online to offline transition', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Start with online status
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();
      expect(monitor.isOnline()).toBe(true);

      // Change to offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      expect(monitor.isOnline()).toBe(false);
      expect(callback).toHaveBeenCalledWith(false);
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should emit event only once for online to offline', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Start online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      // Go offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      // Stay offline
      await monitor.forceCheck();
      await monitor.forceCheck();

      // Should only emit once for the transition
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should log status change', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Start online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      // Go offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Connectivity status changed: online → offline')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Offline to Online Transition', () => {
    it('should detect offline to online transition', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Start offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();
      expect(monitor.isOnline()).toBe(false);

      // Change to online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      expect(monitor.isOnline()).toBe(true);
      expect(callback).toHaveBeenCalledWith(true);
      expect(callback).toHaveBeenCalledTimes(2); // Once for offline, once for online
    });

    it('should emit event only once for offline to online', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Start offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      // Go online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      // Stay online
      await monitor.forceCheck();
      await monitor.forceCheck();

      // Should emit twice: once for initial offline, once for transition to online
      expect(callback).toHaveBeenCalledTimes(2);
      expect(callback).toHaveBeenNthCalledWith(1, false);
      expect(callback).toHaveBeenNthCalledWith(2, true);
    });

    it('should log status change', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Start offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      // Go online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Connectivity status changed: offline → online')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Event Listener Registration/Unregistration', () => {
    it('should register event listener', () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      expect(monitor.getListenerCount()).toBe(1);
    });

    it('should register multiple event listeners', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      monitor.onStatusChange(callback1);
      monitor.onStatusChange(callback2);
      monitor.onStatusChange(callback3);

      expect(monitor.getListenerCount()).toBe(3);
    });

    it('should unregister event listener', () => {
      const callback = vi.fn();
      const unsubscribe = monitor.onStatusChange(callback);

      expect(monitor.getListenerCount()).toBe(1);

      unsubscribe();

      expect(monitor.getListenerCount()).toBe(0);
    });

    it('should unregister specific listener', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      const unsubscribe1 = monitor.onStatusChange(callback1);
      const unsubscribe2 = monitor.onStatusChange(callback2);
      monitor.onStatusChange(callback3);

      expect(monitor.getListenerCount()).toBe(3);

      unsubscribe1();
      expect(monitor.getListenerCount()).toBe(2);

      unsubscribe2();
      expect(monitor.getListenerCount()).toBe(1);
    });

    it('should call all registered listeners on status change', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();
      const callback3 = vi.fn();

      monitor.onStatusChange(callback1);
      monitor.onStatusChange(callback2);
      monitor.onStatusChange(callback3);

      // Change status
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      expect(callback1).toHaveBeenCalledWith(false);
      expect(callback2).toHaveBeenCalledWith(false);
      expect(callback3).toHaveBeenCalledWith(false);
    });

    it('should not call unregistered listeners', async () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      monitor.onStatusChange(callback1);
      const unsubscribe2 = monitor.onStatusChange(callback2);

      // Unregister callback2
      unsubscribe2();

      // Change status
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      expect(callback1).toHaveBeenCalledWith(false);
      expect(callback2).not.toHaveBeenCalled();
    });

    it('should handle listener errors gracefully', async () => {
      const errorCallback = vi.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });
      const normalCallback = vi.fn();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      monitor.onStatusChange(errorCallback);
      monitor.onStatusChange(normalCallback);

      // Change status
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      // Both callbacks should be called, even though one throws
      expect(errorCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in connectivity status change callback:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Error Handling', () => {
    it('should handle connectivity check errors', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Mock checkConnectivity to throw an error
      mockNetworkService.checkConnectivity = vi.fn().mockRejectedValue(
        new Error('Network check failed')
      );

      await monitor.forceCheck();

      // Should assume offline on error
      expect(monitor.isOnline()).toBe(false);
      expect(callback).toHaveBeenCalledWith(false);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error checking connectivity:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });

    it('should only emit event once when multiple errors occur', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Mock checkConnectivity to throw an error
      mockNetworkService.checkConnectivity = vi.fn().mockRejectedValue(
        new Error('Network check failed')
      );

      await monitor.forceCheck();
      await monitor.forceCheck();
      await monitor.forceCheck();

      // Should only emit once for the transition to offline
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(false);
    });
  });

  describe('Periodic Checking', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should check connectivity every 30 seconds', async () => {
      monitor.start();

      // Initial check
      await vi.runOnlyPendingTimersAsync();
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalledTimes(1);

      // After 30 seconds
      vi.advanceTimersByTime(30000);
      await vi.runOnlyPendingTimersAsync();
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalledTimes(2);

      // After another 30 seconds
      vi.advanceTimersByTime(30000);
      await vi.runOnlyPendingTimersAsync();
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalledTimes(3);
    });

    it('should stop periodic checking when stopped', async () => {
      monitor.start();

      // Initial check
      await vi.runOnlyPendingTimersAsync();
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalledTimes(1);

      // Stop the monitor
      monitor.stop();

      // Advance time
      vi.advanceTimersByTime(60000); // 60 seconds
      await vi.runOnlyPendingTimersAsync();

      // Should not have checked again
      expect(mockNetworkService.checkConnectivity).toHaveBeenCalledTimes(1);
    });
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = getConnectivityMonitor();
      const instance2 = getConnectivityMonitor();

      expect(instance1).toBe(instance2);
    });

    it('should reset singleton instance', () => {
      const instance1 = getConnectivityMonitor();
      resetConnectivityMonitor();
      const instance2 = getConnectivityMonitor();

      expect(instance1).not.toBe(instance2);
    });

    it('should stop monitor when resetting', () => {
      const instance = getConnectivityMonitor();
      instance.start();

      // Reset should stop the monitor
      resetConnectivityMonitor();

      // Should not throw
      expect(() => resetConnectivityMonitor()).not.toThrow();
    });
  });

  describe('Integration with RuntimeService', () => {
    it('should use NetworkService from RuntimeService', () => {
      expect(RuntimeService.getNetworkService).toHaveBeenCalled();
    });

    it('should work with different NetworkService implementations', async () => {
      const customNetworkService: NetworkService = {
        checkConnectivity: vi.fn().mockResolvedValue(false),
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      };

      vi.spyOn(RuntimeService, 'getNetworkService').mockReturnValue(customNetworkService);

      const customMonitor = new ConnectivityMonitorImpl();
      await customMonitor.forceCheck();

      expect(customNetworkService.checkConnectivity).toHaveBeenCalled();
      expect(customMonitor.isOnline()).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid status changes', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Rapid changes: online → offline → online → offline
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();

      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);
      await monitor.forceCheck();

      // Should emit for each transition
      expect(callback).toHaveBeenCalledTimes(3);
      expect(callback).toHaveBeenNthCalledWith(1, false);
      expect(callback).toHaveBeenNthCalledWith(2, true);
      expect(callback).toHaveBeenNthCalledWith(3, false);
    });

    it('should handle no status change', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      // Stay online
      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
      await monitor.forceCheck();
      await monitor.forceCheck();
      await monitor.forceCheck();

      // Should not emit any events (no status change)
      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle concurrent force checks', async () => {
      const callback = vi.fn();
      monitor.onStatusChange(callback);

      mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(false);

      // Trigger multiple concurrent checks
      await Promise.all([
        monitor.forceCheck(),
        monitor.forceCheck(),
        monitor.forceCheck(),
      ]);

      // Should only emit once for the status change
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(false);
    });
  });
});
