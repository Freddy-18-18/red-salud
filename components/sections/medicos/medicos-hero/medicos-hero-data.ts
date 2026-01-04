// Datos estáticos para MedicosHeroSection
import { Shield, Clock, Zap, LucideIcon } from "lucide-react";

export interface Badge {
    icon: LucideIcon;
    text: string;
}

export const badges: Badge[] = [
    { icon: Shield, text: "Verificación SACS" },
    { icon: Clock, text: "Activo en 48h" },
    { icon: Zap, text: "Recetas Digitales" },
];

export interface DashboardStat {
    label: string;
    value: string;
    color: string;
}

export const dashboardStats: DashboardStat[] = [
    { label: "Citas Hoy", value: "12", color: "from-blue-500 to-blue-600" },
    { label: "Pacientes", value: "847", color: "from-emerald-500 to-emerald-600" },
    { label: "Ingresos", value: "$4,280", color: "from-violet-500 to-violet-600" },
];

export interface Appointment {
    time: string;
    name: string;
    type: string;
}

export const upcomingAppointments: Appointment[] = [
    { time: "09:00", name: "María García", type: "Consulta General" },
    { time: "10:30", name: "Carlos Pérez", type: "Seguimiento" },
    { time: "11:00", name: "Ana Martínez", type: "Telemedicina" },
];
