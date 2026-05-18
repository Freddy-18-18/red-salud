import { NextResponse } from 'next/server';

/**
 * @file app/api/geocode/route.ts
 * @description Server-side proxy to Nominatim (OpenStreetMap) geocoding.
 *
 * Why server-side: Nominatim's usage policy requires a real, identifying
 * User-Agent and rate-limits to 1 req/sec per IP. Calling from the browser
 * directly would either:
 *   - expose us to CORS issues, or
 *   - share the doctor's IP rate-budget with every other browser tab.
 *
 * This route fans out requests through our server identity (one User-Agent,
 * one rate budget) and adds a tiny in-memory cache so repeated lookups for
 * the same query inside a single dev/runtime instance don't re-hit upstream.
 *
 * Request:  GET /api/geocode?q=<address-string>
 * Response: { results: Array<{ lat: number; lng: number; displayName: string }> }
 *
 * No auth required — geocoding is non-sensitive data and the doctor needs it
 * before any persisted row exists. Rate-limit risk is bounded by the cache.
 */

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org/search';

// Identifier exposed to Nominatim per their usage policy. Bumping this is fine
// — just keep an honest contact URL/email in the suffix.
const USER_AGENT = 'RedSalud/1.0 (https://red-salud.app contact: ops@red-salud.app)';

interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

interface CacheEntry {
  results: GeocodeResult[];
  expiresAt: number;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes
const cache = new Map<string, CacheEntry>();

function cacheGet(key: string): GeocodeResult[] | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.results;
}

function cacheSet(key: string, results: GeocodeResult[]): void {
  cache.set(key, { results, expiresAt: Date.now() + CACHE_TTL_MS });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get('q') ?? '').trim();
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const cacheKey = query.toLowerCase();
  const cached = cacheGet(cacheKey);
  if (cached) {
    return NextResponse.json({ results: cached, cached: true });
  }

  const url = new URL(NOMINATIM_BASE);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  // Bias towards Venezuela without forcing it — doctors might list a sede in
  // a border city or while travelling. `countrycodes` is a soft filter.
  url.searchParams.set('countrycodes', 've');

  try {
    const upstream = await fetch(url.toString(), {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept-Language': 'es-VE,es;q=0.9,en;q=0.5',
      },
      // Nominatim recommends polite caching; we don't want stale data per-doctor.
      cache: 'no-store',
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: 'upstream_error', status: upstream.status, results: [] },
        { status: 502 },
      );
    }

    const raw = (await upstream.json()) as Array<{
      lat: string;
      lon: string;
      display_name: string;
    }>;

    const results: GeocodeResult[] = raw.map((row) => ({
      lat: Number.parseFloat(row.lat),
      lng: Number.parseFloat(row.lon),
      displayName: row.display_name,
    }));

    cacheSet(cacheKey, results);
    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      {
        error: 'fetch_failed',
        message: err instanceof Error ? err.message : 'unknown',
        results: [],
      },
      { status: 500 },
    );
  }
}
