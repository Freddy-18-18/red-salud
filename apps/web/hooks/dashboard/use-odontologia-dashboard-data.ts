"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Appointment } from "@/lib/supabase/types/appointments";

type ClaimStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "approved"
  | "partially_paid"
  | "paid"
  | "denied"
  | "appealed"
  | "cancelled";

interface ClaimRow {
  id: string;
  patient_id: string;
  status: ClaimStatus;
  claim_date: string;
}

interface ClaimWithItemsRow extends ClaimRow {
  rcm_claim_items?: Array<{ provider_id?: string | null }>;
}

interface DentalFindingRow {
  id: string;
  severity: "low" | "medium" | "high" | "critical";
  observed_at: string;
}

interface DentalPerioEntryRow {
  id: string;
  probing_depth_mm: number;
  bleeding: boolean;
  recorded_at: string;
}

interface DentalTreatmentPlanItemRow {
  id: string;
  status: "planned" | "scheduled" | "in_progress" | "completed" | "cancelled";
}

interface DentalImagingStudyRow {
  id: string;
  study_date: string;
  created_at: string;
}

interface DentalAiFindingRow {
  id: string;
  status: "pending_validation" | "accepted" | "rejected";
  generated_at: string;
  reviewed_at: string | null;
}

export interface OdontologyDashboardData {
  morningHuddle: {
    citasHoy: number;
    noShowEnRiesgo: number;
    pacientesSinProximaCita: number;
  };
  clinicalBoard: {
    hallazgosCriticosNuevos: number;
    alertasPerio: number;
    tratamientosPendientes: number;
  };
  productionBoard: {
    produccionDia: number;
    produccionSemana: number;
    produccionMes: number;
    ticketPromedio: number;
  };
  rcmBoard: {
    claimsPendientes: number;
    claimsDenegados: number;
    agingMayor30Dias: number;
    firstPassRate: number;
  };
  growthBoard: {
    recallBacklog: number;
    reactivacion30Dias: number;
    reactivacion60Dias: number;
    reactivacion90Dias: number;
  };
  imagingBoard: {
    estudiosHoy: number;
    findingsPendientesValidacion: number;
    tiempoValidacionPromedioMin: number;
    hasRealIntegration: boolean;
  };
  refreshedAt: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function getDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekStart(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

function isPendingStatus(status?: string): boolean {
  const value = (status || "").toLowerCase();
  return value === "pending" || value === "confirmed" || value === "in_progress";
}

function isCompletedStatus(status?: string): boolean {
  return (status || "").toLowerCase() === "completed";
}

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isMissingRelationError(error: { code?: string; message?: string } | null): boolean {
  if (!error) {
    return false;
  }

  const code = (error.code || "").toUpperCase();
  const message = (error.message || "").toLowerCase();

  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

export function useOdontologiaDashboardData(doctorId?: string): OdontologyDashboardData {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [claims, setClaims] = useState<ClaimWithItemsRow[]>([]);
  const [dentalFindings, setDentalFindings] = useState<DentalFindingRow[]>([]);
  const [dentalPerioEntries, setDentalPerioEntries] = useState<DentalPerioEntryRow[]>([]);
  const [dentalPlanItems, setDentalPlanItems] = useState<DentalTreatmentPlanItemRow[]>([]);
  const [imagingStudies, setImagingStudies] = useState<DentalImagingStudyRow[]>([]);
  const [aiFindings, setAiFindings] = useState<DentalAiFindingRow[]>([]);
  const [hasImagingPipeline, setHasImagingPipeline] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!doctorId) {
      setAppointments([]);
      setClaims([]);
      setDentalFindings([]);
      setDentalPerioEntries([]);
      setDentalPlanItems([]);
      setImagingStudies([]);
      setAiFindings([]);
      setHasImagingPipeline(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const now = new Date();
      const sixMonthsAgo = new Date(now);
      sixMonthsAgo.setMonth(now.getMonth() - 6);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, paciente_id, medico_id, fecha_hora, status, precio")
        .eq("medico_id", doctorId)
        .gte("fecha_hora", sixMonthsAgo.toISOString())
        .order("fecha_hora", { ascending: false });

      if (appointmentsError) {
        throw appointmentsError;
      }

      const normalizedAppointments: Appointment[] = (appointmentsData || []).map((row) => {
        const fecha = new Date(row.fecha_hora);
        return {
          id: row.id,
          patient_id: row.paciente_id,
          doctor_id: row.medico_id,
          appointment_date: getDateOnly(fecha),
          appointment_time: fecha.toISOString().slice(11, 19),
          duration: 30,
          status: (row.status || "pending") as Appointment["status"],
          consultation_type: "presencial",
          price: safeNumber(row.precio),
          created_at: fecha.toISOString(),
          updated_at: fecha.toISOString(),
        } as Appointment;
      });

      setAppointments(normalizedAppointments);

      const patientIds = Array.from(new Set(normalizedAppointments.map((item) => item.patient_id).filter(Boolean)));

      if (patientIds.length > 0) {
        const { data: claimsData, error: claimsError } = await supabase
          .from("rcm_claims")
          .select("id, patient_id, status, claim_date, rcm_claim_items(provider_id)")
          .in("patient_id", patientIds)
          .order("claim_date", { ascending: false })
          .limit(250);

        if (claimsError) {
          throw claimsError;
        }

        const providerScopedClaims = (claimsData || []).filter((claim) => {
          const items = (claim as ClaimWithItemsRow).rcm_claim_items || [];
          if (items.length === 0) {
            return true;
          }
          return items.some((item) => item.provider_id === doctorId);
        }) as ClaimWithItemsRow[];

        setClaims(providerScopedClaims);
      } else {
        setClaims([]);
      }

      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);

      const [
        findingsResult,
        perioResult,
        planItemsResult,
        imagingStudiesResult,
        aiFindingsResult,
      ] = await Promise.all([
        supabase
          .from("dental_clinical_findings")
          .select("id, severity, observed_at")
          .eq("doctor_id", doctorId)
          .gte("observed_at", thirtyDaysAgo.toISOString())
          .order("observed_at", { ascending: false })
          .limit(500),
        supabase
          .from("dental_perio_chart_entries")
          .select("id, probing_depth_mm, bleeding, recorded_at")
          .eq("doctor_id", doctorId)
          .gte("recorded_at", thirtyDaysAgo.toISOString())
          .order("recorded_at", { ascending: false })
          .limit(500),
        supabase
          .from("dental_treatment_plan_items")
          .select("id, status")
          .eq("doctor_id", doctorId)
          .in("status", ["planned", "scheduled", "in_progress"])
          .order("created_at", { ascending: false })
          .limit(1000),
        supabase
          .from("dental_imaging_studies")
          .select("id, study_date, created_at")
          .eq("doctor_id", doctorId)
          .gte("study_date", thirtyDaysAgo.toISOString().slice(0, 10))
          .order("study_date", { ascending: false })
          .limit(500),
        supabase
          .from("dental_ai_findings")
          .select("id, status, generated_at, reviewed_at")
          .eq("doctor_id", doctorId)
          .gte("generated_at", thirtyDaysAgo.toISOString())
          .order("generated_at", { ascending: false })
          .limit(1000),
      ]);

      if (findingsResult.error) {
        if (isMissingRelationError(findingsResult.error)) {
          setDentalFindings([]);
        } else {
          throw findingsResult.error;
        }
      } else {
        setDentalFindings((findingsResult.data || []) as DentalFindingRow[]);
      }

      if (perioResult.error) {
        if (isMissingRelationError(perioResult.error)) {
          setDentalPerioEntries([]);
        } else {
          throw perioResult.error;
        }
      } else {
        setDentalPerioEntries((perioResult.data || []) as DentalPerioEntryRow[]);
      }

      if (planItemsResult.error) {
        if (isMissingRelationError(planItemsResult.error)) {
          setDentalPlanItems([]);
        } else {
          throw planItemsResult.error;
        }
      } else {
        setDentalPlanItems((planItemsResult.data || []) as DentalTreatmentPlanItemRow[]);
      }

      let imagingReady = true;

      if (imagingStudiesResult.error) {
        if (isMissingRelationError(imagingStudiesResult.error)) {
          setImagingStudies([]);
          imagingReady = false;
        } else {
          throw imagingStudiesResult.error;
        }
      } else {
        setImagingStudies((imagingStudiesResult.data || []) as DentalImagingStudyRow[]);
      }

      if (aiFindingsResult.error) {
        if (isMissingRelationError(aiFindingsResult.error)) {
          setAiFindings([]);
          imagingReady = false;
        } else {
          throw aiFindingsResult.error;
        }
      } else {
        setAiFindings((aiFindingsResult.data || []) as DentalAiFindingRow[]);
      }

      setHasImagingPipeline(imagingReady);

      setRefreshedAt(new Date().toISOString());
    } catch (err) {
      const fallbackMessage = "No se pudo cargar el dashboard odontológico";
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
    const today = getDateOnly(now);
    const weekStart = getWeekStart(now);
    const month = now.getMonth();
    const year = now.getFullYear();

    const todayAppointments = appointments.filter((item) => item.appointment_date === today);

    const pendingToday = todayAppointments.filter((item) => isPendingStatus(item.status));

    const noShowRisk = pendingToday.filter((item) => {
      const appointmentDate = new Date(`${item.appointment_date}T${item.appointment_time}`);
      return appointmentDate.getTime() + 30 * 60 * 1000 < now.getTime();
    }).length;

    const weekAppointments = appointments.filter((item) => {
      const date = new Date(`${item.appointment_date}T${item.appointment_time}`);
      return date >= weekStart;
    });

    const monthCompleted = appointments.filter((item) => {
      const date = new Date(`${item.appointment_date}T${item.appointment_time}`);
      return isCompletedStatus(item.status) && date.getMonth() === month && date.getFullYear() === year;
    });

    const completedToday = todayAppointments.filter((item) => isCompletedStatus(item.status));
    const completedWeek = weekAppointments.filter((item) => isCompletedStatus(item.status));

    const productionDay = completedToday.reduce((sum, item) => sum + safeNumber(item.price), 0);
    const productionWeek = completedWeek.reduce((sum, item) => sum + safeNumber(item.price), 0);
    const productionMonth = monthCompleted.reduce((sum, item) => sum + safeNumber(item.price), 0);

    const patientTimeline = new Map<string, Date[]>();
    for (const appointment of appointments) {
      const date = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
      const list = patientTimeline.get(appointment.patient_id) || [];
      list.push(date);
      patientTimeline.set(appointment.patient_id, list);
    }

    const recallThreshold = new Date(now);
    recallThreshold.setDate(now.getDate() - 180);

    let recallBacklog = 0;
    let reactivacion30Dias = 0;
    let reactivacion60Dias = 0;
    let reactivacion90Dias = 0;

    patientTimeline.forEach((dates) => {
      const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
      const lastVisit = sorted.at(-1);

      if (lastVisit === undefined) {
        return;
      }

      if (lastVisit < recallThreshold) {
        recallBacklog += 1;
      }

      for (let index = 1; index < sorted.length; index += 1) {
        const previous = sorted.at(index - 1);
        const current = sorted.at(index);

        if (previous === undefined || current === undefined) {
          continue;
        }

        const diffDays = Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays >= 90) {
          const sinceCurrentDays = Math.floor((now.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
          if (sinceCurrentDays <= 30) reactivacion30Dias += 1;
          if (sinceCurrentDays <= 60) reactivacion60Dias += 1;
          if (sinceCurrentDays <= 90) reactivacion90Dias += 1;
        }
      }
    });

    const pendingClaims = claims.filter((claim) =>
      ["draft", "submitted", "in_review", "appealed", "partially_paid"].includes(claim.status)
    ).length;

    const deniedClaims = claims.filter((claim) => claim.status === "denied").length;

    const agingLimit = new Date(now);
    agingLimit.setDate(now.getDate() - 30);

    const agingOver30 = claims.filter((claim) => {
      const claimDate = new Date(claim.claim_date);
      return claimDate < agingLimit && claim.status !== "paid";
    }).length;

    const firstPassPool = claims.filter((claim) => ["approved", "paid", "denied"].includes(claim.status));
    const firstPassPositive = firstPassPool.filter((claim) => claim.status === "approved" || claim.status === "paid");
    const firstPassRate = firstPassPool.length === 0 ? 0 : Math.round((firstPassPositive.length / firstPassPool.length) * 100);

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 7);

    const hallazgosCriticosNuevos = dentalFindings.filter((finding) => {
      const severity = finding.severity;
      const observedAt = new Date(finding.observed_at);
      return (severity === "high" || severity === "critical") && observedAt >= sevenDaysAgo;
    }).length;

    const alertasPerio = dentalPerioEntries.filter(
      (entry) => safeNumber(entry.probing_depth_mm) >= 6 || Boolean(entry.bleeding)
    ).length;

    const tratamientosPendientes =
      dentalPlanItems.length > 0
        ? dentalPlanItems.filter((item) => ["planned", "scheduled", "in_progress"].includes(item.status)).length
        : pendingToday.length;

    const estudiosHoy = imagingStudies.filter((study) => {
      const dateValue = study.study_date || getDateOnly(new Date(study.created_at));
      return dateValue === today;
    }).length;

    const findingsPendientesValidacion = aiFindings.filter((finding) => finding.status === "pending_validation").length;

    const reviewedFindings = aiFindings.filter(
      (finding) => finding.reviewed_at && ["accepted", "rejected"].includes(finding.status)
    );

    const tiempoValidacionPromedioMin =
      reviewedFindings.length === 0
        ? 0
        : Math.round(
            reviewedFindings.reduce((sum, finding) => {
              const generatedAt = new Date(finding.generated_at).getTime();
              const reviewedAt = new Date(finding.reviewed_at || finding.generated_at).getTime();
              const diffMin = Math.max(0, Math.round((reviewedAt - generatedAt) / (1000 * 60)));
              return sum + diffMin;
            }, 0) / reviewedFindings.length
          );

    return {
      morningHuddle: {
        citasHoy: todayAppointments.length,
        noShowEnRiesgo: noShowRisk,
        pacientesSinProximaCita: recallBacklog,
      },
      clinicalBoard: {
        hallazgosCriticosNuevos,
        alertasPerio,
        tratamientosPendientes,
      },
      productionBoard: {
        produccionDia: productionDay,
        produccionSemana: productionWeek,
        produccionMes: productionMonth,
        ticketPromedio:
          monthCompleted.length === 0 ? 0 : Math.round((productionMonth / monthCompleted.length) * 100) / 100,
      },
      rcmBoard: {
        claimsPendientes: pendingClaims,
        claimsDenegados: deniedClaims,
        agingMayor30Dias: agingOver30,
        firstPassRate,
      },
      growthBoard: {
        recallBacklog,
        reactivacion30Dias,
        reactivacion60Dias,
        reactivacion90Dias,
      },
      imagingBoard: {
        estudiosHoy,
        findingsPendientesValidacion,
        tiempoValidacionPromedioMin,
        hasRealIntegration: hasImagingPipeline,
      },
    };
  }, [appointments, claims, dentalFindings, dentalPerioEntries, dentalPlanItems, imagingStudies, aiFindings, hasImagingPipeline]);

  return {
    ...derived,
    refreshedAt,
    isLoading,
    error,
    refresh: loadData,
  };
}
