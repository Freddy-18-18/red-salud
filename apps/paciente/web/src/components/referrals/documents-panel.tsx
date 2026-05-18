"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, FileText, Loader2, Save, Upload } from "lucide-react";

import {
  useAttachReferralDocuments,
  usePatientDocuments,
  useUploadPatientDocument,
} from "@/hooks/use-patient-documents";
import type { AttachedDocument } from "@/lib/services/medical-referral-service";

interface DocumentsPanelProps {
  referralId: string;
  /** Documents already attached to this referral. */
  initialAttached: AttachedDocument[] | null;
}

export function DocumentsPanel({
  referralId,
  initialAttached,
}: DocumentsPanelProps) {
  const docsQ = usePatientDocuments();
  const attachMut = useAttachReferralDocuments(referralId);
  const uploadMut = useUploadPatientDocument();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Pre-select docs already attached to this referral. We match by id when
  // available, falling back to URL — old rows in attached_documents may not
  // have the id.
  const initialSelectedIds = useMemo(() => {
    const ids = new Set<string>();
    for (const a of initialAttached ?? []) {
      if (a.id) ids.add(a.id);
    }
    return ids;
  }, [initialAttached]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(initialSelectedIds);
  const [savedFlash, setSavedFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // If patient documents load AFTER initial render, reconcile by URL too.
  useEffect(() => {
    if (!docsQ.data || initialAttached?.length === 0) return;
    const byUrl = new Map<string, string>();
    for (const d of docsQ.data) byUrl.set(d.file_url, d.id);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      for (const a of initialAttached ?? []) {
        const id = a.id ?? byUrl.get(a.url);
        if (id) next.add(id);
      }
      return next;
    });
  }, [docsQ.data, initialAttached]);

  const toggle = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    setError(null);
    try {
      await attachMut.mutateAsync(Array.from(selectedIds));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar.");
    }
  };

  const handleFile = async (file: File) => {
    setUploadError(null);
    try {
      const created = await uploadMut.mutateAsync(file);
      // Auto-select the just-uploaded document so saving attaches it.
      setSelectedIds((prev) => new Set([...prev, created.id]));
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "No se pudo subir.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const docs = docsQ.data ?? [];

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-[11px] text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-200">
        Adjuntá tus exámenes o documentos a esta referencia. Al agendar,
        viajan al especialista junto al contexto clínico — sin que tengas que
        subirlos otra vez.
      </div>

      <div className="flex items-center justify-between gap-3 rounded-xl border border-dashed border-[hsl(var(--border))] p-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-[hsl(var(--foreground))]">
            Subir documento nuevo
          </p>
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            PDF, JPG, PNG o WebP — hasta 10 MB.
          </p>
          {uploadError && (
            <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
              {uploadError}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadMut.isPending}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          {uploadMut.isPending ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Subiendo…
            </>
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Subir
            </>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {docsQ.isLoading ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
          Cargando tus documentos…
        </div>
      ) : docs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[hsl(var(--border))] py-8 text-center">
          <Upload className="mx-auto h-8 w-8 text-[hsl(var(--muted-foreground))] opacity-50" />
          <p className="mt-2 text-sm font-medium text-[hsl(var(--foreground))]">
            Todavía no subiste documentos
          </p>
          <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
            Subilos desde tu Historial médico y volvé acá para adjuntarlos.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => {
            const selected = selectedIds.has(d.id);
            return (
              <li key={d.id}>
                <button
                  type="button"
                  onClick={() => toggle(d.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${
                    selected
                      ? "border-emerald-500 bg-emerald-50 dark:border-emerald-400 dark:bg-emerald-950/30"
                      : "border-[hsl(var(--border))] bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))]"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      selected
                        ? "bg-emerald-600 text-white"
                        : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                    }`}
                  >
                    <FileText className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[hsl(var(--foreground))]">
                      {d.document_name}
                    </p>
                    <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
                      {prettySize(d.file_size)} · {d.document_type}
                    </p>
                  </div>
                  {selected && (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {docs.length > 0 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
            {selectedIds.size}{" "}
            {selectedIds.size === 1 ? "seleccionado" : "seleccionados"}
          </p>
          <button
            type="button"
            onClick={handleSave}
            disabled={attachMut.isPending}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
          >
            {savedFlash ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                Guardar selección
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}

function prettySize(bytes: number | null): string {
  if (!bytes) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}
