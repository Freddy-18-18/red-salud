/**
 * Shared time-of-day bucketing for greetings.
 *
 * Buckets (Venezuela local time):
 *   - madrugada:   00:00 – 05:59
 *   - mañana:      06:00 – 11:59
 *   - tarde:       12:00 – 18:59
 *   - noche:       19:00 – 23:59
 *
 * Used by both the client (to decide if cache should refresh) and the server
 * (to ground the LLM prompt). Pure function, zero deps.
 */

export type TimeBucket = 'madrugada' | 'mañana' | 'tarde' | 'noche';

export function bucketForHour(hour: number): TimeBucket {
  if (hour < 6) return 'madrugada';
  if (hour < 12) return 'mañana';
  if (hour < 19) return 'tarde';
  return 'noche';
}

export function currentBucket(now: Date = new Date()): TimeBucket {
  return bucketForHour(now.getHours());
}

/**
 * Static greetings keyed by time bucket. Every bucket returns a full sentence —
 * never a truncated "Buenas," — so the dashboard heading always reads
 * cleanly. `madrugada` deliberately uses "noches" because by the time the
 * bucket activates (00:00–05:59) the doctor is still in night-shift mode and
 * "buenos días" feels wrong before sunrise.
 */
export function fallbackGreeting(bucket: TimeBucket, firstName: string): string {
  const name = firstName.trim() || 'Doctor';
  switch (bucket) {
    case 'madrugada':
      return `Buenas noches, Dr. ${name}`;
    case 'mañana':
      return `Buenos días, Dr. ${name}`;
    case 'tarde':
      return `Buenas tardes, Dr. ${name}`;
    case 'noche':
      return `Buenas noches, Dr. ${name}`;
  }
}
