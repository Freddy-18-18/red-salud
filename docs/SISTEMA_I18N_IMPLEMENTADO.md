# Sistema de Internacionalización (i18n) Implementado

## Resumen

Se ha implementado un sistema completo de internacionalización (i18n) para Red-Salud que permite cambiar el idioma de la interfaz dinámicamente. El sistema soporta 5 idiomas: Español, Inglés, Portugués, Francés e Italiano.

## Problemas Resueltos

### 1. Cambio de Idioma No Funcionaba
**Problema**: Al cambiar el idioma en las preferencias, la interfaz no se actualizaba.

**Solución**: 
- Creado hook personalizado `useI18n()` que lee el idioma desde el contexto de preferencias
- Actualizado componente de preferencias para usar traducciones
- Actualizado dashboard principal para usar traducciones

### 2. Modo Oscuro No Funcionaba Correctamente
**Problema**: El toggle de modo oscuro no cambiaba el tema correctamente.

**Solución**:
- Corregida la función `applyTheme` para manejar los tres modos: light, dark, system
- Agregado listener para cambios en las preferencias del sistema
- El tema ahora se sincroniza automáticamente con las preferencias del sistema operativo

## Archivos Creados

### 1. `lib/hooks/use-i18n.ts`
Hook personalizado que proporciona acceso a las traducciones basado en el idioma seleccionado en las preferencias del usuario.

```typescript
import { usePreferences } from "@/lib/contexts/preferences-context";
import { getTranslation, type Language } from "@/lib/i18n/translations";

export function useI18n() {
  const { preferences } = usePreferences();
  const lang = preferences.language as Language;

  const t = (key: string, defaultValue?: string) => {
    return getTranslation(lang, key, defaultValue);
  };

  return { t, lang };
}
```

## Archivos Modificados

### 1. `lib/contexts/preferences-context.tsx`
- Agregadas funciones de conversión entre camelCase y snake_case
- Corregida la función `applyTheme` para manejar el modo "system"
- Agregado listener para cambios en las preferencias del sistema

### 2. `components/dashboard/profile/tabs/preferences-tab.tsx`
- Importado hook `useI18n`
- Reemplazados todos los textos estáticos con llamadas a `t()`
- Ahora todos los textos se traducen automáticamente según el idioma seleccionado

### 3. `app/dashboard/paciente/page.tsx`
- Importado hook `useI18n`
- Reemplazados los textos principales con traducciones
- El dashboard ahora se muestra en el idioma seleccionado

### 4. `lib/i18n/translations.ts`
- Agregadas traducciones para el dashboard en todos los idiomas
- Estructura organizada por secciones: common, dashboard, preferences

### 5. `supabase/migrations/20241110000001_create_user_preferences_table.sql`
- Creada migración para actualizar la tabla `user_preferences`
- Agregadas columnas para todas las preferencias del usuario
- Actualizada restricción de idioma para soportar 5 idiomas

## Cómo Usar el Sistema de Traducciones

### En Componentes de React

```typescript
import { useI18n } from "@/lib/hooks/use-i18n";

export function MiComponente() {
  const { t, lang } = useI18n();
  
  return (
    <div>
      <h1>{t("dashboard.greeting")}</h1>
      <p>{t("common.loading")}</p>
    </div>
  );
}
```

### Agregar Nuevas Traducciones

1. Abrir `lib/i18n/translations.ts`
2. Agregar la clave en todos los idiomas:

```typescript
export const translations: Record<Language, Translations> = {
  es: {
    miSeccion: {
      miTexto: "Mi texto en español",
    },
  },
  en: {
    miSeccion: {
      miTexto: "My text in English",
    },
  },
  // ... otros idiomas
};
```

3. Usar en el componente:

```typescript
const { t } = useI18n();
<p>{t("miSeccion.miTexto")}</p>
```

### Traducciones con Variables

Para textos con variables, usar `.replace()`:

```typescript
// En translations.ts
greeting: "¡Hola, {name}!"

// En el componente
{t("dashboard.greeting").replace("{name}", userName)}
```

## Idiomas Soportados

| Código | Idioma | Estado |
|--------|--------|--------|
| `es` | Español | ✅ Completo |
| `en` | Inglés | ✅ Completo |
| `pt` | Portugués | ✅ Completo |
| `fr` | Francés | ✅ Completo |
| `it` | Italiano | ✅ Completo |

## Secciones Traducidas

### Completas
- ✅ Preferencias (preferences)
- ✅ Dashboard principal (dashboard)
- ✅ Textos comunes (common)

### Pendientes
- ⏳ Citas médicas
- ⏳ Medicamentos
- ⏳ Laboratorio
- ⏳ Telemedicina
- ⏳ Mensajería
- ⏳ Historial médico
- ⏳ Perfil de usuario

## Cómo Probar

1. **Cambiar Idioma**:
   - Ir a Dashboard → Configuración → Preferencias
   - Seleccionar un idioma del dropdown
   - La interfaz se actualiza inmediatamente

2. **Modo Oscuro**:
   - Ir a Dashboard → Configuración → Preferencias
   - Activar/desactivar el toggle de "Modo Oscuro"
   - El tema cambia inmediatamente
   - Si está en modo "system", sigue las preferencias del sistema operativo

3. **Persistencia**:
   - Los cambios se guardan automáticamente en Supabase
   - Al recargar la página, las preferencias persisten
   - Funciona en múltiples dispositivos

## Próximos Pasos

1. **Agregar más traducciones**: Traducir las páginas restantes del dashboard
2. **Formato de fechas**: Usar `date-fns` con locales para formatear fechas según el idioma
3. **Formato de números**: Implementar formateo de números según el locale
4. **Validación de formularios**: Traducir mensajes de error de Zod
5. **Notificaciones**: Traducir mensajes de toast/notificaciones

## Notas Técnicas

- El sistema usa React Context para compartir el idioma entre componentes
- Las traducciones se cargan de forma síncrona (no hay lazy loading)
- El cambio de idioma es instantáneo sin necesidad de recargar la página
- Las preferencias se sincronizan con Supabase automáticamente
- El sistema es type-safe gracias a TypeScript

## Estructura de Archivos

```
lib/
├── contexts/
│   └── preferences-context.tsx    # Contexto de preferencias
├── hooks/
│   └── use-i18n.ts               # Hook de traducciones
└── i18n/
    └── translations.ts           # Archivo de traducciones

components/
└── dashboard/
    └── profile/
        └── tabs/
            └── preferences-tab.tsx  # Tab de preferencias traducido

app/
└── dashboard/
    └── paciente/
        └── page.tsx              # Dashboard traducido

supabase/
└── migrations/
    └── 20241110000001_create_user_preferences_table.sql
```

## Soporte

Para agregar soporte de un nuevo idioma:

1. Agregar el código del idioma al tipo `Language` en `translations.ts`
2. Agregar todas las traducciones para ese idioma
3. Actualizar el selector de idioma en `preferences-tab.tsx`
4. Actualizar la restricción CHECK en la base de datos
