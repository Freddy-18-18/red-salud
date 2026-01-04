/**
 * @file page.tsx
 * @description Landing específica para Profesionales de la Salud.
 * 
 * @module Academy/Profesionales
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Stethoscope,
    Award,
    BookOpen,
    TrendingUp,
    Users,
    CheckCircle2,
    ArrowRight,
    FileText,
    Clock,
    Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Para Profesionales de la Salud',
    description:
        'Formación médica continua con certificaciones CME válidas. Mantén tu conocimiento actualizado.',
};

/** Beneficios para profesionales */
const BENEFITS = [
    {
        icon: Award,
        title: 'Certificaciones CME',
        description:
            'Obtén créditos de Educación Médica Continua válidos con cada curso completado.',
    },
    {
        icon: TrendingUp,
        title: 'Actualización Constante',
        description:
            'Contenido actualizado con las últimas investigaciones y guías clínicas.',
    },
    {
        icon: FileText,
        title: 'Casos Clínicos',
        description:
            'Practica con casos clínicos reales y situaciones complejas de la vida real.',
    },
    {
        icon: Clock,
        title: 'Aprende a Tu Ritmo',
        description:
            'Micro-lecciones diseñadas para profesionales ocupados. Estudia en cualquier momento.',
    },
    {
        icon: Users,
        title: 'Comunidad Profesional',
        description:
            'Conecta con colegas, comparte conocimiento y discute casos en foros especializados.',
    },
    {
        icon: Shield,
        title: 'Perfil Verificado',
        description:
            'Tu perfil profesional verificado se integra con el ecosistema Red-Salud.',
    },
];

/** Especialidades destacadas para profesionales */
const PRO_SPECIALTIES = [
    { name: 'Medicina de Emergencias', modules: 18, cme: 24 },
    { name: 'Cuidados Intensivos', modules: 15, cme: 20 },
    { name: 'Cardiología Avanzada', modules: 22, cme: 30 },
    { name: 'Oncología Clínica', modules: 20, cme: 28 },
];

export default function ProfesionalesPage() {
    return (
        <div className="min-h-screen py-8">
            {/* Hero */}
            <section className="px-4 py-12 md:py-20">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20 mb-6">
                                <Stethoscope className="w-4 h-4 text-blue-400" />
                                <span className="text-sm text-blue-300 font-medium">
                                    Para Profesionales
                                </span>
                            </div>

                            {/* Título */}
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Formación Médica{' '}
                                <span className="text-blue-400">Continua</span>
                            </h1>

                            {/* Descripción */}
                            <p className="text-lg text-white/60 mb-8 leading-relaxed">
                                Mantén tu conocimiento actualizado con cursos diseñados por
                                especialistas. Obtén certificaciones CME válidas mientras
                                estudias a tu propio ritmo.
                            </p>

                            {/* Stats rápidas */}
                            <div className="flex gap-8 mb-8">
                                <div>
                                    <div className="text-3xl font-bold text-white">115+</div>
                                    <div className="text-sm text-white/50">Especialidades</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-blue-400">CME</div>
                                    <div className="text-sm text-white/50">Certificados</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-white">24/7</div>
                                    <div className="text-sm text-white/50">Acceso</div>
                                </div>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <Link href="/registro?type=doctor&redirect=/academy/dashboard">
                                    <Button className="bg-blue-500 hover:bg-blue-400 text-white">
                                        Registrarse como Profesional
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/academy/cursos">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                        Ver Cursos
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="aspect-square rounded-3xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 flex items-center justify-center">
                                    <Stethoscope className="w-32 h-32 text-blue-400/50" />
                                </div>
                                {/* Decoración */}
                                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-blue-500/30 blur-xl" />
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-3xl bg-indigo-500/20 blur-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beneficios */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Diseñado para Profesionales de la Salud
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFITS.map((benefit) => (
                            <Card key={benefit.title} className="bg-white/[0.03] border-white/5">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-white/50">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Especialidades Pro */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        Cursos Destacados para Profesionales
                    </h2>
                    <p className="text-white/50 text-center mb-8">
                        Contenido de nivel especialista con certificación CME
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {PRO_SPECIALTIES.map((specialty) => (
                            <Link
                                key={specialty.name}
                                href={`/academy/cursos/${specialty.name.toLowerCase().replace(/ /g, '-')}`}
                            >
                                <Card className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer group">
                                    <CardContent className="p-5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                                                {specialty.name}
                                            </h3>
                                            <div className="flex gap-4 text-xs text-white/40">
                                                <span>{specialty.modules} módulos</span>
                                                <span className="text-blue-400">{specialty.cme} créditos CME</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Requisitos */}
            <section className="px-4 py-12 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="container mx-auto max-w-3xl">
                    <Card className="bg-white/[0.03] border-white/10">
                        <CardContent className="p-8">
                            <h2 className="text-xl font-bold text-white mb-6 text-center">
                                ¿Cómo verificar mi condición de profesional?
                            </h2>
                            <div className="space-y-4">
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-medium">Registro en Red-Salud Médicos</p>
                                        <p className="text-sm text-white/50">
                                            Si ya eres médico registrado en Red-Salud, tu cuenta se vincula automáticamente.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-medium">Verificación de título</p>
                                        <p className="text-sm text-white/50">
                                            Sube tu título profesional y número de colegiatura para verificación.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-white font-medium">Estudiantes de medicina</p>
                                        <p className="text-sm text-white/50">
                                            Verifica con tu correo universitario para acceso a descuentos especiales.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-2xl text-center">
                    <Award className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Invierte en Tu Desarrollo Profesional
                    </h2>
                    <p className="text-white/50 mb-6">
                        Únete a miles de profesionales de la salud que mantienen su
                        conocimiento actualizado con Academy.
                    </p>
                    <Link href="/registro?type=doctor&redirect=/academy/dashboard">
                        <Button size="lg" className="bg-blue-500 hover:bg-blue-400 text-white px-8">
                            Comenzar Ahora
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
