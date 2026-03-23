/**
 * @file page.tsx
 * @description Dashboard principal para estudiantes/profesionales de Academy.
 * 
 * @module Academy/Dashboard
 */

import { Metadata } from 'next';
import { AcademyHeader } from "@/components/academy/AcademyHeader";
import { LearningPath } from "@/components/academy/LearningPath";
import { FIRST_AID_COURSE } from "@/lib/mock-data/first-aid-course";

export const metadata: Metadata = {
    title: 'Dashboard - Academy',
    description: 'Mi centro de aprendizaje personal.',
};

/** Mock Data para el Dashboard */


export default function AcademyDashboardPage() {
    // In a real app, we would fetch the user's progress for this course
    const currentCourse = FIRST_AID_COURSE;

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* New Academy Header */}
            <AcademyHeader
                courseName={currentCourse.title}
                streak={5}
                totalXp={currentCourse.totalXp}
            />

            {/* Main Learning Path Area */}
            <main className="pt-20">
                <LearningPath course={currentCourse} />
            </main>

            {/* Floating Action Button for "Practice" or "Store" could go here */}
        </div>
    );
}

