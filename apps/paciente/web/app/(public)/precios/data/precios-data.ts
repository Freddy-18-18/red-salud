/**
 * @file precios-data.ts
 * @description Datos estáticos para la página de precios
 * Incluye información de planes, features comparativas y FAQs
 */

// =============================================================================
// TIPOS
// =============================================================================

/** Tipo para cada organización/sector */
export interface Organization {
    name: string;
    icon: string;
    slug: string;
    description: string;
}

/** Tipo para cada pregunta frecuente */
export interface FAQ {
    q: string;
    a: string;
}

/** Tipo para cada feature en la tabla comparativa */
export interface ComparisonFeature {
    name: string;
    paciente: boolean | string;
    medico: boolean | string;
    organizacion: boolean | string;
    enterprise: boolean | string;
}

/** Tipo para cada categoría de features */
export interface FeatureCategory {
    name: string;
    icon: string;
    features: ComparisonFeature[];
}

// =============================================================================
// PLANES
// =============================================================================

/** Features incluidos en el plan Paciente (gratuito) */
export const patientFeatures = [
    "Historial médico digital",
    "Agendar citas médicas",
    "Recetas electrónicas",
    "Resultados de laboratorio",
    "Telemedicina por video",
    "Mensajería con médicos",
    "Métricas de salud",
    "Recordatorios automáticos",
];

/** Features incluidos en el plan Médico Pro */
export const doctorFeatures = [
    "Todo lo de Paciente, más:",
    "Pacientes ilimitados",
    "Agenda inteligente",
    "Historial clínico digital",
    "Recetas con firma electrónica",
    "Telemedicina HD integrada",
    "Mensajería segura",
    "Reportes y estadísticas",
    "Soporte prioritario 24/7",
];

/** Features incluidos para organizaciones */
export const organizationFeatures = [
    "Todo lo de Médico Pro, más:",
    "Múltiples usuarios",
    "Dashboard administrativo",
    "Gestión centralizada",
    "Reportes avanzados",
    "Integraciones personalizadas",
    "Soporte dedicado",
];

/** Features incluidos en Enterprise */
export const enterpriseFeatures = [
    "Todo lo de Organizaciones, más:",
    "SLA garantizado",
    "Implementación asistida",
    "API personalizada",
    "Seguridad avanzada",
    "Auditorías de cumplimiento",
    "Gerente de cuenta dedicado",
];

// =============================================================================
// ORGANIZACIONES / SECTORES
// =============================================================================

export const organizations: Organization[] = [
    {
        name: "Farmacias",
        icon: "💊",
        slug: "farmacias",
        description: "Recetas electrónicas e inventario",
    },
    {
        name: "Laboratorios",
        icon: "🔬",
        slug: "laboratorios",
        description: "Resultados digitales automáticos",
    },
    {
        name: "Clínicas",
        icon: "🏥",
        slug: "clinicas",
        description: "Gestión de múltiples médicos",
    },
    {
        name: "Ambulancias",
        icon: "🚑",
        slug: "ambulancias",
        description: "Coordinación en tiempo real",
    },
    {
        name: "Seguros",
        icon: "🛡️",
        slug: "seguros",
        description: "Verificación de cobertura",
    },
];

// =============================================================================
// TABLA COMPARATIVA
// =============================================================================

export const comparisonCategories: FeatureCategory[] = [
    {
        name: "Agenda y Citas",
        icon: "📅",
        features: [
            {
                name: "Agendar citas",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Recordatorios automáticos",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Agenda inteligente con IA",
                paciente: false,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Gestión de múltiples agendas",
                paciente: false,
                medico: false,
                organizacion: true,
                enterprise: true,
            },
        ],
    },
    {
        name: "Historial Médico",
        icon: "📋",
        features: [
            {
                name: "Historial médico digital",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Recetas electrónicas",
                paciente: "Ver",
                medico: "Crear",
                organizacion: "Crear",
                enterprise: "Crear",
            },
            {
                name: "Resultados de laboratorio",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Firma electrónica",
                paciente: false,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Exportar datos clínicos",
                paciente: false,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
        ],
    },
    {
        name: "Comunicación",
        icon: "💬",
        features: [
            {
                name: "Mensajería segura",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Telemedicina por video",
                paciente: true,
                medico: "HD",
                organizacion: "HD",
                enterprise: "HD + Grabación",
            },
            {
                name: "Notificaciones push",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Chat grupal",
                paciente: false,
                medico: false,
                organizacion: true,
                enterprise: true,
            },
        ],
    },
    {
        name: "Reportes y Analytics",
        icon: "📊",
        features: [
            {
                name: "Métricas de salud",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Estadísticas de consultas",
                paciente: false,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Dashboard administrativo",
                paciente: false,
                medico: false,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Reportes personalizados",
                paciente: false,
                medico: false,
                organizacion: false,
                enterprise: true,
            },
            {
                name: "API de datos",
                paciente: false,
                medico: false,
                organizacion: false,
                enterprise: true,
            },
        ],
    },
    {
        name: "Soporte",
        icon: "🎧",
        features: [
            {
                name: "Centro de ayuda",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Soporte por email",
                paciente: true,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Chat en vivo 24/7",
                paciente: false,
                medico: true,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Soporte telefónico",
                paciente: false,
                medico: false,
                organizacion: true,
                enterprise: true,
            },
            {
                name: "Gerente de cuenta dedicado",
                paciente: false,
                medico: false,
                organizacion: false,
                enterprise: true,
            },
            {
                name: "SLA garantizado",
                paciente: false,
                medico: false,
                organizacion: false,
                enterprise: "99.9%",
            },
        ],
    },
];

// =============================================================================
// PREGUNTAS FRECUENTES
// =============================================================================

export const faqs: FAQ[] = [
    {
        q: "¿Es realmente gratis para pacientes?",
        a: "Sí. Acceso completo sin costo: historial, citas, recetas, telemedicina y más. Sin límites ni funciones bloqueadas.",
    },
    {
        q: "¿Qué incluye la prueba gratis para médicos?",
        a: "30 días con todas las funcionalidades sin restricciones. No necesitas tarjeta de crédito para comenzar.",
    },
    {
        q: "¿Cómo funciona el plan anual?",
        a: "Pagas $240/año en lugar de $360. El mes te sale a $20 en vez de $30, ahorrando $120 al año.",
    },
    {
        q: "¿Las secretarias pagan?",
        a: "No. Las cuentas de secretaria son gratuitas. Solo necesitan vincularse a un médico con suscripción activa.",
    },
    {
        q: "¿Cómo son los planes para organizaciones?",
        a: "Personalizados según el tamaño y necesidades de tu organización. Todos incluyen 1 mes gratis para probar la plataforma.",
    },
    {
        q: "¿Puedo cancelar cuando quiera?",
        a: "Sí. Sin contratos de permanencia ni penalizaciones. Cancela desde tu panel de configuración en cualquier momento.",
    },
];
