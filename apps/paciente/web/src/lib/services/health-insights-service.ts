import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface HealthInsight {
  id: string;
  type: "warning" | "positive" | "reminder" | "tip";
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  priority: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function monthsSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return (
    (now.getFullYear() - then.getFullYear()) * 12 +
    (now.getMonth() - then.getMonth())
  );
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function calculateAge(dateOfBirth: string): number {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// ─── Insight Generators ──────────────────────────────────────────────────────

async function checkAppointmentGaps(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_date")
      .eq("patient_id", patientId)
      .eq("status", "completed")
      .order("appointment_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        id: "no-appointments",
        type: "warning",
        icon: "CalendarX2",
        title: "Sin consultas registradas",
        description:
          "No tienes consultas medicas registradas. Es importante hacer chequeos preventivos al menos una vez al ano.",
        actionLabel: "Buscar medico",
        actionHref: "/dashboard/buscar-medico",
        priority: 8,
      };
    }

    const months = monthsSince(data.appointment_date);

    if (months >= 12) {
      return {
        id: "appointment-gap-yearly",
        type: "warning",
        icon: "CalendarX2",
        title: "Mas de un ano sin consulta",
        description: `Hace ${months} meses que no visitas a un doctor. Te recomendamos agendar un chequeo preventivo.`,
        actionLabel: "Agendar cita",
        actionHref: "/dashboard/buscar-medico",
        priority: 9,
      };
    }

    if (months >= 6) {
      return {
        id: "appointment-gap-6m",
        type: "reminder",
        icon: "CalendarClock",
        title: "Chequeo pendiente",
        description: `Hace ${months} meses que no visitas a un doctor. Considera agendar una consulta preventiva.`,
        actionLabel: "Buscar medico",
        actionHref: "/dashboard/buscar-medico",
        priority: 6,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function checkMedicationReminders(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const today = new Date().toISOString().split("T")[0];

    const { count, error } = await supabase
      .from("medication_reminders")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .lte("starts_at", today)
      .or(`ends_at.is.null,ends_at.gte.${today}`);

    if (error) return null;

    const activeCount = count ?? 0;

    if (activeCount > 0) {
      return {
        id: "active-medications",
        type: "reminder",
        icon: "Pill",
        title: `${activeCount} ${activeCount === 1 ? "medicamento activo" : "medicamentos activos"}`,
        description:
          activeCount === 1
            ? "Tienes 1 recordatorio activo de medicamento. Revisa tu plan de medicacion."
            : `Tienes ${activeCount} recordatorios activos de medicamentos. Manten tu adherencia al dia.`,
        actionLabel: "Ver medicamentos",
        actionHref: "/dashboard/recordatorios",
        priority: 5,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function checkProfileCompleteness(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, phone, date_of_birth, national_id")
      .eq("id", patientId)
      .maybeSingle();

    if (profileError) return null;

    const { data: details, error: detailsError } = await supabase
      .from("patient_details")
      .select(
        "grupo_sanguineo, alergias, enfermedades_cronicas, contacto_emergencia_nombre",
      )
      .eq("profile_id", patientId)
      .maybeSingle();

    // Build completeness score
    const fields = [
      profile?.full_name,
      profile?.phone,
      profile?.date_of_birth,
      profile?.national_id,
      !detailsError ? details?.grupo_sanguineo : undefined,
      !detailsError && details?.alergias?.length ? true : undefined,
      !detailsError && details?.enfermedades_cronicas?.length
        ? true
        : undefined,
      !detailsError ? details?.contacto_emergencia_nombre : undefined,
    ];

    const filled = fields.filter(Boolean).length;
    const total = fields.length;
    const percentage = Math.round((filled / total) * 100);

    if (percentage === 100) {
      return {
        id: "profile-complete",
        type: "positive",
        icon: "UserCheck",
        title: "Perfil medico completo",
        description:
          "Tu informacion medica esta completa. Esto ayuda a los profesionales de salud a atenderte mejor.",
        priority: 2,
      };
    }

    if (percentage < 50) {
      return {
        id: "profile-incomplete",
        type: "warning",
        icon: "UserX",
        title: "Completa tu perfil medico",
        description: `Tu perfil esta al ${percentage}%. Agrega tu grupo sanguineo, alergias y contactos de emergencia para una mejor atencion.`,
        actionLabel: "Completar perfil",
        actionHref: "/dashboard/perfil",
        priority: 7,
      };
    }

    return {
      id: "profile-partial",
      type: "tip",
      icon: "UserCog",
      title: "Mejora tu perfil medico",
      description: `Tu perfil esta al ${percentage}%. Completa los campos faltantes para emergencias medicas.`,
      actionLabel: "Editar perfil",
      actionHref: "/dashboard/perfil",
      priority: 4,
    };
  } catch {
    return null;
  }
}

async function checkLabResults(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const { data, error } = await supabase
      .from("lab_orders")
      .select("ordered_at")
      .eq("patient_id", patientId)
      .order("ordered_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return {
        id: "no-lab-results",
        type: "tip",
        icon: "TestTubeDiagonal",
        title: "Sin estudios de laboratorio",
        description:
          "Los examenes periodicos ayudan a detectar problemas de salud a tiempo. Consulta con tu medico.",
        priority: 3,
      };
    }

    const months = monthsSince(data.ordered_at);

    if (months >= 12) {
      return {
        id: "lab-results-overdue",
        type: "reminder",
        icon: "TestTubeDiagonal",
        title: "Laboratorios pendientes",
        description: `Hace ${months} meses sin estudios de laboratorio. Considera realizar un chequeo de rutina.`,
        actionLabel: "Ver laboratorios",
        actionHref: "/dashboard/laboratorios",
        priority: 5,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function checkEmergencyContacts(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const { count, error } = await supabase
      .from("emergency_contacts")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId);

    if (error) {
      // Table might not exist — check patient_details as fallback
      const { data: details } = await supabase
        .from("patient_details")
        .select("contacto_emergencia_nombre, contacto_emergencia_telefono")
        .eq("profile_id", patientId)
        .maybeSingle();

      if (
        details?.contacto_emergencia_nombre &&
        details?.contacto_emergencia_telefono
      ) {
        return null;
      }

      return {
        id: "no-emergency-contacts",
        type: "warning",
        icon: "ShieldAlert",
        title: "Agrega contactos de emergencia",
        description:
          "No tienes contactos de emergencia registrados. Esta informacion es vital en situaciones criticas.",
        actionLabel: "Agregar contacto",
        actionHref: "/dashboard/perfil",
        priority: 8,
      };
    }

    const contactCount = count ?? 0;

    if (contactCount === 0) {
      return {
        id: "no-emergency-contacts",
        type: "warning",
        icon: "ShieldAlert",
        title: "Agrega contactos de emergencia",
        description:
          "No tienes contactos de emergencia registrados. Esta informacion es vital en situaciones criticas.",
        actionLabel: "Agregar contacto",
        actionHref: "/dashboard/perfil",
        priority: 8,
      };
    }

    if (contactCount >= 2) {
      return {
        id: "emergency-contacts-ok",
        type: "positive",
        icon: "ShieldCheck",
        title: "Contactos de emergencia al dia",
        description: `Tienes ${contactCount} contactos de emergencia registrados. Excelente prevencion.`,
        priority: 1,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function checkAnnualCheckup(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("date_of_birth")
      .eq("id", patientId)
      .maybeSingle();

    if (!profile?.date_of_birth) return null;

    const age = calculateAge(profile.date_of_birth);

    if (age >= 40) {
      return {
        id: "annual-checkup-40plus",
        type: "tip",
        icon: "HeartPulse",
        title: "Chequeo cardiovascular",
        description:
          "A partir de los 40, se recomienda un chequeo cardiovascular anual. Consulta con tu medico.",
        actionLabel: "Buscar cardiologo",
        actionHref: "/dashboard/buscar-medico",
        priority: 5,
      };
    }

    if (age >= 18) {
      const currentMonth = new Date().getMonth();
      // Suggest annual checkup at beginning of each year
      if (currentMonth <= 2) {
        return {
          id: "annual-checkup-reminder",
          type: "tip",
          icon: "Stethoscope",
          title: "Es tiempo de tu chequeo anual",
          description:
            "Inicio de ano es un buen momento para agendar tu chequeo preventivo anual.",
          actionLabel: "Agendar cita",
          actionHref: "/dashboard/buscar-medico",
          priority: 4,
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function checkPositiveReinforcement(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    // Check how many completed appointments the patient has
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId)
      .eq("status", "completed");

    if (error) return null;

    const completedCount = count ?? 0;

    if (completedCount >= 10) {
      return {
        id: "milestone-10-appointments",
        type: "positive",
        icon: "Award",
        title: "Paciente comprometido",
        description: `Llevas ${completedCount} consultas completadas. Tu compromiso con tu salud es admirable.`,
        priority: 2,
      };
    }

    if (completedCount >= 5) {
      return {
        id: "milestone-5-appointments",
        type: "positive",
        icon: "TrendingUp",
        title: "Buen historial de salud",
        description: `Ya tienes ${completedCount} consultas completadas. Sigue cuidando tu salud.`,
        priority: 2,
      };
    }

    return null;
  } catch {
    return null;
  }
}

async function checkUpcomingAppointments(
  patientId: string,
): Promise<HealthInsight | null> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const threeDaysStr = threeDaysFromNow.toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("appointments")
      .select("appointment_date, appointment_time")
      .eq("patient_id", patientId)
      .in("status", ["confirmed", "pending"])
      .gte("appointment_date", today)
      .lte("appointment_date", threeDaysStr)
      .order("appointment_date", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const days = daysSince(data.appointment_date) * -1; // Future date → negative daysSince

    if (days === 0) {
      return {
        id: "appointment-today",
        type: "reminder",
        icon: "BellRing",
        title: "Tienes una cita hoy",
        description: `Tu cita es hoy a las ${data.appointment_time?.slice(0, 5)}. No olvides llegar con tiempo.`,
        actionLabel: "Ver cita",
        actionHref: "/dashboard/citas",
        priority: 10,
      };
    }

    if (days === 1) {
      return {
        id: "appointment-tomorrow",
        type: "reminder",
        icon: "BellRing",
        title: "Cita manana",
        description: `Tienes una cita manana a las ${data.appointment_time?.slice(0, 5)}. Prepara tus documentos.`,
        actionLabel: "Ver cita",
        actionHref: "/dashboard/citas",
        priority: 9,
      };
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Main Function ───────────────────────────────────────────────────────────

export async function getHealthInsights(
  patientId: string,
): Promise<HealthInsight[]> {
  const generators = [
    checkUpcomingAppointments(patientId),
    checkAppointmentGaps(patientId),
    checkMedicationReminders(patientId),
    checkProfileCompleteness(patientId),
    checkLabResults(patientId),
    checkEmergencyContacts(patientId),
    checkAnnualCheckup(patientId),
    checkPositiveReinforcement(patientId),
  ];

  const results = await Promise.allSettled(generators);

  const insights: HealthInsight[] = [];

  for (const result of results) {
    if (result.status === "fulfilled" && result.value !== null) {
      insights.push(result.value);
    }
    // Rejected promises are silently skipped — no crashes
  }

  // Sort by priority descending (higher priority first)
  insights.sort((a, b) => b.priority - a.priority);

  return insights;
}
