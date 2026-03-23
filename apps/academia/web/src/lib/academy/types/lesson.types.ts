/**
 * @file lesson.types.ts
 * @description Tipos TypeScript para el sistema de lecciones de Red Salud Academy
 * @module Academy/Types
 */

/** Tipo de lección disponible */
export type LessonType =
    | 'standard'      // Lección estándar con preguntas
    | 'theory'        // Solo contenido teórico
    | 'practice'      // Ejercicios prácticos
    | 'quiz'          // Evaluación
    | 'case_study'    // Caso clínico
    | 'video';        // Lección en video

/** Tipo de pregunta disponible */
export type QuestionType =
    | 'multiple_choice'   // Selección múltiple (1 correcta)
    | 'true_false'        // Verdadero o falso
    | 'match_pairs'       // Emparejar conceptos
    | 'fill_blank'        // Completar espacios en blanco
    | 'order_sequence'    // Ordenar secuencia
    | 'image_select'      // Seleccionar área de imagen
    | 'drag_drop'         // Arrastrar y soltar
    | 'case_analysis';    // Análisis de caso clínico

/** Dificultad de 1 a 5 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Especialidad médica en Academy
 * @example
 * const cardio: AcademySpecialty = {
 *   id: 'uuid',
 *   name: 'Cardiología',
 *   slug: 'cardiologia',
 *   ...
 * };
 */
export interface AcademySpecialty {
    /** ID único de la especialidad */
    id: string;
    /** Nombre de la especialidad */
    name: string;
    /** Slug para URL */
    slug: string;
    /** Descripción completa */
    description: string | null;
    /** Descripción corta para cards */
    shortDescription: string | null;
    /** Nombre del icono (Lucide) */
    icon: string | null;
    /** Color hexadecimal */
    color: string;
    /** URL de imagen de portada */
    coverImageUrl: string | null;
    /** Orden de visualización */
    orderIndex: number;
    /** Si es contenido premium */
    isPremium: boolean;
    /** Si está activa */
    isActive: boolean;
    /** Total de lecciones */
    totalLessons: number;
    /** Horas estimadas para completar */
    estimatedHours: number;
    /** Nivel de dificultad general */
    difficultyLevel: DifficultyLevel;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Nivel dentro de una especialidad
 * Cada especialidad tiene 5 niveles: Fundamentos → Experto
 */
export interface AcademyLevel {
    /** ID único del nivel */
    id: string;
    /** ID de la especialidad padre */
    specialtyId: string;
    /** Nombre del nivel */
    name: string;
    /** Descripción del nivel */
    description: string | null;
    /** Orden (1-5) */
    orderIndex: number;
    /** XP requerido para desbloquear */
    requiredXp: number;
    /** Nombre del icono */
    icon: string | null;
    /** Color del nivel */
    color: string | null;
    /** Si está bloqueado para el usuario */
    isLocked: boolean;
    /** Requisitos adicionales para desbloquear */
    unlockRequirement: Record<string, unknown> | null;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Unidad dentro de un nivel
 * Agrupa lecciones temáticamente
 */
export interface AcademyUnit {
    /** ID único de la unidad */
    id: string;
    /** ID del nivel padre */
    levelId: string;
    /** Nombre de la unidad */
    name: string;
    /** Descripción de la unidad */
    description: string | null;
    /** Orden dentro del nivel */
    orderIndex: number;
    /** Nombre del icono */
    icon: string | null;
    /** Minutos estimados para completar */
    estimatedMinutes: number;
    /** Si es un checkpoint/examen */
    isCheckpoint: boolean;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Lección individual
 */
export interface AcademyLesson {
    /** ID único de la lección */
    id: string;
    /** ID de la unidad padre */
    unitId: string;
    /** Título de la lección */
    title: string;
    /** Tipo de lección */
    type: LessonType;
    /** Contenido de la lección (estructura flexible) */
    content: LessonContent;
    /** Orden dentro de la unidad */
    orderIndex: number;
    /** XP que otorga al completar */
    xpReward: number;
    /** Gemas que otorga */
    gemReward: number;
    /** Minutos estimados */
    estimatedMinutes: number;
    /** Dificultad */
    difficulty: DifficultyLevel;
    /** Si es contenido premium */
    isPremium: boolean;
    /** Si está activa */
    isActive: boolean;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Contenido estructurado de una lección
 */
export interface LessonContent {
    /** Título para mostrar */
    title?: string;
    /** Introducción o contexto */
    introduction?: string;
    /** Secciones de teoría */
    sections?: LessonSection[];
    /** URL de video (si aplica) */
    videoUrl?: string;
    /** Imágenes adicionales */
    images?: LessonImage[];
    /** Tips o notas importantes */
    tips?: string[];
    /** Referencias bibliográficas */
    references?: string[];
}

/** Sección de contenido teórico */
export interface LessonSection {
    /** Título de la sección */
    title: string;
    /** Contenido en markdown */
    content: string;
    /** Imagen asociada */
    image?: LessonImage;
}

/** Imagen dentro de una lección */
export interface LessonImage {
    /** URL de la imagen */
    url: string;
    /** Texto alternativo */
    alt: string;
    /** Caption o descripción */
    caption?: string;
}

/**
 * Pregunta dentro de una lección
 */
export interface AcademyQuestion {
    /** ID único de la pregunta */
    id: string;
    /** ID de la lección padre */
    lessonId: string;
    /** Tipo de pregunta */
    type: QuestionType;
    /** Contenido de la pregunta */
    question: QuestionContent;
    /** Opciones (para multiple choice) */
    options: QuestionOption[] | null;
    /** Respuesta correcta */
    correctAnswer: CorrectAnswer;
    /** Explicación cuando responde mal */
    explanation: string | null;
    /** Pista opcional */
    hint: string | null;
    /** Dificultad */
    difficulty: DifficultyLevel;
    /** Orden dentro de la lección */
    orderIndex: number;
    /** XP bonus por responder correctamente */
    xpBonus: number;
    /** Fecha de creación */
    createdAt: string;
}

/** Contenido de una pregunta */
export interface QuestionContent {
    /** Texto de la pregunta */
    text: string;
    /** Imagen asociada */
    imageUrl?: string;
    /** Audio asociado */
    audioUrl?: string;
    /** Contexto adicional (para casos clínicos) */
    context?: string;
}

/** Opción de respuesta para multiple choice */
export interface QuestionOption {
    /** ID de la opción */
    id: string;
    /** Texto de la opción */
    text: string;
    /** Imagen de la opción */
    imageUrl?: string;
}

/** Respuesta correcta (estructura flexible) */
export type CorrectAnswer =
    | string                    // ID de opción correcta
    | string[]                  // Múltiples IDs o secuencia
    | Record<string, string>    // Para match pairs
    | { areas: number[][] };    // Para image select

/**
 * Lección con todas sus relaciones cargadas
 * Útil para el reproductor de lecciones
 */
export interface LessonWithDetails extends AcademyLesson {
    /** Unidad padre */
    unit: AcademyUnit;
    /** Nivel padre */
    level: AcademyLevel;
    /** Especialidad padre */
    specialty: AcademySpecialty;
    /** Preguntas de la lección */
    questions: AcademyQuestion[];
}

/**
 * Especialidad con estructura completa para mostrar árbol de habilidades
 */
export interface SpecialtyWithTree extends AcademySpecialty {
    /** Niveles con sus unidades */
    levels: (AcademyLevel & {
        /** Unidades dentro del nivel */
        units: (AcademyUnit & {
            /** Lecciones dentro de la unidad */
            lessons: AcademyLesson[];
        })[];
    })[];
}
