/**
 * Helpers for testing Next.js API routes (App Router).
 */

import { NextRequest } from 'next/server';

/**
 * Create a NextRequest object suitable for testing API route handlers.
 */
export function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  },
): NextRequest {
  const { method = 'GET', body, headers = {} } = options ?? {};

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body !== undefined) {
    init.body = JSON.stringify(body);
  }

  // `init` is the DOM RequestInit; NextRequest's constructor accepts a compatible
  // subset but TS complains about signal being `AbortSignal | null` vs its own
  // `AbortSignal | undefined`. Cast through unknown — we never set a signal.
  return new NextRequest(
    new URL(url, 'http://localhost:3003'),
    init as unknown as ConstructorParameters<typeof NextRequest>[1],
  );
}

/**
 * Parse the JSON body from a NextResponse.
 */
export async function parseResponse<T = unknown>(
  response: Response,
): Promise<{ status: number; body: T }> {
  const body = (await response.json()) as T;
  return { status: response.status, body };
}
