import { describe, it, expect } from 'vitest';
import {
  NAV_ITEMS,
  isActive,
  type NavItem,
} from '../patient-sidebar-nav';

describe('NAV_ITEMS', () => {
  it('exposes every patient dashboard section', () => {
    expect(NAV_ITEMS.length).toBeGreaterThanOrEqual(20);
    const homeItem = NAV_ITEMS.find((item) => item.href === '/dashboard');
    expect(homeItem).toBeDefined();
    expect(homeItem?.label).toBe('Inicio');
  });

  it('every item has a unique href', () => {
    const hrefs = NAV_ITEMS.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it('exactly one item is highlighted (Agendar Cita)', () => {
    const highlighted = NAV_ITEMS.filter((item: NavItem) => item.highlight);
    expect(highlighted).toHaveLength(1);
    expect(highlighted[0].href).toBe('/dashboard/agendar');
  });
});

describe('isActive', () => {
  it('matches /dashboard exactly only', () => {
    expect(isActive('/dashboard', '/dashboard')).toBe(true);
    expect(isActive('/dashboard', '/dashboard/citas')).toBe(false);
  });

  it('matches sub-routes via prefix for non-root items', () => {
    expect(isActive('/dashboard/citas', '/dashboard/citas')).toBe(true);
    expect(isActive('/dashboard/citas', '/dashboard/citas/123')).toBe(true);
    expect(isActive('/dashboard/citas', '/dashboard/historial')).toBe(false);
  });
});
