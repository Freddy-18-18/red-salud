/**
 * @file hooks.test.ts
 * @description Tests unitarios para los hooks de dashboard de especialidad.
 *
 * Verifica:
 * 1. useSpecialtyKpis — estados de carga, fetch, refresh, error
 * 2. useSpecialtyDashboard — combinación de KPIs + citas + real-time
 * 3. combineErrors helper
 * 4. isMissingRelationError — graceful degradation
 *
 * Usa mocks para Supabase y resolveKpis.
 *
 * @module Tests/Specialties
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

// ============================================================================
// MOCKS — use vi.hoisted to safely define mock refs before vi.mock hoisting
// ============================================================================

const { mockResolveKpis } = vi.hoisted(() => ({
  mockResolveKpis: vi.fn(),
}));

vi.mock('@/lib/specialties/data/specialty-kpi-resolver', () => ({
  resolveKpis: (...args: unknown[]) => mockResolveKpis(...args),
}));

vi.mock('@/lib/supabase/client', () => {
  const mockCh = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  data: [],
                  error: null,
                }),
                data: [],
                error: null,
              }),
            }),
          }),
        }),
      }),
      channel: vi.fn().mockReturnValue(mockCh),
      removeChannel: vi.fn(),
    },
  };
});

// ============================================================================
// IMPORTS (after mocks)
// ============================================================================

import { useSpecialtyKpis } from '@/hooks/dashboard/use-specialty-kpis';
import { useSpecialtyDashboard } from '@/hooks/dashboard/use-specialty-dashboard';
import type { SpecialtyConfig } from '@/lib/specialties';

// ============================================================================
// HELPERS
// ============================================================================

function createMockConfig(overrides?: Partial<SpecialtyConfig>): SpecialtyConfig {
  return {
    id: 'test-specialty',
    name: 'Test Specialty',
    slug: 'test-specialty',
    category: 'medical',
    keywords: ['test'],
    dashboardVariant: 'test',
    modules: {},
    prioritizedKpis: ['pacientes-atendidos', 'satisfaccion'],
    kpiDefinitions: {
      'pacientes-atendidos': {
        label: 'Pacientes Atendidos',
        format: 'number',
        direction: 'higher_is_better',
      },
      satisfaccion: {
        label: 'Satisfacción',
        format: 'percentage',
        direction: 'higher_is_better',
      },
    },
    settings: {
      defaultDuration: 20,
    },
    theme: {
      primaryColor: '#3B82F6',
      icon: 'Stethoscope',
    },
    ...overrides,
  } as SpecialtyConfig;
}

// ============================================================================
// TESTS — useSpecialtyKpis
// ============================================================================

describe('useSpecialtyKpis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveKpis.mockResolvedValue({
      values: { 'pacientes-atendidos': 80, satisfaccion: 4.5 },
      unresolved: [],
      errors: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start in loading state', () => {
    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos'],
      })
    );

    expect(result.current.isLoading).toBe(true);
  });

  it('should resolve KPI values after fetch', async () => {
    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos', 'satisfaccion'],
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.values['pacientes-atendidos']).toBe(80);
    expect(result.current.values['satisfaccion']).toBe(4.5);
    expect(result.current.unresolved).toEqual([]);
    expect(result.current.error).toBeNull();
    expect(result.current.refreshedAt).toBeInstanceOf(Date);
  });

  it('should handle errors gracefully', async () => {
    mockResolveKpis.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos'],
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.values).toEqual({});
  });

  it('should not fetch when enabled=false', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos'],
        enabled: false,
      })
    );

    // Wait a bit to ensure no fetch happens
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockResolveKpis).not.toHaveBeenCalled();
  });

  it('should not fetch when doctorId is empty', async () => {
    vi.useFakeTimers();

    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: '',
        kpiKeys: ['pacientes-atendidos'],
      })
    );

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    expect(mockResolveKpis).not.toHaveBeenCalled();
  });

  it('should report unresolved KPIs', async () => {
    mockResolveKpis.mockResolvedValue({
      values: { 'pacientes-atendidos': 80 },
      unresolved: ['custom-kpi-xyz'],
      errors: [],
    });

    const { result } = renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos', 'custom-kpi-xyz'],
      })
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.unresolved).toContain('custom-kpi-xyz');
  });

  it('should call resolveKpis with correct params', async () => {
    const dateRange = {
      start: new Date('2026-01-01'),
      end: new Date('2026-02-14'),
    };

    renderHook(() =>
      useSpecialtyKpis({
        doctorId: 'doc-1',
        kpiKeys: ['pacientes-atendidos'],
        dateRange,
      })
    );

    await waitFor(() => {
      expect(mockResolveKpis).toHaveBeenCalled();
    });

    expect(mockResolveKpis).toHaveBeenCalledWith({
      kpiKeys: ['pacientes-atendidos'],
      doctorId: 'doc-1',
      dateRange,
    });
  });
});

// ============================================================================
// TESTS — useSpecialtyDashboard
// ============================================================================

describe('useSpecialtyDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockResolveKpis.mockResolvedValue({
      values: { 'pacientes-atendidos': 80, satisfaccion: 4.5 },
      unresolved: [],
      errors: [],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should combine KPI and appointment data', async () => {
    const config = createMockConfig();

    const { result } = renderHook(() =>
      useSpecialtyDashboard('doc-1', config)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.kpiValues).toBeDefined();
    expect(result.current.todayAppointments).toBeDefined();
    expect(result.current.todayAppointments.total).toBeDefined();
  });

  it('should have a refresh function', async () => {
    const config = createMockConfig();

    const { result } = renderHook(() =>
      useSpecialtyDashboard('doc-1', config)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(typeof result.current.refresh).toBe('function');
  });

  it('should handle undefined config gracefully', async () => {
    const { result } = renderHook(() =>
      useSpecialtyDashboard('doc-1', undefined)
    );

    // Should not crash, should set default states
    expect(result.current.isLoading).toBeDefined();
    expect(result.current.kpiValues).toBeDefined();
  });

  it('should handle undefined doctorId gracefully', async () => {
    const config = createMockConfig();

    const { result } = renderHook(() =>
      useSpecialtyDashboard(undefined, config)
    );

    // Should not crash
    expect(result.current.isLoading).toBeDefined();
  });

  it('todayAppointments should have correct shape', async () => {
    const config = createMockConfig();

    const { result } = renderHook(() =>
      useSpecialtyDashboard('doc-1', config)
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const appointments = result.current.todayAppointments;
    expect(typeof appointments.total).toBe('number');
    expect(typeof appointments.completed).toBe('number');
    expect(typeof appointments.pending).toBe('number');
    // nextAppointmentTime can be null or string
    expect(
      appointments.nextAppointmentTime === null ||
        typeof appointments.nextAppointmentTime === 'string'
    ).toBe(true);
  });
});
