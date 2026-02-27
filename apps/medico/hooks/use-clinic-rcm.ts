/**
 * Hook para gestión del Revenue Cycle Management (RCM)
 * 
 * Orquesta claims, pagos, KPIs financieros y conciliación
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClaims,
  getClaimById,
  createClaim,
  updateClaim,
  submitClaim,
  approveClaim,
  denyClaim,
  getClaimItems,
  addClaimItem,
  getClaimPayments,
  registerPayment,
  reconcilePayment,
  getUnreconciledPayments,
  getActivePayerContracts,
  getFinancialKPIs,
  calculateDSO,
  getAgingClaims,
} from '@/lib/supabase/services/clinic-rcm-service';
import type {
  ClaimFilters,
  RCMClaimItem,
  ClaimSummary,
} from '@red-salud/types';

export function useClinicRCM(clinicId?: string) {
  const queryClient = useQueryClient();

  // Obtener contratos activos
  const {
    data: payerContracts,
    isLoading: loadingContracts,
  } = useQuery({
    queryKey: ['payer-contracts', clinicId],
    queryFn: () => (clinicId ? getActivePayerContracts(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener KPIs financieros
  const {
    data: financialKPIs,
    isLoading: loadingKPIs,
    refetch: refetchKPIs,
  } = useQuery({
    queryKey: ['financial-kpis', clinicId],
    queryFn: () => (clinicId ? getFinancialKPIs(clinicId, 6) : []),
    enabled: !!clinicId,
  });

  // Calcular DSO
  const {
    data: dso,
    isLoading: loadingDSO,
  } = useQuery({
    queryKey: ['dso', clinicId],
    queryFn: () => (clinicId ? calculateDSO(clinicId, 90) : 0),
    enabled: !!clinicId,
  });

  // Obtener pagos sin conciliar
  const {
    data: unreconciledPayments,
    isLoading: loadingUnreconciled,
    refetch: refetchUnreconciled,
  } = useQuery({
    queryKey: ['unreconciled-payments', clinicId],
    queryFn: () => (clinicId ? getUnreconciledPayments(clinicId) : []),
    enabled: !!clinicId,
  });

  // Obtener claims próximos a vencer
  const {
    data: agingClaims,
    isLoading: loadingAging,
  } = useQuery({
    queryKey: ['aging-claims', clinicId],
    queryFn: () => (clinicId ? getAgingClaims(clinicId, 30) : []),
    enabled: !!clinicId,
  });

  // Mutation: Crear claim
  const createClaimMutation = useMutation({
    mutationFn: createClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['financial-kpis'] });
    },
  });

  // Mutation: Actualizar claim
  const updateClaimMutation = useMutation({
    mutationFn: ({ claimId, updates }: { claimId: string; updates: Partial<ClaimSummary> }) =>
      updateClaim(claimId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
    },
  });

  // Mutation: Enviar claim
  const submitClaimMutation = useMutation({
    mutationFn: submitClaim,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
    },
  });

  // Mutation: Aprobar claim
  const approveClaimMutation = useMutation({
    mutationFn: ({ claimId, amount }: { claimId: string; amount: number }) =>
      approveClaim(claimId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
    },
  });

  // Mutation: Denegar claim
  const denyClaimMutation = useMutation({
    mutationFn: ({
      claimId,
      reason,
      code,
    }: {
      claimId: string;
      reason: string;
      code?: string;
    }) => denyClaim(claimId, reason, code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['claim'] });
    },
  });

  // Mutation: Registrar pago
  const registerPaymentMutation = useMutation({
    mutationFn: registerPayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim-payments'] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      queryClient.invalidateQueries({ queryKey: ['unreconciled-payments'] });
      queryClient.invalidateQueries({ queryKey: ['financial-kpis'] });
      queryClient.invalidateQueries({ queryKey: ['dso'] });
    },
  });

  // Mutation: Conciliar pago
  const reconcilePaymentMutation = useMutation({
    mutationFn: ({ paymentId, userId }: { paymentId: string; userId: string }) =>
      reconcilePayment(paymentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unreconciled-payments'] });
      queryClient.invalidateQueries({ queryKey: ['claim-payments'] });
    },
  });

  return {
    // Data
    payerContracts,
    financialKPIs,
    dso,
    unreconciledPayments,
    agingClaims,

    // Loading
    isLoading: loadingContracts || loadingKPIs || loadingDSO,
    loadingContracts,
    loadingKPIs,
    loadingDSO,
    loadingUnreconciled,
    loadingAging,

    // Actions
    createClaim: createClaimMutation.mutateAsync,
    updateClaim: updateClaimMutation.mutateAsync,
    submitClaim: submitClaimMutation.mutateAsync,
    approveClaim: approveClaimMutation.mutateAsync,
    denyClaim: denyClaimMutation.mutateAsync,
    registerPayment: registerPaymentMutation.mutateAsync,
    reconcilePayment: reconcilePaymentMutation.mutateAsync,

    // Refetch
    refetchKPIs,
    refetchUnreconciled,

    // Mutation states
    isCreatingClaim: createClaimMutation.isPending,
    isUpdatingClaim: updateClaimMutation.isPending,
    isSubmittingClaim: submitClaimMutation.isPending,
    isRegisteringPayment: registerPaymentMutation.isPending,
  };
}

export function useClaimDetails(claimId?: string) {
  const queryClient = useQueryClient();

  const {
    data: claim,
    isLoading: loadingClaim,
    error,
  } = useQuery({
    queryKey: ['claim', claimId],
    queryFn: () => (claimId ? getClaimById(claimId) : null),
    enabled: !!claimId,
  });

  const {
    data: items,
    isLoading: loadingItems,
  } = useQuery({
    queryKey: ['claim-items', claimId],
    queryFn: () => (claimId ? getClaimItems(claimId) : []),
    enabled: !!claimId,
  });

  const {
    data: payments,
    isLoading: loadingPayments,
  } = useQuery({
    queryKey: ['claim-payments', claimId],
    queryFn: () => (claimId ? getClaimPayments(claimId) : []),
    enabled: !!claimId,
  });

  const addItemMutation = useMutation({
    mutationFn: (item: Omit<RCMClaimItem, 'id' | 'claim_id' | 'line_number' | 'created_at' | 'updated_at'>) =>
      claimId ? addClaimItem(claimId, item) : Promise.reject('No claim ID'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim-items', claimId] });
      queryClient.invalidateQueries({ queryKey: ['claim', claimId] });
    },
  });

  const totalAmount = items?.reduce((sum, item) => sum + item.total_price, 0) || 0;
  const paidAmount = payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const balanceDue = totalAmount - paidAmount;

  return {
    claim,
    items,
    payments,
    totalAmount,
    paidAmount,
    balanceDue,
    isLoading: loadingClaim || loadingItems || loadingPayments,
    error,
    addItem: addItemMutation.mutateAsync,
    isAddingItem: addItemMutation.isPending,
  };
}

export function useClaimsList(filters: ClaimFilters) {
  const {
    data: claims,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['claims', filters],
    queryFn: () => getClaims(filters),
    enabled: !!(filters.clinic_ids && filters.clinic_ids.length > 0),
  });

  return {
    claims,
    isLoading,
    error,
    refetch,
  };
}
