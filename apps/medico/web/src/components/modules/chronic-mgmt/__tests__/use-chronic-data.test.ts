import { describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import {
  useChronicData,
  type UseChronicDataDeps,
} from '../use-chronic-data';

function makeDeps(overrides: Partial<UseChronicDataDeps> = {}): UseChronicDataDeps {
  return {
    fetchChronicListData: vi.fn(async () => ({
      patients: [],
      goals: [],
      lastMeasurements: {},
    })),
    fetchPatientDetail: vi.fn(async () => ({
      metrics: [],
      goals: [],
      metricTypes: [],
    })),
    createGoal: vi.fn(async (input) => ({
      id: 'g-new',
      patient_id: input.patient_id,
      metric_type_id: input.metric_type_id,
      titulo: input.titulo,
      valor_objetivo: input.valor_objetivo,
      starts_at: '2026-05-13',
      target_date: input.target_date ?? null,
      status: 'active' as const,
    })),
    updateGoalStatus: vi.fn(async () => undefined),
    ...overrides,
  };
}

describe('useChronicData', () => {
  it('loads chronic patient list on mount', async () => {
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => ({
        patients: [
          { patient_id: 'p1', full_name: 'Marianella', cedula: '13643562', enfermedades_cronicas: ['HTA'] },
        ],
        goals: [],
        lastMeasurements: {},
      })),
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.patients).toHaveLength(1);
    expect(result.current.patients[0]?.patient_id).toBe('p1');
    expect(result.current.patients[0]?.reason).toBe('tag');
  });

  it('starts with no patient selected', async () => {
    const deps = makeDeps();
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.selectedPatient).toBeNull();
    expect(result.current.patientDetail).toBeNull();
  });

  it('loads detail when a patient is selected', async () => {
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => ({
        patients: [
          { patient_id: 'p1', full_name: 'Marianella', cedula: '13643562', enfermedades_cronicas: ['HTA'] },
        ],
        goals: [],
        lastMeasurements: {},
      })),
      fetchPatientDetail: vi.fn(async () => ({
        metrics: [
          { id: 'm1', patient_id: 'p1', metric_type_id: 'mt-sys', valor: 180, valor_secundario: null, measured_at: '2026-05-13' },
        ],
        goals: [],
        metricTypes: [
          { id: 'mt-sys', name: 'Presión Arterial Sistólica', unidad_medida: 'mmHg', categoria: 'presion', rango_minimo: 90, rango_maximo: 140 },
        ],
      })),
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.setSelectedPatientId('p1');
    });

    await waitFor(() => expect(result.current.patientDetail).not.toBeNull());
    expect(result.current.selectedPatient?.patient_id).toBe('p1');
    expect(result.current.patientDetail?.metrics).toHaveLength(1);
    expect(result.current.patientDetail?.alerts).toHaveLength(1);
    expect(result.current.patientDetail?.alerts[0]?.severity).toBe('severe');
  });

  it('computes alerts using goal override when an active goal exists', async () => {
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => ({
        patients: [
          { patient_id: 'p1', full_name: 'Marianella', cedula: null, enfermedades_cronicas: ['HTA'] },
        ],
        goals: [{ patient_id: 'p1', metric_type_id: 'mt-sys', status: 'active' as const }],
        lastMeasurements: {},
      })),
      fetchPatientDetail: vi.fn(async () => ({
        metrics: [
          { id: 'm1', patient_id: 'p1', metric_type_id: 'mt-sys', valor: 135, valor_secundario: null, measured_at: '2026-05-13' },
        ],
        goals: [
          { id: 'g1', patient_id: 'p1', metric_type_id: 'mt-sys', titulo: 'Target 120', valor_objetivo: 120, starts_at: '2026-05-01', target_date: null, status: 'active' as const },
        ],
        metricTypes: [
          { id: 'mt-sys', name: 'Presión Arterial Sistólica', unidad_medida: 'mmHg', categoria: 'presion', rango_minimo: 90, rango_maximo: 140 },
        ],
      })),
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSelectedPatientId('p1'));
    await waitFor(() => expect(result.current.patientDetail).not.toBeNull());

    const alert = result.current.patientDetail?.alerts[0];
    expect(alert?.severity).toBe('moderate');
    expect(alert?.via).toBe('goal');
    expect(alert?.effectiveMax).toBe(120);
  });

  it('createGoal calls the deps function and refreshes detail', async () => {
    const fetchDetail = vi.fn(async () => ({
      metrics: [],
      goals: [],
      metricTypes: [],
    }));
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => ({
        patients: [
          { patient_id: 'p1', full_name: 'Marianella', cedula: null, enfermedades_cronicas: ['HTA'] },
        ],
        goals: [],
        lastMeasurements: {},
      })),
      fetchPatientDetail: fetchDetail,
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSelectedPatientId('p1'));
    await waitFor(() => expect(result.current.patientDetail).not.toBeNull());

    fetchDetail.mockClear();
    await act(async () => {
      await result.current.createGoal({
        patient_id: 'p1',
        metric_type_id: 'mt-sys',
        titulo: 'BP target',
        valor_objetivo: 130,
      });
    });
    expect(deps.createGoal).toHaveBeenCalled();
    expect(fetchDetail).toHaveBeenCalled();
  });

  it('updateGoalStatus calls deps and refreshes detail', async () => {
    const fetchDetail = vi.fn(async () => ({ metrics: [], goals: [], metricTypes: [] }));
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => ({
        patients: [
          { patient_id: 'p1', full_name: 'Marianella', cedula: null, enfermedades_cronicas: ['HTA'] },
        ],
        goals: [],
        lastMeasurements: {},
      })),
      fetchPatientDetail: fetchDetail,
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    act(() => result.current.setSelectedPatientId('p1'));
    await waitFor(() => expect(result.current.patientDetail).not.toBeNull());

    fetchDetail.mockClear();
    await act(async () => {
      await result.current.updateGoalStatus('g1', 'paused');
    });
    expect(deps.updateGoalStatus).toHaveBeenCalledWith('g1', 'paused');
    expect(fetchDetail).toHaveBeenCalled();
  });

  it('captures error when fetchChronicListData throws', async () => {
    const deps = makeDeps({
      fetchChronicListData: vi.fn(async () => {
        throw new Error('boom');
      }),
    });
    const { result } = renderHook(() => useChronicData('doc-1', deps));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toContain('boom');
  });
});
