// Daily metrics pre-aggregation.
//
// Schedule: cron daily at 03:00 America/Caracas (07:00 UTC).
// Refreshes metrics_daily_global + metrics_daily_by_app for yesterday and today.
//
// Deploy: pnpm dlx supabase functions deploy metrics-aggregate
// Schedule (Supabase dashboard → Cron): 0 7 * * *

import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  // Auth: require Supabase service role key in Authorization header for manual triggers,
  // OR allow scheduled invocations via the cron header.
  const authHeader = req.headers.get('authorization') ?? '';
  const isScheduled = req.headers.get('x-supabase-cron') !== null;
  const expectedAuth = `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`;

  if (!isScheduled && authHeader !== expectedAuth) {
    return new Response('unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const dates = [fmt(yesterday), fmt(today)];
  const errors: string[] = [];

  for (const d of dates) {
    const { error: e1 } = await supabase.rpc('refresh_metrics_daily_global', { target_date: d });
    if (e1) errors.push(`global ${d}: ${e1.message}`);
    const { error: e2 } = await supabase.rpc('refresh_metrics_daily_by_app', { target_date: d });
    if (e2) errors.push(`by_app ${d}: ${e2.message}`);
  }

  if (errors.length > 0) {
    console.error('[metrics-aggregate] errors', errors);
    return Response.json({ ok: false, errors }, { status: 500 });
  }

  return Response.json({ ok: true, refreshed: dates });
});
