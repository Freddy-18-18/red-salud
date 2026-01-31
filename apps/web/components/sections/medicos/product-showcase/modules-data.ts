"use client";

import {
    Calendar,
    Users,
    Video,
    FileText,
    FlaskConical,
    BarChart3,
    Check,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

// Definición de tipos
export interface ModuleData {
    id: string;
    icon: LucideIcon;
    name: string;
    description: string;
    color: string;
    features: string[];
}

// Datos de módulos sin previews (los previews se renderizarán como componentes)
export const modulesData: ModuleData[] = [
    {
        id: "agenda",
        icon: Calendar,
        name: "Agenda Inteligente",
        description: "Gestiona citas con recordatorios automáticos",
        color: "from-blue-500 to-blue-600",
        features: [
            "Calendario sincronizado en todos tus dispositivos",
            "Recordatorios automáticos por SMS y WhatsApp",
            "Bloqueo de horarios y días libres",
            "Confirmación de citas online",
            "Vista diaria, semanal y mensual"
        ],
    },
    {
        id: "pacientes",
        icon: Users,
        name: "Gestión de Pacientes",
        description: "Historiales completos y seguimiento",
        color: "from-emerald-500 to-emerald-600",
        features: [
            "Expediente clínico digital completo",
            "Historial de consultas y tratamientos",
            "Notas médicas privadas",
            "Seguimiento automático de pacientes",
            "Búsqueda y filtros avanzados"
        ],
    },
    {
        id: "telemedicina",
        icon: Video,
        name: "Telemedicina HD",
        description: "Videoconsultas profesionales integradas",
        color: "from-violet-500 to-violet-600",
        features: [
            "Video en alta definición",
            "Sala de espera virtual",
            "Compartir pantalla y documentos",
            "Grabación opcional de consultas",
            "Chat integrado durante la llamada"
        ],
    },
    {
        id: "recetas",
        icon: FileText,
        name: "Recetas Digitales",
        description: "Firma electrónica válida en Venezuela",
        color: "from-amber-500 to-orange-600",
        features: [
            "Firma electrónica certificada",
            "Válida en 500+ farmacias",
            "Envío automático al paciente",
            "Historial de prescripciones",
            "Base de datos de medicamentos"
        ],
    },
    {
        id: "laboratorio",
        icon: FlaskConical,
        name: "Órdenes de Laboratorio",
        description: "Solicitudes digitales y resultados",
        color: "from-cyan-500 to-teal-600",
        features: [
            "Órdenes digitales con código QR",
            "Laboratorios afiliados a la red",
            "Resultados automáticos en el historial",
            "Notificación cuando estén listos",
            "Histórico de estudios"
        ],
    },
    {
        id: "estadisticas",
        icon: BarChart3,
        name: "Estadísticas",
        description: "Métricas y crecimiento de tu práctica",
        color: "from-pink-500 to-rose-600",
        features: [
            "Dashboard de ingresos en tiempo real",
            "Métricas de consultas y pacientes",
            "Análisis de horarios más productivos",
            "Comparativas mensuales",
            "Exportación de reportes"
        ],
    },
];
