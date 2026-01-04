/**
 * @file progress.types.ts
 * @description Tipos TypeScript para el sistema de progreso del usuario en Academy
 * @module Academy/Types
 */

/** Estado de progreso en una lección */
export type ProgressStatus =
    | 'not_started'   // No ha comenzado
    | 'in_progress'   // En progreso
    | 'completed'     // Completada
    | 'mastered';     // Dominada (3 estrellas)

/** Número de estrellas obtenidas */
export type StarRating = 0 | 1 | 2 | 3;

/**
 * Progreso del usuario en una lección específica
 */
export interface UserLessonProgress {
    /** ID único del registro */
    id: string;
    /** ID del usuario */
    userId: string;
    /** ID de la lección */
    lessonId: string;
    /** Estado actual */
    status: ProgressStatus;
    /** Puntaje (0-100) */
    score: number;
    /** Estrellas obtenidas (0-3) */
    stars: StarRating;
    /** Número de intentos */
    attempts: number;
    /** Mejor puntaje histórico */
    bestScore: number;
    /** Tiempo total invertido en segundos */
    timeSpentSeconds: number;
    /** Fecha de completación */
    completedAt: string | null;
    /** Fecha del último intento */
    lastAttemptedAt: string | null;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Respuesta del usuario a una pregunta
 */
export interface UserAnswer {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** ID de la pregunta */
    questionId: string;
    /** ID del progreso de la lección */
    progressId: string | null;
    /** Respuesta del usuario */
    userAnswer: unknown;
    /** Si fue correcta */
    isCorrect: boolean;
    /** Tiempo en segundos para responder */
    timeTakenSeconds: number | null;
    /** Número de intento */
    attemptNumber: number;
    /** Fecha de respuesta */
    createdAt: string;
}

/**
 * Resumen de progreso en una unidad
 */
export interface UnitProgressSummary {
    /** ID de la unidad */
    unitId: string;
    /** Total de lecciones */
    totalLessons: number;
    /** Lecciones completadas */
    completedLessons: number;
    /** Porcentaje de progreso */
    progressPercent: number;
    /** Total de estrellas posibles */
    totalStars: number;
    /** Estrellas obtenidas */
    earnedStars: number;
    /** Si la unidad está completa */
    isComplete: boolean;
}

/**
 * Resumen de progreso en un nivel
 */
export interface LevelProgressSummary {
    /** ID del nivel */
    levelId: string;
    /** Total de unidades */
    totalUnits: number;
    /** Unidades completadas */
    completedUnits: number;
    /** Porcentaje de progreso */
    progressPercent: number;
    /** XP ganado en este nivel */
    xpEarned: number;
    /** Si el nivel está completo */
    isComplete: boolean;
    /** Si el nivel está bloqueado */
    isLocked: boolean;
    /** Progreso por unidad */
    units: UnitProgressSummary[];
}

/**
 * Resumen de progreso en una especialidad
 */
export interface SpecialtyProgressSummary {
    /** ID de la especialidad */
    specialtyId: string;
    /** Slug de la especialidad */
    slug: string;
    /** Nombre de la especialidad */
    name: string;
    /** Total de niveles */
    totalLevels: number;
    /** Niveles completados */
    completedLevels: number;
    /** Nivel actual desbloqueado */
    currentLevel: number;
    /** Porcentaje de progreso total */
    progressPercent: number;
    /** Total de lecciones */
    totalLessons: number;
    /** Lecciones completadas */
    completedLessons: number;
    /** XP total ganado */
    totalXpEarned: number;
    /** Tiempo total invertido (minutos) */
    totalTimeMinutes: number;
    /** Si está completado */
    isComplete: boolean;
    /** Si tiene certificación */
    hasCertificate: boolean;
    /** Progreso por nivel */
    levels: LevelProgressSummary[];
}

/**
 * Estado de una sesión de aprendizaje activa
 */
export interface LearningSession {
    /** ID de la lección actual */
    lessonId: string;
    /** Índice de la pregunta actual (0-based) */
    currentQuestionIndex: number;
    /** Total de preguntas */
    totalQuestions: number;
    /** Respuestas correctas en esta sesión */
    correctAnswers: number;
    /** Vidas restantes */
    livesRemaining: number;
    /** XP acumulado en esta sesión */
    xpEarned: number;
    /** Tiempo transcurrido en segundos */
    elapsedSeconds: number;
    /** Si la sesión está activa */
    isActive: boolean;
    /** Timestamp de inicio */
    startedAt: string;
}

/**
 * Resultado al completar una lección
 */
export interface LessonCompletionResult {
    /** Si se completó exitosamente */
    success: boolean;
    /** Puntaje obtenido (0-100) */
    score: number;
    /** Estrellas ganadas */
    stars: StarRating;
    /** XP ganado */
    xpEarned: number;
    /** Gemas ganadas */
    gemsEarned: number;
    /** Si es nuevo récord personal */
    isNewRecord: boolean;
    /** Respuestas correctas */
    correctAnswers: number;
    /** Total de preguntas */
    totalQuestions: number;
    /** Tiempo total en segundos */
    timeSeconds: number;
    /** Si se mantuvo la racha */
    streakMaintained: boolean;
    /** Nueva racha actual */
    currentStreak: number;
    /** Logros desbloqueados */
    achievementsUnlocked: string[];
    /** Si subió de nivel */
    leveledUp: boolean;
    /** Nuevo nivel si subió */
    newLevel?: number;
}

/**
 * Estadísticas de aprendizaje del día
 */
export interface DailyLearningStats {
    /** Fecha */
    date: string;
    /** Lecciones completadas hoy */
    lessonsCompleted: number;
    /** XP ganado hoy */
    xpEarned: number;
    /** Minutos estudiados */
    minutesStudied: number;
    /** Racha mantenida */
    streakMaintained: boolean;
    /** Objetivo diario completado */
    dailyGoalMet: boolean;
}
