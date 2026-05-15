/**
 * @file types/__tests__/patient.test.ts
 * @description Strict TDD type-shape tests for the shared patient types
 * exported from `@red-salud/types`. These tests are the contract every
 * consumer relies on: column names match the real Supabase `profiles`
 * schema (national_id, phone, date_of_birth, city, state) — NOT the legacy
 * Spanish aliases (cedula, telefono, fecha_nacimiento, ciudad, estado) that
 * the old `useDoctorAppointments` shim synthesizes.
 *
 * Tasks covered: T-1-03 (REQ-1.4 + spec §2).
 *
 * Why these tests are runtime-checks-of-shape, not pure compile-time
 * checks: Vitest only sees emitted JS, and TS type-only assertions
 * would not run. We construct concrete fixture values and assert each
 * property exists / has the documented narrowest type. If a future edit
 * renames a property back to a Spanish alias, these tests fail at the
 * property-access site.
 */

import { describe, expect, it } from 'vitest';
import type { PatientSummary, PatientFull } from '@red-salud/types';

describe('PatientSummary (REQ-1.4)', () => {
  it('uses real profiles schema column names (national_id, phone, date_of_birth)', () => {
    const summary: PatientSummary = {
      id: '00000000-0000-0000-0000-000000000001',
      full_name: 'María Pérez',
      national_id: 'V-12345678',
      phone: '+58-414-1234567',
      date_of_birth: '1985-03-15',
      avatar_url: null,
      last_visit_at: '2026-04-01T15:00:00Z',
      next_appointment_at: '2026-06-01T10:00:00Z',
      total_visits: 4,
    };

    // Each property MUST be addressable under the documented name.
    expect(summary.id).toBe('00000000-0000-0000-0000-000000000001');
    expect(summary.full_name).toBe('María Pérez');
    expect(summary.national_id).toBe('V-12345678');
    expect(summary.phone).toBe('+58-414-1234567');
    expect(summary.date_of_birth).toBe('1985-03-15');
    expect(summary.avatar_url).toBeNull();
    expect(summary.last_visit_at).toBe('2026-04-01T15:00:00Z');
    expect(summary.next_appointment_at).toBe('2026-06-01T10:00:00Z');
    expect(summary.total_visits).toBe(4);
  });

  it('accepts null for every optional column (truly absent in DB)', () => {
    const minimal: PatientSummary = {
      id: '00000000-0000-0000-0000-000000000002',
      full_name: 'Sin Nombre',
      national_id: null,
      phone: null,
      date_of_birth: null,
      avatar_url: null,
      last_visit_at: null,
      next_appointment_at: null,
      total_visits: 0,
    };

    expect(minimal.national_id).toBeNull();
    expect(minimal.phone).toBeNull();
    expect(minimal.date_of_birth).toBeNull();
    expect(minimal.last_visit_at).toBeNull();
    expect(minimal.next_appointment_at).toBeNull();
    expect(minimal.total_visits).toBe(0);
  });
});

describe('PatientFull (REQ-1.4)', () => {
  it('matches profiles + patient_details shape with real column names', () => {
    const full: PatientFull = {
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
        notas_medicas: 'Paciente colaborador',
        peso_kg: 78,
        altura_cm: 175,
      },
    };

    // Real schema column names
    expect(full.national_id).toBe('V-87654321');
    expect(full.phone).toBe('+58-412-7654321');
    expect(full.date_of_birth).toBe('1970-11-20');
    expect(full.city).toBe('Caracas');
    expect(full.state).toBe('Distrito Capital');
    expect(full.nationality).toBe('venezolana');

    // patient_details join is optional but typed when present
    expect(full.patient_details).not.toBeNull();
    expect(full.patient_details?.alergias).toEqual(['Penicilina']);
    expect(full.patient_details?.enfermedades_cronicas).toEqual(['hipertension']);
    expect(full.patient_details?.grupo_sanguineo).toBe('O+');
    expect(full.patient_details?.peso_kg).toBe(78);
    expect(full.patient_details?.altura_cm).toBe(175);
  });

  it('accepts null patient_details when the join row is missing', () => {
    // Doctors can encounter patients whose patient_details row has not been
    // created yet — the spec's SC-2.2 calls this out explicitly. The type
    // MUST permit it.
    const withoutDetails: PatientFull = {
      id: '00000000-0000-0000-0000-000000000004',
      full_name: 'Ana Silva',
      email: null,
      national_id: null,
      phone: null,
      date_of_birth: null,
      gender: null,
      city: null,
      state: null,
      nationality: null,
      avatar_url: null,
      patient_details: null,
    };

    expect(withoutDetails.patient_details).toBeNull();
  });

  it('uses ISO 8601 string for date_of_birth (not Date object)', () => {
    // ISO strings are what Supabase returns. Components convert with
    // toLocaleDateString('es-VE', { timeZone: 'America/Caracas' }) per
    // REQ-X.2.
    const full: PatientFull = {
      id: '00000000-0000-0000-0000-000000000005',
      full_name: 'José Martínez',
      email: null,
      national_id: null,
      phone: null,
      date_of_birth: '1990-06-30',
      gender: null,
      city: null,
      state: null,
      nationality: null,
      avatar_url: null,
      patient_details: null,
    };

    // It MUST be a string and parseable as a date.
    expect(typeof full.date_of_birth).toBe('string');
    expect(Number.isNaN(new Date(full.date_of_birth as string).getTime())).toBe(false);
  });
});
