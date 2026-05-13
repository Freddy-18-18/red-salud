/**
 * @file build-sources.ts
 * @description Build the doctor's capability sources from profile + SACS data.
 *
 * Spec R1 (doctor-capabilities): UNION of always-on + specialty + N postgrados
 * + N certs + plan tier. Duplicates by (type, value) deduplicated.
 *
 * Spec R3: manual-mode doctors (sacs_verified=false) still produce a specialty
 * source — verification_pending flag is set downstream by the resolver.
 */

import type { CapabilitySource, PlanTier } from './types';
import type { NormalizeResult } from './normalize-postgrado';

export interface BuildSourcesInput {
  specialty_slug: string | null;
  sacs_verified: boolean;
  postgrados_normalized: NormalizeResult[];
  certs?: string[];
  plan: PlanTier;
}

/**
 * Build the deduplicated, ordered list of capability sources for a doctor.
 *
 * Order: always-on → specialty → postgrado(s) → cert(s) → plan. Matches the
 * natural display priority and lets the downstream UNION query rely on a stable
 * source ordering for tie-breaking.
 */
export function buildCapabilitySources(input: BuildSourcesInput): CapabilitySource[] {
  const out: CapabilitySource[] = [];
  const seen = new Set<string>();

  const push = (source: CapabilitySource) => {
    const key = `${source.type}:${source.value}`;
    if (seen.has(key)) return;
    seen.add(key);
    out.push(source);
  };

  push({ type: 'always-on', value: '*' });

  if (input.specialty_slug) {
    push({ type: 'specialty', value: input.specialty_slug });
  }

  for (const p of input.postgrados_normalized) {
    push({ type: 'postgrado', value: p.slug });
  }

  for (const c of input.certs ?? []) {
    push({ type: 'cert', value: c });
  }

  push({ type: 'plan', value: input.plan });

  return out;
}
