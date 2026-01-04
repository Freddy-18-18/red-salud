// Índice de traducciones - Combina todos los módulos de traducción
import { commonTranslations } from './common';
import { dashboardTranslations } from './dashboard';
import { preferencesTranslations } from './preferences';
import { authTranslations } from './auth';
import { profileTranslations } from './profile';
import { appointmentsTranslations } from './appointments';
import { medicalTranslations } from './medical';
import { messagesTranslations } from './messages';
import { errorsTranslations } from './errors';

// Exportar módulos individuales para acceso directo
export {
  commonTranslations,
  dashboardTranslations,
  preferencesTranslations,
  authTranslations,
  profileTranslations,
  appointmentsTranslations,
  medicalTranslations,
  messagesTranslations,
  errorsTranslations,
};

// Tipos de idiomas soportados
export type LanguageCode = 'es' | 'en' | 'pt' | 'fr' | 'it';

// Interfaz para todas las traducciones
interface Translations {
  [lang: string]: {
    common: typeof commonTranslations['es'];
    dashboard: typeof dashboardTranslations['es'];
    preferences: typeof preferencesTranslations['es'];
    auth: typeof authTranslations['es'];
    profile: typeof profileTranslations['es'];
    appointments: typeof appointmentsTranslations['es'];
    medical: typeof medicalTranslations['es'];
    messages: typeof messagesTranslations['es'];
    errors: typeof errorsTranslations['es'];
  };
}

// Combinar todos los módulos de traducción
export const translations: Translations = {
  es: {
    common: commonTranslations.es,
    dashboard: dashboardTranslations.es,
    preferences: preferencesTranslations.es,
    auth: authTranslations.es,
    profile: profileTranslations.es,
    appointments: appointmentsTranslations.es,
    medical: medicalTranslations.es,
    messages: messagesTranslations.es,
    errors: errorsTranslations.es,
  },
  en: {
    common: commonTranslations.en,
    dashboard: dashboardTranslations.en,
    preferences: preferencesTranslations.en,
    auth: authTranslations.en,
    profile: profileTranslations.en,
    appointments: appointmentsTranslations.en,
    medical: medicalTranslations.en,
    messages: messagesTranslations.en,
    errors: errorsTranslations.en,
  },
  pt: {
    common: commonTranslations.pt,
    dashboard: dashboardTranslations.pt,
    preferences: preferencesTranslations.pt,
    auth: authTranslations.pt,
    profile: profileTranslations.pt,
    appointments: appointmentsTranslations.pt,
    medical: medicalTranslations.pt,
    messages: messagesTranslations.pt,
    errors: errorsTranslations.pt,
  },
  fr: {
    common: commonTranslations.fr,
    dashboard: dashboardTranslations.fr,
    preferences: preferencesTranslations.fr,
    auth: authTranslations.fr,
    profile: profileTranslations.fr,
    appointments: appointmentsTranslations.fr,
    medical: medicalTranslations.fr,
    messages: messagesTranslations.fr,
    errors: errorsTranslations.fr,
  },
  it: {
    common: commonTranslations.it,
    dashboard: dashboardTranslations.it,
    preferences: preferencesTranslations.it,
    auth: authTranslations.it,
    profile: profileTranslations.it,
    appointments: appointmentsTranslations.it,
    medical: medicalTranslations.it,
    messages: messagesTranslations.it,
    errors: errorsTranslations.it,
  },
};

// Función auxiliar para obtener traducciones
export const getTranslations = (lang: LanguageCode = 'es') => {
  return translations[lang] || translations.es;
};

// Función para obtener una traducción específica
export const t = (lang: LanguageCode, module: keyof Translations['es'], key: string): string => {
  const moduleTranslations = translations[lang]?.[module];
  if (!moduleTranslations) return key;
  return (moduleTranslations as Record<string, string>)[key] || key;
};

// Función para reemplazar variables en traducciones
export const interpolate = (text: string, variables: Record<string, string | number>): string => {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }, text);
};
