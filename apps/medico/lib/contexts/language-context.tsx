"use client";

import { createContext, useContext, useState } from "react";

type Language = "es" | "en" | "pt";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones básicas
const translations: Record<Language, Record<string, string>> = {
  es: {
    "profile.title": "Mi Perfil",
    "profile.edit": "Editar",
    "profile.save": "Guardar",
    "profile.cancel": "Cancelar",
    "profile.name": "Nombre Completo",
    "profile.email": "Correo Electrónico",
    "profile.phone": "Teléfono",
    "profile.address": "Dirección",
    "medical.title": "Información Médica",
    "medical.bloodType": "Tipo de Sangre",
    "medical.allergies": "Alergias",
    "documents.title": "Documentos",
    "security.title": "Seguridad",
    "preferences.title": "Preferencias",
    "privacy.title": "Privacidad",
    "activity.title": "Actividad",
    "billing.title": "Facturación",
  },
  en: {
    "profile.title": "My Profile",
    "profile.edit": "Edit",
    "profile.save": "Save",
    "profile.cancel": "Cancel",
    "profile.name": "Full Name",
    "profile.email": "Email",
    "profile.phone": "Phone",
    "profile.address": "Address",
    "medical.title": "Medical Information",
    "medical.bloodType": "Blood Type",
    "medical.allergies": "Allergies",
    "documents.title": "Documents",
    "security.title": "Security",
    "preferences.title": "Preferences",
    "privacy.title": "Privacy",
    "activity.title": "Activity",
    "billing.title": "Billing",
  },
  pt: {
    "profile.title": "Meu Perfil",
    "profile.edit": "Editar",
    "profile.save": "Salvar",
    "profile.cancel": "Cancelar",
    "profile.name": "Nome Completo",
    "profile.email": "E-mail",
    "profile.phone": "Telefone",
    "profile.address": "Endereço",
    "medical.title": "Informação Médica",
    "medical.bloodType": "Tipo Sanguíneo",
    "medical.allergies": "Alergias",
    "documents.title": "Documentos",
    "security.title": "Segurança",
    "preferences.title": "Preferências",
    "privacy.title": "Privacidade",
    "activity.title": "Atividade",
    "billing.title": "Faturamento",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Inicializar con valor de localStorage si existe
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem("language") as Language;
      if (stored && ["es", "en", "pt"].includes(stored)) {
        return stored;
      }
    }
    return "es";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
