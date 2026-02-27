/**
 * @file specialty-module-card.tsx
 * @description Tarjeta de módulo para el dashboard de especialidad.
 *
 * Renderiza un módulo individual del SpecialtyConfig como una tarjeta
 * navegable con icono, nombre, grupo y acceso directo al módulo.
 */

"use client";

import Link from "next/link";
import { Card, CardContent } from "@red-salud/design-system";
import { cn } from "@red-salud/core/utils";
import { ArrowRight, Lock } from "lucide-react";
import type { SpecialtyModule } from "@/lib/specialties";
import { DynamicIcon } from "@red-salud/design-system";

// ============================================================================
// TYPES
// ============================================================================

interface SpecialtyModuleCardProps {
  /** The module to display */
  module: SpecialtyModule;
  /** Primary color from specialty theme */
  primaryColor?: string;
  /** Whether the module is disabled (missing permissions, unverified) */
  disabled?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function SpecialtyModuleCard({
  module,
  primaryColor,
  disabled,
}: SpecialtyModuleCardProps) {
  const isLocked = disabled || module.requiresVerification;

  const content = (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        !isLocked && "hover:shadow-md hover:border-primary/30 cursor-pointer",
        isLocked && "opacity-60 cursor-not-allowed"
      )}
    >
      {/* Subtle accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
        style={{ backgroundColor: primaryColor ?? "hsl(var(--primary))" }}
      />

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 transition-colors",
              isLocked ? "bg-muted" : "bg-primary/10 group-hover:bg-primary/20"
            )}
            style={
              !isLocked
                ? { backgroundColor: `${primaryColor ?? "hsl(var(--primary))"}15` }
                : undefined
            }
          >
            {isLocked ? (
              <Lock className="h-4 w-4 text-muted-foreground" />
            ) : (
              <DynamicIcon
                name={module.icon}
                className="h-4 w-4"
                style={{ color: primaryColor }}
              />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-0.5">
            <h3 className="text-sm font-medium leading-tight truncate">
              {module.label}
            </h3>
            {typeof module.settings?.description === "string" && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {module.settings.description}
              </p>
            )}
          </div>

          {/* Arrow */}
          {!isLocked && (
            <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLocked || !module.route) {
    return content;
  }

  return (
    <Link href={module.route} className="block">
      {content}
    </Link>
  );
}
