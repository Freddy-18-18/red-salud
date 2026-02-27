import OpenAI from "openai";
import { Stream } from "openai/streaming";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
    searchAllReasons,
    getTopReasons
} from "./data/specialty-reasons-data";
import { searchConsultationReasons } from "./data/consultation-reasons";

/**
 * Z.ai Client Wrapper using OpenAI-compatible SDK
 */
export const ZAI_MODEL = "glm-4.7";

export interface SuggestionItem {
    reason: string;
    source: 'frequent' | 'specialty' | 'general' | 'local';
    priority: number;
    useCount?: number;
    category?: string;
}

export function createAiSdk(supabase: SupabaseClient, zaiApiKey?: string) {
    const zai = new OpenAI({
        apiKey: zaiApiKey || "dummy-key",
        baseURL: "https://api.z.ai/api/paas/v4/",
        dangerouslyAllowBrowser: true,
    });

    return {
        /**
         * Generate chat completions with optional streaming
         */
        async createChatCompletion(
            messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
            stream: boolean = true
        ): Promise<Stream<OpenAI.Chat.Completions.ChatCompletionChunk> | OpenAI.Chat.Completions.ChatCompletion> {
            const result = await zai.chat.completions.create({
                model: ZAI_MODEL,
                messages,
                stream: stream as any,
                temperature: 0.7,
                max_tokens: 1500,
            });

            return result as any;
        },

        /**
         * Smart Consultation Reason Suggestions
         */
        suggestions: {
            async getConsultationReasons(query: string, specialty: string = 'Medicina Interna', limit: number = 20) {
                // Implementation mirrors legacy useSmartSuggestions hook logic
                if (!query || query.length < 2) {
                    return getTopReasons(specialty, limit).map((reason, i) => ({
                        reason,
                        source: 'specialty' as const,
                        priority: 80 - i,
                    }));
                }

                const specialtyResults = searchAllReasons(query, specialty);
                const generalResults = searchConsultationReasons(query);

                const seen = new Set<string>();
                const combined: SuggestionItem[] = [];

                specialtyResults.forEach(r => {
                    const low = r.reason.toLowerCase();
                    if (!seen.has(low)) {
                        seen.add(low);
                        combined.push({
                            reason: r.reason,
                            source: 'specialty',
                            priority: r.priority,
                            category: r.category,
                        });
                    }
                });

                generalResults.forEach((reason, i) => {
                    const low = reason.toLowerCase();
                    if (!seen.has(low)) {
                        seen.add(low);
                        combined.push({
                            reason,
                            source: 'general',
                            priority: 50 - i,
                        });
                    }
                });

                return combined
                    .sort((a, b) => b.priority - a.priority)
                    .slice(0, limit);
            },

            async trackUsage(reason: string) {
                // In a real app, this might hit a DB table
                console.log(`[AI SDK] Tracking usage for reason: ${reason}`);
                // Optional: await supabase.from('reason_usage_log').insert(...)
            }
        }
    };
}
