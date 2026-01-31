"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

export type Language = "es" | "en" | "pt" | "fr" | "it";
export type Theme = "light" | "dark" | "system";
export type DateFormat = "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
export type TimeFormat = "12h" | "24h";
export type ContactMethod = "email" | "sms" | "whatsapp" | "phone";
export type MeasurementSystem = "metric" | "imperial";

export interface UserPreferences {
  // Apariencia
  theme: Theme;
  language: Language;
  fontSize: "small" | "medium" | "large";
  highContrast: boolean;
  reducedMotion: boolean;

  // Regional
  timezone: string;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  measurementSystem: MeasurementSystem;

  // Comunicación
  preferredContactMethod: ContactMethod;
  contactPhone?: string;
  contactWhatsapp?: string;
  preferredContactHours: {
    start: string; // "09:00"
    end: string; // "18:00"
  };

  // Notificaciones
  desktopNotifications: boolean;
  soundNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  reminderAdvanceTime: number; // minutos antes

  // Suscripciones
  newsletterSubscribed: boolean;
  promotionsSubscribed: boolean;
  surveysSubscribed: boolean;
  healthTipsSubscribed: boolean;

  // Privacidad
  profilePublic: boolean;
  shareMedicalHistory: boolean;
  showProfilePhoto: boolean;
  shareLocation: boolean;
  anonymousDataResearch: boolean;
  analyticsCookies: boolean;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  loading: boolean;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
  applyTheme: (theme: Theme) => void;
}

const defaultPreferences: UserPreferences = {
  // Apariencia
  theme: "system",
  language: "es",
  fontSize: "medium",
  highContrast: false,
  reducedMotion: false,

  // Regional
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Caracas",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "24h",
  measurementSystem: "metric",

  // Comunicación
  preferredContactMethod: "email",
  preferredContactHours: {
    start: "09:00",
    end: "18:00",
  },

  // Notificaciones
  desktopNotifications: true,
  soundNotifications: true,
  emailNotifications: true,
  smsNotifications: false,
  appointmentReminders: true,
  reminderAdvanceTime: 60, // 1 hora antes

  // Suscripciones
  newsletterSubscribed: true,
  promotionsSubscribed: false,
  surveysSubscribed: true,
  healthTipsSubscribed: true,

  // Privacidad
  profilePublic: false,
  shareMedicalHistory: true,
  showProfilePhoto: true,
  shareLocation: false,
  anonymousDataResearch: false,
  analyticsCookies: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Helper functions to convert between camelCase and snake_case
function toSnakeCase(obj: Partial<UserPreferences>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamelCase(obj: Record<string, unknown>): Partial<UserPreferences> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as Partial<UserPreferences>;
}

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Función para aplicar el tema
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.classList.toggle("dark", prefersDark);
    } else {
      root.classList.toggle("dark", theme === "dark");
    }
  }, []);

  // Cargar preferencias al montar
  useEffect(() => {
    loadPreferences();
  }, []);

  // Aplicar tema cuando cambie
  useEffect(() => {
    applyTheme(preferences.theme);

    // Si el tema es "system", escuchar cambios en las preferencias del sistema
    if (preferences.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = () => applyTheme("system");
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [preferences.theme, applyTheme]);

  // Aplicar tamaño de fuente
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("text-sm", "text-base", "text-lg");
    
    switch (preferences.fontSize) {
      case "small":
        root.classList.add("text-sm");
        break;
      case "large":
        root.classList.add("text-lg");
        break;
      default:
        root.classList.add("text-base");
    }
  }, [preferences.fontSize]);

  // Aplicar alto contraste
  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", preferences.highContrast);
  }, [preferences.highContrast]);

  // Aplicar movimiento reducido
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", preferences.reducedMotion);
  }, [preferences.reducedMotion]);

  const loadPreferences = async () => {
    try {
      setLoading(true);

      // Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);

        // Cargar preferencias de Supabase
        const { data, error } = await supabase
          .from("user_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (data && !error) {
          // Convertir de snake_case a camelCase y mergear con defaults
          const camelCaseData = toCamelCase(data);
          setPreferences({
            ...defaultPreferences,
            ...camelCaseData,
          });
        } else {
          // Si no hay preferencias guardadas, crear registro inicial
          const snakeCasePrefs = toSnakeCase(defaultPreferences);
          await supabase.from("user_preferences").insert({
            user_id: user.id,
            ...snakeCasePrefs,
          });
        }
      } else {
        // Usuario no autenticado, cargar de localStorage
        const stored = localStorage.getItem("preferences");
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            setPreferences({ ...defaultPreferences, ...parsed });
          } catch (e) {
            console.error("Error parsing stored preferences:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    const newPreferences = { ...preferences, [key]: value };
    setPreferences(newPreferences);

    // Guardar en Supabase si hay usuario
    if (userId) {
      try {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        await supabase
          .from("user_preferences")
          .update({ [snakeKey]: value })
          .eq("user_id", userId);

        // Log de actividad
        await supabase.from("user_activity_log").insert({
          user_id: userId,
          activity_type: "preference_updated",
          description: `Preferencia actualizada: ${key}`,
          status: "success",
        });
      } catch (error) {
        console.error("Error updating preference:", error);
      }
    } else {
      // Guardar en localStorage si no hay usuario
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);

    // Guardar en Supabase si hay usuario
    if (userId) {
      try {
        const snakeCaseUpdates = toSnakeCase(updates);
        await supabase
          .from("user_preferences")
          .update(snakeCaseUpdates)
          .eq("user_id", userId);

        // Log de actividad
        await supabase.from("user_activity_log").insert({
          user_id: userId,
          activity_type: "preferences_updated",
          description: `Múltiples preferencias actualizadas`,
          status: "success",
        });
      } catch (error) {
        console.error("Error updating preferences:", error);
        throw error;
      }
    } else {
      // Guardar en localStorage si no hay usuario
      localStorage.setItem("preferences", JSON.stringify(newPreferences));
    }
  };

  const resetPreferences = async () => {
    setPreferences(defaultPreferences);

    if (userId) {
      try {
        const snakeCasePrefs = toSnakeCase(defaultPreferences);
        await supabase
          .from("user_preferences")
          .update(snakeCasePrefs)
          .eq("user_id", userId);

        await supabase.from("user_activity_log").insert({
          user_id: userId,
          activity_type: "preferences_reset",
          description: "Preferencias restablecidas a valores por defecto",
          status: "success",
        });
      } catch (error) {
        console.error("Error resetting preferences:", error);
        throw error;
      }
    } else {
      localStorage.removeItem("preferences");
    }
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        loading,
        updatePreference,
        updatePreferences,
        resetPreferences,
        applyTheme,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error("usePreferences must be used within PreferencesProvider");
  }
  return context;
}
