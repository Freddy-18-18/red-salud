"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Stethoscope, User } from "lucide-react";

import {
  useReferralMessages,
  useSendReferralMessage,
} from "@/hooks/use-referral-messages";

interface ChatPanelProps {
  referralId: string;
  patientUserId: string;
  referrerName: string | null;
}

export function ChatPanel({
  referralId,
  patientUserId,
  referrerName,
}: ChatPanelProps) {
  const messagesQ = useReferralMessages(referralId);
  const sendMut = useSendReferralMessage(referralId);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messagesQ.data?.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setError(null);
    try {
      await sendMut.mutateAsync(text);
      setDraft("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo enviar.");
    }
  };

  const messages = messagesQ.data ?? [];

  return (
    <div className="flex flex-col">
      <div className="rounded-t-xl border border-b-0 border-[hsl(var(--border))] bg-emerald-50/40 px-3 py-2 text-[11px] text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200">
        Hilo privado entre vos y{" "}
        <strong>{referrerName ? `Dr. ${referrerName}` : "tu médico"}</strong>.
        Sólo ustedes dos pueden ver los mensajes.
      </div>

      <div
        ref={scrollerRef}
        className="h-72 overflow-y-auto scrollbar-hide border border-[hsl(var(--border))] bg-[hsl(var(--background))]/40 p-3"
      >
        {messagesQ.isLoading ? (
          <p className="text-center text-xs text-[hsl(var(--muted-foreground))]">
            Cargando mensajes…
          </p>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-xs text-[hsl(var(--muted-foreground))]">
              Todavía no hay mensajes.
            </p>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))]">
              Podés escribirle a tu médico para preguntarle algo sobre la
              referencia.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {messages.map((m) => {
              const mine = m.sender_id === patientUserId;
              return (
                <li
                  key={m.id}
                  className={`flex items-end gap-2 ${
                    mine ? "flex-row-reverse" : ""
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                      mine
                        ? "bg-emerald-600 text-white"
                        : "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300"
                    }`}
                  >
                    {mine ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Stethoscope className="h-3.5 w-3.5" />
                    )}
                  </span>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? "rounded-br-sm bg-emerald-600 text-white"
                        : "rounded-bl-sm border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{m.body}</p>
                    <p
                      className={`mt-0.5 text-[10px] ${
                        mine
                          ? "text-emerald-50/80"
                          : "text-[hsl(var(--muted-foreground))]"
                      }`}
                    >
                      {formatTime(m.created_at)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 rounded-b-xl border border-t-0 border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={2000}
          placeholder="Escribí un mensaje…"
          className="min-w-0 flex-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={sendMut.isPending || !draft.trim()}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
          Enviar
        </button>
      </form>

      {error && (
        <p className="mt-1 text-[11px] text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}
