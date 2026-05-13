/**
 * @file __tests__/desktop-sidebar.test.tsx
 * @description Phase-1 (Supabase-style) behavior tests for DesktopSidebar.
 *
 * These tests cover the NEW behavior added by the medico-shell-supabase-style
 * change: when `FEATURE_NEW_SHELL=true`, the rail's collapsed width SHALL be
 * 48px (`lg:w-12`), and the doctor lands collapsed by default. Pre-existing
 * legacy behavior remains covered by the co-located
 * `apps/medico/web/src/components/shell/desktop-sidebar.test.tsx` file.
 *
 * The env flag is stubbed per-test via `vi.stubEnv` so each scenario is
 * deterministic and does not leak into sibling suites.
 */

import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@red-salud/design-system';

import { DesktopSidebar } from '../desktop-sidebar';

/**
 * Helper: wrap the sidebar in a TooltipProvider so the collapsed NavLink's
 * Radix Tooltip (R2) can mount under jsdom.
 */
function renderWithTooltipProvider(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

// Radix DropdownMenu / pointer-capture stubs (UserMenuDropdown is in the footer).
beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

// usePathname / next/link stubs — anchor-y default for active-state checks.
const usePathnameMock = vi.fn<() => string>().mockReturnValue('/dashboard');
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
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
  toast: { error: vi.fn() },
}));

const baseProps = {
  doctorName: 'Marianella Suarez',
  email: 'm.suarez@example.com',
  avatarUrl: null,
  specialtyName: 'Cardiología',
  onToggleCollapse: vi.fn(),
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('<DesktopSidebar /> — FEATURE_NEW_SHELL collapsed width', () => {
  it('renders the rail at lg:w-12 (48px) when collapsed AND FEATURE_NEW_SHELL=true', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = renderWithTooltipProvider(<DesktopSidebar {...baseProps} collapsed />);
    const aside = container.querySelector('aside');

    expect(aside).not.toBeNull();
    expect(aside!.className).toContain('lg:w-12');
    expect(aside!.className).not.toContain('lg:w-16');
  });

  it('preserves the legacy lg:w-16 (64px) when collapsed AND FEATURE_NEW_SHELL is off', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'false');

    const { container } = renderWithTooltipProvider(<DesktopSidebar {...baseProps} collapsed />);
    const aside = container.querySelector('aside');

    expect(aside).not.toBeNull();
    expect(aside!.className).toContain('lg:w-16');
    expect(aside!.className).not.toContain('lg:w-12');
  });

  it('preserves the legacy lg:w-16 (64px) when FEATURE_NEW_SHELL is missing entirely', () => {
    // Do not stub the env at all — simulate the variable being absent.
    const { container } = renderWithTooltipProvider(<DesktopSidebar {...baseProps} collapsed />);
    const aside = container.querySelector('aside');

    expect(aside).not.toBeNull();
    expect(aside!.className).toContain('lg:w-16');
  });

  it('keeps the expanded width at lg:w-72 regardless of the flag', () => {
    vi.stubEnv('NEXT_PUBLIC_FEATURE_NEW_SHELL', 'true');

    const { container } = renderWithTooltipProvider(<DesktopSidebar {...baseProps} collapsed={false} />);
    const aside = container.querySelector('aside');

    expect(aside!.className).toContain('lg:w-72');
  });
});
