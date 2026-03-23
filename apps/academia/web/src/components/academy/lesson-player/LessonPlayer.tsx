/**
 * @file LessonPlayer.tsx
 * @description Orquestador principal de la sesión de lección interactiva
 */

'use client';

import React, { useState, useCallback } from 'react';
import { LessonPlayerProps, LessonState } from './LessonPlayer.types';
import { LessonHeader } from './LessonHeader';
import { QuestionRenderer } from './QuestionRenderer';
import { LessonFooter } from './LessonFooter';


/**
 * Componente LessonPlayer
 * Gestiona el estado de la lección, validación de respuestas y navegación.
 */
export const LessonPlayer: React.FC<LessonPlayerProps> = ({
    questions,
    onComplete,
    onExit
}) => {
    const [state, setState] = useState<LessonState>({
        currentIndex: 0,
        answers: [],
        lives: 5,
        isFinished: false,
        validationState: 'idle'
    });

    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const currentQuestion = questions[state.currentIndex];
    const progressPercent = ((state.currentIndex) / questions.length) * 100;

    /**
     * Valida la respuesta seleccionada
     */
    const handleCheck = useCallback(() => {
        if (!selectedOptionId || !currentQuestion) return;

        const isCorrect = selectedOptionId === String(currentQuestion.correctAnswer);

        setState(prev => ({
            ...prev,
            validationState: isCorrect ? 'correct' : 'wrong',
            lives: isCorrect ? prev.lives : Math.max(0, prev.lives - 1),
            answers: [...prev.answers, {
                questionId: currentQuestion.id,
                isCorrect,
                answer: selectedOptionId
            }]
        }));
    }, [selectedOptionId, currentQuestion]);

    /**
     * Avanza a la siguiente pregunta o finaliza
     */
    const handleContinue = useCallback(() => {
        const isLastQuestion = state.currentIndex === questions.length - 1;

        if (isLastQuestion) {
            const correctCount = state.answers.filter(a => a.isCorrect).length;
            const score = Math.round((correctCount / questions.length) * 100);
            const stars = score === 100 ? 3 : score > 80 ? 2 : score > 50 ? 1 : 0;

            onComplete(score, stars);
            return;
        }

        setState(prev => ({
            ...prev,
            currentIndex: prev.currentIndex + 1,
            validationState: 'idle'
        }));
        setSelectedOptionId(null);
    }, [state.currentIndex, questions.length, state.answers, onComplete]);

    if (!currentQuestion) return null;

    return (
        <div className="min-h-screen bg-black flex flex-col">
            <LessonHeader
                progress={progressPercent}
                lives={state.lives}
                onExit={onExit}
            />

            <main className="flex-1 flex flex-col justify-center py-20">
                <QuestionRenderer
                    question={currentQuestion}
                    selectedOptionId={selectedOptionId}
                    onOptionSelect={setSelectedOptionId}
                    disabled={state.validationState !== 'idle'}
                />
            </main>

            <LessonFooter
                status={state.validationState}
                onCheck={handleCheck}
                onContinue={handleContinue}
                canCheck={selectedOptionId !== null}
                explanation={state.validationState === 'wrong' ? (currentQuestion.explanation || undefined) : undefined}
            />
        </div>
    );
};
