/**
 * @file mobile-sidebar-sheet.test.tsx
 * @description Behavior tests for MobileSidebarSheet (T-010).
 *
 * Tests cover:
 * - When `open={false}`, sheet content is NOT in the DOM.
 * - When `open={true}`, sheet content (nav groups + user menu) IS in the DOM.
 * - Clicking a NavLink fires `onClose` (mobile sheet auto-closes after navigation).
 * - All NAV_GROUPS items render inside the sheet.
 * - User menu fallback initials render.
 *
 * Uses Radix-friendly stubs (pointer capture / scrollIntoView / matchMedia)
 * because both Sheet and the nested DropdownMenu rely on them.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MobileSidebarSheet } from './mobile-sidebar-sheet';
import { NAV_GROUPS } from './nav-data';

beforeEach(() => {
  // Radix Dialog/DropdownMenu both call these.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

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
};

afterEach(() => {
  usePathnameMock.mockReset().mockReturnValue('/dashboard');
});

describe('<MobileSidebarSheet />', () => {
  it('does not render the sheet content when open={false}', () => {
    render(<MobileSidebarSheet {...baseProps} open={false} onClose={vi.fn()} />);
    // Nav items are not in DOM when sheet is closed.
    expect(screen.queryByText('Inicio')).not.toBeInTheDocument();
    expect(screen.queryByText('Agenda')).not.toBeInTheDocument();
  });

  it('renders all NAV_GROUPS items when open={true}', () => {
    render(<MobileSidebarSheet {...baseProps} open onClose={vi.fn()} />);
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        const matches = screen.getAllByText(item.label);
        expect(matches.length).toBeGreaterThan(0);
      }
    }
  });

  it('fires onClose when a nav link inside the sheet is clicked', () => {
    const onClose = vi.fn();
    render(<MobileSidebarSheet {...baseProps} open onClose={onClose} />);
    // Click the "Agenda" link.
    fireEvent.click(screen.getByText('Agenda').closest('a')!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders the UserMenuDropdown footer when open (avatar fallback initials visible)', () => {
    render(<MobileSidebarSheet {...baseProps} open onClose={vi.fn()} />);
    expect(screen.getByText('MS')).toBeInTheDocument();
  });
});
