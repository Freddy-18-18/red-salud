import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase ---
const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { GET } from './route';

// ---------------------------------------------------------------------------
// Helper — wires the chained mock so the route's two queries land cleanly.
// 1st .from('appointments') → single appointment fetch (with embedded data)
// 2nd .from('doctor_settings') → cancellation_window_hours
// ---------------------------------------------------------------------------

function setupChain(opts: {
  appointment: Record<string, unknown> | null;
  fetchError?: { code?: string; message?: string };
  settings?: { cancellation_window_hours: number } | null;
  waitlist?: Record<string, unknown> | null;
}) {
  const fetchChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.fetchError
        ? { data: null, error: opts.fetchError }
        : { data: opts.appointment, error: null },
    ),
  };

  const settingsChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: opts.settings ?? null,
      error: null,
    }),
  };

  const waitlistChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: opts.waitlist ?? null,
      error: null,
    }),
  };

  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') return fetchChainMock as never;
    if (table === 'doctor_settings') return settingsChainMock as never;
    if (table === 'patient_appointment_waitlist')
      return waitlistChainMock as never;
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function callRoute(id: string) {
  const request = createRequest(`/api/appointments/${id}`);
  return GET(request, { params: Promise.resolve({ id }) });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/appointments/[id]', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no authenticated user', async () => {
    mock.mockAuthError();

    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toMatch(/no autenticado/i);
  });

  it('returns 404 when appointment does not exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: null,
      fetchError: { code: 'PGRST116', message: 'no rows' },
    });

    const response = await callRoute('apt-missing');
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(404);
    expect(body.error).toMatch(/no encontrada/i);
  });

  it('returns 500 on generic Supabase error', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: null,
      fetchError: { code: 'PG500', message: 'DB exploded' },
    });

    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toMatch(/error al obtener/i);
  });

  it('returns 404 when the appointment exists but belongs to another patient (no leak)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'someone-else',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T10:00:00Z',
      },
    });

    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(404);
    expect(body.error).toMatch(/no encontrada/i);
  });

  it('returns the appointment with default cancellation window (24h) when no settings row', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'in_person',
      },
      settings: null,
    });

    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      data: { id: string; cancellation_window_hours: number };
    }>(response);

    expect(status).toBe(200);
    expect(body.data.id).toBe('apt-1');
    expect(body.data.cancellation_window_hours).toBe(24);
  });

  it('returns the doctor-specific cancellation window when settings exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        doctor_id: 'doc-1',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
      settings: { cancellation_window_hours: 48 },
    });

    const response = await callRoute('apt-1');
    const { body } = await parseResponse<{
      data: { cancellation_window_hours: number };
    }>(response);

    expect(body.data.cancellation_window_hours).toBe(48);
  });
});
