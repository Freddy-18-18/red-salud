import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useCurrencyRatesMock = vi.fn();
vi.mock('@/hooks/use-currency', () => ({
  useCurrencyRates: () => useCurrencyRatesMock(),
}));

import { ExchangeRateDashboardCard } from '../exchange-rate-dashboard-card';

describe('ExchangeRateDashboardCard (paciente)', () => {
  it('renders only the BCV rate, never paralelo', () => {
    useCurrencyRatesMock.mockReturnValue({
      officialDollar: {
        id: '1',
        name: 'Dolar BCV',
        rate: 487.12,
        currency: 'USD',
        source: 'BCV',
        lastUpdated: '2026-05-03T00:00:00Z',
      },
      parallelDollar: {
        id: '2',
        name: 'Dolar Paralelo',
        rate: 631.24,
        currency: 'USD',
        source: 'EnParaleloVzla',
        lastUpdated: '2026-05-03T00:00:00Z',
      },
      loading: false,
      isOffline: false,
    });

    render(<ExchangeRateDashboardCard />);

    expect(screen.getByText('BCV:')).toBeInTheDocument();
    expect(screen.getByText(/487/)).toBeInTheDocument();
    expect(screen.queryByText(/Paralelo/i)).toBeNull();
    expect(screen.queryByText(/631/)).toBeNull();
  });

  it('returns null when no BCV rate is available', () => {
    useCurrencyRatesMock.mockReturnValue({
      officialDollar: null,
      parallelDollar: null,
      loading: false,
      isOffline: false,
    });

    const { container } = render(<ExchangeRateDashboardCard />);
    expect(container.firstChild).toBeNull();
  });
});
