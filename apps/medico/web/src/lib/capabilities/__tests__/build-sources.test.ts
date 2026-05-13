import { describe, expect, it } from 'vitest';
import { buildCapabilitySources } from '../build-sources';
import type { NormalizeResult } from '../normalize-postgrado';

const NO_POSTGRADOS: NormalizeResult[] = [];

describe('buildCapabilitySources (spec R1)', () => {
  it('R1-A: specialty + multiple postgrados → UNION of always-on + specialty + N postgrado sources', () => {
    const postgrados: NormalizeResult[] = [
      { slug: 'infectologia-pediatrica', raw: 'INFECTOLOGÍA PEDIÁTRICA', confidence: 'exact' },
      { slug: 'pediatria', raw: 'PEDIATRÍA Y PUERICULTURA', confidence: 'exact' },
    ];
    const result = buildCapabilitySources({
      specialty_slug: 'infectologia',
      sacs_verified: true,
      postgrados_normalized: postgrados,
      plan: 'starter',
    });
    expect(result).toEqual([
      { type: 'always-on', value: '*' },
      { type: 'specialty', value: 'infectologia' },
      { type: 'postgrado', value: 'infectologia-pediatrica' },
      { type: 'postgrado', value: 'pediatria' },
      { type: 'plan', value: 'starter' },
    ]);
  });

  it('R1-B: specialty alone with no postgrados → always-on + specialty + plan', () => {
    const result = buildCapabilitySources({
      specialty_slug: 'medicina-general',
      sacs_verified: true,
      postgrados_normalized: NO_POSTGRADOS,
      plan: 'starter',
    });
    expect(result).toEqual([
      { type: 'always-on', value: '*' },
      { type: 'specialty', value: 'medicina-general' },
      { type: 'plan', value: 'starter' },
    ]);
  });

  it('R3: manual mode (sacs_verified=false) → specialty source STILL included (verification flag handled elsewhere)', () => {
    const result = buildCapabilitySources({
      specialty_slug: 'medicina-general',
      sacs_verified: false,
      postgrados_normalized: NO_POSTGRADOS,
      plan: 'starter',
    });
    expect(result).toContainEqual({ type: 'specialty', value: 'medicina-general' });
    expect(result).toContainEqual({ type: 'always-on', value: '*' });
  });

  it('R1-C: no specialty → only always-on + plan (degraded doctor profile)', () => {
    const result = buildCapabilitySources({
      specialty_slug: null,
      sacs_verified: false,
      postgrados_normalized: NO_POSTGRADOS,
      plan: 'starter',
    });
    expect(result.map((s) => s.type)).toEqual(['always-on', 'plan']);
  });

  it('R1-D: certs are included when provided', () => {
    const result = buildCapabilitySources({
      specialty_slug: 'medicina-general',
      sacs_verified: true,
      postgrados_normalized: NO_POSTGRADOS,
      certs: ['acls', 'pals'],
      plan: 'starter',
    });
    expect(result).toContainEqual({ type: 'cert', value: 'acls' });
    expect(result).toContainEqual({ type: 'cert', value: 'pals' });
  });

  it('R1-E: duplicates across collections are deduplicated by (type, value)', () => {
    const postgrados: NormalizeResult[] = [
      { slug: 'pediatria', raw: 'PEDIATRÍA', confidence: 'exact' },
      { slug: 'pediatria', raw: 'PEDIATRÍA Y PUERICULTURA', confidence: 'exact' },
    ];
    const result = buildCapabilitySources({
      specialty_slug: 'pediatria',
      sacs_verified: true,
      postgrados_normalized: postgrados,
      plan: 'starter',
    });
    const pediatriaPostgrado = result.filter((s) => s.type === 'postgrado' && s.value === 'pediatria');
    expect(pediatriaPostgrado).toHaveLength(1);
  });

  it('R1-F: plan tier is propagated as a source for plan-gated modules', () => {
    const result = buildCapabilitySources({
      specialty_slug: 'cardiologia',
      sacs_verified: true,
      postgrados_normalized: NO_POSTGRADOS,
      plan: 'professional',
    });
    expect(result).toContainEqual({ type: 'plan', value: 'professional' });
  });
});
