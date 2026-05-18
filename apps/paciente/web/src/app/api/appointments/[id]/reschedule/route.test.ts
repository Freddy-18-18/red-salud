import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

const mock = createMockSupabase();

const notifyMock = vi.fn().mockResolvedValue(undefined);
vi.mock('@/lib/services/notifications', () => ({
  createDoctorNotificationDriver: vi.fn(() => ({ notify: notifyMock })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { PATCH } from './route';

// ---------------------------------------------------------------------------
// Chain helper. The reschedule route does:
//   1) from('appointments').select(...).eq.is.single   → existing fetch
//   2) supabase.rpc('check_slot_available', ...)        → slot availability
//   3) supabase.rpc('check_time_block_conflict', ...)   → block conflict
//   4) from('appointments').update(...).eq.select.single → update
//   5) from('user_activity_log').insert(...)             → fire-and-forget log
// ---------------------------------------------------------------------------

interface ChainOptions {
  existing: Record<string, unknown> | null;
  fetchError?: { code?: string; message?: string };
  slotAvailable?: boolean;
  slotRpcError?: { message: string } | null;
  blockOk?: boolean;
  blockRpcError?: { message: string } | null;
  updateResult?: {
    data: Record<string, unknown> | null;
    error: { message: string; code?: string } | null;
  };
}

function setupChain(opts: ChainOptions) {
  const fetchChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.fetchError
        ? { data: null, error: opts.fetchError }
        : { data: opts.existing, error: null },
    ),
  };

  const updateChainMock = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.updateResult ?? {
        data: { id: 'apt-1', status: 'pending' },
        error: null,
      },
    ),
  };

  const logChainMock = {
    insert: vi.fn().mockReturnValue({
      then: (resolve: (v: unknown) => void) => {
        resolve({ error: null });
        return Promise.resolve({ error: null });
      },
    }),
  };

  let appointmentsCallIdx = 0;
  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') {
      appointmentsCallIdx += 1;
      return appointmentsCallIdx === 1
        ? (fetchChainMock as never)
        : (updateChainMock as never);
    }
    if (table === 'user_activity_log') return logChainMock as never;
    throw new Error(`Unexpected table: ${table}`);
  });

  // RPC stub
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (mock.client as any).rpc = vi.fn((name: string) => {
    if (name === 'check_slot_available') {
      return Promise.resolve(
        opts.slotRpcError
          ? { data: null, error: opts.slotRpcError }
          : {
              data: { is_available: opts.slotAvailable ?? true, conflicts: [] },
              error: null,
            },
      );
    }
    if (name === 'check_time_block_conflict') {
      return Promise.resolve(
        opts.blockRpcError
          ? { data: null, error: opts.blockRpcError }
          : { data: opts.blockOk ?? true, error: null },
      );
    }
    throw new Error(`Unexpected RPC: ${name}`);
  });
}

async function callRoute(
  id: string,
  body: Record<string, unknown> | null = {
    scheduled_at: '2099-12-31T10:00:00.000Z',
  },
) {
  const request = createRequest(`/api/appointments/${id}/reschedule`, {
    method: 'PATCH',
    body: body ?? undefined,
  });
  return PATCH(request, { params: Promise.resolve({ id }) });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('PATCH /api/appointments/[id]/reschedule', () => {
  beforeEach(() => {
    mock.reset();
    notifyMock.mockClear();
  });

  it('returns 401 when no authenticated user', async () => {
    mock.mockAuthError();
    const response = await callRoute('apt-1');
    const { status } = await parseResponse(response);
    expect(status).toBe(401);
  });

  it('returns 400 on invalid body', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callRoute('apt-1', { not_a_real_field: 1 });
    const { status } = await parseResponse(response);
    expect(status).toBe(400);
  });

  it('returns 400 when scheduling in the past', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callRoute('apt-1', {
      scheduled_at: '2000-01-01T10:00:00.000Z',
    });
    const { status } = await parseResponse(response);
    expect(status).toBe(400);
  });

  it('returns 404 when appointment does not exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: null,
      fetchError: { code: 'PGRST116', message: 'no rows' },
    });
    const response = await callRoute('apt-missing');
    const { status } = await parseResponse(response);
    expect(status).toBe(404);
  });

  it('returns 403 when the appointment belongs to another patient', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'confirmed',
        patient_id: 'someone-else',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
    });
    const response = await callRoute('apt-1');
    const { status } = await parseResponse(response);
    expect(status).toBe(403);
  });

  it('returns 400 when the appointment is already cancelled', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'cancelled',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/cancelada/i);
  });

  it('returns 409 with code=slot_taken when the new slot is unavailable', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'confirmed',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
      slotAvailable: false,
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      error: string;
      code: string;
    }>(response);
    expect(status).toBe(409);
    expect(body.code).toBe('slot_taken');
  });

  it('returns 409 with code=time_block_conflict when the doctor has a block', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'confirmed',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
      slotAvailable: true,
      blockOk: false,
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      error: string;
      code: string;
    }>(response);
    expect(status).toBe(409);
    expect(body.code).toBe('time_block_conflict');
  });

  it('returns 409 with code=slot_taken on unique-violation race', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'confirmed',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
      updateResult: {
        data: null,
        error: { message: 'unique violation', code: '23505' },
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      error: string;
      code: string;
    }>(response);
    expect(status).toBe(409);
    expect(body.code).toBe('slot_taken');
  });

  it('reschedules a confirmed appointment, demotes status to pending, and notifies the doctor', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      existing: {
        id: 'apt-1',
        status: 'confirmed',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T08:00:00Z',
        duration_minutes: 30,
        location_id: null,
      },
      updateResult: {
        data: {
          id: 'apt-1',
          status: 'pending',
          scheduled_at: '2099-12-31T10:00:00.000Z',
        },
        error: null,
      },
    });

    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      data: { status: string; scheduled_at: string };
    }>(response);

    expect(status).toBe(200);
    expect(body.data.status).toBe('pending');
    expect(notifyMock).toHaveBeenCalledOnce();
    const notifyArg = notifyMock.mock.calls[0]?.[0] as
      | { type?: string; recipientId?: string }
      | undefined;
    expect(notifyArg?.type).toBe('appointment_rescheduled');
    expect(notifyArg?.recipientId).toBe('doc-1');
  });
});
