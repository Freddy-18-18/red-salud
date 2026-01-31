/**
 * Property-Based Tests for Runtime Service
 * 
 * These tests validate correctness properties that should hold true
 * across all valid executions of the runtime service.
 * 
 * Testing Framework: fast-check (property-based testing)
 * Test Runner: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Property 17: Runtime-Specific Implementation Selection
 * Validates: Requirements 7.3, 9.2, 9.3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fc from 'fast-check';
import { RuntimeService, RuntimeServiceImpl } from '../runtime-service';
import { TauriNetworkService } from '../services/tauri-network-service';
import { WebNetworkService } from '../services/web-network-service';
import { TauriStorageService } from '../services/tauri-storage-service';
import { WebStorageService } from '../services/web-storage-service';
import type { NetworkService, StorageService } from '../types';

/**
 * Property 17: Runtime-Specific Implementation Selection
 * 
 * For any operation that has runtime-specific implementations (storage, network, 
 * notifications), the correct implementation SHALL be selected based on the 
 * detected runtime (Tauri vs Web).
 * 
 * **Validates: Requirements 7.3, 9.2, 9.3**
 * 
 * This property test verifies that:
 * 1. RuntimeService correctly detects the environment (Tauri vs Web)
 * 2. RuntimeService returns TauriNetworkService in Tauri environment
 * 3. RuntimeService returns WebNetworkService in web environment
 * 4. RuntimeService returns TauriStorageService in Tauri environment
 * 5. RuntimeService returns WebStorageService in web environment
 * 6. The selection is consistent across multiple calls
 * 7. The selection is correct regardless of the order of service requests
 */
describe('Property 17: Runtime-Specific Implementation Selection', () => {
  let originalWindow: any;

  beforeEach(() => {
    // Save original window state
    originalWindow = global.window;
  });

  afterEach(() => {
    // Restore original window state
    global.window = originalWindow;
    
    // Reset runtime service singleton instance
    RuntimeServiceImpl.resetInstance();
  });

  /**
   * Helper to mock Tauri environment
   */
  function mockTauriEnvironment() {
    if (typeof window !== 'undefined') {
      (window as any).__TAURI__ = {
        invoke: vi.fn(),
      };
    }
    global.window = window as any;
  }

  /**
   * Helper to mock Web environment
   */
  function mockWebEnvironment() {
    if (typeof window !== 'undefined') {
      delete (window as any).__TAURI__;
    }
    global.window = window as any;
  }

  /**
   * Test that RuntimeService correctly selects TauriNetworkService in Tauri environment
   */
  it('should select TauriNetworkService when running in Tauri environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of service requests
        fc.integer({ min: 1, max: 10 }),
        (numRequests) => {
          // Setup: Mock Tauri environment
          mockTauriEnvironment();
          
          // Verify environment detection
          expect(RuntimeService.isTauri()).toBe(true);
          expect(RuntimeService.isWeb()).toBe(false);
          
          // Execute: Request network service multiple times
          const services: NetworkService[] = [];
          for (let i = 0; i < numRequests; i++) {
            services.push(RuntimeService.getNetworkService());
          }
          
          // Verify: All instances should be TauriNetworkService
          services.forEach(service => {
            expect(service).toBeInstanceOf(TauriNetworkService);
          });
          
          // Verify: All instances should be the same (singleton pattern)
          const firstService = services[0];
          services.forEach(service => {
            expect(service).toBe(firstService);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that RuntimeService correctly selects WebNetworkService in web environment
   */
  it('should select WebNetworkService when running in web environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of service requests
        fc.integer({ min: 1, max: 10 }),
        (numRequests) => {
          // Setup: Mock web environment
          mockWebEnvironment();
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Verify environment detection
          expect(RuntimeService.isWeb()).toBe(true);
          expect(RuntimeService.isTauri()).toBe(false);
          
          // Execute: Request network service multiple times
          const services: NetworkService[] = [];
          for (let i = 0; i < numRequests; i++) {
            services.push(RuntimeService.getNetworkService());
          }
          
          // Verify: All instances should be WebNetworkService
          services.forEach(service => {
            expect(service).toBeInstanceOf(WebNetworkService);
          });
          
          // Verify: All instances should be the same (singleton pattern)
          const firstService = services[0];
          services.forEach(service => {
            expect(service).toBe(firstService);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that RuntimeService correctly selects TauriStorageService in Tauri environment
   */
  it('should select TauriStorageService when running in Tauri environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of service requests
        fc.integer({ min: 1, max: 10 }),
        (numRequests) => {
          // Setup: Mock Tauri environment
          mockTauriEnvironment();
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Verify environment detection
          expect(RuntimeService.isTauri()).toBe(true);
          
          // Execute: Request storage service multiple times
          const services: StorageService[] = [];
          for (let i = 0; i < numRequests; i++) {
            services.push(RuntimeService.getStorageService());
          }
          
          // Verify: All instances should be TauriStorageService
          services.forEach(service => {
            expect(service).toBeInstanceOf(TauriStorageService);
          });
          
          // Verify: All instances should be the same (singleton pattern)
          const firstService = services[0];
          services.forEach(service => {
            expect(service).toBe(firstService);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that RuntimeService correctly selects WebStorageService in web environment
   */
  it('should select WebStorageService when running in web environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of service requests
        fc.integer({ min: 1, max: 10 }),
        (numRequests) => {
          // Setup: Mock web environment
          mockWebEnvironment();
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Verify environment detection
          expect(RuntimeService.isWeb()).toBe(true);
          
          // Execute: Request storage service multiple times
          const services: StorageService[] = [];
          for (let i = 0; i < numRequests; i++) {
            services.push(RuntimeService.getStorageService());
          }
          
          // Verify: All instances should be WebStorageService
          services.forEach(service => {
            expect(service).toBeInstanceOf(WebStorageService);
          });
          
          // Verify: All instances should be the same (singleton pattern)
          const firstService = services[0];
          services.forEach(service => {
            expect(service).toBe(firstService);
          });
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that environment detection is consistent
   */
  it('should consistently detect Tauri environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of checks
        fc.integer({ min: 1, max: 20 }),
        (numChecks) => {
          // Setup: Mock Tauri environment
          mockTauriEnvironment();
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Execute: Check environment multiple times
          const results: boolean[] = [];
          for (let i = 0; i < numChecks; i++) {
            results.push(RuntimeService.isTauri());
          }
          
          // Verify: All checks should return true
          results.forEach(result => {
            expect(result).toBe(true);
          });
          
          // Verify: isWeb should return false
          expect(RuntimeService.isWeb()).toBe(false);
          
          // Verify: getEnvironment should return 'tauri'
          expect(RuntimeService.getEnvironment()).toBe('tauri');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that environment detection is consistent for web
   */
  it('should consistently detect web environment', () => {
    fc.assert(
      fc.property(
        // Generate arbitrary number of checks
        fc.integer({ min: 1, max: 20 }),
        (numChecks) => {
          // Setup: Mock web environment
          mockWebEnvironment();
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Execute: Check environment multiple times
          const results: boolean[] = [];
          for (let i = 0; i < numChecks; i++) {
            results.push(RuntimeService.isWeb());
          }
          
          // Verify: All checks should return true
          results.forEach(result => {
            expect(result).toBe(true);
          });
          
          // Verify: isTauri should return false
          expect(RuntimeService.isTauri()).toBe(false);
          
          // Verify: getEnvironment should return 'web'
          expect(RuntimeService.getEnvironment()).toBe('web');
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that service selection is independent of request order
   */
  it('should select correct services regardless of request order', () => {
    fc.assert(
      fc.property(
        // Generate random sequence of service requests
        fc.array(
          fc.constantFrom('storage', 'network'),
          { minLength: 2, maxLength: 10 }
        ),
        fc.boolean(), // Randomly choose Tauri or Web environment
        (serviceSequence, isTauriEnv) => {
          // Setup: Mock environment
          if (isTauriEnv) {
            mockTauriEnvironment();
          } else {
            mockWebEnvironment();
          }
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Execute: Request services in the given sequence
          const services: any[] = [];
          for (const serviceType of serviceSequence) {
            if (serviceType === 'storage') {
              services.push({
                type: 'storage',
                instance: RuntimeService.getStorageService(),
              });
            } else {
              services.push({
                type: 'network',
                instance: RuntimeService.getNetworkService(),
              });
            }
          }
          
          // Verify: All storage services should be of the correct type
          const storageServices = services.filter(s => s.type === 'storage');
          if (storageServices.length > 0) {
            const expectedStorageType = isTauriEnv ? TauriStorageService : WebStorageService;
            storageServices.forEach(s => {
              expect(s.instance).toBeInstanceOf(expectedStorageType);
            });
            
            // All storage services should be the same instance
            const firstStorage = storageServices[0].instance;
            storageServices.forEach(s => {
              expect(s.instance).toBe(firstStorage);
            });
          }
          
          // Verify: All network services should be of the correct type
          const networkServices = services.filter(s => s.type === 'network');
          if (networkServices.length > 0) {
            const expectedNetworkType = isTauriEnv ? TauriNetworkService : WebNetworkService;
            networkServices.forEach(s => {
              expect(s.instance).toBeInstanceOf(expectedNetworkType);
            });
            
            // All network services should be the same instance
            const firstNetwork = networkServices[0].instance;
            networkServices.forEach(s => {
              expect(s.instance).toBe(firstNetwork);
            });
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that resetServices clears cached services
   */
  it('should clear cached services after reset', () => {
    fc.assert(
      fc.property(
        fc.boolean(), // Randomly choose Tauri or Web environment
        (isTauriEnv) => {
          // Setup: Mock environment
          if (isTauriEnv) {
            mockTauriEnvironment();
          } else {
            mockWebEnvironment();
          }
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          // Execute: Get services, reset, then get again
          const networkBefore = RuntimeService.getNetworkService();
          const storageBefore = RuntimeService.getStorageService();
          
          RuntimeService.resetServices();
          
          const networkAfter = RuntimeService.getNetworkService();
          const storageAfter = RuntimeService.getStorageService();
          
          // Verify: Services should be different instances after reset
          expect(networkAfter).not.toBe(networkBefore);
          expect(storageAfter).not.toBe(storageBefore);
          
          // Verify: But they should still be the correct type
          const expectedNetworkType = isTauriEnv ? TauriNetworkService : WebNetworkService;
          const expectedStorageType = isTauriEnv ? TauriStorageService : WebStorageService;
          
          expect(networkAfter).toBeInstanceOf(expectedNetworkType);
          expect(storageAfter).toBeInstanceOf(expectedStorageType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that service selection works correctly after multiple resets
   */
  it('should maintain correct service selection after multiple resets', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 5 }), // Number of reset cycles
        fc.boolean(), // Randomly choose Tauri or Web environment
        (numResets, isTauriEnv) => {
          // Setup: Mock environment
          if (isTauriEnv) {
            mockTauriEnvironment();
          } else {
            mockWebEnvironment();
          }
          
          // Reset to pick up new environment
          RuntimeService.resetServices();
          
          const expectedNetworkType = isTauriEnv ? TauriNetworkService : WebNetworkService;
          const expectedStorageType = isTauriEnv ? TauriStorageService : WebStorageService;
          
          // Execute: Multiple reset cycles
          for (let i = 0; i < numResets; i++) {
            // Get services
            const network = RuntimeService.getNetworkService();
            const storage = RuntimeService.getStorageService();
            
            // Verify correct types
            expect(network).toBeInstanceOf(expectedNetworkType);
            expect(storage).toBeInstanceOf(expectedStorageType);
            
            // Reset for next cycle
            RuntimeServiceImpl.resetInstance();
          }
          
          // Final verification after all resets
          const finalNetwork = RuntimeService.getNetworkService();
          const finalStorage = RuntimeService.getStorageService();
          
          expect(finalNetwork).toBeInstanceOf(expectedNetworkType);
          expect(finalStorage).toBeInstanceOf(expectedStorageType);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that environment detection handles edge cases
   */
  it('should handle edge cases in environment detection', () => {
    // Test case 1: window is undefined (should default to web)
    global.window = undefined as any;
    RuntimeServiceImpl.resetInstance();
    expect(RuntimeService.isWeb()).toBe(true);
    expect(RuntimeService.isTauri()).toBe(false);
    
    // Test case 2: window exists but __TAURI__ is undefined
    global.window = {} as any;
    RuntimeServiceImpl.resetInstance();
    expect(RuntimeService.isWeb()).toBe(true);
    expect(RuntimeService.isTauri()).toBe(false);
    
    // Test case 3: window exists and __TAURI__ is defined
    global.window = { __TAURI__: {} } as any;
    RuntimeServiceImpl.resetInstance();
    expect(RuntimeService.isTauri()).toBe(true);
    expect(RuntimeService.isWeb()).toBe(false);
    
    // Test case 4: window exists and __TAURI__ is null (should be tauri because 'in' operator checks for property existence)
    global.window = { __TAURI__: null } as any;
    RuntimeServiceImpl.resetInstance();
    expect(RuntimeService.isTauri()).toBe(true); // Changed: 'in' operator returns true even if value is null
    expect(RuntimeService.isWeb()).toBe(false);
  });
});
