"use client";

import { AlertTriangle, Bot } from "lucide-react";

import { AIChatPanel } from "@/components/ai/ai-chat-panel";
import { useAIAssistant } from "@/hooks/use-ai-assistant";

export default function AsistenteIAPage() {
  const { messages, loading, error, sendMessage, clearChat, suggestedQuestions } =
    useAIAssistant();

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] max-w-3xl mx-auto px-4 py-6 gap-4">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Asistente de Salud IA
            </h1>
            <p className="text-sm text-gray-500">
              Tu asistente médico virtual disponible 24/7
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="shrink-0 flex items-start gap-2.5 p-3 bg-amber-50 border border-amber-200 rounded-xl">
        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-semibold">Importante:</span> Este asistente
          proporciona información general de salud y{" "}
          <span className="font-semibold">
            NO reemplaza una consulta médica profesional
          </span>
          . Ante cualquier emergencia, acude a un centro de salud o llama al
          servicio de ambulancias.
        </p>
      </div>

      {/* Chat panel — takes remaining height */}
      <div className="flex-1 min-h-0">
        <AIChatPanel
          messages={messages}
          loading={loading}
          error={error}
          suggestedQuestions={suggestedQuestions}
          onSendMessage={sendMessage}
          onClearChat={clearChat}
        />
      </div>
    </div>
  );
}
