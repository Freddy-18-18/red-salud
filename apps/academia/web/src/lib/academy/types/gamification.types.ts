/**
 * @file gamification.types.ts
 * @description Tipos TypeScript para el sistema de gamificación de Red Salud Academy
 * @module Academy/Types
 */

/** Tier de liga */
export type LeagueTier =
    | 'bronze'    // Bronce - inicial
    | 'silver'    // Plata
    | 'gold'      // Oro
    | 'platinum'  // Platino
    | 'diamond'   // Diamante
    | 'master';   // Maestro - máximo

/** Categoría de logro */
export type AchievementCategory =
    | 'streak'    // Logros de rachas
    | 'progress'  // Progreso general
    | 'mastery'   // Dominio de contenido
    | 'social'    // Ligas y competencia
    | 'speed'     // Velocidad
    | 'special';  // Especiales

/** Tier de logro */
export type AchievementTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/** Estado de suscripción */
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'paused';

/** Período de facturación */
export type BillingPeriod = 'monthly' | 'quarterly' | 'yearly' | 'lifetime';

/**
 * Estadísticas de gamificación del usuario
 */
export interface UserStats {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;

    // XP y Nivel
    /** XP total acumulado */
    totalXp: number;
    /** Nivel actual */
    currentLevel: number;
    /** XP necesario para siguiente nivel */
    xpToNextLevel: number;

    // Moneda virtual
    /** Gemas disponibles */
    gems: number;

    // Rachas
    /** Racha actual en días */
    currentStreak: number;
    /** Racha más larga histórica */
    longestStreak: number;
    /** Fecha de última actividad */
    lastActivityDate: string | null;
    /** Streak freeze disponibles */
    streakFreezeAvailable: number;

    // Vidas
    /** Vidas actuales */
    lives: number;
    /** Máximo de vidas */
    maxLives: number;
    /** Última recarga de vidas */
    livesLastRefill: string;
    /** Vidas ilimitadas hasta (premium) */
    unlimitedLivesUntil: string | null;

    // Liga actual
    /** Liga actual */
    currentLeague: LeagueTier;
    /** XP ganado esta semana (para liga) */
    leagueXpThisWeek: number;
    /** Fecha de inicio de la semana de liga */
    leagueStartDate: string | null;

    // Estadísticas generales
    /** Total de lecciones completadas */
    totalLessonsCompleted: number;
    /** Total de preguntas respondidas */
    totalQuestionsAnswered: number;
    /** Total de respuestas correctas */
    totalCorrectAnswers: number;
    /** Tiempo total de estudio (minutos) */
    totalTimeSpentMinutes: number;

    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
}

/**
 * Información de nivel y XP para UI
 */
export interface LevelInfo {
    /** Nivel actual */
    level: number;
    /** XP actual */
    currentXp: number;
    /** XP mínimo para este nivel */
    levelMinXp: number;
    /** XP para el siguiente nivel */
    levelMaxXp: number;
    /** Progreso dentro del nivel (0-100) */
    progressPercent: number;
    /** XP restante para subir */
    xpRemaining: number;
}

/**
 * Información de racha para UI
 */
export interface StreakInfo {
    /** Días de racha actual */
    currentStreak: number;
    /** Mejor racha histórica */
    longestStreak: number;
    /** Si está en riesgo (no ha estudiado hoy) */
    isAtRisk: boolean;
    /** Streak freeze disponibles */
    freezeAvailable: number;
    /** Si ya estudió hoy */
    studiedToday: boolean;
    /** Hora límite para mantener racha */
    deadline: string | null;
}

/**
 * Información de vidas para UI
 */
export interface LivesInfo {
    /** Vidas actuales */
    current: number;
    /** Máximo de vidas */
    max: number;
    /** Si tiene vidas ilimitadas (premium) */
    isUnlimited: boolean;
    /** Tiempo restante para próxima vida (segundos) */
    nextLifeIn: number | null;
    /** Tiempo para recarga completa (segundos) */
    fullRefillIn: number | null;
}

/**
 * Registro de historial de racha
 */
export interface StreakHistoryEntry {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** Fecha */
    date: string;
    /** Lecciones completadas ese día */
    lessonsCompleted: number;
    /** XP ganado ese día */
    xpEarned: number;
    /** Minutos estudiados */
    timeSpentMinutes: number;
    /** Si se mantuvo la racha */
    streakMaintained: boolean;
    /** Si se usó streak freeze */
    streakFreezeUsed: boolean;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Logro/Insignia
 */
export interface Achievement {
    /** ID único */
    id: string;
    /** Código único */
    code: string;
    /** Nombre del logro */
    name: string;
    /** Descripción */
    description: string;
    /** Icono (Lucide) */
    icon: string;
    /** URL de imagen personalizada */
    imageUrl: string | null;
    /** Categoría */
    category: AchievementCategory;
    /** Tier */
    tier: AchievementTier;
    /** Requisitos para desbloquear */
    requirement: Record<string, unknown>;
    /** XP de recompensa */
    xpReward: number;
    /** Gemas de recompensa */
    gemReward: number;
    /** Si es logro oculto */
    isHidden: boolean;
    /** Si está activo */
    isActive: boolean;
    /** Orden de visualización */
    orderIndex: number;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Logro del usuario con progreso
 */
export interface UserAchievement {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** ID del logro */
    achievementId: string;
    /** Progreso actual */
    progress: Record<string, unknown>;
    /** Fecha de desbloqueo (null si no desbloqueado) */
    unlockedAt: string | null;
    /** Si ya se mostró notificación */
    notified: boolean;
    /** Fecha de creación */
    createdAt: string;
    /** Datos del logro relacionado */
    achievement?: Achievement;
}

/**
 * Liga semanal
 */
export interface League {
    /** ID único */
    id: string;
    /** Fecha de inicio de la semana */
    weekStart: string;
    /** Fecha de fin de la semana */
    weekEnd: string;
    /** Tier de la liga */
    tier: LeagueTier;
    /** Estado */
    status: 'active' | 'finished';
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Participante en una liga
 */
export interface LeagueParticipant {
    /** ID único */
    id: string;
    /** ID de la liga */
    leagueId: string;
    /** ID del usuario */
    userId: string;
    /** XP ganado en la semana */
    xpEarned: number;
    /** Posición final */
    finalPosition: number | null;
    /** Si fue promovido */
    promoted: boolean;
    /** Si fue degradado */
    demoted: boolean;
    /** Si se mantuvo */
    stayed: boolean;
    /** Si reclamó recompensas */
    rewardsClaimed: boolean;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Participante con datos de usuario para leaderboard
 */
export interface LeaderboardEntry {
    /** Posición actual */
    position: number;
    /** ID del usuario */
    userId: string;
    /** Nombre del usuario */
    userName: string;
    /** Avatar del usuario */
    userAvatar: string | null;
    /** XP ganado esta semana */
    xpEarned: number;
    /** Si es el usuario actual */
    isCurrentUser: boolean;
    /** Cambio de posición vs ayer */
    positionChange: number;
}

/**
 * Información de liga del usuario
 */
export interface UserLeagueInfo {
    /** Liga actual */
    currentLeague: League | null;
    /** Tier actual */
    tier: LeagueTier;
    /** Posición actual */
    currentPosition: number;
    /** Total de participantes */
    totalParticipants: number;
    /** XP ganado esta semana */
    xpThisWeek: number;
    /** Si está en zona de promoción */
    inPromotionZone: boolean;
    /** Si está en zona de descenso */
    inDemotionZone: boolean;
    /** Días restantes en la semana */
    daysRemaining: number;
    /** Leaderboard (top 10 + usuario) */
    leaderboard: LeaderboardEntry[];
}

/**
 * Certificado emitido
 */
export interface Certificate {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** ID de la especialidad */
    specialtyId: string;
    /** ID del nivel */
    levelId: string;
    /** Número único de certificado */
    certificateNumber: string;
    /** Tipo de certificado */
    certificateType: 'completion' | 'excellence' | 'mastery';
    /** Nombre del usuario (al momento de emisión) */
    userName: string;
    /** Nombre de la especialidad */
    specialtyName: string;
    /** Nombre del nivel */
    levelName: string;
    /** Puntaje final */
    finalScore: number | null;
    /** XP total ganado */
    totalXp: number | null;
    /** Horas de estudio */
    completionTimeHours: number | null;
    /** Fecha de emisión */
    issuedAt: string;
    /** Fecha de vencimiento */
    validUntil: string | null;
    /** Si es válido */
    isValid: boolean;
    /** Fecha de revocación */
    revokedAt: string | null;
    /** Razón de revocación */
    revocationReason: string | null;
    /** Hash blockchain */
    blockchainHash: string | null;
    /** URL de verificación */
    verificationUrl: string | null;
    /** Metadata adicional */
    metadata: Record<string, unknown>;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Plan de suscripción
 */
export interface SubscriptionPlan {
    /** ID único */
    id: string;
    /** Código único */
    code: string;
    /** Nombre del plan */
    name: string;
    /** Descripción */
    description: string | null;
    /** Precio en USD */
    priceUsd: number;
    /** Precio en moneda local */
    priceLocal: number | null;
    /** Período de facturación */
    billingPeriod: BillingPeriod;
    /** Lista de características */
    features: string[];
    /** Máximo de especialidades (null = ilimitado) */
    maxSpecialties: number | null;
    /** Incluye certificados */
    includesCertificates: boolean;
    /** Incluye vidas ilimitadas */
    includesUnlimitedLives: boolean;
    /** Streak freeze incluidos por mes */
    includesStreakFreeze: number;
    /** Días de prueba */
    trialDays: number;
    /** Si está activo */
    isActive: boolean;
    /** Orden de visualización */
    orderIndex: number;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Suscripción de usuario
 */
export interface Subscription {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** ID del plan */
    planId: string;
    /** Estado actual */
    status: SubscriptionStatus;
    /** Inicio del período de prueba */
    trialStartedAt: string | null;
    /** Fin del período de prueba */
    trialEndsAt: string | null;
    /** Fecha de inicio */
    startedAt: string;
    /** Inicio del período actual */
    currentPeriodStart: string;
    /** Fin del período actual */
    currentPeriodEnd: string | null;
    /** Fecha de cancelación */
    cancelledAt: string | null;
    /** Fecha de expiración */
    expiresAt: string | null;
    /** Proveedor de pago */
    paymentProvider: string | null;
    /** ID de pago */
    paymentId: string | null;
    /** Renovación automática */
    autoRenew: boolean;
    /** Metadata */
    metadata: Record<string, unknown>;
    /** Fecha de creación */
    createdAt: string;
    /** Fecha de última actualización */
    updatedAt: string;
    /** Plan relacionado */
    plan?: SubscriptionPlan;
}

/**
 * Estado premium del usuario (para verificación rápida)
 */
export interface PremiumStatus {
    /** Si tiene acceso premium */
    isPremium: boolean;
    /** Tipo de plan */
    planType: string | null;
    /** Fecha de expiración */
    expiresAt: string | null;
    /** Si tiene vidas ilimitadas */
    hasUnlimitedLives: boolean;
    /** Si puede obtener certificados */
    canGetCertificates: boolean;
    /** Días de prueba restantes */
    trialDaysRemaining: number | null;
}

/**
 * Transacción de gemas
 */
export interface GemTransaction {
    /** ID único */
    id: string;
    /** ID del usuario */
    userId: string;
    /** Cantidad (positivo = ganancia, negativo = gasto) */
    amount: number;
    /** Balance después de transacción */
    balanceAfter: number;
    /** Tipo de transacción */
    transactionType: 'reward' | 'purchase' | 'spend' | 'refund' | 'bonus' | 'admin';
    /** Descripción */
    description: string | null;
    /** Tipo de referencia */
    referenceType: string | null;
    /** ID de referencia */
    referenceId: string | null;
    /** Fecha de creación */
    createdAt: string;
}

/**
 * Tienda de gemas - Item comprable
 */
export interface ShopItem {
    /** ID único */
    id: string;
    /** Código único */
    code: string;
    /** Nombre del item */
    name: string;
    /** Descripción */
    description: string;
    /** Tipo de item */
    type: 'streak_freeze' | 'extra_lives' | 'xp_boost' | 'cosmetic';
    /** Precio en gemas */
    gemPrice: number;
    /** Icono */
    icon: string;
    /** Si está disponible */
    isAvailable: boolean;
    /** Límite de compra por usuario */
    purchaseLimit: number | null;
}
