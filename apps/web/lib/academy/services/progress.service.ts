/**
 * @file progress.service.ts
 * @description Servicio para gestionar el progreso del usuario en Academy
 * @module Academy/Services
 */

import { createClient } from '@/lib/supabase/client';
import type { UserLessonProgress, ProgressStatus, StarRating, LessonCompletionResult } from '../types/progress.types';

/**
 * Servicio para gestión de progreso del usuario en Academy
 */
export const AcademyProgressService = {
    /**
     * Obtiene el progreso de un usuario en una lección específica
     */
    async getLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | null> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_user_progress')
            .select('*')
            .eq('user_id', userId)
            .eq('lesson_id', lessonId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw new Error('Error al obtener progreso');
        }

        return data ? mapProgressFromDb(data) : null;
    },

    /**
     * Inicia una lección (marca como "en progreso")
     */
    async startLesson(userId: string, lessonId: string): Promise<UserLessonProgress> {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('academy_user_progress')
            .upsert({
                user_id: userId,
                lesson_id: lessonId,
                status: 'in_progress',
                last_attempted_at: new Date().toISOString(),
            }, { onConflict: 'user_id,lesson_id' })
            .select()
            .single();

        if (error) throw new Error('Error al iniciar lección');
        return mapProgressFromDb(data);
    },

    /**
     * Completa una lección y registra el resultado
     */
    async completeLesson(
        userId: string,
        lessonId: string,
        score: number,
        timeSpentSeconds: number
    ): Promise<LessonCompletionResult> {
        const supabase = createClient();
        const stars = calculateStars(score);
        const existing = await this.getLessonProgress(userId, lessonId);
        const isNewRecord = score > (existing?.bestScore ?? 0);
        const status: ProgressStatus = stars === 3 ? 'mastered' : 'completed';

        await supabase.from('academy_user_progress').upsert({
            user_id: userId,
            lesson_id: lessonId,
            status,
            score,
            stars,
            attempts: (existing?.attempts ?? 0) + 1,
            best_score: Math.max(score, existing?.bestScore ?? 0),
            time_spent_seconds: (existing?.timeSpentSeconds ?? 0) + timeSpentSeconds,
            completed_at: new Date().toISOString(),
            last_attempted_at: new Date().toISOString(),
        }, { onConflict: 'user_id,lesson_id' });

        const { data: lesson } = await supabase
            .from('academy_lessons')
            .select('xp_reward, gem_reward')
            .eq('id', lessonId)
            .single();

        const isFirstCompletion = !existing || existing.status === 'not_started';
        const xpEarned = isFirstCompletion ? (lesson?.xp_reward ?? 10) : 2;
        const gemsEarned = isFirstCompletion ? (lesson?.gem_reward ?? 0) : 0;

        return {
            success: true,
            score,
            stars,
            xpEarned,
            gemsEarned,
            isNewRecord,
            correctAnswers: Math.round((score / 100) * 10),
            totalQuestions: 10,
            timeSeconds: timeSpentSeconds,
            streakMaintained: true,
            currentStreak: 0,
            achievementsUnlocked: [],
            leveledUp: false,
        };
    },
};

function calculateStars(score: number): StarRating {
    if (score >= 95) return 3;
    if (score >= 80) return 2;
    if (score >= 60) return 1;
    return 0;
}

function mapProgressFromDb(data: Record<string, unknown>): UserLessonProgress {
    return {
        id: data.id as string,
        userId: data.user_id as string,
        lessonId: data.lesson_id as string,
        status: (data.status as ProgressStatus) || 'not_started',
        score: (data.score as number) || 0,
        stars: (data.stars as StarRating) || 0,
        attempts: (data.attempts as number) || 0,
        bestScore: (data.best_score as number) || 0,
        timeSpentSeconds: (data.time_spent_seconds as number) || 0,
        completedAt: data.completed_at as string | null,
        lastAttemptedAt: data.last_attempted_at as string | null,
        createdAt: data.created_at as string,
        updatedAt: data.updated_at as string,
    };
}

export default AcademyProgressService;
