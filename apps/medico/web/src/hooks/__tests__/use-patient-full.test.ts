/**
 * @file __tests__/use-patient-full.test.ts
 * @description Behavior tests for the single-patient detail hook (T-1-09 /
 * REQ-1.3, REQ-1.5). The hook wraps `getPatientFullById` via TanStack React
 * Query.
 *
 * Contract:
 * - Returns `{ patient, isLoading, error, refetch }`.
 * - Query key includes `patientId` (cache isolation per design §3).
 * - Disabled when `patientId` is null.
 * - On service error, exposes the `ServiceError.message` via `error`.
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';

const getPatientFullByIdMock = vi.fn();

vi.mock('@/lib/supabase/services/patients-service', () => ({
  getPatientFullById: (...args: unknown[]) => getPatientFullByIdMock(...args),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: {} as object,
}));

import { usePatientFull } from '../use-patient-full';

function wrapper({ queryClient }: { queryClient: QueryClient }) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
}

function makeClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('usePatientFull', () => {
  beforeEach(() => {
    getPatientFullByIdMock.mockReset();
  });

  afterEach(() => {
    getPatientFullByIdMock.mockReset();
  });

  it('does not fetch when patientId is null (enabled=false)', () => {
    const queryClient = makeClient();
    renderHook(() => usePatientFull({ patientId: null }), {
      wrapper: wrapper({ queryClient }),
    });

    expect(getPatientFullByIdMock).not.toHaveBeenCalled();
  });

  it('returns patient on success', async () => {
    const row = {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Carlos Rodríguez',
      email: null,
      national_id: 'V-87654321',
      phone: null,
      date_of_birth: '1970-11-20',
      gender: null,
      city: 'Caracas',
      state: 'Distrito Capital',
      nationality: null,
      avatar_url: null,
      patient_details: null,
    };
    getPatientFullByIdMock.mockResolvedValueOnce({ data: row, error: null });

    const queryClient = makeClient();
    const { result } = renderHook(
      () =>
        usePatientFull({
          patientId: '00000000-0000-0000-0000-000000000003',
        }),
      { wrapper: wrapper({ queryClient }) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.patient?.id).toBe(row.id);
    expect(result.current.patient?.national_id).toBe('V-87654321');
    expect(result.current.error).toBeNull();
  });

  it('exposes ServiceError message when the service returns error', async () => {
    getPatientFullByIdMock.mockResolvedValueOnce({
      data: null,
      error: { code: 'not_found', message: 'No encontramos al paciente.' },
    });

    const queryClient = makeClient();
    const { result } = renderHook(
      () =>
        usePatientFull({
          patientId: '00000000-0000-0000-0000-00000000dead',
        }),
      { wrapper: wrapper({ queryClient }) },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.patient).toBeNull();
    expect(result.current.error?.code).toBe('not_found');
    expect(result.current.error?.message).toBe('No encontramos al paciente.');
  });

  it('isolates cache per patientId', async () => {
    getPatientFullByIdMock.mockResolvedValue({
      data: {
        id: 'p',
        full_name: 'P',
        email: null,
        national_id: null,
        phone: null,
        date_of_birth: null,
        gender: null,
        city: null,
        state: null,
        nationality: null,
        avatar_url: null,
        patient_details: null,
      },
      error: null,
    });
    const queryClient = makeClient();

    renderHook(() => usePatientFull({ patientId: 'patient-a' }), {
      wrapper: wrapper({ queryClient }),
    });
    renderHook(() => usePatientFull({ patientId: 'patient-b' }), {
      wrapper: wrapper({ queryClient }),
    });

    await waitFor(() => {
      expect(getPatientFullByIdMock).toHaveBeenCalledTimes(2);
    });

    const cacheKeys = queryClient
      .getQueryCache()
      .getAll()
      .map((q) => q.queryKey);
    expect(cacheKeys).toContainEqual(['patients', 'detail', 'patient-a']);
    expect(cacheKeys).toContainEqual(['patients', 'detail', 'patient-b']);
  });
});
