/**
 * @file __tests__/use-patient-roster.test.ts
 * @description Behavior tests for the patient roster hook (T-1-07 / REQ-1.3,
 * REQ-1.5). The hook wraps `listPatientsForDoctor` via TanStack React Query.
 *
 * Contract:
 * - Returns `{ patients, isLoading, error, refetch }`.
 * - Query key includes `doctorId`, `locationId`, `search` (cache isolation
 *   per design §3).
 * - Disabled when `doctorId` is null (no fetch fires).
 * - On service error, exposes the `ServiceError.message` via `error`.
 *
 * The service is mocked via `vi.mock` so the hook test stays pure and the
 * Supabase query-builder shape is irrelevant here.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

const listPatientsForDoctorMock = vi.fn();

vi.mock('@/lib/supabase/services/patients-service', () => ({
  listPatientsForDoctor: (...args: unknown[]) => listPatientsForDoctorMock(...args),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {} as object,
}));

import { usePatientRoster } from '../use-patient-roster';

function wrapper({ queryClient }: { queryClient: QueryClient }) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('usePatientRoster', () => {
  beforeEach(() => {
    listPatientsForDoctorMock.mockReset();
  });

  afterEach(() => {
    listPatientsForDoctorMock.mockReset();
  });

  it('does not fetch when doctorId is null (enabled=false)', () => {
    const queryClient = makeClient();
    renderHook(() => usePatientRoster({ doctorId: null }), {
      wrapper: wrapper({ queryClient }),
    });

    expect(listPatientsForDoctorMock).not.toHaveBeenCalled();
  });

  it('returns patients on success and exposes refetch', async () => {
    const rows = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'María Pérez',
        national_id: 'V-12345678',
        phone: null,
        date_of_birth: null,
        avatar_url: null,
        last_visit_at: null,
        next_appointment_at: null,
        total_visits: 0,
      },
    ];
    listPatientsForDoctorMock.mockResolvedValueOnce({ data: rows, error: null });

    const queryClient = makeClient();
    const { result } = renderHook(
      () =>
        usePatientRoster({
          doctorId: '00000000-0000-0000-0000-0000000000aa',
        }),
      { wrapper: wrapper({ queryClient }) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.patients).toHaveLength(1);
    expect(result.current.patients[0].full_name).toBe('María Pérez');
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  it('exposes the ServiceError message when the service returns error', async () => {
    listPatientsForDoctorMock.mockResolvedValueOnce({
      data: null,
      error: { code: 'rls_violation', message: 'No tenés permiso.' },
    });

    const queryClient = makeClient();
    const { result } = renderHook(
      () =>
        usePatientRoster({
          doctorId: '00000000-0000-0000-0000-0000000000aa',
        }),
      { wrapper: wrapper({ queryClient }) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.patients).toEqual([]);
    expect(result.current.error).not.toBeNull();
    expect(result.current.error?.message).toBe('No tenés permiso.');
  });

  it('isolates cache per (doctorId, locationId, search)', async () => {
    listPatientsForDoctorMock.mockResolvedValue({ data: [], error: null });
    const queryClient = makeClient();

    renderHook(
      () =>
        usePatientRoster({
          doctorId: 'doc-1',
          locationId: 'sede-a',
          search: 'maria',
        }),
      { wrapper: wrapper({ queryClient }) },
    );
    renderHook(
      () =>
        usePatientRoster({
          doctorId: 'doc-1',
          locationId: 'sede-b',
          search: 'maria',
        }),
      { wrapper: wrapper({ queryClient }) },
    );

    await waitFor(() => {
      expect(listPatientsForDoctorMock).toHaveBeenCalledTimes(2);
    });

    const cacheKeys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey);
    expect(cacheKeys).toContainEqual([
      'patients',
      'roster',
      'doc-1',
      'sede-a',
      'maria',
    ]);
    expect(cacheKeys).toContainEqual([
      'patients',
      'roster',
      'doc-1',
      'sede-b',
      'maria',
    ]);
  });
});
