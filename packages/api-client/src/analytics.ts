/**
 * Analytics tracker — emits events to public.analytics_events.
 *
 * Usage:
 *   import { initAnalytics, track } from '@red-salud/api-client';
 *
 *   // Once per app boot (Client Component or root layout):
 *   initAnalytics({ supabase, appSource: 'paciente_web' });
 *
 *   // Anywhere:
 *   track('appointment.created', { resourceType: 'appointment', resourceId: id });
 *
 * Rules:
 *   - NEVER pass PII in payload (no email, no full name, no national_id, no card number).
 *   - IDs only.
 *   - Anonymous events are allowed (actor_id = null) and only flow when authenticated user is null.
 *   - Failures are swallowed silently — analytics MUST NOT break product flows.
 */

// We avoid importing `@supabase/supabase-js` types here so this package stays
// dependency-free. Consumers pass their already-initialized client.
type SupabaseAuthSession = { user?: { id?: string; user_metadata?: Record<string, unknown> } | null } | null;
type SupabaseAuthLike = {
  getUser: () => Promise<{ data: { user: { id?: string; user_metadata?: Record<string, unknown> } | null } | null }>;
  onAuthStateChange: (cb: (event: string, session: SupabaseAuthSession) => void) => unknown;
};
type SupabaseInsertResult = Promise<{ error: { message: string } | null }>;
type SupabaseFromLike = {
  from: (table: string) => { insert: (row: Record<string, unknown>) => SupabaseInsertResult };
};
export type SupabaseClientLike = SupabaseFromLike & { auth: SupabaseAuthLike };

type SessionStorageLike = {
  getItem: (k: string) => string | null;
  setItem: (k: string, v: string) => void;
};

type AnalyticsConfig = {
  supabase: SupabaseClientLike;
  appSource: string;          // 'paciente_web', 'medico_mobile', etc.
  storage?: SessionStorageLike; // defaults to window.sessionStorage in browser
};

type TrackOptions = {
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
  /** Override actor (rare; defaults to authenticated user) */
  actorId?: string | null;
  actorRole?: string | null;
};

let config: AnalyticsConfig | null = null;
let cachedActorId: string | null | undefined = undefined;
let cachedActorRole: string | null | undefined = undefined;

const SESSION_KEY = 'rs_analytics_session_id';

function getSessionId(): string | null {
  const storage =
    config?.storage ??
    (typeof window !== 'undefined' ? window.sessionStorage : null);
  if (!storage) return null;
  let id = storage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    storage.setItem(SESSION_KEY, id);
  }
  return id;
}

function getUtm(): { utm_source?: string; utm_medium?: string; utm_campaign?: string } {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const out: Record<string, string> = {};
  const s = params.get('utm_source');
  const m = params.get('utm_medium');
  const c = params.get('utm_campaign');
  if (s) out.utm_source = s;
  if (m) out.utm_medium = m;
  if (c) out.utm_campaign = c;
  return out;
}

export function initAnalytics(cfg: AnalyticsConfig): void {
  config = cfg;
  cachedActorId = undefined;
  cachedActorRole = undefined;

  cfg.supabase.auth.onAuthStateChange((_event: string, session: SupabaseAuthSession) => {
    cachedActorId = session?.user?.id ?? null;
    cachedActorRole = (session?.user?.user_metadata?.role as string | undefined) ?? null;
  });
}

async function resolveActor(): Promise<{ id: string | null; role: string | null }> {
  if (!config) return { id: null, role: null };
  if (cachedActorId !== undefined && cachedActorRole !== undefined) {
    return { id: cachedActorId, role: cachedActorRole };
  }
  try {
    const { data } = await config.supabase.auth.getUser();
    cachedActorId = data?.user?.id ?? null;
    cachedActorRole = (data?.user?.user_metadata?.role as string | undefined) ?? null;
  } catch {
    cachedActorId = null;
    cachedActorRole = null;
  }
  return { id: cachedActorId ?? null, role: cachedActorRole ?? null };
}

export async function track(eventName: string, options: TrackOptions = {}): Promise<void> {
  if (!config) {
    if (typeof console !== 'undefined') {
      console.warn('[analytics] initAnalytics not called; dropping event', eventName);
    }
    return;
  }

  try {
    const actor = options.actorId !== undefined
      ? { id: options.actorId, role: options.actorRole ?? null }
      : await resolveActor();

    const utm = getUtm();
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : null;

    await config.supabase.from('analytics_events').insert({
      event_name:    eventName,
      app_source:    config.appSource,
      actor_id:      actor.id,
      actor_role:    actor.role,
      session_id:    getSessionId(),
      resource_type: options.resourceType ?? null,
      resource_id:   options.resourceId ?? null,
      payload:       options.payload ?? null,
      user_agent:    userAgent,
      ...utm,
    });
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[analytics] track failed (swallowed)', eventName, err);
    }
  }
}

/** Reserved event names — keep in sync with apps/admin/web/docs/metrics-plan.md */
export const ANALYTICS_EVENTS = {
  authSignedUp:           'auth.signed_up',
  authLoggedIn:           'auth.logged_in',
  authFailed:             'auth.failed',
  appointmentSearched:    'appointment.searched',
  appointmentViewed:      'appointment.viewed',
  appointmentCreated:     'appointment.created',
  appointmentPaid:        'appointment.paid',
  appointmentConfirmed:   'appointment.confirmed',
  appointmentCancelled:   'appointment.cancelled',
  appointmentCompleted:   'appointment.completed',
  appointmentNoShow:      'appointment.no_show',
  prescriptionIssued:     'prescription.issued',
  prescriptionDispensed:  'prescription.dispensed',
  paymentInitiated:       'payment.initiated',
  paymentSucceeded:       'payment.succeeded',
  paymentFailed:          'payment.failed',
  chatMessageSent:        'chat.message_sent',
  reviewSubmitted:        'review.submitted',
  errorClient:            'error.client',
} as const;
export type AnalyticsEventName = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS];
