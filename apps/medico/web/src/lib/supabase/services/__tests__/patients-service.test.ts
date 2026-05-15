/**
 * @file lib/supabase/services/__tests__/patients-service.test.ts
 * @description Strict TDD behavior tests for `patients-service.ts`.
 *
 * Tasks covered: T-1-05 / REQ-1.5, REQ-1.7, REQ-X.1, REQ-X.4.
 *
 * Contract:
 * - `listPatientsForDoctor` and `getPatientFullById` MUST return discriminated
 *   `{ data, error }` envelopes — they MUST NOT throw raw Supabase errors
 *   (SC-1.5).
 * - On the happy path, `data` matches the @red-salud/types shape (national_id,
 *   phone, date_of_birth — NOT cedula/telefono/fecha_nacimiento).
 * - On error, `data` is null and `error` is a `ServiceError` with a UI-safe
 *   message (no PHI).
 *
 * Mocking strategy: dependency injection. Each service function accepts a
 * `client` parameter typed as a minimal interface — tests pass a scriptable
 * stub that mirrors the chained Supabase query builder shape. This matches
 * the existing pattern in `lib/sedes/service.test.ts` and `lib/chronic/`.
 */

import { describe, expect, it, vi } from 'vitest';
import {
  listPatientsForDoctor,
  getPatientFullById,
  type PatientsSupabaseClient,
} from '../patients-service';

/**
 * Builds a stub `from(table).select(...)` chain that resolves to the given
 * payload. The chain methods (`eq`, `or`, `order`, `limit`, `in`, etc.) are
 * all chainable no-ops returning `this`; only the terminal `.then` (awaited
 * promise) returns the payload.
 *
 * For `maybeSingle()` / single-row reads, the stub exposes a `maybeSingle()`
 * method that resolves directly.
 */
function buildClientStub(
  scripts: Record<
    string,
    () => Promise<{ data: unknown; error: { message: string } | null }>
  >,
): PatientsSupabaseClient {
  const fromFn = vi.fn((table: string) => {
    const script = scripts[table];
    if (!script) {
      throw new Error(`[stub] Unexpected supabase table access: ${table}`);
    }

    // Each builder method returns the same chainable proxy. The terminal call
    // is `.then` (when awaited) — which we expose via a thenable below.
    const chain: Record<string, unknown> = {};
    const chainable = new Proxy(chain, {
      get(_target, prop) {
        if (prop === 'then') {
          // The awaited terminal value: invoke the script.
          return (resolve: (v: unknown) => void) => script().then(resolve);
        }
        if (prop === 'maybeSingle') {
          return () => script();
        }
        if (prop === 'single') {
          return () => script();
        }
        // Every other method is a chain-returning no-op.
        return () => chainable;
      },
    });
    return chainable as unknown;
  });

  return { from: fromFn } as unknown as PatientsSupabaseClient;
}

describe('listPatientsForDoctor (REQ-1.5, SC-1.5)', () => {
  it('returns typed data on happy path', async () => {
    // Doctor has 2 patients in their roster — service returns PatientSummary[].
    const profileRows = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        full_name: 'María Pérez',
        national_id: 'V-12345678',
        phone: '+58-414-1234567',
        date_of_birth: '1985-03-15',
        avatar_url: null,
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        full_name: 'Carlos Rodríguez',
        national_id: 'V-87654321',
        phone: null,
        date_of_birth: '1970-11-20',
        avatar_url: null,
      },
    ];

    const client = buildClientStub({
      doctor_patients: async () => ({
        data: [
          { patient_id: profileRows[0].id },
          { patient_id: profileRows[1].id },
        ],
        error: null,
      }),
      profiles: async () => ({ data: profileRows, error: null }),
      appointments: async () => ({ data: [], error: null }),
    });

    const result = await listPatientsForDoctor(client, {
      doctorId: '00000000-0000-0000-0000-0000000000aa',
    });

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data).toHaveLength(2);

    const first = result.data![0];
    // Real schema column names (REQ-1.4)
    expect(first.national_id).toBe('V-12345678');
    expect(first.phone).toBe('+58-414-1234567');
    expect(first.date_of_birth).toBe('1985-03-15');
    expect(first.full_name).toBe('María Pérez');
    // Aggregate-derived fields default to safe values when no appointments
    expect(first.total_visits).toBe(0);
    expect(first.last_visit_at).toBeNull();
    expect(first.next_appointment_at).toBeNull();
  });

  it('returns { data: null, error } envelope on Supabase error (SC-1.5)', async () => {
    // RLS rejection or network error — the function MUST NOT throw.
    const client = buildClientStub({
      doctor_patients: async () => ({
        data: null,
        error: { message: 'RLS policy violation' },
      }),
    });

    // Should resolve, not reject.
    const result = await listPatientsForDoctor(client, {
      doctorId: '00000000-0000-0000-0000-0000000000aa',
    });

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBeTruthy();
    // Error message MUST be UI-safe — no patient identifiers (REQ-X.1).
    // We only verify it's a non-empty string; PHI-redaction is a property
    // of the implementation, not the stub.
    expect(typeof result.error?.message).toBe('string');
  });

  it('returns empty array (not null) when the doctor has zero patients', async () => {
    const client = buildClientStub({
      doctor_patients: async () => ({ data: [], error: null }),
      profiles: async () => ({ data: [], error: null }),
      appointments: async () => ({ data: [], error: null }),
    });

    const result = await listPatientsForDoctor(client, {
      doctorId: '00000000-0000-0000-0000-0000000000aa',
    });

    // Distinguishes "no roster" (empty) from "fetch failed" (null + error).
    expect(result.error).toBeNull();
    expect(result.data).toEqual([]);
  });
});

describe('getPatientFullById (REQ-1.5)', () => {
  it('returns typed data on happy path including optional patient_details', async () => {
    const profileRow = {
      id: '00000000-0000-0000-0000-000000000003',
      full_name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      national_id: 'V-87654321',
      phone: '+58-412-7654321',
      date_of_birth: '1970-11-20',
      gender: 'masculino',
      city: 'Caracas',
      state: 'Distrito Capital',
      nationality: 'venezolana',
      avatar_url: null,
      patient_details: {
        profile_id: '00000000-0000-0000-0000-000000000003',
        grupo_sanguineo: 'O+',
        alergias: ['Penicilina'],
        enfermedades_cronicas: ['hipertension'],
        medicamentos_actuales: ['Losartán 50mg'],
        notas_medicas: null,
        peso_kg: 78,
        altura_cm: 175,
      },
    };

    const client = buildClientStub({
      profiles: async () => ({ data: profileRow, error: null }),
    });

    const result = await getPatientFullById(
      client,
      '00000000-0000-0000-0000-000000000003',
    );

    expect(result.error).toBeNull();
    expect(result.data).not.toBeNull();
    expect(result.data?.national_id).toBe('V-87654321');
    expect(result.data?.city).toBe('Caracas');
    expect(result.data?.state).toBe('Distrito Capital');
    expect(result.data?.patient_details?.alergias).toEqual(['Penicilina']);
  });

  it('returns { data: null, error: null } when no row matches the id', async () => {
    // PostgREST returns `data: null, error: null` on maybeSingle() miss.
    // Service must treat this as "not found" — neither success-with-data
    // nor explicit error.
    const client = buildClientStub({
      profiles: async () => ({ data: null, error: null }),
    });

    const result = await getPatientFullById(
      client,
      '00000000-0000-0000-0000-00000000dead',
    );

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.code).toBe('not_found');
  });

  it('returns { data: null, error } envelope on Supabase error (no throw)', async () => {
    const client = buildClientStub({
      profiles: async () => ({
        data: null,
        error: { message: 'permission denied for table profiles' },
      }),
    });

    const result = await getPatientFullById(
      client,
      '00000000-0000-0000-0000-000000000003',
    );

    expect(result.data).toBeNull();
    expect(result.error).not.toBeNull();
    expect(result.error?.message).toBeTruthy();
  });
});
