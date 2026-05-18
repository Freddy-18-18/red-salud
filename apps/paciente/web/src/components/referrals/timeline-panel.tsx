"use client";

import {
  CheckCircle2,
  Eye,
  FileText,
  Link2,
  Lock,
  Sparkles,
  Stethoscope,
  TimerOff,
  X,
} from "lucide-react";

import { useReferralAudit } from "@/hooks/use-referral-audit";
import type { ReferralAuditEntry } from "@/lib/services/medical-referral-service";

interface TimelinePanelProps {
  referralId: string;
}

export function TimelinePanel({ referralId }: TimelinePanelProps) {
  const q = useReferralAudit(referralId);
  const entries = q.data ?? [];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        Historial inmutable de quién hizo qué con esta referencia. Útil si
        alguna vez necesitás demostrar consentimiento o trazabilidad clínica.
      </div>

      {q.isLoading ? (
        <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
          Cargando…
        </p>
      ) : entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Todavía no hay eventos registrados.
        </div>
      ) : (
        <ol className="relative space-y-3 border-l border-[hsl(var(--border))] pl-4">
          {entries.map((e) => (
            <TimelineRow key={e.id} entry={e} />
          ))}
        </ol>
      )}
    </div>
  );
}

function TimelineRow({ entry }: { entry: ReferralAuditEntry }) {
  const presentation = describe(entry);
  return (
    <li className="relative">
      <span className="absolute -left-[22px] flex h-4 w-4 items-center justify-center rounded-full bg-[hsl(var(--card))] ring-2 ring-emerald-400">
        <span className={`flex h-3 w-3 items-center justify-center rounded-full ${presentation.tone}`}>
          {presentation.icon}
        </span>
      </span>
      <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2.5">
        <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
          {presentation.title}
        </p>
        {presentation.body && (
          <p className="mt-0.5 text-[11px] text-[hsl(var(--muted-foreground))]">
            {presentation.body}
          </p>
        )}
        <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
          {actorLabel(entry.actor_role)} · {formatTime(entry.created_at)}
        </p>
      </div>
    </li>
  );
}

interface Presentation {
  title: string;
  body?: string;
  icon: React.ReactNode;
  tone: string;
}

function describe(e: ReferralAuditEntry): Presentation {
  const action = e.action;
  if (action === "created") {
    return {
      title: "Referencia creada",
      body: "Tu médico te derivó a la especialidad y la dejó en estado de revisión.",
      icon: <Sparkles className="h-2 w-2 text-white" />,
      tone: "bg-emerald-500",
    };
  }
  if (action === "status_change") {
    const to = e.to_status ?? "?";
    if (to === "active")
      return {
        title: "Aceptaste la referencia",
        body: "Pasó a estar disponible para agendar con cualquier especialista.",
        icon: <CheckCircle2 className="h-2 w-2 text-white" />,
        tone: "bg-emerald-500",
      };
    if (to === "declined")
      return {
        title: "Descartada",
        body: "Decidiste no usar esta referencia.",
        icon: <X className="h-2 w-2 text-white" />,
        tone: "bg-rose-500",
      };
    if (to === "used")
      return {
        title: "Usada para una cita",
        body: "Quedó vinculada a una cita agendada.",
        icon: <Stethoscope className="h-2 w-2 text-white" />,
        tone: "bg-sky-500",
      };
    if (to === "completed")
      return {
        title: "Cita completada",
        body: "El especialista marcó la consulta como completada.",
        icon: <CheckCircle2 className="h-2 w-2 text-white" />,
        tone: "bg-violet-500",
      };
    if (to === "expired")
      return {
        title: "Referencia vencida",
        body: "Pasó la fecha de vencimiento sin que la usaras.",
        icon: <TimerOff className="h-2 w-2 text-white" />,
        tone: "bg-amber-500",
      };
    return {
      title: `Estado: ${to}`,
      body: e.from_status ? `Antes: ${e.from_status}` : undefined,
      icon: <CheckCircle2 className="h-2 w-2 text-white" />,
      tone: "bg-slate-500",
    };
  }
  if (action === "privacy_change") {
    const share = (e.metadata as { share_referrer_identity?: boolean })
      .share_referrer_identity;
    return {
      title: share
        ? "Activaste compartir nombre del médico que refirió"
        : "Ocultaste el nombre del médico que refirió",
      icon: share ? (
        <Eye className="h-2 w-2 text-white" />
      ) : (
        <Lock className="h-2 w-2 text-white" />
      ),
      tone: share ? "bg-amber-500" : "bg-emerald-500",
    };
  }
  if (action === "documents_change") {
    const count = (e.metadata as { count?: number }).count ?? 0;
    return {
      title: count > 0 ? `Adjuntaste ${count} documento${count === 1 ? "" : "s"}` : "Quitaste todos los adjuntos",
      icon: <FileText className="h-2 w-2 text-white" />,
      tone: "bg-sky-500",
    };
  }
  if (action === "share_created") {
    const meta = e.metadata as {
      recipient_label?: string | null;
      share_referrer_identity?: boolean;
    };
    return {
      title: "Generaste un enlace temporal",
      body: meta.recipient_label
        ? `Para: ${meta.recipient_label}`
        : meta.share_referrer_identity
          ? "Incluye nombre del médico que refirió"
          : "Sólo contexto clínico",
      icon: <Link2 className="h-2 w-2 text-white" />,
      tone: "bg-emerald-500",
    };
  }
  if (action === "share_revoked") {
    return {
      title: "Revocaste un enlace",
      body: "Quien lo tuviese ya no puede abrirlo.",
      icon: <X className="h-2 w-2 text-white" />,
      tone: "bg-rose-500",
    };
  }
  return {
    title: action,
    icon: <CheckCircle2 className="h-2 w-2 text-white" />,
    tone: "bg-slate-500",
  };
}

function actorLabel(role: ReferralAuditEntry["actor_role"]): string {
  if (role === "patient") return "Vos";
  if (role === "referring_doctor") return "Tu médico";
  return "Sistema";
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
