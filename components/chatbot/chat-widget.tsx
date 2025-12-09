"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatWindow, type ChatContext, type ChatPersona } from "./chat-window";
import { motion, AnimatePresence } from "framer-motion";

export interface ChatWidgetProps {
  persona?: ChatPersona;
  context?: ChatContext;
  suggestedQuestions?: string[];
}

export function ChatWidget({ persona, context, suggestedQuestions }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div className="fixed bottom-4 right-4 z-50">
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
