
"use client";

import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Heart } from "lucide-react";
import { Button } from "@red-salud/design-system";
import Link from "next/link";
import { LessonContent, Question } from "@/types/academy";

interface LessonRunnerProps {
    lesson: LessonContent;
    onComplete: () => void;
}

const formatAnswer = (answer: string | string[] | { [key: string]: string }) => {
    if (typeof answer === 'string') return answer;
    if (Array.isArray(answer)) return answer.join(', ');
    return Object.values(answer).join(', ');
};

export function LessonRunner({ lesson, onComplete }: LessonRunnerProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isChecked, setIsChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [lives, setLives] = useState(5);

    // Flatten content and questions into a single "slides" array
    const slides = useMemo(() => [
        ...(lesson.content ? [{ type: 'content' as const, data: lesson.content, title: lesson.title }] : []),
        ...(lesson.questions || []).map(q => ({ type: 'question' as const, data: q }))
    ], [lesson.content, lesson.questions, lesson.title]);

    const currentSlide = slides[currentIndex];
    const progress = ((currentIndex) / slides.length) * 100;

    const nextSlide = useCallback(() => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsChecked(false);
            setIsCorrect(false);
        } else {
            onComplete();
        }
    }, [currentIndex, slides.length, onComplete]);

    const handleCheck = useCallback(() => {
        if (!currentSlide || currentSlide.type !== 'question') {
            nextSlide();
            return;
        }

        const question = currentSlide.data as Question;
        const correct = selectedOption === question.correctAnswer;

        setIsCorrect(correct);
        setIsChecked(true);

        if (!correct) {
            setLives(prev => Math.max(0, prev - 1));
        }
    }, [currentSlide, nextSlide, selectedOption]);

    if (!currentSlide) return <div>Lesson Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto min-h-screen flex flex-col p-4 md:p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/academy/dashboard">
                    <XCircle className="w-6 h-6 text-slate-400 hover:text-white cursor-pointer" />
                </Link>
                <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center gap-1 text-rose-500">
                    <Heart className="w-5 h-5 fill-rose-500" />
                    <span className="font-bold">{lives}</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="w-full"
                    >
                        {currentSlide.type === 'content' ? (
                            <div className="prose prose-invert max-w-none">
                                <h1 className="text-3xl font-bold text-white mb-6">{(currentSlide.data as string)}</h1>
                                <div className="text-slate-300 text-lg">
                                    {/* In a real app, use a markdown renderer here */}
                                    This is the introductory content for {lesson.title}.
                                </div>
                            </div>
                        ) : (
                            <QuestionView
                                question={currentSlide.data as Question}
                                selectedOption={selectedOption}
                                onSelect={!isChecked ? setSelectedOption : () => { }}
                                isChecked={isChecked}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer / Actions */}
            <div className={`mt-8 py-6`}>
                {isChecked && (
                    <div className={`mb-4 p-4 rounded-xl flex items-start gap-3 ${isCorrect ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20'}`}>
                        {isCorrect ? (
                            <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                        ) : (
                            <XCircle className="w-6 h-6 text-rose-500" />
                        )}
                        <div>
                            <h4 className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                            </h4>
                            {!isCorrect && (
                                <p className="text-rose-300 text-sm mt-1">
                                    La respuesta correcta es: {formatAnswer((currentSlide.data as Question).correctAnswer)}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                <Button
                    size="lg"
                    className={`w-full text-lg h-12 font-bold ${isChecked
                        ? isCorrect ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'
                        : 'bg-cyan-600 hover:bg-cyan-500'
                        }`}
                    onClick={isChecked ? nextSlide : handleCheck}
                    disabled={currentSlide.type === 'question' && !selectedOption && !isChecked}
                >
                    {isChecked ? 'Continuar' : 'Comprobar'}
                </Button>
            </div>
        </div>
    );
}

function QuestionView({
    question,
    selectedOption,
    onSelect,
    isChecked
}: {
    question: Question;
    selectedOption: string | null;
    onSelect: (id: string) => void;
    isChecked: boolean;
}) {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white mb-8">
                {question.question}
            </h2>

            <div className="grid gap-3">
                {question.options?.map((option) => (
                    <div
                        key={option}
                        onClick={() => onSelect(option)}
                        className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between
                            ${selectedOption === option
                                ? isChecked
                                    ? option === question.correctAnswer
                                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                                        : 'bg-rose-500/20 border-rose-500 text-rose-400'
                                    : 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                                : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'
                            }
                        `}
                    >
                        <span className="font-semibold">{option}</span>
                        {selectedOption === option && isChecked && (
                            option === question.correctAnswer
                                ? <CheckCircle2 className="w-5 h-5" />
                                : <XCircle className="w-5 h-5" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
