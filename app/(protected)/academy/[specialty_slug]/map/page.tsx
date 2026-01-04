/**
 * @file page.tsx
 * @description Página del mapa de aprendizaje (Skill Tree) para una especialidad
 */

import React from 'react';
import { notFound } from 'next/navigation';
import { AcademyLessonService } from '@/lib/academy/services/lesson.service';
import { AcademyProgressService } from '@/lib/academy/services/progress.service';
import { SkillTree } from '@/components/academy/skill-tree';
import { SkillTreeUnit } from '@/components/academy/skill-tree/SkillTree.types';

interface AcademyMapPageProps {
    params: Promise<{
        specialty_slug: string;
    }>;
}

/**
 * Página del Mapa de la Especialidad
 * Obtiene los datos de la especialidad, niveles y unidades desde Supabase
 */
export default async function AcademyMapPage({ params }: AcademyMapPageProps) {
    const { specialty_slug } = await params;

    // 1. Obtener datos de la especialidad completa (Estructura de Árbol)
    // 1. Obtener datos de la especialidad completa (Estructura de Árbol)
    const tree = await AcademyLessonService.getSpecialtyWithTree(specialty_slug);

    if (!tree) {
        notFound();
    }

    // 2. Mock de progreso para demostración (esto luego vendrá de un servicio de perfil)
    // En una implementación real, obtendríamos el progreso del usuario actual desde Supabase
    const mockUnits: SkillTreeUnit[] = (tree.levels || []).flatMap((level: any) =>
        (level.units || []).map((unit: any, uIdx: number) => ({
            ...unit,
            isLocked: level.orderIndex > 1 && uIdx > 0, // Mock logic simplificada
            lessons: (unit.lessons || []).map((lesson: any, lIdx: number) => ({
                ...lesson,
                status: lIdx === 0 && uIdx === 0 ? 'in_progress' : 'not_started',
                isLocked: lIdx > 0 && uIdx > 0,
                stars: 0
            }))
        }))
    );

    return (
        <SkillTree
            specialtyId={tree.id}
            specialtyName={tree.name}
            color={tree.color || '#0ea5e9'}
            units={mockUnits}
        />
    );
}
