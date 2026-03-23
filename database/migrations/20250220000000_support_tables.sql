-- Create support_tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    subject TEXT NOT NULL,
    priority TEXT DEFAULT 'media',
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (public contact form)
CREATE POLICY "Allow public inserts for support tickets" 
ON public.support_tickets 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Only admins/authenticated staff can read (to be refined based on actual admin roles)
CREATE POLICY "Allow authenticated staff to read tickets" 
ON public.support_tickets 
FOR SELECT 
TO authenticated 
USING (true);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
