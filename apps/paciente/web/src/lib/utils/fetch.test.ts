import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { fetchJson, postJson } from './fetch';

// --- Mock global fetch ---

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// fetchJson
// ---------------------------------------------------------------------------

describe('fetchJson', () => {
  it('returns data from a successful response', async () => {
    const payload = { id: '1', name: 'Cardiologia' };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: payload }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const result = await fetchJson('/api/specialties');

    expect(result).toEqual(payload);
    expect(mockFetch).toHaveBeenCalledWith('/api/specialties', undefined);
  });

  it('throws an error with the server message when response is not ok', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'No autenticado.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(fetchJson('/api/appointments')).rejects.toThrow(
      'No autenticado.',
    );
  });

  it('throws a generic error when the error body is not parseable JSON', async () => {
    mockFetch.mockResolvedValue(
      new Response('Internal Server Error', {
        status: 500,
      }),
    );

    await expect(fetchJson('/api/specialties')).rejects.toThrow(
      'Request failed (500)',
    );
  });

  it('throws a generic error when body has no error field', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ message: 'something else' }), {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(fetchJson('/api/specialties')).rejects.toThrow(
      'Request failed (422)',
    );
  });

  it('passes custom RequestInit options through to fetch', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: null }), { status: 200 }),
    );

    await fetchJson('/api/test', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/test', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer token' },
    });
  });
});

// ---------------------------------------------------------------------------
// postJson
// ---------------------------------------------------------------------------

describe('postJson', () => {
  it('sends POST with JSON content-type and stringified body', async () => {
    const responseData = { id: 'new-1' };
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: responseData }), { status: 200 }),
    );

    const body = { doctor_id: 'doc-1', start_time: '2026-05-01T10:00:00Z' };
    const result = await postJson('/api/appointments', body);

    expect(result).toEqual(responseData);
    expect(mockFetch).toHaveBeenCalledWith('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  });

  it('uses the specified HTTP method', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );

    await postJson('/api/profile', { name: 'Juan' }, 'PATCH');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/profile',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('defaults to POST when no method is given', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ data: {} }), { status: 200 }),
    );

    await postJson('/api/test', {});

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('propagates errors from non-ok responses', async () => {
    mockFetch.mockResolvedValue(
      new Response(JSON.stringify({ error: 'Campos requeridos.' }), {
        status: 400,
      }),
    );

    await expect(postJson('/api/appointments', {})).rejects.toThrow(
      'Campos requeridos.',
    );
  });
});
