/**
 * @file page.tsx
 * @description Página de Metodología de Red-Salud Academy.
 * Explica los métodos científicos de aprendizaje utilizados.
 * 
 * @module Academy/Metodologia
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Brain,
    Target,
    TrendingUp,
    BarChart3,
    Zap,
    Repeat,
    BookOpen,
    CheckCircle2,
    ArrowRight,
    FlaskConical,
    Lightbulb,
    Clock,
    Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Metodología Científica',
    description:
        'Conoce los métodos de aprendizaje basados en neurociencia que hacen de Academy la plataforma más efectiva.',
};

/** Principios científicos del aprendizaje */
const LEARNING_PRINCIPLES = [
    {
        icon: Repeat,
        title: 'Repetición Espaciada',
        subtitle: 'Spaced Repetition',
        description:
            'En lugar de estudiar todo de una vez, distribuimos el aprendizaje en intervalos óptimos. Nuestro algoritmo calcula exactamente cuándo necesitas repasar cada concepto para maximizar la retención a largo plazo.',
        stats: [
            { value: '87%', label: 'Mayor retención' },
            { value: '2x', label: 'Menos tiempo de estudio' },
        ],
        color: 'cyan',
        references: ['Ebbinghaus, 1885', 'Cepeda et al., 2006'],
    },
    {
        icon: Target,
        title: 'Práctica de Recuperación',
        subtitle: 'Retrieval Practice',
        description:
            'Recuperar información activamente de la memoria (no solo releerla) crea conexiones neuronales más fuertes. Por eso incluimos evaluaciones frecuentes que refuerzan lo aprendido.',
        stats: [
            { value: '50%', label: 'Mejor rendimiento en exámenes' },
            { value: '3x', label: 'Mayor durabilidad' },
        ],
        color: 'emerald',
        references: ['Roediger & Karpicke, 2006'],
    },
    {
        icon: TrendingUp,
        title: 'Aprendizaje Intercalado',
        subtitle: 'Interleaving',
        description:
            'Mezclar diferentes temas y tipos de problemas durante el estudio (en lugar de bloques homogéneos) desarrolla habilidades de discriminación y mejora la aplicación del conocimiento.',
        stats: [
            { value: '43%', label: 'Mejor transferencia' },
            { value: '∞', label: 'Aplicación flexible' },
        ],
        color: 'purple',
        references: ['Rohrer & Taylor, 2007'],
    },
    {
        icon: Lightbulb,
        title: 'Aprendizaje Activo',
        subtitle: 'Active Learning',
        description:
            'Participar activamente en el proceso de aprendizaje (resolver problemas, explicar conceptos, hacer conexiones) es significativamente más efectivo que la lectura pasiva.',
        stats: [
            { value: '6x', label: 'Más efectivo' },
            { value: '95%', label: 'Retención con práctica' },
        ],
        color: 'amber',
        references: ['Freeman et al., 2014'],
    },
];

/** Comparación con métodos tradicionales */
const COMPARISON_ITEMS = [
    {
        traditional: 'Estudiar intensivamente antes del examen',
        academy: 'Sesiones cortas distribuidas en el tiempo',
        benefit: 'Retención a largo plazo vs. olvido rápido',
    },
    {
        traditional: 'Releer notas y subrayar',
        academy: 'Evaluaciones frecuentes y recall activo',
        benefit: 'Conexiones neuronales más fuertes',
    },
    {
        traditional: 'Estudiar un tema hasta dominarlo',
        academy: 'Alternar entre temas relacionados',
        benefit: 'Mayor capacidad de aplicación',
    },
    {
        traditional: 'Contenido genérico para todos',
        academy: 'Rutas personalizadas con IA',
        benefit: 'Eficiencia máxima del tiempo',
    },
];

export default function MetodologiaPage() {
    return (
        <div className="min-h-screen py-8">
            {/* Hero */}
            <section className="px-4 py-12 md:py-20">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center max-w-3xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 rounded-full border border-cyan-500/20 mb-6">
                            <FlaskConical className="w-4 h-4 text-cyan-400" />
                            <span className="text-sm text-cyan-300 font-medium">
                                Basado en Neurociencia
                            </span>
                        </div>

                        {/* Título */}
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            La Ciencia Detrás de{' '}
                            <span className="gradient-academy-text">Tu Aprendizaje</span>
                        </h1>

                        {/* Descripción */}
                        <p className="text-lg text-white/60 leading-relaxed mb-8">
                            No usamos gamificación superficial. Academy está construido sobre
                            décadas de investigación en ciencias cognitivas y psicología del
                            aprendizaje para maximizar tu retención y comprensión.
                        </p>

                        {/* CTA */}
                        <Link href="/academy/cursos">
                            <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                                Explorar Cursos
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Principios de Aprendizaje */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Principios Científicos
                        </h2>
                        <p className="text-white/50 max-w-2xl mx-auto">
                            Cada técnica que utilizamos está respaldada por investigación
                            revisada por pares.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {LEARNING_PRINCIPLES.map((principle) => (
                            <Card
                                key={principle.title}
                                className="bg-white/[0.03] border-white/5 overflow-hidden"
                            >
                                <CardContent className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                            style={{
                                                backgroundColor:
                                                    principle.color === 'cyan'
                                                        ? '#0891b220'
                                                        : principle.color === 'emerald'
                                                            ? '#10b98120'
                                                            : principle.color === 'purple'
                                                                ? '#a855f720'
                                                                : '#f5920820',
                                                color:
                                                    principle.color === 'cyan'
                                                        ? '#0891b2'
                                                        : principle.color === 'emerald'
                                                            ? '#10b981'
                                                            : principle.color === 'purple'
                                                                ? '#a855f7'
                                                                : '#f59208',
                                            }}
                                        >
                                            <principle.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white">
                                                {principle.title}
                                            </h3>
                                            <p className="text-sm text-white/40 italic">
                                                {principle.subtitle}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Descripción */}
                                    <p className="text-white/60 text-sm leading-relaxed mb-4">
                                        {principle.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex gap-6 mb-4 py-4 border-y border-white/5">
                                        {principle.stats.map((stat) => (
                                            <div key={stat.label}>
                                                <div
                                                    className="text-2xl font-bold"
                                                    style={{
                                                        color:
                                                            principle.color === 'cyan'
                                                                ? '#22d3ee'
                                                                : principle.color === 'emerald'
                                                                    ? '#34d399'
                                                                    : principle.color === 'purple'
                                                                        ? '#c084fc'
                                                                        : '#fcd34d',
                                                    }}
                                                >
                                                    {stat.value}
                                                </div>
                                                <div className="text-xs text-white/40">
                                                    {stat.label}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Referencias */}
                                    <div className="text-xs text-white/30">
                                        Referencias: {principle.references.join(', ')}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Comparación */}
            <section className="px-4 py-20">
                <div className="container mx-auto max-w-4xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Academy vs. Métodos Tradicionales
                        </h2>
                        <p className="text-white/50">
                            Por qué nuestro enfoque produce mejores resultados.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {COMPARISON_ITEMS.map((item, index) => (
                            <Card
                                key={index}
                                className="bg-white/[0.02] border-white/5"
                            >
                                <CardContent className="p-0">
                                    <div className="grid md:grid-cols-3">
                                        {/* Tradicional */}
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-white/5">
                                            <div className="text-xs text-red-400/60 uppercase tracking-wider mb-2">
                                                Método Tradicional
                                            </div>
                                            <p className="text-white/50 text-sm line-through decoration-red-400/30">
                                                {item.traditional}
                                            </p>
                                        </div>

                                        {/* Academy */}
                                        <div className="p-6 border-b md:border-b-0 md:border-r border-white/5 bg-cyan-500/5">
                                            <div className="text-xs text-cyan-400 uppercase tracking-wider mb-2">
                                                Academy
                                            </div>
                                            <p className="text-white text-sm font-medium">
                                                {item.academy}
                                            </p>
                                        </div>

                                        {/* Beneficio */}
                                        <div className="p-6">
                                            <div className="text-xs text-emerald-400/60 uppercase tracking-wider mb-2">
                                                Beneficio
                                            </div>
                                            <p className="text-emerald-400/80 text-sm">
                                                {item.benefit}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cómo Funciona */}
            <section className="px-4 py-12 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Cómo Funciona en la Práctica
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6">
                        <Card className="bg-white/[0.03] border-white/5 text-center">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-6 h-6 text-cyan-400" />
                                </div>
                                <div className="text-cyan-400 font-bold text-sm mb-2">Paso 1</div>
                                <h3 className="font-semibold text-white mb-2">Aprende</h3>
                                <p className="text-xs text-white/50">
                                    Contenido en formato micro-lecciones fáciles de digerir.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.03] border-white/5 text-center">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-emerald-400 font-bold text-sm mb-2">Paso 2</div>
                                <h3 className="font-semibold text-white mb-2">Practica</h3>
                                <p className="text-xs text-white/50">
                                    Ejercicios y quizzes que refuerzan el aprendizaje activo.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.03] border-white/5 text-center">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-6 h-6 text-purple-400" />
                                </div>
                                <div className="text-purple-400 font-bold text-sm mb-2">Paso 3</div>
                                <h3 className="font-semibold text-white mb-2">Repasa</h3>
                                <p className="text-xs text-white/50">
                                    Notificaciones en el momento óptimo para repasar.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="bg-white/[0.03] border-white/5 text-center">
                            <CardContent className="p-6">
                                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-6 h-6 text-amber-400" />
                                </div>
                                <div className="text-amber-400 font-bold text-sm mb-2">Paso 4</div>
                                <h3 className="font-semibold text-white mb-2">Certifícate</h3>
                                <p className="text-xs text-white/50">
                                    Demuestra tu conocimiento con certificaciones verificables.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-20">
                <div className="container mx-auto max-w-2xl text-center">
                    <Brain className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Aprende de Forma Más Inteligente
                    </h2>
                    <p className="text-white/50 mb-8">
                        No trabajes más duro, trabaja más inteligente. Nuestra metodología
                        está diseñada para maximizar tu tiempo de estudio.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/registro?type=patient&redirect=/academy/dashboard">
                            <Button
                                size="lg"
                                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8"
                            >
                                Comenzar Gratis
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                        <Link href="/academy/cursos">
                            <Button
                                size="lg"
                                variant="outline"
                                className="border-white/20 text-white hover:bg-white/5 px-8"
                            >
                                Ver Cursos
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
