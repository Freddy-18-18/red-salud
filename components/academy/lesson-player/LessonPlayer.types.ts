/**
 * @file LessonPlayer.types.ts
 * @description Tipos para el reproductor de lecciones
 */

import { AcademyLesson, AcademyQuestion } from '@/lib/academy/types/lesson.types';

export interface LessonPlayerProps {
    /** Lección a reproducir */
    lesson: AcademyLesson;
    /** Lista de preguntas cargadas */
    questions: AcademyQuestion[];
    /** Callback al finalizar todas las preguntas */
    onComplete: (score: number, stars: number) => void;
    /** Callback para salir de la lección */
    onExit: () => void;
}

export interface LessonState {
    /** Índice de la pregunta actual */
    currentIndex: number;
    /** Historial de respuestas del usuario */
    answers: Array<{
        questionId: string;
        isCorrect: boolean;
        answer: any;
    }>;
    /** Vidas restantes */
    lives: number;
    /** Si la lección está finalizada */
    isFinished: boolean;
    /** Estado de validación de la pregunta actual */
    validationState: 'idle' | 'checking' | 'correct' | 'wrong';
}
