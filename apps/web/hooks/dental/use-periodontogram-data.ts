// Hook personalizado para datos de Periodontograma
import { useState, useEffect, useCallback } from 'react';
import { useSupabaseAuth } from '@/components/providers/supabase-auth-provider';
import type { PerioExam, PerioToothData } from '@/types/dental';
import {
  createPerioExam,
  updatePerioExam,
  getPerioExamById,
  getPerioExamsByPatient,
  getLatestPerioExamByPatient,
  getPerioExamsByDoctor,
  deletePerioExam,
  calculatePerioStats,
  generatePerioExamId,
} from '@/lib/supabase/services/dental/perio-service';

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
  const { user } = useSupabaseAuth();
  const [currentExam, setCurrentExam] = useState<PerioExam | null>(null);
  const [previousExams, setPreviousExams] = useState<PerioExam[]>([]);
  const [latestExam, setLatestExam] = useState<PerioExam | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load current exam
  const loadExam = useCallback(async (id: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    const result = await getPerioExamById(id);

    if (result.success && result.data) {
      setCurrentExam(result.data);
    } else {
      setError(result.error || 'Error al cargar el periodontograma');
    }

    setIsLoading(false);
  }, [user?.id]);

  // Load patient history
  const loadPatientHistory = useCallback(async (pId: string) => {
    if (!user?.id) return;

    setIsLoadingHistory(true);
    setError(null);

    const result = await getPerioExamsByPatient(pId, 10);

    if (result.success && result.data) {
      setPreviousExams(result.data);
      if (result.data.length > 0) {
        setLatestExam(result.data[0]);
      }
    } else {
      setError(result.error || 'Error al cargar historial');
    }

    setIsLoadingHistory(false);
  }, [user?.id]);

  // Load latest exam for a patient
  const loadLatestExam = useCallback(async (pId: string) => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    const result = await getLatestPerioExamByPatient(pId);

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
  }, [user?.id, loadPatientHistory]);

  // Save exam (create or update)
  const saveExam = useCallback(async (
    examData: Omit<PerioExam, 'id' | 'created_at' | 'updated_at'>
  ) => {
    if (!user?.id) {
      return { success: false, error: 'Usuario no autenticado' };
    }

    setIsSaving(true);
    setError(null);

    // Prepare data with doctor_id
    const dataToSave = {
      ...examData,
      doctorId: user.id,
    };

    const result = examData.id
      ? await updatePerioExam(examData.id, dataToSave)
      : await createPerioExam({
          ...dataToSave,
          id: Math.random().toString(36).substr(2, 9), // Generate temp ID for type safety
        });

    if (result.success && result.data) {
      setCurrentExam(result.data);
      // Refresh history if we have a patient
      if (examData.patientId) {
        await loadPatientHistory(examData.patientId);
      }
    } else {
      setError(result.error || 'Error al guardar el periodontograma');
    }

    setIsSaving(false);
    return result;
  }, [user?.id, loadPatientHistory]);

  // Delete current exam
  const deleteCurrentExam = useCallback(async () => {
    if (!currentExam?.id) {
      return { success: false, error: 'No hay examen seleccionado' };
    }

    setIsSaving(true);
    setError(null);

    const result = await deletePerioExam(currentExam.id);

    if (result.success) {
      setCurrentExam(null);
      // Refresh history if we have a patient
      if (currentExam.patientId) {
        await loadPatientHistory(currentExam.patientId);
      }
    } else {
      setError(result.error || 'Error al eliminar el periodontograma');
    }

    setIsSaving(false);
    return result;
  }, [currentExam, loadPatientHistory]);

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
      const calculatedStats = calculatePerioStats(teeth);
      setStats(calculatedStats);
    }
  }, [examData]);

  return stats;
}
