import { vi, describe, it, expect, beforeEach } from 'vitest';

import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

const mock = createMockSupabase();

const summarizeMock = vi.fn();

vi.mock('@/lib/services/preconsult/gemini-preconsult', () => {
  // The class lives inside the factory so the hoisting of vi.mock doesn't
  // hit a TDZ on the module-level identifier.
  class PreconsultUnavailableError extends Error {
    constructor(msg: string) {
      super(msg);
      this.name = 'PreconsultUnavailableError';
    }
  }
  return {
    summarizePreconsult: (...args: unknown[]) => summarizeMock(...args),
    briefToNotes: (brief: { chief_complaint?: string }) =>
      `[Pre-consulta IA]\nMotivo principal: ${brief.chief_complaint ?? ''}`,
    PreconsultUnavailableError,
  };
});

// Resolve the mocked class for reject scenarios.
async function getMockedUnavailableError() {
  const mod = (await import('@/lib/services/preconsult/gemini-preconsult')) as {
    PreconsultUnavailableError: new (msg: string) => Error;
  };
  return mod.PreconsultUnavailableError;
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { POST } from './route';

interface ChainOptions {
  appointment: Record<string, unknown> | null;
  appointmentError?: { code?: string };
  updateError?: { message: string } | null;
}

function setupChain(opts: ChainOptions) {
  const aptChain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(
      opts.appointmentError
        ? { data: null, error: opts.appointmentError }
        : { data: opts.appointment, error: null },
    ),
  };

  // Update chain — `.update().eq()` resolves with { data, error }.
  const updateResult = { data: null, error: opts.updateError ?? null };
  const updateEq = vi.fn().mockResolvedValue(updateResult);
  const aptUpdateChain = {
    update: vi.fn().mockReturnValue({ eq: updateEq }),
  };

  let aptCallIdx = 0;
  mock.client.from.mockImplementation((table: string) => {
    if (table === 'appointments') {
      aptCallIdx += 1;
      return aptCallIdx === 1
        ? (aptChain as never)
        : (aptUpdateChain as never);
    }
    throw new Error(`Unexpected table: ${table}`);
  });
}

async function callRoute(
  id: string,
  body: Record<string, unknown> | null = {
    symptoms: 'Tengo dolor de cabeza desde ayer y mareos al pararme rápido.',
  },
) {
  const request = createRequest(`/api/appointments/${id}/preconsult`, {
    method: 'POST',
    body: body ?? undefined,
  });
  return POST(request, { params: Promise.resolve({ id }) });
}

const baseAppointment = {
  id: 'apt-1',
  patient_id: 'user-1',
  status: 'confirmed',
  notes: null,
  scheduled_at: '2099-12-31T10:00:00Z',
};

const baseBrief = {
  chief_complaint: 'Dolor de cabeza',
  duration: '1 día',
  severity: 'leve' as const,
  associated_symptoms: ['mareos'],
  self_medication: null,
  questions_for_doctor: ['¿Es migraña o tensión?'],
  red_flags: [],
  needs_urgent_attention: false,
};

describe('POST /api/appointments/[id]/preconsult', () => {
  beforeEach(() => {
    mock.reset();
    summarizeMock.mockReset();
  });

  it('returns 401 when no auth', async () => {
    mock.mockAuthError();
    const response = await callRoute('apt-1');
    expect(response.status).toBe(401);
  });

  it('returns 400 when symptoms is too short', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const response = await callRoute('apt-1', { symptoms: 'corto' });
    const { status, body } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(400);
    expect(body.error).toMatch(/más|mín/i);
  });

  it('returns 404 when appointment does not exist', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({
      appointment: null,
      appointmentError: { code: 'PGRST116' },
    });
    const response = await callRoute('apt-missing');
    expect(response.status).toBe(404);
  });

  it('returns 404 when wrong patient (no leak)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({
      appointment: { ...baseAppointment, patient_id: 'someone-else' },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(404);
  });

  it('returns 400 when appointment is cancelled', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({
      appointment: { ...baseAppointment, status: 'cancelled' },
    });
    const response = await callRoute('apt-1');
    expect(response.status).toBe(400);
  });

  it('returns 503 ai_unavailable when Gemini throws', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    const PreconsultUnavailableError = await getMockedUnavailableError();
    summarizeMock.mockRejectedValue(
      new PreconsultUnavailableError('API key no configurada'),
    );
    setupChain({ appointment: baseAppointment });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      code: string;
    }>(response);
    expect(status).toBe(503);
    expect(body.code).toBe('ai_unavailable');
  });

  it('returns the brief without saving when save=false (default)', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({ appointment: baseAppointment });
    const response = await callRoute('apt-1');
    const { status, body } = await parseResponse<{
      data: { saved: boolean; brief: { chief_complaint: string } };
    }>(response);
    expect(status).toBe(200);
    expect(body.data.saved).toBe(false);
    expect(body.data.brief.chief_complaint).toBe('Dolor de cabeza');
    expect(mock.client.from).toHaveBeenCalledTimes(1); // No update issued
  });

  it('saves the brief to appointments.notes when save=true', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({ appointment: baseAppointment });
    const response = await callRoute('apt-1', {
      symptoms: 'Tengo dolor de cabeza desde ayer y mareos al pararme rápido.',
      save: true,
    });
    const { status, body } = await parseResponse<{
      data: { saved: boolean };
    }>(response);
    expect(status).toBe(200);
    expect(body.data.saved).toBe(true);
    // Two from('appointments') calls: 1 fetch + 1 update
    expect(mock.client.from).toHaveBeenCalledTimes(2);
  });

  it('returns warning when save fails but brief was generated', async () => {
    mock.mockAuthUser({ id: 'user-1' });
    summarizeMock.mockResolvedValue(baseBrief);
    setupChain({
      appointment: baseAppointment,
      updateError: { message: 'DB write failed' },
    });
    const response = await callRoute('apt-1', {
      symptoms: 'Tengo dolor de cabeza desde ayer y mareos al pararme rápido.',
      save: true,
    });
    const { status, body } = await parseResponse<{
      data: { saved: boolean };
      warning?: string;
    }>(response);
    expect(status).toBe(200);
    expect(body.data.saved).toBe(false);
    expect(body.warning).toBeDefined();
  });
});
