"use client";

import { useDollarRate } from "@/hooks/use-currency";
import { formatBs, formatUsd } from "@/lib/services/currency-service";

interface PriceDisplayProps {
  amount: number;
  currency?: "USD" | "EUR" | "BS";
  showBs?: boolean;
  showUsd?: boolean;
  useParallel?: boolean;
  className?: string;
}

export function PriceDisplay({
  amount,
  currency = "USD",
  showBs = false,
  showUsd = false,
  useParallel = false,
  className = "",
}: PriceDisplayProps) {
  const { rate, loading } = useDollarRate(
    useParallel ? "paralelo" : "oficial"
  );

  const needsConversion =
    (currency === "USD" && showBs) || (currency === "BS" && showUsd);

  // Primary display
  const primaryText =
    currency === "USD"
      ? formatUsd(amount)
      : currency === "BS"
        ? formatBs(amount)
        : `EUR ${amount.toFixed(2)}`;

  // Secondary display (converted)
  let secondaryText: string | null = null;

  if (needsConversion && rate) {
    if (currency === "USD" && showBs) {
      secondaryText = formatBs(amount * rate.rate);
    } else if (currency === "BS" && showUsd) {
      secondaryText =
        rate.rate > 0 ? formatUsd(amount / rate.rate) : null;
    }
  }

  return (
    <span className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-semibold">{primaryText}</span>
      {needsConversion && loading && (
        <span className="text-xs text-gray-400 animate-pulse">...</span>
      )}
      {secondaryText && (
        <span className="text-xs text-gray-500">({secondaryText})</span>
      )}
    </span>
  );
}
