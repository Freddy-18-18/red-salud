import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChronicPatientDetail } from '../chronic-patient-detail';
import type { ChronicPatientSummary } from '@/lib/chronic/patient-resolver';

const PATIENT: ChronicPatientSummary = {
  patient_id: 'p1',
  full_name: 'Marianella Suárez',
  cedula: '13643562',
  tags: ['HTA'],
  activeGoalsCount: 0,
  reason: 'tag',
  lastMeasurementAt: null,
};

describe('<ChronicPatientDetail />', () => {
  it('renders the patient header with name + cedula + tags', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={{ metrics: [], goals: [], metricTypes: [], alerts: [] }}
        detailLoading={false}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    expect(screen.getByText('Marianella Suárez')).toBeInTheDocument();
    expect(screen.getByText(/CI 13643562/)).toBeInTheDocument();
    expect(screen.getByText(/HTA/)).toBeInTheDocument();
  });

  it('shows the 3 tabs (Métricas, Metas, Alertas)', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={{ metrics: [], goals: [], metricTypes: [], alerts: [] }}
        detailLoading={false}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    expect(screen.getByRole('tab', { name: /Métricas/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Metas/ })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Alertas/ })).toBeInTheDocument();
  });

  it('defaults to the Métricas tab', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={{ metrics: [], goals: [], metricTypes: [], alerts: [] }}
        detailLoading={false}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    expect(screen.getByRole('tab', { name: /Métricas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('switches to Metas tab when clicked', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={{ metrics: [], goals: [], metricTypes: [], alerts: [] }}
        detailLoading={false}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('tab', { name: /Metas/ }));
    expect(screen.getByRole('tab', { name: /Metas/ })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('shows alert count badge in header when alerts > 0', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={{
          metrics: [],
          goals: [],
          metricTypes: [],
          alerts: [
            {
              metric_type_id: 'mt-sys',
              metric_type_name: 'Presión Sistólica',
              value: 180,
              measured_at: '2026-05-13',
              severity: 'severe',
              effectiveMax: 140,
              via: 'default',
            },
          ],
        }}
        detailLoading={false}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    expect(screen.getByText(/1 alerta/i)).toBeInTheDocument();
  });

  it('shows loading state when detailLoading=true', () => {
    render(
      <ChronicPatientDetail
        patient={PATIENT}
        detail={null}
        detailLoading={true}
        onCreateGoal={vi.fn()}
        onUpdateGoalStatus={vi.fn()}
      />,
    );
    expect(screen.getByText(/Cargando/)).toBeInTheDocument();
  });
});
