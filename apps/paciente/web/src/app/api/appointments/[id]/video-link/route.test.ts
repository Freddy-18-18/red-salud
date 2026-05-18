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

import { GET } from './route';

function setupChain(opts: {
  appointment: Record<string, unknown> | null;
  appointmentError?: { code?: string };
  session?: { id: string; meeting_url: string | null; status?: string } | null;
}) {
  const aptChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.appointmentError
        ? { data: null, error: opts.appointmentError }
        : { data: opts.appointment, error: null },
    ),
  };

  const sessionChainMock = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: opts.session ?? null,
      error: null,
    }),
  };

  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') return aptChainMock as never;
    if (table === 'telemedicine_sessions') return sessionChainMock as never;
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function callRoute(id: string) {
  const request = createRequest(`/api/appointments/${id}/video-link`);
  return GET(request, { params: Promise.resolve({ id }) });
}

const FUTURE_FAR = new Date(Date.now() + 24 * 60 * 60_000).toISOString(); // +24h
const FUTURE_NEAR = new Date(Date.now() + 5 * 60_000).toISOString(); // +5 min
const PAST_LONG = new Date(Date.now() - 5 * 60 * 60_000).toISOString(); // -5h

describe('GET /api/appointments/[id]/video-link', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callRoute('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 404 when wrong patient', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'someone-else',
        scheduled_at: FUTURE_NEAR,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(404);
  });

  it('returns 400 when not a telemedicine appointment', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: FUTURE_NEAR,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'in_person',
      },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(400);
  });

  it('returns 400 too_early when more than 15 min away', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: FUTURE_FAR,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ code: string }>(response);
    expect(status).toBe(400);
    expect(body.code).toBe('too_early');
  });

  it('returns 400 too_late when the cita already ended', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: PAST_LONG,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ code: string }>(response);
    expect(status).toBe(400);
    expect(body.code).toBe('too_late');
  });

  it('returns 503 meeting_not_ready when no session has meeting_url', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: FUTURE_NEAR,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
      session: null,
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{ code: string }>(response);
    expect(status).toBe(503);
    expect(body.code).toBe('meeting_not_ready');
  });

  it('returns 200 with meeting_url when window is open and session exists', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: FUTURE_NEAR,
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
      },
      session: {
        id: 'sess-1',
        meeting_url: 'https://meet.redsalud.app/sess-1',
        status: 'scheduled',
      },
    });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      data: { meeting_url: string; session_id: string };
    }>(response);
    expect(status).toBe(200);
    expect(body.data.meeting_url).toBe('https://meet.redsalud.app/sess-1');
    expect(body.data.session_id).toBe('sess-1');
  });
});
