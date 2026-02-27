/**
 * @file SkillTree.types.ts
 * @description Tipos e interfaces para el componente Skill Tree de la Academia
 */

import { AcademyUnit, AcademyLesson } from '@/lib/academy/types/lesson.types';
import { ProgressStatus } from '@/lib/academy/types/progress.types';

/**
 * Representación ampliada de una lección para la UI del árbol
 */
export interface SkillTreeLesson extends AcademyLesson {
    /** Estado de progreso actual para el usuario */
    status: ProgressStatus;
    /** Si la lección está bloqueada */
    isLocked: boolean;
    /** Cantidad de estrellas obtenidas (0-3) */
    stars?: number;
}

/**
 * Representación ampliada de una unidad para la UI del árbol
 */
export interface SkillTreeUnit extends AcademyUnit {
    /** Colección de lecciones asociadas a esta unidad */
    lessons: SkillTreeLesson[];
    /** Si todas las unidades previas han sido completadas */
    isLocked: boolean;
}

/**
 * Props para el componente SkillTree
 */
export interface SkillTreeProps {
    /** Especialidad a la que pertenece este árbol */
    specialtyId: string;
    /** Nombre de la especialidad */
    specialtyName: string;
    /** Color temático de la especialidad */
    color: string;
    /** Unidades cargadas para este árbol */
    units: SkillTreeUnit[];
    /** Clase CSS adicional */
    className?: string;
}

/**
 * Props para el componente LessonNode
 */
export interface LessonNodeProps {
    /** Datos de la lección */
    lesson: SkillTreeLesson;
    /** Color de la especialidad para efectos visuales */
    accentColor: string;
    /** Posición horizontal (offset para crear camino curvo) */
    offset?: number;
    /** Si es la lección activa sugerida */
    isActive?: boolean;
}

/**
 * Props para el componente UnitSection
 */
export interface UnitSectionProps {
    /** Datos de la unidad */
    unit: SkillTreeUnit;
    /** Color de la especialidad */
    accentColor: string;
}
