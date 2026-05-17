/**
 * @file __tests__/patient-detail.test.tsx
 * @description Behavior tests for the Phase 2 `<PatientDetail>` (T-2 verify).
 *
 * Phase 2 changes the surface dramatically:
 * - 8 tabs (Resumen, Vitales, Consultas, Recetas, Labs, Vacunas, Familia, Info)
 *   instead of the old 4-tab layout.
 * - Data fetching is via hooks (`usePatientFull` + `usePatientClinicalOverview`),
 *   not direct supabase chained queries.
 * - Each tab is a child panel with its own data lifecycle.
 *
 * Strategy for these tests:
 * - Mock `next/navigation` for router stubs.
 * - Mock the two top-level hooks (`usePatientFull`, `usePatientClinicalOverview`).
 * - Mock every child panel as a `data-testid` placeholder. This shrinks blast
 *   radius — a regression in (e.g.) `<LabResultsPanel>` should fail its own
 *   test, not ours.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { PatientFull } from '@red-salud/types';

// Supabase client is imported transitively by hooks (e.g. usePatientVitalsTrend).
// Stub it out so the module graph doesn't reach createBrowserClient (which needs
// NEXT_PUBLIC_SUPABASE_URL at module load).
vi.mock('@/lib/supabase/client', () => ({
  supabase: {} as object,
}));

// next/navigation router mock — capture push/back/refresh.
const back = vi.fn();
const push = vi.fn();
const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push, refresh }),
}));

// usePatientFull mock — mutable state per test.
const patientFullState: {
  patient: PatientFull | null;
  isLoading: boolean;
  error: { code: string; message: string } | null;
  refetch: ReturnType<typeof vi.fn>;
} = {
  patient: null,
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};
vi.mock('@/hooks/use-patient-full', () => ({
  usePatientFull: () => patientFullState,
}));

// usePatientClinicalOverview mock — keep simple, banner is also mocked below.
const overviewState: {
  overview: { next_appointment_at: string | null } | null;
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

// usePatientVitalsTrend is used inline by the Vitales tab's <VitalsHistoryTab>.
// Mock it to keep the parent independent of TanStack Query plumbing in tests.
const vitalsTrendState: {
  vitals: unknown[];
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
  usePatientVitalsTrend: () => vitalsTrendState,
}));

// Child panel mocks — each gets a stable testid so we can assert visibility.
vi.mock('../clinical-safety-banner', () => ({
  ClinicalSafetyBanner: () => <div data-testid="banner-mock" />,
}));
vi.mock('../active-medications-card', () => ({
  ActiveMedicationsCard: () => <div data-testid="active-meds-mock" />,
}));
vi.mock('../active-prescriptions-panel', () => ({
  ActivePrescriptionsPanel: () => <div data-testid="active-rx-mock" />,
}));
vi.mock('../computed-alerts-panel', () => ({
  ComputedAlertsPanel: () => <div data-testid="alerts-mock" />,
}));
vi.mock('../edit-clinical-fields-dialog', () => ({
  EditClinicalFieldsDialog: () => <div data-testid="edit-dialog-mock" />,
}));
vi.mock('../family-history-panel', () => ({
  FamilyHistoryPanel: () => <div data-testid="family-mock" />,
}));
vi.mock('../info-panel', () => ({
  InfoPanel: () => <div data-testid="info-mock" />,
}));
vi.mock('../lab-results-panel', () => ({
  LabResultsPanel: () => <div data-testid="labs-mock" />,
}));
vi.mock('../vaccinations-panel', () => ({
  VaccinationsPanel: () => <div data-testid="vaccines-mock" />,
}));
vi.mock('../visit-timeline', () => ({
  VisitTimeline: () => <div data-testid="visits-mock" />,
}));
vi.mock('../vitals-trend-card', () => ({
  VitalsTrendCard: () => <div data-testid="vitals-card-mock" />,
}));

import { PatientDetail } from '../patient-detail';

function resetAll() {
  back.mockReset();
  push.mockReset();
  refresh.mockReset();
  patientFullState.patient = null;
  patientFullState.isLoading = false;
  patientFullState.error = null;
  patientFullState.refetch = vi.fn();
  overviewState.overview = null;
  overviewState.isLoading = false;
  overviewState.error = null;
  overviewState.refetch = vi.fn();
  vitalsTrendState.vitals = [];
  vitalsTrendState.isLoading = false;
  vitalsTrendState.error = null;
  vitalsTrendState.refetch = vi.fn();
}

function makePatient(overrides: Partial<PatientFull> = {}): PatientFull {
  return {
    id: '00000000-0000-0000-0000-000000000001',
    full_name: 'María Pérez',
    email: null,
    national_id: 'V-12345678',
    phone: null,
    date_of_birth: '1985-03-15',
    gender: null,
    city: null,
    state: null,
    nationality: null,
    avatar_url: null,
    patient_details: null,
    ...overrides,
  };
}

describe('<PatientDetail> (Phase 2)', () => {
  beforeEach(resetAll);

  it('renders header skeleton when usePatientFull.isLoading=true', () => {
    patientFullState.isLoading = true;
    const { container } = render(<PatientDetail patientId="p-1" />);
    const skeletons = container.querySelectorAll(
      '[data-testid="patient-detail-skeleton"]',
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders inline error with retry when usePatientFull.error is set', () => {
    patientFullState.error = {
      code: 'rls_violation',
      message: 'No tenés permiso.',
    };
    const refetchSpy = vi.fn();
    patientFullState.refetch = refetchSpy;
    render(<PatientDetail patientId="p-1" />);

    expect(screen.getByText(/No tenés permiso\./i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Reintentá/i }));
    expect(refetchSpy).toHaveBeenCalledTimes(1);
  });

  it('renders "Paciente no encontrado" when patient null + not loading', () => {
    patientFullState.patient = null;
    patientFullState.isLoading = false;
    patientFullState.error = null;
    render(<PatientDetail patientId="missing-id" />);

    expect(screen.getByText(/Paciente no encontrado/i)).toBeInTheDocument();
  });

  it('renders header + banner + tab nav + Resumen panel by default', () => {
    patientFullState.patient = makePatient({ full_name: 'María Pérez' });
    render(<PatientDetail patientId="p-1" />);

    // Header.
    expect(screen.getByText('María Pérez')).toBeInTheDocument();
    // Banner (mocked).
    expect(screen.getByTestId('banner-mock')).toBeInTheDocument();
    // Default tab = Resumen → ComputedAlertsPanel + VitalsTrendCard + ActiveMedicationsCard.
    expect(screen.getByTestId('alerts-mock')).toBeInTheDocument();
    expect(screen.getByTestId('vitals-card-mock')).toBeInTheDocument();
    expect(screen.getByTestId('active-meds-mock')).toBeInTheDocument();
    // Tab nav exists with all 8 tabs.
    expect(screen.getByRole('button', { name: /Resumen/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vitales/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Consultas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Recetas/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Laboratorios/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Vacunas/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Familia/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Información/i }),
    ).toBeInTheDocument();
  });

  it('switches active panel when a tab is clicked (Vitales -> VitalsHistoryTab)', () => {
    patientFullState.patient = makePatient();
    render(<PatientDetail patientId="p-1" />);

    // Click "Vitales" tab — the panel renders the window selector (30/90/365)
    // around a mocked VitalsTrendCard. The selector buttons (e.g. "1 año")
    // are unique to that tab.
    fireEvent.click(screen.getByRole('button', { name: /Vitales/i }));

    expect(
      screen.getByRole('button', { name: /^1 año$/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Histórico de mediciones/i),
    ).toBeInTheDocument();
  });
});
