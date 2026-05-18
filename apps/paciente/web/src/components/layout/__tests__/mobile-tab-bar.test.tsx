import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MobileTabBar, MOBILE_TABS } from '../mobile-tab-bar';

vi.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('MobileTabBar', () => {
  it('exposes 5 tabs ending with "Más"', () => {
    expect(MOBILE_TABS).toHaveLength(5);
    expect(MOBILE_TABS[MOBILE_TABS.length - 1].label).toBe('Más');
  });

  it('the highlighted tab is Agendar', () => {
    const highlighted = MOBILE_TABS.filter((t) => t.highlight);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].label).toBe('Agendar');
  });

  it('renders nav links for non-Más tabs and a button for Más', () => {
    render(<MobileTabBar onMenuClick={() => {}} />);
    expect(screen.getByRole('link', { name: /Inicio/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Citas/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Mensajes/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Más opciones/i })).toBeInTheDocument();
  });

  it('clicking "Más" invokes onMenuClick', () => {
    const onMenuClick = vi.fn();
    render(<MobileTabBar onMenuClick={onMenuClick} />);
    fireEvent.click(screen.getByRole('button', { name: /Más opciones/i }));
    expect(onMenuClick).toHaveBeenCalledTimes(1);
  });
});
