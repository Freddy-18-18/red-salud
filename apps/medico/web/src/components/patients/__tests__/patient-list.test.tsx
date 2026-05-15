/**
 * @file __tests__/patient-list.test.tsx
 * @description Behavior tests for the tokenized `<PatientList>` component
 * (T-1-11 / REQ-1.7).
 *
 * Contract:
 * - Renders empty state when zero patients (after loading completes).
 * - Renders one row per patient with the new schema field names (full_name,
 *   national_id, phone, date_of_birth — NOT cedula/telefono/fecha_nacimiento).
 * - Search filters visible rows by full_name and national_id.
 * - Sort toggle cycles ascending/descending.
 * - Loading state renders 5 skeleton rows.
 * - Clicking a row calls onSelect with the patient id.
 *
 * NOTE: We intentionally do NOT pass a `themeColor` prop — REQ-1.2 removed it.
 */

import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import type { PatientSummary } from '@red-salud/types';
import { PatientList } from '../patient-list';

function makePatient(overrides: Partial<PatientSummary> = {}): PatientSummary {
  return {
    id: 'p-1',
    full_name: 'María Pérez',
    national_id: 'V-12345678',
    phone: '+58-414-1234567',
    date_of_birth: '1985-03-15',
    avatar_url: null,
    last_visit_at: '2026-04-01T15:00:00Z',
    next_appointment_at: '2026-06-01T10:00:00Z',
    total_visits: 4,
    ...overrides,
  };
}

describe('<PatientList>', () => {
  it('renders empty state when zero patients and not loading', () => {
    render(<PatientList patients={[]} onSelect={() => {}} />);
    expect(screen.getByText(/Aún no tenés pacientes/i)).toBeInTheDocument();
  });

  it('renders one row per patient with new schema field names', () => {
    const patients: PatientSummary[] = [
      makePatient({ id: 'p-1', full_name: 'María Pérez', national_id: 'V-12345678' }),
      makePatient({ id: 'p-2', full_name: 'Carlos Rodríguez', national_id: 'V-87654321' }),
    ];
    render(<PatientList patients={patients} onSelect={() => {}} />);

    expect(screen.getByText('María Pérez')).toBeInTheDocument();
    expect(screen.getByText('Carlos Rodríguez')).toBeInTheDocument();
    expect(screen.getByText(/V-12345678/)).toBeInTheDocument();
    expect(screen.getByText(/V-87654321/)).toBeInTheDocument();
  });

  it('filters rows when search input is typed', () => {
    const patients: PatientSummary[] = [
      makePatient({ id: 'p-1', full_name: 'María Pérez' }),
      makePatient({ id: 'p-2', full_name: 'Carlos Rodríguez' }),
    ];
    render(<PatientList patients={patients} onSelect={() => {}} />);

    const search = screen.getByPlaceholderText(
      /Buscar por nombre, cédula o teléfono/i,
    );
    fireEvent.change(search, { target: { value: 'maria' } });

    expect(screen.getByText('María Pérez')).toBeInTheDocument();
    expect(screen.queryByText('Carlos Rodríguez')).not.toBeInTheDocument();
  });

  it('shows a filtered-empty state when search excludes every row', () => {
    const patients: PatientSummary[] = [
      makePatient({ id: 'p-1', full_name: 'María Pérez' }),
    ];
    render(<PatientList patients={patients} onSelect={() => {}} />);

    const search = screen.getByPlaceholderText(
      /Buscar por nombre, cédula o teléfono/i,
    );
    fireEvent.change(search, { target: { value: 'zzzzz' } });

    expect(screen.getByText(/Sin resultados/i)).toBeInTheDocument();
  });

  it('renders 5 loading skeleton rows when isLoading=true', () => {
    const { container } = render(
      <PatientList patients={[]} isLoading onSelect={() => {}} />,
    );
    const skeletons = container.querySelectorAll('[data-testid="patient-row-skeleton"]');
    expect(skeletons.length).toBe(5);
  });

  it('calls onSelect with patient id when a row is clicked', () => {
    const onSelect = vi.fn();
    const patients: PatientSummary[] = [
      makePatient({ id: 'p-42', full_name: 'María Pérez' }),
    ];
    render(<PatientList patients={patients} onSelect={onSelect} />);

    const row = screen.getByText('María Pérez').closest('button')!;
    fireEvent.click(row);
    expect(onSelect).toHaveBeenCalledWith('p-42');
  });

  it('toggles sort direction when the name header is clicked twice', () => {
    const patients: PatientSummary[] = [
      makePatient({ id: 'p-a', full_name: 'Ana López' }),
      makePatient({ id: 'p-z', full_name: 'Zulema Ramírez' }),
    ];
    const { container } = render(
      <PatientList patients={patients} onSelect={() => {}} />,
    );

    // Default sort: name ascending. Ana before Zulema.
    let names = Array.from(
      container.querySelectorAll('p.font-semibold'),
    ).map((el) => el.textContent);
    expect(names[0]).toBe('Ana López');
    expect(names[1]).toBe('Zulema Ramírez');

    // Click the Paciente header to toggle to descending.
    const header = screen.getByRole('button', { name: /Paciente/i });
    fireEvent.click(header);

    names = Array.from(
      container.querySelectorAll('p.font-semibold'),
    ).map((el) => el.textContent);
    expect(names[0]).toBe('Zulema Ramírez');
    expect(names[1]).toBe('Ana López');
  });
});

// Suppress unused import warning for `within` — kept for future extensions.
void within;
