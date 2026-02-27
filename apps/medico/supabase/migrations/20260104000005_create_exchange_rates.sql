-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    currency_pair TEXT NOT NULL DEFAULT 'USD_TO_VES',
    rate DECIMAL(20, 8) NOT NULL,
    valid_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source TEXT DEFAULT 'BCV',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow reading rates (public/authenticated)
CREATE POLICY "Enable read access for all users" ON public.exchange_rates
    FOR SELECT USING (true);

-- Create policy to allow insert only by service role (simulated here for now allow authenticated to robustly test from dashboard if needed, or stick to service role in backend)
-- For this app, we'll allow authenticated users (doctors) to trigger a fetch implies they might insert indirectly, but ideally only the backend service inserts.
-- Let's stick to simple "authenticated can read", "only service/postgres can insert" usually. But for simplicity in this dev environment:
CREATE POLICY "Enable insert for authenticated users" ON public.exchange_rates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Index for faster querying of latest rate
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currency_date ON public.exchange_rates (currency_pair, created_at DESC);
