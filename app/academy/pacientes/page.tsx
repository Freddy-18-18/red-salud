/**
 * @file page.tsx
 * @description Landing específica para Pacientes.
 * 
 * @module Academy/Pacientes
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    Heart,
    Shield,
    BookOpen,
    MessageCircle,
    Brain,
    Sparkles,
    CheckCircle2,
    ArrowRight,
    Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Para Pacientes',
    description:
        'Empoderamiento en salud. Aprende a entender tus diagnósticos, prevenir enfermedades y tomar mejores decisiones.',
};

/** Beneficios para pacientes */
const BENEFITS = [
    {
        icon: Brain,
        title: 'Entiende Tu Salud',
        description:
            'Aprende qué significan tus diagnósticos y resultados de laboratorio en términos simples.',
    },
    {
        icon: Shield,
        title: 'Prevención Activa',
        description:
            'Conoce cómo prevenir enfermedades comunes y cuándo buscar atención médica.',
    },
    {
        icon: MessageCircle,
        title: 'Mejor Comunicación',
        description:
            'Haz las preguntas correctas a tu médico y entiende mejor sus explicaciones.',
    },
    {
        icon: Heart,
        title: 'Autocuidado',
        description:
            'Aprende técnicas de autocuidado respaldadas por la ciencia para mejorar tu bienestar.',
    },
    {
        icon: Users,
        title: 'Comunidad de Apoyo',
        description:
            'Conecta con otros pacientes que comparten experiencias similares.',
    },
    {
        icon: Sparkles,
        title: 'Contenido Verificado',
        description:
            'Todo nuestro contenido es revisado por profesionales de la salud.',
    },
];

/** Cursos populares para pacientes */
const POPULAR_COURSES = [
    {
        name: 'Hipertensión: Lo que debes saber',
        category: 'Cardiología',
        lessons: 8,
        duration: '2 horas',
    },
    {
        name: 'Diabetes tipo 2: Guía completa',
        category: 'Endocrinología',
        lessons: 12,
        duration: '3 horas',
    },
    {
        name: 'Ansiedad y estrés: Manejo efectivo',
        category: 'Salud Mental',
        lessons: 10,
        duration: '2.5 horas',
    },
    {
        name: 'Alimentación saludable para toda la familia',
        category: 'Nutrición',
        lessons: 8,
        duration: '2 horas',
    },
];

/** Testimonios */
const TESTIMONIALS = [
    {
        quote: 'Finalmente entiendo mi condición. Ahora sé qué preguntas hacerle a mi médico.',
        author: 'María G.',
        condition: 'Paciente con diabetes',
    },
    {
        quote: 'Los cursos son muy fáciles de seguir. Me siento más empoderada sobre mi salud.',
        author: 'José R.',
        condition: 'Paciente con hipertensión',
    },
];

export default function PacientesPage() {
    return (
        <div className="min-h-screen py-8">
            {/* Hero */}
            <section className="px-4 py-12 md:py-20">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-6">
                                <Heart className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm text-emerald-300 font-medium">
                                    Para Pacientes
                                </span>
                            </div>

                            {/* Título */}
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Tu Salud,{' '}
                                <span className="text-emerald-400">Tu Conocimiento</span>
                            </h1>

                            {/* Descripción */}
                            <p className="text-lg text-white/60 mb-8 leading-relaxed">
                                Empodérate con conocimiento médico confiable. Aprende a entender
                                tus diagnósticos, prevenir enfermedades y tomar mejores decisiones
                                sobre tu salud.
                            </p>

                            {/* Beneficios rápidos */}
                            <div className="space-y-3 mb-8">
                                {[
                                    'Contenido en lenguaje simple y accesible',
                                    'Revisado por profesionales médicos',
                                    'Módulos básicos completamente gratis',
                                ].map((item) => (
                                    <div key={item} className="flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <span className="text-white/70">{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-wrap gap-4">
                                <Link href="/registro?type=patient&redirect=/academy/dashboard">
                                    <Button className="bg-emerald-500 hover:bg-emerald-400 text-white">
                                        Comenzar Gratis
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </Link>
                                <Link href="/academy/cursos">
                                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/5">
                                        Explorar Cursos
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Visual */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                <div className="aspect-square rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-600/20 flex items-center justify-center">
                                    <Heart className="w-32 h-32 text-emerald-400/50" />
                                </div>
                                {/* Decoración */}
                                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl bg-emerald-500/30 blur-xl" />
                                <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-3xl bg-teal-500/20 blur-xl" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Beneficios */}
            <section className="px-4 py-12 bg-gradient-to-b from-transparent to-slate-900/50">
                <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        ¿Por Qué Aprender Sobre Tu Salud?
                    </h2>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BENEFITS.map((benefit) => (
                            <Card key={benefit.title} className="bg-white/[0.03] border-white/5">
                                <CardContent className="p-6">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                        <benefit.icon className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                                    <p className="text-sm text-white/50">{benefit.description}</p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cursos populares */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-2 text-center">
                        Cursos Populares
                    </h2>
                    <p className="text-white/50 text-center mb-8">
                        Comienza con estos cursos diseñados especialmente para pacientes
                    </p>

                    <div className="grid sm:grid-cols-2 gap-4">
                        {POPULAR_COURSES.map((course) => (
                            <Card
                                key={course.name}
                                className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] transition-all cursor-pointer group"
                            >
                                <CardContent className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                            <BookOpen className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">
                                                {course.name}
                                            </h3>
                                            <div className="text-xs text-emerald-400/80 mb-2">
                                                {course.category}
                                            </div>
                                            <div className="flex gap-3 text-xs text-white/40">
                                                <span>{course.lessons} lecciones</span>
                                                <span>{course.duration}</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonios */}
            <section className="px-4 py-12 bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="container mx-auto max-w-4xl">
                    <h2 className="text-2xl font-bold text-white mb-8 text-center">
                        Lo Que Dicen Nuestros Usuarios
                    </h2>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {TESTIMONIALS.map((testimonial, index) => (
                            <Card key={index} className="bg-white/[0.03] border-white/5">
                                <CardContent className="p-6">
                                    <p className="text-white/70 italic mb-4">"{testimonial.quote}"</p>
                                    <div>
                                        <div className="font-medium text-white">{testimonial.author}</div>
                                        <div className="text-xs text-emerald-400/80">{testimonial.condition}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-12">
                <div className="container mx-auto max-w-2xl text-center">
                    <Sparkles className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        Comienza Tu Viaje de Aprendizaje
                    </h2>
                    <p className="text-white/50 mb-6">
                        El primer módulo de cada curso es completamente gratis.
                        No necesitas tarjeta de crédito.
                    </p>
                    <Link href="/registro?type=patient&redirect=/academy/dashboard">
                        <Button
                            size="lg"
                            className="bg-emerald-500 hover:bg-emerald-400 text-white px-8"
                        >
                            Empezar Ahora
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </section>
        </div>
    );
}
