"use client";

import { usePreferences } from "@/lib/contexts/preferences-context";
import { getTranslations, type Language } from "@/lib/i18n/translations";

export function useI18n() {
    const { preferences } = usePreferences();
    const lang = preferences.language as Language;

    const t = (key: string, defaultValue?: string) => {
        const dict = getTranslations(lang);
        const parts = key.split(".");
        let current: Record<string, unknown> | string = dict as Record<string, unknown>;
        for (const p of parts) {
            if (typeof current === 'object' && current && p in current) {
                current = current[p] as Record<string, unknown> | string;
            } else {
                return defaultValue ?? key;
            }
        }
        return typeof current === "string" ? current : defaultValue ?? key;
    };

    return { t, lang };
}
