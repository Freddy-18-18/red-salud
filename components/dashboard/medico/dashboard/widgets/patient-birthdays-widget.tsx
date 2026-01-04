/**
 * @file patient-birthdays-widget.tsx
 * @description Widget de cumpleaños de pacientes.
 * Muestra pacientes con cumpleaños próximos para enviar felicitaciones.
 * 
 * @module Dashboard/Widgets
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Cake,
    Gift,
    ChevronRight,
    Loader2,
    Send,
    CheckCircle,
    PartyPopper,
    Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip";
import { WidgetWrapper } from "../widget-wrapper";
import { supabase } from "@/lib/supabase/client";

// ============================================================================
// TIPOS
// ============================================================================

interface PatientBirthdaysWidgetProps {
    /** ID del médico */
    doctorId?: string;
    /** Si está siendo arrastrado */
    isDragging?: boolean;
}

interface BirthdayPatient {
    /** ID del paciente */
    id: string;
    /** Nombre completo */
    name: string;
    /** Avatar */
    avatar?: string;
    /** Fecha de cumpleaños */
    birthDate: Date;
    /** Edad que cumple */
    turningAge: number;
    /** Días hasta el cumpleaños (0 = hoy) */
    daysUntil: number;
    /** Si ya se envió felicitación */
    greetingSent?: boolean;
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Obtiene las iniciales de un nombre.
 */
function getInitials(name: string): string {
    return name
        .split(" ")
        .map(n => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
}

/**
 * Calcula días hasta el próximo cumpleaños.
 */
function getDaysUntilBirthday(birthDate: Date): number {
    const today = new Date();
    const thisYear = today.getFullYear();

    // Crear fecha de cumpleaños este año
    let nextBirthday = new Date(thisYear, birthDate.getMonth(), birthDate.getDate());

    // Si ya pasó, usar el del próximo año
    if (nextBirthday < today) {
        nextBirthday = new Date(thisYear + 1, birthDate.getMonth(), birthDate.getDate());
    }

    // Si es hoy
    if (
        today.getDate() === birthDate.getDate() &&
        today.getMonth() === birthDate.getMonth()
    ) {
        return 0;
    }

    const diffTime = nextBirthday.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calcula la edad que cumplirá.
 */
function calculateTurningAge(birthDate: Date, daysUntil: number): number {
    const today = new Date();
    const birthYear = birthDate.getFullYear();

    // Si el cumpleaños es hoy o ya pasó este año
    if (daysUntil === 0) {
        return today.getFullYear() - birthYear;
    }

    // Si el cumpleaños es este año pero aún no llega
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (thisYearBirthday > today) {
        return today.getFullYear() - birthYear;
    }

    // El cumpleaños será el próximo año
    return today.getFullYear() + 1 - birthYear;
}

/**
 * Formatea los días hasta el cumpleaños.
 */
function formatDaysUntil(days: number): string {
    if (days === 0) return "¡Hoy!";
    if (days === 1) return "Mañana";
    if (days <= 7) return `En ${days} días`;
    return `En ${Math.ceil(days / 7)} semanas`;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * Widget de cumpleaños de pacientes.
 * Muestra los pacientes con cumpleaños próximos (7 días).
 * 
 * @example
 * <PatientBirthdaysWidget doctorId="uuid-del-doctor" />
 */
export function PatientBirthdaysWidget({
    doctorId,
    isDragging
}: PatientBirthdaysWidgetProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [allPatients, setAllPatients] = useState<BirthdayPatient[]>([]);
    const [sentGreetings, setSentGreetings] = useState<Set<string>>(new Set());

    // Cargar pacientes con cumpleaños
    useEffect(() => {
        const loadBirthdays = async () => {
            if (!doctorId) {
                setIsLoading(false);
                return;
            }

            try {
                // Obtener pacientes del médico con fecha de nacimiento
                const { data: patients, error } = await supabase
                    .from("appointments")
                    .select(`
                        patient:profiles!appointments_paciente_id_fkey (
                            id,
                            nombre_completo,
                            avatar_url,
                            fecha_nacimiento
                        )
                    `)
                    .eq("medico_id", doctorId)
                    .not("patient.fecha_nacimiento", "is", null);

                if (error) {
                    console.log("[PatientBirthdays] Error o sin datos:", error.message);
                    setAllPatients([]);
                } else if (patients && patients.length > 0) {
                    // Procesar pacientes únicos
                    const processed = processPatients(patients);
                    setAllPatients(processed);
                } else {
                    setAllPatients([]);
                }
            } catch (err) {
                console.error("[PatientBirthdays] Error:", err);
                setAllPatients([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadBirthdays();
    }, [doctorId]);

    // Filtrar pacientes con cumpleaños próximo (7 días)
    const upcomingBirthdays = useMemo(() => {
        return allPatients
            .filter(p => p.daysUntil <= 7)
            .sort((a, b) => a.daysUntil - b.daysUntil)
            .slice(0, 5);
    }, [allPatients]);

    // Handler para enviar felicitación
    const handleSendGreeting = async (patientId: string) => {
        setSentGreetings(prev => new Set([...prev, patientId]));
        // TODO: Integrar con sistema de mensajería
    };

    // Verificar si hay cumpleaños hoy
    const hasBirthdayToday = upcomingBirthdays.some(p => p.daysUntil === 0);

    return (
        <WidgetWrapper
            id="patient-birthdays"
            title="Cumpleaños"
            icon={<Cake className="h-4 w-4 text-pink-500" />}
            isDragging={isDragging}
            showControls={false}
        >
            <div className="space-y-3">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <Badge
                                variant="secondary"
                                className={cn(
                                    "text-[10px] gap-1",
                                    hasBirthdayToday && "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400"
                                )}
                            >
                                <Gift className="h-2.5 w-2.5" />
                                {upcomingBirthdays.length} esta semana
                            </Badge>
                            {hasBirthdayToday && (
                                <Badge
                                    className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] gap-1 animate-pulse"
                                >
                                    <PartyPopper className="h-2.5 w-2.5" />
                                    ¡Hoy!
                                </Badge>
                            )}
                        </div>

                        {/* Lista de cumpleaños */}
                        <div className="space-y-2">
                            <AnimatePresence mode="popLayout">
                                {upcomingBirthdays.length > 0 ? (
                                    upcomingBirthdays.map((patient, index) => {
                                        const isToday = patient.daysUntil === 0;
                                        const greetingSent = sentGreetings.has(patient.id);

                                        return (
                                            <motion.div
                                                key={patient.id}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: index * 0.05 }}
                                                className={cn(
                                                    "flex items-center gap-2 p-2 rounded-lg",
                                                    "bg-muted/30 hover:bg-muted/50 transition-colors",
                                                    isToday && "bg-gradient-to-r from-pink-500/10 to-purple-500/10 ring-1 ring-pink-500/30"
                                                )}
                                            >
                                                {/* Avatar con decoración */}
                                                <div className="relative">
                                                    <Avatar className={cn(
                                                        "h-8 w-8",
                                                        isToday && "ring-2 ring-pink-500 ring-offset-2 ring-offset-background"
                                                    )}>
                                                        {patient.avatar ? (
                                                            <AvatarImage src={patient.avatar} alt={patient.name} />
                                                        ) : null}
                                                        <AvatarFallback className="text-xs bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                                                            {getInitials(patient.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {isToday && (
                                                        <div className="absolute -top-1 -right-1">
                                                            <span className="text-sm">🎂</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Información */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-medium truncate">
                                                        {patient.name}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                                        <span className={cn(
                                                            isToday && "text-pink-600 dark:text-pink-400 font-medium"
                                                        )}>
                                                            {formatDaysUntil(patient.daysUntil)}
                                                        </span>
                                                        <span className="text-border">•</span>
                                                        <span>Cumple {patient.turningAge}</span>
                                                    </div>
                                                </div>

                                                {/* Acción */}
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant={greetingSent ? "ghost" : isToday ? "default" : "outline"}
                                                                size="sm"
                                                                className={cn(
                                                                    "h-6 text-[10px] px-2",
                                                                    greetingSent && "text-emerald-600",
                                                                    isToday && !greetingSent && "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                                                                )}
                                                                onClick={() => handleSendGreeting(patient.id)}
                                                                disabled={greetingSent}
                                                            >
                                                                {greetingSent ? (
                                                                    <>
                                                                        <CheckCircle className="h-2.5 w-2.5 mr-1" />
                                                                        Enviado
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Send className="h-2.5 w-2.5 mr-1" />
                                                                        Felicitar
                                                                    </>
                                                                )}
                                                            </Button>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            {greetingSent
                                                                ? "Felicitación enviada"
                                                                : "Enviar mensaje de cumpleaños"
                                                            }
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </motion.div>
                                        );
                                    })
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-6 text-muted-foreground"
                                    >
                                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">Sin cumpleaños próximos</p>
                                        <p className="text-[10px] mt-1">Los cumpleaños de los próximos 7 días aparecerán aquí</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Ver calendario */}
                        {upcomingBirthdays.length > 0 && (
                            <Button
                                variant="outline"
                                className="w-full text-xs h-7"
                            >
                                <Cake className="h-3 w-3 mr-1" />
                                Ver todos los cumpleaños
                                <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                        )}
                    </>
                )}
            </div>
        </WidgetWrapper>
    );
}

// ============================================================================
// HELPERS DE DATOS
// ============================================================================

/**
 * Procesa pacientes de Supabase.
 */
function processPatients(patients: any[]): BirthdayPatient[] {
    // Eliminar duplicados por ID
    const uniquePatients = new Map<string, any>();
    patients.forEach(p => {
        if (p.patient?.id && p.patient.fecha_nacimiento) {
            uniquePatients.set(p.patient.id, {
                ...p.patient
            });
        }
    });

    return Array.from(uniquePatients.values()).map(patient => {
        const birthDate = new Date(patient.fecha_nacimiento);
        const daysUntil = getDaysUntilBirthday(birthDate);
        const turningAge = calculateTurningAge(birthDate, daysUntil);

        return {
            id: patient.id,
            name: patient.nombre_completo || "Paciente",
            avatar: patient.avatar_url,
            birthDate,
            turningAge,
            daysUntil
        };
    });
}

/**
 * Genera datos de demostración.
 */
// generateDemoBirthdays eliminado para evitar datos falsos
