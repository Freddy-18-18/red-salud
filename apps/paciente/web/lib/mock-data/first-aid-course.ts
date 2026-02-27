
import { Course } from '@/types/academy';

export const FIRST_AID_COURSE: Course = {
    id: 'course-1',
    title: 'Primeros Auxilios Básicos',
    slug: 'primeros-auxilios',
    description: 'Aprende a salvar vidas con técnicas esenciales de primeros auxilios.',
    totalXp: 1500,
    progress: 15,
    modules: [
        {
            id: 'mod-1',
            title: 'Fundamentos y Seguridad',
            description: 'Conceptos básicos y cómo asegurar la escena.',
            order: 1,
            color: 'emerald',
            nodes: [
                {
                    id: 'node-1-1',
                    title: 'Introducción',
                    description: '¿Qué son los primeros auxilios?',
                    status: 'completed',
                    type: 'lesson',
                    position: { x: 50, y: 0 },
                    contentId: 'content-1-1'
                },
                {
                    id: 'node-1-2',
                    title: 'El Botiquín',
                    description: 'Elementos esenciales',
                    status: 'completed',
                    type: 'lesson',
                    position: { x: 40, y: 120 },
                    contentId: 'content-1-2'
                },
                {
                    id: 'node-1-3',
                    title: 'PAS: Proteger',
                    description: 'La regla de oro',
                    status: 'active',
                    type: 'lesson',
                    position: { x: 60, y: 240 },
                    contentId: 'content-1-3'
                },
                {
                    id: 'node-1-4',
                    title: 'Evaluación Inicial',
                    description: 'Quiz rápido',
                    status: 'locked',
                    type: 'quiz',
                    position: { x: 50, y: 360 },
                    contentId: 'content-1-4'
                }
            ]
        },
        {
            id: 'mod-2',
            title: 'Signos Vitales',
            description: 'Cómo evaluar a una víctima.',
            order: 2,
            color: 'blue',
            nodes: [
                {
                    id: 'node-2-1',
                    title: 'Pulso',
                    description: 'Técnica correcta',
                    status: 'locked',
                    type: 'lesson',
                    position: { x: 30, y: 0 },
                    contentId: 'content-2-1'
                },
                {
                    id: 'node-2-2',
                    title: 'Respiración',
                    description: 'Ver, oír, sentir',
                    status: 'locked',
                    type: 'lesson',
                    position: { x: 70, y: 120 },
                    contentId: 'content-2-2'
                },
                {
                    id: 'node-2-3',
                    title: 'Temperatura',
                    description: 'Identificar shock',
                    status: 'locked',
                    type: 'lesson',
                    position: { x: 50, y: 240 },
                    contentId: 'content-2-3'
                }
            ]
        },
        {
            id: 'mod-3',
            title: 'RCP Básico',
            description: 'Reanimación Cardiopulmonar Hands-Only.',
            order: 3,
            color: 'rose',
            nodes: [
                {
                    id: 'node-3-1',
                    title: 'Ubicación',
                    description: 'Punto de compresión',
                    status: 'locked',
                    type: 'lesson',
                    position: { x: 40, y: 0 },
                    contentId: 'content-3-1'
                },
                {
                    id: 'node-3-2',
                    title: 'Ritmo y Profundidad',
                    description: 'Maniobra correcta',
                    status: 'locked',
                    type: 'lesson',
                    position: { x: 60, y: 120 },
                    contentId: 'content-3-2'
                },
                {
                    id: 'node-3-3',
                    title: 'Práctica Virtual',
                    description: 'Simulación de RCP',
                    status: 'locked',
                    type: 'milestone',
                    position: { x: 50, y: 240 },
                    contentId: 'content-3-3'
                }
            ]
        }
    ]
};
