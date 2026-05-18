'use server';

import 'server-only';
import { adminSupabase } from '@/lib/supabase/admin';
import { requirePermission } from '@/lib/rbac';
import { getAuditContext, withAudit } from '@/lib/audit';

export type UserProfile = {
  id:           string;
  email:        string;
  full_name:    string | null;
  first_name:   string | null;
  last_name:    string | null;
  phone:        string | null;
  national_id:  string | null;
  rif:          string | null;
  date_of_birth: string | null;
  nationality:  string | null;
  address:      string | null;
  city:         string | null;
  state:        string | null;
  role:         string;
  avatar_url:   string | null;
  national_id_verified: boolean | null;
  sacs_verified:        boolean | null;
  sacs_license:         string | null;
  sacs_specialty:       string | null;
  two_factor_enabled:   boolean | null;
  subscription_type:    string | null;
  trial_expires_at:     string | null;
  profile_locked:       boolean | null;
  created_at:           string | null;
  deleted_at:           string | null;
};

export type AppointmentSummary = {
  total: number;
  upcoming: number;
  cancelled: number;
  last_30d: number;
};

export type PaymentSummary = {
  total_count: number;
  total_amount_usd: number;
  total_amount_ves: number;
  last_payment_at: string | null;
};

export type CrossDomainProfile = {
  profile:        UserProfile;
  appointments:   AppointmentSummary;
  payments:       PaymentSummary;
  prescriptions:  { count: number; latest_at: string | null };
  medicalNotes:   { count: number; latest_at: string | null };
  documents:      { count: number };
  reviews:        { given: number; received: number; avg_rating: number | null };
  labOrders:      { count: number; latest_at: string | null };
};

export async function getCrossDomainProfile(userId: string): Promise<CrossDomainProfile> {
  const session = await requirePermission('users.view');
  const ctx = await getAuditContext(session);
  const admin = adminSupabase();

  return await withAudit(
    ctx,
    {
      action:        'users.view',
      resourceType:  'profile',
      resourceId:    userId,
    },
    async () => {
      const profileQ = admin
        .from('profiles')
        .select(
          'id,email,full_name,first_name,last_name,phone,national_id,rif,date_of_birth,nationality,address,city,state,role,avatar_url,national_id_verified,sacs_verified,sacs_license,sacs_specialty,two_factor_enabled,subscription_type,trial_expires_at,profile_locked,created_at,deleted_at',
        )
        .eq('id', userId)
        .maybeSingle();

      const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const [
        profileR,
        apptTotal,
        apptUpcoming,
        apptCancelled,
        appt30d,
        paymentsR,
        prescriptionsR,
        medicalNotesR,
        documentsR,
        reviewsGivenR,
        reviewsReceivedR,
        avgRatingR,
        labOrdersR,
      ] = await Promise.all([
        profileQ,
        admin.from('appointments').select('id', { count: 'exact', head: true })
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`),
        admin.from('appointments').select('id', { count: 'exact', head: true })
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .gte('scheduled_at', new Date().toISOString())
          .neq('status', 'cancelled'),
        admin.from('appointments').select('id', { count: 'exact', head: true })
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .eq('status', 'cancelled'),
        admin.from('appointments').select('id', { count: 'exact', head: true })
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .gte('created_at', since30d),

        admin.from('payments').select('id,amount,currency,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),

        admin.from('prescriptions').select('id,created_at')
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(1),

        admin.from('medical_notes').select('id,created_at')
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(1),

        admin.from('patient_documents').select('id', { count: 'exact', head: true })
          .eq('patient_id', userId),

        admin.from('doctor_reviews').select('id', { count: 'exact', head: true })
          .eq('patient_id', userId),
        admin.from('doctor_reviews').select('id', { count: 'exact', head: true })
          .eq('doctor_id', userId),
        admin.from('doctor_reviews').select('rating')
          .eq('doctor_id', userId),

        admin.from('lab_orders').select('id,created_at')
          .or(`patient_id.eq.${userId},doctor_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(1),
      ]);

      if (profileR.error) throw new Error(`profile: ${profileR.error.message}`);
      if (!profileR.data)  throw new Error('Usuario no encontrado');

      const payments = paymentsR.data ?? [];
      let totalUsd = 0;
      let totalVes = 0;
      for (const p of payments) {
        const amt = Number(p.amount ?? 0);
        if (p.currency === 'USD') totalUsd += amt;
        else if (p.currency === 'VES') totalVes += amt;
      }

      const ratings = (avgRatingR.data ?? []).map((r) => Number(r.rating)).filter((n) => Number.isFinite(n));
      const avgRating = ratings.length ? ratings.reduce((s, n) => s + n, 0) / ratings.length : null;

      return {
        profile:      profileR.data as UserProfile,
        appointments: {
          total:     apptTotal.count ?? 0,
          upcoming:  apptUpcoming.count ?? 0,
          cancelled: apptCancelled.count ?? 0,
          last_30d:  appt30d.count ?? 0,
        },
        payments: {
          total_count:      payments.length,
          total_amount_usd: totalUsd,
          total_amount_ves: totalVes,
          last_payment_at:  payments[0]?.created_at ?? null,
        },
        prescriptions: {
          count:     prescriptionsR.data?.length ? 1 : 0,
          latest_at: prescriptionsR.data?.[0]?.created_at ?? null,
        },
        medicalNotes: {
          count:     medicalNotesR.data?.length ? 1 : 0,
          latest_at: medicalNotesR.data?.[0]?.created_at ?? null,
        },
        documents: { count: documentsR.count ?? 0 },
        reviews: {
          given:      reviewsGivenR.count ?? 0,
          received:   reviewsReceivedR.count ?? 0,
          avg_rating: avgRating,
        },
        labOrders: {
          count:     labOrdersR.data?.length ? 1 : 0,
          latest_at: labOrdersR.data?.[0]?.created_at ?? null,
        },
      };
    },
  );
}
