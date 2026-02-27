"use client";

import { motion } from "framer-motion";
import {
    User,
    Clock,
    ChevronRight,
    MessageSquare,
    Bell,
    Calendar,
    ExternalLink,
    ArrowUpRight
} from "lucide-react";
import { Card, Button, Badge } from "@red-salud/design-system";
import { useEffect, useState } from "react";
import { createPacienteSdk } from "@red-salud/sdk-paciente";

import { supabase } from "@/lib/supabase/client";
import { getUserActivity } from "@/lib/supabase/services/activity-service";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const pacienteSdk = createPacienteSdk(supabase);

interface ProfessionalMainPanelProps {
    userId?: string;
}

interface Appointment {
    status: string;
    appointment_date: string;
    appointment_time: string;
    patient_id: string;
    consultation_type: string;
    reason?: string;
    patient?: {
        nombre_completo: string;
    };
}

interface Activity {
    id: string;
    description: string;
    created_at: string;
}

export function ProfessionalMainPanel({ userId }: ProfessionalMainPanelProps) {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                const [appointmentsRes, activityRes] = await Promise.all([
                    pacienteSdk.appointments.getDoctorAppointments(userId),
                    getUserActivity(userId, 5)
                ]);

                if (appointmentsRes) {
                    const nextOnes = (appointmentsRes as Appointment[])
                        .filter((apt) => apt.status !== 'cancelled' && apt.status !== 'completed')
                        .sort((a, b) => new Date(`${a.appointment_date}T${a.appointment_time}`).getTime() - new Date(`${b.appointment_date}T${b.appointment_time}`).getTime());

                    setAppointments(nextOnes);
                }

                if (activityRes.success && activityRes.data) {
                    setActivities(activityRes.data as Activity[]);
                }
            } catch (error) {
                console.error("Error fetching panel data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const nextPatient = appointments[0];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Next Patient & Quick Actions (2/3 width on large) */}
            <div className="lg:col-span-2 space-y-6">
                {/* Next Patient Card - HIGH FOCUS */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Próximo Paciente
                        </h2>
                        <Link href="/dashboard/medico/agenda">
                            <Button variant="ghost" size="sm" className="text-primary gap-1">
                                Ver Agenda <ChevronRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>

                    <motion.div
                        whileHover={{ scale: 1.005 }}
                        className="group relative"
                    >
                        <Card className="relative glass-premium p-8 rounded-3xl border-white/10 overflow-hidden bg-white/5">
                            {loading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : nextPatient ? (
                                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                                    {/* Patient Initials */}
                                    <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0 border border-primary/20">
                                        {nextPatient.patient?.nombre_completo?.split(" ").map((n: string) => n[0]).join("").slice(0, 2) || "P"}
                                    </div>

                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-border text-[10px]">
                                                {nextPatient.appointment_time.slice(0, 5)}
                                            </Badge>
                                            <Badge variant="outline" className="bg-muted/10 text-muted-foreground border-border text-[10px] capitalize">
                                                {nextPatient.consultation_type === 'video' ? 'Telemedicina' : 'Presencial'}
                                            </Badge>
                                        </div>
                                        <h3 className="text-2xl font-bold tracking-tight">{nextPatient.patient?.nombre_completo}</h3>
                                        <p className="text-muted-foreground text-sm line-clamp-1">
                                            {nextPatient.reason || "Motivo: Consulta de seguimiento."}
                                        </p>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <Button size="sm" className="rounded-lg gap-2 px-6">
                                                <User className="h-4 w-4" /> Iniciar Sesión
                                            </Button>
                                            <Link href={`/dashboard/medico/pacientes/${nextPatient.patient_id}`}>
                                                <Button size="sm" variant="ghost" className="rounded-lg gap-2 text-muted-foreground hover:text-primary">
                                                    <ExternalLink className="h-4 w-4" /> Historial
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                                    <div className="h-16 w-16 rounded-full bg-muted/5 flex items-center justify-center">
                                        <Calendar className="h-8 w-8 text-muted-foreground/30" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-semibold text-muted-foreground">Tu agenda está despejada</p>
                                        <p className="text-xs text-muted-foreground/60">No tienes citas próximas para hoy.</p>
                                    </div>
                                    <Link href="/dashboard/medico/agenda">
                                        <Button variant="outline" size="sm" className="rounded-xl border-white/5 hover:bg-white/5">Programar Ahora</Button>
                                    </Link>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                </section>

                {/* Unified Quick Access Bento Grid */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link href="/dashboard/medico/agenda" className="group">
                        <Card className="glass-premium p-6 rounded-2xl border-white/10 hover:bg-white/10 transition-colors cursor-pointer bg-white/5 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-muted/20 text-muted-foreground group-hover:scale-110 transition-transform">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="font-semibold text-base">Programar Nueva Cita</h4>
                            <p className="text-xs text-muted-foreground mt-1">Gestiona tu disponibilidad y agenda pacientes rápidamente.</p>
                        </Card>
                    </Link>

                    <Link href="/dashboard/medico/mensajes" className="group">
                        <Card className="glass-premium p-6 rounded-2xl border-white/10 hover:bg-white/10 transition-colors cursor-pointer bg-white/5 h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 rounded-xl bg-muted/20 text-muted-foreground group-hover:scale-110 transition-transform">
                                    <MessageSquare className="h-6 w-6" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground opacity-30 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <h4 className="font-semibold text-base">Centro de Mensajería</h4>
                            <p className="text-xs text-muted-foreground mt-1">Revisa tus conversaciones pendientes y consultas rápidas.</p>
                        </Card>
                    </Link>
                </section>
            </div>

            {/* Right Column: Activity & Notifications (1/3 width) */}
            <div className="space-y-6">
                <section className="space-y-4 h-full flex flex-col">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        Actividad Reciente
                    </h2>

                    <Card className="glass-premium rounded-3xl border-white/10 flex-1 overflow-hidden bg-white/5 flex flex-col">
                        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                            {loading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="h-8 w-8 rounded-full bg-muted/10 shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-muted/10 rounded w-3/4" />
                                            <div className="h-2 bg-muted/10 rounded w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex gap-4 items-start group cursor-pointer transition-all">
                                        <div className="h-8 w-8 rounded-full bg-muted/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                            <Bell className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0 border-b border-white/5 pb-4 last:border-0 group-hover:border-primary/20 transition-colors">
                                            <p className="text-xs font-medium leading-tight mb-1">{activity.description}</p>
                                            <p className="text-[10px] text-muted-foreground">
                                                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: es })}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2 opacity-50">
                                    <Bell className="h-8 w-8 text-muted-foreground/30" />
                                    <p className="text-xs text-muted-foreground">Sin actividad reciente.</p>
                                </div>
                            )}
                        </div>
                        <Button variant="ghost" className="w-full rounded-none border-t border-white/5 h-12 text-xs text-muted-foreground hover:text-primary mt-auto">
                            Ver historial completo
                        </Button>
                    </Card>
                </section>
            </div>
        </div>
    );
}
