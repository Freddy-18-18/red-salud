/**
 * @file lesson.service.ts
 * @description Servicio para gestionar lecciones y contenido de Red Salud Academy
 * @module Academy/Services
 * 
 * @example
 * import { AcademyLessonService } from '@/lib/academy';
 * 
 * const specialties = await AcademyLessonService.getActiveSpecialties();
 * const lesson = await AcademyLessonService.getLessonWithQuestions('lesson-id');
 */

import { createClient } from '@/lib/supabase/client';
import type {
    AcademySpecialty,
    AcademyLevel,
    AcademyUnit,
    AcademyLesson,
    AcademyQuestion,
    LessonWithDetails,
    SpecialtyWithTree,
} from '../types/lesson.types';

/**
 * Servicio para gestión de contenido educativo de Academy
 * 
 * Proporciona métodos para:
 * - Obtener especialidades, niveles, unidades y lecciones
 * - Cargar contenido completo para el reproductor de lecciones
 * - Navegación entre lecciones
 */
export const AcademyLessonService = {
    // ============================================================================
    // ESPECIALIDADES
    // ============================================================================

    /**
     * Obtiene todas las especialidades activas
     * @returns Lista de especialidades ordenadas
     */
    async getActiveSpecialties(): Promise<AcademySpecialty[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_specialties')
            .select('*')
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('[AcademyLessonService] Error fetching specialties:', error);
            throw new Error('Error al cargar especialidades');
        }

        return (data || []).map(mapSpecialtyFromDb);
    },

    /**
     * Obtiene una especialidad por su slug
     * @param slug - Slug de la especialidad (ej: 'cardiologia')
     * @returns Especialidad o null si no existe
     */
    async getSpecialtyBySlug(slug: string): Promise<AcademySpecialty | null> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_specialties')
            .select('*')
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            console.error('[AcademyLessonService] Error fetching specialty:', error);
            throw new Error('Error al cargar especialidad');
        }

        return data ? mapSpecialtyFromDb(data) : null;
    },

    /**
     * Obtiene una especialidad con su árbol completo de contenido
     * @param slug - Slug de la especialidad
     * @returns Especialidad con niveles, unidades y lecciones
     */
    async getSpecialtyWithTree(slug: string): Promise<SpecialtyWithTree | null> {
        const supabase = createClient();

        // Obtener especialidad
        const specialty = await this.getSpecialtyBySlug(slug);
        if (!specialty) return null;

        // Obtener niveles con unidades y lecciones
        const { data: levels, error: levelsError } = await supabase
            .from('academy_levels')
            .select(`
        *,
        units:academy_units (
          *,
          lessons:academy_lessons (*)
        )
      `)
            .eq('specialty_id', specialty.id)
            .order('order_index', { ascending: true });

        if (levelsError) {
            console.error('[AcademyLessonService] Error fetching specialty tree:', levelsError);
            throw new Error('Error al cargar árbol de especialidad');
        }

        // Mapear y ordenar datos
        const mappedLevels = (levels || []).map(level => ({
            ...mapLevelFromDb(level),
            units: (level.units || [])
                .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
                .map((unit: Record<string, unknown>) => ({
                    ...mapUnitFromDb(unit),
                    lessons: ((unit.lessons as Record<string, unknown>[]) || [])
                        .sort((a: any, b: any) => a.order_index - b.order_index)
                        .map(mapLessonFromDb),
                })),
        }));

        return {
            ...specialty,
            levels: mappedLevels,
        };
    },

    // ============================================================================
    // NIVELES
    // ============================================================================

    /**
     * Obtiene los niveles de una especialidad
     * @param specialtyId - ID de la especialidad
     * @returns Lista de niveles ordenados
     */
    async getLevelsBySpecialty(specialtyId: string): Promise<AcademyLevel[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_levels')
            .select('*')
            .eq('specialty_id', specialtyId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('[AcademyLessonService] Error fetching levels:', error);
            throw new Error('Error al cargar niveles');
        }

        return (data || []).map(mapLevelFromDb);
    },

    // ============================================================================
    // UNIDADES
    // ============================================================================

    /**
     * Obtiene las unidades de un nivel
     * @param levelId - ID del nivel
     * @returns Lista de unidades ordenadas
     */
    async getUnitsByLevel(levelId: string): Promise<AcademyUnit[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_units')
            .select('*')
            .eq('level_id', levelId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('[AcademyLessonService] Error fetching units:', error);
            throw new Error('Error al cargar unidades');
        }

        return (data || []).map(mapUnitFromDb);
    },

    // ============================================================================
    // LECCIONES
    // ============================================================================

    /**
     * Obtiene las lecciones de una unidad
     * @param unitId - ID de la unidad
     * @returns Lista de lecciones ordenadas
     */
    async getLessonsByUnit(unitId: string): Promise<AcademyLesson[]> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_lessons')
            .select('*')
            .eq('unit_id', unitId)
            .eq('is_active', true)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('[AcademyLessonService] Error fetching lessons:', error);
            throw new Error('Error al cargar lecciones');
        }

        return (data || []).map(mapLessonFromDb);
    },

    /**
     * Obtiene una lección con todas sus preguntas y contexto
     * Útil para el reproductor de lecciones
     * @param lessonId - ID de la lección
     * @returns Lección completa con preguntas
     */
    async getLessonWithQuestions(lessonId: string): Promise<LessonWithDetails | null> {
        const supabase = createClient();

        // Obtener lección con relaciones
        const { data: lesson, error: lessonError } = await supabase
            .from('academy_lessons')
            .select(`
        *,
        unit:academy_units (
          *,
          level:academy_levels (
            *,
            specialty:academy_specialties (*)
          )
        )
      `)
            .eq('id', lessonId)
            .eq('is_active', true)
            .single();

        if (lessonError) {
            if (lessonError.code === 'PGRST116') return null;
            console.error('[AcademyLessonService] Error fetching lesson:', lessonError);
            throw new Error('Error al cargar lección');
        }

        if (!lesson) return null;

        // Obtener preguntas de la lección
        const { data: questions, error: questionsError } = await supabase
            .from('academy_questions')
            .select('*')
            .eq('lesson_id', lessonId)
            .order('order_index', { ascending: true });

        if (questionsError) {
            console.error('[AcademyLessonService] Error fetching questions:', questionsError);
            throw new Error('Error al cargar preguntas');
        }

        return {
            ...mapLessonFromDb(lesson),
            unit: mapUnitFromDb(lesson.unit),
            level: mapLevelFromDb(lesson.unit.level),
            specialty: mapSpecialtyFromDb(lesson.unit.level.specialty),
            questions: (questions || []).map(mapQuestionFromDb),
        };
    },

    /**
     * Obtiene la siguiente lección disponible después de la actual
     * @param currentLessonId - ID de la lección actual
     * @returns Siguiente lección o null si no hay más
     */
    async getNextLesson(currentLessonId: string): Promise<AcademyLesson | null> {
        const supabase = createClient();

        // Obtener lección actual con su contexto
        const { data: current, error: currentError } = await supabase
            .from('academy_lessons')
            .select(`
        *,
        unit:academy_units (
          *,
          level:academy_levels (*)
        )
      `)
            .eq('id', currentLessonId)
            .single();

        if (currentError || !current) return null;

        // Buscar siguiente lección en la misma unidad
        const { data: nextInUnit } = await supabase
            .from('academy_lessons')
            .select('*')
            .eq('unit_id', current.unit_id)
            .eq('is_active', true)
            .gt('order_index', current.order_index)
            .order('order_index', { ascending: true })
            .limit(1)
            .single();

        if (nextInUnit) {
            return mapLessonFromDb(nextInUnit);
        }

        // Si no hay más en la unidad, buscar siguiente unidad
        const { data: nextUnit } = await supabase
            .from('academy_units')
            .select('id')
            .eq('level_id', current.unit.level_id)
            .gt('order_index', current.unit.order_index)
            .order('order_index', { ascending: true })
            .limit(1)
            .single();

        if (nextUnit) {
            const { data: firstLesson } = await supabase
                .from('academy_lessons')
                .select('*')
                .eq('unit_id', nextUnit.id)
                .eq('is_active', true)
                .order('order_index', { ascending: true })
                .limit(1)
                .single();

            if (firstLesson) {
                return mapLessonFromDb(firstLesson);
            }
        }

        // Si no hay más unidades, buscar siguiente nivel (si está desbloqueado)
        // Esto requerirá verificar el progreso del usuario
        return null;
    },
};

// ============================================================================
// MAPPERS (DB → TypeScript)
// ============================================================================

/** Mapea especialidad de DB a tipo TypeScript */
function mapSpecialtyFromDb(data: Record<string, unknown>): AcademySpecialty {
    return {
        id: data.id as string,
        name: data.name as string,
        slug: data.slug as string,
        description: data.description as string | null,
        shortDescription: data.short_description as string | null,
        icon: data.icon as string | null,
        color: data.color as string || '#0ea5e9',
        coverImageUrl: data.cover_image_url as string | null,
        orderIndex: data.order_index as number || 0,
        isPremium: data.is_premium as boolean || false,
        isActive: data.is_active as boolean || true,
        totalLessons: data.total_lessons as number || 0,
        estimatedHours: data.estimated_hours as number || 0,
        difficultyLevel: (data.difficulty_level as 1 | 2 | 3 | 4 | 5) || 1,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

/** Mapea nivel de DB a tipo TypeScript */
function mapLevelFromDb(data: Record<string, unknown>): AcademyLevel {
    return {
        id: data.id as string,
        specialtyId: data.specialty_id as string,
        name: data.name as string,
        description: data.description as string | null,
        orderIndex: data.order_index as number || 0,
        requiredXp: data.required_xp as number || 0,
        icon: data.icon as string | null,
        color: data.color as string | null,
        isLocked: data.is_locked as boolean || true,
        unlockRequirement: data.unlock_requirement as Record<string, unknown> | null,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

/** Mapea unidad de DB a tipo TypeScript */
function mapUnitFromDb(data: Record<string, unknown>): AcademyUnit {
    return {
        id: data.id as string,
        levelId: data.level_id as string,
        name: data.name as string,
        description: data.description as string | null,
        orderIndex: data.order_index as number || 0,
        icon: data.icon as string | null,
        estimatedMinutes: data.estimated_minutes as number || 30,
        isCheckpoint: data.is_checkpoint as boolean || false,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

/** Mapea lección de DB a tipo TypeScript */
function mapLessonFromDb(data: Record<string, unknown>): AcademyLesson {
    return {
        id: data.id as string,
        unitId: data.unit_id as string,
        title: data.title as string,
        type: data.type as AcademyLesson['type'] || 'standard',
        content: (data.content as AcademyLesson['content']) || {},
        orderIndex: data.order_index as number || 0,
        xpReward: data.xp_reward as number || 10,
        gemReward: data.gem_reward as number || 0,
        estimatedMinutes: data.estimated_minutes as number || 5,
        difficulty: (data.difficulty as 1 | 2 | 3 | 4 | 5) || 1,
        isPremium: data.is_premium as boolean || false,
        isActive: data.is_active as boolean || true,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

/** Mapea pregunta de DB a tipo TypeScript */
function mapQuestionFromDb(data: Record<string, unknown>): AcademyQuestion {
    return {
        id: data.id as string,
        lessonId: data.lesson_id as string,
        type: data.type as AcademyQuestion['type'] || 'multiple_choice',
        question: data.question as AcademyQuestion['question'],
        options: data.options as AcademyQuestion['options'],
        correctAnswer: data.correct_answer as AcademyQuestion['correctAnswer'],
        explanation: data.explanation as string | null,
        hint: data.hint as string | null,
        difficulty: (data.difficulty as 1 | 2 | 3 | 4 | 5) || 1,
        orderIndex: data.order_index as number || 0,
        xpBonus: data.xp_bonus as number || 0,
        createdAt: data.created_at as string,
    };
}

export default AcademyLessonService;
