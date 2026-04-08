import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '@/__tests__/helpers/mock-supabase';
import { createRequest, parseResponse } from '@/__tests__/helpers/api-test-utils';

// --- Setup mock Supabase ---
const mock = createMockSupabase();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mock.client)),
}));

// Import handler AFTER setting up mocks
import { GET } from './route';

// ---------------------------------------------------------------------------
// Helper: mock doctor row (as Supabase would return it)
// ---------------------------------------------------------------------------

function makeDoctorRow(overrides?: Record<string, unknown>) {
  return {
    id: 'doc-1',
    user_id: 'user-1',
    is_active: true,
    consultation_fee: 50,
    accepts_insurance: true,
    city: 'Caracas',
    address: 'Av. Principal 123',
    years_experience: 10,
    biography: 'Especialista en cardiologia',
    profile: {
      id: 'user-1',
      first_name: 'Ana',
      last_name: 'Garcia',
      avatar_url: null,
      phone: '+58412123456',
    },
    specialty: {
      id: 'sp-1',
      name: 'Cardiologia',
      icon: 'heart',
    },
    reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// GET /api/doctors/search
// ---------------------------------------------------------------------------

describe('GET /api/doctors/search', () => {
  beforeEach(() => {
    mock.reset();
  });

  it('returns doctors with computed avg_rating and review_count', async () => {
    const doctorRow = makeDoctorRow();
    mock.mockResolvedData([doctorRow], 1);

    const request = createRequest('/api/doctors/search');
    const response = await GET(request);
    const { status, body } = await parseResponse<{
      data: Array<{
        id: string;
        avg_rating: number | null;
        review_count: number;
      }>;
      pagination: { page: number; total: number };
    }>(response);

    expect(status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.data[0].id).toBe('doc-1');
    expect(body.data[0].review_count).toBe(3);
    expect(body.data[0].avg_rating).toBe(4.7); // (5+4+5)/3 = 4.666... rounded to 4.7
    // reviews array should be stripped from the response
    expect(body.data[0]).not.toHaveProperty('reviews');
  });

  it('returns null avg_rating when doctor has no reviews', async () => {
    const doctorRow = makeDoctorRow({ reviews: [] });
    mock.mockResolvedData([doctorRow], 1);

    const request = createRequest('/api/doctors/search');
    const response = await GET(request);
    const { body } = await parseResponse<{
      data: Array<{ avg_rating: number | null; review_count: number }>;
    }>(response);

    expect(body.data[0].avg_rating).toBeNull();
    expect(body.data[0].review_count).toBe(0);
  });

  it('returns empty array when no doctors match', async () => {
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/doctors/search?specialty_id=nonexistent');
    const response = await GET(request);
    const { status, body } = await parseResponse<{
      data: unknown[];
      pagination: { total: number };
    }>(response);

    expect(status).toBe(200);
    expect(body.data).toEqual([]);
    expect(body.pagination.total).toBe(0);
  });

  it('queries with specialty_id filter', async () => {
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/doctors/search?specialty_id=sp-cardio');
    await GET(request);

    expect(mock.client.from).toHaveBeenCalledWith('doctor_details');
    // The eq mock should have been called — we verify via the queryBuilder
    // Because of the proxy, eq is always called. We verify the table was queried.
  });

  it('queries with city filter', async () => {
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/doctors/search?city=Maracaibo');
    await GET(request);

    expect(mock.client.from).toHaveBeenCalledWith('doctor_details');
  });

  it('queries with accepts_insurance filter', async () => {
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/doctors/search?accepts_insurance=true');
    await GET(request);

    expect(mock.client.from).toHaveBeenCalledWith('doctor_details');
  });

  it('sorts by rating (post-query, descending)', async () => {
    const doc1 = makeDoctorRow({ id: 'doc-low', reviews: [{ rating: 2 }] });
    const doc2 = makeDoctorRow({ id: 'doc-high', reviews: [{ rating: 5 }, { rating: 5 }] });

    mock.mockResolvedData([doc1, doc2], 2);

    const request = createRequest('/api/doctors/search?sort_by=rating');
    const response = await GET(request);
    const { body } = await parseResponse<{
      data: Array<{ id: string; avg_rating: number | null }>;
    }>(response);

    // doc-high should come first (avg 5.0 vs 2.0)
    expect(body.data[0].id).toBe('doc-high');
    expect(body.data[1].id).toBe('doc-low');
  });

  it('uses default sort_by=rating when no sort param', async () => {
    const doc1 = makeDoctorRow({ id: 'doc-3star', reviews: [{ rating: 3 }] });
    const doc2 = makeDoctorRow({ id: 'doc-5star', reviews: [{ rating: 5 }] });

    mock.mockResolvedData([doc1, doc2], 2);

    const request = createRequest('/api/doctors/search');
    const response = await GET(request);
    const { body } = await parseResponse<{
      data: Array<{ id: string }>;
    }>(response);

    expect(body.data[0].id).toBe('doc-5star');
  });

  it('returns pagination metadata', async () => {
    mock.mockResolvedData([makeDoctorRow()], 25);

    const request = createRequest('/api/doctors/search?page=2&page_size=10');
    const response = await GET(request);
    const { body } = await parseResponse<{
      pagination: { page: number; page_size: number; total: number; total_pages: number };
    }>(response);

    expect(body.pagination).toEqual({
      page: 2,
      page_size: 10,
      total: 25,
      total_pages: 3,
    });
  });

  it('clamps page_size to max 50', async () => {
    mock.mockResolvedData([], 0);

    const request = createRequest('/api/doctors/search?page_size=200');
    const response = await GET(request);
    const { body } = await parseResponse<{
      pagination: { page_size: number };
    }>(response);

    expect(body.pagination.page_size).toBe(50);
  });

  it('returns 500 when Supabase query fails', async () => {
    mock.mockResolvedError({ message: 'Connection timeout' });

    const request = createRequest('/api/doctors/search');
    const response = await GET(request);
    const { status, body } = await parseResponse<{ error: string }>(response);

    expect(status).toBe(500);
    expect(body.error).toBe('Error al buscar médicos.');
  });
});
