import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/utils/rate-limit';

// -------------------------------------------------------------------
// Dashboard Summary — Batch BFF API Route
// -------------------------------------------------------------------
// GET: Returns all data the patient dashboard needs in a single round
//      trip. Each sub-query uses Promise.allSettled so one failure
//      doesn't break the whole response — failed queries return
//      null / 0 defaults.
// -------------------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const limited = checkRateLimit(request, 'authenticated');
    if (limited) return limited;

    const supabase = await createClient();

    // Auth check
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autenticado. Inicia sesion para continuar.' },
        { status: 401 },
      );
    }

    // ── Fire all queries in parallel ──────────────────────────────
    const [
      appointmentsResult,
      prescriptionsResult,
      notificationsResult,
      profileResult,
      messagesConversationsResult,
      conditionsResult,
      followUpsResult,
      referralsResult,
    ] = await Promise.allSettled([
      // Next 3 upcoming appointments (non-cancelled, future only)
      supabase
        .from('appointments')
        .select(
          `
          id,
          doctor_id,
          scheduled_at,
          duration_minutes,
          status,
          reason,
          appointment_type,
          doctor:doctor_profiles!appointments_doctor_id_fkey (
            id,
            specialty_id,
            profile:profiles!doctor_profiles_profile_id_fkey (
              full_name,
              avatar_url
            )
          )
          `,
        )
        .eq('patient_id', user.id)
        .is('deleted_at', null)
        .gte('scheduled_at', new Date().toISOString())
        .neq('status', 'cancelled')
        .order('scheduled_at', { ascending: true })
        .limit(3),

      // Active prescriptions count
      supabase
        .from('prescriptions')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'active'),

      // Unread notifications count
      supabase
        .from('patient_notifications')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('read', false),

      // Patient profile
      supabase
        .from('profiles')
        .select('id, full_name, avatar_url, email')
        .eq('id', user.id)
        .single(),

      // Unread messages — single SECURITY DEFINER RPC returns inbox rows
      // with unread_count already computed per channel.
      supabase.rpc('get_user_dm_inbox', { p_user_id: user.id }),

      // Active chronic conditions count
      supabase
        .from('chronic_conditions')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'active'),

      // Pending follow-ups count
      supabase
        .from('follow_ups')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'pending'),

      // Pending referrals count
      supabase
        .from('referrals')
        .select('id', { count: 'exact', head: true })
        .eq('patient_id', user.id)
        .eq('status', 'pending'),
    ]);

    // ── Unread messages already aggregated by the RPC ───────────────
    let unreadMessages = 0;
    if (
      messagesConversationsResult.status === 'fulfilled' &&
      Array.isArray(messagesConversationsResult.value.data)
    ) {
      const inbox = messagesConversationsResult.value.data as Array<{
        unread_count: number;
      }>;
      unreadMessages = inbox.reduce(
        (acc, row) => acc + (row.unread_count ?? 0),
        0,
      );
    }

    // ── Extract results with safe defaults ────────────────────────

    const appointments =
      appointmentsResult.status === 'fulfilled'
        ? (appointmentsResult.value.data ?? [])
        : [];

    const activePrescriptions =
      prescriptionsResult.status === 'fulfilled'
        ? (prescriptionsResult.value.count ?? 0)
        : 0;

    const unreadNotifications =
      notificationsResult.status === 'fulfilled'
        ? (notificationsResult.value.count ?? 0)
        : 0;

    const profile =
      profileResult.status === 'fulfilled' && profileResult.value.data
        ? {
            full_name: profileResult.value.data.full_name,
            avatar_url: profileResult.value.data.avatar_url,
            email: profileResult.value.data.email,
          }
        : null;

    const activeConditions =
      conditionsResult.status === 'fulfilled'
        ? (conditionsResult.value.count ?? 0)
        : 0;

    const pendingFollowUps =
      followUpsResult.status === 'fulfilled'
        ? (followUpsResult.value.count ?? 0)
        : 0;

    const pendingReferrals =
      referralsResult.status === 'fulfilled'
        ? (referralsResult.value.count ?? 0)
        : 0;

    return NextResponse.json({
      data: {
        profile,
        upcoming_appointments: appointments,
        stats: {
          active_prescriptions: activePrescriptions,
          unread_notifications: unreadNotifications,
          unread_messages: unreadMessages,
          active_conditions: activeConditions,
          pending_follow_ups: pendingFollowUps,
          pending_referrals: pendingReferrals,
        },
      },
    });
  } catch (error) {
    console.error('[Dashboard Summary GET] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 },
    );
  }
}
