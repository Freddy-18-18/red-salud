"use client";

import {
  AlertTriangle,
  ArrowRight,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Link2,
  Lock,
  MessageSquare,
  Paperclip,
  Sparkles,
  Stethoscope,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { ChatPanel } from "@/components/referrals/chat-panel";
import { DocumentsPanel } from "@/components/referrals/documents-panel";
import { SharePanel } from "@/components/referrals/share-panel";
import { TimelinePanel } from "@/components/referrals/timeline-panel";
import { createClient } from "@/lib/supabase/client";
import {
  medicalReferralService,
  type MedicalReferral,
  type ReferralStatus,
  type ReferralUrgency,
} from "@/lib/services/medical-referral-service";

// ── Tabs ──────────────────────────────────────────────────────────────

type FilterTab =
  | "all"
  | "pending_consent"
  | "active"
  | "used"
  | "completed"
  | "expired"
  | "declined";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending_consent", label: "Por revisar" },
  { key: "active", label: "Activas" },
  { key: "used", label: "Usadas" },
  { key: "completed", label: "Completadas" },
  { key: "expired", label: "Vencidas" },
  { key: "declined", label: "Descartadas" },
];

const EXPIRY_WARNING_DAYS = 7;

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

// ── Page ──────────────────────────────────────────────────────────────

export default function ReferenciasMedicasPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [items, setItems] = useState<MedicalReferral[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await medicalReferralService.getReferrals();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    if (!items) return [];
    // "Todas" deliberately omits declined — they live in their own tab.
    if (activeTab === "all") return items.filter((r) => r.status !== "declined");
    return items.filter((r) => r.status === activeTab);
  }, [items, activeTab]);

  const expiringSoonCount = useMemo(() => {
    return (items ?? []).filter((r) => {
      if (r.status !== "active") return false;
      const d = daysUntil(r.expires_at);
      return d !== null && d >= 0 && d <= EXPIRY_WARNING_DAYS;
    }).length;
  }, [items]);

  const counts = useMemo(() => {
    const c = {
      total: items?.length ?? 0,
      pending: 0,
      active: 0,
      used: 0,
      expired: 0,
    };
    for (const r of items ?? []) {
      if (r.status === "pending_consent") c.pending += 1;
      else if (r.status === "active") c.active += 1;
      else if (r.status === "used") c.used += 1;
      else if (r.status === "expired") c.expired += 1;
    }
    return c;
  }, [items]);

  const openReferral = useMemo(
    () => items?.find((r) => r.id === openId) ?? null,
    [items, openId],
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <ArrowRightLeft className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--foreground))]">
              Referencias médicas
            </h1>
            <p className="text-sm text-[hsl(var(--muted-foreground))]">
              Resúmenes clínicos que tu médico te entrega para que cualquier
              especialista te atienda con contexto.
            </p>
          </div>
        </div>
      </div>

      {/* Expiry-soon nudge */}
      {expiringSoonCount > 0 && (
        <article className="rounded-2xl border border-amber-300 bg-amber-50/70 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
            <p className="text-xs text-amber-900 dark:text-amber-200">
              <strong>
                {expiringSoonCount}{" "}
                {expiringSoonCount === 1
                  ? "referencia activa vence pronto"
                  : "referencias activas vencen pronto"}
              </strong>{" "}
              ({EXPIRY_WARNING_DAYS} días o menos). Si vas a usarla, agendá tu
              cita antes de que venza.
            </p>
          </div>
        </article>
      )}

      {/* Trust banner — explains the privacy model */}
      <article className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="flex items-start gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Lock className="h-4 w-4" />
          </span>
          <div className="space-y-1.5">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              Vos controlás tu información
            </p>
            <ul className="space-y-1 text-xs text-emerald-900/85 dark:text-emerald-200/85">
              <li className="flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                Una referencia te orienta a una <strong>especialidad</strong>, no a un médico específico.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                Hasta que vos no aceptes, ningún otro doctor puede leer el contenido clínico.
              </li>
              <li className="flex items-start gap-1.5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
                Vos elegís si compartir el nombre del médico que te derivó o sólo el contexto clínico.
              </li>
            </ul>
          </div>
        </div>
      </article>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Por revisar" value={counts.pending} tone="amber" />
        <StatCard label="Activas" value={counts.active} tone="emerald" />
        <StatCard label="Usadas" value={counts.used} tone="sky" />
        <StatCard label="Vencidas" value={counts.expired} tone="muted" />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl bg-[hsl(var(--muted))] p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 min-w-fit rounded-lg px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
                : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            }`}
          >
            {tab.label}
            {tab.key === "pending_consent" && counts.pending > 0 && (
              <span className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonList />
      ) : error ? (
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-800">
              No pudimos cargar tus referidos
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Probá recargar la página en unos segundos.
            </p>
            <button
              type="button"
              onClick={refresh}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-white border border-amber-200 rounded-lg hover:bg-amber-50 transition"
            >
              Reintentar
            </button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState tab={activeTab} />
      ) : (
        <ul className="space-y-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <ReferralCard
                referral={r}
                onOpen={() => setOpenId(r.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {/* Drawer */}
      {openReferral && (
        <ReferralDetailModal
          referral={openReferral}
          onClose={() => setOpenId(null)}
          onChanged={refresh}
        />
      )}
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────

function ReferralCard({
  referral,
  onOpen,
}: {
  referral: MedicalReferral;
  onOpen: () => void;
}) {
  const tone = urgencyTone(referral.urgency);
  const statusInfo = statusBadge(referral.status);
  const expiresIn = daysUntil(referral.expires_at);
  const expiringSoon =
    referral.status === "active" &&
    expiresIn !== null &&
    expiresIn >= 0 &&
    expiresIn <= EXPIRY_WARNING_DAYS;

  return (
    <article className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-sm transition-shadow hover:shadow-md">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
            <Stethoscope className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Te derivaron a
            </p>
            <h3 className="text-base font-bold text-[hsl(var(--foreground))]">
              {referral.target_specialty.name}
            </h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone}`}
          >
            <AlertTriangle className="h-3 w-3" />
            {urgencyLabel(referral.urgency)}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusInfo.classes}`}
          >
            {statusInfo.icon}
            {statusInfo.label}
          </span>
          {referral.has_duplicate && (
            <span
              title="Tenés más de una referencia activa para esta especialidad"
              className="inline-flex items-center gap-1 rounded-full border border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300"
            >
              <FileText className="h-3 w-3" />
              Duplicada
            </span>
          )}
          {expiringSoon && (
            <span
              className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300"
              title={`Vence en ${expiresIn} ${expiresIn === 1 ? "día" : "días"}`}
            >
              <Clock className="h-3 w-3" />
              Vence pronto
            </span>
          )}
        </div>
      </header>

      <p className="mt-3 text-sm text-[hsl(var(--foreground))] line-clamp-2">
        {referral.reason}
      </p>

      <footer className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-[hsl(var(--muted-foreground))]">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelative(referral.created_at)}
          </span>
          {referral.expires_at && (
            <span className="inline-flex items-center gap-1">
              · Vence {formatRelative(referral.expires_at)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
        >
          {referral.status === "pending_consent" ? "Revisar" : "Ver detalle"}
          <ArrowRight className="h-3 w-3" />
        </button>
      </footer>
    </article>
  );
}

// ── Detail modal ──────────────────────────────────────────────────────

type ModalTab = "detail" | "share" | "documents" | "chat" | "timeline";

function ReferralDetailModal({
  referral,
  onClose,
  onChanged,
}: {
  referral: MedicalReferral;
  onClose: () => void;
  onChanged: () => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const [shareIdentity, setShareIdentity] = useState(
    referral.share_referrer_identity,
  );
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ModalTab>("detail");
  const [patientUserId, setPatientUserId] = useState<string | null>(null);
  const isPending = referral.status === "pending_consent";
  const isActive = referral.status === "active";
  const isShareable =
    referral.status === "active" ||
    referral.status === "used" ||
    referral.status === "completed";
  const referrerName =
    referral.referring_doctor.profile.full_name ?? "tu médico";

  // Resolve current user id once — needed for chat alignment.
  useEffect(() => {
    if (activeTab !== "chat" || patientUserId) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setPatientUserId(data.user.id);
    });
  }, [activeTab, patientUserId]);

  const consent = async () => {
    setBusy(true);
    setError(null);
    try {
      await medicalReferralService.consent(referral.id, shareIdentity);
      await onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    } finally {
      setBusy(false);
    }
  };

  const decline = async () => {
    if (!confirm("¿Seguro que querés descartar esta referencia?")) return;
    setBusy(true);
    setError(null);
    try {
      await medicalReferralService.decline(referral.id);
      await onChanged();
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo descartar.");
    } finally {
      setBusy(false);
    }
  };

  const togglePref = async (next: boolean) => {
    setShareIdentity(next);
    if (!isActive) return;
    setBusy(true);
    try {
      await medicalReferralService.updateSharePreference(referral.id, next);
      await onChanged();
    } catch {
      setShareIdentity(!next);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto scrollbar-hide rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Referencia médica
            </p>
            <h2 className="truncate text-lg font-bold text-[hsl(var(--foreground))]">
              {referral.target_specialty.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* Tab nav — only meaningful tabs for the current state */}
        {!isPending && (
          <nav className="sticky top-[68px] z-10 flex gap-1 border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 pt-2">
            <ModalTabButton
              active={activeTab === "detail"}
              onClick={() => setActiveTab("detail")}
              label="Detalle"
              icon={<FileText className="h-3.5 w-3.5" />}
            />
            {isShareable && (
              <ModalTabButton
                active={activeTab === "share"}
                onClick={() => setActiveTab("share")}
                label="Compartir"
                icon={<Link2 className="h-3.5 w-3.5" />}
              />
            )}
            {isShareable && (
              <ModalTabButton
                active={activeTab === "documents"}
                onClick={() => setActiveTab("documents")}
                label="Documentos"
                icon={<Paperclip className="h-3.5 w-3.5" />}
                count={referral.attached_documents?.length ?? 0}
              />
            )}
            <ModalTabButton
              active={activeTab === "chat"}
              onClick={() => setActiveTab("chat")}
              label="Chat"
              icon={<MessageSquare className="h-3.5 w-3.5" />}
            />
            <ModalTabButton
              active={activeTab === "timeline"}
              onClick={() => setActiveTab("timeline")}
              label="Historial"
              icon={<History className="h-3.5 w-3.5" />}
            />
          </nav>
        )}

        {activeTab === "share" && isShareable ? (
          <div className="p-5">
            <SharePanel
              referralId={referral.id}
              defaultShareIdentity={referral.share_referrer_identity}
            />
          </div>
        ) : activeTab === "documents" && isShareable ? (
          <div className="p-5">
            <DocumentsPanel
              referralId={referral.id}
              initialAttached={referral.attached_documents}
            />
          </div>
        ) : activeTab === "chat" && !isPending ? (
          <div className="p-5">
            {patientUserId ? (
              <ChatPanel
                referralId={referral.id}
                patientUserId={patientUserId}
                referrerName={referrerName}
              />
            ) : (
              <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
                Cargando…
              </p>
            )}
          </div>
        ) : activeTab === "timeline" && !isPending ? (
          <div className="p-5">
            <TimelinePanel referralId={referral.id} />
          </div>
        ) : (
        <div className="space-y-4 p-5">
          {/* Status pending → consent CTA */}
          {isPending && (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-300" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                    Revisá y decidí cómo compartir esta referencia
                  </p>
                  <p className="mt-1 text-xs text-amber-900/85 dark:text-amber-200/85">
                    Esta referencia se generó hace poco. Hasta que la aceptes,
                    ningún otro doctor puede ver el contenido clínico. Si
                    aceptás, vos elegís si querés compartir o no el nombre
                    del médico que te derivó.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Referrer (visible to the patient only) */}
          <Section
            label="Te derivó"
            hint="Visible solo para vos. Lo compartimos con otros médicos sólo si vos elegís."
          >
            <div className="flex items-center gap-3">
              {referral.referring_doctor.profile.avatar_url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={referral.referring_doctor.profile.avatar_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-10 w-10 rounded-xl object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                  {(referrerName ?? "?")
                    .split(" ")
                    .filter(Boolean)
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
                  Dr. {referrerName}
                </p>
                {referral.referring_doctor.specialty && (
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    {referral.referring_doctor.specialty.name}
                  </p>
                )}
              </div>
            </div>
          </Section>

          {/* Reason */}
          <Section label="Motivo de la consulta">
            <p className="text-sm text-[hsl(var(--foreground))]">
              {referral.reason}
            </p>
          </Section>

          {referral.diagnosis && (
            <Section label="Sospecha diagnóstica del médico">
              <p className="text-sm text-[hsl(var(--foreground))]">
                {referral.diagnosis}
              </p>
            </Section>
          )}

          {referral.clinical_notes && (
            <Section label="Notas clínicas">
              <p className="whitespace-pre-line text-sm text-[hsl(var(--muted-foreground))]">
                {referral.clinical_notes}
              </p>
            </Section>
          )}

          {referral.exams_recommended &&
            referral.exams_recommended.length > 0 && (
              <Section label="Exámenes sugeridos para llevar">
                <ul className="space-y-1 text-sm text-[hsl(var(--foreground))]">
                  {referral.exams_recommended.map((e) => (
                    <li key={e} className="flex items-start gap-2">
                      <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                      {e}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

          {/* Sharing preference (active or pending — patient picks at consent) */}
          {(isPending || isActive) && (
            <Section
              label="Privacidad"
              hint="Esta elección se aplica cuando agendes con un especialista."
            >
              <div className="space-y-2">
                <RadioRow
                  active={!shareIdentity}
                  label="Compartir sólo el contexto clínico"
                  description="El especialista verá el motivo, exámenes y notas, pero NO el nombre del médico que te derivó."
                  onClick={() => togglePref(false)}
                  disabled={busy}
                />
                <RadioRow
                  active={shareIdentity}
                  label="Compartir también con el nombre del médico que me derivó"
                  description="El especialista verá quién te derivó. Útil si querés transparencia profesional."
                  onClick={() => togglePref(true)}
                  disabled={busy}
                />
              </div>
            </Section>
          )}

          {/* Actions */}
          {isPending ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={consent}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Aceptar y activar
              </button>
              <button
                type="button"
                onClick={decline}
                disabled={busy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))] disabled:opacity-50"
              >
                Descartar
              </button>
            </div>
          ) : isActive ? (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={
                  referral.target_specialty.slug
                    ? `/dashboard/buscar-medico/especialidad/${referral.target_specialty.slug}`
                    : `/dashboard/buscar-medico?specialty=${referral.target_specialty.id}`
                }
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 text-sm font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
              >
                <Stethoscope className="h-4 w-4" />
                Buscar especialista
              </Link>
              <Link
                href={`/dashboard/agendar?specialty=${referral.target_specialty.id}&referral=${referral.id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
              >
                Agendar cita
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : null}

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
        )}
      </div>
    </div>
  );
}

function ModalTabButton({
  active,
  onClick,
  label,
  icon,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
        active
          ? "bg-[hsl(var(--background))] text-emerald-700 shadow-[inset_0_-2px_0_0_hsl(var(--emerald-600,142_71%_45%))] dark:text-emerald-300"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      }`}
    >
      {icon}
      {label}
      {typeof count === "number" && count > 0 && (
        <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

// ── Reusable bits ─────────────────────────────────────────────────────

function Section({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header>
        <p className="text-[10px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
          {label}
        </p>
        {hint && (
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {hint}
          </p>
        )}
      </header>
      <div className="mt-1.5">{children}</div>
    </section>
  );
}

function RadioRow({
  active,
  label,
  description,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-500/10"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          active
            ? "border-emerald-600 bg-emerald-600"
            : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
        }`}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-[hsl(var(--foreground))]">
          {label}
        </p>
        <p className="mt-0.5 text-xs text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </div>
    </button>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "amber" | "emerald" | "sky" | "muted";
}) {
  const tones: Record<string, string> = {
    amber: "text-amber-700 dark:text-amber-300",
    emerald: "text-emerald-700 dark:text-emerald-300",
    sky: "text-sky-700 dark:text-sky-300",
    muted: "text-[hsl(var(--muted-foreground))]",
  };
  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
      <p className={`text-2xl font-bold tabular-nums ${tones[tone]}`}>{value}</p>
      <p className="text-[11px] text-[hsl(var(--muted-foreground))]">{label}</p>
    </div>
  );
}

function SkeletonList() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[hsl(var(--muted))]" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-[hsl(var(--muted))]" />
              <div className="h-4 w-40 rounded bg-[hsl(var(--muted))]" />
            </div>
          </div>
          <div className="mt-3 h-3 w-3/4 rounded bg-[hsl(var(--muted))]" />
        </li>
      ))}
    </ul>
  );
}

function EmptyState({ tab }: { tab: FilterTab }) {
  const messages: Record<FilterTab, string> = {
    all: "Todavía no tenés referencias médicas.",
    pending_consent: "No tenés referencias por revisar.",
    active: "No tenés referencias activas.",
    used: "No tenés referencias usadas.",
    completed: "No tenés referencias completadas todavía.",
    expired: "No tenés referencias vencidas.",
    declined: "No descartaste ninguna referencia.",
  };
  return (
    <div className="rounded-2xl border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 py-12 text-center">
      <ArrowRightLeft className="mx-auto h-10 w-10 text-[hsl(var(--muted-foreground))] opacity-50" />
      <p className="mt-3 text-sm font-medium text-[hsl(var(--foreground))]">
        {messages[tab]}
      </p>
      <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
        Cuando un médico te derive a una especialidad, va a aparecer acá.
      </p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────

function urgencyLabel(u: ReferralUrgency): string {
  if (u === "urgente") return "Urgente";
  if (u === "prioritario") return "Prioritario";
  return "Electivo";
}

function urgencyTone(u: ReferralUrgency): string {
  if (u === "urgente")
    return "border-red-300 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300";
  if (u === "prioritario")
    return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300";
  return "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300";
}

function statusBadge(s: ReferralStatus): {
  label: string;
  classes: string;
  icon: React.ReactNode;
} {
  if (s === "pending_consent")
    return {
      label: "Por revisar",
      classes:
        "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300",
      icon: <Sparkles className="h-3 w-3" />,
    };
  if (s === "active")
    return {
      label: "Activa",
      classes:
        "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  if (s === "used")
    return {
      label: "Usada",
      classes:
        "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/40 dark:bg-sky-950/30 dark:text-sky-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  if (s === "completed")
    return {
      label: "Completada",
      classes:
        "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/40 dark:bg-violet-950/30 dark:text-violet-300",
      icon: <CheckCircle2 className="h-3 w-3" />,
    };
  if (s === "declined")
    return {
      label: "Descartada",
      classes:
        "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
      icon: <X className="h-3 w-3" />,
    };
  return {
    label: "Vencida",
    classes:
      "border-[hsl(var(--border))] bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
    icon: <Clock className="h-3 w-3" />,
  };
}

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const absMs = Math.abs(diffMs);
  const future = diffMs < 0;
  const min = Math.floor(absMs / 60000);
  if (min < 60) return future ? `en ${min} min` : `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return future ? `en ${h} h` : `hace ${h} h`;
  const days = Math.floor(h / 24);
  if (days < 7) return future ? `en ${days} días` : `hace ${days} días`;
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
