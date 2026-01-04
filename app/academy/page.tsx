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
    GraduationCap,
    Brain,
    Target,
    TrendingUp,
    Award,
    Users,
    BookOpen,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    BarChart3,
    Clock,
    FlaskConical,
    Stethoscope,
    Heart,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Educación Médica Basada en Evidencia',
    description:
        'La plataforma de aprendizaje médico más avanzada de Venezuela. Metodología científica comprobada para pacientes y profesionales de la salud.',
};

/** Metodologías científicas que usamos */
const METHODOLOGIES = [
    {
        icon: Brain,
        title: 'Repetición Espaciada',
        description:
            'Algoritmos que optimizan el momento exacto para repasar contenido, maximizando la retención a largo plazo.',
        metric: '87%',
        metricLabel: 'mejor retención',
    },
    {
        icon: Target,
        title: 'Práctica de Recuperación',
        description:
            'Evaluaciones frecuentes que fortalecen las conexiones neuronales y consolidan el aprendizaje.',
        metric: '2.5x',
        metricLabel: 'más efectivo',
    },
    {
        icon: TrendingUp,
        title: 'Aprendizaje Intercalado',
        description:
            'Mezclar temas relacionados para construir una comprensión más profunda y flexible del conocimiento.',
        metric: '43%',
        metricLabel: 'mejor aplicación',
    },
    {
        icon: BarChart3,
        title: 'Análisis de Progreso',
        description:
            'Métricas detalladas que identifican áreas de mejora y personalizan tu ruta de aprendizaje.',
        metric: '100%',
        metricLabel: 'personalizado',
    },
];

/** Especialidades destacadas */
const FEATURED_SPECIALTIES = [
    { name: 'Cardiología', lessons: 120, category: 'cardiovascular', color: '#ef4444' },
    { name: 'Neurología', lessons: 95, category: 'neurologia', color: '#8b5cf6' },
    { name: 'Medicina Interna', lessons: 150, category: 'general', color: '#3b82f6' },
    { name: 'Pediatría', lessons: 85, category: 'pediatria', color: '#10b981' },
    { name: 'Dermatología', lessons: 70, category: 'dermatologia', color: '#f59e0b' },
    { name: 'Ginecología', lessons: 90, category: 'ginecologia', color: '#ec4899' },
];

/** Estadísticas de la plataforma */
const STATS = [
    { value: '115+', label: 'Especialidades' },
    { value: '2,500+', label: 'Lecciones' },
    { value: '50K+', label: 'Estudiantes' },
    { value: '95%', label: 'Satisfacción' },
];

/** Beneficios por tipo de usuario */
const USER_BENEFITS = {
    patients: [
        'Entiende tus diagnósticos con claridad',
        'Aprende a prevenir enfermedades',
        'Toma decisiones informadas sobre tu salud',
        'Comunicación efectiva con tu médico',
    ],
    professionals: [
        'Mantén tu formación actualizada',
        'Certificaciones con validez profesional',
        'Contenido basado en evidencia científica',
        'Acceso a las últimas investigaciones',
    ],
};

export default function AcademyPage() {
    return (
        <div className="min-h-screen">
            {/* ============================================
                HERO SECTION
                ============================================ */}
            <section className="relative py-20 md:py-32 px-4 overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Gradiente principal */}
                    <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/30 via-transparent to-transparent" />
                    {/* Orbes de luz */}
                    <div className="absolute top-20 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
                    {/* Grid pattern */}
                    <div
                        className="absolute inset-0 opacity-[0.02]"
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        }}
                    />
                </div>

                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center space-y-8">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20">
                            <FlaskConical className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-300 font-medium">
                                Metodología Científica Comprobada
                            </span>
                        </div>

                        {/* Título */}
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                            Educación Médica{' '}
                            <span className="gradient-academy-text">Basada en Evidencia</span>
                        </h1>

                        {/* Subtítulo */}
                        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
                            La plataforma de aprendizaje más avanzada de Venezuela. Cursos desde nivel básico
                            hasta especialista, diseñados con metodología científica para pacientes y
                            profesionales de la salud.
                        </p>

                        {/* CTAs principales */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                            <Link href="/academy/pacientes">
                                <Button
                                    size="lg"
                                    className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-lg px-8 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all"
                                >
                                    <Heart className="w-5 h-5 mr-2" />
                                    Soy Paciente
                                </Button>
                            </Link>
                            <Link href="/academy/profesionales">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 text-lg px-8"
                                >
                                    <Stethoscope className="w-5 h-5 mr-2" />
                                    Soy Profesional
                                </Button>
                            </Link>
                        </div>

                        {/* Stats rápidas */}
                        <div className="flex flex-wrap justify-center gap-8 md:gap-12 pt-8 border-t border-white/5 mt-8">
                            {STATS.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-white/40">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                METODOLOGÍA CIENTÍFICA
                ============================================ */}
            <section className="py-20 px-4 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full text-blue-400 text-sm font-medium mb-4">
                            <Brain className="w-4 h-4" />
                            Ciencia del Aprendizaje
                        </div>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Aprendizaje Basado en Neurociencia
                        </h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Utilizamos las técnicas de estudio más efectivas según la investigación científica,
                            no técnicas de gamificación superficial.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {METHODOLOGIES.map((method, index) => (
                            <Card
                                key={method.title}
                                className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center flex-shrink-0 group-hover:from-cyan-500/30 group-hover:to-blue-600/30 transition-colors">
                                            <method.icon className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="text-lg font-semibold text-white">
                                                    {method.title}
                                                </h3>
                                                <div className="text-right">
                                                    <div className="text-xl font-bold text-cyan-400">
                                                        {method.metric}
                                                    </div>
                                                    <div className="text-xs text-white/40">
                                                        {method.metricLabel}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/50 leading-relaxed">
                                                {method.description}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-10">
                        <Link href="/academy/metodologia">
                            <Button variant="link" className="text-cyan-400 hover:text-cyan-300">
                                Conoce nuestra metodología en detalle
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ============================================
                PARA QUIÉN ES
                ============================================ */}
            <section className="py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Diseñado Para Ti
                        </h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Dos rutas de aprendizaje especializadas según tu perfil y objetivos.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Pacientes */}
                        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/20 hover:border-emerald-500/40 transition-all overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                                        <Heart className="w-7 h-7 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Para Pacientes</h3>
                                        <p className="text-emerald-400/80 text-sm">
                                            Empoderamiento en salud
                                        </p>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {USER_BENEFITS.patients.map((benefit) => (
                                        <li key={benefit} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-white/70">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/academy/pacientes">
                                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white">
                                        Explorar Cursos para Pacientes
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Profesionales */}
                        <Card className="bg-gradient-to-br from-blue-500/10 to-indigo-500/5 border-blue-500/20 hover:border-blue-500/40 transition-all overflow-hidden group">
                            <CardContent className="p-8">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center">
                                        <Stethoscope className="w-7 h-7 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-white">Para Profesionales</h3>
                                        <p className="text-blue-400/80 text-sm">
                                            Formación continua
                                        </p>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-8">
                                    {USER_BENEFITS.professionals.map((benefit) => (
                                        <li key={benefit} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                                            <span className="text-white/70">{benefit}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Link href="/academy/profesionales">
                                    <Button className="w-full bg-blue-500 hover:bg-blue-400 text-white">
                                        Explorar Cursos Profesionales
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

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
