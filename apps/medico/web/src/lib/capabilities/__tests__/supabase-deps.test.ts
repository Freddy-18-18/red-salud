import { describe, expect, it, vi } from 'vitest';
import { buildSupabaseResolverDeps } from '../supabase-deps';

/**
 * Lightweight Supabase stub. Returns a chainable builder that records each call
 * and resolves with a configured payload. We don't import the real client to
 * keep this test free of `@supabase/ssr` setup.
 */
function makeSupabaseStub(payloads: {
  doctor_profiles?: { data: unknown; error?: unknown };
  sacs_postgrado_mapping?: { data: unknown; error?: unknown };
  capability_modules?: { data: unknown; error?: unknown };
  doctor_module_preferences?: { data: unknown; error?: unknown };
}) {
  const calls: Array<{ table: string; method: string; arg: unknown }> = [];
  const builderFor = (table: string) => {
    const payload =
      payloads[table as keyof typeof payloads] ?? { data: null };
    const builder: any = {
      select: (cols: string) => {
        calls.push({ table, method: 'select', arg: cols });
        return builder;
      },
      eq: (col: string, value: unknown) => {
        calls.push({ table, method: 'eq', arg: { col, value } });
        return builder;
      },
      or: (filter: string) => {
        calls.push({ table, method: 'or', arg: filter });
        return Promise.resolve(payload);
      },
      maybeSingle: () => Promise.resolve(payload),
      then: (onFulfilled: any) => Promise.resolve(payload).then(onFulfilled),
    };
    return builder;
  };
  const client = {
    from: (table: string) => {
      calls.push({ table, method: 'from', arg: undefined });
      return builderFor(table);
    },
  };
  return { client, calls };
}

describe('buildSupabaseResolverDeps', () => {
  describe('fetchProfile', () => {
    it('maps doctor_profiles row + joined specialty to DoctorProfileSlice', async () => {
      const { client } = makeSupabaseStub({
        doctor_profiles: {
          data: {
            sacs_verified: true,
            sacs_data: {
              data: {
                postgrados: [
                  { postgrado: 'INFECTOLOGÍA PEDIÁTRICA' },
                  { postgrado: 'PEDIATRÍA Y PUERICULTURA' },
                ],
              },
            },
            certifications: ['acls'],
            specialty: { slug: 'infectologia' },
          },
        },
      });
      const deps = buildSupabaseResolverDeps(client);
      const profile = await deps.fetchProfile('doc-4');
      expect(profile).toEqual({
        specialty_slug: 'infectologia',
        sacs_verified: true,
        postgrados_raw: ['INFECTOLOGÍA PEDIÁTRICA', 'PEDIATRÍA Y PUERICULTURA'],
        plan: 'starter',
        certs: ['acls'],
      });
    });

    it('handles null sacs_data without throwing', async () => {
      const { client } = makeSupabaseStub({
        doctor_profiles: {
          data: {
            sacs_verified: false,
            sacs_data: null,
            certifications: null,
            specialty: { slug: 'medicina-general' },
          },
        },
      });
      const deps = buildSupabaseResolverDeps(client);
      const profile = await deps.fetchProfile('doc-1');
      expect(profile?.postgrados_raw).toEqual([]);
      expect(profile?.certs).toEqual([]);
      expect(profile?.sacs_verified).toBe(false);
    });

    it('returns null when the doctor profile row is missing', async () => {
      const { client } = makeSupabaseStub({
        doctor_profiles: { data: null },
      });
      const deps = buildSupabaseResolverDeps(client);
      const profile = await deps.fetchProfile('doc-deleted');
      expect(profile).toBeNull();
    });

    it('unwraps specialty when Supabase returns it as a single-element array', async () => {
      const { client } = makeSupabaseStub({
        doctor_profiles: {
          data: {
            sacs_verified: true,
            sacs_data: null,
            certifications: [],
            specialty: [{ slug: 'urologia' }],
          },
        },
      });
      const deps = buildSupabaseResolverDeps(client);
      const profile = await deps.fetchProfile('doc-5');
      expect(profile?.specialty_slug).toBe('urologia');
    });
  });

  describe('fetchPostgradoMapping', () => {
    it('returns the rows from sacs_postgrado_mapping', async () => {
      const rows = [
        { sacs_name_pattern: 'CARDIOLOGÍA', postgrado_slug: 'cardiologia', confidence: 'exact' },
      ];
      const { client } = makeSupabaseStub({
        sacs_postgrado_mapping: { data: rows },
      });
      const deps = buildSupabaseResolverDeps(client);
      const result = await deps.fetchPostgradoMapping();
      expect(result).toEqual(rows);
    });

    it('returns [] when the query errors out', async () => {
      const { client } = makeSupabaseStub({
        sacs_postgrado_mapping: { data: null, error: 'boom' },
      });
      const deps = buildSupabaseResolverDeps(client);
      const result = await deps.fetchPostgradoMapping();
      expect(result).toEqual([]);
    });
  });

  describe('fetchCapabilityModules', () => {
    it('builds an OR filter from the sources array and returns rows', async () => {
      const rows = [
        { id: 'r1', source_type: 'always-on', source_value: '*', module_key: 'inicio', display_group: 'clinica', display_order: 10, min_verification: 'sacs', min_plan: 'starter' },
      ];
      const { client, calls } = makeSupabaseStub({
        capability_modules: { data: rows },
      });
      const deps = buildSupabaseResolverDeps(client);
      const result = await deps.fetchCapabilityModules([
        { type: 'always-on', value: '*' },
        { type: 'specialty', value: 'medicina-general' },
      ]);
      expect(result).toEqual(rows);
      const orCall = calls.find((c) => c.method === 'or');
      expect(orCall?.arg).toContain('and(source_type.eq.always-on,source_value.eq.*)');
      expect(orCall?.arg).toContain('and(source_type.eq.specialty,source_value.eq.medicina-general)');
    });

    it('short-circuits without querying when sources is empty', async () => {
      const { client, calls } = makeSupabaseStub({
        capability_modules: { data: [] },
      });
      const deps = buildSupabaseResolverDeps(client);
      const result = await deps.fetchCapabilityModules([]);
      expect(result).toEqual([]);
      expect(calls.find((c) => c.table === 'capability_modules')).toBeUndefined();
    });
  });

  describe('fetchPreferences', () => {
    it('returns the rows for the given doctor_id', async () => {
      const rows = [
        { id: 'p1', doctor_id: 'doc-1', module_id: 'lab-orders', is_enabled: false, custom_order: null, custom_settings: null, pinned_to_dashboard: false },
      ];
      const { client } = makeSupabaseStub({
        doctor_module_preferences: { data: rows },
      });
      const deps = buildSupabaseResolverDeps(client);
      const result = await deps.fetchPreferences('doc-1');
      expect(result).toEqual(rows);
    });
  });

  describe('logger', () => {
    it('forwards unmapped postgrado warnings to console.warn', () => {
      const { client } = makeSupabaseStub({});
      const deps = buildSupabaseResolverDeps(client);
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      deps.logger?.('test message');
      expect(warn).toHaveBeenCalledWith('test message');
      warn.mockRestore();
    });
  });
});
