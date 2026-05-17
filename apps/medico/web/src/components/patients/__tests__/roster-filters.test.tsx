/**
 * @file __tests__/roster-filters.test.tsx
 * @description Behavior tests for the `<RosterFiltersBar>` chrome
 * (Phase 3 / T-3-08).
 *
 * The component is presentational — its state is `filters` (prop) and its
 * outputs are the typed callbacks. Tests verify:
 *  1. The search input is seeded with `filters.search`.
 *  2. Typing into the search input fires `onSearchChange` AFTER the 300ms
 *     debounce — uses `vi.useFakeTimers()` + `advanceTimersByTime`.
 *  3. The "Limpiar todo" CTA invokes `onReset` when isDirty=true.
 *  4. Each active filter renders an `<ActiveChip>` and clicking its X button
 *     forwards to the right handler.
 *
 * The Popover-driven advanced panel is not asserted — Radix renders it into
 * a portal that requires a trigger click and the chip rendering is the
 * load-bearing visible state.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  DEFAULT_ROSTER_FILTERS,
  type RosterFilters,
} from '@red-salud/types';

import { RosterFiltersBar } from '../roster-filters';

function makeFilters(overrides: Partial<RosterFilters> = {}): RosterFilters {
  return {
    ...DEFAULT_ROSTER_FILTERS,
    ...overrides,
  };
}

interface Handlers {
  onSearchChange: ReturnType<typeof vi.fn>;
  onToggleChronicTag: ReturnType<typeof vi.fn>;
  onAgeRangeChange: ReturnType<typeof vi.fn>;
  onLastVisitWindowChange: ReturnType<typeof vi.fn>;
  onToggleHasFollowup: ReturnType<typeof vi.fn>;
  onToggleAlertsOnly: ReturnType<typeof vi.fn>;
  onReset: ReturnType<typeof vi.fn>;
}

function makeHandlers(): Handlers {
  return {
    onSearchChange: vi.fn(),
    onToggleChronicTag: vi.fn(),
    onAgeRangeChange: vi.fn(),
    onLastVisitWindowChange: vi.fn(),
    onToggleHasFollowup: vi.fn(),
    onToggleAlertsOnly: vi.fn(),
    onReset: vi.fn(),
  };
}

describe('<RosterFiltersBar>', () => {
  it('renders the search input seeded with filters.search', () => {
    const handlers = makeHandlers();
    render(
      <RosterFiltersBar
        filters={makeFilters({ search: 'maria' })}
        isDirty
        {...handlers}
      />,
    );

    const search = screen.getByPlaceholderText(
      /Buscar por nombre o cédula/i,
    ) as HTMLInputElement;
    expect(search.value).toBe('maria');
  });

  describe('debounced search', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('typing fires onSearchChange after the 300ms debounce', () => {
      const handlers = makeHandlers();
      render(
        <RosterFiltersBar
          filters={makeFilters({ search: '' })}
          isDirty={false}
          {...handlers}
        />,
      );

      const search = screen.getByPlaceholderText(/Buscar por nombre o cédula/i);
      fireEvent.change(search, { target: { value: 'rod' } });

      // Before the debounce window expires, the callback must NOT fire.
      expect(handlers.onSearchChange).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(handlers.onSearchChange).toHaveBeenCalledTimes(1);
      expect(handlers.onSearchChange).toHaveBeenCalledWith('rod');
    });
  });

  it('click on "Limpiar todo" calls onReset (only visible when isDirty=true)', () => {
    const handlers = makeHandlers();
    render(
      <RosterFiltersBar
        filters={makeFilters({ chronic_tags: ['HTA'] })}
        isDirty
        {...handlers}
      />,
    );

    // The "Limpiar todo" CTA renders in the active-chip strip below the bar.
    const resetButtons = screen.getAllByRole('button', { name: /Limpiar todo/i });
    // At least one of them (the strip's textual link) must invoke onReset.
    fireEvent.click(resetButtons[0]);
    expect(handlers.onReset).toHaveBeenCalled();
  });

  it('active filter chips render one chip per active filter and X dispatches the correct handler', () => {
    const handlers = makeHandlers();
    render(
      <RosterFiltersBar
        filters={makeFilters({
          chronic_tags: ['HTA'],
          age_min: 30,
          age_max: 60,
          last_visit_window: 'lt_30d',
          has_followup: true,
          alerts_only: true,
        })}
        isDirty
        {...handlers}
      />,
    );

    // Chronic-tag chip
    expect(screen.getByText('HTA')).toBeInTheDocument();
    // Age range chip
    expect(screen.getByText(/Edad 30–60 años/i)).toBeInTheDocument();
    // Last visit chip
    expect(screen.getByText(/Última visita .*30 días/i)).toBeInTheDocument();
    // Followup chip
    expect(screen.getByText(/Con seguimiento pendiente/i)).toBeInTheDocument();
    // Alerts-only chip
    expect(screen.getByText(/Solo con alertas/i)).toBeInTheDocument();

    // Click the X on the chronic-tag chip — invokes onToggleChronicTag('HTA').
    fireEvent.click(screen.getByRole('button', { name: /Quitar filtro HTA/i }));
    expect(handlers.onToggleChronicTag).toHaveBeenCalledWith('HTA');

    // Click the X on the age range chip — invokes onAgeRangeChange(null, null).
    fireEvent.click(
      screen.getByRole('button', { name: /Quitar filtro Edad 30–60 años/i }),
    );
    expect(handlers.onAgeRangeChange).toHaveBeenCalledWith(null, null);

    // Click the X on the last-visit chip — invokes onLastVisitWindowChange(null).
    fireEvent.click(
      screen.getByRole('button', {
        name: /Quitar filtro Última visita .*30 días/i,
      }),
    );
    expect(handlers.onLastVisitWindowChange).toHaveBeenCalledWith(null);
  });
});
