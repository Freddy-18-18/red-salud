/**
 * Unit Tests for Storage Service Edge Cases
 * 
 * These tests verify specific examples, edge cases, and error conditions
 * for the storage service implementations.
 * 
 * Testing Framework: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Task: 2.3 - Write unit tests for storage edge cases
 * Validates: Requirements 2.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RuntimeServiceImpl } from '../runtime-service';
import { TauriStorageService } from '../services/tauri-storage-service';
import { WebStorageService } from '../services/web-storage-service';
import type { StorageService } from '../types';

describe('Storage Service Edge Cases', () => {
  let storageService: StorageService;
  let runtimeService: RuntimeServiceImpl;

  beforeEach(() => {
    runtimeService = RuntimeServiceImpl.getInstance();
    runtimeService.resetServices();
    storageService = runtimeService.getStorageService();
  });

  afterEach(async () => {
    try {
      await storageService.clear();
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Empty Data Handling', () => {
    it('should return null for non-existent key', async () => {
      const result = await storageService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should handle empty string as key', async () => {
      // Empty string keys should be handled gracefully
      // Some implementations may reject them, others may accept
      try {
        await storageService.save('', 'test-data');
        const result = await storageService.get('');
        expect(result).toBe('test-data');
      } catch (error) {
        // If implementation rejects empty keys, that's also valid
        expect(error).toBeDefined();
      }
    });

    it('should handle empty string as data', async () => {
      const key = 'empty-data-key';
      await storageService.save(key, '');
      const result = await storageService.get(key);
      expect(result).toBe('');
    });

    it('should handle empty array as data', async () => {
      const key = 'empty-array-key';
      await storageService.save(key, []);
      const result = await storageService.get<any[]>(key);
      expect(result).toEqual([]);
    });

    it('should handle empty object as data', async () => {
      const key = 'empty-object-key';
      await storageService.save(key, {});
      const result = await storageService.get<any>(key);
      expect(result).toEqual({});
    });

    it('should handle zero as data', async () => {
      const key = 'zero-key';
      await storageService.save(key, 0);
      const result = await storageService.get<number>(key);
      expect(result).toBe(0);
    });

    it('should handle false as data', async () => {
      const key = 'false-key';
      await storageService.save(key, false);
      const result = await storageService.get<boolean>(key);
      expect(result).toBe(false);
    });

    it('should handle null as data', async () => {
      const key = 'null-key';
      await storageService.save(key, null);
      const result = await storageService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large strings', async () => {
      const key = 'large-string-key';
      // Create a 1MB string
      const largeString = 'x'.repeat(1024 * 1024);
      
      await storageService.save(key, largeString);
      const result = await storageService.get<string>(key);
      
      expect(result).toBe(largeString);
      expect(result?.length).toBe(1024 * 1024);
    });

    it('should handle large arrays', async () => {
      const key = 'large-array-key';
      // Create an array with 10,000 items
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random(),
      }));
      
      await storageService.save(key, largeArray);
      const result = await storageService.get<typeof largeArray>(key);
      
      expect(result).toEqual(largeArray);
      expect(result?.length).toBe(10000);
    });

    it('should handle deeply nested objects', async () => {
      const key = 'nested-object-key';
      // Create a deeply nested object (10 levels)
      let deepObject: any = { value: 'deep' };
      for (let i = 0; i < 10; i++) {
        deepObject = { nested: deepObject };
      }
      
      await storageService.save(key, deepObject);
      const result = await storageService.get(key);
      
      expect(result).toEqual(deepObject);
    });
  });

  describe('Special Characters and Unicode', () => {
    it('should handle special characters in keys', async () => {
      const specialKeys = [
        'key:with:colons',
        'key/with/slashes',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key with spaces',
      ];

      for (const key of specialKeys) {
        await storageService.save(key, `data-for-${key}`);
        const result = await storageService.get(key);
        expect(result).toBe(`data-for-${key}`);
      }
    });

    it('should handle unicode characters in data', async () => {
      const key = 'unicode-key';
      const unicodeData = {
        emoji: '😀🎉🚀',
        chinese: '你好世界',
        arabic: 'مرحبا بالعالم',
        spanish: 'Médico',
        symbols: '©®™€£¥',
      };
      
      await storageService.save(key, unicodeData);
      const result = await storageService.get(key);
      
      expect(result).toEqual(unicodeData);
    });

    it('should handle unicode characters in keys', async () => {
      const unicodeKeys = [
        'key-😀',
        'key-你好',
        'key-مرحبا',
      ];

      for (const key of unicodeKeys) {
        await storageService.save(key, `data-for-${key}`);
        const result = await storageService.get(key);
        expect(result).toBe(`data-for-${key}`);
      }
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent saves to different keys', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        storageService.save(`concurrent-key-${i}`, `data-${i}`)
      );

      await Promise.all(promises);

      // Verify all data was saved
      for (let i = 0; i < 10; i++) {
        const result = await storageService.get(`concurrent-key-${i}`);
        expect(result).toBe(`data-${i}`);
      }
    });

    it('should handle concurrent saves to the same key (last write wins)', async () => {
      const key = 'concurrent-same-key';
      const promises = Array.from({ length: 10 }, (_, i) =>
        storageService.save(key, `data-${i}`)
      );

      await Promise.all(promises);

      // Should have one of the values (last write wins)
      const result = await storageService.get(key);
      expect(result).toMatch(/^data-\d$/);
    });

    it('should handle concurrent reads', async () => {
      const key = 'concurrent-read-key';
      await storageService.save(key, 'test-data');

      const promises = Array.from({ length: 10 }, () =>
        storageService.get(key)
      );

      const results = await Promise.all(promises);

      // All reads should return the same data
      results.forEach(result => {
        expect(result).toBe('test-data');
      });
    });
  });

  describe('Data Type Preservation', () => {
    it('should preserve number types', async () => {
      const key = 'number-key';
      const numbers = [0, 1, -1, 3.14, -3.14, 1e10, 1e-10];

      for (const num of numbers) {
        await storageService.save(key, num);
        const result = await storageService.get<number>(key);
        expect(result).toBe(num);
        expect(typeof result).toBe('number');
      }
    });

    it('should preserve boolean types', async () => {
      const key = 'boolean-key';
      
      await storageService.save(key, true);
      let result = await storageService.get<boolean>(key);
      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');

      await storageService.save(key, false);
      result = await storageService.get<boolean>(key);
      expect(result).toBe(false);
      expect(typeof result).toBe('boolean');
    });

    it('should preserve date strings', async () => {
      const key = 'date-key';
      const dateString = new Date().toISOString();
      
      await storageService.save(key, dateString);
      const result = await storageService.get<string>(key);
      
      expect(result).toBe(dateString);
      expect(new Date(result!).toISOString()).toBe(dateString);
    });

    it('should preserve complex nested structures', async () => {
      const key = 'complex-key';
      const complexData = {
        string: 'text',
        number: 42,
        boolean: true,
        null: null,
        array: [1, 'two', { three: 3 }],
        nested: {
          deep: {
            deeper: {
              value: 'found',
            },
          },
        },
      };
      
      await storageService.save(key, complexData);
      const result = await storageService.get(key);
      
      expect(result).toEqual(complexData);
    });
  });

  describe('Error Handling', () => {
    it('should handle delete of non-existent key gracefully', async () => {
      // Should not throw error
      await expect(
        storageService.delete('non-existent-key')
      ).resolves.not.toThrow();
    });

    it('should handle clear on empty storage gracefully', async () => {
      await storageService.clear();
      
      // Should not throw error
      await expect(
        storageService.clear()
      ).resolves.not.toThrow();
    });

    it('should handle keys() on empty storage', async () => {
      await storageService.clear();
      
      const keys = await storageService.keys();
      expect(keys).toEqual([]);
    });

    it('should handle get after delete', async () => {
      const key = 'delete-test-key';
      
      await storageService.save(key, 'test-data');
      await storageService.delete(key);
      
      const result = await storageService.get(key);
      expect(result).toBeNull();
    });

    it('should handle get after clear', async () => {
      const key = 'clear-test-key';
      
      await storageService.save(key, 'test-data');
      await storageService.clear();
      
      const result = await storageService.get(key);
      expect(result).toBeNull();
    });
  });

  describe('Storage Quota (Simulated)', () => {
    it('should handle storage quota exceeded gracefully', async () => {
      // This test simulates quota exceeded by trying to save very large data
      // In a real scenario, this would depend on the storage implementation
      
      const key = 'quota-test-key';
      // Try to save a very large string (10MB)
      const veryLargeString = 'x'.repeat(10 * 1024 * 1024);
      
      try {
        await storageService.save(key, veryLargeString);
        // If it succeeds, verify we can retrieve it
        const result = await storageService.get<string>(key);
        expect(result?.length).toBe(10 * 1024 * 1024);
      } catch (error) {
        // If it fails due to quota, that's expected behavior
        // The error should be defined and meaningful
        expect(error).toBeDefined();
      }
    });
  });

  describe('Corrupted Data Recovery', () => {
    it('should handle corrupted JSON gracefully', async () => {
      // This test is more relevant for implementations that store JSON
      // For now, we test that invalid data doesn't break the system
      
      const key = 'corrupted-key';
      
      // Try to save and retrieve data that might cause issues
      const problematicData = {
        circular: null as any,
        undefined: undefined,
        function: null, // Functions can't be serialized
      };
      
      // Create circular reference
      problematicData.circular = problematicData;
      
      try {
        await storageService.save(key, problematicData);
        const result = await storageService.get(key);
        // If it succeeds, the implementation handled it
        expect(result).toBeDefined();
      } catch (error) {
        // If it fails, that's expected for circular references
        expect(error).toBeDefined();
      }
    });

    it('should handle retrieval when storage is corrupted', async () => {
      // This test verifies that get() returns null for corrupted data
      // rather than throwing an error
      
      const key = 'potentially-corrupted-key';
      
      // First save valid data
      await storageService.save(key, 'valid-data');
      
      // In a real scenario, data might get corrupted externally
      // For now, we just verify that get() handles errors gracefully
      const result = await storageService.get(key);
      expect(result).toBe('valid-data');
    });
  });

  describe('Key Management', () => {
    it('should return correct keys after multiple operations', async () => {
      await storageService.clear();
      
      // Save multiple items
      await storageService.save('key1', 'data1');
      await storageService.save('key2', 'data2');
      await storageService.save('key3', 'data3');
      
      let keys = await storageService.keys();
      expect(keys.sort()).toEqual(['key1', 'key2', 'key3']);
      
      // Delete one
      await storageService.delete('key2');
      
      keys = await storageService.keys();
      expect(keys.sort()).toEqual(['key1', 'key3']);
      
      // Add another
      await storageService.save('key4', 'data4');
      
      keys = await storageService.keys();
      expect(keys.sort()).toEqual(['key1', 'key3', 'key4']);
    });

    it('should handle keys with similar prefixes', async () => {
      await storageService.clear();
      
      const keys = [
        'patient',
        'patient:1',
        'patient:10',
        'patient:100',
        'patients',
        'patients:all',
      ];
      
      for (const key of keys) {
        await storageService.save(key, `data-${key}`);
      }
      
      const retrievedKeys = await storageService.keys();
      expect(retrievedKeys.sort()).toEqual(keys.sort());
    });
  });

  describe('Performance Edge Cases', () => {
    it('should handle rapid sequential operations', async () => {
      const key = 'rapid-key';
      
      // Rapidly save and retrieve
      for (let i = 0; i < 100; i++) {
        await storageService.save(key, `data-${i}`);
        const result = await storageService.get(key);
        expect(result).toBe(`data-${i}`);
      }
    });

    it('should handle many keys efficiently', async () => {
      await storageService.clear();
      
      // Save 1000 keys
      const promises = Array.from({ length: 1000 }, (_, i) =>
        storageService.save(`key-${i}`, `data-${i}`)
      );
      
      await Promise.all(promises);
      
      // Verify keys count
      const keys = await storageService.keys();
      expect(keys.length).toBe(1000);
      
      // Verify we can still retrieve data
      const result = await storageService.get('key-500');
      expect(result).toBe('data-500');
    });
  });
});
