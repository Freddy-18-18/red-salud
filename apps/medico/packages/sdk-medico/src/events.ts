import { z } from 'zod';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Standard Medico Event Types
 */
export const MedicoEventTypeSchema = z.enum([
  'APPOINTMENT_CREATED',
  'APPOINTMENT_UPDATED',
  'APPOINTMENT_CANCELLED',
  'PATIENT_ARRIVED',
  'PRESCRIPTION_SIGNED',
  'CONSULTATION_STARTED',
  'CONSULTATION_COMPLETED',
  'LABORATORY_ORDER_CREATED',
]);

export type MedicoEventType = z.infer<typeof MedicoEventTypeSchema>;

export interface MedicoEvent<T = any> {
  type: MedicoEventType;
  payload: T;
  timestamp: string;
  source: 'web' | 'desktop' | 'mobile' | 'system';
  doctorId?: string;
  patientId?: string;
}

export class MedicoEventBus {
  private listeners: Map<MedicoEventType, Set<(event: MedicoEvent) => void>> = new Map();
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.setupRealtimeSync();
  }

  /**
   * Subscribe to specific events
   */
  subscribe(type: MedicoEventType, callback: (event: MedicoEvent) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  /**
   * Emit an event locally and to Supabase Realtime
   */
  async emit(event: Omit<MedicoEvent, 'timestamp'>) {
    const fullEvent: MedicoEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // Internal emit
    this.listeners.get(fullEvent.type)?.forEach(cb => cb(fullEvent));

    // Supabase Realtime emit (Broadcast)
    await this.supabase.channel('medico-events').send({
      type: 'broadcast',
      event: fullEvent.type,
      payload: fullEvent,
    });
  }

  /**
   * Listen for events from other clients via Supabase Realtime
   */
  private setupRealtimeSync() {
    this.supabase
      .channel('medico-events')
      .on('broadcast', { event: '*' }, (payload) => {
        const event = payload.payload as MedicoEvent;
        if (MedicoEventTypeSchema.safeParse(event.type).success) {
          this.listeners.get(event.type)?.forEach(cb => cb(event));
        }
      })
      .subscribe();
  }
}

export function createEventsSdk(supabase: SupabaseClient) {
  return new MedicoEventBus(supabase);
}
