"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { Send, X, Bot, User, Loader2, ThumbsUp, ThumbsDown, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { suggestedQuestions, pageSuggestions } from "@/lib/data/knowledge-base";
import { useTranslation } from "@/lib/hooks/use-translation";
import { TranslationKey } from "@/lib/i18n/translations";

interface Message {
    id: string;
    role: "user" | "model";
    content: string;
    feedback?: "positive" | "negative" | null;
}

type ChatPersona = "default" | "doctor";

export type { ChatPersona, ChatContext };

interface ChatContext {
    role?: string;
    page?: string;
    userId?: string;
    specialty?: string;
}

interface ChatWindowProps {
    isOpen: boolean;
    onClose: () => void;
    persona?: ChatPersona;
    context?: ChatContext;
    suggestedQuestionsOverride?: string[];
}

const STORAGE_KEY = "red-salud-chat-history";
const SESSION_KEY = "red-salud-chat-session";

const doctorSuggestedQuestions = [
    "¿Qué pacientes tengo hoy y cuál es la prioridad?",
    "Resume las alertas o conflictos de agenda de esta semana",
    "Guíame por el tour del calendario y los atajos",
    "¿Cómo envío un recordatorio rápido al paciente?",
];

function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

function getSessionId(): string {
    if (typeof window === "undefined") return generateId();

    let sessionId = sessionStorage.getItem(SESSION_KEY);
    if (!sessionId) {
        sessionId = generateId();
        sessionStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
}

function loadHistory(): Message[] {
    if (typeof window === "undefined") return [];

    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
    } catch (e) {
        console.error("Error loading chat history:", e);
    }
    return [];
}

function saveHistory(messages: Message[]): void {
    if (typeof window === "undefined") return;

    try {
        // Keep only last 50 messages
        const toSave = messages.slice(-50);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
        console.error("Error saving chat history:", e);
    }
}

function getWelcomeMessage(persona: ChatPersona, context: ChatContext | undefined, t: (key: TranslationKey) => string): string {
    if (persona === "doctor") {
        return t("welcome_doctor");
    }

    // Contextual welcome message
    if (context?.page?.includes("/precios")) {
        return t("welcome_pricing");
    }
    if (context?.page?.includes("/servicios")) {
        return t("welcome_services");
    }

    return t("welcome_default");
}

export function ChatWindow({ isOpen, onClose, persona = "default", context, suggestedQuestionsOverride }: ChatWindowProps) {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const pathname = usePathname();
    const effectivePage = context?.page || pathname;

    // Determine dynamic suggestions based on page
    const getDynamicSuggestions = () => {
        if (suggestedQuestionsOverride) return suggestedQuestionsOverride;
        if (persona === "doctor") return doctorSuggestedQuestions;

        // Find matching page suggestions (longest match wins)
        if (effectivePage) {
            const keys = Object.keys(pageSuggestions);
            const matchingKey = keys
                .filter(key => effectivePage.startsWith(key))
                .sort((a, b) => b.length - a.length)[0]; // Sort by length desc

            if (matchingKey) return pageSuggestions[matchingKey];
        }

        return suggestedQuestions;
    };

    const effectiveSuggestions = getDynamicSuggestions();

    const effectiveContext: ChatContext = {
        ...context,
        page: effectivePage,
        role: context?.role || (persona === "doctor" ? "medico" : context?.role),
    };
    
    // Welcome message is now derived inside effect to use 't'
    
    // Load history on mount
    useEffect(() => {
        const history = loadHistory();
        if (history.length > 0) {
            setMessages(history);
            setShowSuggestions(false);
        } else {
            // Initial welcome message
            const welcomeMessage = getWelcomeMessage(persona, effectiveContext, t);
            setMessages([
                {
                    id: generateId(),
                    role: "model",
                    content: welcomeMessage,
                },
            ]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Save history when messages change
    useEffect(() => {
        if (messages.length > 0) {
            saveHistory(messages);
        }
    }, [messages]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const sendFeedback = async (message: Message, isPositive: boolean) => {
        try {
            // Find the user message that triggered this response
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
                    pageUrl: pathname,
                }),
            });
        } catch (error) {
            console.error("Error sending feedback:", error);
        }
    };

    const handleFeedback = (messageId: string, type: "positive" | "negative") => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === messageId ? { ...msg, feedback: type } : msg
            )
        );

        const message = messages.find((m) => m.id === messageId);
        if (message) {
            sendFeedback(message, type === "positive");
        }
    };

    const handleSuggestionClick = (question: string) => {
        setInput(question);
        setShowSuggestions(false);
        // Auto submit
        setTimeout(() => {
            handleSubmit(new Event("submit") as any, question);
        }, 100);
    };

    const handleSubmit = async (e: React.FormEvent, overrideInput?: string) => {
        e.preventDefault();
        const messageText = overrideInput || input.trim();
        if (!messageText || isLoading) return;

        const userMessage: Message = { id: generateId(), role: "user", content: messageText };
        setInput("");
        setShowSuggestions(false);
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, { role: "user", content: messageText }],
                    context: effectiveContext,
                }),
            });

            if (!response.ok) throw new Error("Error en la respuesta del chat");

            const reader = response.body?.getReader();
            if (!reader) throw new Error("No se pudo iniciar el stream");

            const modelMessageId = generateId();
            setMessages((prev) => [...prev, { id: modelMessageId, role: "model", content: "" }]);

            const decoder = new TextDecoder();
            let done = false;
            let accumulatedText = "";

            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                const chunkValue = decoder.decode(value, { stream: !done });
                accumulatedText += chunkValue;

                setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastMessage = newMessages[newMessages.length - 1];
                    if (lastMessage.role === "model") {
                        lastMessage.content = accumulatedText;
                    }
                    return newMessages;
                });
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages((prev) => [
                ...prev,
                {
                    id: generateId(),
                    role: "model",
                    content: t("error_message"),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const clearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setMessages([
            {
                id: generateId(),
                role: "model",
                content: getWelcomeMessage(persona, effectiveContext, t),
            },
        ]);
        setShowSuggestions(true);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="fixed bottom-20 right-4 z-50 w-[380px] md:w-[420px] h-[550px] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden"
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-primary/80 p-4 flex justify-between items-center text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Bot className="h-5 w-5" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-sm">{t("header_title")}</h3>
                                <p className="text-xs text-primary-foreground/80 flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" /> {t("header_subtitle")}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearHistory}
                                className="text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 text-xs h-7 px-2"
                            >
                                {t("clear_history")}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8"
                                aria-label={t("close_chat")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 bg-muted/20">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={cn(
                                        "flex gap-2 max-w-[90%]",
                                        message.role === "user" ? "ml-auto flex-row-reverse" : ""
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                            message.role === "user"
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-gradient-to-br from-primary/20 to-secondary/20 border"
                                        )}
                                    >
                                        {message.role === "user" ? (
                                            <User className="h-4 w-4" />
                                        ) : (
                                            <Bot className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <div
                                            className={cn(
                                                "p-3 rounded-2xl text-sm",
                                                message.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                                                    : "bg-background border shadow-sm rounded-tl-sm"
                                            )}
                                        >
                                            {message.role === "model" && message.content === "" ? (
                                        <span className="flex items-center gap-2 text-muted-foreground">
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            {t("searching")}
                                        </span>
                                    ) : message.role === "model" ? (
                                                <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                                                    <ReactMarkdown
                                                        components={{
                                                            a: ({ href, children }) => (
                                                                <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
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

                                        {/* Feedback buttons for bot messages */}
                                        {message.role === "model" && message.content && !isLoading && (
                                            <div className="flex items-center gap-1 ml-1">
                                                <button
                                                    onClick={() => handleFeedback(message.id, "positive")}
                                                    disabled={message.feedback !== undefined}
                                                    className={cn(
                                                        "p-1 rounded-md transition-colors",
                                                        message.feedback === "positive"
                                                            ? "text-green-600 bg-green-100 dark:bg-green-900/30"
                                                            : message.feedback === "negative"
                                                                ? "text-muted-foreground/30 cursor-not-allowed"
                                                                : "text-muted-foreground hover:text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30"
                                                    )}
                                                    title={t("feedback_positive")}
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleFeedback(message.id, "negative")}
                                                    disabled={message.feedback !== undefined}
                                                    className={cn(
                                                        "p-1 rounded-md transition-colors",
                                                        message.feedback === "negative"
                                                            ? "text-red-600 bg-red-100 dark:bg-red-900/30"
                                                            : message.feedback === "positive"
                                                                ? "text-muted-foreground/30 cursor-not-allowed"
                                                                : "text-muted-foreground hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
                                                    )}
                                                    title={t("feedback_negative")}
                                                >
                                                    <ThumbsDown className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={scrollRef} />
                        </div>

                        {/* Suggested questions */}
                        {showSuggestions && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 space-y-2"
                            >
                                <p className="text-xs text-muted-foreground font-medium">{t("suggestions_label")}</p>
                                <div className="flex flex-wrap gap-2">
                                    {effectiveSuggestions.slice(0, 4).map((question, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleSuggestionClick(question)}
                                            className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 bg-background border-t">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder={t("input_placeholder")}
                                className="flex-1 focus-visible:ring-1 rounded-full px-4"
                                disabled={isLoading}
                                aria-label={t("input_placeholder")}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="rounded-full shrink-0"
                                aria-label={t("send_message")}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </Button>
                        </form>
                        <p className="text-[10px] text-muted-foreground text-center mt-2">
                            {t("disclaimer")}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
