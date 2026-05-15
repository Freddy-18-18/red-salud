/**
 * @file __tests__/patient-detail.test.tsx
 * @description Behavior tests for the tokenized + route-split `<PatientDetail>`
 * component (T-1-14 / REQ-1.3, REQ-1.6, REQ-1.7).
 *
 * Contract under test:
 * - Loading state renders skeleton rows (data-testid).
 * - Patient not found renders "Paciente no encontrado" + Volver button which
 *   calls `router.back()`.
 * - Tab switching activates each of the 4 tab panels in turn.
 * - When the Historia (medical_records) fetch fails, the Historia tab shows
 *   a visible inline error notice (no silent swallow — REQ-1.3 / SC-1.3).
 * - REQ-1.2: no `themeColor` prop accepted; no `onBack` callback either —
 *   navigation is via router.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import type { Mock } from 'vitest';

// next/navigation router mock — capture push/back per test.
const back = vi.fn();
const push = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ back, push }),
}));

// Mock the core hook usePatientAppointments. We swap its return value per
// test via the exposed mutable holder below.
const usePatientAppointmentsState: {
  appointments: Array<{
    id: string;
    scheduled_at: string;
    reason: string | null;
    status: string;
  }>;
  loading: boolean;
} = { appointments: [], loading: false };
vi.mock('@red-salud/core', () => ({
  usePatientAppointments: () => usePatientAppointmentsState,
}));

// Mock the supabase client surface. Each test pre-arms `fromMock` with a
// table-keyed response. Chained calls (.select.eq.single / .select.eq.order.limit)
// resolve from the same dispatch.
type ProfileResponse = {
  data: Record<string, unknown> | null;
  error: { message: string } | null;
};
type ListResponse = {
  data: Array<Record<string, unknown>> | null;
  error: { message: string } | null;
};
const supabaseResponses: {
  profiles: ProfileResponse;
  medical_records: ListResponse;
  prescriptions: ListResponse;
} = {
  profiles: { data: null, error: null },
  medical_records: { data: [], error: null },
  prescriptions: { data: [], error: null },
};

vi.mock('@/lib/supabase/client', () => {
  const buildSingleChain = (response: ProfileResponse) => ({
    eq: () => ({
      single: () => Promise.resolve(response),
    }),
  });
  const buildListChain = (response: ListResponse) => ({
    eq: () => ({
      order: () => ({
        limit: () => Promise.resolve(response),
      }),
    }),
  });

  return {
    supabase: {
      from: (table: string) => {
        if (table === 'profiles') {
          return { select: () => buildSingleChain(supabaseResponses.profiles) };
        }
        if (table === 'medical_records') {
          return {
            select: () => buildListChain(supabaseResponses.medical_records),
          };
        }
        if (table === 'prescriptions') {
          return {
            select: () => buildListChain(supabaseResponses.prescriptions),
          };
        }
        return { select: () => ({}) };
      },
    },
  };
});

import { PatientDetail } from '../patient-detail';

async function flush() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function resetAll() {
  back.mockReset();
  push.mockReset();
  usePatientAppointmentsState.appointments = [];
  usePatientAppointmentsState.loading = false;
  supabaseResponses.profiles = { data: null, error: null };
  supabaseResponses.medical_records = { data: [], error: null };
  supabaseResponses.prescriptions = { data: [], error: null };
}

describe('<PatientDetail>', () => {
  beforeEach(resetAll);

  it('renders skeleton when loading', () => {
    usePatientAppointmentsState.loading = true;
    const { container } = render(<PatientDetail patientId="p-1" />);
    const skeletons = container.querySelectorAll(
      '[data-testid="patient-detail-skeleton"]',
    );
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders "Paciente no encontrado" and Volver button calls router.back()', async () => {
    supabaseResponses.profiles = { data: null, error: null };
    render(<PatientDetail patientId="missing-id" />);
    await flush();
    await flush();

    expect(screen.getByText(/Paciente no encontrado/i)).toBeInTheDocument();
    const back_button = screen.getByRole('button', { name: /Volver/i });
    fireEvent.click(back_button);
    expect(back).toHaveBeenCalledTimes(1);
  });

  it('switches between the 4 tabs without crashing', async () => {
    supabaseResponses.profiles = {
      data: {
        id: 'p-1',
        full_name: 'María Pérez',
        email: null,
        national_id: 'V-12345678',
        phone: null,
        date_of_birth: '1985-03-15',
        gender: null,
        city: null,
        state: null,
        avatar_url: null,
      },
      error: null,
    };
    render(<PatientDetail patientId="p-1" />);
    await flush();
    await flush();

    // Info tab is the default — full_name should be visible in the Info grid.
    expect(screen.getAllByText('María Pérez').length).toBeGreaterThan(0);

    const historiaTab = screen.getByRole('button', { name: /Historia/i });
    fireEvent.click(historiaTab);
    expect(screen.getByText(/Sin registros de consultas/i)).toBeInTheDocument();

    const citasTab = screen.getByRole('button', { name: /Citas/i });
    fireEvent.click(citasTab);
    expect(screen.getByText(/Sin citas registradas/i)).toBeInTheDocument();

    const recetasTab = screen.getByRole('button', { name: /Recetas/i });
    fireEvent.click(recetasTab);
    expect(screen.getByText(/Sin recetas registradas/i)).toBeInTheDocument();
  });

  it('shows inline error in Historia tab when medical_records query fails (no silent swallow)', async () => {
    supabaseResponses.profiles = {
      data: {
        id: 'p-1',
        full_name: 'María Pérez',
        email: null,
        national_id: 'V-12345678',
        phone: null,
        date_of_birth: '1985-03-15',
        gender: null,
        city: null,
        state: null,
        avatar_url: null,
      },
      error: null,
    };
    supabaseResponses.medical_records = {
      data: null,
      error: { message: 'permission denied for table medical_records' },
    };

    render(<PatientDetail patientId="p-1" />);
    await flush();
    await flush();

    fireEvent.click(screen.getByRole('button', { name: /Historia/i }));
    expect(
      screen.getByText(/No pudimos cargar las consultas/i),
    ).toBeInTheDocument();
  });

  it('back-to-list affordance from the header calls router.back()', async () => {
    supabaseResponses.profiles = {
      data: {
        id: 'p-1',
        full_name: 'María Pérez',
        email: null,
        national_id: 'V-12345678',
        phone: null,
        date_of_birth: '1985-03-15',
        gender: null,
        city: null,
        state: null,
        avatar_url: null,
      },
      error: null,
    };
    render(<PatientDetail patientId="p-1" />);
    await flush();
    await flush();

    fireEvent.click(
      screen.getByRole('button', { name: /Volver a pacientes/i }),
    );
    expect(back).toHaveBeenCalled();
  });
});

// Surface mock type so TS doesn't complain about unused imports.
void (back as Mock);
void (push as Mock);
