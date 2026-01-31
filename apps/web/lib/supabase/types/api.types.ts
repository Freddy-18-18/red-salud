/**
 * API request and response types
 * Used for API routes and external service integrations
 */

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Combined API response type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Request with pagination
 */
export interface PaginatedRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search request parameters
 */
export interface SearchRequest extends PaginatedRequest {
  query: string;
  filters?: Record<string, unknown>;
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  file: File;
  bucket: string;
  path?: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  url: string;
  path: string;
  size: number;
  mimeType: string;
}

/**
 * Batch operation request
 */
export interface BatchOperationRequest<T> {
  operations: T[];
  stopOnError?: boolean;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse<T> {
  successful: T[];
  failed: Array<{
    item: T;
    error: string;
  }>;
  totalProcessed: number;
  totalSuccessful: number;
  totalFailed: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'up' | 'down';
    storage: 'up' | 'down';
    auth: 'up' | 'down';
  };
}
