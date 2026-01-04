"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { es } from "date-fns/locale";

interface TimeSlot { time: string; available: boolean }

interface Props {
  selectedDate?: Date;
  onDateSelect: (d?: Date) => void;
  timeSlots: TimeSlot[];
  timeSlotsLoading: boolean;
  selectedTime: string;
  onTimeSelect: (t: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function DateTimePicker({ selectedDate, onDateSelect, timeSlots, timeSlotsLoading, selectedTime, onTimeSelect, onBack, onContinue }: Props) {
  const availableTimeSlots = timeSlots.filter((s) => s.available);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecciona Fecha y Hora</CardTitle>
        <CardDescription>Elige cuándo quieres tu consulta</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2 block">Fecha</Label>
            <Calendar mode="single" selected={selectedDate} onSelect={onDateSelect} locale={es} disabled={(date) => date < new Date()} className="rounded-md border" />
          </div>
          <div>
            <Label className="mb-2 block">Hora Disponible</Label>
            {selectedDate ? (
              timeSlotsLoading ? (
                <p className="text-sm text-muted-foreground">Cargando horarios...</p>
              ) : availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {availableTimeSlots.map((slot) => (
                    <button key={slot.time} onClick={() => onTimeSelect(slot.time)} className={`p-2 border rounded text-sm ${selectedTime === slot.time ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/50"}`}>{slot.time.slice(0, 5)}</button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay horarios disponibles para esta fecha</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Selecciona una fecha primero</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} className="flex-1">Atrás</Button>
          <Button onClick={onContinue} disabled={!selectedDate || !selectedTime} className="flex-1">Continuar</Button>
        </div>
      </CardContent>
    </Card>
  );
}

