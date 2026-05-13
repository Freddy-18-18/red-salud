/**
 * @file nav-link.test.tsx
 * @description Behavior tests for the NavLink leaf component (T-004).
 *
 * Tests cover:
 * - Label + icon rendered.
 * - Active styling on exact pathname match.
 * - Active styling on `pathname.startsWith(href + '/')` for non-`/dashboard` items.
 * - `/dashboard` is NOT active when on `/dashboard/agenda` (exact-only rule).
 * - Badge renders when provided; hidden in collapsed mode.
 * - Label hidden in collapsed mode (icon-only).
 * - onClick fires on click (used by mobile sheet to close after navigation).
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { Calendar, Home, ShieldCheck } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@red-salud/design-system';

import { NavLink } from './nav-link';
import type { NavLinkData } from './types';

/**
 * Helper: when the link is rendered in collapsed mode it now wraps itself in a
 * Radix Tooltip (medico-shell-supabase-style R2). Tests that mount with
 * `collapsed=true` therefore need a TooltipProvider in scope; for ergonomics
 * we wrap renders that hit collapsed paths in this helper.
 */
function renderWithTooltipProvider(ui: React.ReactElement): ReturnType<typeof render> {
  return render(<TooltipProvider delayDuration={0}>{ui}</TooltipProvider>);
}

// Mock next/navigation usePathname() — overridden per test.
const usePathnameMock = vi.fn<() => string>();
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

// Mock next/link to a passthrough so we don't need the Next.js runtime.
// Forwards all props (className, aria-*, title, onClick, etc.) so component
// behavior is observable.
vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-testid="nav-link" {...rest}>
      {children}
    </a>
  ),
}));

const inicioItem: NavLinkData = {
  key: 'inicio',
  label: 'Inicio',
  href: '/dashboard',
  icon: Home,
};

const agendaItem: NavLinkData = {
  key: 'agenda',
  label: 'Agenda',
  href: '/dashboard/agenda',
  icon: Calendar,
};

const verificacionItem: NavLinkData = {
  key: 'verificacion',
  label: 'Verificación',
  href: '/dashboard/verificacion',
  icon: ShieldCheck,
  badge: 'Próximamente',
};

afterEach(() => {
  usePathnameMock.mockReset();
});

describe('<NavLink />', () => {
  it('renders the label', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavLink item={inicioItem} />);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
  });

  it('marks the link active when pathname matches href exactly', () => {
    usePathnameMock.mockReturnValue('/dashboard/agenda');
    render(<NavLink item={agendaItem} />);
    const link = screen.getByTestId('nav-link');
    expect(link.className).toContain('bg-primary');
    expect(link).toHaveAttribute('aria-current', 'page');
  });

  it('marks the link active when pathname starts with href + "/"', () => {
    usePathnameMock.mockReturnValue('/dashboard/agenda/today');
    render(<NavLink item={agendaItem} />);
    const link = screen.getByTestId('nav-link');
    expect(link.className).toContain('bg-primary');
  });

  it('does NOT mark /dashboard active when pathname is /dashboard/agenda (exact-only rule)', () => {
    usePathnameMock.mockReturnValue('/dashboard/agenda');
    render(<NavLink item={inicioItem} />);
    const link = screen.getByTestId('nav-link');
    expect(link.className).not.toContain('bg-primary text-primary-foreground');
    expect(link).not.toHaveAttribute('aria-current');
  });

  it('marks /dashboard active when pathname is exactly /dashboard', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavLink item={inicioItem} />);
    const link = screen.getByTestId('nav-link');
    expect(link.className).toContain('bg-primary');
  });

  it('renders the badge when provided', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavLink item={verificacionItem} />);
    expect(screen.getByText('Próximamente')).toBeInTheDocument();
  });

  it('hides the badge when collapsed', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    renderWithTooltipProvider(<NavLink item={verificacionItem} collapsed />);
    expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();
  });

  it('hides the inline label when collapsed (Radix tooltip handles discoverability)', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    renderWithTooltipProvider(<NavLink item={agendaItem} collapsed />);
    // The inline `<span>Agenda</span>` is not rendered inside the link.
    const link = screen.getByTestId('nav-link');
    expect(link.querySelector('span:not([data-testid="nav-link-attention-dot"])')).toBeNull();
    // Native `title` is now intentionally absent — Radix Tooltip supersedes it
    // so the two don't fight under hover/focus. See medico-shell-supabase-style R2.
    expect(link).not.toHaveAttribute('title');
  });

  it('fires onClick when the user clicks the link', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    const onClick = vi.fn();
    render(<NavLink item={agendaItem} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('nav-link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
