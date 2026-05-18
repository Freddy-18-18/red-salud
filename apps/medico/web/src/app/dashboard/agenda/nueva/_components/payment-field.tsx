'use client';

import { useEffect } from 'react';
import {
  Banknote,
  Building2,
  Coins,
  DollarSign,
  Gift,
  Send,
  Shield,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import { Label } from '@red-salud/design-system';

export type PaymentMethod =
  | 'cash_usd'
  | 'cash_bs'
  | 'transfer_bcv'
  | 'transfer_usd'
  | 'zelle'
  | 'pago_movil'
  | 'insurance'
  | 'courtesy';

interface PaymentMethodMeta {
  value: PaymentMethod;
  label: string;
  symbol: string;
  icon: LucideIcon;
  /** Color de acento al estar activo. */
  activeBg: string;
  activeText: string;
  activeRing: string;
}

const METHODS: PaymentMethodMeta[] = [
  {
    value: 'cash_usd',
    label: 'Efectivo $',
    symbol: '$',
    icon: DollarSign,
    activeBg: 'bg-success/10',
    activeText: 'text-success',
    activeRing: 'ring-success',
  },
  {
    value: 'cash_bs',
    label: 'Efectivo Bs',
    symbol: 'Bs.',
    icon: Coins,
    activeBg: 'bg-success/10',
    activeText: 'text-success',
    activeRing: 'ring-success',
  },
  {
    value: 'transfer_bcv',
    label: 'Transf. Bs',
    symbol: 'Bs.',
    icon: Building2,
    activeBg: 'bg-info/10',
    activeText: 'text-info',
    activeRing: 'ring-info',
  },
  {
    value: 'transfer_usd',
    label: 'Transf. $',
    symbol: '$',
    icon: Banknote,
    activeBg: 'bg-info/10',
    activeText: 'text-info',
    activeRing: 'ring-info',
  },
  {
    value: 'zelle',
    label: 'Zelle',
    symbol: '$',
    icon: Send,
    activeBg: 'bg-violet-500/10',
    activeText: 'text-violet-600 dark:text-violet-300',
    activeRing: 'ring-violet-500',
  },
  {
    value: 'pago_movil',
    label: 'Pago Móvil',
    symbol: 'Bs.',
    icon: Smartphone,
    activeBg: 'bg-warning/10',
    activeText: 'text-warning',
    activeRing: 'ring-warning',
  },
  {
    value: 'insurance',
    label: 'Seguro',
    symbol: '$',
    icon: Shield,
    activeBg: 'bg-primary/10',
    activeText: 'text-primary',
    activeRing: 'ring-primary',
  },
  {
    value: 'courtesy',
    label: 'Cortesía',
    symbol: '—',
    icon: Gift,
    activeBg: 'bg-muted',
    activeText: 'text-muted-foreground',
    activeRing: 'ring-muted-foreground/40',
  },
];

interface PaymentFieldProps {
  method: PaymentMethod;
  onMethodChange: (m: PaymentMethod) => void;
  amount: number | null;
  onAmountChange: (a: number | null) => void;
  /** Precio sugerido del doctor (consultation_price) para autocomplete. */
  suggestedPrice?: number | null;
}

export function PaymentField({
  method,
  onMethodChange,
  amount,
  onAmountChange,
  suggestedPrice,
}: PaymentFieldProps) {
  const meta = METHODS.find((m) => m.value === method) ?? METHODS[0];
  const isCourtesy = method === 'courtesy';

  // Auto-fill cuando el doctor cambia método y aún no hay monto.
  useEffect(() => {
    if (isCourtesy) {
      onAmountChange(0);
    } else if (amount == null && suggestedPrice != null && suggestedPrice > 0) {
      onAmountChange(suggestedPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, isCourtesy]);

  return (
    <div className="space-y-3">
      {/* Cards grid */}
      <div className="space-y-1.5">
        <Label className="text-xs">Método de pago</Label>
        <div
          role="radiogroup"
          aria-label="Método de pago"
          className="grid grid-cols-4 gap-1.5 sm:grid-cols-4 lg:grid-cols-8"
        >
          {METHODS.map((m) => {
            const Icon = m.icon;
            const active = method === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onMethodChange(m.value)}
                className={`group flex flex-col items-center justify-center gap-1 rounded-lg border bg-card p-2 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? `border-transparent ${m.activeBg} ${m.activeText} shadow-sm ring-1 ring-inset ${m.activeRing}`
                    : 'border-border text-muted-foreground hover:border-border-strong hover:bg-muted/40 hover:text-foreground'
                }`}
                title={m.label}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium leading-tight">
                  {m.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Amount field */}
      <div className="space-y-1.5">
        <Label htmlFor="cita-pago-monto" className="text-xs">
          Monto a cobrar
        </Label>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">
            {meta.symbol === '—' ? <Gift className="h-4 w-4" /> : meta.symbol}
          </span>
          <input
            id="cita-pago-monto"
            type="number"
            min={0}
            step={0.01}
            value={amount ?? ''}
            disabled={isCourtesy}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') {
                onAmountChange(null);
              } else {
                const n = Number(v);
                onAmountChange(Number.isFinite(n) ? n : null);
              }
            }}
            placeholder={isCourtesy ? 'Sin costo' : '0.00'}
            className="flex h-11 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-base font-semibold text-foreground shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
          />
        </div>
        {suggestedPrice != null && suggestedPrice > 0 && !isCourtesy && (
          <p className="text-[10px] text-muted-foreground">
            Tu tarifa configurada: {meta.symbol === 'Bs.' ? 'Bs.' : '$'}{suggestedPrice.toFixed(2)}
          </p>
        )}
      </div>
    </div>
  );
}
