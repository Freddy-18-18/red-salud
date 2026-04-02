'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X } from 'lucide-react';
import {
  pricingTiers,
  ANNUAL_DISCOUNT,
  getAnnualMonthlyPrice,
  getAnnualTotalPrice,
} from '@/lib/data/pricing-data';

export function PricingCards() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Billing toggle */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-4 rounded-full border border-white/10 bg-white/5 p-1.5">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              !annual ? 'bg-white/10 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Mensual
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
              annual
                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Anual
            <span className="ml-2 rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-300">
              -{ANNUAL_DISCOUNT * 100}%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing cards */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {pricingTiers.map((tier) => {
            const displayPrice =
              tier.monthlyPrice === 0
                ? 'Gratis'
                : annual
                  ? `$${getAnnualMonthlyPrice(tier.monthlyPrice)}`
                  : `$${tier.monthlyPrice}`;

            return (
              <div
                key={tier.name}
                className={`relative rounded-2xl border p-8 backdrop-blur-sm transition-colors duration-300 ${
                  tier.highlighted
                    ? 'border-teal-500/50 bg-teal-500/5 shadow-xl shadow-teal-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-1 text-xs font-semibold text-white">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white">{tier.name}</h3>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">
                      {displayPrice}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className="text-zinc-500">/mes</span>
                    )}
                  </div>
                  {tier.monthlyPrice > 0 && annual && (
                    <p className="mt-1 text-sm text-teal-400">
                      ${getAnnualTotalPrice(tier.monthlyPrice)}/año — Ahorrás $
                      {tier.monthlyPrice * 12 - getAnnualTotalPrice(tier.monthlyPrice)}
                      /año
                    </p>
                  )}
                  {tier.monthlyPrice > 0 && !annual && (
                    <p className="mt-1 text-sm text-zinc-500">
                      o ${getAnnualMonthlyPrice(tier.monthlyPrice)}/mes facturado anualmente
                    </p>
                  )}
                  <p className="mt-3 text-sm text-zinc-400">{tier.description}</p>
                </div>

                <ul className="mb-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-4 w-4 text-teal-400 mt-0.5 shrink-0" />
                      ) : (
                        <X className="h-4 w-4 text-zinc-600 mt-0.5 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          feature.included ? 'text-zinc-300' : 'text-zinc-600'
                        }`}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth/register"
                  className={`block rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-cyan-400'
                      : 'border border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
