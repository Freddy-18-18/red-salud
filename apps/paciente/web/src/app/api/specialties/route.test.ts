import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase ---
const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

// Import the handler AFTER setting up mocks
import { GET } from './route';

// ---------------------------------------------------------------------------
// GET /api/specialties
// ---------------------------------------------------------------------------

describe('GET /api/specialties', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns all specialties sorted by name', async () => {
    const specialties = [
      { id: '1', name: 'Cardiologia', icon: 'heart', description: 'Corazon' },
      { id: '2', name: 'Pediatria', icon: 'baby', description: 'Ninos' },
    ];

    mock.mockResolvedData(specialties);

    const request = createRequest('/api/specialties');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ data: typeof specialties }>(response);

    expect(status).toBe(200);
    expect(body.data).toEqual(specialties);
    expect(mock.client.from).toHaveBeenCalledWith('medical_specialties');
  });

  it('returns empty array when no specialties exist', async () => {
    mock.mockResolvedData([]);

    const request = createRequest('/api/specialties');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ data: unknown[] }>(response);

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it('returns 500 when Supabase query fails', async () => {
    mock.mockResolvedError({ message: 'DB connection failed' });

    const request = createRequest('/api/specialties');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toBe('Error al obtener especialidades.');
  });

  describe('with_doctors=true filter', () => {
    it('returns only specialties that have active doctors', async () => {
      // The route makes TWO queries when with_doctors=true:
      // 1. doctor_details to get specialty IDs
      // 2. medical_specialties filtered by those IDs
      //
      // Since our mock resolves the same value for any chain,
      // we test the flow by setting data for the first call,
      // then the second call.

      const doctorSpecialties = [
        { specialty_id: 'sp-1' },
        { specialty_id: 'sp-1' },
        { specialty_id: 'sp-2' },
      ];

      const filteredSpecialties = [
        { id: 'sp-1', name: 'Cardiologia', icon: 'heart', description: null },
        { id: 'sp-2', name: 'Neurologia', icon: 'brain', description: null },
      ];

      // First call: doctor_details query
      mock.mockResolvedData(doctorSpecialties);

      // We need to switch data between calls. Use a counter approach.
      let callCount = 0;
      mock.client.from.mockImplementation((table: string) => {
        callCount++;
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          then: (resolve: (v: unknown) => void) => {
            if (callCount === 1) {
              // First query: doctor_details
              expect(table).toBe('doctor_details');
              resolve({ data: doctorSpecialties, error: null });
            } else {
              // Second query: medical_specialties
              expect(table).toBe('medical_specialties');
              resolve({ data: filteredSpecialties, error: null });
            }
          },
        };
        return chain;
      });

      const request = createRequest('/api/specialties?with_doctors=true');
      const response = await GET(request);
      const { status, body } = await parseResponse<{ data: typeof filteredSpecialties }>(response);

      expect(status).toBe(200);
      expect(body.data).toEqual(filteredSpecialties);
    });

    it('returns empty array when no doctors are active', async () => {
      mock.client.from.mockImplementation(() => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          in: vi.fn().mockReturnThis(),
          order: vi.fn().mockReturnThis(),
          then: (resolve: (v: unknown) => void) => {
            resolve({ data: [], error: null });
          },
        };
        return chain;
      });

      const request = createRequest('/api/specialties?with_doctors=true');
      const response = await GET(request);
      const { status, body } = await parseResponse<{ data: unknown[] }>(response);

      expect(status).toBe(200);
      expect(body.data).toEqual([]);
    });

    it('returns 500 when doctor_details query fails', async () => {
      mock.client.from.mockImplementation(() => {
        const chain = {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: (resolve: (v: unknown) => void) => {
            resolve({ data: null, error: { message: 'DB error' } });
          },
        };
        return chain;
      });

      const request = createRequest('/api/specialties?with_doctors=true');
      const response = await GET(request);
      const { status, body } = await parseResponse<{ error: string }>(response);

      expect(status).toBe(500);
      expect(body.error).toBe('Error al obtener especialidades.');
    });
  });
});
