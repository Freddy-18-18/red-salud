"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Link2,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

import {
  useCreateReferralShare,
  useReferralShares,
  useRevokeReferralShare,
} from "@/hooks/use-referral-shares";
import type { ReferralShare } from "@/lib/services/medical-referral-service";

interface SharePanelProps {
  referralId: string;
  /** Whether the patient already opted to expose their referrer's identity
   *  in regular bookings — used as the default for new shares. */
  defaultShareIdentity: boolean;
}

const DURATION_OPTIONS: { hours: number; label: string }[] = [
  { hours: 24, label: "24 horas" },
  { hours: 72, label: "3 días" },
  { hours: 168, label: "7 días" },
];

export function SharePanel({
  referralId,
  defaultShareIdentity,
}: SharePanelProps) {
  const sharesQ = useReferralShares(referralId);
  const createMut = useCreateReferralShare(referralId);
  const revokeMut = useRevokeReferralShare(referralId);

  const [recipientLabel, setRecipientLabel] = useState("");
  const [shareIdentity, setShareIdentity] = useState(defaultShareIdentity);
  const [duration, setDuration] = useState<number>(72);
  const [justCopied, setJustCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeShares = (sharesQ.data ?? []).filter(
    (s) => !s.revoked_at && new Date(s.expires_at).getTime() > Date.now(),
  );
  const expiredOrRevoked = (sharesQ.data ?? []).filter(
    (s) => s.revoked_at || new Date(s.expires_at).getTime() <= Date.now(),
  );

  const handleCreate = async () => {
    setError(null);
    try {
      const created = await createMut.mutateAsync({
        recipientLabel: recipientLabel.trim() || undefined,
        shareReferrerIdentity: shareIdentity,
        expiresInHours: duration,
      });
      setRecipientLabel("");
      const url = buildShareUrl(created.token);
      try {
        await navigator.clipboard.writeText(url);
        setJustCopied(created.id);
        setTimeout(() => setJustCopied(null), 2500);
      } catch {
        /* clipboard might be blocked — link is still visible in the list */
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el enlace.");
    }
  };

  const handleRevoke = async (shareId: string) => {
    if (!confirm("¿Revocar este enlace? Quien lo tenga ya no podrá abrirlo.")) return;
    try {
      await revokeMut.mutateAsync(shareId);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo revocar.");
    }
  };

  const handleCopy = async (token: string, shareId: string) => {
    try {
      await navigator.clipboard.writeText(buildShareUrl(token));
      setJustCopied(shareId);
      setTimeout(() => setJustCopied(null), 2000);
    } catch {
      setError("Tu navegador no permite copiar. Seleccioná el link manualmente.");
    }
  };

  return (
    <div className="space-y-5">
      {/* Generator card */}
      <section className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4">
        <header className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Link2 className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-sm font-bold text-[hsl(var(--foreground))]">
              Generar enlace temporal
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Vos elegís privacidad y duración. Siempre podés revocar.
            </p>
          </div>
        </header>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              ¿Para quién? (opcional)
            </span>
            <input
              type="text"
              value={recipientLabel}
              onChange={(e) => setRecipientLabel(e.target.value)}
              placeholder="Mamá, Dr. González, Mi hija…"
              className="mt-1 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
              maxLength={80}
            />
          </label>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Duración
            </p>
            <div className="mt-1 grid grid-cols-3 gap-2">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.hours}
                  type="button"
                  onClick={() => setDuration(opt.hours)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                    duration === opt.hours
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-950/30 dark:text-emerald-200"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
              Privacidad
            </p>
            <div className="mt-1 space-y-2">
              <PrivacyRow
                active={!shareIdentity}
                icon={<EyeOff className="h-3.5 w-3.5" />}
                title="Sólo el contexto clínico"
                description="Quien abra el enlace verá motivo, exámenes y notas, pero no el nombre del médico que te derivó."
                onClick={() => setShareIdentity(false)}
              />
              <PrivacyRow
                active={shareIdentity}
                icon={<Eye className="h-3.5 w-3.5" />}
                title="Incluir al médico que me derivó"
                description="Útil para transparencia profesional. Verás claramente quién emitió la referencia."
                onClick={() => setShareIdentity(true)}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreate}
            disabled={createMut.isPending}
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {createMut.isPending ? "Generando…" : "Generar enlace"}
          </button>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      </section>

      {/* Active shares */}
      <section>
        <header className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Enlaces activos
          </p>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {activeShares.length}
          </span>
        </header>

        {sharesQ.isLoading ? (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border))] py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
            Cargando…
          </div>
        ) : activeShares.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[hsl(var(--border))] py-6 text-center text-xs text-[hsl(var(--muted-foreground))]">
            No tenés enlaces activos.
          </div>
        ) : (
          <ul className="space-y-2">
            {activeShares.map((s) => (
              <ShareRow
                key={s.id}
                share={s}
                onCopy={() => handleCopy(s.token, s.id)}
                onRevoke={() => handleRevoke(s.id)}
                copied={justCopied === s.id}
                disabled={revokeMut.isPending}
              />
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      {expiredOrRevoked.length > 0 && (
        <section>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
            Historial
          </p>
          <ul className="space-y-1.5">
            {expiredOrRevoked.slice(0, 5).map((s) => (
              <li
                key={s.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-3 py-1.5 text-[11px] text-[hsl(var(--muted-foreground))]"
              >
                <span className="truncate">
                  {s.recipient_label ? `Para: ${s.recipient_label}` : "Sin etiqueta"}
                </span>
                <span className="shrink-0">
                  {s.revoked_at ? (
                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400">
                      <X className="h-3 w-3" />
                      Revocado
                    </span>
                  ) : (
                    "Vencido"
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function PrivacyRow({
  active,
  icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors ${
        active
          ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
          : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          active
            ? "bg-emerald-600 text-white"
            : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
        }`}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <p
          className={`text-xs font-semibold ${
            active
              ? "text-emerald-900 dark:text-emerald-200"
              : "text-[hsl(var(--foreground))]"
          }`}
        >
          {title}
        </p>
        <p className="mt-0.5 text-[11px] leading-snug text-[hsl(var(--muted-foreground))]">
          {description}
        </p>
      </span>
    </button>
  );
}

function ShareRow({
  share,
  onCopy,
  onRevoke,
  copied,
  disabled,
}: {
  share: ReferralShare;
  onCopy: () => void;
  onRevoke: () => void;
  copied: boolean;
  disabled: boolean;
}) {
  const url = buildShareUrl(share.token);
  return (
    <li className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
            {share.recipient_label ?? "Enlace sin etiqueta"}
          </p>
          <p className="mt-0.5 text-[10px] text-[hsl(var(--muted-foreground))]">
            {share.share_referrer_identity ? (
              <span className="inline-flex items-center gap-0.5">
                <Eye className="h-3 w-3" />
                Incluye médico que refiere
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5">
                <ShieldCheck className="h-3 w-3" />
                Sólo contexto clínico
              </span>
            )}
            {" · "}
            Vence {formatRel(share.expires_at)}
            {share.accessed_count > 0 &&
              ` · Visto ${share.accessed_count}×`}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center gap-1.5">
        <code className="min-w-0 flex-1 truncate rounded-md bg-[hsl(var(--muted))]/50 px-2 py-1 text-[10px] text-[hsl(var(--foreground))]">
          {url}
        </code>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[hsl(var(--border))] px-2 py-1 text-[10px] font-medium text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted))]"
        >
          {copied ? (
            <>
              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copiar
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onRevoke}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1 rounded-md border border-rose-300 px-2 py-1 text-[10px] font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-900/40 dark:text-rose-300 dark:hover:bg-rose-950/30"
        >
          <Trash2 className="h-3 w-3" />
          Revocar
        </button>
      </div>
    </li>
  );
}

function buildShareUrl(token: string): string {
  if (typeof window === "undefined") return `/share/referral/${token}`;
  return `${window.location.origin}/share/referral/${token}`;
}

function formatRel(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const future = ms > 0;
  const abs = Math.abs(ms);
  const h = Math.floor(abs / 3600000);
  if (h < 1) return future ? "en menos de 1 h" : "hace menos de 1 h";
  if (h < 24) return future ? `en ${h} h` : `hace ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return future ? `en ${d} días` : `hace ${d} días`;
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
  });
}
