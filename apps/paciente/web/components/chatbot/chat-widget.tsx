"use client";
import { type ChatContext, type ChatPersona } from "./chat-window";

export interface ChatWidgetProps {
    persona?: ChatPersona;
    context?: ChatContext;
    suggestedQuestions?: string[];
    hideTrigger?: boolean;
}

export function ChatWidget(_: ChatWidgetProps) {
    return null;
}
