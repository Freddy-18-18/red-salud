import { fetchJson } from "@/lib/utils/fetch";

export interface DashboardSummary {
  profile: {
    full_name: string;
    avatar_url: string | null;
    email: string;
  } | null;
  upcoming_appointments: Array<{
    id: string;
    doctor_id: string;
    start_time: string;
    end_time: string;
    status: string;
    motivo: string | null;
    type: string;
    doctor?: {
      id: string;
      profile?: { full_name: string; avatar_url: string | null };
      specialty?: { name: string };
    };
  }>;
  stats: {
    active_prescriptions: number;
    unread_notifications: number;
    unread_messages: number;
    active_conditions: number;
    pending_follow_ups: number;
    pending_referrals: number;
  };
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return fetchJson<DashboardSummary>("/api/dashboard/summary");
}
