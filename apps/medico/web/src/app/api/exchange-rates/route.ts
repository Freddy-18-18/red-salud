import { NextResponse } from 'next/server';

const VE_API_BASE = 'https://ve.dolarapi.com/v1';

interface ExchangeRate {
  moneda: string;
  fuente: 'oficial' | 'paralelo';
  nombre: string;
  compra: number | null;
  venta: number | null;
  promedio: number;
  fechaActualizacion: string;
}

interface ExchangeRatesResponse {
  dolar: { oficial: number; paralelo: number; fechaOficial: string; fechaParalelo: string };
  euro: { oficial: number; paralelo: number; fechaOficial: string; fechaParalelo: string };
  timestamp: string;
}

// Cache in-memory for 5 minutes to avoid hammering the API
let cache: { data: ExchangeRatesResponse; expires: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() < cache.expires) {
      return NextResponse.json(cache.data);
    }

    // Fetch dollars and euros in parallel
    const [dolaresRes, eurosRes] = await Promise.all([
      fetch(`${VE_API_BASE}/dolares`, { signal: AbortSignal.timeout(10_000) }),
      fetch(`${VE_API_BASE}/euros`, { signal: AbortSignal.timeout(10_000) }),
    ]);

    const dolares: ExchangeRate[] = await dolaresRes.json();
    const euros: ExchangeRate[] = await eurosRes.json();

    const dolarOficial = dolares.find(d => d.fuente === 'oficial');
    const dolarParalelo = dolares.find(d => d.fuente === 'paralelo');
    const euroOficial = euros.find(e => e.fuente === 'oficial');
    const euroParalelo = euros.find(e => e.fuente === 'paralelo');

    const data: ExchangeRatesResponse = {
      dolar: {
        oficial: dolarOficial?.promedio ?? 0,
        paralelo: dolarParalelo?.promedio ?? 0,
        fechaOficial: dolarOficial?.fechaActualizacion ?? '',
        fechaParalelo: dolarParalelo?.fechaActualizacion ?? '',
      },
      euro: {
        oficial: euroOficial?.promedio ?? 0,
        paralelo: euroParalelo?.promedio ?? 0,
        fechaOficial: euroOficial?.fechaActualizacion ?? '',
        fechaParalelo: euroParalelo?.fechaActualizacion ?? '',
      },
      timestamp: new Date().toISOString(),
    };

    // Update cache
    cache = { data, expires: Date.now() + CACHE_TTL };

    return NextResponse.json(data);
  } catch (error) {
    console.error('Exchange rates fetch error:', error);

    // Return stale cache if available
    if (cache) {
      return NextResponse.json({ ...cache.data, stale: true });
    }

    return NextResponse.json(
      { error: 'Error al obtener tasas de cambio' },
      { status: 500 }
    );
  }
}
