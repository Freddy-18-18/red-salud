"use client";

import { cn } from "@red-salud/core/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Calendar,
    Button,
} from "@red-salud/design-system";
import { format, getDay } from "date-fns";
import { Clock } from "lucide-react";
import React from "react";
import { useFormContext } from "react-hook-form";

// TODO: Import from shared specialty-reasons-data once available in patient app
// For now, provide basic suggestions inline
const DEFAULT_REASONS = [
    "Consulta general",
    "Control de rutina",
    "Dolor de cabeza",
    "Fiebre",
    "Dolor abdominal",
    "Revisión de resultados",
];

interface TimeRange {
    inicio: string;
    fin: string;
}

interface DaySchedule {
    activo: boolean;
    horarios: TimeRange[];
}

interface Schedule {
    office_id?: string;
    horarios?: {
        [key: string]: DaySchedule;
    };
}

interface AppointmentFormProps {
    motivoSuggestions?: string[];
    schedules?: Schedule[];
    selectedOfficeId?: string | null;
}

export function AppointmentForm({
    motivoSuggestions = DEFAULT_REASONS,
    schedules = [],
    selectedOfficeId,
}: AppointmentFormProps) {
    const form = useFormContext();
    const { watch, setValue } = form;

    const motivo = watch("motivo");
    const currentMotivoValue = motivo || "";

    const handleAddSuggestion = (suggestion: string) => {
        const lastCommaIndex = currentMotivoValue.lastIndexOf(",");
        let newValue = "";
        if (lastCommaIndex === -1) {
            newValue = suggestion;
        } else {
            newValue = currentMotivoValue.substring(0, lastCommaIndex + 1) + " " + suggestion;
        }
        setValue("motivo", newValue + ", ");
    };

    // Helper to check availability
    const getDateStatus = (date: Date) => {
        const dayIndex = getDay(date);
        const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        const dayName = daysMap[dayIndex];

        const availableSchedules = schedules.filter((schedule: Schedule) => {
            const dayConfig = schedule.horarios?.[dayName as keyof typeof schedule.horarios];
            return dayConfig && dayConfig.activo === true;
        });

        if (availableSchedules.length === 0) {
            return { status: 'unavailable', message: 'No hay horario configurado para este día' };
        }

        if (selectedOfficeId) {
            const exactMatch = availableSchedules.find((s: Schedule) => s.office_id === selectedOfficeId);
            const dayConfig = exactMatch?.horarios?.[dayName as keyof typeof exactMatch.horarios];
            if (dayConfig && dayConfig.activo && dayConfig.horarios?.length > 0) {
                return { status: 'available', message: 'Disponible' };
            }
        }

        const validFallback = availableSchedules.find((s: Schedule) => (s.horarios?.[dayName as keyof typeof s.horarios]?.horarios?.length ?? 0) > 0);
        if (validFallback) {
            return { status: 'available', message: 'Disponible' };
        }

        return { status: 'unavailable', message: 'No disponible' };
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Detalles de la Cita</CardTitle>
                <CardDescription>
                    Configura la fecha, hora y detalles de tu consulta.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Scheduler Section */}
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
                    {/* Left Column: Calendar */}
                    <div className="w-full lg:w-auto shrink-0 flex flex-col items-center">
                        <FormField
                            control={form.control}
                            name="fecha"
                            render={({ field }) => (
                                <FormItem className="flex flex-col items-center">
                                    <FormControl>
                                        <Calendar
                                            mode="single"
                                            selected={field.value ? new Date(field.value + "T12:00:00") : undefined}
                                            onSelect={(date) => {
                                                if (!date) {
                                                    field.onChange("");
                                                    return;
                                                }
                                                if (schedules.length > 0) {
                                                    const status = getDateStatus(date);
                                                    if (status.status !== 'available') return;
                                                }
                                                field.onChange(format(date, "yyyy-MM-dd"));
                                            }}
                                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                            className="rounded-md border shadow-none"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    {/* Right Column: Time Slots & Quick Settings */}
                    <div className="flex-1 w-full space-y-5">
                        <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
                            <FormField
                                control={form.control}
                                name="duracion_minutos"
                                render={({ field }) => (
                                    <FormItem className="w-full sm:flex-1 min-w-[120px]">
                                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Duración</FormLabel>
                                        <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Selecciona" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="15">15 min</SelectItem>
                                                <SelectItem value="30">30 min</SelectItem>
                                                <SelectItem value="45">45 min</SelectItem>
                                                <SelectItem value="60">1 hora</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="tipo_cita"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Tipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="h-9">
                                                    <SelectValue placeholder="Tipo de cita" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="presencial">Presencial</SelectItem>
                                                <SelectItem value="telemedicina">Telemedicina</SelectItem>
                                                <SelectItem value="urgencia">Urgencia</SelectItem>
                                                <SelectItem value="seguimiento">Seguimiento</SelectItem>
                                                <SelectItem value="primera_vez">Primera Vez</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="hora"
                            render={({ field }) => {
                                const selectedDate = watch("fecha");
                                const duration = Number(watch("duracion_minutos") || 30);

                                const getAvailableSlots = () => {
                                    if (!selectedDate || !schedules.length) return [];
                                    const dayIndex = getDay(new Date(selectedDate + "T12:00:00"));
                                    const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
                                    const dayName = daysMap[dayIndex];
                                    if (!dayName) return [];

                                    let activeSchedule: Schedule | undefined = undefined;
                                    if (selectedOfficeId) {
                                        activeSchedule = schedules.find((s: Schedule) =>
                                            s.office_id === selectedOfficeId &&
                                            s.horarios?.[dayName as keyof typeof s.horarios]?.activo &&
                                            (s.horarios?.[dayName as keyof typeof s.horarios]?.horarios?.length ?? 0) > 0
                                        );
                                    }

                                    if (!activeSchedule) {
                                        activeSchedule = schedules.find((s: Schedule) =>
                                            s.horarios?.[dayName as keyof typeof s.horarios]?.activo &&
                                            (s.horarios?.[dayName as keyof typeof s.horarios]?.horarios?.length ?? 0) > 0
                                        );
                                    }

                                    if (!activeSchedule) return [];
                                    const dayConfig = activeSchedule.horarios?.[dayName];
                                    if (!dayConfig) return [];
                                    const ranges = dayConfig.horarios || [];
                                    const slots: string[] = [];
                                    const now = new Date();
                                    const isToday = new Date(selectedDate + "T12:00:00").toDateString() === now.toDateString();
                                    const currentMinutes = now.getHours() * 60 + now.getMinutes();

                                    ranges.forEach((range: { inicio: string; fin: string }) => {
                                        if (!range.inicio || !range.fin) return;
                                        const [startH = 0, startM = 0] = range.inicio.split(':').map(Number);
                                        const [endH = 0, endM = 0] = range.fin.split(':').map(Number);
                                        let startTotal = startH * 60 + startM;
                                        const endTotal = endH * 60 + endM;
                                        while (startTotal + duration <= endTotal) {
                                            if (isToday && startTotal < currentMinutes) { startTotal += duration; continue; }
                                            const h = Math.floor(startTotal / 60);
                                            const m = startTotal % 60;
                                            slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
                                            startTotal += duration;
                                        }
                                    });
                                    return slots.sort();
                                };

                                const slots = getAvailableSlots();

                                return (
                                    <FormItem>
                                        <FormLabel className="text-md font-medium">Horarios Disponibles</FormLabel>
                                        <FormDescription>Duración de la cita: {duration} minutos</FormDescription>
                                        <FormControl>
                                            <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 max-h-[280px] overflow-y-auto pr-2 mt-2">
                                                {slots.length > 0 ? (
                                                    slots.map((slot) => (
                                                        <Button
                                                            key={slot}
                                                            type="button"
                                                            variant={field.value === slot ? "default" : "outline"}
                                                            className={cn(
                                                                "h-9 px-0 text-xs font-medium transition-all",
                                                                field.value === slot ? "bg-primary text-primary-foreground shadow-md scale-105" : "hover:border-primary/50"
                                                            )}
                                                            onClick={() => field.onChange(slot)}
                                                        >
                                                            {slot}
                                                        </Button>
                                                    ))
                                                ) : (
                                                    <div className="col-span-full py-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
                                                        <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                                        <p className="text-sm font-medium">{selectedDate ? "No hay cupos disponibles" : "Selecciona una fecha"}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                );
                            }}
                        />
                    </div>
                </div>

                <div className="border-t border-border/40 my-6" />

                {/* Motivo */}
                <FormField
                    control={form.control}
                    name="motivo"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Motivo de Consulta</FormLabel>
                            <div className="relative group">
                                <FormControl>
                                    <Textarea
                                        placeholder="Ej: Fiebre, Dolor de cabeza, Tos..."
                                        className="resize-none min-h-[80px] pr-4"
                                        {...field}
                                    />
                                </FormControl>

                                {/* Quick Suggestions */}
                                {!currentMotivoValue && (
                                    <div className="mt-2">
                                        <p className="text-[10px] text-muted-foreground mb-1.5 ml-1">
                                            Motivos comunes:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {motivoSuggestions.slice(0, 6).map((s: string) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => handleAddSuggestion(s)}
                                                    className="text-[10px] bg-muted/30 hover:bg-muted text-muted-foreground px-2 py-1 rounded-md border border-transparent hover:border-border transition-colors"
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <FormDescription className="text-[11px] mt-1.5">
                                Separa múltiples síntomas con comas.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>
    );
}
