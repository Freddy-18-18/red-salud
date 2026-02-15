-- Extend support_tickets table for professional verification workflow
-- This allows tracking verification requests from non-SACS professionals

-- Add new columns
ALTER TABLE public.support_tickets
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS ticket_type TEXT DEFAULT 'general';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_by ON public.support_tickets(created_by);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned_to ON public.support_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_ticket_type ON public.support_tickets(ticket_type);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow public inserts for support tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Allow authenticated staff to read tickets" ON public.support_tickets;

-- Users can create tickets
CREATE POLICY "Users can create their own tickets"
ON public.support_tickets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

-- Public users can still create tickets (contact forms)
CREATE POLICY "Allow public ticket creation"
ON public.support_tickets
FOR INSERT
TO public
WITH CHECK (created_by IS NULL);

-- Users can view their own tickets
CREATE POLICY "Users can view their own tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (auth.uid() = created_by OR auth.uid() = assigned_to);

-- Corporate users can view all tickets
CREATE POLICY "Corporate users can view all tickets"
ON public.support_tickets
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh')
  )
);

-- Corporate users can update tickets
CREATE POLICY "Corporate users can update tickets"
ON public.support_tickets
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('admin', 'corporate', 'gerente', 'administrador', 'soporte', 'rrhh')
  )
);

-- Comment on new columns
COMMENT ON COLUMN public.support_tickets.created_by IS 'User ID that created the ticket (NULL for public submissions)';
COMMENT ON COLUMN public.support_tickets.assigned_to IS 'Corporate user assigned to handle this ticket';
COMMENT ON COLUMN public.support_tickets.metadata IS 'Additional structured data (e.g., doctor verification details)';
COMMENT ON COLUMN public.support_tickets.ticket_type IS 'Type of ticket: general, verification_medico, verification_farmacia, etc.';
