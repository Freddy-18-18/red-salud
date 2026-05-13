import { describe, expect, it } from 'vitest';
import { Activity, Calendar, Home, Puzzle } from 'lucide-react';
import {
  mergeWithStaticFallback,
  resolveIcon,
  resolvedToNavGroups,
} from '../nav-mapper';
import { STATIC_NAV_GROUPS } from '../nav-data';
import type { ResolvedNavGroup } from '@/lib/capabilities/types';

describe('resolveIcon', () => {
  it('returns the matching lucide-react component for a known name', () => {
    expect(resolveIcon('Home')).toBe(Home);
    expect(resolveIcon('Calendar')).toBe(Calendar);
    expect(resolveIcon('Activity')).toBe(Activity);
  });

  it('falls back to the Puzzle icon when name is unknown', () => {
    expect(resolveIcon('NoExisteIcon')).toBe(Puzzle);
  });

  it('falls back to the Puzzle icon for empty string', () => {
    expect(resolveIcon('')).toBe(Puzzle);
  });
});

describe('resolvedToNavGroups', () => {
  it('maps ResolvedNavGroup[] to NavGroupData[] with LucideIcon components', () => {
    const resolved: ResolvedNavGroup[] = [
      {
        key: 'clinica',
        label: 'Clínica',
        items: [
          { key: 'inicio', label: 'Inicio', href: '/dashboard', icon: 'Home' },
          { key: 'agenda', label: 'Agenda', href: '/dashboard/agenda', icon: 'Calendar' },
        ],
      },
    ];
    const result = resolvedToNavGroups(resolved);
    expect(result).toHaveLength(1);
    expect(result[0]?.key).toBe('clinica');
    expect(result[0]?.label).toBe('Clínica');
    expect(result[0]?.items[0]?.icon).toBe(Home);
    expect(result[0]?.items[1]?.icon).toBe(Calendar);
  });

  it('forwards optional badge field when present', () => {
    const resolved: ResolvedNavGroup[] = [
      {
        key: 'clinica',
        label: 'Clínica',
        items: [
          {
            key: 'chronic-mgmt',
            label: 'Crónicos',
            href: '/dashboard/modulos/chronic-mgmt',
            icon: 'Activity',
            badge: 'Próximamente',
          },
        ],
      },
    ];
    const result = resolvedToNavGroups(resolved);
    expect(result[0]?.items[0]?.badge).toBe('Próximamente');
  });

  it('returns empty array for empty input', () => {
    expect(resolvedToNavGroups([])).toEqual([]);
  });
});

describe('mergeWithStaticFallback', () => {
  it('returns the static fallback when resolved is undefined', () => {
    expect(mergeWithStaticFallback(undefined)).toBe(STATIC_NAV_GROUPS);
  });

  it('returns dynamic groups when resolved is provided (non-empty)', () => {
    const resolved: ResolvedNavGroup[] = [
      {
        key: 'clinica',
        label: 'Clínica',
        items: [{ key: 'inicio', label: 'Inicio', href: '/dashboard', icon: 'Home' }],
      },
    ];
    const result = mergeWithStaticFallback(resolved);
    expect(result).not.toBe(STATIC_NAV_GROUPS);
    expect(result).toHaveLength(1);
    expect(result[0]?.items[0]?.icon).toBe(Home);
  });

  it('returns static fallback when resolved is an empty array (degraded resolver)', () => {
    expect(mergeWithStaticFallback([])).toBe(STATIC_NAV_GROUPS);
  });
});
