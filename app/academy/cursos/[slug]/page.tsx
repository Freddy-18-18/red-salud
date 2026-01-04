/**
 * @file page.tsx
 * @description Página de detalle de una especialidad médica.
 * Muestra información pública del curso antes de registrarse.
 * 
 * @module Academy/Cursos/[slug]
 */

import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    BookOpen,
    Clock,
    Users,
    Award,
    ChevronRight,
    CheckCircle2,
    PlayCircle,
    Lock,
    ArrowLeft,
    BarChart3,
    Target,
    Brain,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MASTER_SPECIALTIES } from '@/components/sections/specialties/master-list';
import { SPECIALTY_CONTENT } from '@/components/sections/specialties/specialties-content.data';

interface PageProps {
    params: Promise<{ slug: string }>;
}

/**
 * Genera un slug URL-friendly a partir del nombre de la especialidad
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
}

/**
 * Encuentra una especialidad por su slug
 */
function findSpecialtyBySlug(slug: string) {
    return MASTER_SPECIALTIES.find((s) => generateSlug(s.name) === slug);
}

/** Módulos de ejemplo para el curso */
const COURSE_MODULES = [
    {
        level: 'Básico',
        levelColor: 'emerald',
        title: 'Fundamentos',
        lessons: 8,
        duration: '4 horas',
        topics: ['Introducción', 'Anatomía básica', 'Síntomas comunes', 'Cuándo consultar'],
        unlocked: true,
    },
    {
        level: 'Intermedio',
        levelColor: 'blue',
        title: 'Profundización',
        lessons: 12,
        duration: '6 horas',
        topics: ['Diagnóstico', 'Tratamientos', 'Prevención', 'Casos de estudio'],
        unlocked: false,
    },
    {
        level: 'Avanzado',
        levelColor: 'purple',
        title: 'Práctica Clínica',
        lessons: 15,
        duration: '8 horas',
        topics: ['Protocolos clínicos', 'Emergencias', 'Investigación reciente'],
        unlocked: false,
    },
    {
        level: 'Especialista',
        levelColor: 'amber',
        title: 'Dominio Experto',
        lessons: 10,
        duration: '5 horas',
        topics: ['Técnicas avanzadas', 'Casos complejos', 'Certificación'],
        unlocked: false,
    },
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const specialty = findSpecialtyBySlug(slug);

    if (!specialty) {
        return { title: 'Curso no encontrado' };
    }

    return {
        title: `${specialty.name} - Curso Completo`,
        description: `Aprende ${specialty.name} desde nivel básico hasta especialista. Metodología científica y certificación.`,
    };
}

export default async function CursoDetallePage({ params }: PageProps) {
    const { slug } = await params;
    const specialty = findSpecialtyBySlug(slug);

    if (!specialty) {
        notFound();
    }

    // Buscar contenido adicional si existe
    const contentKey = slug.replace(/-/g, '');
    const specialtyContent = SPECIALTY_CONTENT[contentKey] || null;

    return (
        <div className="min-h-screen py-8">
            {/* Breadcrumb */}
            <div className="px-4 mb-8">
                <div className="container mx-auto max-w-6xl">
                    <Link
                        href="/academy/cursos"
                        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al catálogo
                    </Link>
                </div>
            </div>

            {/* Hero del curso */}
            <section className="px-4 mb-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Info principal */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Badge de especialidad */}
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 rounded-full text-cyan-400 text-sm">
                                <BookOpen className="w-4 h-4" />
                                Curso Completo
                            </div>

                            {/* Título */}
                            <h1 className="text-3xl md:text-4xl font-bold text-white">
                                {specialty.name}
                            </h1>

                            {/* Descripción */}
                            <p className="text-lg text-white/60 leading-relaxed">
                                {specialtyContent?.description ||
                                    `Domina ${specialty.name} desde los fundamentos hasta el nivel especialista. Curso diseñado con metodología científica para máxima retención.`}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-6 py-4 border-y border-white/10">
                                <div className="flex items-center gap-2 text-white/70">
                                    <BookOpen className="w-5 h-5 text-cyan-400" />
                                    <span>45 lecciones</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <Clock className="w-5 h-5 text-cyan-400" />
                                    <span>~23 horas</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <BarChart3 className="w-5 h-5 text-cyan-400" />
                                    <span>4 niveles</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/70">
                                    <Award className="w-5 h-5 text-cyan-400" />
                                    <span>Certificación incluida</span>
                                </div>
                            </div>

                            {/* Lo que aprenderás */}
                            <div>
                                <h2 className="text-xl font-semibold text-white mb-4">
                                    Lo que aprenderás
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-3">
                                    {(
                                        specialtyContent?.whenToGo ||
                                        [
                                            'Fundamentos y anatomía relacionada',
                                            'Síntomas y señales de alerta',
                                            'Métodos de diagnóstico',
                                            'Tratamientos actuales',
                                            'Prevención y autocuidado',
                                            'Cuándo buscar atención médica',
                                        ]
                                    )
                                        .slice(0, 6)
                                        .map((item, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-white/70 text-sm">{item}</span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* Card de inscripción */}
                        <div className="lg:col-span-1">
                            <Card className="bg-white/[0.03] border-white/10 sticky top-24">
                                <CardContent className="p-6 space-y-6">
                                    {/* Preview */}
                                    <div className="aspect-video bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl flex items-center justify-center cursor-pointer hover:from-cyan-500/30 hover:to-blue-600/30 transition-colors">
                                        <PlayCircle className="w-16 h-16 text-white/50" />
                                    </div>

                                    {/* Precio */}
                                    <div className="text-center">
                                        <div className="text-sm text-white/50 mb-1">Módulo básico</div>
                                        <div className="text-3xl font-bold text-white">Gratis</div>
                                        <div className="text-sm text-white/40 mt-1">
                                            Premium para acceso completo
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={`/registro?type=patient&redirect=/academy/ruta/${slug}`}
                                        className="block"
                                    >
                                        <Button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg py-6">
                                            Comenzar Gratis
                                        </Button>
                                    </Link>

                                    {/* Features */}
                                    <ul className="space-y-3 text-sm">
                                        <li className="flex items-center gap-2 text-white/60">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            Acceso inmediato al módulo básico
                                        </li>
                                        <li className="flex items-center gap-2 text-white/60">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            Sin tarjeta de crédito
                                        </li>
                                        <li className="flex items-center gap-2 text-white/60">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                            Progreso guardado siempre
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contenido del curso */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl font-bold text-white mb-8">
                        Contenido del Curso
                    </h2>

                    <div className="space-y-4">
                        {COURSE_MODULES.map((module, index) => (
                            <Card
                                key={index}
                                className={`bg-white/[0.03] border-white/5 ${module.unlocked ? 'hover:bg-white/[0.06]' : 'opacity-75'
                                    } transition-all`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start gap-4">
                                        {/* Número de módulo */}
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-lg"
                                            style={{
                                                backgroundColor:
                                                    module.levelColor === 'emerald'
                                                        ? '#10b98120'
                                                        : module.levelColor === 'blue'
                                                            ? '#3b82f620'
                                                            : module.levelColor === 'purple'
                                                                ? '#a855f720'
                                                                : '#eab30820',
                                                color:
                                                    module.levelColor === 'emerald'
                                                        ? '#10b981'
                                                        : module.levelColor === 'blue'
                                                            ? '#3b82f6'
                                                            : module.levelColor === 'purple'
                                                                ? '#a855f7'
                                                                : '#eab308',
                                            }}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Info del módulo */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span
                                                    className="text-xs font-medium px-2 py-0.5 rounded"
                                                    style={{
                                                        backgroundColor:
                                                            module.levelColor === 'emerald'
                                                                ? '#10b98120'
                                                                : module.levelColor === 'blue'
                                                                    ? '#3b82f620'
                                                                    : module.levelColor === 'purple'
                                                                        ? '#a855f720'
                                                                        : '#eab30820',
                                                        color:
                                                            module.levelColor === 'emerald'
                                                                ? '#10b981'
                                                                : module.levelColor === 'blue'
                                                                    ? '#3b82f6'
                                                                    : module.levelColor === 'purple'
                                                                        ? '#a855f7'
                                                                        : '#eab308',
                                                    }}
                                                >
                                                    {module.level}
                                                </span>
                                                <h3 className="text-lg font-semibold text-white">
                                                    {module.title}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-white/40 mb-3">
                                                <span>{module.lessons} lecciones</span>
                                                <span>{module.duration}</span>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {module.topics.map((topic) => (
                                                    <span
                                                        key={topic}
                                                        className="text-xs px-2 py-1 bg-white/5 rounded text-white/50"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Estado */}
                                        <div className="flex-shrink-0">
                                            {module.unlocked ? (
                                                <span className="text-xs text-emerald-400 flex items-center gap-1">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    Gratis
                                                </span>
                                            ) : (
                                                <span className="text-xs text-white/30 flex items-center gap-1">
                                                    <Lock className="w-4 h-4" />
                                                    Premium
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Metodología */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid md:grid-cols-3 gap-6">
                        <Card className="bg-white/[0.03] border-white/5">
                            <CardContent className="p-6 text-center">
                                <Brain className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-white mb-2">
                                    Repetición Espaciada
                                </h3>
                                <p className="text-sm text-white/50">
                                    Algoritmos que optimizan cuándo repasar cada concepto.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.03] border-white/5">
                            <CardContent className="p-6 text-center">
                                <Target className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-white mb-2">
                                    Práctica Activa
                                </h3>
                                <p className="text-sm text-white/50">
                                    Ejercicios y evaluaciones que fortalecen el aprendizaje.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.03] border-white/5">
                            <CardContent className="p-6 text-center">
                                <Award className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
                                <h3 className="font-semibold text-white mb-2">
                                    Certificación
                                </h3>
                                <p className="text-sm text-white/50">
                                    Obtén un certificado verificable al completar el curso.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA Final */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-2xl text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">
                        ¿Listo para empezar?
                    </h2>
                    <p className="text-white/50 mb-6">
                        Comienza con el módulo básico completamente gratis.
                    </p>
                    <Link href={`/registro?type=patient&redirect=/academy/ruta/${slug}`}>
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-10"
                        >
                            Comenzar Ahora
                            <ChevronRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
