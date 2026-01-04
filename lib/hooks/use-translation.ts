"use client";

import { useState, useEffect, useCallback } from "react";
import { translations, Language, TranslationKey } from "@/lib/i18n/translations";

export function useTranslation() {
    const [language, setLanguage] = useState<Language>("es");

    // Simple browser detection on mount
    useEffect(() => {
        const browserLang = navigator.language.split("-")[0];
        if (browserLang === "en") {
            setLanguage("en");
        }
    }, []);

    const t = useCallback((key: TranslationKey): string => {
        return translations[language][key] || key;
    }, [language]);

    return { t, language, setLanguage };
}
