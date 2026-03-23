"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AppointmentPatientRow {
  paciente_id: string;
}

interface ClaimRow {
  id: string;
  patient_id: string;
  claim_date: string;
  status: "draft" | "submitted" | "in_review" | "approved" | "partially_paid" | "paid" | "denied" | "appealed" | "cancelled";
  denial_reason?: string | null;
  denial_code?: string | null;
  total_amount?: number | null;
  paid_amount?: number | null;
}

interface EligibilityRow {
  id: string;
  eligibility_status: "eligible" | "partial" | "ineligible" | "error";
  checked_at: string;
  estimated_copay: number;
  payer_name: string;
  policy_number?: string | null;
}

interface WorkQueueRow {
  id: string;
  queue_type: "eligibility" | "denial" | "appeal" | "missing_docs" | "followup";
  priority: "low" | "medium" | "high" | "urgent";
  reason: string;
  status: "open" | "in_progress" | "resolved" | "dismissed";
  due_at?: string | null;
  claim_id?: string | null;
  patient_id?: string | null;
}

interface LifecycleEventRow {
  id: string;
  to_status: string;
  denial_reason?: string | null;
  occurred_at: string;
}

export interface OdontologiaRcmData {
  stats: {
    ingresosMes: number;
    pendienteSeguros: number;
    claimsPagadosRate: number;
    elegibilidadVerificadaRate: number;
  };
  claimsByStatus: {
    pending: number;
    denied: number;
    approvedOrPaid: number;
  };
  denialsByCause: Array<{ cause: string; count: number }>;
  recentClaims: ClaimRow[];
  recentEligibilityChecks: EligibilityRow[];
  workQueue: WorkQueueRow[];
  lifecycleRecent: LifecycleEventRow[];
  hasPhase3Integration: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function isMissingRelationError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = (error.code || "").toUpperCase();
  const message = (error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function useOdontologiaRcmData(doctorId?: string): OdontologiaRcmData {
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [eligibilityChecks, setEligibilityChecks] = useState<EligibilityRow[]>([]);
  const [workQueue, setWorkQueue] = useState<WorkQueueRow[]>([]);
  const [lifecycleRecent, setLifecycleRecent] = useState<LifecycleEventRow[]>([]);
  const [hasPhase3Integration, setHasPhase3Integration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!doctorId) {
      setClaims([]);
      setEligibilityChecks([]);
      setWorkQueue([]);
      setLifecycleRecent([]);
      setHasPhase3Integration(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("paciente_id")
        .eq("medico_id", doctorId)
        .gte("fecha_hora", sixMonthsAgo.toISOString())
        .limit(1000);

      if (appointmentsError) {
        throw appointmentsError;
      }

      const patientIds = Array.from(
        new Set(
          ((appointmentsData || []) as AppointmentPatientRow[])
            .map((row) => row.paciente_id)
            .filter(Boolean)
        )
      );

      if (patientIds.length > 0) {
        const { data: claimsData, error: claimsError } = await supabase
          .from("rcm_claims")
          .select("id, patient_id, claim_date, status, denial_reason, denial_code, total_amount, paid_amount")
          .in("patient_id", patientIds)
          .order("claim_date", { ascending: false })
          .limit(500);

        if (claimsError) {
          throw claimsError;
        }

        setClaims((claimsData || []) as ClaimRow[]);
      } else {
        setClaims([]);
      }

      const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [eligibilityResult, queueResult, lifecycleResult] = await Promise.all([
        supabase
          .from("dental_eligibility_checks")
          .select("id, eligibility_status, checked_at, estimated_copay, payer_name, policy_number")
          .eq("doctor_id", doctorId)
          .gte("checked_at", thirtyDaysAgoIso)
          .order("checked_at", { ascending: false })
          .limit(100),
        supabase
          .from("dental_rcm_work_queues")
          .select("id, queue_type, priority, reason, status, due_at, claim_id, patient_id")
          .eq("doctor_id", doctorId)
          .in("status", ["open", "in_progress"])
          .order("created_at", { ascending: false })
          .limit(150),
        supabase
          .from("dental_claim_lifecycle_events")
          .select("id, to_status, denial_reason, occurred_at")
          .eq("doctor_id", doctorId)
          .order("occurred_at", { ascending: false })
          .limit(120),
      ]);

      let phase3Ready = true;

      if (eligibilityResult.error) {
        if (isMissingRelationError(eligibilityResult.error)) {
          setEligibilityChecks([]);
          phase3Ready = false;
        } else {
          throw eligibilityResult.error;
        }
      } else {
        setEligibilityChecks((eligibilityResult.data || []) as EligibilityRow[]);
      }

      if (queueResult.error) {
        if (isMissingRelationError(queueResult.error)) {
          setWorkQueue([]);
          phase3Ready = false;
        } else {
          throw queueResult.error;
        }
      } else {
        setWorkQueue((queueResult.data || []) as WorkQueueRow[]);
      }

      if (lifecycleResult.error) {
        if (isMissingRelationError(lifecycleResult.error)) {
          setLifecycleRecent([]);
          phase3Ready = false;
        } else {
          throw lifecycleResult.error;
        }
      } else {
        setLifecycleRecent((lifecycleResult.data || []) as LifecycleEventRow[]);
      }

      setHasPhase3Integration(phase3Ready);
    } catch (err) {
      const fallbackMessage = "No se pudo cargar datos de RCM odontológico";
      setError(err instanceof Error ? err.message || fallbackMessage : fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const derived = useMemo(() => {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const monthClaims = claims.filter((claim) => {
      const date = new Date(claim.claim_date);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    const ingresosMes = monthClaims.reduce((sum, claim) => sum + safeNumber(claim.paid_amount), 0);

    const pendingStatuses = ["submitted", "in_review", "appealed", "partially_paid", "draft"];

    const pendingClaims = claims.filter((claim) => pendingStatuses.includes(claim.status));
    const deniedClaims = claims.filter((claim) => claim.status === "denied");
    const approvedOrPaidClaims = claims.filter((claim) => claim.status === "approved" || claim.status === "paid");

    const pendienteSeguros = pendingClaims.reduce((sum, claim) => {
      const total = safeNumber(claim.total_amount);
      const paid = safeNumber(claim.paid_amount);
      return sum + Math.max(0, total - paid);
    }, 0);

    const claimsPagadosRate = claims.length === 0 ? 0 : Math.round((approvedOrPaidClaims.length / claims.length) * 100);

    const verifiedEligibility = eligibilityChecks.filter((item) => item.eligibility_status === "eligible" || item.eligibility_status === "partial");
    const elegibilidadVerificadaRate =
      eligibilityChecks.length === 0 ? 0 : Math.round((verifiedEligibility.length / eligibilityChecks.length) * 100);

    const denialsByCauseMap = new Map<string, number>();

    for (const event of lifecycleRecent) {
      if (event.to_status !== "denied") continue;
      const key = event.denial_reason || "Sin motivo especificado";
      denialsByCauseMap.set(key, (denialsByCauseMap.get(key) || 0) + 1);
    }

    if (denialsByCauseMap.size === 0) {
      for (const claim of deniedClaims) {
        const key = claim.denial_reason || claim.denial_code || "Sin motivo especificado";
        denialsByCauseMap.set(key, (denialsByCauseMap.get(key) || 0) + 1);
      }
    }

    const denialsByCause = Array.from(denialsByCauseMap.entries())
      .map(([cause, count]) => ({ cause, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      stats: {
        ingresosMes,
        pendienteSeguros,
        claimsPagadosRate,
        elegibilidadVerificadaRate,
      },
      claimsByStatus: {
        pending: pendingClaims.length,
        denied: deniedClaims.length,
        approvedOrPaid: approvedOrPaidClaims.length,
      },
      denialsByCause,
      recentClaims: claims.slice(0, 12),
      recentEligibilityChecks: eligibilityChecks.slice(0, 8),
      workQueue: workQueue.slice(0, 12),
    };
  }, [claims, eligibilityChecks, lifecycleRecent, workQueue]);

  return {
    ...derived,
    lifecycleRecent,
    hasPhase3Integration,
    isLoading,
    error,
    refresh: loadData,
  };
}
