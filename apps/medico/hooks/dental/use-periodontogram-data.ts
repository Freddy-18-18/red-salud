// Hook personalizado para datos de Periodontograma
import { useState, useEffect, useCallback } from 'react';
import { useMedicoSdk } from '@/hooks/use-medico-sdk';
import type { PerioExam, PerioToothData } from '@/packages/sdk-medico/src/types/dental';

interface UsePeriodontogramDataResult {
  // Current exam data
  currentExam: PerioExam | null;

  // Historical data
  previousExams: PerioExam[];
  latestExam: PerioExam | null;

  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isLoadingHistory: boolean;

  // Errors
  error: string | null;

  // Actions
  saveExam: (examData: Omit<PerioExam, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: string; data?: PerioExam }>;
  loadExam: (examId: string) => Promise<void>;
  loadPatientHistory: (patientId: string) => Promise<void>;
  loadLatestExam: (patientId: string) => Promise<void>;
  deleteCurrentExam: () => Promise<{ success: boolean; error?: string }>;
  refresh: () => Promise<void>;
}

export function usePeriodontogramData(
  patientId?: string | null,
  examId?: string | null
): UsePeriodontogramDataResult {
  const sdk = useMedicoSdk();
  const [currentExam, setCurrentExam] = useState<PerioExam | null>(null);
  const [previousExams, setPreviousExams] = useState<PerioExam[]>([]);
  const [latestExam, setLatestExam] = useState<PerioExam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current exam
  const loadExam = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    const result = await sdk.periodontology.getPerioExamById(id);

    if (result.success && result.data) {
      setCurrentExam(result.data);
    } else {
      setError(result.error || 'Error al cargar el periodontograma');
    }

    setIsLoading(false);
  }, [sdk.periodontology]);

  // Load patient history
  const loadPatientHistory = useCallback(async (pId: string) => {
    setIsLoadingHistory(true);
    setError(null);

    const result = await sdk.periodontology.getPerioExamsByPatient(pId, 10);

    if (result.success && result.data) {
      setPreviousExams(result.data);
      if (result.data.length > 0) {
        setLatestExam(result.data[0] || null);
      }
    } else {
      setError(result.error || 'Error al cargar historial');
    }

    setIsLoadingHistory(false);
  }, [sdk.periodontology]);

  // Load latest exam for a patient
  const loadLatestExam = useCallback(async (pId: string) => {
    setIsLoading(true);
    setError(null);

    const result = await sdk.periodontology.getLatestPerioExamByPatient(pId);

    if (result.success && result.data) {
      setLatestExam(result.data || null);
      setCurrentExam(result.data || null);
      // Also load history for comparison
      await loadPatientHistory(pId);
    } else {
      // No previous exam is OK
      setLatestExam(null);
      setError(null);
    }

    setIsLoading(false);
  }, [sdk.periodontology, loadPatientHistory]);

  // Save exam (create or update)
  const saveExam = useCallback(async (
    examData: Omit<PerioExam, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setIsSaving(true);
    setError(null);

    const result = currentExam?.id
      ? await sdk.periodontology.updatePerioExam(currentExam.id, examData)
      : await sdk.periodontology.createPerioExam(examData);

    if (result.success && result.data) {
      setCurrentExam(result.data);
      // Refresh history if we have a patient
      if (examData.patient_id) {
        await loadPatientHistory(examData.patient_id);
      }
    } else {
      setError(result.error || 'Error al guardar el periodontograma');
    }

    setIsSaving(false);
    return result;
  }, [currentExam?.id, loadPatientHistory, sdk.periodontology]);

  // Delete current exam
  const deleteCurrentExam = useCallback(async () => {
    if (!currentExam?.id) {
      return { success: false, error: 'No hay examen seleccionado' };
    }

    setIsSaving(true);
    setError(null);

    const result = await sdk.periodontology.deletePerioExam(currentExam.id);

    if (result.success) {
      setCurrentExam(null);
      // Refresh history if we have a patient
      if (currentExam.patient_id) {
        await loadPatientHistory(currentExam.patient_id);
      }
    } else {
      setError(result.error || 'Error al eliminar el periodontograma');
    }

    setIsSaving(false);
    return result;
  }, [currentExam, loadPatientHistory, sdk.periodontology]);

  // Refresh all data
  const refresh = useCallback(async () => {
    if (examId) {
      await loadExam(examId);
    }
    if (patientId) {
      await loadLatestExam(patientId);
    }
  }, [examId, patientId, loadExam, loadLatestExam]);

  // Initial load
  useEffect(() => {
    if (examId) {
      loadExam(examId);
    } else if (patientId) {
      loadLatestExam(patientId);
    }
  }, [examId, patientId, loadExam, loadLatestExam]);

  return {
    currentExam,
    previousExams,
    latestExam,
    isLoading,
    isSaving,
    isLoadingHistory,
    error,
    saveExam,
    loadExam,
    loadPatientHistory,
    loadLatestExam,
    deleteCurrentExam,
    refresh,
  };
}

export function usePerioStats(examData: PerioExam | null) {
  const sdk = useMedicoSdk();
  const [stats, setStats] = useState<{
    avgDepth: number;
    bopPercentage: number;
    pocketsOver4: number;
    pocketsOver6: number;
    missingTeeth: number;
  } | null>(null);

  useEffect(() => {
    if (examData?.teeth) {
      const teeth = examData.teeth as Record<number, any>;
      const calculatedStats = sdk.periodontology.calculateStats(teeth);
      setStats(calculatedStats);
    }
  }, [examData, sdk.periodontology]);

  return stats;
}
