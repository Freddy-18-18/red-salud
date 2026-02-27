
"use client";

import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { LessonRunner } from "@/components/academy/LessonRunner";
import { SAMPLE_LESSON_CONTENT } from "@/lib/mock-data/lesson-content";

export default function LessonPage() {
    const params = useParams();
    const router = useRouter();
    const lesson = useMemo(() => {
        const id = params?.id as string;
        // Default to sample if not found for testing
        return SAMPLE_LESSON_CONTENT[id] || SAMPLE_LESSON_CONTENT['content-1-1'];
    }, [params]);

    if (!lesson) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando lección...</div>;

    return (
        <div className="min-h-screen bg-slate-950">
            <LessonRunner
                lesson={lesson}
                onComplete={() => {
                    // Start celebration animation?
                    router.push('/academy/dashboard');
                }}
            />
        </div>
    );
}
