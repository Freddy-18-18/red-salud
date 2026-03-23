/**
 * @file page.tsx
 * @description Página de Mis Cursos.
 * 
 * @module Academy/MisCursos
 */

import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mis Cursos - Academy',
    description: 'Tus cursos en progreso y completados.',
};

export default function MisCursosPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <BookOpen className="w-10 h-10 text-slate-600" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Aún no tienes cursos inscritos</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Explora el catálogo de especialidades y comienza tu camino de aprendizaje hoy mismo.
            </p>
        </div>
    );
}
