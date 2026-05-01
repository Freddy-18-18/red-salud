import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase ---
const mock = createMockSupabase();

// Extend the mock client with rpc() since the booking POST goes through
// the book_appointment_atomic RPC instead of a raw INSERT chain.
const rpcMock = vi.fn();
const mockClient = mock.client as typeof mock.client & {
  rpc: typeof rpcMock;
};
mockClient.rpc = rpcMock;

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockClient)),
}));

vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

import { GET, POST } from './route';

// ---------------------------------------------------------------------------
// GET /api/appointments
// ---------------------------------------------------------------------------

describe('GET /api/appointments', () => {
  beforeEach(() => {
    mock.reset();
    rpcMock.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    mock.mockAuthError();

    const request = createRequest('/api/appointments');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe('No autenticado. Inicia sesión para continuar.');
  });

  it('returns 401 when getUser returns null without error', async () => {
    const request = createRequest('/api/appointments');
    const response = await GET(request);
    const { status } = await parseResponse<{ error: string }>(response);
    expect(status).toBe(401);
  });

  it('returns patient appointments with pagination', async () => {
    mock.mockAuthUser({ id: 'patient-123', email: 'patient@test.com' });

    const appointments = [
      {
        id: 'apt-1',
        doctor_id: 'doc-1',
        scheduled_at: '2026-06-01T10:00:00Z',
        duration_minutes: 30,
        status: 'pending',
        appointment_type: 'in_person',
        reason: 'Control general',
        notes: null,
        created_at: '2026-05-01T00:00:00Z',
        doctor: {
          id: 'doc-1',
          specialty_id: 'sp-1',
          consultation_fee: 50,
          profile: { first_name: 'Ana', last_name: 'Garcia', avatar_url: null },
        },
      },
    ];

    mock.mockResolvedData(appointments, 1);

    const request = createRequest('/api/appointments?page=1&page_size=10');
    const response = await GET(request);
    const { status, body } = await parseResponse<{
      data: typeof appointments;
      pagination: { page: number; page_size: number; total: number; total_pages: number };
    }>(response);

    expect(status).toBe(200);
    expect(body.data).toEqual(appointments);
    expect(body.pagination).toEqual({
      page: 1,
      page_size: 10,
      total: 1,
      total_pages: 1,
    });
    expect(mock.client.from).toHaveBeenCalledWith('appointments');
  });

  it('returns 500 when Supabase query fails', async () => {
    mock.mockAuthUser({ id: 'patient-123' });
    mock.mockResolvedError({ message: 'DB error' });

    const request = createRequest('/api/appointments');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toBe('Error al obtener citas.');
  });

  it('clamps page_size to max 50', async () => {
    mock.mockAuthUser({ id: 'patient-123' });
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/appointments?page_size=999');
    const response = await GET(request);
    const { body } = await parseResponse<{ pagination: { page_size: number } }>(response);

    expect(body.pagination.page_size).toBe(50);
  });

  it('clamps page to minimum 1', async () => {
    mock.mockAuthUser({ id: 'patient-123' });
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/appointments?page=-5');
    const response = await GET(request);
    const { body } = await parseResponse<{ pagination: { page: number } }>(response);

    expect(body.pagination.page).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// POST /api/appointments — atomic booking via book_appointment_atomic RPC
// ---------------------------------------------------------------------------

describe('POST /api/appointments', () => {
  const validDoctorId = '11111111-1111-1111-1111-111111111111';
  const validPatientId = 'patient-123';
  const futureScheduledAt = new Date(Date.now() + 86_400_000).toISOString();

  function makeBody(overrides?: Record<string, unknown>) {
    return {
      doctor_id: validDoctorId,
      scheduled_at: futureScheduledAt,
      duration_minutes: 30,
      reason: 'Consulta general',
      appointment_type: 'in_person',
      ...overrides,
    };
  }

  beforeEach(() => {
    mock.reset();
    rpcMock.mockReset();
  });

  it('returns 401 when user is not authenticated', async () => {
    mock.mockAuthError();

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe('No autenticado. Inicia sesión para continuar.');
  });

  it('returns 400 when required fields are missing (Zod validation)', async () => {
    mock.mockAuthUser({ id: validPatientId });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId }, // missing scheduled_at, reason
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; details?: string[] }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details).toBeDefined();
  });

  it('returns 400 when scheduled_at is in the past', async () => {
    mock.mockAuthUser({ id: validPatientId });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody({ scheduled_at: '2020-01-01T10:00:00Z' }),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; details?: string[] }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details ?? []).toEqual(
      expect.arrayContaining([expect.stringContaining('cannot book in the past')]),
    );
  });

  it('creates an appointment and returns 201', async () => {
    mock.mockAuthUser({ id: validPatientId });

    const created = {
      id: 'apt-new',
      patient_id: validPatientId,
      doctor_id: validDoctorId,
      scheduled_at: futureScheduledAt,
      duration_minutes: 30,
      status: 'pending',
    };
    rpcMock.mockResolvedValueOnce({ data: { data: created }, error: null });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ data: typeof created }>(response);

    expect(status).toBe(201);
    expect(body.data).toEqual(created);
    expect(rpcMock).toHaveBeenCalledWith(
      'book_appointment_atomic',
      expect.objectContaining({
        p_patient_id: validPatientId,
        p_doctor_id: validDoctorId,
      }),
    );
  });

  it('maps slot_taken RPC error to 409', async () => {
    mock.mockAuthUser({ id: validPatientId });

    rpcMock.mockResolvedValueOnce({
      data: {
        error: 'slot_taken',
        message: 'El horario seleccionado ya no está disponible.',
        conflicts: [],
      },
      error: null,
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{
      error: string;
      code: string;
    }>(response);

    expect(status).toBe(409);
    expect(body.code).toBe('slot_taken');
  });

  it('maps time_block_conflict RPC error to 409', async () => {
    mock.mockAuthUser({ id: validPatientId });

    rpcMock.mockResolvedValueOnce({
      data: {
        error: 'time_block_conflict',
        message: 'El médico no atiende en ese rango (bloqueo de agenda).',
      },
      error: null,
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; code: string }>(response);

    expect(status).toBe(409);
    expect(body.code).toBe('time_block_conflict');
  });

  it('maps unauthorized RPC error to 403', async () => {
    mock.mockAuthUser({ id: validPatientId });

    rpcMock.mockResolvedValueOnce({
      data: {
        error: 'unauthorized',
        message: 'No puedes agendar citas para otro paciente.',
      },
      error: null,
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status } = await parseResponse<{ error: string; code: string }>(response);

    expect(status).toBe(403);
  });

  it('returns 500 when the RPC itself errors', async () => {
    mock.mockAuthUser({ id: validPatientId });

    rpcMock.mockResolvedValueOnce({
      data: null,
      error: { message: 'RPC explosion' },
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: makeBody(),
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toBe('Error al crear la cita.');
  });

  it('returns 400 when request body is invalid JSON', async () => {
    mock.mockAuthUser({ id: validPatientId });

    const request = new Request('http://localhost:3003/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not valid json{{{',
    }) as unknown as import('next/server').NextRequest;

    Object.defineProperty(request, 'url', {
      value: 'http://localhost:3003/api/appointments',
    });

    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Body inválido');
  });

  it('serializes 10 concurrent attempts on the same slot to exactly one 201', async () => {
    mock.mockAuthUser({ id: validPatientId });

    const winner = {
      id: 'apt-winner',
      patient_id: validPatientId,
      doctor_id: validDoctorId,
      scheduled_at: futureScheduledAt,
      duration_minutes: 30,
      status: 'pending',
    };

    // Simulate the DB unique-violation path: one call wins, the other 9 hit
    // the partial unique index in the RPC and come back as slot_taken. The
    // route's job is to translate them to the right HTTP status without
    // crashing or leaking the winning row to the losers.
    let callIdx = 0;
    rpcMock.mockImplementation(() => {
      const idx = callIdx++;
      if (idx === 0) {
        return Promise.resolve({ data: { data: winner }, error: null });
      }
      return Promise.resolve({
        data: {
          error: 'slot_taken',
          message: 'El horario seleccionado ya no está disponible.',
        },
        error: null,
      });
    });

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        POST(
          createRequest('/api/appointments', {
            method: 'POST',
            body: makeBody(),
          }),
        ),
      ),
    );

    const statuses = responses.map((r) => r.status);
    const okCount = statuses.filter((s) => s === 201).length;
    const conflictCount = statuses.filter((s) => s === 409).length;

    expect(okCount).toBe(1);
    expect(conflictCount).toBe(9);
    expect(rpcMock).toHaveBeenCalledTimes(10);
  });
});
