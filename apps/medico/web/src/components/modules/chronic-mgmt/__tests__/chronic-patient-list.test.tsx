import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChronicPatientList } from '../chronic-patient-list';
import type { ChronicPatientSummary } from '@/lib/chronic/patient-resolver';

const PATIENTS: ChronicPatientSummary[] = [
  {
    patient_id: 'p1',
    full_name: 'Marianella Suárez',
    cedula: '13643562',
    tags: ['HTA'],
    activeGoalsCount: 1,
    reason: 'both',
    lastMeasurementAt: '2026-05-13T10:00:00.000Z',
  },
  {
    patient_id: 'p2',
    full_name: 'José Montilla',
    cedula: '9269229',
    tags: ['DM2', 'DISLIPIDEMIA'],
    activeGoalsCount: 0,
    reason: 'tag',
    lastMeasurementAt: null,
  },
];

describe('<ChronicPatientList />', () => {
  it('renders each chronic patient with name, cedula, and tag chips', () => {
    render(
      <ChronicPatientList
        patients={PATIENTS}
        selectedPatientId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Marianella Suárez')).toBeInTheDocument();
    expect(screen.getByText('José Montilla')).toBeInTheDocument();
    expect(screen.getByText('HTA')).toBeInTheDocument();
    expect(screen.getByText('DM2')).toBeInTheDocument();
    expect(screen.getByText('DISLIPIDEMIA')).toBeInTheDocument();
  });

  it('shows empty state when no chronic patients', () => {
    render(
      <ChronicPatientList
        patients={[]}
        selectedPatientId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/Sin pacientes crónicos/i)).toBeInTheDocument();
  });

  it('calls onSelect with the patient_id when a row is clicked', () => {
    const onSelect = vi.fn();
    render(
      <ChronicPatientList
        patients={PATIENTS}
        selectedPatientId={null}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByText('Marianella Suárez').closest('button')!);
    expect(onSelect).toHaveBeenCalledWith('p1');
  });

  it('marks the selected patient with aria-current="true"', () => {
    render(
      <ChronicPatientList
        patients={PATIENTS}
        selectedPatientId="p1"
        onSelect={vi.fn()}
      />,
    );
    const selected = screen.getByText('Marianella Suárez').closest('button');
    expect(selected).toHaveAttribute('aria-current', 'true');
  });

  it('shows active goals count when > 0', () => {
    render(
      <ChronicPatientList
        patients={PATIENTS}
        selectedPatientId={null}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/1 meta/i)).toBeInTheDocument();
  });
});
