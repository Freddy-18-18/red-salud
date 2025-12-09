# 🚀 Guía de Implementación: Mejoras del Sistema de Sesiones

## 📋 Resumen de Mejoras Implementadas

Se han implementado tres mejoras principales al sistema de gestión de sesiones:

1. ✅ **RememberMe en OAuth (Google Sign-In)**
2. ✅ **Validación Automática de Sesión**
3. ✅ **UI Indicador de Tiempo Restante**

---

## 1️⃣ RememberMe en OAuth (Google Sign-In)

### ¿Qué se implementó?

Ahora el parámetro `rememberMe` se transmite correctamente durante el flujo de OAuth, permitiendo que los usuarios que inician sesión con Google también puedan elegir si mantener su sesión activa.

### Archivos modificados:

- `lib/supabase/auth.ts` - Agregado parámetro `rememberMe` a `signInWithOAuth()`
- `hooks/auth/use-oauth-signin.ts` - Hook acepta y pasa `rememberMe`
- `components/auth/login-form.tsx` - Pasa estado de checkbox a OAuth
- `app/(auth)/callback/route.ts` - Lee y transmite `rememberMe` en redirect

### Cómo funciona:

```typescript
// 1. Usuario marca checkbox "Mantener sesión iniciada"
const [rememberMe, setRememberMe] = useState(false);

// 2. Click en "Continuar con Google"
const { signInWithGoogle } = useOAuthSignIn({
  role: "medico",
  mode: "login",
  rememberMe: true, // ← Se pasa al hook
});

// 3. OAuth redirige a /callback?rememberMe=true
// 4. Callback redirige a /dashboard/medico?rememberMe=true
// 5. Hook useSessionSetup() configura la sesión
```

### Hook de Configuración de Sesión:

**Archivo creado**: `hooks/auth/use-session-setup.ts`

**Uso**: Agregar en layouts de dashboard para detectar y configurar sesión después de OAuth.

```tsx
// app/dashboard/layout.tsx o app/dashboard/[role]/layout.tsx
import { useSessionSetup } from "@/hooks/auth";

export default function DashboardLayout({ children }) {
  useSessionSetup(); // ← Agrega esta línea
  
  return (
    <div>
      {children}
    </div>
  );
}
```

---

## 2️⃣ Validación Automática de Sesión

### ¿Qué se implementó?

Un hook que valida automáticamente la sesión del usuario cada vez que cambia de ruta y periódicamente cada 5 minutos.

### Archivo creado:

`hooks/auth/use-session-validation.ts`

### Características:

- ✅ Valida sesión al montar el componente
- ✅ Valida sesión al cambiar de ruta
- ✅ Valida sesión cada 5 minutos automáticamente
- ✅ Detecta y redirige en caso de sesión inválida
- ✅ Muestra mensajes de error específicos:
  - "Tu sesión ha expirado"
  - "Se detectó un cambio de dispositivo"
  - "Configuración de sesión inválida"

### Implementación:

```tsx
// app/dashboard/layout.tsx o cualquier layout protegido
import { useSessionValidation } from "@/hooks/auth";

export default function ProtectedLayout({ children }) {
  useSessionValidation(); // ← Agrega esta línea
  
  return (
    <div>
      {children}
    </div>
  );
}
```

### Validaciones que realiza:

1. **Existencia de sesión**: Verifica que haya una sesión activa
2. **Configuración válida**: Verifica que exista configuración de sesión
3. **Expiración por tiempo**: 
   - Sesión temporal: 24 horas máximo
   - Sesión persistente: 7 días máximo
4. **Device Fingerprint**: Detecta cambios de dispositivo

---

## 3️⃣ UI Indicador de Tiempo Restante

### ¿Qué se implementó?

Un componente visual que muestra el tiempo restante antes de que la sesión expire por inactividad.

### Archivo creado:

`components/auth/session-timer.tsx`

### Características:

- ✅ Se actualiza cada 30 segundos
- ✅ Muestra tiempo en formato legible (ej: "45 min", "1h 30min")
- ✅ Advertencia visual cuando quedan menos de 5 minutos
- ✅ Botón para extender sesión desde el tooltip
- ✅ Animación de pulso en modo advertencia
- ✅ Tooltip informativo con detalles

### Implementación:

#### Opción A: En el Header/Navbar

```tsx
// components/layout/navbar.tsx
import { SessionTimer } from "@/components/auth";

export function Navbar() {
  return (
    <nav>
      <div>Logo</div>
      <div>Menú</div>
      
      {/* Agregar aquí */}
      <SessionTimer showWarning={true} />
      
      <div>Avatar</div>
    </nav>
  );
}
```

#### Opción B: En el Footer

```tsx
// components/layout/footer.tsx
import { SessionTimer } from "@/components/auth";

export function Footer() {
  return (
    <footer className="flex items-center justify-between">
      <div>Copyright</div>
      
      {/* Agregar aquí */}
      <SessionTimer className="ml-auto" />
    </footer>
  );
}
```

#### Opción C: Posición fija en esquina

```tsx
// app/dashboard/layout.tsx
import { SessionTimer } from "@/components/auth";

export default function DashboardLayout({ children }) {
  return (
    <div>
      {children}
      
      {/* Posición fija en esquina inferior derecha */}
      <SessionTimer 
        className="fixed bottom-4 right-4 z-50 shadow-lg" 
        showWarning={true} 
      />
    </div>
  );
}
```

### Props del componente:

```typescript
interface SessionTimerProps {
  className?: string;
  showWarning?: boolean; // Default: true - Mostrar advertencia con < 5 min
}
```

---

## 🎯 Implementación Completa Recomendada

### Para layouts de Dashboard:

```tsx
// app/dashboard/[role]/layout.tsx o similar
"use client";

import { useSessionSetup, useSessionValidation } from "@/hooks/auth";
import { SessionTimer } from "@/components/auth";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardLayout({ children }) {
  // 1. Configurar sesión después de OAuth
  useSessionSetup();
  
  // 2. Validar sesión automáticamente
  useSessionValidation();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar>
        {/* 3. Mostrar tiempo restante en navbar */}
        <SessionTimer />
      </Navbar>
      
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
```

---

## 🔧 Configuración Avanzada

### Personalizar timeouts por rol:

Editar `lib/security/session-manager.ts`:

```typescript
const SESSION_TIMEOUTS = {
  paciente: 30 * 60 * 1000, // 30 minutos
  medico: 60 * 60 * 1000, // 1 hora
  farmacia: 60 * 60 * 1000, // 1 hora
  // ... agregar o modificar según necesidad
};
```

### Cambiar frecuencia de validación:

En `use-session-validation.ts`, cambiar el intervalo:

```typescript
// Validar cada 5 minutos (actual)
const interval = setInterval(validateCurrentSession, 5 * 60 * 1000);

// Para validar cada 2 minutos:
const interval = setInterval(validateCurrentSession, 2 * 60 * 1000);
```

### Personalizar apariencia del SessionTimer:

```tsx
<SessionTimer 
  className="bg-blue-100 dark:bg-blue-900 border-blue-300"
  showWarning={true}
/>
```

---

## ✅ Checklist de Implementación

- [ ] Agregar `useSessionSetup()` en layout principal de dashboard
- [ ] Agregar `useSessionValidation()` en layouts protegidos
- [ ] Agregar `<SessionTimer />` en navbar, footer o posición fija
- [ ] Probar flujo completo de OAuth con rememberMe
- [ ] Verificar validación automática de sesión
- [ ] Verificar que el timer se actualiza correctamente
- [ ] Probar advertencia de sesión por expirar
- [ ] Probar función de extender sesión

---

## 🐛 Troubleshooting

### El timer no aparece:
- Verificar que hay una sesión activa
- El timer se oculta si `remainingTime <= 0`

### OAuth no respeta rememberMe:
- Verificar que el checkbox está en el componente LoginForm
- Verificar console logs en callback
- Verificar que `useSessionSetup()` está en el layout

### Sesión se invalida inesperadamente:
- Revisar console logs para ver la razón
- Verificar que no hay cambios en device fingerprint
- Ajustar timeouts si es necesario

---

## 📊 Monitoreo

Todos los eventos de sesión se registran en la tabla `user_activity_log`:

```sql
SELECT * FROM user_activity_log 
WHERE activity_type LIKE 'session_%' 
ORDER BY created_at DESC;
```

Eventos registrados:
- `session_login` - Inicio de sesión
- `session_logout` - Cierre de sesión
- `session_timeout` - Cierre por inactividad
- `session_extended` - Sesión extendida manualmente

---

## 🎉 Beneficios

1. **Mejor UX**: Usuario sabe cuánto tiempo le queda
2. **Seguridad**: Validación automática detecta anomalías
3. **Flexibilidad**: OAuth respeta preferencias de sesión
4. **Transparencia**: Logs completos de actividad
5. **Proactividad**: Advertencias antes de expiración

---

## 📝 Notas Finales

- El sistema es completamente **retrocompatible**
- Todos los hooks son **opcionales** pero recomendados
- El `SessionTimer` puede ocultarse en mobile con media queries
- Los logs de sesión ayudan con debugging y auditoría
