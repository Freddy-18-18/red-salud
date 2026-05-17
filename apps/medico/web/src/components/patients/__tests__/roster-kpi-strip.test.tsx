/**
 * @file __tests__/roster-kpi-strip.test.tsx
 * @description Behavior tests for the `<RosterKpiStrip>` header tile-strip
 * (Phase 3 / T-3-09).
 *
 * Mock surface: `useRosterKPIs` (the strip's only data dependency). We rewire
 * the module-scope state object per test so each scenario controls
 * `{ kpis, isLoading, error }` without re-mounting modules.
 *
 * Contract:
 * - Loading state renders 6 Skeleton tiles to prevent layout shift.
 * - Loaded state renders 6 KPI tiles, each showing its numeric value and
 *   accompanying label.
 * - When `followups_overdue > 0` the tile surfaces an "Atención" badge.
 */

import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { RosterKPIs } from '@red-salud/types';

const kpisState: {
  kpis: RosterKPIs | null;
  isLoading: boolean;
  error: { code: string; message: string } | null;
  refetch: () => Promise<unknown>;
} = {
  kpis: null,
  isLoading: false,
  error: null,
  refetch: async () => undefined,
};

vi.mock('@/hooks/use-roster-kpis', () => ({
  useRosterKPIs: () => kpisState,
}));

import { RosterKpiStrip } from '../roster-kpi-strip';

function resetState() {
  kpisState.kpis = null;
  kpisState.isLoading = false;
  kpisState.error = null;
  kpisState.refetch = async () => undefined;
}

const DOCTOR_ID = '00000000-0000-0000-0000-00000000d0c1';

describe('<RosterKpiStrip>', () => {
  beforeEach(resetState);

  it('renders 6 skeleton tiles when isLoading=true', () => {
    kpisState.isLoading = true;
    kpisState.kpis = null;
    const { container } = render(<RosterKpiStrip doctorId={DOCTOR_ID} />);

    // The Skeleton component from the design system renders an element with
    // either the role/data-* signal — we count the tile wrappers via the
    // grid's direct children. Loading state guarantees 6.
    const tileWrappers = container.querySelectorAll(
      '.grid > div.rounded-xl',
    );
    expect(tileWrappers.length).toBe(6);
  });

  it('renders 6 KPI tiles with their numeric values when kpis are loaded', () => {
    kpisState.isLoading = false;
    kpisState.kpis = {
      total_active: 142,
      new_this_month: 7,
      chronic_count: 23,
      followups_overdue: 0,
      expired_rx_count: 0,
      abnormal_labs_pending: 0,
    };

    render(<RosterKpiStrip doctorId={DOCTOR_ID} />);

    expect(screen.getByText('142')).toBeInTheDocument();
    expect(screen.getByText('Pacientes activos')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Nuevos este mes')).toBeInTheDocument();
    expect(screen.getByText('23')).toBeInTheDocument();
    expect(screen.getByText('Crónicos')).toBeInTheDocument();

    // The three zero-attention tiles all show "0" — assert their labels exist.
    expect(screen.getByText('Seguimientos vencidos')).toBeInTheDocument();
    expect(screen.getByText('Recetas vencidas')).toBeInTheDocument();
    expect(screen.getByText('Labs anormales pendientes')).toBeInTheDocument();
  });

  it('shows the "Atención" badge on Seguimientos vencidos when value > 0', () => {
    kpisState.isLoading = false;
    kpisState.kpis = {
      total_active: 100,
      new_this_month: 0,
      chronic_count: 0,
      followups_overdue: 4,
      expired_rx_count: 0,
      abnormal_labs_pending: 0,
    };

    render(<RosterKpiStrip doctorId={DOCTOR_ID} />);

    // The badge text is "Atención" — only the seguimientos tile should
    // surface it since the other tone-bearing tiles have value=0.
    const badges = screen.getAllByText(/Atención/);
    expect(badges.length).toBe(1);
  });
});
