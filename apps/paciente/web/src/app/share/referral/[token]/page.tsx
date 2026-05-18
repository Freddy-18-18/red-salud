import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Calendar, FileText, ShieldCheck, AlertTriangle, Stethoscope } from "lucide-react";

interface SharedReferralPayload {
  recipient_label: string | null;
  expires_at: string;
  share_referrer_identity: boolean;
  referral: {
    id: string;
    reason: string;
    diagnosis: string | null;
    clinical_notes: string | null;
    exams_recommended: string[] | null;
    attached_documents:
      | { name: string; url: string; type: string }[]
      | null;
    urgency: "electivo" | "prioritario" | "urgente";
    created_at: string;
    target_specialty: { id: string; name: string };
  };
  referrer: { full_name: string | null; specialty_name: string | null } | null;
}

async function getShared(token: string): Promise<{
  data: SharedReferralPayload | null;
  status: number;
}> {
  // Build absolute URL — server fetch needs an origin.
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("host") ?? "localhost:3003";
  const url = `${proto}://${host}/api/share/referral/${encodeURIComponent(token)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return { data: null, status: res.status };
  const json = await res.json();
  return { data: (json?.data as SharedReferralPayload) ?? null, status: 200 };
}

const URGENCY_LABEL: Record<string, string> = {
  electivo: "Electivo",
  prioritario: "Prioritario",
  urgente: "Urgente",
};

const URGENCY_TONE: Record<string, string> = {
  electivo: "bg-emerald-100 text-emerald-800 border-emerald-200",
  prioritario: "bg-amber-100 text-amber-900 border-amber-200",
  urgente: "bg-rose-100 text-rose-800 border-rose-200",
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-VE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function SharedReferralPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const { data, status } = await getShared(token);

  // 410 → expired or revoked. We render a friendly state.
  const expiredOrRevoked = status === 410;
  if (!data && !expiredOrRevoked) notFound();

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <header className="border-b border-[hsl(var(--border))] bg-white/70 backdrop-blur dark:bg-[hsl(var(--card))]/70">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <Stethoscope className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Red Salud</p>
              <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                Referencia médica compartida
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
            <ShieldCheck className="h-3 w-3" />
            Vista de solo lectura
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {expiredOrRevoked || !data ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              <h1 className="text-lg font-bold">Enlace no disponible</h1>
            </div>
            <p className="mt-2 text-sm">
              Este enlace ha caducado o fue revocado por el paciente. Si
              necesitás acceso, pedile que genere uno nuevo.
            </p>
          </div>
        ) : (
          <article className="space-y-5">
            {/* Hero */}
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Especialidad de destino
                  </p>
                  <h1 className="mt-1 truncate text-2xl font-bold">
                    {data.referral.target_specialty.name}
                  </h1>
                  <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                    Emitida el {formatDate(data.referral.created_at)}
                    {" · "}
                    Acceso vence el {formatDate(data.expires_at)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${URGENCY_TONE[data.referral.urgency] ?? ""}`}
                >
                  {URGENCY_LABEL[data.referral.urgency] ?? data.referral.urgency}
                </span>
              </div>

              {data.recipient_label && (
                <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                  Compartida con: <strong>{data.recipient_label}</strong>
                </p>
              )}
            </section>

            {/* Reason / clinical context */}
            <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                Motivo de la referencia
              </h2>
              <p className="mt-2 text-sm leading-relaxed">
                {data.referral.reason}
              </p>

              {data.referral.diagnosis && (
                <>
                  <h3 className="mt-4 text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                    Diagnóstico presuntivo
                  </h3>
                  <p className="mt-1 text-sm">{data.referral.diagnosis}</p>
                </>
              )}

              {data.referral.clinical_notes && (
                <>
                  <h3 className="mt-4 text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                    Notas clínicas
                  </h3>
                  <p className="mt-1 whitespace-pre-line text-sm">
                    {data.referral.clinical_notes}
                  </p>
                </>
              )}

              {data.referral.exams_recommended &&
                data.referral.exams_recommended.length > 0 && (
                  <>
                    <h3 className="mt-4 text-xs font-bold uppercase text-[hsl(var(--muted-foreground))]">
                      Exámenes sugeridos
                    </h3>
                    <ul className="mt-1 list-inside list-disc text-sm">
                      {data.referral.exams_recommended.map((e) => (
                        <li key={e}>{e}</li>
                      ))}
                    </ul>
                  </>
                )}
            </section>

            {/* Documents */}
            {data.referral.attached_documents &&
              data.referral.attached_documents.length > 0 && (
                <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                    Documentos adjuntos
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {data.referral.attached_documents.map((doc, idx) => (
                      <li
                        key={`${doc.url}-${idx}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 px-3 py-2"
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          <FileText className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="truncate text-sm font-medium">
                            {doc.name}
                          </span>
                        </span>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="shrink-0 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700"
                        >
                          Abrir
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

            {/* Referring doctor (only if patient consented) */}
            {data.share_referrer_identity && data.referrer && (
              <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
                <h2 className="text-sm font-bold uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  Médico que refiere
                </h2>
                <div className="mt-2 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                    <Stethoscope className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">
                      {data.referrer.full_name ?? "Médico"}
                    </p>
                    {data.referrer.specialty_name && (
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {data.referrer.specialty_name}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Footer note */}
            <section className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
              <Calendar className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Esta referencia fue compartida por el paciente. El acceso es
                temporal y puede ser revocado en cualquier momento. La copia
                completa y el control de privacidad permanecen en su cuenta de
                Red Salud.
              </p>
            </section>
          </article>
        )}
      </main>
    </div>
  );
}
