// Datos estáticos para how-it-works section
import {
    Calendar,
    Users,
    Stethoscope,
    UserCircle,
    Pill,
    FlaskConical,
    Briefcase,
    UserCog,
    Hospital,
    HeartPulse,
    Ambulance,
    LucideIcon
} from "lucide-react";

export interface Step {
    icon: LucideIcon;
    number: string;
    title: string;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    icon: LucideIcon;
    color: string;
    href: string;
    description: string;
}

export const steps: Step[] = [
    {
        icon: UserCircle,
        number: "01",
        title: "Regístrate",
        description: "Crea tu cuenta y completa tu perfil en minutos.",
    },
    {
        icon: Calendar,
        number: "02",
        title: "Conéctate",
        description: "Encuentra servicios, agenda citas o gestiona tu consulta.",
    },
    {
        icon: HeartPulse,
        number: "03",
        title: "Aprovecha",
        description: "Accede a todas las funciones de tu rol desde un solo lugar.",
    },
];

export const roles: Role[] = [
    {
        id: "paciente",
        name: "Paciente",
        icon: Users,
        color: "from-blue-600 to-blue-700",
        href: "/servicios/pacientes",
        description: "Agenda citas y gestiona tu salud"
    },
    {
        id: "medico",
        name: "Médico",
        icon: Stethoscope,
        color: "from-teal-600 to-teal-700",
        href: "/servicios/medicos",
        description: "Atiende pacientes y administra consultas"
    },
    {
        id: "farmacia",
        name: "Farmacia",
        icon: Pill,
        color: "from-green-600 to-green-700",
        href: "/servicios/farmacias",
        description: "Gestiona recetas y dispensación"
    },
    {
        id: "laboratorio",
        name: "Laboratorio",
        icon: FlaskConical,
        color: "from-purple-600 to-purple-700",
        href: "/servicios/laboratorios",
        description: "Procesa muestras y entrega resultados"
    },
    {
        id: "aseguradora",
        name: "Aseguradora",
        icon: Briefcase,
        color: "from-orange-600 to-orange-700",
        href: "/servicios/seguros",
        description: "Administra pólizas y reembolsos"
    },
    {
        id: "secretaria",
        name: "Secretaria",
        icon: UserCog,
        color: "from-pink-600 to-pink-700",
        href: "/servicios/secretarias",
        description: "Organiza agendas y apoya al médico"
    },
    {
        id: "clinica",
        name: "Clínica",
        icon: Hospital,
        color: "from-indigo-600 to-indigo-700",
        href: "/servicios/clinicas",
        description: "Coordina servicios hospitalarios"
    },
    {
        id: "ambulancia",
        name: "Ambulancias",
        icon: Ambulance,
        color: "from-red-600 to-red-700",
        href: "/servicios/ambulancias",
        description: "Servicio de emergencias médicas"
    },
];
