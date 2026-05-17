/**
 * @file __tests__/vitals-trend-card.test.tsx
 * @description Behavior tests for `<VitalsTrendCard>` (T-2 / Phase 2).
 *
 * Contract:
 * - Dedupes to the last measurement per `metric_type_id` (insertion order
 *   wins as the hook returns ascending — so a later entry overwrites the
 *   previous one with the same type).
 * - Shows "Fuera de rango" badge + destructive border when `is_out_of_range`.
 * - Empty state when zero vitals.
 *
 * Mock surface: only `usePatientVitalsTrend`. The card has no own data fetch.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PatientVitalsTrendPoint } from '@red-salud/types';

const trendState: {
  vitals: PatientVitalsTrendPoint[];
  isLoading: boolean;
  error: { code: string; message: string } | null;
  refetch: ReturnType<typeof vi.fn>;
} = {
  vitals: [],
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks/use-patient-vitals-trend', () => ({
  usePatientVitalsTrend: () => trendState,
}));

import { VitalsTrendCard } from '../vitals-trend-card';

function resetState() {
  trendState.vitals = [];
  trendState.isLoading = false;
  trendState.error = null;
  trendState.refetch = vi.fn();
}

function makeVital(
  overrides: Partial<PatientVitalsTrendPoint> = {},
): PatientVitalsTrendPoint {
  return {
    id: '00000000-0000-0000-0000-0000000000v1',
    metric_type_id: 'mt-weight',
    metric_name: 'Peso',
    metric_unit: 'kg',
    metric_category: 'antropometria',
    valor: 70,
    valor_secundario: null,
    unidad_secundaria: null,
    measured_at: new Date().toISOString(),
    rango_minimo: 50,
    rango_maximo: 90,
    is_out_of_range: false,
    ...overrides,
  };
}

describe('<VitalsTrendCard>', () => {
  beforeEach(resetState);

  it('shows the last measurement per metric_type_id (dedupe by type)', () => {
    // Two readings of weight (mt-weight) — the later one wins.
    trendState.vitals = [
      makeVital({
        id: 'v-old',
        metric_type_id: 'mt-weight',
        metric_name: 'Peso',
        valor: 70,
      }),
      makeVital({
        id: 'v-new',
        metric_type_id: 'mt-weight',
        metric_name: 'Peso',
        valor: 72,
      }),
      makeVital({
        id: 'v-bp',
        metric_type_id: 'mt-bp',
        metric_name: 'Presión Arterial',
        metric_unit: 'mmHg',
        valor: 120,
        valor_secundario: 80,
      }),
    ];

    render(<VitalsTrendCard patientId="p-1" />);

    // 72 (latest weight) is rendered; 70 is not.
    expect(screen.getByText('72')).toBeInTheDocument();
    expect(screen.queryByText('70')).not.toBeInTheDocument();

    // Bidimensional BP rendered as "120/80".
    expect(screen.getByText('120/80')).toBeInTheDocument();
  });

  it('shows out-of-range badge for is_out_of_range vitals', () => {
    trendState.vitals = [
      makeVital({
        valor: 200,
        is_out_of_range: true,
      }),
    ];

    render(<VitalsTrendCard patientId="p-1" />);

    expect(screen.getByText(/Fuera de rango/i)).toBeInTheDocument();
  });

  it('renders empty state when no vitals', () => {
    trendState.vitals = [];
    render(<VitalsTrendCard patientId="p-1" />);

    expect(screen.getByText(/Sin mediciones recientes/i)).toBeInTheDocument();
  });
});
