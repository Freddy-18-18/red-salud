/**
 * @file page.tsx
 * @description Página del reproductor de lecciones
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { AcademyLessonService } from '@/lib/academy/services/lesson.service';
import { AcademyProgressService } from '@/lib/academy/services/progress.service';
import { LessonPlayer } from '@/components/academy/lesson-player';
import { AcademyLesson, AcademyQuestion } from '@/lib/academy/types/lesson.types';
import { toast } from 'sonner';

/**
 * Página LessonPage
 * Carga los datos de la lección y sus preguntas para iniciar el reproductor.
 */
export default function LessonPage() {
    const router = useRouter();
    const params = useParams();
    const lessonId = params.id as string;

    const [lesson, setLesson] = useState<AcademyLesson | null>(null);
    const [questions, setQuestions] = useState<AcademyQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadLesson() {
            try {
                const data = await AcademyLessonService.getLessonWithQuestions(lessonId);
                if (data) {
                    setLesson(data);
                    setQuestions(data.questions || []);
                } else {
                    toast.error("No se pudo cargar la lección");
                    router.back();
                }
            } catch (error) {
                console.error("Error loading lesson:", error);
                toast.error("Error al cargar la lección");
            } finally {
                setIsLoading(false);
            }
        }

        if (lessonId) loadLesson();
    }, [lessonId, router]);

    const handleComplete = async (score: number, stars: number) => {
        try {
            // Registrar progreso en Supabase (en una implementación real ya tendríamos el auth.uid())
            // Por ahora simulamos el éxito
            toast.success(`¡Lección completada! Score: ${score}%`);

            // Esperar un poco para mostrar la animación final (futuro componente LessonSummary)
            setTimeout(() => {
                router.back(); // Volver al mapa
            }, 2000);
        } catch (error) {
            toast.error("Error al guardar tu progreso");
        }
    };

    const handleExit = () => {
        if (window.confirm("¿Seguro que quieres salir? Perderás tu progreso actual.")) {
            router.back();
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex flex-center items-center justify-center">
                <div className="text-white/40 animate-pulse font-medium italic">
                    Preparando tu lección médica...
                </div>
            </div>
        );
    }

    if (!lesson || questions.length === 0) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-2xl font-bold text-white mb-4">Lección vacía o no encontrada</h2>
                <button
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-white text-black font-bold rounded-xl"
                >
                    VOLVER AL MAPA
                </button>
            </div>
        );
    }

    return (
        <LessonPlayer
            lesson={lesson}
            questions={questions}
            onComplete={handleComplete}
            onExit={handleExit}
        />
    );
}
