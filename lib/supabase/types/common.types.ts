/**
 * Common types used across the application
 */

/**
 * Standard service response wrapper
 * Used to provide consistent response format across all service functions
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination parameters for list queries
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Paginated response wrapper
 * Used for endpoints that return paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
}

/**
 * Sort parameters for list queries
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter operator types
 */
export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in';

/**
 * Generic filter parameter
 */
export interface FilterParam {
  field: string;
  operator: FilterOperator;
  value: any;
}
