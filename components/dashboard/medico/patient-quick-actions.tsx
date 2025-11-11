"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  MessageSquare,
  Calendar,
  FileText,
  Pill,
  MoreVertical,
  Phone,
  Video,
  Stethoscope,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface PatientQuickActionsProps {
  patientId: string;
  patientName: string;
  isOffline?: boolean;
}

export function PatientQuickActions({
  patientId,
  patientName,
  isOffline = false,
}: PatientQuickActionsProps) {
  const router = useRouter();

  const handleAction = (action: string) => {
    switch (action) {
      case "view":
        if (isOffline) {
          router.push(`/dashboard/medico/pacientes/offline/${patientId}`);
        } else {
          router.push(`/dashboard/medico/pacientes/${patientId}`);
        }
        break;
      case "message":
        if (!isOffline) {
          router.push(`/dashboard/medico/mensajeria?patient=${patientId}`);
        }
        break;
      case "appointment":
        if (!isOffline) {
          router.push(`/dashboard/medico/citas/nueva?patient=${patientId}`);
        }
        break;
      case "prescription":
        if (!isOffline) {
          router.push(`/dashboard/medico/recetas/nueva?patient=${patientId}`);
        }
        break;
      case "consultation":
        if (!isOffline) {
          router.push(`/dashboard/medico/consultas/nueva?patient=${patientId}`);
        }
        break;
      case "call":
        // Implementar llamada telefónica
        console.log("Iniciar llamada con:", patientName);
        break;
      case "video":
        if (!isOffline) {
          router.push(`/dashboard/medico/videollamada?patient=${patientId}`);
        }
        break;
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Primary Actions */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleAction("view")}
      >
        <Eye className="h-4 w-4 mr-1" />
        Ver
      </Button>

      {!isOffline && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleAction("message")}
        >
          <MessageSquare className="h-4 w-4 mr-1" />
          Mensaje
        </Button>
      )}

      {/* More Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Acciones Rápidas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {!isOffline && (
            <>
              <DropdownMenuItem onClick={() => handleAction("appointment")}>
                <Calendar className="h-4 w-4 mr-2" />
                Agendar Cita
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("prescription")}>
                <Pill className="h-4 w-4 mr-2" />
                Crear Receta
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("consultation")}>
                <Stethoscope className="h-4 w-4 mr-2" />
                Nueva Consulta
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction("video")}>
                <Video className="h-4 w-4 mr-2" />
                Videollamada
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("call")}>
                <Phone className="h-4 w-4 mr-2" />
                Llamar
              </DropdownMenuItem>
            </>
          )}
          
          {isOffline && (
            <DropdownMenuItem onClick={() => handleAction("view")}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalles Completos
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
