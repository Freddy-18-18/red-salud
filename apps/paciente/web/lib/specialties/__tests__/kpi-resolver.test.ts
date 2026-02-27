/**
 * @file kpi-resolver.test.ts
 * @description Tests unitarios para el KPI resolver.
 *
 * Verifica que:
 * 1. Los KPI keys universales se mapean a los grupos correctos
 * 2. Los KPI keys sin mapping se marcan como unresolvable
 * 3. Las funciones extract retornan valores coherentes
 * 4. resolveKpis() retorna { values, unresolved, errors } correctamente
 * 5. Los KPIs de overrides (dental, cardio, pedi) funcionan
 *
 * @module Tests/Specialties
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ============================================================================
// MOCK DE SUPABASE — debe estar antes del import del módulo bajo test
// ============================================================================

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();

// Chainable builder pattern mock
function createChain(finalData: unknown[] | null = null) {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn().mockReturnValue(chain);
  chain.eq = vi.fn().mockReturnValue(chain);
  chain.gte = vi.fn().mockReturnValue(chain);
  chain.lte = vi.fn().mockReturnValue(chain);
  chain.order = vi.fn().mockReturnValue(chain);
  chain.limit = vi.fn().mockReturnValue({ data: finalData, error: null, count: finalData?.length ?? 0 });

  // For appointment count queries (head: true returns count)
  const originalSelect = chain.select;
  (chain.select as ReturnType<typeof vi.fn>).mockImplementation(
    (_cols?: string, opts?: { count?: string; head?: boolean }) => {
      if (opts?.head) {
        // Return a chain that resolves to count
        const countChain: Record<string, unknown> = {};
        countChain.eq = vi.fn().mockReturnValue(countChain);
        countChain.gte = vi.fn().mockReturnValue(countChain);
        countChain.lte = vi.fn().mockReturnValue(countChain);
        // The final call returns { count }
        Object.defineProperty(countChain, 'then', {
          value: (resolve: (v: unknown) => void) =>
            resolve({ count: finalData?.length ?? 0, data: null, error: null }),
        });
        // Allow await to work
        countChain.eq = vi.fn().mockReturnValue({
          gte: vi.fn().mockReturnValue({
            lte: vi.fn().mockReturnValue({
              count: finalData?.length ?? 0,
              data: null,
              error: null,
            }),
            count: finalData?.length ?? 0,
            data: null,
            error: null,
          }),
          count: finalData?.length ?? 0,
          data: null,
          error: null,
        });
        return countChain;
      }
      return chain;
    }
  );

  // Make the chain itself thenable for queries without .limit()
  Object.defineProperty(chain, 'data', { value: finalData, writable: true });
  Object.defineProperty(chain, 'error', { value: null, writable: true });

  return chain;
}

const mockFromReturnValues: Record<string, ReturnType<typeof createChain>> = {};

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      return mockFromReturnValues[table] ?? createChain(null);
    }),
  },
}));

// ============================================================================
// IMPORT MODULE UNDER TEST (after mocks)
// ============================================================================

import { resolveKpis, type KpiResolutionResult } from '../data/specialty-kpi-resolver';

// ============================================================================
// TEST HELPERS
// ============================================================================

function setupMockData() {
  // Efficiency data
  mockFromReturnValues['mv_doctor_efficiency_agg'] = createChain([
    {
      total_appointments: 100,
      completed_appointments: 80,
      cancelled_appointments: 10,
      no_show_appointments: 10,
      avg_duration: 25,
    },
  ]);

  // Patients data
  mockFromReturnValues['mv_doctor_patients_agg'] = createChain([
    {
      unique_patients: 200,
      new_patients_month: 30,
      active_patients_30d: 150,
      inactive_patients: 50,
    },
  ]);

  // Revenue data
  mockFromReturnValues['mv_doctor_revenue_agg'] = createChain([
    {
      gross_revenue: 50000,
      consultations: 80,
    },
  ]);

  // Lab data
  mockFromReturnValues['mv_doctor_lab_agg'] = createChain([
    {
      total_orders: 40,
      abnormal_results: 5,
      avg_days_to_result: 3,
    },
  ]);

  // Ratings data
  mockFromReturnValues['ratings'] = createChain([
    { rating: 4 },
    { rating: 5 },
    { rating: 4 },
    { rating: 5 },
    { rating: 4 },
  ]);

  // Appointments data — handled differently (count queries)
  mockFromReturnValues['appointments'] = createChain([
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ]);
}

const defaultParams = {
  doctorId: 'test-doctor-uuid',
  dateRange: {
    start: new Date('2026-01-01'),
    end: new Date('2026-02-14'),
  },
};

// ============================================================================
// TESTS
// ============================================================================

describe('KPI Resolver — resolveKpis()', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear table mocks
    Object.keys(mockFromReturnValues).forEach((key) => {
      delete mockFromReturnValues[key];
    });
    setupMockData();
  });

  describe('Universal KPIs', () => {
    it('should resolve efficiency KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['pacientes-atendidos', 'tasa-no-show', 'consultas-dia'],
      });

      expect(result.values['pacientes-atendidos']).toBe(80);
      expect(result.values['tasa-no-show']).toBe(10); // 10/100 * 100
      expect(result.unresolved).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should resolve patient KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['pacientes-nuevos', 'pacientes-activos', 'retencion-30d'],
      });

      expect(result.values['pacientes-nuevos']).toBe(30);
      expect(result.values['pacientes-activos']).toBe(150);
      // retencion = (150/200) * 100 = 75
      expect(result.values['retencion-30d']).toBe(75);
    });

    it('should resolve revenue KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['ingresos', 'ticket-promedio'],
      });

      expect(result.values['ingresos']).toBe(50000);
      expect(result.values['ticket-promedio']).toBe(625); // 50000/80
    });

    it('should resolve lab KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['examenes-laboratorio', 'tasa-anormalidad'],
      });

      expect(result.values['examenes-laboratorio']).toBe(40);
      // tasa = (5/40) * 100 = 12.5
      expect(result.values['tasa-anormalidad']).toBe(12.5);
    });
  });

  describe('Override-specific KPIs', () => {
    it('should resolve dental override KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['no_show_rate', 'production_per_day', 'new_patient_acquisition'],
      });

      // no_show_rate = (10/100)*100 = 10
      expect(result.values['no_show_rate']).toBe(10);
      expect(result.values['new_patient_acquisition']).toBe(30);
      expect(result.unresolved).toEqual([]);
    });

    it('should resolve cardiology override KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['patient_throughput', 'patient_satisfaction_score'],
      });

      expect(result.values['patient_throughput']).toBeDefined();
      expect(result.values['patient_satisfaction_score']).toBeDefined();
    });

    it('should resolve pediatrics override KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['follow_up_rate', 'control-nino-sano', 'vacunaciones'],
      });

      expect(result.values['follow_up_rate']).toBeDefined();
      expect(result.values['control-nino-sano']).toBeDefined();
      expect(result.values['vacunaciones']).toBeDefined();
    });

    it('should resolve generic identity KPIs', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['tasa-exito', 'complicaciones', 'procedimientos-realizados'],
      });

      // tasa-exito = (80/100)*100 = 80
      expect(result.values['tasa-exito']).toBe(80);
      expect(result.values['complicaciones']).toBe(10); // proxy: cancelled
      expect(result.values['procedimientos-realizados']).toBe(80); // proxy: completed
    });
  });

  describe('Unresolvable KPIs', () => {
    it('should mark specialty-specific KPIs as unresolved', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: [
          'pacientes-atendidos',
          'periodontograma-score',
          'endoscopias-realizadas',
          'hemoglobina-glicosilada',
        ],
      });

      expect(result.values['pacientes-atendidos']).toBe(80);
      expect(result.unresolved).toContain('periodontograma-score');
      expect(result.unresolved).toContain('endoscopias-realizadas');
      expect(result.unresolved).toContain('hemoglobina-glicosilada');
    });

    it('should handle all-unresolvable gracefully', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['foo', 'bar', 'baz'],
      });

      expect(Object.keys(result.values)).toHaveLength(0);
      expect(result.unresolved).toEqual(['foo', 'bar', 'baz']);
      expect(result.errors).toEqual([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty kpiKeys', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: [],
      });

      expect(result.values).toEqual({});
      expect(result.unresolved).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it('should use default 6-month date range when not provided', async () => {
      const result = await resolveKpis({
        doctorId: 'test-uuid',
        kpiKeys: ['pacientes-atendidos'],
      });

      expect(result.values['pacientes-atendidos']).toBeDefined();
    });

    it('should handle duplicate KPI keys', async () => {
      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['pacientes-atendidos', 'pacientes-atendidos'],
      });

      // Should still have one value, last write wins
      expect(result.values['pacientes-atendidos']).toBe(80);
    });

    it('should round values to 2 decimal places', async () => {
      // Setup data that produces a non-round number
      mockFromReturnValues['mv_doctor_efficiency_agg'] = createChain([
        {
          total_appointments: 3,
          completed_appointments: 1,
          cancelled_appointments: 1,
          no_show_appointments: 1,
          avg_duration: 25.6789,
        },
      ]);

      const result = await resolveKpis({
        ...defaultParams,
        kpiKeys: ['tasa-cancelacion'],
      });

      // (1/3)*100 = 33.33333... rounded to 33.33
      expect(result.values['tasa-cancelacion']).toBe(33.33);
    });
  });

  describe('Query grouping', () => {
    it('should batch KPIs from the same group into one query', async () => {
      const { supabase } = await import('@/lib/supabase/client');

      await resolveKpis({
        ...defaultParams,
        kpiKeys: [
          'pacientes-atendidos',
          'tasa-no-show',
          'tasa-cancelacion',
          'ocupacion',
        ],
      });

      // All these are "efficiency" group, should be ONE from() call for that table
      const fromCalls = (supabase.from as ReturnType<typeof vi.fn>).mock.calls;
      const efficiencyCalls = fromCalls.filter(
        (c) => c[0] === 'mv_doctor_efficiency_agg'
      );

      expect(efficiencyCalls.length).toBe(1);
    });

    it('should query multiple groups in parallel', async () => {
      await resolveKpis({
        ...defaultParams,
        kpiKeys: [
          'pacientes-atendidos', // efficiency
          'pacientes-nuevos',    // patients
          'ingresos',            // revenue
          'satisfaccion',        // ratings
        ],
      });

      // Should have queried 4 different tables
      const { supabase } = await import('@/lib/supabase/client');
      const fromCalls = (supabase.from as ReturnType<typeof vi.fn>).mock.calls;
      const tables = fromCalls.map((c) => c[0]);

      expect(tables).toContain('mv_doctor_efficiency_agg');
      expect(tables).toContain('mv_doctor_patients_agg');
      expect(tables).toContain('mv_doctor_revenue_agg');
      expect(tables).toContain('mv_doctor_ratings_agg');
    });
  });
});
