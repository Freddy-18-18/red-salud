/**
 * Tauri Network Service
 * 
 * Network service implementation for Tauri (desktop) environment.
 * Uses Rust commands for network operations with offline support.
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Network error detection and handling
 * - Timeout support
 * 
 * Validates: Requirements 7.3, 9.2, 9.3
 */

import { invoke } from '@tauri-apps/api/core';
import type { NetworkService, RequestOptions } from '../types';

/**
 * Network error types for better error handling
 */
export enum NetworkErrorType {
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}

export class NetworkError extends Error {
  constructor(
    message: string,
    public type: NetworkErrorType,
    public statusCode?: number,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TauriNetworkService implements NetworkService {
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  /**
   * Sleep for a specified duration
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate exponential backoff delay
   */
  private getRetryDelay(attempt: number): number {
    return this.INITIAL_RETRY_DELAY * Math.pow(2, attempt);
  }

  /**
   * Determine if an error is retryable
   */
  private isRetryableError(error: NetworkError): boolean {
    // Retry on timeout, connection failures, and server errors (5xx)
    return (
      error.type === NetworkErrorType.TIMEOUT ||
      error.type === NetworkErrorType.CONNECTION_FAILED ||
      (error.type === NetworkErrorType.SERVER_ERROR && 
       error.statusCode !== undefined && 
       error.statusCode >= 500)
    );
  }

  /**
   * Parse error from Rust command invocation
   */
  private parseError(error: unknown): NetworkError {
    const errorStr = String(error);
    
    // Check for timeout
    if (errorStr.includes('timeout') || errorStr.includes('timed out')) {
      return new NetworkError(
        'Request timed out',
        NetworkErrorType.TIMEOUT,
        undefined,
        error
      );
    }
    
    // Check for connection errors
    if (
      errorStr.includes('connection') ||
      errorStr.includes('network') ||
      errorStr.includes('offline')
    ) {
      return new NetworkError(
        'Connection failed',
        NetworkErrorType.CONNECTION_FAILED,
        undefined,
        error
      );
    }
    
    // Check for authentication errors
    if (errorStr.includes('401') || errorStr.includes('unauthorized')) {
      return new NetworkError(
        'Authentication failed',
        NetworkErrorType.AUTHENTICATION_ERROR,
        401,
        error
      );
    }
    
    // Check for server errors
    const statusMatch = errorStr.match(/(\d{3})/);
    if (statusMatch) {
      const statusCode = parseInt(statusMatch[1], 10);
      if (statusCode >= 500) {
        return new NetworkError(
          `Server error: ${statusCode}`,
          NetworkErrorType.SERVER_ERROR,
          statusCode,
          error
        );
      }
    }
    
    return new NetworkError(
      'Unknown network error',
      NetworkErrorType.UNKNOWN,
      undefined,
      error
    );
  }

  /**
   * Execute a request with retry logic
   */
  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    options?: RequestOptions
  ): Promise<T> {
    const maxRetries = options?.retries ?? this.DEFAULT_RETRIES;
    let lastError: NetworkError | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Add timeout wrapper if specified
        if (options?.timeout) {
          return await this.withTimeout(operation(), options.timeout);
        }
        return await operation();
      } catch (error) {
        lastError = this.parseError(error);
        
        // Don't retry on authentication errors
        if (lastError.type === NetworkErrorType.AUTHENTICATION_ERROR) {
          throw lastError;
        }
        
        // Check if we should retry
        const isLastAttempt = attempt === maxRetries - 1;
        if (isLastAttempt || !this.isRetryableError(lastError)) {
          throw lastError;
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.getRetryDelay(attempt);
        console.warn(
          `Request failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
          lastError.message
        );
        await this.sleep(delay);
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new NetworkError('Request failed', NetworkErrorType.UNKNOWN);
  }

  /**
   * Wrap a promise with a timeout
   */
  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(
          () => reject(new NetworkError('Request timed out', NetworkErrorType.TIMEOUT)),
          timeoutMs
        )
      ),
    ]);
  }

  /**
   * Perform a GET request
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        // Extract access token from headers if present
        const accessToken = options?.headers?.['Authorization']?.replace('Bearer ', '') || '';
        
        const result = await invoke<string>('supabase_get', {
          endpoint: url,
          accessToken,
        });
        
        return JSON.parse(result);
      } catch (error) {
        throw this.parseError(error);
      }
    }, options);
  }

  /**
   * Perform a POST request
   */
  async post<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        const accessToken = options?.headers?.['Authorization']?.replace('Bearer ', '') || '';
        
        const result = await invoke<string>('supabase_post', {
          endpoint: url,
          body: JSON.stringify(body),
          accessToken,
        });
        
        return JSON.parse(result);
      } catch (error) {
        throw this.parseError(error);
      }
    }, options);
  }

  /**
   * Perform a PATCH request
   */
  async patch<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        const accessToken = options?.headers?.['Authorization']?.replace('Bearer ', '') || '';
        
        const result = await invoke<string>('supabase_patch', {
          endpoint: url,
          body: JSON.stringify(body),
          accessToken,
        });
        
        return JSON.parse(result);
      } catch (error) {
        throw this.parseError(error);
      }
    }, options);
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(async () => {
      try {
        const accessToken = options?.headers?.['Authorization']?.replace('Bearer ', '') || '';
        
        const result = await invoke<string>('supabase_delete', {
          endpoint: url,
          accessToken,
        });
        
        return JSON.parse(result);
      } catch (error) {
        throw this.parseError(error);
      }
    }, options);
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    try {
      return await invoke<boolean>('check_connectivity');
    } catch (error) {
      console.error('Connectivity check failed:', error);
      return false;
    }
  }
}
