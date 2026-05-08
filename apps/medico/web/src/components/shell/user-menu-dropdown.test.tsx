/**
 * @file user-menu-dropdown.test.tsx
 * @description Behavior tests for UserMenuDropdown (T-007).
 *
 * Tests cover:
 * - Renders avatar with 2-letter initials when avatarUrl is null.
 * - Renders name + email when expanded.
 * - Hides name + email when collapsed (only avatar visible in trigger).
 * - Click trigger opens the dropdown menu (items become visible).
 * - "Mi perfil" item navigates via router.push.
 * - "Verificación SACS" item navigates via router.push.
 * - "Configuración" item navigates via router.push.
 * - "Cerrar sesión" calls useAuth().signOut() and navigates to /auth/login.
 * - Theme switcher reflects current theme via setTheme.
 * - Avatar fallback computes initials from doctorName.
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { UserMenuDropdown } from './user-menu-dropdown';

// Radix's `DropdownMenu` uses pointer events, which jsdom doesn't fully
// emulate. The simplest fix that survives Radix's pointer-event guards is
// stubbing `hasPointerCapture` and `scrollIntoView` on the prototype before
// any test runs.
beforeEach(() => {
  // jsdom doesn't implement these — Radix calls them defensively.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

// ---- Mocks ------------------------------------------------------------------

const pushMock = vi.fn<(path: string) => void>();
const refreshMock = vi.fn<() => void>();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
}));

const signOutMock = vi.fn<() => Promise<void>>();
vi.mock('@red-salud/auth-sdk', () => ({
  useAuth: () => ({ signOut: signOutMock }),
}));

const setThemeMock = vi.fn();
const useThemeReturn = { theme: 'system' as 'light' | 'dark' | 'system', setTheme: setThemeMock };
vi.mock('@red-salud/design-system', async () => {
  const actual = await vi.importActual<typeof import('@red-salud/design-system')>('@red-salud/design-system');
  return {
    ...actual,
    useTheme: () => useThemeReturn,
  };
});

const toastErrorMock = vi.fn();
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastErrorMock(...args) },
}));

// ---- Fixtures ---------------------------------------------------------------

const baseProps = {
  doctorName: 'Marianella Suarez',
  email: 'm.suarez@example.com',
  avatarUrl: null,
};

beforeEach(() => {
  pushMock.mockReset();
  refreshMock.mockReset();
  signOutMock.mockReset().mockResolvedValue();
  setThemeMock.mockReset();
  toastErrorMock.mockReset();
  useThemeReturn.theme = 'system';
});

afterEach(() => {
  // RTL cleanup happens via setup.ts afterEach.
});

// ---- Tests ------------------------------------------------------------------

describe('<UserMenuDropdown />', () => {
  it('renders the avatar fallback initials when avatarUrl is null', () => {
    render(<UserMenuDropdown {...baseProps} />);
    // "Marianella Suarez" → "MS"
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('renders name and email when expanded', () => {
    render(<UserMenuDropdown {...baseProps} />);
    expect(screen.getByText('Marianella Suarez')).toBeInTheDocument();
    expect(screen.getByText('m.suarez@example.com')).toBeInTheDocument();
  });

  it('hides name and email when collapsed', () => {
    render(<UserMenuDropdown {...baseProps} collapsed />);
    expect(screen.queryByText('Marianella Suarez')).not.toBeInTheDocument();
    expect(screen.queryByText('m.suarez@example.com')).not.toBeInTheDocument();
    // Avatar fallback is still present.
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('opens the dropdown when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    // Items are not visible until trigger is clicked (Radix portal closed).
    expect(screen.queryByText('Mi perfil')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    expect(screen.getByText('Mi perfil')).toBeInTheDocument();
    expect(screen.getByText('Verificación SACS')).toBeInTheDocument();
    expect(screen.getByText('Configuración')).toBeInTheDocument();
    expect(screen.getByText('Cerrar sesión')).toBeInTheDocument();
  });

  it('navigates to /dashboard/configuracion/perfil when "Mi perfil" is selected', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    await user.click(screen.getByText('Mi perfil'));
    expect(pushMock).toHaveBeenCalledWith('/dashboard/configuracion/perfil');
  });

  it('navigates to /dashboard/verificacion when "Verificación SACS" is selected', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    await user.click(screen.getByText('Verificación SACS'));
    expect(pushMock).toHaveBeenCalledWith('/dashboard/verificacion');
  });

  it('navigates to /dashboard/configuracion when "Configuración" is selected', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    // The dropdown only renders one "Configuración" item — the radio group
    // section uses the lowercased "Tema" label, not "Configuración".
    await user.click(screen.getByText('Configuración'));
    expect(pushMock).toHaveBeenCalledWith('/dashboard/configuracion');
  });

  it('calls signOut and pushes /auth/login when "Cerrar sesión" is selected', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    await user.click(screen.getByText('Cerrar sesión'));
    // Wait for the async signOut promise to settle.
    await vi.waitFor(() => {
      expect(signOutMock).toHaveBeenCalledTimes(1);
    });
    await vi.waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('shows a toast error and stays put when signOut fails', async () => {
    const user = userEvent.setup();
    signOutMock.mockRejectedValueOnce(new Error('boom'));
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    await user.click(screen.getByText('Cerrar sesión'));
    await vi.waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalled();
    });
    expect(pushMock).not.toHaveBeenCalledWith('/auth/login');
  });

  it('reflects current theme via setTheme call when a radio item is selected', async () => {
    const user = userEvent.setup();
    render(<UserMenuDropdown {...baseProps} />);
    await user.click(screen.getByRole('button', { name: /abrir menu de usuario/i }));
    await user.click(screen.getByText('Claro'));
    expect(setThemeMock).toHaveBeenCalledWith('light');
  });

  it('handles single-word doctorName by taking the first two letters', () => {
    render(<UserMenuDropdown {...baseProps} doctorName="Doctor" />);
    expect(screen.getByText('DO')).toBeInTheDocument();
  });
});
