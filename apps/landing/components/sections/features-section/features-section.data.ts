/**
 * @file features-section.data.ts
 * @description Datos de las características del ecosistema Red-Salud
 * @module FeaturesSection
 * 
 * Características diseñadas para beneficiar a todo el ecosistema:
 * Pacientes, Médicos, Clínicas, Farmacias, Laboratorios, Ambulancias, Secretarias, Seguros
 */

import {
    Video,
    FolderSync,
    CalendarCheck,
    Network,
    Pill,
    ShieldCheck
} from "lucide-react";
import type { Feature } from "./features-section.types";

/**
 * Array de características principales del ecosistema Red-Salud.
 * Cada característica está diseñada para proporcionar valor a múltiples tipos de usuarios.
 */
export const features: Feature[] = [
    {
        id: "consultas-remotas",
        title: "Consultas Sin Fronteras",
        icon: Video,
        gradient: "from-blue-500 to-cyan-400",
        glowColor: "bg-blue-500/30",
        description: "Videoconsultas HD desde cualquier lugar de Venezuela.",
        extendedDescription:
            "Conecta con especialistas certificados mediante videollamadas de alta definición con encriptación end-to-end. Sin importar dónde estés, tu salud está a un click de distancia.",
        benefits: [
            "HD sin interrupciones",
            "Grabación opcional",
            "Chat integrado",
        ],
    },
    {
        id: "historial-unificado",
        title: "Historial Médico Unificado",
        icon: FolderSync,
        gradient: "from-violet-500 to-purple-400",
        glowColor: "bg-violet-500/30",
        description: "Un solo lugar para toda tu información de salud.",
        extendedDescription:
            "Tu historial médico completo, sincronizado en tiempo real. Exámenes, recetas, diagnósticos y evolución clínica accesibles para ti y los profesionales que autorices.",
        benefits: [
            "Sincronización automática",
            "Acceso controlado",
            "Exportable en PDF",
        ],
    },
    {
        id: "agenda-inteligente",
        title: "Agenda Inteligente",
        icon: CalendarCheck,
        gradient: "from-emerald-500 to-teal-400",
        glowColor: "bg-emerald-500/30",
        description: "Programación automática sin conflictos para todos.",
        extendedDescription:
            "Sistema de agendamiento que optimiza tiempos y evita conflictos. Recordatorios automáticos, reagendamiento fácil y vista unificada para pacientes y profesionales.",
        benefits: [
            "Recordatorios automáticos",
            "Reagendamiento fácil",
            "Vista de disponibilidad",
        ],
    },
    {
        id: "red-especialistas",
        title: "Red de Especialistas",
        icon: Network,
        gradient: "from-amber-500 to-orange-400",
        glowColor: "bg-amber-500/30",
        description: "+132 especialidades conectadas en un ecosistema.",
        extendedDescription:
            "Accede a la red más completa de especialistas médicos de Venezuela. Desde medicina general hasta subespecialidades, todos conectados y listos para atenderte.",
        benefits: [
            "132+ especialidades",
            "Médicos verificados",
            "Referencias directas",
        ],
        badge: "Más completa",
    },
    {
        id: "prescripciones-digitales",
        title: "Prescripciones Digitales",
        icon: Pill,
        gradient: "from-rose-500 to-pink-400",
        glowColor: "bg-rose-500/30",
        description: "Recetas electrónicas conectadas con farmacias.",
        extendedDescription:
            "Olvídate del papel. Recetas digitales con QR único, verificables por farmacias y laboratorios. Historial de medicamentos siempre disponible.",
        benefits: [
            "QR verificable",
            "Historial de medicamentos",
            "Alertas de interacciones",
        ],
    },
    {
        id: "privacidad-garantizada",
        title: "Privacidad Garantizada",
        icon: ShieldCheck,
        gradient: "from-slate-600 to-slate-400",
        glowColor: "bg-slate-500/30",
        description: "Encriptación de nivel bancario para tus datos.",
        extendedDescription:
            "Cumplimos con los más altos estándares internacionales (HIPAA). Tus datos médicos están protegidos con encriptación AES-256 y controles de acceso estrictos.",
        benefits: [
            "Encriptación AES-256",
            "Cumplimiento HIPAA",
            "Auditoría de accesos",
        ],
    },
];
