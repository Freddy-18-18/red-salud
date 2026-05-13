/**
 * @file __tests__/resolver-attention.test.ts
 * @description Tests for the `attention` object surfaced by `resolveDoctorModules`.
 *
 * Per medico-shell-supabase-style spec (doctor-capabilities delta):
 * - `attention.verificationPending` MUST mirror `!profile.sacs_verified`.
 * - `attention.sacsExpired` MUST be true when `sacs_verified_at` is older than
 *   1 year, and false otherwise.
 * - When `profile` is null (deleted doctor / degraded), both flags MUST default
 *   to false for `sacsExpired` and true for `verificationPending` (the doctor
 *   cannot be verified if their profile cannot be loaded).
 *
 * These flags drive the GlobalHeader Advisor red-dot and the sidebar NavLink
 * attention dot in the new shell (R5, R7 of app-shell-medico).
 */

import { describe, expect, it } from 'vitest';
import { resolveDoctorModules, type ResolverDeps } from '../resolver';
import type { CapabilityModuleRow } from '../types';

function row(
  source_type: CapabilityModuleRow['source_type'],
  source_value: string,
  module_key: string,
  display_group: CapabilityModuleRow['display_group'] = 'clinica',
  display_order = 100,
): CapabilityModuleRow {
  return {
    id: `${source_type}:${source_value}:${module_key}`,
    source_type,
    source_value,
    module_key,
    display_group,
    display_order,
    min_verification: 'sacs',
    min_plan: 'starter',
  };
}

const ALWAYS_ON: CapabilityModuleRow[] = [
  row('always-on', '*', 'inicio', 'clinica', 10),
];

function makeDeps(
  profileOverride: Partial<{
    sacs_verified: boolean;
    sacs_verified_at: string | null;
  }> = {},
  rows: CapabilityModuleRow[] = ALWAYS_ON,
): ResolverDeps {
  return {
    fetchProfile: async () => ({
      specialty_slug: 'medicina-general',
      sacs_verified: true,
      sacs_verified_at: new Date().toISOString(),
      postgrados_raw: [],
      plan: 'starter',
      certs: [],
      ...profileOverride,
    }),
    fetchPostgradoMapping: async () => [],
    fetchCapabilityModules: async () => rows,
    fetchPreferences: async () => [],
  };
}

const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

describe('resolveDoctorModules — attention flags', () => {
  it('exposes attention.verificationPending=false when sacs_verified=true', async () => {
    const result = await resolveDoctorModules(makeDeps(), 'doc-1');
    expect(result.attention).toBeDefined();
    expect(result.attention.verificationPending).toBe(false);
  });

  it('exposes attention.verificationPending=true when sacs_verified=false (medico1)', async () => {
    const result = await resolveDoctorModules(
      makeDeps({ sacs_verified: false }),
      'doc-1',
    );
    expect(result.attention.verificationPending).toBe(true);
  });

  it('exposes attention.sacsExpired=false when verified within last year', async () => {
    const recent = new Date(Date.now() - ONE_YEAR_MS / 2).toISOString();
    const result = await resolveDoctorModules(
      makeDeps({ sacs_verified: true, sacs_verified_at: recent }),
      'doc-1',
    );
    expect(result.attention.sacsExpired).toBe(false);
  });

  it('exposes attention.sacsExpired=true when sacs_verified_at older than 1 year', async () => {
    // 13 months ago
    const expired = new Date(Date.now() - ONE_YEAR_MS - 30 * 24 * 60 * 60 * 1000).toISOString();
    const result = await resolveDoctorModules(
      makeDeps({ sacs_verified: true, sacs_verified_at: expired }),
      'doc-1',
    );
    expect(result.attention.sacsExpired).toBe(true);
  });

  it('attention.sacsExpired=false when sacs_verified_at is null (never verified)', async () => {
    const result = await resolveDoctorModules(
      makeDeps({ sacs_verified: false, sacs_verified_at: null }),
      'doc-1',
    );
    expect(result.attention.sacsExpired).toBe(false);
    expect(result.attention.verificationPending).toBe(true);
  });

  it('attention defaults to safe values when profile is null (degraded mode)', async () => {
    const deps: ResolverDeps = {
      fetchProfile: async () => null,
      fetchPostgradoMapping: async () => [],
      fetchCapabilityModules: async () => [],
      fetchPreferences: async () => [],
    };
    const result = await resolveDoctorModules(deps, 'doc-deleted');
    expect(result.attention).toBeDefined();
    expect(result.attention.verificationPending).toBe(true);
    expect(result.attention.sacsExpired).toBe(false);
  });

  it('keeps top-level verificationPending field in sync with attention.verificationPending', async () => {
    const result = await resolveDoctorModules(
      makeDeps({ sacs_verified: false }),
      'doc-1',
    );
    expect(result.verificationPending).toBe(result.attention.verificationPending);
  });
});
