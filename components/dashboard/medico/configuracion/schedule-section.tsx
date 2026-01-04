"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface TimeSlot {
  inicio: string;
  fin: string;
}

interface DaySchedule {
  activo: boolean;
  horarios: TimeSlot[];
}

interface Schedule {
  [key: string]: DaySchedule;
}

const DIAS_SEMANA = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

export function ScheduleSection() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState<Schedule>({});
  const [duracionCita, setDuracionCita] = useState(30);

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("doctor_schedules")
        .select("*")
        .eq("doctor_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setSchedule(data.horarios || getDefaultSchedule());
        setDuracionCita(data.duracion_cita_minutos || 30);
      } else {
        setSchedule(getDefaultSchedule());
      }
    } catch (error) {
      console.error("Error loading schedule:", error);
      alert("Error al cargar horarios");
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSchedule = (): Schedule => {
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
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("doctor_schedules")
        .upsert({
          doctor_id: user.id,
          horarios: schedule,
          duracion_cita_minutos: duracionCita,
        });

      if (error) throw error;

      alert("Horarios actualizados correctamente");
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Error al guardar horarios");
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (dia: string) => {
    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        activo: !schedule[dia]?.activo,
      },
    });
  };

  const addTimeSlot = (dia: string) => {
    const currentSlots = schedule[dia]?.horarios || [];
    setSchedule({
      ...schedule,
      [dia]: {
        ...schedule[dia],
        activo: true,
        horarios: [...currentSlots, { inicio: "09:00", fin: "13:00" }],
      },
    });
  };

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

  return (
    <div className="space-y-6">
      {/* Duración de Cita */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-semibold">Duración de Cita</Label>
            <p className="text-sm text-gray-600 mt-1">
              Tiempo predeterminado para cada cita
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={duracionCita}
              onChange={(e) => setDuracionCita(Number(e.target.value))}
              className="px-4 py-2 border rounded-lg bg-white"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={45}>45 minutos</option>
              <option value={60}>60 minutos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Horarios por Día */}
      <div className="space-y-4">
        {DIAS_SEMANA.map((dia) => {
          const daySchedule = schedule[dia.key] || { activo: false, horarios: [] };
          
          return (
            <div key={dia.key} className="border rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Switch
                    checked={daySchedule.activo}
                    onCheckedChange={() => toggleDay(dia.key)}
                  />
                  <Label className="text-base font-semibold">{dia.label}</Label>
                  {!daySchedule.activo && (
                    <Badge variant="secondary">No disponible</Badge>
                  )}
                </div>
                {daySchedule.activo && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTimeSlot(dia.key)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Horario
                  </Button>
                )}
              </div>

              {daySchedule.activo && (
                <div className="space-y-2 ml-11">
                  {daySchedule.horarios.map((slot, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <input
                        type="time"
                        value={slot.inicio}
                        onChange={(e) => updateTimeSlot(dia.key, index, "inicio", e.target.value)}
                        className="px-3 py-1.5 border rounded-md"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={slot.fin}
                        onChange={(e) => updateTimeSlot(dia.key, index, "fin", e.target.value)}
                        className="px-3 py-1.5 border rounded-md"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTimeSlot(dia.key, index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {daySchedule.horarios.length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No hay horarios configurados para este día
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Horarios
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
