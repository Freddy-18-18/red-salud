/**
 * Web Network Service
 * 
 * Network service implementation for web environment.
 * Uses standard fetch API for network operations.
 * 
 * Features:
 * - Automatic retry with exponential backoff
 * - Network error detection and handling
 * - Timeout support
 * 
 * Validates: Requirements 7.3, 9.2, 9.3
 */

import type { NetworkService, RequestOptions } from '../types';

/**
 * Network error types for better error handling
 */
export enum NetworkErrorType {
  TIMEOUT = 'TIMEOUT',
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  SERVER_ERROR = 'SERVER_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
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

export class WebNetworkService implements NetworkService {
  private baseUrl: string;
  private readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private readonly DEFAULT_RETRIES = 3;
  private readonly INITIAL_RETRY_DELAY = 1000; // 1 second

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  }

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
   * Parse error from fetch response
   */
  private parseError(error: unknown, statusCode?: number): NetworkError {
    // Handle fetch-specific errors
    if (error instanceof TypeError) {
      // Network errors (offline, DNS failure, etc.)
      return new NetworkError(
        'Connection failed',
        NetworkErrorType.CONNECTION_FAILED,
        undefined,
        error
      );
    }

    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      return new NetworkError(
        'Request timed out',
        NetworkErrorType.TIMEOUT,
        undefined,
        error
      );
    }

    // Handle HTTP status codes
    if (statusCode !== undefined) {
      if (statusCode === 401 || statusCode === 403) {
        return new NetworkError(
          'Authentication failed',
          NetworkErrorType.AUTHENTICATION_ERROR,
          statusCode,
          error
        );
      }
      
      if (statusCode >= 500) {
        return new NetworkError(
          `Server error: ${statusCode}`,
          NetworkErrorType.SERVER_ERROR,
          statusCode,
          error
        );
      }
      
      if (statusCode >= 400) {
        return new NetworkError(
          `Client error: ${statusCode}`,
          NetworkErrorType.CLIENT_ERROR,
          statusCode,
          error
        );
      }
    }

    return new NetworkError(
      'Unknown network error',
      NetworkErrorType.UNKNOWN,
      statusCode,
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
        return await operation();
      } catch (error) {
        lastError = error instanceof NetworkError 
          ? error 
          : this.parseError(error);
        
        // Don't retry on authentication or client errors
        if (
          lastError.type === NetworkErrorType.AUTHENTICATION_ERROR ||
          lastError.type === NetworkErrorType.CLIENT_ERROR
        ) {
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
   * Build fetch options from RequestOptions
   */
  private buildFetchOptions(
    method: string,
    body?: any,
    options?: RequestOptions
  ): { init: RequestInit; controller: AbortController } {
    const controller = new AbortController();
    const timeout = options?.timeout ?? this.DEFAULT_TIMEOUT;

    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Clear timeout on completion
    const originalSignal = controller.signal;
    const cleanup = () => clearTimeout(timeoutId);
    originalSignal.addEventListener('abort', cleanup);

    return { init: fetchOptions, controller };
  }

  /**
   * Perform a fetch request with error handling
   */
  private async fetchWithErrorHandling<T>(
    url: string,
    method: string,
    body?: any,
    options?: RequestOptions
  ): Promise<T> {
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
    const { init } = this.buildFetchOptions(method, body, options);

    try {
      const response = await fetch(fullUrl, init);
      
      if (!response.ok) {
        throw this.parseError(
          new Error(`HTTP error! status: ${response.status}`),
          response.status
        );
      }
      
      return await response.json();
    } catch (error) {
      // If it's already a NetworkError, rethrow it
      if (error instanceof NetworkError) {
        throw error;
      }
      // Otherwise, parse it
      throw this.parseError(error);
    }
  }

  /**
   * Perform a GET request
   */
  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(
      () => this.fetchWithErrorHandling<T>(url, 'GET', undefined, options),
      options
    );
  }

  /**
   * Perform a POST request
   */
  async post<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(
      () => this.fetchWithErrorHandling<T>(url, 'POST', body, options),
      options
    );
  }

  /**
   * Perform a PATCH request
   */
  async patch<T>(url: string, body: any, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(
      () => this.fetchWithErrorHandling<T>(url, 'PATCH', body, options),
      options
    );
  }

  /**
   * Perform a DELETE request
   */
  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.executeWithRetry(
      () => this.fetchWithErrorHandling<T>(url, 'DELETE', undefined, options),
      options
    );
  }

  /**
   * Check network connectivity
   */
  async checkConnectivity(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    // Perform a simple ping test
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(`${this.baseUrl}/rest/v1/`, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }
}
