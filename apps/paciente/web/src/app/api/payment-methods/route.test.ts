import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { GET, POST } from './route';

interface ChainOptions {
  listResult?: { data: unknown[]; error: { message: string } | null };
  insertResult?: {
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  };
}

function setupChain(opts: ChainOptions = {}) {
  // GET path: from(...).select(...).order(...).order(...) → resolves list
  const listResult = opts.listResult ?? { data: [], error: null };
  const orderInner = vi.fn().mockResolvedValue(listResult);
  const orderOuter = vi.fn().mockReturnValue({ order: orderInner });

  // POST path: from(...).insert(...).select().single() → resolves row
  const insertSingle = vi.fn().mockResolvedValue(
    opts.insertResult ?? {
      data: { id: 'pm-new', type: 'pago_movil' },
      error: null,
    },
  );
  const insertReturned = {
    select: vi.fn().mockReturnValue({ single: insertSingle }),
  };

  // Both paths share the entry returned from `from(...)`. .select() goes to
  // the list path; .insert() goes to the post path.
  const unified = {
    select: vi.fn().mockReturnValue({ order: orderOuter }),
    insert: vi.fn().mockReturnValue(insertReturned),
  };

  mock.client.from.mockImplementation((table: string) => {
    if (table !== 'patient_payment_methods') {
      throw new Error(`Unexpected table: ${table}`);
    }
    return unified as never;
  });
}

async function callGet() {
  const request = createRequest('/api/payment-methods');
  return GET(request);
}

async function callPost(body: Record<string, unknown> | null) {
  const request = createRequest('/api/payment-methods', {
    method: 'POST',
    body: body ?? undefined,
  });
  return POST(request);
}

// ---------------------------------------------------------------------------
// GET
// ---------------------------------------------------------------------------

describe('GET /api/payment-methods', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callGet();
    expect(response.status).toBe(401);
  });

  it('returns the list under data', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      listResult: {
        data: [
          { id: 'pm-1', type: 'pago_movil', label: 'Mi PM', is_default: true },
        ],
        error: null,
      },
    });
    const response = await callGet();
    const { status, body } = await parseResponse<{
      data: Array<{ id: string }>;
    }>(response);
    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('pm-1');
  });

  it('returns 500 when supabase errors', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      listResult: { data: [], error: { message: 'db down' } },
    });
    const response = await callGet();
    expect(response.status).toBe(500);
  });
});

// ---------------------------------------------------------------------------
// POST
// ---------------------------------------------------------------------------

describe('POST /api/payment-methods', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callPost({
      type: 'pago_movil',
      label: 'X',
      pago_movil_phone: '0414-1234567',
    });
    expect(response.status).toBe(401);
  });

  it('returns 400 on invalid type', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callPost({
      type: 'crypto',
      label: 'X',
    });
    expect(response.status).toBe(400);
  });

  it('returns 400 when pago_movil has no phone', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callPost({
      type: 'pago_movil',
      label: 'X',
    });
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/teléfono/i);
  });

  it('returns 400 when zelle has no email', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callPost({
      type: 'zelle',
      label: 'X',
    });
    expect(response.status).toBe(400);
  });

  it('returns 400 when card has no last_four', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callPost({
      type: 'tarjeta_credito',
      label: 'X',
    });
    expect(response.status).toBe(400);
  });

  it('returns 400 when card_last_four is not 4 digits', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callPost({
      type: 'tarjeta_credito',
      label: 'X',
      card_last_four: '12',
    });
    expect(response.status).toBe(400);
  });

  it('creates a pago_movil method with valid phone', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      insertResult: {
        data: { id: 'pm-new', type: 'pago_movil' },
        error: null,
      },
    });
    const response = await callPost({
      type: 'pago_movil',
      label: 'Mi PM',
      pago_movil_phone: '0414-1234567',
    });
    expect(response.status).toBe(201);
  });

  it('creates an efectivo method without channel-specific fields', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      insertResult: {
        data: { id: 'pm-cash', type: 'efectivo' },
        error: null,
      },
    });
    const response = await callPost({
      type: 'efectivo',
      label: 'Efectivo',
    });
    expect(response.status).toBe(201);
  });

  it('returns 500 when insert fails', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      insertResult: {
        data: null,
        error: { message: 'unique violation' },
      },
    });
    const response = await callPost({
      type: 'pago_movil',
      label: 'Mi PM',
      pago_movil_phone: '0414-1234567',
    });
    expect(response.status).toBe(500);
  });
});
