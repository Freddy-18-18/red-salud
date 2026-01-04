/**
 * @file page.tsx
 * @description Catálogo de cursos de Red-Salud Academy.
 * Muestra las 115+ especialidades organizadas por categoría.
 * 
 * @module Academy/Cursos
 */

import { Metadata } from 'next';
import Link from 'next/link';
import {
    BookOpen,
    Search,
    Filter,
    ChevronRight,
    GraduationCap,
    Clock,
    BarChart3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
    MASTER_SPECIALTIES,
    getAllCategories
} from '@/components/sections/specialties/master-list';

export const metadata: Metadata = {
    title: 'Catálogo de Cursos',
    description:
        'Explora más de 115 especialidades médicas. Cursos desde nivel básico hasta avanzado para pacientes y profesionales.',
};

/** Mapeo de categorías a nombres legibles y colores */
const CATEGORY_INFO: Record<string, { name: string; color: string; icon: string }> = {
    general: { name: 'Medicina General', color: '#3b82f6', icon: '🩺' },
    cardiovascular: { name: 'Sistema Cardiovascular', color: '#ef4444', icon: '❤️' },
    neurologia: { name: 'Neurología', color: '#8b5cf6', icon: '🧠' },
    digestivo: { name: 'Sistema Digestivo', color: '#f59e0b', icon: '🫁' },
    respiratorio: { name: 'Sistema Respiratorio', color: '#06b6d4', icon: '💨' },
    renal: { name: 'Sistema Renal', color: '#eab308', icon: '🫘' },
    endocrino: { name: 'Endocrinología', color: '#a855f7', icon: '⚗️' },
    reumatologia: { name: 'Reumatología', color: '#ec4899', icon: '🦴' },
    hematologia: { name: 'Hematología y Oncología', color: '#dc2626', icon: '🩸' },
    infectologia: { name: 'Infectología', color: '#14b8a6', icon: '🦠' },
    dermatologia: { name: 'Dermatología', color: '#f97316', icon: '✨' },
    mental: { name: 'Salud Mental', color: '#6366f1', icon: '🧘' },
    cirugia: { name: 'Cirugía General', color: '#64748b', icon: '🔪' },
    traumatologia: { name: 'Traumatología', color: '#0ea5e9', icon: '🦿' },
    oftalmologia: { name: 'Oftalmología', color: '#22d3ee', icon: '👁️' },
    orl: { name: 'Otorrinolaringología', color: '#84cc16', icon: '👂' },
    ginecologia: { name: 'Ginecología y Obstetricia', color: '#ec4899', icon: '🤰' },
    pediatria: { name: 'Pediatría', color: '#10b981', icon: '👶' },
    plastica: { name: 'Cirugía Plástica', color: '#f472b6', icon: '💎' },
    vascular: { name: 'Cirugía Vascular', color: '#e11d48', icon: '🩻' },
    intensiva: { name: 'Medicina Intensiva', color: '#b91c1c', icon: '🚨' },
    diagnostico: { name: 'Diagnóstico por Imágenes', color: '#7c3aed', icon: '📊' },
    anestesia: { name: 'Anestesiología', color: '#475569', icon: '💉' },
    patologia: { name: 'Patología', color: '#9ca3af', icon: '🔬' },
    rehabilitacion: { name: 'Rehabilitación', color: '#22c55e', icon: '🏃' },
    especializada: { name: 'Medicina Especializada', color: '#2563eb', icon: '🧬' },
    odontologia: { name: 'Odontología', color: '#f0abfc', icon: '🦷' },
    otros: { name: 'Otras Especialidades', color: '#94a3b8', icon: '➕' },
};

/** Niveles de dificultad */
const DIFFICULTY_LEVELS = [
    { id: 'basic', name: 'Básico', description: 'Para pacientes y público general', color: 'emerald' },
    { id: 'intermediate', name: 'Intermedio', description: 'Estudiantes de salud', color: 'blue' },
    { id: 'advanced', name: 'Avanzado', description: 'Profesionales médicos', color: 'purple' },
    { id: 'expert', name: 'Especialista', description: 'Formación especializada', color: 'amber' },
];

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

export default function CursosPage() {
    // Agrupar especialidades por categoría
    const categoriesArray = Array.from(getAllCategories());
    const specialtiesByCategory = categoriesArray.map((category) => ({
        category,
        info: CATEGORY_INFO[category] || { name: category, color: '#64748b', icon: '📚' },
        specialties: MASTER_SPECIALTIES.filter((s) => s.category === category),
    }));

    return (
        <div className="min-h-screen py-8">
            {/* Header */}
            <section className="px-4 mb-12">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Catálogo de Cursos
                        </h1>
                        <p className="text-white/60 max-w-2xl mx-auto">
                            Explora más de 115 especialidades médicas con contenido desde nivel
                            básico hasta especialista.
                        </p>
                    </div>

                    {/* Barra de búsqueda - Placeholder para funcionalidad futura */}
                    <div className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                            <input
                                type="text"
                                placeholder="Buscar especialidades..."
                                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                                aria-label="Buscar especialidades"
                            />
                        </div>
                    </div>

                    {/* Niveles de dificultad */}
                    <div className="flex flex-wrap justify-center gap-3 mt-8">
                        {DIFFICULTY_LEVELS.map((level) => (
                            <div
                                key={level.id}
                                className={`px-4 py-2 rounded-lg border text-sm font-medium bg-${level.color}-500/10 border-${level.color}-500/20 text-${level.color}-400`}
                                style={{
                                    backgroundColor: `hsl(var(--${level.color === 'emerald' ? 'academy-success' : level.color === 'amber' ? 'academy-gold' : 'academy-primary'}) / 0.1)`,
                                    borderColor: `hsl(var(--${level.color === 'emerald' ? 'academy-success' : level.color === 'amber' ? 'academy-gold' : 'academy-primary'}) / 0.2)`,
                                }}
                            >
                                <span className="block">{level.name}</span>
                                <span className="text-xs opacity-60">{level.description}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Lista de Categorías */}
            <section className="px-4">
                <div className="container mx-auto max-w-6xl space-y-12">
                    {specialtiesByCategory.map(({ category, info, specialties }) => (
                        <div key={category} id={category}>
                            {/* Header de categoría */}
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-2xl">{info.icon}</span>
                                <h2 className="text-xl font-bold text-white">{info.name}</h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                                <span className="text-sm text-white/40">
                                    {specialties.length} cursos
                                </span>
                            </div>

                            {/* Grid de especialidades */}
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {specialties.map((specialty) => (
                                    <Link
                                        key={specialty.id}
                                        href={`/academy/cursos/${generateSlug(specialty.name)}`}
                                    >
                                        <Card className="bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer group h-full">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                        style={{ backgroundColor: `${info.color}20` }}
                                                    >
                                                        <BookOpen
                                                            className="w-5 h-5"
                                                            style={{ color: info.color }}
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-white group-hover:text-cyan-400 transition-colors truncate">
                                                            {specialty.name}
                                                        </h3>
                                                        <div className="flex items-center gap-3 text-xs text-white/40">
                                                            <span className="flex items-center gap-1">
                                                                <BarChart3 className="w-3 h-3" />
                                                                4 niveles
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock className="w-3 h-3" />
                                                                ~20h
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors flex-shrink-0" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Final */}
            <section className="px-4 py-20">
                <div className="container mx-auto max-w-2xl text-center">
                    <GraduationCap className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-3">
                        ¿No sabes por dónde empezar?
                    </h2>
                    <p className="text-white/50 mb-6">
                        Responde algunas preguntas y te recomendaremos el mejor camino de
                        aprendizaje para ti.
                    </p>
                    <Button className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white">
                        Obtener Recomendación
                        <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            </section>
        </div>
    );
}
