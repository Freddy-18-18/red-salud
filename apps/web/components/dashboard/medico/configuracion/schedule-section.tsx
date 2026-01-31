/**
 * @file schedule-section.tsx
 * @description Sección de configuración de horarios del médico con diseño minimalista y compacto.
 * Incluye selector de consultorio, etiquetas mañana/tarde, y selectores profesionales de tiempo.
 * @module Dashboard/Medico/Configuracion
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@red-salud/ui";
import { Label } from "@red-salud/ui";
import { Switch } from "@red-salud/ui";
import { Badge } from "@red-salud/ui";
import { TimePicker } from "@red-salud/ui";
import {
  Clock,
  Save,
  Loader2,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sunrise,
  Sunset,
  MapPin
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Toast } from "@red-salud/ui";

/** Interfaz para un bloque de horario */
interface TimeSlot {
  inicio: string;
  fin: string;
}

/** Interfaz para el horario de un día específico */
interface DaySchedule {
  activo: boolean;
  horarios: TimeSlot[];
}

/** Interfaz para todos los horarios */
interface Schedule {
  [key: string]: DaySchedule;
}

/** Interfaz para un consultorio */
interface Office {
  id: string;
  nombre: string;
  direccion?: string;
  ciudad?: string;
  es_principal: boolean;
  activo: boolean;
}

/** Configuración de días de la semana */
const DIAS_SEMANA = [
  { key: "lunes", label: "Lun", fullLabel: "Lunes" },
  { key: "martes", label: "Mar", fullLabel: "Martes" },
  { key: "miercoles", label: "Mié", fullLabel: "Miércoles" },
  { key: "jueves", label: "Jue", fullLabel: "Jueves" },
  { key: "viernes", label: "Vie", fullLabel: "Viernes" },
  { key: "sabado", label: "Sáb", fullLabel: "Sábado" },
  { key: "domingo", label: "Dom", fullLabel: "Domingo" },
];

/** Duraciones de consulta disponibles */
const DURACIONES = [
  { value: 15, label: "15 min", icon: "⚡" },
  { value: 30, label: "30 min", icon: "⏱️" },
  { value: 45, label: "45 min", icon: "🕐" },
  { value: 60, label: "1 hora", icon: "⌛" },
];

/**
 * Determina si un horario es de mañana o tarde
 */
const getTimeLabel = (inicio: string): "morning" | "afternoon" => {
  const hour = parseInt(inicio.split(':')[0]);
  return hour < 14 ? "morning" : "afternoon";
};

/**
 * Componente principal de configuración de horarios
 */
export function ScheduleSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offices, setOffices] = useState<Office[]>([]);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [duracionCita, setDuracionCita] = useState(30);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  // Estado para Toast
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" as "success" | "error" | "info" });

  useEffect(() => {
    loadOfficesAndSchedules();
  }, [loadOfficesAndSchedules]);

  /**
   * Retorna el horario predeterminado (lunes a viernes activos)
   */
  const getDefaultSchedule = useCallback((): Schedule => {
    const defaultSchedule: Schedule = {};
    DIAS_SEMANA.forEach(dia => {
      defaultSchedule[dia.key] = {
        activo: dia.key !== "sabado" && dia.key !== "domingo",
        horarios: dia.key !== "sabado" && dia.key !== "domingo"
          ? [{ inicio: "09:00", fin: "13:00" }, { inicio: "15:00", fin: "19:00" }]
          : [],
      };
    });
    return defaultSchedule;
  }, []);

  /**
   * Carga el horario para un consultorio específico
   */
  const loadScheduleForOffice = useCallback(async (officeId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", user.id)
        .eq("office_id", officeId)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSchedule(data.horarios || getDefaultSchedule());
        setDuracionCita(data.duracion_cita_minutos || 30);
      } else {
        setSchedule(getDefaultSchedule());
        setDuracionCita(30);
      }
    } catch (error) {
      console.error("[ScheduleSection] Error loading schedule:", error);
    }
  }, [getDefaultSchedule]);

  /**
   * Crea un consultorio por defecto
   */
  const createDefaultOffice = useCallback(async (doctorId: string) => {
    try {
      const { data, error } = await supabase
        .from("doctor_offices")
        .insert({
          doctor_id: doctorId,
          nombre: "Consultorio Principal",
          es_principal: true,
          activo: true,
        })
        .select()
        .single();

      if (error) throw error;

      setOffices([data]);
      setSelectedOfficeId(data.id);
      setSchedule(getDefaultSchedule());
    } catch (error) {
      console.error("[ScheduleSection] Error creating default office:", error);
    }
  }, [getDefaultSchedule]);

  /**
   * Carga los consultorios y horarios del médico
   */
  const loadOfficesAndSchedules = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Cargar consultorios
      const { data: officesData, error: officesError } = await supabase
        .from("doctor_offices")
        .select("*")
        .eq("doctor_id", user.id)
        .eq("activo", true)
        .order("es_principal", { ascending: false });

      if (officesError) throw officesError;

      setOffices(officesData || []);

      // Seleccionar el primer consultorio (principal si existe)
      if (officesData && officesData.length > 0) {
        setSelectedOfficeId(officesData[0].id);
        await loadScheduleForOffice(officesData[0].id);
      } else {
        // No hay consultorios, crear uno por defecto
        await createDefaultOffice(user.id);
      }
    } catch (error) {
      console.error("[ScheduleSection] Error loading data:", error);
      showToast("Error al cargar datos. Por favor, recarga la página.", "error");
    } finally {
      setLoading(false);
    }
  }, [loadScheduleForOffice, createDefaultOffice]);

  /**
   * Cambia el consultorio seleccionado
   */
  const handleOfficeChange = async (officeId: string) => {
    setSelectedOfficeId(officeId);
    await loadScheduleForOffice(officeId);
    setExpandedDay(null);
  };

  /**
   * Guarda los horarios en la base de datos
   */
  const handleSave = async () => {
    if (!selectedOfficeId) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("doctor_schedules")
        .upsert({
          doctor_id: user.id,
          office_id: selectedOfficeId,
          horarios: schedule,
          duracion_cita_minutos: duracionCita,
        });

      if (error) throw error;

      showToast("Horarios actualizados correctamente", "success");
    } catch (error) {
      console.error("[ScheduleSection] Error saving schedule:", error);
      showToast("Error al guardar horarios. Intenta nuevamente.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * Muestra un toast con el mensaje especificado
   */
  const showToast = (message: string, type: "success" | "error" | "info") => {
    setToast({ visible: true, message, type });
  };

  /**
   * Alterna el estado activo/inactivo de un día
   */
  const toggleDay = (dia: string) => {
    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        activo: !schedule[dia]?.activo,
      },
    });
  };

  /**
   * Añade un bloque de horario (mañana o tarde)
   */
  const addTimeSlot = (dia: string, type: "morning" | "afternoon") => {
    const currentSlots = schedule[dia]?.horarios || [];
    const newSlot = type === "morning"
      ? { inicio: "09:00", fin: "13:00" }
      : { inicio: "15:00", fin: "19:00" };

    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        activo: true,
        horarios: [...currentSlots, newSlot],
      },
    });
  };

  /**
   * Elimina un bloque de horario de un día
   */
  const removeTimeSlot = (dia: string, index: number) => {
    const currentSlots = schedule[dia]?.horarios || [];
    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        horarios: currentSlots.filter((_, i) => i !== index),
      },
    });
  };

  /**
   * Actualiza un campo específico de un bloque de horario
   */
  const updateTimeSlot = (dia: string, index: number, field: "inicio" | "fin", value: string) => {
    const currentSlots = [...(schedule[dia]?.horarios || [])];
    currentSlots[index] = { ...currentSlots[index], [field]: value };
    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        horarios: currentSlots,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedOffice = offices.find(o => o.id === selectedOfficeId);

  return (
    <div className="space-y-6">
      {/* Toast Component */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      {/* Compact Header with Office Selector and Duration */}
      <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Horarios de Atención
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Configura los días y horarios en los que recibirás pacientes
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Office Selector */}
          {offices.length > 0 && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              <select
                value={selectedOfficeId || ""}
                onChange={(e) => handleOfficeChange(e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                {offices.map((office) => (
                  <option key={office.id} value={office.id}>
                    {office.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Duration Selector - Visual Radio Buttons */}
      <div className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-800">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
          Duración por Consulta
        </Label>
        <div className="grid grid-cols-4 gap-2">
          {DURACIONES.map((dur) => (
            <button
              key={dur.value}
              type="button"
              onClick={() => setDuracionCita(dur.value)}
              className={`
                px-3 py-2 rounded-lg border-2 transition-all text-sm font-medium
                ${duracionCita === dur.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }
              `}
            >
              <div className="text-lg mb-0.5">{dur.icon}</div>
              {dur.label}
            </button>
          ))}
        </div>
      </div>

      {/* Days Grid - 7 columns */}
      <div className="grid grid-cols-7 gap-2">
        {DIAS_SEMANA.map((dia, index) => {
          const daySchedule = schedule[dia.key] || { activo: false, horarios: [] };
          const isExpanded = expandedDay === dia.key;

          // Separar horarios de mañana y tarde
          const morningSlots = daySchedule.horarios.filter(slot => getTimeLabel(slot.inicio) === "morning");
          const afternoonSlots = daySchedule.horarios.filter(slot => getTimeLabel(slot.inicio) === "afternoon");

          return (
            <div
              key={dia.key}
              className={`
                border rounded-lg overflow-hidden transition-all
                ${daySchedule.activo
                  ? 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10'
                  : 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30'
                }
              `}
            >
              {/* Day Header */}
              <div className="p-3 text-center border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-center mb-2">
                  <Switch
                    checked={daySchedule.activo}
                    onCheckedChange={() => toggleDay(dia.key)}
                    className="scale-75"
                  />
                </div>
                <div className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                  {dia.label}
                </div>
                {daySchedule.activo && (
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
                    {daySchedule.horarios.length} horario{daySchedule.horarios.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>

              {/* Summary / Edit Button */}
              {daySchedule.activo && (
                <div className="p-2">
                  {daySchedule.horarios.length > 0 ? (
                    <div className="space-y-1">
                      {morningSlots.length > 0 && (
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                          <Sunrise className="h-2.5 w-2.5" />
                          {morningSlots[0].inicio}-{morningSlots[0].fin}
                        </div>
                      )}
                      {afternoonSlots.length > 0 && (
                        <div className="text-[10px] text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
                          <Sunset className="h-2.5 w-2.5" />
                          {afternoonSlots[0].inicio}-{afternoonSlots[0].fin}
                        </div>
                      )}
                      {daySchedule.horarios.length > 2 && (
                        <div className="text-[10px] text-gray-400 text-center">
                          +{daySchedule.horarios.length - 2}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-400 text-center italic">
                      Sin horarios
                    </div>
                  )}
                  <button
                    onClick={() => setExpandedDay(isExpanded ? null : dia.key)}
                    className="w-full mt-2 px-2 py-1 text-[10px] text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded flex items-center justify-center gap-1 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {isExpanded ? 'Cerrar' : 'Editar'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Expanded Day Editor */}
      <AnimatePresence>
        {expandedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-blue-200 dark:border-blue-800 rounded-lg p-4 bg-blue-50/50 dark:bg-blue-900/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {DIAS_SEMANA.find(d => d.key === expandedDay)?.fullLabel}
                </h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(expandedDay, "morning")}
                    className="text-xs gap-1 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Sunrise className="h-3 w-3" />
                    Mañana
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(expandedDay, "afternoon")}
                    className="text-xs gap-1 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    <Sunset className="h-3 w-3" />
                    Tarde
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {schedule[expandedDay]?.horarios.length === 0 ? (
                  <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3">
                    No hay horarios. Haz clic en "Mañana" o "Tarde" para añadir.
                  </p>
                ) : (
                  schedule[expandedDay]?.horarios.map((slot, index) => {
                    const timeLabel = getTimeLabel(slot.inicio);
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        {timeLabel === "morning" ? (
                          <Sunrise className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        ) : (
                          <Sunset className="h-4 w-4 text-orange-500 flex-shrink-0" />
                        )}
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                          {timeLabel === "morning" ? "Mañana" : "Tarde"}
                        </Badge>
                        <TimePicker
                          value={slot.inicio}
                          onChange={(value) => updateTimeSlot(expandedDay, index, "inicio", value)}
                          className="flex-1"
                        />
                        <span className="text-xs text-gray-400">a</span>
                        <TimePicker
                          value={slot.fin}
                          onChange={(value) => updateTimeSlot(expandedDay, index, "fin", value)}
                          className="flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(expandedDay, index)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
        <Button
          onClick={handleSave}
          disabled={saving || !selectedOfficeId}
          className="gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Guardar Horarios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
