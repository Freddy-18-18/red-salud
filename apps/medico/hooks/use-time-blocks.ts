/**
 * @file use-time-blocks.ts
 * @description Hook for managing doctor schedule blocks (vacations, lunch, meetings, prep).
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, addMonths, parseISO } from "date-fns";

export type TimeBlockType =
  | "bloqueo"
  | "almuerzo"
  | "reunion"
  | "vacaciones"
  | "emergencia"
  | "preparacion"
  | "administrativa";

export interface TimeBlock {
  id: string;
  doctor_id: string;
  office_id: string | null;
  tipo: TimeBlockType;
  titulo: string;
  descripcion: string | null;
  color: string;
  fecha_inicio: string;   // ISO
  fecha_fin: string;      // ISO
  todo_el_dia: boolean;
  es_recurrente: boolean;
  recurrence_rule: Record<string, unknown> | null;
  is_active: boolean;
  created_at: string;
}

export interface CreateTimeBlockInput {
  tipo: TimeBlockType;
  titulo: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  todo_el_dia?: boolean;
  es_recurrente?: boolean;
  recurrence_rule?: Record<string, unknown>;
  office_id?: string | null;
  color?: string;
}

export const TIME_BLOCK_CONFIG: Record<TimeBlockType, { label: string; color: string; icon: string; description: string }> = {
  vacaciones:    { label: "Vacaciones",        color: "#F59E0B", icon: "🌴", description: "Días de descanso o viaje" },
  almuerzo:      { label: "Almuerzo",          color: "#10B981", icon: "🍽️", description: "Hora de almuerzo diaria" },
  reunion:       { label: "Reunión",           color: "#6366F1", icon: "👥", description: "Reunión de equipo o administrativa" },
  preparacion:   { label: "Preparación",       color: "#8B5CF6", icon: "📋", description: "Tiempo de preparación entre procedimientos" },
  administrativa:{ label: "Admin / Papeleo",   color: "#64748B", icon: "📝", description: "Tiempo administrativo, informes, etc." },
  emergencia:    { label: "Emergencia",        color: "#EF4444", icon: "🚨", description: "Reservado para emergencias" },
  bloqueo:       { label: "Bloqueo general",   color: "#94A3B8", icon: "🚫", description: "Horario no disponible" },
};

export function useTimeBlocks(doctorId: string | null, viewDate?: Date) {
  const [blocks, setBlocks]     = useState<TimeBlock[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!doctorId) return;
    setLoading(true);
    setError(null);

    try {
      // Load blocks for current month ± 1 month window
      const anchor = viewDate ?? new Date();
      const from = startOfMonth(addMonths(anchor, -1)).toISOString();
      const to   = endOfMonth(addMonths(anchor, 1)).toISOString();

      const { data, error: err } = await supabase
        .from("time_blocks")
        .select("*")
        .eq("doctor_id", doctorId)
        .eq("is_active", true)
        .or(`fecha_fin.gte.${from},es_recurrente.eq.true`)
        .lte("fecha_inicio", to)
        .order("fecha_inicio");

      if (err) {
        // Migration not yet applied — table doesn't exist. Silently show empty state.
        if (err.code === "42P01" || err.message?.includes("does not exist")) {
          setBlocks([]);
          return;
        }
        throw err;
      }
      setBlocks(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error cargando bloqueos");
    } finally {
      setLoading(false);
    }
  }, [doctorId, viewDate]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (input: CreateTimeBlockInput): Promise<{ error: string | null }> => {
    // Resolve doctor ID on demand in case the hook was instantiated before auth resolved
    const resolvedDoctorId =
      doctorId ?? (await supabase.auth.getUser()).data.user?.id ?? null;
    if (!resolvedDoctorId) return { error: "No doctor ID" };

    const config = TIME_BLOCK_CONFIG[input.tipo];

    const { data, error: err } = await supabase
      .from("time_blocks")
      .insert({
        doctor_id:       resolvedDoctorId,
        office_id:       input.office_id ?? null,
        tipo:            input.tipo,
        titulo:          input.titulo || config.label,
        descripcion:     input.descripcion ?? null,
        color:           input.color ?? config.color,
        fecha_inicio:    input.fecha_inicio,
        fecha_fin:       input.fecha_fin,
        todo_el_dia:     input.todo_el_dia ?? false,
        es_recurrente:   input.es_recurrente ?? false,
        recurrence_rule: input.recurrence_rule ?? null,
      })
      .select()
      .single();

    if (err) return { error: err.message };
    if (data) setBlocks((prev) => [...prev, data]);
    return { error: null };
  }, [doctorId]);

  const update = useCallback(async (id: string, updates: Partial<CreateTimeBlockInput>): Promise<{ error: string | null }> => {
    const { data, error: err } = await supabase
      .from("time_blocks")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (err) return { error: err.message };
    if (data) setBlocks((prev) => prev.map((b) => (b.id === id ? data : b)));
    return { error: null };
  }, []);

  const remove = useCallback(async (id: string): Promise<{ error: string | null }> => {
    // Soft delete
    const { error: err } = await supabase
      .from("time_blocks")
      .update({ is_active: false })
      .eq("id", id);

    if (err) return { error: err.message };
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    return { error: null };
  }, []);

  /**
   * Check if a proposed time range conflicts with any existing block.
   */
  const hasConflict = useCallback((start: Date, end: Date): TimeBlock | null => {
    return blocks.find((b) => {
      // Skip recurrent blocks for now — server-side check is preferred
      const blockStart = parseISO(b.fecha_inicio);
      const blockEnd   = parseISO(b.fecha_fin);
      return blockStart < end && blockEnd > start;
    }) ?? null;
  }, [blocks]);

  return {
    blocks,
    loading,
    error,
    load,
    create,
    update,
    remove,
    hasConflict,
  };
}
