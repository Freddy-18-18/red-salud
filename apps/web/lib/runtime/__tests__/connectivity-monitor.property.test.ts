/**
 * Property-Based Tests for Connectivity Monitor
 * 
 * These tests validate correctness properties that should hold true
 * across all valid executions of the connectivity monitor.
 * 
 * Testing Framework: fast-check (property-based testing)
 * Test Runner: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Property 5: Connectivity State Propagation
 * Validates: Requirements 2.6, 8.2
 * 
 * **Validates: Requirements 2.6, 8.2**
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import {
  ConnectivityMonitorImpl,
  resetConnectivityMonitor,
  type ConnectivityCallback,
} from '../connectivity-monitor';
import { RuntimeService } from '../runtime-service';
import type { NetworkService } from '../types';

/**
 * Property 5: Connectivity State Propagation
 * 
 * For any change in connectivity status (online to offline, or offline to online),
 * the Connectivity_Monitor SHALL emit events that update all relevant UI components
 * to reflect the current state.
 * 
 * This property test verifies that:
 * 1. Status changes are detected correctly
 * 2. All registered listeners are notified
 * 3. Listeners receive the correct status value
 * 4. Multiple listeners all receive the same status
 * 5. Status changes propagate regardless of the sequence of transitions
 */
describe('Property 5: Connectivity State Propagation', () => {
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
  });

  /**
   * Test that all listeners receive status change events
   * for any sequence of connectivity transitions
   */
  it('should propagate status changes to all registered listeners', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a sequence of connectivity states (true = online, false = offline)
        fc.array(fc.boolean(), { minLength: 2, maxLength: 10 }),
        // Generate number of listeners (1-10)
        fc.integer({ min: 1, max: 10 }),
        async (statusSequence, listenerCount) => {
          // Create multiple listeners
          const listeners: Array<{ callback: ConnectivityCallback; calls: boolean[] }> = [];
          
          for (let i = 0; i < listenerCount; i++) {
            const calls: boolean[] = [];
            const callback = vi.fn((status: boolean) => {
              calls.push(status);
            });
            
            monitor.onStatusChange(callback);
            listeners.push({ callback, calls });
          }

          // Apply the sequence of status changes
          for (const status of statusSequence) {
            mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
            await monitor.forceCheck();
          }

          // Calculate expected transitions (only when status actually changes)
          const transitions: boolean[] = [];
          let previousStatus = true; // Monitor starts with online status
          
          for (const status of statusSequence) {
            if (status !== previousStatus) {
              transitions.push(status);
              previousStatus = status;
            }
          }

          // Verify all listeners received the same transitions
          for (const listener of listeners) {
            expect(listener.calls).toEqual(transitions);
            expect(listener.callback).toHaveBeenCalledTimes(transitions.length);
          }

          // Verify all listeners received identical sequences
          if (listeners.length > 1) {
            const firstListenerCalls = listeners[0].calls;
            for (let i = 1; i < listeners.length; i++) {
              expect(listeners[i].calls).toEqual(firstListenerCalls);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that status changes are correctly detected
   * regardless of the initial state
   */
  it('should detect status changes from any initial state', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate initial status
        fc.boolean(),
        // Generate target status (must be different)
        fc.boolean(),
        async (initialStatus, targetStatus) => {
          // Skip if statuses are the same (no transition)
          fc.pre(initialStatus !== targetStatus);

          const callback = vi.fn();
          monitor.onStatusChange(callback);

          // Set initial status
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(initialStatus);
          await monitor.forceCheck();

          // Change to target status
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(targetStatus);
          await monitor.forceCheck();

          // Verify transition was detected
          expect(callback).toHaveBeenCalledWith(targetStatus);
          expect(monitor.isOnline()).toBe(targetStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that the monitor correctly tracks current status
   * through any sequence of changes
   */
  it('should maintain correct current status through any sequence of changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 1, maxLength: 20 }),
        async (statusSequence) => {
          // Apply sequence of status changes
          for (const status of statusSequence) {
            mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
            await monitor.forceCheck();
          }

          // Current status should match the last status in the sequence
          const expectedStatus = statusSequence[statusSequence.length - 1];
          expect(monitor.isOnline()).toBe(expectedStatus);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that status changes are idempotent
   * (multiple checks with same status don't trigger multiple events)
   */
  it('should not emit duplicate events for unchanged status', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.boolean(),
        fc.integer({ min: 2, max: 10 }),
        async (status, checkCount) => {
          const callback = vi.fn();
          monitor.onStatusChange(callback);

          // Set initial status (different from default)
          const initialStatus = !status;
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(initialStatus);
          await monitor.forceCheck();

          // Clear the callback calls from initial transition
          callback.mockClear();

          // Check multiple times with same status
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
          await monitor.forceCheck();

          // Additional checks with same status
          for (let i = 1; i < checkCount; i++) {
            await monitor.forceCheck();
          }

          // Should only emit once for the actual transition
          expect(callback).toHaveBeenCalledTimes(1);
          expect(callback).toHaveBeenCalledWith(status);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that listeners added after status changes
   * don't receive historical events
   */
  it('should not send historical events to newly added listeners', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 2, maxLength: 5 }),
        async (statusSequence) => {
          // Apply some status changes without listeners
          for (const status of statusSequence) {
            mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
            await monitor.forceCheck();
          }

          // Add listener after changes
          const lateCallback = vi.fn();
          monitor.onStatusChange(lateCallback);

          // Listener should not have received any historical events
          expect(lateCallback).not.toHaveBeenCalled();

          // But should receive future events
          const newStatus = !statusSequence[statusSequence.length - 1];
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(newStatus);
          await monitor.forceCheck();

          expect(lateCallback).toHaveBeenCalledWith(newStatus);
          expect(lateCallback).toHaveBeenCalledTimes(1);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that unsubscribed listeners don't receive events
   */
  it('should not send events to unsubscribed listeners', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 3, maxLength: 10 }),
        fc.integer({ min: 1, max: 5 }), // Unsubscribe after N transitions
        async (statusSequence, unsubscribeAfter) => {
          const callback = vi.fn();
          const unsubscribe = monitor.onStatusChange(callback);

          let transitionCount = 0;
          let previousStatus = true;

          // Apply status changes
          for (const status of statusSequence) {
            mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
            await monitor.forceCheck();

            // Count actual transitions
            if (status !== previousStatus) {
              transitionCount++;
              previousStatus = status;

              // Unsubscribe after specified number of transitions
              if (transitionCount === unsubscribeAfter) {
                unsubscribe();
                callback.mockClear(); // Clear calls up to this point
              }
            }
          }

          // If we unsubscribed before all transitions, callback should not have been called after unsubscribe
          if (unsubscribeAfter < transitionCount) {
            // Calculate transitions after unsubscribe
            const transitionsAfterUnsubscribe = transitionCount - unsubscribeAfter;
            
            // Callback should not have been called for transitions after unsubscribe
            expect(callback).toHaveBeenCalledTimes(0);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that connectivity state propagates correctly
   * even with rapid status changes
   */
  it('should handle rapid status changes correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.boolean(), { minLength: 5, maxLength: 20 }),
        async (rapidChanges) => {
          const callback = vi.fn();
          const receivedStatuses: boolean[] = [];

          monitor.onStatusChange((status) => {
            receivedStatuses.push(status);
          });

          // Apply rapid changes
          for (const status of rapidChanges) {
            mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(status);
            await monitor.forceCheck();
          }

          // Calculate expected transitions
          const expectedTransitions: boolean[] = [];
          let previousStatus = true;

          for (const status of rapidChanges) {
            if (status !== previousStatus) {
              expectedTransitions.push(status);
              previousStatus = status;
            }
          }

          // Verify all transitions were captured
          expect(receivedStatuses).toEqual(expectedTransitions);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that error conditions result in offline status
   */
  it('should propagate offline status when connectivity check fails', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 5 }),
        async (errorCount) => {
          const callback = vi.fn();
          monitor.onStatusChange(callback);

          // Start online
          mockNetworkService.checkConnectivity = vi.fn().mockResolvedValue(true);
          await monitor.forceCheck();

          // Clear initial calls
          callback.mockClear();

          // Simulate connectivity check errors
          mockNetworkService.checkConnectivity = vi.fn().mockRejectedValue(
            new Error('Network check failed')
          );

          for (let i = 0; i < errorCount; i++) {
            await monitor.forceCheck();
          }

          // Should transition to offline on first error
          expect(callback).toHaveBeenCalledWith(false);
          expect(callback).toHaveBeenCalledTimes(1); // Only once, not for each error
          expect(monitor.isOnline()).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});
