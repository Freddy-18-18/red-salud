import { fetchJson, postJson } from "@/lib/utils/fetch";

// ─── Types ───────────────────────────────────────────────────────────

export interface Rating {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  rating: number;
  comment: string | null;
  would_recommend: boolean;
  created_at: string;
}

export interface SubmitRatingData {
  appointment_id: string;
  doctor_id: string;
  rating: number;
  comment?: string;
  would_recommend: boolean;
}

export interface FollowUpItem {
  id: string;
  appointment_id: string;
  doctor_id: string;
  patient_id: string;
  type: "lab_order" | "prescription" | "next_appointment" | "custom";
  description: string;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  suggested_weeks: number | null;
  created_at: string;
  appointment?: {
    id: string;
    start_time: string;
    end_time: string;
    status: string;
    type: string;
    motivo: string | null;
    doctor?: {
      id: string;
      profile?: {
        first_name: string;
        last_name: string;
        avatar_url: string | null;
      };
      specialty?: {
        id: string;
        name: string;
      };
    };
  };
}

export interface FollowUpStats {
  total: number;
  pending: number;
  completed: number;
}

// ─── Service ─────────────────────────────────────────────────────────

export const ratingService = {
  /**
   * Submit a rating for a completed appointment
   */
  async submitRating(data: SubmitRatingData): Promise<Rating> {
    return postJson<Rating>("/api/ratings", data);
  },

  /**
   * Get the existing rating for an appointment (or null if none)
   */
  async getRating(appointmentId: string): Promise<Rating | null> {
    return fetchJson<Rating | null>(`/api/ratings/${appointmentId}`);
  },

  /**
   * Get pending follow-up items for the patient
   */
  async getPendingFollowUps(): Promise<FollowUpItem[]> {
    const res = await fetch("/api/follow-ups");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as Record<string, string>).error ??
          `Request failed (${res.status})`,
      );
    }
    const json = await res.json();
    return (json.data ?? []) as FollowUpItem[];
  },

  /**
   * Get all follow-ups including completed (for history)
   */
  async getAllFollowUps(): Promise<FollowUpItem[]> {
    const res = await fetch("/api/follow-ups?include_completed=true");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as Record<string, string>).error ??
          `Request failed (${res.status})`,
      );
    }
    const json = await res.json();
    return (json.data ?? []) as FollowUpItem[];
  },

  /**
   * Mark a follow-up item as complete
   */
  async completeFollowUp(
    id: string,
    notes?: string,
  ): Promise<FollowUpItem> {
    return postJson<FollowUpItem>(
      `/api/follow-ups/${id}`,
      { completed: true, notes },
      "PATCH",
    );
  },

  /**
   * Get follow-up stats (total, pending, completed)
   */
  async getFollowUpStats(): Promise<FollowUpStats> {
    const res = await fetch("/api/follow-ups?include_completed=true");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(
        (body as Record<string, string>).error ??
          `Request failed (${res.status})`,
      );
    }
    const json = await res.json();
    const items = (json.data ?? []) as FollowUpItem[];
    const total = items.length;
    const completed = items.filter((i) => i.completed).length;
    return {
      total,
      pending: total - completed,
      completed,
    };
  },
};
