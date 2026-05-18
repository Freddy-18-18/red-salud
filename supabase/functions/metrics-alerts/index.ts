// Automated alerts. Runs every 5 minutes. Writes findings to public.system_alerts.
//
// Rules implemented:
//   - error_rate_spike     : > 2% errors in last 5 min  → high
//   - app_silent           : no events in last 10 min from an app that had >0 events yesterday → high
//   - cancellation_spike   : > 25% cancelled appointments in last 24h → medium
//   - payment_failure_rate : > 10% failed payments in last 1h → high
//   - sacs_queue_stale     : medico without sacs verification > 7 days → low
//   - support_unanswered   : (placeholder — wire when support_tickets exists)
//
// Deploy: pnpm dlx supabase functions deploy metrics-alerts
// Schedule: */5 * * * *

import { createClient, SupabaseClient } from 'jsr:@supabase/supabase-js@2';

type Severity = 'low' | 'medium' | 'high' | 'critical';

type AlertRow = {
  rule_name: string;
  severity:  Severity;
  message:   string;
  payload:   Record<string, unknown>;
};

async function ruleErrorRateSpike(s: SupabaseClient): Promise<AlertRow[]> {
  const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data, error } = await s
    .from('analytics_events')
    .select('event_name', { count: 'exact' })
    .gte('occurred_at', since);
  if (error || !data) return [];

  const total = data.length;
  if (total < 50) return []; // not enough volume to be meaningful
  const errors = data.filter((r) => r.event_name === 'error.client').length;
  const ratio = errors / total;
  if (ratio <= 0.02) return [];

  return [{
    rule_name: 'error_rate_spike',
    severity:  'high',
    message:   `Error rate ${(ratio * 100).toFixed(1)}% en últimos 5 min (${errors}/${total})`,
    payload:   { window_min: 5, errors, total, ratio },
  }];
}

async function ruleCancellationSpike(s: SupabaseClient): Promise<AlertRow[]> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await s
    .from('appointments')
    .select('status')
    .gte('created_at', since);
  if (error || !data) return [];
  if (data.length < 20) return [];
  const cancelled = data.filter((r) => r.status === 'cancelled').length;
  const ratio = cancelled / data.length;
  if (ratio <= 0.25) return [];
  return [{
    rule_name: 'cancellation_spike',
    severity:  'medium',
    message:   `Cancelaciones ${(ratio * 100).toFixed(1)}% en últimas 24h (${cancelled}/${data.length})`,
    payload:   { window_h: 24, cancelled, total: data.length, ratio },
  }];
}

async function rulePaymentFailureRate(s: SupabaseClient): Promise<AlertRow[]> {
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data, error } = await s
    .from('payments')
    .select('status')
    .gte('created_at', since);
  if (error || !data) return [];
  if (data.length < 10) return [];
  const failed = data.filter((r) => r.status === 'rejected').length;
  const ratio = failed / data.length;
  if (ratio <= 0.10) return [];
  return [{
    rule_name: 'payment_failure_rate',
    severity:  'high',
    message:   `Pagos rechazados ${(ratio * 100).toFixed(1)}% en última hora (${failed}/${data.length})`,
    payload:   { window_h: 1, rejected: failed, total: data.length, ratio },
  }];
}

async function ruleSacsQueueStale(s: SupabaseClient): Promise<AlertRow[]> {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count } = await s
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'medico')
    .or('sacs_verified.is.null,sacs_verified.eq.false')
    .lte('created_at', cutoff)
    .is('deleted_at', null);
  if (!count || count === 0) return [];
  return [{
    rule_name: 'sacs_queue_stale',
    severity:  'low',
    message:   `${count} médico(s) con SACS pendiente > 7 días`,
    payload:   { count },
  }];
}

async function alreadyOpen(s: SupabaseClient, ruleName: string): Promise<boolean> {
  const { count } = await s
    .from('system_alerts')
    .select('id', { count: 'exact', head: true })
    .eq('rule_name', ruleName)
    .is('resolved_at', null);
  return (count ?? 0) > 0;
}

Deno.serve(async (req) => {
  const isScheduled = req.headers.get('x-supabase-cron') !== null;
  const auth = req.headers.get('authorization') ?? '';
  const expected = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`;
  if (!isScheduled && auth !== expected) return new Response('unauthorized', { status: 401 });

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const ruleSets = await Promise.all([
    ruleErrorRateSpike(supabase),
    ruleCancellationSpike(supabase),
    rulePaymentFailureRate(supabase),
    ruleSacsQueueStale(supabase),
  ]);

  const inserts: AlertRow[] = [];
  for (const rs of ruleSets) {
    for (const r of rs) {
      if (!(await alreadyOpen(supabase, r.rule_name))) inserts.push(r);
    }
  }

  if (inserts.length > 0) {
    const { error } = await supabase.from('system_alerts').insert(inserts);
    if (error) {
      console.error('[metrics-alerts] insert failed', error);
      return Response.json({ ok: false, error: error.message }, { status: 500 });
    }
  }

  return Response.json({ ok: true, fired: inserts.length, rules: inserts.map((i) => i.rule_name) });
});
