/**
 * @file __tests__/edit-clinical-fields-dialog.test.tsx
 * @description Behavior tests for `<EditClinicalFieldsDialog>` (T-2 / Phase 2).
 *
 * Contract:
 * - Pre-fills form fields from the `initial` prop on each open.
 * - Adding an allergy tag via Enter key adds it to internal state.
 * - Removing an allergy chip removes it.
 * - Submit calls `mutateAsync` with the assembled `ClinicalFieldEdit` payload.
 * - Validation: peso_kg >= 500 shows inline error AND prevents submit.
 *
 * Mock surface: only the persistence boundary (`usePatientEditClinical`) and
 * the toast side-effect (`sonner`). Radix Dialog renders into a portal — we
 * use `screen` for body-wide queries.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const editState: {
  mutateAsync: ReturnType<typeof vi.fn>;
  isPending: boolean;
  error: { code: string; message: string } | null;
  reset: ReturnType<typeof vi.fn>;
} = {
  mutateAsync: vi.fn(),
  isPending: false,
  error: null,
  reset: vi.fn(),
};

vi.mock('@/hooks/use-patient-edit-clinical', () => ({
  usePatientEditClinical: () => editState,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { EditClinicalFieldsDialog } from '../edit-clinical-fields-dialog';

function resetState() {
  editState.mutateAsync = vi.fn().mockResolvedValue({});
  editState.isPending = false;
  editState.error = null;
  editState.reset = vi.fn();
}

const PATIENT_ID = '00000000-0000-0000-0000-000000000001';

describe('<EditClinicalFieldsDialog>', () => {
  beforeEach(resetState);

  it('pre-fills form fields from `initial` prop', () => {
    render(
      <EditClinicalFieldsDialog
        patientId={PATIENT_ID}
        open
        onOpenChange={() => {}}
        initial={{
          grupo_sanguineo: 'O+',
          alergias: ['Penicilina'],
          enfermedades_cronicas: ['HTA'],
          medicamentos_actuales: ['Losartán 50mg'],
          peso_kg: 78,
          altura_cm: 175,
          notas_medicas: 'Notas previas',
        }}
      />,
    );

    // Inputs (peso, altura, notas) — assert values directly.
    const peso = screen.getByLabelText(/Peso \(kg\)/i) as HTMLInputElement;
    expect(peso.value).toBe('78');
    const altura = screen.getByLabelText(/Altura \(cm\)/i) as HTMLInputElement;
    expect(altura.value).toBe('175');
    const notas = screen.getByLabelText(/Notas médicas/i) as HTMLTextAreaElement;
    expect(notas.value).toBe('Notas previas');

    // Chips render the seeded tag values.
    expect(screen.getByText('Penicilina')).toBeInTheDocument();
    expect(screen.getByText('HTA')).toBeInTheDocument();
    expect(screen.getByText('Losartán 50mg')).toBeInTheDocument();
  });

  it('adds an allergy via Enter key into internal state', () => {
    render(
      <EditClinicalFieldsDialog
        patientId={PATIENT_ID}
        open
        onOpenChange={() => {}}
        initial={{ alergias: [] }}
      />,
    );

    const input = screen.getByLabelText(/Alergias/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Mariscos' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(screen.getByText('Mariscos')).toBeInTheDocument();
    // Input clears after add.
    expect(input.value).toBe('');
  });

  it('removes an allergy chip when the X button is clicked', () => {
    render(
      <EditClinicalFieldsDialog
        patientId={PATIENT_ID}
        open
        onOpenChange={() => {}}
        initial={{ alergias: ['Penicilina', 'Mariscos'] }}
      />,
    );

    expect(screen.getByText('Penicilina')).toBeInTheDocument();
    const removeBtn = screen.getByRole('button', { name: /Quitar Penicilina/i });
    fireEvent.click(removeBtn);

    expect(screen.queryByText('Penicilina')).not.toBeInTheDocument();
    expect(screen.getByText('Mariscos')).toBeInTheDocument();
  });

  it('submit calls mutateAsync with the assembled ClinicalFieldEdit payload', async () => {
    const onOpenChange = vi.fn();
    const mutateAsync = vi.fn().mockResolvedValue({});
    editState.mutateAsync = mutateAsync;

    render(
      <EditClinicalFieldsDialog
        patientId={PATIENT_ID}
        open
        onOpenChange={onOpenChange}
        initial={{
          grupo_sanguineo: 'O+',
          alergias: ['Penicilina'],
          enfermedades_cronicas: ['HTA'],
          medicamentos_actuales: [],
          peso_kg: 70,
          altura_cm: 170,
          notas_medicas: null,
        }}
      />,
    );

    const submit = screen.getByRole('button', { name: /Guardar/i });
    fireEvent.click(submit);

    // mutateAsync is async; flush the microtask queue.
    await Promise.resolve();
    await Promise.resolve();

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    const payload = mutateAsync.mock.calls[0][0];
    expect(payload).toMatchObject({
      patient_id: PATIENT_ID,
      grupo_sanguineo: 'O+',
      alergias: ['Penicilina'],
      enfermedades_cronicas: ['HTA'],
      medicamentos_actuales: [],
      peso_kg: 70,
      altura_cm: 170,
      notas_medicas: null,
    });
  });

  it('validation: peso > 500 shows inline error and blocks submit', () => {
    const mutateAsync = vi.fn();
    editState.mutateAsync = mutateAsync;
    render(
      <EditClinicalFieldsDialog
        patientId={PATIENT_ID}
        open
        onOpenChange={() => {}}
        initial={{ peso_kg: null }}
      />,
    );

    const peso = screen.getByLabelText(/Peso \(kg\)/i) as HTMLInputElement;
    fireEvent.change(peso, { target: { value: '999' } });
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));

    expect(
      screen.getByText(/El peso tiene que estar entre 0 y 500 kg/i),
    ).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
