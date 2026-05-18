'use client';

import { useEffect, useState } from 'react';

import {
  currentBucket,
  fallbackGreeting,
  type TimeBucket,
} from '@/lib/greeting/time-bucket';

interface UseGreetingResult {
  greeting: string;
}

/**
 * useGreeting — local time-of-day greeting for the dashboard heading.
 *
 * Returns a deterministic string based on the doctor's first name and the
 * current `TimeBucket` (madrugada / mañana / tarde / noche). No network
 * roundtrip, no LLM, no cache — the bucket is cheap to compute and the
 * fallback strings already cover every variant.
 *
 * The hook re-evaluates the bucket every minute so a dashboard left open
 * across noon/midnight rolls forward to the new greeting without a refresh.
 */
export function useGreeting(doctorFirstName?: string): UseGreetingResult {
  const name = (doctorFirstName ?? 'Doctor').trim() || 'Doctor';
  const [bucket, setBucket] = useState<TimeBucket>(() => currentBucket());

  useEffect(() => {
    const intervalMs = 60_000;
    const id = window.setInterval(() => {
      const next = currentBucket();
      setBucket((prev) => (prev === next ? prev : next));
    }, intervalMs);
    return () => window.clearInterval(id);
  }, []);

  return { greeting: fallbackGreeting(bucket, name) };
}
