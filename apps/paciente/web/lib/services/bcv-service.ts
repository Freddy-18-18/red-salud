
// import puppeteer from 'puppeteer'; // Removed in favor of external microservice
import { supabase } from '@/lib/supabase/client'; // Note: This might need service role client for inserts if RLS is strict

// Interface for the Rate result
export interface ExchangeRateData {
    rate: number;
    currency: string;
    date: string; // ISO string
}

export class BCVService {

    // Get the latest rate from DB or Scrape if old
    static async getRate(): Promise<ExchangeRateData | null> {
        // 1. Check DB for today's rate
        const todayStr = new Date().toISOString().split('T')[0];

        const { data: latestDB } = await supabase
            .from('exchange_rates')
            .select('*')
            .eq('currency_pair', 'USD_TO_VES')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (latestDB) {
            const dbDate = new Date(latestDB.created_at).toISOString().split('T')[0];

            // Criteria: Same day AND less than 4 hours old (BCV updates morning/afternoon)
            // Or just "same day" is usually enough for BCV which doesn't change every minute.
            // Let's being strict: if it's from today, use it. But if it's morning (e.g. 8am) and now it's 2pm, maybe we want to re-check.
            // For now: "If dbDate == todayStr", return it.
            if (dbDate === todayStr) {
                console.log('✅ Using cached BCV rate from DB');
                return {
                    rate: parseFloat(latestDB.rate),
                    currency: 'USD',
                    date: latestDB.created_at
                };
            }
        }

        return null;
    }

    // Call external BCV Service (Microservice)
    private static async fetchExternalRates(): Promise<ExchangeRateData[]> {
        try {
            const serviceUrl = process.env.BCV_SERVICE_URL || 'http://localhost:3002';
            console.log(`🔄 Calling external BCV service (${serviceUrl}/rates)...`);

            // Timeout 10s
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(`${serviceUrl}/rates`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                throw new Error(`Service returned ${res.status}`);
            }

            const data = await res.json();
            if (data.success && Array.isArray(data.rates)) {
                return data.rates;
            }
            return [];

        } catch (error) {
            console.error('❌ External BCV Service failed:', error instanceof Error ? error.message : 'Error desconocido');
            // Don't throw, just return empty so we fall back to DB
            return [];
        }
    }

    // Force scrape (calls external service and saves to DB)
    static async scrapeAndSave(): Promise<ExchangeRateData[] | null> {
        try {
            const rates = await this.fetchExternalRates();
            if (rates && rates.length > 0) {
                // Save to DB
                console.log(`✅ Got ${rates.length} rates from external service. Saving to DB...`);
                for (const rateData of rates) {
                    const { error } = await supabase
                        .from('exchange_rates')
                        .insert({
                            currency_pair: `${rateData.currency}_TO_VES`,
                            rate: rateData.rate,
                            source: 'BCV'
                        });

                    if (error) console.error(`Error saving ${rateData.currency} rate to DB:`, error);
                }
                return rates;
            } else {
                console.warn('⚠️ No rates returned from external service');
            }
        } catch (e) {
            console.error('Failed to update BCV rates:', e);
        }

        return null;
    }

    // Get rates
    static async getRates(): Promise<ExchangeRateData[]> {
        const todayStr = new Date().toISOString().split('T')[0];

        // Try getting today's rates
        const { data: latestDB } = await supabase
            .from('exchange_rates')
            .select('*')
            .gte('created_at', todayStr)
            .order('created_at', { ascending: false });

        const resultMap: Record<string, ExchangeRateData> = {};

        if (latestDB && latestDB.length > 0) {
            latestDB.forEach((row: Record<string, unknown>) => {
                const currency_pair = row.currency_pair as string;
                const currency = currency_pair.split('_')[0] as string;
                if (!resultMap[currency]) {
                    resultMap[currency] = {
                        rate: parseFloat(row.rate as string),
                        currency: currency,
                        date: row.created_at as string
                    };
                }
            });
        }

        // If we have both USD and EUR (common ones), return
        if (resultMap['USD'] && resultMap['EUR']) {
            console.log('✅ Using cached BCV rates from DB');
            return Object.values(resultMap);
        }

        console.log('🔄 Cached rates incomplete. Scraping BCV...');
        const scraped = await this.scrapeAndSave();

        if (scraped) return scraped;

        // Fallback: Get most recent from DB even if old
        const { data: fallbackDB } = await supabase
            .from('exchange_rates')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        const fallbackResults: Record<string, ExchangeRateData> = {};
        if (fallbackDB) {
            fallbackDB.forEach((row: Record<string, unknown>) => {
                const currency_pair = row.currency_pair as string;
                const currency = currency_pair.split('_')[0] as string;
                if (!fallbackResults[currency]) {
                    fallbackResults[currency] = {
                        rate: parseFloat(row.rate as string),
                        currency: currency,
                        date: row.created_at as string
                    };
                }
            });
            return Object.values(fallbackResults);
        }

        return [];
    }
}
