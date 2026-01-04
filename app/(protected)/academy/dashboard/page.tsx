/**
 * @file page.tsx
 * @description Dashboard principal para estudiantes/profesionales de Academy.
 * 
 * @module Academy/Dashboard
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    PlayCircle,
    Clock,
    Award,
    BookOpen,
    TrendingUp,
    ArrowRight,
    LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
    title: 'Dashboard - Academy',
    description: 'Mi centro de aprendizaje personal.',
};

/** Mock Data para el Dashboard */
const CONTINUE_LEARNING = {
    course: 'Cardiología Clínica',
    module: 'Módulo 2: Electrocardiografía Avanzada',
    lesson: 'Interpretación de Arritmias Ventriculares',
    progress: 35,
    lastAccessed: 'Hace 2 horas',
    image: 'from-blue-600 to-indigo-600'
};

const STATS = [
    { label: 'Cursos Completados', value: '3', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Créditos CME', value: '12', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Horas de Estudio', value: '45h', icon: Clock, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const RECOMMENDED_COURSES = [
    { name: 'Neurología para No Especialistas', category: 'Neurología', level: 'Intermedio', duration: '5h 30m' },
    { name: 'Antibioitoterapia Práctica', category: 'Infectología', level: 'Avanzado', duration: '4h 15m' },
    { name: 'Manejo del Dolor Crónico', category: 'Medicina General', level: 'Básico', duration: '3h 45m' },
];

export default function AcademyDashboardPage() {
    return (
        <div className="space-y-8">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">
                        Hola, <span className="text-blue-400">Dr. Usuario</span>
                    </h1>
                    <p className="text-slate-400">
                        Bienvenido de vuelta. Continúa donde lo dejaste.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/academy/cursos">
                        <Button variant="outline" className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                            Explorar Cursos
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Continue Learning "Hero" Card */}
            <div className={`rounded-3xl p-6 md:p-8 bg-gradient-to-br ${CONTINUE_LEARNING.image} relative overflow-hidden shadow-2xl shadow-blue-900/20`}>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
                    <div className="space-y-4 max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
                            <PlayCircle className="w-3 h-3" />
                            Continuar Aprendiendo
                        </div>
                        <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                                {CONTINUE_LEARNING.module}
                            </h2>
                            <p className="text-blue-100 text-lg">
                                {CONTINUE_LEARNING.lesson}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-blue-100/80">
                            <span>{CONTINUE_LEARNING.course}</span>
                            <span>•</span>
                            <span>{CONTINUE_LEARNING.lastAccessed}</span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full max-w-md">
                            <div className="flex justify-between text-xs text-blue-200 mb-2">
                                <span>Progreso</span>
                                <span>{CONTINUE_LEARNING.progress}%</span>
                            </div>
                            <div className="h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
                                <div
                                    className="h-full bg-white rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${CONTINUE_LEARNING.progress}%` }}
                                />
                            </div>
                        </div>

                        <Button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold border-none mt-4">
                            Reanudar Lección
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>

                    {/* Decorative Element */}
                    <div className="hidden md:block absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-y-1/4 translate-x-1/4">
                        <PlayCircle className="w-96 h-96 text-white" />
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {STATS.map((stat) => (
                    <Card key={stat.label} className="bg-slate-900/50 border-slate-800 backdrop-blur-sm">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Recommended Section */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Recomendado para ti</h3>
                    <Link href="/academy/cursos" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                        Ver todo
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {RECOMMENDED_COURSES.map((course) => (
                        <Card key={course.name} className="bg-slate-900/50 border-slate-800 hover:bg-slate-800/80 transition-all cursor-pointer group">
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                                        {course.category}
                                    </span>
                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {course.duration}
                                    </span>
                                </div>
                                <CardTitle className="text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                    {course.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between text-sm">
                                    <span className={`
                                        font-medium
                                        ${course.level === 'Básico' ? 'text-emerald-400' : ''}
                                        ${course.level === 'Intermedio' ? 'text-blue-400' : ''}
                                        ${course.level === 'Avanzado' ? 'text-purple-400' : ''}
                                    `}>
                                        {course.level}
                                    </span>
                                    <TrendingUp className="w-4 h-4 text-slate-600 group-hover:text-blue-500 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
