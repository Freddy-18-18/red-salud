/**
 * @file dashboard-types.ts
 * @description Tipos completos para el sistema de dashboard del médico.
 * Incluye definiciones para widgets, layouts, preferencias, temas y acciones rápidas.
 * 
 * @module Dashboard
 */

// ============================================================================
// TIPOS BASE
// ============================================================================

/** Modo del dashboard: simple (básico) o pro (completo) */
export type DashboardMode = 'simple' | 'pro';

/** IDs de todos los widgets disponibles */
export type WidgetId =
    // Widgets existentes
    | 'stats-overview'
    | 'today-timeline'
    | 'week-calendar'
    | 'pending-patients'
    | 'notifications'
    | 'messages'
    | 'quick-actions'
    | 'performance-chart'
    // Widgets nuevos
    | 'income'
    | 'tasks'
    | 'patient-insights'
    | 'revenue-analytics'
    | 'productivity-score'
    // Nuevos widgets (6 adicionales)
    | 'follow-up-reminders'
    | 'satisfaction-metrics'
    | 'upcoming-telemedicine'
    | 'lab-results-pending'
    | 'patient-birthdays'
    | 'monthly-goals';

// ============================================================================
// CONFIGURACIÓN DE WIDGETS
// ============================================================================

/** Configuración de un widget */
export interface WidgetConfig {
    /** ID único del widget */
    id: WidgetId;
    /** Título mostrado en el header */
    title: string;
    /** Descripción corta del widget */
    description: string;
    /** Nombre del ícono de Lucide */
    icon: string;
    /** Si está visible por defecto */
    defaultVisible: boolean;
    /** Ancho mínimo en columnas del grid */
    minWidth: number;
    /** Alto mínimo en filas del grid */
    minHeight: number;
    /** Modos en los que aparece el widget */
    modes: DashboardMode[];
    /** Categoría del widget para organización */
    category: 'stats' | 'calendar' | 'communication' | 'actions' | 'analytics';
    /** Si el widget requiere datos en tiempo real */
    realtime?: boolean;
}

/** Posición de un widget en el grid */
export interface WidgetPosition {
    /** ID del widget */
    id: WidgetId;
    /** Posición X en el grid */
    x: number;
    /** Posición Y en el grid */
    y: number;
    /** Ancho en columnas */
    w: number;
    /** Alto en filas */
    h: number;
}

/** Layout completo del dashboard */
export interface DashboardLayout {
    /** Modo del layout */
    mode: DashboardMode;
    /** Posiciones de todos los widgets */
    widgets: WidgetPosition[];
}

// ============================================================================
// ESTADO DEL DASHBOARD
// ============================================================================

/** Estado completo del dashboard (compatible con localStorage y Supabase) */
export interface DashboardState {
    /** Modo actual del dashboard */
    currentMode: DashboardMode;
    /** Layouts por modo */
    layouts: {
        simple: WidgetPosition[];
        pro: WidgetPosition[];
    };
    /** IDs de widgets ocultos */
    hiddenWidgets: WidgetId[];
}

/** Preferencias del dashboard guardadas en Supabase */
export interface DashboardPreferences {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** Modo actual */
    current_mode: DashboardMode;
    /** Layout del modo simple */
    layout_simple: WidgetPosition[];
    /** Layout del modo pro */
    layout_pro: WidgetPosition[];
    /** Widgets ocultos */
    hidden_widgets: WidgetId[];
    /** ID del tema activo */
    active_theme_id: string | null;
    /** Timestamps */
    created_at: string;
    updated_at: string;
}

/** Configuración individual de un widget */
export interface WidgetSettings {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** ID del widget */
    widget_id: WidgetId;
    /** Configuración específica del widget */
    settings: Record<string, unknown>;
    /** Si está minimizado */
    is_minimized: boolean;
    /** Timestamps */
    created_at: string;
    updated_at: string;
}

// ============================================================================
// ACCIONES RÁPIDAS
// ============================================================================

/** Definición de una acción rápida disponible */
export interface QuickActionDefinition {
    /** ID único de la acción */
    id: string;
    /** Etiqueta por defecto */
    label: string;
    /** Descripción corta */
    description: string;
    /** Nombre del ícono de Lucide */
    icon: string;
    /** Ruta de navegación */
    href: string;
    /** Gradiente de color (Tailwind classes) */
    color: string;
}

/** Configuración de acción rápida del médico */
export interface DoctorQuickAction {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** ID de la acción */
    action_id: string;
    /** Posición en el grid (0-5 visibles) */
    position: number;
    /** Si está visible */
    is_visible: boolean;
    /** Etiqueta personalizada opcional */
    custom_label: string | null;
    /** Timestamp */
    created_at: string;
}

// ============================================================================
// TEMAS
// ============================================================================

/** IDs de temas predefinidos */
export type ThemePresetId = 'ocean' | 'forest' | 'sunset' | 'minimal' | 'coral' | 'custom';

/** Tema del dashboard */
export interface DashboardTheme {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** Nombre del tema */
    name: string;
    /** Color primario (hex) */
    primary_color: string;
    /** Color secundario (hex) */
    secondary_color: string;
    /** Color de acento (hex) */
    accent_color: string;
    /** Color de fondo opcional */
    background_color: string | null;
    /** Color de fondo de cards opcional */
    card_background: string | null;
    /** Estilo del fondo */
    background_style: 'gradient' | 'solid' | 'pattern';
    /** Si es el tema activo */
    is_active: boolean;
    /** Si es un tema personalizado */
    is_custom: boolean;
    /** ID del preset si no es personalizado */
    preset_id: ThemePresetId | null;
    /** Timestamps */
    created_at: string;
    updated_at: string;
}

/** Tema predefinido */
export interface ThemePreset {
    /** ID del preset */
    id: ThemePresetId;
    /** Nombre del tema */
    name: string;
    /** Color primario */
    primary_color: string;
    /** Color secundario */
    secondary_color: string;
    /** Color de acento */
    accent_color: string;
    /** Vista previa del gradiente */
    preview_gradient: string;
}

// ============================================================================
// TAREAS DEL MÉDICO
// ============================================================================

/** Prioridad de tarea */
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

/** Categoría de tarea */
export type TaskCategory = 'general' | 'follow-up' | 'lab' | 'documentation' | 'call' | 'other';

/** Tarea del médico */
export interface DoctorTask {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** Título de la tarea */
    title: string;
    /** Descripción opcional */
    description: string | null;
    /** Si está completada */
    is_completed: boolean;
    /** Prioridad */
    priority: TaskPriority;
    /** Fecha límite opcional */
    due_date: string | null;
    /** Fecha de completado */
    completed_at: string | null;
    /** Paciente vinculado (opcional) */
    patient_id?: string | null;
    /** Cita vinculada (opcional) */
    appointment_id?: string | null;
    /** Categoría de la tarea */
    category?: TaskCategory;
    /** Timestamps */
    created_at: string;
    updated_at: string;
    /** Datos del paciente vinculado (joined) */
    patient?: {
        id: string;
        nombre_completo: string;
        avatar_url?: string;
    } | null;
    /** Datos de la cita vinculada (joined) */
    appointment?: {
        id: string;
        fecha_hora: string;
        motivo?: string;
    } | null;
}

// ============================================================================
// NOTIFICACIONES
// ============================================================================

/** Tipos de notificación */
export type NotificationType =
    | 'appointment_new'
    | 'appointment_cancelled'
    | 'appointment_reminder'
    | 'message_new'
    | 'patient_new'
    | 'review_new'
    | 'system_update'
    | 'verification_status';

/** Notificación del médico */
export interface DoctorNotification {
    /** UUID del registro */
    id: string;
    /** UUID del doctor */
    doctor_id: string;
    /** Tipo de notificación */
    type: NotificationType;
    /** Título */
    title: string;
    /** Mensaje */
    message: string;
    /** Datos adicionales */
    metadata: Record<string, unknown>;
    /** Si fue leída */
    is_read: boolean;
    /** Fecha de lectura */
    read_at: string | null;
    /** Timestamp */
    created_at: string;
}

// ============================================================================
// CONFIGURACIÓN DE WIDGETS
// ============================================================================

/** Configuración de todos los widgets disponibles */
export const WIDGET_CONFIGS: Record<WidgetId, WidgetConfig> = {
    'stats-overview': {
        id: 'stats-overview',
        title: 'Estadísticas',
        description: 'Métricas clave del día',
        icon: 'TrendingUp',
        defaultVisible: true,
        minWidth: 2,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'stats',
    },
    'today-timeline': {
        id: 'today-timeline',
        title: 'Citas de Hoy',
        description: 'Timeline de citas programadas',
        icon: 'Calendar',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 2,
        modes: ['simple', 'pro'],
        category: 'calendar',
        realtime: true,
    },
    'week-calendar': {
        id: 'week-calendar',
        title: 'Semana',
        description: 'Vista semanal de citas',
        icon: 'CalendarDays',
        defaultVisible: true,
        minWidth: 2,
        minHeight: 1,
        modes: ['pro'],
        category: 'calendar',
    },
    'pending-patients': {
        id: 'pending-patients',
        title: 'Pacientes Pendientes',
        description: 'Pacientes en espera de atención',
        icon: 'Users',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'stats',
        realtime: true,
    },
    'notifications': {
        id: 'notifications',
        title: 'Notificaciones',
        description: 'Alertas y avisos del sistema',
        icon: 'Bell',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'communication',
        realtime: true,
    },
    'messages': {
        id: 'messages',
        title: 'Mensajes',
        description: 'Conversaciones recientes con pacientes',
        icon: 'MessageSquare',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'communication',
        realtime: true,
    },
    'quick-actions': {
        id: 'quick-actions',
        title: 'Acciones Rápidas',
        description: 'Accesos directos personalizables',
        icon: 'Zap',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'actions',
    },
    'performance-chart': {
        id: 'performance-chart',
        title: 'Rendimiento',
        description: 'Gráficos de actividad mensual',
        icon: 'BarChart3',
        defaultVisible: true,
        minWidth: 2,
        minHeight: 1,
        modes: ['pro'],
        category: 'analytics',
    },
    // Nuevos widgets
    'income': {
        id: 'income',
        title: 'Ingresos',
        description: 'Resumen de ingresos del período',
        icon: 'DollarSign',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'analytics',
    },
    'tasks': {
        id: 'tasks',
        title: 'Tareas',
        description: 'Lista de tareas pendientes',
        icon: 'CheckSquare',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'actions',
    },
    'patient-insights': {
        id: 'patient-insights',
        title: 'Resumen Pacientes',
        description: 'Métricas e insights de pacientes',
        icon: 'Users',
        defaultVisible: true,
        minWidth: 2,
        minHeight: 1,
        modes: ['pro'],
        category: 'analytics',
    },
    'revenue-analytics': {
        id: 'revenue-analytics',
        title: 'Análisis Financiero',
        description: 'Ingresos y tendencias financieras',
        icon: 'TrendingUp',
        defaultVisible: false,
        minWidth: 2,
        minHeight: 2,
        modes: ['pro'],
        category: 'analytics',
    },
    'productivity-score': {
        id: 'productivity-score',
        title: 'Productividad',
        description: 'Puntuación y métricas de productividad',
        icon: 'Gauge',
        defaultVisible: false,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'stats',
    },
    // 6 Nuevos widgets
    'follow-up-reminders': {
        id: 'follow-up-reminders',
        title: 'Seguimiento Pacientes',
        description: 'Pacientes que necesitan seguimiento',
        icon: 'Bell',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'actions',
    },
    'satisfaction-metrics': {
        id: 'satisfaction-metrics',
        title: 'Satisfacción',
        description: 'Métricas de satisfacción y reviews',
        icon: 'Star',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'analytics',
    },
    'upcoming-telemedicine': {
        id: 'upcoming-telemedicine',
        title: 'Videoconsultas',
        description: 'Próximas citas de telemedicina',
        icon: 'Video',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'calendar',
        realtime: true,
    },
    'lab-results-pending': {
        id: 'lab-results-pending',
        title: 'Lab Pendientes',
        description: 'Resultados de laboratorio por revisar',
        icon: 'FlaskConical',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'actions',
    },
    'patient-birthdays': {
        id: 'patient-birthdays',
        title: 'Cumpleaños',
        description: 'Cumpleaños de pacientes próximos',
        icon: 'Cake',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['simple', 'pro'],
        category: 'communication',
    },
    'monthly-goals': {
        id: 'monthly-goals',
        title: 'Metas del Mes',
        description: 'Objetivos y progreso mensual',
        icon: 'Target',
        defaultVisible: true,
        minWidth: 1,
        minHeight: 1,
        modes: ['pro'],
        category: 'stats',
    },
};

// ============================================================================
// LAYOUTS POR DEFECTO
// ============================================================================

/** Layouts por defecto para nuevos usuarios */
export const DEFAULT_LAYOUTS: DashboardState['layouts'] = {
    simple: [
        { id: 'stats-overview', x: 0, y: 0, w: 4, h: 1 },
        { id: 'today-timeline', x: 0, y: 1, w: 2, h: 2 },
        { id: 'quick-actions', x: 2, y: 1, w: 1, h: 1 },
        { id: 'tasks', x: 3, y: 1, w: 1, h: 1 },
        { id: 'notifications', x: 2, y: 2, w: 1, h: 1 },
        // Nuevos widgets para modo simple
        { id: 'upcoming-telemedicine', x: 3, y: 2, w: 1, h: 1 },
        { id: 'patient-birthdays', x: 0, y: 3, w: 2, h: 1 },
    ],
    pro: [
        { id: 'stats-overview', x: 0, y: 0, w: 4, h: 1 },
        { id: 'today-timeline', x: 0, y: 1, w: 1, h: 2 },
        { id: 'week-calendar', x: 1, y: 1, w: 2, h: 1 },
        { id: 'performance-chart', x: 1, y: 2, w: 2, h: 1 },
        { id: 'quick-actions', x: 3, y: 1, w: 1, h: 1 },
        { id: 'notifications', x: 3, y: 2, w: 1, h: 1 },
        { id: 'messages', x: 0, y: 3, w: 1, h: 1 },
        { id: 'pending-patients', x: 1, y: 3, w: 1, h: 1 },
        { id: 'tasks', x: 2, y: 3, w: 1, h: 1 },
        { id: 'income', x: 3, y: 3, w: 1, h: 1 },
        { id: 'patient-insights', x: 0, y: 4, w: 2, h: 1 },
        // Nuevos widgets para modo pro
        { id: 'follow-up-reminders', x: 2, y: 4, w: 1, h: 1 },
        { id: 'satisfaction-metrics', x: 3, y: 4, w: 1, h: 1 },
        { id: 'upcoming-telemedicine', x: 0, y: 5, w: 1, h: 1 },
        { id: 'lab-results-pending', x: 1, y: 5, w: 1, h: 1 },
        { id: 'patient-birthdays', x: 2, y: 5, w: 1, h: 1 },
        { id: 'monthly-goals', x: 3, y: 5, w: 1, h: 1 },
    ],
};

// ============================================================================
// ACCIONES RÁPIDAS DISPONIBLES
// ============================================================================

/** Todas las acciones rápidas disponibles para personalización */
export const AVAILABLE_QUICK_ACTIONS: QuickActionDefinition[] = [
    {
        id: 'agenda',
        label: 'Agenda',
        description: 'Ver citas programadas',
        icon: 'Calendar',
        href: '/dashboard/medico/citas',
        color: 'from-blue-500 to-blue-600',
    },
    {
        id: 'pacientes',
        label: 'Pacientes',
        description: 'Lista de pacientes',
        icon: 'Users',
        href: '/dashboard/medico/pacientes',
        color: 'from-emerald-500 to-emerald-600',
    },
    {
        id: 'recetas',
        label: 'Recetas',
        description: 'Prescripciones médicas',
        icon: 'FileText',
        href: '/dashboard/medico/recetas',
        color: 'from-orange-500 to-orange-600',
    },
    {
        id: 'telemedicina',
        label: 'Video',
        description: 'Consultas online',
        icon: 'Video',
        href: '/dashboard/medico/telemedicina',
        color: 'from-teal-500 to-teal-600',
    },
    {
        id: 'mensajes',
        label: 'Mensajes',
        description: 'Chat con pacientes',
        icon: 'MessageSquare',
        href: '/dashboard/medico/mensajeria',
        color: 'from-purple-500 to-purple-600',
    },
    {
        id: 'laboratorio',
        label: 'Lab',
        description: 'Órdenes de laboratorio',
        icon: 'FlaskConical',
        href: '/dashboard/medico/laboratorio',
        color: 'from-pink-500 to-pink-600',
    },
    {
        id: 'estadisticas',
        label: 'Stats',
        description: 'Estadísticas y reportes',
        icon: 'TrendingUp',
        href: '/dashboard/medico/estadisticas',
        color: 'from-indigo-500 to-indigo-600',
    },
    {
        id: 'configuracion',
        label: 'Config',
        description: 'Configuración del perfil',
        icon: 'Settings',
        href: '/dashboard/medico/configuracion',
        color: 'from-gray-500 to-gray-600',
    },
    {
        id: 'nuevo-paciente',
        label: 'Nuevo',
        description: 'Registrar nuevo paciente',
        icon: 'UserPlus',
        href: '/dashboard/medico/pacientes/nuevo',
        color: 'from-green-500 to-green-600',
    },
    {
        id: 'nueva-cita',
        label: 'Cita',
        description: 'Programar nueva cita',
        icon: 'CalendarPlus',
        href: '/dashboard/medico/citas/nueva',
        color: 'from-cyan-500 to-cyan-600',
    },
    {
        id: 'historial',
        label: 'Historial',
        description: 'Historial clínico',
        icon: 'ClipboardList',
        href: '/dashboard/medico/pacientes/historial',
        color: 'from-amber-500 to-amber-600',
    },
    {
        id: 'perfil',
        label: 'Perfil',
        description: 'Mi perfil profesional',
        icon: 'User',
        href: '/dashboard/medico/perfil',
        color: 'from-rose-500 to-rose-600',
    },
];

// ============================================================================
// TEMAS PREDEFINIDOS
// ============================================================================

/** Temas predefinidos disponibles */
export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'ocean',
        name: 'Océano',
        primary_color: '#0ea5e9',
        secondary_color: '#06b6d4',
        accent_color: '#0284c7',
        preview_gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    },
    {
        id: 'forest',
        name: 'Bosque',
        primary_color: '#22c55e',
        secondary_color: '#16a34a',
        accent_color: '#15803d',
        preview_gradient: 'linear-gradient(135deg, #22c55e, #16a34a)',
    },
    {
        id: 'sunset',
        name: 'Atardecer',
        primary_color: '#f97316',
        secondary_color: '#ea580c',
        accent_color: '#c2410c',
        preview_gradient: 'linear-gradient(135deg, #f97316, #ea580c)',
    },
    {
        id: 'minimal',
        name: 'Minimal',
        primary_color: '#6b7280',
        secondary_color: '#4b5563',
        accent_color: '#374151',
        preview_gradient: 'linear-gradient(135deg, #6b7280, #4b5563)',
    },
    {
        id: 'coral',
        name: 'Coral',
        primary_color: '#f43f5e',
        secondary_color: '#e11d48',
        accent_color: '#be123c',
        preview_gradient: 'linear-gradient(135deg, #f43f5e, #e11d48)',
    },
    {
        id: 'custom',
        name: 'Personalizado',
        primary_color: '#8b5cf6',
        secondary_color: '#7c3aed',
        accent_color: '#6d28d9',
        preview_gradient: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    },
];
