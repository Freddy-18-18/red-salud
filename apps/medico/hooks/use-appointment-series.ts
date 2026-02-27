/**
 * @file use-appointment-series.ts
 * @description Hook for managing recurring appointment series.
 */

"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { addDays, addWeeks, format, parseISO, isBefore, addMonths } from "date-fns";

export type RecurrenceType = "daily" | "weekly" | "biweekly" | "monthly" | "custom";
export type EditSeriesScope = "this_only" | "this_and_future" | "all";

export interface AppointmentSeriesConfig {
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  recurrence_days: number[];  // 0=Sun..6=Sat
  starts_on: string;          // YYYY-MM-DD
  ends_on?: string;           // YYYY-MM-DD (null = indefinido)
  max_occurrences?: number;

  // Appointment template
  duracion_minutos: number;
  motivo?: string;
  tipo_cita: string;
  notas_internas?: string;
  precio?: number;
  metodo_pago?: string;
  hora: string;               // HH:mm
}

export interface AppointmentSeries {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  offline_patient_id: string | null;
  office_id: string | null;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  recurrence_days: number[];
  starts_on: string;
  ends_on: string | null;
  max_occurrences: number | null;
  occurrences_created: number;
  duracion_minutos: number;
  motivo: string | null;
  tipo_cita: string;
  notas_internas: string | null;
  precio: number | null;
  metodo_pago: string | null;
  is_active: boolean;
  created_at: string;
}

/**
 * Generate occurrence dates for a recurrence series.
 * Returns an array of Date objects for each occurrence.
 */
export function generateOccurrences(config: AppointmentSeriesConfig, limit = 52): Date[] {
  const occurrences: Date[] = [];
  const startDate = parseISO(`${config.starts_on}T${config.hora}`);
  const endDate   = config.ends_on ? parseISO(config.ends_on) : addMonths(startDate, 12);
  const maxOcc    = config.max_occurrences ?? limit;

  let current = startDate;
  let count = 0;

  while (isBefore(current, endDate) && count < maxOcc && count < limit) {
    switch (config.recurrence_type) {
      case "daily":
        occurrences.push(new Date(current));
        current = addDays(current, config.recurrence_interval);
        break;

      case "weekly":
        // Use recurrence_days to determine which days of the week
        for (const dayOfWeek of (config.recurrence_days.length > 0 ? config.recurrence_days : [current.getDay()])) {
          // Find next occurrence on this day
          const daysUntil = (dayOfWeek - current.getDay() + 7) % 7;
          const nextDate = addDays(current, daysUntil);
          if (isBefore(nextDate, endDate) && count < maxOcc) {
            occurrences.push(new Date(nextDate));
            count++;
          }
        }
        current = addWeeks(current, config.recurrence_interval);
        continue; // skip count increment below

      case "biweekly":
        occurrences.push(new Date(current));
        current = addWeeks(current, 2);
        break;

      case "monthly":
        occurrences.push(new Date(current));
        current = addMonths(current, config.recurrence_interval);
        break;

      case "custom":
        occurrences.push(new Date(current));
        current = addDays(current, config.recurrence_interval);
        break;
    }
    count++;
  }

  return occurrences.sort((a, b) => a.getTime() - b.getTime());
}

export function useAppointmentSeries(doctorId: string | null) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  /**
   * Create a series and all its appointments in one transaction.
   * Returns the series ID and count of appointments created.
   */
  const createSeries = useCallback(async (
    config: AppointmentSeriesConfig,
    patientId: string | null,
    offlinePatientId: string | null,
    officeId: string | null
  ): Promise<{ seriesId: string | null; created: number; error: string | null }> => {
    if (!doctorId) return { seriesId: null, created: 0, error: "No doctor ID" };
    setLoading(true);
    setError(null);

    try {
      // 1. Create the series record
      const { data: series, error: seriesErr } = await supabase
        .from("appointment_series")
        .insert({
          doctor_id:           doctorId,
          patient_id:          patientId,
          offline_patient_id:  offlinePatientId,
          office_id:           officeId,
          recurrence_type:     config.recurrence_type,
          recurrence_interval: config.recurrence_interval,
          recurrence_days:     config.recurrence_days,
          starts_on:           config.starts_on,
          ends_on:             config.ends_on ?? null,
          max_occurrences:     config.max_occurrences ?? null,
          duracion_minutos:    config.duracion_minutos,
          motivo:              config.motivo ?? null,
          tipo_cita:           config.tipo_cita,
          notas_internas:      config.notas_internas ?? null,
          precio:              config.precio ?? null,
          metodo_pago:         config.metodo_pago ?? "pendiente",
        })
        .select()
        .single();

      if (seriesErr || !series) throw seriesErr ?? new Error("Error creating series");

      // 2. Generate occurrence dates
      const occurrences = generateOccurrences(config);

      if (occurrences.length === 0) {
        return { seriesId: series.id, created: 0, error: "No se generaron fechas de cita. Verifica la configuración de recurrencia." };
      }

      // 3. Bulk-insert appointments
      const appointments = occurrences.map((date, index) => ({
        medico_id:          doctorId,
        paciente_id:        patientId,
        offline_patient_id: offlinePatientId,
        location_id:        officeId,
        fecha_hora:         date.toISOString(),
        duracion_minutos:   config.duracion_minutos,
        motivo:             config.motivo ?? null,
        status:             "pendiente",
        tipo_cita:          config.tipo_cita,
        notas_internas:     config.notas_internas ?? null,
        precio:             config.precio ?? null,
        metodo_pago:        config.metodo_pago ?? "pendiente",
        series_id:          series.id,
        recurrence_index:   index,
        enviar_recordatorio: true,
      }));

      const { data: created, error: apptErr } = await supabase
        .from("appointments")
        .insert(appointments)
        .select("id");

      if (apptErr) throw apptErr;

      // 4. Update occurrences_created counter
      await supabase
        .from("appointment_series")
        .update({ occurrences_created: created?.length ?? 0 })
        .eq("id", series.id);

      return { seriesId: series.id, created: created?.length ?? 0, error: null };
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error creando serie";
      setError(msg);
      return { seriesId: null, created: 0, error: msg };
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  /**
   * Cancel one appointment or the entire series.
   */
  const cancelSeries = useCallback(async (
    seriesId: string,
    scope: EditSeriesScope,
    fromAppointmentId?: string,
    reason?: string
  ): Promise<{ error: string | null }> => {
    setLoading(true);
    try {
      if (scope === "all") {
        // Cancel series + all future appointments
        await supabase
          .from("appointment_series")
          .update({ is_active: false })
          .eq("id", seriesId);

        await supabase
          .from("appointments")
          .update({ status: "cancelada" })
          .eq("series_id", seriesId)
          .eq("status", "pendiente");

      } else if (scope === "this_and_future" && fromAppointmentId) {
        // Get the fecha_hora of the anchor appointment
        const { data: anchor } = await supabase
          .from("appointments")
          .select("fecha_hora")
          .eq("id", fromAppointmentId)
          .single();

        if (anchor) {
          await supabase
            .from("appointments")
            .update({ status: "cancelada" })
            .eq("series_id", seriesId)
            .gte("fecha_hora", anchor.fecha_hora)
            .eq("status", "pendiente");
        }

      } else if (scope === "this_only" && fromAppointmentId) {
        await supabase
          .from("appointments")
          .update({ status: "cancelada" })
          .eq("id", fromAppointmentId);
      }

      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Error" };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, createSeries, cancelSeries };
}
