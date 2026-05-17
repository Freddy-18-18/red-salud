/**
 * @file __tests__/visit-timeline.test.tsx
 * @description Behavior tests for `<VisitTimeline>` (T-2 / Phase 2).
 *
 * Contract:
 * - Empty state renders when zero medical_records.
 * - Rows group by month (es-VE) — month headers are visible.
 * - On query error, renders inline notice + Reintentá button.
 *
 * Mock surface: the `supabase` client at `@/lib/supabase/client`. The component
 * builds its own chained query (`from(...).select(...).eq(...).is(...).order(...)`)
 * so the stub mirrors that exact shape. We control the awaited terminal value
 * per test via a mutable script.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

interface MedicalRecordRow {
  id: string;
  created_at: string;
  diagnosis: string | null;
  observations: string | null;
}

// Mutable script the supabase stub reads from for each fetch.
const script: {
  next: () => Promise<{
    data: MedicalRecordRow[] | null;
    error: { message: string } | null;
  }>;
} = {
  next: async () => ({ data: [], error: null }),
};

vi.mock('@/lib/supabase/client', () => {
  // The component chain is .from(t).select(c).eq(col,val).is(col,null).order(col,opt).
  // We expose a final `order(...)` that resolves from the script.
  return {
    supabase: {
      from: () => ({
        select: () => ({
          eq: () => ({
            is: () => ({
              order: () => script.next(),
            }),
          }),
        }),
      }),
    },
  };
});

import { VisitTimeline } from '../visit-timeline';

function wrapper(qc: QueryClient) {
  return ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children);
}

function makeQc() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('<VisitTimeline>', () => {
  beforeEach(() => {
    script.next = async () => ({ data: [], error: null });
  });

  it('renders empty state when no medical records', async () => {
    const qc = makeQc();
    render(<VisitTimeline patientId="p-1" />, { wrapper: wrapper(qc) });

    await waitFor(() => {
      expect(
        screen.getByText(/Sin consultas registradas/i),
      ).toBeInTheDocument();
    });
  });

  it('groups consultations by month (es-VE) and renders month headers', async () => {
    script.next = async () => ({
      data: [
        {
          id: 'r-1',
          created_at: '2026-04-15T14:00:00Z',
          diagnosis: 'Hipertensión',
          observations: null,
        },
        {
          id: 'r-2',
          created_at: '2026-04-02T09:00:00Z',
          diagnosis: 'Control',
          observations: null,
        },
        {
          id: 'r-3',
          created_at: '2026-03-10T11:30:00Z',
          diagnosis: 'Resfrío común',
          observations: null,
        },
      ],
      error: null,
    });

    const qc = makeQc();
    render(<VisitTimeline patientId="p-1" />, { wrapper: wrapper(qc) });

    await waitFor(() => {
      expect(screen.getByText('Hipertensión')).toBeInTheDocument();
    });
    expect(screen.getByText('Control')).toBeInTheDocument();
    expect(screen.getByText('Resfrío común')).toBeInTheDocument();

    // Month headers exist — es-VE format is "abril de 2026" / "marzo de 2026"
    // (capitalized by `capitalize`). We assert via case-insensitive regex.
    expect(screen.getByText(/Abril de 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Marzo de 2026/i)).toBeInTheDocument();
  });

  it('renders inline error with Reintentá on query failure', async () => {
    script.next = async () => ({
      data: null,
      error: { message: 'permission denied for table medical_records' },
    });

    const qc = makeQc();
    render(<VisitTimeline patientId="p-1" />, { wrapper: wrapper(qc) });

    await waitFor(() => {
      // Error message bubbled from the thrown Error in queryFn.
      expect(
        screen.getByText(/permission denied for table medical_records/i),
      ).toBeInTheDocument();
    });

    // Retry button rebinds the same script — we don't assert refetch fires,
    // only that the button exists and is clickable.
    const retry = screen.getByRole('button', { name: /Reintentá/i });
    expect(retry).toBeInTheDocument();
    fireEvent.click(retry);
  });
});
