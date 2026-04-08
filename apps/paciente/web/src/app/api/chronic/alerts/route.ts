import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/utils/rate-limit";

// -------------------------------------------------------------------
// Chronic Alerts — BFF API Route
// -------------------------------------------------------------------
// GET: Get auto-generated alerts/reminders for patient's conditions.
// Alerts are computed on the fly based on:
//   - Missed readings (no glucose log in 2 days, etc.)
//   - Abnormal values (glucose > 200, BP > 140/90, etc.)
//   - Upcoming checkups (next appointment within 14 days)
//   - General medication reminders
// Auth required.
// -------------------------------------------------------------------

interface Alert {
  id: string;
  type: "missed_reading" | "abnormal_value" | "upcoming_checkup" | "medication_reminder";
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  condition_id: string | null;
  condition_type: string | null;
  action_type: "log_reading" | "schedule_appointment" | "view_condition" | "none";
  created_at: string;
}

// Normal ranges for common readings
const ABNORMAL_THRESHOLDS: Record<
  string,
  { high?: number; low?: number; high2?: number; low2?: number }
> = {
  glucose: { high: 200, low: 54 },
  blood_pressure: { high: 140, low: 90, high2: 90, low2: 60 },
  peak_flow: { low: 200 },
  heart_rate: { high: 120, low: 50 },
};

// How many days without a reading before generating an alert
const MISSED_READING_DAYS: Record<string, number> = {
  diabetes_tipo_1: 1,
  diabetes_tipo_2: 2,
  hipertension: 3,
  asma: 7,
  hipotiroidismo: 14,
  hipertiroidismo: 14,
  epoc: 7,
};

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, "authenticated");
    if (limited) return limited;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "No autenticado." },
        { status: 401 },
      );
    }

    const alerts: Alert[] = [];
    const now = new Date();

    // 1. Fetch active conditions
    const { data: conditions } = await supabase
      .from("patient_chronic_conditions")
      .select("id, condition_type, condition_label")
      .eq("patient_id", user.id)
      .eq("is_active", true);

    if (!conditions || conditions.length === 0) {
      return NextResponse.json({ data: [] });
    }

    const conditionIds = conditions.map((c) => c.id);

    // 2. Fetch latest reading per condition
    const { data: allReadings } = await supabase
      .from("chronic_readings")
      .select("condition_id, reading_type, value, value2, measured_at")
      .eq("patient_id", user.id)
      .in("condition_id", conditionIds)
      .order("measured_at", { ascending: false });

    // Group by condition — pick the latest per condition
    const latestByCondition = new Map<
      string,
      { reading_type: string; value: number; value2: number | null; measured_at: string }
    >();
    if (allReadings) {
      for (const r of allReadings) {
        if (!latestByCondition.has(r.condition_id)) {
          latestByCondition.set(r.condition_id, r);
        }
      }
    }

    // 3. Check missed readings
    for (const condition of conditions) {
      const maxDays =
        MISSED_READING_DAYS[condition.condition_type] ?? 7;
      const latest = latestByCondition.get(condition.id);

      if (!latest) {
        // Never logged — critical if recent condition
        alerts.push({
          id: `missed-${condition.id}`,
          type: "missed_reading",
          severity: "warning",
          title: `Sin lecturas de ${condition.condition_label}`,
          description: `Todavia no registraste ninguna lectura para tu ${condition.condition_label}. Empieza hoy para hacer seguimiento.`,
          condition_id: condition.id,
          condition_type: condition.condition_type,
          action_type: "log_reading",
          created_at: now.toISOString(),
        });
        continue;
      }

      const lastDate = new Date(latest.measured_at);
      const daysSince = Math.floor(
        (now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysSince >= maxDays) {
        const severity = daysSince >= maxDays * 2 ? "critical" : "warning";
        alerts.push({
          id: `missed-${condition.id}`,
          type: "missed_reading",
          severity,
          title: `${daysSince} dias sin registrar ${condition.condition_label}`,
          description: `Tu ultima lectura fue hace ${daysSince} dias. Registra tus valores para mantener un buen seguimiento.`,
          condition_id: condition.id,
          condition_type: condition.condition_type,
          action_type: "log_reading",
          created_at: now.toISOString(),
        });
      }
    }

    // 4. Check abnormal values in latest readings
    for (const condition of conditions) {
      const latest = latestByCondition.get(condition.id);
      if (!latest) continue;

      const thresholds = ABNORMAL_THRESHOLDS[latest.reading_type];
      if (!thresholds) continue;

      let isAbnormal = false;
      let detail = "";

      if (thresholds.high && latest.value > thresholds.high) {
        isAbnormal = true;
        detail = `Valor: ${latest.value} (limite: ${thresholds.high})`;
      } else if (thresholds.low && latest.value < thresholds.low) {
        isAbnormal = true;
        detail = `Valor: ${latest.value} (minimo: ${thresholds.low})`;
      }

      // Check value2 (e.g., diastolic pressure)
      if (
        latest.value2 != null &&
        thresholds.high2 &&
        latest.value2 > thresholds.high2
      ) {
        isAbnormal = true;
        detail = `Valor: ${latest.value}/${latest.value2} (limite: ${thresholds.high}/${thresholds.high2})`;
      }

      if (isAbnormal) {
        alerts.push({
          id: `abnormal-${condition.id}`,
          type: "abnormal_value",
          severity: "critical",
          title: `Lectura fuera de rango — ${condition.condition_label}`,
          description: `${detail}. Consulta con tu medico si los valores persisten fuera de rango.`,
          condition_id: condition.id,
          condition_type: condition.condition_type,
          action_type: "schedule_appointment",
          created_at: now.toISOString(),
        });
      }
    }

    // 5. Check upcoming appointments (within 14 days)
    const twoWeeksFromNow = new Date(now);
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);

    const { data: upcomingAppointments } = await supabase
      .from("appointments")
      .select(
        `
        id,
        start_time,
        doctor:doctor_details!appointments_doctor_id_fkey (
          profile:profiles!doctor_details_user_id_fkey (
            full_name
          )
        )
      `,
      )
      .eq("patient_id", user.id)
      .in("status", ["pendiente", "confirmada"])
      .gte("start_time", now.toISOString())
      .lte("start_time", twoWeeksFromNow.toISOString())
      .order("start_time", { ascending: true })
      .limit(3);

    if (upcomingAppointments) {
      for (const appt of upcomingAppointments) {
        const apptDate = new Date(appt.start_time);
        const daysUntil = Math.ceil(
          (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        const doctor = appt.doctor as Record<string, unknown> | null;
        const profile = doctor?.profile as Record<string, unknown> | null;
        const doctorName = (profile?.full_name as string) ?? "tu medico";

        alerts.push({
          id: `checkup-${appt.id}`,
          type: "upcoming_checkup",
          severity: "info",
          title: `Control con ${doctorName} en ${daysUntil} dia${daysUntil !== 1 ? "s" : ""}`,
          description: `Tu proxima cita es el ${apptDate.toLocaleDateString("es-VE", { weekday: "long", day: "numeric", month: "long" })}. Recorda llevar tus registros de lecturas.`,
          condition_id: null,
          condition_type: null,
          action_type: "none",
          created_at: now.toISOString(),
        });
      }
    }

    // Sort: critical first, then warning, then info
    const severityOrder: Record<string, number> = {
      critical: 0,
      warning: 1,
      info: 2,
    };
    alerts.sort(
      (a, b) => (severityOrder[a.severity] ?? 3) - (severityOrder[b.severity] ?? 3),
    );

    return NextResponse.json({ data: alerts });
  } catch (error) {
    console.error("[Chronic Alerts GET] Unexpected error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor." },
      { status: 500 },
    );
  }
}
