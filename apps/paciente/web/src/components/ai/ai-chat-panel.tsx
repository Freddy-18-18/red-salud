"use client";

import { AlertCircle, RotateCcw, Send, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import type { Message } from "@/lib/services/ai-assistant-service";

import { ChatBubble, TypingIndicator } from "./chat-bubble";
import { SuggestionChips } from "./suggestion-chips";

// --- Types ---

interface AIChatPanelProps {
  messages: Message[];
  loading: boolean;
  error: string | null;
  suggestedQuestions: string[];
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
}

// --- Component ---

export function AIChatPanel({
  messages,
  loading,
  error,
  suggestedQuestions,
  onSendMessage,
  onClearChat,
}: AIChatPanelProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Get the latest suggestions from the last assistant message, or defaults
  const latestAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const currentSuggestions =
    latestAssistantMsg?.suggestions ?? (messages.length === 0 ? suggestedQuestions : []);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSendMessage(trimmed);
    setInput("");
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  }

  function handleSuggestionSelect(suggestion: string) {
    if (loading) return;
    onSendMessage(suggestion);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter to send (Shift+Enter for newline)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }

  function handleInputChange(value: string) {
    setInput(value);
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header bar */}
      {hasMessages && (
        <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100">
          <button
            type="button"
            onClick={onClearChat}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors duration-150"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpiar chat
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {!hasMessages && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4 py-8">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              ¿En qué puedo ayudarte?
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mb-6">
              Pregúntame sobre síntomas, medicamentos, resultados de laboratorio,
              o cualquier duda de salud general.
            </p>

            {/* Initial suggestions */}
            <div className="w-full max-w-lg">
              <SuggestionChips
                suggestions={suggestedQuestions}
                onSelect={handleSuggestionSelect}
                disabled={loading}
              />
            </div>
          </div>
        )}

        {/* Message list */}
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}

        {/* Typing indicator */}
        {loading && <TypingIndicator />}

        {/* Error message */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 animate-in fade-in duration-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
              <button
                type="button"
                onClick={() => {
                  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
                  if (lastUserMsg) onSendMessage(lastUserMsg.content);
                }}
                className="flex items-center gap-1 mt-1.5 text-xs text-red-600 hover:text-red-800 font-medium transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Contextual suggestions (after messages) */}
      {hasMessages && currentSuggestions.length > 0 && !loading && (
        <div className="px-4 py-2 border-t border-gray-50">
          <SuggestionChips
            suggestions={currentSuggestions}
            onSelect={handleSuggestionSelect}
            disabled={loading}
          />
        </div>
      )}

      {/* Input area */}
      <form
        onSubmit={handleSubmit}
        className="border-t border-gray-100 px-4 py-3 bg-gray-50/50"
      >
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta de salud..."
            rows={1}
            maxLength={2000}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-300 disabled:opacity-50 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="shrink-0 flex items-center justify-center h-10 w-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-150 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-1.5 text-center">
          Presiona Enter para enviar, Shift+Enter para nueva línea
        </p>
      </form>
    </div>
  );
}
