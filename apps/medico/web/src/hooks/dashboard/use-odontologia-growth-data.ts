"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";

interface AppointmentRow {
  id: string;
  paciente_id: string;
  fecha_hora: string;
  status: string;
}

interface ClaimRow {
  id: string;
  patient_id: string;
  total_amount?: number | null;
  paid_amount?: number | null;
}

interface SegmentRow {
  id: string;
  patient_id: string;
  risk_level: "low" | "medium" | "high";
  economic_value_level: "low" | "medium" | "high";
  return_probability_pct: number;
  segment_label: string;
  recommended_channel?: "sms" | "whatsapp" | "email" | "call" | null;
}

interface CampaignRow {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed";
  objective: string;
  target_segment_label?: string | null;
}

interface CampaignEventRow {
  id: string;
  campaign_id: string;
  event_type: "sent" | "opened" | "clicked" | "booked" | "accepted_treatment" | "paid";
  amount?: number | null;
}

export interface OdontologiaGrowthData {
  kpis: {
    recallBacklog: number;
    highRiskCount: number;
    reactivation90d: number;
    closedLoopConversionRate: number;
    economicImpactAmount: number;
  };
  topSegments: Array<{
    label: string;
    patients: number;
  }>;
  campaignSummary: Array<{
    campaignId: string;
    name: string;
    status: string;
    sent: number;
    booked: number;
    acceptedTreatment: number;
    paid: number;
  }>;
  recallCandidates: Array<{
    patientId: string;
    lastVisitAt: string;
    inactivityDays: number;
    returnProbability: number;
    suggestedChannel: string;
  }>;
  hasPhase3Integration: boolean;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isMissingRelationError(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  const code = (error.code || "").toUpperCase();
  const message = (error.message || "").toLowerCase();
  return code === "42P01" || code === "PGRST205" || message.includes("does not exist");
}

export function useOdontologiaGrowthData(doctorId?: string): OdontologiaGrowthData {
  const [appointments, setAppointments] = useState<AppointmentRow[]>([]);
  const [claims, setClaims] = useState<ClaimRow[]>([]);
  const [segments, setSegments] = useState<SegmentRow[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [campaignEvents, setCampaignEvents] = useState<CampaignEventRow[]>([]);
  const [hasPhase3Integration, setHasPhase3Integration] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!doctorId) {
      setAppointments([]);
      setClaims([]);
      setSegments([]);
      setCampaigns([]);
      setCampaignEvents([]);
      setHasPhase3Integration(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from("appointments")
        .select("id, paciente_id, fecha_hora, status")
        .eq("medico_id", doctorId)
        .gte("fecha_hora", oneYearAgo.toISOString())
        .order("fecha_hora", { ascending: false })
        .limit(5000);

      if (appointmentsError) throw appointmentsError;
      setAppointments((appointmentsData || []) as AppointmentRow[]);

      const patientIds = Array.from(new Set(((appointmentsData || []) as AppointmentRow[]).map((a) => a.paciente_id).filter(Boolean)));

      if (patientIds.length > 0) {
        const { data: claimsData, error: claimsError } = await supabase
          .from("rcm_claims")
          .select("id, patient_id, total_amount, paid_amount")
          .in("patient_id", patientIds)
          .order("claim_date", { ascending: false })
          .limit(1000);

        if (claimsError) throw claimsError;
        setClaims((claimsData || []) as ClaimRow[]);
      } else {
        setClaims([]);
      }

      const [segmentsResult, campaignsResult, campaignEventsResult] = await Promise.all([
        supabase
          .from("dental_growth_segments")
          .select("id, patient_id, risk_level, economic_value_level, return_probability_pct, segment_label, recommended_channel")
          .eq("doctor_id", doctorId)
          .order("updated_at", { ascending: false })
          .limit(5000),
        supabase
          .from("dental_growth_campaigns")
          .select("id, name, status, objective, target_segment_label")
          .eq("doctor_id", doctorId)
          .order("created_at", { ascending: false })
          .limit(200),
        supabase
          .from("dental_growth_campaign_events")
          .select("id, campaign_id, event_type, amount")
          .eq("doctor_id", doctorId)
          .order("event_at", { ascending: false })
          .limit(5000),
      ]);

      let phase3Ready = true;

      if (segmentsResult.error) {
        if (isMissingRelationError(segmentsResult.error)) {
          setSegments([]);
          phase3Ready = false;
        } else {
          throw segmentsResult.error;
        }
      } else {
        setSegments((segmentsResult.data || []) as SegmentRow[]);
      }

      if (campaignsResult.error) {
        if (isMissingRelationError(campaignsResult.error)) {
          setCampaigns([]);
          phase3Ready = false;
        } else {
          throw campaignsResult.error;
        }
      } else {
        setCampaigns((campaignsResult.data || []) as CampaignRow[]);
      }

      if (campaignEventsResult.error) {
        if (isMissingRelationError(campaignEventsResult.error)) {
          setCampaignEvents([]);
          phase3Ready = false;
        } else {
          throw campaignEventsResult.error;
        }
      } else {
        setCampaignEvents((campaignEventsResult.data || []) as CampaignEventRow[]);
      }

      setHasPhase3Integration(phase3Ready);
    } catch (err) {
      const fallbackMessage = "No se pudo cargar datos de Growth odontológico";
      setError(err instanceof Error ? err.message || fallbackMessage : fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const derived = useMemo(() => {
    const now = Date.now();

    const timelineByPatient = new Map<string, Date[]>();

    for (const appointment of appointments) {
      const date = new Date(appointment.fecha_hora);
      const list = timelineByPatient.get(appointment.paciente_id) || [];
      list.push(date);
      timelineByPatient.set(appointment.paciente_id, list);
    }

    let recallBacklog = 0;
    let reactivation90d = 0;

    const recallCandidates: OdontologiaGrowthData["recallCandidates"] = [];

    timelineByPatient.forEach((dates, patientId) => {
      const sorted = dates.sort((a, b) => a.getTime() - b.getTime());
      const lastVisit = sorted.at(-1);
      if (!lastVisit) return;

      const inactivityDays = Math.floor((now - lastVisit.getTime()) / (1000 * 60 * 60 * 24));

      if (inactivityDays >= 180) {
        recallBacklog += 1;
      }

      const hadBigGap = sorted.some((current, index) => {
        if (index === 0) return false;
        const previous = sorted[index - 1];
        if (!previous) return false;
        return Math.floor((current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24)) >= 90;
      });

      if (hadBigGap && inactivityDays <= 90) {
        reactivation90d += 1;
      }

      const segment = segments.find((item) => item.patient_id === patientId);
      const returnProbability = segment ? Math.round(safeNumber(segment.return_probability_pct)) : Math.max(10, 100 - Math.floor(inactivityDays / 3));

      recallCandidates.push({
        patientId,
        lastVisitAt: lastVisit.toISOString(),
        inactivityDays,
        returnProbability,
        suggestedChannel: segment?.recommended_channel || "whatsapp",
      });
    });

    const sortedCandidates = recallCandidates
      .sort((a, b) => b.inactivityDays - a.inactivityDays)
      .slice(0, 12);

    const highRiskCount = segments.length > 0 ? segments.filter((segment) => segment.risk_level === "high").length : sortedCandidates.filter((candidate) => candidate.inactivityDays >= 270).length;

    const totalSent = campaignEvents.filter((event) => event.event_type === "sent").length;
    const totalBooked = campaignEvents.filter((event) => event.event_type === "booked").length;
    const totalPaidEvents = campaignEvents.filter((event) => event.event_type === "paid");

    const closedLoopConversionRate = totalSent === 0 ? 0 : Math.round((totalBooked / totalSent) * 100);
    const economicImpactAmount = totalPaidEvents.reduce((sum, event) => sum + safeNumber(event.amount), 0);

    const segmentCountMap = new Map<string, number>();
    for (const segment of segments) {
      segmentCountMap.set(segment.segment_label, (segmentCountMap.get(segment.segment_label) || 0) + 1);
    }

    const topSegments = Array.from(segmentCountMap.entries())
      .map(([label, patients]) => ({ label, patients }))
      .sort((a, b) => b.patients - a.patients)
      .slice(0, 6);

    const eventsByCampaign = new Map<string, CampaignEventRow[]>();
    for (const event of campaignEvents) {
      const list = eventsByCampaign.get(event.campaign_id) || [];
      list.push(event);
      eventsByCampaign.set(event.campaign_id, list);
    }

    const campaignSummary = campaigns.slice(0, 8).map((campaign) => {
      const events = eventsByCampaign.get(campaign.id) || [];
      return {
        campaignId: campaign.id,
        name: campaign.name,
        status: campaign.status,
        sent: events.filter((event) => event.event_type === "sent").length,
        booked: events.filter((event) => event.event_type === "booked").length,
        acceptedTreatment: events.filter((event) => event.event_type === "accepted_treatment").length,
        paid: events.filter((event) => event.event_type === "paid").length,
      };
    });

    return {
      kpis: {
        recallBacklog,
        highRiskCount,
        reactivation90d,
        closedLoopConversionRate,
        economicImpactAmount,
      },
      topSegments,
      campaignSummary,
      recallCandidates: sortedCandidates,
    };
  }, [appointments, campaignEvents, campaigns, segments]);

  return {
    ...derived,
    hasPhase3Integration,
    isLoading,
    error,
    refresh: loadData,
  };
}
