/**
 * @file gamification.service.ts
 * @description Servicio para el sistema de gamificación de Academy (XP, rachas, vidas, ligas)
 * @module Academy/Services
 */

import { createClient } from '@/lib/supabase/client';
import type { UserStats, StreakInfo, LivesInfo, LevelInfo, LeagueTier } from '../types/gamification.types';

/** XP necesario por nivel (progresión exponencial suave) */
const XP_PER_LEVEL = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];

/** Tiempo de recarga de vidas en segundos */
const LIFE_REFILL_TIME = 30 * 60; // 30 minutos

/**
 * Servicio para gestión de gamificación de Academy
 */
export const AcademyGamificationService = {
    /**
     * Obtiene las estadísticas del usuario
     */
    async getUserStats(userId: string): Promise<UserStats | null> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            console.error('[AcademyGamificationService] Error:', error);
            throw new Error('Error al obtener estadísticas');
        }

        return data ? mapStatsFromDb(data) : null;
    },

    /**
     * Añade XP al usuario y verifica si sube de nivel
     */
    async addXp(userId: string, amount: number): Promise<{ newXp: number; leveledUp: boolean; newLevel: number }> {
        const supabase = createClient();
        const stats = await this.getUserStats(userId);
        if (!stats) throw new Error('Usuario no encontrado');

        const newXp = stats.totalXp + amount;
        const { level: newLevel, xpToNext } = calculateLevel(newXp);
        const leveledUp = newLevel > stats.currentLevel;

        await supabase.from('academy_user_stats').update({
            total_xp: newXp,
            current_level: newLevel,
            xp_to_next_level: xpToNext,
            league_xp_this_week: stats.leagueXpThisWeek + amount,
        }).eq('user_id', userId);

        return { newXp, leveledUp, newLevel };
    },

    /**
     * Obtiene información de racha actual
     */
    async getStreakInfo(userId: string): Promise<StreakInfo> {
        const stats = await this.getUserStats(userId);
        const today = new Date().toISOString().split('T')[0];
        const studiedToday = stats?.lastActivityDate === today;

        return {
            currentStreak: stats?.currentStreak ?? 0,
            longestStreak: stats?.longestStreak ?? 0,
            isAtRisk: !studiedToday && (stats?.currentStreak ?? 0) > 0,
            freezeAvailable: stats?.streakFreezeAvailable ?? 0,
            studiedToday,
            deadline: !studiedToday ? `${today}T23:59:59` : null,
        };
    },

    /**
     * Actualiza la racha del día
     */
    async updateStreak(userId: string, xpEarned: number): Promise<{ newStreak: number; maintained: boolean }> {
        const supabase = createClient();
        const stats = await this.getUserStats(userId);
        if (!stats) throw new Error('Usuario no encontrado');

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let newStreak = stats.currentStreak;
        let maintained = false;

        if (stats.lastActivityDate === today) {
            // Ya estudió hoy, solo actualizar XP del día
            maintained = true;
        } else if (stats.lastActivityDate === yesterday) {
            // Estudió ayer, incrementar racha
            newStreak = stats.currentStreak + 1;
            maintained = true;
        } else if (stats.streakFreezeAvailable > 0 && stats.currentStreak > 0) {
            // Usar streak freeze
            await supabase.from('academy_user_stats').update({
                streak_freeze_available: stats.streakFreezeAvailable - 1,
            }).eq('user_id', userId);
            newStreak = stats.currentStreak + 1;
            maintained = true;
        } else {
            // Racha perdida, reiniciar
            newStreak = 1;
        }

        // Actualizar stats
        await supabase.from('academy_user_stats').update({
            current_streak: newStreak,
            longest_streak: Math.max(newStreak, stats.longestStreak),
            last_activity_date: today,
        }).eq('user_id', userId);

        // Registrar en historial
        await supabase.from('academy_streak_history').upsert({
            user_id: userId,
            date: today,
            xp_earned: xpEarned,
            lessons_completed: 1,
            streak_maintained: maintained,
        }, { onConflict: 'user_id,date' });

        return { newStreak, maintained };
    },

    /**
     * Obtiene información de vidas
     */
    async getLivesInfo(userId: string): Promise<LivesInfo> {
        const stats = await this.getUserStats(userId);
        if (!stats) return { current: 5, max: 5, isUnlimited: false, nextLifeIn: null, fullRefillIn: null };

        const now = Date.now();
        const unlimitedUntil = stats.unlimitedLivesUntil ? new Date(stats.unlimitedLivesUntil).getTime() : 0;
        const isUnlimited = unlimitedUntil > now;

        if (isUnlimited) {
            return { current: stats.maxLives, max: stats.maxLives, isUnlimited: true, nextLifeIn: null, fullRefillIn: null };
        }

        // Calcular vidas regeneradas desde última recarga
        const lastRefill = new Date(stats.livesLastRefill).getTime();
        const secondsSinceRefill = Math.floor((now - lastRefill) / 1000);
        const livesRegened = Math.floor(secondsSinceRefill / LIFE_REFILL_TIME);
        const currentLives = Math.min(stats.lives + livesRegened, stats.maxLives);

        const nextLifeIn = currentLives < stats.maxLives
            ? LIFE_REFILL_TIME - (secondsSinceRefill % LIFE_REFILL_TIME)
            : null;

        return {
            current: currentLives,
            max: stats.maxLives,
            isUnlimited: false,
            nextLifeIn,
            fullRefillIn: nextLifeIn ? nextLifeIn + (stats.maxLives - currentLives - 1) * LIFE_REFILL_TIME : null,
        };
    },

    /**
     * Consume una vida
     */
    async useLife(userId: string): Promise<{ success: boolean; livesRemaining: number }> {
        const livesInfo = await this.getLivesInfo(userId);
        if (livesInfo.isUnlimited) return { success: true, livesRemaining: livesInfo.max };
        if (livesInfo.current <= 0) return { success: false, livesRemaining: 0 };

        const supabase = createClient();
        await supabase.from('academy_user_stats').update({
            lives: livesInfo.current - 1,
            lives_last_refill: new Date().toISOString(),
        }).eq('user_id', userId);

        return { success: true, livesRemaining: livesInfo.current - 1 };
    },

    /**
     * Añade o resta gemas
     */
    async updateGems(
        userId: string,
        amount: number,
        type: 'reward' | 'purchase' | 'spend',
        description: string
    ): Promise<number> {
        const supabase = createClient();
        const stats = await this.getUserStats(userId);
        if (!stats) throw new Error('Usuario no encontrado');

        const newBalance = Math.max(0, stats.gems + amount);

        await supabase.from('academy_user_stats').update({ gems: newBalance }).eq('user_id', userId);

        // Registrar transacción
        await supabase.from('academy_gem_transactions').insert({
            user_id: userId,
            amount,
            balance_after: newBalance,
            transaction_type: type,
            description,
        });

        return newBalance;
    },
};

/** Calcula nivel basado en XP total */
function calculateLevel(totalXp: number): { level: number; xpToNext: number } {
    let level = 1;
    for (let i = 1; i < XP_PER_LEVEL.length; i++) {
        if (totalXp >= XP_PER_LEVEL[i]) level = i + 1;
        else break;
    }
    const nextLevelXp = XP_PER_LEVEL[level] ?? XP_PER_LEVEL[level - 1] + 600;
    return { level, xpToNext: nextLevelXp - totalXp };
}

/** Mapea stats de DB a tipo TypeScript */
function mapStatsFromDb(data: Record<string, unknown>): UserStats {
    return {
        id: data.id as string,
        userId: data.user_id as string,
        totalXp: (data.total_xp as number) || 0,
        currentLevel: (data.current_level as number) || 1,
        xpToNextLevel: (data.xp_to_next_level as number) || 100,
        gems: (data.gems as number) || 0,
        currentStreak: (data.current_streak as number) || 0,
        longestStreak: (data.longest_streak as number) || 0,
        lastActivityDate: data.last_activity_date as string | null,
        streakFreezeAvailable: (data.streak_freeze_available as number) || 0,
        lives: (data.lives as number) || 5,
        maxLives: (data.max_lives as number) || 5,
        livesLastRefill: data.lives_last_refill as string,
        unlimitedLivesUntil: data.unlimited_lives_until as string | null,
        currentLeague: (data.current_league as LeagueTier) || 'bronze',
        leagueXpThisWeek: (data.league_xp_this_week as number) || 0,
        leagueStartDate: data.league_start_date as string | null,
        totalLessonsCompleted: (data.total_lessons_completed as number) || 0,
        totalQuestionsAnswered: (data.total_questions_answered as number) || 0,
        totalCorrectAnswers: (data.total_correct_answers as number) || 0,
        totalTimeSpentMinutes: (data.total_time_spent_minutes as number) || 0,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

export default AcademyGamificationService;
