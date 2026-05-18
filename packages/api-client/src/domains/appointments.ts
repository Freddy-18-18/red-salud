import type { ApiClient } from '../client';

// ── Gateway response shapes ─────────────────────────────────────────
// Snake_case to match the underlying Supabase columns. Adapters in each
// web app translate to local view models if needed.

export interface GatewayAppointment {
  id: string;
  doctor_id: string;
  patient_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  reason: string;
  notes: string | null;
  status: string;
  appointment_type: string | null;
  price: number | null;
  location_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface GatewayAppointmentListResponse {
  data: GatewayAppointment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface GatewayAppointmentCreateResponse {
  data: GatewayAppointment;
}

// ── Request shapes ──────────────────────────────────────────────────

export interface ListAppointmentsParams {
  status?: string;
  from?: string; // ISO-8601 datetime
  to?: string;   // ISO-8601 datetime
  page?: number;
  pageSize?: number;
}

export interface CreateAppointmentInput {
  doctor_id: string;
  scheduled_at: string;            // ISO-8601 datetime
  duration_minutes?: number;       // default 30
  reason: string;
  notes?: string;
  appointment_type?: string;       // default 'in_person'
  location_id?: string;
  price?: number;
}

// Legacy aliases kept for backward compatibility with consumers that may
// import these symbols by name. Prefer the gateway-aligned names above.
export type AppointmentFilters = ListAppointmentsParams;
export type CreateAppointmentData = CreateAppointmentInput;
export type UpdateAppointmentData = Partial<CreateAppointmentInput>;
export type CancelAppointmentData = { reason?: string };
export type RescheduleAppointmentData = { scheduled_at: string; reason?: string };
export type ScheduleFilters = { from?: string; to?: string };
export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────

function toQueryParams(p?: ListAppointmentsParams): Record<string, string> {
  const out: Record<string, string> = {};
  if (!p) return out;
  if (p.status) out.status = p.status;
  if (p.from) out.from = p.from;
  if (p.to) out.to = p.to;
  if (p.page) out.page = String(p.page);
  if (p.pageSize) out.page_size = String(p.pageSize);
  return out;
}

// ── Domain client ───────────────────────────────────────────────────

export class AppointmentsApi {
  constructor(private client: ApiClient) {}

  /**
   * List the current user's appointments. The gateway resolves the user from
   * the bearer token, so no patient/doctor id is needed.
   */
  list(params?: ListAppointmentsParams): Promise<GatewayAppointmentListResponse> {
    return this.client.get<GatewayAppointmentListResponse>(
      '/appointments',
      toQueryParams(params),
    ) as unknown as Promise<GatewayAppointmentListResponse>;
  }

  /**
   * Book a new appointment. The gateway validates slot availability via the
   * `check_time_block_conflict` RPC and returns 409 on conflict.
   */
  create(input: CreateAppointmentInput): Promise<GatewayAppointmentCreateResponse> {
    return this.client.post<GatewayAppointmentCreateResponse>(
      '/appointments',
      input,
    ) as unknown as Promise<GatewayAppointmentCreateResponse>;
  }
}
