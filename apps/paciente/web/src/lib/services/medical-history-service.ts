import { supabase } from "@/lib/supabase/client";
import { fetchJson } from "@/lib/utils/fetch";

// ---------- Types ----------

export type TimelineEventType =
  | "appointment"
  | "lab_result"
  | "prescription"
  | "vaccination"
  | "emergency"
  | "diagnosis"
  | "procedure";

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  date: string;
  title: string;
  summary: string;
  doctor_name?: string;
  doctor_id?: string;
  status: string;
  status_label: string;
  status_color: string;
  metadata?: Record<string, unknown>;
}

export interface TimelineFilters {
  types?: TimelineEventType[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  doctorId?: string;
}

export interface TimelineStats {
  total: number;
  appointments: number;
  lab_results: number;
  prescriptions: number;
  vaccinations: number;
  emergencies: number;
  diagnoses: number;
  procedures: number;
}

// ---------- Status mappings ----------

const APPOINTMENT_STATUS: Record<string, { label: string; color: string }> = {
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-700" },
  confirmed: { label: "Confirmada", color: "bg-blue-50 text-blue-700" },
  pending: { label: "Pendiente", color: "bg-yellow-50 text-yellow-700" },
  cancelled: { label: "Cancelada", color: "bg-red-50 text-red-700" },
};

const LAB_STATUS: Record<string, { label: string; color: string }> = {
  ordenada: { label: "Ordenada", color: "bg-blue-50 text-blue-700" },
  muestra_tomada: { label: "Muestra tomada", color: "bg-purple-50 text-purple-700" },
  en_proceso: { label: "En proceso", color: "bg-yellow-50 text-yellow-700" },
  completada: { label: "Completada", color: "bg-emerald-50 text-emerald-700" },
  cancelada: { label: "Cancelada", color: "bg-red-50 text-red-700" },
};

const PRESCRIPTION_STATUS: Record<string, { label: string; color: string }> = {
  active: { label: "Activa", color: "bg-emerald-50 text-emerald-700" },
  expired: { label: "Expirada", color: "bg-gray-50 text-gray-600" },
  dispensed: { label: "Dispensada", color: "bg-blue-50 text-blue-700" },
};

const EMERGENCY_STATUS: Record<string, { label: string; color: string }> = {
  requesting: { label: "Solicitando", color: "bg-yellow-50 text-yellow-700" },
  dispatched: { label: "Despachada", color: "bg-blue-50 text-blue-700" },
  en_route: { label: "En camino", color: "bg-purple-50 text-purple-700" },
  on_scene: { label: "En escena", color: "bg-orange-50 text-orange-700" },
  transporting: { label: "Trasladando", color: "bg-indigo-50 text-indigo-700" },
  completed: { label: "Completada", color: "bg-emerald-50 text-emerald-700" },
  cancelled: { label: "Cancelada", color: "bg-red-50 text-red-700" },
};

// ---------- Helpers ----------

function mapAppointmentStatus(rawStatus: string): string {
  const map: Record<string, string> = {
    pendiente: "pending",
    confirmada: "confirmed",
    completada: "completed",
    cancelada: "cancelled",
    rechazada: "cancelled",
  };
  return map[rawStatus] || rawStatus;
}

function getStatusConfig(
  type: TimelineEventType,
  status: string,
): { label: string; color: string } {
  switch (type) {
    case "appointment":
      return APPOINTMENT_STATUS[status] || { label: status, color: "bg-gray-50 text-gray-600" };
    case "lab_result":
      return LAB_STATUS[status] || { label: status, color: "bg-gray-50 text-gray-600" };
    case "prescription":
      return PRESCRIPTION_STATUS[status] || { label: status, color: "bg-gray-50 text-gray-600" };
    case "emergency":
      return EMERGENCY_STATUS[status] || { label: status, color: "bg-gray-50 text-gray-600" };
    case "vaccination":
      return { label: "Aplicada", color: "bg-orange-50 text-orange-700" };
    case "diagnosis":
      return { label: "Registrado", color: "bg-teal-50 text-teal-700" };
    case "procedure":
      return { label: "Realizado", color: "bg-indigo-50 text-indigo-700" };
    default:
      return { label: status, color: "bg-gray-50 text-gray-600" };
  }
}

function matchesSearch(event: TimelineEvent, search: string): boolean {
  const q = search.toLowerCase();
  return (
    event.title.toLowerCase().includes(q) ||
    event.summary.toLowerCase().includes(q) ||
    (event.doctor_name?.toLowerCase().includes(q) ?? false)
  );
}

// ---------- Service ----------

export const medicalHistoryService = {
  /**
   * Fetch and merge events from multiple tables into a unified timeline.
   */
  async getMedicalTimeline(
    patientId: string,
    filters: TimelineFilters = {},
    page: number = 0,
    pageSize: number = 20,
  ): Promise<{ events: TimelineEvent[]; hasMore: boolean }> {
    const allEvents: TimelineEvent[] = [];
    const activeTypes = filters.types && filters.types.length > 0 ? filters.types : null;

    // --- Appointments (via API) ---
    if (!activeTypes || activeTypes.includes("appointment")) {
      try {
        const appointments = await fetchJson<Record<string, unknown>[]>(
          `/api/appointments?page_size=50`
        );

        if (appointments) {
          for (const apt of appointments) {
            const doctor = apt.doctor as Record<string, unknown> | null;
            const doctorProfile = (doctor as Record<string, unknown>)?.profile as Record<string, unknown> | null;
            const startTime = apt.start_time as string;
            const mappedStatus = mapAppointmentStatus(apt.status as string);
            const config = getStatusConfig("appointment", mappedStatus);
            const doctorName = doctorProfile
              ? [doctorProfile.first_name, doctorProfile.last_name].filter(Boolean).join(" ")
              : undefined;

            // Apply client-side date filtering
            if (filters.dateFrom && startTime < `${filters.dateFrom}T00:00:00`) continue;
            if (filters.dateTo && startTime > `${filters.dateTo}T23:59:59`) continue;
            if (filters.doctorId && apt.doctor_id !== filters.doctorId) continue;

            allEvents.push({
              id: `apt-${apt.id}`,
              type: "appointment",
              date: startTime,
              title: "Consulta medica",
              summary: (apt.motivo as string) || "Consulta con medico",
              doctor_name: doctorName,
              doctor_id: (doctor as Record<string, unknown>)?.id as string | undefined,
              status: mappedStatus,
              status_label: config.label,
              status_color: config.color,
              metadata: {
                notes: apt.notes,
              },
            });
          }
        }
      } catch {
        // API may not be available — skip
      }
    }

    // --- Lab Orders (via API) ---
    if (!activeTypes || activeTypes.includes("lab_result")) {
      try {
        const labParams = new URLSearchParams();
        if (filters.dateFrom) labParams.set("from", `${filters.dateFrom}T00:00:00`);
        if (filters.dateTo) labParams.set("to", `${filters.dateTo}T23:59:59`);
        const qs = labParams.toString();
        const labOrders = await fetchJson<Record<string, unknown>[]>(
          `/api/lab/orders${qs ? `?${qs}` : ""}`,
        );

        if (labOrders) {
          for (const order of labOrders) {
            const row = order as Record<string, unknown>;
            const doctor = row.doctor as Record<string, unknown> | null;
            const tests = row.tests as Array<Record<string, unknown>> | null;
            const testNames = tests
              ?.map((t) => (t.test_type as Record<string, unknown>)?.name)
              .filter(Boolean)
              .join(", ");
            const status = row.status as string;
            const config = getStatusConfig("lab_result", status);

            // Apply client-side doctor filter (API doesn't support doctor_id param)
            if (filters.doctorId && doctor?.id !== filters.doctorId) continue;

            allEvents.push({
              id: `lab-${row.id}`,
              type: "lab_result",
              date: row.ordered_at as string,
              title: (row.order_number as string) || "Orden de laboratorio",
              summary: testNames || "Estudios de laboratorio",
              doctor_name: doctor?.full_name as string | undefined,
              doctor_id: doctor?.id as string | undefined,
              status,
              status_label: config.label,
              status_color: config.color,
              metadata: { order_number: row.order_number },
            });
          }
        }
      } catch {
        // API may not be available — skip
      }
    }

    // --- Prescriptions (via API) ---
    if (!activeTypes || activeTypes.includes("prescription")) {
      try {
        const prescriptions = await fetchJson<Record<string, unknown>[]>(
          `/api/prescriptions`,
        );

        if (prescriptions) {
          const now = new Date();
          for (const rx of prescriptions) {
            const row = rx as Record<string, unknown>;
            const doctor = row.doctor as Record<string, unknown> | null;
            const meds = row.medications as Array<Record<string, unknown>> | null;
            const medNames = meds?.map((m) => m.medication_name).filter(Boolean).join(", ");
            let status = (row.status as string) || "active";
            if (row.expires_at && new Date(row.expires_at as string) < now && status === "active") {
              status = "expired";
            }
            const config = getStatusConfig("prescription", status);

            // Apply client-side filters (API returns all prescriptions)
            const prescribedAt = row.prescribed_at as string;
            if (filters.dateFrom && prescribedAt < `${filters.dateFrom}T00:00:00`) continue;
            if (filters.dateTo && prescribedAt > `${filters.dateTo}T23:59:59`) continue;
            if (filters.doctorId && doctor?.id !== filters.doctorId) continue;

            allEvents.push({
              id: `rx-${row.id}`,
              type: "prescription",
              date: prescribedAt,
              title: "Receta medica",
              summary: (row.diagnosis as string) || medNames || "Receta",
              doctor_name: doctor?.full_name as string | undefined,
              doctor_id: doctor?.id as string | undefined,
              status,
              status_label: config.label,
              status_color: config.color,
              metadata: {
                diagnosis: row.diagnosis,
                expires_at: row.expires_at,
                medications: medNames,
              },
            });
          }
        }
      } catch {
        // API may not be available — skip
      }
    }

    // --- Vaccination Records ---
    if (!activeTypes || activeTypes.includes("vaccination")) {
      try {
        let query = supabase
          .from("vaccination_records")
          .select("id, vaccine_name, administered_at, dose_number, provider_name, notes")
          .eq("patient_id", patientId)
          .order("administered_at", { ascending: false });

        if (filters.dateFrom) {
          query = query.gte("administered_at", `${filters.dateFrom}T00:00:00`);
        }
        if (filters.dateTo) {
          query = query.lte("administered_at", `${filters.dateTo}T23:59:59`);
        }

        const { data, error } = await query;
        if (!error && data) {
          for (const vax of data) {
            const row = vax as Record<string, unknown>;
            const config = getStatusConfig("vaccination", "applied");
            const doseLabel = row.dose_number ? ` (Dosis ${row.dose_number})` : "";

            allEvents.push({
              id: `vax-${row.id}`,
              type: "vaccination",
              date: row.administered_at as string,
              title: `${row.vaccine_name}${doseLabel}`,
              summary: (row.notes as string) || `Vacuna aplicada${row.provider_name ? ` en ${row.provider_name}` : ""}`,
              doctor_name: row.provider_name as string | undefined,
              status: "applied",
              status_label: config.label,
              status_color: config.color,
              metadata: {
                dose_number: row.dose_number,
                provider_name: row.provider_name,
              },
            });
          }
        }
      } catch {
        // Table may not exist yet — skip
      }
    }

    // --- Emergency Requests ---
    if (!activeTypes || activeTypes.includes("emergency")) {
      try {
        let query = supabase
          .from("emergency_requests")
          .select("id, priority, symptoms, status, created_at, location_address")
          .eq("patient_id", patientId)
          .order("created_at", { ascending: false });

        if (filters.dateFrom) {
          query = query.gte("created_at", `${filters.dateFrom}T00:00:00`);
        }
        if (filters.dateTo) {
          query = query.lte("created_at", `${filters.dateTo}T23:59:59`);
        }

        const { data, error } = await query;
        if (!error && data) {
          for (const em of data) {
            const row = em as Record<string, unknown>;
            const status = row.status as string;
            const config = getStatusConfig("emergency", status);
            const priorityLabels: Record<string, string> = {
              red: "Alta prioridad",
              yellow: "Prioridad media",
              green: "Baja prioridad",
            };

            allEvents.push({
              id: `em-${row.id}`,
              type: "emergency",
              date: row.created_at as string,
              title: `Emergencia - ${priorityLabels[row.priority as string] || "Emergencia"}`,
              summary: (row.symptoms as string) || "Solicitud de emergencia",
              status,
              status_label: config.label,
              status_color: config.color,
              metadata: {
                priority: row.priority,
                location_address: row.location_address,
              },
            });
          }
        }
      } catch {
        // Table may not exist yet — skip
      }
    }

    // --- Apply text search filter ---
    let filtered = allEvents;
    if (filters.search && filters.search.trim() !== "") {
      filtered = filtered.filter((e) => matchesSearch(e, filters.search!));
    }

    // --- Sort all events by date descending ---
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // --- Paginate ---
    const start = page * pageSize;
    const paged = filtered.slice(start, start + pageSize);

    return {
      events: paged,
      hasMore: start + pageSize < filtered.length,
    };
  },

  /**
   * Get count statistics for each event type.
   */
  async getTimelineStats(patientId: string): Promise<TimelineStats> {
    const stats: TimelineStats = {
      total: 0,
      appointments: 0,
      lab_results: 0,
      prescriptions: 0,
      vaccinations: 0,
      emergencies: 0,
      diagnoses: 0,
      procedures: 0,
    };

    // Count appointments (via API)
    try {
      const res = await fetch(`/api/appointments?page_size=1`);
      if (res.ok) {
        const json = await res.json();
        stats.appointments = json.pagination?.total ?? 0;
      }
    } catch {
      // skip
    }

    // Count lab orders (via API)
    try {
      const labRes = await fetch(`/api/lab/orders?count_only=true`);
      if (labRes.ok) {
        const { count } = await labRes.json();
        stats.lab_results = count ?? 0;
      }
    } catch {
      // skip
    }

    // Count prescriptions (via API)
    try {
      const rxData = await fetchJson<Record<string, unknown>[]>(`/api/prescriptions`);
      stats.prescriptions = rxData?.length ?? 0;
    } catch {
      // skip
    }

    // Count vaccinations
    try {
      const { count, error } = await supabase
        .from("vaccination_records")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", patientId);
      if (!error && count !== null) stats.vaccinations = count;
    } catch {
      // skip
    }

    // Count emergencies
    try {
      const { count, error } = await supabase
        .from("emergency_requests")
        .select("*", { count: "exact", head: true })
        .eq("patient_id", patientId);
      if (!error && count !== null) stats.emergencies = count;
    } catch {
      // skip
    }

    stats.total =
      stats.appointments +
      stats.lab_results +
      stats.prescriptions +
      stats.vaccinations +
      stats.emergencies +
      stats.diagnoses +
      stats.procedures;

    return stats;
  },
};
