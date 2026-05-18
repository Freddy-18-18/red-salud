import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavSheet } from '../nav-sheet';
import { NAV_ITEMS } from '../patient-sidebar-nav';

describe('NavSheet', () => {
  it('does not render nav items when closed', () => {
    render(
      <NavSheet open={false} onOpenChange={() => {}} pathname="/dashboard" />,
    );
    expect(screen.queryByRole('link', { name: /Inicio/ })).toBeNull();
  });

  it('renders every NAV_ITEMS link when open', () => {
    render(
      <NavSheet open onOpenChange={() => {}} pathname="/dashboard" />,
    );
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('link', { name: item.label })).toBeInTheDocument();
    }
  });

  it('invokes onOpenChange(false) when a nav link is clicked', () => {
    const onOpenChange = vi.fn();
    render(
      <NavSheet open onOpenChange={onOpenChange} pathname="/dashboard" />,
    );
    fireEvent.click(screen.getByRole('link', { name: 'Mis Citas' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
