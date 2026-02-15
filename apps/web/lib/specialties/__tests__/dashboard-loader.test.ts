/**
 * @file dashboard-loader.test.ts
 * @description Tests para el dashboard loader: routing, resolución de
 * sub-especialidades, y funciones utilitarias.
 *
 * Nota: No renderiza componentes React (eso es integration test).
 * Solo testea la lógica exportada: hasCustomDashboard, preloadSpecialtyDashboard,
 * getAvailableDashboards, y las constantes de routing.
 *
 * @module Tests/Specialties
 */

import { describe, it, expect, vi } from 'vitest';

// Mock all heavy React/component dependencies used by the loader
vi.mock('framer-motion', () => ({
  motion: { div: 'div' },
}));
vi.mock('lucide-react', () => ({
  AlertCircle: 'svg',
  Loader2: 'svg',
}));
vi.mock('@red-salud/ui', () => ({
  Alert: 'div',
  AlertDescription: 'div',
}));
vi.mock('@/components/dashboard/medico/specialty', () => ({
  SpecialtyDashboardShell: 'div',
}));
vi.mock('@/components/dashboard/medico/dashboard-v2/DashboardV2', () => ({
  DashboardV2: 'div',
}));
vi.mock('@/hooks/dashboard/use-specialty-dashboard', () => ({
  useSpecialtyDashboard: vi.fn(() => ({
    kpiValues: {},
    unresolvedKpis: [],
    todayAppointments: { total: 0, completed: 0, pending: 0, nextAppointmentTime: null },
    isLoading: false,
    isRefreshing: false,
    error: null,
    refreshedAt: null,
    refresh: vi.fn(),
  })),
}));
vi.mock('@/components/dashboard/medico/odontologia/odontologia-dashboard', () => ({
  default: 'div',
  OdontologyDashboard: 'div',
}));
vi.mock('@/components/dashboard/medico/cardiology/cardiologia-dashboard', () => ({
  default: 'div',
  CardiologyDashboard: 'div',
}));

import {
  hasCustomDashboard,
  getAvailableDashboards,
} from '@/components/dashboard/medico/specialty-dashboard-loader';

// ============================================================================
// TESTS — DASHBOARD_MAP
// ============================================================================

describe('Dashboard Loader — getAvailableDashboards', () => {
  it('should return odontologia and cardiologia', () => {
    const available = getAvailableDashboards();
    expect(available).toContain('odontologia');
    expect(available).toContain('cardiologia');
  });

  it('should return exactly 2 dashboards', () => {
    const available = getAvailableDashboards();
    expect(available).toHaveLength(2);
  });
});

// ============================================================================
// TESTS — hasCustomDashboard
// ============================================================================

describe('Dashboard Loader — hasCustomDashboard', () => {
  it('should return true for direct dashboard specialties', () => {
    expect(hasCustomDashboard('odontologia')).toBe(true);
    expect(hasCustomDashboard('cardiologia')).toBe(true);
  });

  it('should return true for dental sub-specialties via parent mapping', () => {
    const dentalSubSpecialties = [
      'ortodoncia',
      'endodoncia',
      'periodoncia',
      'implantologia-dental',
      'cirugia-oral-maxilofacial',
      'odontopediatria',
      'ortopedia-dentomaxilofacial',
      'prostodoncia',
    ];

    for (const slug of dentalSubSpecialties) {
      expect(hasCustomDashboard(slug)).toBe(true);
    }
  });

  it('should return false for specialties without custom dashboards', () => {
    expect(hasCustomDashboard('medicina-general')).toBe(false);
    expect(hasCustomDashboard('neurologia')).toBe(false);
    expect(hasCustomDashboard('psiquiatria')).toBe(false);
    expect(hasCustomDashboard('pediatria')).toBe(false); // Has override but no custom dashboard
  });

  it('should return false for unknown slugs', () => {
    expect(hasCustomDashboard('nonexistent')).toBe(false);
    expect(hasCustomDashboard('')).toBe(false);
  });
});

// ============================================================================
// TESTS — Slug consistency
// ============================================================================

describe('Dashboard Loader — Slug consistency with configs', () => {
  it('DASHBOARD_MAP keys should match real identity slugs', () => {
    // This is the regression test for the Phase 7 bug fix
    // Previously keys were 'dental' and 'cardiology' instead of 'odontologia' and 'cardiologia'
    const available = getAvailableDashboards();

    // These should be the actual identity slugs, NOT English-only names
    expect(available).not.toContain('dental');
    expect(available).not.toContain('cardiology');
    expect(available).toContain('odontologia');
    expect(available).toContain('cardiologia');
  });
});
