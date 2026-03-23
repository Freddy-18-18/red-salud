export interface ApiClientConfig {
  gatewayUrl: string;
  getAccessToken: () => string | null | Promise<string | null>;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  statusCode: number;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
