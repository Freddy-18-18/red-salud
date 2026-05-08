/**
 * @file nav-group.test.tsx
 * @description Behavior tests for NavGroup (T-005).
 *
 * NavGroup is a thin wrapper: heading + list of NavLink. Tests cover:
 * - Heading text rendered when expanded.
 * - One NavLink rendered per item.
 * - Heading hidden when collapsed.
 * - onItemClick propagates to each NavLink (click closes mobile sheet).
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { Calendar, Home } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { NavGroup } from './nav-group';
import type { NavGroupData } from './types';

// usePathname is consumed transitively by <NavLink>.
const usePathnameMock = vi.fn<() => string>();
vi.mock('next/navigation', () => ({
  usePathname: () => usePathnameMock(),
}));

vi.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} data-testid="nav-link" {...rest}>
      {children}
    </a>
  ),
}));

const principal: NavGroupData = {
  key: 'principal',
  label: 'Principal',
  items: [
    { key: 'inicio', label: 'Inicio', href: '/dashboard', icon: Home },
    { key: 'agenda', label: 'Agenda', href: '/dashboard/agenda', icon: Calendar },
  ],
};

afterEach(() => {
  usePathnameMock.mockReset();
});

describe('<NavGroup />', () => {
  it('renders the group label', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavGroup group={principal} />);
    expect(screen.getByText('Principal')).toBeInTheDocument();
  });

  it('renders one NavLink per item', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavGroup group={principal} />);
    expect(screen.getAllByTestId('nav-link')).toHaveLength(2);
    expect(screen.getByText('Inicio')).toBeInTheDocument();
    expect(screen.getByText('Agenda')).toBeInTheDocument();
  });

  it('hides the heading when collapsed', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    render(<NavGroup group={principal} collapsed />);
    expect(screen.queryByText('Principal')).not.toBeInTheDocument();
    // Items still render (icons-only).
    expect(screen.getAllByTestId('nav-link')).toHaveLength(2);
  });

  it('propagates onItemClick to each NavLink', () => {
    usePathnameMock.mockReturnValue('/dashboard');
    const onItemClick = vi.fn();
    render(<NavGroup group={principal} onItemClick={onItemClick} />);
    const links = screen.getAllByTestId('nav-link');
    fireEvent.click(links[0]);
    fireEvent.click(links[1]);
    expect(onItemClick).toHaveBeenCalledTimes(2);
  });
});
