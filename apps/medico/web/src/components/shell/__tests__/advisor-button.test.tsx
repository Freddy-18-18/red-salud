/**
 * @file __tests__/advisor-button.test.tsx
 * @description Phase-2 (Supabase-style) behavior tests for AdvisorButton.
 *
 * Covers R7 (round action button with red attention dot when the resolver
 * surfaces verificationPending OR sacsExpired). The dot vanishes when both
 * flags are false. Clicking the button opens a DropdownMenu listing the
 * active alerts.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AdvisorButton } from '../advisor-button';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
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
  vi.restoreAllMocks();
});

describe('<AdvisorButton /> — attention dot', () => {
  it('renders a destructive red dot when verificationPending is true', () => {
    const { container } = render(
      <AdvisorButton attention={{ verificationPending: true, sacsExpired: false }} />,
    );
    const dot = container.querySelector('[data-testid="advisor-button-dot"]');
    expect(dot).not.toBeNull();
    expect(dot!.className).toContain('bg-destructive');
    expect(dot!.className).toContain('rounded-full');
  });

  it('renders the dot when sacsExpired is true (even if verificationPending=false)', () => {
    const { container } = render(
      <AdvisorButton attention={{ verificationPending: false, sacsExpired: true }} />,
    );
    expect(
      container.querySelector('[data-testid="advisor-button-dot"]'),
    ).not.toBeNull();
  });

  it('does NOT render the dot when both flags are false', () => {
    const { container } = render(
      <AdvisorButton attention={{ verificationPending: false, sacsExpired: false }} />,
    );
    expect(
      container.querySelector('[data-testid="advisor-button-dot"]'),
    ).toBeNull();
  });

  it('does NOT render the dot when attention is undefined', () => {
    const { container } = render(<AdvisorButton />);
    expect(
      container.querySelector('[data-testid="advisor-button-dot"]'),
    ).toBeNull();
  });
});

describe('<AdvisorButton /> — dropdown', () => {
  it('opens a dropdown listing active alerts when clicked', async () => {
    const user = userEvent.setup();
    render(
      <AdvisorButton attention={{ verificationPending: true, sacsExpired: true }} />,
    );

    const trigger = screen.getByRole('button', { name: /alerta/i });
    await user.click(trigger);

    await waitFor(() => {
      // Both alerts surfaced inside the dropdown content (titles).
      expect(
        screen.getByText('Verificación SACS pendiente'),
      ).toBeInTheDocument();
      expect(screen.getByText('SACS vencido')).toBeInTheDocument();
    });
  });

  it('shows an empty state inside the dropdown when no alerts are active', async () => {
    const user = userEvent.setup();
    render(
      <AdvisorButton attention={{ verificationPending: false, sacsExpired: false }} />,
    );

    const trigger = screen.getByRole('button', { name: /alerta/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText(/sin alertas/i)).toBeInTheDocument();
    });
  });
});

describe('<AdvisorButton /> — round Supabase-style styling (R7)', () => {
  it('applies rounded-full, w-8/h-8, and border-strong classes', () => {
    render(
      <AdvisorButton attention={{ verificationPending: false, sacsExpired: false }} />,
    );
    const trigger = screen.getByRole('button', { name: /alerta/i });
    expect(trigger.className).toContain('rounded-full');
    expect(trigger.className).toContain('w-8');
    expect(trigger.className).toContain('h-8');
    expect(trigger.className).toContain('border-strong');
  });
});
