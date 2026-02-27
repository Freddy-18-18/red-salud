/**
 * @file notification-service.ts
 * @description Enterprise multi-channel notification service with cascade delivery:
 *   Push (patient app SDK) → WhatsApp Business API → SMS (Twilio) → Email (Resend)
 *
 * Channels are tried in order. Once one succeeds, the rest are skipped.
 * All delivery attempts are logged in `appointment_reminders`.
 */

import { supabase } from "@/lib/supabase/client";
import type { CalendarAppointment } from "@/components/dashboard/medico/calendar/types";

// ── Types ────────────────────────────────────────────────────────────────────

export type NotificationChannel = "push" | "whatsapp" | "sms" | "email";
export type NotificationTrigger = "24h" | "2h" | "1h" | "30min" | "day_of" | "custom" | "post_appointment";
export type ReminderStatus = "scheduled" | "processing" | "sent" | "confirmed_by_patient" | "cancelled_by_patient" | "failed" | "skipped";

export interface NotificationPayload {
  appointmentId: string;
  doctorId: string;
  patientId?: string | null;
  patientName: string;
  patientPhone?: string | null;
  patientEmail?: string | null;
  appointmentDate: string;   // ISO
  appointmentTime: string;   // HH:mm
  doctorName: string;
  specialtyName?: string;
  motivo?: string;
  oficeName?: string;
  tipoCita: string;
  duracionMinutos: number;
  rescheduleToken?: string;
  /** High-privacy specialty (e.g. Psicología): omit procedure details in message */
  isHighPrivacy?: boolean;
}

export interface NotificationResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface SendReminderOptions {
  channels?: NotificationChannel[];
  templateOverride?: string;
  cascadeFailFast?: boolean; // stop after first failure (default: false → try all)
}

// ── Message Templates ────────────────────────────────────────────────────────

const TEMPLATES = {
  /**
   * 24h reminder — WhatsApp & SMS
   */
  reminder_24h: (p: NotificationPayload) => {
    const dateStr = new Intl.DateTimeFormat("es-VE", {
      weekday: "long", day: "numeric", month: "long",
    }).format(new Date(p.appointmentDate));

    if (p.isHighPrivacy) {
      return `Hola ${p.patientName}, le recordamos su cita mañana *${dateStr} a las ${p.appointmentTime}* con el ${p.doctorName}.\n\n¿Podrá asistir?\n✅ Confirmar: {{confirm_link}}\n❌ Cancelar: {{cancel_link}}`;
    }

    return `Hola ${p.patientName} 👋\n\nLe recordamos su cita *${p.tipoCita}* mañana:\n\n📅 *${dateStr}*\n🕐 *${p.appointmentTime}*\n👨‍⚕️ *${p.doctorName}*${p.specialtyName ? `\n🏥 ${p.specialtyName}` : ""}${p.oficeName ? `\n📍 ${p.oficeName}` : ""}${p.motivo && !p.isHighPrivacy ? `\n📋 ${p.motivo}` : ""}\n\n¿Confirmamos su asistencia?\n✅ SÍ, confirmo: {{confirm_link}}\n❌ No podré asistir: {{cancel_link}}\n🔄 Reprogramar: {{reschedule_link}}`;
  },

  /**
   * 2h reminder
   */
  reminder_2h: (p: NotificationPayload) => {
    if (p.isHighPrivacy) {
      return `Hola ${p.patientName}, su cita es hoy a las *${p.appointmentTime}* con ${p.doctorName}. ¡Le esperamos!`;
    }
    return `⏰ Recordatorio: su cita ${p.tipoCita} con *${p.doctorName}* es en *2 horas* (${p.appointmentTime}).\n\n${p.oficeName ? `📍 ${p.oficeName}` : ""}\n\n¿Necesita reprogramar? → {{reschedule_link}}`;
  },

  /**
   * Confirmation after booking
   */
  appointment_confirmed: (p: NotificationPayload) => {
    const dateStr = new Intl.DateTimeFormat("es-VE", {
      weekday: "long", day: "numeric", month: "long",
    }).format(new Date(p.appointmentDate));

    return `✅ Cita confirmada con *${p.doctorName}*\n\n📅 ${dateStr}\n🕐 ${p.appointmentTime}${p.oficeName ? `\n📍 ${p.oficeName}` : ""}${p.motivo && !p.isHighPrivacy ? `\n📋 ${p.motivo}` : ""}\n\nSi necesita cancelar o reprogramar: {{reschedule_link}}\n\nGuarde este mensaje como comprobante. 🗓️`;
  },

  /**
   * Cancellation with alternatives
   */
  appointment_cancelled_with_alternatives: (p: NotificationPayload, alternatives: Array<{ fecha_hora: string }>) => {
    const altLines = alternatives
      .slice(0, 3)
      .map((a, i) => {
        const d = new Date(a.fecha_hora);
        return `${i + 1}. ${new Intl.DateTimeFormat("es-VE", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(d)}`;
      })
      .join("\n");

    return `Hola ${p.patientName}, su cita con *${p.doctorName}* ha sido cancelada.\n\nHay estos espacios disponibles para reprogramar:\n\n${altLines}\n\nReservar: {{reschedule_link}}`;
  },

  /**
   * Post-appointment follow-up
   */
  post_appointment: (p: NotificationPayload) => {
    return `Hola ${p.patientName}, esperamos que su consulta con ${p.doctorName} haya sido satisfactoria. 🙏\n\nSi tiene alguna duda o necesita reagendar, estamos aquí. {{portal_link}}`;
  },
} as const;

// ── Notification Service ─────────────────────────────────────────────────────

export class AppointmentNotificationService {
  private static instance: AppointmentNotificationService;

  static getInstance(): AppointmentNotificationService {
    if (!AppointmentNotificationService.instance) {
      AppointmentNotificationService.instance = new AppointmentNotificationService();
    }
    return AppointmentNotificationService.instance;
  }

  /**
   * Send an appointment reminder through cascade channels.
   * Push → WhatsApp → SMS → Email
   * Stops after first successful delivery per patient (unless cascadeFailFast=false used for logging only).
   */
  async sendReminder(
    reminderId: string,
    payload: NotificationPayload,
    trigger: NotificationTrigger,
    options: SendReminderOptions = {}
  ): Promise<NotificationResult[]> {
    const channels = options.channels ?? (["push", "whatsapp", "sms", "email"] as NotificationChannel[]);
    const results: NotificationResult[] = [];

    // Mark as processing
    await supabase
      .from("appointment_reminders")
      .update({ overall_status: "processing" })
      .eq("id", reminderId);

    for (const channel of channels) {
      const result = await this.sendViaChannel(channel, payload, trigger, reminderId);
      results.push(result);

      // Update channel-specific status in DB
      await this.updateChannelStatus(reminderId, channel, result);

      if (result.success) {
        // Cascade: stop after first success
        await supabase
          .from("appointment_reminders")
          .update({
            overall_status: "sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", reminderId);
        break;
      }
    }

    // If all channels failed
    const anySuccess = results.some((r) => r.success);
    if (!anySuccess) {
      await supabase
        .from("appointment_reminders")
        .update({ overall_status: "failed" })
        .eq("id", reminderId);
    }

    return results;
  }

  /**
   * Schedule all reminders for an appointment (called on create/confirm).
   * Reminders are created in DB by Postgres trigger, but this can be called
   * manually to regenerate after rescheduling.
   */
  async scheduleForAppointment(appointmentId: string): Promise<void> {
    await supabase.rpc("schedule_appointment_reminders", {
      p_appointment_id: appointmentId,
    });
  }

  /**
   * Cancel pending reminders for an appointment (on cancellation).
   */
  async cancelForAppointment(appointmentId: string): Promise<void> {
    await supabase
      .from("appointment_reminders")
      .update({ overall_status: "skipped" })
      .eq("appointment_id", appointmentId)
      .eq("overall_status", "scheduled");
  }

  /**
   * Record a patient response (confirmation / cancellation via link).
   */
  async recordPatientResponse(
    rescheduleToken: string,
    response: "confirmed" | "cancelled" | "rescheduled"
  ): Promise<{ appointmentId: string | null; error: string | null }> {
    const { data, error } = await supabase
      .from("appointment_reminders")
      .select("id, appointment_id, reschedule_token_expires")
      .eq("reschedule_token", rescheduleToken)
      .maybeSingle();

    if (error || !data) {
      return { appointmentId: null, error: "Token inválido o expirado" };
    }

    if (data.reschedule_token_expires && new Date(data.reschedule_token_expires) < new Date()) {
      return { appointmentId: null, error: "El enlace ha expirado" };
    }

    await supabase
      .from("appointment_reminders")
      .update({
        patient_response: response,
        patient_responded_at: new Date().toISOString(),
        overall_status: response === "confirmed" ? "confirmed_by_patient" : "cancelled_by_patient",
      })
      .eq("id", data.id);

    // If confirmed, update appointment status
    if (response === "confirmed") {
      await supabase
        .from("appointments")
        .update({ status: "confirmada" })
        .eq("id", data.appointment_id)
        .in("status", ["pendiente", "sin_confirmar"]);
    }

    return { appointmentId: data.appointment_id, error: null };
  }

  // ── Private channel dispatchers ───────────────────────────────────────────

  private async sendViaChannel(
    channel: NotificationChannel,
    payload: NotificationPayload,
    trigger: NotificationTrigger,
    reminderId: string
  ): Promise<NotificationResult> {
    try {
      switch (channel) {
        case "push":
          return await this.sendPushNotification(payload, trigger, reminderId);
        case "whatsapp":
          return await this.sendWhatsApp(payload, trigger);
        case "sms":
          return await this.sendSMS(payload, trigger);
        case "email":
          return await this.sendEmail(payload, trigger);
        default:
          return { channel, success: false, error: "Unknown channel" };
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { channel, success: false, error: message };
    }
  }

  /**
   * Push Notification via Supabase Realtime to patient app.
   * Patient app subscribes to `patient-notifications:{patientId}` channel.
   */
  private async sendPushNotification(
    payload: NotificationPayload,
    trigger: NotificationTrigger,
    reminderId: string
  ): Promise<NotificationResult> {
    if (!payload.patientId) {
      return { channel: "push", success: false, error: "No patient_id for push" };
    }

    const body = this.buildMessageBody(payload, trigger);

    // Broadcast via Supabase realtime to patient app SDK
    let pushError: string | null = null;
    try {
      const sendResult = await supabase
        .channel(`patient-notifications:${payload.patientId}`)
        .send({
          type: "broadcast",
          event: "appointment_reminder",
          payload: {
            reminderId,
            appointmentId: payload.appointmentId,
            trigger,
            title: this.buildMessageTitle(trigger),
            body,
            data: {
              appointmentId: payload.appointmentId,
              type: "appointment_reminder",
              action: "view_appointment",
            },
          },
        });
      if (sendResult !== "ok") {
        pushError = `Realtime send: ${sendResult}`;
      }
    } catch (e) {
      pushError = String(e);
    }

    if (pushError) {
      return { channel: "push", success: false, error: pushError };
    }

    // Also call the push notifications Edge Function (if configured)
    const fnResult = await supabase.functions.invoke("send-push-notification", {
      body: {
        patientId: payload.patientId,
        title: this.buildMessageTitle(trigger),
        body,
        data: { appointmentId: payload.appointmentId, reminderId },
      },
    });

    return {
      channel: "push",
      success: !fnResult.error,
      messageId: fnResult.data?.messageId,
      error: fnResult.error?.message,
    };
  }

  /**
   * WhatsApp via Supabase Edge Function (wraps Twilio/360dialog).
   */
  private async sendWhatsApp(
    payload: NotificationPayload,
    trigger: NotificationTrigger
  ): Promise<NotificationResult> {
    if (!payload.patientPhone) {
      return { channel: "whatsapp", success: false, error: "No phone number" };
    }

    const message = this.buildMessageBody(payload, trigger);

    const { data, error } = await supabase.functions.invoke("send-whatsapp", {
      body: {
        to: payload.patientPhone,
        message,
        appointmentId: payload.appointmentId,
        template: this.getTemplateName(trigger),
        variables: this.buildTemplateVariables(payload, trigger),
      },
    });

    return {
      channel: "whatsapp",
      success: !error && !!data?.messageId,
      messageId: data?.messageId,
      error: error?.message ?? data?.error,
    };
  }

  /**
   * SMS via Supabase Edge Function (wraps Twilio).
   */
  private async sendSMS(
    payload: NotificationPayload,
    trigger: NotificationTrigger
  ): Promise<NotificationResult> {
    if (!payload.patientPhone) {
      return { channel: "sms", success: false, error: "No phone number" };
    }

    // SMS is shorter than WhatsApp
    const message = this.buildSMSBody(payload, trigger);

    const { data, error } = await supabase.functions.invoke("send-sms", {
      body: {
        to: payload.patientPhone,
        message,
        appointmentId: payload.appointmentId,
      },
    });

    return {
      channel: "sms",
      success: !error && !!data?.sid,
      messageId: data?.sid,
      error: error?.message ?? data?.error,
    };
  }

  /**
   * Email via Supabase Edge Function (wraps Resend/SendGrid).
   */
  private async sendEmail(
    payload: NotificationPayload,
    trigger: NotificationTrigger
  ): Promise<NotificationResult> {
    if (!payload.patientEmail) {
      return { channel: "email", success: false, error: "No email address" };
    }

    const { data, error } = await supabase.functions.invoke("send-reminder-email", {
      body: {
        to: payload.patientEmail,
        patientName: payload.patientName,
        doctorName: payload.doctorName,
        appointmentDate: payload.appointmentDate,
        appointmentTime: payload.appointmentTime,
        tipoCita: payload.tipoCita,
        motivo: payload.isHighPrivacy ? undefined : payload.motivo,
        oficeName: payload.oficeName,
        trigger,
        rescheduleToken: payload.rescheduleToken,
        appointmentId: payload.appointmentId,
      },
    });

    return {
      channel: "email",
      success: !error && !!data?.id,
      messageId: data?.id,
      error: error?.message ?? data?.error,
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  private buildMessageTitle(trigger: NotificationTrigger): string {
    const titles: Record<NotificationTrigger, string> = {
      "24h":             "Recordatorio de cita — mañana",
      "2h":              "Su cita es en 2 horas",
      "1h":              "Su cita es en 1 hora",
      "30min":           "Su cita es en 30 minutos",
      "day_of":          "Tiene una cita hoy",
      "custom":          "Recordatorio de cita",
      "post_appointment":"¿Cómo fue su consulta?",
    };
    return titles[trigger] ?? "Recordatorio de cita";
  }

  private buildMessageBody(payload: NotificationPayload, trigger: NotificationTrigger): string {
    switch (trigger) {
      case "24h":   return TEMPLATES.reminder_24h(payload);
      case "2h":    return TEMPLATES.reminder_2h(payload);
      case "1h":    return TEMPLATES.reminder_2h({ ...payload, appointmentTime: `${payload.appointmentTime} (en 1 hora)` });
      case "30min": return TEMPLATES.reminder_2h({ ...payload, appointmentTime: `${payload.appointmentTime} (en 30 min)` });
      default:      return TEMPLATES.reminder_24h(payload);
    }
  }

  private buildSMSBody(payload: NotificationPayload, trigger: NotificationTrigger): string {
    // SMS: < 160 chars
    return `Red Salud: Recordatorio cita ${payload.tipoCita} con ${payload.doctorName} el ${payload.appointmentDate} a las ${payload.appointmentTime}. Confirmar: {{confirm_link}}`;
  }

  private getTemplateName(trigger: NotificationTrigger): string {
    const map: Record<NotificationTrigger, string> = {
      "24h":             "appointment_reminder_24h",
      "2h":              "appointment_reminder_2h",
      "1h":              "appointment_reminder_1h",
      "30min":           "appointment_reminder_30min",
      "day_of":          "appointment_reminder_day",
      "custom":          "appointment_reminder_generic",
      "post_appointment":"appointment_post_visit",
    };
    return map[trigger] ?? "appointment_reminder_generic";
  }

  private buildTemplateVariables(
    payload: NotificationPayload,
    trigger: NotificationTrigger
  ): Record<string, string> {
    return {
      patient_name:     payload.patientName,
      doctor_name:      payload.doctorName,
      appointment_date: payload.appointmentDate,
      appointment_time: payload.appointmentTime,
      office_name:      payload.oficeName ?? "",
      motivo:           payload.isHighPrivacy ? "" : (payload.motivo ?? ""),
      confirm_link:     `${process.env.NEXT_PUBLIC_APP_URL}/cita/confirmar/${payload.rescheduleToken}`,
      cancel_link:      `${process.env.NEXT_PUBLIC_APP_URL}/cita/cancelar/${payload.rescheduleToken}`,
      reschedule_link:  `${process.env.NEXT_PUBLIC_APP_URL}/cita/reprogramar/${payload.rescheduleToken}`,
      portal_link:      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/paciente`,
    };
  }

  private async updateChannelStatus(
    reminderId: string,
    channel: NotificationChannel,
    result: NotificationResult
  ): Promise<void> {
    const status = result.success ? "sent" : "failed";
    const update: Record<string, string | undefined> = {
      [`${channel}_status`]: status,
    };

    if (result.messageId) {
      update[`${channel}_message_id`] = result.messageId;
    }

    if (!result.success && result.error) {
      update.error_message = result.error;
    }

    await supabase
      .from("appointment_reminders")
      .update(update)
      .eq("id", reminderId);
  }
}

// ── Singleton export ─────────────────────────────────────────────────────────
export const notificationService = AppointmentNotificationService.getInstance();

// ── Specialty-aware payload builder ─────────────────────────────────────────

/**
 * High-privacy specialties omit procedure details from reminder messages.
 */
export const HIGH_PRIVACY_SPECIALTIES = [
  "psicologia", "psiquiatria", "psicologia clinica",
  "salud mental", "terapia psicologica",
];

export function isHighPrivacySpecialty(specialtyName?: string | null): boolean {
  if (!specialtyName) return false;
  const lower = specialtyName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return HIGH_PRIVACY_SPECIALTIES.some((s) => lower.includes(s));
}

/**
 * Build notification payload from a CalendarAppointment.
 */
export async function buildPayloadFromAppointment(
  appointment: CalendarAppointment,
  doctorName: string,
  specialtyName?: string,
  officeName?: string
): Promise<NotificationPayload> {
  const fecha = new Date(appointment.fecha_hora);

  return {
    appointmentId:    appointment.id,
    doctorId:         "", // filled by caller
    patientId:        appointment.paciente_id,
    patientName:      appointment.paciente_nombre,
    patientPhone:     appointment.paciente_telefono,
    patientEmail:     appointment.paciente_email,
    appointmentDate:  fecha.toISOString().split("T")[0] ?? "",
    appointmentTime:  `${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`,
    doctorName,
    specialtyName,
    motivo:           appointment.motivo,
    oficeName:        officeName,
    tipoCita:         appointment.tipo_cita ?? "presencial",
    duracionMinutos:  appointment.duracion_minutos,
    isHighPrivacy:    isHighPrivacySpecialty(specialtyName),
  };
}
