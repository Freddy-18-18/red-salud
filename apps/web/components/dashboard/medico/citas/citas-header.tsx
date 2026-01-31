/**
 * @file citas-header.tsx
 * @description Header minimalista para la página de citas
 * @module Dashboard/Medico/Citas
 */

"use client";

import { Button } from "@red-salud/ui";
import { MessageCircle, HelpCircle, Calendar } from "lucide-react";
import { SessionTimer } from "@/components/auth";
import { cn } from "@red-salud/core/utils";

interface CitasHeaderProps {
  className?: string;
}

export function CitasHeader({ className }: CitasHeaderProps) {
  return (
    <div className={cn("flex-shrink-0 px-6 py-4 border-b border-border bg-card shadow-sm", className)}>
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border dark:border-gray-800">
            <Calendar className="h-5 w-5 text-gray-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">
                Agenda
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                En vivo
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Gestiona tus citas y disponibilidad
            </p>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-border" />
          <div className="flex items-center gap-2">
            <SessionTimer showWarning={true} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-primary"
              onClick={() => document.dispatchEvent(new Event("toggle-chat"))}
              title="Abrir Chatbot"
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-secondary"
              onClick={() => document.dispatchEvent(new Event("start-tour"))}
              title="Iniciar Tour"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
