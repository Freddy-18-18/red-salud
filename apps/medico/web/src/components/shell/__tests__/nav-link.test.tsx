/**
 * @file __tests__/nav-link.test.tsx
 * @description Phase-1 (Supabase-style) behavior tests for NavLink.
 *
 * Adds coverage for:
 * - R2: Radix Tooltip wraps the link when collapsed; tooltip content carries
 *   the item label. When expanded, no Radix tooltip is mounted.
 * - R5: When `attention === true`, an unobtrusive destructive-colored dot
 *   element renders on the link. When the flag is absent, no dot renders.
 *
 * Legacy expanded/active/badge behavior is covered by the co-located
 * `apps/medico/web/src/components/shell/nav-link.test.tsx`.
 *
 * Tooltip presence is asserted via `role="tooltip"` and accessible-name —
 * userEvent.hover triggers Radix Tooltip's open state inside jsdom because
 * `vi.useFakeTimers` is not required at the default Radix delay used here.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from 'lucide-react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '@red-salud/design-system';

import { NavLink } from '../nav-link';
import type { NavLinkData } from '../types';

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

const agendaItem: NavLinkData = {
  key: 'agenda',
  label: 'Agenda',
  href: '/dashboard/agenda',
  icon: Calendar,
};

afterEach(() => {
  usePathnameMock.mockClear();
});

describe('<NavLink /> — Radix tooltip on collapsed', () => {
  it('mounts a Radix Tooltip with the label as accessible name on hover when collapsed', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delayDuration={0}>
        <NavLink item={agendaItem} collapsed />
      </TooltipProvider>,
    );

    const trigger = screen.getByTestId('nav-link');
    await user.hover(trigger);

    await waitFor(() => {
      // Radix renders a portal'd element with role=tooltip when open.
      // The label "Agenda" should be inside it.
      const tooltips = screen.getAllByRole('tooltip');
      const match = tooltips.find((node) => node.textContent === 'Agenda');
      expect(match, 'Expected Radix tooltip carrying the link label "Agenda"').toBeDefined();
    });
  });

  it('does NOT render any Radix tooltip element when expanded', async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider delayDuration={0}>
        <NavLink item={agendaItem} collapsed={false} />
      </TooltipProvider>,
    );

    const trigger = screen.getByTestId('nav-link');
    await user.hover(trigger);

    // Tooltip MUST NOT open because the trigger is not mounted in expanded mode.
    // We wait a short tick to give Radix a chance to open if it would.
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.queryAllByRole('tooltip')).toHaveLength(0);
  });
});

describe('<NavLink /> — attention dot', () => {
  it('renders an attention dot element when attention=true', () => {
    render(<NavLink item={{ ...agendaItem, attention: true }} />);
    const link = screen.getByTestId('nav-link');
    // The dot is an aria-hidden span inside the link.
    const dot = link.querySelector('[data-testid="nav-link-attention-dot"]');
    expect(dot, 'Expected attention dot inside link').not.toBeNull();
    expect(dot!.className).toContain('rounded-full');
    expect(dot!.className).toContain('bg-destructive');
  });

  it('does NOT render an attention dot when attention is undefined', () => {
    render(<NavLink item={agendaItem} />);
    const link = screen.getByTestId('nav-link');
    expect(link.querySelector('[data-testid="nav-link-attention-dot"]')).toBeNull();
  });

  it('does NOT render an attention dot when attention=false', () => {
    render(<NavLink item={{ ...agendaItem, attention: false }} />);
    const link = screen.getByTestId('nav-link');
    expect(link.querySelector('[data-testid="nav-link-attention-dot"]')).toBeNull();
  });
});
