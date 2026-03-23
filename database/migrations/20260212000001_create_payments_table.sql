-- Create Enum for Payment Status
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected');

-- Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'VES', -- 'VES' or 'USD'
  exchange_rate NUMERIC, -- Conversion rate at the time of reporting
  reference_number TEXT NOT NULL, -- Bank reference number
  bank_origin TEXT NOT NULL, -- Bank where the payment was made from
  bank_destination TEXT, -- Bank where the payment was made to (optional)
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  status payment_status NOT NULL DEFAULT 'pending',
  proof_url TEXT, -- URL to screenshot/image of the receipt
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create Policies
-- 1. Users can view their own payments
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- 2. Users can create their own payments
CREATE POLICY "Users can insert their own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 3. Users can update their own payments ONLY if they are pending (e.g. fix a typo)
CREATE POLICY "Users can update their own pending payments"
ON payments FOR UPDATE
USING (auth.uid() = user_id AND status = 'pending')
WITH CHECK (status = 'pending'); -- Users cannot change status to approved

-- 4. Admins/Support can view all payments (Assuming a role or distinct policy, for now let's keep it simple or strictly owner-based. 
-- Ideally you'd have an admin role check here. For MVP, we might need to expose this to a specific admin user or use service role in API)

-- Indexes for performance
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_reference ON payments(reference_number);
