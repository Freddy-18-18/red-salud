"use client";

import { useState, useRef, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "user" | "bot" | "agent";
  timestamp: Date;
  status?: "sending" | "sent" | "delivered" | "read";
}

const quickReplies = [
  "¿Cómo agendo una cita?",
  "Tengo problemas con mi cuenta",
  "¿Cómo funciona la telemedicina?",
  "Necesito hablar con un agente",
];

const botResponses: Record<string, string> = {
  default: "¡Hola! Soy el asistente virtual de Red-Salud. ¿En qué puedo ayudarte hoy?",
  cita: "Para agendar una cita, ve a tu dashboard y selecciona 'Nueva cita'. Podrás elegir especialidad, médico, fecha y hora. ¿Necesitas más ayuda con esto?",
  cuenta: "Entiendo que tienes problemas con tu cuenta. ¿Podrías describir el problema? Por ejemplo: no puedes iniciar sesión, olvidaste tu contraseña, o necesitas actualizar tus datos.",
  telemedicina: "La telemedicina te permite tener consultas por videollamada. Solo necesitas un dispositivo con cámara, micrófono y conexión a internet. 15 minutos antes de tu cita recibirás el enlace para conectarte.",
  agente: "Entiendo, te conectaré con un agente humano. Por favor espera un momento mientras verifico la disponibilidad...",
  gracias: "¡De nada! ¿Hay algo más en lo que pueda ayudarte?",
};

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("cita") || lowerMessage.includes("agend")) {
    return botResponses.cita;
  }
  if (lowerMessage.includes("cuenta") || lowerMessage.includes("problema") || lowerMessage.includes("sesión")) {
    return botResponses.cuenta;
  }
  if (lowerMessage.includes("telemedicina") || lowerMessage.includes("video") || lowerMessage.includes("virtual")) {
    return botResponses.telemedicina;
  }
  if (lowerMessage.includes("agente") || lowerMessage.includes("humano") || lowerMessage.includes("persona")) {
    return botResponses.agente;
  }
  if (lowerMessage.includes("gracias") || lowerMessage.includes("thanks")) {
    return botResponses.gracias;
  }
  
  return "Gracias por tu mensaje. Para ayudarte mejor, ¿podrías darme más detalles sobre tu consulta? También puedes seleccionar una de las opciones rápidas o pedir hablar con un agente.";
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.sender === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn("flex gap-3 max-w-[85%]", isUser ? "ml-auto flex-row-reverse" : "")}
    >
      <Avatar className="w-8 h-8 shrink-0">
        {isUser ? (
          <>
            <AvatarFallback className="bg-teal-500 text-white text-xs">TÚ</AvatarFallback>
          </>
        ) : message.sender === "bot" ? (
          <>
            <AvatarFallback className="bg-gradient-to-br from-teal-500 to-blue-500 text-white">
              <Bot className="w-4 h-4" />
            </AvatarFallback>
          </>
        ) : (
          <>
            <AvatarImage src="/images/support-agent.jpg" />
            <AvatarFallback className="bg-blue-500 text-white text-xs">AG</AvatarFallback>
          </>
        )}
      </Avatar>
      
      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm",
            isUser
              ? "bg-teal-500 text-white rounded-br-md"
              : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white rounded-bl-md"
          )}
        >
          {message.content}
        </div>
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
      </div>
    </motion.div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: botResponses.default,
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");

    // Simular envío
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "delivered" } : m))
      );
    }, 500);

    // Simular respuesta del bot
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
    setIsTyping(false);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: getBotResponse(content),
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);

    // Marcar como leído
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) => (m.id === userMessage.id ? { ...m, status: "read" } : m))
      );
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
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
                  Soporte Red-Salud
                </h1>
                <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                  En línea
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="text-zinc-500">
              <Phone className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-500">
              <Video className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-zinc-500">
              <MoreVertical className="w-5 h-5" />
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
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
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
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}

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
                className="px-4 py-2 rounded-full text-sm whitespace-nowrap bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-teal-100 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-400 transition-colors"
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
            <Button type="button" variant="ghost" size="icon" className="text-zinc-500 shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="pr-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-0"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-zinc-500 h-8 w-8"
              >
                <Smile className="w-5 h-5" />
              </Button>
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim()}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-full shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}