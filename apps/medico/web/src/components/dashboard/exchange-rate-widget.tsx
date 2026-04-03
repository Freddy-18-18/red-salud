'use client';

import { useExchangeRates } from '@/lib/hooks/use-exchange-rates';
import { DollarSign, Euro, RefreshCw, Clock, TrendingUp } from 'lucide-react';

function formatRate(value: number): string {
  return new Intl.NumberFormat('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);

  if (diffMin < 1) return 'ahora';
  if (diffMin < 60) return `hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `hace ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `hace ${diffDays}d`;
}

export function ExchangeRateWidget() {
  const { rates, loading, error, refresh } = useExchangeRates();

  if (loading && !rates) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-36 bg-gray-200 rounded" />
          <div className="h-5 w-5 bg-gray-200 rounded" />
        </div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-100 rounded-lg" />
          <div className="h-12 bg-gray-100 rounded-lg" />
        </div>
        <div className="mt-3 h-3 w-28 bg-gray-100 rounded" />
      </div>
    );
  }

  if (error && !rates) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-500" />
            Tasas de Cambio
          </h3>
          <button
            onClick={refresh}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Reintentar"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-amber-600">No se pudieron cargar las tasas</p>
      </div>
    );
  }

  const latestDate = rates?.dolar.fechaOficial || rates?.timestamp || '';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-blue-500" />
          Tasas de Cambio
        </h3>
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          title="Actualizar tasas"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {rates && (
        <div className="space-y-3">
          {/* Dolar Row */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500">Dolar</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm font-semibold text-gray-900">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">BCV</span>
                    Bs {formatRate(rates.dolar.oficial)}
                  </span>
                </span>
                <span className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1 py-0.5 rounded">Paralelo</span>
                    Bs {formatRate(rates.dolar.paralelo)}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Euro Row */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <Euro className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500">Euro</p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-sm font-semibold text-gray-900">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-1 py-0.5 rounded">BCV</span>
                    Bs {formatRate(rates.euro.oficial)}
                  </span>
                </span>
                <span className="text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-[10px] font-medium text-orange-600 bg-orange-50 px-1 py-0.5 rounded">Paralelo</span>
                    Bs {formatRate(rates.euro.paralelo)}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-400">
        <Clock className="h-3 w-3" />
        <span>
          {latestDate ? getRelativeTime(latestDate) : '---'}
          {rates?.stale && ' (cache)'}
        </span>
      </div>
    </div>
  );
}
