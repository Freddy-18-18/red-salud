/**
 * @file mobile-top-bar.test.tsx
 * @description Behavior tests for MobileTopBar (T-009).
 *
 * Tests cover:
 * - Renders the brand name "Red Salud".
 * - Renders the hamburger button with the right aria-label.
 * - Hamburger click fires `onOpenSheet`.
 * - Header has the sticky / lg:hidden classes.
 */

import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MobileTopBar } from './mobile-top-bar';

describe('<MobileTopBar />', () => {
  it('renders the brand text "Red Salud"', () => {
    render(<MobileTopBar onOpenSheet={vi.fn()} />);
    expect(screen.getByText('Red Salud')).toBeInTheDocument();
  });

  it('renders a hamburger button with aria-label="Abrir menú"', () => {
    render(<MobileTopBar onOpenSheet={vi.fn()} />);
    expect(screen.getByRole('button', { name: /abrir menú/i })).toBeInTheDocument();
  });

  it('fires onOpenSheet when the hamburger is clicked', () => {
    const onOpenSheet = vi.fn();
    render(<MobileTopBar onOpenSheet={onOpenSheet} />);
    fireEvent.click(screen.getByRole('button', { name: /abrir menú/i }));
    expect(onOpenSheet).toHaveBeenCalledTimes(1);
  });

  it('applies sticky + lg:hidden classes to the <header>', () => {
    const { container } = render(<MobileTopBar onOpenSheet={vi.fn()} />);
    const header = container.querySelector('header');
    expect(header).not.toBeNull();
    expect(header!.className).toContain('sticky');
    expect(header!.className).toContain('top-0');
    expect(header!.className).toContain('lg:hidden');
  });
});
