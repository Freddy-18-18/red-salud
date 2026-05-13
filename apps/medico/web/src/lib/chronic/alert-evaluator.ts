/**
 * @file alert-evaluator.ts
 * @description Pure function classifying a measurement against a range or goal.
 *
 * Spec R5: severity tiers mild ≤10%, moderate 10-25%, severe >25%.
 * Effective max = active goal valor_objetivo (when present) else range.max.
 * Range.min is NOT overridden by goal (goals describe targets to stay UNDER).
 */

export type AlertSeverity = 'mild' | 'moderate' | 'severe';

export interface AlertRange {
  min: number;
  max: number;
}

const MILD_THRESHOLD = 0.1;
const MODERATE_THRESHOLD = 0.25;

function classify(deviationPct: number): AlertSeverity {
  if (deviationPct <= MILD_THRESHOLD) return 'mild';
  if (deviationPct <= MODERATE_THRESHOLD) return 'moderate';
  return 'severe';
}

/**
 * Classify a measurement against a range, optionally tightened by an active goal.
 *
 * @param value Measured value
 * @param range Default range from `health_metric_types.rango_minimo/maximo`
 * @param goal  Active `health_goals.valor_objetivo` (overrides range.max only)
 * @returns Severity tier, or null when in-range
 */
export function evaluateSeverity(
  value: number,
  range: AlertRange,
  goal?: number | null,
): AlertSeverity | null {
  const effectiveMax = goal ?? range.max;

  if (value > effectiveMax) {
    const excessPct = (value - effectiveMax) / effectiveMax;
    return classify(excessPct);
  }

  if (value < range.min) {
    // Avoid divide-by-zero when range.min is 0 — treat any value below 0 as severe.
    if (range.min === 0) return 'severe';
    const deficitPct = (range.min - value) / range.min;
    return classify(deficitPct);
  }

  return null;
}
