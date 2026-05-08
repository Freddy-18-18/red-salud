/**
 * @file desktop-sidebar.test.tsx
 * @description Behavior tests for DesktopSidebar (T-008).
 *
 * Tests cover:
 * - Renders all NAV_GROUPS items (label visible when expanded).
 * - Logo / brand text visible when expanded; hidden when collapsed (icon-only rail).
 * - Collapse button click fires `onToggleCollapse`.
 * - Aria-label of collapse button switches between "Colapsar menú" and "Expandir menú".
 * - UserMenuDropdown is rendered in the footer (avatar fallback initials present).
 * - The aside has the fixed positioning class.
 *
 * NOTE on Radix portals: stub pointer-capture / scrollIntoView so the
 * UserMenuDropdown's Radix DropdownMenu doesn't crash under jsdom.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DesktopSidebar } from './desktop-sidebar';
import { NAV_GROUPS } from './nav-data';

beforeEach(() => {
  // jsdom doesn't implement these — Radix calls them defensively.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).hasPointerCapture = vi.fn(() => false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).releasePointerCapture = vi.fn();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (HTMLElement.prototype as any).scrollIntoView = vi.fn();
});

// next/navigation usePathname() — anchor-y default for active-state checks.
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

// Supabase + theme stubs — UserMenuDropdown is rendered in the footer and pulls
// from these. We don't drive their behavior here (covered in user-menu tests).
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
  collapsed: false,
  onToggleCollapse: vi.fn(),
};

afterEach(() => {
  baseProps.onToggleCollapse.mockReset?.();
});

describe('<DesktopSidebar />', () => {
  it('renders every NAV_GROUPS item label when expanded', () => {
    render(<DesktopSidebar {...baseProps} />);
    for (const group of NAV_GROUPS) {
      for (const item of group.items) {
        // `Configuración` collides with the group heading of the same name —
        // accept any match so both contexts render the label.
        const matches = screen.getAllByText(item.label);
        expect(matches.length).toBeGreaterThan(0);
      }
    }
  });

  it('renders the brand text "Red Salud" when expanded', () => {
    render(<DesktopSidebar {...baseProps} />);
    expect(screen.getByText('Red Salud')).toBeInTheDocument();
  });

  it('hides the brand text when collapsed', () => {
    render(<DesktopSidebar {...baseProps} collapsed />);
    expect(screen.queryByText('Red Salud')).not.toBeInTheDocument();
  });

  it('fires onToggleCollapse when the collapse button is clicked', () => {
    const onToggleCollapse = vi.fn();
    render(<DesktopSidebar {...baseProps} onToggleCollapse={onToggleCollapse} />);
    fireEvent.click(screen.getByRole('button', { name: /colapsar menú/i }));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('shows aria-label "Colapsar menú" when expanded', () => {
    render(<DesktopSidebar {...baseProps} collapsed={false} />);
    expect(screen.getByRole('button', { name: /colapsar menú/i })).toBeInTheDocument();
  });

  it('shows aria-label "Expandir menú" when collapsed', () => {
    render(<DesktopSidebar {...baseProps} collapsed />);
    expect(screen.getByRole('button', { name: /expandir menú/i })).toBeInTheDocument();
  });

  it('renders the UserMenuDropdown in the footer (avatar initials visible)', () => {
    render(<DesktopSidebar {...baseProps} />);
    // "Marianella Suarez" → "MS"
    expect(screen.getByText('MS')).toBeInTheDocument();
  });

  it('applies fixed positioning classes to the <aside>', () => {
    const { container } = render(<DesktopSidebar {...baseProps} />);
    const aside = container.querySelector('aside');
    expect(aside).not.toBeNull();
    expect(aside!.className).toContain('fixed');
    expect(aside!.className).toContain('inset-y-0');
    expect(aside!.className).toContain('left-0');
    expect(aside!.className).toContain('lg:flex');
    expect(aside!.className).toContain('hidden');
  });

  it('switches between w-72 and w-16 based on collapsed prop', () => {
    const { container, rerender } = render(<DesktopSidebar {...baseProps} collapsed={false} />);
    let aside = container.querySelector('aside');
    expect(aside!.className).toContain('lg:w-72');

    rerender(<DesktopSidebar {...baseProps} collapsed />);
    aside = container.querySelector('aside');
    expect(aside!.className).toContain('lg:w-16');
  });
});
