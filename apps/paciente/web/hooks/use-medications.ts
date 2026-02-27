import { useState, useEffect, useCallback } from "react";
import {
  searchMedicationsCatalog,
  getPatientPrescriptions,
  getPrescription,
  getPatientReminders,
  getTodayIntakeLog,
  recordMedicationIntake,
  getAdherenceStats,
  getActiveMedicationsSummary,
  createReminder,
  updateReminder,
  deactivateReminder,
} from "@/lib/supabase/services/medications-service";
import type {
  MedicationCatalog,
  Prescription,
  MedicationReminder,
  MedicationIntakeLog,
  AdherenceStats,
  ActiveMedicationsSummary,
  CreateReminderData,
} from "@/lib/supabase/types/medications";

// Hook para buscar medicamentos en el catálogo
export function useSearchMedications() {
  const [results, setResults] = useState<MedicationCatalog[]>([]);
  const [loading, setLoading] = useState(false);

  const search = async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const result = await searchMedicationsCatalog(searchTerm);
    if (result.success) {
      setResults(result.data);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setResults([]);
  };

  return { results, loading, search, clearSearch };
}

// Hook para prescripciones del paciente
export function usePatientPrescriptions(patientId: string | undefined) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadPrescriptions = async () => {
      setLoading(true);
      const result = await getPatientPrescriptions(patientId);
      if (result.success) {
        setPrescriptions(result.data);
      } else {
        setError(String(result.error) || 'Error loading prescriptions');
      }
      setLoading(false);
    };

    loadPrescriptions();
  }, [patientId]);

  const refreshPrescriptions = async () => {
    if (!patientId) return;
    const result = await getPatientPrescriptions(patientId);
    if (result.success && result.data) {
      setPrescriptions(result.data);
    }
  };

  return { prescriptions, loading, error, refreshPrescriptions };
}

// Hook para una prescripción específica
export function usePrescription(prescriptionId: string | undefined) {
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!prescriptionId) return;

    const loadPrescription = async () => {
      setLoading(true);
      const result = await getPrescription(prescriptionId);
      if (result.success) {
        setPrescription(result.data);
      } else {
        setError(String(result.error) || 'Error loading prescription');
      }
      setLoading(false);
    };

    loadPrescription();
  }, [prescriptionId]);

  return { prescription, loading, error };
}

// Hook para recordatorios del paciente
export function usePatientReminders(patientId: string | undefined) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadReminders = async () => {
      setLoading(true);
      const result = await getPatientReminders(patientId);
      if (result.success) {
        setReminders(result.data);
      } else {
        setError(String(result.error) || 'Error loading reminders');
      }
      setLoading(false);
    };

    loadReminders();
  }, [patientId]);

  const refreshReminders = async () => {
    if (!patientId) return;
    const result = await getPatientReminders(patientId);
    if (result.success && result.data) {
      setReminders(result.data);
    }
  };

  return { reminders, loading, error, refreshReminders };
}

// Hook para registro de tomas del día
export function useTodayIntakeLog(patientId: string | undefined) {
  const [intakeLog, setIntakeLog] = useState<MedicationIntakeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadIntakeLog = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getTodayIntakeLog(patientId);
    if (result.success) {
      setIntakeLog(result.data);
    } else {
      setError(String(result.error) || 'Error loading intake log');
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    
    const loadData = async () => {
      setLoading(true);
      const result = await getTodayIntakeLog(patientId);
      if (result.success) {
        setIntakeLog(result.data);
      } else {
        setError(String(result.error) || 'Error loading intake log');
      }
      setLoading(false);
    };
    
    loadData();
  }, [patientId]);

  const recordIntake = async (intakeId: string, status: 'tomado' | 'omitido', notes?: string) => {
    const result = await recordMedicationIntake(intakeId, status, notes);
    if (result.success) {
      await loadIntakeLog();
    }
    return result;
  };

  return { intakeLog, loading, error, recordIntake, refreshIntakeLog: loadIntakeLog };
}

// Hook para estadísticas de adherencia
export function useAdherenceStats(patientId: string | undefined, days: number = 30) {
  const [stats, setStats] = useState<AdherenceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;

    const loadStats = async () => {
      setLoading(true);
      const result = await getAdherenceStats(patientId, days);
      if (result.success) {
        setStats(result.data);
      } else {
        setError(String(result.error) || 'Error loading stats');
      }
      setLoading(false);
    };

    loadStats();
  }, [patientId, days]);

  return { stats, loading, error };
}

// Hook para resumen de medicamentos activos
export function useActiveMedicationsSummary(patientId: string | undefined) {
  const [summary, setSummary] = useState<ActiveMedicationsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!patientId) return;
    setLoading(true);
    const result = await getActiveMedicationsSummary(patientId);
    if (result.success) {
      setSummary(result.data);
    } else {
      setError(String(result.error) || 'Error loading summary');
    }
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    if (!patientId) return;
    
    const loadData = async () => {
      setLoading(true);
      const result = await getActiveMedicationsSummary(patientId);
      if (result.success) {
        setSummary(result.data);
      } else {
        setError(String(result.error) || 'Error loading summary');
      }
      setLoading(false);
    };
    
    loadData();
  }, [patientId]);

  return { summary, loading, error, refreshSummary: loadSummary };
}

// Hook para crear recordatorio
export function useCreateReminder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = async (reminderData: CreateReminderData) => {
    setLoading(true);
    setError(null);
    const result = await createReminder(reminderData);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error));
    }
    return result;
  };

  return { create, loading, error };
}

// Hook para actualizar recordatorio
export function useUpdateReminder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = async (reminderId: string, updates: Partial<MedicationReminder>) => {
    setLoading(true);
    setError(null);
    const result = await updateReminder(reminderId, updates);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error));
    }
    return result;
  };

  const deactivate = async (reminderId: string) => {
    setLoading(true);
    setError(null);
    const result = await deactivateReminder(reminderId);
    setLoading(false);
    if (!result.success) {
      setError(String(result.error));
    }
    return result;
  };

  return { update, deactivate, loading, error };
}

