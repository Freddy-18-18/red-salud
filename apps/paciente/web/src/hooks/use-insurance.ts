import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import {
  insuranceService,
  type PatientInsurance,
  type InsurancePreauthorization,
  type InsuranceClaim,
  type CreateInsuranceData,
  type CreatePreauthorizationData,
  type CreateClaimData,
} from "@/lib/services/insurance-service";
import { supabase } from "@/lib/supabase/client";

export function useInsurance() {
  const [userId, setUserId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserId(user?.id ?? null);
    });
  }, []);

  // Insurances → useQuery
  const insurancesQuery = useQuery({
    queryKey: ["insurance", "insurances", userId],
    queryFn: async () => {
      if (!userId) return [];
      return insuranceService.getInsurances(userId);
    },
    enabled: !!userId,
  });

  // Preauthorizations → useQuery
  const preauthorizationsQuery = useQuery({
    queryKey: ["insurance", "preauthorizations", userId],
    queryFn: async () => {
      if (!userId) return [];
      return insuranceService.getPreauthorizations(userId);
    },
    enabled: !!userId,
  });

  // Claims → useQuery
  const claimsQuery = useQuery({
    queryKey: ["insurance", "claims", userId],
    queryFn: async () => {
      if (!userId) return [];
      return insuranceService.getClaims(userId);
    },
    enabled: !!userId,
  });

  const insurances = insurancesQuery.data ?? [];
  const preauthorizations = preauthorizationsQuery.data ?? [];
  const claims = claimsQuery.data ?? [];

  const isLoading = insurancesQuery.isLoading || preauthorizationsQuery.isLoading || claimsQuery.isLoading;
  const queryError =
    insurancesQuery.error?.message ??
    preauthorizationsQuery.error?.message ??
    claimsQuery.error?.message ??
    null;

  // ---- Insurance CRUD ----

  const addInsuranceMutation = useMutation({
    mutationFn: async (data: CreateInsuranceData) => {
      if (!userId) throw new Error("No user");
      return insuranceService.addInsurance(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "insurances", userId] });
    },
  });

  const addInsurance = useCallback(
    async (
      data: CreateInsuranceData
    ): Promise<{ success: boolean; insurance?: PatientInsurance }> => {
      if (!userId) return { success: false };
      try {
        const insurance = await addInsuranceMutation.mutateAsync(data);
        return { success: true, insurance };
      } catch {
        return { success: false };
      }
    },
    [userId, addInsuranceMutation]
  );

  const updateInsuranceMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateInsuranceData> & { is_active?: boolean };
    }) => {
      return insuranceService.updateInsurance(id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "insurances", userId] });
    },
  });

  const updateInsurance = useCallback(
    async (
      id: string,
      data: Partial<CreateInsuranceData> & { is_active?: boolean }
    ): Promise<{ success: boolean }> => {
      try {
        await updateInsuranceMutation.mutateAsync({ id, data });
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [updateInsuranceMutation]
  );

  const deleteInsuranceMutation = useMutation({
    mutationFn: async (id: string) => {
      await insuranceService.deleteInsurance(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "insurances", userId] });
    },
  });

  const deleteInsurance = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await deleteInsuranceMutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [deleteInsuranceMutation]
  );

  // ---- Preauthorizations ----

  const requestPreauthMutation = useMutation({
    mutationFn: async (data: CreatePreauthorizationData) => {
      if (!userId) throw new Error("No user");
      return insuranceService.createPreauthorization(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "preauthorizations", userId] });
    },
  });

  const requestPreauthorization = useCallback(
    async (
      data: CreatePreauthorizationData
    ): Promise<{
      success: boolean;
      preauthorization?: InsurancePreauthorization;
    }> => {
      if (!userId) return { success: false };
      try {
        const preauth = await requestPreauthMutation.mutateAsync(data);
        return { success: true, preauthorization: preauth };
      } catch {
        return { success: false };
      }
    },
    [userId, requestPreauthMutation]
  );

  // ---- Claims ----

  const createClaimMutation = useMutation({
    mutationFn: async (data: CreateClaimData) => {
      if (!userId) throw new Error("No user");
      return insuranceService.createClaim(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "claims", userId] });
    },
  });

  const createClaim = useCallback(
    async (
      data: CreateClaimData
    ): Promise<{ success: boolean; claim?: InsuranceClaim }> => {
      if (!userId) return { success: false };
      try {
        const claim = await createClaimMutation.mutateAsync(data);
        return { success: true, claim };
      } catch {
        return { success: false };
      }
    },
    [userId, createClaimMutation]
  );

  const submitClaimMutation = useMutation({
    mutationFn: async (id: string) => {
      return insuranceService.submitClaim(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insurance", "claims", userId] });
    },
  });

  const submitClaim = useCallback(
    async (id: string): Promise<{ success: boolean }> => {
      try {
        await submitClaimMutation.mutateAsync(id);
        return { success: true };
      } catch {
        return { success: false };
      }
    },
    [submitClaimMutation]
  );

  // ---- Derived state ----

  const activeInsurances = insurances.filter((i) => i.is_active);
  const recentPreauthorizations = preauthorizations.slice(0, 5);
  const recentClaims = claims.slice(0, 5);

  const saving =
    addInsuranceMutation.isPending ||
    updateInsuranceMutation.isPending ||
    deleteInsuranceMutation.isPending ||
    requestPreauthMutation.isPending ||
    createClaimMutation.isPending ||
    submitClaimMutation.isPending;

  const error =
    queryError ??
    addInsuranceMutation.error?.message ??
    updateInsuranceMutation.error?.message ??
    deleteInsuranceMutation.error?.message ??
    requestPreauthMutation.error?.message ??
    createClaimMutation.error?.message ??
    submitClaimMutation.error?.message ??
    null;

  return {
    userId,
    insurances,
    activeInsurances,
    preauthorizations,
    recentPreauthorizations,
    claims,
    recentClaims,
    loading: isLoading,
    saving,
    error,
    addInsurance,
    updateInsurance,
    deleteInsurance,
    requestPreauthorization,
    createClaim,
    submitClaim,
    refresh: () => {
      insurancesQuery.refetch();
      preauthorizationsQuery.refetch();
      claimsQuery.refetch();
    },
  };
}
