/**
 * BCV Exchange Rate Fetcher
 * Fetches official exchange rates from banco central de venezuela
 */
export class BCVRateFetcher {
    private static readonly BCV_API_URL = 'https://pydolarve.org/api/v1/dollar?page=bcv';

    /**
     * Fetch current USD to VES rate from BCV
     * Uses pydolarve.org API as a proxy for better availability
     */
    static async fetchCurrentRate(): Promise<number> {
        try {
            const response = await fetch(this.BCV_API_URL, {
                next: { revalidate: 3600 }, // Cache for 1 hour
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'RedSalud/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`BCV API responded with ${response.status}`);
            }

            const data = await response.json();

            // The API returns data in format: { monitors: { bcv: { price: 36.23 } } }
            const rate = data?.monitors?.bcv?.price;

            if (typeof rate !== 'number' || rate <= 0) {
                throw new Error('Invalid rate format received');
            }

            return rate;
        } catch (error) {
            console.error('Error fetching BCV rate:', error);
            throw error;
        }
    }

    /**
     * Fetch rate with fallback mechanism
     */
    static async fetchRateWithFallback(fallbackRate: number): Promise<number> {
        try {
            return await this.fetchCurrentRate();
        } catch (error) {
            console.warn(`Using fallback rate ${fallbackRate} due to error:`, error);
            return fallbackRate;
        }
    }
}
