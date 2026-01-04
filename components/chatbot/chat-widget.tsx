"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow, type ChatContext, type ChatPersona } from "./chat-window";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatWidgetProps {
    persona?: ChatPersona;
    context?: ChatContext;
    suggestedQuestions?: string[];
    hideTrigger?: boolean;
}

export function ChatWidget({ persona, context, suggestedQuestions, hideTrigger = false }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleToggle = () => setIsOpen(prev => !prev);
        document.addEventListener('toggle-chat', handleToggle);
        return () => document.removeEventListener('toggle-chat', handleToggle);
    }, []);

    return (
        <>
            {!hideTrigger && (
                <div className="fixed bottom-20 right-4 z-[60]">
                    <AnimatePresence mode="wait">
                        {!isOpen && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Button
                                    data-tour="chat-trigger"
                                    onClick={() => setIsOpen(true)}
                                    size="lg"
                                    className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl bg-primary text-primary-foreground transition-all duration-300 hover:scale-110"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                    <span className="sr-only">Abrir chat</span>
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}

            <ChatWindow
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                persona={persona}
                context={context}
                suggestedQuestionsOverride={suggestedQuestions}
            />
        </>
    );
}
