/**
 * @file mobile-bottom-nav.test.tsx
 * @description Behavior tests for MobileBottomNav (T-011).
 *
 * Tests cover:
 * - Renders all 5 BOTTOM_NAV_ITEMS labels.
 * - Active styling on the current pathname (exact match for /dashboard, prefix for others).
 * - "Atender" CTA (index 2) carries a prominent class so it's visually distinct.
 * - Has aria-label="Navegación principal" on the <nav>.
 * - Fixed bottom positioning class + lg:hidden.
 */

import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MobileBottomNav } from './mobile-bottom-nav';
import { BOTTOM_NAV_ITEMS } from './nav-data';

const usePathnameMock = vi.fn<() => string>();
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-testid="bottom-nav-link" {...rest}>
      {children}
    </a>
  ),
}));

afterEach(() => {
  usePathnameMock.mockReset();
});

describe('<MobileBottomNav />', () => {
  it('renders all 5 BOTTOM_NAV_ITEMS labels', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<MobileBottomNav />);
    expect(BOTTOM_NAV_ITEMS).toHaveLength(5);
    for (const item of BOTTOM_NAV_ITEMS) {
      expect(screen.getByText(item.label)).toBeInTheDocument();
    }
  });

  it('exposes aria-label="Navegación principal" on the <nav>', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<MobileBottomNav />);
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
  });

  it('marks the current pathname as active (exact match for /dashboard)', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<MobileBottomNav />);
    const inicioLink = screen.getByText('Inicio').closest('a');
    expect(inicioLink).toHaveAttribute('aria-current', 'page');
  });

  it('does NOT mark /dashboard active when pathname is /dashboard/agenda', () => {
    usePathnameMock.mockReturnValue('/dashboard/agenda');
    render(<MobileBottomNav />);
    const inicioLink = screen.getByText('Inicio').closest('a');
    expect(inicioLink).not.toHaveAttribute('aria-current');
  });

  it('marks /dashboard/pacientes active by prefix when pathname is /dashboard/pacientes/123', () => {
    usePathnameMock.mockReturnValue('/dashboard/pacientes/123');
    render(<MobileBottomNav />);
    const pacientesLink = screen.getByText('Pacientes').closest('a');
    expect(pacientesLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders "Atender" with a prominent CTA class (data-cta="true")', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<MobileBottomNav />);
    const atender = screen.getByText('Atender').closest('a');
    expect(atender).not.toBeNull();
    expect(atender).toHaveAttribute('data-cta', 'true');
  });

  it('non-Atender items do NOT have data-cta="true"', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<MobileBottomNav />);
    const inicio = screen.getByText('Inicio').closest('a');
    expect(inicio).not.toHaveAttribute('data-cta', 'true');
  });

  it('applies fixed bottom + lg:hidden classes to the <nav>', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    const { container } = render(<MobileBottomNav />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.className).toContain('fixed');
    expect(nav!.className).toContain('bottom-0');
    expect(nav!.className).toContain('lg:hidden');
  });
});
