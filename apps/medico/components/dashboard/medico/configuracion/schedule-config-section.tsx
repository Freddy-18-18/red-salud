/**
 * @file schedule-config-section.tsx
 * @description Wrapper para configurar el horario base semanal desde el panel de configuración.
 * Combina el selector de consultorio con ScheduleTemplateTab (fuente de verdad: weekly_schedule_template).
 */

"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { ScheduleTemplateTab } from "@/app/consultorio/citas/components/schedule-template-tab";

interface Office {
  id: string;
  nombre: string;
  es_principal: boolean;
}

export function ScheduleConfigSection() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  useEffect(() => {
    async function loadOffices() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("doctor_offices")
        .select("id, nombre, es_principal")
        .eq("doctor_id", user.id)
        .eq("activo", true)
        .order("es_principal", { ascending: false });

      if (data && data.length > 0) {
        setOffices(data);
        const first = data[0];
        if (first) setSelectedOfficeId(first.id);
      }
    }
    loadOffices();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      {/* Office selector */}
      {offices.length > 1 && (
        <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-800">
          <MapPin className="h-4 w-4 text-gray-400 flex-none" />
          <label className="text-sm text-gray-600 dark:text-gray-400">Consultorio</label>
          <select
            value={selectedOfficeId ?? ""}
            onChange={(e) => setSelectedOfficeId(e.target.value || null)}
            className="ml-2 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary/40 outline-none"
          >
            {offices.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Weekly schedule template (single source of truth) */}
      <div className="h-[600px] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <ScheduleTemplateTab selectedOfficeId={selectedOfficeId} />
      </div>
    </div>
  );
}
