import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const useCurrencyRatesMock = vi.fn();
vi.mock('@/hooks/use-currency', () => ({
  useCurrencyRates: () => useCurrencyRatesMock(),
}));

import { ExchangeRateCompact, ExchangeRateWidget } from '../exchange-rate-widget';

const officialDollar = {
  id: '1',
  name: 'Dolar BCV',
  rate: 487.12,
  currency: 'USD',
  source: 'BCV',
  lastUpdated: '2026-05-03T00:00:00Z',
};

const parallelDollar = {
  id: '2',
  name: 'Dolar Paralelo',
  rate: 631.24,
  currency: 'USD',
  source: 'EnParaleloVzla',
  lastUpdated: '2026-05-03T00:00:00Z',
};

describe('ExchangeRateCompact (paciente)', () => {
  it('renders only the BCV rate, never paralelo', () => {
    useCurrencyRatesMock.mockReturnValue({
      officialDollar,
      parallelDollar,
      loading: false,
      isOffline: false,
    });

    render(<ExchangeRateCompact />);

    expect(screen.getByText('BCV:')).toBeInTheDocument();
    expect(screen.getByText(/487/)).toBeInTheDocument();
    expect(screen.queryByText(/Paralelo/i)).toBeNull();
    expect(screen.queryByText(/631/)).toBeNull();
  });
});

describe('ExchangeRateWidget (paciente)', () => {
  it('renders only BCV (oficial) rows, never paralelo rows', () => {
    useCurrencyRatesMock.mockReturnValue({
      rates: [],
      officialDollar,
      parallelDollar,
      history: [],
      loading: false,
      error: null,
      isOffline: false,
      refetch: vi.fn(),
    });

    render(<ExchangeRateWidget />);

    expect(screen.getByText(/Dolar Oficial \(BCV\)/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dolar Paralelo/i)).toBeNull();
    expect(screen.queryByText(/Euro Paralelo/i)).toBeNull();
  });
});
