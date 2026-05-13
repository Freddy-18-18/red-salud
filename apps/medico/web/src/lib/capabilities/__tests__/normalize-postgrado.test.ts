import { describe, expect, it, vi } from 'vitest';
import { normalizePostgrados, type PostgradoMappingRow } from '../normalize-postgrado';

const MAPPING: PostgradoMappingRow[] = [
  {
    sacs_name_pattern: 'INFECTOLOGÍA PEDIÁTRICA',
    postgrado_slug: 'infectologia-pediatrica',
    confidence: 'exact',
  },
  {
    sacs_name_pattern: 'PEDIATRÍA Y PUERICULTURA',
    postgrado_slug: 'pediatria',
    confidence: 'exact',
  },
  {
    sacs_name_pattern: 'GINECOLOGÍA Y OBSTETRICIA',
    postgrado_slug: 'ginecologia',
    confidence: 'keyword',
  },
];

describe('normalizePostgrados (spec R4)', () => {
  it('R4-A: maps a known postgrado to its slug via exact match', () => {
    const result = normalizePostgrados(['INFECTOLOGÍA PEDIÁTRICA'], MAPPING);
    expect(result).toEqual([
      { slug: 'infectologia-pediatrica', raw: 'INFECTOLOGÍA PEDIÁTRICA', confidence: 'exact' },
    ]);
  });

  it('R4-B: skips unmapped postgrado and calls logger with the raw string', () => {
    const logger = vi.fn();
    const result = normalizePostgrados(['POSTGRADO INEXISTENTE XYZ'], MAPPING, logger);
    expect(result).toEqual([]);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(expect.stringContaining('POSTGRADO INEXISTENTE XYZ'));
  });

  it('R4-C: handles mixed mapped and unmapped (medico4 case)', () => {
    const logger = vi.fn();
    const result = normalizePostgrados(
      ['INFECTOLOGÍA PEDIÁTRICA', 'NO_EXISTE', 'PEDIATRÍA Y PUERICULTURA'],
      MAPPING,
      logger,
    );
    expect(result.map((r) => r.slug)).toEqual(['infectologia-pediatrica', 'pediatria']);
    expect(logger).toHaveBeenCalledTimes(1);
    expect(logger).toHaveBeenCalledWith(expect.stringContaining('NO_EXISTE'));
  });

  it('R4-D: empty input returns empty array, logger not called', () => {
    const logger = vi.fn();
    const result = normalizePostgrados([], MAPPING, logger);
    expect(result).toEqual([]);
    expect(logger).not.toHaveBeenCalled();
  });

  it('R4-E: preserves confidence level from the mapping row', () => {
    const result = normalizePostgrados(['GINECOLOGÍA Y OBSTETRICIA'], MAPPING);
    expect(result[0]?.confidence).toBe('keyword');
  });

  it('R4-F: trims whitespace before matching (defensive normalization)', () => {
    const result = normalizePostgrados(['  PEDIATRÍA Y PUERICULTURA  '], MAPPING);
    expect(result[0]?.slug).toBe('pediatria');
  });

  it('R4-G: works with no logger argument (logger is optional)', () => {
    expect(() => normalizePostgrados(['NO_EXISTE'], MAPPING)).not.toThrow();
  });
});
