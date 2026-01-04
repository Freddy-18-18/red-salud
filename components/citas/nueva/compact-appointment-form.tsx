"use client";

import { useEffect, useMemo } from "react";
import { Clock, MapPin, Video, AlertCircle, User, ChevronDown } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { format } from "date-fns";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@radix-ui/react-collapsible";
import { AutocompleteTextarea } from "@/components/ui/autocomplete-textarea";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { AppointmentFormValues } from "@/lib/validations/appointment";
import { ConflictChecker } from "./conflict-checker";

interface Patient {
  id: string;
  nombre_completo: string;
  email: string | null;
  cedula: string | null;
  type: "registered" | "offline";
}

interface ConflictingAppointmentData {
  id: string;
  fecha_hora: string;
  duracion_minutos: number;
  motivo: string;
}

interface CompactAppointmentFormProps {
  getMinDate: () => string;
  getMinTime: (fecha: string) => string;
  isTimeValid: (fecha: string, hora: string) => boolean;
  motivoSuggestions: string[];
  patients: Patient[];
  checkingConflict: boolean;
  conflictingAppointments: ConflictingAppointmentData[];
  error: string | null;
  onConflictCheck: (fecha: string, hora: string, duracion: number) => Promise<void>;
  advancedMode: boolean;
  isInitialLoad?: boolean;
}

const tiposCita = [
  {
    value: "presencial",
    label: "Presencial",
    icon: <MapPin className="h-4 w-4" />,
    color: "text-blue-600",
  },
  {
    value: "telemedicina",
    label: "Telemedicina",
    icon: <Video className="h-4 w-4" />,
    color: "text-green-600",
  },
  {
    value: "urgencia",
    label: "Urgencia",
    icon: <AlertCircle className="h-4 w-4" />,
    color: "text-red-600",
  },
  {
    value: "seguimiento",
    label: "Seguimiento",
    icon: <Clock className="h-4 w-4" />,
    color: "text-purple-600",
  },
  {
    value: "primera_vez",
    label: "Primera Vez",
    icon: <User className="h-4 w-4" />,
    color: "text-amber-600",
  },
];

export function CompactAppointmentForm({
  getMinDate,
  getMinTime,
  isTimeValid,
  motivoSuggestions,
  patients,
  checkingConflict,
  conflictingAppointments,
  error,
  onConflictCheck,
  advancedMode = false,
  isInitialLoad = false,
}: CompactAppointmentFormProps) {
  const { register, control, watch, formState: { errors } } = useFormContext<AppointmentFormValues>();
  const fecha = watch("fecha");
  const hora = watch("hora");
  const duracion = watch("duracion_minutos");
  const tipoCita = watch("tipo_cita");
  const pacienteId = watch("paciente_id");
  const enviarRecordatorio = watch("enviar_recordatorio");

  // Detectar cambios en fecha/hora/duración para verificar conflictos
  useEffect(() => {
    if (fecha && hora && duracion) {
      onConflictCheck(fecha, hora, duracion);
    }
  }, [fecha, hora, duracion, onConflictCheck]);

  const selectedPatient = useMemo(
    () => patients.find((p) => p.id === pacienteId),
    [pacienteId, patients]
  );

  const isOfflinePatient = selectedPatient?.type === "offline";

  return (
    <div className="space-y-5">
      {/* Verificador de conflictos */}
      <ConflictChecker
        checkingConflict={checkingConflict && !isInitialLoad}
        conflictingAppointments={conflictingAppointments}
        error={error}
      />

      {/* SECCIONES 1 & 2: Layout en 2 Columnas (Paciente + Programación) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECCIÓN 1: Paciente */}
        <div
          className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
          data-tour="paciente-select"
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <Label className="text-sm font-semibold">Paciente</Label>
          </div>

          <FormField
            control={control}
            name="paciente_id"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="h-10 bg-gray-50">
                      <SelectValue placeholder="Selecciona un paciente" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          <div className="flex items-center gap-2">
                            {patient.nombre_completo}
                            {patient.type === "offline" && (
                              <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                {patient.cedula}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* SECCIÓN 2: Programación (Fecha y Hora - Compacto) */}
        <div
          className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
          data-tour="programming-section"
        >
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <Label className="text-sm font-semibold">Programación</Label>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Fecha */}
            <div className="space-y-1">
              <Label htmlFor="fecha" className="text-xs text-gray-600">
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                min={getMinDate()}
                className="h-9 text-sm"
                {...register("fecha")}
              />
              {errors.fecha && <p className="text-xs text-red-600">{errors.fecha.message}</p>}
            </div>

            {/* Hora */}
            <div className="space-y-1">
              <Label htmlFor="hora" className="text-xs text-gray-600">
                Hora
              </Label>
              <Input
                id="hora"
                type="time"
                min={getMinTime(fecha)}
                className="h-9 text-sm"
                {...register("hora")}
              />
              {errors.hora && <p className="text-xs text-red-600">{errors.hora.message}</p>}
              {!errors.hora && !isTimeValid(fecha, hora) && (
                <p className="text-xs text-red-600">Hora pasada</p>
              )}
            </div>

            {/* Duración */}
            <div className="space-y-1">
              <Label htmlFor="duracion" className="text-xs text-gray-600">
                Duración
              </Label>
              <FormField
                control={control}
                name="duracion_minutos"
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => field.onChange(Number(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="h-9 text-sm bg-gray-50">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15">15 min</SelectItem>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">1h</SelectItem>
                      <SelectItem value="90">1.5h</SelectItem>
                      <SelectItem value="120">2h</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {fecha === format(new Date(), "yyyy-MM-dd") && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Mínimo hoy: {getMinTime(fecha)}
            </p>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: Tipo de Cita y Motivo */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
        data-tour="cita-details"
      >
        <Label className="text-sm font-semibold">Detalles</Label>

        {/* Tipo de Cita */}
        <div className="space-y-1">
          <Label htmlFor="tipo_cita" className="text-xs text-gray-600">
            Tipo de Cita
          </Label>
          <FormField
            control={control}
            name="tipo_cita"
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="h-9 text-sm bg-gray-50">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tiposCita.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      <div className="flex items-center gap-2">
                        <span className={tipo.color}>{tipo.icon}</span>
                        {tipo.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Advertencia Telemedicina */}
        {tipoCita === "telemedicina" && isOfflinePatient && (
          <p className="text-xs text-amber-600 flex items-center gap-1 bg-amber-50 p-2 rounded">
            <AlertCircle className="h-3 w-3" />
            Pacientes offline no pueden usar telemedicina
          </p>
        )}

        {/* Motivo de Consulta */}
        <div className="space-y-1">
          <Label htmlFor="motivo" className="text-xs text-gray-600">
            Motivo de Consulta
          </Label>
          <FormField
            control={control}
            name="motivo"
            render={({ field }) => (
              <AutocompleteTextarea
                id="motivo"
                placeholder="Dolor, fiebre, control..."
                value={field.value || ""}
                onChange={field.onChange}
                suggestions={motivoSuggestions}
                rows={2}
                className="text-sm"
              />
            )}
          />
          {errors.motivo && <p className="text-xs text-red-600">{errors.motivo.message}</p>}
        </div>
      </div>

      {/* SECCIÓN 4: Precio y Pago */}
      <div
        className="bg-white rounded-lg border border-gray-200 p-4 space-y-3"
        data-tour="price-section"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="precio" className="text-xs text-gray-600">
              Precio
            </Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="h-9 text-sm"
              {...register("precio")}
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="metodo_pago" className="text-xs text-gray-600">
              Método
            </Label>
            <FormField
              control={control}
              name="metodo_pago"
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-9 text-sm bg-gray-50">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                    <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
                    <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                    <SelectItem value="pago_movil">📱 Pago Móvil</SelectItem>
                    <SelectItem value="seguro">🏥 Seguro</SelectItem>
                    <SelectItem value="pendiente">⏳ Pendiente</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 5: Opciones Adicionales */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enviar_recordatorio"
            className="h-4 w-4 rounded border-gray-300"
            {...register("enviar_recordatorio")}
          />
          <Label htmlFor="enviar_recordatorio" className="text-sm font-medium cursor-pointer">
            Recordatorios inteligentes
          </Label>
        </div>

        {enviarRecordatorio && (
          <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 p-2 rounded">
            📱 Recordatorio 24h + notificación turno
          </div>
        )}

        {/* Notas Internas */}
        <div className="space-y-1">
          <Label htmlFor="notas_internas" className="text-xs text-gray-600">
            Notas Internas
          </Label>
          <Textarea
            id="notas_internas"
            placeholder="Solo visible para ti"
            rows={2}
            className="resize-none text-sm"
            {...register("notas_internas")}
          />
        </div>
      </div>

      {/* SECCIÓN 6: Modo Avanzado */}
      {advancedMode && (
        <Collapsible className="bg-white rounded-lg border border-gray-200">
          <CollapsibleTrigger className="w-full flex items-center justify-between p-4 hover:bg-gray-50">
            <span className="text-sm font-semibold">Información Clínica Avanzada</span>
            <ChevronDown className="h-4 w-4 text-gray-500" />
          </CollapsibleTrigger>
          <CollapsibleContent className="px-4 pb-4 space-y-3 border-t">
            <div className="space-y-1">
              <Label htmlFor="diagnostico" className="text-xs text-gray-600">
                Diagnóstico Preliminar
              </Label>
              <Textarea
                id="diagnostico"
                placeholder="Hipótesis diagnóstica..."
                rows={2}
                className="resize-none text-sm"
                {...register("diagnostico_preliminar")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="antecedentes" className="text-xs text-gray-600">
                Antecedentes Relevantes
              </Label>
              <Textarea
                id="antecedentes"
                placeholder="Alergias, cirugías, condiciones crónicas..."
                rows={2}
                className="resize-none text-sm"
                {...register("antecedentes_relevantes")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="medicamentos" className="text-xs text-gray-600">
                Medicamentos Actuales
              </Label>
              <Textarea
                id="medicamentos"
                placeholder="Medicinas que toma el paciente..."
                rows={2}
                className="resize-none text-sm"
                {...register("medicamentos_actuales")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="alergias" className="text-xs text-gray-600">
                Alergias
              </Label>
              <Input
                id="alergias"
                placeholder="Medicamentos, alimentos, otros..."
                className="h-9 text-sm"
                {...register("alergias")}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="notas_clinicas" className="text-xs text-gray-600">
                Notas Clínicas
              </Label>
              <Textarea
                id="notas_clinicas"
                placeholder="Observaciones clínicas..."
                rows={2}
                className="resize-none text-sm"
                {...register("notas_clinicas")}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
}
