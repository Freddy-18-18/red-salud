/**
 * @file dashboard-mega-menu.tsx
 * @description Componente genérico de mega menú para el dashboard del médico.
 * Soporta navegación con hover en desktop y dropdown en mobile.
 * @module Dashboard/Layout
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@red-salud/core/utils";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@red-salud/design-system";
import { Button } from "@red-salud/design-system";
import { MegaMenuSection, MegaMenuItem } from "@/components/dashboard/medico/configuracion/configuracion-mega-menu-config";

export interface DashboardMegaMenuProps {
  /** Secciones del menú principal */
  sections: MegaMenuSection[];
  /** ID del item actualmente activo */
  activeItem?: string;
  /** Callback cuando se hace click en un item */
  onItemClick: (itemId: string) => void;
  /** Clases adicionales */
  className?: string;
}

/**
 * Componente que renderiza un item individual del menú
 */
function MenuItem({
  item,
  isActive,
  onClick,
  autoFocus,
}: {
  item: MegaMenuItem;
  isActive: boolean;
  onClick: () => void;
  autoFocus?: boolean;
}) {
  const Icon = item.icon;
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (autoFocus && buttonRef.current) {
      buttonRef.current.focus();
    }
  }, [autoFocus]);

  return (
    <button
      ref={buttonRef}
      onClick={onClick}
      className={cn(
        "group/item flex flex-col items-start gap-1 rounded-md p-3 text-left transition-all w-full",
        "hover:bg-accent hover:text-accent-foreground",
        "focus:bg-accent focus:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        // Hacer el estado activo más prominente
        isActive && "bg-primary/10 border-2 border-primary text-foreground"
      )}
    >
      <div className="flex items-center gap-3 w-full">
        <div
          className={cn(
            "flex-shrink-0 rounded-md p-1.5 transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground group-hover/item:text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium transition-colors",
              isActive ? "text-foreground font-semibold" : "text-muted-foreground group-hover/item:text-foreground"
            )}
          >
            {item.label}
          </p>
          <p className="text-xs text-muted-foreground truncate">{item.description}</p>
        </div>
      </div>
    </button>
  );
}

/**
 * Componente principal del mega menú
 */
export function DashboardMegaMenu({
  sections,
  activeItem,
  onItemClick,
  className,
}: DashboardMegaMenuProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (sectionId: string) => {
    // Limpiar timeout anterior
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Abrir inmediatamente si ya hay un menú abierto, sino esperar un poco
    if (openSection !== null) {
      setOpenSection(sectionId);
    } else {
      hoverTimeoutRef.current = setTimeout(() => {
        setOpenSection(sectionId);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    // Limpiar timeout anterior
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }

    // Dar un pequeño delay antes de cerrar para permitir mover el mouse al contenido
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenSection(null);
    }, 150);
  };

  return (
    <div
      className={cn("flex items-center gap-1", className)}
      onMouseLeave={handleMouseLeave}
    >
      {sections.map((section) => {
        const SectionIcon = section.icon;
        const hasActiveItem = section.items.some((item) => item.id === activeItem);
        const isOpen = openSection === section.id;

        return (
          <Popover
            key={section.id}
            open={isOpen}
            onOpenChange={(open) => {
              // Solo permitir cerrar, no abrir desde onOpenChange
              if (!open) {
                setOpenSection(null);
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "gap-1.5 h-9 px-3",
                  // Marcar como activo solo cuando está abierto
                  isOpen && "bg-accent"
                )}
                onMouseEnter={() => handleMouseEnter(section.id)}
                onClick={() => setOpenSection(isOpen ? null : section.id)}
              >
                <SectionIcon className="h-4 w-4" />
                <span className="font-medium">{section.label}</span>
                <ChevronDown
                  className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[800px] p-2"
              align="center"
              sideOffset={8}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                }
              }}
              onMouseLeave={handleMouseLeave}
              onOpenAutoFocus={(e) => {
                // Prevenir que el Popover de focus automático a cualquier elemento
                // Solo permitir focus si hay un item activo en esta sección
                if (!hasActiveItem) {
                  e.preventDefault();
                }
              }}
            >
              <div className="grid gap-1 grid-cols-4">
                {section.items.map((item) => {
                  const itemIsActive = activeItem === item.id;
                  // Solo dar autoFocus si el item está activo Y la sección está abierta
                  const shouldAutoFocus = itemIsActive && isOpen;

                  return (
                    <MenuItem
                      key={item.id}
                      item={item}
                      isActive={itemIsActive}
                      autoFocus={shouldAutoFocus}
                      onClick={() => {
                        onItemClick(item.id);
                        setOpenSection(null);
                      }}
                    />
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        );
      })}
    </div>
  );
}
