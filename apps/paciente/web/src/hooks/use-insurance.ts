import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  insuranceService,
  type PatientInsurance,
  type InsurancePreauthorization,
  type InsuranceClaim,
  type CreateInsuranceData,
  type CreatePreauthorizationData,
  type CreateClaimData,
} from "@/lib/services/insurance-service";

export function useInsurance() {
  const [userId, setUserId] = useState<string | null>(null);
  const [insurances, setInsurances] = useState<PatientInsurance[]>([]);
  const [preauthorizations, setPreauthorizations] = useState<
    InsurancePreauthorization[]
  >([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);
    };
    getUser();
  }, []);

  // Load all insurance data when userId is available
  const loadAll = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);
    try {
      const [ins, preauths, cls] = await Promise.all([
        insuranceService.getInsurances(userId),
        insuranceService.getPreauthorizations(userId),
        insuranceService.getClaims(userId),
      ]);
      setInsurances(ins);
      setPreauthorizations(preauths);
      setClaims(cls);
    } catch {
      setError("No se pudieron cargar los datos de seguro");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadAll();
  }, [userId, loadAll]);

  // ---- Insurance CRUD ----

  const addInsurance = useCallback(
    async (
      data: CreateInsuranceData
    ): Promise<{ success: boolean; insurance?: PatientInsurance }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);
      try {
        const insurance = await insuranceService.addInsurance(userId, data);
        setInsurances((prev) => [insurance, ...prev]);
        return { success: true, insurance };
      } catch {
        setError("No se pudo agregar el seguro");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const updateInsurance = useCallback(
    async (
      id: string,
      data: Partial<CreateInsuranceData> & { is_active?: boolean }
    ): Promise<{ success: boolean }> => {
      setSaving(true);
      setError(null);

      const snapshot = insurances.find((i) => i.id === id);
      setInsurances((prev) =>
        prev.map((i) => (i.id === id ? { ...i, ...data } : i))
      );

      try {
        const updated = await insuranceService.updateInsurance(id, data);
        setInsurances((prev) =>
          prev.map((i) => (i.id === id ? updated : i))
        );
        return { success: true };
      } catch {
        if (snapshot) {
          setInsurances((prev) =>
            prev.map((i) => (i.id === id ? snapshot : i))
          );
        }
        setError("No se pudo actualizar el seguro");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [insurances]
  );

  const deleteInsurance = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      setSaving(true);
      setError(null);

      const snapshot = [...insurances];
      setInsurances((prev) => prev.filter((i) => i.id !== id));

      try {
        await insuranceService.deleteInsurance(id);
        return { success: true };
      } catch {
        setInsurances(snapshot);
        setError("No se pudo eliminar el seguro");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [insurances]
  );

  // ---- Preauthorizations ----

  const requestPreauthorization = useCallback(
    async (
      data: CreatePreauthorizationData
    ): Promise<{
      success: boolean;
      preauthorization?: InsurancePreauthorization;
    }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);
      try {
        const preauth = await insuranceService.createPreauthorization(
          userId,
          data
        );
        setPreauthorizations((prev) => [preauth, ...prev]);
        return { success: true, preauthorization: preauth };
      } catch {
        setError("No se pudo solicitar la pre-autorizacion");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  // ---- Claims ----

  const createClaim = useCallback(
    async (
      data: CreateClaimData
    ): Promise<{ success: boolean; claim?: InsuranceClaim }> => {
      if (!userId) return { success: false };

      setSaving(true);
      setError(null);
      try {
        const claim = await insuranceService.createClaim(userId, data);
        setClaims((prev) => [claim, ...prev]);
        return { success: true, claim };
      } catch {
        setError("No se pudo crear el reclamo");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    [userId]
  );

  const submitClaim = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      setSaving(true);
      setError(null);
      try {
        const updated = await insuranceService.submitClaim(id);
        setClaims((prev) => prev.map((c) => (c.id === id ? updated : c)));
        return { success: true };
      } catch {
        setError("No se pudo enviar el reclamo");
        return { success: false };
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ---- Derived state ----

  const activeInsurances = insurances.filter((i) => i.is_active);
  const recentPreauthorizations = preauthorizations.slice(0, 5);
  const recentClaims = claims.slice(0, 5);

  return {
    userId,
    insurances,
    activeInsurances,
    preauthorizations,
    recentPreauthorizations,
    claims,
    recentClaims,
    loading,
    saving,
    error,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    requestPreauthorization,
    createClaim,
    submitClaim,
    refresh: loadAll,
  };
}
