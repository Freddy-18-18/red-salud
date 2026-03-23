/**
 * @file page.tsx
 * @description Página de Certificaciones.
 * 
 * @module Academy/MisCertificaciones
 */

import { Metadata } from 'next';
import { Award } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Mis Certificaciones - Academy',
};

export default function MisCertificacionesPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <Award className="w-10 h-10 text-amber-600/50" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Tus logros profesionales</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Completa cursos para obtener certificaciones CME y diplomas avalados por Red-Salud.
            </p>
        </div>
    );
}
