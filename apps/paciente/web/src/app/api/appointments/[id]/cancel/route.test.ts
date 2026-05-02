import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase + notification driver ---
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
// Helper — wires the chained mock so the route's two queries land cleanly.
// 1st .from('appointments') → existing appointment fetch
// 2nd .from('doctor_settings') → window lookup
// 3rd .from('appointments') → cancel update
// ---------------------------------------------------------------------------

function setupChain(opts: {
  existing: Record<string, unknown> | null;
  fetchError?: { code?: string; message?: string };
  settings?: { cancellation_window_hours: number } | null;
  updateResult?: { data: Record<string, unknown> | null; error: { message: string } | null };
}) {
  const updateChainMock = {
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.updateResult ?? {
        data: { id: 'apt-1', status: 'cancelled' },
        error: null,
      },
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

  // Generic insert chain for user_activity_log (fire-and-forget)
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
      appointmentsCallIdx++;
      return appointmentsCallIdx === 1 ? fetchChainMock : updateChainMock;
    }
    if (table === 'doctor_settings') return settingsChainMock;
    if (table === 'user_activity_log') return logChainMock;
    return fetchChainMock;
  });

  return { fetchChainMock, settingsChainMock, updateChainMock };
}

const PATIENT_ID = 'patient-1';
const DOCTOR_ID = 'doc-1';
const APPT_ID = '11111111-1111-1111-1111-111111111111';

function callRoute() {
  const request = createRequest(`/api/appointments/${APPT_ID}/cancel`, {
    method: 'PATCH',
    body: { reason: 'Conflicto de agenda' },
  });
  return PATCH(request, { params: Promise.resolve({ id: APPT_ID }) });
}

beforeEach(() => {
  mock.reset();
  notifyMock.mockClear();
});

describe('PATCH /api/appointments/[id]/cancel', () => {
  it('returns 401 when unauthenticated', async () => {
    mock.mockAuthError();
    const response = await callRoute();
    expect(response.status).toBe(401);
  });

  it('returns 404 when the appointment is not found', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: null,
      fetchError: { code: 'PGRST116', message: 'no rows' },
    });
    const response = await callRoute();
    expect(response.status).toBe(404);
  });

  it('returns 403 when the appointment belongs to another patient', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'pending',
        patient_id: 'someone-else',
        doctor_id: DOCTOR_ID,
        scheduled_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      },
    });
    const response = await callRoute();
    expect(response.status).toBe(403);
  });

  it('returns 400 when already cancelled', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'cancelled',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        scheduled_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      },
    });
    const response = await callRoute();
    expect(response.status).toBe(400);
  });

  it('returns 422 when within the cancellation window', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'pending',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        // 2 hours from now — inside the default 24h window.
        scheduled_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      },
      settings: { cancellation_window_hours: 24 },
    });
    const response = await callRoute();
    const { status, body } = await parseResponse<{
      error: string;
      code: string;
      window_hours: number;
    }>(response);

    expect(status).toBe(422);
    expect(body.code).toBe('cancellation_window');
    expect(body.window_hours).toBe(24);
  });

  it('honors a per-doctor custom window', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'pending',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        // 3 hours from now — inside a 6h window but outside default 24h.
        scheduled_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      },
      settings: { cancellation_window_hours: 6 },
    });
    const response = await callRoute();
    const { status, body } = await parseResponse<{ window_hours: number }>(response);

    expect(status).toBe(422);
    expect(body.window_hours).toBe(6);
  });

  it('falls back to the platform default when doctor has no settings row', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'pending',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        // 30 minutes from now — clearly inside any sane window.
        scheduled_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      },
      settings: null,
    });
    const response = await callRoute();
    const { status, body } = await parseResponse<{ window_hours: number }>(response);

    expect(status).toBe(422);
    expect(body.window_hours).toBe(24);
  });

  it('cancels and notifies the doctor when the policy passes', async () => {
    mock.mockAuthUser({ id: PATIENT_ID });
    setupChain({
      existing: {
        id: APPT_ID,
        status: 'pending',
        patient_id: PATIENT_ID,
        doctor_id: DOCTOR_ID,
        scheduled_at: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      },
      settings: { cancellation_window_hours: 24 },
    });

    const response = await callRoute();
    expect(response.status).toBe(200);

    expect(notifyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        recipientId: DOCTOR_ID,
        type: 'appointment_cancelled',
        actionUrl: `/dashboard/citas/${APPT_ID}`,
      }),
    );
  });
});
