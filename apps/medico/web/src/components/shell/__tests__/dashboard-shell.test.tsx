/**
 * @file __tests__/dashboard-shell.test.tsx
 * @description Phase-2 (Supabase-style) behavior tests for DashboardShell.
 *
 * Covers R8 of app-shell-medico: when `NEXT_PUBLIC_FEATURE_NEW_SHELL=true`,
 * the new `<GlobalHeader>` mounts at the top of the content column. With the
 * flag off or missing the legacy shell renders without the new header.
 *
 * The shell still exposes the legacy props (doctorName, navGroups, ...) so
 * this suite extends rather than replaces the legacy `dashboard-shell.test.tsx`
 * sitting one directory up.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DashboardShell } from '../dashboard-shell';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard/pacientes',
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-testid="nav-link" {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { signOut: vi.fn(async () => ({ error: null })) } },
}));

vi.mock('@red-salud/design-system', async () => {
  const actual = await vi.importActual<typeof import('@red-salud/design-system')>('@red-salud/design-system');
  return {
    ...actual,
    useTheme: () => ({ theme: 'system' as const, setTheme: vi.fn() }),
  };
});

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), info: vi.fn() },
}));

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

const baseProps = {
  doctorName: 'Dr Test',
  email: 'doc@example.com',
  avatarUrl: null,
  specialtyName: 'Cardiología',
  moduleLabel: 'Pacientes',
};

describe('<DashboardShell /> — FEATURE_NEW_SHELL GlobalHeader gate (R8)', () => {
  it('mounts <GlobalHeader> when NEXT_PUBLIC_FEATURE_NEW_SHELL=true', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = render(
      <DashboardShell {...baseProps}>
        <p>content</p>
      </DashboardShell>,
    );

    // GlobalHeader uses <header> at the top of the content column.
    const headers = container.querySelectorAll('header');
    // There should be at least one <header>; the GlobalHeader is the one
    // carrying h-12 + border-b.
    const newHeader = Array.from(headers).find(
      (h) => h.className.includes('h-12') && h.className.includes('border-b'),
    );
    expect(newHeader, 'Expected GlobalHeader (h-12 border-b) mounted under flag').toBeDefined();
    expect(screen.getByText('Dr Test')).toBeInTheDocument();
  });

  it('does NOT mount <GlobalHeader> when NEXT_PUBLIC_FEATURE_NEW_SHELL=false', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'false');

    const { container } = render(
      <DashboardShell {...baseProps}>
        <p>content</p>
      </DashboardShell>,
    );

    const headers = container.querySelectorAll('header');
    const newHeader = Array.from(headers).find(
      (h) => h.className.includes('h-12') && h.className.includes('border-b'),
    );
    expect(newHeader).toBeUndefined();
  });

  it('does NOT mount <GlobalHeader> when the env flag is missing entirely', () => {
    // No stubEnv call — the flag is absent.
    const { container } = render(
      <DashboardShell {...baseProps}>
        <p>content</p>
      </DashboardShell>,
    );

    const headers = container.querySelectorAll('header');
    const newHeader = Array.from(headers).find(
      (h) => h.className.includes('h-12') && h.className.includes('border-b'),
    );
    expect(newHeader).toBeUndefined();
  });

  it('threads attention prop through to <AdvisorButton> red dot', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = render(
      <DashboardShell
        {...baseProps}
        attention={{ verificationPending: true, sacsExpired: false }}
      >
        <p>content</p>
      </DashboardShell>,
    );

    expect(
      container.querySelector('[data-testid="advisor-button-dot"]'),
    ).not.toBeNull();
  });
});
