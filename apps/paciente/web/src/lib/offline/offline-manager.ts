/**
 * Offline data manager
 *
 * Caches critical patient data in localStorage for offline access.
 * Uses a simple sync queue for actions performed while offline.
 */

import { supabase } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CachedMedication {
  id: string;
  medication_name: string;
  dosage?: string;
  schedule_times: string[];
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface MedicalIdData {
  full_name: string;
  blood_type?: string;
  allergies: string[];
  conditions: string[];
  emergency_contacts: EmergencyContact[];
  cedula?: string;
}

export interface OfflineAction {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  created_at: string;
}

// ─── Storage keys ────────────────────────────────────────────────────────────

const KEYS = {
  medications: "offline_medications",
  allergies: "offline_allergies",
  conditions: "offline_conditions",
  emergencyContacts: "offline_emergency_contacts",
  medicalId: "offline_medical_id",
  actionQueue: "offline_action_queue",
  lastSync: "offline_last_sync",
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Error writing to localStorage:", err);
  }
}

// ─── Cache patient data ──────────────────────────────────────────────────────

export async function cachePatientData(patientId: string): Promise<void> {
  try {
    // Fetch profile for medical ID
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, national_id")
      .eq("id", patientId)
      .maybeSingle();

    // Fetch medical details for allergies/conditions
    let medical = null;
    try {
      const { data, error } = await supabase
        .from("patient_details")
        .select("grupo_sanguineo, alergias, enfermedades_cronicas")
        .eq("profile_id", patientId)
        .maybeSingle();
      if (!error) medical = data;
    } catch {
      // patient_details table may not exist yet
    }

    if (profile) {
      const medicalId: MedicalIdData = {
        full_name: profile.full_name || "",
        blood_type: medical?.grupo_sanguineo || undefined,
        cedula: profile.national_id,
        allergies: medical?.alergias || [],
        conditions: medical?.enfermedades_cronicas || [],
        emergency_contacts: [],
      };

      safeSet(KEYS.medicalId, medicalId);
      safeSet(KEYS.allergies, medicalId.allergies);
      safeSet(KEYS.conditions, medicalId.conditions);
    }

    // Fetch emergency contacts
    try {
      const { data: contacts, error: contactsErr } = await supabase
        .from("emergency_contacts")
        .select("name, phone, relationship")
        .eq("patient_id", patientId);

      if (!contactsErr && contacts) {
        safeSet(KEYS.emergencyContacts, contacts);

        // Update medical ID with contacts
        const medId = safeGet<MedicalIdData | null>(KEYS.medicalId, null);
        if (medId) {
          medId.emergency_contacts = contacts as EmergencyContact[];
          safeSet(KEYS.medicalId, medId);
        }
      }
    } catch {
      // emergency_contacts table may not exist yet
    }

    // Fetch active medication reminders
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data: meds, error: medsErr } = await supabase
        .from("medication_reminders")
        .select("id, medication_name, dosage, schedule_times")
        .eq("patient_id", patientId)
        .lte("starts_at", today)
        .or(`ends_at.is.null,ends_at.gte.${today}`);

      if (!medsErr && meds) {
        safeSet(KEYS.medications, meds);
      }
    } catch {
      // medication_reminders table may not exist yet
    }

    safeSet(KEYS.lastSync, new Date().toISOString());
  } catch {
    // Silently ignore caching errors — offline cache is best-effort
  }
}

// ─── Read cached data ────────────────────────────────────────────────────────

export function getMedications(): CachedMedication[] {
  return safeGet(KEYS.medications, []);
}

export function getAllergies(): string[] {
  return safeGet(KEYS.allergies, []);
}

export function getConditions(): string[] {
  return safeGet(KEYS.conditions, []);
}

export function getEmergencyContacts(): EmergencyContact[] {
  return safeGet(KEYS.emergencyContacts, []);
}

export function getMedicalId(): MedicalIdData | null {
  return safeGet(KEYS.medicalId, null);
}

export function getLastSync(): string | null {
  return safeGet(KEYS.lastSync, null);
}

// ─── Sync queue ──────────────────────────────────────────────────────────────

export function queueAction(action: Omit<OfflineAction, "id" | "created_at">): void {
  const queue = safeGet<OfflineAction[]>(KEYS.actionQueue, []);
  queue.push({
    ...action,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  });
  safeSet(KEYS.actionQueue, queue);
}

export function getQueuedActions(): OfflineAction[] {
  return safeGet(KEYS.actionQueue, []);
}

export async function flushQueue(): Promise<void> {
  const queue = getQueuedActions();
  if (queue.length === 0) return;

  const failed: OfflineAction[] = [];

  for (const action of queue) {
    try {
      // Process each action type
      switch (action.type) {
        case "medication_taken": {
          await supabase.from("medication_intake_log").insert({
            patient_id: action.payload.patient_id,
            medication_reminder_id: action.payload.reminder_id,
            scheduled_at: action.payload.scheduled_at,
            taken_at: action.payload.taken_at,
            status: "taken",
          });
          break;
        }
        default:
          console.warn("Unknown offline action type:", action.type);
          break;
      }
    } catch {
      failed.push(action);
    }
  }

  // Keep only the failed actions in the queue
  safeSet(KEYS.actionQueue, failed);
}

// ─── Online status ───────────────────────────────────────────────────────────

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

export function onStatusChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
