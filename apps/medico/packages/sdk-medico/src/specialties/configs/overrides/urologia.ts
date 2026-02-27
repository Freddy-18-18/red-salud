/**
 * @file overrides/urologia.ts
 * @description Override de configuración para Urología.
 */

import type { SpecialtyConfigOverride } from '../config-factory';

/**
 * Override de Urología.
 * Especialidad con módulos clínicos especializados.
 */
export const urologiaOverride: SpecialtyConfigOverride = {
    dashboardVariant: 'urologia',
    dashboardPath: '/dashboard/medico/urologia',

    modules: {
        clinical: [
            {
                key: 'uro-consulta',
                label: 'Consulta Urológica',
                icon: 'Stethoscope',
                route: '/dashboard/medico/urologia/consulta',
                group: 'clinical',
                order: 1,
                enabledByDefault: true,
                kpiKeys: ['consultations_per_day', 'avg_consultation_duration'],
            },
            {
                key: 'uro-cistos',
                label: 'Cistoscopia',
                icon: 'Eye', // Using generic Eye icon for scope visualization
                route: '/dashboard/medico/urologia/cistoscopia',
                group: 'clinical',
                order: 2,
                enabledByDefault: true,
            },
            {
                key: 'uro-flujo',
                label: 'Uroflujometría',
                icon: 'Activity',
                route: '/dashboard/medico/urologia/uroflujometria',
                group: 'clinical',
                order: 3,
                enabledByDefault: true,
            },
            {
                key: 'uro-eco',
                label: 'Ecografía Urológica',
                icon: 'Monitor', // Using Monitor for imaging
                route: '/dashboard/medico/urologia/eco',
                group: 'clinical',
                order: 4,
                enabledByDefault: true,
            },
        ],

        financial: [
            {
                key: 'uro-facturacion',
                label: 'Facturación',
                icon: 'FileText',
                route: '/dashboard/medico/urologia/facturacion',
                group: 'financial',
                order: 1,
                enabledByDefault: true,
            },
            {
                key: 'uro-seguros',
                label: 'Seguros',
                icon: 'Shield',
                route: '/dashboard/medico/urologia/seguros',
                group: 'financial',
                order: 2,
                enabledByDefault: true,
            },
        ],

        technology: [
            {
                key: 'uro-telemed',
                label: 'Teleurología',
                icon: 'Video',
                route: '/dashboard/medico/urologia/telemedicina',
                group: 'technology',
                order: 1,
                enabledByDefault: true,
            },
        ],

        communication: [
            {
                key: 'uro-portal',
                label: 'Portal Paciente',
                icon: 'User',
                route: '/dashboard/medico/urologia/portal',
                group: 'communication',
                order: 1,
                enabledByDefault: false,
            },
        ],

        growth: [
            {
                key: 'uro-analytics',
                label: 'Análisis de Práctica',
                icon: 'TrendingUp',
                route: '/dashboard/medico/urologia/analytics',
                group: 'growth',
                order: 1,
                enabledByDefault: true,
            },
        ],
    },

    widgets: [
        {
            key: 'patient-status',
            component: '@/components/dashboard/medico/urologia/widgets/patient-status-widget',
            size: 'medium',
            required: true,
        },
        {
            key: 'upcoming-procedures',
            component: '@/components/dashboard/medico/urologia/widgets/upcoming-procedures-widget',
            size: 'large',
            required: true,
        },
        {
            key: 'critical-alerts',
            component: '@/components/dashboard/medico/urologia/widgets/critical-alerts-widget',
            size: 'small',
            required: true,
        },
    ],

    prioritizedKpis: [
        'patient_throughput',
        'procedure_volume',
        'no_show_rate',
        'patient_satisfaction_score',
    ],

    kpiDefinitions: {
        patient_throughput: {
            label: 'Pacientes por Día',
            format: 'number',
            direction: 'higher_is_better',
        },
        procedure_volume: {
            label: 'Volumen de Procedimientos',
            format: 'number',
            direction: 'higher_is_better',
        },
        no_show_rate: {
            label: 'Tasa de Inasistencia',
            format: 'percentage',
            goal: 0.1,
            direction: 'lower_is_better',
        },
        patient_satisfaction_score: {
            label: 'Satisfacción del Paciente',
            format: 'percentage',
            goal: 0.9,
            direction: 'higher_is_better',
        },
    },

    settings: {
        appointmentTypes: [
            'primera_vez',
            'seguimiento',
            'cistoscopia',
            'uroflujometria',
            'biopsia_prostata',
            'vasectomia',
            'teleconsulta',
        ],
        defaultDuration: 20,
        allowOverlap: false,
        requiresClinicalTemplates: true,
        clinicalTemplateCategories: [
            'anamnesis_urologica',
            'examen_fisico_urologico',
            'reporte_cistoscopia',
            'reporte_ecografia',
            'plan_tratamiento',
        ],
        usesTreatmentPlans: true,
        requiresInsuranceVerification: true,
        supportsImagingIntegration: true,
        supportsTelemedicine: true,
        customFlags: {
            requiresProstateScreening: true,
            supportsEndourology: true,
        },
    },

    theme: {
        primaryColor: '#0ea5e9', // Sky blue for Urology (often associated with water/kidneys)
        accentColor: '#3b82f6',
        icon: 'Activity', // Generic activity icon if specific kidney/bladder icon missing
    },
};
