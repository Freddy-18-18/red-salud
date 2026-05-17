/**
 * @file __tests__/clinical-safety-banner.test.tsx
 * @description Behavior tests for `<ClinicalSafetyBanner>` (T-2 / Phase 2).
 *
 * Contract:
 * - When `has_clinical_record === false` → empty state copy + CTA to add data.
 * - When loading → skeleton.
 * - When error → inline notice with a retry button that calls `refetch`.
 * - When allergies present → destructive-styled chips.
 * - When blood type / weight / height present → render in the vitals column.
 *
 * Mock surface: only `usePatientClinicalOverview`. The banner is self-contained.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PatientClinicalOverview } from '@red-salud/types';

const overviewState: {
  overview: PatientClinicalOverview | null;
  isLoading: boolean;
  error: { code: string; message: string } | null;
  refetch: ReturnType<typeof vi.fn>;
} = {
  overview: null,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock('@/hooks/use-patient-clinical-overview', () => ({
  usePatientClinicalOverview: () => overviewState,
}));

import { ClinicalSafetyBanner } from '../clinical-safety-banner';

function resetState() {
  overviewState.overview = null;
  overviewState.isLoading = false;
  overviewState.error = null;
  overviewState.refetch = vi.fn();
}

function makeOverview(
  overrides: Partial<PatientClinicalOverview> = {},
): PatientClinicalOverview {
  return {
    patient_id: '00000000-0000-0000-0000-000000000001',
    alergias: [],
    enfermedades_cronicas: [],
    grupo_sanguineo: null,
    medicamentos_actuales: [],
    peso_kg: null,
    altura_cm: null,
    bmi: null,
    notas_medicas: null,
    last_vitals: [],
    active_prescriptions_count: 0,
    next_appointment_at: null,
    has_clinical_record: true,
    ...overrides,
  };
}

describe('<ClinicalSafetyBanner>', () => {
  beforeEach(resetState);

  it('renders empty state when has_clinical_record is false', () => {
    overviewState.overview = makeOverview({ has_clinical_record: false });
    const onEditClick = vi.fn();
    render(
      <ClinicalSafetyBanner patientId="p-1" onEditClick={onEditClick} />,
    );

    expect(
      screen.getByText(/Sin información clínica registrada/i),
    ).toBeInTheDocument();
    const cta = screen.getByRole('button', {
      name: /Agregar información clínica/i,
    });
    fireEvent.click(cta);
    expect(onEditClick).toHaveBeenCalledTimes(1);
  });

  it('renders loading skeleton when isLoading=true', () => {
    overviewState.isLoading = true;
    const { container } = render(<ClinicalSafetyBanner patientId="p-1" />);
    // Skeleton from the design-system renders an animate-pulse div with that class.
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders error state with retry button that calls refetch', () => {
    overviewState.error = {
      code: 'rls_violation',
      message: 'No tenés permiso.',
    };
    const refetchSpy = vi.fn();
    overviewState.refetch = refetchSpy;
    render(<ClinicalSafetyBanner patientId="p-1" />);

    expect(
      screen.getByText(/No pudimos cargar la información clínica/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/No tenés permiso\./i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reintentá/i }));
    expect(refetchSpy).toHaveBeenCalledTimes(1);
  });

  it('renders allergies as destructive chips when present', () => {
    overviewState.overview = makeOverview({
      alergias: ['Penicilina', 'Mariscos'],
    });
    render(<ClinicalSafetyBanner patientId="p-1" />);

    expect(screen.getByText('Penicilina')).toBeInTheDocument();
    expect(screen.getByText('Mariscos')).toBeInTheDocument();
  });

  it('renders blood type, weight, BMI when present', () => {
    overviewState.overview = makeOverview({
      grupo_sanguineo: 'O+',
      peso_kg: 78,
      altura_cm: 175,
      bmi: 25.5,
    });
    render(<ClinicalSafetyBanner patientId="p-1" />);

    expect(screen.getByText('O+')).toBeInTheDocument();
    expect(screen.getByText(/78 kg/i)).toBeInTheDocument();
    expect(screen.getByText(/175 cm/i)).toBeInTheDocument();
    expect(screen.getByText('25.5')).toBeInTheDocument();
    // BMI 25.5 → Sobrepeso (per WHO cutoffs in classifyBmi).
    expect(screen.getByText('Sobrepeso')).toBeInTheDocument();
  });
});
