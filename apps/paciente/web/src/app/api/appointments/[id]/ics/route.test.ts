import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest } from '@/__tests__/helpers/api-test-utils';

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
  fetchError?: { code?: string; message?: string };
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
  mock.client.from.mockImplementation(() => fetchChainMock as never);
}

async function callRoute(id: string) {
  const request = createRequest(`/api/appointments/${id}/ics`);
  return GET(request, { params: Promise.resolve({ id }) });
}

describe('GET /api/appointments/[id]/ics', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callRoute('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 404 when wrong patient (no leak)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'someone-else',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'in_person',
        doctor: { full_name: 'Pérez' },
        location: null,
      },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(404);
  });

  it('returns 400 when appointment is cancelled', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'cancelled',
        appointment_type: 'in_person',
        doctor: { full_name: 'Pérez' },
        location: null,
      },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(400);
  });

  it('returns a valid .ics file with the correct headers and required fields', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-1',
        patient_id: 'user-1',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'in_person',
        reason: 'Control general',
        notes: null,
        doctor: { full_name: 'Pérez García' },
        location: {
          name: 'Sede Principal',
          address_line: 'Av. Libertador 123',
          city: 'Caracas',
          state: 'DC',
        },
      },
    });

    const response = await callRoute('apt-1');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toMatch(/text\/calendar/);
    expect(response.headers.get('Content-Disposition')).toMatch(
      /attachment.*cita-apt-1\.ics/,
    );

    const body = await response.text();
    expect(body).toContain('BEGIN:VCALENDAR');
    expect(body).toContain('END:VCALENDAR');
    expect(body).toContain('BEGIN:VEVENT');
    expect(body).toContain('END:VEVENT');
    expect(body).toContain('UID:apt-apt-1@redsalud.app');
    expect(body).toContain('SUMMARY:Cita con Dr. Pérez García');
    expect(body).toContain('DTSTART:20991231T100000Z');
    expect(body).toContain('DTEND:20991231T103000Z');
    // Description is escaped per RFC 5545; commas → \,
    expect(body).toMatch(/DESCRIPTION:Tipo: Presencial.*Control general/);
    // Location includes the sede + address. Commas are escaped with `\,`
    // per RFC 5545; the period in "Av." is literal.
    expect(body).toContain('LOCATION:Sede Principal\\, Av. Libertador 123');
    // The 1h reminder alarm
    expect(body).toContain('TRIGGER:-PT1H');
  });

  it('uses "Video consulta" as location for telemedicine', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    setupChain({
      appointment: {
        id: 'apt-2',
        patient_id: 'user-1',
        scheduled_at: '2099-12-31T10:00:00Z',
        duration_minutes: 30,
        status: 'confirmed',
        appointment_type: 'telemedicine',
        reason: null,
        notes: null,
        doctor: { full_name: 'Doctor X' },
        location: null,
      },
    });

    const response = await callRoute('apt-2');
    const body = await response.text();
    expect(body).toContain('LOCATION:Video consulta (Red Salud)');
  });
});
