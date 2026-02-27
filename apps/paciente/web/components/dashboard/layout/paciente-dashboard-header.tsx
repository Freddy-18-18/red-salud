/**
 * @file paciente-dashboard-header.tsx
 * @description Header para el dashboard del paciente
 * @module Dashboard/Layout
 */

"use client";

import {
  CircleHelp,
  MessageCircle,
  Heart,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { ThemeToggle } from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import type { PacienteConfigNav } from "@/hooks/dashboard/use-paciente-config-nav";

export interface PacienteProfile {
  nombre_completo?: string;
  edad?: number;
}

export interface PacienteDashboardHeaderProps {
  patientProfile?: PacienteProfile | null;
  onChatClick?: () => void;
  onHelpClick?: () => void;
  /** Tabs de configuración — solo se pasan cuando se está en páginas de config */
  configNav?: PacienteConfigNav | null;
  className?: string;
}

export function PacienteDashboardHeader({
  patientProfile,
  onChatClick,
  onHelpClick,
  configNav,
  className,
}: PacienteDashboardHeaderProps) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  const getPatientName = () => {
    if (patientProfile?.nombre_completo) {
      const nameParts = patientProfile.nombre_completo.split(" ");
      return `${nameParts[0]} ${nameParts[1] || ""}`.trim();
    }
    return "Paciente";
  };

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    day: "numeric",
    month: "long",
  };
  const formattedDate = today.toLocaleDateString("es-ES", dateOptions);

  return (
    <header
      className={cn(
        "flex h-12 items-center flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "sticky top-0 z-50",
        className
      )}
    >
      <div className="flex items-center justify-between h-full pr-3 flex-1 overflow-x-auto overflow-y-visible gap-x-4 pl-4">
        {/* Left Section - Greeting and Info */}
        <div className="flex items-center text-sm gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground whitespace-nowrap">
              {getGreeting()}, {getPatientName()}
            </span>

            <span className="text-muted-foreground whitespace-nowrap capitalize">
              {formattedDate}
            </span>

            <span className="text-muted-foreground">•</span>

            <span className="inline-flex items-center gap-1 text-rose-500 whitespace-nowrap">
              <Heart className="h-3 w-3" />
              Tu Salud
            </span>
          </div>
        </div>

        {/* Center Section - Config tabs (only on config pages) */}
        <div className="flex-1 flex justify-center min-w-0">
          {configNav && (
            <nav className="flex items-center gap-1">
              {configNav.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => configNav.onNavigate(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                      item.isActive
                        ? "bg-primary/10 text-primary dark:bg-primary/20"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="flex items-center gap-x-2 flex-shrink-0">
          {/* Chat Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onChatClick}
            className={cn(
              "relative cursor-pointer text-center font-regular ease-out duration-200",
              "outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1",
              "border text-foreground bg-transparent border-strong hover:border-foreground-muted",
              "focus-visible:outline-border-strong rounded-full w-[32px] h-[32px]",
              "flex items-center justify-center p-0 group pointer-events-auto"
            )}
            title="Chat con Asistente"
          >
            <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>

          {/* Help Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onHelpClick}
            className={cn(
              "relative cursor-pointer text-center font-regular ease-out duration-200",
              "outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1",
              "border text-foreground bg-transparent border-strong hover:border-foreground-muted",
              "focus-visible:outline-border-strong rounded-full w-[32px] h-[32px]",
              "flex items-center justify-center p-0 group pointer-events-auto"
            )}
            title="Ayuda"
          >
            <CircleHelp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle className="w-[32px] h-[32px] border-strong bg-transparent hover:border-foreground-muted" />
        </div>
      </div>
    </header>
  );
}
