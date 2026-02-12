import { Currency, ExchangeRate, PharmacyPaymentMethod } from '@red-salud/types';

/**
 * Multi-Currency Manager
 * Handles conversions between currencies with dynamic exchange rates
 */
export class CurrencyManager {
    private exchangeRates: Map<string, number> = new Map();

    /**
     * Set exchange rate for a currency pair
     */
    setExchangeRate(from: Currency, to: Currency, rate: number): void {
        this.exchangeRates.set(this.getRateKey(from, to), rate);
        // Automatically set the inverse rate
        if (rate > 0) {
            this.exchangeRates.set(this.getRateKey(to, from), 1 / rate);
        }
    }

    /**
     * Get exchange rate for a currency pair
     */
    getExchangeRate(from: Currency, to: Currency): number {
        if (from === to) return 1;
        return this.exchangeRates.get(this.getRateKey(from, to)) || 0;
    }

    /**
     * Convert amount from one currency to another
     */
    convert(amount: number, from: Currency, to: Currency): number {
        if (from === to) return amount;
        const rate = this.getExchangeRate(from, to);
        return amount * rate;
    }

    /**
     * Convert USD to VES (Bolívares)
     */
    usdToVes(amount: number): number {
        return this.convert(amount, Currency.USD, Currency.VES);
    }

    /**
     * Convert VES to USD
     */
    vesToUsd(amount: number): number {
        return this.convert(amount, Currency.VES, Currency.USD);
    }

    /**
     * Format currency for display
     */
    static formatCurrency(amount: number, currency: Currency): string {
        return new Intl.NumberFormat('es-VE', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    /**
     * Format dual currency display (USD + VES)
     */
    static formatDualCurrency(amountUsd: number, amountVes: number): string {
        return `${this.formatCurrency(amountUsd, Currency.USD)} / ${this.formatCurrency(amountVes, Currency.VES)}`;
    }

    private getRateKey(from: Currency, to: Currency): string {
        return `${from}_${to}`;
    }

    /**
     * Load exchange rates from array
     */
    loadRates(rates: ExchangeRate[]): void {
        rates.forEach(rate => {
            this.setExchangeRate(rate.from_currency, rate.to_currency, rate.rate);
        });
    }

    /**
     * Get all configured rates
     */
    getAllRates(): Array<{ from: Currency; to: Currency; rate: number }> {
        const rates: Array<{ from: Currency; to: Currency; rate: number }> = [];
        this.exchangeRates.forEach((rate, key) => {
            const [from, to] = key.split('_') as [Currency, Currency];
            rates.push({ from, to, rate });
        });
        return rates;
    }
}

/**
 * Price Calculator
 * Calculates prices in both currencies
 */
export class PriceCalculator {
    /**
     * Calculate sale price in VES from USD price
     */
    static calculateVesPrice(
        priceUsd: number,
        exchangeRate: number,
        markup: number = 0
    ): number {
        const basePrice = priceUsd * (1 + markup);
        return basePrice * exchangeRate;
    }

    /**
     * Calculate sale price in USD from VES price
     */
    static calculateUsdPrice(
        priceVes: number,
        exchangeRate: number,
        markup: number = 0
    ): number {
        if (exchangeRate <= 0) return 0;
        const basePrice = priceVes / exchangeRate;
        return basePrice * (1 + markup);
    }

    /**
     * Calculate total price with IVA
     */
    static calculateWithIVA(
        basePrice: number,
        ivaRate: number
    ): number {
        return basePrice * (1 + ivaRate);
    }

    /**
     * Calculate subtotal, IVA, and total for invoice items
     */
    static calculateInvoiceTotals(
        items: Array<{
            unit_price_usd: number;
            unit_price_ves: number;
            quantity: number;
            iva_rate: number;
        }>
    ) {
        return items.reduce(
            (acc, item) => {
                const subtotalUsd = item.unit_price_usd * item.quantity;
                const subtotalVes = item.unit_price_ves * item.quantity;
                const ivaUsd = subtotalUsd * item.iva_rate;
                const ivaVes = subtotalVes * item.iva_rate;

                return {
                    subtotal_usd: acc.subtotal_usd + subtotalUsd,
                    subtotal_ves: acc.subtotal_ves + subtotalVes,
                    iva_usd: acc.iva_usd + ivaUsd,
                    iva_ves: acc.iva_ves + ivaVes,
                    total_usd: acc.total_usd + subtotalUsd + ivaUsd,
                    total_ves: acc.total_ves + subtotalVes + ivaVes,
                };
            },
            {
                subtotal_usd: 0,
                subtotal_ves: 0,
                iva_usd: 0,
                iva_ves: 0,
                total_usd: 0,
                total_ves: 0,
            }
        );
    }

    /**
     * Calculate change for payment
     */
    static calculateChange(
        total: number,
        payment: number
    ): number {
        return Math.max(0, payment - total);
    }

    /**
     * Calculate change for mixed payment methods
     */
    static calculateMixedChange(
        totalUsd: number,
        totalVes: number,
        payments: Array<{ amount_usd: number; amount_ves: number }>
    ): { change_usd: number; change_ves: number } {
        const paidUsd = payments.reduce((sum, p) => sum + p.amount_usd, 0);
        const paidVes = payments.reduce((sum, p) => sum + p.amount_ves, 0);

        // Simple calculation logic - can be made more complex based on store policy
        // Currently prioritizing giving change in the currency that was overpaid
        let changeUsd = Math.max(0, paidUsd - totalUsd);
        let changeVes = Math.max(0, paidVes - totalVes);

        return { change_usd: changeUsd, change_ves: changeVes };
    }
}

/**
 * IGTF (Impuesto a las Grandes Transacciones Financieras) Calculator
 * Calculates 3% tax for cash payments in foreign currency per Venezuelan law
 */
export class IGTFCalculator {
    private static readonly IGTF_RATE = 0.03;

    /**
     * Calculate IGTF amount for a payment
     */
    static calculateIGTF(amount: number, method: PharmacyPaymentMethod, currency: Currency): number {
        // IGTF applies to foreign currency payments (USD/EUR) made in cash or foreign cards
        if (currency === Currency.VES) return 0;

        // Check if method is subject to IGTF
        // Usually: Cash (Efectivo Divisas), International Debit/Credit, Zelle (sometimes)
        const taxableMethods: PharmacyPaymentMethod[] = [
            PharmacyPaymentMethod.EFECTIVO_DIVISAS,
            PharmacyPaymentMethod.ZELLE,
            PharmacyPaymentMethod.TARJETA_INTERNACIONAL
        ];

        if (taxableMethods.includes(method)) {
            return amount * this.IGTF_RATE;
        }

        return 0;
    }

    /**
     * Check if a payment method requires IGTF
     */
    static requiresIGTF(method: PharmacyPaymentMethod, currency: Currency): boolean {
        return currency !== Currency.VES && [
            PharmacyPaymentMethod.EFECTIVO_DIVISAS,
            PharmacyPaymentMethod.ZELLE,
            PharmacyPaymentMethod.TARJETA_INTERNACIONAL
        ].includes(method);
    }

    /**
     * Get the current IGTF rate (3%)
     */
    static getRate(): number {
        return this.IGTF_RATE;
    }
}
