import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PatientNavbar } from '../dashboard-navbar';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

vi.mock('@/lib/supabase/client', () => ({
  supabase: { auth: { signOut: vi.fn() } },
}));

vi.mock('@/components/currency/exchange-rate-widget', () => ({
  ExchangeRateCompact: () => <div data-testid="exchange-rate-compact" />,
}));

vi.mock('@/components/notifications/notification-bell', () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

describe('PatientNavbar hamburger', () => {
  it('renders a hamburger button when onMenuClick is provided', () => {
    render(<PatientNavbar onMenuClick={() => {}} />);
    expect(
      screen.getByRole('button', { name: /Abrir menú de navegación/i }),
    ).toBeInTheDocument();
  });

  it('clicking the hamburger invokes onMenuClick', () => {
    const onMenuClick = vi.fn();
    render(<PatientNavbar onMenuClick={onMenuClick} />);
    fireEvent.click(
      screen.getByRole('button', { name: /Abrir menú de navegación/i }),
    );
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
