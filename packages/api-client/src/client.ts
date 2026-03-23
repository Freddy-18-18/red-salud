import type { ApiClientConfig, ApiError, ApiResponse } from './types';

export class ApiClient {
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig) {
    this.config = config;
  }

  async request<T>(
    method: string,
    path: string,
    options?: {
      body?: unknown;
      params?: Record<string, string>;
      headers?: Record<string, string>;
    },
  ): Promise<ApiResponse<T>> {
    const url = new URL(path, this.config.gatewayUrl);

    if (options?.params) {
      Object.entries(options.params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    const token = await this.config.getAccessToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options?.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: response.statusText,
        statusCode: response.status,
      }));
      throw error;
    }

    return response.json();
  }

  get<T>(path: string, params?: Record<string, string>) {
    return this.request<T>('GET', path, { params });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>('POST', path, { body });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, { body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, { body });
  }

  delete<T>(path: string) {
    return this.request<T>('DELETE', path);
  }
}
