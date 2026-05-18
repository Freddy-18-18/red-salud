# Offline-first layer

Esta carpeta implementa el soporte offline de la app médico sin depender de
servicios externos (no PowerSync, no infra extra). Es la **Opción C** del plan
de offline-first: TanStack Query + IndexedDB + Service Worker + mutation queue.

## Capas

```
┌─────────────────────────────────────────────────────────────┐
│  ServiceWorkerRegistrar (root layout)                       │
│    └─ /public/sw.js                                         │
│       precache shell + stale-while-revalidate Supabase GET  │
├─────────────────────────────────────────────────────────────┤
│  OfflineQueryProvider (dashboard layout)                    │
│    └─ TanStack Query                                        │
│       persist con IndexedDB (24h TTL, throttle 1s)          │
│       networkMode: offlineFirst → lecturas siempre disponibles│
├─────────────────────────────────────────────────────────────┤
│  useOfflineMutation (caller-level)                          │
│    └─ mutation-queue.ts                                     │
│       FIFO, retry 5x, dedupe in-flight, auto-flush online   │
│       almacena en IndexedDB store 'mutation-queue'          │
├─────────────────────────────────────────────────────────────┤
│  OfflineBanner (dashboard shell)                            │
│    estados: silencioso · sin-conexión · sincronizando       │
└─────────────────────────────────────────────────────────────┘
```

## Cómo se usa

### Lecturas (queries)

Ya no necesitás cambiar nada — al envolver el dashboard en `OfflineQueryProvider`,
cualquier `useQuery` con queryKey conocido se persiste. Para tener una query
disponible offline, simplemente migrala a TanStack Query:

```tsx
import { useQuery } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ['patients', doctorId, sedeId],
  queryFn: () => listPatients(doctorId, sedeId),
});
```

Después del primer fetch online, la respuesta vive en IndexedDB. Si el doctor
abre la app sin internet, ve la misma data.

### Escrituras (mutations)

Reemplazá llamadas directas a Supabase por `useOfflineMutation`:

```tsx
const offlineMutation = useOfflineMutation();

async function saveAppointment(data) {
  const result = await offlineMutation({
    kind: 'createAppointment',
    payload: data,
    label: 'Cita',
  });
  if (result.queued) {
    // se guardó offline, va a sincronizar al volver red
  }
}
```

Cada `kind` debe tener un executor registrado en `mutation-queue.ts` que sepa
re-issuear la operación. Hay 4 builtin:

- `createAppointment` → insert en `appointments`
- `updateAppointmentStatus` → update en `appointments.status`
- `createPrescription` → insert en `prescriptions`
- `markNotificationRead` → update en `doctor_notifications.is_read`

Para agregar uno nuevo:

```ts
import { registerMutationExecutor } from '@/lib/offline/mutation-queue';

registerMutationExecutor('createMedicalNote', async (payload) => {
  const { error } = await supabase
    .from('medical_notes')
    .insert(payload as Record<string, unknown>);
  if (error) throw error;
});
```

### Testing offline localmente

1. Levantar el dev server con `NEXT_PUBLIC_FORCE_SW=1 pnpm --filter @red-salud/medico-web dev`
   (o build production con `pnpm build && pnpm start`).
2. Abrir DevTools → Application → Service Workers → confirmar que `sw.js`
   está activo.
3. DevTools → Network → marcar "Offline".
4. Recargar la página. Debe cargar desde el SW shell cache.
5. Navegar a `/dashboard/pacientes` (si ya la visitaste online) → debe
   mostrar los pacientes cacheados.
6. Intentar crear una cita → toast "Guardado localmente…" → ver banner
   amber "1 pendiente".
7. Desmarcar "Offline" en DevTools → banner cambia a emerald
   "Sincronizando 1 pendiente…" → se vacía solo.

### Limpiar cachés

Desde la consola del browser:

```js
import('/_next/static/...').then(/* ... */)
// O más simple, vía el helper:
window.__clearOfflineCaches?.();
```

O programáticamente:

```ts
import { clearOfflineCaches } from '@/lib/offline/service-worker-registrar';
import { wipeOfflineDb } from '@/lib/offline/idb-store';

await clearOfflineCaches();
await wipeOfflineDb();
```

## Lo que NO cubre

Cosas que siempre necesitan red:

- **Auth (login)** — el SW excluye explícitamente `/auth/*` y rutas
  Supabase `/auth/v1/*`. La sesión se valida contra el servidor.
- **Realtime** — las suscripciones (bell, today-agenda) son WebSocket;
  se reconectan automáticamente al volver red pero no funcionan offline.
- **Telemedicina** — peer-to-peer, requiere señalización online.
- **Verificación SACS** — scraping de sitio externo.
- **Geocoding (mapa del wizard de sedes)** — Nominatim externo.

Estas surfaces tienen su propio feedback: cuando intentás llamar a una de
estas operaciones offline, el banner del shell ya está visible avisando
del estado.

## Conflict resolution

Por ahora es **last-write-wins implícito**: el mutation queue replay en orden
FIFO. Si dos doctores editan el mismo registro mientras uno está offline,
cuando el offline vuelva a sincronizar pisa los cambios del otro.

Para escenarios más complejos (múltiples doctores editando paciente al
mismo tiempo, secretaria modificando agenda en paralelo), Phase 2 puede
agregar:

1. Optimistic concurrency con un `updated_at` check en cada UPDATE.
2. CRDTs para campos específicos (notes, descripciones largas).
3. UI de "merge conflict" cuando la versión local difiere de la del server.

## Migración futura a PowerSync

Cuando Supabase pase a plan Pro, podemos cambiar al stack PowerSync sin
romper la API pública de este módulo:

- `useOfflineMutation` se reemplaza por mutations contra SQLite local
- `OfflineQueryProvider` se reemplaza por `PowerSyncContext.Provider`
- El `mutation-queue.ts` deja de ser necesario (PowerSync sync es atómico)
- El SW sigue igual (cache de assets es independiente)

El callsite de las páginas no cambia.
