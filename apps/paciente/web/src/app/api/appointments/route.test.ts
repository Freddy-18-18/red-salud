import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase ---
const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

// Mock rate limiter to always allow (we test rate limiting separately)
vi.mock('@/lib/utils/rate-limit', () => ({
  checkRateLimit: vi.fn(() => null),
}));

// Import handlers AFTER setting up mocks
import { GET, POST } from './route';

// ---------------------------------------------------------------------------
// GET /api/appointments
// ---------------------------------------------------------------------------

describe('GET /api/appointments', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when user is not authenticated', async () => {
    mock.mockAuthError();

    const request = createRequest('/api/appointments');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe('No autenticado. Inicia sesión para continuar.');
  });

  it('returns 401 when getUser returns null user without error', async () => {
    const request = createRequest('/api/appointments');
    const response = await GET(request);
    const { status } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
  });

  it('returns patient appointments with pagination', async () => {
    const userId = 'patient-123';
    mock.mockAuthUser({ id: userId, email: 'patient@test.com' });

    const appointments = [
      {
        id: 'apt-1',
        doctor_id: 'doc-1',
        start_time: '2026-05-01T10:00:00Z',
        end_time: '2026-05-01T10:30:00Z',
        status: 'pendiente',
        type: 'presencial',
        motivo: 'Control general',
        notes: null,
        created_at: '2026-04-01T00:00:00Z',
        doctor: {
          id: 'doc-1',
          consultation_fee: 50,
          city: 'Caracas',
          profile: { first_name: 'Ana', last_name: 'Garcia', avatar_url: null },
          specialty: { id: 'sp-1', name: 'Cardiologia', icon: 'heart' },
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
    const { body } = await parseResponse<{
      pagination: { page_size: number };
    }>(response);

    expect(body.pagination.page_size).toBe(50);
  });

  it('clamps page to minimum 1', async () => {
    mock.mockAuthUser({ id: 'patient-123' });
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/appointments?page=-5');
    const response = await GET(request);
    const { body } = await parseResponse<{
      pagination: { page: number };
    }>(response);

    expect(body.pagination.page).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// POST /api/appointments
// ---------------------------------------------------------------------------

describe('POST /api/appointments', () => {
  // Valid UUIDs for Zod validation
  const validDoctorId = '11111111-1111-1111-1111-111111111111';
  const futureStart = new Date(Date.now() + 86_400_000).toISOString(); // tomorrow
  const futureEnd = new Date(Date.now() + 86_400_000 + 1_800_000).toISOString(); // tomorrow + 30min

  beforeEach(() => {
    mock.reset();
  });

  it('returns 401 when user is not authenticated', async () => {
    mock.mockAuthError();

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: futureStart, end_time: futureEnd },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(401);
    expect(body.error).toBe('No autenticado. Inicia sesión para continuar.');
  });

  it('returns 400 when required fields are missing (Zod validation)', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId }, // missing start_time and end_time
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; details?: string[] }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details).toBeDefined();
    expect(body.details!.length).toBeGreaterThan(0);
  });

  it('returns 400 when dates are invalid format', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: 'not-a-date', end_time: 'also-not' },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
  });

  it('returns 400 when start_time is after end_time', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: futureEnd, end_time: futureStart },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; details?: string[] }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details).toEqual(expect.arrayContaining([
      expect.stringContaining('start must be before end'),
    ]));
  });

  it('returns 400 when appointment is in the past', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    const pastStart = '2020-01-01T10:00:00Z';
    const pastEnd = '2020-01-01T10:30:00Z';

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: pastStart, end_time: pastEnd },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string; details?: string[] }>(response);

    expect(status).toBe(400);
    expect(body.error).toBe('Datos inválidos');
    expect(body.details).toEqual(expect.arrayContaining([
      expect.stringContaining('cannot book in the past'),
    ]));
  });

  it('returns 409 when time slot has a conflict', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    let callCount = 0;
    mock.client.from.mockImplementation(() => {
      callCount++;
      const chain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: (resolve: (v: unknown) => void) => {
          if (callCount === 1) {
            resolve({ data: [{ id: 'existing-apt' }], error: null });
          }
        },
      };
      return chain;
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: futureStart, end_time: futureEnd },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(409);
    expect(body.error).toBe('El horario seleccionado ya no está disponible.');
  });

  it('creates an appointment and returns 201', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    const createdAppointment = {
      id: 'apt-new',
      patient_id: 'patient-123',
      doctor_id: validDoctorId,
      start_time: futureStart,
      end_time: futureEnd,
      type: 'presencial',
      motivo: 'Consulta general',
      notes: null,
      status: 'pendiente',
    };

    let callCount = 0;
    mock.client.from.mockImplementation(() => {
      callCount++;
      const chain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: (resolve: (v: unknown) => void) => {
          if (callCount === 1) {
            resolve({ data: [], error: null });
          } else if (callCount === 2) {
            resolve({ data: createdAppointment, error: null });
          } else {
            resolve({ error: null });
          }
        },
      };
      return chain;
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: {
        doctor_id: validDoctorId,
        start_time: futureStart,
        end_time: futureEnd,
        motivo: 'Consulta general',
      },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ data: typeof createdAppointment }>(response);

    expect(status).toBe(201);
    expect(body.data).toEqual(createdAppointment);
  });

  it('returns 400 when request body is invalid JSON', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

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

  it('returns 500 when insert fails', async () => {
    mock.mockAuthUser({ id: 'patient-123' });

    let callCount = 0;
    mock.client.from.mockImplementation(() => {
      callCount++;
      const chain = {
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        neq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        lt: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
        single: vi.fn().mockReturnThis(),
        then: (resolve: (v: unknown) => void) => {
          if (callCount === 1) {
            resolve({ data: [], error: null });
          } else if (callCount === 2) {
            resolve({ data: null, error: { message: 'Insert failed' } });
          }
        },
      };
      return chain;
    });

    const request = createRequest('/api/appointments', {
      method: 'POST',
      body: { doctor_id: validDoctorId, start_time: futureStart, end_time: futureEnd },
    });
    const response = await POST(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toBe('Error al crear la cita.');
  });
});
