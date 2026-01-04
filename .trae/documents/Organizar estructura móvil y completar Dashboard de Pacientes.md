## Objetivo
- Portar los dashboards web de `/app/dashboard/*` a versiones móviles en `mobile/` (Expo + React Native).
- Prioridad: Paciente y Médico; preparar estructura base para Ambulancia, Clínica, Farmacia, Laboratorio, Seguro.
- Añadir modo offline y push de notificaciones.

## Mapeo de roles (7 dashboards)
- Detectados en web: `paciente`, `medico`, `laboratorio`, `farmacia`, `clinica`, `ambulancia`, `seguro`.
- Crear por rol: rutas móviles y módulo `src/features/<rol>`.

## Arquitectura móvil
1. Mantener Expo Router:
   - Rutas por rol: `app/(tabs-<rol>)/<rol>/*`.
   - Autogate según sesión y (opcional) `profile.rol`.
2. Feature-first en `src/features/<rol>`:
   - `{components,hooks,services}` por rol; reutilizar `src/components/ui`.
3. Alias:
   - Normalizar `@mobile/*`, `@core/*` (ya configurados).

## Paciente (port desde web)
- Secciones a portar (ya existen parcialmente):
  - `StatsGrid` → `StatsCard` grid.
  - Próximas citas → `AppointmentList` (ya existe) + navegación.
  - Actividad reciente → listado simple con `FlatList` (placeholder inicial).
  - Métricas de salud → `HealthMetricsSection` móvil (placeholder inicial).
  - Medicamentos activos → `MedicationCard` lista.
  - Accesos rápidos → `Button` acciones.
- Mejoras inmediatas:
  - `SafeAreaView` para cabecera y tabs.
  - Corregir prop de icono en `StatsCard` (renderizar nodo o tipar `ElementType`).
  - Prefetch con `react-query` al montar.

## Médico (port desde web)
- Quick Stats y Quick Actions del web:
  - Grid `StatsCard` con iconos (`Calendar`, `Users`, etc.).
  - Acciones rápidas con navegación a: `citas`, `pacientes`, `mensajeria`, `telemedicina`, `recetas`, `estadisticas`.
- Setup/verificación (overlay web):
  - Modal a pantalla completa en móvil si faltan datos de perfil.
- Rutas móviles iniciales:
  - `app/(tabs-medico)/medico/index.tsx` (dashboard).
  - Subrutas placeholders: `citas/`, `pacientes/`, `mensajeria/`, `telemedicina/`, `recetas/`, `estadisticas/`, `perfil/setup`.

## Offline-first
- Persistencia de caché:
  - `@tanstack/react-query-persist-client` + `AsyncStorage` para cacheo y reintentos.
- Datos críticos offline por rol:
  - Paciente: citas, medicamentos, perfil básico.
  - Médico: agenda del día, pacientes recientes, mensajes (metadatos), perfil.
- Sincronización:
  - Estrategia incremental: marcar registros "pending" y sincronizar en `app foreground` y `background` (con `expo-background-fetch`).
  - Resolución de conflictos: last-write-wins inicial; se puede robustecer.
- Almacenamiento local:
  - `expo-sqlite` para datasets listados grandes; `AsyncStorage` para metadatos ligeros.

## Push de Notificaciones
- Cliente: `expo-notifications` (permiso, token, recepción).
- Casos:
  - Recordatorios de medicamentos.
  - Cambios de estado de citas/telemedicina.
- Origen servidor:
  - Emisor vía backend/Edge Function (Supabase) que envía a Expo Push; coordinación posterior.

## Estructura y Routing
- `mobile/app/(tabs)/paciente/*` (ya existe) y `mobile/app/(tabs-medico)/medico/*`.
- Plantilla para los otros 5 roles:
  - `mobile/app/(tabs-<rol>)/<rol>/index.tsx` + secciones.
  - `src/features/<rol>/{components,hooks,services}` con `FeatureShell` reutilizable.

## Rendimiento y UX
- Listas con `FlatList`, `keyExtractor`, `getItemLayout` donde aplique.
- Memoizar cards y handlers; limitar renders de `Skeleton`.
- Accesibilidad: touch targets ≥44pt, textos con buen contraste.

## Testing básico
- Añadir Jest + `@testing-library/react-native`.
- Pruebas:
  - Render del dashboard, navegación entre pantallas, estados de carga.
  - Hooks con `react-query` y mocks de Supabase.

## Plan de entregas (prioridades)
1. Paciente: corregir iconos `StatsCard`, `SafeAreaView`, completar `mensajes` y validar flujos `citas/nueva`, `telemedicina/sesion`, `medicamentos/[id]`.
2. Médico: crear dashboard y subrutas, modal de setup, listas básicas.
3. Plantilla 5 roles restantes: carpetas y pantallas base.
4. Offline/push: integrar persistencia de caché y `expo-notifications`.
5. Testing: setup mínimo y 3–5 pruebas clave.

## Preguntas
1. ¿Confirmamos los 7 roles tal como aparecen en web (`paciente`, `medico`, `laboratorio`, `farmacia`, `clinica`, `ambulancia`, `seguro`)?
2. ¿El campo de rol estará disponible en `profiles` para decidir qué tabs cargar en móvil?
3. ¿Qué datos deben estar disponibles offline por cada rol (listas completas vs. últimos N registros)?
4. ¿Proveedor de push en servidor: Expo Push (simple) o FCM/APNs con backend propio?
5. ¿Algún requisito de animaciones (como framer-motion en web) que debamos replicar en móvil?

## Recomendación técnica y justificación
- Expo + React Native + Expo Router: velocidad de desarrollo, compatibilidad iOS/Android y excelente ecosistema.
- `react-query` con persistencia: offline básico rápido y robusto.
- `expo-sqlite` para datasets grandes y `AsyncStorage` para metadatos: equilibrio entre complejidad y rendimiento.
- `expo-notifications`: integración nativa y sencilla para push.
- Arquitectura feature-first: escalable a 7 apps, reutilización y consistencia visual.