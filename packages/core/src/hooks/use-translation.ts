"use client";

import { useState, useCallback } from "react";
import { translations, TranslationKey } from "../i18n/translations";
import type { Language } from "../contexts/preferences-context";

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
        const langData = translations[language] as unknown as Record<string, Record<string, string>>;
        // Support "module.key" format
        const [module, subKey] = key.includes('.') ? key.split('.', 2) : ['common', key];
        return langData?.[module]?.[subKey] || key;
    }, [language]);

    return { t, language, setLanguage };
}
