/**
 * @file page.tsx
 * @description Landing page principal de Red-Salud Academy.
 * Diseño profesional enfocado en metodología científica, no gamificación tipo juego.
 * 
 * @module Academy
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Award,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    FlaskConical,
    ChevronRight,
} from 'lucide-react';
import { Button } from "@red-salud/design-system";
import { Card, CardContent } from "@red-salud/design-system";
import { AcademyHeroContainer } from "@/components/academy/hero/AcademyHeroContainer";

import { AcademyStatsContainer } from "@/components/academy/sections/AcademyStatsContainer";
import { MethodologySection } from "@/components/academy/sections/MethodologySection";
import { StudentPathSection } from "@/components/academy/sections/StudentPathSection";

export const metadata: Metadata = {
    title: 'Educación Médica Basada en Evidencia',
    description:
        'La plataforma de aprendizaje médico más avanzada de Venezuela. Metodología científica comprobada para pacientes y profesionales de la salud.',
};


/** Especialidades destacadas */
const FEATURED_SPECIALTIES = [
    { name: 'Cardiología', lessons: 120, category: 'cardiovascular', color: '#ef4444' },
    { name: 'Neurología', lessons: 95, category: 'neurologia', color: '#8b5cf6' },
    { name: 'Medicina Interna', lessons: 150, category: 'general', color: '#3b82f6' },
    { name: 'Pediatría', lessons: 85, category: 'pediatria', color: '#10b981' },
    { name: 'Dermatología', lessons: 70, category: 'dermatologia', color: '#f59e0b' },
    { name: 'Ginecología', lessons: 90, category: 'ginecologia', color: '#ec4899' },
];



export default function AcademyPage() {
    return (
        <div className="min-h-screen">
            {/* ============================================
                HERO SECTION
                ============================================ */}
            {/* ============================================
                HERO SECTION
                ============================================ */}
            <section className="relative min-h-screen flex items-center px-4 overflow-hidden bg-slate-950 pt-32 md:pt-40">
                {/* 3D Background */}
                <AcademyHeroContainer />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0 pointer-events-none" />

                <div className="container mx-auto max-w-7xl relative z-10 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-12 h-full">
                        {/* Left Content */}
                        <div className="flex-1 text-left space-y-8 py-12 md:py-0">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full border border-cyan-500/20 backdrop-blur-sm">
                                <FlaskConical className="w-4 h-4 text-cyan-400" />
                                <span className="text-sm text-cyan-300 font-bold tracking-wide">
                                    METODOLOGÍA CIENTÍFICA
                                </span>
                            </div>

                            {/* Título */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight">
                                El ADN del <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
                                    Conocimiento
                                </span>
                            </h1>

                            {/* Subtítulo */}
                            <p className="text-lg md:text-xl text-white/60 max-w-xl leading-relaxed">
                                Plataforma de educación continua basada en evidencia.
                                Domina nuevas especialidades con tecnología de aprendizaje inmersivo.
                            </p>

                            {/* CTAs Unificados */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Link href="/registro?type=patient&redirect=/academy/dashboard">
                                    <Button
                                        size="lg"
                                        className="w-full sm:w-auto bg-white text-slate-950 hover:bg-cyan-50 text-lg font-bold px-8 h-12 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
                                    >
                                        Comenzar Gratis
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Trust Indicators */}
                            <div className="pt-8 flex items-center gap-6 text-sm text-white/40 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Certificación Verificable</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                    <span>Avalado por Especialistas</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Spacer (for 3D element visibility and floating stats) */}
                        <div className="flex-1 hidden md:flex items-start justify-end h-full pt-16 z-10">
                            <AcademyStatsContainer />
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                METODOLOGÍA CIENTÍFICA (INTERACTIVE)
                ============================================ */}
            <MethodologySection />

            {/* ============================================
                STUDENT PATH (INTERACTIVE TIMELINE)
                ============================================ */}
            <StudentPathSection />

            {/* ============================================
                ESPECIALIDADES DESTACADAS
                ============================================ */}
            <section className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12 gap-4">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                                Especialidades Destacadas
                            </h2>
                            <p className="text-white/50">
                                115+ especialidades médicas con contenido desde básico hasta avanzado
                            </p>
                        </div>
                        <Link href="/academy/cursos">
                            <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                Ver Todas
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURED_SPECIALTIES.map((specialty) => (
                            <Link
                                key={specialty.name}
                                href={`/academy/cursos/${specialty.name.toLowerCase().replace(/ /g, '-')}`}
                            >
                                <Card className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group h-full">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                style={{ backgroundColor: `${specialty.color}20` }}
                                            >
                                                <BookOpen
                                                    className="w-6 h-6"
                                                    style={{ color: specialty.color }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                                                    {specialty.name}
                                                </h3>
                                                <p className="text-sm text-white/40">
                                                    {specialty.lessons} lecciones
                                                </p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-white/50 transition-colors" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* ============================================
                CERTIFICACIONES
                ============================================ */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl">
                    <Card className="bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10 border-white/10 overflow-hidden">
                        <CardContent className="p-8 md:p-12">
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-shrink-0">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/30">
                                        <Award className="w-12 h-12 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                                        Certificaciones Verificables
                                    </h2>
                                    <p className="text-white/60 mb-6">
                                        Obtén certificados por cada curso completado. Nuestras certificaciones
                                        incluyen verificación digital y pueden compartirse en redes profesionales.
                                    </p>
                                    <Link href="/academy/certificaciones">
                                        <Button className="bg-white/10 hover:bg-white/20 text-white">
                                            Conocer Más
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* ============================================
                CTA FINAL
                ============================================ */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <Sparkles className="w-12 h-12 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        Comienza Tu Aprendizaje Hoy
                    </h2>
                    <p className="text-white/50 mb-8 max-w-xl mx-auto">
                        Acceso gratuito al primer módulo de cualquier especialidad.
                        Sin tarjeta de crédito requerida.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/registro?type=patient&redirect=/academy/dashboard">
                            <Button
                                size="lg"
                                className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-lg px-10 shadow-xl shadow-cyan-500/25"
                            >
                                Comenzar Gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/academy/planes">
                            <Button
                                size="lg"
                                variant="outline"
                                className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 text-lg px-10"
                            >
                                Ver Planes Premium
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

