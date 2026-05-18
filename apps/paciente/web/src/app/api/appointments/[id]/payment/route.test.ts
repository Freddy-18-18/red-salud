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

import { POST } from './route';

// ---------------------------------------------------------------------------
// Chain helper. The route does:
//   1) from('appointments').select.eq.is.single → ownership/status/price
//   2) from('exchange_rates').select.eq.eq.order.limit.maybeSingle → BCV rate
//   3) from('payments').insert.select.single → audit row
//   4) from('appointments').update.eq → stamp method/status (non-fatal)
// ---------------------------------------------------------------------------

interface ChainOptions {
  appointment: Record<string, unknown> | null;
  appointmentError?: { code?: string };
  bcvRate?: { rate: number } | null;
  paymentInsertResult?: {
    data: Record<string, unknown> | null;
    error: { message: string } | null;
  };
  appointmentUpdateError?: { message: string } | null;
}

function setupChain(opts: ChainOptions) {
  const aptFetchChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.appointmentError
        ? { data: null, error: opts.appointmentError }
        : { data: opts.appointment, error: null },
    ),
  };

  const bcvChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: opts.bcvRate ?? null,
      error: null,
    }),
  };

  const paymentInsertChain = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.paymentInsertResult ?? {
        data: { id: 'payment-1' },
        error: null,
      },
    ),
  };

  // appointments.update().eq() — terminal `.eq()` resolves.
  const aptUpdateResult = {
    data: null,
    error: opts.appointmentUpdateError ?? null,
  };
  const aptUpdateChain = {
    update: vi.fn().mockReturnValue({
      eq: vi.fn().mockResolvedValue(aptUpdateResult),
    }),
  };

  let aptCallIdx = 0;
  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') {
      aptCallIdx += 1;
      return aptCallIdx === 1
        ? (aptFetchChain as never)
        : (aptUpdateChain as never);
    }
    if (table === 'exchange_rates') return bcvChain as never;
    if (table === 'payments') return paymentInsertChain as never;
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function callRoute(
  id: string,
  body: Record<string, unknown> | null = {
    method: 'pago_movil',
    reference_number: '12345678',
  },
) {
  const request = createRequest(`/api/appointments/${id}/payment`, {
    method: 'POST',
    body: body ?? undefined,
  });
  return POST(request, { params: Promise.resolve({ id }) });
}

const baseAppointment = {
  id: 'apt-1',
  patient_id: 'user-1',
  doctor_id: 'doc-1',
  price: 50,
  payment_status: 'pending',
  status: 'confirmed',
};

describe('POST /api/appointments/[id]/payment', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callRoute('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 400 on invalid method', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callRoute('apt-1', {
      method: 'bitcoin',
      reference_number: 'tx',
    });
    expect(response.status).toBe(400);
  });

  it('returns 400 when non-cash method has no reference', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callRoute('apt-1', {
      method: 'transferencia',
      reference_number: '',
    });
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/referencia/i);
  });

  it('accepts efectivo without a reference', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      bcvRate: { rate: 36.5 },
    });
    const response = await callRoute('apt-1', { method: 'efectivo' });
    expect(response.status).toBe(200);
  });

  it('returns 404 when appointment does not exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: null,
      appointmentError: { code: 'PGRST116' },
    });
    const response = await callRoute('apt-missing');
    expect(response.status).toBe(404);
  });

  it('returns 404 when wrong patient (no leak)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, patient_id: 'someone-else' },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(404);
  });

  it('returns 400 when appointment is cancelled', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, status: 'cancelled' },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(400);
  });

  it('returns 400 when already paid', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, payment_status: 'paid' },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/pagada/i);
  });

  it('returns 400 when price is not set', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: { ...baseAppointment, price: 0 },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(400);
  });

  it('returns 200 with USD + Bs amounts and snapshotted rate', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      bcvRate: { rate: 36.5 },
      paymentInsertResult: {
        data: { id: 'payment-new' },
        error: null,
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      data: {
        payment_id: string;
        amount_usd: number;
        amount_bs: number;
        exchange_rate: number;
        status: string;
      };
    }>(response);
    expect(status).toBe(200);
    expect(body.data.amount_usd).toBe(50);
    expect(body.data.amount_bs).toBeCloseTo(1825, 1);
    expect(body.data.exchange_rate).toBe(36.5);
    expect(body.data.status).toBe('processing');
    expect(body.data.payment_id).toBe('payment-new');
  });

  it('falls back to rate=1 when no BCV row is available', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      bcvRate: null,
    });
    const response = await callRoute('apt-1');
    const { body } = await parseResponse<{
      data: { exchange_rate: number; amount_bs: number };
    }>(response);
    expect(body.data.exchange_rate).toBe(1);
    expect(body.data.amount_bs).toBe(50);
  });

  it('returns 500 when payments insert fails', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: baseAppointment,
      bcvRate: { rate: 36 },
      paymentInsertResult: {
        data: null,
        error: { message: 'DB error' },
      },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(500);
  });
});
