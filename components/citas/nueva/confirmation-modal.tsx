"use client";

import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  Video,
  MapPin,
  DollarSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AppointmentFormValues } from "@/lib/validations/appointment";

interface AppointmentConfirmationModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
  formData: Partial<AppointmentFormValues>;
  selectedPatientName?: string;
}

const tipoCitaConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  presencial: {
    label: "Presencial",
    color: "bg-blue-100 text-blue-800",
    icon: <MapPin className="h-4 w-4" />,
  },
  telemedicina: {
    label: "Telemedicina",
    color: "bg-green-100 text-green-800",
    icon: <Video className="h-4 w-4" />,
  },
  urgencia: {
    label: "Urgencia",
    color: "bg-red-100 text-red-800",
    icon: <AlertCircle className="h-4 w-4" />,
  },
  seguimiento: {
    label: "Seguimiento",
    color: "bg-purple-100 text-purple-800",
    icon: <Calendar className="h-4 w-4" />,
  },
  primera_vez: {
    label: "Primera Vez",
    color: "bg-amber-100 text-amber-800",
    icon: <User className="h-4 w-4" />,
  },
};

export function AppointmentConfirmationModal({
  open,
  onConfirm,
  onCancel,
  isLoading,
  formData,
  selectedPatientName = "—",
}: AppointmentConfirmationModalProps) {
  const tipoCita = formData.tipo_cita as string;
  const config = tipoCitaConfig[tipoCita] || tipoCitaConfig.presencial;

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Confirmar Cita</DialogTitle>
          <DialogDescription>
            Verifica los datos antes de crear la cita
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Tipo de cita */}
          <div>
            <Badge className={config.color}>
              {config.icon}
              <span className="ml-2">{config.label}</span>
            </Badge>
          </div>

          {/* Datos principales */}
          <div className="space-y-3">
            {/* Paciente */}
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Paciente</p>
                <p className="text-sm font-medium text-gray-900">{selectedPatientName}</p>
              </div>
            </div>

            {/* Fecha */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Fecha</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.fecha
                    ? format(parseISO(formData.fecha), "EEEE, d 'de' MMMM 'de' yyyy", {
                        locale: es,
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {/* Hora y duración */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">Horario</p>
                <p className="text-sm font-medium text-gray-900">
                  {formData.hora} ({formData.duracion_minutos} min)
                </p>
              </div>
            </div>

            {/* Motivo */}
            {formData.motivo && (
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Motivo</p>
                  <p className="text-sm text-gray-900">{formData.motivo}</p>
                </div>
              </div>
            )}

            {/* Precio */}
            {formData.precio && (
              <div className="flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-medium">Precio</p>
                  <p className="text-sm font-medium text-gray-900">${formData.precio}</p>
                </div>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="border-t pt-4" />

          {/* Notas internas si existen */}
          {formData.notas_internas && (
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
              <p className="text-xs text-gray-600 font-medium mb-1">Notas internas:</p>
              <p className="text-xs text-gray-700">{formData.notas_internas}</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="w-full"
          >
            Editar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Creando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
