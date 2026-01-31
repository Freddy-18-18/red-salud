"use client";


import { useFormContext } from "react-hook-form";
import { Clock, DollarSign, AlertTriangle, CalendarIcon } from "lucide-react";
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
    Input,
    Textarea,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Switch,
    Calendar,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Button,
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@red-salud/ui";
import { cn } from "@red-salud/core/utils";
import { format, getDay } from "date-fns";
import { es } from "date-fns/locale";

interface Schedule {
    day_of_week: number;
    start_time: string;
    end_time: string;
    consultorio_id: string;
    is_active: boolean;
}

interface Office {
    id: string;
    nombre: string;
}

interface AppointmentFormProps {
    getMinDate: () => string;
    getMinTime: () => string;
    isTimeValid: () => boolean;
    motivoSuggestions: string[];
    patients: any[];
    schedules?: Schedule[];
    offices?: Office[];
    selectedOfficeId?: string | null;
}

export function AppointmentForm({
    getMinDate,
    getMinTime,
    isTimeValid,
    motivoSuggestions,
    patients,
    schedules = [],
    offices = [],
    selectedOfficeId,
}: AppointmentFormProps) {
    const form = useFormContext();
    const { watch, setValue } = form;


    const motivo = watch("motivo");

    // Logic for smart autocomplete
    const currentMotivoValue = motivo || "";
    // Get text after the last comma to find the "active" search term
    const lastCommaIndex = currentMotivoValue.lastIndexOf(",");
    const searchTerm = lastCommaIndex !== -1
        ? currentMotivoValue.substring(lastCommaIndex + 1).trim()
        : currentMotivoValue.trim();

    const filteredSuggestions = motivoSuggestions.filter(suggestion =>
        suggestion.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !currentMotivoValue.includes(suggestion) // Exclude already added ones
    ).slice(0, 5); // Limit to top 5

    const handleAddSuggestion = (suggestion: string) => {
        let newValue = "";
        if (lastCommaIndex === -1) {
            newValue = suggestion;
        } else {
            // Keep everything before the last comma
            newValue = currentMotivoValue.substring(0, lastCommaIndex + 1) + " " + suggestion;
        }
        setValue("motivo", newValue + ", ");
    };

    // Helper to check availability
    const getDateStatus = (date: Date) => {
        // En DB, la columna 'horarios' es un JSONB con claves: lunes, martes, ...
        // Usamos date-fns para obtener el día de la semana 0-6
        // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
        const dayIndex = getDay(date);

        const daysMap = [
            'domingo',
            'lunes',
            'martes',
            'miercoles',
            'jueves',
            'viernes',
            'sabado'
        ];

        const dayName = daysMap[dayIndex];

        // Find schedules that are active for this day
        // schedules passed to this component seems to be the raw doctor_schedules table row
        // which contains the 'horarios' JSON column.

        const availableSchedules = schedules.filter((schedule: any) => {
            const dayConfig = schedule.horarios?.[dayName];
            return dayConfig && dayConfig.activo === true;
        });

        if (availableSchedules.length === 0) {
            return { status: 'unavailable', message: 'No hay horario configurado para este día' };
        }

        // Check if CURRENT selected office has active schedule for this day
        if (selectedOfficeId) {
            // Try exact match first
            const exactMatch = availableSchedules.find((s: any) => s.office_id === selectedOfficeId);
            const dayConfig = exactMatch?.horarios?.[dayName];

            // If exact match exists AND has ranges, we are good
            if (dayConfig && dayConfig.activo && dayConfig.horarios?.length > 0) {
                return { status: 'available', message: 'Disponible' };
            }
        }

        // Fallback: If no ranges in current office, check for global or ANY other valid schedule
        const validFallback = availableSchedules.find((s: any) => s.horarios?.[dayName]?.horarios?.length > 0);

        if (validFallback) {
            if (selectedOfficeId && validFallback.office_id !== selectedOfficeId) {
                const officeName = offices.find(o => o.id === validFallback.office_id)?.nombre || "Otro consultorio";
                return {
                    status: 'available', // Let them select it, but warn
                    message: `Usando horario de: ${officeName}`
                };
            }
            return { status: 'available', message: 'Disponible' };
        }

        // If not available in current office, recommend the first one that is available
        const otherSchedule: any = availableSchedules[0];
        const officeName = offices.find(o => o.id === otherSchedule.office_id)?.nombre || "Otro consultorio";

        return {
            status: 'other_office',
            message: `Atiende en: ${officeName}`
        };
    };

    return (
        <TooltipProvider delayDuration={0}>
            <Card>
                <CardHeader>
                    <CardTitle>Detalles de la Cita</CardTitle>
                    <CardDescription>
                        Configura la fecha, hora y detalles médicos de la consulta.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Scheduler Section: Compact & United */}
                    <div className="flex flex-col gap-6 lg:gap-8 items-start">
                        {/* Left Column: Calendar */}
                        <div className="w-full lg:w-auto mx-auto lg:mx-0 shrink-0 flex justify-center">
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
                                                    const status = getDateStatus(date);
                                                    if (status.status !== 'available') return;
                                                    field.onChange(format(date, "yyyy-MM-dd"));
                                                }}
                                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                                modifiers={{
                                                    unavailable: (date) => {
                                                        const status = getDateStatus(date);
                                                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                                        return status.status !== 'available' && !isPast;
                                                    }
                                                }}
                                                modifiersStyles={{
                                                    unavailable: {
                                                        opacity: 0.5,
                                                        color: "var(--muted-foreground)",
                                                        cursor: "not-allowed"
                                                    }
                                                }}
                                                initialFocus
                                                components={{
                                                    DayContent: ({ date }) => {
                                                        const status = getDateStatus(date);
                                                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                                        if (isPast) return <span className="text-muted-foreground opacity-30">{date.getDate()}</span>;

                                                        if (status.status === 'available') return <span>{date.getDate()}</span>;

                                                        return (
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <div
                                                                        className="w-full h-full flex items-center justify-center relative cursor-not-allowed hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md"
                                                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                                    >
                                                                        {date.getDate()}
                                                                        <span className="sr-only">{status.message}</span>
                                                                        {status.status === 'other_office' && (
                                                                            <span className="absolute bottom-1.5 w-1 h-1 bg-amber-400 rounded-full" />
                                                                        )}
                                                                    </div>
                                                                </TooltipTrigger>
                                                                <TooltipContent side="top" className="z-[9999] bg-zinc-900/95 text-white border-zinc-800 text-xs px-2 py-1 shadow-xl backdrop-blur-sm">
                                                                    <div className="flex flex-col gap-0.5 max-w-[150px] text-center">
                                                                        <span className="font-medium">No disponible</span>
                                                                        <span className="text-[10px] text-zinc-300">{status.message}</span>
                                                                    </div>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        );
                                                    }
                                                }}
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
                                                    <SelectItem value="90">1.5 horas</SelectItem>
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
                                    const duration = watch("duracion_minutos") || 30;

                                    const getAvailableSlots = () => {
                                        if (!selectedDate || !schedules.length) return [];
                                        const date = new Date(selectedDate);
                                        const dayIndex = getDay(new Date(selectedDate + "T12:00:00"));
                                        const daysMap = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
                                        const dayName = daysMap[dayIndex];

                                        let activeSchedule = null;
                                        if (selectedOfficeId) {
                                            // 1. Try exact office match with valid ranges
                                            activeSchedule = schedules.find((s: any) =>
                                                s.office_id === selectedOfficeId &&
                                                s.horarios?.[dayName]?.activo &&
                                                s.horarios?.[dayName]?.horarios?.length > 0
                                            );

                                            // 2. Fallback to global schedule with valid ranges
                                            if (!activeSchedule) {
                                                activeSchedule = schedules.find((s: any) =>
                                                    !s.office_id &&
                                                    s.horarios?.[dayName]?.activo &&
                                                    s.horarios?.[dayName]?.horarios?.length > 0
                                                );
                                            }

                                            // 3. Last resort: Any office that has slots today
                                            if (!activeSchedule) {
                                                activeSchedule = schedules.find((s: any) =>
                                                    s.horarios?.[dayName]?.activo &&
                                                    s.horarios?.[dayName]?.horarios?.length > 0
                                                );
                                            }
                                        } else {
                                            // Default: use first valid schedule
                                            activeSchedule = schedules.find((s: any) =>
                                                s.horarios?.[dayName]?.activo &&
                                                s.horarios?.[dayName]?.horarios?.length > 0
                                            );
                                        }

                                        if (!activeSchedule) return [];
                                        const dayConfig = activeSchedule.horarios[dayName];
                                        const ranges = dayConfig.horarios || [];
                                        const slots: string[] = [];
                                        const now = new Date();
                                        const isToday = new Date(selectedDate + "T12:00:00").toDateString() === now.toDateString();
                                        const currentMinutes = now.getHours() * 60 + now.getMinutes();

                                        ranges.forEach((range: any) => {
                                            if (!range.inicio || !range.fin) return;
                                            const [startH, startM] = range.inicio.split(':').map(Number);
                                            const [endH, endM] = range.fin.split(':').map(Number);
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Motivo */}
                        <FormField
                            control={form.control}
                            name="motivo"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Motivo de Consulta</FormLabel>
                                    <div className="relative group">
                                        <FormControl>
                                            <Textarea
                                                placeholder="Ej: Fiebre, Dolor de cabeza, Tos..."
                                                className="resize-none min-h-[80px] pr-4"
                                                {...field}
                                            />
                                        </FormControl>

                                        {/* Smart Suggestions */}
                                        {filteredSuggestions.length > 0 && searchTerm.length > 0 && (
                                            <div className="absolute z-50 w-full mt-2 bg-popover/95 backdrop-blur-md rounded-xl border border-border/50 shadow-2xl p-2 animate-in fade-in slide-in-from-top-2 max-h-[200px] overflow-y-auto">
                                                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-2 py-1.5 mb-1">
                                                    Sugerencias
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {filteredSuggestions.map((suggestion) => (
                                                        <button
                                                            key={suggestion}
                                                            type="button"
                                                            className="text-left px-3 py-1.5 text-xs font-medium bg-secondary/50 hover:bg-primary hover:text-primary-foreground transition-all rounded-lg border border-transparent hover:border-primary/20 hover:shadow-sm"
                                                            onClick={() => handleAddSuggestion(suggestion)}
                                                        >
                                                            {suggestion}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Static Common Suggestions (When empty) */}
                                        {searchTerm.length === 0 && (
                                            <div className="mt-2">
                                                <p className="text-[10px] text-muted-foreground mb-1.5 ml-1">Frecuentes:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {motivoSuggestions.slice(0, 4).map(s => (
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




                        {/* Notas Internas */}
                        <FormField
                            control={form.control}
                            name="notas_internas"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notas Internas <span className="text-xs text-muted-foreground font-normal">(Privado)</span></FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Notas solo visibles para ti..."
                                            className="resize-none h-[80px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            {/* Precio */}
                            <FormField
                                control={form.control}
                                name="precio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Costo de la Consulta</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input type="number" placeholder="0.00" className="pl-9" {...field} />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Enviar Recordatorio */}
                            <FormField
                                control={form.control}
                                name="enviar_recordatorio"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-muted/10">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-sm font-medium">Enviar Email</FormLabel>
                                            <FormDescription className="text-xs">
                                                Confirmación al paciente.
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider >
    );
}
