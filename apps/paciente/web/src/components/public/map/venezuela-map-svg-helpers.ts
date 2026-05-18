/**
 * Compute a fill color based on doctor count relative to the max.
 * Gradient from neutral fill (0 doctors) to emerald-500 (max doctors).
 */
export function getDensityColor(count: number, maxCount: number): string {
  if (maxCount === 0 || count === 0) {
    return 'hsl(var(--map-state-fill))';
  }

  const ratio = count / maxCount;

  if (ratio < 0.1) return 'hsl(var(--map-state-fill))';
  if (ratio < 0.25) return 'hsl(160, 30%, 75%)';
  if (ratio < 0.5) return 'hsl(160, 50%, 60%)';
  if (ratio < 0.75) return 'hsl(160, 70%, 48%)';
  return 'hsl(160, 84%, 39%)';
}

interface StrokeStyleArgs {
  isSelected: boolean;
  isHovered: boolean;
}

interface StrokeStyle {
  stroke: string;
  strokeWidth: number;
}

/**
 * Compute the stroke style for a state polygon.
 * Default uses a low-contrast `--map-border` token that works in both themes.
 * Hover and selection use the brand accent at reduced opacity to avoid the
 * harsh "boxed-in" look from a thick high-contrast outline.
 */
export function getStrokeStyle({ isSelected, isHovered }: StrokeStyleArgs): StrokeStyle {
  if (isSelected) {
    return { stroke: 'hsl(160 84% 39% / 0.7)', strokeWidth: 1.5 };
  }
  if (isHovered) {
    return { stroke: 'hsl(160 84% 39% / 0.6)', strokeWidth: 1.5 };
  }
  return { stroke: 'hsl(var(--map-border))', strokeWidth: 1 };
}
