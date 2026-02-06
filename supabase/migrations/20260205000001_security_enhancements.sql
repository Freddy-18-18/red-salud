-- Add 2FA columns to profiles if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'two_factor_secret') THEN
        ALTER TABLE profiles ADD COLUMN two_factor_secret text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'two_factor_enabled') THEN
        ALTER TABLE profiles ADD COLUMN two_factor_enabled boolean DEFAULT false;
    END IF;
END $$;

-- Create deletion_requests table for audit/support purposes
CREATE TABLE IF NOT EXISTS deletion_requests (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    deletion_scheduled_at timestamptz NOT NULL,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- Policies for deletion_requests
-- Users can view their own requests
CREATE POLICY "Users can view their own deletion requests"
    ON deletion_requests FOR SELECT
    USING (auth.uid() = user_id);

-- Service role policies (for admin/support tools) - implicitly allowed, but explicit for clarity if needed later
-- For now main user interaction is via RPC

-- Update initiate_user_deletion function to also log the request
CREATE OR REPLACE FUNCTION initiate_user_deletion()
RETURNS void AS $$
DECLARE
    user_email text;
BEGIN
    -- Get user email
    SELECT email INTO user_email FROM auth.users WHERE id = auth.uid();

    -- Update profile
    UPDATE profiles
    SET 
        scheduled_deletion_at = (now() + interval '90 days'),
        deletion_initiated_at = now()
    WHERE id = auth.uid();

    -- Log request
    INSERT INTO deletion_requests (user_id, email, deletion_scheduled_at, status)
    VALUES (auth.uid(), user_email, (now() + interval '90 days'), 'pending');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update cancel_user_deletion to update the request status
CREATE OR REPLACE FUNCTION cancel_user_deletion()
RETURNS void AS $$
BEGIN
    -- Update profile
    UPDATE profiles
    SET 
        scheduled_deletion_at = NULL,
        deletion_initiated_at = NULL
    WHERE id = auth.uid();

    -- Update latest pending request to cancelled
    UPDATE deletion_requests
    SET status = 'cancelled', updated_at = now()
    WHERE user_id = auth.uid() AND status = 'pending';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
