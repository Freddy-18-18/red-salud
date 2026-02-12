/**
 * @file currency.ts
 * @description Barrel re-export for pharmacy currency logic.
 * Individual modules:
 *   - pharmacy/currency-manager.ts: Domain logic (CurrencyManager, PriceCalculator, IGTFCalculator)
 *   - pharmacy/bcv-rate-fetcher.ts: I/O logic (BCVRateFetcher)
 */

export { BCVRateFetcher } from "./bcv-rate-fetcher";
export { CurrencyManager, PriceCalculator, IGTFCalculator } from "./currency-manager";
