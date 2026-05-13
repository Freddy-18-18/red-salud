/**
 * @file __tests__/breadcrumb-picker.test.tsx
 * @description Phase-2 (Supabase-style) behavior tests for BreadcrumbPicker.
 *
 * Generic picker used 3x in the GlobalHeader (doctor / sede / module). Renders
 * a label + chevron; chevron opens a Radix Popover with options when provided,
 * or remains disabled when `options` is empty/undefined (graceful degradation
 * for Phase 2 where the sedes table doesn't exist yet — Phase 3 lands data).
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { BreadcrumbPicker } from '../breadcrumb-picker';

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

describe('<BreadcrumbPicker />', () => {
  it('renders the label as visible text', () => {
    render(<BreadcrumbPicker level="doctor" label="Dr Test" />);
    expect(screen.getByText('Dr Test')).toBeInTheDocument();
  });

  it('opens a Radix Popover with the provided options when chevron clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <BreadcrumbPicker
        level="sede"
        label="Sede Central"
        options={[
          { id: 's1', label: 'Sede Central' },
          { id: 's2', label: 'Sede Norte' },
        ]}
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole('button', { name: /sede central/i });
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText('Sede Norte')).toBeInTheDocument();
    });
  });

  it('disables the chevron when options are undefined (graceful Phase 2 degrade)', () => {
    render(<BreadcrumbPicker level="sede" label="Sin sede" />);
    const trigger = screen.getByRole('button', { name: /sin sede/i });
    expect(trigger).toBeDisabled();
  });

  it('disables the chevron when options array is empty', () => {
    render(<BreadcrumbPicker level="sede" label="Sin sede" options={[]} />);
    const trigger = screen.getByRole('button', { name: /sin sede/i });
    expect(trigger).toBeDisabled();
  });

  it('fires onSelect with the option id when an option is clicked', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <BreadcrumbPicker
        level="sede"
        label="Sede Central"
        options={[
          { id: 's1', label: 'Sede Central' },
          { id: 's2', label: 'Sede Norte' },
        ]}
        onSelect={onSelect}
      />,
    );

    const trigger = screen.getByRole('button', { name: /sede central/i });
    await user.click(trigger);

    const option = await screen.findByText('Sede Norte');
    await user.click(option);

    expect(onSelect).toHaveBeenCalledWith('s2');
  });
});
