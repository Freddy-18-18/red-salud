/**
 * @file page.tsx
 * @description Página de Comunidad.
 * 
 * @module Academy/Comunidad
 */

import { Metadata } from 'next';
import { Users } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Comunidad - Academy',
};

export default function ComunidadPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800">
                <Users className="w-10 h-10 text-blue-600/50" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Comunidad Profesional</h1>
            <p className="text-slate-500 max-w-md mb-8">
                Conecta con colegas, comparte casos clínicos y participa en discusiones especializadas.
                <br />
                <span className="text-xs uppercase tracking-widest text-blue-500 font-bold mt-4 block">Próximamente</span>
            </p>
        </div>
    );
}
