"use client";

import { useState, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/lib/i18n/translations";

export function useTranslation() {
    const [language, setLanguage] = useState<Language>(() => {
        if (typeof navigator !== "undefined") {
            const browserLang = navigator.language.split("-")[0];
            if (browserLang === "en") {
                return "en";
            }
        }
        return "es";
    });

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || key;
    }, [language]);

    return { t, language, setLanguage };
}
