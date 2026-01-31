/**
 * @file dashboard-header.tsx
 * @description Header funcional para el dashboard médico
 * @module Dashboard/Layout
 */

"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  CircleHelp,
  MessageCircle,
  Sparkles,
  Building2,
  ChevronDown,
} from "lucide-react";
import { cn } from "@red-salud/core/utils";
import { ThemeToggle } from "@red-salud/ui";
import { Button } from "@red-salud/ui";
import { DashboardMegaMenu } from "./dashboard-mega-menu";
import { ClinicModeToggle } from "./clinic-mode-toggle";
import { MegaMenuSection } from "@/components/dashboard/medico/configuracion/configuracion-mega-menu-config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@red-salud/ui";
import { supabase } from "@/lib/supabase/client";

export interface Office {
  id: string;
  nombre: string;
  direccion?: string;
}

export interface DashboardHeaderProps {
  userName?: string;
  userEmail?: string;
  doctorProfile?: {
    nombre_completo?: string;
    specialty?: { name: string };
    sacs_especialidad?: string;
    is_verified?: boolean;
    sacs_verified?: boolean;
  } | null;
  onTourClick?: () => void;
  onChatClick?: () => void;
  megaMenu?: {
    sections: MegaMenuSection[];
    activeItem?: string;
    onItemClick: (itemId: string) => void;
  };
  className?: string;
}

export function DashboardHeader({
  userName = "Usuario",
  userEmail,
  doctorProfile,
  onTourClick,
  onChatClick,
  megaMenu,
  className,
}: DashboardHeaderProps) {
  const pathname = usePathname();
  const isCitasPage = pathname?.includes("/citas");

  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [showAllOffices, setShowAllOffices] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCitasPage) {
      console.log("📍 Cargando consultorios para página de citas...");
      loadOffices();
    }
  }, [isCitasPage]);

  const loadOffices = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("❌ No hay usuario autenticado");
        setLoading(false);
        return;
      }

      console.log("👤 Usuario ID:", user.id);

      const { data, error } = await supabase
        .from("doctor_offices")
        .select("id, nombre, direccion, ciudad, estado, es_principal")
        .eq("doctor_id", user.id)
        .eq("activo", true)
        .order("es_principal", { ascending: false });

      if (error) {
        console.error("❌ Error cargando consultorios:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        setLoading(false);
        return;
      }

      console.log("🏥 Consultorios encontrados:", data?.length || 0);
      console.log("📋 Datos:", data);

      if (data && data.length > 0) {
        setOffices(data);
        console.log("✅ Consultorios cargados correctamente");
      } else {
        console.log("⚠️ No hay consultorios activos para este médico");
        setOffices([]);
      }
    } catch (error: unknown) {
      console.error("💥 Error inesperado loading offices:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        error: error
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOfficeChange = (office: Office | null) => {
    setSelectedOffice(office);
    setShowAllOffices(office === null);
    // Emitir evento para que el calendario se actualice
    window.dispatchEvent(new CustomEvent("office-changed", {
      detail: { officeId: office?.id || null }
    }));
  };

  // Función para obtener saludo según la hora
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Buenos días";
    if (hour >= 12 && hour < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  // Obtener nombre y apellido del doctor
  const getDocName = () => {
    if (doctorProfile?.nombre_completo) {
      const nameParts = doctorProfile.nombre_completo.split(" ");
      return `Dr. ${nameParts[0]} ${nameParts[1] || ""}`.trim();
    }
    return "Doctor";
  };

  // Get current date info
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
              {getGreeting()}, {getDocName()}
            </span>

            <span className="text-muted-foreground whitespace-nowrap capitalize">
              {formattedDate}
            </span>

            <span className="text-muted-foreground">•</span>

            <span className="text-muted-foreground whitespace-nowrap">
              {doctorProfile?.specialty?.name ||
                doctorProfile?.sacs_especialidad ||
                "Médico"}
            </span>

            {/* Verification Badge */}
            {(doctorProfile?.is_verified || doctorProfile?.sacs_verified) && (
              <>
                <span className="text-muted-foreground">•</span>
                <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 whitespace-nowrap">
                  <Sparkles className="h-3 w-3" />
                  Verificado
                </span>
              </>
            )}
          </div>
        </div>

        {/* Center Section - Office Selector (solo en página de citas) o Mega Menu */}
        {isCitasPage ? (
          <div className="flex-1 flex justify-center min-w-0">
            {loading ? (
              <div className="text-xs text-muted-foreground">Cargando consultorios...</div>
            ) : offices.length > 0 ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2 min-w-[220px]" disabled={pathname?.includes("/citas/nueva")}>
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">
                      {showAllOffices ? "Todos los consultorios" : selectedOffice?.nombre || "Seleccionar"}
                    </span>
                    <ChevronDown className="h-3 w-3 ml-auto" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[280px]">
                  <DropdownMenuLabel>Consultorios</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleOfficeChange(null)}
                    className={cn(
                      "cursor-pointer",
                      showAllOffices && "bg-muted"
                    )}
                  >
                    <Building2 className="h-4 w-4 mr-2" />
                    <div>
                      <div className="font-medium">Todos los consultorios</div>
                      <div className="text-xs text-muted-foreground">Vista unificada</div>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {offices.map((office) => (
                    <DropdownMenuItem
                      key={office.id}
                      onClick={() => handleOfficeChange(office)}
                      className={cn(
                        "cursor-pointer",
                        selectedOffice?.id === office.id && "bg-muted"
                      )}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      <div>
                        <div className="font-medium">{office.nombre}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {office.direccion}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="text-xs text-muted-foreground">
                No hay consultorios configurados
              </div>
            )}
          </div>
        ) : megaMenu ? (
          <div className="flex-1 flex justify-center min-w-0">
            <DashboardMegaMenu
              sections={megaMenu.sections}
              activeItem={megaMenu.activeItem}
              onItemClick={megaMenu.onItemClick}
            />
          </div>
        ) : null}

        {/* Right Section - Actions */}
        <div className="flex items-center gap-x-2 flex-shrink-0">
          {/* Modo Clínico Toggle (Solo en /citas/nueva) */}


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
            title="Chat Asistente"
          >
            <MessageCircle className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Button>

          {/* Tour/Help Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onTourClick}
            className={cn(
              "relative cursor-pointer text-center font-regular ease-out duration-200",
              "outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1",
              "border text-foreground bg-transparent border-strong hover:border-foreground-muted",
              "focus-visible:outline-border-strong rounded-full w-[32px] h-[32px]",
              "flex items-center justify-center p-0 group pointer-events-auto"
            )}
            title="Iniciar Tour"
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
