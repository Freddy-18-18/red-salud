/**
 * @file __tests__/create-patient-dialog.test.tsx
 * @description Behavior tests for the two-step `<CreatePatientDialog>`
 * (Phase 3 / T-3-04 + T-3-05 UI surface).
 *
 * Contract:
 * - Step 1 surfaces both creation modes (Offline + Invited).
 * - Selecting the offline option lands on step 2 without an Email field.
 * - Selecting the invited option lands on step 2 WITH a required Email field
 *   that surfaces inline validation when empty.
 * - Submit on the offline path calls `useCreateOfflinePatient.mutateAsync`
 *   with the typed payload and bubbles `onCreated({ patient_id })`.
 * - Submit on the invited path swaps the dialog to the post-success screen
 *   that shows the `invite_token` inside the share URL.
 *
 * Mock surface: only the mutation hooks (no real Supabase) and the `sonner`
 * toast singleton. The mocks live in module-scope `*State` objects so each
 * test can rewire `mutateAsync` without re-mounting the module.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

const offlineState: {
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

const invitedState: {
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

vi.mock('@/hooks/use-create-offline-patient', () => ({
  useCreateOfflinePatient: () => offlineState,
}));

vi.mock('@/hooks/use-create-invited-patient', () => ({
  useCreateInvitedPatient: () => invitedState,
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { CreatePatientDialog } from '../create-patient-dialog';

const NEW_PATIENT_ID = '00000000-0000-0000-0000-00000000aaaa';
const INVITE_TOKEN = 'tok-abc123def456';

function resetState() {
  offlineState.mutateAsync = vi
    .fn()
    .mockResolvedValue({ patient_id: NEW_PATIENT_ID });
  offlineState.isPending = false;
  offlineState.error = null;
  offlineState.reset = vi.fn();

  invitedState.mutateAsync = vi.fn().mockResolvedValue({
    patient_id: NEW_PATIENT_ID,
    invite_token: INVITE_TOKEN,
  });
  invitedState.isPending = false;
  invitedState.error = null;
  invitedState.reset = vi.fn();
}

describe('<CreatePatientDialog>', () => {
  beforeEach(resetState);

  it('step 1 renders the mode selector with both Offline and Invited cards', () => {
    render(
      <CreatePatientDialog
        open
        onOpenChange={() => {}}
        onCreated={() => {}}
      />,
    );

    expect(screen.getByText(/Nuevo paciente/i)).toBeInTheDocument();
    expect(screen.getByText(/Sin email \(offline\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Con email \(invitar\)/i)).toBeInTheDocument();
  });

  it('selecting Offline lands on step 2 WITHOUT the Email field', () => {
    render(
      <CreatePatientDialog open onOpenChange={() => {}} onCreated={() => {}} />,
    );

    fireEvent.click(screen.getByText(/Sin email \(offline\)/i));

    expect(
      screen.getByText(/Crear paciente sin email/i),
    ).toBeInTheDocument();
    // Email input must NOT be present in offline mode.
    expect(screen.queryByLabelText(/^Email/i)).not.toBeInTheDocument();
    // Full name field IS present.
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument();
  });

  it('selecting Invited shows the Email field and validates when empty', () => {
    render(
      <CreatePatientDialog open onOpenChange={() => {}} onCreated={() => {}} />,
    );

    fireEvent.click(screen.getByText(/Con email \(invitar\)/i));

    expect(
      screen.getByText(/Invitar paciente por email/i),
    ).toBeInTheDocument();
    const emailInput = screen.getByLabelText(/^Email/i) as HTMLInputElement;
    expect(emailInput).toBeInTheDocument();

    // Fill the required name so validation reaches the email branch.
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'María Fernanda González' },
    });

    // Submit without an email — should surface inline validation, NOT call mutateAsync.
    fireEvent.click(
      screen.getByRole('button', { name: /Crear y generar enlace/i }),
    );

    expect(
      screen.getByText(/Necesitamos un email válido/i),
    ).toBeInTheDocument();
    expect(invitedState.mutateAsync).not.toHaveBeenCalled();
  });

  it('submit on offline path calls mutateAsync with full_name + national_id and fires onCreated', async () => {
    const onCreated = vi.fn();
    const onOpenChange = vi.fn();

    render(
      <CreatePatientDialog
        open
        onOpenChange={onOpenChange}
        onCreated={onCreated}
      />,
    );

    fireEvent.click(screen.getByText(/Sin email \(offline\)/i));
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'Carlos Rodríguez' },
    });
    fireEvent.change(screen.getByLabelText(/Cédula/i), {
      target: { value: 'V-87654321' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Crear paciente$/i }));

    // Wait for the success path: mutateAsync resolves → toast + close
    // → onCreated called with the patient_id.
    await waitFor(() => {
      expect(onCreated).toHaveBeenCalledWith({ patient_id: NEW_PATIENT_ID });
    });

    expect(offlineState.mutateAsync).toHaveBeenCalledTimes(1);
    const payload = offlineState.mutateAsync.mock.calls[0][0];
    expect(payload).toMatchObject({
      full_name: 'Carlos Rodríguez',
      national_id: 'V-87654321',
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('submit on invited path swaps to the post-success screen showing the invite_token', async () => {
    render(
      <CreatePatientDialog
        open
        onOpenChange={() => {}}
        onCreated={() => {}}
      />,
    );

    fireEvent.click(screen.getByText(/Con email \(invitar\)/i));
    fireEvent.change(screen.getByLabelText(/Nombre completo/i), {
      target: { value: 'María Fernanda González' },
    });
    fireEvent.change(screen.getByLabelText(/^Email/i), {
      target: { value: 'maria@ejemplo.com' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: /Crear y generar enlace/i }),
    );

    // The mutation is async + the success setState swaps `step` to
    // `invite-success`. `waitFor` polls the DOM so we don't have to count
    // microtask flushes manually.
    await waitFor(() => {
      expect(
        screen.getByText(/Paciente creado e invitación lista/i),
      ).toBeInTheDocument();
    });

    expect(invitedState.mutateAsync).toHaveBeenCalledTimes(1);
    // The token is embedded inside the share URL rendered in the read-only
    // input. Target by ID rather than label text because the label "Enlace
    // de invitación" also collides with the "Copiar enlace de invitación"
    // button's aria-label.
    const inviteUrl = document.getElementById('invite-url') as HTMLInputElement;
    expect(inviteUrl).not.toBeNull();
    expect(inviteUrl.value).toContain(INVITE_TOKEN);
  });
});
