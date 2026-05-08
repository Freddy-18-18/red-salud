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

import { NavLink } from './nav-link';
import type { NavLinkData } from './types';

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
    render(<NavLink item={verificacionItem} collapsed />);
    expect(screen.queryByText('Próximamente')).not.toBeInTheDocument();
  });

  it('hides the label when collapsed and exposes title attribute as tooltip', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavLink item={agendaItem} collapsed />);
    expect(screen.queryByText('Agenda')).not.toBeInTheDocument();
    const link = screen.getByTestId('nav-link');
    expect(link).toHaveAttribute('title', 'Agenda');
  });

  it('fires onClick when the user clicks the link', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    const onClick = vi.fn();
    render(<NavLink item={agendaItem} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('nav-link'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
