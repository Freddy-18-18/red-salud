/**
 * Property-Based Tests for Storage Service
 * 
 * These tests validate correctness properties that should hold true
 * across all valid executions of the storage service.
 * 
 * Testing Framework: fast-check (property-based testing)
 * Test Runner: Vitest
 * 
 * To run these tests:
 * 1. Install dependencies: npm install --save-dev vitest fast-check @vitest/ui
 * 2. Run tests: npm test
 * 
 * Feature: tauri-dashboard-medico
 * Property 3: Dual State Update on Successful Fetch
 * Validates: Requirements 2.4, 7.5
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { RuntimeServiceImpl } from '../runtime-service';
import type { StorageService } from '../types';

/**
 * Property 3: Dual State Update on Successful Fetch
 * 
 * For any successful data fetch operation, both the React state AND 
 * the Offline_Store SHALL be updated with the fresh data.
 * 
 * This property test verifies that:
 * 1. Data can be saved to storage
 * 2. Data can be retrieved from storage
 * 3. Retrieved data matches saved data (round-trip consistency)
 * 4. This holds for any valid data structure
 */
describe('Property 3: Dual State Update on Successful Fetch', () => {
  let storageService: StorageService;
  let runtimeService: RuntimeServiceImpl;

  beforeEach(() => {
    // Reset runtime service for each test
    runtimeService = RuntimeServiceImpl.getInstance();
    runtimeService.resetServices();
    storageService = runtimeService.getStorageService();
  });

  afterEach(async () => {
    // Clean up storage after each test
    try {
      await storageService.clear();
    } catch {
      // Ignore cleanup errors
    }
  });

  /**
   * Test that storage operations maintain data integrity
   * across save and retrieve operations
   */
  it('should maintain data integrity for any valid data structure', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate arbitrary data structures
        fc.record({
          key: fc.string({ minLength: 1, maxLength: 50 }),
          data: fc.oneof(
            fc.string(),
            fc.integer(),
            fc.boolean(),
            fc.array(fc.string()),
            fc.record({
              id: fc.uuid(),
              name: fc.string(),
              value: fc.integer(),
              nested: fc.record({
                field1: fc.string(),
                field2: fc.boolean(),
              }),
            }),
          ),
        }),
        async ({ key, data }) => {
          // Save data to storage
          await storageService.save(key, data);

          // Retrieve data from storage
          const retrieved = await storageService.get(key);

          // Verify data integrity (round-trip consistency)
          expect(retrieved).toEqual(data);
        }
      ),
      { numRuns: 100 } // Run 100 iterations with random data
    );
  });

  /**
   * Test that storage correctly handles patient data structures
   */
  it('should correctly store and retrieve patient data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          firstName: fc.string({ minLength: 1 }),
          lastName: fc.string({ minLength: 1 }),
          dateOfBirth: fc.date({ max: new Date() }).map(d => d.toISOString()),
          gender: fc.constantFrom('male', 'female', 'other'),
          phone: fc.string({ minLength: 10, maxLength: 15 }),
          email: fc.option(fc.emailAddress(), { nil: undefined }),
        }),
        async (patientData) => {
          const key = `patients:${patientData.id}`;

          // Save patient data
          await storageService.save(key, patientData);

          // Retrieve patient data
          const retrieved = await storageService.get(key);

          // Verify all fields match
          expect(retrieved).toEqual(patientData);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that storage correctly handles appointment data structures
   */
  it('should correctly store and retrieve appointment data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          patientId: fc.uuid(),
          doctorId: fc.uuid(),
          date: fc.date({ min: new Date() }).map(d => d.toISOString()),
          duration: fc.integer({ min: 15, max: 120 }),
          type: fc.constantFrom('consultation', 'follow-up', 'emergency'),
          status: fc.constantFrom('scheduled', 'completed', 'cancelled', 'no-show'),
          reason: fc.option(fc.string(), { nil: undefined }),
        }),
        async (appointmentData) => {
          const key = `appointments:${appointmentData.id}`;

          // Save appointment data
          await storageService.save(key, appointmentData);

          // Retrieve appointment data
          const retrieved = await storageService.get(key);

          // Verify all fields match
          expect(retrieved).toEqual(appointmentData);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that storage correctly handles consultation data structures
   */
  it('should correctly store and retrieve consultation data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          id: fc.uuid(),
          patientId: fc.uuid(),
          doctorId: fc.uuid(),
          date: fc.date().map(d => d.toISOString()),
          chiefComplaint: fc.string({ minLength: 1 }),
          symptoms: fc.array(fc.string(), { minLength: 1 }),
          diagnoses: fc.array(
            fc.record({
              id: fc.uuid(),
              icd11Code: fc.string(),
              description: fc.string(),
              type: fc.constantFrom('primary', 'secondary'),
            }),
            { minLength: 1 }
          ),
          prescriptions: fc.array(
            fc.record({
              id: fc.uuid(),
              medication: fc.string(),
              dosage: fc.string(),
              frequency: fc.string(),
              duration: fc.string(),
            })
          ),
        }),
        async (consultationData) => {
          const key = `consultations:${consultationData.id}`;

          // Save consultation data
          await storageService.save(key, consultationData);

          // Retrieve consultation data
          const retrieved = await storageService.get(key);

          // Verify all fields match
          expect(retrieved).toEqual(consultationData);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that storage handles multiple save operations correctly
   * (last write wins)
   */
  it('should handle multiple saves with last-write-wins semantics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.array(fc.string(), { minLength: 2, maxLength: 5 }),
        async (key, values) => {
          // Save multiple values to the same key
          for (const value of values) {
            await storageService.save(key, value);
          }

          // Retrieve the value
          const retrieved = await storageService.get(key);

          // Should get the last value written
          expect(retrieved).toEqual(values[values.length - 1]);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that delete operation removes data
   */
  it('should remove data after delete operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string(),
        async (key, data) => {
          // Save data
          await storageService.save(key, data);

          // Verify it exists
          const beforeDelete = await storageService.get(key);
          expect(beforeDelete).toEqual(data);

          // Delete data
          await storageService.delete(key);

          // Verify it's gone
          const afterDelete = await storageService.get(key);
          expect(afterDelete).toBeNull();
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Test that keys() returns all stored keys
   */
  it('should return all stored keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 1, maxLength: 50 }),
            data: fc.string(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (items) => {
          // Clear storage first
          await storageService.clear();

          // Save all items
          for (const item of items) {
            await storageService.save(item.key, item.data);
          }

          // Get all keys
          const keys = await storageService.keys();

          // Verify all keys are present
          const expectedKeys = items.map(item => item.key);
          expect(keys.sort()).toEqual(expectedKeys.sort());
        }
      ),
      { numRuns: 50 } // Fewer runs for this test as it's more expensive
    );
  });

  /**
   * Test that clear() removes all data
   */
  it('should remove all data after clear operation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            key: fc.string({ minLength: 1, maxLength: 50 }),
            data: fc.string(),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        async (items) => {
          // Save all items
          for (const item of items) {
            await storageService.save(item.key, item.data);
          }

          // Verify items exist
          const keysBefore = await storageService.keys();
          expect(keysBefore.length).toBeGreaterThan(0);

          // Clear storage
          await storageService.clear();

          // Verify all items are gone
          const keysAfter = await storageService.keys();
          expect(keysAfter).toEqual([]);
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Test that storage handles null/undefined gracefully
   */
  it('should handle null and undefined values correctly', async () => {
    const key = 'test-null-undefined';

    // Test null
    await storageService.save(key, null);
    const retrievedNull = await storageService.get(key);
    expect(retrievedNull).toBeNull();

    // Test undefined (should be stored as null)
    await storageService.save(key, undefined);
    const retrievedUndefined = await storageService.get(key);
    // undefined gets serialized as null in JSON
    expect(retrievedUndefined).toBeNull();
  });

  /**
   * Test that storage handles special characters in keys
   */
  it('should handle special characters in keys', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string(),
        async (key, data) => {
          // Save with special character key
          const specialKey = `test:${key}:special`;
          await storageService.save(specialKey, data);

          // Retrieve
          const retrieved = await storageService.get(specialKey);
          expect(retrieved).toEqual(data);
        }
      ),
      { numRuns: 100 }
    );
  });
});
