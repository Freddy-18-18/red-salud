## Estado Actual del Dashboard Médico

### Inventario de funcionalidades
- Acceso y layout por rol médico con protección en servidor: `app/dashboard/medico/layout.tsx:37-56`
- Dashboard con métricas básicas y acceso rápido: `app/dashboard/medico/page.tsx:60-135`
- Verificación/guard de perfil profesional (overlay si no hay perfil): `components/dashboard/medico/features/verification-guard.tsx:44-149`
- Agenda de citas: listado y creación
  - Listado y calendario: `app/dashboard/medico/citas/page.tsx:135-143`
  - Creación con validaciones de fecha/hora y paciente: `app/dashboard/medico/citas/nueva/page.tsx:196-477`
- Gestión de pacientes
  - Listado con filtros y vista tabla/cuadrícula: `app/dashboard/medico/pacientes/page.tsx:149-171`
  - Registro completo y registro rápido (simple) de pacientes sin cuenta (offline_patients):
    - Completo: `app/dashboard/medico/pacientes/nuevo/page.tsx:288-396`
    - Simple (flujo desde cita): `app/dashboard/medico/pacientes/nuevo/simple/page.tsx:176-386`
  - Workspace de consulta para nuevo paciente: `app/dashboard/medico/pacientes/nuevo/consulta/page.tsx:70-88`
  - Detalle paciente registrado: `app/dashboard/medico/pacientes/[id]/page.tsx:184-546`
  - Detalle paciente sin cuenta (offline): `app/dashboard/medico/pacientes/offline/[id]/page.tsx:130-350`
- Mensajería básica (conversaciones y envío): `app/dashboard/medico/mensajeria/page.tsx:62-89`
- Telemedicina (listado de sesiones): `app/dashboard/medico/telemedicina/page.tsx:36-52`
- Recetas (listado y CTA crear): `app/dashboard/medico/recetas/page.tsx:62-123`
- Estadísticas (carga desde `doctor_stats_cache`): `app/dashboard/medico/estadisticas/page.tsx:53-96`
- Configuración
  - Horarios de atención: `app/dashboard/medico/configuracion/horarios/page.tsx:99-164`
  - Secretarias (invitación, permisos, borrado): `app/dashboard/medico/configuracion/secretarias/page.tsx:77-100, 158-181`
  - Página general de configuración con tabs y secciones compartidas: `app/dashboard/medico/configuracion/page.tsx:74-106`
- Perfil profesional: flujo de verificación SACS y setup: `app/dashboard/medico/perfil/setup/page.tsx:32-67`
- Demo ICD-11 (búsqueda/validación): `app/dashboard/medico/icd11-demo/page.tsx:8-10` y `components/dashboard/medico/demos/icd11-demo.tsx:23-58`

### Funcionalidades pendientes/por mejorar
- Citas: detalle/edición de cita por id (ruta no presente en médico). Acciones avanzadas (recordatorios, estados, reprogramación).
- Telemedicina: unión a sesión y sala de video (botón placeholder), historial por sesión.
- Recetas: creación/detalle/edición (solo listado con CTA).
- Mensajería: estados de entrega/lectura, adjuntos, notificaciones, búsqueda avanzada.
- Pacientes offline: vinculación automática al registrarse, edición, sincronización de borradores; detección de duplicados robusta.
- Estadísticas: visualizaciones (gráficos), filtros por rango, exportaciones.
- Configuración perfil: sección "Mi Perfil" indica "en desarrollo"; completar edición de datos profesionales.
- PWA/Offline: no hay manifest ni Service Worker; no hay IndexedDB ni colas/sincronización.

## Arquitectura Técnica y Dependencias
- Framework: Next.js App Router (`next@16`), React `19.2.0`.
- Autenticación y datos: Supabase SSR/cliente
  - Cliente navegador: `lib/supabase/client.ts:14`
  - Cliente servidor (cookies): `lib/supabase/server.ts:4-29`
  - Provider de sincronización de sesión: `components/providers/supabase-auth-provider.tsx:10-57`
- Estado global y contextos:
  - Redux Toolkit store: `components/providers/app-providers.tsx:10-17`
  - Contextos de preferencias/tema: `components/providers/app-providers.tsx:11-15`
- UI: Radix UI, Tailwind, Lucide, Framer Motion, date-fns.
- Rutas y protección por rol: gating en `app/dashboard/medico/layout.tsx:37-56` y `VerificationGuard` en cliente.
- Backend de negocio (Supabase tables) usado en médico: `appointments`, `doctor_patients`, `offline_patients`, `doctor_availability`, `doctor_secretaries`, `messages_new`, `telemedicine_sessions`, `prescriptions`, `doctor_stats_cache`.
- No hay Service Worker, `manifest.json` ni librerías de IndexedDB (Dexie/idb): ver `package.json` y búsqueda de archivos.

## Viabilidad de Funcionalidad Offline
- Viable implementar un PWA con modo offline parcial (lectura y captura) para médico:
  - Cache de shell y assets (HTML/CSS/JS) para navegación básica.
  - Cache de datos esenciales predescargados (agenda próxima, lista de pacientes, últimas recetas/notas) para lectura.
  - Captura offline de nuevos pacientes y notas como borradores en IndexedDB, con sincronización al reconectar.
- Limitaciones y exclusiones:
  - Telemedicina en tiempo real no funcional offline; se puede mostrar modo "solo lectura" del turno.
  - Autenticación: se requiere login online inicial para activar modo offline; acceso posterior con sesión almacenada debe limitarse a recursos locales y exigir revalidación online al sincronizar.
- Compatibilidad navegadores: Chrome/Edge/Firefox soportan Service Workers, Cache Storage, IndexedDB y `navigator.storage.estimate()`; Background Sync tiene soporte desigual (Chrome/Edge sí, Firefox parcial); se diseñará fallback con eventos `online`/`offline` y reintentos exponenciales.

## Propuesta Técnica Offline

### Service Worker (SW)
- Registro del SW en cliente al cargar app (punto de inserción sugerido): `app/layout.tsx:61-73` mediante componente cliente.
- Estrategias de caché (Workbox opcional o implementación propia):
  - App shell y assets estáticos: `CacheFirst` con versionado.
  - Rutas dashboard: `StaleWhileRevalidate` para HTML y `NetworkFirst` para JSON/API (mostrar datos cacheados y actualizar en segundo plano).
  - Fallback offline para páginas clave (agenda/pacientes) si la red falla.
- Background Sync:
  - Cola de peticiones mutantes (crear cita, registrar paciente offline, notas) con `sync` tag; fallback a reintento manual en `online`.

### Almacenamiento Local (IndexedDB)
- Librería recomendada: `idb` (ligera) o `Dexie` (schemas y transacciones);
- Esquema propuesto:
  - `settings`: preferencias de modo offline, timestamp de última sincronización.
  - `patients`: snapshot de pacientes (subset no sensible: nombre, contacto, id, conteos); cifrado opcional de campos sensibles.
  - `offlinePatientsDrafts`: borradores y registros sin cuenta (cedula, nombre, opcionalmente datos clínicos encriptados).
  - `appointments`: próximas 60 días (id, fecha, paciente, estado).
  - `messagesQueue`: mensajes a enviar al reconectar.
  - `syncQueue`: operaciones pendientes (upserts/eliminaciones) con metadatos (uuid, tipo, payload, versión, dependencia).
- Cifrado de datos sensibles: Web Crypto (AES-GCM) con clave derivada PBKDF2 desde un PIN local del médico más sal; clave rotada al cerrar sesión.

### Sincronización
- Detectar conectividad y disparar sincronización automática:
  - Eventos `online` + timer periódico.
  - UI con estado de sincronización y conflictos.
- Conflictos y consistencia:
  - Versionado por registro (campo `updated_at` y `client_version`).
  - Regla default: "Last-write-wins" con alerta si el servidor tiene cambios más recientes.
  - Para campos clínicos, ofrecer merge asistido (comparar diffs) si hay divergencias.
- Auditoría: logs locales de operaciones aplicadas y resultado en `user_activity_log` al sincronizar.

### Seguridad
- Encriptar en reposo en IndexedDB campos clínicos; almacenar sólo lo mínimo necesario.
- Purga al `signOut`: borrar claves y stores; mantener únicamente preferencias no sensibles.
- No cachear respuestas con tokens ni recursos privados sin control; usar `Cache-Control` adecuado.
- Validaciones en cliente: sanitizar entradas y limitar payloads en cola.

## Flujo de Usuario Offline
- Prompt inicial tras login médico: "¿Deseas activar modo offline?" con explicación y estimación de tamaño usando `navigator.storage.estimate()`.
- Selección de datasets a descargar (agenda próxima, pacientes, recetas/notas recientes).
- Estado visible: indicador de conexión, último sync, botón "Forzar sincronización".
- Avisos de desactualización: notificar si snapshot supera umbral (ej. >24h) o si hubo errores de sync.

## Requisitos Técnicos y Consideraciones
- Navegadores: Chrome/Edge/Firefox actuales; Safari iOS limitado (evaluar más adelante).
- Límites de almacenamiento: estimar con `navigator.storage.estimate()`; aplicar cuotas internas (p. ej. hasta 50MB por médico) y políticas de limpieza LRU.
- Datos sensibles: cifrado + minimización; nunca cachear tokens.
- Observabilidad: métricas de uso offline y tasa de conflictos.

## Plan de Implementación

### Fase 1: Prototipo básico offline
- Registrar Service Worker y cachear app shell y assets.
- IndexedDB básica con `settings`, `appointments`, `patients` (campos mínimos), `offlinePatientsDrafts`.
- Lectura offline: mostrar agenda y lista de pacientes desde cache si no hay red.
- UI: prompt de activación y estado de conexión/sync.

### Fase 2: Sincronización inteligente
- Implementar cola de mutaciones y Background Sync + fallback.
- Reglas de conflicto y versionado; pantalla de resolución de conflictos.
- Sincronización incremental por timestamps/ids.

### Fase 3: Optimización de almacenamiento
- Cifrado en IndexedDB para datos sensibles.
- Políticas de limpieza (LRU, TTL, límites por store); estimación y reporte de uso.

### Fase 4: Pruebas en entornos con conexión limitada
- Escenarios: modo avión, latencia alta, pérdida intermitente, reconexiones.
- Validar integridad de datos y experiencia de usuario; pruebas de estrés con grandes listas.

## Entregables
- Documentación del estado actual (este análisis) y arquitectura.
- Propuesta técnica detallada de PWA y offline (este documento).
- Prototipo funcional (Fase 1) con:
  - Cache estática y lectura offline de agenda/pacientes.
  - Registro de paciente offline como borrador local.
- Plan de pruebas y checklist para condiciones reales.

## Puntos de Integración Concretos
- Registro SW: añadir componente cliente en `app/layout.tsx:61-73` para `navigator.serviceWorker.register('/sw.js')`.
- Prompt y estado offline: componente en `components/dashboard/layout/dashboard-layout-client.tsx:132-207` (header/menú) o en `VerificationGuard`.
- Cache de datos: hooks `useDoctorProfile` y `usePatientsList` adaptados para leer/escribir en IndexedDB y fallback.
- Operaciones offline: páginas de pacientes/citas (`app/dashboard/medico/pacientes/*`, `app/dashboard/medico/citas/*`) integran cola de sync.

## Riesgos y Mitigaciones
- Conflictos de datos: versionado + UI de resolución.
- Cuotas de almacenamiento: límites internos y limpieza.
- Seguridad: cifrado y purga al cerrar sesión; no cachear tokens.
- Soporte Background Sync: fallback robusto con eventos `online`.

## Siguientes Pasos
- Aprobación de esta propuesta.
- Implementación Fase 1 con mínimos cambios invasivos y medición de impacto.
- Revisión de UX y seguridad antes de ampliar a Fase 2/3.