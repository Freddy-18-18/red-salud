/**
 * @file layout.tsx
 * @description Layout para la sección pública de Red-Salud Academy.
 * Incluye navbar específico, footer y estilos del tema Academy.
 * 
 * @module Academy
 */

import { ReactNode } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { AcademyPublicNavbar } from '@/components/academy/navigation/AcademyPublicNavbar';
import { GraduationCap, ArrowRight } from 'lucide-react';
import '@/app/academy-theme.css';

/** Metadata para SEO de las páginas públicas de Academy */
export const metadata: Metadata = {
    title: {
        template: '%s | Red-Salud Academy',
        default: 'Red-Salud Academy - Educación Médica Basada en Evidencia',
    },
    description:
        'Plataforma de aprendizaje médico basada en metodología científica. Cursos desde nivel básico hasta especialista, para pacientes y profesionales.',
    keywords: [
        'educación médica',
        'aprendizaje médico',
        'cursos de salud',
        'formación médica',
        'Venezuela',
        'especialidades médicas',
    ],
};

interface AcademyLayoutProps {
    /** Contenido de la página */
    children: ReactNode;
}

/**
 * Layout wrapper para las páginas públicas de Academy.
 * Proporciona el tema visual diferenciado, navbar y footer.
 * 
 * @param children - Contenido de la página
 */
export default function AcademyLayout({ children }: AcademyLayoutProps) {
    return (
        <div className="academy-theme min-h-screen bg-slate-950 flex flex-col">
            {/* Navbar público de Academy */}
            <AcademyPublicNavbar />

            {/* Contenido principal */}
            <main className="flex-1">{children}</main>

            {/* Footer de Academy */}
            <footer className="border-t border-white/5 bg-slate-950">
                <div className="container mx-auto max-w-7xl px-4 py-12">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Branding */}
                        <div className="md:col-span-1">
                            <Link href="/academy" className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                                    <GraduationCap className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-bold text-white">Academy</span>
                            </Link>
                            <p className="text-sm text-white/50 mb-4">
                                Educación médica basada en metodología científica.
                            </p>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                            >
                                Ir a Red-Salud
                                <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>

                        {/* Enlaces Plataforma */}
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Plataforma</h4>
                            <ul className="space-y-2 text-sm text-white/50">
                                <li>
                                    <Link href="/academy/cursos" className="hover:text-white transition-colors">
                                        Catálogo de Cursos
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/academy/metodologia" className="hover:text-white transition-colors">
                                        Metodología
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/academy/certificaciones" className="hover:text-white transition-colors">
                                        Certificaciones
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/academy/planes" className="hover:text-white transition-colors">
                                        Planes y Precios
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Enlaces Público Objetivo */}
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Aprende</h4>
                            <ul className="space-y-2 text-sm text-white/50">
                                <li>
                                    <Link href="/academy/pacientes" className="hover:text-white transition-colors">
                                        Para Pacientes
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/academy/profesionales" className="hover:text-white transition-colors">
                                        Para Profesionales
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/blog" className="hover:text-white transition-colors">
                                        Blog de Salud
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/comunidad" className="hover:text-white transition-colors">
                                        Comunidad
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        {/* Enlaces Legal */}
                        <div>
                            <h4 className="font-semibold text-white mb-4 text-sm">Legal</h4>
                            <ul className="space-y-2 text-sm text-white/50">
                                <li>
                                    <Link href="/terminos" className="hover:text-white transition-colors">
                                        Términos de Uso
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/privacidad" className="hover:text-white transition-colors">
                                        Privacidad
                                    </Link>
                                </li>
                                <li>
                                    <Link href="/cookies" className="hover:text-white transition-colors">
                                        Cookies
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
                        <p>© {new Date().getFullYear()} Red-Salud Academy. Todos los derechos reservados.</p>
                        <p>
                            Un producto de{' '}
                            <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition-colors">
                                Red-Salud
                            </Link>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
