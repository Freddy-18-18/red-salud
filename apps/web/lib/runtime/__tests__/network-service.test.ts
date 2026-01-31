/**
 * Unit Tests for Network Service Error Handling
 * 
 * These tests verify specific examples, edge cases, and error conditions
 * for the network service implementations.
 * 
 * Testing Framework: Vitest
 * 
 * Feature: tauri-dashboard-medico
 * Task: 3.3 - Write unit tests for network error handling
 * Validates: Requirements 7.6
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { WebNetworkService, NetworkError, NetworkErrorType } from '../services/web-network-service';
import type { NetworkService } from '../types';

describe('Network Service Error Handling', () => {
  let networkService: NetworkService;

  beforeEach(() => {
    // Use WebNetworkService for testing as it's easier to mock
    networkService = new WebNetworkService();
    
    // Mock fetch globally
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Connection Timeout', () => {
    it('should timeout after specified duration', async () => {
      // Mock a slow response
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 10000))
      );

      await expect(
        networkService.get('/api/test', { timeout: 100 })
      ).rejects.toThrow('Request timed out');
    });

    it('should not timeout if response is fast enough', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const result = await networkService.get('/api/test', { timeout: 1000 });
      expect(result).toEqual({ data: 'test' });
    });

    it('should use default timeout if not specified', async () => {
      // Mock a response that takes 35 seconds (longer than default 30s)
      (global.fetch as any).mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 35000))
      );

      // Should timeout with default timeout
      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow();
    });
  });

  describe('Server Errors (5xx)', () => {
    it('should handle 500 Internal Server Error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' }),
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Server error: 500');
    });

    it('should handle 503 Service Unavailable', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 503,
        json: async () => ({ error: 'Service Unavailable' }),
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Server error: 503');
    });

    it('should retry on 500 errors', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Internal Server Error' }),
        });
      });

      await expect(
        networkService.get('/api/test', { retries: 3 })
      ).rejects.toThrow();

      // Should have tried 3 times
      expect(callCount).toBe(3);
    });

    it('should succeed if retry succeeds', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount < 3) {
          return Promise.resolve({
            ok: false,
            status: 500,
            json: async () => ({ error: 'Internal Server Error' }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: 'success' }),
        });
      });

      const result = await networkService.get('/api/test', { retries: 3 });
      expect(result).toEqual({ data: 'success' });
      expect(callCount).toBe(3);
    });
  });

  describe('Client Errors (4xx)', () => {
    it('should handle 400 Bad Request', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Bad Request' }),
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Client error: 400');
    });

    it('should handle 401 Unauthorized', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Authentication failed');
    });

    it('should handle 404 Not Found', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not Found' }),
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Client error: 404');
    });

    it('should NOT retry on 401 errors', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 401,
          json: async () => ({ error: 'Unauthorized' }),
        });
      });

      await expect(
        networkService.get('/api/test', { retries: 3 })
      ).rejects.toThrow('Authentication failed');

      // Should NOT retry on auth errors
      expect(callCount).toBe(1);
    });

    it('should NOT retry on 400 errors', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.resolve({
          ok: false,
          status: 400,
          json: async () => ({ error: 'Bad Request' }),
        });
      });

      await expect(
        networkService.get('/api/test', { retries: 3 })
      ).rejects.toThrow();

      // Should NOT retry on client errors
      expect(callCount).toBe(1);
    });
  });

  describe('Network Connection Errors', () => {
    it('should handle network failure', async () => {
      (global.fetch as any).mockRejectedValue(
        new TypeError('Failed to fetch')
      );

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow('Connection failed');
    });

    it('should retry on network failures', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        return Promise.reject(new TypeError('Failed to fetch'));
      });

      await expect(
        networkService.get('/api/test', { retries: 3 })
      ).rejects.toThrow();

      // Should have tried 3 times
      expect(callCount).toBe(3);
    });

    it('should succeed if network recovers', async () => {
      let callCount = 0;
      (global.fetch as any).mockImplementation(() => {
        callCount++;
        if (callCount < 2) {
          return Promise.reject(new TypeError('Failed to fetch'));
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: 'success' }),
        });
      });

      const result = await networkService.get('/api/test', { retries: 3 });
      expect(result).toEqual({ data: 'success' });
      expect(callCount).toBe(2);
    });
  });

  describe('Retry with Exponential Backoff', () => {
    it('should wait with exponential backoff between retries', async () => {
      const delays: number[] = [];
      let lastTime = Date.now();

      (global.fetch as any).mockImplementation(() => {
        const now = Date.now();
        if (delays.length > 0) {
          delays.push(now - lastTime);
        }
        lastTime = now;
        return Promise.resolve({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server Error' }),
        });
      });

      await expect(
        networkService.get('/api/test', { retries: 3 })
      ).rejects.toThrow();

      // Should have 2 delays (between 3 attempts)
      expect(delays.length).toBe(2);
      
      // Second delay should be roughly 2x the first (exponential backoff)
      // Allow some tolerance for timing
      expect(delays[1]).toBeGreaterThan(delays[0] * 1.5);
    });
  });

  describe('HTTP Methods', () => {
    it('should handle GET requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'get-result' }),
      });

      const result = await networkService.get('/api/test');
      expect(result).toEqual({ data: 'get-result' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should handle POST requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'post-result' }),
      });

      const body = { name: 'test' };
      const result = await networkService.post('/api/test', body);
      
      expect(result).toEqual({ data: 'post-result' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle PATCH requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'patch-result' }),
      });

      const body = { name: 'updated' };
      const result = await networkService.patch('/api/test', body);
      
      expect(result).toEqual({ data: 'patch-result' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(body),
        })
      );
    });

    it('should handle DELETE requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'delete-result' }),
      });

      const result = await networkService.delete('/api/test');
      
      expect(result).toEqual({ data: 'delete-result' });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('Request Headers', () => {
    it('should include custom headers', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await networkService.get('/api/test', {
        headers: {
          'Authorization': 'Bearer token123',
          'X-Custom-Header': 'custom-value',
        },
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'custom-value',
          }),
        })
      );
    });

    it('should include Content-Type header by default', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await networkService.post('/api/test', { data: 'test' });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });
  });

  describe('Connectivity Check', () => {
    it('should return false when navigator.onLine is false', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      const isOnline = await networkService.checkConnectivity();
      expect(isOnline).toBe(false);
    });

    it('should return true when ping succeeds', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      (global.fetch as any).mockResolvedValue({
        ok: true,
      });

      const isOnline = await networkService.checkConnectivity();
      expect(isOnline).toBe(true);
    });

    it('should return false when ping fails', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });

      (global.fetch as any).mockRejectedValue(new Error('Network error'));

      const isOnline = await networkService.checkConnectivity();
      expect(isOnline).toBe(false);
    });
  });

  describe('URL Handling', () => {
    it('should handle relative URLs', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await networkService.get('/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/test'),
        expect.any(Object)
      );
    });

    it('should handle absolute URLs', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      await networkService.get('https://example.com/api/test');

      expect(global.fetch).toHaveBeenCalledWith(
        'https://example.com/api/test',
        expect.any(Object)
      );
    });
  });

  describe('Error Information', () => {
    it('should include status code in error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not Found' }),
      });

      try {
        await networkService.get('/api/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        expect((error as NetworkError).statusCode).toBe(404);
      }
    });

    it('should include error type in error', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server Error' }),
      });

      try {
        await networkService.get('/api/test');
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeInstanceOf(NetworkError);
        expect((error as NetworkError).type).toBe(NetworkErrorType.SERVER_ERROR);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty response body', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => null,
      });

      const result = await networkService.get('/api/test');
      expect(result).toBeNull();
    });

    it('should handle malformed JSON response', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      await expect(
        networkService.get('/api/test')
      ).rejects.toThrow();
    });

    it('should handle very large response', async () => {
      const largeData = {
        items: Array.from({ length: 10000 }, (_, i) => ({
          id: i,
          name: `Item ${i}`,
          data: 'x'.repeat(1000),
        })),
      };

      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => largeData,
      });

      const result = await networkService.get('/api/test');
      expect(result).toEqual(largeData);
    });

    it('should handle concurrent requests', async () => {
      (global.fetch as any).mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'test' }),
      });

      const promises = Array.from({ length: 10 }, (_, i) =>
        networkService.get(`/api/test/${i}`)
      );

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toEqual({ data: 'test' });
      });
    });
  });
});
