
import { LessonContent } from "@/types/academy";

export const SAMPLE_LESSON_CONTENT: Record<string, LessonContent> = {
    'content-1-1': {
        id: 'content-1-1',
        type: 'interactive',
        title: 'Introducción a los Primeros Auxilios',
        description: '¿Qué son y por qué son importantes?',
        durationMinutes: 5,
        content: `
# ¿Qué son los Primeros Auxilios?

Los primeros auxilios son la **ayuda inmediata** que se le presta a una persona enferma o herida hasta que llega la ayuda profesional.

No se trata de reemplazar al médico, sino de:
1.  **Preservar la vida**.
2.  **Prevenir que la lesión empeore**.
3.  **Promover la recuperación**.

Un botiquín básico y el conocimiento de números de emergencia son vitales.
        `,
        questions: [
            {
                id: 'q1',
                type: 'multiple-choice',
                question: '¿Cuál es el objetivo principal de los primeros auxilios?',
                points: 10,
                options: [
                    'Curar la enfermedad por completo',
                    'Preservar la vida hasta que llegue ayuda profesional',
                    'Diagnosticar la lesión con exactitud',
                    'Reemplazar al médico en la sala de emergencias'
                ],
                correctAnswer: 'Preservar la vida hasta que llegue ayuda profesional',
                explanation: 'La prioridad es mantener a la persona con vida y segura.'
            },
            {
                id: 'q2',
                type: 'multiple-choice',
                question: '¿Qué NO debes hacer si no estás seguro del procedimiento?',
                points: 10,
                options: [
                    'Llamar a emergencias',
                    'Improvisar un tratamiento médico complejo',
                    'Acompañar a la víctima',
                    'Asegurar la escena'
                ],
                correctAnswer: 'Improvisar un tratamiento médico complejo',
                explanation: 'Si no sabes qué hacer, podrías empeorar la situación. Llama al 911.'
            }
        ]
    }
};
