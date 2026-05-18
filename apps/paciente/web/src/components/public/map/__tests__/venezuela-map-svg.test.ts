import { describe, it, expect } from 'vitest';
import { getDensityColor, getStrokeStyle } from '../venezuela-map-svg-helpers';

describe('getDensityColor', () => {
  it('returns muted fill when state has zero doctors', () => {
    expect(getDensityColor(0, 10)).toBe('hsl(var(--map-state-fill))');
  });

  it('returns muted fill when max count is zero', () => {
    expect(getDensityColor(5, 0)).toBe('hsl(var(--map-state-fill))');
  });

  it('returns brightest emerald when ratio is 1', () => {
    expect(getDensityColor(10, 10)).toBe('hsl(160, 84%, 39%)');
  });

  it('returns mid-tier teal for ratio between 0.5 and 0.75', () => {
    expect(getDensityColor(6, 10)).toBe('hsl(160, 70%, 48%)');
  });
});

describe('getStrokeStyle', () => {
  it('default: 1px subtle map border', () => {
    expect(getStrokeStyle({ isSelected: false, isHovered: false })).toEqual({
      stroke: 'hsl(var(--map-border))',
      strokeWidth: 1,
    });
  });

  it('hover: slightly thicker stroke, accent at low alpha', () => {
    expect(getStrokeStyle({ isSelected: false, isHovered: true })).toEqual({
      stroke: 'hsl(160 84% 39% / 0.6)',
      strokeWidth: 1.5,
    });
  });

  it('selected: subtle accent stroke (no harsh box)', () => {
    expect(getStrokeStyle({ isSelected: true, isHovered: false })).toEqual({
      stroke: 'hsl(160 84% 39% / 0.7)',
      strokeWidth: 1.5,
    });
  });
});
