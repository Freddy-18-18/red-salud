"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type {
  PreconsultBrief,
  PreconsultSeverity,
} from "@/lib/services/preconsult/gemini-preconsult";
import { postJson } from "@/lib/utils/fetch";

interface PreconsultDialogProps {
  appointmentId: string;
  onSaved: () => void;
  onClose: () => void;
}

const SEVERITY_LABEL: Record<PreconsultSeverity, string> = {
  leve: "Leve",
  moderada: "Moderada",
  severa: "Severa",
  no_clara: "No definida",
};

const SEVERITY_COLOR: Record<PreconsultSeverity, string> = {
  leve: "bg-emerald-50 text-emerald-700",
  moderada: "bg-amber-50 text-amber-700",
  severa: "bg-red-50 text-red-700",
  no_clara: "bg-gray-100 text-gray-700",
};

type Phase = "chat" | "preview" | "saved";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

interface ChatResponse {
  reply: string;
}

interface FinalizeResponse {
  brief: PreconsultBrief;
  saved: boolean;
}

const INTRO_MESSAGE =
  "Hola. Contame qué te trae a la consulta. Te voy a hacer un par de preguntas para que tu médico llegue mejor preparado.";

const READY_MARKER = "Creo que ya tenemos lo necesario";

export function PreconsultDialog({
  appointmentId,
  onSaved,
  onClose,
}: PreconsultDialogProps) {
  const [phase, setPhase] = useState<Phase>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", text: INTRO_MESSAGE },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [brief, setBrief] = useState<PreconsultBrief | null>(null);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the message list whenever a new message lands.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ESC closes (when not in flight).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !sending && !finalizing) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sending, finalizing, onClose]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setError(null);
    setSending(true);

    // Append the user message immediately for UX, then call the chat endpoint
    // with the *previous* history (excluding the new user message — the
    // server-side helper appends it itself).
    const previous = messages;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");

    try {
      const data = await postJson<ChatResponse>(
        `/api/appointments/${appointmentId}/preconsult/chat`,
        {
          history: previous,
          message: text,
        },
      );
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar el mensaje. Intenta de nuevo.";
      setError(message);
    } finally {
      setSending(false);
    }
  };

  const finalize = async () => {
    setError(null);
    setFinalizing(true);
    try {
      // Build a single symptoms blob from the transcript. The existing
      // structured-output /preconsult endpoint can digest it as if the user
      // had written everything in one go.
      const blob = messages
        .map((m) => `${m.role === "user" ? "Paciente" : "Asistente"}: ${m.text}`)
        .join("\n");

      const data = await postJson<FinalizeResponse>(
        `/api/appointments/${appointmentId}/preconsult`,
        { symptoms: blob, save: true },
      );
      setBrief(data.brief);
      setPhase("saved");
      // Beat to let the success state render before bubbling up.
      setTimeout(() => onSaved(), 1400);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar el resumen. Intenta de nuevo.";
      setError(message);
    } finally {
      setFinalizing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void send();
  };

  // The assistant tells us when the brief is ready by ending a turn with
  // the marker. Until then, we still let the patient finalize manually after
  // a few user turns — useful for short cases.
  const userTurnCount = messages.filter((m) => m.role === "user").length;
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const aiSaysReady = !!lastAssistant?.text.includes(READY_MARKER);
  const canFinalize = userTurnCount >= 1 && (aiSaysReady || userTurnCount >= 2);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preconsult-dialog-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={sending || finalizing ? undefined : onClose}
      />

      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <h3
                id="preconsult-dialog-title"
                className="text-base font-semibold text-gray-900"
              >
                Pre-consulta con IA
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ayudame a armar un resumen para tu médico
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={sending || finalizing}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 px-5 py-4 overflow-y-auto space-y-3">
          {phase === "chat" && (
            <>
              {messages.map((m, i) => (
                <ChatBubble key={i} role={m.role} text={m.text} />
              ))}
              {sending && <ChatBubble role="assistant" text="..." typing />}
              <div ref={messagesEndRef} />
            </>
          )}

          {phase === "saved" && brief && (
            <>
              <div className="flex flex-col items-center justify-center py-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Resumen enviado al médico
                </p>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  Tu doctor lo verá antes de la consulta.
                </p>
              </div>

              {brief.needs_urgent_attention && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800 leading-relaxed">
                    Detectamos señales de alarma en tus síntomas. Si la cita es
                    para mañana o más, considerá ir a urgencias antes.
                  </p>
                </div>
              )}

              <BriefSection
                label="Motivo principal"
                value={brief.chief_complaint || "—"}
              />
              {brief.duration && (
                <BriefSection label="Duración" value={brief.duration} />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-500">
                  Severidad reportada
                </span>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${SEVERITY_COLOR[brief.severity]}`}
                >
                  {SEVERITY_LABEL[brief.severity]}
                </span>
              </div>
              {brief.associated_symptoms.length > 0 && (
                <BriefList
                  label="Síntomas asociados"
                  items={brief.associated_symptoms}
                />
              )}
              {brief.questions_for_doctor.length > 0 && (
                <BriefList
                  label="Preguntas que llevarás al médico"
                  items={brief.questions_for_doctor}
                />
              )}
            </>
          )}

          {error && phase !== "saved" && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700 leading-relaxed">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === "chat" && (
          <div className="border-t border-gray-100 p-3 space-y-2">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
                disabled={sending || finalizing}
                placeholder="Escribí tu respuesta..."
                rows={2}
                maxLength={1500}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || finalizing || !input.trim()}
                className="inline-flex items-center justify-center w-10 h-10 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Enviar"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
            <button
              type="button"
              onClick={() => void finalize()}
              disabled={!canFinalize || finalizing || sending}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed border-violet-200 text-violet-700 hover:bg-violet-50"
            >
              {finalizing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generando resumen final...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generar y enviar al médico
                </>
              )}
            </button>
            {!canFinalize && (
              <p className="text-[10px] text-gray-400 text-center">
                Respondé al menos un par de preguntas para enviar el resumen.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatBubble({
  role,
  text,
  typing,
}: {
  role: "user" | "assistant";
  text: string;
  typing?: boolean;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
          isUser
            ? "bg-violet-500 text-white rounded-br-sm"
            : "bg-gray-100 text-gray-800 rounded-bl-sm"
        }`}
      >
        {typing ? (
          <span className="inline-flex items-center gap-1 text-gray-500">
            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" />
            <span
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <span
              className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </span>
        ) : (
          text
        )}
      </div>
    </div>
  );
}

function BriefSection({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function BriefList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <ul className="text-sm text-gray-900 list-disc list-inside space-y-0.5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
