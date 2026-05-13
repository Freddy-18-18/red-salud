/**
 * @file __tests__/nav-group.test.tsx
 * @description Phase-1 (Supabase-style) tests for the new NavGroup divider.
 *
 * Spec reference: medico-shell-supabase-style R4 — a thin 1px divider element
 * is rendered AFTER each NavGroup so stacked groups read as visually distinct
 * tiers in the sidebar. The divider is decorative (`role="separator"`,
 * `aria-orientation="horizontal"`).
 */

import { render, screen } from '@testing-library/react';
import { Calendar, Home, Users } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@red-salud/design-system';

import { NavGroup } from '../nav-group';
import type { NavGroupData } from '../types';

const usePathnameMock = vi.fn<() => string>().mockReturnValue('/dashboard');
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

const otherGroup: NavGroupData = {
  key: 'pacientes',
  label: 'Pacientes',
  items: [{ key: 'lista', label: 'Lista', href: '/dashboard/pacientes', icon: Users }],
};

afterEach(() => {
  usePathnameMock.mockClear();
});

describe('<NavGroup /> — divider', () => {
  it('renders a horizontal separator element after the group content', () => {
    const { container } = render(<NavGroup group={principal} />);
    const separator = container.querySelector('[role="separator"]');
    expect(separator, 'Expected a role=separator element inside NavGroup').not.toBeNull();
    expect(separator!.getAttribute('aria-orientation')).toBe('horizontal');
    expect(separator!.className).toContain('bg-border-muted');
  });

  it('still renders a separator when the group is collapsed', () => {
    const { container } = render(
      <TooltipProvider delayDuration={0}>
        <NavGroup group={principal} collapsed />
      </TooltipProvider>,
    );
    expect(container.querySelector('[role="separator"]')).not.toBeNull();
  });

  it('stacks two groups => exactly two separators in the combined output', () => {
    const { container } = render(
      <>
        <NavGroup group={principal} />
        <NavGroup group={otherGroup} />
      </>,
    );
    expect(container.querySelectorAll('[role="separator"]').length).toBe(2);
  });

  // Sanity: heading + items still render as before — no regression.
  it('continues to render heading + items', () => {
    render(<NavGroup group={principal} />);
    expect(screen.getByText('Principal')).toBeInTheDocument();
    expect(screen.getAllByTestId('nav-link').length).toBe(principal.items.length);
  });
});
