/**
 * @file page.tsx
 * @description Página de chat de soporte público con asistente AI
 * @module soporte/chat
 * 
 * Esta página proporciona un chat integrado con el sistema RAG real
 * usando streaming de respuestas y sistema de feedback.
 */

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  Bot,
  User,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  ArrowLeft,
  CheckCheck,
  Clock,
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

/** Mensaje de chat con metadata */
interface Message {
  id: string;
  content: string;
  role: "user" | "model";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
  feedback?: "positive" | "negative" | null;
}

/** Respuestas rápidas contextuales */
const quickReplies = [
  "¿Cuáles son los precios?",
  "¿Cómo agendo una cita?",
  "¿Cómo funciona la telemedicina?",
  "¿Es gratis para pacientes?",
];

/** Genera un ID único para mensajes */
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/** Storage keys */
const STORAGE_KEY = "red-salud-support-chat-history";
const SESSION_KEY = "red-salud-support-session";

/** Obtiene o crea un ID de sesión */
function getSessionId(): string {
  if (typeof window === "undefined") return generateId();
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = generateId();
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

/** Carga historial desde localStorage */
function loadHistory(): Message[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Reconvertir timestamps a Date
      return parsed.map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp),
      }));
    }
  } catch (e) {
    console.error("Error loading chat history:", e);
  }
  return [];
}

/** Guarda historial en localStorage */
function saveHistory(messages: Message[]): void {
  if (typeof window === "undefined") return;
  try {
    const toSave = messages.slice(-50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Error saving chat history:", e);
  }
}

/** Componente de burbuja de mensaje */
function MessageBubble({
  message,
  isLoading,
  onFeedback,
}: {
  message: Message;
  isLoading?: boolean;
  onFeedback?: (type: "positive" | "negative") => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "")}
    >
      {/* Avatar */}
      <Avatar className="w-8 h-8 shrink-0">
        {isUser ? (
          <AvatarFallback className="bg-teal-500 text-white text-xs">TÚ</AvatarFallback>
        ) : (
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
            <Bot className="w-4 h-4" />
          </AvatarFallback>
        )}
      </Avatar>

      {/* Contenido del mensaje */}
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm",
            isUser
              ? "bg-teal-500 text-white rounded-br-md"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
          )}
        >
          {/* Estado de carga para mensajes del bot vacíos */}
          {!isUser && message.content === "" ? (
            <span className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Buscando información...
            </span>
          ) : !isUser ? (
            // Renderizar Markdown para respuestas del bot
            <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      className="text-teal-600 dark:text-teal-400 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp y estado */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span>
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {isUser && message.status && (
            <span>
              {message.status === "read" ? (
                <CheckCheck className="w-3.5 h-3.5 text-teal-500" />
              ) : message.status === "delivered" ? (
                <CheckCheck className="w-3.5 h-3.5" />
              ) : message.status === "sending" ? (
                <Clock className="w-3.5 h-3.5" />
              ) : null}
            </span>
          )}
        </div>

        {/* Botones de feedback para respuestas del bot */}
        {!isUser && message.content && !isLoading && onFeedback && (
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={() => onFeedback("positive")}
              disabled={message.feedback !== undefined}
              className={cn(
                "p-1 rounded-md transition-colors",
                message.feedback === "positive"
                  ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                  : message.feedback === "negative"
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
              )}
              title="Respuesta útil"
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onFeedback("negative")}
              disabled={message.feedback !== undefined}
              className={cn(
                "p-1 rounded-md transition-colors",
                message.feedback === "negative"
                  ? "text-red-600 bg-red-100 dark:bg-red-900/30"
                  : message.feedback === "positive"
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
              )}
              title="Respuesta no útil"
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/** Indicador de escritura animado */
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3"
    >
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
          <Bot className="w-4 h-4" />
        </AvatarFallback>
      </Avatar>
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-zinc-100 dark:bg-zinc-800">
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Página principal de chat de soporte
 * Integrada con el sistema RAG real usando streaming
 */
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mensaje de bienvenida inicial
  const welcomeMessage: Message = {
    id: "welcome",
    content:
      "¡Hola! 👋 Soy el asistente virtual de **Red Salud**. Puedo ayudarte con información sobre:\n\n- 💰 Planes y precios\n- 🏥 Especialidades médicas\n- 📅 Cómo agendar citas\n- 💻 Telemedicina\n- ❓ Y mucho más\n\n¿En qué puedo ayudarte hoy?",
    role: "model",
    timestamp: new Date(),
  };

  // Cargar historial al montar
  useEffect(() => {
    const history = loadHistory();
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([welcomeMessage]);
    }
  }, []);

  // Guardar historial cuando cambia
  useEffect(() => {
    if (messages.length > 0 && messages[0].id !== "welcome") {
      saveHistory(messages);
    }
  }, [messages]);

  // Scroll al final cuando hay nuevos mensajes
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus en input al cargar
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Envía feedback sobre una respuesta al servidor
   */
  const sendFeedback = async (message: Message, isPositive: boolean) => {
    try {
      const messageIndex = messages.findIndex((m) => m.id === message.id);
      const userMessage = messages[messageIndex - 1];

      await fetch("/api/chat/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageContent: userMessage?.content || "",
          responseContent: message.content,
          isPositive,
          sessionId: getSessionId(),
          pageUrl: "/soporte/chat",
        }),
      });
    } catch (error) {
      console.error("Error sending feedback:", error);
    }
  };

  /**
   * Maneja el feedback de un mensaje
   */
  const handleFeedback = (messageId: string, type: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, feedback: type } : msg))
    );

    const message = messages.find((m) => m.id === messageId);
    if (message) {
      sendFeedback(message, type === "positive");
    }
  };

  /**
   * Envía un mensaje al chatbot usando el API real con streaming
   */
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    // Crear mensaje del usuario
    const userMessage: Message = {
      id: generateId(),
      content: content.trim(),
      role: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simular envío
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    try {
      // Llamar al API real con streaming
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: content.trim() }],
          context: { page: "/soporte/chat" },
        }),
      });

      if (!response.ok) throw new Error("Error en la respuesta del chat");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar el stream");

      // Crear mensaje del bot vacío para streaming
      const botMessageId = generateId();
      setMessages((prev) => [
        ...prev,
        {
          id: botMessageId,
          content: "",
          role: "model",
          timestamp: new Date(),
        },
      ]);

      const decoder = new TextDecoder();
      let done = false;
      let accumulatedText = "";

      // Leer stream de respuesta
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: !done });
        accumulatedText += chunkValue;

        // Actualizar contenido del mensaje progresivamente
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "model") {
            lastMessage.content = accumulatedText;
          }
          return newMessages;
        });
      }

      // Marcar mensaje del usuario como leído
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" } : m))
        );
      }, 1000);
    } catch (error) {
      console.error("Error sending message:", error);
      // Agregar mensaje de error
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          content:
            "Lo siento, tuve un problema al procesar tu mensaje. Por favor intenta de nuevo o [contacta a soporte](/soporte) si el problema persiste.",
          role: "model",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja envío del formulario
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  /**
   * Limpia el historial de chat
   */
  const clearHistory = () => {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([welcomeMessage]);
  };

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/soporte">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
                    <Bot className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-zinc-900" />
              </div>
              <div>
                <h1 className="font-semibold text-zinc-900 dark:text-white">
                  Asistente Red Salud
                </h1>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  En línea • Respuestas con IA
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-500"
              onClick={clearHistory}
              title="Limpiar historial"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-500" disabled>
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-500" disabled>
              <Video className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          {/* Info banner */}
          <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 text-teal-700 dark:text-teal-400 text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Asistente virtual con IA • Disponible 24/7</span>
            </div>
          </div>

          {/* Messages list */}
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLoading={isLoading && message.content === ""}
                onFeedback={
                  message.role === "model"
                    ? (type) => handleFeedback(message.id, type)
                    : undefined
                }
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator - solo mostrar cuando está cargando y no hay mensaje vacío del bot */}
          {isLoading && messages[messages.length - 1]?.content !== "" && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick replies */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                disabled={isLoading}
                className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 shrink-0" disabled>
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="pr-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-0"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 h-8 w-8"
                disabled
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || isLoading}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2">
            Respuestas generadas por IA. Verifica información importante.
          </p>
        </form>
      </div>
    </div>
  );
}